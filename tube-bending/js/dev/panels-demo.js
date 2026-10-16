// Banco de pruebas de los paneles de resultados: corre la tubería sobre una muestra y monta los
// paneles disponibles con acciones funcionales. window.demo expone ayudantes para --eval.
import { importStepTube } from '../tube-extract.js';
import { lraFromTube } from '../geometry.js';
import { planProcess } from '../process.js';
import { analyzeBends, makeFieldSampler } from '../mechanics.js';
import { MATERIALS, getMaterial } from '../materials.js';
import { computeCost } from '../cost.js';
import { h } from '../ui/format.js';

// Agregar aquí 'analisis', 'fld', 'seccion', 'costos' cuando existan sus módulos (un import faltante es un error de consola).
const PANEL_IDS = ['herramental'];
const SAMPLES = ['escape_5_dobleces', 'travesano_calibre_variable', 'soporte_3d_hsla', 'horquilla_180', 'doblez_compuesto'];
const DEFAULT_MAT = { escape_5_dobleces: 'aisi409', travesano_calibre_variable: 'hsla420', soporte_3d_hsla: 'hsla420', horquilla_180: 'sae1010-cew', doblez_compuesto: 'sae1020-dom' };

const state = { sample: 'escape_5_dobleces', materialId: 'aisi409', options: {}, costInputs: {}, selection: { bend: 1, s: null } };
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
  setOption(key, value) { state.options = { ...state.options, [key]: value }; return run(); },
  seek() {},
};

async function loadText(name) {
  if (!textCache.has(name)) textCache.set(name, await (await fetch(`samples/${name}.stp`)).text());
  return textCache.get(name);
}

async function run() {
  const text = await loadText(state.sample);
  const tube = importStepTube(text, { fileName: `${state.sample}.stp` });
  const lra = lraFromTube(tube, { front: 'A' });
  const material = getMaterial(state.materialId);
  const options = state.options;
  const plan = planProcess({ tube, lra, material, options });
  const analysis = analyzeBends({ tube, lra, plan, material, options });
  const sampler = makeFieldSampler({ tube, lra, plan, analysis, material, options });
  const cost = computeCost({ tube, plan, material, machine: plan.machine, analysis, inputs: state.costInputs });
  if (state.selection.bend != null && state.selection.bend >= plan.bends.length) state.selection = { bend: 0, s: null };
  ctx = { tube, lra, plan, analysis, sampler, cost, material, machine: plan.machine, options, costInputs: state.costInputs, sim: { t: 0, state: null }, selection: state.selection, actions };
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
    state.selection = { bend: 0, s: null };
    document.getElementById('demo-sample').value = name;
    document.getElementById('demo-material').value = state.materialId;
    await run();
  },
  async selectMaterial(id) { state.materialId = id; document.getElementById('demo-material').value = id; await run(); },
  selectBend(i) { actions.selectBend(i); },
  setS(s) { actions.selectSection(s); },
  setTheme(t) { document.documentElement.dataset.theme = t; },
  ready: null,
};
window.demo = demo;
demo.ready = init();
