// Detección de marcadores ArUco (diccionario 5x5) con refinamiento subpíxel por ajuste de bordes.
// Implementación propia, sin OpenCV: umbral adaptativo -> componentes conexas -> contorno ->
// aproximación poligonal -> decodificación de bits -> refinamiento de esquinas por rectas de borde.
import { DICT_5X5_250 } from './aruco-dict.js';
import { integral, downsampleBox, bilinear } from './image.js';
import { undistortPixel, distortPixel } from './camera.js';

export const DETECT_DEFAULTS = {
  dict: DICT_5X5_250,
  maxCorrection: 1,        // bits corregibles (distancia mínima del diccionario = 6)
  maxDetectSide: 2600,     // lado máximo de la imagen usada para buscar candidatos
  thresholdC: 7,
  minSidePx: 9,            // lado mínimo del marcador a escala de detección
  polyAccuracy: 0.045,
  minCornerDistRate: 0.08,
  borderMarginPx: 2,
  cellMargin: 0.18,
  maxBorderErrors: 4,
  minContrast: 20,
  refine: true,
  idMin: 0,
  idMax: 1e9,
};

const NX = [-1, -1, 0, 1, 1, 1, 0, -1];
const NY = [0, -1, -1, -1, 0, 1, 1, 1];
const DIR_OF = new Int8Array(9);
for (let i = 0; i < 8; i++) DIR_OF[(NY[i] + 1) * 3 + (NX[i] + 1)] = i;

function popcount(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

// Etiquetado de componentes oscuras (8-conectividad) usando corridas y unión-búsqueda.
function labelDark(gray, w, h, I, win, C) {
  const W = w + 1, r = win >> 1;
  const runsY = [], runsX0 = [], runsX1 = [];
  const rowStart = new Int32Array(h + 1);
  for (let y = 0; y < h; y++) {
    rowStart[y] = runsY.length;
    const y0 = Math.max(0, y - r), y1 = Math.min(h - 1, y + r);
    let inRun = false, x0 = 0;
    for (let x = 0; x < w; x++) {
      const xa = Math.max(0, x - r), xb = Math.min(w - 1, x + r);
      const area = (xb - xa + 1) * (y1 - y0 + 1);
      const sum = I[(y1 + 1) * W + xb + 1] - I[y0 * W + xb + 1] - I[(y1 + 1) * W + xa] + I[y0 * W + xa];
      const dark = gray[y * w + x] * area < sum - C * area;
      if (dark && !inRun) { inRun = true; x0 = x; }
      else if (!dark && inRun) { inRun = false; runsY.push(y); runsX0.push(x0); runsX1.push(x - 1); }
    }
    if (inRun) { runsY.push(y); runsX0.push(x0); runsX1.push(w - 1); }
  }
  rowStart[h] = runsY.length;
  const n = runsY.length;
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let y = 1; y < h; y++) {
    let p = rowStart[y - 1];
    const pe = rowStart[y];
    for (let i = rowStart[y]; i < rowStart[y + 1]; i++) {
      const a0 = runsX0[i] - 1, a1 = runsX1[i] + 1;
      while (p < pe && runsX1[p] < a0) p++;
      for (let q = p; q < pe && runsX0[q] <= a1; q++) {
        const ra = find(i), rb = find(q);
        if (ra !== rb) { if (ra < rb) parent[rb] = ra; else parent[ra] = rb; }
      }
    }
  }
  return { n, runsY, runsX0, runsX1, find };
}

// Contorno exterior por seguimiento de vecinos de Moore.
function traceContour(label, w, h, lab, sx, sy, maxIt) {
  const xs = [sx], ys = [sy];
  let px = sx, py = sy, dir = 0;
  let secondX = -1, secondY = -1;
  for (let it = 0; it < maxIt; it++) {
    let found = -1;
    for (let j = 1; j <= 8; j++) {
      const k = (dir + j) & 7;
      const nx = px + NX[k], ny = py + NY[k];
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && label[ny * w + nx] === lab) { found = k; break; }
    }
    if (found < 0) break;
    const kb = (found + 7) & 7;
    const bx = px + NX[kb], by = py + NY[kb];
    const cx = px + NX[found], cy = py + NY[found];
    if (px === sx && py === sy && it > 0 && cx === secondX && cy === secondY) break;
    if (it === 0) { secondX = cx; secondY = cy; }
    px = cx; py = cy;
    dir = DIR_OF[(by - py + 1) * 3 + (bx - px + 1)];
    if (px === sx && py === sy) continue;
    xs.push(px); ys.push(py);
  }
  return { xs, ys };
}

