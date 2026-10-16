import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { lraFromTube, centerlineFromLRA, bendExtradosAngles, lraLength, vDist, vDot, vSub, vNormalize, DEG } from '../js/geometry.js';
import { buildKinematics } from '../js/kinematics.js';
import { loadFixtures, properRigidRms, planFromLRA, phaseEnd, phaseAt } from './helpers/geometry-helpers.mjs';

const fixtures = loadFixtures();
const smoothstep = (p) => p * p * (3 - 2 * p);

function stations(s0, total, step) {
  const n = Math.max(1, Math.ceil(total / step - 1e-9));
  const s = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) s[i] = s0 + Math.min(i * step, total);
  return s;
}
function poseData(kin, t, sArr, Type = Float64Array) {
  const poses = new Type(16 * sArr.length), formed = new Type(sArr.length);
  kin.posesAt(t, sArr, poses, formed);
  const pos = (i) => [poses[16 * i + 12], poses[16 * i + 13], poses[16 * i + 14]];
  const xAxis = (i) => [poses[16 * i], poses[16 * i + 1], poses[16 * i + 2]];
  return { poses, formed, pos, xAxis };
}
const angleBetween = (a, b) => Math.acos(Math.min(1, Math.max(-1, vDot(vNormalize(a), vNormalize(b))))) / DEG;

// G2 — final shape after the whole sequence equals the LRA shape, every fixture, both fronts.
for (const { name, tube, truth } of fixtures) {
  for (const front of ['A', 'B']) {
    test(`G2 kinematics final shape matches centerlineFromLRA: ${name} (front ${front})`, () => {
      const lra = lraFromTube(tube, { front });
      const frontScrap = front === 'B' ? 25 : 0;
      const plan = planFromLRA(lra, { frontScrap, tailScrap: 40 });
      const kin = buildKinematics({ lra, plan, OD: truth.OD });
      const total = lraLength(lra), step = total / 400;
      const { pos } = poseData(kin, phaseEnd(plan, 'return'), stations(frontScrap, total, step), Float32Array);
      const P = Array.from({ length: 401 }, (_, i) => pos(i));
      const Q = centerlineFromLRA(lra, { step });
      const rms = properRigidRms(P, Q);
      assert.ok(rms < 0.05, `RMS ${rms}`);
    });
  }
}

test('stateAt: load/unload, phase-end exactness and tool state bookkeeping', () => {
  const lra = { bends: [{ L: 120, R: 0, A: 90, clr: 50 }, { L: 80, R: 45, A: 60, clr: 75 }], tail: 150 };
  const plan = planFromLRA(lra, { frontScrap: 10, tailScrap: 30 });
  const kin = buildKinematics({ lra, plan, OD: 25 });
  const { cutLength } = plan.layout;
  assert.equal(kin.duration, plan.sequence.totalTime);
  const s0 = kin.stateAt(0);
  assert.equal(s0.phase, 'load'); assert.equal(s0.loadOffsetY, 200); assert.equal(s0.carriageX, -cutLength);
  const afterLoad = kin.stateAt(phaseEnd(plan, 'load'));
  assert.equal(afterLoad.loadOffsetY, 0);
  // end of bend 0: die at angleLoad, carriage pulled by clr·θ after the feed
  const b0 = kin.stateAt(phaseEnd(plan, 'bend', 0));
  assert.equal(b0.dieAngle, 90);
  assert.ok(Math.abs(b0.carriageX - (-cutLength + plan.layout.bends[0].s0 + 50 * Math.PI / 2)) < 1e-9);
  assert.equal(b0.clampOpen, 0);
  const mid = kin.stateAt(phaseAt(plan, 'bend', 0, 0.5));
  assert.equal(mid.phase, 'bend'); assert.equal(mid.bendIndex, 0); assert.equal(mid.label, 'Doblado');
  assert.ok(Math.abs(mid.dieAngle - 90 * smoothstep(0.5)) < 1e-12);
  const rel = kin.stateAt(phaseEnd(plan, 'release', 0));
  assert.equal(rel.clampOpen, 1); assert.equal(rel.mandrelOffset, -10);
  const ret = kin.stateAt(phaseEnd(plan, 'return', 0));
  assert.equal(ret.dieAngle, 0); assert.equal(ret.pressureDieTravel, 0); assert.equal(ret.mandrelOffset, 0);
  const end = kin.stateAt(kin.duration + 5);
  assert.equal(end.colletRotation, 45); assert.equal(end.loadOffsetY, 200);
  // second bend uses the other stack
  assert.equal(end.activeStack, 1); assert.equal(end.headY, -plan.stacks[1].yOffset);
  assert.equal(s0.headY, -plan.stacks[0].yOffset);
});

