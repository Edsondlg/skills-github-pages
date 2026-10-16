// Punto de entrada: cablea armazón, motor CAD, visores e importadores (flujo principal).
// Medición en lista, ventanas de multivista, calibración y exportación se completan con app-api.js.
import * as ui from './ui-shell.js';
import { KernelClient } from '../kernel/client.js';
import { Viewer3D } from '../viewer/viewer3d.js';
import { MeasureTools } from '../viewer/measure.js';
import { View2D } from '../ui/view2d.js';
import { makeFormatter } from '../ui/report.js';
import { materialGroups, findMaterial, CUSTOM_MATERIAL_ID, customMaterial } from '../ui/materials.js';
import { decodeDXF } from '../importers/dxf.js';
import { segTransform } from '../geom2d/segments.js';
import { detectFormat, importText, importImage, prepareProfile, defaultOpState, applySuggested, makeJob, computeAll } from './pipeline.js';
import { SAMPLES } from './samples.js';
import { renderPlano, renderRegions, renderSlots, renderProps, axisText } from './panels.js';
import { createAppApi } from './app-api.js';
import { initToolsUi } from './tools-ui.js';
import { initExportUi } from './export-ui.js';
import { initModes } from './modes-ui.js';

const $ = ui.$;
const PREFS_KEY = 'plano3d.prefs';
const AUTO_MS = 400;
const DEFAULT_MM_PER_PX = 0.25; // escala inicial de las imágenes (campo «Escala (mm/px)»)
const EMPTY_PROFILE = { regions: [], loopInfos: [] };
const ROLES = ['top', 'front', 'right', 'left'];
const MODE_ICONS = { extrude: 'drawing', revolve: 'revolve', multiview: 'multiview' };
const HINTS_2D = {
  select: 'Clic en una región para incluirla o excluirla · rueda para zoom',
  measure: 'Clic en dos puntos para medir · Mayús+clic en un círculo para el radio',
  window: 'Arrastra un rectángulo alrededor de una vista',
  axis: 'Haz clic en la línea de eje (línea de centros)',
  calibrate: 'Haz clic en dos puntos de distancia conocida (se ajustan a extremos, centros y puntos medios)',
};

// ───────────── Estado ─────────────
const S = {
  drawing: null, profile: null, op: null, build: null, partData: null, builtProfile: null, builtOp: null,
  material: findMaterial('acero-1008'), F: makeFormatter('metric'), sampleId: null,
  hiddenLayers: new Set(), selected: -1, openRegions: new Set(),
  image: null, mmPerPx: DEFAULT_MM_PER_PX, buildSeq: 0, building: false, everBuilt: false, kernelReady: false,
  buildWarnings: [], buildError: null, profileError: null, loadError: null,
  // Coherencia: appliedJob = trabajo exacto (con buildId) de la pieza mostrada; inputVer cuenta las
  // ediciones de geometría; dirty = las entradas cambiaron desde la última pieza aplicada.
  appliedJob: null, inputVer: 0, dirty: false, errorVer: -1, // errorVer: entradas en las que falló buildError
};

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}
function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      units: S.F.system === 'imperial' ? 'in' : 'mm', materialId: $('selMaterial').value,
      density: fields.density.get(), thickness: S.op ? S.op.thickness : fields.thickness.get(),
      price: fields.price.get(), blankMargin: fields.margin.get(),
    }));
  } catch {
    /* sin almacenamiento */
  }
}

let kernel, viewer, measure, view2d, api;
const fields = {};
let autoTimer = 0;
let inflight = null; // { ver, promise } de la generación en curso
let opProfile = null; // perfil sobre el que se definió S.op (para conservar sus elecciones al rehacerlo)

// ───────────── Arranque ─────────────
document.addEventListener('DOMContentLoaded', () => {
  const { examplesMenu } = ui.initShell();
  const prefs = loadPrefs();
  ui.setLoading(true, 'Preparando la interfaz…', 'Cargando motor CAD');
  ui.setStatus({ text: 'Cargando motor CAD…', state: 'loading', mode: 'Motor: cargando' });

  if (prefs.units === 'in') {
    S.F = makeFormatter('imperial');
    ui.setSegmented($('unitsSeg'), 'in');
    $('statusUnits').textContent = 'in';
  }
  const theme = ui.getTheme();
  view2d = new View2D($('view2d'), { theme, format: S.F.len });
  viewer = new Viewer3D($('view3d'), { theme, format: S.F });
  kernel = new KernelClient();
  measure = new MeasureTools(viewer, {
    kernel: ensureKernelShape(), format: S.F,
    onChange: (list, extra) => {
      if (getTab3d()) ui.setHint(extra.hint || '', '3d');
      api?._emitMeasure(list, extra);
    },
  });
  api = createAppApi({ S, kernel, viewer, measure, view2d, actions: { setViewWindow, setRevolveAxis, setImageScale, rebuild: runBuild, pickAxis, loadSample, openFiles, setMode2d, setFrameLoops, prepareExport, ensureKernelShape } });
  window.__app = api;

  initFields(prefs);
  initMaterial(prefs);
  initOpen(examplesMenu);
  initOperation();
  initViews();
  initToolsUi(api);
  initExportUi(api);
  initModes(api);
  ui.setEmpty('2d', true);
  ui.setEmpty('3d', true);
  ui.setPropsVisible(false);
  ui.setPlanoLoaded(false);
  ui.setHint('', 'both');

  kernel.start({
    onStatus: (t) => {
      ui.setLoading(true, t);
      ui.setStatus({ text: t });
    },
  }).then(() => {
    S.kernelReady = true;
    const m = kernel.mode === 'worker' ? 'worker' : 'hilo principal';
    ui.setStatus({ text: 'Motor CAD listo', state: 'ready', mode: `Motor: OpenCascade · ${m}` });
    ui.setLoading(false);
    if (S.profile) runBuild();
  }).catch((e) => {
    console.warn('Motor CAD:', e);
    ui.setLoading(false);
    ui.setStatus({ text: 'Motor CAD no disponible', state: 'error', mode: 'Motor: no disponible' });
    ui.toast(`No se pudo iniciar el motor CAD (${e.message || e}). La importación y la vista 2D siguen disponibles; recargue la página para reintentar.`, { type: 'error', timeout: 0 });
  });
});