function approxPolyClosed(xs0, ys0, eps) {
  const n = xs0.length;
  if (n < 4) return null;
  // empezar en el punto más alejado del centroide (vértice del casco convexo => esquina)
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { mx += xs0[i]; my += ys0[i]; }
  mx /= n; my /= n;
  let start = 0, dst = -1;
  for (let i = 0; i < n; i++) {
    const d = (xs0[i] - mx) ** 2 + (ys0[i] - my) ** 2;
    if (d > dst) { dst = d; start = i; }
  }
  const xs = new Float64Array(n), ys = new Float64Array(n);
  for (let i = 0; i < n; i++) { xs[i] = xs0[(i + start) % n]; ys[i] = ys0[(i + start) % n]; }
  let far = 0, dmax = -1;
  for (let i = 1; i < n; i++) {
    const d = (xs[i] - xs[0]) ** 2 + (ys[i] - ys[0]) ** 2;
    if (d > dmax) { dmax = d; far = i; }
  }
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[far] = 1;
  const eps2 = eps * eps;
  const stack = [[0, far], [far, n]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const ax = xs[a], ay = ys[a], bx = xs[b % n], by = ys[b % n];
    const dx = bx - ax, dy = by - ay;
    const L2 = dx * dx + dy * dy || 1;
    let best = -1, bd = -1;
    for (let i = a + 1; i < b; i++) {
      const cr = (xs[i] - ax) * dy - (ys[i] - ay) * dx;
      const d = cr * cr / L2;
      if (d > bd) { bd = d; best = i; }
    }
    if (bd > eps2) { keep[best] = 1; stack.push([a, best], [best, b]); }
  }
  let out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push([xs[i], ys[i], (i + start) % n]);
  // quitar vértices casi colineales con sus vecinos
  let changed = true;
  while (changed && out.length > 4) {
    changed = false;
    let bestK = -1, bestD = Infinity;
    for (let k = 0; k < out.length; k++) {
      const a = out[(k + out.length - 1) % out.length], b = out[k], c = out[(k + 1) % out.length];
      const dx = c[0] - a[0], dy = c[1] - a[1];
      const d = Math.abs((b[0] - a[0]) * dy - (b[1] - a[1]) * dx) / (Math.hypot(dx, dy) || 1);
      if (d < bestD) { bestD = d; bestK = k; }
    }
    if (bestD < eps) { out.splice(bestK, 1); changed = true; }
  }
  return out;
}

// Esquinas iniciales: rectas ajustadas al tramo central de cada lado del contorno, intersecadas.
// Corrige el truncamiento de esquinas agudas (vistas oblicuas + desenfoque).
function cornersFromContour(xs, ys, poly) {
  const n = xs.length;
  const lines = [];
  for (let k = 0; k < 4; k++) {
    const a = poly[k][2], b = poly[(k + 1) % 4][2];
    const len = (b - a + n) % n;
    if (len < 4) return null;
    const pts = [], wts = [];
    for (let j = Math.floor(len * 0.18); j <= Math.ceil(len * 0.82); j++) {
      const i = (a + j) % n;
      pts.push([xs[i], ys[i]]); wts.push(1);
    }
    if (pts.length < 3) return null;
    lines.push(fitLine(pts, wts));
  }
  const out = [];
  for (let k = 0; k < 4; k++) {
    const p = intersect(lines[(k + 3) % 4], lines[k]);
    if (!p) return null;
    out.push(p);
  }
  return out;
}

