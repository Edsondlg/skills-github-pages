// Definición del tapete de calibración: anillo(s) de marcadores ArUco alrededor de una zona libre
// con moteado aleatorio (speckle) donde se coloca la pieza. También genera hojas de calcomanías
// para la pieza y hojas de moteado.
//
// Sistema de coordenadas del tapete (mm): origen en el centro de la zona libre, X a la derecha,
// Y hacia el borde superior de la hoja, Z hacia arriba (fuera de la mesa).
// Coordenadas de papel (mm): origen en la esquina superior izquierda de la hoja, v hacia abajo.
import { DICT_5X5_250 } from './aruco-dict.js';
import { rng } from './linalg.js';

export const PAPER_SIZES = {
  'A4': [297, 210], 'A3': [420, 297], 'A2': [594, 420], 'A1': [841, 594], 'A0': [1189, 841],
  'Carta': [279.4, 215.9], 'Tabloide': [431.8, 279.4], 'Oficio': [355.6, 215.9],
};

export const PART_ID_START = 200; // IDs 200..249 reservados para calcomanías sobre la pieza
export const MAX_BOARD_MARKERS = 200;

export const BOARD_DEFAULTS = {
  paper: 'A3', paperW: 420, paperH: 297,
  margin: 8, markerSize: 30, gap: 7.5, rings: 1,
  speckle: true, speckleDot: 1.0, speckleDensity: 0.32, speckleSeed: 7, speckleColor: '#000000',
  scaleX: 1, scaleY: 1, // corrección de escala medida por el usuario
};

export function boardCode(o) {
  return [o.paperW, o.paperH, o.margin, o.markerSize, o.gap, o.rings, o.speckle ? 1 : 0, o.speckleDot, o.speckleDensity, o.speckleSeed]
    .map(v => +(+v).toFixed(3)).join('_');
}
export function parseBoardCode(code) {
  const p = String(code).trim().split('_').map(Number);
  if (p.length < 10 || p.some(v => !isFinite(v))) return null;
  return { paperW: p[0], paperH: p[1], margin: p[2], markerSize: p[3], gap: p[4], rings: p[5], speckle: !!p[6], speckleDot: p[7], speckleDensity: p[8], speckleSeed: p[9] };
}

