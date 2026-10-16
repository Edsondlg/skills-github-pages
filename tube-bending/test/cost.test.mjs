import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { importStepTube } from '../js/tube-extract.js';
import { lraFromTube, DEG } from '../js/geometry.js';
import { getMaterial } from '../js/materials.js';
import { analyzeBends } from '../js/mechanics.js';
import { planProcess } from '../js/process.js';
import { computeCost } from '../js/cost.js';

const load = (name) => importStepTube(readFileSync(new URL(`./fixtures/${name}.stp`, import.meta.url), 'utf8'), { fileName: name });
const setup = (name, matId = 'hsla340') => {
  const tube = load(name), material = getMaterial(matId);
  const lra = lraFromTube(tube, { front: 'A' });
  const plan = planProcess({ tube, lra, material });
  const analysis = analyzeBends({ tube, lra, plan, material });
  return { tube, lra, plan, material, analysis };
};
const KEYS = ['material', 'machine', 'tooling', 'setup', 'scrap', 'consumables', 'overhead', 'margin'];

test('G3 mass of soporte_3d_hsla (OD 50.8 × 1.65) matches a hand calculation within 1 %', () => {
  const c = setup('soporte_3d_hsla');
  // developed length by hand: straights 250 + 160 + 220 + tail 180 shortened by the springback
  // feed compensation, arcs at the load angle, + scrap
  const arcs = c.plan.bends.reduce((a, b) => a + 101.6 * b.angleLoad * DEG, 0);
  const comp = c.plan.bends.reduce((a, b) => a + b.feedCompensation, 0) + (180 - c.plan.layout.tailLength);
  assert.ok(comp > 0 && comp < 20, `compensation ${comp}`);
  const cut = 250 + 160 + 220 + 180 - comp + arcs + c.plan.layout.frontScrap + c.plan.layout.tailScrap;
  assert.ok(cut > 1140 && cut < 1300, `cut ${cut}`);
  const hand = 7850 * Math.PI * (50.8 - 1.65) * 1.65 * cut * 1e-9; // ≈ 2.4 kg
  const cost = computeCost({ ...c });
  assert.ok(Math.abs(cost.massKg - hand) / hand < 0.01, `${cost.massKg} vs ${hand}`);
  assert.ok(Math.abs(cost.cutLength - cut) < 1e-6);
});

test('G3 totals are the sum of the parts; batch and annual scale; cycle time includes handling', () => {
  const c = setup('escape_5_dobleces');
  const cost = computeCost({ ...c, inputs: { marginPct: 10 } });
  const sum = KEYS.reduce((a, k) => a + cost.perPart[k], 0);
  assert.ok(Math.abs(cost.perPart.total - sum) < 1e-9);
  assert.ok(cost.perPart.margin > 0);
  for (const k of [...KEYS, 'total']) assert.ok(Math.abs(cost.perBatch[k] - 500 * cost.perPart[k]) < 1e-6);
  assert.ok(Math.abs(cost.annual.total - 10000 * cost.perPart.total) < 1e-6);
  assert.ok(Math.abs(cost.cycleTime - (c.plan.sequence.totalTime + 8)) < 1e-12);
  assert.ok(Math.abs(cost.partsPerHour - 3600 / cost.cycleTime) < 1e-12);
  assert.ok(Math.abs(cost.perPart.machine - c.plan.machine.hourlyRate * cost.cycleTime / 3600) < 1e-12);
  assert.ok(Math.abs(cost.perPart.setup - 1.5 * c.plan.machine.hourlyRate / 500) < 1e-12);
  const t = cost.tooling;
  assert.ok(Math.abs(t.total - (t.bendDie + t.clampDie + t.pressureDie + t.wiperDie + t.mandrel + t.collet)) < 1e-9);
  assert.ok(cost.assumptions.length >= 8 && cost.assumptions.every((a) => typeof a === 'string'));
});

