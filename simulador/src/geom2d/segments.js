// Modelo de segmentos 2D y su matemática exacta (contrato C1, docs/ARQUITECTURA.md).
// Punto: [x, y]. Ángulos en radianes. Todo segmento derivado conserva `meta` por referencia.
//
// Cada curva se evalúa en su parámetro natural u ∈ [u0, u1] (puede ser decreciente):
//   line/bezier: [0, 1]; arc/circle: ángulo; ellipse: t; spline: [knots[p], knots[n]].
// Áreas y momentos: forma cerrada en line/arc/circle (y área de elipse); Gauss–Legendre
// en el resto (exacta en polinomios, convergencia espectral en curvas suaves).

const TAU = 2 * Math.PI;
const ANG_EPS = 1e-12; // residuo angular que se toma como vuelta completa
const MAX_PTS = 4096;
const REL_TOL = 1e-13; // tolerancia relativa de la cuadratura adaptativa

const withMeta = (s, o) => {
  if (s.meta !== undefined) o.meta = s.meta;
  return o;
};
const hypot = (x, y) => Math.sqrt(x * x + y * y);
const dist = (a, b) => hypot(a[0] - b[0], a[1] - b[1]);
const mod2pi = (a) => {
  const r = a - TAU * Math.floor(a / TAU);
  return r >= TAU ? 0 : r;
};

// Lleva un ángulo a (0, 2π]; residuos menores que ANG_EPS cuentan como vuelta completa.
function normSweep(a) {
  const r = mod2pi(a);
  return r < ANG_EPS || TAU - r < ANG_EPS ? TAU : r;
}

const isCcw = (s) => s.ccw !== false;

/** Barrido (0, 2π] de arc/circle/ellipse según la regla del contrato. */
export function segSweep(s) {
  if (s.type === 'circle') return TAU;
  const [b, e] = s.type === 'arc' ? [s.a0, s.a1] : [s.t0, s.t1];
  return normSweep(isCcw(s) ? e - b : b - e);
}

// ---------- NURBS (de Boor / Piegl–Tiller) ----------

function checkSpline(s) {
  const n = s.ctrl.length, p = s.degree;
  if (!(p >= 1) || n < p + 1 || s.knots.length !== n + p + 1 || (s.weights && s.weights.length !== n))
    throw new Error('Spline inválida: grado, puntos de control, nudos o pesos inconsistentes');
}

const finite = (...xs) => xs.every((x) => Number.isFinite(x));
const finitePt = (q) => Array.isArray(q) && q.length >= 2 && finite(q[0], q[1]);

/**
 * Motivo por el que un segmento es inválido (texto en español) o null si es válido.
 * Evita que geometría corrupta (radios ≤ 0, NaN, splines con nudos inconsistentes)
 * llegue al cálculo o al motor CAD, donde podría colgar la evaluación.
 */
export function segInvalidReason(s) {
  if (!s || typeof s !== 'object') return 'segmento vacío';
  switch (s.type) {
    case 'line':
      return finitePt(s.p0) && finitePt(s.p1) ? null : 'línea con coordenadas no numéricas';
    case 'arc':
      if (!finitePt(s.c) || !finite(s.r, s.a0, s.a1)) return 'arco con datos no numéricos';
      return s.r > 0 ? null : 'arco con radio ≤ 0';
    case 'circle':
      if (!finitePt(s.c) || !finite(s.r)) return 'círculo con datos no numéricos';
      return s.r > 0 ? null : 'círculo con radio ≤ 0';
    case 'ellipse':
      if (!finitePt(s.c) || !finite(s.rx, s.ry, s.rot, s.t0, s.t1)) return 'elipse con datos no numéricos';
      return s.rx > 0 && s.ry > 0 ? null : 'elipse con semieje ≤ 0';
    case 'bezier':
      return Array.isArray(s.pts) && s.pts.length === 4 && s.pts.every(finitePt) ? null : 'Bézier con puntos inválidos';
    case 'spline': {
      const { degree: p, ctrl, knots, weights } = s;
      if (!Number.isInteger(p) || p < 1) return 'spline con grado inválido';
      if (!Array.isArray(ctrl) || !ctrl.every(finitePt)) return 'spline con puntos de control inválidos';
      const n = ctrl.length;
      if (n < p + 1) return 'spline con menos puntos de control que grado + 1';
      if (!Array.isArray(knots) || knots.length !== n + p + 1 || !knots.every((k) => Number.isFinite(k))) return 'spline con vector de nudos de longitud incorrecta';
      for (let i = 1; i < knots.length; i++) if (knots[i] < knots[i - 1]) return 'spline con nudos decrecientes';
      if (!(knots[p] < knots[n])) return 'spline con dominio de parámetro vacío';
      if (weights != null && (!Array.isArray(weights) || weights.length !== n || !weights.every((w) => Number.isFinite(w) && w > 0))) return 'spline con pesos inválidos';
      return null;
    }
    default:
      return `tipo de segmento desconocido (${s.type})`;
  }
}

