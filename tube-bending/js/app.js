// Aplicación: estado + recálculo de la tubería (STEP → pieza → LRA → proceso → análisis → costo →
// cinemática), bucle de animación (poses al visor, HUD, etiquetas, paneles a ≤ 4 Hz), barra superior,
// pestañas laterales con montaje diferido, línea de tiempo y controles del visor.
import { importStepTube } from './tube-extract.js';
import { lraFromTube } from './geometry.js';
import { planProcess } from './process.js';
import { analyzeBends, makeFieldSampler } from './mechanics.js';
import { MATERIALS } from './materials.js';
import { MACHINES } from './machines.js';
import { computeCost } from './cost.js';
import { buildKinematics } from './kinematics.js';
import { createViewer } from './scene/viewer.js';
import { buildStations } from './scene/tube-mesh.js';
import { SAMPLES, loadSampleText } from './samples.js';
import { h, svg, pill } from './ui/format.js';
import { createTimeline } from './ui/timeline.js';
import { createViewportOverlay, GROUPS } from './ui/viewport-overlay.js';
import { setOrDelete, resolveMaterial, splitOptions, parkTime, remapTime, nearestStation, bendLabels } from './ui/app-state.js';
import * as pPieza from './ui/panels/pieza.js';
import * as pProceso from './ui/panels/proceso.js';
import * as pHerramental from './ui/panels/herramental.js';
import * as pAnalisis from './ui/panels/analisis.js';
import * as pFld from './ui/panels/fld.js';
import * as pSeccion from './ui/panels/seccion.js';
import * as pCostos from './ui/panels/costos.js';

const TABS = [
  ['pieza', 'Pieza', pPieza], ['proceso', 'Proceso', pProceso], ['herramental', 'Herramental', pHerramental],
  ['analisis', 'Análisis', pAnalisis], ['fld', 'FLD', pFld], ['seccion', 'Sección', pSeccion], ['costos', 'Costos', pCostos],
];
const INITIAL_SAMPLE = 'escape_5_dobleces';
const PARK_BEND = 1;               // al cargar una pieza: a la mitad del doblado del doblez 2
const PANEL_SIM_MS = 250;          // paneles ≤ 4 Hz durante la reproducción
const LABEL_MS = 100;              // etiquetas ≤ 10 Hz
const $ = (id) => document.getElementById(id);

// ── estado ───────────────────────────────────────────────────────────────────────────────────
const state = {
  text: null, fileName: null, currentSampleId: null, importError: null,
  front: 'A', materialId: null, materialOverrides: {}, machineId: 'auto', options: {}, costInputs: {},
  selection: { bend: PARK_BEND, s: null },
  t: 0, playing: false, speed: 1,
  colorMode: 'realistic', camera: 'iso', cutaway: false,
  visibility: Object.fromEntries(GROUPS.map(([k]) => [k, true])),
  tab: 'pieza', busy: 0,
};
/** Resultado del último recálculo exitoso. */
let D = null;
let ctx = null;
let viewer = null;
let simState = null;
const mounted = new Map();       // tab id → { api, host }

// ── recálculo ────────────────────────────────────────────────────────────────────────────────
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
let runId = 0;

/**
 * Corre la tubería completa para un estado candidato. Solo se confirma si todo sale bien; un error
 * se muestra en ctx.importError sin perder la pieza anterior. `park`: reubicar t al doblez de inicio.
 */
