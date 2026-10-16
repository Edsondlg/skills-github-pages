// ISO-10303-21 (STEP physical file) parser.
// Hand-written single-pass tokenizer/parser: linear in the file size, no regex backtracking.
// Pure logic: no DOM, no three.js.

const C_HASH = 35;      // #
const C_EQ = 61;        // =
const C_LP = 40;        // (
const C_RP = 41;        // )
const C_COMMA = 44;     // ,
const C_SEMI = 59;      // ;
const C_QUOTE = 39;     // '
const C_DQUOTE = 34;    // "
const C_DOT = 46;       // .
const C_DOLLAR = 36;    // $
const C_STAR = 42;      // *
const C_SLASH = 47;     // /
const C_BSLASH = 92;    // \
const C_MINUS = 45;     // -
const C_PLUS = 43;      // +

function isSpace(c) { return c === 32 || c === 10 || c === 13 || c === 9 || c === 12; }
function isDigit(c) { return c >= 48 && c <= 57; }
function isIdentStart(c) { return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95 || c === 33; }
function isIdentChar(c) { return isIdentStart(c) || isDigit(c) || c === 45; }

class Cursor {
  constructor(text) {
    this.s = text;
    this.i = 0;
    this.n = text.length;
  }

  // Skip whitespace and /* comments */.
  ws() {
    const s = this.s;
    let i = this.i;
    const n = this.n;
    for (;;) {
      while (i < n && isSpace(s.charCodeAt(i))) i++;
      if (i + 1 < n && s.charCodeAt(i) === C_SLASH && s.charCodeAt(i + 1) === C_STAR) {
        const end = s.indexOf('*/', i + 2);
        i = end < 0 ? n : end + 2;
        continue;
      }
      break;
    }
    this.i = i;
  }

  peek() { this.ws(); return this.i < this.n ? this.s.charCodeAt(this.i) : -1; }

  expect(code) {
    if (this.peek() !== code) {
      throw new Error(`STEP inválido: se esperaba '${String.fromCharCode(code)}' en la posición ${this.i} (línea ${lineOf(this.s, this.i)}).`);
    }
    this.i++;
  }

  ident() {
    this.ws();
    const s = this.s;
    const start = this.i;
    let i = start;
    if (i < this.n && isIdentStart(s.charCodeAt(i))) {
      i++;
      while (i < this.n && isIdentChar(s.charCodeAt(i))) i++;
    }
    if (i === start) {
      throw new Error(`STEP inválido: se esperaba un nombre de entidad en la posición ${start} (línea ${lineOf(s, start)}).`);
    }
    this.i = i;
    return s.slice(start, i).toUpperCase();
  }

  integer() {
    const s = this.s;
    const start = this.i;
    let i = start;
    while (i < this.n && isDigit(s.charCodeAt(i))) i++;
    this.i = i;
    return parseInt(s.slice(start, i), 10);
  }

  number() {
    const s = this.s;
    const start = this.i;
    let i = start;
    let c = s.charCodeAt(i);
    if (c === C_MINUS || c === C_PLUS) i++;
    while (i < this.n) {
      c = s.charCodeAt(i);
      if (isDigit(c) || c === C_DOT || c === 69 || c === 101) { i++; continue; }
      if ((c === C_MINUS || c === C_PLUS) && (s.charCodeAt(i - 1) === 69 || s.charCodeAt(i - 1) === 101)) { i++; continue; }
      break;
    }
    this.i = i;
    let txt = s.slice(start, i);
    // "1.E-5" is valid STEP; JS Number() rejects nothing here, but "1.e5" etc. are fine too.
    const v = Number(txt);
    if (Number.isNaN(v)) {
      throw new Error(`STEP inválido: número mal formado '${txt}' (línea ${lineOf(s, start)}).`);
    }
    return v;
  }

  string() {
    // Opening quote already at this.i
    const s = this.s;
    let i = this.i + 1;
    let out = '';
    let chunk = i;
    for (;;) {
      const q = s.indexOf("'", i);
      if (q < 0) throw new Error(`STEP inválido: cadena sin cerrar (línea ${lineOf(s, this.i)}).`);
      if (s.charCodeAt(q + 1) === C_QUOTE) { // escaped ''
        out += s.slice(chunk, q + 1);
        i = q + 2;
        chunk = i;
        continue;
      }
      out += s.slice(chunk, q);
      this.i = q + 1;
      break;
    }
    return out.indexOf('\\') >= 0 ? decodeStepString(out) : out;
  }

