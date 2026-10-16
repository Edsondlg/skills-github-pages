// Vectorizador de imágenes ráster: plano escaneado o foto (pieza oscura sobre papel claro)
// → contornos cerrados de líneas, arcos y círculos.
// Coordenadas de salida en píxeles con Y hacia arriba: x = columna + 0.5, y = alto − (fila + 0.5).
// Sin DOM: corre igual en Node y en el navegador.

const TAU = 2 * Math.PI;
const MIN_SWEEP = (10 * Math.PI) / 180; // arco mínimo aceptado
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function traceImage(img, opts = {}) {
  const t0 = now();
  const {
    threshold = 'auto',
    invert = false,
    minArea = 20,
    simplifyTol = 0.6,
    fitCircles = true,
    fitArcs = true,
  } = opts;
  const W = img?.width | 0, H = img?.height | 0, data = img?.data;
  if (!(W > 0 && H > 0) || !data || data.length < W * H * 4) throw new Error('Imagen RGBA inválida (ancho, alto o datos).');
  if (threshold !== 'auto' && !(Number.isFinite(+threshold) && +threshold >= 0 && +threshold <= 255))
    throw new Error('Umbral inválido: use "auto" o un valor entre 0 y 255.');

  const GW = W + 2, GH = H + 2;
  const field = new Float32Array(GW * GH);
  const hist = new Float64Array(256);
  luminanceInto(data, W, H, field, hist);
  const thr = threshold === 'auto' ? otsu(hist) : +threshold;
  const level = thr + 0.5;
  // Campo con material donde f < level; con invert se refleja respecto al nivel.
  if (invert) for (let j = 1; j <= H; j++) for (let i = 1, k = j * GW + 1; i <= W; i++, k++) field[k] = 2 * level - field[k];
  const pad = Math.max(level + 1, invert ? 2 * level : 255); // fondo: cierra todo contorno
  for (let i = 0; i < GW; i++) field[i] = field[(GH - 1) * GW + i] = pad;
  for (let j = 0; j < GH; j++) field[j * GW] = field[j * GW + GW - 1] = pad;

  const contours = marchingSquares(field, GW, GH, level, H).filter((c) => Math.abs(c.area) >= minArea);
  const segments = [];
  const stats = { contours: 0, circles: 0, arcs: 0, lines: 0, ms: 0 };
  for (const c of contours) {
    const segs = fitContour(c, { tol: simplifyTol, fitCircles, fitArcs });
    for (const s of segs) {
      segments.push(s);
      stats[s.type === 'line' ? 'lines' : s.type === 'arc' ? 'arcs' : 'circles']++;
    }
    stats.contours++;
  }
  stats.ms = now() - t0;
  return { segments, stats, threshold: thr };
}

// ---------- Luminancia y umbral ----------

// Luma Rec. 601 con alfa compuesto sobre blanco, al interior del campo acolchado; histograma de paso.
function luminanceInto(d, W, H, field, hist) {
  const GW = W + 2;
  for (let j = 0, p = 0; j < H; j++) {
    let k = (j + 1) * GW + 1;
    for (let i = 0; i < W; i++, p += 4, k++) {
      const a = d[p + 3] / 255;
      const L = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) * a + 255 * (1 - a);
      field[k] = L;
      hist[L < 0 ? 0 : L > 255 ? 255 : Math.round(L)]++;
    }
  }
}

// Otsu: material = L ≤ t. En una meseta de empates se toma el centro (dos grises planos → punto medio).
// Luego se lleva el nivel al punto medio de las medias de clase (iteración isodata): con bordes
// antialiasados, cobertura 50 % ⇒ borde sin sesgo subpíxel.
export function otsu(hist) {
  let N = 0, S = 0;
  for (let t = 0; t < 256; t++) (N += hist[t]), (S += t * hist[t]);
  const v = new Float64Array(256);
  let w0 = 0, s0 = 0, best = 0;
  for (let t = 0; t < 255; t++) {
    w0 += hist[t];
    s0 += t * hist[t];
    const w1 = N - w0;
    if (w0 > 0 && w1 > 0) {
      const d = s0 / w0 - (S - s0) / w1;
      v[t] = w0 * w1 * d * d;
      if (v[t] > best) best = v[t];
    }
  }
  if (!(best > 0)) return 127.5;
  const eps = best * 1e-9;
  let lo = 0;
  while (v[lo] < best - eps) lo++;
  let hi = lo;
  while (hi + 1 < 255 && v[hi + 1] >= best - eps) hi++;
  let thr = (lo + hi) / 2;
  for (let it = 0; it < 20; it++) {
    const t = Math.floor(thr);
    let a = 0, sa = 0;
    for (let q = 0; q <= t; q++) (a += hist[q]), (sa += q * hist[q]);
    if (!(a > 0 && a < N)) break;
    const nt = (sa / a + (S - sa) / (N - a)) / 2 - 0.5;
    if (Math.abs(nt - thr) < 1e-9) break;
    thr = nt;
  }
  return thr;
}

