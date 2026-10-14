// Calibración de cámara (Zhang + Levenberg–Marquardt) y estimación de pose (PnP planar).
// Todas las fotos comparten la misma cámara (mismo zoom y enfoque).
import {
  nullVector, mat3Inv, nearestRotation, rodrigues, mat3Mul, v3,
  cholSolve, invSPD, median,
} from './linalg.js';
import { makeIntrinsics, projectJac, pixelToNormalized, projectPoint } from './camera.js';

// ---------- Homografía (DLT normalizada) ----------
function normT(pts) {
  let mx = 0, my = 0;
  for (const p of pts) { mx += p[0]; my += p[1]; }
  mx /= pts.length; my /= pts.length;
  let d = 0;
  for (const p of pts) d += Math.hypot(p[0] - mx, p[1] - my);
  const s = Math.SQRT2 / (d / pts.length || 1);
  return [s, 0, -s * mx, 0, s, -s * my, 0, 0, 1];
}
export function homographyDLT(src, dst) {
  const n = src.length;
  if (n < 4) return null;
  const T1 = normT(src), T2 = normT(dst);
  const A = new Float64Array(2 * n * 9);
  for (let i = 0; i < n; i++) {
    const x = T1[0] * src[i][0] + T1[2], y = T1[4] * src[i][1] + T1[5];
    const u = T2[0] * dst[i][0] + T2[2], v = T2[4] * dst[i][1] + T2[5];
    A.set([-x, -y, -1, 0, 0, 0, u * x, u * y, u], 18 * i);
    A.set([0, 0, 0, -x, -y, -1, v * x, v * y, v], 18 * i + 9);
  }
  const { v: h } = nullVector(A, 2 * n, 9);
  const Hn = Array.from(h);
  const T2i = mat3Inv(T2);
  const H = mat3Mul(mat3Mul(T2i, Hn), T1);
  const s = H[8] !== 0 ? 1 / H[8] : 1;
  return H.map(x => x * s);
}

// Focal inicial a partir de homografías (punto principal en el centro, píxeles cuadrados).
export function focalFromHomographies(Hs, cx, cy) {
  const est = [];
  let num = 0, den = 0;
  for (const H0 of Hs) {
    const H = [
      H0[0] - cx * H0[6], H0[1] - cx * H0[7], H0[2] - cx * H0[8],
      H0[3] - cy * H0[6], H0[4] - cy * H0[7], H0[5] - cy * H0[8],
      H0[6], H0[7], H0[8],
    ];
    const nrm = Math.hypot(...H);
    for (let i = 0; i < 9; i++) H[i] /= nrm;
    const h1 = [H[0], H[3], H[6]], h2 = [H[1], H[4], H[7]];
    const a1 = h1[0] * h2[0] + h1[1] * h2[1], c1 = h1[2] * h2[2];
    const a2 = h1[0] * h1[0] + h1[1] * h1[1] - h2[0] * h2[0] - h2[1] * h2[1], c2 = h1[2] * h1[2] - h2[2] * h2[2];
    num += a1 * c1 + a2 * c2; den += a1 * a1 + a2 * a2;
    const wv = -(a1 * c1 + a2 * c2) / (a1 * a1 + a2 * a2);
    if (wv > 0) est.push(1 / Math.sqrt(wv));
  }
  const wAll = -num / den;
  return { global: wAll > 0 ? 1 / Math.sqrt(wAll) : null, perView: est, median: est.length ? median(est) : null };
}

// Pose a partir de la homografía entre el plano del tablero y coordenadas normalizadas.
export function poseFromNormalizedHomography(H) {
  const h1 = [H[0], H[3], H[6]], h2 = [H[1], H[4], H[7]], h3 = [H[2], H[5], H[8]];
  let lam = 2 / (v3.norm(h1) + v3.norm(h2));
  if (h3[2] * lam < 0) lam = -lam; // el tablero debe estar delante de la cámara
  const r1 = v3.scale(h1, lam), r2 = v3.scale(h2, lam);
  const r3 = v3.cross(r1, r2);
  const R = nearestRotation([r1[0], r2[0], r3[0], r1[1], r2[1], r3[1], r1[2], r2[2], r3[2]]);
  const t = v3.scale(h3, lam);
  return { R, t };
}

