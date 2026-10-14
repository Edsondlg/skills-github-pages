// Orquestación de la reconstrucción densa: etapa gruesa (caja de la pieza) + etapa fina
// (PatchMatch en GPU con recorte ajustado) + fusión TSDF en worker + malla.
import { GPU } from './gpu.js';
import { PatchMatchEngine } from './patchmatch.js';
import { computeROI, selectSources } from './views.js';
import { workerRPC } from '../workers/rpc.js';
import { median, percentile } from '../core/linalg.js';
import { depthToImage } from '../core/colormap.js';

export const QUALITY = {
  rapida: { label: 'Rápida', coarse: 448, fine: 960, iters: 5, nsrc: 4, topK: 2, voxelFactor: 2.2 },
  normal: { label: 'Normal', coarse: 576, fine: 1280, iters: 7, nsrc: 6, topK: 3, voxelFactor: 1.8 },
  alta: { label: 'Alta', coarse: 640, fine: 1600, iters: 8, nsrc: 6, topK: 3, voxelFactor: 1.6 },
  maxima: { label: 'Máxima', coarse: 640, fine: 2048, iters: 9, nsrc: 8, topK: 3, voxelFactor: 1.5 },
  prueba: { label: 'Prueba', coarse: 320, fine: 640, iters: 4, nsrc: 4, topK: 2, voxelFactor: 1.8, hidden: true },
};

export const RECON_DEFAULTS = {
  quality: 'normal', maxHeight: 120, zCut: 0.5, sheetThickness: 1.5, costThr: 0.4,
  minViews: 2, smooth: 2, margin: 6, voxel: null, coarseScale: null,
};

function sizesFor(width, height, longSide) {
  const s = longSide / Math.max(width, height);
  const W = Math.max(64, Math.round(width * s / 8) * 8), H = Math.max(64, Math.round(height * s / 8) * 8);
  return [W, H];
}

const yieldUI = () => new Promise(r => setTimeout(r, 0));

// views: [{ file, R, t }] registradas; K: intrínsecos completos (con distorsión) comunes.
export function scaleIntrinsics(K, s) {
  const width = Math.round(K.width * s), height = Math.round(K.height * s);
  const sx = width / K.width, sy = height / K.height;
  return { ...K, width, height, fx: K.fx * sx, fy: K.fy * sy, cx: (K.cx + 0.5) * sx - 0.5, cy: (K.cy + 0.5) * sy - 0.5 };
}