function findSpan(U, n, p, u) {
  if (u >= U[n]) {
    let k = n - 1;
    while (k > p && U[k] >= U[k + 1]) k--;
    return k;
  }
  if (u <= U[p]) {
    let k = p;
    while (k < n - 1 && U[k + 1] <= U[k]) k++;
    return k;
  }
  let lo = p, hi = n;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (u < U[m]) hi = m;
    else lo = m;
  }
  return lo;
}

// Punto y derivada en u. Homogéneo: A = Σ N w P, W = Σ N w; C = A/W, C' = (A' − W'C)/W.
function splineEval(s, u) {
  const { degree: p, ctrl: P, knots: U } = s;
  const w = s.weights, n = P.length;
  const i = findSpan(U, n, p, u);
  const N = new Array(p + 1).fill(0), left = new Array(p + 1), right = new Array(p + 1);
  N[0] = 1;
  let Nd = [1];
  for (let j = 1; j <= p; j++) {
    left[j] = u - U[i + 1 - j];
    right[j] = U[i + j] - u;
    let saved = 0;
    for (let r = 0; r < j; r++) {
      const tmp = N[r] / (right[r + 1] + left[j - r]);
      N[r] = saved + right[r + 1] * tmp;
      saved = left[j - r] * tmp;
    }
    N[j] = saved;
    if (j === p - 1) Nd = N.slice(0, p);
  }
  const hw = (k) => (w ? w[k] : 1);
  let ax = 0, ay = 0, aw = 0;
  for (let k = 0; k <= p; k++) {
    const c = i - p + k, f = N[k] * hw(c);
    ax += f * P[c][0];
    ay += f * P[c][1];
    aw += f;
  }
  // Derivada: Σ N_{j+1,p−1} Q_j, Q_j = p (Pw_{j+1} − Pw_j) / (U[j+p+1] − U[j+1]).
  let dx = 0, dy = 0, dw = 0;
  for (let k = 0; k < p; k++) {
    const j = i - p + k, den = U[j + p + 1] - U[j + 1];
    if (den === 0 || Nd[k] === 0) continue;
    const f = (Nd[k] * p) / den, w0 = hw(j), w1 = hw(j + 1);
    dx += f * (w1 * P[j + 1][0] - w0 * P[j][0]);
    dy += f * (w1 * P[j + 1][1] - w0 * P[j][1]);
    dw += f * (w1 - w0);
  }
  const x = ax / aw, y = ay / aw;
  return { p: [x, y], d: [(dx - dw * x) / aw, (dy - dw * y) / aw] };
}

// ---------- evaluación en el parámetro natural ----------

function range(s) {
  switch (s.type) {
    case 'line':
    case 'bezier':
      return [0, 1];
    case 'arc':
      return [s.a0, s.a0 + (isCcw(s) ? 1 : -1) * segSweep(s)];
    case 'circle':
      return [0, isCcw(s) ? TAU : -TAU];
    case 'ellipse':
      return [s.t0, s.t0 + (isCcw(s) ? 1 : -1) * segSweep(s)];
    case 'spline':
      checkSpline(s);
      return [s.knots[s.degree], s.knots[s.ctrl.length]];
  }
  throw new Error(`Tipo de segmento desconocido: ${s.type}`);
}

