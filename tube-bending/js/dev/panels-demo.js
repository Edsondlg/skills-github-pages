// Banco de pruebas de los paneles de resultados: corre la tubería sobre una muestra y monta los
// paneles disponibles con acciones funcionales. window.demo expone ayudantes para --eval.
import { importStepTube } from '../tube-extract.js';
import { lraFromTube } from '../geometry.js';
import { planProcess } from '../process.js';
import { analyzeBends, makeFieldSampler } from '../mechanics.js';
import { MATERIALS, getMaterial } from '../materials.js';
import { MACHINES } from '../machines.js';
import { SAMPLES as SAMPLE_DEFS, loadSampleText } from '../samples.js';
import { computeCost } from '../cost.js';
import { h } from '../ui/format.js';

// Paneles a montar: ?panels=fld,seccion (por omisión todos). Un import faltante es un error de consola.
const ALL_PANELS = ['herramental', 'analisis', 'fld', 'seccion', 'costos'];
const PANEL_IDS = (new URLSearchParams(location.search).get('panels') || ALL_PANELS.join(',')).split(',').filter(Boolean);
const SAMPLES = SAMPLE_DEFS.map((x) => x.id);
const DEFAULT_MAT = Object.fromEntries(SAMPLE_DEFS.map((x) => [x.id, x.materialId]));

const state = {
  sample: 'escape_5_dobleces', materialId: 'aisi409', options: {}, costInputs: {}, selection: { bend: 1, s: null },
  front: 'A', machineId: 'auto', materialOverrides: {}, file: null /* { name, text } de loadFile */, importError: null,
};
let ctx = null;
const mounted = [];
const textCache = new Map();

const actions = {
  selectBend(i) { state.selection = { ...state.selection, bend: i }; refresh(); },
  selectSection(s) { state.selection = { ...state.selection, s }; refresh(); },
  setCostInput(key, value) {
    const ci = { ...state.costInputs };
    if (value == null || value === '') delete ci[key]; else ci[key] = value;
    state.costInputs = ci;
    ctx = { ...ctx, costInputs: ci, cost: computeCost({ tube: ctx.tube, plan: ctx.plan, material: ctx.material, machine: ctx.plan.machine, analysis: ctx.analysis, inputs: ci }) };
    refresh(false);
  },
  setOption(key, value) {
    const o = { ...state.options };
    if (value == null) delete o[key]; else o[key] = value;
    state.options = o;
    return run();
  },
  seek() {},
  async loadFile(file) {
    state.file = { name: file.name, text: await file.text() };
    state.front = 'A'; state.selection = { bend: 0, s: null };
    return run();
  },
  loadSample(id) { return demo.selectSample(id); },
  setFront(f) { state.front = f === 'B' ? 'B' : 'A'; state.selection = { bend: 0, s: null }; return run(); },
  setMaterial(id) { return demo.selectMaterial(id); },
  setMaterialOverride(key, value) {
    const o = { ...state.materialOverrides };
    if (value == null) delete o[key]; else o[key] = value;
    state.materialOverrides = o;
    return run();
  },
  setMachine(id) { state.machineId = id || 'auto'; return run(); },
};

async function loadText(name) {
  if (!textCache.has(name)) textCache.set(name, await loadSampleText(SAMPLE_DEFS.find((x) => x.id === name)));
  return textCache.get(name);
}

async function run() {
  const fileName = state.file ? state.file.name : `${state.sample}.stp`;
  let tube;
  try {
    tube = importStepTube(state.file ? state.file.text : await loadText(state.sample), { fileName });
    state.importError = null;
  } catch (e) {
    // Archivo inválido: se conserva la pieza anterior y se muestra el error.
    state.importError = `No se pudo leer «${fileName}»: ${e.message}`;
    state.file = null;
    if (ctx) { ctx = { ...ctx, importError: state.importError }; refresh(); }
    return;
  }
  if (state.file) state.sample = null;
  const lra = lraFromTube(tube, { front: state.front });
  const material = { ...getMaterial(state.materialId), ...state.materialOverrides };
  const options = state.options;
  const planOptions = state.machineId === 'auto' ? options : { ...options, machineId: state.machineId };
  const plan = planProcess({ tube, lra, material, options: planOptions });
  const analysis = analyzeBends({ tube, lra, plan, material, options });
  const sampler = makeFieldSampler({ tube, lra, plan, analysis, material, options });
  const cost = computeCost({ tube, plan, material, machine: plan.machine, analysis, inputs: state.costInputs });
  if (state.selection.bend != null && state.selection.bend >= plan.bends.length) state.selection = { bend: 0, s: null };
  ctx = {
    tube, lra, plan, analysis, sampler, cost, material, machine: plan.machine, options, costInputs: state.costInputs,
    sim: { t: 0, state: null }, selection: state.selection,
    fileName, importError: state.importError, samples: SAMPLE_DEFS, currentSampleId: state.sample,
    materials: MATERIALS, machines: MACHINES, materialId: state.materialId, materialOverrides: state.materialOverrides,
    machineId: state.machineId, interference: [], actions,
  };
  refresh();
}

function refresh() {
  ctx = { ...ctx, selection: state.selection };
  for (const p of mounted) p.api.update(ctx);
}

async function init() {
  const sSel = document.getElementById('demo-sample');
  const mSel = document.getElementById('demo-material');
  for (const s of SAMPLES) sSel.append(h('option', { value: s }, s));
  for (const m of MATERIALS) mSel.append(h('option', { value: m.id }, m.name));
  sSel.value = state.sample; mSel.value = state.materialId;
  sSel.onchange = () => demo.selectSample(sSel.value);
  mSel.onchange = () => demo.selectMaterial(mSel.value);
  document.getElementById('demo-theme').onclick = () => demo.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  await run();
  const grid = document.getElementById('demo-grid');
  for (const pid of PANEL_IDS) {
    const mod = await import(`../ui/panels/${pid}.js`);
    const host = h('div', { class: 'demo-host' });
    grid.append(h('section', { class: 'demo-col', id: `col-${pid}` }, h('h2', null, mod.title), host));
    mounted.push({ id: pid, api: mod.mount(host, ctx) });
  }
}

const demo = {
  get ctx() { return ctx; },
  async selectSample(name, materialId) {
    state.sample = name; state.materialId = materialId ?? DEFAULT_MAT[name] ?? state.materialId;
    state.selection = { bend: 0, s: null }; state.file = null; state.front = 'A'; state.materialOverrides = {};
    document.getElementById('demo-sample').value = name;
    document.getElementById('demo-material').value = state.materialId;
    await run();
  },
  async selectMaterial(id) {
    state.materialId = id; state.materialOverrides = {};
    document.getElementById('demo-material').value = id;
    await run();
  },
  selectBend(i) { actions.selectBend(i); },
  setS(s) { actions.selectSection(s); },
  setTheme(t) { document.documentElement.dataset.theme = t; },
  ready: null,
};
window.demo = demo;
demo.ready = init();
