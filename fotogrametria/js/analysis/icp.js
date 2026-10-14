// Alineación de la medición con un modelo CAD: candidatos por ejes principales (PCA) +
// ICP punto-a-plano robusto. El CAD permanece fijo; se transforma la medición (scan -> CAD).
import { eigSym, rodrigues, mat3Mul, mat3Vec, cholSolve, median } from '../core/linalg.js';

function pca(pts) {
  const n = pts.length / 3;
  const c = [0, 0, 0];
  for (let i = 0; i < n; i++) { c[0] += pts[3 * i]; c[1] += pts[3 * i + 1]; c[2] += pts[3 * i + 2]; }
  c[0] /= n; c[1] /= n; c[2] /= n;
  const C = new Float64Array(9);
  for (let i = 0; i < n; i++) {
    const d = [pts[3 * i] - c[0], pts[3 * i + 1] - c[1], pts[3 * i + 2] - c[2]];
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a * 3 + b] += d[a] * d[b] / n;
  }
  const { vectors } = eigSym(C, 3);
  // columnas: ejes de menor a mayor varianza -> reordenar de mayor a menor
  const E = [vectors[2], vectors[1], vectors[0], vectors[5], vectors[4], vectors[3], vectors[8], vectors[7], vectors[6]];
  // base propia (det = +1) para que las rotaciones candidatas no sean reflexiones
  const det = E[0] * (E[4] * E[8] - E[5] * E[7]) - E[1] * (E[3] * E[8] - E[5] * E[6]) + E[2] * (E[3] * E[7] - E[4] * E[6]);
  if (det < 0) { E[2] = -E[2]; E[5] = -E[5]; E[8] = -E[8]; }
  return { c, E };
}

function transform(R, t, pts, out) {
  for (let i = 0; i < pts.length; i += 3) {
    const x = pts[i], y = pts[i + 1], z = pts[i + 2];
    out[i] = R[0] * x + R[1] * y + R[2] * z + t[0];
    out[i + 1] = R[3] * x + R[4] * y + R[5] * z + t[1];
    out[i + 2] = R[6] * x + R[7] * y + R[8] * z + t[2];
  }
  return out;
}

function subsample(pts, n) {
  const N = pts.length / 3;
  if (!pts || N <= n) return pts ? Float64Array.from(pts) : null;
  const out = new Float64Array(n * 3);
  const step = N / n;
  for (let i = 0; i < n; i++) { const j = Math.floor(i * step); out[3 * i] = pts[3 * j]; out[3 * i + 1] = pts[3 * j + 1]; out[3 * i + 2] = pts[3 * j + 2]; }
  return out;
}

