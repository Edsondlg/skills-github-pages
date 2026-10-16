// Importador SVG → segmentos exactos (contrato C3, docs/ARQUITECTURA.md).
// Sin DOM: tokenizador XML tolerante propio. Coordenadas de salida en unidades de usuario
// con Y invertida (y_sal = −y) para que el dibujo quede derecho; units.toMM convierte a mm.
import { segTransform } from '../geom2d/segments.js';

const TAU = 2 * Math.PI;
const I = [1, 0, 0, 1, 0, 0];
const FLIP = [1, 0, 0, -1, 0, 0];

// ---------- XML tolerante ----------

const BASE_ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(s, ents) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[\w.:-]+);/g, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return ents[e] ?? m;
  });
}

const isWs = (c) => c === 32 || c === 9 || c === 10 || c === 13;

// Árbol { name, attrs, children, parent }. Comentarios, CDATA, PI y texto se descartan.
function parseXML(text) {
  const ents = { ...BASE_ENT };
  const root = { name: '#doc', attrs: {}, children: [], parent: null };
  let cur = root, i = 0;
  const n = text.length;
  while (i < n) {
    const lt = text.indexOf('<', i);
    if (lt < 0) break;
    const skipTo = (end, from) => {
      const e = text.indexOf(end, from);
      i = e < 0 ? n : e + end.length;
    };
    if (text.startsWith('<!--', lt)) skipTo('-->', lt + 4);
    else if (text.startsWith('<![CDATA[', lt)) skipTo(']]>', lt + 9);
    else if (text.startsWith('<?', lt)) skipTo('?>', lt + 2);
    else if (text[lt + 1] === '!') {
      // DOCTYPE (con subconjunto interno [...]): se recogen las declaraciones <!ENTITY>.
      let j = lt + 2, depth = 0;
      for (; j < n; j++) {
        const ch = text[j];
        if (ch === '[') depth++;
        else if (ch === ']') depth--;
        else if (ch === '>' && depth <= 0) break;
      }
      for (const m of text.slice(lt, j + 1).matchAll(/<!ENTITY\s+([\w.:-]+)\s+(["'])([\s\S]*?)\2\s*>/g)) ents[m[1]] = m[3];
      i = j + 1;
    } else if (text[lt + 1] === '/') {
      const e = text.indexOf('>', lt);
      const name = text.slice(lt + 2, e < 0 ? n : e).trim();
      let p = cur;
      while (p !== root && p.name !== name) p = p.parent;
      if (p !== root) cur = p.parent; // cierre sin apertura: se ignora
      i = e < 0 ? n : e + 1;
    } else {
      let j = lt + 1;
      while (j < n && !isWs(text.charCodeAt(j)) && text[j] !== '>' && text[j] !== '/') j++;
      const name = text.slice(lt + 1, j);
      const attrs = {};
      let selfClose = false;
      for (;;) {
        while (j < n && isWs(text.charCodeAt(j))) j++;
        if (j >= n) break;
        if (text[j] === '>') {
          j++;
          break;
        }
        if (text[j] === '/') {
          j++;
          if (text[j] === '>') {
            selfClose = true;
            j++;
            break;
          }
          continue;
        }
        const a0 = j;
        while (j < n && !isWs(text.charCodeAt(j)) && text[j] !== '=' && text[j] !== '>' && text[j] !== '/') j++;
        const an = text.slice(a0, j);
        while (j < n && isWs(text.charCodeAt(j))) j++;
        let val = '';
        if (text[j] === '=') {
          j++;
          while (j < n && isWs(text.charCodeAt(j))) j++;
          const q = text[j];
          if (q === '"' || q === "'") {
            const e = text.indexOf(q, j + 1);
            val = text.slice(j + 1, e < 0 ? n : e);
            j = e < 0 ? n : e + 1;
          } else {
            const v0 = j;
            while (j < n && !isWs(text.charCodeAt(j)) && text[j] !== '>') j++;
            val = text.slice(v0, j);
          }
        }
        if (an) attrs[an] = decodeEntities(val, ents);
        if (j === a0) j++; // carácter inesperado: avanzar siempre
      }
      const node = { name, attrs, children: [], parent: cur };
      cur.children.push(node);
      if (!selfClose && name) cur = node;
      i = j;
    }
  }
  return root;
}

// Nombre local: se quita el prefijo "svg:"; otros prefijos (inkscape:, sodipodi:) quedan y se ignoran.
const localName = (nm) => (nm.startsWith('svg:') ? nm.slice(4) : nm);

// ---------- números, longitudes, estilos, transformaciones ----------

const NUM = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
const NUM_STICKY = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const parseNums = (s) => (s ? (s.match(NUM) || []).map(Number) : []);

const UNIT_MM = { mm: 1, cm: 10, in: 25.4, pt: 25.4 / 72, pc: 25.4 / 6, px: 25.4 / 96, q: 0.25 };
const UNIT_NAME = { mm: 'mm', cm: 'cm', in: 'in', pt: 'pt', pc: 'pt', px: 'px', q: 'mm' };

function parseLen(s) {
  if (s == null) return null;
  const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Z%]*)\s*$/.exec(s);
  if (!m) return null;
  return { v: Number(m[1]), unit: m[2].toLowerCase() };
}

function parseStyle(s) {
  const out = {};
  if (!s) return out;
  for (const part of s.split(';')) {
    const k = part.indexOf(':');
    if (k > 0) out[part.slice(0, k).trim().toLowerCase()] = part.slice(k + 1).trim();
  }
  return out;
}

// A∘B (primero B, luego A).
function mul(A, B) {
  return [
    A[0] * B[0] + A[2] * B[1],
    A[1] * B[0] + A[3] * B[1],
    A[0] * B[2] + A[2] * B[3],
    A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4],
    A[1] * B[4] + A[3] * B[5] + A[5],
  ];
}

function parseTransform(str) {
  let m = I;
  if (!str) return m;
  const deg = Math.PI / 180;
  for (const t of str.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)) {
    const v = parseNums(t[2]);
    let k = null;
    switch (t[1]) {
      case 'matrix':
        if (v.length >= 6) k = v.slice(0, 6);
        break;
      case 'translate':
        if (v.length >= 1) k = [1, 0, 0, 1, v[0], v[1] ?? 0];
        break;
      case 'scale':
        if (v.length >= 1) k = [v[0], 0, 0, v[1] ?? v[0], 0, 0];
        break;
      case 'rotate': {
        if (!v.length) break;
        const c = Math.cos(v[0] * deg), s = Math.sin(v[0] * deg);
        k = [c, s, -s, c, 0, 0];
        if (v.length >= 3) k = mul(mul([1, 0, 0, 1, v[1], v[2]], k), [1, 0, 0, 1, -v[1], -v[2]]);
        break;
      }
      case 'skewX':
        if (v.length) k = [1, 0, Math.tan(v[0] * deg), 1, 0, 0];
        break;
      case 'skewY':
        if (v.length) k = [1, Math.tan(v[0] * deg), 0, 1, 0, 0];
        break;
    }
    if (k) m = mul(m, k);
  }
  return m;
}