test('G3 MXN = USD · fx for every money output', () => {
  const c = setup('soporte_3d_hsla');
  const usd = computeCost({ ...c });
  const mxn = computeCost({ ...c, inputs: { currency: 'MXN', fxMXN: 17.5 } });
  assert.equal(mxn.currency, 'MXN');
  for (const k of [...KEYS, 'total']) {
    assert.ok(Math.abs(mxn.perPart[k] - 17.5 * usd.perPart[k]) < 1e-9, k);
    assert.ok(Math.abs(mxn.perBatch[k] - 17.5 * usd.perBatch[k]) < 1e-6, k);
  }
  assert.ok(Math.abs(mxn.tooling.total - 17.5 * usd.tooling.total) < 1e-9);
  assert.ok(Math.abs(mxn.annual.total - 17.5 * usd.annual.total) < 1e-6);
  assert.equal(mxn.massKg, usd.massKg);
});

test('G3 variable-wall travesano mass integrates the wall profile', () => {
  const c = setup('travesano_calibre_variable');
  const cost = computeCost({ ...c });
  const { cutLength, frontScrap, tailScrap } = c.plan.layout;
  assert.equal(frontScrap, 0); assert.equal(tailScrap, 0);
  const A = (t) => Math.PI * (38.1 - t) * t;
  // 120 mm at 2.4 + 30 mm linear taper 2.4 → 1.2 at each end, scaled with its end straight (200 and
  // 210 mm in the CAD, shortened by the springback feed compensation); the rest at 1.2
  const taper = 30 * Math.PI * (38.1 * 1.8 - (2.4 ** 3 - 1.2 ** 3) / (3 * 1.2));
  const kF = c.plan.bends[0].feedLength / 200, kT = c.plan.layout.tailLength / 210;
  const thickLen = 150 * (kF + kT);
  const hand = 7850e-9 * (120 * (kF + kT) * A(2.4) + (kF + kT) * taper + (cutLength - thickLen) * A(1.2));
  assert.ok(Math.abs(cost.massKg - hand) / hand < 1e-3, `${cost.massKg} vs ${hand}`);
  const nominal = 7850e-9 * A(1.2) * cutLength;
  assert.ok(cost.massKg > nominal * 1.1, 'profile mass differs from nominal-wall mass');
});

test('G3 AHSS tooling costs more than mild-steel tooling for the same part; tool life by family', () => {
  const mild = setup('soporte_3d_hsla', 'sae1010-cew');
  const ahss = setup('soporte_3d_hsla', 'dp780');
  const cm = computeCost({ ...mild }), ca = computeCost({ ...ahss });
  assert.ok(ca.tooling.total > cm.tooling.total);
  assert.equal(cm.tooling.life, 150000); assert.equal(ca.tooling.life, 60000);
  assert.equal(computeCost({ ...setup('soporte_3d_hsla', 'ms1500') }).tooling.life, 30000);
  // amortization: tooling / min(life, annualVolume)
  assert.ok(Math.abs(cm.perPart.tooling - cm.tooling.total / 10000) < 1e-12);
  const big = computeCost({ ...ahss, inputs: { annualVolume: 200000 } });
  assert.ok(Math.abs(big.perPart.tooling - big.tooling.total / 60000) < 1e-12);
});

test('overrides: materialPrice, machineRate, toolLifeParts', () => {
  const c = setup('horquilla_180');
  const cost = computeCost({ ...c, inputs: { materialPrice: 3, machineRate: 100, toolLifeParts: 5000 } });
  assert.ok(Math.abs(cost.perPart.material - 3 * cost.massKg) < 1e-12);
  assert.ok(Math.abs(cost.perPart.machine - 100 * cost.cycleTime / 3600) < 1e-12);
  assert.equal(cost.tooling.life, 5000);
  assert.ok(Math.abs(cost.perPart.tooling - cost.tooling.total / 5000) < 1e-12);
});