// Punto y derivada respecto de u.
function evalD(s, u) {
  switch (s.type) {
    case 'line': {
      const dx = s.p1[0] - s.p0[0], dy = s.p1[1] - s.p0[1];
      return { p: [s.p0[0] + u * dx, s.p0[1] + u * dy], d: [dx, dy] };
    }
    case 'arc':
    case 'circle': {
      const c = Math.cos(u), sn = Math.sin(u);
      return { p: [s.c[0] + s.r * c, s.c[1] + s.r * sn], d: [-s.r * sn, s.r * c] };
    }
    case 'ellipse': {
      const cr = Math.cos(s.rot), sr = Math.sin(s.rot), c = Math.cos(u), sn = Math.sin(u);
      const x = s.rx * c, y = s.ry * sn, dx = -s.rx * sn, dy = s.ry * c;
      return {
        p: [s.c[0] + cr * x - sr * y, s.c[1] + sr * x + cr * y],
        d: [cr * dx - sr * dy, sr * dx + cr * dy],
      };
    }
    case 'bezier': {
      const [p0, p1, p2, p3] = s.pts, v = 1 - u;
      const b0 = v * v * v, b1 = 3 * v * v * u, b2 = 3 * v * u * u, b3 = u * u * u;
      const d0 = 3 * v * v, d1 = 6 * v * u, d2 = 3 * u * u;
      return {
        p: [b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0], b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1]],
        d: [
          d0 * (p1[0] - p0[0]) + d1 * (p2[0] - p1[0]) + d2 * (p3[0] - p2[0]),
          d0 * (p1[1] - p0[1]) + d1 * (p2[1] - p1[1]) + d2 * (p3[1] - p2[1]),
        ],
      };
    }
    case 'spline':
      return splineEval(s, u);
  }
  throw new Error(`Tipo de segmento desconocido: ${s.type}`);
}
const evalAt = (s, u) => evalD(s, u).p;

// Cortes del parámetro: tramos de nudo (spline) y cuartos de vuelta (elipse).
function breaks(s) {
  const [u0, u1] = range(s);
  if (s.type === 'spline') {
    const U = s.knots, out = [u0];
    for (let k = s.degree + 1; k <= s.ctrl.length; k++) if (U[k] > out[out.length - 1]) out.push(U[k]);
    return out;
  }
  const n = s.type === 'ellipse' ? Math.max(1, Math.ceil(Math.abs(u1 - u0) / (Math.PI / 2) - 1e-9)) : 1;
  const out = [];
  for (let i = 0; i <= n; i++) out.push(i === n ? u1 : u0 + ((u1 - u0) * i) / n);
  return out;
}

// ---------- cuadratura Gauss–Legendre adaptativa ----------

function gaussLegendre(n) {
  const x = [], w = [];
  for (let i = 1; i <= n; i++) {
    let z = Math.cos((Math.PI * (i - 0.25)) / (n + 0.5)), pp = 1;
    for (let it = 0; it < 100; it++) {
      let p1 = 1, p2 = 0;
      for (let j = 1; j <= n; j++) {
        const p3 = p2;
        p2 = p1;
        p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j;
      }
      pp = (n * (z * p1 - p2)) / (z * z - 1);
      const z1 = z;
      z = z1 - p1 / pp;
      if (Math.abs(z - z1) <= 1e-16) break;
    }
    x.push(z);
    w.push(2 / ((1 - z * z) * pp * pp));
  }
  return { x, w };
}
const GL = gaussLegendre(16);

// fn(p, d, out) escribe k valores; devuelve integrales y ∫|f| por componente.
function glPiece(s, fn, k, a, b) {
  const h = 0.5 * (b - a), m = 0.5 * (a + b), v = new Float64Array(k), ab = new Float64Array(k), f = new Float64Array(k);
  for (let i = 0; i < GL.x.length; i++) {
    const { p, d } = evalD(s, m + h * GL.x[i]);
    fn(p, d, f);
    for (let c = 0; c < k; c++) {
      v[c] += GL.w[i] * f[c] * h;
      ab[c] += GL.w[i] * Math.abs(f[c] * h);
    }
  }
  return { v, ab };
}