// ---------- Marching squares ----------

// Esquinas en sentido horario visual: 0 = arriba-izq, 1 = arriba-der, 2 = abajo-der, 3 = abajo-izq;
// arista k une esquina k con k+1 (0 arriba, 1 derecha, 2 abajo, 3 izquierda).
// Cada tramo va de una arista fuera→dentro a una dentro→fuera: material a la izquierda
// (exteriores antihorarios, agujeros horarios con Y hacia arriba).
const CASES = (() => {
  const t = [];
  for (let code = 0; code < 16; code++) {
    const v = [(code >> 3) & 1, (code >> 2) & 1, (code >> 1) & 1, code & 1];
    const starts = [], ends = [];
    for (let k = 0; k < 4; k++) {
      if (!v[k] && v[(k + 1) & 3]) starts.push(k);
      if (v[k] && !v[(k + 1) & 3]) ends.push(k);
    }
    const nextEnd = (s, dir) => {
      for (let q = 1; q < 4; q++) {
        const e = (s + dir * q + 4) & 3;
        if (ends.includes(e)) return e;
      }
      return -1;
    };
    // [aislado (silla separada), conectado (silla unida por el centro)]
    t.push([starts.map((s) => [s, nextEnd(s, 1)]), starts.map((s) => [s, nextEnd(s, -1)])]);
  }
  return t;
})();

function marchingSquares(f, GW, GH, level, H) {
  const N = GW * GH;
  const inside = new Uint8Array(N);
  for (let k = 0; k < N; k++) inside[k] = f[k] < level ? 1 : 0;
  const NHZ = (GW - 1) * GH, NE = NHZ + GW * (GH - 1);
  const next = new Int32Array(NE).fill(-1);
  const eid = new Int32Array(4);
  for (let j = 0; j < GH - 1; j++) {
    const r0 = j * GW, r1 = r0 + GW;
    for (let i = 0; i < GW - 1; i++) {
      const code = (inside[r0 + i] << 3) | (inside[r0 + i + 1] << 2) | (inside[r1 + i + 1] << 1) | inside[r1 + i];
      if (code === 0 || code === 15) continue;
      eid[0] = j * (GW - 1) + i;
      eid[1] = NHZ + j * GW + i + 1;
      eid[2] = (j + 1) * (GW - 1) + i;
      eid[3] = NHZ + j * GW + i;
      let alt = 0;
      if (code === 5 || code === 10) {
        const c = (f[r0 + i] + f[r0 + i + 1] + f[r1 + i + 1] + f[r1 + i]) / 4;
        alt = c < level ? 1 : 0;
      }
      for (const [s, e] of CASES[code][alt]) next[eid[s]] = eid[e];
    }
  }
  const contours = [];
  for (let e0 = 0; e0 < NE; e0++) {
    if (next[e0] < 0) continue;
    const xs = [], ys = [];
    let e = e0;
    do {
      let i, j, gx, gy;
      if (e < NHZ) {
        j = Math.floor(e / (GW - 1));
        i = e - j * (GW - 1);
        const a = f[j * GW + i], b = f[j * GW + i + 1];
        gx = i + (level - a) / (b - a);
        gy = j;
      } else {
        const q = e - NHZ;
        j = Math.floor(q / GW);
        i = q - j * GW;
        const a = f[j * GW + i], b = f[(j + 1) * GW + i];
        gx = i;
        gy = j + (level - a) / (b - a);
      }
      xs.push(gx - 0.5);
      ys.push(H - gy + 0.5);
      const nx = next[e];
      next[e] = -1;
      e = nx;
    } while (e !== e0 && e >= 0);
    let A = 0;
    for (let k = 0, m = xs.length, p = m - 1; k < m; p = k++) A += xs[p] * ys[k] - xs[k] * ys[p];
    contours.push({ xs, ys, area: A / 2 });
  }
  return contours;
}

