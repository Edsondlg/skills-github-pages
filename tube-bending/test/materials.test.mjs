import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MATERIALS, getMaterial, flcCurve, fldZone, keelerFld0True, FLD_ZONE_LIMITS, KEELER,
} from '../js/materials.js';
import { MACHINES, pickMachine } from '../js/machines.js';

const FIELDS = ['id', 'name', 'family', 'E', 'nu', 'density', 'ys', 'uts', 'elongation', 'n', 'K', 'eps0', 'r',
  'flc0', 'weldFactor', 'mu', 'pricePerKg', 'notes'];
const FAMILIES = ['Acero bajo carbono', 'HSLA', 'AHSS', 'Inoxidable', 'Aluminio'];

test('every material has all fields with sane values', () => {
  assert.ok(MATERIALS.length >= 15);
  const ids = new Set();
  for (const m of MATERIALS) {
    for (const f of FIELDS) assert.ok(f in m, `${m.id} missing ${f}`);
    assert.ok(!ids.has(m.id), `duplicate id ${m.id}`); ids.add(m.id);
    assert.ok(FAMILIES.includes(m.family), `${m.id} family ${m.family}`);
    for (const f of ['E', 'nu', 'density', 'ys', 'uts', 'elongation', 'n', 'K', 'eps0', 'r', 'weldFactor', 'mu', 'pricePerKg']) {
      assert.ok(Number.isFinite(m[f]) && m[f] > 0, `${m.id}.${f}`);
    }
    assert.ok(m.uts > m.ys, `${m.id} uts > ys`);
    assert.ok(m.flc0 === null || (m.flc0 > 0 && m.flc0 < 1), `${m.id}.flc0`);
    assert.ok(m.weldFactor <= 1);
    // Swift fit consistent with ys within 3 %
    const ys = m.K * Math.pow(m.eps0, m.n);
    assert.ok(Math.abs(ys - m.ys) / m.ys < 0.03, `${m.id} Swift ys ${ys}`);
  }
  for (const id of ['sae1010-cew', 'sae1020-dom', 'hsla340', 'hsla420', 'hsla550', 'dp590', 'dp780', 'dp980', 'cp800',
    'trip780', 'ms1180', 'ms1500', 'aisi409', 'aisi304', 'al6061-t4', 'al6063-t5']) {
    assert.ok(getMaterial(id), id);
  }
});

test('FLC shape: FLC(0) = flc0 at t = 1, left side above right near 0', () => {
  for (const m of MATERIALS) {
    const flc = flcCurve(m, 1.0);
    if (m.flc0 != null) assert.ok(Math.abs(flc(0) - m.flc0) < 1e-12, m.id);
    assert.ok(flc(-0.05) > flc(0.05), `${m.id} left > right`);
    assert.ok(flc(-0.1) > flc(0) && flc(0.1) > flc(0), `${m.id} V shape`);
  }
});

test('Keeler–Brazier FLD0 for mild steel within 10 % of the formula', () => {
  const m = getMaterial('sae1010-cew');
  for (const t of [0.8, 1.65, 2.5, 4.0]) {
    const tc = Math.min(t, KEELER.tCap);
    const expected = Math.log(1 + (23.3 + 14.13 * tc) * m.n / 0.21 / 100);
    const got = flcCurve(m, t)(0);
    assert.ok(Math.abs(got - expected) / expected < 0.10, `t=${t}: ${got} vs ${expected}`);
  }
  // thickness cap at 3.175 mm
  assert.equal(keelerFld0True(0.2, 5), keelerFld0True(0.2, 3.175));
});

test('fldZone classifies hand-picked points', () => {
  const flc = () => 0.30; // flat FLC for clarity
  assert.equal(fldZone(0.35, 0.0, flc), 'crack');
  assert.equal(fldZone(0.28, 0.0, flc), 'risk');
  assert.equal(fldZone(0.20, 0.08, flc), 'thinning');        // e3 = −0.28
  assert.equal(fldZone(0.15, -0.03, flc), 'safe');
  assert.equal(fldZone(0.01, 0.005, flc), 'insufficient');
  assert.equal(fldZone(0.10, -0.12, flc), 'compression');    // e3 = +0.02
  assert.equal(fldZone(0.05, -0.12, flc), 'wrinkleTendency'); // e3 = +0.07
  assert.equal(fldZone(0.03, -0.25, flc), 'wrinkle');        // e3 = +0.22
  // explicit thickness strain overrides −(e1+e2)
  assert.equal(fldZone(0.20, 0.08, flc, -0.2), 'safe');
  // with a real FLC
  const real = flcCurve(getMaterial('sae1010-cew'), 1.65);
  assert.equal(fldZone(0.5, 0.0, real), 'crack');
  assert.ok(FLD_ZONE_LIMITS.thinningE3 < 0 && FLD_ZONE_LIMITS.wrinkleE3 > FLD_ZONE_LIMITS.wrinkleTendencyE3);
});

test('machines: complete records and pickMachine picks the smallest fitting class', () => {
  const F = ['id', 'name', 'maxOD', 'maxWallMild', 'maxCLR', 'maxTorque', 'maxClampForce', 'maxPressureDieForce',
    'maxBoostForce', 'stackLevels', 'feedSpeed', 'rotSpeed', 'bendSpeed', 'returnSpeed', 'clampTime', 'releaseTime',
    'loadTime', 'unloadTime', 'stackChangeTime', 'hourlyRate', 'maxTubeLength'];
  assert.ok(MACHINES.length >= 5 && MACHINES.length <= 6);
  for (const m of MACHINES) for (const f of F) assert.ok(f in m, `${m.id}.${f}`);
  for (let i = 1; i < MACHINES.length; i++) assert.ok(MACHINES[i].maxOD > MACHINES[i - 1].maxOD);
  assert.equal(pickMachine({ OD: 25.4, maxTorque: 1000, stacks: 1, length: 1000 }).machine.id, 'cnc-38e');
  const r = pickMachine({ OD: 50.8, maxTorque: 9000, stacks: 2, length: 2000 });
  assert.equal(r.machine.id, 'cnc-63');
  assert.ok(r.fits && r.reasons.length >= 2);
  const big = pickMachine({ OD: 200, maxTorque: 1, stacks: 1, length: 100 });
  assert.equal(big.fits, false);
  assert.ok(big.reasons.some((s) => s.includes('DE')));
});
