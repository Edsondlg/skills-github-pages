// Prueba de precisión de PatchMatch con cámaras verdaderas (aísla el estéreo de la calibración).
import { openPage } from './browser.mjs';
const { page, close, logs } = await openPage('tests/e2e/harness.html');
await page.waitForFunction(() => window.harnessReady === true);
const res = await page.evaluate(async (opts) => {
  const { board: B, synth } = window.mods;
  const { PatchMatchEngine } = await import('../../js/mvs/patchmatch.js');
  const { computeROI, selectSources } = await import('../../js/mvs/views.js');
  const board = B.makeBoard({ paper: 'A3' });
  const t0 = performance.now();
  const demo = await synth.renderDemoPhotos(board, { count: opts.count, width: 1600, height: 1200, supersample: 1 });
  const tRender = performance.now() - t0;
  const W = opts.W, H = opts.H;
  const box = opts.box || { min: [board.free.x0, board.free.y0, -3], max: [board.free.x1, board.free.y1, 50] };
  const eng = new PatchMatchEngine({ width: W, height: H, numViews: demo.files.length });
  const cams = [];
  for (let i = 0; i < demo.files.length; i++) {
    const bmp = await createImageBitmap(demo.files[i]);
    const { R, t } = demo.poses[i];
    const roi = computeROI(demo.K, R, t, opts.roiBox || box, W, H);
    const { Kw } = await eng.prepareView(i, bmp, demo.K, roi, { readColor: false });
    eng.setPose(i, R, t);
    cams.push({ K: { ...Kw, width: W, height: H }, R, t, roi });
    bmp.close();
  }
  const { scene } = synth.buildDemoScene(board);
  const out = [];
  for (const ref of opts.refs) {
    const srcs = selectSources(ref, cams, box, { maxSources: opts.nsrc });
    const t1 = performance.now();
    const dm = await eng.computeDepth(ref, srcs, { box, iterations: opts.iters, topK: opts.topK });
    const tPM = performance.now() - t1;
    const gt = synth.renderDepthGT(scene, cams[ref].K, cams[ref].R, cams[ref].t, W, H);
    const errs = [], errsAll = [];
    let valid = 0, inBox = 0;
    const hist = {};
    const cr = cams[ref];
    const img = new Uint8ClampedArray(W * H * 4);
    let gtOut = 0;
    for (let i = 0; i < W * H; i++) {
      const x = i % W, y = Math.floor(i / W);
      img[4 * i + 3] = 255;
      if (dm.depth[i] > 0) inBox++;
      if (!(dm.depth[i] > 0) || !(gt[i] > 0)) continue;
      // punto verdadero en el mundo
      const xc = [(x - cr.K.cx) / cr.K.fx * gt[i], (y - cr.K.cy) / cr.K.fy * gt[i], gt[i]];
      const R = cr.R, tt = cr.t;
      const d = [xc[0] - tt[0], xc[1] - tt[1], xc[2] - tt[2]];
      const Xw = [R[0] * d[0] + R[3] * d[1] + R[6] * d[2], R[1] * d[0] + R[4] * d[1] + R[7] * d[2], R[2] * d[0] + R[5] * d[1] + R[8] * d[2]];
      const inside = Xw[0] >= box.min[0] && Xw[0] <= box.max[0] && Xw[1] >= box.min[1] && Xw[1] <= box.max[1] && Xw[2] >= box.min[2] && Xw[2] <= box.max[2];
      if (!inside) { gtOut++; img[4 * i + 2] = 160; continue; }
      const ee = Math.abs(dm.depth[i] - gt[i]);
      if (dm.cost[i] < opts.thr) { img[4 * i] = ee > 2 ? 255 : (ee > 0.5 ? 255 : 0); img[4 * i + 1] = ee > 2 ? 0 : 200; }
      else { img[4 * i] = 60; img[4 * i + 1] = 60; img[4 * i + 2] = 60; }
      const e = Math.abs(dm.depth[i] - gt[i]);
      errsAll.push(e);
      const cb = Math.min(10, Math.floor(dm.cost[i] * 10));
      hist[cb] = hist[cb] || [0, 0];
      hist[cb][0]++; if (e > 2) hist[cb][1]++;
      if (dm.cost[i] < opts.thr) { errs.push(e); valid++; }
    }
    const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
    cnv.getContext('2d').putImageData(new ImageData(img, W, H), 0, 0);
    out.push({ errImg: cnv.toDataURL('image/png'), gtOut });
    out.push({ hist: Object.entries(hist).map(([k, v]) => `${(k / 10).toFixed(1)}: n=${v[0]} bad=${(100 * v[1] / v[0]).toFixed(1)}%`).join(' | ') });
    errs.sort((a, b) => a - b); errsAll.sort((a, b) => a - b);
    const q = (a, p) => a.length ? a[Math.floor((a.length - 1) * p)] : NaN;
    out.push({ ref, srcs, tPM: Math.round(tPM), inBox, valid, med: q(errs, 0.5), p90: q(errs, 0.9), p99: q(errs, 0.99), within05: errs.filter(e => e < 0.5).length / Math.max(1, errs.length), medAll: q(errsAll, 0.5), p90All: q(errsAll, 0.9) });
  }
  return { tRender: Math.round(tRender), out };
}, { count: +(process.env.COUNT || 10), W: +(process.env.W || 480), H: +(process.env.H || 360), refs: (process.env.REFS || '0').split(',').map(Number), nsrc: +(process.env.NSRC || 4), topK: +(process.env.TOPK || 2), iters: +(process.env.ITERS || 6), thr: +(process.env.THR || 0.4), roiBox: process.env.ROIBOX ? JSON.parse(process.env.ROIBOX) : null });
import fs from 'node:fs';
for (const o of res.out) if (o.errImg) { fs.writeFileSync(process.env.ERRIMG || '/tmp/errimg.png', Buffer.from(o.errImg.split(',')[1], 'base64')); delete o.errImg; }
console.log(JSON.stringify(res, null, 1));
const errs = logs.filter(l => /error/i.test(l));
if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await close();
