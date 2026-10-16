// Importador DXF ASCII → segmentos 2D exactos (contrato C3, docs/ARQUITECTURA.md).
// Coordenadas en unidades del dibujo (la UI escala con units.toMM). Solo espacio modelo.
import { segTransform } from '../geom2d/segments.js';

const TAU = 2 * Math.PI;
const DEG = Math.PI / 180;
const BINARY_SIG = 'AutoCAD Binary DXF';

// $INSUNITS (tabla de AutoCAD) → [nombre, mm por unidad].
const UNITS = {
  0: ['unitless', 1],
  1: ['in', 25.4],
  2: ['ft', 304.8],
  3: ['mi', 1609344],
  4: ['mm', 1],
  5: ['cm', 10],
  6: ['m', 1000],
  7: ['km', 1e6],
  8: ['µin', 25.4e-6],
  9: ['mil', 0.0254],
  10: ['yd', 914.4],
  11: ['Å', 1e-7],
  12: ['nm', 1e-6],
  13: ['µm', 1e-3],
  14: ['dm', 100],
  15: ['dam', 1e4],
  16: ['hm', 1e5],
  17: ['Gm', 1e12],
  18: ['AU', 1.495978707e14],
  19: ['ly', 9.4607304725808e18],
  20: ['pc', 3.0856775814913673e19],
  21: ['ft-us', 1200000 / 3937],
  22: ['in-us', 100000 / 3937],
  23: ['yd-us', 3600000 / 3937],
  24: ['mi-us', 6336000000 / 3937],
};

// Entidades de anotación o 3D que no aportan contorno: solo se cuentan.
const IGNORED = new Set([
  'DIMENSION', 'ARC_DIMENSION', 'LEADER', 'MLEADER', 'MULTILEADER', 'HATCH', 'SOLID', 'TRACE', '3DFACE',
  'VIEWPORT', 'IMAGE', 'WIPEOUT', 'REGION', '3DSOLID', 'BODY', 'ACAD_TABLE', 'XLINE', 'RAY', 'POINT',
  'TOLERANCE', 'ATTDEF', 'ATTRIB', 'SURFACE', 'MESH', 'OLE2FRAME', 'OLEFRAME', 'SHAPE',
]);
const DASHED_RE = /CENTER|CENTRO|CENTRE|HIDDEN|OCULT|DASH|TRAZ|PHANTOM|DOT|PUNT|DIVIDE|BORDER|EJE/i;

/** Texto de un archivo DXF (bytes) → string: UTF-8 si es válido; si no, ANSI_1252. */
export function decodeDXF(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let head = '';
  for (let i = 0; i < Math.min(u8.length, BINARY_SIG.length); i++) head += String.fromCharCode(u8[i]);
  if (head === BINARY_SIG) throw new Error('DXF binario no soportado: guárdalo como DXF ASCII');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(u8);
  } catch {
    try {
      return new TextDecoder('windows-1252').decode(u8);
    } catch {
      return new TextDecoder('latin1').decode(u8);
    }
  }
}

// ---------- Texto ----------

const decodeUnicode = (s) =>
  s.indexOf('\\U+') < 0 ? s : s.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));

function decodeSpecial(s) {
  if (s.indexOf('%%') < 0) return s;
  return s.replace(/%%(\d{3}|[cCdDpPuUoOkK%])/g, (_, k) => {
    if (/^\d/.test(k)) return String.fromCharCode(+k);
    return { c: 'Ø', d: '°', p: '±', '%': '%' }[k.toLowerCase()] ?? '';
  });
}