export function makeBoard(options = {}) {
  const o = { ...BOARD_DEFAULTS, ...options };
  if (options.paper && PAPER_SIZES[options.paper] && options.paperW === undefined) {
    [o.paperW, o.paperH] = PAPER_SIZES[options.paper];
  }
  const s = o.markerSize, g = o.gap, p = s + g;
  const nx = Math.floor((o.paperW - 2 * o.margin + g) / p);
  const ny = Math.floor((o.paperH - 2 * o.margin + g) / p);
  if (nx < 2 * o.rings + 1 || ny < 2 * o.rings + 1) throw new Error('El papel es demasiado pequeño para ese tamaño de marcador.');
  const usedW = nx * p - g, usedH = ny * p - g;
  const ox = (o.paperW - usedW) / 2, oy = (o.paperH - usedH) / 2;
  // zona libre (papel) = interior del anillo con holgura de un hueco
  const fu0 = ox + o.rings * p, fu1 = ox + (nx - o.rings) * p - g;
  const fv0 = oy + o.rings * p, fv1 = oy + (ny - o.rings) * p - g;
  const u0 = (fu0 + fu1) / 2, v0 = (fv0 + fv1) / 2; // origen del tapete en papel
  const toBoard = (u, v) => [u - u0, v0 - v];
  // orden de IDs: anillo exterior en sentido horario desde la esquina superior izquierda
  const cellsOrder = [];
  for (let ring = 0; ring < o.rings; ring++) {
    const c0 = ring, c1 = nx - 1 - ring, r0 = ring, r1 = ny - 1 - ring;
    for (let c = c0; c <= c1; c++) cellsOrder.push([c, r0]);
    for (let r = r0 + 1; r <= r1; r++) cellsOrder.push([c1, r]);
    for (let c = c1 - 1; c >= c0; c--) cellsOrder.push([c, r1]);
    for (let r = r1 - 1; r > r0; r--) cellsOrder.push([c0, r]);
  }
  if (cellsOrder.length > MAX_BOARD_MARKERS) throw new Error(`Demasiados marcadores (${cellsOrder.length} > ${MAX_BOARD_MARKERS}). Aumente el tamaño del marcador o use un anillo.`);
  const sx = o.scaleX || 1, sy = o.scaleY || 1;
  const markers = cellsOrder.map(([c, r], id) => {
    const u = ox + c * p, v = oy + r * p; // esquina superior izquierda en papel
    const tl = toBoard(u, v), br = toBoard(u + s, v + s);
    const corners = [[tl[0], tl[1], 0], [br[0], tl[1], 0], [br[0], br[1], 0], [tl[0], br[1], 0]]
      .map(([x, y, z]) => [x * sx, y * sy, z]);
    return { id, u, v, size: s, corners, center: [(tl[0] + br[0]) / 2 * sx, (tl[1] + br[1]) / 2 * sy, 0] };
  });
  const free = { x0: (fu0 - u0) * sx, x1: (fu1 - u0) * sx, y0: (v0 - fv1) * sy, y1: (v0 - fv0) * sy };
  // barras de escala dentro de la zona libre (abajo y a la izquierda)
  const fw = fu1 - fu0, fh = fv1 - fv0;
  const Lx = Math.max(50, Math.floor((fw - 30) / 10) * 10);
  const Ly = Math.max(50, Math.floor((fh - 30) / 10) * 10);
  const scaleBars = [
    { axis: 'x', u0: u0 - Lx / 2, v0: fv1 - 7, u1: u0 + Lx / 2, v1: fv1 - 7, length: Lx },
    { axis: 'y', u0: fu0 + 7, v0: v0 + Ly / 2, u1: fu0 + 7, v1: v0 - Ly / 2, length: Ly },
  ];
  // marcadores de control (excluidos en la validación cruzada): uno de cada cuatro
  const checkIds = markers.filter((m, i) => i % 4 === 2).map(m => m.id);
  const board = {
    ...o, nx, ny, pitch: p, u0, v0, markers, free, scaleBars, checkIds,
    dict: DICT_5X5_250.name, code: boardCode(o),
    speckleArea: { u0: fu0 + 16, u1: fu1 - 3, v0: fv0 + 3, v1: fv1 - 16 },
  };
  board.dots = o.speckle ? makeSpeckle(board.speckleArea, o.speckleDot, o.speckleDensity, o.speckleSeed) : [];
  return board;
}

// Moteado multiescala en una rejilla con fluctuación (cobertura uniforme, sin repeticiones).
export function makeSpeckle(area, dot, density, seed) {
  const rand = rng(seed * 7919 + 13);
  const sizes = [0.7, 1.0, 1.6];
  const probs = [0.45, 0.4, 0.15];
  let meanArea = 0;
  for (let i = 0; i < 3; i++) meanArea += probs[i] * Math.PI * (sizes[i] * dot / 2) ** 2;
  const cell = Math.sqrt(meanArea / density);
  const dots = [];
  for (let v = area.v0 + cell / 2; v < area.v1; v += cell) {
    for (let u = area.u0 + cell / 2; u < area.u1; u += cell) {
      const q = rand();
      const d = (q < probs[0] ? sizes[0] : q < probs[0] + probs[1] ? sizes[1] : sizes[2]) * dot;
      const r = d / 2;
      const cu = u + (rand() - 0.5) * (cell - r), cv = v + (rand() - 0.5) * (cell - r);
      if (cu - r < area.u0 || cu + r > area.u1 || cv - r < area.v0 || cv + r > area.v1) continue;
      dots.push([cu, cv, r]);
    }
  }
  return dots;
}