// ---------- Ajustes ----------

// Recta por mínimos cuadrados totales sobre los índices [s, e].
function lineFit(X, Y, s, e) {
  const m = e - s + 1;
  let mx = 0, my = 0;
  for (let i = s; i <= e; i++) (mx += X[i]), (my += Y[i]);
  mx /= m;
  my /= m;
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = s; i <= e; i++) {
    const u = X[i] - mx, v = Y[i] - my;
    sxx += u * u;
    syy += v * v;
    sxy += u * v;
  }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  let dx = Math.cos(th), dy = Math.sin(th);
  if (dx * (X[e] - X[s]) + dy * (Y[e] - Y[s]) < 0) (dx = -dx), (dy = -dy);
  return { type: 'line', px: mx, py: my, dx, dy };
}

// Círculo: Kåsa algebraico centrado y refinamiento Gauss–Newton sobre la distancia geométrica.
function circleFit(X, Y, s, e) {
  const m = e - s + 1;
  if (m < 4) return null;
  let mx = 0, my = 0;
  for (let i = s; i <= e; i++) (mx += X[i]), (my += Y[i]);
  mx /= m;
  my /= m;
  let suu = 0, svv = 0, suv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
  for (let i = s; i <= e; i++) {
    const u = X[i] - mx, v = Y[i] - my, uu = u * u, vv = v * v;
    suu += uu;
    svv += vv;
    suv += u * v;
    suuu += uu * u;
    svvv += vv * v;
    suvv += u * vv;
    svuu += v * uu;
  }
  const det = suu * svv - suv * suv;
  if (!(Math.abs(det) > 1e-12 * (suu + svv) * (suu + svv))) return null;
  const bu = 0.5 * (suuu + suvv), bv = 0.5 * (svvv + svuu);
  const uc = (bu * svv - bv * suv) / det, vc = (suu * bv - suv * bu) / det;
  let cx = mx + uc, cy = my + vc, r = Math.sqrt(uc * uc + vc * vc + (suu + svv) / m);
  for (let it = 0; it < 10; it++) {
    let a00 = 0, a01 = 0, a02 = 0, a11 = 0, a12 = 0, g0 = 0, g1 = 0, g2 = 0;
    for (let i = s; i <= e; i++) {
      const dx = X[i] - cx, dy = Y[i] - cy, d = Math.hypot(dx, dy);
      if (d < 1e-12) continue;
      const ux = dx / d, uy = dy / d, res = d - r;
      // J = [−ux, −uy, −1]
      a00 += ux * ux;
      a01 += ux * uy;
      a02 += ux;
      a11 += uy * uy;
      a12 += uy;
      g0 -= ux * res;
      g1 -= uy * res;
      g2 -= res;
    }
    const a22 = m;
    // Resolver (JᵀJ) δ = −Jᵀr (Cramer 3×3)
    const D = a00 * (a11 * a22 - a12 * a12) - a01 * (a01 * a22 - a12 * a02) + a02 * (a01 * a12 - a11 * a02);
    if (!(Math.abs(D) > 1e-300)) break;
    const r0 = -g0, r1 = -g1, r2 = -g2;
    const d0 = (r0 * (a11 * a22 - a12 * a12) - a01 * (r1 * a22 - a12 * r2) + a02 * (r1 * a12 - a11 * r2)) / D;
    const d1 = (a00 * (r1 * a22 - a12 * r2) - r0 * (a01 * a22 - a12 * a02) + a02 * (a01 * r2 - r1 * a02)) / D;
    const d2 = (a00 * (a11 * r2 - r1 * a12) - a01 * (a01 * r2 - r1 * a02) + r0 * (a01 * a12 - a11 * a02)) / D;
    cx += d0;
    cy += d1;
    r += d2;
    if (Math.abs(d0) + Math.abs(d1) + Math.abs(d2) < 1e-10 * (1 + r)) break;
  }
  if (!(r > 0 && r < 1e7 && Number.isFinite(cx) && Number.isFinite(cy))) return null;
  return { type: 'arc', cx, cy, r, ccw: true };
}