// ---------- geometría local (coordenadas SVG, Y hacia abajo) ----------

const L = (p0, p1) => ({ type: 'line', p0, p1 });
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

// Arco elíptico SVG por extremos → arc/ellipse por centro (SVG 1.1, apéndice F.6.5).
// t creciente = ángulo positivo del sistema SVG = sweep-flag 1, de ahí ccw = fS.
function svgArc(p1, rx, ry, phiDeg, fA, fS, p2) {
  if (same(p1, p2)) return null;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!(rx > 0) || !(ry > 0)) return L(p1, p2);
  const phi = ((phiDeg % 360) * Math.PI) / 180, cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (p1[0] - p2[0]) / 2, dy = (p1[1] - p2[1]) / 2;
  const x1 = cp * dx + sp * dy, y1 = -sp * dx + cp * dy;
  const lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lam > 1) {
    const k = Math.sqrt(lam);
    rx *= k;
    ry *= k;
  }
  const rx2 = rx * rx, ry2 = ry * ry, den = rx2 * y1 * y1 + ry2 * x1 * x1;
  let sq = Math.sqrt(Math.max(0, (rx2 * ry2 - den) / den));
  if (fA === fS) sq = -sq;
  const cxp = (sq * rx * y1) / ry, cyp = (-sq * ry * x1) / rx;
  const c = [cp * cxp - sp * cyp + (p1[0] + p2[0]) / 2, sp * cxp + cp * cyp + (p1[1] + p2[1]) / 2];
  const ux = (x1 - cxp) / rx, uy = (y1 - cyp) / ry, vx = (-x1 - cxp) / rx, vy = (-y1 - cyp) / ry;
  const th1 = Math.atan2(uy, ux);
  let dth = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  if (!fS && dth > 0) dth -= TAU;
  else if (fS && dth < 0) dth += TAU;
  if (Math.abs(rx - ry) <= 1e-12 * Math.max(rx, ry)) return { type: 'arc', c, r: rx, a0: th1 + phi, a1: th1 + dth + phi, ccw: fS };
  return { type: 'ellipse', c, rx, ry, rot: phi, t0: th1, t1: th1 + dth, ccw: fS };
}

