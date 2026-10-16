// Vista 2D del plano (contrato C6): lienzo Canvas 2D estilo CAD con capas, regiones,
// ventanas de vista, eje de revolución, calibración y medición con referencias (snap).
//
// Uso:
//   const v = new View2D(container, { theme: 'dark', format: (mm) => '12.345 mm' });
//   v.setDrawing({ segments, texts, layers }, { loops, loopInfos, open, regions }, { keepView: false });
//   v.setErased(indices, { show: true });  // borrados: sin referencias; grises y discontinuos si show
//   const off = v.on('regionClick', (e) => ...); off();
//
// Coordenadas de mundo con Y hacia arriba (unidades del plano). Coordenadas de pantalla en px CSS
// relativos a la esquina superior izquierda del lienzo. `texts[].rot` en radianes.
// `regions` admite el array `[{ outer, holes }]` o el objeto completo de buildRegions().
// Estado inicial de cada región: { included: true, selected: false, role: null }.
//
// Eventos (payloads):
//   regionClick { regionIndex, loopIndex, shiftKey, p }   clic dentro de una región (gana la más pequeña);
//                                                         clic en vacío → regionIndex = loopIndex = -1
//   loopClick   { loopIndex, regionIndex, shiftKey, p }   clic dentro de un agujero (regionIndex = región dueña)
//   window      { minX, minY, maxX, maxY }                rectángulo arrastrado (modo 'window')
//   measure     { id, kind: 'distance', p1, p2, d, dx, dy, angleDeg, snap1, snap2 }   (snapN = tipo de referencia o null)
//             | { id, kind: 'radius', r, diameter, c, p, segIndex }                   (Mayús+clic en círculo/arco)
//               id: entero estable; removeMeasure(id) borra esa cota.
//   calibrate   { p1, p2, d }                             dos puntos referenciados, en unidades del plano
//   axisPick    { p, d, segIndex }                        p = inicio de la línea, d = dirección unitaria
//   erase       { indices }                               modo 'erase': clic en un segmento o ventana arrastrada
//                                                         (izq→der: dentro por completo; der→izq: que la cruzan)
//   restore     { indices }                               modo 'erase': Mayús+clic en un segmento borrado (visible)
//   calibrateCircle { segIndex, r, c }                    modo 'calibrate': clic en un círculo o arco (sin punto pendiente)
//   cursor      { x, y, snap: null | { p, kind } } | null (null al salir del lienzo)
// Tipos de referencia: 'end' | 'mid' | 'center' | 'quadrant' | 'nearest'.

import { segBBox, segSnapPoints, segClosestPoint, segTessellate, segSweep, segStart, segEnd } from '../geom2d/segments.js';
import { loopInfo, pointInPolygon } from '../geom2d/loops.js';

const TAU = 2 * Math.PI;
const SNAP_PX = 10; // radio de captura de referencias
const CLICK_PX = 4; // desplazamiento máximo para considerar clic
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const ROLE_NAMES = { top: 'Planta', front: 'Alzado', right: 'Lateral der.', left: 'Lateral izq.' };
const SNAP_NAMES = { end: 'Extremo', mid: 'Punto medio', center: 'Centro', quadrant: 'Cuadrante', nearest: 'Cercano' };
const SNAP_KINDS = ['end', 'center', 'mid', 'quadrant']; // orden = prioridad en empate
const CONTINUOUS = new Set(['', 'CONTINUOUS', 'BYLAYER', 'BYBLOCK']);

const THEMES = {
  dark: {
    bg: '#16191e', gridMinor: 'rgba(255,255,255,0.035)', gridMajor: 'rgba(255,255,255,0.085)',
    fg: '#ffffff', text: '#9aa3ad', label: '#e6edf3', labelBg: 'rgba(22,25,30,0.88)', labelBorder: 'rgba(255,255,255,0.14)',
    accent: '#3d8bfd', accentFill: 'rgba(61,139,253,0.17)', accentHover: 'rgba(61,139,253,0.75)', accentStrong: '#8cc0ff',
    excl: '#7b8490', exclHatch: 'rgba(150,158,168,0.42)', open: '#ff9a2e', measure: '#ffd166', calib: '#e879f9',
    axis: '#ff6b8b', snap: '#3ddc84', erased: 'rgba(150,158,168,0.55)', eraseHover: '#ff5d5d', crossFill: 'rgba(61,220,132,0.12)', axisX: 'rgba(229,83,75,0.55)', axisY: 'rgba(87,171,90,0.55)', bar: '#c9d1d9',
  },
  light: {
    bg: '#f7f8fa', gridMinor: 'rgba(0,0,0,0.04)', gridMajor: 'rgba(0,0,0,0.09)',
    fg: '#000000', text: '#5f6b78', label: '#1f2328', labelBg: 'rgba(255,255,255,0.92)', labelBorder: 'rgba(0,0,0,0.16)',
    accent: '#1f6feb', accentFill: 'rgba(31,111,235,0.13)', accentHover: 'rgba(31,111,235,0.7)', accentStrong: '#0b4fc2',
    excl: '#8c959f', exclHatch: 'rgba(110,119,129,0.38)', open: '#e8710a', measure: '#b26a00', calib: '#a21caf',
    axis: '#d6336c', snap: '#108a3e', erased: 'rgba(110,119,129,0.6)', eraseHover: '#d1242f', crossFill: 'rgba(16,138,62,0.1)', axisX: 'rgba(207,34,46,0.5)', axisY: 'rgba(26,127,55,0.5)', bar: '#424a53',
  },
};

// ---------- Colores ACI (AutoCAD Color Index) ----------

const ACI_BASE = [null, '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', null, '#808080', '#c0c0c0'];
const ACI_GRAY = ['#333333', '#505050', '#696969', '#828282', '#bebebe', '#ffffff'];
const hex2 = (v) => Math.round(v).toString(16).padStart(2, '0');

/** Color ACI (1–255) → CSS. 7 (y 0/256 o desconocidos) = color de primer plano del tema. */
export function aciToCss(n, theme = 'dark') {
  const fg = (THEMES[theme] || THEMES.dark).fg;
  n = Math.abs(Math.round(n));
  if (n >= 1 && n <= 9) return ACI_BASE[n] || fg;
  if (n >= 250 && n <= 255) return ACI_GRAY[n - 250];
  if (n >= 10 && n <= 249) {
    // Matiz cada 15°; pares saturados, impares a media saturación; cinco niveles de brillo.
    const h = (Math.floor(n / 10) - 1) * 15, sub = n % 10;
    const v = [1, 0.8, 0.6, 0.5, 0.3][sub >> 1], sat = sub & 1 ? 0.5 : 1;
    const f = (k) => {
      const kk = (k + h / 60) % 6;
      return 255 * v * (1 - sat * Math.max(0, Math.min(kk, 4 - kk, 1)));
    };
    return '#' + hex2(f(5)) + hex2(f(3)) + hex2(f(1));
  }
  return fg;
}