const primDist = (P, x, y) =>
  P.type === 'line' ? Math.abs((x - P.px) * P.dy - (y - P.py) * P.dx) : Math.abs(Math.hypot(x - P.cx, y - P.cy) - P.r);

function maxDev(P, X, Y, s, e) {
  let m = 0;
  for (let i = s; i <= e; i++) {
    const d = primDist(P, X[i], Y[i]);
    if (d > m) m = d;
  }
  return m;
}

// Ángulo recorrido (con signo) por los puntos [s, e] alrededor de (cx, cy).
function pointSweep(X, Y, s, e, cx, cy) {
  let a = Math.atan2(Y[s] - cy, X[s] - cx), tot = 0;
  for (let i = s + 1; i <= e; i++) {
    const b = Math.atan2(Y[i] - cy, X[i] - cx);
    let d = b - a;
    if (d > Math.PI) d -= TAU;
    else if (d < -Math.PI) d += TAU;
    tot += d;
    a = b;
  }
  return tot;
}

// Recorte de extremos para el ajuste final (las esquinas redondean unos píxeles).
const trimOf = (m) => (m >= 15 ? 3 : m >= 9 ? 1 : 0);

function fitRun(X, Y, s, e, type) {
  const t = trimOf(e - s + 1);
  if (type === 'arc') {
    const C = circleFit(X, Y, s + t, e - t);
    if (C) {
      const sw = pointSweep(X, Y, s, e, C.cx, C.cy);
      C.ccw = sw > 0;
      C.sweep = Math.abs(sw);
      return C;
    }
  }
  return lineFit(X, Y, s + t, e - t);
}

// ---------- Douglas–Peucker ----------

function dpOpen(X, Y, s, e, tol, out) {
  const stack = [[s, e]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const ax = X[a], ay = Y[a], vx = X[b] - ax, vy = Y[b] - ay, L = Math.hypot(vx, vy);
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = L > 1e-12 ? Math.abs((X[i] - ax) * vy - (Y[i] - ay) * vx) / L : Math.hypot(X[i] - ax, Y[i] - ay);
      if (d > best) (best = d), (bi = i);
    }
    if (best > tol) {
      out.push(bi);
      stack.push([a, bi], [bi, b]);
    }
  }
  return out;
}

// ---------- Contorno → primitivas ----------