// ICP punto-a-plano. grid: TriangleGrid del CAD. Devuelve { R, t, rms, inliers }.
// normals (opcional): normales de la medición; se exige que coincidan con la del CAD (evita
// emparejar la cara superior medida con la cara inferior de la lámina en el CAD).
export function icp(scanPts, grid, R0, t0, { iterations = 30, maxDist = 15, minDist = 1.0, trim = 3.0, normals = null, minDot = 0.3 } = {}) {
  let R = R0.slice(), t = t0.slice();
  const tmp = new Float64Array(scanPts.length);
  let dmax = maxDist, rmsv = Infinity, inl = 0;
  for (let it = 0; it < iterations; it++) {
    transform(R, t, scanPts, tmp);
    const H = new Float64Array(36), g = new Float64Array(6);
    const res = [];
    const pairs = [];
    for (let i = 0; i < tmp.length; i += 3) {
      const q = grid.closest(tmp[i], tmp[i + 1], tmp[i + 2], dmax);
      if (!q) continue;
      const n = [grid.N[3 * q.tri], grid.N[3 * q.tri + 1], grid.N[3 * q.tri + 2]];
      if (normals) {
        const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
        const rx = R[0] * nx + R[1] * ny + R[2] * nz, ry = R[3] * nx + R[4] * ny + R[5] * nz, rz = R[6] * nx + R[7] * ny + R[8] * nz;
        if (rx * n[0] + ry * n[1] + rz * n[2] < minDot) continue;
      }
      const r = n[0] * (tmp[i] - q.x) + n[1] * (tmp[i + 1] - q.y) + n[2] * (tmp[i + 2] - q.z);
      res.push(Math.abs(r));
      pairs.push([i, n, r]);
    }
    if (pairs.length < 12) break;
    const sig = Math.max(0.02, 1.4826 * median(res));
    let s2 = 0; inl = 0;
    for (const [i, n, r] of pairs) {
      if (Math.abs(r) > trim * sig + 0.05) continue;
      const p = [tmp[i], tmp[i + 1], tmp[i + 2]];
      const J = [p[1] * n[2] - p[2] * n[1], p[2] * n[0] - p[0] * n[2], p[0] * n[1] - p[1] * n[0], n[0], n[1], n[2]];
      for (let a = 0; a < 6; a++) { g[a] -= J[a] * r; for (let b = 0; b < 6; b++) H[a * 6 + b] += J[a] * J[b]; }
      s2 += r * r; inl++;
    }
    rmsv = Math.sqrt(s2 / Math.max(1, inl));
    for (let a = 0; a < 6; a++) H[a * 7] += 1e-9 + 1e-6 * H[a * 7];
    const x = cholSolve(H, 6, g);
    if (!x) break;
    const dR = rodrigues([x[0], x[1], x[2]]);
    R = mat3Mul(dR, R);
    const tt = mat3Vec(dR, t);
    t = [tt[0] + x[3], tt[1] + x[4], tt[2] + x[5]];
    dmax = Math.max(minDist, Math.min(dmax, 6 * sig + 0.5));
    if (Math.hypot(x[0], x[1], x[2]) < 1e-7 && Math.hypot(x[3], x[4], x[5]) < 1e-5) break;
  }
  return { R, t, rms: rmsv, inliers: inl };
}

// Alineación automática: identidad + 4 candidatos PCA, cada uno refinado con ICP corto.
export function autoAlign(scanPts, cadSamples, grid, { useIdentity = true, normals = null } = {}) {
  const S = subsample(scanPts, 1500);
  const SN = normals ? subsample(normals, 1500) : null;
  const ps = pca(S), pc = pca(subsample(cadSamples, 4000));
  const cands = [];
  if (useIdentity) cands.push({ R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0], name: 'posición actual' });
  for (const s of [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]) {
    // R = Ec * diag(s) * Es^T
    const Es = ps.E, Ec = pc.E;
    const D = [Ec[0] * s[0], Ec[1] * s[1], Ec[2] * s[2], Ec[3] * s[0], Ec[4] * s[1], Ec[5] * s[2], Ec[6] * s[0], Ec[7] * s[1], Ec[8] * s[2]];
    const EsT = [Es[0], Es[3], Es[6], Es[1], Es[4], Es[7], Es[2], Es[5], Es[8]];
    const R = mat3Mul(D, EsT);
    const rc = mat3Vec(R, ps.c);
    cands.push({ R, t: [pc.c[0] - rc[0], pc.c[1] - rc[1], pc.c[2] - rc[2]], name: 'ejes principales' });
  }
  let best = null;
  for (const c of cands) {
    const r = icp(S, grid, c.R, c.t, { iterations: 25, maxDist: 40, normals: SN });
    const score = r.rms / Math.max(0.05, r.inliers / (S.length / 3));
    if (!best || score < best.score) best = { ...r, score, name: c.name };
  }
  const fine = icp(subsample(scanPts, 12000), grid, best.R, best.t, { iterations: 40, maxDist: 5, normals: normals ? subsample(normals, 12000) : null });
  return { ...fine, start: best.name };
}

export function applyTransform(R, t, pts) { return transform(R, t, pts, new Float32Array(pts.length)); }
export function invertTransform(R, t) {
  const Rt = [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]];
  const ti = mat3Vec(Rt, t);
  return { R: Rt, t: [-ti[0], -ti[1], -ti[2]] };
}