// Quita los códigos de formato de MTEXT (\P, \f..;, {}, \S..;, etc.).
function stripMText(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{' || ch === '}') continue;
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    const n = s[i + 1];
    if (n === undefined) break;
    i++;
    if (n === 'P' || n === 'X') out += '\n';
    else if (n === '~') out += ' ';
    else if (n === '\\' || n === '{' || n === '}') out += n;
    else if (n === 'S') {
      const end = s.indexOf(';', i);
      out += s.slice(i + 1, end < 0 ? s.length : end).replace(/[\^#]/, '/');
      i = end < 0 ? s.length : end;
    } else if ('fFHWQTACcp'.includes(n)) {
      const end = s.indexOf(';', i);
      i = end < 0 ? s.length : end;
    }
    // \L \l \O \o \K \k y desconocidos: se descartan.
  }
  return out;
}

// ---------- Utilidades geométricas ----------

// m = [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f. compose(M, N) = M∘N.
const compose = (M, N) => [
  M[0] * N[0] + M[2] * N[1],
  M[1] * N[0] + M[3] * N[1],
  M[0] * N[2] + M[2] * N[3],
  M[1] * N[2] + M[3] * N[3],
  M[0] * N[4] + M[2] * N[5] + M[4],
  M[1] * N[4] + M[3] * N[5] + M[5],
];
const apply = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

// cos/sin exactos en múltiplos de 90°.
function cosSinDeg(deg) {
  const q = deg / 90;
  if (Number.isInteger(q)) return [[1, 0], [0, 1], [-1, 0], [0, -1]][((q % 4) + 4) % 4];
  return [Math.cos(deg * DEG), Math.sin(deg * DEG)];
}

// Algoritmo de ejes arbitrarios: OCS → WCS proyectado a XY. null si la extrusión no es paralela a Z.
function ocsMatrix(nx, ny, nz) {
  if (nx === 0 && ny === 0 && nz === 1) return null; // identidad (caso común)
  const l = Math.hypot(nx, ny, nz);
  if (!(l > 0)) return null;
  nx /= l;
  ny /= l;
  nz /= l;
  if (Math.abs(nx) > 1e-6 || Math.abs(ny) > 1e-6) return false;
  // Paralela a Z: con N = (0, 0, ±1) el algoritmo da Ax = Wy × N = (±1, 0, 0), Ay = N × Ax = (0, 1, 0).
  return nz > 0 ? null : [-1, 0, 0, 1, 0, 0];
}

// Arco desde dos vértices y bulge (tan(θ/4), positivo = antihorario).
function bulgeSeg(p0, p1, b) {
  if (Math.abs(b) < 1e-12) return { type: 'line', p0, p1 };
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], c = Math.hypot(dx, dy);
  const s = Math.abs(b), r = (c * (1 + s * s)) / (4 * s), h = (c * (1 - s * s)) / (4 * s);
  const sg = b > 0 ? 1 : -1;
  const cx = (p0[0] + p1[0]) / 2 - (sg * h * dy) / c, cy = (p0[1] + p1[1]) / 2 + (sg * h * dx) / c;
  return {
    type: 'arc',
    c: [cx, cy],
    r,
    a0: Math.atan2(p0[1] - cy, p0[0] - cx),
    a1: Math.atan2(p1[1] - cy, p1[0] - cx),
    ccw: b > 0,
  };
}

function polySegs(verts, closed) {
  const out = [], n = verts.length;
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const v = verts[i], w = verts[(i + 1) % n];
    if (v.x === w.x && v.y === w.y) continue;
    out.push(bulgeSeg([v.x, v.y], [w.x, w.y], v.b));
  }
  return out;
}

// Inserción de nudo (Boehm) en coordenadas homogéneas [wx, wy, w].
function insertKnot(p, U, Pw, u) {
  let k = U.length - 2;
  while (k > 0 && U[k] > u) k--;
  const Q = [];
  for (let i = 0; i <= Pw.length; i++) {
    if (i <= k - p) Q.push(Pw[i]);
    else if (i > k) Q.push(Pw[i - 1]);
    else {
      const den = U[i + p] - U[i], a = den > 0 ? (u - U[i]) / den : 0, P = Pw[i], R = Pw[i - 1];
      if (a === 0) Q.push(R); // incluye i = n al insertar en el extremo del dominio
      else if (a === 1) Q.push(P);
      else Q.push([a * P[0] + (1 - a) * R[0], a * P[1] + (1 - a) * R[1], a * P[2] + (1 - a) * R[2]]);
    }
  }
  const V = U.slice(0, k + 1);
  V.push(u);
  for (let i = k + 1; i < U.length; i++) V.push(U[i]);
  return { U: V, Pw: Q };
}

// Lleva una NURBS no anclada (p. ej. periódica) a nudos anclados en su dominio [U[p], U[n]].
function clampSpline(p, U, Pw) {
  const span = U[U.length - 1] - U[0], eps = 1e-12 * (span || 1);
  const a = U[p], b = U[Pw.length];
  U = U.map((u) => (Math.abs(u - a) <= eps ? a : Math.abs(u - b) <= eps ? b : u));
  const mult = (x) => U.reduce((n, u) => n + (u === x), 0);
  for (let m = mult(a); m < p; m++) ({ U, Pw } = insertKnot(p, U, Pw, a));
  for (let m = mult(b); m < p; m++) ({ U, Pw } = insertKnot(p, U, Pw, b));
  const s = U.lastIndexOf(a) - p;
  U = U.slice(s);
  Pw = Pw.slice(s);
  U[0] = a;
  const e = U.indexOf(b) + p;
  U = U.slice(0, e + 1);
  U[e] = b;
  Pw = Pw.slice(0, e - p);
  return { U, Pw };
}

