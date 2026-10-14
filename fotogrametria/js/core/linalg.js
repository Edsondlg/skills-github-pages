// Álgebra lineal densa en doble precisión para matrices pequeñas y medianas.
// Convención: matrices en Float64Array (o Array) en orden por filas (row-major).

export function zeros(n) { return new Float64Array(n); }

// ---------- Vectores 3D ----------
export const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => Math.hypot(a[0], a[1], a[2]),
  normalize: (a) => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; },
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
};

// ---------- Matrices 3x3 (arreglo de 9, por filas) ----------
export function mat3Mul(A, B) {
  const C = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  }
  return C;
}
export function mat3Vec(A, v) {
  return [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];
}
export function mat3TVec(A, v) {
  return [A[0] * v[0] + A[3] * v[1] + A[6] * v[2], A[1] * v[0] + A[4] * v[1] + A[7] * v[2], A[2] * v[0] + A[5] * v[1] + A[8] * v[2]];
}
export function mat3T(A) { return [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]]; }
export function mat3Det(A) {
  return A[0] * (A[4] * A[8] - A[5] * A[7]) - A[1] * (A[3] * A[8] - A[5] * A[6]) + A[2] * (A[3] * A[7] - A[4] * A[6]);
}
export function mat3Inv(A) {
  const d = mat3Det(A);
  if (Math.abs(d) < 1e-300) return null;
  const id = 1 / d;
  return [
    (A[4] * A[8] - A[5] * A[7]) * id, (A[2] * A[7] - A[1] * A[8]) * id, (A[1] * A[5] - A[2] * A[4]) * id,
    (A[5] * A[6] - A[3] * A[8]) * id, (A[0] * A[8] - A[2] * A[6]) * id, (A[2] * A[3] - A[0] * A[5]) * id,
    (A[3] * A[7] - A[4] * A[6]) * id, (A[1] * A[6] - A[0] * A[7]) * id, (A[0] * A[4] - A[1] * A[3]) * id,
  ];
}
export function skew(v) { return [0, -v[2], v[1], v[2], 0, -v[0], -v[1], v[0], 0]; }

// ---------- Rotaciones ----------
// Fórmula de Rodrigues: vector de rotación (eje * ángulo) -> matriz 3x3.
export function rodrigues(r) {
  const th = Math.hypot(r[0], r[1], r[2]);
  if (th < 1e-12) {
    return [1, -r[2], r[1], r[2], 1, -r[0], -r[1], r[0], 1];
  }
  const kx = r[0] / th, ky = r[1] / th, kz = r[2] / th;
  const c = Math.cos(th), s = Math.sin(th), C = 1 - c;
  return [
    c + kx * kx * C, kx * ky * C - kz * s, kx * kz * C + ky * s,
    ky * kx * C + kz * s, c + ky * ky * C, ky * kz * C - kx * s,
    kz * kx * C - ky * s, kz * ky * C + kx * s, c + kz * kz * C,
  ];
}
// Matriz de rotación -> vector de rotación (vía cuaternión, estable cerca de 0 y pi).
export function rodriguesInv(R) {
  const q = rotToQuat(R);
  let [w, x, y, z] = q;
  if (w < 0) { w = -w; x = -x; y = -y; z = -z; }
  const s = Math.hypot(x, y, z);
  if (s < 1e-12) return [2 * x, 2 * y, 2 * z];
  const ang = 2 * Math.atan2(s, w);
  return [x / s * ang, y / s * ang, z / s * ang];
}
export function rotToQuat(R) {
  const tr = R[0] + R[4] + R[8];
  let w, x, y, z;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    w = 0.25 * s; x = (R[7] - R[5]) / s; y = (R[2] - R[6]) / s; z = (R[3] - R[1]) / s;
  } else if (R[0] > R[4] && R[0] > R[8]) {
    const s = Math.sqrt(1 + R[0] - R[4] - R[8]) * 2;
    w = (R[7] - R[5]) / s; x = 0.25 * s; y = (R[1] + R[3]) / s; z = (R[2] + R[6]) / s;
  } else if (R[4] > R[8]) {
    const s = Math.sqrt(1 + R[4] - R[0] - R[8]) * 2;
    w = (R[2] - R[6]) / s; x = (R[1] + R[3]) / s; y = 0.25 * s; z = (R[5] + R[7]) / s;
  } else {
    const s = Math.sqrt(1 + R[8] - R[0] - R[4]) * 2;
    w = (R[3] - R[1]) / s; x = (R[2] + R[6]) / s; y = (R[5] + R[7]) / s; z = 0.25 * s;
  }
  const n = Math.hypot(w, x, y, z);
  return [w / n, x / n, y / n, z / n];
}
export function quatToRot(q) {
  const [w, x, y, z] = q;
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
}
// Rotación más cercana (Frobenius) a una matriz 3x3 arbitraria (método de Bar-Itzhack).
export function nearestRotation(M) {
  const [a, b, c, d, e, f, g, h, i] = M;
  const K = new Float64Array([
    a - e - i, d + b, g + c, h - f,
    d + b, e - a - i, h + f, c - g,
    g + c, h + f, i - a - e, d - b,
    h - f, c - g, d - b, a + e + i,
  ]);
  for (let k = 0; k < 16; k++) K[k] /= 3;
  const { values, vectors } = eigSym(K, 4);
  // autovector del mayor autovalor (último, orden ascendente)
  const x = vectors[3], y = vectors[7], z = vectors[11], w = vectors[15];
  return quatToRot([w, x, y, z]);
}

