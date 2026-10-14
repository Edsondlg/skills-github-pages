import test from 'node:test';
import assert from 'node:assert/strict';
import { SparseTSDF } from '../../js/mesh/tsdf.js';
import { removeSmallComponents, meshStats, taubinSmooth } from '../../js/mesh/process.js';
import { lookAtPose } from '../../js/core/camera.js';
import { rng, gaussRand } from '../../js/core/linalg.js';

// Mapa de profundidad analítico de una esfera (más un plano de mesa en Z = 0).
function sphereDepth(K, R, t, W, H, C, r, noise, seed) {
  const rand = rng(seed);
  const depth = new Float32Array(W * H), normal = new Float32Array(3 * W * H), cost = new Float32Array(W * H);
  const color = new Uint8Array(4 * W * H);
  // centro de la cámara
  const cam = [-(R[0] * t[0] + R[3] * t[1] + R[6] * t[2]), -(R[1] * t[0] + R[4] * t[1] + R[7] * t[2]), -(R[2] * t[0] + R[5] * t[1] + R[8] * t[2])];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const rc = [(x - K.cx) / K.fx, (y - K.cy) / K.fy, 1];
    const dw = [R[0] * rc[0] + R[3] * rc[1] + R[6], R[1] * rc[0] + R[4] * rc[1] + R[7], R[2] * rc[0] + R[5] * rc[1] + R[8]];
    // esfera
    const oc = [cam[0] - C[0], cam[1] - C[1], cam[2] - C[2]];
    const a = dw[0] ** 2 + dw[1] ** 2 + dw[2] ** 2, b = 2 * (oc[0] * dw[0] + oc[1] * dw[1] + oc[2] * dw[2]), c = oc[0] ** 2 + oc[1] ** 2 + oc[2] ** 2 - r * r;
    const disc = b * b - 4 * a * c;
    let d = -1, nw = null;
    if (disc > 0) {
      d = (-b - Math.sqrt(disc)) / (2 * a);
      const P = [cam[0] + d * dw[0], cam[1] + d * dw[1], cam[2] + d * dw[2]];
      nw = [(P[0] - C[0]) / r, (P[1] - C[1]) / r, (P[2] - C[2]) / r];
    } else {
      const lam = -cam[2] / dw[2];
      if (lam > 0) { d = lam; nw = [0, 0, 1]; }
    }
    if (d <= 0) continue;
    depth[i] = d + noise * gaussRand(rand);
    const nc = [R[0] * nw[0] + R[1] * nw[1] + R[2] * nw[2], R[3] * nw[0] + R[4] * nw[1] + R[5] * nw[2], R[6] * nw[0] + R[7] * nw[1] + R[8] * nw[2]];
    normal[3 * i] = nc[0]; normal[3 * i + 1] = nc[1]; normal[3 * i + 2] = nc[2];
    cost[i] = 0.05;
    color[4 * i] = 200; color[4 * i + 1] = 100; color[4 * i + 2] = 50; color[4 * i + 3] = 255;
  }
  return { W, H, K, R, t, depth, normal, cost, color };
}

test('TSDF + Surface Nets reconstruye una esfera con error sub-vóxel', () => {
  const W = 320, H = 240, K = { fx: 300, fy: 300, cx: 159.5, cy: 119.5 };
  const C = [5, -3, 32], r = 25;
  const tsdf = new SparseTSDF({ voxel: 0.5, trunc: 3, truncBack: 3, region: { min: [-100, -100, 0.6], max: [100, 100, 100] }, zCut: 0.6 });
  const t0 = Date.now();
  for (let k = 0; k < 12; k++) {
    const el = (35 + (k % 3) * 15) * Math.PI / 180, az = k / 12 * 2 * Math.PI;
    const eye = [220 * Math.cos(el) * Math.cos(az), 220 * Math.cos(el) * Math.sin(az), 220 * Math.sin(el)];
    const { R, t } = lookAtPose(eye, [0, 0, 20], [0, 0, 1]);
    tsdf.integrate(sphereDepth(K, R, t, W, H, C, r, 0.08, k + 1));
  }
  let mesh = tsdf.extractMesh({ minWeight: 0.5, minViews: 2 });
  mesh = removeSmallComponents(mesh);
  taubinSmooth(mesh.positions, mesh.indices, { iterations: 2 });
  const ms = Date.now() - t0;
  const st = meshStats(mesh.positions, mesh.indices);
  const errs = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const d = Math.hypot(mesh.positions[i] - C[0], mesh.positions[i + 1] - C[1], mesh.positions[i + 2] - C[2]) - r;
    errs.push(Math.abs(d));
  }
  errs.sort((a, b) => a - b);
  const rmsE = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) / errs.length);
  console.log(`  ${st.vertices} vértices, ${st.triangles} triángulos, área ${st.area.toFixed(0)} mm² (esfera sobre Z>0.6), RMS ${rmsE.toFixed(4)} mm, p99 ${errs[Math.floor(errs.length * 0.99)].toFixed(3)} mm, ${ms} ms, ${JSON.stringify(tsdf.stats())}`);
  assert.ok(st.triangles > 5000);
  assert.ok(rmsE < 0.08, 'RMS < 0.08 mm');
  // las cámaras miran desde arriba: debe cubrirse al menos el hemisferio superior y no más de 3/4
  const hemi = 2 * Math.PI * r * r;
  assert.ok(st.area > 0.97 * hemi && st.area < 1.5 * hemi, `área ${st.area} vs hemisferio ${hemi}`);
  // orientación: normales hacia afuera (volumen con signo positivo respecto al centro)
  let outward = 0, total = 0;
  for (let f = 0; f < mesh.indices.length; f += 3) {
    const [a, b, c] = [mesh.indices[f], mesh.indices[f + 1], mesh.indices[f + 2]].map(i => [mesh.positions[3 * i], mesh.positions[3 * i + 1], mesh.positions[3 * i + 2]]);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = [(a[0] + b[0] + c[0]) / 3 - C[0], (a[1] + b[1] + c[1]) / 3 - C[1], (a[2] + b[2] + c[2]) / 3 - C[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] > 0) outward++;
    total++;
  }
  assert.ok(outward / total > 0.99, `normales hacia afuera: ${(100 * outward / total).toFixed(1)}%`);
});
