import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { importStepTube } from '../js/tube-extract.js';
import { lraFromTube, centerlineFromLRA, lraLength, DEG } from '../js/geometry.js';
import { buildKinematics } from '../js/kinematics.js';
import { getMaterial } from '../js/materials.js';
import { planProcess } from '../js/process.js';
import { properRigidRms } from './helpers/geometry-helpers.mjs';

const FIX = new URL('./fixtures/', import.meta.url);
const fixtures = readdirSync(FIX).filter((f) => f.endsWith('.stp')).sort().map((f) => ({
  name: f.replace('.stp', ''), tube: importStepTube(readFileSync(new URL(f, FIX), 'utf8'), { fileName: f }),
}));
const fx = (name) => fixtures.find((f) => f.name === name);
const material = getMaterial('hsla340');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);

// G1 — layout, feeds and sequence invariants on every fixture.
for (const { name, tube } of fixtures) {
  test(`G1 planProcess layout and sequence invariants: ${name}`, () => {
    const lra = lraFromTube(tube, { front: 'A' });
    const plan = planProcess({ tube, lra, material });
    const { layout, sequence } = plan;
    assert.equal(layout.bends.length, lra.bends.length);
    plan.bends.forEach((pb, i) => {
      const { s0, s1 } = layout.bends[i];
      near(s1 - s0, lra.bends[i].clr * pb.angleLoad * DEG, 1e-9, 'arc');
      assert.ok(pb.angleLoad > pb.angle && pb.springback > 0);
      near(pb.clrAfter, lra.bends[i].clr * pb.angleLoad / pb.angle, 1e-9);
      near(plan.stacks[pb.stack].clr, lra.bends[i].clr, 0.01, 'stack clr');
    });
    near(layout.bends[0].s0, layout.frontScrap + lra.bends[0].L, 1e-9);
    const feeds = sequence.phases.filter((p) => p.type === 'feed');
    assert.equal(feeds.length, lra.bends.length);
    feeds.forEach((f, i) => near(f.params.distance, layout.bends[i].s0 - (i ? layout.bends[i - 1].s1 : 0), 1e-9, 'feed'));
    const arcs = layout.bends.reduce((a, b) => a + b.s1 - b.s0, 0);
    near(feeds.reduce((a, f) => a + f.params.distance, 0) + arcs + lra.tail + layout.tailScrap, layout.cutLength, 1e-9, 'cut');
    // phases ordered, starts cumulative, total = Σ durations
    const ph = sequence.phases;
    assert.equal(ph[0].type, 'load'); assert.equal(ph[ph.length - 1].type, 'unload');
    let t = 0;
    for (const p of ph) { near(p.start, t, 1e-9, 'start'); assert.ok(p.duration >= 0); t += p.duration; assert.equal(typeof p.label, 'string'); }
    near(sequence.totalTime, t, 1e-9);
    const order = ['stackChange', 'feed', 'rotate', 'clamp', 'bend', 'mandrelRetract', 'release', 'return'];
    for (let i = 0; i < lra.bends.length; i++) {
      const types = ph.filter((p) => p.bend === i).map((p) => p.type);
      assert.deepEqual(types, order.filter((o) => types.includes(o)), `order bend ${i}`);
      assert.ok(['feed', 'clamp', 'bend', 'release', 'return'].every((o) => types.includes(o)));
      assert.equal(types.includes('mandrelRetract'), plan.mandrel.type !== 'none');
      assert.equal(types.includes('rotate'), lra.bends[i].R !== 0);
    }
    // stacks: yOffset = Σ lower heights + own half height, levels = indices
    let base = 0;
    plan.stacks.forEach((st, k) => { assert.equal(st.level, k); near(st.yOffset, base + st.bendDie.height / 2, 1e-9); base += st.bendDie.height; });
    assert.ok(plan.collet.gripLength >= 40 && layout.cutLength <= plan.mandrel.rodLength + 1e-9 || plan.mandrel.type === 'none');
  });
}