export function homography4(src, dst) {
  // Resuelve H (h33 = 1) que lleva src[i] -> dst[i] para 4 correspondencias.
  const A = new Float64Array(64), b = new Float64Array(8);
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.set([x, y, 1, 0, 0, 0, -u * x, -u * y], (2 * i) * 8); b[2 * i] = u;
    A.set([0, 0, 0, x, y, 1, -v * x, -v * y], (2 * i + 1) * 8); b[2 * i + 1] = v;
  }
  // eliminación gaussiana
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r * n + c]) > Math.abs(A[p * n + c])) p = r;
    if (Math.abs(A[p * n + c]) < 1e-12) return null;
    if (p !== c) {
      for (let k = 0; k < n; k++) { const t = A[c * n + k]; A[c * n + k] = A[p * n + k]; A[p * n + k] = t; }
      const t = b[c]; b[c] = b[p]; b[p] = t;
    }
    for (let r = c + 1; r < n; r++) {
      const f = A[r * n + c] / A[c * n + c];
      for (let k = c; k < n; k++) A[r * n + k] -= f * A[c * n + k];
      b[r] -= f * b[c];
    }
  }
  const hh = new Float64Array(8);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r * n + k] * hh[k];
    hh[r] = s / A[r * n + r];
  }
  return [hh[0], hh[1], hh[2], hh[3], hh[4], hh[5], hh[6], hh[7], 1];
}
export function applyH(H, x, y) {
  const w = H[6] * x + H[7] * y + H[8];
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

function otsu(vals) {
  const s = Array.from(vals).sort((a, b) => a - b);
  const n = s.length;
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + s[i];
  let best = -1, thr = (s[0] + s[n - 1]) / 2;
  for (let i = 1; i < n; i++) {
    const w0 = i / n, w1 = 1 - w0;
    const m0 = pre[i] / i, m1 = (pre[n] - pre[i]) / (n - i);
    const v = w0 * w1 * (m0 - m1) * (m0 - m1);
    if (v > best) { best = v; thr = (s[i - 1] + s[i]) / 2; }
  }
  return thr;
}

// Decodifica un cuadrilátero candidato. Devuelve {id, rot, dist} o null.
function decodeQuad(gray, w, h, quad, o) {
  const nb = o.dict.bits, N = nb + 2;
  const H = homography4([[0, 0], [N, 0], [N, N], [0, N]], quad);
  if (!H) return null;
  const k = 3, m = o.cellMargin;
  const vals = new Float64Array(N * N);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let acc = 0;
      for (let j = 0; j < k; j++) {
        for (let i = 0; i < k; i++) {
          const cx = c + m + (i + 0.5) / k * (1 - 2 * m);
          const cy = r + m + (j + 0.5) / k * (1 - 2 * m);
          const [x, y] = applyH(H, cx, cy);
          acc += bilinear(gray, w, h, x, y);
        }
      }
      vals[r * N + c] = acc / (k * k);
    }
  }
  const thr = otsu(vals);
  let borderErr = 0, sumB = 0, nB = 0, sumW = 0, nW = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = vals[r * N + c];
    if (v > thr) { sumW += v; nW++; } else { sumB += v; nB++; }
    if (r === 0 || c === 0 || r === N - 1 || c === N - 1) if (v > thr) borderErr++;
  }
  if (borderErr > o.maxBorderErrors || nW === 0 || nB === 0) return null;
  const contrast = sumW / nW - sumB / nB;
  if (contrast < o.minContrast) return null;
  // bits interiores
  const bits = new Uint8Array(nb * nb);
  for (let r = 0; r < nb; r++) for (let c = 0; c < nb; c++) bits[r * nb + c] = vals[(r + 1) * N + c + 1] > thr ? 1 : 0;
  // códigos observados para las 4 rotaciones: S_{k+1}[r][c] = S_k[c][nb-1-r]
  const rotCodes = new Uint32Array(4);
  let cur = bits;
  for (let rot = 0; rot < 4; rot++) {
    let code = 0;
    for (let i = 0; i < nb * nb; i++) code = (code << 1) | cur[i];
    rotCodes[rot] = code >>> 0;
    const nxt = new Uint8Array(nb * nb);
    for (let r = 0; r < nb; r++) for (let c = 0; c < nb; c++) nxt[r * nb + c] = cur[c * nb + (nb - 1 - r)];
    cur = nxt;
  }
  const codes = o.dict.codes;
  let bestId = -1, bestRot = 0, bestD = 99, second = 99;
  for (let id = 0; id < codes.length; id++) {
    let dmin = 99, rmin = 0;
    for (let rot = 0; rot < 4; rot++) {
      const d = popcount((codes[id] ^ rotCodes[rot]) >>> 0);
      if (d < dmin) { dmin = d; rmin = rot; }
    }
    if (dmin < bestD) { second = bestD; bestD = dmin; bestId = id; bestRot = rmin; }
    else if (dmin < second) second = dmin;
  }
  if (bestD > o.maxCorrection || second <= bestD) return null;
  return { id: bestId, rot: bestRot, dist: bestD, contrast };
}