async function recompute(patch = {}, { park = false } = {}) {
  const id = ++runId;
  const next = { ...state, ...patch };
  setBusy(+1, 0.05);
  try {
    await nextFrame();
    if (id !== runId) return false;
    let tube = D?.tube;
    if (!D || next.text !== D.text) tube = importStepTube(next.text, { fileName: next.fileName });
    setProgress(0.25); await nextFrame(); if (id !== runId) return false;

    const lra = lraFromTube(tube, { front: next.front });
    const material = resolveMaterial(next.materialId, next.materialOverrides);
    if (!material) throw new Error(`Material "${next.materialId}" no encontrado`);
    const { processOptions, mechanicsOptions } = splitOptions(next.options, next.machineId);
    const machine = next.machineId === 'auto' ? undefined : MACHINES.find((m) => m.id === next.machineId);
    const plan = planProcess({ tube, lra, material, machine, options: processOptions });
    setProgress(0.45); await nextFrame(); if (id !== runId) return false;

    const analysis = analyzeBends({ tube, lra, plan, material, options: mechanicsOptions });
    const sampler = makeFieldSampler({ tube, lra, plan, analysis, material, options: mechanicsOptions });
    const cost = computeCost({ tube, plan, material, machine: plan.machine, analysis, inputs: next.costInputs });
    const kin = buildKinematics({ lra, plan, OD: tube.OD });
    setProgress(0.65); await nextFrame(); if (id !== runId) return false;

    const stations = buildStations(plan, tube.OD);
    const N = stations.length;
    const midIdx = plan.layout.bends.map((b) => nearestStation(stations, (b.s0 + b.s1) / 2));
    let interference = [];
    if (viewer) {
      viewer.setup({ OD: tube.OD, plan, material });
      buildTubeMesh(tube, stations, sampler, next.options);
      interference = kin.interference(viewer.getMachineVolumes(), tube.OD);
    }
    const phases = plan.sequence.phases;
    const total = kin.duration;
    const t = park ? parkTime(phases, PARK_BEND) : remapTime(D?.plan.sequence.phases, state.t, phases, total);

    Object.assign(state, patch, { importError: null, t });
    if (park) state.selection = { bend: Math.min(PARK_BEND, plan.bends.length - 1), s: null };
    else if (state.selection.bend != null && state.selection.bend >= plan.bends.length) state.selection = { bend: 0, s: null };
    D = { text: next.text, tube, lra, plan, analysis, sampler, cost, material, kin, stations, midIdx, interference,
      poses: new Float32Array(16 * N), formed: new Float32Array(N), total };
    if (viewer) viewer.setSectionMarker(state.selection.s);
    timeline.setSequence(phases, total);
    renderTop();
    refreshPanels();
    if (tabBtns.has(state.tab)) ensureMounted(state.tab);
    frameDirty = labelsDirty = true;
    return true;
  } catch (err) {
    console.warn('Recalculo:', err);
    if (id === runId) { state.importError = err?.message || String(err); renderTop(); refreshPanels(); }
    return false;
  } finally {
    setBusy(-1, 1);
  }
}

function buildTubeMesh(tube, stations, sampler, options) {
  const rOut0 = tube.OD / 2;
  viewer.buildTube({
    s: stations, ringSegments: 48, seamAngle: options.seamAngle ?? null,
    sampleVertex: (s, phi) => {
      const f = sampler.at(s, phi); // el muestreador reutiliza su objeto: se copian los campos
      return { rOut0, rIn0: rOut0 - f.t0, dOut: f.dOut, dIn: f.dIn,
        fields: { t: f.t, thinningPct: f.thinningPct, e1: f.e1, e2: f.e2, zone: f.zone } };
    },
  });
}

/** Solo costo: no hace falta rehacer la tubería. */
function recomputeCost() {
  if (!D) return;
  D = { ...D, cost: computeCost({ tube: D.tube, plan: D.plan, material: D.material, machine: D.plan.machine, analysis: D.analysis, inputs: state.costInputs }) };
  refreshPanels();
}

// ── acciones (contrato de paneles) ───────────────────────────────────────────────────────────
const actions = {
  selectBend(i) { state.selection = { ...state.selection, bend: i }; refreshPanels(); },
  selectSection(s) {
    state.selection = { ...state.selection, s };
    viewer?.setSectionMarker(s);
    refreshPanels();
  },
  setCostInput(k, v) { state.costInputs = setOrDelete(state.costInputs, k, v); recomputeCost(); },
  setOption(k, v) { return recompute({ options: setOrDelete(state.options, k, v) }); },
  seek(t) { seek(t); },
  async loadFile(file) {
    if (!file) return false;
    let text;
    try { text = await file.text(); } catch (err) { return fail(`No se pudo leer el archivo ${file.name}: ${err.message}`); }
    // Un archivo nuevo: se conserva el material; el espesor manual era de la pieza anterior.
    return recompute({ text, fileName: file.name, currentSampleId: null, options: setOrDelete(state.options, 'wall', null) }, { park: true });
  },
  async loadSample(id) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return fail(`Muestra "${id}" no encontrada`);
    let text;
    try { text = await loadSampleText(sample); } catch (err) { return fail(err.message); }
    return recompute({
      text, fileName: sample.file, currentSampleId: sample.id,
      materialId: sample.materialId ?? state.materialId, materialOverrides: sample.materialId && sample.materialId !== state.materialId ? {} : state.materialOverrides,
      options: setOrDelete(state.options, 'wall', null),
    }, { park: true });
  },
  setFront(f) { return recompute({ front: f === 'B' ? 'B' : 'A' }); },
  setMaterial(id) { return recompute({ materialId: id, materialOverrides: {} }); },
  setMaterialOverride(k, v) { return recompute({ materialOverrides: setOrDelete(state.materialOverrides, k, v) }); },
  setMachine(id) { return recompute({ machineId: id || 'auto' }); },
};