// Bézier cúbicas por los puntos de ajuste (Catmull-Rom centrípeta; extremos naturales o tangentes dadas).
function fitBeziers(F, closed, t0, t1) {
  F = F.filter((q, i) => i === 0 || q[0] !== F[i - 1][0] || q[1] !== F[i - 1][1]);
  const n = F.length, segs = [];
  if (n < 2) return segs;
  const m = closed ? n : n - 1;
  const P = (i) => (closed ? F[((i % n) + n) % n] : F[i]);
  const ctl = (A, B, C) => {
    // Control de salida de B hacia C dado el vecino previo A (null si no hay).
    const d2 = Math.hypot(C[0] - B[0], C[1] - B[1]);
    if (!A) return null;
    const d1 = Math.hypot(B[0] - A[0], B[1] - A[1]);
    if (d1 === 0) return null;
    const s1 = Math.sqrt(d1), s2 = Math.sqrt(d2), k = 3 * s1 * (s1 + s2);
    return [0, 1].map((j) => (d1 * C[j] - d2 * A[j] + (2 * d1 + 3 * s1 * s2 + d2) * B[j]) / k);
  };
  for (let i = 0; i < m; i++) {
    const B = P(i), C = P(i + 1);
    const A = closed || i > 0 ? P(i - 1) : null, D = closed || i + 2 < n ? P(i + 2) : null;
    const d = Math.hypot(C[0] - B[0], C[1] - B[1]);
    let b1 = ctl(A, B, C), b2 = ctl(D, C, B);
    if (!b1 && t0 && i === 0) b1 = [B[0] + (t0[0] * d) / 3, B[1] + (t0[1] * d) / 3];
    if (!b2 && t1 && i === m - 1) b2 = [C[0] - (t1[0] * d) / 3, C[1] - (t1[1] * d) / 3];
    // Extremo natural (curvatura nula): b1 = (B + b2)/2.
    if (!b1 && !b2) {
      b1 = [B[0] + (C[0] - B[0]) / 3, B[1] + (C[1] - B[1]) / 3];
      b2 = [B[0] + (2 * (C[0] - B[0])) / 3, B[1] + (2 * (C[1] - B[1])) / 3];
    } else if (!b1) b1 = [(B[0] + b2[0]) / 2, (B[1] + b2[1]) / 2];
    else if (!b2) b2 = [(C[0] + b1[0]) / 2, (C[1] + b1[1]) / 2];
    segs.push({ type: 'bezier', pts: [B, b1, b2, C] });
  }
  return segs;
}

// ---------- Lectura de pares código/valor ----------

function tokenize(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split(/\r\n|\n|\r/);
  let nl = lines.length;
  while (nl > 0 && lines[nl - 1].trim() === '') nl--;
  const np = nl >> 1; // línea impar suelta al final: se descarta
  const codes = new Int32Array(np), vals = new Array(np);
  for (let i = 0; i < np; i++) {
    const c = parseInt(lines[2 * i], 10);
    if (Number.isNaN(c)) throw new Error(`DXF ilegible: código de grupo no numérico en la línea ${2 * i + 1}`);
    codes[i] = c;
    vals[i] = lines[2 * i + 1];
  }
  return { codes, vals };
}

// ---------- Analizador ----------

