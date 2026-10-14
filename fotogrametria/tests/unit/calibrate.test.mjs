import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBoard, rasterizeBoard, boardCornerMap } from '../../js/core/board.js';
import { detectMarkers } from '../../js/core/aruco.js';
import { projectPoint, cameraCenter } from '../../js/core/camera.js';
import { calibrateCamera, registerView, homographyDLT } from '../../js/core/calibrate.js';
import { triangulate } from '../../js/core/triangulate.js';
import { v3, rodrigues, mat3Mul, mat3T, rodriguesInv } from '../../js/core/linalg.js';
import { renderBoardView, defaultCamera, ringPoses } from '../helpers/synth-cpu.mjs';

const board = makeBoard({ paper: 'A3' });
const raster = rasterizeBoard(board, 8);
const Kgt = defaultCamera();
const poses = ringPoses(14, { radius: 420, elevDeg: [38, 55, 70] });
const corners = boardCornerMap(board);
const checkSet = new Set(board.checkIds);

let images = null;
function getImages() {
  if (!images) images = poses.map((p, i) => renderBoardView(raster, board, Kgt, p.R, p.t, { noise: 2, blurSigma: 0.7, seed: 100 + i }));
  return images;
}

function buildViews(dets, includeCheck = false) {
  return dets.map(ds => ({
    width: Kgt.width, height: Kgt.height,
    obs: ds.filter(d => corners.has(d.id) && d.refined && (includeCheck || !checkSet.has(d.id)))
      .flatMap(d => d.corners.map((uv, k) => ({ X: corners.get(d.id)[k], uv, id: d.id, k }))),
  }));
}

test('homografía DLT exacta en datos sin ruido', () => {
  const H0 = [1.2, 0.1, 30, -0.05, 0.9, 12, 0.0004, -0.0002, 1];
  const src = [[0, 0], [100, 0], [100, 80], [0, 80], [50, 40], [20, 70]];
  const dst = src.map(([x, y]) => { const w = H0[6] * x + H0[7] * y + 1; return [(H0[0] * x + H0[1] * y + H0[2]) / w, (H0[3] * x + H0[4] * y + H0[5]) / w]; });
  const H = homographyDLT(src, dst);
  for (let i = 0; i < 9; i++) assert.ok(Math.abs(H[i] - H0[i]) < 1e-6 * Math.max(1, Math.abs(H0[i])));
});