const getTab3d = () => ui.getActiveTab() !== '2d';

// ───────────── Campos numéricos ─────────────
function initFields(prefs) {
  fields.joinTol = ui.numberField($('inpJoinTol'), { min: 0.0001, max: 10, step: 0.001, decimals: 3, onChange: () => reprocess() });
  fields.pxScale = ui.numberField($('inpPxScale'), { min: 1e-4, max: 1000, step: 0.01, decimals: 4, onChange: (v) => setImageScale(v) });
  S.mmPerPx = fields.pxScale.get();
  fields.thickness = ui.numberField($('inpThickness'), { min: 0.01, max: 10000, step: 0.1, decimals: 3, onChange: (v) => setThickness(v) });
  if (prefs.thickness > 0) fields.thickness.set(prefs.thickness);
  const fillet = (id, key) => ui.numberField($(id), { min: 0, max: 1000, step: 0.1, decimals: 2, onChange: (v) => editOp((op) => (op.fillets = { ...op.fillets, [key]: v })) });
  fields.fv = fillet('inpFilletVertical', 'vertical');
  fields.ft = fillet('inpFilletTop', 'top');
  fields.ct = fillet('inpChamferTop', 'chamferTop');
  fields.angle = ui.numberField($('inpAngle'), { min: 1, max: 360, step: 1, decimals: 1, onChange: (v) => setAngle(v) });
  fields.density = ui.numberField($('inpDensity'), { min: 0.01, max: 30, step: 0.01, decimals: 3, onChange: () => materialChanged() });
  fields.price = ui.numberField($('inpPrice'), { min: 0, max: 1e5, step: 0.01, decimals: 2, onChange: () => materialChanged() });
  fields.margin = ui.numberField($('inpBlankMargin'), { min: 0, max: 1000, step: 0.5, decimals: 1, onChange: () => materialChanged() });
  if (prefs.density > 0) fields.density.set(prefs.density);
  if (prefs.price >= 0) fields.price.set(prefs.price);
  if (prefs.blankMargin >= 0) fields.margin.set(prefs.blankMargin);
}

// ───────────── Material ─────────────
function initMaterial(prefs) {
  const sel = $('selMaterial');
  sel.innerHTML = materialGroups()
    .map((g) => `<optgroup label="${ui.escapeHtml(g.group)}">${g.items.map((m) => `<option value="${m.id}">${ui.escapeHtml(m.name)}</option>`).join('')}</optgroup>`)
    .join('') + `<optgroup label="Otro"><option value="${CUSTOM_MATERIAL_ID}">Personalizado (densidad)</option></optgroup>`;
  sel.value = prefs.materialId && (findMaterial(prefs.materialId) || prefs.materialId === CUSTOM_MATERIAL_ID) ? prefs.materialId : 'acero-1008';
  sel.addEventListener('change', () => materialChanged());
  syncMaterial();
}

function syncMaterial() {
  const id = $('selMaterial').value;
  const custom = id === CUSTOM_MATERIAL_ID;
  S.material = custom ? customMaterial(fields.density.get()) : findMaterial(id);
  $('densityField').hidden = !custom;
  $('densityReadout').hidden = custom;
  $('densityReadout').innerHTML = `${S.material.density.toFixed(3)} <span class="unit">g/cm³</span>`;
  const short = S.material.name.replace(/\s*\(.*\)$/, '');
  $('stepMaterialSummary').textContent = `${short} · ${S.material.density} g/cm³`;
}

const appearance = () => ({ color: S.material.color, metalness: S.material.metalness, roughness: S.material.roughness });

/** Material, precio o margen: solo recalcula propiedades (sin reconstruir). */
function materialChanged() {
  syncMaterial();
  savePrefs();
  if (S.build) {
    viewer.setAppearance(appearance());
    recomputeProps();
  }
}

function setMaterialId(id) {
  if (!findMaterial(id)) return;
  $('selMaterial').value = id;
  syncMaterial();
}

function recomputeProps() {
  if (!S.build) return;
  S.partData = computeAll({ build: S.build, profile: S.builtProfile, op: S.builtOp, material: S.material, pricePerKg: fields.price.get(), blankMargin: fields.margin.get() });
  renderProps(S.partData, S.F, { thickness: S.builtOp.thickness });
  updateSectionRange();
  api._emitBuilt();
}

// ───────────── Apertura ─────────────
function initOpen(examplesMenu) {
  ui.setDropzone($('dropzone'), openFiles);
  ui.setExamples(SAMPLES.map((s) => ({
    value: s.id, label: s.title,
    desc: `${s.format === 'image' ? 'Imagen' : s.format.toUpperCase()} · ${{ extrude: 'extrusión', revolve: 'revolución', multiview: 'multivista' }[s.suggested.mode]}`,
    icon: s.format === 'image' ? 'image' : MODE_ICONS[s.suggested.mode],
  })));
  ui.onMenu('examples', (id) => loadSample(id));
  $('btnDropExample').addEventListener('click', (e) => {
    e.stopPropagation();
    examplesMenu.open();
  });
}