const quadToCubic = (p0, q, p3) => ({
  type: 'bezier',
  pts: [p0, [p0[0] + (2 / 3) * (q[0] - p0[0]), p0[1] + (2 / 3) * (q[1] - p0[1])], [p3[0] + (2 / 3) * (q[0] - p3[0]), p3[1] + (2 / 3) * (q[1] - p3[1])], p3],
});

// Datos de trayecto → segmentos. Ante un error se conserva lo leído hasta ahí (regla SVG).
function parsePath(d, out, warn) {
  let i = 0, cmd = '', prev = '';
  const n = d.length;
  let cur = [0, 0], start = [0, 0], lastC2 = null, lastQ = null;
  const skip = () => {
    while (i < n && (isWs(d.charCodeAt(i)) || d[i] === ',')) i++;
  };
  const num = () => {
    skip();
    NUM_STICKY.lastIndex = i;
    const m = NUM_STICKY.exec(d);
    if (!m) throw new Error('num');
    i = NUM_STICKY.lastIndex;
    return Number(m[0]);
  };
  const flag = () => {
    skip();
    const ch = d[i];
    if (ch !== '0' && ch !== '1') throw new Error('flag');
    i++;
    return ch === '1';
  };
  const pt = (rel) => {
    const x = num(), y = num();
    return rel ? [cur[0] + x, cur[1] + y] : [x, y];
  };
  const line = (p) => {
    if (!same(cur, p)) out.push(L(cur, p));
    cur = p;
  };
  try {
    for (;;) {
      skip();
      if (i >= n) break;
      const ch = d[i];
      if (/[a-zA-Z]/.test(ch)) {
        if (!'MmLlHhVvCcSsQqTtAaZz'.includes(ch)) throw new Error('cmd');
        cmd = ch;
        i++;
      } else if (!cmd) throw new Error('cmd');
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      let c2 = null, q = null;
      switch (C) {
        case 'M':
          cur = start = pt(rel);
          cmd = rel ? 'l' : 'L'; // pares siguientes = lineto implícito
          break;
        case 'L':
          line(pt(rel));
          break;
        case 'H': {
          const x = num();
          line([rel ? cur[0] + x : x, cur[1]]);
          break;
        }
        case 'V': {
          const y = num();
          line([cur[0], rel ? cur[1] + y : y]);
          break;
        }
        case 'C':
        case 'S': {
          const p1 = C === 'C' ? pt(rel) : lastC2 && 'CS'.includes(prev) ? [2 * cur[0] - lastC2[0], 2 * cur[1] - lastC2[1]] : cur;
          const p2 = pt(rel), p3 = pt(rel);
          out.push({ type: 'bezier', pts: [cur, p1, p2, p3] });
          c2 = p2;
          cur = p3;
          break;
        }
        case 'Q':
        case 'T': {
          const qp = C === 'Q' ? pt(rel) : lastQ && 'QT'.includes(prev) ? [2 * cur[0] - lastQ[0], 2 * cur[1] - lastQ[1]] : cur;
          const p3 = pt(rel);
          out.push(quadToCubic(cur, qp, p3));
          q = qp;
          cur = p3;
          break;
        }
        case 'A': {
          const rx = num(), ry = num(), rot = num(), fA = flag(), fS = flag(), p = pt(rel);
          const s = svgArc(cur, rx, ry, rot, fA, fS, p);
          if (s) out.push(s);
          cur = p;
          break;
        }
        case 'Z':
          line(start);
          cur = start;
          cmd = '';
          break;
      }
      lastC2 = c2;
      lastQ = q;
      prev = C;
    }
  } catch {
    warn(`Datos de trayecto inválidos cerca de la posición ${i}; se conserva lo leído hasta ahí.`);
  }
}