function fitContour(c, { tol, fitCircles, fitArcs }) {
  const n = c.xs.length;
  const ccwLoop = c.area > 0;
  // Contorno repetido: índices "desenrollados" en [0, 4n] sin módulo.
  const X = new Float64Array(4 * n + 1), Y = new Float64Array(4 * n + 1);
  for (let i = 0; i <= 4 * n; i++) (X[i] = c.xs[i % n]), (Y[i] = c.ys[i % n]);

  // 1) Círculo completo
  if (fitCircles && n >= 8) {
    const C = circleFit(X, Y, 0, n - 1);
    if (C && maxDev(C, X, Y, 0, n - 1) < Math.max(1, 0.01 * C.r)) return [{ type: 'circle', c: [C.cx, C.cy], r: C.r, ccw: ccwLoop }];
  }

  // 2) Vértices DP del contorno cerrado, desde el punto más lejano a P0.
  let far = 0, fd = -1;
  for (let i = 1; i < n; i++) {
    const d = (X[i] - X[0]) ** 2 + (Y[i] - Y[0]) ** 2;
    if (d > fd) (fd = d), (far = i);
  }
  let V = [0, far];
  dpOpen(X, Y, 0, far, tol, V);
  dpOpen(X, Y, far, n, tol, V);
  V = [...new Set(V.map((v) => v % n))].sort((a, b) => a - b);
  if (V.length < 3) V = [0, Math.floor(n / 3), Math.floor((2 * n) / 3)];
  const polygon = () => polygonSegs(X, Y, V);
  if (n < 8) return polygon();

  // Empezar por la arista DP más larga (suele ser recta y arrancar en una transición).
  let j0 = 0, lmax = -1;
  for (let k = 0; k < V.length; k++) {
    const a = V[k], b = k + 1 < V.length ? V[k + 1] : V[0] + n;
    const L = Math.hypot(X[b] - X[a], Y[b] - Y[a]);
    if (L > lmax) (lmax = L), (j0 = k);
  }
  const U = [];
  for (let k = 0; k <= V.length; k++) {
    const idx = j0 + k;
    U.push(V[idx % V.length] + n + (idx >= V.length ? n : 0));
  }

  // 3) Tramos codiciosos: recta o arco, el que cubra más vértices con desviación ≤ tol.
  let runs = [];
  const M = U.length - 1;
  for (let k = 0; k < M; ) {
    let le = k + 1;
    while (le < M && maxDev(lineFit(X, Y, U[k], U[le + 1]), X, Y, U[k], U[le + 1]) <= tol) le++;
    let ae = -1;
    if (fitArcs) {
      let last = null;
      for (let e = k + 1; e <= M; e++) {
        const C = U[e] - U[k] >= 5 ? circleFit(X, Y, U[k], U[e]) : null;
        if (!C || maxDev(C, X, Y, U[k], U[e]) > tol) {
          if (U[e] - U[k] >= 5) break;
          continue;
        }
        last = C;
        ae = e;
      }
      if (last && Math.abs(pointSweep(X, Y, U[k], U[ae], last.cx, last.cy)) < MIN_SWEEP) ae = -1;
    }
    const arc = ae > le;
    const e = arc ? ae : le;
    runs.push({ s: U[k], e: U[e], type: arc ? 'arc' : 'line' });
    k = e;
  }

  // Unir el último con el primero si comparten tipo y el ajuste conjunto cabe en la tolerancia.
  if (runs.length > 2) {
    const a = runs[runs.length - 1], b = runs[0];
    if (a.type === b.type) {
      const P = fitRun(X, Y, a.s, b.e + n, a.type);
      if (P.type === a.type && maxDev(P, X, Y, a.s, b.e + n) <= tol && (P.type === 'line' || P.sweep < TAU - MIN_SWEEP)) {
        runs.pop();
        b.s = a.s - n;
      }
    }
  }
  normalize(runs, n);
  for (const r of runs) r.P = fitRun(X, Y, r.s, r.e, r.type);

  // 4) Refinar fronteras: cada punto al ajuste más cercano (mínimo de cuadrados), y reajustar.
  for (let it = 0; it < 3 && runs.length > 1; it++) {
    for (let k = 0; k < runs.length; k++) {
      refineBoundary(X, Y, runs, k, n);
      normalize(runs, n);
    }
    for (const r of runs) r.P = fitRun(X, Y, r.s, r.e, r.type);
  }

  // Tramos diminutos (redondeo de esquina del muestreo): fuera si sus vecinos se cortan cerca.
  for (let k = 0; k < runs.length && runs.length > 3; ) {
    const r = runs[k], K = runs.length;
    const chord = Math.hypot(X[r.e] - X[r.s], Y[r.e] - Y[r.s]);
    const prev = runs[(k - 1 + K) % K], nxt = runs[(k + 1) % K];
    const mid = Math.round((r.s + r.e) / 2), q = [X[mid], Y[mid]];
    if (chord < 1 + 2 * tol && joinCandidates(prev.P, nxt.P, tol).some((p) => dist(p, q) <= 3 + 2 * tol)) {
      prev.e = k === 0 ? mid + n : mid;
      nxt.s = k === K - 1 ? mid - n : mid;
      runs.splice(k, 1);
      normalize(runs, n);
      for (const z of [prev, nxt]) z.P = fitRun(X, Y, z.s, z.e, z.P.type);
    } else k++;
  }

  // 5) Uniones y validación; los tramos inválidos se degradan a polilínea.
  for (let it = 0; it < 12; it++) {
    if (runs.length < 2 || (runs.length < 3 && runs.every((r) => r.P.type === 'line'))) break;
    const res = buildSegments(X, Y, runs, n, tol);
    if (res.ok) return res.segs;
    const r = runs[res.bad];
    if (r.P.type === 'arc') {
      const sub = dpOpen(X, Y, r.s, r.e, tol, [r.s, r.e]).sort((a, b) => a - b);
      const repl = [];
      for (let q = 0; q + 1 < sub.length; q++) repl.push({ s: sub[q], e: sub[q + 1], type: 'line', P: fitRun(X, Y, sub[q], sub[q + 1], 'line') });
      runs.splice(res.bad, 1, ...repl);
    } else {
      // Recta invertida por las uniones vecinas: se reparte entre sus vecinos.
      const k = runs.length, mid = Math.round((r.s + r.e) / 2);
      const prev = runs[(res.bad - 1 + k) % k], nxt = runs[(res.bad + 1) % k];
      prev.e = res.bad === 0 ? mid + n : mid;
      nxt.s = res.bad === k - 1 ? mid - n : mid;
      runs.splice(res.bad, 1);
      normalize(runs, n);
      for (const q of [prev, nxt]) q.P = fitRun(X, Y, q.s, q.e, q.P.type);
    }
    normalize(runs, n);
  }
  return polygon();
}