export function parseDXF(input) {
  if (typeof input !== 'string') input = decodeDXF(input);
  if (input.startsWith(BINARY_SIG)) throw new Error('DXF binario no soportado: guárdalo como DXF ASCII');
  if (!input.trim()) throw new Error('DXF ilegible: el archivo está vacío');
  const { codes, vals } = tokenize(input);
  const N = codes.length;
  const str = (k) => vals[k].trim();
  const num = (k) => {
    const v = +vals[k];
    return Number.isFinite(v) ? v : 0;
  };

  const warnCounts = new Map();
  const warn = (msg) => warnCounts.set(msg, (warnCounts.get(msg) || 0) + 1);
  const header = {};
  const layerMap = new Map(), layers = [];
  const ltypes = new Map(); // NOMBRE → { name, pattern: [..] }
  const blocks = new Map(); // NOMBRE → { name, base, ents, flags }
  let entityRecs = null;
  let sawSection = false;

  // Lista de entidades del rango [k, ...) hasta un 0 que no sea entidad (ENDSEC/ENDBLK/EOF).
  // Agrupa VERTEX/SEQEND con su POLYLINE y ATTRIB/SEQEND con su INSERT.
  const readEntities = (k, stop) => {
    const recs = [];
    while (k < N) {
      if (codes[k] !== 0) {
        k++;
        continue;
      }
      const type = str(k).toUpperCase();
      if (stop.has(type)) break;
      let e = k + 1;
      while (e < N && codes[e] !== 0) e++;
      const rec = { type, s: k + 1, e };
      k = e;
      if (type === 'POLYLINE' || type === 'INSERT') {
        const kids = [];
        while (k < N && codes[k] === 0) {
          const t = str(k).toUpperCase();
          if (t !== 'VERTEX' && t !== 'ATTRIB' && t !== 'SEQEND') break;
          let e2 = k + 1;
          while (e2 < N && codes[e2] !== 0) e2++;
          if (t === 'VERTEX') kids.push({ s: k + 1, e: e2 });
          k = e2;
          if (t === 'SEQEND') break;
        }
        rec.verts = kids;
      }
      recs.push(rec);
    }
    return { recs, k };
  };

  const STOP_SEC = new Set(['ENDSEC', 'EOF', 'SECTION']);
  const STOP_BLK = new Set(['ENDBLK', 'ENDSEC', 'EOF', 'BLOCK', 'SECTION']);

  let k = 0;
  while (k < N) {
    if (!(codes[k] === 0 && str(k).toUpperCase() === 'SECTION')) {
      k++;
      continue;
    }
    sawSection = true;
    const name = k + 1 < N && codes[k + 1] === 2 ? str(k + 1).toUpperCase() : '';
    k += 2;
    if (name === 'HEADER') {
      let v = null;
      for (; k < N && !(codes[k] === 0 && str(k).toUpperCase() === 'ENDSEC'); k++) {
        if (codes[k] === 9) v = str(k).toUpperCase();
        else if (v && !(v in header)) header[v] = vals[k].trim();
      }
    } else if (name === 'TABLES') {
      let table = '', cur = null;
      const flush = () => {
        if (!cur) return;
        if (cur.kind === 'LAYER' && cur.name) {
          const color = cur.color ?? 7;
          const L = { name: cur.name, color: Math.abs(color) || 7, linetype: cur.linetype || 'CONTINUOUS', frozen: !!(cur.flags & 1), off: color < 0 };
          if (!layerMap.has(cur.name.toUpperCase())) {
            layerMap.set(cur.name.toUpperCase(), L);
            layers.push(L);
          }
        } else if (cur.kind === 'LTYPE' && cur.name) ltypes.set(cur.name.toUpperCase(), { name: cur.name, pattern: cur.pattern });
        cur = null;
      };
      for (; k < N; k++) {
        const c = codes[k];
        if (c === 0) {
          flush();
          const t = str(k).toUpperCase();
          if (t === 'ENDSEC') break;
          if (t === 'TABLE') table = k + 1 < N && codes[k + 1] === 2 ? str(k + 1).toUpperCase() : '';
          else if (t === 'ENDTAB') table = '';
          else if ((t === 'LAYER' || t === 'LTYPE') && table === t) cur = { kind: t, pattern: [] };
          continue;
        }
        if (!cur) continue;
        if (c === 2) cur.name = decodeUnicode(str(k));
        else if (c === 62 && cur.kind === 'LAYER') cur.color = num(k);
        else if (c === 6 && cur.kind === 'LAYER') cur.linetype = str(k);
        else if (c === 70) cur.flags = num(k);
        else if (c === 49 && cur.kind === 'LTYPE') cur.pattern.push(num(k));
      }
    } else if (name === 'BLOCKS') {
      while (k < N) {
        if (codes[k] !== 0) {
          k++;
          continue;
        }
        const t = str(k).toUpperCase();
        if (t === 'ENDSEC' || t === 'EOF') break;
        if (t !== 'BLOCK') {
          k++;
          continue;
        }
        const blk = { name: '', base: [0, 0], flags: 0, ents: [] };
        let j = k + 1;
        for (; j < N && codes[j] !== 0; j++) {
          if (codes[j] === 2) blk.name = decodeUnicode(str(j));
          else if (codes[j] === 3 && !blk.name) blk.name = decodeUnicode(str(j));
          else if (codes[j] === 10) blk.base[0] = num(j);
          else if (codes[j] === 20) blk.base[1] = num(j);
          else if (codes[j] === 70) blk.flags = num(j);
        }
        const r = readEntities(j, STOP_BLK);
        blk.recs = r.recs;
        k = r.k;
        if (k < N && str(k).toUpperCase() === 'ENDBLK') k++;
        if (blk.name) blocks.set(blk.name.toUpperCase(), blk);
      }
    } else if (name === 'ENTITIES') {
      const r = readEntities(k, STOP_SEC);
      entityRecs = (entityRecs || []).concat(r.recs);
      k = r.k;
    }
  }
  if (!sawSection) throw new Error('DXF ilegible: no se encontró ninguna sección (¿es un archivo DXF?)');

  // ---------- Unidades ----------
  const warnings = [];
  let insunits = parseInt(header.$INSUNITS, 10);
  if (Number.isNaN(insunits)) insunits = null;
  let units;
  if (insunits && UNITS[insunits]) units = { insunits, name: UNITS[insunits][0], toMM: UNITS[insunits][1] };
  else {
    // Sin unidades: $MEASUREMENT = 0 (inglés) sugiere pulgadas; si no, milímetros.
    const imperial = parseInt(header.$MEASUREMENT, 10) === 0;
    units = { insunits, name: 'unitless', toMM: imperial ? 25.4 : 1, assumed: imperial ? 'in' : 'mm' };
    warnings.push(
      imperial
        ? 'El DXF no define unidades ($INSUNITS); por $MEASUREMENT = 0 (inglés) se asumen pulgadas. Verifica la escala.'
        : 'El DXF no define unidades ($INSUNITS); se asumen milímetros. Verifica la escala.',
    );
  }

  // ---------- Capas y tipos de línea ----------
  const layerOf = (name) => {
    const key = name.toUpperCase();
    let L = layerMap.get(key);
    if (!L) {
      L = { name, color: 7, linetype: 'CONTINUOUS', frozen: false, off: false };
      layerMap.set(key, L);
      layers.push(L);
    }
    return L;
  };
  layerOf('0');
  const dashedCache = new Map();
  const isDashed = (lt) => {
    const key = lt.toUpperCase();
    let d = dashedCache.get(key);
    if (d === undefined) {
      if (key === 'CONTINUOUS' || key === 'BYLAYER' || key === 'BYBLOCK' || key === '') d = false;
      else {
        const def = ltypes.get(key);
        d = DASHED_RE.test(key) || !!(def && def.pattern.some((x) => x < 0));
      }
      dashedCache.set(key, d);
    }
    return d;
  };

  // ---------- Entidades: lectura a objetos locales ----------
  // Propiedades comunes + geometría en coordenadas del bloque (o WCS). Se lee una sola vez por registro.
  const parseRec = (rec) => rec.ent || (rec.ent = parseRecUncached(rec));

  const parseRecUncached = (rec) => {
    const { type, s, e } = rec;
    const ent = { type, layer: '0', color: 256, linetype: 'BYLAYER', handle: null, paper: false, segs: null, texts: null, insert: null };
    let nx = 0, ny = 0, nz = 1;
    for (let i = s; i < e; i++) {
      const c = codes[i];
      if (c === 8) ent.layer = decodeUnicode(str(i)) || '0';
      else if (c === 62) ent.color = num(i);
      else if (c === 6) ent.linetype = str(i);
      else if (c === 5) ent.handle = str(i);
      else if (c === 67) ent.paper = num(i) === 1;
      else if (c === 210) nx = num(i);
      else if (c === 220) ny = num(i);
      else if (c === 230) nz = num(i);
    }
    const M = type === 'LINE' || type === 'SPLINE' ? null : ocsMatrix(nx, ny, nz);
    if (M === false && type !== 'ELLIPSE') {
      warn(`Entidad 3D omitida (extrusión no paralela a Z): ${type}`);
      ent.skip = true;
      return ent;
    }
    const toWCS = (segs) => (M ? segs.map((g) => segTransform(g, M)) : segs);
    switch (type) {
      case 'LINE': {
        const p0 = [0, 0], p1 = [0, 0];
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 10) p0[0] = num(i);
          else if (c === 20) p0[1] = num(i);
          else if (c === 11) p1[0] = num(i);
          else if (c === 21) p1[1] = num(i);
        }
        ent.segs = [{ type: 'line', p0, p1 }];
        break;
      }
      case 'CIRCLE':
      case 'ARC': {
        const cc = [0, 0];
        let r = 0, a0 = 0, a1 = 360;
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 10) cc[0] = num(i);
          else if (c === 20) cc[1] = num(i);
          else if (c === 40) r = num(i);
          else if (c === 50) a0 = num(i);
          else if (c === 51) a1 = num(i);
        }
        if (!(r > 0)) {
          warn(`${type} con radio nulo omitido`);
          break;
        }
        const g = type === 'CIRCLE' ? { type: 'circle', c: cc, r, ccw: true } : { type: 'arc', c: cc, r, a0: a0 * DEG, a1: a1 * DEG, ccw: true };
        ent.segs = toWCS([g]);
        break;
      }
      case 'LWPOLYLINE': {
        const verts = [];
        let flags = 0;
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 10) verts.push({ x: num(i), y: 0, b: 0 });
          else if (c === 20 && verts.length) verts[verts.length - 1].y = num(i);
          else if (c === 42 && verts.length) verts[verts.length - 1].b = num(i);
          else if (c === 70) flags = num(i);
        }
        ent.segs = toWCS(polySegs(verts, (flags & 1) === 1));
        break;
      }
      case 'POLYLINE': {
        let flags = 0;
        for (let i = s; i < e; i++) if (codes[i] === 70) flags = num(i);
        if (flags & (8 | 16 | 64)) {
          warn('Polilínea 3D, malla o malla de caras omitida (solo se importan polilíneas 2D)');
          ent.skip = true;
          break;
        }
        const verts = [];
        for (const v of rec.verts || []) {
          const o = { x: 0, y: 0, b: 0 };
          let vf = 0;
          for (let i = v.s; i < v.e; i++) {
            const c = codes[i];
            if (c === 10) o.x = num(i);
            else if (c === 20) o.y = num(i);
            else if (c === 42) o.b = num(i);
            else if (c === 70) vf = num(i);
          }
          if (!(vf & 16)) verts.push(o); // 16: punto del marco de control de spline
        }
        ent.segs = toWCS(polySegs(verts, (flags & 1) === 1));
        break;
      }
      case 'ELLIPSE': {
        const cc = [0, 0], mj = [1, 0];
        let ratio = 1, p0 = 0, p1 = TAU;
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 10) cc[0] = num(i);
          else if (c === 20) cc[1] = num(i);
          else if (c === 11) mj[0] = num(i);
          else if (c === 21) mj[1] = num(i);
          else if (c === 40) ratio = num(i);
          else if (c === 41) p0 = num(i);
          else if (c === 42) p1 = num(i);
        }
        const l = Math.hypot(nx, ny, nz);
        if (M === false || !(l > 0)) {
          warn('Entidad 3D omitida (extrusión no paralela a Z): ELLIPSE');
          ent.skip = true;
          break;
        }
        const rx = Math.hypot(mj[0], mj[1]);
        if (!(rx > 0) || !(ratio > 0)) {
          warn('ELLIPSE degenerada omitida');
          break;
        }
        let sw = p1 - p0;
        sw -= TAU * Math.floor(sw / TAU);
        if (sw < 1e-9 || TAU - sw < 1e-6) p1 = p0 + TAU; // completa (tolera 2π con pocos decimales)
        const rev = nz < 0; // parámetro antihorario respecto a la extrusión
        ent.segs = [
          { type: 'ellipse', c: cc, rx, ry: rx * ratio, rot: Math.atan2(mj[1], mj[0]), t0: rev ? -p0 : p0, t1: rev ? -p1 : p1, ccw: !rev },
        ];
        break;
      }
      case 'SPLINE':
        ent.segs = parseSpline(s, e);
        break;
      case 'INSERT': {
        const o = { name: '', p: [0, 0], sx: 1, sy: 1, rot: 0, cols: 1, rows: 1, dc: 0, dr: 0, M };
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 2) o.name = decodeUnicode(str(i));
          else if (c === 10) o.p[0] = num(i);
          else if (c === 20) o.p[1] = num(i);
          else if (c === 41) o.sx = num(i);
          else if (c === 42) o.sy = num(i);
          else if (c === 50) o.rot = num(i);
          else if (c === 70) o.cols = Math.max(1, num(i) | 0);
          else if (c === 71) o.rows = Math.max(1, num(i) | 0);
          else if (c === 44) o.dc = num(i);
          else if (c === 45) o.dr = num(i);
        }
        ent.insert = o;
        break;
      }
      case 'TEXT':
      case 'MTEXT': {
        const p = [0, 0], q = [0, 0];
        let h = 0, rot = 0, txt = '', chunks = '', align = false, xdir = null;
        for (let i = s; i < e; i++) {
          const c = codes[i];
          if (c === 10) p[0] = num(i);
          else if (c === 20) p[1] = num(i);
          else if (c === 11) q[0] = num(i);
          else if (c === 21) q[1] = num(i);
          else if (c === 40) h = num(i);
          else if (c === 50) rot = num(i);
          else if (c === 1) txt = vals[i];
          else if (c === 3) chunks += vals[i];
          else if ((c === 72 || c === 73) && num(i) !== 0) align = true;
        }
        let text;
        let pos = p;
        if (type === 'MTEXT') {
          text = stripMText(decodeUnicode(chunks + txt));
          if (q[0] !== 0 || q[1] !== 0) xdir = Math.atan2(q[1], q[0]) / DEG; // dirección X en WCS
        } else {
          text = decodeUnicode(txt);
          if (align) pos = q;
        }
        text = decodeSpecial(text).trim();
        if (!text) break;
        // TEXT está en OCS; MTEXT en WCS (su eje X manda sobre la rotación).
        let tp = pos, trot = xdir ?? rot;
        if (type === 'TEXT' && M) {
          tp = apply(M, pos);
          const v = apply([M[0], M[1], M[2], M[3], 0, 0], cosSinDeg(rot));
          trot = Math.atan2(v[1], v[0]) / DEG;
        }
        ent.texts = [{ text, p: tp, h, rot: trot }];
        break;
      }
      default:
        break;
    }
    return ent;
  };

  const parseSpline = (s, e) => {
    let degree = 3, flags = 0;
    const knots = [], ctrl = [], weights = [], fit = [];
    let t0 = null, t1 = null;
    for (let i = s; i < e; i++) {
      const c = codes[i];
      if (c === 71) degree = num(i);
      else if (c === 70) flags = num(i);
      else if (c === 40) knots.push(num(i));
      else if (c === 41) weights.push(num(i));
      else if (c === 10) ctrl.push([num(i), 0]);
      else if (c === 20 && ctrl.length) ctrl[ctrl.length - 1][1] = num(i);
      else if (c === 11) fit.push([num(i), 0]);
      else if (c === 21 && fit.length) fit[fit.length - 1][1] = num(i);
      else if (c === 12) t0 = [num(i), 0];
      else if (c === 22 && t0) t0[1] = num(i);
      else if (c === 13) t1 = [num(i), 0];
      else if (c === 23 && t1) t1[1] = num(i);
    }
    const p = degree, n = ctrl.length;
    if (n >= p + 1 && p >= 1 && knots.length === n + p + 1) {
      let w = weights.length === n ? weights : null;
      if (weights.length && !w) warn('SPLINE con número de pesos incorrecto: se ignoran los pesos');
      if (w && w.some((x) => !(x > 0))) w = null;
      const ok = knots.every((u, i) => i === 0 || u >= knots[i - 1]);
      if (!ok || !(knots[n] > knots[p])) {
        warn('SPLINE con vector de nudos inválido omitida');
        return null;
      }
      let U = knots, Pw = ctrl.map((q, i) => (w ? [q[0] * w[i], q[1] * w[i], w[i]] : [q[0], q[1], 1]));
      const clamped = U.slice(0, p + 1).every((u) => u === U[0]) && U.slice(-p - 1).every((u) => u === U[U.length - 1]);
      if (!clamped) ({ U, Pw } = clampSpline(p, U, Pw));
      const W = Pw.map((q) => q[2]);
      const rational = W.some((x) => Math.abs(x - W[0]) > 1e-12 * Math.abs(W[0]));
      return [
        {
          type: 'spline',
          degree: p,
          ctrl: Pw.map((q) => [q[0] / q[2], q[1] / q[2]]),
          knots: U,
          weights: rational ? W : null,
        },
      ];
    }
    if (fit.length >= 2) {
      const unit = (v) => {
        const l = v && Math.hypot(v[0], v[1]);
        return l > 0 ? [v[0] / l, v[1] / l] : null;
      };
      let F = fit, closed = (flags & 1) === 1;
      const f0 = F[0], fl = F[F.length - 1];
      if (closed && F.length > 2 && Math.hypot(f0[0] - fl[0], f0[1] - fl[1]) <= 1e-9 * (Math.abs(f0[0]) + Math.abs(f0[1]) + 1)) F = F.slice(0, -1);
      if (closed && F.length < 3) closed = false;
      return fitBeziers(F, closed, unit(t0), unit(t1));
    }
    warn('SPLINE sin puntos de control ni de ajuste válidos omitida');
    return null;
  };

  // ---------- Emisión con resolución de capa/color/tipo de línea ----------
  const segments = [], texts = [];
  const stats = { entities: {}, ignored: {} };
  const bump = (o, t) => (o[t] = (o[t] || 0) + 1);
  const unsupported = new Map();
  const SUPPORTED = new Set(['LINE', 'ARC', 'CIRCLE', 'LWPOLYLINE', 'POLYLINE', 'ELLIPSE', 'SPLINE', 'INSERT', 'TEXT', 'MTEXT']);

  // ctx: { M, layer, color, linetype, block, stack } del INSERT contenedor (null en espacio modelo).
  const emit = (rec, ctx) => {
    const ent = parseRec(rec);
    if (ent.skip) return;
    const layerName = ctx && ent.layer === '0' ? ctx.layer : ent.layer;
    const L = layerOf(layerName);
    let color = ent.color;
    if (color === 256) color = L.color;
    else if (color === 0) color = ctx ? ctx.color : 7;
    color = Math.abs(color);
    let lt = ent.linetype, ltu = lt.toUpperCase();
    if (ltu === 'BYBLOCK') lt = ctx ? ctx.linetype : 'CONTINUOUS';
    else if (ltu === 'BYLAYER') lt = L.linetype;

    if (ent.insert) return emitInsert(ent, ctx, { layer: L.name, color, linetype: lt });
    if (ent.segs && ent.segs.length) {
      const meta = { layer: L.name, entity: ent.type, color, linetype: lt, dashed: isDashed(lt) };
      if (ent.handle) meta.handle = ent.handle;
      if (ctx) meta.block = ctx.block;
      for (const g of ent.segs) {
        const o = ctx ? segTransform(g, ctx.M) : { ...g };
        o.meta = meta;
        segments.push(o);
      }
    }
    if (ent.texts)
      for (const t of ent.texts) {
        if (!ctx) texts.push({ text: t.text, p: t.p, h: t.h, rot: t.rot, layer: L.name });
        else {
          const M = ctx.M, v = apply([M[0], M[1], M[2], M[3], 0, 0], cosSinDeg(t.rot));
          const sc = Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2]));
          texts.push({ text: t.text, p: apply(M, t.p), h: t.h * sc, rot: Math.atan2(v[1], v[0]) / DEG, layer: L.name });
        }
      }
  };

  const emitInsert = (ent, ctx, props) => {
    const o = ent.insert, key = o.name.toUpperCase();
    const blk = blocks.get(key);
    if (!blk) return warn(`Bloque inexistente omitido: ${o.name}`);
    if (blk.flags & 4) return warn(`Referencia externa (xref) no incluida: ${o.name}`);
    const stack = ctx ? ctx.stack : [];
    if (stack.includes(key)) return warn(`Referencia circular de bloques omitida: ${o.name}`);
    if (stack.length >= 64) return warn(`Anidamiento de bloques demasiado profundo: ${o.name}`);
    if (!(o.sx !== 0 && o.sy !== 0)) return warn(`INSERT con escala nula omitido: ${o.name}`);
    const [cr, sr] = cosSinDeg(o.rot);
    const local = compose([cr, sr, -sr, cr, 0, 0], [o.sx, 0, 0, o.sy, -o.sx * blk.base[0], -o.sy * blk.base[1]]);
    const parentM = ctx ? ctx.M : null;
    for (let j = 0; j < o.rows; j++)
      for (let i = 0; i < o.cols; i++) {
        const ox = i * o.dc, oy = j * o.dr;
        let m = local.slice();
        m[4] += o.p[0] + cr * ox - sr * oy;
        m[5] += o.p[1] + sr * ox + cr * oy;
        if (o.M) m = compose(o.M, m);
        if (parentM) m = compose(parentM, m);
        const sub = { M: m, layer: props.layer, color: props.color, linetype: props.linetype, block: blk.name, stack: [...stack, key] };
        for (const r of blk.recs) {
          if (IGNORED.has(r.type)) continue;
          emit(r, sub);
        }
      }
  };

  for (const rec of entityRecs || []) {
    const t = rec.type;
    if (IGNORED.has(t)) {
      bump(stats.ignored, t);
      continue;
    }
    if (!SUPPORTED.has(t)) {
      bump(stats.ignored, t);
      unsupported.set(t, (unsupported.get(t) || 0) + 1);
      continue;
    }
    const ent = parseRec(rec);
    if (ent.paper) {
      bump(stats.ignored, 'PAPERSPACE');
      continue;
    }
    bump(stats.entities, t);
    emit(rec, null);
  }
  if (!entityRecs) warnings.push('El DXF no contiene la sección ENTITIES');
  else if (!entityRecs.length) warnings.push('El DXF no contiene entidades');
  for (const [t, n] of unsupported) warnings.push(`Entidad no soportada ignorada: ${t} (${n})`);
  for (const [m, n] of warnCounts) warnings.push(n > 1 ? `${m} (×${n})` : m);

  return {
    units,
    version: header.$ACADVER || null,
    layers,
    linetypes: [...ltypes.values()].map((l) => l.name),
    segments,
    texts,
    stats,
    warnings,
  };
}