function integrate(s, fn, k) {
  const br = breaks(s), span = Math.abs(br[br.length - 1] - br[0]);
  const pieces = [], absTot = new Float64Array(k), out = new Float64Array(k);
  for (let i = 0; i + 1 < br.length; i++) {
    const r = glPiece(s, fn, k, br[i], br[i + 1]);
    pieces.push(r);
    for (let c = 0; c < k; c++) absTot[c] += r.ab[c];
  }
  const refine = (a, b, whole, depth) => {
    const m = 0.5 * (a + b), L = glPiece(s, fn, k, a, m), R = glPiece(s, fn, k, m, b);
    let ok = depth >= 50;
    if (!ok) {
      ok = true;
      for (let c = 0; c < k; c++)
        if (Math.abs(L.v[c] + R.v[c] - whole.v[c]) > (REL_TOL * absTot[c] * Math.abs(b - a)) / span) ok = false;
    }
    if (ok) for (let c = 0; c < k; c++) out[c] += L.v[c] + R.v[c];
    else {
      refine(a, m, L, depth + 1);
      refine(m, b, R, depth + 1);
    }
  };
  for (let i = 0; i < pieces.length; i++) refine(br[i], br[i + 1], pieces[i], 0);
  return out;
}

// ---------- API ----------

export function segStart(s) {
  switch (s.type) {
    case 'line':
      return s.p0.slice();
    case 'arc':
      return [s.c[0] + s.r * Math.cos(s.a0), s.c[1] + s.r * Math.sin(s.a0)];
    case 'circle':
      return [s.c[0] + s.r, s.c[1]];
    case 'ellipse':
      return evalAt(s, s.t0);
    case 'bezier':
      return s.pts[0].slice();
  }
  return evalAt(s, range(s)[0]);
}

export function segEnd(s) {
  switch (s.type) {
    case 'line':
      return s.p1.slice();
    case 'arc':
      return [s.c[0] + s.r * Math.cos(s.a1), s.c[1] + s.r * Math.sin(s.a1)];
    case 'circle':
      return [s.c[0] + s.r, s.c[1]];
    case 'ellipse':
      return evalAt(s, s.t1);
    case 'bezier':
      return s.pts[3].slice();
  }
  return evalAt(s, range(s)[1]);
}

export function segPointAt(s, t) {
  if (t <= 0) return segStart(s);
  if (t >= 1) return segEnd(s);
  const [u0, u1] = range(s);
  return evalAt(s, u0 + (u1 - u0) * t);
}

/** Tangente unitaria en t ∈ [0, 1], en el sentido de recorrido. */
export function segTangent(s, t) {
  const [u0, u1] = range(s), sg = u1 >= u0 ? 1 : -1;
  const { d } = evalD(s, u0 + (u1 - u0) * t);
  let l = hypot(d[0], d[1]);
  if (l > 0) return [(sg * d[0]) / l, (sg * d[1]) / l];
  // Derivada nula (p. ej. puntos de control repetidos): secante corta.
  const h = 1e-6, a = segPointAt(s, Math.max(0, t - h)), b = segPointAt(s, Math.min(1, t + h));
  l = dist(a, b) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
}

export function segReverse(s) {
  switch (s.type) {
    case 'line':
      return withMeta(s, { type: 'line', p0: s.p1.slice(), p1: s.p0.slice() });
    case 'arc':
      return withMeta(s, { type: 'arc', c: s.c.slice(), r: s.r, a0: s.a1, a1: s.a0, ccw: !isCcw(s) });
    case 'circle':
      return withMeta(s, { type: 'circle', c: s.c.slice(), r: s.r, ccw: !isCcw(s) });
    case 'ellipse':
      return withMeta(s, { type: 'ellipse', c: s.c.slice(), rx: s.rx, ry: s.ry, rot: s.rot, t0: s.t1, t1: s.t0, ccw: !isCcw(s) });
    case 'bezier':
      return withMeta(s, { type: 'bezier', pts: s.pts.map((p) => p.slice()).reverse() });
    case 'spline': {
      checkSpline(s);
      const U = s.knots, a = U[0] + U[U.length - 1];
      return withMeta(s, {
        type: 'spline',
        degree: s.degree,
        ctrl: s.ctrl.map((p) => p.slice()).reverse(),
        knots: U.map((k) => a - k).reverse(),
        weights: s.weights ? s.weights.slice().reverse() : null,
      });
    }
  }
  throw new Error(`Tipo de segmento desconocido: ${s.type}`);
}

const fLen = (p, d, o) => {
  o[0] = hypot(d[0], d[1]);
};
const fMom = (p, d, o) => {
  o[0] = 0.5 * (p[0] * d[1] - p[1] * d[0]);
  o[1] = 0.5 * p[0] * p[0] * d[1];
  o[2] = -0.5 * p[1] * p[1] * d[0];
};