// ---------- Autovalores de matrices simétricas (Jacobi cíclico) ----------
// A: n*n por filas (no se modifica). Devuelve autovalores ascendentes y autovectores
// como columnas de una matriz n*n por filas (vectors[i*n+k] = componente i del k-ésimo).
export function eigSym(Ain, n) {
  const A = Float64Array.from(Ain);
  const V = new Float64Array(n * n);
  for (let i = 0; i < n; i++) V[i * n + i] = 1;
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p * n + q] * A[p * n + q];
    if (off < 1e-30) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q];
        if (Math.abs(apq) < 1e-300) continue;
        const app = A[p * n + p], aqq = A[q * n + q];
        const theta = (aqq - app) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k * n + p], akq = A[k * n + q];
          A[k * n + p] = c * akp - s * akq;
          A[k * n + q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p * n + k], aqk = A[q * n + k];
          A[p * n + k] = c * apk - s * aqk;
          A[q * n + k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k * n + p], vkq = V[k * n + q];
          V[k * n + p] = c * vkp - s * vkq;
          V[k * n + q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const idx = Array.from({ length: n }, (_, i) => i).sort((i, j) => A[i * n + i] - A[j * n + j]);
  const values = new Float64Array(n);
  const vectors = new Float64Array(n * n);
  idx.forEach((src, dst) => {
    values[dst] = A[src * n + src];
    for (let i = 0; i < n; i++) vectors[i * n + dst] = V[i * n + src];
  });
  return { values, vectors };
}

// Vector nulo (aprox.) de A (rows x cols): autovector de AᵀA con menor autovalor.
export function nullVector(A, rows, cols) {
  const AtA = new Float64Array(cols * cols);
  for (let r = 0; r < rows; r++) {
    const o = r * cols;
    for (let i = 0; i < cols; i++) {
      const ai = A[o + i];
      if (ai === 0) continue;
      for (let j = i; j < cols; j++) AtA[i * cols + j] += ai * A[o + j];
    }
  }
  for (let i = 0; i < cols; i++) for (let j = 0; j < i; j++) AtA[i * cols + j] = AtA[j * cols + i];
  const { values, vectors } = eigSym(AtA, cols);
  const v = new Float64Array(cols);
  for (let i = 0; i < cols; i++) v[i] = vectors[i * cols];
  return { v, values };
}

