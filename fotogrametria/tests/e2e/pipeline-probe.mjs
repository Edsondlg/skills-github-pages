// Prueba de punta a punta: fotos sintéticas -> detección -> calibración -> reconstrucción -> exactitud.
import { openPage } from './browser.mjs';
const opts = {
  count: +(process.env.COUNT || 12), width: +(process.env.IW || 1600), height: +(process.env.IH || 1200),
  dump: process.env.DUMP || '',
  quality: { label: 'Prueba', coarse: +(process.env.COARSE || 320), fine: +(process.env.FINE || 640), iters: +(process.env.ITERS || 5), nsrc: +(process.env.NSRC || 4), topK: 2, voxelFactor: 1.8 },
};
const { page, close, logs } = await openPage('tests/e2e/harness.html');
await page.waitForFunction(() => window.harnessReady === true);
const res = await page.evaluate(async (opts) => {
  const { synth } = window.mods;
  const { PhotoProject } = await import('../../js/project.js');
  const { workerPool } = await import('../../js/workers/rpc.js');
  const { reconstruct } = await import('../../js/mvs/pipeline.js');
  const { TriangleGrid, pointsToMesh, samplePoints } = await import('../../js/analysis/distance.js');
  const T = {};
  let t = performance.now();
  const proj = new PhotoProject({ paper: 'A3' });
  const demo = await synth.renderDemoPhotos(proj.board, { count: opts.count, width: opts.width, height: opts.height, supersample: 1 });
  T.render = performance.now() - t; t = performance.now();
  await proj.addFiles(demo.files);
  const pool = workerPool(new URL('../../js/workers/detect.worker.js', location.href), 4);
  await proj.detect(pool);
  T.detect = performance.now() - t; t = performance.now();
  const cal = await proj.calibrate(pool);
  T.calib = performance.now() - t; t = performance.now();
  pool.terminate();
  // comparación de calibración con la verdad
  const Kgt = demo.K;
  const calibErr = { df: cal.K.fx - Kgt.fx, dcx: cal.K.cx - Kgt.cx, dcy: cal.K.cy - Kgt.cy, k1: [cal.K.k1, Kgt.k1], k2: [cal.K.k2, Kgt.k2] };
  const camErr = [];
  proj.photos.forEach((p, i) => {
    if (!p.registered) return;
    const C = (R, t) => [-(R[0] * t[0] + R[3] * t[1] + R[6] * t[2]), -(R[1] * t[0] + R[4] * t[1] + R[7] * t[2]), -(R[2] * t[0] + R[5] * t[1] + R[8] * t[2])];
    const a = C(p.R, p.t), b = C(demo.poses[i].R, demo.poses[i].t);
    camErr.push(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
  });
  const views = proj.registeredViews().map(p => ({ file: p.file, R: p.R, t: p.t }));
  window.__dumps = [];
  const rec = await reconstruct({ views, K: cal.K, board: proj.board, params: { quality: opts.quality, sheetThickness: 2 }, keepPreviews: false, onDepthMap: opts.dump ? (d) => window.__dumps.push(d) : null });
  window.__rec = rec; window.__gt = demo.gt;
  T.recon = performance.now() - t; t = performance.now();
  // exactitud: distancia de vértices de la malla a la geometría verdadera
  const grid = new TriangleGrid(demo.gt.positions, demo.gt.indices);
  const d = pointsToMesh(rec.mesh.positions, grid, 20);
  const arr = Array.from(d).sort((a, b) => a - b);
  const q = (p) => arr[Math.floor((arr.length - 1) * p)];
  // completitud: muestras de la superficie verdadera visible (Z > 1, cara superior/lateral) cerca de la malla
  const recGrid = new TriangleGrid(rec.mesh.positions, rec.mesh.indices);
  const S = samplePoints(demo.gt.positions, demo.gt.indices, 1.0, (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })());
  let nS = 0, nC = 0;
  for (let i = 0; i < S.points.length / 3; i++) {
    const z = S.points[3 * i + 2];
    if (z < 1.2) continue;
    const g = grid.closest(S.points[3 * i], S.points[3 * i + 1], z + 0.0);
    // solo superficies con normal hacia arriba o laterales (las inferiores no son visibles)
    const tri = S.tris[i];
    const nz = grid.N[3 * tri + 2];
    if (nz < -0.3) continue;
    nS++;
    const r = recGrid.closest(S.points[3 * i], S.points[3 * i + 1], z, 1.0);
    if (r) nC++;
  }
  T.eval = performance.now() - t;
  // render de la malla reconstruida (colores de vértice y desviación) para inspección visual
  const THREE = window.THREE;
  const renderMesh = (colorFn, eye) => {
    const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    r.setSize(900, 600);
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x30343a);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(rec.mesh.positions, 3));
    const cols = new Float32Array(rec.mesh.positions.length);
    for (let i = 0; i < cols.length / 3; i++) { const c = colorFn(i); cols[3 * i] = c[0]; cols[3 * i + 1] = c[1]; cols[3 * i + 2] = c[2]; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.setIndex(new THREE.BufferAttribute(rec.mesh.indices, 1));
    g.computeVertexNormals();
    sc.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
    sc.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(-100, -150, 300); sc.add(dl);
    const cam = new THREE.PerspectiveCamera(35, 1.5, 1, 5000);
    cam.up.set(0, 0, 1); cam.position.set(...eye); cam.lookAt(0, 0, 10);
    r.render(sc, cam);
    const url = r.domElement.toDataURL('image/png');
    r.dispose();
    return url;
  };
  const img1 = renderMesh(i => [rec.mesh.colors[3 * i] / 255, rec.mesh.colors[3 * i + 1] / 255, rec.mesh.colors[3 * i + 2] / 255], [-120, -260, 220]);
  const img2 = renderMesh(i => { const e = Math.min(1, d[i] / 1.0); return [e, 1 - e, 0.2]; }, [-120, -260, 220]);
  return {
    images: [img1, img2],
    T: Object.fromEntries(Object.entries(T).map(([k, v]) => [k, Math.round(v)])),
    calib: { rms: cal.rms, registered: cal.registered, total: cal.total, check: cal.check, calibErr, camErrMax: Math.max(...camErr), stickers: cal.stickers.length, coverage: cal.coverage.frac },
    recon: { voxel: rec.voxel, gsd: rec.gsd, partBox: rec.partBox, tris: rec.meshStats && rec.meshStats.triangles, table: rec.tableStats, timings: rec.timings, perView: rec.perView.map(v => [v.index, +(v.validFrac || 0).toFixed(2), +(v.meanCost || 0).toFixed(3)]) },
    acc: { n: arr.length, mean: arr.reduce((s, v) => s + v, 0) / arr.length, med: q(0.5), p90: q(0.9), p95: q(0.95), p99: q(0.99), within05: arr.filter(v => v < 0.5).length / arr.length, within1: arr.filter(v => v < 1).length / arr.length },
    completeness: nC / Math.max(1, nS), nSamples: nS,
  };
}, opts);
import fs from 'node:fs';
if (opts.dump) {
  // volcado binario de mapas de profundidad + verdad para iterar la fusión en Node
  const dumps = await page.evaluate(() => window.__dumps.map(d => ({ W: d.W, H: d.H, K: d.K, R: d.R, t: d.t, index: d.index })));
  fs.mkdirSync(opts.dump, { recursive: true });
  fs.writeFileSync(`${opts.dump}/meta.json`, JSON.stringify({ maps: dumps, tsdfOpts: await page.evaluate(() => window.__rec.tsdfOpts) }));
  for (let i = 0; i < dumps.length; i++) {
    for (const key of ['depth', 'normal', 'cost', 'color']) {
      const b64 = await page.evaluate(([i, key]) => { const a = window.__dumps[i][key]; const u8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768)); return btoa(s); }, [i, key]);
      fs.writeFileSync(`${opts.dump}/${i}_${key}.bin`, Buffer.from(b64, 'base64'));
    }
  }
  const gt = await page.evaluate(() => ({ p: Array.from(window.__gt.positions), i: Array.from(window.__gt.indices) }));
  fs.writeFileSync(`${opts.dump}/gt.json`, JSON.stringify(gt));
}
(res.images || []).forEach((u, i) => fs.writeFileSync((process.env.OUTDIR || '/tmp') + `/mesh_${i}.png`, Buffer.from(u.split(',')[1], 'base64')));
delete res.images;
console.log(JSON.stringify(res, null, 1));
const errs = logs.filter(l => /error/i.test(l));
if (errs.length) console.log(errs.slice(0, 8).join('\n'));
await close();