// G3 — springback on release.
test('G3 springback: angle relaxes to A, radius becomes clr·angleLoad/A, rear and tangent fixed', () => {
  const A = 90, clr = 76.2, sb = 3;
  const lra = { bends: [{ L: 200, R: 0, A, clr }], tail: 300 };
  const plan = planFromLRA(lra, { springback: sb, tailScrap: 20 });
  const kin = buildKinematics({ lra, plan, OD: 38.1 });
  const { s0, s1 } = plan.layout.bends[0];
  const sArr = Float64Array.from([100, s0, (s0 + s1) / 2, s1, s1 + 100]);
  const before = poseData(kin, phaseEnd(plan, 'bend', 0), sArr);
  assert.ok(Math.abs(angleBetween(before.xAxis(0), before.xAxis(4)) - (A + sb)) < 1e-9);
  const after = poseData(kin, phaseEnd(plan, 'release', 0), sArr);
  assert.ok(Math.abs(angleBetween(after.xAxis(0), after.xAxis(4)) - A) < 0.01);
  // circumradius of three arc points
  const [a, b, c] = [after.pos(1), after.pos(2), after.pos(3)];
  const la = vDist(b, c), lb = vDist(a, c), lc = vDist(a, b);
  const area2 = Math.hypot(...((u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]])(vSub(b, a), vSub(c, a)));
  const R = (la * lb * lc) / (2 * area2);
  assert.ok(Math.abs(R - (clr * (A + sb)) / A) < 0.01, `radius ${R}`);
  // rear and tangent fixed during release
  assert.ok(vDist(after.pos(3), [0, 0, 0]) < 1e-9 && vDist(after.pos(4), before.pos(4)) < 1e-9);
});

test('G3 springback on a full part: final shape = LRA with clr·angleLoad/A radii', () => {
  const { tube, truth } = fixtures.find((f) => f.name === 'escape_5_dobleces');
  const lra = lraFromTube(tube, { front: 'A' });
  const sb = 3;
  const plan = planFromLRA(lra, { springback: sb });
  const kin = buildKinematics({ lra, plan, OD: truth.OD });
  const relaxed = { ...lra, bends: lra.bends.map((b) => ({ ...b, clr: (b.clr * (b.A + sb)) / b.A })) };
  const total = lraLength(relaxed), step = total / 400;
  const P = kin.centerlineAt(phaseEnd(plan, 'return'), stations(0, total, step));
  assert.ok(properRigidRms(P, centerlineFromLRA(relaxed, { step })) < 0.05);
});