// Ficha de carga: solo la última apertura iniciada aplica su resultado (o su error).
let loadToken = 0;

async function openFiles(files) {
  const file = files[0];
  if (!file) return;
  const token = ++loadToken;
  const current = () => token === loadToken;
  let format = null;
  try {
    const head = new Uint8Array(await file.slice(0, 256).arrayBuffer());
    if (!current()) return;
    format = detectFormat(file.name, head);
    if (!format) throw new Error(`Formato no reconocido: ${file.name}. Use DXF, SVG o una imagen (PNG/JPG).`);
    let drawing, image = null;
    if (format === 'dxf') drawing = importText('dxf', decodeDXF(new Uint8Array(await file.arrayBuffer())), file.name);
    else if (format === 'svg') drawing = importText('svg', await file.text(), file.name);
    else {
      const url = URL.createObjectURL(file);
      try {
        image = await decodeImage(url, file.name);
      } finally {
        URL.revokeObjectURL(url);
      }
      if (!current()) return;
      // Imagen nueva: escala por defecto, umbral automático y sin invertir.
      drawing = traceWith(image, { mmPerPx: DEFAULT_MM_PER_PX, auto: true, invert: false });
    }
    if (!current()) return;
    S.sampleId = null;
    loadDrawing(drawing, null, image && { image, mmPerPx: DEFAULT_MM_PER_PX });
  } catch (e) {
    if (!current()) return;
    console.warn(e);
    ui.toast(`No se pudo abrir ${file.name}: ${e.message || e}`, { type: 'error' });
    // Un archivo no reconocido no llega a abrirse; uno ilegible sí reemplaza al plano anterior.
    if (format) failLoad(file.name, format, e.message || String(e));
  }
}

async function loadSample(id) {
  const s = SAMPLES.find((x) => x.id === id);
  if (!s) return;
  const token = ++loadToken;
  try {
    let drawing, image = null;
    const mmPerPx = s.suggested.mmPerPx || DEFAULT_MM_PER_PX;
    if (s.format === 'image') {
      image = await decodeImage(s.content, s.fileName);
      if (token !== loadToken) return;
      drawing = traceWith(image, { mmPerPx, auto: true, invert: false });
    } else drawing = importText(s.format, s.content, s.fileName);
    if (token !== loadToken) return;
    S.sampleId = id;
    loadDrawing(drawing, s.suggested, image && { image, mmPerPx });
  } catch (e) {
    if (token !== loadToken) return;
    console.warn(e);
    ui.toast(`No se pudo cargar el ejemplo: ${e.message || e}`, { type: 'error' });
    failLoad(s.fileName, s.format, e.message || String(e));
  }
}

/** Decodifica una imagen (URL o data URL) a { data: ImageData, fileName } sin tocar el estado. */
async function decodeImage(url, fileName) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(img, 0, 0);
  return { data: g.getImageData(0, 0, cv.width, cv.height), fileName };
}

/** Vectoriza una imagen decodificada con opciones explícitas (sin tocar el estado). */
function traceWith(image, { mmPerPx, auto, invert, threshold }) {
  const opts = { mmPerPx, fileName: image.fileName, invert };
  if (!auto) opts.threshold = threshold;
  return importImage(image.data, opts);
}

function traceStored(mmPerPx) {
  const auto = $('chkThresholdAuto').checked;
  const d = traceWith(S.image, { mmPerPx, auto, invert: $('chkInvert').checked, threshold: Number($('rngThreshold').value) });
  if (auto) showThreshold(d.threshold);
  return d;
}

function showThreshold(t) {
  if (t == null) return;
  ui.setRange($('rngThreshold'), t);
  $('thresholdValue').textContent = String(Math.round(t));
}

function setPxScale(v) {
  S.mmPerPx = v;
  fields.pxScale.set(v);
}

/** Archivo nuevo: descarta todo lo del plano anterior (perfil, op, imagen, modos 2D, pieza). */
function resetForNewFile() {
  Object.assign(S, { drawing: null, profile: null, op: null, image: null, selected: -1, frameLoops: null, profileError: null, loadError: null });
  S.hiddenLayers = new Set();
  S.openRegions = new Set();
  opProfile = null;
  $('selDrawingUnits').value = 'auto';
  $('chkIgnoreAux').checked = true;
  measure.clear();
  view2d.clearMeasures();
  setMode2d('select'); // anula ventana, eje o calibración pendientes y su pista
  ui.setRange($('rngSection'), 0);
  clearPart();
}

/** Carga fallida: estado vacío para el archivo nuevo (nada del plano anterior) con el error visible. */
function failLoad(name, format, msg) {
  resetForNewFile();
  S.loadError = msg;
  ui.setFile({ name, format: format === 'image' ? 'img' : format });
  ui.setPlanoLoaded(false);
  ui.setEmpty('2d', true);
  view2d.setDrawing({}, {});
  renderRegions(EMPTY_PROFILE, { regions: [] }, S.F);
  renderSlots({}, S.F);
  updateWarnings();
  api._emitProfile(true);
}

