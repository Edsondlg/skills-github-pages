import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeBends, makeFieldSampler, recommendTooling, springback, bendingMoment, flowStress, strainsAt, CAL, LIMITS,
} from '../js/mechanics.js';
import { getMaterial } from '../js/materials.js';
import { makeCase } from './helpers/stub-plan.mjs';

const SAE1010 = getMaterial('sae1010-cew');

function analyze(args, options = {}) {
  const material = args.material;
  const c = makeCase(args);
  return { ...c, material, options, analysis: analyzeBends({ ...c, material, options }) };
}

const caseA = (over = {}) => analyze({
  material: SAE1010, OD: 50.8, t: 1.65, bends: [{ clr: 101.6, A: 90 }], mandrel: { balls: 3 }, wiper: true, ...over,
});

test('helpers: flow stress, moment, strains', () => {
  assert.ok(Math.abs(flowStress(SAE1010, 0) - SAE1010.ys) / SAE1010.ys < 0.03);
  assert.ok(flowStress(SAE1010, 0.2) > flowStress(SAE1010, 0.1));
  const M = bendingMoment({ material: SAE1010, OD: 50.8, t: 1.65, clr: 101.6 });
  // between the elastic-limit moment ys·I/(OD/2) and a fully plastic moment at UTS·4·rm²·t
  const I = Math.PI / 64 * (50.8 ** 4 - 47.5 ** 4);
  assert.ok(M > SAE1010.ys * I / 25.4 / 1000 && M < SAE1010.uts * 1.3 * 4 * 24.575 ** 2 * 1.65 / 1000, `M=${M}`);
  const s = strainsAt({ OD: 50.8, t: 1.65, clr: 101.6, phiFromExtrados: 0, neutralShift: 0, hoopRatio: 0.2 });
  assert.ok(Math.abs(s.eAx - Math.log(127 / 101.6)) < 1e-12);
  assert.ok(Math.abs(s.e1 + s.e2 + s.e3) < 1e-12);
});

test('calibration a) SAE 1010 50.8×1.65, 2D, 3-ball mandrel + wiper', () => {
  const { analysis } = caseA();
  const b = analysis.bends[0];
  assert.ok(b.thinningPct >= 15 && b.thinningPct <= 23, `thinning ${b.thinningPct}`);
  assert.ok(b.ovalityPct < 4, `ovality ${b.ovalityPct}`);
  assert.ok(b.wrinkleIndex < 0.6, `wrinkle ${b.wrinkleIndex}`);
  const z = b.fldPoints[0].zone;
  assert.ok(z === 'safe' || z === 'risk', `extrados zone ${z}`);
  assert.ok(b.torque >= 1500 && b.torque <= 4500, `torque ${b.torque}`);
  assert.ok(b.springback >= 0.8 && b.springback <= 3, `springback ${b.springback}`);
  assert.ok(b.fldPoints.length >= 24);
  assert.ok(Math.abs(b.WF - 50.8 / 1.65) < 1e-9, `WF ${b.WF}`);
  assert.equal(b.BR, 2);
  for (const k of ['moment', 'pressureDieForce', 'clampForce', 'mandrelForce', 'wiperForce']) assert.ok(b[k] > 0, k);
  assert.equal(analysis.summary.status, b.status);
  // also without the tube-making prestrain
  const z2 = caseA().analysis.bends[0].fldPoints[0].zone;
  assert.notEqual(z2, 'crack');
});

test('calibration b) same tube, no mandrel, no wiper → wrinkles and ovality', () => {
  const { analysis } = caseA({ mandrel: 'none', wiper: false });
  const b = analysis.bends[0];
  assert.ok(b.wrinkleIndex > 1, `wrinkle ${b.wrinkleIndex}`);
  assert.ok(b.ovalityPct > 8, `ovality ${b.ovalityPct}`);
  assert.equal(b.mandrelClearance, null);
  assert.ok(b.messages.length > 0);
});

test('calibration c) DP980 50.8×2.0 at 1D: crack/risk, fail/warning, larger springback', () => {
  const DP980 = getMaterial('dp980');
  const args = { OD: 50.8, t: 2.0, bends: [{ clr: 50.8, A: 90 }], mandrel: { balls: 3 }, wiper: true };
  const b = analyze({ material: DP980, ...args }).analysis.bends[0];
  const z = b.fldPoints[0].zone;
  assert.ok(z === 'crack' || z === 'risk', `zone ${z}`);
  assert.ok(b.status === 'fail' || b.status === 'warning');
  const mild = analyze({ material: SAE1010, ...args }).analysis.bends[0];
  assert.ok(b.springback > mild.springback, `${b.springback} vs ${mild.springback}`);
  assert.ok(b.springback > 3, `springback ${b.springback}`);
});