// En tema claro los colores muy luminosos (amarillo, cian, blanco) se oscurecen para que se lean.
function adaptColor(css, theme) {
  if (theme !== 'light' || !/^#[0-9a-f]{6}$/i.test(css)) return css;
  const r = parseInt(css.slice(1, 3), 16), g = parseInt(css.slice(3, 5), 16), b = parseInt(css.slice(5, 7), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum < 0.7) return css;
  const k = 0.55 / lum;
  return '#' + hex2(r * k) + hex2(g * k) + hex2(b * k);
}

function colorCss(spec, theme) {
  if (typeof spec === 'string' && spec) return adaptColor(spec, theme);
  if (typeof spec === 'number') return adaptColor(aciToCss(spec, theme), theme);
  return THEMES[theme].fg;
}

// Escalón 1/2/5 × 10^n ≥ v.
function niceStep(v) {
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
}
// Escalón 1/2/5 × 10^n ≤ v.
function niceFloor(v) {
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e;
}

// ---------- Rejilla espacial uniforme (hit-testing y referencias) ----------

class SpatialGrid {
  constructor(bb, count) {
    const w = Math.max(bb.maxX - bb.minX, 1e-9), h = Math.max(bb.maxY - bb.minY, 1e-9);
    const cells = Math.min(Math.max(count, 1), 262144);
    const cs = Math.max(Math.sqrt((w * h) / cells), Math.max(w, h) / 512);
    this.minX = bb.minX;
    this.minY = bb.minY;
    this.cs = cs;
    this.nx = Math.max(1, Math.min(512, Math.ceil(w / cs)));
    this.ny = Math.max(1, Math.min(512, Math.ceil(h / cs)));
    this.cells = new Array(this.nx * this.ny);
    this.big = []; // elementos que ocupan demasiadas celdas: se revisan siempre
    this.stamp = new Int32Array(count);
    this.tick = 0;
  }
  _ix(x) {
    return Math.max(0, Math.min(this.nx - 1, Math.floor((x - this.minX) / this.cs)));
  }
  _iy(y) {
    return Math.max(0, Math.min(this.ny - 1, Math.floor((y - this.minY) / this.cs)));
  }
  insert(id, minX, minY, maxX, maxY) {
    const x0 = this._ix(minX), x1 = this._ix(maxX), y0 = this._iy(minY), y1 = this._iy(maxY);
    if ((x1 - x0 + 1) * (y1 - y0 + 1) > 1024) return void this.big.push(id);
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const k = ix + iy * this.nx;
        (this.cells[k] || (this.cells[k] = [])).push(id);
      }
  }
  query(minX, minY, maxX, maxY, fn) {
    const t = ++this.tick, st = this.stamp;
    for (const id of this.big) if (st[id] !== t) (st[id] = t), fn(id);
    const x0 = this._ix(minX), x1 = this._ix(maxX), y0 = this._iy(minY), y1 = this._iy(maxY);
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const c = this.cells[ix + iy * this.nx];
        if (c) for (const id of c) if (st[id] !== t) (st[id] = t), fn(id);
      }
  }
}

// ---------- Vista ----------

export class View2D {
  constructor(container, { theme = 'dark', format = null } = {}) {
    this.container = container;
    const cv = (this.canvas = document.createElement('canvas'));
    cv.className = 'view2d-canvas';
    cv.tabIndex = 0;
    Object.assign(cv.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none', outline: 'none' });
    container.appendChild(cv);
    this.ctx = cv.getContext('2d');
    this.mode = 'select';
    this._listeners = new Map();
    this._units = 'mm';
    this._format = format;
    this._w = 0;
    this._h = 0;
    this._dpr = 1;
    this._view = { scale: 4, tx: 0, ty: 0 };
    this._fitScale = 4;
    this._measures = [];
    this._measureSeq = 0; // id estable de cada cota
    this._needFit = false; // fit() pedido con el lienzo oculto (0×0): se repite al hacerse visible
    this._pending = null; // primer punto de medida/calibración
    this._calib = null;
    this._axis = null;
    this._viewBoxes = [];
    this._mouse = null;
    this._snap = null;
    this._hover = null;
    this._shift = false;
    this._erased = new Set();
    this._showErased = true;
    this._erasedPath = null;
    this._drag = null;
    this._touches = new Map();
    this._pinch = null;
    this._space = false;
    this._lastMiddle = 0;
    this._raf = 0;
    this._hoverDirty = false;
    this._clear();
    this.setTheme(theme);
    this._bindEvents();
    this._ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null;
    if (this._ro) this._ro.observe(container);
    this.resize();
  }

  // ----- API pública -----

  setDrawing(drawing = {}, topo = {}, { keepView = false } = {}) {
    const segs = drawing.segments || [];
    const prevVis = this._layers;
    this._layers = new Map();
    const addLayer = (name, color = 7, linetype = '') => {
      const old = prevVis && prevVis.get(name);
      const L = { name, color, linetype: String(linetype || '').toUpperCase(), visible: old ? old.visible : true };
      this._layers.set(name, L);
      return L;
    };
    for (const l of drawing.layers || []) addLayer(l.name, l.color ?? 7, l.linetype);
    this._segs = segs;
    this._segLayer = new Array(segs.length);
    const bbs = (this._segBB = new Float64Array(segs.length * 4));
    const bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    let hasSpline = false;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i], name = (s.meta && s.meta.layer) ?? '0';
      this._segLayer[i] = this._layers.get(name) || addLayer(name);
      const b = segBBox(s);
      bbs.set([b.minX, b.minY, b.maxX, b.maxY], i * 4);
      if (b.minX < bb.minX) bb.minX = b.minX;
      if (b.minY < bb.minY) bb.minY = b.minY;
      if (b.maxX > bb.maxX) bb.maxX = b.maxX;
      if (b.maxY > bb.maxY) bb.maxY = b.maxY;
      if (needsTess(s)) hasSpline = true;
    }
    this._texts = (drawing.texts || []).map((t) => ({ ...t, _layer: this._layers.get(t.layer ?? '0') || addLayer(t.layer ?? '0') }));
    if (!segs.length) Object.assign(bb, { minX: -50, minY: -50, maxX: 50, maxY: 50 });
    this._bbox = bb;
    // Origen local de los trayectos (Skia usa float32): centro del dibujo.
    this._o = [(bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2];
    const diag = Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY) || 1;
    this._baseTol = diag * 2e-4;
    this._tessLevel = 0;
    this._hasSpline = hasSpline;

    // Topología
    this._loops = topo.loops || [];
    this._infos = topo.loopInfos || this._loops.map((l) => loopInfo(l, this._baseTol));
    this._regions = Array.isArray(topo.regions) ? topo.regions : (topo.regions && topo.regions.regions) || [];
    this._open = topo.open || [];
    this._regionState = this._regions.map(() => ({ included: true, selected: false, role: null }));
    this._outerOf = new Map();
    this._holeOf = new Map();
    this._regions.forEach((r, i) => {
      this._outerOf.set(r.outer, i);
      for (const h of r.holes || []) this._holeOf.set(h, i);
    });
    this._loopPaths = [];
    this._regionPaths = null;
    this._openPath = null;