// G4 — mechanics during the bend.
test('G4 during bend: tangent at origin, carriage pull, wrapped stations on the die circle, formed flags', () => {
  const lra = { bends: [{ L: 150, R: 0, A: 90, clr: 60 }, { L: 120, R: 30, A: 120, clr: 60 }], tail: 300 };
  const plan = planFromLRA(lra, { frontScrap: 15, tailScrap: 30 });
  const kin = buildKinematics({ lra, plan, OD: 30 });
  const j = 1, clr = 60, { s0, s1 } = plan.layout.bends[j];
  const tStart = phaseAt(plan, 'bend', j, 0);
  const st0 = kin.stateAt(tStart);
  for (const p of [0.2, 0.55, 0.9]) {
    const t = phaseAt(plan, 'bend', j, p);
    const st = kin.stateAt(t);
    const theta = st.dieAngle * DEG;
    assert.ok(Math.abs(st.dieAngle - 120 * smoothstep(p)) < 1e-9);
    assert.ok(Math.abs(st.carriageX - st0.carriageX - clr * theta) < 1e-9, 'carriage pulled by clr·θ');
    assert.ok(Math.abs(st.pressureDieTravel - clr * theta) < 1e-9);
    const sTan = s0 + clr * theta;
    const sArr = new Float64Array(600);
    for (let i = 0; i < sArr.length; i++) sArr[i] = (plan.layout.cutLength * (i + 0.5)) / sArr.length;
    const extra = Float64Array.from([sTan, sTan + 40, sTan - 1e-3]);
    const all = Float64Array.from([...sArr, ...extra]);
    const d = poseData(kin, t, all);
    const n = sArr.length;
    // tangent station at the origin, local +X (toward the front) = machine +X
    assert.ok(vDist(d.pos(n), [0, 0, 0]) < 1e-6);
    assert.ok(vDist(d.xAxis(n), [1, 0, 0]) < 1e-9);
    assert.ok(vDist(d.pos(n + 1), [-40, 0, 0]) < 1e-6, 'behind the tangent: on −X');
    assert.ok(vDist(d.xAxis(n + 1), [1, 0, 0]) < 1e-9);
    const [b0s0, b0s1] = [plan.layout.bends[0].s0, plan.layout.bends[0].s1];
    let wrappedCount = 0;
    for (let i = 0; i < n; i++) {
      const s = sArr[i];
      const wrapped = s >= s0 && s <= sTan;
      const done = s >= b0s0 && s <= b0s1;
      assert.equal(d.formed[i], wrapped || done ? 1 : 0, `formed flag at s=${s}`);
      if (wrapped) {
        wrappedCount++;
        const q = d.pos(i);
        assert.ok(Math.abs(q[1]) < 1e-9);
        assert.ok(Math.abs(vDist(q, [0, 0, -clr]) - clr) < 1e-6, 'on the die circle');
      }
      if (s > sTan) assert.ok(Math.abs(d.pos(i)[1]) < 1e-9 && Math.abs(d.pos(i)[2]) < 1e-9 && d.pos(i)[0] < 0, 'rear on the axis');
    }
    assert.ok(wrappedCount > 0);
    assert.ok(s1 > sTan);
  }
});

test('extrados: material angle 90 − C_i faces machine +Z when bend i starts', () => {
  const lra = { bends: [{ L: 100, R: 0, A: 45, clr: 50 }, { L: 100, R: 70, A: 45, clr: 50 }, { L: 100, R: -150, A: 45, clr: 50 }], tail: 100 };
  const plan = planFromLRA(lra);
  const kin = buildKinematics({ lra, plan, OD: 20 });
  bendExtradosAngles(lra).forEach((phi, i) => {
    const d = poseData(kin, phaseAt(plan, 'bend', i, 0), Float64Array.from([plan.layout.bends[i].s1 + 10]));
    const m = d.poses, c = Math.cos(phi * DEG), s = Math.sin(phi * DEG);
    const dir = [m[4] * c + m[8] * s, m[5] * c + m[9] * s, m[6] * c + m[10] * s];
    assert.ok(vDist(dir, [0, 0, 1]) < 1e-9, `bend ${i}: ${dir}`);
  });
});

// G5 — R sign.
test('G5 R = +90 vs −90: mirror images; with +90 the front leg points +Y', () => {
  // Derivation: bend 0 (RotY(+90°) about the die) turns the front leg (from the bend toward the
  // front end) from +X to (cos90, 0, −sin90) = −Z. The collet rotation R = +90 is right-hand about
  // +X: RotX(+90)·(0,0,−1) = (0, +1, 0), so the front leg points +Y. Bend 1 rotates about +Y, which
  // leaves +Y unchanged; hence in the final pose front-end − (bend 0 front tangent) = L0·(+Y).
  const make = (R) => ({ bends: [{ L: 150, R: 0, A: 90, clr: 50 }, { L: 120, R, A: 90, clr: 50 }], tail: 200 });
  const shape = (R) => {
    const lra = make(R);
    const plan = planFromLRA(lra);
    const kin = buildKinematics({ lra, plan, OD: 25 });
    const sArr = stations(0, lraLength(lra), 2);
    return { pts: kin.centerlineAt(phaseEnd(plan, 'return'), sArr), s0: plan.layout.bends[0].s0 };
  };
  const plus = shape(90), minus = shape(-90);
  plus.pts.forEach((p, i) => assert.ok(vDist([p[0], -p[1], p[2]], minus.pts[i]) < 1e-9, 'mirror about the XZ plane'));
  const legPlus = vSub(plus.pts[0], plus.pts[plus.s0 / 2]);
  assert.ok(vDist(legPlus, [0, 150, 0]) < 1e-9, `front leg with R=+90: ${legPlus}`);
  const legMinus = vSub(minus.pts[0], minus.pts[minus.s0 / 2]);
  assert.ok(vDist(legMinus, [0, -150, 0]) < 1e-9);
  assert.ok(properRigidRms(plus.pts, minus.pts) > 1, 'the two are not congruent by a proper motion');
});