test('G1 escape_5_dobleces: two stacks, level 0 = most used CLR, bends mapped and stack changes', () => {
  const { tube } = fx('escape_5_dobleces');
  const lra = lraFromTube(tube, { front: 'A' });
  const plan = planProcess({ tube, lra, material });
  assert.equal(plan.stacks.length, 2);
  near(plan.stacks[0].clr, 95.25, 1e-6); near(plan.stacks[1].clr, 127, 1e-6);
  assert.deepEqual(plan.bends.map((b) => b.stack), [0, 1, 0, 1, 0]);
  const changes = plan.sequence.phases.filter((p) => p.type === 'stackChange').map((p) => [p.bend, p.params.fromLevel, p.params.toLevel]);
  assert.deepEqual(changes, [[1, 0, 1], [2, 1, 0], [3, 0, 1], [4, 1, 0]]);
  plan.sequence.phases.filter((p) => p.type === 'bend').forEach((p) => near(p.params.clr, plan.stacks[plan.bends[p.bend].stack].clr, 1e-9));
});

for (const front of ['A', 'B']) {
  test(`G1 travesano_calibre_variable (front ${front}): wallAt profile, breakpoints and mandrel sizing`, () => {
    const { tube } = fx('travesano_calibre_variable');
    const lra = lraFromTube(tube, { front });
    const plan = planProcess({ tube, lra, material });
    const { wallAt, cutLength, breakpoints } = plan.layout;
    near(wallAt(0), 2.4, 1e-6); near(wallAt(5), 2.4, 1e-6);
    near(wallAt(cutLength), 2.4, 1e-6); near(wallAt(cutLength - 5), 2.4, 1e-6);
    near(wallAt(cutLength / 2), 1.2, 1e-6);
    for (const b of plan.layout.bends) near(wallAt((b.s0 + b.s1) / 2), 1.2, 1e-6);
    assert.equal(breakpoints.length, 6);
    near(wallAt(breakpoints[1]), 2.4, 1e-6); near(wallAt(breakpoints[2]), 1.2, 1e-6);
    const c = plan.mandrel.clearance;
    assert.notEqual(plan.mandrel.type, 'none');
    near(c, Math.max(0.1 * 2.4, 0.15), 1e-9);
    near(plan.mandrel.diameter, 38.1 - 2 * 2.4 - c, 1e-6);
    near(plan.bends[0].wall, 1.2, 1e-9);
  });
}

test('wallAt: front B reads the profile reversed and bend arcs are stretched by angleLoad/A', () => {
  const { tube: base } = fx('travesano_calibre_variable');
  const total = base.totalLength;
  const lraA = lraFromTube(base, { front: 'A' });
  const p0 = lraA.bends[0].L, p1 = p0 + lraA.bends[0].clr * lraA.bends[0].A * DEG;
  // asymmetric: 3.0 on the first 100 mm from end A, linear 1.0 → 2.0 across bend 0, 1.0 elsewhere
  const wall = [
    { s0: 0, s1: 100, t0: 3, t1: 3 }, { s0: 100, s1: p0, t0: 1, t1: 1 },
    { s0: p0, s1: p1, t0: 1, t1: 2 }, { s0: p1, s1: total, t0: 1, t1: 1 },
  ];
  const tube = { ...base, wall, maxWall: 3 };
  const planA = planProcess({ tube, lra: lraA, material });
  near(planA.layout.wallAt(planA.layout.frontScrap + 50), 3, 1e-9);
  near(planA.layout.wallAt(planA.layout.cutLength - 1), 1, 1e-9);
  const { s0, s1 } = planA.layout.bends[0];
  near(planA.layout.wallAt((s0 + s1) / 2), 1.5, 1e-9, 'stretched arc midpoint');
  near(planA.layout.wallAt(s0 + 0.25 * (s1 - s0)), 1.25, 1e-9);
  near(planA.bends[0].wall, 1.5, 1e-9);
  const lraB = lraFromTube(tube, { front: 'B' });
  const planB = planProcess({ tube, lra: lraB, material });
  near(planB.layout.wallAt(planB.layout.frontScrap + 1), 1, 1e-9);
  near(planB.layout.wallAt(planB.layout.cutLength - planB.layout.tailScrap - 50), 3, 1e-9);
  near(planB.mandrel.diameter, 38.1 - 2 * 3 - planB.mandrel.clearance, 1e-9);
});