export async function reconstruct({ views, K, board, params = {}, onProgress = () => {}, signal = null, workerUrl = null, keepPreviews = true, onDepthMap = null }) {
  const p = { ...RECON_DEFAULTS, ...params };
  const Q = typeof p.quality === 'object' ? p.quality : (QUALITY[p.quality] || QUALITY.normal);
  const tStart = performance.now();
  const timings = {};
  const check = () => { if (signal && signal.aborted) throw new Error('Reconstrucción cancelada.'); };
  const N = views.length;
  if (N < 3) throw new Error('Se necesitan al menos 3 fotos registradas.');
  const gpu = new GPU();
  const free = board.free;
  const searchBox = { min: [free.x0 - 2, free.y0 - 2, -3], max: [free.x1 + 2, free.y1 + 2, p.maxHeight] };
  // fotos mayores que el límite de texturas de la GPU: se decodifican reducidas con K escalada
  const srcScale = Math.min(1, gpu.maxTex / Math.max(K.width, K.height));
  if (srcScale < 1) K = scaleIntrinsics(K, srcScale);
  const bitmaps = new Array(N);
  const getBitmap = async (i) => {
    if (bitmaps[i]) return bitmaps[i];
    const bmp = await createImageBitmap(views[i].file);
    if (bmp.width === K.width && bmp.height === K.height) return (bitmaps[i] = bmp);
    const r = await createImageBitmap(bmp, { resizeWidth: K.width, resizeHeight: K.height, resizeQuality: 'high' });
    bmp.close?.();
    return (bitmaps[i] = r);
  };
  const releaseBitmaps = () => { for (let i = 0; i < N; i++) if (bitmaps[i]) { bitmaps[i].close?.(); bitmaps[i] = null; } };
  let partBox;
  try {
    // ---------------- Etapa gruesa: localizar la pieza ----------------
    const t0 = performance.now();
    const [Wc, Hc] = sizesFor(K.width, K.height, Q.coarse);
    const engC = new PatchMatchEngine({ width: Wc, height: Hc, numViews: N, gpu });
    const camsC = [];
    for (let i = 0; i < N; i++) {
      check();
      const roi = computeROI(K, views[i].R, views[i].t, searchBox, Wc, Hc);
      if (!roi) { camsC.push(null); continue; }
      const { Kw } = await engC.prepareView(i, await getBitmap(i), K, roi, { readColor: false });
      engC.setPose(i, views[i].R, views[i].t);
      camsC.push({ K: { ...Kw, width: Wc, height: Hc }, R: views[i].R, t: views[i].t });
      onProgress('preparar', (i + 1) / N, `Preparando foto ${i + 1}/${N}`);
    }
    const vox = 2.0;
    const votes = new Map();
    const key = (x, y, z) => (x + 32768) + (y + 32768) * 65536 + (z + 32768) * 4294967296;
    const coarseMaps = [];
    const tableZ = [];
    for (let r = 0; r < N; r++) {
      check();
      if (!camsC[r]) continue;
      const srcs = selectSources(r, camsC, searchBox, { maxSources: Math.min(4, Q.nsrc) });
      if (srcs.length < 2) continue;
      const dm = await engC.computeDepth(r, srcs, { box: searchBox, iterations: Math.max(4, Q.iters - 2), topK: 2, seed: r + 1 });
      // puntos del mundo (submuestreados) para votación
      const { W, H, K: Kd, R, t } = dm;
      const pts = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const d = dm.depth[i];
        if (!(d > 0) || dm.cost[i] > 0.3) continue;
        const cx = (x - Kd.cx) / Kd.fx * d - t[0], cy = (y - Kd.cy) / Kd.fy * d - t[1], cz = d - t[2];
        const X = R[0] * cx + R[3] * cy + R[6] * cz, Y = R[1] * cx + R[4] * cy + R[7] * cz, Z = R[2] * cx + R[5] * cy + R[8] * cz;
        if (Math.abs(Z) < 3 && (i % 5) === 0) tableZ.push(Z);
        pts.push(X, Y, Z);
      }
      coarseMaps.push(Float32Array.from(pts));
      onProgress('grueso', (r + 1) / N, `Localizando la pieza: vista ${r + 1}/${N}`);
      await yieldUI();
    }
    engC.dispose();
    timings.coarse = performance.now() - t0;
    // umbral de altura según el ruido medido sobre la mesa en la etapa gruesa
    let zThr = Math.max(p.zCut + 0.8, 1.2);
    if (tableZ.length > 100) {
      const med = median(tableZ);
      const sig = 1.4826 * median(tableZ.map(z => Math.abs(z - med)));
      zThr = Math.max(zThr, med + 5 * sig);
    }
    for (const pts of coarseMaps) {
      const seen = new Set();
      for (let i = 0; i < pts.length; i += 3) {
        if (pts[i + 2] < zThr) continue;
        const k = key(Math.floor(pts[i] / vox), Math.floor(pts[i + 1] / vox), Math.floor(pts[i + 2] / vox));
        if (seen.has(k)) continue;
        seen.add(k);
        votes.set(k, (votes.get(k) || 0) + 1);
      }
    }
    // vóxeles con soporte multivista -> componentes conexas (26-vecindad) -> la mayor es la pieza
    const minVotes = Math.max(3, Math.round(coarseMaps.length * 0.15));
    const occ = new Map();
    for (const [k, n] of votes) if (n >= minVotes) occ.set(k, -1);
    const comps = [];
    for (const k0 of occ.keys()) {
      if (occ.get(k0) !== -1) continue;
      const ci = comps.length;
      const list = [k0];
      occ.set(k0, ci);
      for (let h = 0; h < list.length; h++) {
        const k = list[h];
        const x = (k % 65536) - 32768, y = (Math.floor(k / 65536) % 65536) - 32768, z = Math.floor(k / 4294967296) - 32768;
        for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const kk = key(x + dx, y + dy, z + dz);
          if (occ.get(kk) === -1) { occ.set(kk, ci); list.push(kk); }
        }
      }
      comps.push(list);
    }
    comps.sort((a, b) => b.length - a.length);
    const sel = comps.filter((c, i) => i === 0 || c.length >= 0.25 * comps[0].length);
    const xs = [], ys = [], zs = [];
    for (const c of sel) for (const k of c) {
      const x = (k % 65536) - 32768, y = (Math.floor(k / 65536) % 65536) - 32768, z = Math.floor(k / 4294967296) - 32768;
      xs.push((x + 0.5) * vox); ys.push((y + 0.5) * vox); zs.push((z + 0.5) * vox);
    }
    const m = p.margin;
    if (xs.length < 10) {
      partBox = { min: searchBox.min.slice(), max: searchBox.max.slice() };
      onProgress('caja', 1, 'Aviso: no se aisló la pieza; se usa toda la zona libre (pieza muy plana o sin textura).');
      partBox.warn = true;
    } else {
      partBox = {
        min: [Math.max(searchBox.min[0], Math.min(...xs) - vox - m), Math.max(searchBox.min[1], Math.min(...ys) - vox - m), -3],
        max: [Math.min(searchBox.max[0], Math.max(...xs) + vox + m), Math.min(searchBox.max[1], Math.max(...ys) + vox + m), Math.min(p.maxHeight, Math.max(...zs) + vox + m)],
      };
    }
    timings.zThr = zThr;
    const warnings = [];
    if (xs.length >= 10 && Math.max(...zs) + vox > p.maxHeight - 4) {
      warnings.push(`La pieza llega a la altura máxima configurada (${p.maxHeight} mm): aumente «Altura máxima» si es más alta.`);
      onProgress('aviso', 1, warnings[warnings.length - 1]);
    }
    onProgress('caja', 1, `Pieza localizada: ${(partBox.max[0] - partBox.min[0]).toFixed(0)} × ${(partBox.max[1] - partBox.min[1]).toFixed(0)} × ${partBox.max[2].toFixed(0)} mm (con margen)`);

    // ---------------- Etapa fina ----------------
    const t1 = performance.now();
    const [Wf, Hf] = sizesFor(K.width, K.height, Q.fine);
    const eng = new PatchMatchEngine({ width: Wf, height: Hf, numViews: N, gpu });
    const fineSearch = { min: [Math.min(partBox.min[0], free.x0) , Math.min(partBox.min[1], free.y0), -3], max: [Math.max(partBox.max[0], free.x1), Math.max(partBox.max[1], free.y1), partBox.max[2]] };
    const cams = [];
    const gsds = [];
    for (let i = 0; i < N; i++) {
      check();
      const roi = computeROI(K, views[i].R, views[i].t, partBox, Wf, Hf, { maxScale: 1.0 });
      if (!roi) { cams.push(null); continue; }
      const { Kw } = await eng.prepareView(i, await getBitmap(i), K, roi, { readColor: false });
      eng.setPose(i, views[i].R, views[i].t);
      cams.push({ K: { ...Kw, width: Wf, height: Hf }, R: views[i].R, t: views[i].t, roi });
      // GSD (mm/px) en el centro de la pieza
      const c = [(partBox.min[0] + partBox.max[0]) / 2, (partBox.min[1] + partBox.max[1]) / 2, partBox.max[2] / 3];
      const R = views[i].R, t = views[i].t;
      const z = R[6] * c[0] + R[7] * c[1] + R[8] * c[2] + t[2];
      gsds.push(z / Kw.fx);
      onProgress('preparar', (i + 1) / N, `Preparando foto ${i + 1}/${N} (alta resolución)`);
    }
    releaseBitmaps();
    const gsd = median(gsds);
    // vóxel ~ resolución de la imagen, y al menos 3 vóxeles en el espesor de la lámina
    // límite de memoria: ~8 M vóxeles en la banda de la superficie (área de la caja como cota)
    const bx = partBox.max[0] - partBox.min[0], by = partBox.max[1] - partBox.min[1], bz = partBox.max[2] - Math.max(0, partBox.min[2]);
    const vMem = Math.sqrt(2 * (bx * by + bx * bz + by * bz) * 6 / 8e6);
    const voxel = p.voxel || Math.max(0.15, vMem, Math.min(1.0, Q.voxelFactor * gsd, p.sheetThickness / 3));
    const tsdf = workerRPC(workerUrl || new URL('../workers/tsdf.worker.js', import.meta.url));
    // truncamiento detrás de la superficie: ≥ 2 vóxeles (banda completa para Surface Nets) y
    // ~ medio espesor, para que las dos caras de una lámina delgada no se mezclen
    const truncBack = Math.max(2, Math.min(3, 0.5 * p.sheetThickness / voxel));
    const region = { min: [partBox.min[0], partBox.min[1], p.zCut], max: [partBox.max[0], partBox.max[1], partBox.max[2]] };
    const tsdfOpts = { voxel, trunc: 3, truncBack, region, zCut: p.zCut };
    await tsdf.call('init', { opts: tsdfOpts });
    const perView = [];
    const previews = [];
    let pending = [];
    for (let r = 0; r < N; r++) {
      check();
      if (!cams[r]) { perView.push({ index: r, skipped: true }); continue; }
      const srcs = selectSources(r, cams, partBox, { maxSources: Q.nsrc });
      if (srcs.length < 2) { perView.push({ index: r, skipped: true, reason: 'sin vistas vecinas' }); continue; }
      const tv = performance.now();
      const dm = await eng.computeDepth(r, srcs, { box: fineSearch, iterations: Q.iters, topK: Math.min(Q.topK, srcs.length), seed: 101 + r });
      const color = eng.readColor(r);
      let nIn = 0, nOk = 0, sc = 0;
      for (let i = 0; i < dm.depth.length; i++) {
        if (dm.depth[i] > 0 || dm.cost[i] < 2) nIn++;
        if (dm.depth[i] > 0 && dm.cost[i] < p.costThr) { nOk++; sc += dm.cost[i]; }
      }
      if (keepPreviews) {
        const step = Math.max(1, Math.round(Wf / 320));
        const pw = Math.floor(Wf / step), ph = Math.floor(Hf / step);
        const dd = new Float32Array(pw * ph), ok = new Uint8Array(pw * ph);
        for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
          const i = (y * step) * Wf + x * step;
          dd[y * pw + x] = dm.depth[i]; ok[y * pw + x] = dm.depth[i] > 0 && dm.cost[i] < p.costThr ? 1 : 0;
        }
        previews.push({ index: r, w: pw, h: ph, rgba: depthToImage(dd, pw, ph, (i) => ok[i] === 1) });
      }
      perView.push({ index: r, sources: srcs, validFrac: nIn ? nOk / nIn : 0, meanCost: nOk ? sc / nOk : 1, ms: performance.now() - tv });
      // integrar en el worker (en paralelo con la siguiente vista en GPU)
      const payload = { W: dm.W, H: dm.H, K: dm.K, R: dm.R, t: dm.t, depth: dm.depth, normal: dm.normal, cost: dm.cost, color };
      if (onDepthMap) onDepthMap({ ...payload, depth: dm.depth.slice(), normal: dm.normal.slice(), cost: dm.cost.slice(), color: color.slice(), index: r });
      pending.push(tsdf.call('integrate', { dm: payload, opts: { costThr: p.costThr } }, [dm.depth.buffer, dm.normal.buffer, dm.cost.buffer, color.buffer]));
      if (pending.length >= 2) { await pending.shift(); }
      onProgress('fino', (r + 1) / N, `Mapa de profundidad ${r + 1}/${N}`);
      await yieldUI();
    }
    await Promise.all(pending);
    eng.dispose();
    timings.fine = performance.now() - t1;
    // ---------------- Malla ----------------
    check();
    onProgress('malla', 0.2, 'Extrayendo la superficie…');
    const t2 = performance.now();
    const mesh = await tsdf.call('mesh', { opts: { minViews: p.minViews, smooth: p.smooth, footprintZ: 0.75 * p.sheetThickness } });
    const tab = await tsdf.call('table');
    tsdf.terminate();
    timings.mesh = performance.now() - t2;
    // cobertura estimada: vóxeles de la pieza hallados en la etapa gruesa que quedaron cubiertos por la malla
    let coverage = null;
    if (xs.length >= 10 && mesh.positions.length) {
      const cell = vox, marked = new Set();
      const ck = (x, y, z) => (x + 32768) + (y + 32768) * 65536 + (z + 32768) * 4294967296;
      for (let i = 0; i < mesh.positions.length; i += 3) marked.add(ck(Math.floor(mesh.positions[i] / cell), Math.floor(mesh.positions[i + 1] / cell), Math.floor(mesh.positions[i + 2] / cell)));
      let cov = 0, tot = 0;
      for (let i = 0; i < xs.length; i++) {
        if (zs[i] < p.zCut + 1.5) continue;
        tot++;
        const cx = Math.floor(xs[i] / cell), cy = Math.floor(ys[i] / cell), cz = Math.floor(zs[i] / cell);
        let hit = false;
        for (let dz = -1; dz <= 1 && !hit; dz++) for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) if (marked.has(ck(cx + dx, cy + dy, cz + dz))) hit = true;
        if (hit) cov++;
      }
      if (tot) coverage = { frac: cov / tot, voxels: tot, cell };
    }
    // estadísticas del plano de la mesa (ruido de profundidad medido sobre una superficie conocida)
    const z = Array.from(tab.z);
    let tableStats = null;
    if (z.length > 100) {
      const med = median(z);
      const absd = z.map(v => Math.abs(v - med));
      const mad = 1.4826 * median(absd);
      const inl = z.filter(v => Math.abs(v - med) < 4 * mad + 0.05);
      const rmsv = Math.sqrt(inl.reduce((s, v) => s + v * v, 0) / inl.length);
      tableStats = { n: z.length, bias: med, sigma: mad, rms: rmsv, p95: percentile(inl.map(v => Math.abs(v)), 0.95), inlierFrac: inl.length / z.length };
    }
    timings.total = performance.now() - tStart;
    onProgress('listo', 1, 'Reconstrucción terminada');
    return {
      mesh: { positions: mesh.positions, indices: mesh.indices, colors: mesh.colors, conf: mesh.conf },
      meshStats: mesh.stats, rawTriangles: mesh.rawTriangles, partBox, voxel, gsd, tableStats, perView, previews, tsdfOpts, coverage,
      fineSize: [Wf, Hf], coarseSize: [Wc, Hc], timings, warnings, params: { ...p, qualityLabel: Q.label },
    };
  } finally {
    releaseBitmaps();
    gpu.dispose();
  }
}