// Mantener runs[0].s en [n, 2n) para que todo índice desenrollado quede dentro de [0, 4n].
function normalize(runs, n) {
  if (!runs.length) return;
  const sh = runs[0].s < n ? n : runs[0].s >= 2 * n ? -n : 0;
  if (sh) for (const r of runs) (r.s += sh), (r.e += sh);
}

function refineBoundary(X, Y, runs, k, n) {
  const K = runs.length;
  const B = runs[k];
  const A = runs[(k - 1 + K) % K];
  const off = k === 0 ? -n : 0; // A desenrollado antes de B
  const as = A.s + off, ae = A.e + off;
  if (ae !== B.s) return;
  const lo = as + Math.ceil((ae - as) / 2), hi = B.s + Math.floor((B.e - B.s) / 2);
  if (hi - lo < 2) return;
  const m = hi - lo + 1;
  const ca = new Float64Array(m + 1), cb = new Float64Array(m + 1);
  for (let i = 0; i < m; i++) {
    const x = X[lo + i], y = Y[lo + i];
    ca[i + 1] = ca[i] + primDist(A.P, x, y) ** 2;
    cb[i + 1] = cb[i] + primDist(B.P, x, y) ** 2;
  }
  let best = Infinity, bm = B.s;
  for (let q = Math.max(lo, as + 2); q <= Math.min(hi, B.e - 2); q++) {
    const i = q - lo;
    const cost = ca[i + 1] + (cb[m] - cb[i]);
    if (cost < best) (best = cost), (bm = q);
  }
  A.e = bm - off;
  B.s = bm;
}

// ---------- Uniones ----------

const lineProj = (L, x, y) => {
  const t = (x - L.px) * L.dx + (y - L.py) * L.dy;
  return [L.px + t * L.dx, L.py + t * L.dy];
};
const circProj = (C, x, y) => {
  const dx = x - C.cx, dy = y - C.cy, d = Math.hypot(dx, dy) || 1;
  return [C.cx + (C.r * dx) / d, C.cy + (C.r * dy) / d];
};
const proj = (P, q) => (P.type === 'line' ? lineProj(P, q[0], q[1]) : circProj(P, q[0], q[1]));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Candidatos de unión entre dos primitivas (puntos sobre ambas, o casi tangentes).
function joinCandidates(A, B, tol) {
  if (A.type === 'line' && B.type === 'line') {
    const den = A.dx * B.dy - A.dy * B.dx;
    if (Math.abs(den) < 1e-9) return [];
    const t = ((B.px - A.px) * B.dy - (B.py - A.py) * B.dx) / den;
    return [[A.px + t * A.dx, A.py + t * A.dy]];
  }
  if (A.type === 'arc' && B.type === 'arc') {
    const dx = B.cx - A.cx, dy = B.cy - A.cy, d = Math.hypot(dx, dy);
    if (d < 1e-12 || d > A.r + B.r || d < Math.abs(A.r - B.r)) return [];
    const a = (A.r * A.r - B.r * B.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, A.r * A.r - a * a));
    const mx = A.cx + (a * dx) / d, my = A.cy + (a * dy) / d;
    return [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]];
  }
  const L = A.type === 'line' ? A : B, C = A.type === 'line' ? B : A;
  const foot = lineProj(L, C.cx, C.cy);
  const dd = dist(foot, [C.cx, C.cy]);
  // Casi tangente: punto del círculo sobre la perpendicular desde el centro (unión G1).
  if (Math.abs(dd - C.r) <= tol && dd > 1e-12) return [circProj(C, foot[0], foot[1])];
  if (dd > C.r) return [];
  const h = Math.sqrt(C.r * C.r - dd * dd);
  return [[foot[0] + h * L.dx, foot[1] + h * L.dy], [foot[0] - h * L.dx, foot[1] - h * L.dy]];
}