/** Plano nuevo: perfil, op por defecto (+ sugerencia), paneles y generación. img = { image, mmPerPx } en imágenes. */
function loadDrawing(drawing, suggested, img = null) {
  resetForNewFile();
  S.drawing = drawing;
  if (img) {
    // Imagen nueva: escala por defecto (o la del ejemplo), umbral automático y sin invertir.
    S.image = img.image;
    setPxScale(img.mmPerPx);
    $('chkThresholdAuto').checked = true;
    $('chkInvert').checked = false;
    showThreshold(drawing.threshold);
  }
  if (!computeProfile()) return failLoad(drawing.fileName || 'plano', drawing.format, S.profileError);
  let op = defaultOpState(S.profile);
  op.thickness = fields.thickness.get();
  if (suggested) {
    op = applySuggested(op, suggested);
    if (suggested.materialId) setMaterialId(suggested.materialId);
  }
  S.op = op;
  opProfile = S.profile;
  ui.setFile({ name: drawing.fileName || 'plano', format: drawing.format === 'image' ? 'img' : drawing.format });
  ui.setPlanoLoaded(true);
  ui.setEmpty('2d', false);
  if (!S.everBuilt) ui.setActiveTab('2d');
  syncOpControls();
  refresh2D(true);
  renderAllPanels();
  updateWarnings();
  api._emitProfile(true);
  scheduleBuild(true);
}

/** Plano nuevo: descarta la pieza anterior (datos, vista 3D, propiedades) e invalida su generación. */
function clearPart() {
  ++S.buildSeq;
  setBusy(false);
  Object.assign(S, { build: null, partData: null, appliedJob: null, builtProfile: null, builtOp: null, buildError: null, buildWarnings: [], dirty: true });
  S.inputVer++;
  viewer.clearModel();
  ui.setEmpty('3d', true);
  ui.setPropsVisible(false);
  $('propsSubtitle').textContent = 'Genera una pieza para ver sus datos';
  $('viewInfo').textContent = '';
  ui.setBuildInfo('');
  updateStale();
}

/** Perfil con las opciones del paso 1; false si falla. */
function computeProfile() {
  const d = S.drawing;
  const sel = $('selDrawingUnits').value;
  try {
    S.profile = prepareProfile(d, {
      unitOverride: d.format === 'image' ? S.mmPerPx : sel,
      ignoreDashed: $('chkIgnoreAux').checked,
      hiddenLayers: [...S.hiddenLayers],
      tol: fields.joinTol.get(),
      frameLoops: S.frameLoops ?? null,
    });
    S.profileError = null;
    return true;
  } catch (e) {
    S.profile = null;
    S.profileError = e.message || String(e);
    ui.toast(S.profileError, { type: 'error' });
    return false;
  }
}

/** Cambió una opción del paso 1: rehace el perfil conservando las elecciones de la operación. */
function reprocess(retrace = false) {
  if (!S.drawing) return;
  if (retrace && S.image) S.drawing = traceStored(S.mmPerPx);
  if (!computeProfile()) {
    // Sin perfil: error visible, nada que generar ni exportar; la op se conserva para reintentar.
    view2d.setDrawing({}, {});
    renderRegions(EMPTY_PROFILE, { regions: [] }, S.F);
    updateWarnings();
    scheduleBuild();
    return;
  }
  const old = S.op;
  S.op = old ? keepOpChoices(defaultOpState(S.profile), old, opProfile, S.profile) : defaultOpState(S.profile);
  opProfile = S.profile;
  S.selected = -1;
  syncOpControls();
  refresh2D(true);
  renderAllPanels();
  updateWarnings();
  api._emitProfile(false);
  scheduleBuild();
}

/**
 * Mismo plano con otro perfil: conserva modo, espesor, chaflanes, eje y ángulo, ventanas de multivista
 * (escaladas si cambió la unidad: nuevo toMM / anterior) y las opciones por región si los contornos
 * no cambiaron; si cambiaron, se restablecen con un aviso.
 */
function keepOpChoices(op, old, prev, p) {
  const k = prev ? p.toMM / prev.toMM : 1;
  Object.assign(op, { mode: old.mode, thickness: old.thickness, symmetric: old.symmetric, fillets: { ...old.fillets } });
  const rv = old.revolve;
  op.revolve = { ...rv, axis: { p: rv.axisKind === 'line' ? rv.axis.p.map((v) => v * k) : rv.axis.p.slice(), d: rv.axis.d.slice() } };
  const windows = {};
  for (const [role, w] of Object.entries(old.multiview.windows)) windows[role] = w && { ...w, minX: w.minX * k, minY: w.minY * k, maxX: w.maxX * k, maxY: w.maxY * k };
  op.multiview = { ...old.multiview, windows };
  if (prev && sameRegions(prev, p, k)) op.regions = structuredClone(old.regions);
  else if (old.regions.some(customized)) ui.toast('Las opciones por región se restablecieron porque cambiaron los contornos', { type: 'info' });
  return op;
}

// Región con opciones distintas de las por defecto.
const customized = (rs) => !rs.included || rs.height != null || rs.z0 != null || rs.holes.some((h) => h.op !== 'through' || h.depth != null);

// Misma estructura: igual número de regiones y agujeros y cajas de los contornos exteriores iguales (con tolerancia).
function sameRegions(a, b, k) {
  if (a.regions.length !== b.regions.length) return false;
  const eps = 2 * Math.max((a.tol ?? 0.01) * k, b.tol ?? 0.01) + 1e-9;
  return a.regions.every((r, i) => {
    const s = b.regions[i];
    if (r.holes.length !== s.holes.length) return false;
    const A = a.loopInfos[r.outer].bbox, B = b.loopInfos[s.outer].bbox;
    return ['minX', 'minY', 'maxX', 'maxY'].every((c) => Math.abs(A[c] * k - B[c]) <= eps);
  });
}