// ---------- Refinamiento de pose de una vista (LM, Huber) ----------
export function refinePose(K, pts3, pts2, R0, t0, { huber = 2, maxIter = 30 } = {}) {
  let R = R0.slice(), t = t0.slice();
  const evalCost = (R, t) => {
    let c = 0;
    for (let i = 0; i < pts3.length; i++) {
      const [u, v, z] = projectPoint(K, R, t, pts3[i]);
      if (!(z > 0)) return Infinity;
      const e = Math.hypot(pts2[i][0] - u, pts2[i][1] - v);
      c += e <= huber ? 0.5 * e * e : huber * (e - 0.5 * huber);
    }
    return c;
  };
  let cost = evalCost(R, t), lambda = 1e-3;
  for (let it = 0; it < maxIter; it++) {
    const H = new Float64Array(36), g = new Float64Array(6);
    for (let i = 0; i < pts3.length; i++) {
      const pj = projectJac(K, R, t, pts3[i]);
      const ru = pts2[i][0] - pj.u, rv = pts2[i][1] - pj.v;
      const e = Math.hypot(ru, rv);
      const w = e <= huber ? 1 : huber / e;
      for (let a = 0; a < 6; a++) {
        g[a] += w * (pj.Jp[a] * ru + pj.Jp[6 + a] * rv);
        for (let b = 0; b < 6; b++) H[a * 6 + b] += w * (pj.Jp[a] * pj.Jp[b] + pj.Jp[6 + a] * pj.Jp[6 + b]);
      }
    }
    let improved = false;
    for (let tries = 0; tries < 10; tries++) {
      const Hd = Float64Array.from(H);
      for (let a = 0; a < 6; a++) Hd[a * 7] += lambda * (H[a * 7] + 1e-9);
      const d = cholSolve(Hd, 6, g);
      if (!d) { lambda *= 10; continue; }
      const Rn = mat3Mul(rodrigues([d[0], d[1], d[2]]), R);
      const tn = [t[0] + d[3], t[1] + d[4], t[2] + d[5]];
      const cn = evalCost(Rn, tn);
      if (cn < cost) {
        const rel = (cost - cn) / (cost + 1e-30);
        R = Rn; t = tn; cost = cn; lambda = Math.max(lambda / 10, 1e-12); improved = true;
        if (rel < 1e-12) it = maxIter;
        break;
      }
      lambda *= 10;
    }
    if (!improved) break;
  }
  return { R, t, cost };
}

// PnP para un tablero plano (Z = 0) con intrínsecos conocidos.
export function solvePnPPlanar(K, pts3, pts2) {
  if (pts3.length < 4) return null;
  const src = pts3.map(p => [p[0], p[1]]);
  const dst = pts2.map(p => pixelToNormalized(K, p[0], p[1]));
  const H = homographyDLT(src, dst);
  if (!H) return null;
  const p0 = poseFromNormalizedHomography(H);
  const r = refinePose(K, pts3, pts2, p0.R, p0.t);
  return reprojStats(K, r.R, r.t, pts3, pts2);
}

export function reprojStats(K, R, t, pts3, pts2) {
  const errs = pts3.map((X, i) => {
    const [u, v] = projectPoint(K, R, t, X);
    return Math.hypot(pts2[i][0] - u, pts2[i][1] - v);
  });
  let s = 0;
  for (const e of errs) s += e * e;
  return { R, t, errs, rms: Math.sqrt(s / Math.max(1, errs.length)) };
}

// ---------- Ajuste conjunto de intrínsecos + poses ----------
const PNAMES = { sep: ['fx', 'fy', 'cx', 'cy', 'k1', 'k2', 'p1', 'p2', 'k3'], one: ['f', 'cx', 'cy', 'k1', 'k2', 'p1', 'p2', 'k3'] };