    this._erased = new Set();
    this._buildBatches();
    this._buildIndex();
    if (!keepView) this._measures = [];
    this._pending = null;
    this._calib = null;
    this._hover = null;
    this._snap = null;
    if (keepView) {
      this._hoverDirty = true;
      this._requestRender();
    } else this.fit();
    return this;
  }

  /** Segmentos borrados (índices del dibujo): sin referencias ni selección; grises y discontinuos si show. */
  setErased(indices = [], { show = this._showErased } = {}) {
    this._erased = new Set(indices);
    this._showErased = !!show;
    this._buildBatches();
    this._hoverDirty = true;
    this._requestRender();
    return this;
  }

  setLayerVisible(name, visible) {
    const L = this._layers.get(name);
    if (L) L.visible = !!visible;
    this._erasedPath = null;
    this._hoverDirty = true;
    this._requestRender();
    return this;
  }

  setRegionState(i, state = {}) {
    const st = this._regionState[i];
    if (!st) return this;
    for (const k of ['included', 'selected', 'role']) if (k in state) st[k] = state[k];
    this._regionPaths = null;
    this._requestRender();
    return this;
  }

  setMode(mode) {
    this.mode = mode;
    this._pending = null;
    this._drag = null;
    this._hover = null;
    this._snap = null;
    this._hoverDirty = true;
    this._updateCursor();
    this._requestRender();
    return this;
  }

  showAxis(axis) {
    if (axis) {
      const l = Math.hypot(axis.d[0], axis.d[1]) || 1;
      this._axis = { p: axis.p.slice(), d: [axis.d[0] / l, axis.d[1] / l] };
    } else this._axis = null;
    this._requestRender();
    return this;
  }

  showViewBoxes(list) {
    this._viewBoxes = (list || []).map((v) => ({ role: v.role, box: { ...v.box } }));
    this._requestRender();
    return this;
  }

  /** Borra una cota por su id (el del evento 'measure'). Devuelve true si existía. */
  removeMeasure(id) {
    const i = this._measures.findIndex((m) => m.id === id);
    if (i < 0) return false;
    this._measures.splice(i, 1);
    this._requestRender();
    return true;
  }

  clearMeasures() {
    this._measures = [];
    this._pending = null;
    this._calib = null;
    this._requestRender();
    return this;
  }

  setTheme(name) {
    this.theme = THEMES[name] ? name : 'dark';
    this._th = THEMES[this.theme];
    this._hatch = null;
    if (this._batches) for (const b of this._batches) b.css = colorCss(b.color, this.theme);
    this._requestRender();
    return this;
  }

  /** Sufijo de unidades del formato por defecto (p. ej. 'mm', 'px'). */
  setUnitsLabel(text) {
    this._units = text;
    this._requestRender();
    return this;
  }

  /** Formato de longitudes; null = por defecto (3 decimales + unidades). */
  setFormat(fn) {
    this._format = fn || null;
    this._requestRender();
    return this;
  }

  formatLength(v) {
    return this._format ? this._format(v) : `${v.toFixed(3)} ${this._units}`;
  }

  fit() {
    const bb = this._visibleBBox();
    const m = 36, W = this._w, H = this._h;
    this._needFit = W <= 1 || H <= 1;
    const bw = Math.max(bb.maxX - bb.minX, 1e-9), bh = Math.max(bb.maxY - bb.minY, 1e-9);
    let s = Math.min(Math.max(W - 2 * m, 10) / bw, Math.max(H - 2 * m, 10) / bh);
    if (!isFinite(s) || s <= 0) s = 4;
    this._fitScale = s;
    const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
    this._view = { scale: s, tx: W / 2 - cx * s, ty: H / 2 + cy * s };
    this._hoverDirty = true;
    this._requestRender();
    return this;
  }

  resize() {
    const r = this.container.getBoundingClientRect();
    const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    if (W === this._w && H === this._h && dpr === this._dpr) return this;
    // Conserva el punto de mundo del centro.
    const c = this.screenToWorld([this._w / 2, this._h / 2]);
    const first = this._w === 0;
    this._w = W;
    this._h = H;
    this._dpr = dpr;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    if (first || (this._needFit && W > 1 && H > 1)) this.fit();
    else {
      this._view.tx = W / 2 - c[0] * this._view.scale;
      this._view.ty = H / 2 + c[1] * this._view.scale;
    }
    this.render();
    return this;
  }

  on(name, cb) {
    if (!this._listeners.has(name)) this._listeners.set(name, new Set());
    this._listeners.get(name).add(cb);
    return () => this._listeners.get(name).delete(cb);
  }

  worldToScreen(p) {
    const { scale, tx, ty } = this._view;
    return [p[0] * scale + tx, -p[1] * scale + ty];
  }

  screenToWorld(q) {
    const { scale, tx, ty } = this._view;
    return [(q[0] - tx) / scale, (ty - q[1]) / scale];
  }

  /** Transformación actual: pantalla = (x·scale + tx, −y·scale + ty). */
  getTransform() {
    return { ...this._view };
  }

  /** Zoom multiplicativo alrededor de un punto de pantalla (por defecto el centro). */
  zoomAt(q, factor) {
    q = q || [this._w / 2, this._h / 2];
    const w = this.screenToWorld(q);
    const s = Math.min(this._fitScale * 2000, Math.max(this._fitScale / 50, this._view.scale * factor));
    this._view = { scale: s, tx: q[0] - w[0] * s, ty: q[1] + w[1] * s };
    this._hoverDirty = true;
    this._requestRender();
    return this;
  }

  screenshot() {
    this.render();
    return new Promise((res) => this.canvas.toBlob(res, 'image/png'));
  }

  dispose() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._ro) this._ro.disconnect();
    for (const [t, f, o] of this._domListeners) t.removeEventListener(f.type, f.fn, o);
    this._listeners.clear();
    this.canvas.remove();
  }

  // ----- Datos internos -----

  _clear() {
    this._segs = [];
    this._segLayer = [];
    this._segBB = new Float64Array(0);
    this._texts = [];
    this._layers = new Map();
    this._bbox = { minX: -50, minY: -50, maxX: 50, maxY: 50 };
    this._o = [0, 0];
    this._baseTol = 0.01;
    this._tessLevel = 0;
    this._hasSpline = false;
    this._loops = [];
    this._infos = [];
    this._regions = [];
    this._regionState = [];
    this._open = [];
    this._outerOf = new Map();
    this._holeOf = new Map();
    this._loopPaths = [];
    this._regionPaths = null;
    this._openPath = null;
    this._batches = [];
    this._segGrid = null;
    this._ptGrid = null;
  }

  _emit(name, payload) {
    const set = this._listeners.get(name);
    if (set) for (const cb of [...set]) cb(payload);
  }

  _tol() {
    return this._baseTol / Math.pow(2, this._tessLevel);
  }

  // Lotes por capa/color/trazo: un Path2D cada uno, en coordenadas locales (mundo − origen).
  _buildBatches() {
    const map = new Map(), er = this._erased;
    for (let i = 0; i < this._segs.length; i++) {
      if (er.has(i)) continue;
      const s = this._segs[i], L = this._segLayer[i], meta = s.meta || {};
      const color = meta.color != null && meta.color !== 0 && meta.color !== 256 ? meta.color : L.color;
      const dashed = meta.dashed != null ? !!meta.dashed : !CONTINUOUS.has(L.linetype);
      const lt = String(meta.linetype || L.linetype || '').toUpperCase();
      const dashDot = dashed && /CENTER|EJE|DASHDOT|PHANTOM/.test(lt);
      const key = `${L.name}\u0000${color}\u0000${dashed ? (dashDot ? 2 : 1) : 0}`;
      let b = map.get(key);
      if (!b) map.set(key, (b = { layer: L, color, dashed, dashDot, idx: [], hasSpline: false, path: null, css: '' }));
      b.idx.push(i);
      if (needsTess(s)) b.hasSpline = true;
    }
    this._batches = [...map.values()];
    for (const b of this._batches) {
      b.css = colorCss(b.color, this.theme);
      b.path = this._segsPath(b.idx.map((i) => this._segs[i]));
    }
    this._erasedPath = null;
  }

  // Trayecto de los borrados en capas visibles.
  _getErasedPath() {
    if (!this._erasedPath && this._erased.size) this._erasedPath = this._segsPath([...this._erased].filter((i) => this._segLayer[i]?.visible).map((i) => this._segs[i]));
    return this._erasedPath;
  }

  // Segmentos de la ventana de borrado: dentro por completo o (captura) que la tocan.
  _segsInBox(a, b, crossing) {
    const minX = Math.min(a[0], b[0]), minY = Math.min(a[1], b[1]), maxX = Math.max(a[0], b[0]), maxY = Math.max(a[1], b[1]);
    const B = this._segBB, out = new Set();
    this._segGrid?.query(minX, minY, maxX, maxY, (i) => {
      if (!this._segLayer[i].visible || this._erased.has(i)) return;
      const inside = B[4 * i] >= minX && B[4 * i + 1] >= minY && B[4 * i + 2] <= maxX && B[4 * i + 3] <= maxY;
      if (inside || (crossing && polyTouchesBox(segTessellate(this._segs[i], this._tol()), minX, minY, maxX, maxY))) out.add(i);
    });
    return [...out].sort((x, y) => x - y);
  }

  // Trayecto de segmentos sueltos; une los consecutivos que se tocan (trazos continuos).
  _segsPath(list) {
    const path = new Path2D(), tol = this._tol();
    let last = null;
    for (const s of list) {
      const a = segStart(s);
      const join = last && Math.abs(a[0] - last[0]) <= 1e-9 && Math.abs(a[1] - last[1]) <= 1e-9;
      this._appendSeg(path, s, !join, tol, a);
      last = segEnd(s);
    }
    return path;
  }

  // Contorno cerrado en un único subtrayecto (relleno par-impar correcto).
  _loopPath(li) {
    let p = this._loopPaths[li];
    if (!p) {
      p = this._loopPaths[li] = new Path2D();
      const tol = this._tol();
      this._loops[li].segs.forEach((s, k) => this._appendSeg(p, s, k === 0, tol));
      p.closePath();
    }
    return p;
  }

  _appendSeg(path, s, move, tol, start) {
    const ox = this._o[0], oy = this._o[1];
    if (move) {
      const a = start || segStart(s);
      path.moveTo(a[0] - ox, a[1] - oy);
    }
    const ccw = s.ccw !== false;
    switch (s.type) {
      case 'line':
        path.lineTo(s.p1[0] - ox, s.p1[1] - oy);
        return;
      case 'circle':
        path.arc(s.c[0] - ox, s.c[1] - oy, s.r, 0, ccw ? TAU : -TAU, !ccw);
        return;
      case 'arc': {
        // Arco nativo: exacto a cualquier zoom. En el espacio del trayecto (Y arriba) "antihorario" = !ccw del lienzo.
        const sw = segSweep(s);
        path.arc(s.c[0] - ox, s.c[1] - oy, s.r, s.a0, s.a0 + (ccw ? sw : -sw), !ccw);
        return;
      }
      case 'ellipse': {
        const sw = segSweep(s);
        path.ellipse(s.c[0] - ox, s.c[1] - oy, s.rx, s.ry, s.rot || 0, s.t0, s.t0 + (ccw ? sw : -sw), !ccw);
        return;
      }
      case 'bezier':
        if (s.pts.length === 4) {
          const [, b, c, d] = s.pts;
          path.bezierCurveTo(b[0] - ox, b[1] - oy, c[0] - ox, c[1] - oy, d[0] - ox, d[1] - oy);
          return;
        }
        if (s.pts.length === 3) {
          const [, b, c] = s.pts;
          path.quadraticCurveTo(b[0] - ox, b[1] - oy, c[0] - ox, c[1] - oy);
          return;
        }
    }
    const pts = segTessellate(s, tol);
    for (let i = 1; i < pts.length; i++) path.lineTo(pts[i][0] - ox, pts[i][1] - oy);
  }

  // Refina el teselado de splines cuando el zoom lo pide (potencias de 2: pocas reconstrucciones).
  _ensureTess() {
    if (!this._hasSpline) return;
    const need = 0.3 / (this._view.scale * this._dpr);
    let level = 0;
    while (this._baseTol / Math.pow(2, level) > need && level < 24) level++;
    if (level <= this._tessLevel) return;
    this._tessLevel = level;
    for (const b of this._batches) if (b.hasSpline) b.path = this._segsPath(b.idx.map((i) => this._segs[i]));
    this._erasedPath = null;
    this._loopPaths = [];
    this._regionPaths = null;
    this._openPath = null;
  }

  _getRegionPaths() {
    if (!this._regionPaths) {
      const inc = new Path2D(), exc = new Path2D();
      let nInc = 0, nExc = 0;
      this._regions.forEach((r, i) => {
        const st = this._regionState[i], target = st.included ? inc : exc;
        st.included ? nInc++ : nExc++;
        for (const li of [r.outer, ...(r.holes || [])]) target.addPath(this._loopPath(li));
      });
      this._regionPaths = { inc: nInc ? inc : null, exc: nExc ? exc : null };
    }
    return this._regionPaths;
  }

  _getOpenPath() {
    if (!this._openPath && this._open.length) {
      const p = (this._openPath = new Path2D()), tol = this._tol();
      for (const ch of this._open) ch.segs.forEach((s, k) => this._appendSeg(p, s, k === 0, tol));
    }
    return this._openPath;
  }

  // Índices espaciales: segmentos (cercano, ejes, círculos) y puntos de referencia.
  _buildIndex() {
    const n = this._segs.length, bb = this._bbox, B = this._segBB;
    this._segGrid = new SpatialGrid(bb, n);
    for (let i = 0; i < n; i++) this._segGrid.insert(i, B[4 * i], B[4 * i + 1], B[4 * i + 2], B[4 * i + 3]);
    const xs = [], ys = [], kinds = [], owner = [];
    for (let i = 0; i < n; i++)
      for (const sp of segSnapPoints(this._segs[i])) {
        xs.push(sp.p[0]);
        ys.push(sp.p[1]);
        kinds.push(SNAP_KINDS.indexOf(sp.kind));
        owner.push(i);
      }
    this._snapPts = { xs: Float64Array.from(xs), ys: Float64Array.from(ys), kinds: Int8Array.from(kinds), owner: Int32Array.from(owner) };
    this._ptGrid = new SpatialGrid(bb, xs.length);
    for (let k = 0; k < xs.length; k++) this._ptGrid.insert(k, xs[k], ys[k], xs[k], ys[k]);
  }

  _visibleBBox() {
    const bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }, B = this._segBB;
    for (let i = 0; i < this._segs.length; i++) {
      if (!this._segLayer[i].visible) continue;
      if (B[4 * i] < bb.minX) bb.minX = B[4 * i];
      if (B[4 * i + 1] < bb.minY) bb.minY = B[4 * i + 1];
      if (B[4 * i + 2] > bb.maxX) bb.maxX = B[4 * i + 2];
      if (B[4 * i + 3] > bb.maxY) bb.maxY = B[4 * i + 3];
    }
    return bb.minX <= bb.maxX ? bb : this._bbox;
  }

  // ----- Hit-testing -----

  // Contorno más pequeño que contiene p (−1 si ninguno).
  _pickLoop(p) {
    let best = -1, ba = Infinity;
    this._infos.forEach((inf, i) => {
      const b = inf.bbox;
      if (p[0] < b.minX || p[0] > b.maxX || p[1] < b.minY || p[1] > b.maxY || inf.area >= ba) return;
      if (pointInPolygon(p, inf.poly)) (best = i), (ba = inf.area);
    });
    return best;
  }

  // Segmento visible más cercano a p dentro de r que cumple filter → { i, q, d } | null.
  // erased = true: solo entre los borrados.
  _pickSeg(p, r, filter, erased = false) {
    let best = null;
    if (!this._segGrid) return null;
    const B = this._segBB;
    this._segGrid.query(p[0] - r, p[1] - r, p[0] + r, p[1] + r, (i) => {
      if (!this._segLayer[i].visible || this._erased.has(i) !== erased || (filter && !filter(this._segs[i]))) return;
      if (p[0] < B[4 * i] - r || p[0] > B[4 * i + 2] + r || p[1] < B[4 * i + 1] - r || p[1] > B[4 * i + 3] + r) return;
      const c = segClosestPoint(this._segs[i], p);
      if (c.d <= r && (!best || c.d < best.d)) best = { i, q: c.q, d: c.d };
    });
    return best;
  }

  // Referencia a objeto bajo un punto de pantalla → { p, kind, seg } | null.
  _findSnap(q) {
    if (!this._ptGrid) return null;
    const w = this.screenToWorld(q), r = SNAP_PX / this._view.scale, S = this._snapPts;
    let best = null;
    this._ptGrid.query(w[0] - r, w[1] - r, w[0] + r, w[1] + r, (k) => {
      if (!this._segLayer[S.owner[k]].visible || this._erased.has(S.owner[k])) return;
      const d = Math.hypot(S.xs[k] - w[0], S.ys[k] - w[1]);
      if (d > r) return;
      if (!best || d < best.d - 1e-6 * r || (Math.abs(d - best.d) <= 1e-6 * r && S.kinds[k] < best.k))
        best = { d, k: S.kinds[k], idx: k };
    });
    if (best) return { p: [S.xs[best.idx], S.ys[best.idx]], kind: SNAP_KINDS[best.k], seg: S.owner[best.idx] };
    const n = this._pickSeg(w, r);
    return n ? { p: n.q, kind: 'nearest', seg: n.i } : null;
  }

  // ----- Eventos del DOM -----

  _bindEvents() {
    const cv = this.canvas;
    this._domListeners = [];
    const add = (target, type, fn, opts) => {
      const f = { type, fn: fn.bind(this) };
      target.addEventListener(type, f.fn, opts);
      this._domListeners.push([target, f, opts]);
    };
    add(cv, 'pointerdown', this._onDown);
    add(cv, 'pointermove', this._onMove);
    add(cv, 'pointerup', this._onUp);
    add(cv, 'pointercancel', this._onUp);
    add(cv, 'pointerleave', this._onLeave);
    add(cv, 'wheel', this._onWheel, { passive: false });
    add(cv, 'contextmenu', (e) => e.preventDefault());
    add(cv, 'mousedown', (e) => e.button === 1 && e.preventDefault()); // sin autodesplazamiento
    add(cv, 'auxclick', (e) => e.preventDefault());
    add(window, 'keydown', this._onKey);
    add(window, 'keyup', this._onKey);
    add(window, 'blur', () => (this._space = false));
  }

  _pt(e) {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  _onKey(e) {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    if (e.code === 'Space') {
      const down = e.type === 'keydown';
      if (down && !this._mouse) return; // solo con el cursor sobre el lienzo
      e.preventDefault();
      if (this._space !== down) {
        this._space = down;
        this._updateCursor();
      }
    } else if (e.key === 'Shift' && this.mode === 'erase') {
      this._shift = e.type === 'keydown';
      this._hoverDirty = true;
      this._requestRender();
    } else if (e.key === 'Escape' && e.type === 'keydown' && (this._pending || this._drag)) {
      this._pending = null;
      this._drag = null;
      this._requestRender();
    }
  }

  _onDown(e) {
    const q = this._pt(e);
    if (e.pointerType === 'touch') {
      this._touches.set(e.pointerId, q);
      if (this._touches.size === 2) {
        const [a, b] = [...this._touches.values()];
        this._pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
        this._drag = null;
        return;
      }
    }
    this.canvas.setPointerCapture?.(e.pointerId);
    if (e.button === 1) {
      e.preventDefault();
      const now = performance.now();
      if (now - this._lastMiddle < 400) {
        this._lastMiddle = 0;
        this.fit();
        return;
      }
      this._lastMiddle = now;
    }
    if (e.button === 1 || e.button === 2 || (e.button === 0 && this._space)) {
      this._drag = { kind: 'pan', last: q };
      this._updateCursor();
    } else if (e.button === 0) this._drag = { kind: this.mode === 'window' ? 'window' : this.mode === 'erase' && !e.shiftKey ? 'erasebox' : 'click', start: q, cur: q, moved: false };
  }

  _onMove(e) {
    const q = this._pt(e);
    this._mouse = q;
    this._shift = !!e.shiftKey;
    if (e.pointerType === 'touch' && this._touches.has(e.pointerId)) {
      this._touches.set(e.pointerId, q);
      if (this._pinch && this._touches.size === 2) {
        const [a, b] = [...this._touches.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        this._view.tx += m[0] - this._pinch.m[0];
        this._view.ty += m[1] - this._pinch.m[1];
        if (this._pinch.d > 0) this.zoomAt(m, d / this._pinch.d);
        this._pinch = { d, m };
        return;
      }
    }
    const dr = this._drag;
    if (dr && dr.kind === 'pan') {
      this._view.tx += q[0] - dr.last[0];
      this._view.ty += q[1] - dr.last[1];
      dr.last = q;
    } else if (dr) {
      dr.cur = q;
      if (Math.hypot(q[0] - dr.start[0], q[1] - dr.start[1]) > CLICK_PX) dr.moved = true;
    }
    this._hoverDirty = true;
    this._requestRender();
  }

  _onUp(e) {
    if (e.pointerType === 'touch') {
      this._touches.delete(e.pointerId);
      if (this._pinch) {
        if (this._touches.size < 2) this._pinch = null;
        return;
      }
    }
    const dr = this._drag;
    this._drag = null;
    if (!dr) return;
    const q = this._pt(e);
    if (dr.kind === 'pan') this._updateCursor();
    else if (dr.kind === 'window') {
      if (dr.moved) {
        const a = this.screenToWorld(dr.start), b = this.screenToWorld(q);
        this._emit('window', { minX: Math.min(a[0], b[0]), minY: Math.min(a[1], b[1]), maxX: Math.max(a[0], b[0]), maxY: Math.max(a[1], b[1]) });
      }
    } else if (dr.kind === 'erasebox' && dr.moved) {
      const idx = this._segsInBox(this.screenToWorld(dr.start), this.screenToWorld(q), q[0] < dr.start[0]);
      if (idx.length) this._emit('erase', { indices: idx });
    } else if (!dr.moved && e.type === 'pointerup') this._click(q, e);
    this._hoverDirty = true;
    this._requestRender();
  }

  _onLeave(e) {
    if (e.pointerType === 'touch') return;
    this._mouse = null;
    this._snap = null;
    this._hover = null;
    this._emit('cursor', null);
    this._requestRender();
  }

  _onWheel(e) {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this._h : 1;
    const k = e.ctrlKey ? 0.01 : 0.0015; // ctrl+rueda = pellizco del trackpad
    this.zoomAt(this._pt(e), Math.exp(-e.deltaY * unit * k));
  }

  _updateCursor() {
    const pan = this._space || (this._drag && this._drag.kind === 'pan');
    this.canvas.style.cursor = pan ? (this._drag ? 'grabbing' : 'grab') : this.mode === 'select' ? 'default' : 'crosshair';
  }

  _click(q, e) {
    const w = this.screenToWorld(q), shiftKey = !!e.shiftKey;
    switch (this.mode) {
      case 'select': {
        const li = this._pickLoop(w);
        if (li >= 0 && !this._outerOf.has(li)) this._emit('loopClick', { loopIndex: li, regionIndex: this._holeOf.get(li) ?? -1, shiftKey, p: w });
        else this._emit('regionClick', { regionIndex: li >= 0 ? this._outerOf.get(li) : -1, loopIndex: li, shiftKey, p: w });
        return;
      }
      case 'measure': {
        if (shiftKey && !this._pending) {
          const c = this._pickSeg(w, SNAP_PX / this._view.scale, (s) => s.type === 'circle' || s.type === 'arc');
          if (c) {
            const s = this._segs[c.i];
            const m = { id: ++this._measureSeq, kind: 'radius', r: s.r, diameter: 2 * s.r, c: s.c.slice(), p: c.q, segIndex: c.i };
            this._measures.push(m);
            this._emit('measure', m);
            return;
          }
        }
        const sn = this._findSnap(q), p = sn ? sn.p : w;
        if (!this._pending) this._pending = { p, kind: sn ? sn.kind : null };
        else {
          const a = this._pending.p, dx = p[0] - a[0], dy = p[1] - a[1];
          const m = { id: ++this._measureSeq, kind: 'distance', p1: a, p2: p, d: Math.hypot(dx, dy), dx, dy, angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI, snap1: this._pending.kind, snap2: sn ? sn.kind : null };
          this._pending = null;
          this._measures.push(m);
          this._emit('measure', m);
        }
        return;
      }
      case 'erase': {
        const l = this._pickSeg(w, SNAP_PX / this._view.scale, null, shiftKey);
        if (l && (!shiftKey || this._showErased)) this._emit(shiftKey ? 'restore' : 'erase', { indices: [l.i] });
        return;
      }
      case 'calibrate': {
        const sn = this._findSnap(q), p = sn ? sn.p : w;
        // Sin punto pendiente, un clic en un círculo o arco (no en un extremo ni un centro) calibra por su diámetro.
        if (!this._pending && (!sn || (sn.kind !== 'end' && sn.kind !== 'center'))) {
          const c = this._pickSeg(w, SNAP_PX / this._view.scale, (s) => s.type === 'circle' || s.type === 'arc');
          if (c) {
            const s = this._segs[c.i];
            this._emit('calibrateCircle', { segIndex: c.i, r: s.r, c: s.c.slice() });
            return;
          }
        }
        if (!this._pending) this._pending = { p, kind: sn ? sn.kind : null };
        else {
          const a = this._pending.p;
          this._calib = { p1: a, p2: p, d: Math.hypot(p[0] - a[0], p[1] - a[1]) };
          this._pending = null;
          this._emit('calibrate', { ...this._calib });
        }
        return;
      }
      case 'axis': {
        const l = this._pickSeg(w, SNAP_PX / this._view.scale, (s) => s.type === 'line');
        if (!l) return;
        const s = this._segs[l.i], dx = s.p1[0] - s.p0[0], dy = s.p1[1] - s.p0[1], len = Math.hypot(dx, dy);
        if (len > 0) this._emit('axisPick', { p: s.p0.slice(), d: [dx / len, dy / len], segIndex: l.i });
        return;
      }
    }
  }

  // Estado de "hover" (se calcula una vez por cuadro).
  _updateHover() {
    this._hoverDirty = false;
    const q = this._mouse;
    this._snap = null;
    this._hover = null;
    if (!q || (this._drag && this._drag.kind === 'pan')) return;
    const w = this.screenToWorld(q);
    if (this.mode === 'measure' || this.mode === 'calibrate') this._snap = this._findSnap(q);
    else if (this.mode === 'select') {
      const li = this._pickLoop(w);
      if (li >= 0) this._hover = { loop: li };
    } else if (this.mode === 'axis') {
      const l = this._pickSeg(w, SNAP_PX / this._view.scale, (s) => s.type === 'line');
      if (l) this._hover = { seg: l.i };
    } else if (this.mode === 'erase' && !this._drag?.moved) {
      const rs = this._shift && this._showErased;
      const l = this._pickSeg(w, SNAP_PX / this._view.scale, null, rs);
      if (l) this._hover = { seg: l.i, erase: rs ? 'restore' : 'erase' };
    }
    this._emit('cursor', { x: w[0], y: w[1], snap: this._snap ? { p: this._snap.p, kind: this._snap.kind } : null });
  }

  _requestRender() {
    if (this._raf || typeof requestAnimationFrame === 'undefined') return;
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      if (this._hoverDirty) this._updateHover();
      this.render();
    });
  }

  // ----- Dibujo -----

  render() {
    const ctx = this.ctx, th = this._th, dpr = this._dpr, { scale: s, tx, ty } = this._view;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.fillStyle = th.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._drawGrid();
    this._drawOrigin();

    // Mundo: trayectos en coordenadas locales; 1 px de dispositivo = px unidades.
    this._ensureTess();
    const ox = this._o[0], oy = this._o[1];
    const a = dpr * s, e = dpr * (tx + ox * s), f = dpr * (ty - oy * s);
    ctx.setTransform(a, 0, 0, -a, e, f);
    const px = 1 / a, cssPx = 1 / s;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    const rp = this._getRegionPaths();
    if (rp.inc) {
      ctx.fillStyle = th.accentFill;
      ctx.fill(rp.inc, 'evenodd');
    }
    if (rp.exc) {
      const pat = this._hatchPattern();
      pat.setTransform(new DOMMatrix([1 / s, 0, 0, -1 / s, -e / a, f / a]));
      ctx.fillStyle = pat;
      ctx.fill(rp.exc, 'evenodd');
      ctx.strokeStyle = th.excl;
      ctx.lineWidth = 1.5 * cssPx;
      ctx.stroke(rp.exc);
    }

    for (const b of this._batches) {
      if (!b.layer.visible) continue;
      ctx.strokeStyle = b.css;
      ctx.lineWidth = px;
      if (b.dashed) {
        ctx.globalAlpha = 0.6;
        ctx.setLineDash((b.dashDot ? [14, 4, 2, 4] : [6, 4]).map((v) => v * cssPx));
      }
      ctx.stroke(b.path);
      if (b.dashed) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
      }
    }

    const ep = this._showErased ? this._getErasedPath() : null;
    if (ep) {
      ctx.strokeStyle = th.erased;
      ctx.lineWidth = px;
      ctx.setLineDash([3, 3].map((v) => v * cssPx));
      ctx.stroke(ep);
      ctx.setLineDash([]);
    }

    const op = this._getOpenPath();
    if (op) {
      ctx.strokeStyle = th.open;
      ctx.lineWidth = 1.5 * cssPx;
      ctx.stroke(op);
    }

    // Contornos resaltados: seleccionados y bajo el cursor.
    this._regions.forEach((r, i) => {
      if (!this._regionState[i].selected) return;
      ctx.strokeStyle = th.accentStrong;
      ctx.lineWidth = 2.5 * cssPx;
      for (const li of [r.outer, ...(r.holes || [])]) ctx.stroke(this._loopPath(li));
    });
    const hv = this._hover;
    if (hv && hv.loop != null) {
      ctx.strokeStyle = th.accentHover;
      ctx.lineWidth = 2 * cssPx;
      const ri = this._outerOf.get(hv.loop);
      const lis = ri != null ? [hv.loop, ...(this._regions[ri].holes || [])] : [hv.loop];
      for (const li of lis) ctx.stroke(this._loopPath(li));
    }
    if (hv && hv.seg != null) {
      ctx.strokeStyle = hv.erase === 'erase' ? th.eraseHover : hv.erase === 'restore' ? th.snap : th.axis;
      ctx.lineWidth = 3 * cssPx;
      ctx.stroke(this._segsPath([this._segs[hv.seg]]));
    }

    // Pantalla
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._drawOpenEnds();
    this._drawTexts();
    this._drawViewBoxes();
    this._drawRoleTags();
    this._drawAxis();
    this._drawMeasures();
    this._drawSnap();
    this._drawRubberBand();
    this._drawScaleBar();
  }

  _hatchPattern() {
    if (!this._hatch) {
      const c = document.createElement('canvas');
      c.width = c.height = 8;
      const g = c.getContext('2d');
      g.strokeStyle = this._th.exclHatch;
      g.lineWidth = 1;
      g.beginPath();
      // Diagonal continua entre teselas (incluye las esquinas).
      g.moveTo(-1, 9);
      g.lineTo(9, -1);
      g.moveTo(-1, 1);
      g.lineTo(1, -1);
      g.moveTo(7, 9);
      g.lineTo(9, 7);
      g.stroke();
      this._hatch = this.ctx.createPattern(c, 'repeat');
    }
    return this._hatch;
  }

  _drawGrid() {
    const ctx = this.ctx, th = this._th, { scale: s, tx, ty } = this._view, W = this._w, H = this._h;
    const step = niceStep(12 / s);
    const mant = Math.round(step / Math.pow(10, Math.floor(Math.log10(step) + 1e-9)));
    const ratio = mant === 2 ? 5 : 10;
    const x0 = Math.ceil(-tx / s / step), x1 = Math.floor((W - tx) / s / step);
    const y0 = Math.ceil((ty - H) / s / step), y1 = Math.floor(ty / s / step);
    const minor = new Path2D(), major = new Path2D();
    for (let i = x0; i <= x1; i++) {
      const X = Math.round(i * step * s + tx) + 0.5, p = i % ratio === 0 ? major : minor;
      p.moveTo(X, 0);
      p.lineTo(X, H);
    }
    for (let j = y0; j <= y1; j++) {
      const Y = Math.round(-j * step * s + ty) + 0.5, p = j % ratio === 0 ? major : minor;
      p.moveTo(0, Y);
      p.lineTo(W, Y);
    }
    ctx.lineWidth = 1;
    // La rejilla menor aparece gradualmente al acercarse.
    ctx.globalAlpha = Math.min(1, Math.max(0, (step * s - 12) / 18));
    ctx.strokeStyle = th.gridMinor;
    ctx.stroke(minor);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = th.gridMajor;
    ctx.stroke(major);
  }

  _drawOrigin() {
    const ctx = this.ctx, th = this._th, [X, Y] = this.worldToScreen([0, 0]), W = this._w, H = this._h;
    const x = Math.round(X) + 0.5, y = Math.round(Y) + 0.5;
    ctx.lineWidth = 1;
    if (y >= 0 && y <= H) {
      ctx.strokeStyle = th.axisX;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    if (x >= 0 && x <= W) {
      ctx.strokeStyle = th.axisY;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    // Icono SCP en el origen (o en la esquina si queda fuera).
    const inside = X > 20 && X < W - 40 && Y > 40 && Y < H - 20;
    const ux = inside ? x : 24.5, uy = inside ? y : H - 44.5, L = 28;
    ctx.lineWidth = 1.5;
    const arrow = (dx, dy, color, label) => {
      ctx.strokeStyle = ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(ux + dx * L, uy + dy * L);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ux + dx * (L + 6), uy + dy * (L + 6));
      ctx.lineTo(ux + dx * L - dy * 3.5, uy + dy * L + dx * 3.5);
      ctx.lineTo(ux + dx * L + dy * 3.5, uy + dy * L - dx * 3.5);
      ctx.fill();
      ctx.font = `600 10px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, ux + dx * (L + 14), uy + dy * (L + 14));
    };
    arrow(1, 0, th.axisX.replace(/[\d.]+\)$/, '1)'), 'X');
    arrow(0, -1, th.axisY.replace(/[\d.]+\)$/, '1)'), 'Y');
    ctx.fillStyle = th.text;
    ctx.fillRect(ux - 2, uy - 2, 4, 4);
  }

  _drawOpenEnds() {
    if (!this._open.length) return;
    const ctx = this.ctx;
    ctx.strokeStyle = this._th.open;
    ctx.fillStyle = this._th.bg;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const ch of this._open) {
      if (!ch.segs.length) continue;
      for (const p of [segStart(ch.segs[0]), segEnd(ch.segs[ch.segs.length - 1])]) {
        const [x, y] = this.worldToScreen(p);
        ctx.moveTo(x + 3.5, y);
        ctx.arc(x, y, 3.5, 0, TAU);
      }
    }
    ctx.fill();
    ctx.stroke();
  }

  _drawTexts() {
    const ctx = this.ctx, s = this._view.scale, W = this._w, H = this._h;
    ctx.fillStyle = this._th.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (const t of this._texts) {
      const size = (t.h || 2.5) * s;
      if (!t._layer.visible || size < 5) continue;
      const [x, y] = this.worldToScreen(t.p);
      const reach = size * String(t.text).length;
      if (x < -reach || x > W + reach || y < -reach || y > H + reach) continue;
      ctx.save();
      ctx.translate(x, y);
      if (t.rot) ctx.rotate(-t.rot);
      ctx.font = `${size}px ${FONT}`;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }

  _pill(x, y, text, { bg, fg, border, font = `600 11px ${FONT}`, align = 'left' } = {}) {
    const ctx = this.ctx;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width) + 10, h = 18;
    const x0 = align === 'center' ? x - w / 2 : x;
    ctx.beginPath();
    ctx.roundRect(Math.round(x0) + 0.5, Math.round(y) + 0.5, w, h, 4);
    ctx.fillStyle = bg;
    ctx.fill();
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fillStyle = fg;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, Math.round(x0) + 5.5, Math.round(y) + h / 2 + 1);
    return w;
  }

  _drawViewBoxes() {
    const ctx = this.ctx, th = this._th;
    for (const v of this._viewBoxes) {
      const [x0, y0] = this.worldToScreen([v.box.minX, v.box.maxY]), [x1, y1] = this.worldToScreen([v.box.maxX, v.box.minY]);
      ctx.strokeStyle = th.accent;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([7, 4]);
      ctx.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(x1 - x0), Math.round(y1 - y0));
      ctx.setLineDash([]);
      this._pill(x0, y0 - 22, ROLE_NAMES[v.role] || String(v.role), { bg: th.labelBg, fg: th.accent, border: th.accent });
    }
  }

  _drawRoleTags() {
    const th = this._th;
    this._regions.forEach((r, i) => {
      const role = this._regionState[i].role;
      if (!role) return;
      const b = this._infos[r.outer].bbox, [x, y] = this.worldToScreen([b.minX, b.maxY]);
      this._pill(x + 4, y + 4, ROLE_NAMES[role] || String(role), { bg: th.accent, fg: '#ffffff' });
    });
  }

  _drawAxis() {
    if (!this._axis) return;
    const ctx = this.ctx, th = this._th, { p, d } = this._axis;
    const [x, y] = this.worldToScreen(p), dx = d[0], dy = -d[1], L = Math.hypot(this._w, this._h) * 2 + Math.hypot(x, y);
    ctx.strokeStyle = th.axis;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([16, 4, 3, 4]);
    ctx.beginPath();
    ctx.moveTo(x - dx * L, y - dy * L);
    ctx.lineTo(x + dx * L, y + dy * L);
    ctx.stroke();
    ctx.setLineDash([]);
    // Punto base y sentido.
    ctx.fillStyle = th.axis;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, TAU);
    ctx.fill();
    const hx = x + dx * 34, hy = y + dy * 34;
    ctx.beginPath();
    ctx.moveTo(hx + dx * 9, hy + dy * 9);
    ctx.lineTo(hx - dy * 4.5, hy + dx * 4.5);
    ctx.lineTo(hx + dy * 4.5, hy - dx * 4.5);
    ctx.fill();
    this._pill(x + 8, y + 8, 'Eje de revolución', { bg: th.labelBg, fg: th.axis, border: th.labelBorder, font: `500 11px ${FONT}` });
  }

  _arrow(x, y, ux, uy, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - ux * 9 - uy * 3, y - uy * 9 + ux * 3);
    ctx.lineTo(x - ux * 9 + uy * 3, y - uy * 9 - ux * 3);
    ctx.closePath();
    ctx.fill();
  }

  _dimension(p1, p2, color, lines, { dashed = false, arrows = 2 } = {}) {
    const ctx = this.ctx, th = this._th;
    const [x1, y1] = this.worldToScreen(p1), [x2, y2] = this.worldToScreen(p2);
    const L = Math.hypot(x2 - x1, y2 - y1), ux = L ? (x2 - x1) / L : 1, uy = L ? (y2 - y1) / L : 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.setLineDash(dashed ? [5, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (L > 26 && !dashed) {
      if (arrows > 1) this._arrow(x1, y1, -ux, -uy, color);
      this._arrow(x2, y2, ux, uy, color);
    }
    for (const [x, y] of arrows > 1 ? [[x1, y1], [x2, y2]] : [[x2, y2]]) {
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.moveTo(x - 4, y + 4);
      ctx.lineTo(x + 4, y - 4);
      ctx.stroke();
    }
    if (!lines.length) return;
    // Etiqueta al lado de la cota, hacia arriba de la línea.
    let nx = -uy, ny = ux;
    if (ny > 0 || (ny === 0 && nx > 0)) (nx = -nx), (ny = -ny);
    const mx = (x1 + x2) / 2 + nx * 16, my = (y1 + y2) / 2 + ny * 16;
    ctx.font = `600 12px ${FONT}`;
    const w0 = ctx.measureText(lines[0]).width;
    ctx.font = `11px ${FONT}`;
    const w1 = lines[1] ? ctx.measureText(lines[1]).width : 0;
    const w = Math.ceil(Math.max(w0, w1)) + 14, h = lines[1] ? 36 : 20;
    const bx = Math.round(mx - w / 2) + 0.5, by = Math.round(my - h / 2) + 0.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 4);
    ctx.fillStyle = th.labelBg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = th.label;
    ctx.font = `600 12px ${FONT}`;
    ctx.fillText(lines[0], bx + w / 2, by + 10.5);
    if (lines[1]) {
      ctx.fillStyle = th.text;
      ctx.font = `11px ${FONT}`;
      ctx.fillText(lines[1], bx + w / 2, by + 26);
    }
  }

  _distLines(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    return [this.formatLength(Math.hypot(dx, dy)), `ΔX ${this.formatLength(dx)}   ΔY ${this.formatLength(dy)}   ∠ ${ang.toFixed(2)}°`];
  }

  _drawMeasures() {
    const th = this._th, ctx = this.ctx;
    for (const m of this._measures) {
      if (m.kind === 'radius') {
        const [cx, cy] = this.worldToScreen(m.c);
        ctx.strokeStyle = th.measure;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();
        this._dimension(m.c, m.p, th.measure, [`R ${this.formatLength(m.r)}`, `Ø ${this.formatLength(m.diameter)}`], { arrows: 1 });
      } else this._dimension(m.p1, m.p2, th.measure, this._distLines(m.p1, m.p2));
    }
    if (this._calib) this._dimension(this._calib.p1, this._calib.p2, th.calib, [`Calibración: ${this.formatLength(this._calib.d)}`]);
    if (this._pending && this._mouse) {
      const b = this._snap ? this._snap.p : this.screenToWorld(this._mouse);
      const color = this.mode === 'calibrate' ? th.calib : th.measure;
      this._dimension(this._pending.p, b, color, this._distLines(this._pending.p, b), { dashed: true });
    }
  }

  _drawSnap() {
    const sn = this._snap;
    if (!sn) return;
    const ctx = this.ctx, th = this._th, [x, y] = this.worldToScreen(sn.p), r = 6;
    ctx.strokeStyle = th.snap;
    ctx.lineWidth = 2;
    ctx.beginPath();
    switch (sn.kind) {
      case 'end':
        ctx.rect(x - r, y - r, 2 * r, 2 * r);
        break;
      case 'mid':
        ctx.moveTo(x, y - r - 1);
        ctx.lineTo(x + r + 1, y + r);
        ctx.lineTo(x - r - 1, y + r);
        ctx.closePath();
        break;
      case 'center':
        ctx.arc(x, y, r, 0, TAU);
        break;
      case 'quadrant':
        ctx.moveTo(x, y - r - 1);
        ctx.lineTo(x + r + 1, y);
        ctx.lineTo(x, y + r + 1);
        ctx.lineTo(x - r - 1, y);
        ctx.closePath();
        break;
      default:
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.moveTo(x - r, y + r);
        ctx.lineTo(x + r, y - r);
    }
    ctx.stroke();
    this._pill(x + 12, y + 10, SNAP_NAMES[sn.kind], { bg: th.labelBg, fg: th.snap, border: th.labelBorder, font: `500 11px ${FONT}` });
  }

  _drawRubberBand() {
    const dr = this._drag;
    if (!dr || (dr.kind !== 'window' && dr.kind !== 'erasebox') || !dr.moved) return;
    const ctx = this.ctx, th = this._th;
    const x = Math.min(dr.start[0], dr.cur[0]), y = Math.min(dr.start[1], dr.cur[1]);
    const w = Math.abs(dr.cur[0] - dr.start[0]), h = Math.abs(dr.cur[1] - dr.start[1]);
    // Borrado estilo CAD: ventana (izq→der, azul continuo) o captura (der→izq, verde discontinuo).
    const cross = dr.kind === 'erasebox' && dr.cur[0] < dr.start[0];
    ctx.fillStyle = cross ? th.crossFill : th.accentFill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = cross ? th.snap : th.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash(dr.kind === 'erasebox' && !cross ? [] : [5, 3]);
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
    ctx.setLineDash([]);
  }

  _drawScaleBar() {
    const ctx = this.ctx, th = this._th, s = this._view.scale;
    const len = niceFloor(120 / s), w = len * s, x = Math.round(this._w - 24 - w) + 0.5, y = Math.round(this._h - 22) + 0.5;
    ctx.strokeStyle = ctx.fillStyle = th.bar;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y - 5);
    ctx.moveTo(x + w / 2, y - 3);
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
    ctx.font = `500 11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${+len.toPrecision(6)} ${this._units}`, x + w / 2, y - 6);
  }
}

// Curvas que se dibujan teseladas (el lienzo no tiene primitiva exacta).
// ¿La polilínea toca el rectángulo? (algún vértice dentro o algún tramo lo cruza; Liang-Barsky)
function polyTouchesBox(pts, minX, minY, maxX, maxY) {
  for (let k = 0; k < pts.length; k++) {
    const [x1, y1] = pts[k];
    if (x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) return true;
    if (!k) continue;
    const [x0, y0] = pts[k - 1], dx = x1 - x0, dy = y1 - y0;
    let t0 = 0, t1 = 1, hit = true;
    for (const [p, q] of [[-dx, x0 - minX], [dx, maxX - x0], [-dy, y0 - minY], [dy, maxY - y0]]) {
      if (p === 0) {
        if (q < 0) hit = false;
      } else if (p < 0) t0 = Math.max(t0, q / p);
      else t1 = Math.min(t1, q / p);
    }
    if (hit && t0 <= t1) return true;
  }
  return false;
}

function needsTess(s) {
  return s.type === 'spline' || (s.type === 'bezier' && s.pts.length !== 3 && s.pts.length !== 4);
}
