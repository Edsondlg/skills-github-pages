// Proyecto de fotogrametría: fotos, detección de marcadores, calibración, registro y
// puntos de control. Independiente de la interfaz (la UI y las pruebas lo usan igual).
import { makeBoard, boardCornerMap, PART_ID_START } from './core/board.js';
import { calibrateCamera, registerView } from './core/calibrate.js';
import { triangulate, markerFrame } from './core/triangulate.js';
import { readExif } from './core/exif.js';
import { focalFromExif, cameraCenter, projectPoint } from './core/camera.js';
import { v3, median, rms, percentile } from './core/linalg.js';

let nextId = 1;

export class PhotoProject {
  constructor(boardOpts = {}) {
    this.photos = [];
    this.calib = null;
    this.recon = null;
    this.setBoard(boardOpts);
  }

  setBoard(o) {
    this.boardOpts = { ...o };
    this.board = makeBoard(o);
    this.cornerMap = boardCornerMap(this.board);
    this.checkSet = new Set(this.board.checkIds);
    this.calib = null;
  }

  async addFiles(files) {
    const added = [];
    for (const file of files) {
      if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|bmp)$/i.test(file.name || '')) continue;
      if (this.photos.some(p => p.name === file.name && p.file.size === file.size)) continue;
      let exif = null;
      try { exif = readExif(await file.slice(0, 256 * 1024).arrayBuffer()); } catch { exif = null; }
      const p = { id: nextId++, name: file.name || `foto_${nextId}`, file, exif, status: 'pendiente', dets: null };
      this.photos.push(p);
      added.push(p);
    }
    this.calib = null;
    return added;
  }

  removePhoto(id) {
    this.photos = this.photos.filter(p => p.id !== id);
    this.calib = null;
  }

  clear() { this.photos = []; this.calib = null; this.recon = null; }

  // Detección de marcadores en todas las fotos pendientes. pool: workerPool del detector.
  async detect(pool, onProgress = () => {}) {
    const todo = this.photos.filter(p => !p.dets);
    let done = 0;
    await Promise.all(todo.map(async (p) => {
      p.status = 'detectando';
      try {
        const r = await pool.call('detect', { file: p.file, opts: {} });
        Object.assign(p, { width: r.width, height: r.height, dets: r.dets, sharp: r.sharp, expo: r.expo, detectMs: r.ms });
        const nMat = r.dets.filter(d => d.id < PART_ID_START && this.cornerMap.has(d.id)).length;
        p.nMat = nMat; p.nPart = r.dets.filter(d => d.id >= PART_ID_START).length;
        p.status = nMat >= 3 ? 'detectada' : 'sin tablero';
      } catch (err) {
        p.status = 'error'; p.error = err.message;
      }
      done++;
      onProgress(done / todo.length, p);
    }));
  }

  // Observaciones de un tablero (esquinas de marcadores del tapete).
  observations(p, { includeCheck = true } = {}) {
    const obs = [];
    for (const d of p.dets || []) {
      if (d.id >= PART_ID_START || !this.cornerMap.has(d.id) || d.refined === false) continue;
      if (!includeCheck && this.checkSet.has(d.id)) continue;
      const X = this.cornerMap.get(d.id);
      d.corners.forEach((uv, k) => obs.push({ X: X[k], uv, id: d.id, k }));
    }
    return obs;
  }

  // Calibración completa con validación cruzada y segunda pasada de refinamiento subpíxel.
  async calibrate(pool, { flags = {}, onProgress = () => {} } = {}) {
    const ready = this.photos.filter(p => p.dets && p.width);
    if (ready.length < 3) throw new Error('Se necesitan al menos 3 fotos procesadas.');
    // tamaño de imagen dominante
    const sizes = new Map();
    for (const p of ready) { const k = `${p.width}x${p.height}`; sizes.set(k, (sizes.get(k) || 0) + 1); }
    const [domKey] = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0];
    const [W, H] = domKey.split('x').map(Number);
    const usable = ready.filter(p => p.width === W && p.height === H);
    for (const p of ready) if (!usable.includes(p)) { p.status = 'tamaño distinto'; p.registered = false; }
    // focal inicial desde EXIF (mediana)
    const fEx = usable.map(p => focalFromExif(p.exif, W, H)).filter(f => f > 0);
    const fInit = fEx.length ? median(fEx) : null;
    const run = (includeCheck, fI) => calibrateCamera(usable.map(p => ({ width: W, height: H, obs: this.observations(p, { includeCheck }) })), { fInit: fI, flags });
    onProgress(0.1, 'Calibración inicial…');
    let full = run(true, fInit);
    if (!full.ok) throw new Error(full.error);
    // segunda pasada: refinar esquinas con el modelo de distorsión estimado
    onProgress(0.3, 'Refinando esquinas con el modelo de lente…');
    let done = 0;
    await Promise.all(usable.map(async (p) => {
      const markers = (p.dets || []).map(d => ({ id: d.id, corners: d.corners, hamming: d.hamming }));
      const r = await pool.call('refine', { file: p.file, markers, K: full.K });
      p.dets = r.dets;
      done++;
      onProgress(0.3 + 0.5 * done / usable.length, `Refinando ${done}/${usable.length}`);
    }));
    full = run(true, full.K.fx);
    const holdout = run(false, full.K.fx);
    if (!full.ok) throw new Error(full.error);
    onProgress(0.85, 'Validando con puntos de control…');
    const K = full.K;
    // registro de fotos
    const regViews = [];
    usable.forEach((p, i) => {
      const v = full.views[i];
      if (v.used) { Object.assign(p, { R: v.R, t: v.t, rms: v.rms, nPts: v.n, registered: true, status: 'registrada' }); }
      else {
        const r = registerView(K, this.observations(p));
        if (r && r.rms < 2) Object.assign(p, { R: r.R, t: r.t, rms: r.rms, nPts: r.errs.length, registered: true, status: 'registrada (PnP)' });
        else Object.assign(p, { registered: false, status: v.reason || 'no registrada' });
      }
      if (p.registered) regViews.push(p);
    });
    const check = this.checkPoints(holdout, usable);
    const stickers = this.triangulateStickers(K, regViews);
    const coverage = this.imageCoverage(regViews, W, H);
    this.calib = {
      K, W, H, rms: full.rms, nPoints: full.nPoints, std: full.std, sigma: full.sigma, log: full.log, fInit,
      check, stickers, coverage,
      registered: regViews.length, total: this.photos.length, usable: usable.length,
      perPhoto: usable.map((p, i) => ({ id: p.id, name: p.name, rms: p.rms, n: p.nPts, registered: !!p.registered, errs: full.views[i].errs })),
    };
    onProgress(1, 'Calibración terminada');
    return this.calib;
  }

  // Exactitud 3D con marcadores excluidos de la calibración (validación cruzada).
  checkPoints(holdout, usable) {
    if (!holdout || !holdout.ok) return null;
    const K = holdout.K;
    const byPt = new Map();
    usable.forEach((p, i) => {
      const v = holdout.views[i];
      if (!v.used) return;
      for (const d of p.dets || []) {
        if (!this.checkSet.has(d.id) || d.refined === false) continue;
        d.corners.forEach((uv, k) => {
          const key = `${d.id}:${k}`;
          if (!byPt.has(key)) byPt.set(key, []);
          byPt.get(key).push({ K, R: v.R, t: v.t, uv });
        });
      }
    });
    const errs = [], ex = [], ey = [], ez = [], pts = new Map();
    for (const [key, obs] of byPt) {
      if (obs.length < 2) continue;
      const r = triangulate(obs);
      if (!r || r.maxAngle < 3) continue;
      const [id, k] = key.split(':').map(Number);
      const gt = this.cornerMap.get(id)[k];
      const e = v3.sub(r.X, gt);
      errs.push(v3.norm(e)); ex.push(e[0]); ey.push(e[1]); ez.push(e[2]);
      pts.set(key, { X: r.X, gt, n: obs.length });
    }
    if (errs.length < 4) return { n: errs.length };
    // verificación de escala: distancias entre puntos de control lejanos
    const keys = [...pts.keys()];
    const scaleErr = [];
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      const a = pts.get(keys[i]), b = pts.get(keys[j]);
      const dn = v3.dist(a.gt, b.gt);
      if (dn < 100) continue;
      scaleErr.push((v3.dist(a.X, b.X) - dn) / dn);
    }
    return {
      n: errs.length, rms3d: rms(errs), max3d: Math.max(...errs), p95: percentile(errs, 0.95),
      rmsX: rms(ex), rmsY: rms(ey), rmsZ: rms(ez),
      scaleErrPPM: scaleErr.length ? median(scaleErr.map(Math.abs)) * 1e6 : null,
      scaleBias: scaleErr.length ? median(scaleErr) : null,
      holdoutRms: holdout.rms,
    };
  }

  // Calcomanías sobre la pieza (IDs >= 200): triangulación de esquinas, centro y normal.
  triangulateStickers(K, regViews) {
    const byKey = new Map();
    for (const p of regViews) {
      for (const d of p.dets || []) {
        if (d.id < PART_ID_START || d.refined === false) continue;
        d.corners.forEach((uv, k) => {
          const key = `${d.id}:${k}`;
          if (!byKey.has(key)) byKey.set(key, []);
          byKey.get(key).push({ K, R: p.R, t: p.t, uv });
        });
      }
    }
    const ids = new Set([...byKey.keys()].map(k => +k.split(':')[0]));
    const out = [];
    for (const id of ids) {
      const corners = [];
      let ok = true, std = 0, nv = Infinity, rr = 0;
      for (let k = 0; k < 4; k++) {
        const obs = byKey.get(`${id}:${k}`) || [];
        const r = obs.length >= 2 ? triangulate(obs) : null;
        if (!r || r.maxAngle < 3) { ok = false; break; }
        corners.push(r.X);
        if (r.std) std = Math.max(std, Math.hypot(...r.std));
        nv = Math.min(nv, obs.length); rr = Math.max(rr, r.rms);
      }
      if (!ok) continue;
      const fr = markerFrame(corners);
      out.push({ id, corners, center: fr.center, normal: fr.normal, side: fr.side, std, views: nv, rms: rr });
    }
    out.sort((a, b) => a.id - b.id);
    return out;
  }

  // Cobertura de la imagen por esquinas detectadas (rejilla 8x6) — importante para la distorsión.
  imageCoverage(regViews, W, H) {
    const gx = 8, gy = 6;
    const cells = new Uint8Array(gx * gy);
    for (const p of regViews) for (const d of p.dets || []) for (const [u, v] of d.corners) {
      const cx = Math.min(gx - 1, Math.max(0, Math.floor(u / W * gx))), cy = Math.min(gy - 1, Math.max(0, Math.floor(v / H * gy)));
      cells[cy * gx + cx] = 1;
    }
    let n = 0; for (const c of cells) n += c;
    return { frac: n / cells.length, grid: Array.from(cells), gx, gy };
  }

  registeredViews() {
    return this.photos.filter(p => p.registered && p.R);
  }

  // Ángulos de visión: geometría de la red de cámaras (para métricas de calidad).
  networkStats() {
    const reg = this.registeredViews();
    if (!reg.length) return null;
    const cs = reg.map(p => cameraCenter(p.R, p.t));
    const el = cs.map(c => Math.atan2(c[2], Math.hypot(c[0], c[1])) * 180 / Math.PI);
    const az = cs.map(c => (Math.atan2(c[1], c[0]) * 180 / Math.PI + 360) % 360);
    const bins = new Uint8Array(12);
    for (const a of az) bins[Math.floor(a / 30) % 12] = 1;
    let azCov = 0; for (const b of bins) azCov += b;
    const dist = cs.map(c => v3.norm(c));
    return { elevMin: Math.min(...el), elevMax: Math.max(...el), azimuthCoverage: azCov / 12, distMedian: median(dist), centers: cs };
  }
}

// Reproyección de un punto 3D en todas las fotos registradas (para inspección).
export function reprojectAll(project, X) {
  const K = project.calib && project.calib.K;
  if (!K) return [];
  return project.registeredViews().map(p => ({ id: p.id, uv: projectPoint(K, p.R, p.t, X) }));
}
