import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lraFromTube, centerlineFromLRA, xyzTable, bendExtradosAngles, lraLength, vDist, vSub, vCross, vLength, vNormalize, vDot,
  mat4Multiply, mat4RotationX, mat4RotationY, mat4DieRotation, mat4InvertRigid, mat4TransformPoint, DEG, normalizeDeg180,
} from '../js/geometry.js';
import { loadFixtures, sampleTube, properRigidRms } from './helpers/geometry-helpers.mjs';

const fixtures = loadFixtures();

test('fixtures load and cover the special cases', () => {
  assert.ok(fixtures.length >= 5);
  assert.ok(fixtures.some((f) => f.tube.segments.some((s) => s.type === 'straight' && s.length === 0)), 'zero-length straight');
  assert.ok(fixtures.some((f) => f.tube.segments.some((s) => s.type === 'bend' && s.angle === 180)), '180° bend');
  assert.ok(fixtures.some((f) => f.tube.segments[0].p0.some((c) => c !== 0)), 'arbitrary placement');
});

test('mat4 helpers: rotations follow three.js conventions', () => {
  const p = mat4TransformPoint(mat4RotationY(90 * DEG), [1, 0, 0]); // x' = x cos + z sin, z' = −x sin + z cos
  assert.ok(vDist(p, [0, 0, -1]) < 1e-12);
  const q = mat4TransformPoint(mat4RotationX(90 * DEG), [0, 0, -1]); // right-hand about +X: −Z → +Y
  assert.ok(vDist(q, [0, 1, 0]) < 1e-12);
  const d = mat4TransformPoint(mat4DieRotation(50, 90 * DEG), [0, 0, 0]); // tangent point swings onto die circle toward −Z
  assert.ok(vDist(d, [50, 0, -50]) < 1e-12);
  const m = mat4Multiply(mat4DieRotation(30, 0.7), mat4RotationX(0.3));
  const back = mat4TransformPoint(mat4Multiply(mat4InvertRigid(m), m), [3, 4, 5]);
  assert.ok(vDist(back, [3, 4, 5]) < 1e-12);
  assert.equal(normalizeDeg180(-180), 180);
  assert.equal(normalizeDeg180(540), 180);
  assert.equal(normalizeDeg180(-190), 170);
});

// G1 — shape round-trip, every fixture and both fronts, proper rigid motion only.
for (const { name, tube } of fixtures) {
  for (const front of ['A', 'B']) {
    test(`G1 lraFromTube → centerlineFromLRA reproduces ${name} (front ${front})`, () => {
      const lra = lraFromTube(tube, { front });
      assert.equal(lra.front, front);
      assert.equal(lra.bends[0].R, 0);
      for (const b of lra.bends) assert.ok(b.R > -180 && b.R <= 180, `R in (−180,180]: ${b.R}`);
      const total = lraLength(lra);
      assert.ok(Math.abs(total - tube.totalLength) < 1e-6);
      const step = total / 400;
      const P = centerlineFromLRA(lra, { step });
      const Q = sampleTube(tube, step, front);
      assert.ok(P.length >= 200);
      const rms = properRigidRms(P, Q);
      assert.ok(rms < 0.02, `RMS ${rms}`);
    });
  }
}

test('G1 negative: a mirrored (non-planar) fixture is rejected by the proper-rigid check', () => {
  const { tube } = fixtures.find((f) => f.name === 'soporte_3d_hsla');
  const lra = lraFromTube(tube, { front: 'A' });
  const step = lraLength(lra) / 400;
  const P = centerlineFromLRA(lra, { step });
  const mirrored = sampleTube(tube, step, 'A').map((p) => [p[0], p[1], -p[2]]);
  assert.ok(properRigidRms(P, mirrored) > 1, 'mirror image must not match');
  // and an LRA with every R negated is the mirror image, so it must not match the original either
  const neg = { ...lra, bends: lra.bends.map((b) => ({ ...b, R: normalizeDeg180(-b.R) })) };
  assert.ok(properRigidRms(centerlineFromLRA(neg, { step }), sampleTube(tube, step, 'A')) > 1);
  assert.ok(properRigidRms(centerlineFromLRA(neg, { step }), mirrored) < 0.02);
});