test('scrap: short first straight adds front scrap = clamp length − L0; short tail adds tail scrap', () => {
  const tube = { OD: 25.4, segments: [], wall: null, nominalWall: 1.2, minWall: 1.2, maxWall: 1.2, variableWall: false };
  const lra = { front: 'A', bends: [{ L: 20, R: 0, A: 90, clr: 50.8 }, { L: 200, R: 90, A: 90, clr: 50.8 }], tail: 30 };
  const plan = planProcess({ tube, lra, material });
  const Lc = plan.stacks[0].clampDie.length;
  near(plan.layout.frontScrap, Lc - 20, 1e-9);
  assert.equal(plan.bends[0].clampOK, false); assert.equal(plan.bends[1].clampOK, true);
  assert.ok(plan.bends[0].notes.some((n) => n.includes('Recta corta para mordaza')));
  near(plan.layout.tailScrap, plan.collet.gripLength + Math.max(25.4, 20) - 30, 1e-9);
  near(plan.layout.wallAt(0), 1.2, 1e-12);
});

test('null wall without manual input uses 1.5 mm and warns; options.wall is used when given', () => {
  const tube = { OD: 25.4, segments: [], wall: null, nominalWall: null };
  const lra = { front: 'A', bends: [{ L: 100, R: 0, A: 90, clr: 50.8 }], tail: 150 };
  const p1 = planProcess({ tube, lra, material });
  near(p1.layout.wallAt(10), 1.5, 0); assert.ok(p1.warnings.some((w) => w.includes('1.5 mm')));
  const p2 = planProcess({ tube, lra, material, options: { wall: 2 } });
  near(p2.layout.wallAt(10), 2, 0);
});

test('springbackFactor scales the springback; boost number overrides; machineId selects; AHSS slows the bend', () => {
  const { tube } = fx('soporte_3d_hsla');
  const lra = lraFromTube(tube, { front: 'A' });
  const p1 = planProcess({ tube, lra, material });
  const p2 = planProcess({ tube, lra, material, options: { springbackFactor: 2, boost: 7, machineId: 'cnc-114h' } });
  near(p2.bends[0].springback, 2 * p1.bends[0].springback, 1e-9);
  assert.ok(p2.bends.every((b) => b.boostPct === 7));
  assert.equal(p2.machine.id, 'cnc-114h');
  assert.equal(p1.machine.id, 'cnc-50');
  const p3 = planProcess({ tube, lra, material: getMaterial('dp780') });
  near(p3.bends[0].bendSpeed, 0.7 * p1.bends[0].bendSpeed, 1e-9);
  assert.ok(p3.stacks[0].clampDie.serrated);
});

test('capacity warnings when the forced machine is too small', () => {
  const { tube } = fx('escape_5_dobleces');
  const plan = planProcess({ tube, lra: lraFromTube(tube, { front: 'A' }), material, options: { machineId: 'cnc-38e' } });
  assert.ok(plan.warnings.some((w) => w.startsWith('DE ')));
});

// G2 — kinematics with the real plan reproduces the relaxed part shape.
for (const { name, tube } of fixtures) {
  for (const front of ['A', 'B']) {
    test(`G2 kinematics + planProcess final shape: ${name} (front ${front})`, () => {
      const lra = lraFromTube(tube, { front });
      const plan = planProcess({ tube, lra, material });
      const kin = buildKinematics({ lra, plan, OD: tube.OD });
      const ph = plan.sequence.phases;
      const tEnd = ph.filter((p) => p.type === 'return').pop();
      near(tEnd.start + tEnd.duration, plan.sequence.totalTime - ph[ph.length - 1].duration, 1e-9);
      const relaxed = { ...lra, bends: lra.bends.map((b, i) => ({ ...b, clr: plan.bends[i].clrAfter })) };
      const total = lraLength(relaxed);
      near(total, plan.layout.cutLength - plan.layout.frontScrap - plan.layout.tailScrap, 1e-6);
      const n = 400, step = total / n;
      const s = Float64Array.from({ length: n + 1 }, (_, i) => plan.layout.frontScrap + Math.min(i * step, total));
      const P = kin.centerlineAt(tEnd.start + tEnd.duration, s);
      const rms = properRigidRms(P, centerlineFromLRA(relaxed, { step }));
      assert.ok(rms < 0.1, `RMS ${rms}`);
    });
  }
}