export function markerBits(id, dict = DICT_5X5_250) {
  const nb = dict.bits, code = dict.codes[id];
  const bits = [];
  for (let i = 0; i < nb * nb; i++) bits.push((code >>> (nb * nb - 1 - i)) & 1);
  return bits; // 1 = blanco
}

// Rectángulos negros de un marcador (filas fusionadas), en unidades de celda.
export function markerBlackRuns(id, dict = DICT_5X5_250) {
  const nb = dict.bits, N = nb + 2, bits = markerBits(id, dict);
  const runs = [];
  for (let r = 0; r < N; r++) {
    let start = -1;
    for (let c = 0; c <= N; c++) {
      let black = false;
      if (c < N) black = (r === 0 || r === N - 1 || c === 0 || c === N - 1) ? true : bits[(r - 1) * nb + (c - 1)] === 0;
      if (black && start < 0) start = c;
      if (!black && start >= 0) { runs.push([start, r, c - start]); start = -1; }
    }
  }
  return runs; // [col, row, longitud]
}

// Lista de primitivas dibujables de la hoja (en mm de papel).
export function boardPrimitives(board) {
  const rects = [], circles = [], lines = [], texts = [];
  for (const m of board.markers) {
    const cell = m.size / (DICT_5X5_250.bits + 2);
    for (const [c, r, len] of markerBlackRuns(m.id)) rects.push([m.u + c * cell, m.v + r * cell, len * cell, cell]);
    texts.push({ x: m.u + m.size / 2, y: m.v + m.size + Math.min(4.2, board.gap * 0.62), size: Math.min(2.6, board.gap * 0.38), text: String(m.id), anchor: 'middle', color: '#555' });
  }
  for (const d of board.dots) circles.push(d);
  for (const b of board.scaleBars) {
    lines.push([b.u0, b.v0, b.u1, b.v1, 0.25]);
    const n = Math.round(b.length / 10);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = b.u0 + (b.u1 - b.u0) * t, v = b.v0 + (b.v1 - b.v0) * t;
      const L = i % 5 === 0 ? 3 : 1.6;
      if (b.axis === 'x') lines.push([u, v - L, u, v, 0.2]); else lines.push([u, v, u + L, v, 0.2]);
    }
    if (b.axis === 'x') texts.push({ x: (b.u0 + b.u1) / 2, y: b.v0 + 4.2, size: 2.8, text: `Barra X = ${b.length.toFixed(1)} mm (mida de la primera a la última marca)`, anchor: 'middle', color: '#000' });
    else texts.push({ x: b.u0 + 5, y: (b.v0 + b.v1) / 2, size: 2.8, text: `Barra Y = ${b.length.toFixed(1)} mm`, anchor: 'start', color: '#000', rotate: -90 });
  }
  const info = `Tapete fotogrametría · DICT_5X5_250 · marcador ${board.markerSize} mm · código ${board.code} · IMPRIMIR AL 100% (tamaño real)`;
  texts.push({ x: board.paperW / 2, y: board.paperH - Math.max(2.2, (board.paperH - (board.ny * board.pitch - board.gap)) / 4), size: 2.4, text: info, anchor: 'middle', color: '#333' });
  return { rects, circles, lines, texts };
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export function primitivesToSVG(prims, W, H, speckleColor = '#000') {
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`);
  out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`);
  // todas las celdas negras en un solo trazado: evita líneas finas entre rectángulos contiguos
  if (prims.rects.length) {
    const d = prims.rects.map(([x, y, w, h]) => `M${x.toFixed(4)} ${y.toFixed(4)}h${w.toFixed(4)}v${h.toFixed(4)}h${(-w).toFixed(4)}z`).join('');
    out.push(`<path fill="#000" d="${d}"/>`);
  }
  if (prims.circles.length) {
    out.push(`<g fill="${speckleColor}">`);
    for (const [x, y, r] of prims.circles) out.push(`<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${r.toFixed(3)}"/>`);
    out.push('</g>');
  }
  out.push('<g stroke="#000" fill="none" stroke-linecap="butt">');
  for (const [x0, y0, x1, y1, w] of prims.lines) out.push(`<line x1="${x0.toFixed(3)}" y1="${y0.toFixed(3)}" x2="${x1.toFixed(3)}" y2="${y1.toFixed(3)}" stroke-width="${w}"/>`);
  out.push('</g>');
  for (const t of prims.texts) {
    const tr = t.rotate ? ` transform="rotate(${t.rotate} ${t.x} ${t.y})"` : '';
    out.push(`<text x="${t.x}" y="${t.y}" font-family="Helvetica,Arial,sans-serif" font-size="${t.size}" text-anchor="${t.anchor}" fill="${t.color || '#000'}"${tr}>${esc(t.text)}</text>`);
  }
  out.push('</svg>');
  return out.join('\n');
}