export function segLength(s) {
  switch (s.type) {
    case 'line':
      return dist(s.p0, s.p1);
    case 'arc':
      return s.r * segSweep(s);
    case 'circle':
      return s.r * TAU;
  }
  return Math.abs(integrate(s, fLen, 1)[0]);
}

// Senos/cosenos de los extremos de un arco; en vuelta completa se repiten exactos.
function arcTrig(s) {
  const [u0, u1] = range(s), D = u1 - u0;
  const s0 = Math.sin(u0), c0 = Math.cos(u0);
  const full = Math.abs(Math.abs(D) - TAU) === 0;
  return { D, s0, c0, s1: full ? s0 : Math.sin(u1), c1: full ? c0 : Math.cos(u1) };
}

export function segAreaTerm(s) {
  switch (s.type) {
    case 'line':
      return 0.5 * (s.p0[0] * s.p1[1] - s.p1[0] * s.p0[1]);
    case 'arc':
    case 'circle': {
      const { D, s0, c0, s1, c1 } = arcTrig(s), r = s.r;
      return 0.5 * (s.c[0] * r * (s1 - s0) - s.c[1] * r * (c1 - c0) + r * r * D);
    }
    case 'ellipse': {
      // x dy − y dx = (cx dY − cy dX) + rx·ry dt (la rotación conserva el producto cruz).
      const [u0, u1] = range(s), p0 = segStart(s), p1 = segEnd(s);
      const full = segSweep(s) === TAU;
      const dX = full ? 0 : p1[0] - p0[0], dY = full ? 0 : p1[1] - p0[1];
      return 0.5 * (s.c[0] * dY - s.c[1] * dX + s.rx * s.ry * (u1 - u0));
    }
  }
  return integrate(s, fMom, 3)[0];
}

export function segMomentTerms(s) {
  switch (s.type) {
    case 'line': {
      const [x0, y0] = s.p0, [x1, y1] = s.p1;
      return {
        A: 0.5 * (x0 * y1 - x1 * y0),
        Sx: ((y1 - y0) * (x0 * x0 + x0 * x1 + x1 * x1)) / 6,
        Sy: (-(x1 - x0) * (y0 * y0 + y0 * y1 + y1 * y1)) / 6,
      };
    }
    case 'arc':
    case 'circle': {
      const { D, s0, c0, s1, c1 } = arcTrig(s), r = s.r, [cx, cy] = s.c;
      const S = s1 - s0, C = c1 - c0, S2 = 2 * (s1 * c1 - s0 * c0);
      return {
        A: 0.5 * (cx * r * S - cy * r * C + r * r * D),
        Sx: 0.5 * (cx * cx * r * S + cx * r * r * (D + S2 / 2) + r * r * r * (S - (s1 * s1 * s1 - s0 * s0 * s0) / 3)),
        Sy: 0.5 * (-cy * cy * r * C + cy * r * r * (D - S2 / 2) + r * r * r * (-C + (c1 * c1 * c1 - c0 * c0 * c0) / 3)),
      };
    }
  }
  const v = integrate(s, fMom, 3);
  return { A: s.type === 'ellipse' ? segAreaTerm(s) : v[0], Sx: v[1], Sy: v[2] };
}

// ¿El ángulo u (parámetro) cae dentro del barrido? Devuelve la fracción o −1.
function sweepFrac(s, u) {
  const [u0, u1] = range(s), sw = Math.abs(u1 - u0);
  const d = u1 >= u0 ? mod2pi(u - u0) : mod2pi(u0 - u);
  return d <= sw ? d / sw : -1;
}

function quadRoots(a, b, c) {
  const m = Math.abs(a) + Math.abs(b) + Math.abs(c);
  if (Math.abs(a) <= 1e-14 * m) return b !== 0 ? [-c / b] : [];
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(disc));
  return q !== 0 ? [q / a, c / q] : [0];
}

