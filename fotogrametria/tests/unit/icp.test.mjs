import test from 'node:test';
import assert from 'node:assert/strict';
import { TriangleGrid, samplePoints } from '../../js/analysis/distance.js';
import { autoAlign, applyTransform } from '../../js/analysis/icp.js';
import { rodrigues, mat3Mul, mat3T, rodriguesInv, rng } from '../../js/core/linalg.js';

// Caja asimétrica (escalón) como "CAD" triangulado
function stepBox() {
  const P = [], I = [];
  const box = (x0, y0, z0, x1, y1, z1) => {
    const b = P.length / 3;
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    for (const p of v) P.push(...p);
    const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
    for (const t of f) I.push(b + t[0], b + t[1], b + t[2]);
  };
  box(0, 0, 0, 120, 60, 3);
  box(0, 50, 0, 120, 60, 40);
  box(20, 10, 3, 60, 25, 8);
  return { positions: new Float32Array(P), indices: new Uint32Array(I) };
}

test('ICP recupera una transformación rígida (medición parcial)', () => {
  const cad = stepBox();
  const grid = new TriangleGrid(cad.positions, cad.indices);
  const rand = rng(3);
  const S = samplePoints(cad.positions, cad.indices, 1.2, rand);
  // medición parcial: solo caras visibles desde arriba
  const pts = [], nrm = [];
  for (let i = 0; i < S.points.length / 3; i++) if (grid.N[3 * S.tris[i] + 2] > -0.3) {
    pts.push(S.points[3 * i], S.points[3 * i + 1], S.points[3 * i + 2]);
    nrm.push(grid.N[3 * S.tris[i]], grid.N[3 * S.tris[i] + 1], grid.N[3 * S.tris[i] + 2]);
  }
  const Rgt = rodrigues([0.1, -0.05, 0.6]), tgt = [35, -20, 4];
  // scan = Rgt^-1 (cad - tgt)  => el alineado debe dar R ≈ Rgt, t ≈ tgt
  const RgtT = mat3T(Rgt);
  const scan = new Float32Array(pts.length);
  for (let i = 0; i < pts.length; i += 3) {
    const d = [pts[i] - tgt[0], pts[i + 1] - tgt[1], pts[i + 2] - tgt[2]];
    scan[i] = RgtT[0] * d[0] + RgtT[1] * d[1] + RgtT[2] * d[2] + 0.05 * (rand() - 0.5);
    scan[i + 1] = RgtT[3] * d[0] + RgtT[4] * d[1] + RgtT[5] * d[2] + 0.05 * (rand() - 0.5);
    scan[i + 2] = RgtT[6] * d[0] + RgtT[7] * d[1] + RgtT[8] * d[2] + 0.05 * (rand() - 0.5);
  }
  // normales de la medición en su propio marco: Rgt^T n
  const scanN = new Float32Array(nrm.length);
  for (let i = 0; i < nrm.length; i += 3) for (let a = 0; a < 3; a++) scanN[i + a] = RgtT[3 * a] * nrm[i] + RgtT[3 * a + 1] * nrm[i + 1] + RgtT[3 * a + 2] * nrm[i + 2];
  const r = autoAlign(scan, S.points, grid, { useIdentity: false, normals: scanN });
  const dR = mat3Mul(r.R, mat3T(Rgt));
  const ang = Math.hypot(...rodriguesInv(dR)) * 180 / Math.PI;
  const dt = Math.hypot(r.t[0] - tgt[0], r.t[1] - tgt[1], r.t[2] - tgt[2]);
  console.log("  t", r.t.map(v => v.toFixed(3)).join(","), "tgt", tgt.join(","));
  console.log(`  RMS ${r.rms.toFixed(4)} mm, error de ángulo ${ang.toFixed(4)}°, error de traslación ${dt.toFixed(4)} mm, inicio: ${r.start}`);
  assert.ok(ang < 0.1 && dt < 0.1 && r.rms < 0.05);
  const al = applyTransform(r.R, r.t, scan);
  let maxd = 0;
  for (let i = 0; i < al.length; i += 3) maxd = Math.max(maxd, grid.closest(al[i], al[i + 1], al[i + 2], 10).dist);
  assert.ok(maxd < 0.2);
});