// ---------- Cholesky ----------
// Factoriza en sitio una matriz SPD n*n (triangular inferior). Devuelve false si no es SPD.
export function cholFactor(A, n) {
  for (let j = 0; j < n; j++) {
    let s = A[j * n + j];
    for (let k = 0; k < j; k++) s -= A[j * n + k] * A[j * n + k];
    if (!(s > 0)) return false;
    const d = Math.sqrt(s);
    A[j * n + j] = d;
    for (let i = j + 1; i < n; i++) {
      let t = A[i * n + j];
      for (let k = 0; k < j; k++) t -= A[i * n + k] * A[j * n + k];
      A[i * n + j] = t / d;
    }
  }
  return true;
}
export function cholSolveFactored(L, n, b) {
  const x = Float64Array.from(b);
  for (let i = 0; i < n; i++) {
    let s = x[i];
    for (let k = 0; k < i; k++) s -= L[i * n + k] * x[k];
    x[i] = s / L[i * n + i];
  }
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i];
    for (let k = i + 1; k < n; k++) s -= L[k * n + i] * x[k];
    x[i] = s / L[i * n + i];
  }
  return x;
}
export function cholSolve(A, n, b) {
  const L = Float64Array.from(A);
  if (!cholFactor(L, n)) return null;
  return cholSolveFactored(L, n, b);
}
// Inversa de matriz SPD (para covarianzas).
export function invSPD(A, n) {
  const L = Float64Array.from(A);
  if (!cholFactor(L, n)) return null;
  const inv = new Float64Array(n * n);
  const e = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    e.fill(0); e[j] = 1;
    const col = cholSolveFactored(L, n, e);
    for (let i = 0; i < n; i++) inv[i * n + j] = col[i];
  }
  return inv;
}

// Resolución general por eliminación gaussiana con pivoteo parcial (n pequeño).
export function solveGauss(Ain, n, bin) {
  const A = Float64Array.from(Ain), b = Float64Array.from(bin);
  for (let c = 0; c < n; c++) {
    let p = c, best = Math.abs(A[c * n + c]);
    for (let r = c + 1; r < n; r++) { const v = Math.abs(A[r * n + c]); if (v > best) { best = v; p = r; } }
    if (best < 1e-300) return null;
    if (p !== c) {
      for (let k = 0; k < n; k++) { const t = A[c * n + k]; A[c * n + k] = A[p * n + k]; A[p * n + k] = t; }
      const t = b[c]; b[c] = b[p]; b[p] = t;
    }
    for (let r = c + 1; r < n; r++) {
      const f = A[r * n + c] / A[c * n + c];
      if (f === 0) continue;
      for (let k = c; k < n; k++) A[r * n + k] -= f * A[c * n + k];
      b[r] -= f * b[c];
    }
  }
  const x = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r * n + k] * x[k];
    x[r] = s / A[r * n + r];
  }
  return x;
}

// ---------- Estadística ----------
export function median(arr) {
  if (!arr.length) return NaN;
  const a = Array.from(arr).sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : 0.5 * (a[m - 1] + a[m]);
}
export function percentile(arr, p) {
  if (!arr.length) return NaN;
  const a = Array.from(arr).sort((x, y) => x - y);
  const idx = Math.min(a.length - 1, Math.max(0, (a.length - 1) * p));
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return a[lo] + (a[hi] - a[lo]) * (idx - lo);
}
export function rms(arr) {
  if (!arr.length) return NaN;
  let s = 0; for (const v of arr) s += v * v;
  return Math.sqrt(s / arr.length);
}
export function mean(arr) {
  if (!arr.length) return NaN;
  let s = 0; for (const v of arr) s += v;
  return s / arr.length;
}
export function std(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr); let s = 0;
  for (const v of arr) s += (v - m) * (v - m);
  return Math.sqrt(s / (arr.length - 1));
}

// Generador pseudoaleatorio determinista (mulberry32).
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gaussRand(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