function intrVec(K, sep) {
  return sep ? [K.fx, K.fy, K.cx, K.cy, K.k1, K.k2, K.p1, K.p2, K.k3] : [K.fx, K.cx, K.cy, K.k1, K.k2, K.p1, K.p2, K.k3];
}
function intrFromVec(K, v, sep) {
  const o = { ...K };
  if (sep) { [o.fx, o.fy, o.cx, o.cy, o.k1, o.k2, o.p1, o.p2, o.k3] = v; }
  else { [o.fx, o.cx, o.cy, o.k1, o.k2, o.p1, o.p2, o.k3] = v; o.fy = o.fx; }
  return o;
}

// views: [{ R, t, obs: [{ X, uv, active }] , active }]
export function bundleCalibrate(K0, views, opts = {}) {
  const o = { sepFocal: false, fixK3: true, fixTangential: false, fixPrincipal: false, fixDistortion: false, huber: 1.0, maxIter: 80, ...opts };
  const sep = o.sepFocal, full = sep ? 9 : 8;
  const names = sep ? PNAMES.sep : PNAMES.one;
  const free = [];
  for (let i = 0; i < full; i++) {
    const nm = names[i];
    if (o.fixK3 && nm === 'k3') continue;
    if (o.fixTangential && (nm === 'p1' || nm === 'p2')) continue;
    if (o.fixPrincipal && (nm === 'cx' || nm === 'cy')) continue;
    if (o.fixDistortion && /^[kp]/.test(nm)) continue;
    free.push(i);
  }
  const nI = free.length;
  let K = { ...K0 };
  const act = views.map(v => v.active !== false);
  const robust = (e) => e <= o.huber ? 0.5 * e * e : o.huber * (e - 0.5 * o.huber);
  const costOf = (K, poses) => {
    let c = 0;
    for (let vi = 0; vi < views.length; vi++) {
      if (!act[vi]) continue;
      const { R, t } = poses[vi];
      for (const ob of views[vi].obs) {
        if (ob.active === false) continue;
        const [u, v, z] = projectPoint(K, R, t, ob.X);
        if (!(z > 0)) return Infinity;
        c += robust(Math.hypot(ob.uv[0] - u, ob.uv[1] - v));
      }
    }
    return c;
  };
  let poses = views.map(v => ({ R: v.R.slice(), t: v.t.slice() }));
  let cost = costOf(K, poses);
  let lambda = 1e-3;
  let lastS = null;
  for (let it = 0; it < o.maxIter; it++) {
    const Hii = new Float64Array(nI * nI), gI = new Float64Array(nI);
    const blocks = views.map(() => ({ Hvv: new Float64Array(36), Hiv: new Float64Array(nI * 6), gv: new Float64Array(6) }));
    const JIu = new Float64Array(nI), JIv = new Float64Array(nI);
    for (let vi = 0; vi < views.length; vi++) {
      if (!act[vi]) continue;
      const B = blocks[vi];
      const { R, t } = poses[vi];
      for (const ob of views[vi].obs) {
        if (ob.active === false) continue;
        const pj = projectJac(K, R, t, ob.X, sep);
        const ru = ob.uv[0] - pj.u, rv = ob.uv[1] - pj.v;
        const e = Math.hypot(ru, rv);
        const w = e <= o.huber ? 1 : o.huber / e;
        for (let a = 0; a < nI; a++) { JIu[a] = pj.Ji[free[a]]; JIv[a] = pj.Ji[full + free[a]]; }
        const Jp = pj.Jp;
        for (let a = 0; a < nI; a++) {
          gI[a] += w * (JIu[a] * ru + JIv[a] * rv);
          for (let b = a; b < nI; b++) Hii[a * nI + b] += w * (JIu[a] * JIu[b] + JIv[a] * JIv[b]);
          for (let b = 0; b < 6; b++) B.Hiv[a * 6 + b] += w * (JIu[a] * Jp[b] + JIv[a] * Jp[6 + b]);
        }
        for (let a = 0; a < 6; a++) {
          B.gv[a] += w * (Jp[a] * ru + Jp[6 + a] * rv);
          for (let b = a; b < 6; b++) B.Hvv[a * 6 + b] += w * (Jp[a] * Jp[b] + Jp[6 + a] * Jp[6 + b]);
        }
      }
      for (let a = 0; a < 6; a++) for (let b = 0; b < a; b++) B.Hvv[a * 6 + b] = B.Hvv[b * 6 + a];
    }
    for (let a = 0; a < nI; a++) for (let b = 0; b < a; b++) Hii[a * nI + b] = Hii[b * nI + a];

    let improved = false;
    for (let tries = 0; tries < 12; tries++) {
      // complemento de Schur con amortiguamiento de Marquardt
      const S = Float64Array.from(Hii), bI = Float64Array.from(gI);
      for (let a = 0; a < nI; a++) S[a * nI + a] += lambda * (Hii[a * nI + a] + 1e-12);
      const solved = [];
      let fail = false;
      for (let vi = 0; vi < views.length; vi++) {
        if (!act[vi]) { solved.push(null); continue; }
        const B = blocks[vi];
        const Hd = Float64Array.from(B.Hvv);
        for (let a = 0; a < 6; a++) Hd[a * 7] += lambda * (B.Hvv[a * 7] + 1e-12);
        const Hinv = invSPD(Hd, 6);
        if (!Hinv) { fail = true; break; }
        // M = Hinv * Hivᵀ (6 x nI), m = Hinv * gv
        const M = new Float64Array(6 * nI), m = new Float64Array(6);
        for (let a = 0; a < 6; a++) {
          for (let c = 0; c < 6; c++) m[a] += Hinv[a * 6 + c] * B.gv[c];
          for (let j = 0; j < nI; j++) {
            let s = 0;
            for (let c = 0; c < 6; c++) s += Hinv[a * 6 + c] * B.Hiv[j * 6 + c];
            M[a * nI + j] = s;
          }
        }
        for (let i = 0; i < nI; i++) {
          for (let j = 0; j < nI; j++) {
            let s = 0;
            for (let c = 0; c < 6; c++) s += B.Hiv[i * 6 + c] * M[c * nI + j];
            S[i * nI + j] -= s;
          }
          let s2 = 0;
          for (let c = 0; c < 6; c++) s2 += B.Hiv[i * 6 + c] * m[c];
          bI[i] -= s2;
        }
        solved.push({ Hinv, M, m });
      }
      if (fail) { lambda *= 10; continue; }
      const dI = nI ? cholSolve(S, nI, bI) : new Float64Array(0);
      if (!dI) { lambda *= 10; continue; }
      const vec = intrVec(K, sep);
      for (let a = 0; a < nI; a++) vec[free[a]] += dI[a];
      const Kn = intrFromVec(K, vec, sep);
      const posesN = poses.map((p, vi) => {
        if (!act[vi]) return p;
        const { M, m } = solved[vi];
        const d = new Float64Array(6);
        for (let a = 0; a < 6; a++) {
          let s = m[a];
          for (let j = 0; j < nI; j++) s -= M[a * nI + j] * dI[j];
          d[a] = s;
        }
        return { R: mat3Mul(rodrigues([d[0], d[1], d[2]]), p.R), t: [p.t[0] + d[3], p.t[1] + d[4], p.t[2] + d[5]] };
      });
      const cn = costOf(Kn, posesN);
      if (cn < cost) {
        const rel = (cost - cn) / (cost + 1e-30);
        K = Kn; poses = posesN; cost = cn; lambda = Math.max(lambda / 10, 1e-12);
        improved = true;
        if (rel < 1e-11) it = o.maxIter;
        break;
      }
      lambda *= 10;
    }
    if (!improved) break;
  }
  // información de los intrínsecos (Schur sin amortiguar) para covarianza
  lastS = schurInfo(K, poses, views, act, free, full, sep, o.huber);
  return { K, poses, cost, free, names: free.map(i => names[i]), info: lastS };
}