function rectSegs(x, y, w, h, rx, ry) {
  if (!(w > 0) || !(h > 0)) return [];
  if (rx == null && ry == null) rx = ry = 0;
  else if (rx == null) rx = ry;
  else if (ry == null) ry = rx;
  rx = Math.min(Math.max(rx, 0), w / 2);
  ry = Math.min(Math.max(ry, 0), h / 2);
  if (!(rx > 0) || !(ry > 0)) return [L([x, y], [x + w, y]), L([x + w, y], [x + w, y + h]), L([x + w, y + h], [x, y + h]), L([x, y + h], [x, y])];
  const out = [];
  const ln = (p0, p1) => !same(p0, p1) && out.push(L(p0, p1));
  const corner = (cx, cy, a) =>
    out.push(rx === ry ? { type: 'arc', c: [cx, cy], r: rx, a0: a, a1: a + Math.PI / 2, ccw: true } : { type: 'ellipse', c: [cx, cy], rx, ry, rot: 0, t0: a, t1: a + Math.PI / 2, ccw: true });
  ln([x + rx, y], [x + w - rx, y]);
  corner(x + w - rx, y + ry, -Math.PI / 2);
  ln([x + w, y + ry], [x + w, y + h - ry]);
  corner(x + w - rx, y + h - ry, 0);
  ln([x + w - rx, y + h], [x + rx, y + h]);
  corner(x + rx, y + h - ry, Math.PI / 2);
  ln([x, y + h - ry], [x, y + ry]);
  corner(x + rx, y + ry, Math.PI);
  return out;
}

function polySegs(nums, close) {
  const pts = [];
  for (let k = 0; k + 1 < nums.length; k += 2) pts.push([nums[k], nums[k + 1]]);
  const out = [];
  for (let k = 0; k + 1 < pts.length; k++) if (!same(pts[k], pts[k + 1])) out.push(L(pts[k], pts[k + 1]));
  if (close && pts.length > 2 && !same(pts[pts.length - 1], pts[0])) out.push(L(pts[pts.length - 1], pts[0]));
  return out;
}

// Elipse transformada con radios iguales → arco o círculo exacto.
function normalize(s) {
  if (s.type !== 'ellipse' || Math.abs(s.rx - s.ry) > 1e-9 * Math.max(s.rx, s.ry)) return s;
  const r = (s.rx + s.ry) / 2, ccw = s.ccw !== false;
  let o;
  const sw = ccw ? s.t1 - s.t0 : s.t0 - s.t1;
  if (Math.abs(Math.abs(sw) - TAU) < 1e-12) o = { type: 'circle', c: s.c, r, ccw };
  else o = { type: 'arc', c: s.c, r, a0: s.rot + s.t0, a1: s.rot + s.t1, ccw };
  if (s.meta !== undefined) o.meta = s.meta;
  return o;
}

// ---------- recorrido del documento ----------

