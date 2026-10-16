// Machine kinematics: pose of every tube cross-section and tool state at any time of the sequence.
// Pure ES module (no DOM, no three.js). Conventions: docs/INTERFACES.md §3–§5, §8.
//
// Pose composition (station s): at load M(s) = T(−s,0,0); each phase left-multiplies its op.
// Implementation: the material axis is split into zones — straight k (between bend k−1 and k)
// and arc j ([s0_j, s1_j]). Every op acts on a whole zone with one matrix, except the op of bend j
// on its own arc. So a straight zone is stored as M (pose = M·T(−s)) and an arc zone as
// (A, B, θ, ρ) (pose = A·F_j(u)·B·T(−s), u = s − s0_j, F_j the bend op). The zone state at the start
// of every phase is cached at build time; a call applies only the current phase op, as one left
// matrix per zone (plus the active arc's own θ, ρ).

import {
  DEG, mat4Identity, mat4Copy, mat4Multiply, mat4Translation, mat4RotationX, mat4InvertRigid, mat4DieRotation,
} from './geometry.js';

const LOAD_HEIGHT = 200; // mm, loadOffsetY at the start of `load` / end of `unload`
const smoothstep = (p) => p * p * (3 - 2 * p);
const WRAP_EPS = 1e-6;   // mm