test('calibration d) AISI 409 63.5×1.5, CLR 95.25, no mandrel → collapse', () => {
  const b = analyze({ material: getMaterial('aisi409'), OD: 63.5, t: 1.5, bends: [{ clr: 95.25, A: 90 }] }).analysis.bends[0];
  assert.ok(b.collapseIndex > 1, `collapse ${b.collapseIndex}`);
  assert.equal(b.status, 'fail');
});

test('calibration e) monotonicity', () => {
  // thinning decreases as CLR grows
  let prev = Infinity;
  for (const k of [1.5, 2, 3, 4, 5]) {
    const th = caseA({ bends: [{ clr: k * 50.8, A: 90 }] }).analysis.bends[0].thinningPct;
    assert.ok(th < prev, `CLR ${k}D thinning ${th}`);
    prev = th;
  }
  // springback grows with ys (same hardening shape, K scaled)
  prev = -Infinity;
  for (const ys of [200, 300, 450, 700, 1000]) {
    const m = { ...SAE1010, ys, K: SAE1010.K * ys / SAE1010.ys };
    const sb = springback({ material: m, OD: 50.8, t: 1.65, clr: 101.6, angle: 90 }).springback;
    assert.ok(sb > prev, `ys ${ys} springback ${sb}`);
    prev = sb;
  }
  // wrinkle index grows with OD/t
  prev = -Infinity;
  for (const t of [3.0, 2.4, 1.65, 1.2, 0.9]) {
    const wi = caseA({ t }).analysis.bends[0].wrinkleIndex;
    assert.ok(wi > prev, `t ${t} wrinkle ${wi}`);
    prev = wi;
  }
});

test('calibration f) variable wall: thin bend has larger wrinkle index and mandrel clearance', () => {
  const { analysis } = analyze({
    material: SAE1010, OD: 38.1, t: 1.2,
    bends: [{ clr: 76.2, A: 90, t: 2.4 }, { clr: 76.2, A: 90, R: 90, t: 1.2 }],
    mandrel: { balls: 3 }, wiper: true,
  });
  const [b0, b1] = analysis.bends;
  assert.ok(Math.abs(b0.wall - 2.4) < 1e-9 && Math.abs(b1.wall - 1.2) < 1e-9);
  assert.ok(b1.wrinkleIndex > b0.wrinkleIndex);
  assert.ok(b1.mandrelClearance > b0.mandrelClearance);
  assert.ok(b1.ovalityPct > b0.ovalityPct);
});

test('seam angle and FLD weld zone', () => {
  // bend 0 has C = 0 → extrados at material φ = 90°
  const onExt = caseA().plan && analyze({
    material: SAE1010, OD: 50.8, t: 1.65, bends: [{ clr: 101.6, A: 90 }], mandrel: { balls: 3 }, wiper: true,
  }, { seamAngle: 90 }).analysis.bends[0];
  const onNeutral = analyze({
    material: SAE1010, OD: 50.8, t: 1.65, bends: [{ clr: 101.6, A: 90 }], mandrel: { balls: 3 }, wiper: true,
  }, { seamAngle: 0 }).analysis.bends[0];
  assert.equal(onExt.seamRelAngle, 0);
  assert.equal(onNeutral.seamRelAngle, -90);
  assert.ok(onExt.fldMargin < onNeutral.fldMargin);
  assert.ok(onExt.messages.some((m) => m.includes('soldadura')));
});

test('recommendTooling', () => {
  const a = recommendTooling({ material: SAE1010, OD: 50.8, t: 1.65, clr: 101.6, angle: 90 });
  assert.equal(a.mandrelType, 'ball');
  assert.ok(a.balls >= 2);
  assert.equal(a.wiperRequired, true);
  assert.ok(a.reasons.length > 0);
  const thick = recommendTooling({ material: SAE1010, OD: 25.4, t: 3.0, clr: 101.6, angle: 90 });
  assert.ok(thick.mandrelType === 'none' || thick.mandrelType === 'plug');
  assert.equal(thick.wiperRequired, false);
  const ms = recommendTooling({ material: getMaterial('ms1180'), OD: 50.8, t: 2.0, clr: 152.4, angle: 90 });
  const mild = recommendTooling({ material: SAE1010, OD: 50.8, t: 2.0, clr: 152.4, angle: 90 });
  assert.ok(ms.clampLengthFactor > mild.clampLengthFactor);
  assert.equal(ms.serratedClamp, true);
});