function schurInfo(K, poses, views, act, free, full, sep, huber) {
  const nI = free.length;
  const S = new Float64Array(nI * nI);
  let n = 0, s2 = 0;
  for (let vi = 0; vi < views.length; vi++) {
    if (!act[vi]) continue;
    const Hvv = new Float64Array(36), Hiv = new Float64Array(nI * 6);
    const { R, t } = poses[vi];
    for (const ob of views[vi].obs) {
      if (ob.active === false) continue;
      const pj = projectJac(K, R, t, ob.X, sep);
      const ru = ob.uv[0] - pj.u, rv = ob.uv[1] - pj.v;
      s2 += ru * ru + rv * rv; n += 2;
      for (let a = 0; a < nI; a++) {
        const au = pj.Ji[free[a]], av = pj.Ji[full + free[a]];
        for (let b = 0; b < nI; b++) S[a * nI + b] += au * pj.Ji[free[b]] + av * pj.Ji[full + free[b]];
        for (let b = 0; b < 6; b++) Hiv[a * 6 + b] += au * pj.Jp[b] + av * pj.Jp[6 + b];
      }
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) Hvv[a * 6 + b] += pj.Jp[a] * pj.Jp[b] + pj.Jp[6 + a] * pj.Jp[6 + b];
    }
    const Hinv = invSPD(Hvv, 6);
    if (!Hinv) continue;
    for (let i = 0; i < nI; i++) for (let j = 0; j < nI; j++) {
      let s = 0;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) s += Hiv[i * 6 + a] * Hinv[a * 6 + b] * Hiv[j * 6 + b];
      S[i * nI + j] -= s;
    }
  }
  const nViews = act.filter(Boolean).length;
  const dof = Math.max(1, n - nI - 6 * nViews);
  const sigma2 = s2 / dof;
  const cov = nI ? invSPD(S, nI) : null;
  const std = cov ? Array.from({ length: nI }, (_, i) => Math.sqrt(Math.max(0, cov[i * nI + i] * sigma2))) : [];
  return { sigma: Math.sqrt(sigma2), std, nResiduals: n };
}