export function boardToSVG(board) {
  return primitivesToSVG(boardPrimitives(board), board.paperW, board.paperH, board.speckleColor);
}

// Hoja de calcomanías para la pieza (IDs desde PART_ID_START), con líneas de corte.
export function stickerSheet({ paperW = 210, paperH = 297, size = 12, quiet = 3, startId = PART_ID_START, count = 50 } = {}) {
  const cellSize = size + 2 * quiet;
  const margin = 10;
  const cols = Math.floor((paperW - 2 * margin) / cellSize), rows = Math.floor((paperH - 2 * margin - 12) / cellSize);
  const prims = { rects: [], circles: [], lines: [], texts: [] };
  const cell = size / (DICT_5X5_250.bits + 2);
  let id = startId;
  const ox = (paperW - cols * cellSize) / 2, oy = margin + 8;
  const placed = [];
  for (let r = 0; r < rows && id < startId + count && id < 250; r++) {
    for (let c = 0; c < cols && id < startId + count && id < 250; c++, id++) {
      const u = ox + c * cellSize + quiet, v = oy + r * cellSize + quiet;
      for (const [cc, rr, len] of markerBlackRuns(id)) prims.rects.push([u + cc * cell, v + rr * cell, len * cell, cell]);
      prims.lines.push([ox + c * cellSize, oy + r * cellSize, ox + (c + 1) * cellSize, oy + r * cellSize, 0.08]);
      prims.lines.push([ox + c * cellSize, oy + r * cellSize, ox + c * cellSize, oy + (r + 1) * cellSize, 0.08]);
      prims.texts.push({ x: u + size / 2, y: v + size + quiet * 0.75, size: Math.min(1.8, quiet * 0.6), text: String(id), anchor: 'middle', color: '#777' });
      placed.push(id);
    }
  }
  prims.texts.push({ x: paperW / 2, y: margin + 3, size: 3, text: `Calcomanías para pieza · marcador ${size} mm · IDs ${placed[0]}–${placed[placed.length - 1]} · IMPRIMIR AL 100%`, anchor: 'middle' });
  return { prims, paperW, paperH, ids: placed };
}

// Hoja de moteado para papel adhesivo (para pegar sobre zonas planas de la pieza).
export function speckleSheet({ paperW = 210, paperH = 297, dot = 0.8, density = 0.35, seed = 3 } = {}) {
  const area = { u0: 10, u1: paperW - 10, v0: 16, v1: paperH - 10 };
  const prims = { rects: [], circles: makeSpeckle(area, dot, density, seed), lines: [], texts: [] };
  prims.texts.push({ x: paperW / 2, y: 11, size: 3, text: `Moteado aleatorio · punto ${dot} mm · para papel adhesivo mate · IMPRIMIR AL 100%`, anchor: 'middle' });
  return { prims, paperW, paperH };
}