export function buildKinematics({ lra, plan, OD }) {
  const layout = plan.layout;
  const phases = plan.sequence.phases;
  if (!phases || phases.length === 0) throw new Error('La secuencia del proceso está vacía');
  const nb = layout.bends.length;
  const cutLength = layout.cutLength;
  const nz = 2 * nb + 1;
  const bounds = new Float64Array(2 * nb);
  for (let j = 0; j < nb; j++) { bounds[2 * j] = layout.bends[j].s0; bounds[2 * j + 1] = layout.bends[j].s1; }

  // Bend radius and load angle per bend (release params carry no clr).
  const bendClr = new Float64Array(nb), bendLoad = new Float64Array(nb);
  for (let j = 0; j < nb; j++) {
    bendClr[j] = lra?.bends?.[j]?.clr ?? 0;
    bendLoad[j] = plan.bends?.[j]?.angleLoad ?? lra?.bends?.[j]?.A ?? 0;
  }
  for (const ph of phases) {
    if (ph.type === 'bend' && ph.bend >= 0) { bendClr[ph.bend] = ph.params.clr; bendLoad[ph.bend] = ph.params.angleLoad; }
  }

  const duration = plan.sequence.totalTime ?? phases.reduce((m, ph) => Math.max(m, ph.start + ph.duration), 0);

  // ─── op description of phase k at eased progress e ───
  // Returns null (no tube motion), { uniform: U } or { bend: j, ahead, theta, rho } (behind = T(ρθ) for
  // bend, identity for release; for release `ahead` is the replacement correction, see below).
  const opU = new Float64Array(16), opAhead = new Float64Array(16), opBehind = new Float64Array(16);
  const t1 = new Float64Array(16), t2 = new Float64Array(16);
  function phaseOp(k, e, zones) {
    const ph = phases[k];
    switch (ph.type) {
      case 'feed':
        mat4Translation(ph.params.distance * e, 0, 0, opU);
        return { uniform: opU };
      case 'rotate':
        mat4RotationX(ph.params.angle * e * DEG, opU);
        return { uniform: opU };
      case 'bend': {
        const j = ph.bend, rho = ph.params.clr, theta = ph.params.angleLoad * e * DEG;
        mat4DieRotation(rho, theta, opAhead);
        mat4Translation(rho * theta, 0, 0, opBehind);
        return { bend: j, ahead: opAhead, behind: opBehind, theta, rho, started: true };
      }
      case 'release': {
        // Replaces the bend op (θl, clr) by (θ, ρ) with ρ·θ = clr·θl: front swings, rear and
        // tangent fixed. Zones ahead were left-multiplied by A_j·Rdie_clr(θl) (A_j = ops after the
        // bend, as stored on arc j), so the correction is A_j·Rdie_ρ(θ)·Rdie_clr(θl)⁻¹·A_j⁻¹.
        const j = ph.bend, clr = bendClr[j];
        const thl = ph.params.angleLoad * DEG, thf = ph.params.angleFinal * DEG;
        const theta = thl + (thf - thl) * e;
        const rho = (clr * thl) / theta;
        const Aj = zones[2 * j + 1].A;
        mat4DieRotation(rho, theta, t1);
        mat4Multiply(t1, mat4InvertRigid(mat4DieRotation(clr, thl, t2), t2), t1);
        mat4Multiply(Aj, t1, t1);
        mat4Multiply(t1, mat4InvertRigid(Aj, t2), opAhead);
        mat4Identity(opBehind);
        return { bend: j, ahead: opAhead, behind: opBehind, theta, rho, started: true };
      }
      default:
        return null;
    }
  }

  // ─── zone state ───
  function initialZones() {
    const z = [];
    for (let i = 0; i < nz; i++) {
      if (i % 2 === 0) z.push({ arc: false, M: mat4Identity() });
      else { const j = (i - 1) / 2; z.push({ arc: true, j, A: mat4Identity(), B: mat4Identity(), started: false, theta: 0, rho: bendClr[j] }); }
    }
    return z;
  }
  function cloneZones(zs) {
    return zs.map((z) => (z.arc ? { ...z, A: mat4Copy(z.A), B: mat4Copy(z.B) } : { arc: false, M: mat4Copy(z.M) }));
  }
  function applyOp(zs, op) {
    if (!op) return;
    if (op.uniform) {
      for (const z of zs) {
        if (!z.arc) mat4Multiply(op.uniform, z.M, z.M);
        else if (z.started) mat4Multiply(op.uniform, z.A, z.A);
        else mat4Multiply(op.uniform, z.B, z.B);
      }
      return;
    }
    const ja = 2 * op.bend + 1;
    for (let i = 0; i < nz; i++) {
      const z = zs[i];
      if (i === ja) { z.started = true; z.theta = op.theta; z.rho = op.rho; continue; }
      const L = i < ja ? op.ahead : op.behind;
      if (!z.arc) mat4Multiply(L, z.M, z.M);
      else if (z.started) mat4Multiply(L, z.A, z.A);
      else mat4Multiply(L, z.B, z.B);
    }
  }

  // ─── tool state ───
  const stackY = (level) => -(plan.stacks?.find((st) => st.level === level)?.yOffset ?? 0);
  function initialState() {
    let level = plan.stacks?.[plan.bends?.[0]?.stack ?? 0]?.level ?? 0;
    const firstStack = phases.find((ph) => ph.type === 'stackChange');
    const firstBend = phases.findIndex((ph) => ph.type === 'bend');
    if (firstStack && (firstBend < 0 || phases.indexOf(firstStack) < firstBend)) level = firstStack.params.fromLevel;
    return {
      dieAngle: 0, clampOpen: 1, pressureDieOpen: 1, pressureDieTravel: 0, mandrelOffset: 0,
      carriageX: -cutLength, colletRotation: 0, headY: stackY(level), activeStack: level,
      loadOffsetY: phases[0].type === 'load' ? LOAD_HEIGHT : 0,
    };
  }
  function applyState(st0, ph, e) {
    const st = { ...st0 };
    const p = ph.params || {};
    switch (ph.type) {
      case 'load': st.loadOffsetY = LOAD_HEIGHT * (1 - e); break;
      case 'unload': st.loadOffsetY = LOAD_HEIGHT * e; break;
      case 'stackChange': {
        const y0 = stackY(p.fromLevel), y1 = stackY(p.toLevel);
        st.headY = y0 + (y1 - y0) * e;
        st.activeStack = e >= 1 ? p.toLevel : p.fromLevel;
        break;
      }
      case 'feed': st.carriageX += p.distance * e; break;
      case 'rotate': st.colletRotation += p.angle * e; break;
      case 'clamp': st.clampOpen = 1 - e; st.pressureDieOpen = 1 - e; break;
      case 'bend': {
        const th = p.angleLoad * e;
        st.dieAngle = th;
        st.carriageX += p.clr * th * DEG;
        st.pressureDieTravel = p.clr * th * DEG;
        break;
      }
      case 'mandrelRetract': st.mandrelOffset = -p.distance * e; break;
      case 'release': st.clampOpen = e; st.pressureDieOpen = e; break;
      case 'return':
        st.dieAngle = st0.dieAngle * (1 - e) + 0; // + 0 avoids −0
        st.pressureDieTravel = st0.pressureDieTravel * (1 - e) + 0;
        st.mandrelOffset = st0.mandrelOffset * (1 - e) + 0;
        break;
      default: break;
    }
    return st;
  }

  // ─── caches at each phase start ───
  const zoneCache = [], stateCache = [];
  {
    let zs = initialZones(), st = initialState();
    for (let k = 0; k < phases.length; k++) {
      zoneCache.push(cloneZones(zs));
      stateCache.push(st);
      applyOp(zs, phaseOp(k, 1, zs));
      st = applyState(st, phases[k], 1);
    }
    zoneCache.push(zs); stateCache.push(st); // after the last phase
  }

  // ─── time → (phase, progress) ───
  function locate(t) {
    // last phase with start ≤ t (zero-duration phases at the same instant count as completed)
    let lo = 0, hi = phases.length - 1;
    if (t < phases[0].start) return { k: 0, p: 0 };
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (phases[mid].start <= t) lo = mid; else hi = mid - 1;
    }
    const ph = phases[lo];
    const p = ph.duration > 0 ? Math.min(1, Math.max(0, (t - ph.start) / ph.duration)) : 1;
    return { k: lo, p };
  }
  function stateAtK(k, p) {
    const ph = phases[k];
    const st = applyState(stateCache[k], ph, smoothstep(p));
    st.phaseIndex = k; st.phase = ph.type; st.progress = p; st.bendIndex = ph.bend ?? -1; st.label = ph.label ?? '';
    return st;
  }
  function stateAt(t) {
    const { k, p } = locate(t);
    return stateAtK(k, p);
  }

  // ─── poses ───
  const zoneK = [];          // per zone: combined left matrix (Y·L·M for straights, Y·L·A for arcs)
  for (let i = 0; i < nz; i++) zoneK.push(new Float64Array(16));
  const Ymat = new Float64Array(16), Lz = new Float64Array(16), F = new Float64Array(16), BS = new Float64Array(16), FB = new Float64Array(16);
  const IDENT = mat4Identity();

  function zoneOf(s) {
    let lo = 0, hi = bounds.length; // number of bounds b with b ≤ s ... arcs closed on both ends
    while (lo < hi) { const mid = (lo + hi) >> 1; if (bounds[mid] <= s) lo = mid + 1; else hi = mid; }
    // lo = count of bounds ≤ s. Even count → straight zone lo; odd → arc zone lo.
    if (lo % 2 === 0 && lo > 0 && s === bounds[lo - 1]) return lo - 1; // s exactly at s1 → arc end
    return lo;
  }

  function evaluate(k, p, sArray, outPoses, outFormed) {
    const zs = zoneCache[k];
    const e = smoothstep(p);
    const st = applyState(stateCache[k], phases[k], e);
    const op = phaseOp(k, e, zs);
    mat4Translation(0, st.loadOffsetY, 0, Ymat);
    const ja = op && !op.uniform ? 2 * op.bend + 1 : -1;
    for (let i = 0; i < nz; i++) {
      const z = zs[i];
      let L = IDENT;
      if (op) L = op.uniform ? op.uniform : i < ja ? op.ahead : i > ja ? op.behind : IDENT;
      mat4Multiply(Ymat, L, Lz);
      if (!z.arc) mat4Multiply(Lz, z.M, zoneK[i]);
      else if (z.started || i === ja) mat4Multiply(Lz, z.A, zoneK[i]);
      else mat4Multiply(Lz, z.B, zoneK[i]); // unstarted arc: pose = L·B·T(−s), A = I
    }
    const n = sArray.length;
    for (let m = 0; m < n; m++) {
      const s = sArray[m];
      const zi = zoneOf(s);
      const K = zoneK[zi];
      const o = 16 * m;
      const z = zs[zi];
      let formed = 0;
      if (!z.arc || !(z.started || zi === ja)) {
        // pose = K·T(−s)
        for (let c = 0; c < 12; c++) outPoses[o + c] = K[c];
        outPoses[o + 12] = K[12] - s * K[0];
        outPoses[o + 13] = K[13] - s * K[1];
        outPoses[o + 14] = K[14] - s * K[2];
        outPoses[o + 15] = 1;
      } else {
        const theta = zi === ja ? op.theta : z.theta;
        const rho = zi === ja ? op.rho : z.rho;
        const u = s - bounds[zi - 1];
        const wrapped = rho * theta;
        if (u <= wrapped) { mat4DieRotation(rho, theta - u / rho, F); F[12] += u * F[0]; F[14] += u * F[2]; }
        else mat4Translation(wrapped, 0, 0, F);
        formed = wrapped > 0 && u <= wrapped + WRAP_EPS ? 1 : 0;
        // B·T(−s)
        for (let c = 0; c < 12; c++) BS[c] = z.B[c];
        BS[12] = z.B[12] - s * z.B[0]; BS[13] = z.B[13] - s * z.B[1]; BS[14] = z.B[14] - s * z.B[2]; BS[15] = 1;
        mat4Multiply(F, BS, FB);
        mat4Multiply(K, FB, Lz);
        for (let c = 0; c < 16; c++) outPoses[o + c] = Lz[c];
      }
      if (outFormed) outFormed[m] = formed;
    }
    return st;
  }

  function posesAt(t, sArray, outPoses, outFormed) {
    const { k, p } = locate(t);
    evaluate(k, p, sArray, outPoses, outFormed);
    return outPoses;
  }

  function centerlineAt(t, sArray) {
    const poses = new Float64Array(16 * sArray.length);
    posesAt(t, sArray, poses, null);
    const pts = new Array(sArray.length);
    for (let m = 0; m < sArray.length; m++) pts[m] = [poses[16 * m + 12], poses[16 * m + 13], poses[16 * m + 14]];
    return pts;
  }

  /**
   * Collision check of the tube centerline against axis-aligned boxes inflated by OD/2, sampled at
   * every phase end and 8 interior instants of each rotate/bend phase. Stations within 1.5·OD of the
   * tangent point (along the tube) are skipped (own clamp/die contact). One hit per phase+volume.
   */
  function interference(volumes, od = OD) {
    const r = od / 2;
    const step = Math.max(od / 4, cutLength / 4000);
    const ns = Math.ceil(cutLength / step) + 1;
    const sArr = new Float64Array(ns);
    for (let i = 0; i < ns; i++) sArr[i] = Math.min(i * step, cutLength);
    const poses = new Float64Array(16 * ns);
    const hits = [], seen = new Set();
    for (let k = 0; k < phases.length; k++) {
      const ph = phases[k];
      const samples = ph.type === 'rotate' || ph.type === 'bend' ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => i / 9) : [1];
      for (const p of samples) {
        const st = evaluate(k, p, sArr, poses, null);
        const sTan = cutLength + st.carriageX; // station at the tangent point (x = 0 on the axis)
        for (const vol of volumes) {
          const key = k + '|' + vol.name;
          if (seen.has(key)) continue;
          const mn = vol.min, mx = vol.max;
          for (let i = 0; i < ns; i++) {
            if (Math.abs(sArr[i] - sTan) <= 1.5 * od) continue;
            const x = poses[16 * i + 12], y = poses[16 * i + 13], z = poses[16 * i + 14];
            if (x >= mn[0] - r && x <= mx[0] + r && y >= mn[1] - r && y <= mx[1] + r && z >= mn[2] - r && z <= mx[2] + r) {
              seen.add(key);
              hits.push({ phaseIndex: k, bend: ph.bend ?? -1, volume: vol.name, point: [x, y, z], s: sArr[i], t: ph.start + p * ph.duration });
              break;
            }
          }
        }
      }
    }
    return hits;
  }

  return { stateAt, posesAt, centerlineAt, interference, duration };
}