// G6 — interference.
test('G6 interference: bed box below the axis is hit when R swings a long front leg down, not for an in-plane part', () => {
  const OD = 25;
  const bed = [{ name: 'bancada', min: [-5000, -5000, -5000], max: [5000, -OD, 5000] }];
  const down = { bends: [{ L: 400, R: 0, A: 90, clr: 50 }, { L: 100, R: -90, A: 45, clr: 50 }], tail: 300 };
  const planD = planFromLRA(down);
  const hits = buildKinematics({ lra: down, plan: planD, OD }).interference(bed, OD);
  assert.ok(hits.length > 0);
  const rot = planD.sequence.phases.findIndex((p) => p.type === 'rotate');
  assert.ok(hits.some((h) => h.phaseIndex === rot && h.bend === 1 && h.volume === 'bancada'), 'detected during the rotation');
  assert.ok(hits.every((h) => h.point[1] <= -OD / 2 + 1e-9));
  const keys = hits.map((h) => h.phaseIndex + '|' + h.volume);
  assert.equal(new Set(keys).size, keys.length, 'deduplicated per phase+volume');

  const flat = { bends: [{ L: 400, R: 0, A: 90, clr: 50 }, { L: 100, R: 180, A: 45, clr: 50 }], tail: 300 };
  assert.deepEqual(buildKinematics({ lra: flat, plan: planFromLRA(flat), OD }).interference(bed, OD), []);
});

// G7 — performance.
test('G7 posesAt: N = 2500 stations, 10 bends, average < 4 ms', () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const lra = { bends: Array.from({ length: 10 }, (_, i) => ({ L: 60 + 100 * rnd(), R: i === 0 ? 0 : Math.round(360 * rnd() - 180), A: 20 + 100 * rnd(), clr: [50, 75][i % 2] })), tail: 200 };
  const plan = planFromLRA(lra, { springback: 2 });
  const kin = buildKinematics({ lra, plan, OD: 25 });
  const N = 2500, sArr = new Float64Array(N);
  for (let i = 0; i < N; i++) sArr[i] = (plan.layout.cutLength * i) / (N - 1);
  const poses = new Float32Array(16 * N), formed = new Float32Array(N);
  for (let i = 0; i < 20; i++) kin.posesAt(rnd() * kin.duration, sArr, poses, formed);
  const t0 = performance.now();
  for (let i = 0; i < 200; i++) kin.posesAt(rnd() * kin.duration, sArr, poses, formed);
  const avg = (performance.now() - t0) / 200;
  assert.ok(avg < 4, `average ${avg.toFixed(3)} ms`);
});

test('interference ignores the rear straight running through the tooling on the machine axis', () => {
  const OD = 25;
  // A machine body that encloses the axis behind the tangent (pressure die / wiper housings) and the
  // straight part of the machine axis: the unbent rear tube always passes there by design.
  const pdHousing = [{ name: 'carcasa dado de presión', min: [-600, -40, -40], max: [-80, 40, 40] }];
  const flat = { bends: [{ L: 400, R: 0, A: 90, clr: 50 }, { L: 100, R: 180, A: 45, clr: 50 }], tail: 300 };
  assert.deepEqual(buildKinematics({ lra: flat, plan: planFromLRA(flat), OD }).interference(pdHousing, OD), []);
});