function fail(msg) {
  state.importError = msg;
  renderTop(); refreshPanels();
  return false;
}

// ── contexto y paneles ───────────────────────────────────────────────────────────────────────
function buildCtx() {
  return {
    tube: D?.tube ?? null, lra: D?.lra ?? null, plan: D?.plan ?? null, analysis: D?.analysis ?? null,
    sampler: D?.sampler ?? null, cost: D?.cost ?? null, material: D?.material ?? null, machine: D?.plan.machine ?? null,
    options: state.options, costInputs: state.costInputs,
    sim: { t: state.t, state: simState },
    selection: state.selection, fileName: state.fileName, importError: state.importError,
    samples: SAMPLES, currentSampleId: state.currentSampleId, materials: MATERIALS, machines: MACHINES,
    materialId: state.materialId, materialOverrides: state.materialOverrides, machineId: state.machineId,
    interference: D?.interference ?? [], actions,
  };
}

let lastPanelSim = 0;
function refreshPanels() {
  ctx = buildCtx();
  lastPanelSim = performance.now();
  if (!D) return;
  for (const [tid, m] of mounted) {
    try { m.api.update(ctx); } catch (err) { console.error(`Panel ${tid}:`, err); }
  }
}

const tabBtns = new Map();
function buildTabs() {
  const list = $('app-tabs'), host = $('app-panels');
  for (const [tid, label] of TABS) {
    const btn = h('button', {
      type: 'button', role: 'tab', class: 'app-tab', id: `tab-${tid}`, dataset: { tab: tid },
      'aria-selected': 'false', 'aria-controls': `panel-${tid}`, tabindex: '-1', onclick: () => setTab(tid),
    }, label);
    tabBtns.set(tid, btn);
    list.append(btn);
    host.append(h('section', { class: 'app-panel', id: `panel-${tid}`, role: 'tabpanel', 'aria-labelledby': `tab-${tid}`, hidden: true }));
  }
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); e.stopPropagation();
    const i = TABS.findIndex(([tid]) => tid === state.tab);
    const j = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[j][0]); tabBtns.get(TABS[j][0]).focus();
  });
}

function setTab(tid) {
  if (!tabBtns.has(tid)) return;
  state.tab = tid;
  for (const [k, btn] of tabBtns) {
    const on = k === tid;
    btn.setAttribute('aria-selected', String(on)); btn.tabIndex = on ? 0 : -1; btn.classList.toggle('is-on', on);
    $(`panel-${k}`).hidden = !on;
  }
  tabBtns.get(tid).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  ensureMounted(tid);
}

function ensureMounted(tid) {
  if (mounted.has(tid) || !D) return;
  const mod = TABS.find(([k]) => k === tid)[2];
  const host = $(`panel-${tid}`);
  const body = h('div', { class: 'app-panel-body' });
  host.append(body);
  try {
    mounted.set(tid, { api: mod.mount(body, ctx ?? buildCtx()) });
  } catch (err) {
    console.error(`Panel ${tid}:`, err);
    body.append(h('p', { class: 'pnl-note pnl-note-warn' }, `No se pudo mostrar el panel: ${err.message}`));
  }
}