test('calibración completa con 14 vistas sintéticas', () => {
  const imgs = getImages();
  const t0 = Date.now();
  const dets = imgs.map(g => detectMarkers(g, Kgt.width, Kgt.height));
  const tDet = Date.now() - t0;
  const res = calibrateCamera(buildViews(dets), { flags: { fixK3: false } });
  assert.ok(res.ok, res.error);
  const K = res.K;
  console.log(`  detección ${(tDet / imgs.length).toFixed(0)} ms/foto; RMS reproyección ${res.rms.toFixed(4)} px con ${res.nPoints} puntos`);
  console.log(`  f=${K.fx.toFixed(2)} (gt ${Kgt.fx}) cx=${K.cx.toFixed(2)} (gt ${Kgt.cx.toFixed(2)}) cy=${K.cy.toFixed(2)} (gt ${Kgt.cy.toFixed(2)}) k1=${K.k1.toFixed(4)} k2=${K.k2.toFixed(4)} k3=${K.k3.toFixed(4)} p1=${K.p1.toFixed(5)} p2=${K.p2.toFixed(5)}`);
  console.log(`  σf=${res.std.f.toFixed(3)} σcx=${res.std.cx.toFixed(3)}`);
  assert.ok(Math.abs(K.fx - Kgt.fx) / Kgt.fx < 0.002, 'focal');
  assert.ok(Math.abs(K.cx - Kgt.cx) < 2 && Math.abs(K.cy - Kgt.cy) < 2, 'punto principal');
  assert.ok(res.rms < 0.15, 'RMS');
  // error de reproyección del modelo verdadero vs estimado sobre toda la imagen (< 0.3 px)
  let maxDiff = 0;
  for (let y = 0; y < Kgt.height; y += 100) for (let x = 0; x < Kgt.width; x += 100) {
    const X = [(x - Kgt.cx) / Kgt.fx, (y - Kgt.cy) / Kgt.fy, 1];
    const a = projectPoint(Kgt, [1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0], X);
    const b = projectPoint(K, [1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0], X);
    maxDiff = Math.max(maxDiff, Math.hypot(a[0] - b[0], a[1] - b[1]));
  }
  console.log(`  diferencia máxima de proyección (modelo vs verdad): ${maxDiff.toFixed(3)} px`);
  // poses: error de posición de cámara
  let maxPos = 0;
  res.views.forEach((v, i) => { if (v.used) maxPos = Math.max(maxPos, v3.dist(cameraCenter(v.R, v.t), cameraCenter(poses[i].R, poses[i].t))); });
  console.log(`  error máximo de posición de cámara: ${maxPos.toFixed(3)} mm`);
  assert.ok(maxPos < 1.0);

  // segunda pasada: re-refinar esquinas con el modelo de distorsión y recalibrar
  const dets2 = imgs.map(g => detectMarkers(g, Kgt.width, Kgt.height, { K }));
  const res2 = calibrateCamera(buildViews(dets2), { flags: { fixK3: false }, fInit: K.fx });
  console.log(`  2ª pasada: RMS ${res2.rms.toFixed(4)} px, f=${res2.K.fx.toFixed(2)}`);
  assert.ok(res2.rms <= res.rms * 1.05);

  // puntos de control (marcadores excluidos de la calibración): triangular y comparar
  const obsByPt = new Map();
  dets2.forEach((ds, vi) => {
    const v = res2.views[vi];
    if (!v.used) return;
    for (const d of ds) {
      if (!checkSet.has(d.id) || !d.refined) continue;
      d.corners.forEach((uv, k) => {
        const key = `${d.id}:${k}`;
        if (!obsByPt.has(key)) obsByPt.set(key, []);
        obsByPt.get(key).push({ K: res2.K, R: v.R, t: v.t, uv });
      });
    }
  });
  const errs = [], errZ = [];
  for (const [key, obs] of obsByPt) {
    if (obs.length < 3) continue;
    const r = triangulate(obs);
    const [id, k] = key.split(':').map(Number);
    const gt = corners.get(id)[k];
    errs.push(v3.dist(r.X, gt)); errZ.push(Math.abs(r.X[2] - gt[2]));
  }
  const rms3 = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
  console.log(`  puntos de control: ${errs.length}, RMS 3D ${rms3.toFixed(4)} mm, máx ${Math.max(...errs).toFixed(4)} mm, máx |Z| ${Math.max(...errZ).toFixed(4)} mm`);
  assert.ok(errs.length >= 20);
  assert.ok(rms3 < 0.05, 'exactitud de puntos de control < 0.05 mm');
});

test('registro de una vista adicional con cámara calibrada', () => {
  const imgs = getImages();
  const dets = detectMarkers(imgs[3], Kgt.width, Kgt.height, { K: Kgt });
  const obs = buildViews([dets], true)[0].obs;
  const r = registerView(Kgt, obs);
  assert.ok(r);
  const dpos = v3.dist(cameraCenter(r.R, r.t), cameraCenter(poses[3].R, poses[3].t));
  const dR = mat3Mul(r.R, mat3T(poses[3].R));
  const ang = v3.norm(rodriguesInv(dR)) * 180 / Math.PI;
  console.log(`  PnP: RMS ${r.rms.toFixed(4)} px, error posición ${dpos.toFixed(3)} mm, error ángulo ${ang.toFixed(4)}°`);
  assert.ok(dpos < 0.5 && ang < 0.05);
});