// Rasterización con antialias (cobertura exacta en rectángulos) a escala de grises.
// Devuelve { data: Uint8Array, w, h, pxPerMM } (0 = tinta, 255 = papel).
export function rasterizePrims(prims, W, H, pxPerMM, { paper = 250, ink = 18, speckleInk = null } = {}) {
  const w = Math.round(W * pxPerMM), h = Math.round(H * pxPerMM);
  const cov = new Float32Array(w * h);
  const covS = speckleInk !== null ? new Float32Array(w * h) : cov;
  for (const [x, y, rw, rh] of prims.rects) {
    const x0 = x * pxPerMM, x1 = (x + rw) * pxPerMM, y0 = y * pxPerMM, y1 = (y + rh) * pxPerMM;
    const i0 = Math.max(0, Math.floor(x0)), i1 = Math.min(w - 1, Math.ceil(x1) - 1);
    const j0 = Math.max(0, Math.floor(y0)), j1 = Math.min(h - 1, Math.ceil(y1) - 1);
    for (let j = j0; j <= j1; j++) {
      const cy = Math.min(j + 1, y1) - Math.max(j, y0);
      if (cy <= 0) continue;
      for (let i = i0; i <= i1; i++) {
        const cx = Math.min(i + 1, x1) - Math.max(i, x0);
        if (cx > 0) cov[j * w + i] += cx * cy;
      }
    }
  }
  for (const [u, v, r] of prims.circles) {
    const cx = u * pxPerMM, cy = v * pxPerMM, rp = r * pxPerMM;
    const i0 = Math.max(0, Math.floor(cx - rp - 1)), i1 = Math.min(w - 1, Math.ceil(cx + rp + 1));
    const j0 = Math.max(0, Math.floor(cy - rp - 1)), j1 = Math.min(h - 1, Math.ceil(cy + rp + 1));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy);
        const c = rp - d + 0.5;
        if (c > 0) covS[j * w + i] += Math.min(1, c);
      }
    }
  }
  for (const [u0, v0, u1, v1, lw] of prims.lines) {
    // líneas horizontales/verticales como rectángulos
    if (Math.abs(v1 - v0) < 1e-9) {
      const a = Math.min(u0, u1), b = Math.max(u0, u1);
      addRect(a, v0 - lw / 2, b - a, lw);
    } else if (Math.abs(u1 - u0) < 1e-9) {
      const a = Math.min(v0, v1), b = Math.max(v0, v1);
      addRect(u0 - lw / 2, a, lw, b - a);
    }
  }
  function addRect(x, y, rw, rh) {
    const x0 = x * pxPerMM, x1 = (x + rw) * pxPerMM, y0 = y * pxPerMM, y1 = (y + rh) * pxPerMM;
    for (let j = Math.max(0, Math.floor(y0)); j <= Math.min(h - 1, Math.ceil(y1) - 1); j++) {
      const cyv = Math.min(j + 1, y1) - Math.max(j, y0);
      for (let i = Math.max(0, Math.floor(x0)); i <= Math.min(w - 1, Math.ceil(x1) - 1); i++) {
        const cxv = Math.min(i + 1, x1) - Math.max(i, x0);
        if (cxv > 0 && cyv > 0) cov[j * w + i] += cxv * cyv;
      }
    }
  }
  const data = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let v = paper - (paper - ink) * Math.min(1, cov[i]);
    if (covS !== cov) v = v - (v - speckleInk) * Math.min(1, covS[i]);
    data[i] = Math.max(0, Math.min(255, Math.round(v)));
  }
  return { data, w, h, pxPerMM };
}

export function rasterizeBoard(board, pxPerMM, opts) {
  return rasterizePrims(boardPrimitives({ ...board, markers: board.markers }), board.paperW, board.paperH, pxPerMM, opts);
}

// Mapa id -> esquinas 3D (mm) de los marcadores del tapete.
export function boardCornerMap(board) {
  const m = new Map();
  for (const mk of board.markers) m.set(mk.id, mk.corners);
  return m;
}
