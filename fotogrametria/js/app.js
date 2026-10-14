// FotoMetría 3D — aplicación principal (estado, navegación y orquestación de procesos).
import { PhotoProject } from './project.js';
import { workerPool } from './workers/rpc.js';
import { reconstruct, RECON_DEFAULTS } from './mvs/pipeline.js';
import { computeMetrics } from './analysis/metrics.js';
import { BOARD_DEFAULTS } from './core/board.js';
import { h, clear, toast, setStatus, setProgress, modal, store, load, confirmDialog } from './ui/dom.js';
import { renderPatterns } from './ui/step-patterns.js';
import { renderPhotos } from './ui/step-photos.js';
import { renderCalib } from './ui/step-calib.js';
import { renderRecon } from './ui/step-recon.js';
import { renderViewer } from './ui/step-viewer.js';
import { renderResults } from './ui/step-results.js';
import { renderCAD } from './ui/step-cad.js';
import { guideContent } from './ui/guide.js';

const STEPS = { patterns: renderPatterns, photos: renderPhotos, calib: renderCalib, recon: renderRecon, viewer: renderViewer, results: renderResults, cad: renderCAD };

class App {
  constructor() {
    this.settings = {
      board: { ...BOARD_DEFAULTS, ...load('board', {}) },
      recon: { ...RECON_DEFAULTS, ...load('recon', {}) },
      target: load('target', 1.0),
      calibFlags: load('calibFlags', { fixK3: true }),
    };
    this.project = new PhotoProject(this.settings.board);
    this.state = { step: null, busy: null, recon: null, metrics: null, cad: null, demo: null, sheet: 'board' };
    this.panel = document.getElementById('panel');
    this.views = {
      pattern: document.getElementById('view-pattern'), photos: document.getElementById('view-photos'),
      '3d': document.getElementById('view-3d'), dash: document.getElementById('view-dash'),
    };
    this._viewer = null;
    this._detectPool = null;
    this.rail = document.getElementById('rail');
    this.rail.addEventListener('click', (e) => {
      const b = e.target.closest('.step');
      if (b) this.go(b.dataset.step);
    });
    document.getElementById('btn-demo').addEventListener('click', () => this.runDemo());
    document.getElementById('btn-guide').addEventListener('click', () => modal(guideContent()));
    document.getElementById('btn-theme').addEventListener('click', () => this.toggleTheme());
    const theme = load('theme', null);
    if (theme) document.documentElement.dataset.theme = theme;
    this.updateStatusRight();
    this.go(load('step', 'patterns'));
  }

  // ---------- Navegación ----------
  go(step) {
    if (!STEPS[step]) step = 'patterns';
    this.renderSeq = (this.renderSeq || 0) + 1;
    if (step !== 'viewer' && this._viewer) {
      this._viewer.onPick = null;
      if (this.measure) this.measure.setMode(null);
      if (this.state.tf) { this.state.tf = null; this._viewer.enableTransform(null); }
    }
    this.state.step = step;
    store('step', step);
    for (const b of this.rail.querySelectorAll('.step')) b.classList.toggle('active', b.dataset.step === step);
    clear(this.panel);
    this.panel.scrollTop = 0;
    STEPS[step](this);
    this.updateRail();
  }
  refresh() { if (this.state.step) { const y = this.panel.scrollTop; this.go(this.state.step); this.panel.scrollTop = y; } }
  showView(name) {
    for (const [k, el] of Object.entries(this.views)) el.hidden = k !== name;
    if (name === '3d' && this._viewer) this._viewer.resize();
    return this.views[name];
  }
  updateRail() {
    const p = this.project;
    const done = {
      patterns: true,
      photos: p.photos.length > 0 && p.photos.every(x => x.dets),
      calib: !!p.calib,
      recon: !!this.state.recon,
      viewer: !!this.state.recon,
      results: !!this.state.metrics,
      cad: !!(this.state.cad && this.state.cad.stats),
    };
    for (const b of this.rail.querySelectorAll('.step')) {
      b.classList.toggle('done', !!done[b.dataset.step] && b.dataset.step !== 'patterns');
      b.classList.toggle('busy', this.state.busy === b.dataset.step);
    }
  }
  updateStatusRight(extra = '') {
    const el = document.getElementById('status-right');
    const p = this.project;
    el.textContent = `${p.photos.length} fotos · ${p.photos.filter(x => x.registered).length} registradas${extra ? ' · ' + extra : ''}`;
  }