// ── barra superior ───────────────────────────────────────────────────────────────────────────
const STATUS_TEXT = { ok: 'Análisis: OK', warning: 'Análisis: advertencias', fail: 'Análisis: falla' };
function renderTop() {
  $('app-part-name').textContent = D?.tube?.name || 'Sin pieza';
  $('app-file-name').textContent = state.fileName || 'Abrir STEP';
  const flags = $('app-flags');
  flags.textContent = '';
  if (state.importError) {
    flags.append(h('span', { class: 'app-flag app-flag-fail', role: 'alert', title: state.importError },
      h('span', { class: 'app-flag-text' }, state.importError),
      h('button', { type: 'button', class: 'app-flag-x', 'aria-label': 'Descartar mensaje', onclick: () => { state.importError = null; renderTop(); refreshPanels(); } }, '×')));
  }
  const hits = D?.interference ?? [];
  if (hits.length) {
    const first = hits[0];
    const detail = hits.map((x) => `${x.bend >= 0 ? `Doblez ${x.bend + 1}` : 'General'}: ${x.volume}`).join('\n');
    flags.append(h('button', {
      type: 'button', class: 'app-flag app-flag-warn', title: `Interferencia del tubo con la máquina:\n${detail}\nClic: ir al primer choque`,
      onclick: () => { if (Number.isFinite(first.t)) seek(first.t); },
    }, `Interferencia (${hits.length})`));
  }
  const st = D?.analysis?.summary?.status;
  if (st) flags.append(pill(st, STATUS_TEXT[st] ?? st));
}

let busyCount = 0;
function setBusy(delta, p) {
  busyCount = Math.max(0, busyCount + delta);
  const bar = $('app-progress');
  bar.classList.toggle('is-on', busyCount > 0);
  bar.setAttribute('aria-hidden', String(busyCount === 0));
  document.getElementById('app-main').setAttribute('aria-busy', String(busyCount > 0));
  setProgress(busyCount > 0 ? p : 1);
}
function setProgress(p) { $('app-progress').firstElementChild.style.transform = `scaleX(${p})`; }