function quadOK(q, w, h, o) {
  // convexidad y orientación horaria (y hacia abajo => producto cruz positivo)
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (cr === 0) return false;
    const s = Math.sign(cr);
    if (sign === 0) sign = s; else if (s !== sign) return false;
  }
  if (sign < 0) { const t = q[1]; q[1] = q[3]; q[3] = t; }
  let per = 0, minSide = Infinity;
  for (let i = 0; i < 4; i++) {
    const d = Math.hypot(q[(i + 1) % 4][0] - q[i][0], q[(i + 1) % 4][1] - q[i][1]);
    per += d; minSide = Math.min(minSide, d);
  }
  if (minSide < o.minSidePx || minSide < o.minCornerDistRate * per) return false;
  for (const [x, y] of q) {
    if (x < o.borderMarginPx || y < o.borderMarginPx || x > w - 1 - o.borderMarginPx || y > h - 1 - o.borderMarginPx) return false;
  }
  return per;
}

// Búsqueda de candidatos en una imagen (posiblemente reducida).
function findCandidates(gray, w, h, o) {
  const I = integral(gray, w, h);
  const base = Math.max(7, Math.round(Math.max(w, h) * 0.006) | 1);
  const wins = [base, base * 3 + 2, base * 8 + 1].map(v => v | 1);
  const label = new Int32Array(w * h);
  const out = [];
  for (const win of wins) {
    const L = labelDark(gray, w, h, I, win, o.thresholdC);
    label.fill(-1);
    const n = L.n;
    const minX = new Int32Array(n).fill(1 << 30), maxX = new Int32Array(n).fill(-1);
    const minY = new Int32Array(n).fill(1 << 30), maxY = new Int32Array(n).fill(-1);
    const firstRun = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      const r = L.find(i);
      const y = L.runsY[i];
      for (let x = L.runsX0[i]; x <= L.runsX1[i]; x++) label[y * w + x] = r;
      if (L.runsX0[i] < minX[r]) minX[r] = L.runsX0[i];
      if (L.runsX1[i] > maxX[r]) maxX[r] = L.runsX1[i];
      if (y < minY[r]) minY[r] = y;
      if (y > maxY[r]) maxY[r] = y;
      if (firstRun[r] < 0) firstRun[r] = i;
    }
    for (let r = 0; r < n; r++) {
      if (firstRun[r] < 0 || L.find(r) !== r) continue;
      const bw = maxX[r] - minX[r] + 1, bh = maxY[r] - minY[r] + 1;
      if (bw < o.minSidePx || bh < o.minSidePx) continue;
      if (bw > 0.95 * w || bh > 0.95 * h) continue;
      const fr = firstRun[r];
      const sx = L.runsX0[fr], sy = L.runsY[fr];
      const ct = traceContour(label, w, h, r, sx, sy, 8 * (bw + bh) + 16);
      const nPts = ct.xs.length;
      if (nPts < 4 * o.minSidePx * 0.7) continue;
      const poly = approxPolyClosed(ct.xs, ct.ys, Math.max(1.2, o.polyAccuracy * nPts));
      if (!poly || poly.length !== 4) continue;
      let quad = poly.map(p => [p[0], p[1]]);
      const fromLines = cornersFromContour(ct.xs, ct.ys, poly);
      if (fromLines) {
        let ok = true;
        for (let k = 0; k < 4; k++) {
          const side = Math.min(Math.hypot(quad[(k + 1) % 4][0] - quad[k][0], quad[(k + 1) % 4][1] - quad[k][1]),
            Math.hypot(quad[(k + 3) % 4][0] - quad[k][0], quad[(k + 3) % 4][1] - quad[k][1]));
          if (Math.hypot(fromLines[k][0] - quad[k][0], fromLines[k][1] - quad[k][1]) > 0.3 * side) ok = false;
        }
        if (ok) quad = fromLines;
      }
      const per = quadOK(quad, w, h, o);
      if (!per) continue;
      out.push({ quad, per });
    }
  }
  return out;
}