// ---------- Flujo completo ----------
// views: [{ width, height, obs: [{ X, uv }] }], todas de la misma cámara.
// Devuelve { ok, K, views: [{ R, t, rms, n, used, reason }], rms, std, log }
export function calibrateCamera(inputViews, opts = {}) {
  const o = { minPoints: 12, fInit: null, maxOutlierPx: 1.0, outlierSigma: 6, ...opts };
  const log = [];
  if (!inputViews.length) return { ok: false, error: 'No hay vistas.' };
  const W = inputViews[0].width, Hh = inputViews[0].height;
  const cx0 = (W - 1) / 2, cy0 = (Hh - 1) / 2;
  const views = inputViews.map((v, i) => ({ index: i, obs: v.obs.map(ob => ({ ...ob, active: true })), active: v.obs.length >= o.minPoints }));
  const usable = views.filter(v => v.active);
  if (usable.length < 3) return { ok: false, error: `Se necesitan al menos 3 fotos con el tablero visible (hay ${usable.length}).` };
  // homografías por vista
  for (const v of usable) {
    v.H = homographyDLT(v.obs.map(ob => [ob.X[0], ob.X[1]]), v.obs.map(ob => ob.uv));
  }
  const fh = focalFromHomographies(usable.map(v => v.H).filter(Boolean), cx0, cy0);
  let f0 = o.fInit;
  const plausible = (f) => f && f > 0.25 * Math.max(W, Hh) && f < 6 * Math.max(W, Hh);
  if (!plausible(f0)) f0 = plausible(fh.median) ? fh.median : (plausible(fh.global) ? fh.global : 0.85 * Math.max(W, Hh));
  log.push(`Focal inicial: ${f0.toFixed(1)} px (homografías: global ${fh.global ? fh.global.toFixed(1) : '—'}, mediana ${fh.median ? fh.median.toFixed(1) : '—'}; EXIF ${o.fInit ? o.fInit.toFixed(1) : '—'})`);
  let K = makeIntrinsics({ width: W, height: Hh, f: f0, cx: cx0, cy: cy0 });
  // poses iniciales
  for (const v of usable) {
    const pnp = solvePnPPlanar(K, v.obs.map(ob => ob.X), v.obs.map(ob => ob.uv));
    if (!pnp) { v.active = false; continue; }
    v.R = pnp.R; v.t = pnp.t;
  }
  const act = () => views.filter(v => v.active);
  // etapa 1: focal + poses (sin distorsión, punto principal fijo)
  let res = bundleCalibrate(K, act(), { ...o.flags, fixDistortion: true, fixPrincipal: true, huber: 4 });
  K = res.K; act().forEach((v, i) => { v.R = res.poses[i].R; v.t = res.poses[i].t; });
  // etapa 2: todos los parámetros
  const flags = { fixK3: true, fixTangential: false, fixPrincipal: false, sepFocal: false, ...(o.flags || {}) };
  res = bundleCalibrate(K, act(), { ...flags, huber: 2 });
  K = res.K; act().forEach((v, i) => { v.R = res.poses[i].R; v.t = res.poses[i].t; });
  // rechazo de atípicos y repetición
  for (let round = 0; round < 3; round++) {
    const errs = [];
    for (const v of act()) for (const ob of v.obs) {
      const [u, vv] = projectPoint(K, v.R, v.t, ob.X);
      ob.err = Math.hypot(ob.uv[0] - u, ob.uv[1] - vv);
      if (ob.active) errs.push(ob.err);
    }
    const sig = 1.4826 * median(errs);
    const thr = Math.max(o.maxOutlierPx, o.outlierSigma * sig);
    let removed = 0;
    for (const v of act()) {
      for (const ob of v.obs) {
        const a = ob.err <= thr;
        if (ob.active && !a) removed++;
        ob.active = a;
      }
      if (v.obs.filter(ob => ob.active).length < o.minPoints) { v.active = false; v.reason = 'pocos puntos válidos'; }
    }
    log.push(`Ronda ${round + 1}: umbral ${thr.toFixed(2)} px, ${removed} observaciones atípicas descartadas.`);
    if (!removed && round > 0) break;
    res = bundleCalibrate(K, act(), { ...flags, huber: Math.max(0.5, 3 * sig) });
    K = res.K; act().forEach((v, i) => { v.R = res.poses[i].R; v.t = res.poses[i].t; });
  }
  // estadísticas finales
  let s2 = 0, n = 0;
  const outViews = views.map(v => {
    if (!v.active || !v.R) return { index: v.index, used: false, reason: v.reason || 'tablero insuficiente', n: v.obs.length };
    let vs = 0, vn = 0;
    for (const ob of v.obs) {
      const [u, vv] = projectPoint(K, v.R, v.t, ob.X);
      ob.err = Math.hypot(ob.uv[0] - u, ob.uv[1] - vv);
      if (ob.active) { vs += ob.err * ob.err; vn++; }
    }
    s2 += vs; n += vn;
    return { index: v.index, used: true, R: v.R, t: v.t, rms: Math.sqrt(vs / Math.max(1, vn)), n: vn, nTotal: v.obs.length, errs: v.obs.map(ob => ob.err), active: v.obs.map(ob => ob.active) };
  });
  const std = {};
  res.names.forEach((nm, i) => { std[nm] = res.info.std[i]; });
  return { ok: true, K, views: outViews, rms: Math.sqrt(s2 / Math.max(1, n)), nPoints: n, std, sigma: res.info.sigma, log };
}

// Pose de una foto adicional con la cámara ya calibrada.
export function registerView(K, obs, minPoints = 8) {
  if (obs.length < minPoints) return null;
  const pnp = solvePnPPlanar(K, obs.map(o => o.X), obs.map(o => o.uv));
  if (!pnp) return null;
  // descartar atípicos y refinar
  const keep = obs.filter((o, i) => pnp.errs[i] < Math.max(1.5, 5 * pnp.rms));
  if (keep.length < minPoints) return null;
  const r = refinePose(K, keep.map(o => o.X), keep.map(o => o.uv), pnp.R, pnp.t, { huber: 1 });
  return reprojStats(K, r.R, r.t, keep.map(o => o.X), keep.map(o => o.uv));
}