export function segBBox(s) {
  let pts;
  switch (s.type) {
    case 'line':
      pts = [s.p0, s.p1];
      break;
    case 'circle':
      return { minX: s.c[0] - s.r, minY: s.c[1] - s.r, maxX: s.c[0] + s.r, maxY: s.c[1] + s.r };
    case 'arc':
    case 'ellipse': {
      // Extremos de x(u) = cx + A1 cos u + B1 sin u en u = atan2(B1, A1) (+π); ídem y.
      const rx = s.type === 'arc' ? s.r : s.rx, ry = s.type === 'arc' ? s.r : s.ry, rot = s.type === 'arc' ? 0 : s.rot;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      pts = [segStart(s), segEnd(s)];
      for (const base of [Math.atan2(-ry * sr, rx * cr), Math.atan2(ry * cr, rx * sr)])
        for (const u of [base, base + Math.PI]) if (sweepFrac(s, u) >= 0) pts.push(evalAt(s, u));
      break;
    }
    case 'bezier': {
      const [p0, p1, p2, p3] = s.pts;
      pts = [p0, p3];
      for (let k = 0; k < 2; k++) {
        const a = -p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k], b = 2 * (p0[k] - 2 * p1[k] + p2[k]), c = p1[k] - p0[k];
        for (const t of quadRoots(a, b, c)) if (t > 0 && t < 1) pts.push(evalAt(s, t));
      }
      break;
    }
    case 'spline': {
      const cb = boxOf(s.ctrl), diag = hypot(cb.maxX - cb.minX, cb.maxY - cb.minY) || 1;
      pts = segTessellate(s, diag * 1e-6);
      break;
    }
    default:
      throw new Error(`Tipo de segmento desconocido: ${s.type}`);
  }
  return boxOf(pts);
}