  binary() {
    const s = this.s;
    const end = s.indexOf('"', this.i + 1);
    if (end < 0) throw new Error(`STEP inválido: binario sin cerrar (línea ${lineOf(s, this.i)}).`);
    const v = s.slice(this.i + 1, end);
    this.i = end + 1;
    return { binary: v };
  }

  enumeration() {
    const s = this.s;
    const end = s.indexOf('.', this.i + 1);
    if (end < 0) throw new Error(`STEP inválido: enumeración sin cerrar (línea ${lineOf(s, this.i)}).`);
    const v = s.slice(this.i + 1, end).toUpperCase();
    this.i = end + 1;
    return { enum: v };
  }

  // Parameter list: "(" [param {"," param}] ")"
  list() {
    this.expect(C_LP);
    const out = [];
    if (this.peek() === C_RP) { this.i++; return out; }
    for (;;) {
      out.push(this.param());
      const c = this.peek();
      if (c === C_COMMA) { this.i++; continue; }
      if (c === C_RP) { this.i++; return out; }
      throw new Error(`STEP inválido: se esperaba ',' o ')' en la posición ${this.i} (línea ${lineOf(this.s, this.i)}).`);
    }
  }

  param() {
    const c = this.peek();
    if (c === C_HASH) {
      this.i++;
      return { ref: this.integer() };
    }
    if (c === C_QUOTE) return this.string();
    if (isDigit(c) || c === C_MINUS || c === C_PLUS) return this.number();
    if (c === C_DOT) {
      // enumeration (.T.) or a number like ".5" (non-standard but seen)
      if (isDigit(this.s.charCodeAt(this.i + 1))) return this.number();
      return this.enumeration();
    }
    if (c === C_DOLLAR) { this.i++; return null; }
    if (c === C_STAR) { this.i++; return '*'; }
    if (c === C_LP) return this.list();
    if (c === C_DQUOTE) return this.binary();
    if (isIdentStart(c)) {
      const type = this.ident();
      return { type, args: this.list() };
    }
    throw new Error(`STEP inválido: parámetro inesperado en la posición ${this.i} (línea ${lineOf(this.s, this.i)}).`);
  }
}

function lineOf(s, pos) {
  let line = 1;
  for (let i = 0; i < pos && i < s.length; i++) if (s.charCodeAt(i) === 10) line++;
  return line;
}

// Decode ISO-10303-21 control directives: \X2\hhhh…\X0\, \X4\hhhhhhhh…\X0\, \X\hh, \S\c, \\, \P?\ (ignored).
export function decodeStepString(str) {
  let out = '';
  let i = 0;
  const n = str.length;
  while (i < n) {
    const ch = str[i];
    if (ch !== '\\') { out += ch; i++; continue; }
    const rest = str.slice(i, i + 4).toUpperCase();
    if (rest.startsWith('\\X2\\') || rest.startsWith('\\X4\\')) {
      const width = rest[2] === '2' ? 4 : 8;
      const end = str.toUpperCase().indexOf('\\X0\\', i + 4);
      if (end < 0) { out += str.slice(i); break; }
      const hex = str.slice(i + 4, end);
      for (let k = 0; k + width <= hex.length; k += width) {
        const cp = parseInt(hex.slice(k, k + width), 16);
        if (Number.isFinite(cp)) out += String.fromCodePoint(cp);
      }
      i = end + 4;
      continue;
    }
    if (rest.startsWith('\\X\\')) {
      const cp = parseInt(str.slice(i + 3, i + 5), 16);
      if (Number.isFinite(cp)) { out += String.fromCharCode(cp); i += 5; continue; }
    }
    if (rest.startsWith('\\S\\') && i + 3 < n) {
      out += String.fromCharCode(str.charCodeAt(i + 3) + 128);
      i += 4;
      continue;
    }
    if (rest.startsWith('\\P') && rest[3] === '\\') { i += 4; continue; }
    if (str[i + 1] === '\\') { out += '\\'; i += 2; continue; }
    out += ch;
    i++;
  }
  return out;
}