test('field sampler: consistent with the analysis and ramps to zero outside bends', () => {
  const c = caseA();
  const sampler = makeFieldSampler({ ...c });
  const { s0, s1 } = c.plan.layout.bends[0];
  const mid = (s0 + s1) / 2;
  const b = c.analysis.bends[0];
  const ext = { ...sampler.at(mid, 90) }; // C = 0 → extrados at φ = 90°
  assert.ok(Math.abs(ext.thinningPct - b.thinningPct) < 1e-6, `${ext.thinningPct} vs ${b.thinningPct}`);
  // current wall = t0 + dOut − dIn: the thinned extrados has its inner surface moved outward
  // relative to the outer one (dIn > dOut), the thickened intrados inward (dIn < dOut)
  assert.ok(ext.t < ext.t0 && ext.dOut < 0 && ext.dIn > ext.dOut);
  const intr = { ...sampler.at(mid, 270) };
  assert.ok(intr.t > intr.t0 && intr.dIn < intr.dOut);
  for (const s of [s0 - 2 * 50.8, s0 - 10, s0, mid, s1, s1 + 10]) {
    for (let phi = 0; phi < 360; phi += 15) {
      const f = sampler.at(s, phi);
      assert.ok(Math.abs(f.t - (f.t0 + f.dOut - f.dIn)) < 1e-12, `s ${s} φ ${phi}: t ${f.t} vs ${f.t0 + f.dOut - f.dIn}`);
    }
  }
  const side = { ...sampler.at(mid, 0) };
  assert.ok(side.dOut > 0, 'sides bulge');
  const straight = { ...sampler.at(s0 - 2 * 50.8, 90) };
  assert.equal(straight.thinningPct, 0);
  assert.equal(straight.dOut, 0);
  // ramp: monotone growth across the tangent
  const w1 = sampler.at(s0 - 10, 90).thinningPct, w2 = sampler.at(s0, 90).thinningPct, w3 = sampler.at(s0 + 10, 90).thinningPct;
  assert.ok(w1 < w2 && w2 < w3);
});

test('field sampler: wrinkle ripples only when wrinkleIndex > 1', () => {
  const bad = caseA({ mandrel: 'none', wiper: false });
  const sb = makeFieldSampler({ ...bad });
  const { s0, s1 } = bad.plan.layout.bends[0];
  let minD = Infinity, maxD = -Infinity;
  for (let s = s0 + 30; s < s1 - 30; s += 1) {
    const d = sb.at(s, 270).dOut; minD = Math.min(minD, d); maxD = Math.max(maxD, d);
  }
  assert.ok(maxD - minD > 0.1, `ripple ${maxD - minD}`);
  const good = caseA();
  const sg = makeFieldSampler({ ...good });
  minD = Infinity; maxD = -Infinity;
  for (let s = s0 + 30; s < s1 - 30; s += 1) {
    const d = sg.at(s, 270).dOut; minD = Math.min(minD, d); maxD = Math.max(maxD, d);
  }
  assert.ok(maxD - minD < 1e-9);
});

test('G3 field sampler speed: 150 000 calls < 150 ms', () => {
  const c = analyze({
    material: SAE1010, OD: 38.1, t: 1.2,
    bends: [{ clr: 76.2, A: 90, t: 2.4 }, { clr: 76.2, A: 45, R: 90 }, { clr: 76.2, A: 120, R: -45 }],
    mandrel: { balls: 3 }, wiper: true,
  }, { seamAngle: 30 });
  const sampler = makeFieldSampler({ ...c });
  const L = c.plan.layout.cutLength;
  const NS = 2500, NP = 60;
  let acc = 0;
  for (let i = 0; i < 2000; i++) acc += sampler.at((i / 2000) * L, i % 360).t; // warm-up
  const t0 = performance.now();
  for (let i = 0; i < NS; i++) {
    const s = (i / NS) * L;
    for (let j = 0; j < NP; j++) acc += sampler.at(s, j * 6).dOut;
  }
  const dt = performance.now() - t0;
  assert.ok(Number.isFinite(acc));
  assert.ok(dt < 150, `${NS * NP} calls took ${dt.toFixed(1)} ms`);
});

test('constants exported for the UI', () => {
  for (const k of ['NA_K', 'SPRINGBACK_CAL', 'OVALITY_K', 'WRINKLE_K']) assert.ok(Number.isFinite(CAL[k]), k);
  assert.ok(LIMITS.ovalityLimitPct > 0);
});
