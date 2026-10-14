// Triangulación multivista de puntos (lineal + refinamiento no lineal) con estimación de incertidumbre.
import { nullVector, cholSolve, invSPD, v3 } from './linalg.js';
import { pixelToNormalized, projectJac, projectPoint, cameraCenter, triangulationAngle } from './camera.js';

// obs: [{ K, R, t, uv }]
export function triangulateLinear(obs) {
  const n = obs.length;
  const A = new Float64Array(2 * n * 4);
  for (let i = 0; i < n; i++) {
    const { K, R, t, uv } = obs[i];
    const [x, y] = pixelToNormalized(K, uv[0], uv[1]);
    const P = [R[0], R[1], R[2], t[0], R[3], R[4], R[5], t[1], R[6], R[7], R[8], t[2]];
    for (let j = 0; j < 4; j++) {
      A[(2 * i) * 4 + j] = x * P[8 + j] - P[j];
      A[(2 * i + 1) * 4 + j] = y * P[8 + j] - P[4 + j];
    }
  }
  const { v } = nullVector(A, 2 * n, 4);
  if (Math.abs(v[3]) < 1e-15) return null;
  return [v[0] / v[3], v[1] / v[3], v[2] / v[3]];
}

export function triangulate(obs, { sigmaPx = null, maxIter = 15 } = {}) {
  if (obs.length < 2) return null;
  let X = triangulateLinear(obs);
  if (!X) return null;
  const cost = (X) => {
    let c = 0;
    for (const o of obs) {
      const [u, v, z] = projectPoint(o.K, o.R, o.t, X);
      if (!(z > 0)) return Infinity;
      c += (o.uv[0] - u) ** 2 + (o.uv[1] - v) ** 2;
    }
    return c;
  };
  let c = cost(X), lambda = 1e-3;
  let H = null;
  for (let it = 0; it < maxIter; it++) {
    H = new Float64Array(9);
    const g = new Float64Array(3);
    for (const o of obs) {
      const pj = projectJac(o.K, o.R, o.t, X);
      const ru = o.uv[0] - pj.u, rv = o.uv[1] - pj.v;
      for (let a = 0; a < 3; a++) {
        g[a] += pj.Jx[a] * ru + pj.Jx[3 + a] * rv;
        for (let b = 0; b < 3; b++) H[a * 3 + b] += pj.Jx[a] * pj.Jx[b] + pj.Jx[3 + a] * pj.Jx[3 + b];
      }
    }
    let improved = false;
    for (let k = 0; k < 8; k++) {
      const Hd = Float64Array.from(H);
      for (let a = 0; a < 3; a++) Hd[a * 4] *= 1 + lambda;
      const d = cholSolve(Hd, 3, g);
      if (!d) { lambda *= 10; continue; }
      const Xn = [X[0] + d[0], X[1] + d[1], X[2] + d[2]];
      const cn = cost(Xn);
      if (cn < c) { const rel = (c - cn) / (c + 1e-30); X = Xn; c = cn; lambda /= 10; improved = true; if (rel < 1e-12) it = maxIter; break; }
      lambda *= 10;
    }
    if (!improved) break;
  }
  const errs = obs.map(o => { const [u, v] = projectPoint(o.K, o.R, o.t, X); return Math.hypot(o.uv[0] - u, o.uv[1] - v); });
  const rms = Math.sqrt(c / obs.length);
  // covarianza: sigma^2 (JᵀJ)^-1 ; sigma de la imagen (por defecto el residuo, mínimo 0.1 px)
  let cov = null, std = null;
  if (H) {
    const s = sigmaPx ?? Math.max(0.1, obs.length > 2 ? Math.sqrt(c / (2 * obs.length - 3)) : 0.25);
    const inv = invSPD(H, 3);
    if (inv) { cov = Array.from(inv, x => x * s * s); std = [Math.sqrt(cov[0]), Math.sqrt(cov[4]), Math.sqrt(cov[8])]; }
  }
  let maxAngle = 0;
  for (let i = 0; i < obs.length; i++) for (let j = i + 1; j < obs.length; j++) {
    maxAngle = Math.max(maxAngle, triangulationAngle(cameraCenter(obs[i].R, obs[i].t), cameraCenter(obs[j].R, obs[j].t), X));
  }
  return { X, rms, errs, cov, std, maxAngle, n: obs.length };
}

// Agrupa observaciones por clave y triangula cada punto, descartando vistas atípicas.
// observations: Map clave -> [{ K, R, t, uv }]
export function triangulateAll(observations, { minViews = 2, maxErrPx = 2.0, minAngle = 3 } = {}) {
  const out = new Map();
  for (const [key, obs0] of observations) {
    let obs = obs0;
    if (obs.length < minViews) continue;
    let r = triangulate(obs);
    if (!r) continue;
    // eliminar la peor observación mientras haya atípicos
    while (r && obs.length > minViews && Math.max(...r.errs) > maxErrPx) {
      const worst = r.errs.indexOf(Math.max(...r.errs));
      obs = obs.filter((_, i) => i !== worst);
      r = triangulate(obs);
    }
    if (!r || Math.max(...r.errs) > maxErrPx * 1.5 || r.maxAngle < minAngle) continue;
    out.set(key, r);
  }
  return out;
}

// Normal y centro de un marcador a partir de sus 4 esquinas 3D.
export function markerFrame(corners3) {
  const c = [0, 0, 0];
  for (const p of corners3) { c[0] += p[0] / 4; c[1] += p[1] / 4; c[2] += p[2] / 4; }
  const d1 = v3.sub(corners3[2], corners3[0]), d2 = v3.sub(corners3[3], corners3[1]);
  const n = v3.normalize(v3.cross(d2, d1)); // normal hacia el frente impreso del marcador
  const side = (v3.dist(corners3[0], corners3[1]) + v3.dist(corners3[1], corners3[2]) + v3.dist(corners3[2], corners3[3]) + v3.dist(corners3[3], corners3[0])) / 4;
  return { center: c, normal: n, side };
}