const IGNORED_DRAWABLE = new Set(['text', 'image', 'foreignObject']);
const SKIP = new Set([
  'defs', 'clipPath', 'mask', 'marker', 'pattern', 'linearGradient', 'radialGradient', 'filter', 'style',
  'script', 'title', 'desc', 'metadata',
]);

/** SVG (texto) → { units: { name, toMM }, segments, warnings }. */
export function parseSVG(text) {
  if (typeof text !== 'string') throw new Error('El SVG debe ser texto.');
  const doc = parseXML(text);
  const warnings = [];
  const warn = (w) => warnings.includes(w) || warnings.push(w);

  let root = null;
  const ids = new Map();
  const scan = (nd) => {
    if (!root && localName(nd.name) === 'svg') root = nd;
    if (nd.attrs.id && !ids.has(nd.attrs.id)) ids.set(nd.attrs.id, nd);
    for (const c of nd.children) scan(c);
  };
  scan(doc);
  if (!root) throw new Error('No es un archivo SVG válido: falta el elemento <svg>.');

  // Escala física: width/height con unidades + viewBox (preserveAspectRatio "meet" → la menor).
  let vb = parseNums(root.attrs.viewBox);
  vb = vb.length >= 4 && vb[2] > 0 && vb[3] > 0 ? vb : null;
  const W = parseLen(root.attrs.width), H = parseLen(root.attrs.height);
  const ok = (l) => l && l.v > 0 && l.unit !== '%' && (l.unit === '' || l.unit in UNIT_MM);
  const units = { name: 'px', toMM: UNIT_MM.px };
  const scaleOf = (l, size) => (l.v * UNIT_MM[l.unit || 'px']) / (vb ? size : l.v * (UNIT_MM[l.unit || 'px'] / UNIT_MM.px));
  const refs = [ok(W) && [W, vb?.[2]], ok(H) && [H, vb?.[3]]].filter(Boolean);
  if (refs.length) {
    const sc = refs.map(([l, size]) => scaleOf(l, size));
    units.toMM = Math.min(...sc);
    units.name = UNIT_NAME[refs[0][0].unit || 'px'];
    if (sc.length === 2 && Math.abs(sc[0] - sc[1]) > 1e-6 * Math.max(...sc))
      warn('La proporción de width/height no coincide con viewBox; se usa la escala menor.');
  }
  if (!refs.length || !refs[0][0].unit)
    warn('El SVG no declara unidades físicas (mm, cm, in); se asumen píxeles a 96 ppp. Puede que haya que ajustar la escala.');

  // Longitudes dentro del dibujo (unidades de usuario; las unidades absolutas se pasan a px CSS).
  const vw = vb ? vb[2] : ok(W) ? W.v : 100, vh = vb ? vb[3] : ok(H) ? H.v : 100;
  const len = (s, ref) => {
    const l = parseLen(s);
    if (!l) return null;
    if (l.unit === '%') return (l.v / 100) * ref;
    return l.unit in UNIT_MM ? (l.v * UNIT_MM[l.unit]) / UNIT_MM.px : l.v;
  };
  const diag = Math.hypot(vw, vh) / Math.SQRT2;

  const segments = [];
  const ignored = {};
  const useStack = new Set();

  const walk = (nd, ctx, viaUse = false) => {
    const name = localName(nd.name);
    if (IGNORED_DRAWABLE.has(name)) {
      ignored[name] = (ignored[name] || 0) + 1;
      return;
    }
    if (SKIP.has(name) || (name === 'symbol' && !viaUse)) return;
    const st = parseStyle(nd.attrs.style);
    const prop = (k) => st[k] ?? nd.attrs[k];
    if (prop('display') === 'none') return;
    let m = mul(ctx.m, parseTransform(nd.attrs.transform));
    const inh = (k) => {
      const v = prop(k);
      return v == null || v === 'inherit' ? ctx[k] : v;
    };
    const c = { m, layer: ctx.layer, stroke: inh('stroke'), fill: inh('fill') };
    const A = nd.attrs, X = (k, d = 0) => len(A[k], vw) ?? d, Y = (k, d = 0) => len(A[k], vh) ?? d;

    let local = null;
    switch (name) {
      case 'svg': {
        if (nd !== root) {
          c.m = m = mul(m, [1, 0, 0, 1, X('x'), Y('y')]);
          const v = parseNums(A.viewBox), w = len(A.width, vw), h = len(A.height, vh);
          if (v.length >= 4 && v[2] > 0 && v[3] > 0 && w > 0 && h > 0) {
            const k = Math.min(w / v[2], h / v[3]);
            c.m = mul(m, [k, 0, 0, k, -k * v[0], -k * v[1]]);
          }
        }
        for (const ch of nd.children) walk(ch, c);
        return;
      }
      case 'g':
      case 'a':
      case 'switch':
      case 'symbol':
        if (name === 'g' && (A['inkscape:label'] || A.id)) c.layer = A['inkscape:label'] || A.id;
        for (const ch of nd.children) walk(ch, c);
        return;
      case 'use': {
        const href = A.href ?? A['xlink:href'];
        const tgt = href && href[0] === '#' ? ids.get(href.slice(1)) : null;
        if (!tgt) {
          warn(`Referencia <use> no encontrada: ${href ?? '(vacía)'}.`);
          return;
        }
        if (useStack.has(tgt)) {
          warn(`Referencia <use> circular: ${href}.`);
          return;
        }
        c.m = mul(m, [1, 0, 0, 1, X('x'), Y('y')]);
        useStack.add(tgt);
        walk(tgt, c, true);
        useStack.delete(tgt);
        return;
      }
      case 'path':
        local = [];
        parsePath(A.d || '', local, warn);
        break;
      case 'rect':
        local = rectSegs(X('x'), Y('y'), X('width'), Y('height'), A.rx != null && A.rx !== 'auto' ? len(A.rx, vw) : null, A.ry != null && A.ry !== 'auto' ? len(A.ry, vh) : null);
        break;
      case 'circle': {
        const r = len(A.r, diag);
        local = r > 0 ? [{ type: 'circle', c: [X('cx'), Y('cy')], r, ccw: true }] : [];
        break;
      }
      case 'ellipse': {
        let rx = A.rx != null && A.rx !== 'auto' ? len(A.rx, vw) : null, ry = A.ry != null && A.ry !== 'auto' ? len(A.ry, vh) : null;
        rx ??= ry;
        ry ??= rx;
        const cc = [X('cx'), Y('cy')];
        if (!(rx > 0) || !(ry > 0)) local = [];
        else if (rx === ry) local = [{ type: 'circle', c: cc, r: rx, ccw: true }];
        else local = [{ type: 'ellipse', c: cc, rx, ry, rot: 0, t0: 0, t1: TAU, ccw: true }];
        break;
      }
      case 'line': {
        const p0 = [X('x1'), Y('y1')], p1 = [X('x2'), Y('y2')];
        local = same(p0, p1) ? [] : [L(p0, p1)];
        break;
      }
      case 'polyline':
      case 'polygon':
        local = polySegs(parseNums(A.points), name === 'polygon');
        break;
      default:
        return; // elemento desconocido o de otro espacio de nombres
    }
    const full = mul(FLIP, c.m);
    const color = c.stroke && c.stroke !== 'none' ? c.stroke : c.fill && c.fill !== 'none' ? c.fill : null;
    const meta = { layer: c.layer, entity: name, color };
    try {
      for (const s of local) {
        const t = normalize(segTransform(s, full));
        t.meta = meta;
        segments.push(t);
      }
    } catch {
      warn(`Se omitió un <${name}> con transformación degenerada.`);
    }
  };

  walk(root, { m: I, layer: 'svg', stroke: null, fill: null });
  for (const [k, v] of Object.entries(ignored)) warn(`Se ignoraron ${v} elemento(s) <${k}> (no aportan geometría).`);
  return { units, segments, warnings };
}