const LENGTH_NAMES = { INCH: 25.4, IN: 25.4, FOOT: 304.8, FT: 304.8, MILLIMETRE: 1, MILLIMETER: 1, MM: 1,
  CENTIMETRE: 10, CENTIMETER: 10, METRE: 1000, METER: 1000, MIL: 0.0254, THOU: 0.0254, YARD: 914.4 };
const ANGLE_NAMES = { DEGREE: Math.PI / 180, DEGREES: Math.PI / 180, DEG: Math.PI / 180, RADIAN: 1, GRAD: Math.PI / 200 };
const SI_PREFIX = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 1e2, DECA: 10,
  DECI: 1e-1, CENTI: 1e-2, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9, PICO: 1e-12, FEMTO: 1e-15, ATTO: 1e-18 };

/**
 * Parse a STEP file.
 * @param {string} text
 * @returns {{ header: {schema:string, fileName:string, productNames:string[]}, entities: Map<number,object>,
 *   lengthScale:number, angleScale:number, warnings:string[] }}
 */
export function parseStep(text) {
  if (typeof text !== 'string') throw new Error('STEP inválido: se esperaba el contenido del archivo como texto.');
  const cur = new Cursor(text);
  const warnings = [];
  const header = { schema: '', fileName: '', productNames: [] };

  // Locate sections without scanning entity bodies with regexes.
  const upperHead = text.slice(0, Math.min(text.length, 64)).toUpperCase();
  if (upperHead.indexOf('ISO-10303-21') < 0) {
    throw new Error('El archivo no es un STEP válido (falta la cabecera ISO-10303-21).');
  }

  // Header section: parse entities between HEADER; and ENDSEC;
  const headerPos = indexOfKeyword(text, 'HEADER;', 0);
  if (headerPos >= 0) {
    cur.i = headerPos + 7;
    for (;;) {
      const c = cur.peek();
      if (c < 0) break;
      if (!isIdentStart(c)) break;
      const name = cur.ident();
      if (name === 'ENDSEC') break;
      const args = cur.list();
      cur.expect(C_SEMI);
      if (name === 'FILE_NAME') header.fileName = typeof args[0] === 'string' ? args[0] : '';
      else if (name === 'FILE_SCHEMA') {
        const l = args[0];
        header.schema = Array.isArray(l) ? l.filter((x) => typeof x === 'string').join(', ') : '';
      }
    }
  }
  const dataPos = indexOfKeyword(text, 'DATA', headerPos < 0 ? 0 : cur.i);
  if (dataPos < 0) throw new Error('El archivo STEP no tiene sección DATA.');

  cur.i = dataPos + 4;
  // DATA may carry a parameter list in AP242 edition 3 ("DATA('name',('schema'));")
  if (cur.peek() === C_LP) cur.list();
  cur.expect(C_SEMI);

  const entities = new Map();
  for (;;) {
    const c = cur.peek();
    if (c < 0) break;
    if (c !== C_HASH) {
      const kw = cur.ident();
      if (kw === 'ENDSEC') break;
      throw new Error(`STEP inválido: palabra inesperada '${kw}' en DATA.`);
    }
    cur.i++;
    const id = cur.integer();
    cur.expect(C_EQ);
    let ent;
    if (cur.peek() === C_LP) {
      cur.i++;
      const parts = [];
      while (cur.peek() !== C_RP) {
        const type = cur.ident();
        parts.push({ type, args: cur.list() });
      }
      cur.i++;
      ent = { id, type: 'COMPLEX', args: [], parts };
    } else {
      const type = cur.ident();
      ent = { id, type, args: cur.list() };
    }
    cur.expect(C_SEMI);
    entities.set(id, ent);
  }

  for (const e of entities.values()) {
    if (e.type === 'PRODUCT') {
      const nm = typeof e.args[1] === 'string' && e.args[1] ? e.args[1] : e.args[0];
      if (typeof nm === 'string' && nm) header.productNames.push(nm);
    }
  }

  const { lengthScale, angleScale } = detectUnits(entities, warnings);
  return { header, entities, lengthScale, angleScale, warnings };
}