function boxOf(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

// Distancia de q al segmento ab.
function distToChord(q, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
}

export function segTessellate(s, chordTol) {
  if (!(chordTol > 0)) throw new Error('La tolerancia de cuerda debe ser positiva');
  if (s.type === 'line') return [s.p0.slice(), s.p1.slice()];
  const [u0, u1] = range(s);
  if (s.type === 'arc' || s.type === 'circle') {
    // Flecha de una cuerda de ángulo δ: r(1 − cos(δ/2)) ≤ tol ⇔ δ ≤ 4·asin(√(tol/2r)).
    const sw = Math.abs(u1 - u0);
    const dmax = Math.min(chordTol < 2 * s.r ? 4 * Math.asin(Math.sqrt(chordTol / (2 * s.r))) : Math.PI, Math.PI / 4);
    const n = Math.min(MAX_PTS - 1, Math.max(1, Math.ceil(sw / dmax - 1e-9)));
    const pts = [segStart(s)];
    for (let i = 1; i < n; i++) pts.push(evalAt(s, u0 + ((u1 - u0) * i) / n));
    pts.push(segEnd(s));
    return pts;
  }
  // Subdivisión adaptativa: se acepta un tramo si sus puntos a 1/4, 1/2 y 3/4 distan ≤ tol de la cuerda.
  const init = [];
  const br = breaks(s);
  const per = s.type === 'ellipse' ? 4 : s.type === 'bezier' ? 4 : 2;
  for (let i = 0; i + 1 < br.length; i++)
    for (let j = 0; j < per; j++) init.push(br[i] + ((br[i + 1] - br[i]) * j) / per);
  init.push(u1);
  const pts = [segStart(s)];
  const rec = (a, pa, b, pb, depth) => {
    const m = 0.5 * (a + b), pm = evalAt(s, m), q1 = evalAt(s, 0.5 * (a + m)), q3 = evalAt(s, 0.5 * (m + b));
    const dev = Math.max(distToChord(pm, pa, pb), distToChord(q1, pa, pb), distToChord(q3, pa, pb));
    if (dev <= chordTol || depth >= 20 || pts.length >= MAX_PTS) {
      pts.push(pb);
      return;
    }
    rec(a, pa, m, pm, depth + 1);
    rec(m, pm, b, pb, depth + 1);
  };
  for (let i = 0; i + 1 < init.length; i++)
    rec(init[i], pts[pts.length - 1], init[i + 1], i + 2 === init.length ? segEnd(s) : evalAt(s, init[i + 1]), 0);
  if (pts.length <= MAX_PTS) return pts;
  // Tope de puntos: remuestreo uniforme en el parámetro.
  const out = [segStart(s)];
  for (let i = 1; i < MAX_PTS - 1; i++) out.push(evalAt(s, u0 + ((u1 - u0) * i) / (MAX_PTS - 1)));
  out.push(segEnd(s));
  return out;
}

export function segTransform(s, m) {
  const [a, b, c, d, e, f] = m;
  const T = (p) => [a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f];
  switch (s.type) {
    case 'line':
      return withMeta(s, { type: 'line', p0: T(s.p0), p1: T(s.p1) });
    case 'bezier':
      return withMeta(s, { type: 'bezier', pts: s.pts.map(T) });
    case 'spline':
      return withMeta(s, {
        type: 'spline',
        degree: s.degree,
        ctrl: s.ctrl.map(T),
        knots: s.knots.slice(),
        weights: s.weights ? s.weights.slice() : null,
      });
    case 'arc':
    case 'circle':
    case 'ellipse':
      break;
    default:
      throw new Error(`Tipo de segmento desconocido: ${s.type}`);
  }
  const det = a * d - b * c, n2 = a * a + b * b + c * c + d * d;
  if (!(Math.abs(det) > 1e-14 * n2)) throw new Error('Transformación degenerada (determinante nulo)');
  const ccw = isCcw(s);
  if (s.type !== 'ellipse' && Math.abs(a * a + b * b - c * c - d * d) <= 1e-12 * n2 && Math.abs(a * c + b * d) <= 1e-12 * n2) {
    // Semejanza: L = k·Rot(φ) (o k·Rot(φ)·diag(1, −1) si es espejo).
    const k = Math.sqrt(Math.abs(det)), phi = Math.atan2(b, a), mir = det < 0;
    if (s.type === 'circle') return withMeta(s, { type: 'circle', c: T(s.c), r: s.r * k, ccw: mir ? !ccw : ccw });
    const map = (t) => (mir ? phi - t : t + phi);
    return withMeta(s, { type: 'arc', c: T(s.c), r: s.r * k, a0: map(s.a0), a1: map(s.a1), ccw: mir ? !ccw : ccw });
  }
  // Elipse general: M = L·Rot(rot)·diag(rx, ry) = U Σ Vᵀ con V = Rot(ψ).
  const E =
    s.type === 'ellipse'
      ? s
      : { c: s.c, rx: s.r, ry: s.r, rot: 0, t0: s.type === 'arc' ? s.a0 : 0, t1: s.type === 'arc' ? s.a1 : TAU };
  const cr = Math.cos(E.rot), sr = Math.sin(E.rot);
  const m11 = (a * cr + c * sr) * E.rx, m21 = (b * cr + d * sr) * E.rx;
  const m12 = (-a * sr + c * cr) * E.ry, m22 = (-b * sr + d * cr) * E.ry;
  const P = m11 * m11 + m21 * m21, S = m12 * m12 + m22 * m22, Q = m11 * m12 + m21 * m22;
  const psi = 0.5 * Math.atan2(2 * Q, P - S);
  const s1 = Math.sqrt(0.5 * (P + S) + hypot(0.5 * (P - S), Q));
  const detM = m11 * m22 - m12 * m21, s2 = Math.abs(detM) / s1;
  const cp = Math.cos(psi), sp = Math.sin(psi);
  const rot = Math.atan2(m21 * cp + m22 * sp, m11 * cp + m12 * sp);
  const map = (t) => (detM < 0 ? psi - t : t - psi);
  return withMeta(s, {
    type: 'ellipse',
    c: T(E.c),
    rx: s1,
    ry: s2,
    rot,
    t0: map(E.t0),
    t1: map(E.t1),
    ccw: detM < 0 ? !ccw : ccw,
  });
}

export function isClosedSegment(s, tol = 1e-9) {
  switch (s.type) {
    case 'circle':
      return true;
    case 'line':
      return false;
    case 'arc':
    case 'ellipse':
      return segSweep(s) === TAU;
  }
  return dist(segStart(s), segEnd(s)) <= tol;
}

export function segClosestPoint(s, p) {
  if (s.type === 'line') {
    const dx = s.p1[0] - s.p0[0], dy = s.p1[1] - s.p0[1], l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? ((p[0] - s.p0[0]) * dx + (p[1] - s.p0[1]) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const q = [s.p0[0] + t * dx, s.p0[1] + t * dy];
    return { d: dist(p, q), t, q };
  }
  if (s.type === 'arc' || s.type === 'circle') {
    const vx = p[0] - s.c[0], vy = p[1] - s.c[1];
    const t = vx === 0 && vy === 0 ? 0 : sweepFrac(s, Math.atan2(vy, vx));
    if (t >= 0) {
      const q = t === 0 ? segStart(s) : segPointAt(s, t);
      return { d: dist(p, q), t, q };
    }
    const q0 = segStart(s), q1 = segEnd(s), d0 = dist(p, q0), d1 = dist(p, q1);
    return d0 <= d1 ? { d: d0, t: 0, q: q0 } : { d: d1, t: 1, q: q1 };
  }
  // Curvas generales: muestreo y refinamiento por sección áurea en el parámetro.
  const [u0, u1] = range(s), br = breaks(s), us = [];
  const per = Math.max(8, Math.ceil(64 / (br.length - 1)));
  for (let i = 0; i + 1 < br.length; i++) for (let j = 0; j < per; j++) us.push(br[i] + ((br[i + 1] - br[i]) * j) / per);
  us.push(u1);
  const d2 = (u) => {
    const q = evalAt(s, u);
    return (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
  };
  let bi = 0, bd = Infinity;
  for (let i = 0; i < us.length; i++) {
    const v = d2(us[i]);
    if (v < bd) {
      bd = v;
      bi = i;
    }
  }
  let lo = us[Math.max(0, bi - 1)], hi = us[Math.min(us.length - 1, bi + 1)];
  if (lo > hi) [lo, hi] = [hi, lo];
  const g = (Math.sqrt(5) - 1) / 2;
  let x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo), f1 = d2(x1), f2 = d2(x2);
  for (let it = 0; it < 80; it++) {
    if (f1 < f2) {
      hi = x2;
      x2 = x1;
      f2 = f1;
      x1 = hi - g * (hi - lo);
      f1 = d2(x1);
    } else {
      lo = x1;
      x1 = x2;
      f1 = f2;
      x2 = lo + g * (hi - lo);
      f2 = d2(x2);
    }
  }
  let u = 0.5 * (lo + hi);
  // d² es plana en el mínimo (precisión √ε): se afina con Illinois sobre f(u) = (P − p)·P'.
  const fd = (v) => {
    const { p: q, d } = evalD(s, v);
    return (q[0] - p[0]) * d[0] + (q[1] - p[1]) * d[1];
  };
  const umin = Math.min(u0, u1), umax = Math.max(u0, u1);
  let a = us[Math.max(0, bi - 1)], b = us[Math.min(us.length - 1, bi + 1)];
  let fa = fd(a), fb = fd(b), side = 0;
  if (fa * fb < 0) {
    for (let it = 0; it < 60 && Math.abs(b - a) > 1e-15 * (umax - umin); it++) {
      const c = (a * fb - b * fa) / (fb - fa), fc = fd(c);
      if (fc === 0) {
        a = b = c;
        break;
      }
      if (fc * fb < 0) {
        a = b;
        fa = fb;
        side = 0;
      } else if (side === 1) fa /= 2;
      else side = 1;
      b = c;
      fb = fc;
    }
    const c = 0.5 * (a + b);
    if (d2(c) <= d2(u)) u = c;
  }
  if (bd < d2(u)) u = us[bi];
  const t = (u - u0) / (u1 - u0), q = t <= 0 ? segStart(s) : t >= 1 ? segEnd(s) : evalAt(s, u);
  return { d: dist(p, q), t, q };
}

export function segSnapPoints(s) {
  const out = [];
  const add = (p, kind) => out.push({ p, kind });
  switch (s.type) {
    case 'circle':
      add(s.c.slice(), 'center');
      for (let k = 0; k < 4; k++) add(evalAt(s, (k * Math.PI) / 2), 'quadrant');
      return out;
    case 'arc':
    case 'ellipse': {
      const full = segSweep(s) === TAU;
      if (!full) {
        add(segStart(s), 'end');
        add(segEnd(s), 'end');
        add(segPointAt(s, 0.5), 'mid');
      }
      add(s.c.slice(), 'center');
      for (let k = 0; k < 4; k++) {
        const u = (k * Math.PI) / 2;
        if (full || sweepFrac(s, u) >= 0) add(evalAt(s, u), 'quadrant');
      }
      return out;
    }
  }
  add(segStart(s), 'end');
  add(segEnd(s), 'end');
  add(segPointAt(s, 0.5), 'mid');
  return out;
}