export function detectMarkers(grayFull, wFull, hFull, opts = {}) {
  const o = { ...DETECT_DEFAULTS, ...opts };
  let s = 1;
  while (Math.max(wFull, hFull) / s > o.maxDetectSide) s++;
  const det = downsampleBox(grayFull, wFull, hFull, s);
  const cands = findCandidates(det.gray, det.w, det.h, o);
  const found = [];
  for (const c of cands) {
    const dec = decodeQuad(det.gray, det.w, det.h, c.quad, o);
    if (!dec) continue;
    if (dec.id < o.idMin || dec.id > o.idMax) continue;
    const q = [];
    for (let i = 0; i < 4; i++) {
      const p = c.quad[(i + dec.rot) % 4];
      q.push([p[0] * s + (s - 1) / 2, p[1] * s + (s - 1) / 2]);
    }
    found.push({ id: dec.id, corners: q, hamming: dec.dist, contrast: dec.contrast, perimeter: c.per * s });
  }
  // eliminar duplicados (mismo id y misma posición)
  found.sort((a, b) => a.hamming - b.hamming || b.perimeter - a.perimeter);
  const kept = [];
  for (const m of found) {
    const cx = (m.corners[0][0] + m.corners[2][0]) / 2, cy = (m.corners[0][1] + m.corners[2][1]) / 2;
    let dup = false;
    for (const k of kept) {
      const kx = (k.corners[0][0] + k.corners[2][0]) / 2, ky = (k.corners[0][1] + k.corners[2][1]) / 2;
      if (Math.hypot(cx - kx, cy - ky) < 0.35 * k.perimeter / 4) { dup = true; break; }
    }
    if (!dup) kept.push(m);
  }
  // mismo id en dos lugares distintos: conservar solo el de mejor decodificación
  const byId = new Map();
  for (const m of kept) {
    const prev = byId.get(m.id);
    if (!prev) byId.set(m.id, m);
    else if (m.hamming < prev.hamming || (m.hamming === prev.hamming && m.perimeter > prev.perimeter)) byId.set(m.id, m);
  }
  const result = [...byId.values()];
  if (o.refine) {
    for (const m of result) {
      const r = refineCornersEdges(grayFull, wFull, hFull, m.corners, { K: o.K, cells: o.dict.bits + 2 });
      if (r) { m.corners = r.corners; m.edgeRms = r.rms; m.refined = true; } else m.refined = false;
    }
  }
  result.sort((a, b) => a.id - b.id);
  return result;
}

// Ajuste de recta por mínimos cuadrados totales: devuelve {nx, ny, c} con nx*x + ny*y + c = 0.
function fitLine(pts, wts) {
  let sw = 0, mx = 0, my = 0;
  for (let i = 0; i < pts.length; i++) { const w = wts[i]; sw += w; mx += w * pts[i][0]; my += w * pts[i][1]; }
  mx /= sw; my /= sw;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < pts.length; i++) {
    const w = wts[i], dx = pts[i][0] - mx, dy = pts[i][1] - my;
    sxx += w * dx * dx; sxy += w * dx * dy; syy += w * dy * dy;
  }
  // normal = autovector del menor autovalor de la covarianza (fórmula estable en ambos ejes)
  const lmin = (sxx + syy) / 2 - Math.sqrt((sxx - syy) * (sxx - syy) / 4 + sxy * sxy);
  const ax = sxy, ay = lmin - sxx, bx = lmin - syy, by = sxy;
  let nx, ny;
  if (ax * ax + ay * ay >= bx * bx + by * by) { nx = ax; ny = ay; } else { nx = bx; ny = by; }
  if (nx * nx + ny * ny < 1e-30) { if (sxx < syy) { nx = 1; ny = 0; } else { nx = 0; ny = 1; } }
  const nn = Math.hypot(nx, ny);
  nx /= nn; ny /= nn;
  return { nx, ny, c: -(nx * mx + ny * my) };
}
function intersect(l1, l2) {
  const det = l1.nx * l2.ny - l1.ny * l2.nx;
  if (Math.abs(det) < 1e-12) return null;
  return [(l1.ny * l2.c - l2.ny * l1.c) / det, (l2.nx * l1.c - l1.nx * l2.c) / det];
}