function indexOfKeyword(text, kw, from) {
  // Case-sensitive per standard; keywords are upper case.
  let i = text.indexOf(kw, from);
  while (i > 0) {
    const prev = text.charCodeAt(i - 1);
    if (!isIdentChar(prev) && prev !== C_QUOTE) return i;
    i = text.indexOf(kw, i + 1);
  }
  return i;
}

/** Return the named part ({type,args}) of an entity (simple or complex), or null. */
export function entityPart(ent, type) {
  if (!ent) return null;
  if (ent.type === type) return ent;
  if (ent.type === 'COMPLEX') {
    for (const p of ent.parts) if (p.type === type) return p;
  }
  return null;
}

function unitScale(entities, ref, kind, depth = 0) {
  const ent = entities.get(ref);
  if (!ent || depth > 5) return null;
  const si = entityPart(ent, 'SI_UNIT');
  if (si) {
    const prefix = si.args[0] && si.args[0].enum ? SI_PREFIX[si.args[0].enum] ?? 1 : 1;
    const name = si.args[1] && si.args[1].enum;
    if (kind === 'length' && name === 'METRE') return prefix * 1000;
    if (kind === 'angle' && name === 'RADIAN') return prefix;
    return null;
  }
  const cb = entityPart(ent, 'CONVERSION_BASED_UNIT');
  if (cb) {
    const nm = String(cb.args[0] || '').toUpperCase().trim();
    const table = kind === 'length' ? LENGTH_NAMES : ANGLE_NAMES;
    if (nm in table) return table[nm];
    // Fall back on the measure_with_unit: value × base unit scale
    const mwu = cb.args[1] && cb.args[1].ref ? entities.get(cb.args[1].ref) : null;
    if (mwu) {
      const parts = mwu.type === 'COMPLEX' ? mwu.parts : [mwu];
      for (const p of parts) {
        if (!/MEASURE_WITH_UNIT$/.test(p.type) || p.args.length < 2) continue;
        let v = p.args[0];
        if (v && typeof v === 'object' && v.type) v = v.args[0];
        const base = p.args[1] && p.args[1].ref ? unitScale(entities, p.args[1].ref, kind, depth + 1) : null;
        if (typeof v === 'number' && base) return v * base;
      }
    }
  }
  return null;
}

function isKind(ent, kind) {
  if (!ent) return false;
  const t = kind === 'length' ? 'LENGTH_UNIT' : 'PLANE_ANGLE_UNIT';
  if (entityPart(ent, t)) return true;
  // CONVERSION_BASED_UNIT without the explicit kind part: infer from name
  const cb = entityPart(ent, 'CONVERSION_BASED_UNIT');
  if (cb) {
    const nm = String(cb.args[0] || '').toUpperCase().trim();
    return kind === 'length' ? nm in LENGTH_NAMES : nm in ANGLE_NAMES;
  }
  return false;
}

function detectUnits(entities, warnings) {
  let unitRefs = null;
  for (const e of entities.values()) {
    const g = entityPart(e, 'GLOBAL_UNIT_ASSIGNED_CONTEXT');
    if (g && Array.isArray(g.args[0])) { unitRefs = g.args[0].filter((r) => r && r.ref).map((r) => r.ref); break; }
  }
  let lengthScale = null;
  let angleScale = null;
  const candidates = unitRefs || [];
  if (!unitRefs) {
    for (const e of entities.values()) if (isKind(e, 'length') || isKind(e, 'angle')) candidates.push(e.id);
  }
  for (const r of candidates) {
    const ent = entities.get(r);
    if (lengthScale == null && isKind(ent, 'length')) lengthScale = unitScale(entities, r, 'length');
    if (angleScale == null && isKind(ent, 'angle')) angleScale = unitScale(entities, r, 'angle');
  }
  if (lengthScale == null) {
    lengthScale = 1;
    warnings.push('No se encontró la unidad de longitud en el STEP; se asumen milímetros.');
  }
  if (angleScale == null) angleScale = 1;
  return { lengthScale, angleScale };
}