// ───────────── Vista 2D ─────────────
function refresh2D(full) {
  const d = S.drawing, p = S.profile;
  if (full) {
    const k = p.toMM;
    const m = [k, 0, 0, k, 0, 0];
    const segments = k === 1 ? d.segments : d.segments.map((s) => segTransform(s, m));
    const texts = k === 1 ? d.texts : (d.texts || []).map((t) => ({ ...t, p: [t.p[0] * k, t.p[1] * k], h: (t.h || 2.5) * k }));
    view2d.setDrawing({ segments, texts, layers: d.layers }, { loops: p.loops, loopInfos: p.loopInfos, open: p.open, regions: p.regions });
    for (const name of S.hiddenLayers) view2d.setLayerVisible(name, false);
    // Si la vista estaba oculta (pestaña 3D) el ajuste se repite al mostrarla.
    S.need2dFit = !$('view2d').clientWidth;
  }
  p.regions.forEach((_, i) => view2d.setRegionState(i, { included: S.op.regions[i].included, selected: i === S.selected }));
  view2d.showAxis(S.op.mode === 'revolve' ? revolveAxisLine(S.op.revolve) : null);
  view2d.showViewBoxes(S.op.mode === 'multiview' ? ROLES.filter((r) => S.op.multiview.windows[r]).map((role) => ({ role, box: S.op.multiview.windows[role] })) : []);
}

function revolveAxisLine(rv) {
  if (rv.axisKind === 'y') return { p: [0, 0], d: [0, 1] };
  if (rv.axisKind === 'line') return rv.axis;
  return { p: [0, 0], d: [1, 0] };
}

function renderAllPanels() {
  renderPlano(S.drawing, S.profile, { hiddenLayers: S.hiddenLayers, theme: ui.getTheme() });
  renderRegions(S.profile, S.op, S.F, { selected: S.selected, open: S.openRegions });
  renderSlots(S.op, S.F);
}

// ───────────── Operación ─────────────
function editOp(fn, { regions = false } = {}) {
  if (!S.op) return;
  fn(S.op);
  if (regions) renderRegions(S.profile, S.op, S.F, { selected: S.selected, open: S.openRegions });
  refresh2D(false);
  scheduleBuild();
}

function setThickness(v) {
  setThicknessUi(v);
  savePrefs();
  editOp((op) => (op.thickness = v));
}

function setAngle(v) {
  fields.angle.set(v);
  ui.setRange($('rngAngle'), Math.round(v));
  editOp((op) => (op.revolve = { ...op.revolve, angleDeg: v }));
}

function setRevolveAxis(axis) {
  if (!S.op) return;
  let rv;
  if (axis === 'x') rv = { axisKind: 'x', axis: { p: [0, 0], d: [1, 0] } };
  else if (axis === 'y') rv = { axisKind: 'y', axis: { p: [0, 0], d: [0, 1] } };
  else {
    const l = Math.hypot(axis.d[0], axis.d[1]) || 1;
    rv = { axisKind: 'line', axis: { p: axis.p.slice(), d: [axis.d[0] / l, axis.d[1] / l] } };
  }
  S.op.revolve = { ...S.op.revolve, ...rv };
  $('selAxis').value = rv.axisKind;
  $('axisReadout').textContent = axisText(S.op.revolve, S.F);
  editOp(() => {});
}

/** Hook: elegir el eje con un clic en una línea de la vista 2D. */
function pickAxis() {
  if (!S.profile) return;
  if (ui.getActiveTab() === '3d') ui.setActiveTab('2d');
  setMode2d('axis');
}

function setViewWindow(role, box) {
  if (!S.op || !ROLES.includes(role)) return;
  S.op.multiview = { ...S.op.multiview, windows: { ...S.op.multiview.windows, [role]: box ? { ...box } : null } };
  renderSlots(S.op, S.F);
  editOp(() => {});
}

/** Marco del plano: null = detección automática; [] = incluirlo en el modelo. */
function setFrameLoops(v) {
  S.frameLoops = v;
  reprocess();
}

function setImageScale(mmPerPx) {
  if (!(mmPerPx > 0)) return;
  setPxScale(mmPerPx);
  if (S.drawing?.format === 'image') reprocess();
}

function syncOpControls() {
  const op = S.op;
  ui.setSegmented($('opSeg'), op.mode);
  const b = $('opSeg').querySelector('[aria-pressed="true"]');
  $('stepOpSummary').textContent = b ? b.textContent.trim() : '';
  fields.thickness.set(op.thickness);
  setThicknessUi(op.thickness);
  $('chkSymmetric').checked = !!op.symmetric;
  fields.fv.set(op.fillets.vertical || 0);
  fields.ft.set(op.fillets.top || 0);
  fields.ct.set(op.fillets.chamferTop || 0);
  $('selAxis').value = op.revolve.axisKind;
  $('axisReadout').textContent = axisText(op.revolve, S.F);
  fields.angle.set(op.revolve.angleDeg ?? 360);
  ui.setRange($('rngAngle'), Math.round(op.revolve.angleDeg ?? 360));
}

function setThicknessUi(v) {
  $('selGauge').value = [...$('selGauge').options].some((o) => o.value && Number(o.value) === v) ? String(v) : '';
  for (const c of $('thicknessChips').querySelectorAll('[data-value]')) c.setAttribute('aria-pressed', String(Number(c.dataset.value) === v));
}