const arcPoint = (P, a) => [P.cx + P.r * Math.cos(a), P.cy + P.r * Math.sin(a)];
const norm2pi = (a) => ((a % TAU) + TAU) % TAU;

function buildSegments(X, Y, runs, n, tol) {
  const K = runs.length;
  const joinMax = 3 + 2 * tol;
  // Unión en la frontera k (fin de runs[k−1], inicio de runs[k]).
  const joints = [];
  for (let k = 0; k < K; k++) {
    const A = runs[(k - 1 + K) % K].P, B = runs[k].P;
    const q = [X[runs[k].s], Y[runs[k].s]];
    let best = null, bd = Infinity;
    for (const p of joinCandidates(A, B, tol)) {
      const d = dist(p, q);
      if (d < bd) (bd = d), (best = p);
    }
    if (best && bd <= joinMax) joints.push({ endA: best, startB: best, bridge: false });
    else if (A.type === 'line' && B.type === 'line') {
      const pa = proj(A, q), pb = proj(B, q);
      const m = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      joints.push({ endA: m, startB: m, bridge: false });
    } else {
      // Línea corta de enlace entre las proyecciones.
      joints.push({ endA: proj(A, q), startB: proj(B, q), bridge: true });
    }
  }
  const segs = [];
  for (let k = 0; k < K; k++) {
    const r = runs[k], P = r.P, S = joints[k].startB, E = joints[(k + 1) % K].endA;
    if (P.type === 'line') {
      const vx = E[0] - S[0], vy = E[1] - S[1];
      if (!(vx * P.dx + vy * P.dy > 1e-6)) return { ok: false, bad: k };
      segs.push({ type: 'line', p0: S, p1: E });
    } else {
      const a0 = Math.atan2(S[1] - P.cy, S[0] - P.cx), a1 = Math.atan2(E[1] - P.cy, E[0] - P.cx);
      let sw = norm2pi(P.ccw ? a1 - a0 : a0 - a1);
      if (sw < 1e-12) sw = TAU;
      if (Math.abs(sw - P.sweep) > 0.5 * P.sweep + (2 * joinMax) / P.r || sw >= TAU - 1e-9) return { ok: false, bad: k };
      segs.push({ type: 'arc', c: [P.cx, P.cy], r: P.r, a0, a1, ccw: P.ccw });
    }
    const J = joints[(k + 1) % K];
    if (J.bridge && dist(J.endA, J.startB) > 1e-9) segs.push({ type: 'line', p0: J.endA, p1: J.startB, bridge: true });
  }
  // Encadenado exacto: las rectas toman el extremo calculado del arco vecino.
  const m = segs.length;
  for (let i = 0; i < m; i++) {
    const a = segs[i], b = segs[(i + 1) % m];
    if (a.type === 'arc' && b.type === 'line') b.p0 = arcPoint({ cx: a.c[0], cy: a.c[1], r: a.r }, a.a1);
    else if (a.type === 'line' && b.type === 'arc') a.p1 = arcPoint({ cx: b.c[0], cy: b.c[1], r: b.r }, b.a0);
    else if (a.type === 'line' && b.type === 'line') b.p0 = a.p1;
  }
  for (const s of segs) delete s.bridge;
  return { ok: true, segs };
}

function polygonSegs(X, Y, V) {
  const segs = [];
  for (let k = 0; k < V.length; k++) {
    const a = V[k], b = V[(k + 1) % V.length];
    segs.push({ type: 'line', p0: [X[a], Y[a]], p1: [X[b], Y[b]] });
  }
  for (let k = 0; k < segs.length; k++) segs[(k + 1) % segs.length].p0 = segs[k].p1;
  return segs;
}
