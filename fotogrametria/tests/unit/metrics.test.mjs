import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMetrics, metricsToCSV } from '../../js/analysis/metrics.js';
import { makeBoard } from '../../js/core/board.js';
import { lookAtPose } from '../../js/core/camera.js';

function fakeProject(rms, check) {
  const board = makeBoard({ paper: 'A3' });
  const photos = Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * 2 * Math.PI;
    const { R, t } = lookAtPose([300 * Math.cos(a), 300 * Math.sin(a), 280 + 60 * (i % 3)], [0, 0, 0]);
    return { name: `f${i}.jpg`, dets: [], nMat: 20, sharp: 900 + 10 * i, expo: { clipHigh: 0, clipLow: 0 }, registered: true, R, t };
  });
  return {
    photos, board,
    calib: { rms, nPoints: 2000, K: { fx: 2000 }, std: { f: 0.5 }, coverage: { frac: 0.9 }, check: { n: 60, rms3d: check, max3d: 2 * check, scaleErrPPM: 200 }, stickers: [] },
    networkStats() { return { azimuthCoverage: 1, elevMin: 40, elevMax: 75 }; },
  };
}
const recon = (sigma) => ({
  perView: Array.from({ length: 12 }, (_, i) => ({ index: i, validFrac: 0.8 })),
  tableStats: { sigma, rms: sigma * 1.2, bias: 0, p95: 2 * sigma },
  mesh: { conf: new Float32Array(1000).fill(6) },
  meshStats: { bbox: { size: [140, 80, 44], max: [70, 40, 44] }, area: 25000, vertices: 1000, triangles: 2000, closed: false },
  voxel: 0.3, gsd: 0.15,
});

test('métricas: buena captura -> índice alto y cumple ±1 mm', () => {
  const M = computeMetrics({ project: fakeProject(0.25, 0.05), recon: recon(0.03), target: 1 });
  assert.ok(M.index > 0.85, `índice ${M.index}`);
  assert.equal(M.verdict, 'Excelente');
  assert.ok(M.meetsTarget && M.uncertainty95 < 0.3);
  assert.ok(metricsToCSV(M).split('\n').length > 10);
});

test('métricas: captura deficiente -> índice bajo y no cumple', () => {
  const M = computeMetrics({ project: fakeProject(1.8, 0.7), recon: recon(0.5), target: 1 });
  assert.ok(M.index < 0.5, `índice ${M.index}`);
  assert.equal(M.meetsTarget, false);
  assert.ok(M.recs.length >= 2);
});