function initOperation() {
  ui.bindSegmented($('opSeg'), (mode) => {
    editOp((op) => (op.mode = mode));
    if (mode === 'multiview' && S.op && ROLES.filter((r) => S.op.multiview.windows[r]).length < 2) {
      ui.setHint('Multivista: defina al menos dos ventanas de vista en el plano', '2d');
    }
  });
  $('selGauge').addEventListener('change', (e) => {
    if (!e.target.value) return;
    fields.thickness.set(Number(e.target.value));
    setThickness(fields.thickness.get());
  });
  $('thicknessChips').addEventListener('click', (e) => {
    const c = e.target.closest('[data-value]');
    if (!c) return;
    fields.thickness.set(Number(c.dataset.value));
    setThickness(fields.thickness.get());
  });
  $('chkSymmetric').addEventListener('change', (e) => editOp((op) => (op.symmetric = e.target.checked)));
  $('rngAngle').addEventListener('input', (e) => setAngle(Number(e.target.value)));
  $('selAxis').addEventListener('change', (e) => {
    const v = e.target.value;
    if (v !== 'line') return setRevolveAxis(v);
    const a = S.profile?.axisLines?.[0];
    if (a) setRevolveAxis({ p: a.p0, d: [a.p1[0] - a.p0[0], a.p1[1] - a.p0[1]] });
    else pickAxis();
  });
  $('btnPickAxis').addEventListener('click', pickAxis);

  // Paso 1: unidades, tolerancia, trazos auxiliares, capas, imagen
  $('selDrawingUnits').addEventListener('change', () => reprocess());
  $('chkIgnoreAux').addEventListener('change', () => reprocess());
  $('layerList').addEventListener('change', (e) => {
    const t = e.target;
    if (!t.matches('[data-action="visible"]')) return;
    const name = t.closest('[data-layer]').dataset.layer;
    if (t.checked) S.hiddenLayers.delete(name);
    else S.hiddenLayers.add(name);
    reprocess();
  });
  $('rngThreshold').addEventListener('change', () => {
    $('chkThresholdAuto').checked = false;
    reprocess(true);
  });
  $('rngThreshold').addEventListener('input', (e) => ($('thresholdValue').textContent = e.target.value));
  $('chkThresholdAuto').addEventListener('change', () => reprocess(true));
  $('chkInvert').addEventListener('change', () => reprocess(true));

  // Regiones (eventos delegados)
  const list = $('regionList');
  const parse = (s) => {
    const v = Number(String(s).trim().replace(',', '.'));
    return String(s).trim() === '' || !Number.isFinite(v) ? null : v;
  };
  list.addEventListener('change', (e) => {
    const t = e.target;
    const li = t.closest('[data-region]');
    if (!li || !S.op) return;
    const i = Number(li.dataset.region);
    const rs = S.op.regions[i];
    if (t.matches('[data-action="include"]')) {
      rs.included = t.checked;
      editOp(() => {});
    } else if (t.dataset.field === 'height' || t.dataset.field === 'z0') {
      const v = parse(t.value);
      rs[t.dataset.field] = t.dataset.field === 'height' && v != null && v <= 0 ? null : v;
      editOp(() => {});
    } else if (t.closest('[data-hole]')) {
      const hs = rs.holes[Number(t.closest('[data-hole]').dataset.hole)];
      if (t.dataset.field === 'op') hs.op = t.value === 'fill' ? 'none' : t.value;
      if (t.dataset.field === 'depth') {
        const v = parse(t.value);
        hs.depth = v != null && v > 0 ? v : null;
      }
      editOp(() => {});
    }
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[data-region]');
    if (!li) return;
    const i = Number(li.dataset.region);
    if (e.target.closest('[data-action="toggle"]')) {
      if (li.classList.contains('is-open')) S.openRegions.add(i);
      else S.openRegions.delete(i);
    }
    if (!e.target.closest('input, select')) selectRegion(i);
  });

  // Ranuras de multivista, calibración y marco: modes-ui.js
  $('btnGenerate').addEventListener('click', () => runBuild());
  ui.onShortcut('Enter', () => runBuild(), { ctrl: true });
}

function selectRegion(i) {
  S.selected = i;
  for (const li of $('regionList').querySelectorAll('[data-region]')) li.classList.toggle('is-selected', Number(li.dataset.region) === i);
  if (S.profile) S.profile.regions.forEach((_, k) => view2d.setRegionState(k, { selected: k === i }));
}

// ───────────── Generación ─────────────
function scheduleBuild(now = false) {
  clearTimeout(autoTimer);
  // Toda edición que programa una generación deja la pieza mostrada desactualizada.
  S.inputVer++;
  S.dirty = true;
  updateStale();
  if (!S.profile) return;
  if (now) {
    runBuild();
    return;
  }
  if (!$('chkAutoUpdate').checked) return;
  // Multivista con menos de dos ventanas: se espera a que el usuario defina la segunda.
  if (S.op?.mode === 'multiview' && ROLES.filter((r) => S.op.multiview.windows[r]).length < 2) return;
  autoTimer = setTimeout(() => runBuild(), AUTO_MS);
}

function setBusy(on) {
  S.building = on;
  const b = $('btnGenerate');
  b.setAttribute('aria-busy', String(on));
  b.classList.toggle('is-busy', on);
  updateStale();
}

async function runBuild() {
  clearTimeout(autoTimer);
  if (!S.profile || !S.op) return;
  if (!S.kernelReady) {
    ui.setBuildInfo('Esperando al motor CAD…');
    return;
  }
  let job;
  const op = structuredClone(S.op);
  const profile = S.profile;
  const ver = S.inputVer;
  try {
    job = makeJob(profile, op, { meshQuality: 'normal' });
  } catch (e) {
    // Invalida cualquier generación en curso: ya no corresponde a las entradas.
    ++S.buildSeq;
    inflight = null;
    setBusy(false);
    S.buildError = e.message;
    S.errorVer = ver;
    updateWarnings();
    ui.toast(e.message, { type: 'warn' });
    return;
  }
  const seq = ++S.buildSeq;
  job.buildId = seq;
  setBusy(true);
  const t0 = performance.now();
  const promise = buildAndApply(job, seq, ver, profile, op, t0);
  inflight = { ver, promise };
  return promise;
}

