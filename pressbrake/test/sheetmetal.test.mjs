import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import occtimportjs from 'occt-import-js';
import { analyzeSheetMetal, deformPositions, vec } from '../js/sheetmetal.js';
import { planProcess } from '../js/process.js';

const occt = await occtimportjs();
const load = (name) => {
  const m = occt.ReadStepFile(new Uint8Array(fs.readFileSync(new URL(`../samples/${name}`, import.meta.url))), null).meshes[0];
  return analyzeSheetMetal({ positions: new Float32Array(m.attributes.position.array), index: new Uint32Array(m.index.array), faces: m.brep_faces });
};

const cases = [
  { file: 'canal.step', T: 2, bends: 3, flatL: 216.19, flatW: 150, holes: 4 },
  { file: 'bracket.step', T: 2, bends: 3, holes: 6 },
  { file: 'tray.step', T: 1.5, bends: 4, holes: 5 },
];

for (const c of cases) {
  test(c.file, () => {
    const m = load(c.file);
    assert.ok(Math.abs(m.T - c.T) < 0.01, `espesor ${m.T}`);
    assert.equal(m.bends.length, c.bends);
    assert.equal(m.holeCount, c.holes);
    for (const b of m.bends) assert.ok(Math.abs(b.theta - Math.PI / 2) < 1e-3, 'doblez de 90°');
    // s = 1 reproduce la geometría original
    const full = deformPositions(m, m.bends.map(() => 1));
    let err = 0;
    for (let i = 0; i < full.length; i++) err = Math.max(err, Math.abs(full[i] - m.positions[i]));
    assert.ok(err < 1e-3, `error formado ${err}`);
    // s = 0 queda plano: todo el desarrollo dentro del espesor
    const flat = deformPositions(m, m.bends.map(() => 0));
    const n = m.bends.find((b) => b.parentBend === -1).nP, p0 = [flat[0], flat[1], flat[2]];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < flat.length; i += 3) { const d = vec.dot(vec.sub([flat[i], flat[i + 1], flat[i + 2]], p0), n); lo = Math.min(lo, d); hi = Math.max(hi, d); }
    assert.ok(Math.abs(hi - lo - m.T) < 0.01, `desarrollo no plano: ${hi - lo}`);
    if (c.flatL) {
      assert.ok(Math.abs(m.flatBBox.L - c.flatL) < 0.05, `largo plano ${m.flatBBox.L}`);
      assert.ok(Math.abs(m.flatBBox.W - c.flatW) < 0.05, `ancho plano ${m.flatBBox.W}`);
    }
    const plan = planProcess(m);
    assert.equal(plan.steps.length, c.bends);
    assert.ok(plan.steps.every((s) => s.collision.total === 0), 'secuencia sin colisiones');
    assert.ok(plan.cycle > 0 && plan.cost.price > 0);
  });
}
