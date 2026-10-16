// Lógica pura del armazón de la app (js/ui/app-state.js) y ayudantes de la línea de tiempo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { importStepTube } from '../js/tube-extract.js';
import { lraFromTube } from '../js/geometry.js';
import { planProcess } from '../js/process.js';
import { getMaterial } from '../js/materials.js';
import { buildKinematics } from '../js/kinematics.js';
import { setOrDelete, resolveMaterial, splitOptions, parkTime, remapTime, locatePhase, nearestStation, bendLabelText, bendLabels } from '../js/ui/app-state.js';
import { nextPhaseStart, prevPhaseStart } from '../js/ui/timeline.js';

const text = fs.readFileSync(new URL('../samples/escape_5_dobleces.stp', import.meta.url), 'utf8');
const tube = importStepTube(text, { fileName: 'escape_5_dobleces.stp' });
const lra = lraFromTube(tube, { front: 'A' });
const plan = planProcess({ tube, lra, material: getMaterial('aisi409'), options: {} });
const phases = plan.sequence.phases;

test('setOrDelete: null / undefined / "" borran la clave; no muta el original', () => {
  const o = { a: 1, b: 2 };
  assert.deepEqual(setOrDelete(o, 'a', null), { b: 2 });
  assert.deepEqual(setOrDelete(o, 'b', ''), { a: 1 });
  assert.deepEqual(setOrDelete(o, 'c', 0), { a: 1, b: 2, c: 0 });
  assert.deepEqual(o, { a: 1, b: 2 });
});

test('resolveMaterial: copia con sobrescrituras, sin tocar el catálogo', () => {
  const m = resolveMaterial('aisi409', { ys: 999 });
  assert.equal(m.ys, 999);
  assert.notEqual(getMaterial('aisi409').ys, 999);
  assert.equal(resolveMaterial('no-existe', {}), null);
});

test('splitOptions: mecánica no recibe mandrelClearance; machineId solo si no es auto', () => {
  const opts = { mandrelClearance: 0.3, seamAngle: 45, boost: 5 };
  const a = splitOptions(opts, 'auto');
  assert.equal(a.processOptions.mandrelClearance, 0.3);
  assert.equal('machineId' in a.processOptions, false);
  assert.equal('mandrelClearance' in a.mechanicsOptions, false);
  assert.equal(a.mechanicsOptions.seamAngle, 45);
  assert.equal(splitOptions(opts, 'cnc-50').processOptions.machineId, 'cnc-50');
});

test('parkTime: a la mitad de la fase de doblado del doblez 2', () => {
  const ph = phases.find((p) => p.type === 'bend' && p.bend === 1);
  assert.equal(parkTime(phases, 1), ph.start + ph.duration / 2);
  const last = phases.filter((p) => p.type === 'bend').at(-1);
  assert.equal(parkTime(phases, 99), last.start + last.duration / 2);
});

test('remapTime: misma fase y avance tras recalcular; fuera de rango se acota', () => {
  const ph = phases.find((p) => p.type === 'bend' && p.bend === 2);
  const t = ph.start + 0.25 * ph.duration;
  // secuencia más lenta: misma fase, mismo avance
  const slow = phases.map((p) => ({ ...p, start: p.start * 2, duration: p.duration * 2 }));
  assert.ok(Math.abs(remapTime(phases, t, slow, 1e9) - (2 * ph.start + 0.25 * 2 * ph.duration)) < 1e-9);
  assert.equal(remapTime(null, 50, phases, 10), 10);
  assert.deepEqual(locatePhase(phases, 0), { k: 0, progress: 0 });
});

test('etiquetas: posición en la mitad del arco formado y texto "D1 · 90.0° · CLR 101.6"', () => {
  assert.equal(bendLabelText(0, 90, 101.6), 'D1 · 90.0° · CLR 101.6');
  const kin = buildKinematics({ lra, plan, OD: tube.OD });
  const L = plan.layout.cutLength, n = 801;
  const s = Float64Array.from({ length: n }, (_, i) => (i * L) / (n - 1));
  assert.equal(nearestStation(s, -5), 0);
  assert.equal(nearestStation(s, L + 5), n - 1);
  const mid = plan.layout.bends.map((b) => nearestStation(s, (b.s0 + b.s1) / 2));
  const poses = new Float32Array(16 * n), formed = new Float32Array(n);
  const b2 = phases.find((p) => p.type === 'bend' && p.bend === 1);
  kin.posesAt(b2.start + 0.25 * b2.duration, s, poses, formed);
  const labels = bendLabels(mid, poses, formed, lra.bends);
  // a un cuarto del doblez 2: el 1 está terminado y el 2 aún no llega a su mitad de arco
  assert.equal(labels.length, 1);
  assert.match(labels[0].text, /^D1 · /);
  const m = mid[0];
  assert.deepEqual(labels[0].position, [poses[16 * m + 12], poses[16 * m + 13], poses[16 * m + 14]]);
  kin.posesAt(kin.duration, s, poses, formed);
  assert.equal(bendLabels(mid, poses, formed, lra.bends).length, lra.bends.length);
});

test('línea de tiempo: fase siguiente / anterior saltan fases de duración cero', () => {
  const ph = [{ start: 0, duration: 1 }, { start: 1, duration: 0 }, { start: 1, duration: 2 }, { start: 3, duration: 1 }];
  assert.equal(nextPhaseStart(ph, 0.5), 1);
  assert.equal(nextPhaseStart(ph, 1), 3);
  assert.equal(nextPhaseStart(ph, 3.5), null);
  assert.equal(prevPhaseStart(ph, 2), 1);
  assert.equal(prevPhaseStart(ph, 1), 0);
  assert.equal(prevPhaseStart(ph, 0), 0);
});