const THEMES = [
  ['system', 'Tema del sistema', 'M2 3h12v8H2zM6 14h4M8 11v3'],
  ['light', 'Tema claro', 'M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3'],
  ['dark', 'Tema oscuro', 'M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z'],
];
function buildTheme() {
  let saved = 'system';
  try { saved = localStorage.getItem('tb-theme') || 'system'; } catch { /* almacenamiento no disponible */ }
  const group = $('app-theme');
  const btns = THEMES.map(([k, label, d]) => h('button', {
    type: 'button', class: 'app-theme-btn', dataset: { theme: k }, title: label, 'aria-label': label, 'aria-pressed': 'false',
    onclick: () => apply(k),
  }, svg('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }, svg('path', { d }))));
  group.append(...btns);
  function apply(k) {
    if (k === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = k;
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.theme === k));
    try { localStorage.setItem('tb-theme', k); } catch { /* sin persistencia */ }
  }
  apply(THEMES.some(([k]) => k === saved) ? saved : 'system');
}

// ── tiempo y bucle de animación ──────────────────────────────────────────────────────────────
let frameDirty = true, labelsDirty = true, lastLabels = 0, lastTs = 0;
function seek(t) {
  if (!D) return;
  state.t = Math.min(Math.max(0, t), D.total);
  frameDirty = labelsDirty = true;
  panelsDirty = true;
}
function setPlaying(on) {
  if (!D) return;
  if (on && state.t >= D.total - 1e-6) state.t = 0;
  state.playing = on;
  frameDirty = true; panelsDirty = true;
}
let panelsDirty = false;

function tick(ts) {
  const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
  lastTs = ts;
  if (D) {
    if (state.playing) {
      state.t += dt * state.speed;
      if (state.t >= D.total) { state.t = D.total; state.playing = false; panelsDirty = true; }
      frameDirty = true;
    }
    if (frameDirty) {
      frameDirty = false;
      simState = D.kin.stateAt(state.t);
      D.kin.posesAt(state.t, D.stations, D.poses, D.formed);
      viewer?.setFrame({ poses: D.poses, formed: D.formed, tools: simState });
      overlay.setHud(simState, { nBends: D.plan.bends.length, t: state.t, total: D.total });
      timeline.setTime(state.t, state.playing);
      if (labelsDirty || ts - lastLabels >= LABEL_MS) {
        lastLabels = ts; labelsDirty = false;
        viewer?.setLabels(bendLabels(D.midIdx, D.poses, D.formed, D.lra.bends));
      }
    }
    if (panelsDirty && (!state.playing || ts - lastPanelSim >= PANEL_SIM_MS)) {
      panelsDirty = false;
      refreshPanels();
    } else if (state.playing) panelsDirty = true;
  }
  requestAnimationFrame(tick);
}

function onKey(e) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = e.target;
  if (tg instanceof HTMLElement && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(tg.tagName) || tg.getAttribute('role') === 'tab' || tg.getAttribute('role') === 'slider')) {
    // en controles: Espacio/flechas conservan su comportamiento nativo (excepto en la barra de tiempo)
    if (!(tg.getAttribute('role') === 'slider' && tg.classList.contains('tl-track'))) return;
  }
  if (e.key === ' ' || e.code === 'Space') { setPlaying(!state.playing); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { timeline.next(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft') { timeline.prev(); e.preventDefault(); }
}

// ── visor y controles ────────────────────────────────────────────────────────────────────────
const timeline = createTimeline($('app-timeline'), {
  onSeek: (t) => seek(t),
  onPlay: (on) => setPlaying(on),
  onSpeed: (x) => { state.speed = x; timeline.setSpeed(x); },
  onBend: (i) => actions.selectBend(i),
});

const overlay = createViewportOverlay($('app-stage'), {
  visibility: state.visibility,
  onColorMode: (m) => setColorMode(m),
  onCamera: (c) => { state.camera = c; viewer?.setCamera(c); overlay.setCamera(c); },
  onCutaway: (on) => { state.cutaway = on; viewer?.setCutaway(on); overlay.setCutaway(on); },
  onVisible: (g, on) => { state.visibility = { ...state.visibility, [g]: on }; viewer?.setVisible(g, on); },
});

function setColorMode(m) {
  state.colorMode = m;
  viewer?.setColorMode(m);
  overlay.setColorMode(m, viewer?.getLegend(m) ?? null);
}

function setupDrop() {
  const stage = $('app-stage');
  let depth = 0;
  const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');
  stage.addEventListener('dragenter', (e) => { if (!hasFiles(e)) return; depth++; overlay.setDrop(true); e.preventDefault(); });
  stage.addEventListener('dragover', (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  stage.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) overlay.setDrop(false); });
  stage.addEventListener('drop', (e) => {
    e.preventDefault(); depth = 0; overlay.setDrop(false);
    const file = [...(e.dataTransfer?.files ?? [])][0];
    if (!file) return;
    if (!/\.(stp|step)$/i.test(file.name)) { fail(`"${file.name}" no es un archivo STEP (.stp, .step)`); return; }
    actions.loadFile(file);
  });
  // fuera del visor: evitar que el navegador abra el archivo soltado
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());
}

function setupFileChip() {
  const input = $('app-file-input');
  $('app-file-chip').addEventListener('click', () => input.click());
  input.addEventListener('change', () => { const f = input.files?.[0]; input.value = ''; if (f) actions.loadFile(f); });
}

async function initViewer() {
  const el = $('app-canvas');
  try {
    viewer = await createViewer(el, { quality: matchMedia('(pointer: coarse)').matches ? 'medium' : 'high' });
  } catch (err) {
    console.warn('Visor 3D no disponible:', err);
    overlay.setNotice(`No se pudo iniciar el visor 3D (${err.message}). Los paneles siguen disponibles.`);
    return;
  }
  for (const [g, on] of Object.entries(state.visibility)) viewer.setVisible(g, on);
  viewer.setCutaway(state.cutaway);
  viewer.setCamera(state.camera);
  viewer.onPick(({ s }) => {
    if (!Number.isFinite(s)) return;
    actions.selectSection(s);
    setTab('seccion');
  });
  new ResizeObserver(() => viewer.resize()).observe(el);
}

// ── arranque ─────────────────────────────────────────────────────────────────────────────────
async function init() {
  buildTheme();
  buildTabs();
  setupDrop();
  setupFileChip();
  renderTop();
  overlay.setCamera(state.camera);
  overlay.setCutaway(state.cutaway);
  document.addEventListener('keydown', onKey);
  await initViewer();
  setColorMode(state.colorMode);
  requestAnimationFrame(tick);
  await actions.loadSample(INITIAL_SAMPLE);
  setColorMode(state.colorMode); // la leyenda depende de la pieza cargada
  setTab(state.tab);
}

// Ayudantes para pruebas (--eval) y depuración.
window.app = {
  get state() { return state; },
  get ctx() { return ctx ?? buildCtx(); },
  get data() { return D; },
  get viewer() { return viewer; },
  timeline, actions, setTab, setColorMode, seek, setPlaying,
  ready: null,
};
window.app.ready = init();