  get viewer() {
    if (!this._viewer) {
      // importación diferida para no cargar three.js hasta que se necesite
      throw new Error('El visor aún no está listo.');
    }
    return this._viewer;
  }
  async ensureViewer() {
    if (this._viewer) return this._viewer;
    const { Viewer3D } = await import('./viewer/viewer.js');
    this._viewer = new Viewer3D(document.getElementById('viewer-host'));
    this._viewer.setBoard(this.project.board);
    this._viewer.view('iso');
    return this._viewer;
  }
  get detectPool() {
    if (!this._detectPool) {
      const n = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1));
      this._detectPool = workerPool(new URL('./workers/detect.worker.js', import.meta.url), n);
    }
    return this._detectPool;
  }

  toggleTheme() {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    store('theme', next);
    if (this._viewer) this._viewer.refreshTheme();
    this.refresh();
  }

  setBoard(opts) {
    this.settings.board = { ...this.settings.board, ...opts };
    store('board', this.settings.board);
    const photos = this.project.photos;
    this.project.setBoard(this.settings.board);
    this.project.photos = photos;
    for (const p of photos) { p.registered = false; p.R = null; if (p.dets) { const nMat = p.dets.filter(d => d.id < 200 && this.project.cornerMap.has(d.id)).length; p.nMat = nMat; p.status = nMat >= 3 ? 'detectada' : 'sin tablero'; } }
    this.invalidate('calib');
    if (this._viewer) this._viewer.setBoard(this.project.board);
  }

  invalidate(from) {
    const order = ['photos', 'calib', 'recon', 'cad'];
    const i = order.indexOf(from);
    if (i <= 1) { this.project.calib = null; for (const p of this.project.photos) { p.registered = false; } }
    if (i <= 2) {
      this.state.recon = null; this.state.undo = []; this.state.cadAligned = null; this.state.holes = null;
      if (this.holeGroup) this.holeGroup.clear();
      if (this._viewer) { this._viewer.setMesh(null); this._viewer.setBox(null); this._viewer.setCAD(null); this._viewer.cadSource = null; }
      if (this.measure) this.measure.clear();
    }
    this.state.cad = null; this.state.metrics = null;
    this.updateRail();
    this.updateStatusRight();
  }

  // ---------- Procesos ----------
  async addFiles(files) {
    const added = await this.project.addFiles(files);
    if (!added.length) { toast('No se agregaron imágenes (formatos admitidos: JPG, PNG, WEBP).', 'warn'); return; }
    this.invalidate('photos');
    toast(`${added.length} foto(s) agregada(s).`);
    await this.runDetection();
  }

  async runDetection() {
    if (this.state.busy) return;
    const todo = this.project.photos.filter(p => !p.dets);
    if (!todo.length) return;
    this.state.busy = 'photos'; this.updateRail();
    setStatus('Detectando marcadores…'); setProgress(0);
    try {
      await this.project.detect(this.detectPool, (f, p) => {
        setProgress(f);
        setStatus(`Detectando marcadores: ${p.name} (${p.nMat ?? 0} del tapete)`);
        if (this.state.step === 'photos') this.onPhotoUpdated?.(p);
      });
      const bad = this.project.photos.filter(p => p.status === 'sin tablero' || p.status === 'error');
      toast(`Detección terminada.${bad.length ? ` ${bad.length} foto(s) sin tablero suficiente.` : ''}`, bad.length ? 'warn' : 'ok');
    } catch (e) {
      toast('Error en la detección: ' + e.message, 'bad');
    } finally {
      this.state.busy = null; setProgress(null); setStatus('Listo.');
      this.updateRail(); this.updateStatusRight();
      if (this.state.step === 'photos') this.refresh();
    }
  }

  async runCalibration() {
    if (this.state.busy) return;
    await this.runDetection();
    this.state.busy = 'calib'; this.updateRail();
    setStatus('Calibrando cámara…'); setProgress(0.02);
    try {
      this.invalidate('calib');
      const cal = await this.project.calibrate(this.detectPool, { flags: this.settings.calibFlags, onProgress: (f, msg) => { setProgress(f); setStatus(msg); } });
      const q = cal.check && cal.check.rms3d !== undefined ? ` · control 3D ${cal.check.rms3d.toFixed(3)} mm` : '';
      toast(`Calibración lista: ${cal.registered}/${cal.total} fotos registradas, RMS ${cal.rms.toFixed(3)} px${q}.`, 'ok', 6500);
      if (this._viewer) this.syncViewerScene();
    } catch (e) {
      toast('No se pudo calibrar: ' + e.message, 'bad', 8000);
    } finally {
      this.state.busy = null; setProgress(null); setStatus('Listo.');
      this.updateRail(); this.updateStatusRight();
      if (this.state.step === 'calib' || this.state.step === 'photos') this.refresh();
    }
  }

  async runReconstruction() {
    if (this.state.busy) return;
    if (!this.project.calib) await this.runCalibration();
    if (!this.project.calib) return;
    const views = this.project.registeredViews();
    if (views.length < 3) { toast('Se necesitan al menos 3 fotos registradas.', 'bad'); return; }
    this.state.busy = 'recon'; this.updateRail();
    this.abort = new AbortController();
    const viewer = await this.ensureViewer();
    setProgress(0);
    const stageW = { preparar: 0.1, grueso: 0.2, caja: 0, fino: 0.6, malla: 0.1, listo: 0 };
    const stageStart = { preparar: 0, grueso: 0.1, caja: 0.3, fino: 0.3, malla: 0.9, listo: 1 };
    let prepPass = 0;
    try {
      this.invalidate('recon');
      store('recon', this.settings.recon);
      const t0 = performance.now();
      const rec = await reconstruct({
        views: views.map(p => ({ file: p.file, R: p.R, t: p.t })),
        K: this.project.calib.K, board: this.project.board, params: this.settings.recon, signal: this.abort.signal,
        onProgress: (stage, f, msg) => {
          if (stage === 'preparar' && f >= 1) prepPass++;
          const base = stage === 'preparar' && prepPass > 0 ? 0.3 : (stageStart[stage] ?? 0);
          setProgress(Math.min(1, base + (stageW[stage] ?? 0) * f));
          setStatus(msg);
          this.onReconProgress?.(stage, f, msg);
          if (stage === 'caja' && this.state.reconBox !== undefined) this.state.reconBox = null;
        },
      });
      rec.wallTime = performance.now() - t0;
      rec.photoIds = views.map(p => p.id);
      this.state.recon = rec;
      viewer.setMesh(rec.mesh);
      viewer.setBox(null);
      viewer.view('iso');
      this.computeMetrics();
      toast(`Reconstrucción lista: ${rec.meshStats ? rec.meshStats.triangles.toLocaleString('es-MX') : 0} triángulos en ${(rec.wallTime / 1000).toFixed(1)} s.`, 'ok', 6500);
    } catch (e) {
      console.error(e);
      toast('Reconstrucción interrumpida: ' + e.message, 'bad', 9000);
    } finally {
      this.state.busy = null; this.abort = null; setProgress(null); setStatus('Listo.');
      this.updateRail();
      if (this.state.step === 'recon') this.refresh();
    }
  }

  cancel() { if (this.abort) this.abort.abort(); }

  computeMetrics() {
    this.state.metrics = computeMetrics({ project: this.project, recon: this.state.recon, cad: this.state.cad, target: this.settings.target, holes: this.state.holes });
    this.updateRail();
    return this.state.metrics;
  }

  syncViewerScene() {
    const v = this._viewer;
    if (!v) return;
    if (v.board !== this.project.board) v.setBoard(this.project.board);
    const cal = this.project.calib;
    if (cal) {
      v.setCameras(cal.K, this.project.photos.map((p, i) => p.registered ? { R: p.R, t: p.t, label: i + 1 } : {}));
      v.setStickers(cal.stickers);
    } else { v.setCameras(null, null); v.setStickers(null); }
    const mesh = this.state.recon ? this.state.recon.mesh : null;
    if (v.meshData !== mesh) {
      v.setMesh(mesh);
      if (this.state.recon && this.state.recon.texture) v.setTexturedMesh(this.state.recon.texture.object);
    }
    if (v.cadSource !== this.state.cadAligned) { v.setCAD(this.state.cadAligned || null); v.cadSource = this.state.cadAligned; }
    const cad = this.state.cad;
    if (cad && cad.deviation && (!v.deviation || v.deviation.values !== cad.deviation)) v.setDeviation(cad.deviation, cad.tol, cad.range);
    if (!cad && v.deviation) v.setDeviation(null);
  }

  // ---------- Demostración ----------
  async runDemo({ count = 22, width = 2400, height = 1800, auto = true } = {}) {
    if (this.state.busy) return;
    if (this.project.photos.length && !(await confirmDialog('La demostración reemplaza las fotos actuales del proyecto. ¿Continuar?', { ok: 'Reemplazar y ejecutar' }))) return;
    this.state.busy = 'photos'; this.updateRail();
    try {
      // el tapete de la demo es el A3 estándar
      this.setBoard({ ...BOARD_DEFAULTS, paper: 'A3', paperW: 420, paperH: 297, scaleX: 1, scaleY: 1 });
      this.project.clear();
      this.invalidate('photos');
      setStatus('Generando fotos sintéticas de la demostración…'); setProgress(0);
      const { renderDemoPhotos, DEMO_PART } = await import('./demo/synth.js');
      this.settings.recon.sheetThickness = DEMO_PART.espesor;
      const demo = await renderDemoPhotos(this.project.board, { count, width, height, onProgress: (i, n) => { setProgress(i / n); setStatus(`Renderizando foto de demostración ${i}/${n}…`); } });
      this.state.demo = demo;
      this.state.busy = null;
      await this.project.addFiles(demo.files);
      this.go('photos');
      toast('Demostración: 22 fotos sintéticas de un soporte estampado sobre el tapete A3. Se ejecutará el flujo completo.', 'ok', 7000);
      await this.runDetection();
      if (!auto) return;
      await this.runCalibration();
      this.go('recon');
      await this.runReconstruction();
      if (this.state.recon) this.go('viewer');
    } catch (e) {
      console.error(e);
      toast('Error en la demostración: ' + e.message, 'bad', 9000);
    } finally {
      this.state.busy = null; setProgress(null); this.updateRail();
    }
  }
}

function boot() {
  try {
    window.fotoApp = new App();
  } catch (e) {
    console.error(e);
    document.getElementById('panel').append(h('div', { class: 'card' }, h('h3', {}, 'Error al iniciar'), String(e.message)));
  }
}
boot();