async function buildAndApply(job, seq, ver, profile, op, t0) {
  try {
    const r = await kernel.build(job);
    if (seq !== S.buildSeq) return;
    S.build = r;
    S.appliedJob = job;
    S.dirty = ver !== S.inputVer;
    S.builtProfile = profile;
    S.builtOp = op;
    S.buildError = null;
    S.buildWarnings = r.warnings || [];
    viewer.setModel(r, appearance());
    ui.setEmpty('3d', false);
    if (!S.everBuilt) {
      S.everBuilt = true;
      if (ui.getActiveTab() === '2d') ui.setActiveTab('3d');
      viewer.setView('iso');
    }
    recomputeProps();
    const tm = r.timings || {};
    const f = (x) => Math.round(x || 0);
    ui.setBuildInfo(`Generado en ${f(performance.now() - t0)} ms · B-rep ${f(tm.buildMs)} · malla ${f(tm.meshMs)} · props ${f(tm.propsMs)} ms · ${kernel.mode === 'worker' ? 'worker' : 'hilo principal'}`);
  } catch (e) {
    if (seq !== S.buildSeq) return;
    S.buildError = e.message || String(e);
    S.errorVer = ver;
    ui.toast(`Error al generar la pieza: ${S.buildError}`, { type: 'error' });
  } finally {
    if (seq === S.buildSeq) {
      inflight = null;
      setBusy(false);
      updateWarnings();
    }
  }
}

// Aviso en la cabecera de propiedades cuando la pieza mostrada no corresponde a las entradas.
function updateStale() {
  const el = $('propsStale');
  let text = '', state = '';
  if (S.building) [text, state] = ['Actualizando…', 'busy'];
  else if (S.dirty && S.buildError && S.errorVer === S.inputVer) [text, state] = [`No se pudo generar: ${S.buildError}`, 'error'];
  else if (S.dirty && !S.profile && S.profileError) [text, state] = [`Perfil no válido: ${S.profileError}`, 'error'];
  else if (S.dirty && S.profile) {
    const mvShort = S.op?.mode === 'multiview' && ROLES.filter((r) => S.op.multiview.windows[r]).length < 2;
    [text, state] = [mvShort ? 'Multivista: defina al menos dos vistas y pulsa Generar' : 'Cambios sin aplicar — pulsa Generar', 'dirty'];
  }
  el.hidden = !text;
  el.textContent = text;
  el.dataset.state = state;
  $('propsBody').classList.toggle('is-stale', !!text);
}

/**
 * Antes de exportar: confirma el campo en edición (los atajos Ctrl ignoran el foco) y genera
 * la pieza si hay cambios pendientes. Devuelve null si la pieza aplicada corresponde a las
 * entradas actuales o, si no, el motivo (texto) para rechazar la exportación.
 */
async function prepareExport() {
  const a = document.activeElement;
  if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) a.blur();
  if (S.dirty || S.building) {
    if (inflight && inflight.ver === S.inputVer) await inflight.promise;
    else await runBuild();
  }
  if (!S.dirty) return null;
  if (!S.kernelReady) return 'el motor CAD aún no está listo';
  if (!S.profile) return S.profileError ? `el plano no tiene un perfil válido (${S.profileError})` : 'el plano no tiene un perfil válido';
  return (S.errorVer === S.inputVer && S.buildError) || 'hay cambios sin generar';
}

// Llamada al motor sobre la pieza aplicada: si el motor tiene otra forma (STALE_SHAPE), la
// regenera en silencio con el mismo trabajo (mismo buildId) y reintenta una vez.
async function withAppliedShape(fn) {
  const job = S.appliedJob;
  if (!job) throw new Error('No hay pieza generada.');
  try {
    return await fn(job.buildId);
  } catch (e) {
    if (e?.code !== 'STALE_SHAPE' || S.appliedJob !== job) throw e;
    const r = await kernel.build(job);
    // Los ids de topología (hash de OCCT) cambian al regenerar; el orden de recorrido no.
    const map = new Map();
    for (const [k, key] of [['face', 'faces'], ['edge', 'edges'], ['vertex', 'vertices']]) {
      (S.build?.topology?.[key] || []).forEach((x, i) => {
        const n = r.topology[key][i];
        if (n) map.set(`${k}:${x.id}`, n.id);
      });
    }
    idRemap = { job, map };
    return fn(job.buildId);
  }
}

// Entidad de la pieza mostrada → id en el motor (tras una regeneración silenciosa).
let idRemap = null; // { job, map: Map('face:id' → id) }
const engineRef = (e) => (e && e.id != null && idRemap?.job === S.appliedJob ? { ...e, id: idRemap.map.get(`${e.kind}:${e.id}`) ?? e.id } : e);

/** Motor ligado a la pieza aplicada (exportaciones y mediciones 3D): nunca usa otra forma. */
function ensureKernelShape() {
  return {
    get mode() { return kernel.mode; },
    distance: (a, b) => withAppliedShape((id) => kernel.distance(engineRef(a), engineRef(b), id)),
    exportShape: (o = {}) => withAppliedShape((id) => kernel.exportShape({ ...o, buildId: id })),
    tessellate: (o = {}) => withAppliedShape((id) => kernel.tessellate({ ...o, buildId: id })),
  };
}

function updateWarnings() {
  const list = [];
  if (S.loadError) list.push({ text: `No se pudo abrir el plano: ${S.loadError}`, level: 'error' });
  if (S.profileError) list.push({ text: S.profileError, level: 'error' });
  if (S.buildError) list.push({ text: S.buildError, level: 'error' });
  for (const w of S.drawing?.warnings || []) list.push({ text: w, level: 'info' });
  for (const w of S.profile?.warnings || []) list.push({ text: w });
  for (const w of S.op?.warnings || []) list.push({ text: w });
  for (const w of S.buildError ? [] : S.buildWarnings) list.push({ text: w });
  ui.setWarnings(list);
  updateStale();
}