// Refinamiento de esquinas: localiza el borde exterior negro->blanco a lo largo de cada lado con
// precisión subpíxel, ajusta rectas (opcionalmente en coordenadas sin distorsión) y las interseca.
export function refineCornersEdges(gray, w, h, corners, opts = {}) {
  const K = opts.K || null;
  const cells = opts.cells || 7;
  let cur = corners.map(c => [c[0], c[1]]);
  let rmsAll = 0;
  const quadArea = (q) => {
    let a = 0;
    for (let k = 0; k < 4; k++) a += q[k][0] * q[(k + 1) % 4][1] - q[(k + 1) % 4][0] * q[k][1];
    return Math.abs(a) / 2;
  };
  const area0 = quadArea(cur);
  const maxMove = Math.max(2.5, 0.8 * Math.sqrt(area0) / cells);
  const radFactor = [0.45, 0.25, 0.15], radMax = [8, 4, 2.5], radMin = [1.5, 1.2, 1.0];
  for (let pass = 0; pass < 3; pass++) {
    const lines = [];
    let resid = [];
    const area = quadArea(cur);
    for (let k = 0; k < 4; k++) {
      const A = cur[k], B = cur[(k + 1) % 4];
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      if (len < 6) return null;
      const dx = (B[0] - A[0]) / len, dy = (B[1] - A[1]) / len;
      const nx = dy, ny = -dx; // normal hacia afuera (orden horario, y hacia abajo)
      const cellPerp = area / (cells * len); // grosor de una celda perpendicular a este lado
      const rad = Math.min(radMax[pass], Math.max(radMin[pass], radFactor[pass] * cellPerp));
      const step = 0.25;
      const ns = Math.round(rad / step);
      const nSamples = Math.max(8, Math.floor(len * 0.72));
      const pts = [], wts = [];
      const prof = new Float64Array(2 * ns + 3);
      for (let i = 0; i < nSamples; i++) {
        const t = 0.14 + 0.72 * (i + 0.5) / nSamples;
        const px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t;
        for (let j = -ns - 1; j <= ns + 1; j++) {
          const s = j * step;
          // promedio de 3 líneas paralelas para reducir ruido
          let v = 0;
          for (let q = -1; q <= 1; q++) v += bilinear(gray, w, h, px + nx * s + dx * q * 0.6, py + ny * s + dy * q * 0.6);
          prof[j + ns + 1] = v / 3;
        }
        let bi = -1, bg = 0;
        for (let j = 1; j < prof.length - 1; j++) {
          const g = prof[j + 1] - prof[j - 1];
          if (g > bg) { bg = g; bi = j; }
        }
        if (bi < 2 || bi > prof.length - 3 || bg < 3) continue;
        // centroide del gradiente en la región contigua alrededor del pico (insesgado para
        // imágenes muestreadas por área, a diferencia del máximo con interpolación bilineal)
        const thr = 0.15 * bg;
        let lo = bi, hi = bi;
        while (lo > 1 && prof[lo] - prof[lo - 2] > thr) lo--;
        while (hi < prof.length - 2 && prof[hi + 2] - prof[hi] > thr) hi++;
        let sw = 0, swx = 0;
        for (let j = lo; j <= hi; j++) {
          const g = prof[j + 1] - prof[j - 1] - thr;
          if (g > 0) { sw += g; swx += g * j; }
        }
        if (sw <= 0) continue;
        const s = (swx / sw - ns - 1) * step;
        let ex = px + nx * s, ey = py + ny * s;
        if (K) { const u = undistortPixel(K, ex, ey); ex = u[0]; ey = u[1]; }
        pts.push([ex, ey]); wts.push(bg);
      }
      if (pts.length < 5) return null;
      let line = fitLine(pts, wts);
      for (let it = 0; it < 2; it++) {
        const res = pts.map(p => Math.abs(line.nx * p[0] + line.ny * p[1] + line.c));
        const sorted = Array.from(res).sort((a, b) => a - b);
        const sig = Math.max(0.08, 1.4826 * sorted[sorted.length >> 1]);
        const P2 = [], W2 = [];
        for (let i = 0; i < pts.length; i++) if (res[i] < 3 * sig) { P2.push(pts[i]); W2.push(wts[i]); }
        if (P2.length < 5) break;
        line = fitLine(P2, W2);
        if (it === 1) resid = resid.concat(P2.map(p => line.nx * p[0] + line.ny * p[1] + line.c));
      }
      lines.push(line);
    }
    const next = [];
    for (let k = 0; k < 4; k++) {
      let p = intersect(lines[(k + 3) % 4], lines[k]);
      if (!p) return null;
      if (K) p = distortPixel(K, p[0], p[1]);
      next.push(p);
    }
    // validación: no alejarse demasiado de la estimación inicial
    for (let k = 0; k < 4; k++) {
      if (Math.hypot(next[k][0] - corners[k][0], next[k][1] - corners[k][1]) > maxMove) return null;
    }
    cur = next;
    let s2 = 0; for (const r of resid) s2 += r * r;
    rmsAll = resid.length ? Math.sqrt(s2 / resid.length) : 0;
  }
  return { corners: cur, rms: rmsAll };
}

// Acceso a funciones internas (pruebas y diagnóstico).
export const _internal = { findCandidates, decodeQuad, labelDark, traceContour, approxPolyClosed, cornersFromContour };
