import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBoard, rasterizeBoard } from '../../js/core/board.js';
import { detectMarkers } from '../../js/core/aruco.js';
import { lookAtPose, projectPoint } from '../../js/core/camera.js';
import { renderBoardView, groundTruthCorners, defaultCamera } from '../helpers/synth-cpu.mjs';

const board = makeBoard({ paper: 'A3' });
const raster = rasterizeBoard(board, 8);

function cornerErrors(dets, gt, K) {
  const errs = [];
  let visible = 0;
  for (const [id, pts] of gt) {
    const inside = pts.every(([u, v, z]) => z > 0 && u > 6 && v > 6 && u < K.width - 7 && v < K.height - 7);
    if (inside) visible++;
  }
  for (const d of dets) {
    const g = gt.get(d.id);
    assert.ok(g, `id inesperado ${d.id}`);
    for (let k = 0; k < 4; k++) errs.push(Math.hypot(d.corners[k][0] - g[k][0], d.corners[k][1] - g[k][1]));
  }
  errs.sort((a, b) => a - b);
  const rms = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
  return { errs, rms, max: errs[errs.length - 1], visible };
}

test('tablero: 30 marcadores en A3 con un anillo, IDs únicos', () => {
  assert.equal(board.markers.length, 30);
  assert.equal(new Set(board.markers.map(m => m.id)).size, 30);
  assert.ok(board.free.x1 - board.free.x0 > 250);
});

test('detección: vista oblicua con distorsión, ruido y desenfoque', () => {
  const K = defaultCamera();
  const { R, t } = lookAtPose([150, -260, 330], [0, 0, 0], [-0.4, 1, 0]);
  const gray = renderBoardView(raster, board, K, R, t, { noise: 2, blurSigma: 0.8, seed: 11 });
  const t0 = Date.now();
  const dets = detectMarkers(gray, K.width, K.height);
  const ms = Date.now() - t0;
  const gt = groundTruthCorners(board, K, R, t);
  const e = cornerErrors(dets, gt, K);
  console.log(`  detectados ${dets.length}/${e.visible} visibles, RMS esquina ${e.rms.toFixed(3)} px, máx ${e.max.toFixed(3)} px, ${ms} ms`);
  assert.ok(dets.length >= e.visible - 1, 'debe detectar casi todos los visibles');
  assert.ok(e.rms < 0.12, `RMS de esquinas demasiado alto: ${e.rms}`);
  assert.ok(e.max < 0.5);
});

test('detección: vista cenital rotada 90° y 180° (orden de esquinas)', () => {
  const K = defaultCamera(1280, 960);
  for (const upv of [[1, 0, 0], [0, -1, 0]]) {
    const { R, t } = lookAtPose([10, 5, 520], [0, 0, 0], upv);
    const gray = renderBoardView(raster, board, K, R, t, { noise: 1, seed: 5 });
    const dets = detectMarkers(gray, K.width, K.height);
    const gt = groundTruthCorners(board, K, R, t);
    const e = cornerErrors(dets, gt, K);
    console.log(`  up=${upv}: detectados ${dets.length}/${e.visible}, RMS ${e.rms.toFixed(3)} px`);
    assert.ok(dets.length >= e.visible - 1);
    assert.ok(e.rms < 0.12);
  }
});

test('refinamiento con modelo de distorsión conocido mejora o mantiene precisión', () => {
  const K = defaultCamera();
  const { R, t } = lookAtPose([-200, 180, 300], [20, -10, 0], [1, -0.5, 0]);
  const gray = renderBoardView(raster, board, K, R, t, { noise: 1.5, blurSigma: 0.7, seed: 3 });
  const gt = groundTruthCorners(board, K, R, t);
  const a = cornerErrors(detectMarkers(gray, K.width, K.height), gt, K);
  const b = cornerErrors(detectMarkers(gray, K.width, K.height, { K }), gt, K);
  console.log(`  sin modelo ${a.rms.toFixed(3)} px, con modelo ${b.rms.toFixed(3)} px`);
  assert.ok(b.rms <= a.rms + 0.01);
});