// ───────────── Vistas, unidades, tema ─────────────
function setMode2d(mode) {
  ui.setPressed($('toolbar2d'), 'mode2d', mode);
  view2d.setMode(mode);
  ui.setHint(HINTS_2D[mode] || '', '2d');
}

function updateSectionRange() {
  if (!S.partData) return;
  const ax = ui.getSegmented($('sectionAxisSeg')) || 'x';
  const half = S.partData.bbox.size['xyz'.indexOf(ax)] / 2;
  const r = $('rngSection');
  r.min = String(-half);
  r.max = String(half);
  r.step = String(Math.max(half / 500, 1e-4));
  const off = Math.max(-half, Math.min(half, Number(r.value) || 0));
  ui.setRange(r, off);
  $('sectionValue').textContent = sectionLabel(ax, off);
  viewer.setSection({ axis: ax, offset: off });
}

// El deslizador trabaja relativo al centro de la caja; se muestra la coordenada absoluta del corte.
function sectionLabel(ax, off) {
  const i = 'xyz'.indexOf(ax);
  const bb = S.partData?.bbox;
  const c = bb ? (bb.min[i] + bb.max[i]) / 2 : 0;
  return `${ax.toUpperCase()} = ${S.F.len(c + off)}`;
}

function setUnits(v) {
  S.F = makeFormatter(v === 'in' ? 'imperial' : 'metric');
  view2d.setFormat(S.F.len);
  viewer.setFormat(S.F);
  measure.setFormat(S.F);
  savePrefs();
  if (S.profile) {
    renderRegions(S.profile, S.op, S.F, { selected: S.selected, open: S.openRegions });
    renderSlots(S.op, S.F);
    $('axisReadout').textContent = axisText(S.op.revolve, S.F);
  }
  if (S.build) recomputeProps();
  api._emitUnits();
}

function initViews() {
  ui.bindSegmented($('unitsSeg'), setUnits);
  ui.onTheme((name) => {
    viewer.setTheme(name);
    view2d.setTheme(name);
    if (S.drawing && S.profile) renderPlano(S.drawing, S.profile, { hiddenLayers: S.hiddenLayers, theme: name });
  });
  ui.onTab(() => requestAnimationFrame(() => {
    view2d.resize();
    viewer.resize();
    // Reencuadre si el plano se cargó oculto o si cambió el ancho del panel (2D ↔ dividido).
    const w = $('view2d').clientWidth;
    if (w && (S.need2dFit || w !== S.last2dWidth)) {
      S.need2dFit = false;
      view2d.fit();
    }
    if (w) S.last2dWidth = w;
    const w3 = $('view3d').clientWidth;
    if (w3 && S.build && S.last3dWidth && w3 !== S.last3dWidth) viewer.fit();
    if (w3) S.last3dWidth = w3;
  }));

  // 2D
  ui.bindPressGroup($('toolbar2d'), { attr: 'mode2d', mode: 'single' }, (m) => setMode2d(m));
  $('btn2dFit').addEventListener('click', () => view2d.fit());
  $('btn2dClearDims').addEventListener('click', () => view2d.clearMeasures());
  view2d.on('regionClick', (e) => {
    if (view2d.mode !== 'select' || !S.op) return;
    if (e.regionIndex < 0) return selectRegion(-1);
    const rs = S.op.regions[e.regionIndex];
    rs.included = !rs.included;
    S.selected = e.regionIndex;
    editOp(() => {}, { regions: true });
  });
  view2d.on('axisPick', (e) => {
    setRevolveAxis({ p: e.p, d: e.d });
    setMode2d('select');
  });
  view2d.on('cursor', (c) => {
    if (!c) return ui.setCoords('');
    const p = c.snap ? c.snap.p : [c.x, c.y];
    ui.setCoords(`X ${S.F.len(p[0])}  Y ${S.F.len(p[1])}`);
  });

  // 3D
  $('viewBar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    if (b.dataset.view === 'fit') viewer.fit({ animate: true });
    else viewer.setView(b.dataset.view, { animate: true });
  });
  ui.onProjection((m) => viewer.setProjection(m));
  ui.bindPressGroup($('displayBar'), { attr: 'display', mode: 'multi' }, (k, on) => viewer.setDisplay({ [k]: on }));
  ui.bindPressGroup($('toolPalette'), { attr: 'tool', mode: 'optional' }, (t) => {
    measure.setTool(t || 'none');
    if (!t) ui.setHint('', '3d');
  });
  $('btnClearMeasures').addEventListener('click', () => measure.clear());
  viewer.on('cursor', (c) => {
    if (c.point) ui.setCoords(S.F.point(c.point));
  });
  $('chkSection').addEventListener('change', (e) => {
    viewer.setSection({ enabled: e.target.checked });
    updateSectionRange();
  });
  ui.bindSegmented($('sectionAxisSeg'), () => {
    ui.setRange($('rngSection'), 0);
    updateSectionRange();
  });
  $('rngSection').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    $('sectionValue').textContent = sectionLabel(ui.getSegmented($('sectionAxisSeg')) || 'x', v);
    viewer.setSection({ offset: v });
  });
  $('btnSectionFlip').addEventListener('click', () => viewer.setSection({ flip: !viewer.getSection().flip }));
  viewer.setSection({ enabled: $('chkSection').checked, axis: ui.getSegmented($('sectionAxisSeg')) || 'x', offset: 0 });
}