test('lraFromTube: program values for known fixtures', () => {
  const hs = lraFromTube(fixtures.find((f) => f.name === 'soporte_3d_hsla').tube, { front: 'A' });
  // fixture turtle: plane rotation `rot` right-hand about the travel direction equals R
  assert.deepEqual(hs.bends.map((b) => [b.L, Math.round(b.R * 1e6) / 1e6, b.A, b.clr]), [[180, 0, 90, 101.6], [220, 90, 45, 101.6], [160, -120, 60, 101.6]]);
  assert.equal(hs.tail, 250);
  const tr = lraFromTube(fixtures.find((f) => f.name === 'travesano_calibre_variable').tube, { front: 'A' });
  assert.equal(tr.bends[1].R, 180);
  const dc = lraFromTube(fixtures.find((f) => f.name === 'doblez_compuesto').tube, { front: 'B' });
  assert.deepEqual(dc.bends.map((b) => [b.L, b.A]), [[200, 60], [0, 45]]);
  assert.equal(dc.tail, 160);
});

test('xyzTable: ends, intersection vertices, 180° bends emit flagged tangent points', () => {
  const { tube } = fixtures.find((f) => f.name === 'soporte_3d_hsla');
  const rows = xyzTable(tube);
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((r) => r.kind), ['end', 'vertex', 'vertex', 'vertex', 'end']);
  const bends = tube.segments.filter((s) => s.type === 'bend');
  bends.forEach((b, i) => {
    const v = [rows[i + 1].x, rows[i + 1].y, rows[i + 1].z];
    assert.equal(rows[i + 1].clr, b.clr);
    // the vertex lies on both tangent lines, at clr·tan(A/2) from each tangent point
    const d = b.clr * Math.tan((b.angle * DEG) / 2);
    assert.ok(Math.abs(vDist(v, b.p0) - d) < 1e-9 && Math.abs(vDist(v, b.p1) - d) < 1e-9);
    assert.ok(vLength(vCross(vSub(v, b.p0), b.tIn)) < 1e-9 && vLength(vCross(vSub(v, b.p1), b.tOut)) < 1e-9);
  });
  assert.ok(vDist([rows[0].x, rows[0].y, rows[0].z], tube.segments[0].p0) < 1e-12);

  const hp = fixtures.find((f) => f.name === 'horquilla_180').tube;
  const r2 = xyzTable(hp);
  assert.deepEqual(r2.map((r) => r.kind), ['end', 'tangent180', 'tangent180', 'vertex', 'end']);
  assert.ok(vDist([r2[1].x, r2[1].y, r2[1].z], hp.segments[1].p0) < 1e-12);
  assert.ok(vDist([r2[2].x, r2[2].y, r2[2].z], hp.segments[1].p1) < 1e-12);
});

test('bendExtradosAngles = 90 − C_i normalized to [0,360)', () => {
  const lra = { bends: [{ L: 1, R: 0, A: 90, clr: 10 }, { L: 1, R: 90, A: 45, clr: 10 }, { L: 1, R: -120, A: 30, clr: 10 }, { L: 1, R: 180, A: 30, clr: 10 }], tail: 1 };
  assert.deepEqual(bendExtradosAngles(lra), [90, 0, 120, 300]);
});

test('extrados angle: material φ = 90 − C points to the die extrados at bend time (turtle frame)', () => {
  // In the turtle, the arc of bend i turns the travel direction toward the die center; the
  // extrados (away from the center) is the material direction 90 − C_i. Check with the centerline:
  const lra = { bends: [{ L: 100, R: 0, A: 90, clr: 50 }, { L: 100, R: 90, A: 90, clr: 50 }], tail: 100 };
  const pts = centerlineFromLRA(lra, { step: 1 });
  // bend 1 bends the rear leg: with the front straight going −X from the origin (material +Y up),
  // bend 0 (C = 0, extrados φ = 90 → local +Z) turns the travel direction toward −Z.
  const after0 = vNormalize(vSub(pts[260], pts[250]));
  assert.ok(vDot(after0, [0, 0, -1]) > 0.999, `travel after bend 0: ${after0}`);
});
