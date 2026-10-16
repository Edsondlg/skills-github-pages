// Panel "Proceso": material (con propiedades editables), máquina con barras de capacidad,
// opciones del proceso, compensación de springback por doblez, secuencia con la fase actual,
// interferencias y advertencias / supuestos del plan.
import { LIMITS } from '../../mechanics.js';
import { h, setChildren, fmt, fmtMm, fmtKN, fmtKNm, fmtTime, statusIcon, pill } from '../format.js';

export const id = 'proceso';
export const title = 'Proceso';

// Propiedades editables (se envían como materialOverrides).
const EDIT_PROPS = [
  { key: 'ys', label: 'σy, cedencia', unit: 'MPa', d: 0, min: 1 },
  { key: 'uts', label: 'σu, resistencia', unit: 'MPa', d: 0, min: 1 },
  { key: 'n', label: 'n, endurecimiento', unit: '', d: 3, min: 0.001, max: 1 },
  { key: 'K', label: 'K, coef. de resistencia', unit: 'MPa', d: 0, min: 1 },
  { key: 'pricePerKg', label: 'Precio', unit: 'USD/kg', d: 2, min: 0 },
];
const VOLUME_LABEL = {
  bendDie: 'Dado de doblez', clampDie: 'Mordaza', pressureDie: 'Dado de presión', wiper: 'Limpiador',
  mandrel: 'Mandril', collet: 'Boquilla', carriage: 'Carro', machine: 'Máquina', floor: 'Piso', head: 'Cabezal',
};

function readNumber(input, { min = -Infinity, max = Infinity } = {}) {
  const raw = input.value.trim();
  if (raw === '') return null;
  const v = Number(raw.replace(',', '.'));
  if (!Number.isFinite(v) || v < min || v > max) return undefined;
  return v;
}
function syncValue(input, v) {
  if (document.activeElement === input) return;
  const s = v == null ? '' : String(v);
  if (input.value !== s) input.value = s;
  input.removeAttribute('aria-invalid');
}
/** Campo numérico que envía v (o null si queda vacío) en 'change'; inválido → marca y no envía. */
function numInput(id, attrs, limits, send) {
  const el = h('input', { type: 'number', id, class: 'pp-input', inputmode: 'decimal', ...attrs });
  el.addEventListener('change', () => {
    const v = readNumber(el, limits);
    if (v === undefined) { el.setAttribute('aria-invalid', 'true'); return; }
    el.removeAttribute('aria-invalid');
    send(v);
  });
  return el;
}
const round = (v, d) => (v == null || !Number.isFinite(v) ? null : Number(v.toFixed(d)));

function capBar(label, value, cap, fmtV) {
  const ok = value != null && Number.isFinite(value) && cap > 0;
  const used = ok ? value / cap : 0;
  const status = !ok ? 'none' : used > 1 ? 'fail' : used >= LIMITS.warnFraction ? 'warning' : 'ok';
  const span = ok ? Math.max(cap * 1.15, value * 1.05) : 1;
  return h('div', { class: `pp-bar pp-bar-${status}` },
    h('div', { class: 'pp-bar-head' },
      h('span', { class: 'pp-bar-label' }, label),
      h('span', { class: 'pp-bar-val' }, `${fmtV(value)} / ${fmtV(cap)}`),
      h('span', { class: 'pp-bar-pct' }, ok ? `${fmt(used * 100, 0)} %` : '—')),
    h('div', { class: 'pp-bar-track', title: `Capacidad ${fmtV(cap)}` },
      h('div', { class: 'pp-bar-fill', style: { width: `${ok ? Math.min(100, (value / span) * 100).toFixed(1) : 0}%` } }),
      ok ? h('div', { class: 'pp-bar-cap', style: { left: `${((cap / span) * 100).toFixed(1)}%` } }) : null));
}

function currentPhase(ctx) {
  const st = ctx.sim?.state;
  if (st && Number.isInteger(st.phaseIndex)) return st.phaseIndex;
  const t = ctx.sim?.t;
  const phases = ctx.plan?.sequence?.phases ?? [];
  if (t == null || !phases.length) return -1;
  for (let i = phases.length - 1; i >= 0; i--) if (t >= phases[i].start) return i;
  return -1;
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-proceso');
  let cur = ctx;
  const act = (name, ...a) => cur.actions?.[name]?.(...a);

  // ── Material ──────────────────────────────────────────────────────────────────────────────
  const matSel = h('select', { id: 'proceso-material', class: 'pp-select' });
  matSel.addEventListener('change', () => act('setMaterial', matSel.value));
  const propInputs = {};
  const propBase = {};
  const propRows = EDIT_PROPS.map((p) => {
    const inp = numInput(`proceso-mat-${p.key}`, { step: 'any', min: String(p.min), max: p.max != null ? String(p.max) : null }, p,
      (v) => act('setMaterialOverride', p.key, v));
    propInputs[p.key] = inp;
    propBase[p.key] = h('td', { class: 'num pnl-muted' });
    return h('tr', { dataset: { key: p.key } },
      h('th', { scope: 'row' }, h('label', { for: inp.id }, p.label), p.unit ? h('span', { class: 'pp-unit-inline' }, ` ${p.unit}`) : null),
      h('td', { class: 'pp-td-input' }, inp),
      propBase[p.key]);
  });
  const resetBtn = h('button', { type: 'button', id: 'proceso-mat-reset', class: 'pp-btn' }, 'Restablecer');
  resetBtn.addEventListener('click', () => { for (const k of Object.keys(cur.materialOverrides ?? {})) act('setMaterialOverride', k, null); });
  const matRO = h('dl', { class: 'pnl-kv' });
  const matNotes = h('p', { class: 'pnl-note' });
  const matCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Material'), h('span', { class: 'pnl-card-sub' }, 'valores típicos, editables')),
    h('div', { class: 'pp-field' }, h('label', { for: 'proceso-material', class: 'pp-sr' }, 'Material'), matSel),
    h('div', { class: 'pnl-scroll' },
      h('table', { class: 'pnl-table pp-table pp-props' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Propiedad'), h('th', { scope: 'col', class: 'num' }, 'Valor'), h('th', { scope: 'col', class: 'num' }, 'Típico'))),
        h('tbody', null, propRows))),
    h('div', { class: 'pp-row-end' }, resetBtn),
    matRO, matNotes);

  // ── Máquina ───────────────────────────────────────────────────────────────────────────────
  const machSel = h('select', { id: 'proceso-machine', class: 'pp-select' });
  machSel.addEventListener('change', () => act('setMachine', machSel.value));
  const machInfo = h('p', { class: 'pnl-note' });
  const barsEl = h('div', { class: 'pp-bars' });
  const machCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Máquina')),
    h('div', { class: 'pp-field' }, h('label', { for: 'proceso-machine', class: 'pp-sr' }, 'Máquina'), machSel),
    machInfo, barsEl);

  // ── Opciones ──────────────────────────────────────────────────────────────────────────────
  const boostMode = h('select', { id: 'proceso-boost-mode', class: 'pp-select pp-select-sm' },
    h('option', { value: 'auto' }, 'Automático'), h('option', { value: 'manual' }, 'Manual'));
  const boostPct = numInput('proceso-boost', { step: '1', min: '0', max: '200', placeholder: '%' }, { min: 0, max: 200 },
    (v) => act('setOption', 'boost', v ?? 'auto'));
  boostMode.addEventListener('change', () => {
    if (boostMode.value === 'auto') { boostPct.disabled = true; act('setOption', 'boost', 'auto'); return; }
    boostPct.disabled = false;
    const v = readNumber(boostPct, { min: 0, max: 200 });
    const fallback = round(cur.plan?.bends?.[0]?.boostPct, 0) ?? 0;
    if (v == null) boostPct.value = String(fallback);
    act('setOption', 'boost', v ?? fallback);
  });
  const clearance = numInput('proceso-mandrel-clearance', { step: '0.01', min: '0', max: '5', placeholder: 'auto' }, { min: 0, max: 5 },
    (v) => act('setOption', 'mandrelClearance', v));
  const sbFactor = numInput('proceso-springback-factor', { step: '0.05', min: '0', max: '3', placeholder: '1' }, { min: 0, max: 3 },
    (v) => act('setOption', 'springbackFactor', v));
  const lube = h('select', { id: 'proceso-lubrication', class: 'pp-select pp-select-sm' },
    h('option', { value: 'buena' }, 'Buena'), h('option', { value: 'normal' }, 'Normal'), h('option', { value: 'pobre' }, 'Pobre'));
  lube.addEventListener('change', () => act('setOption', 'lubrication', lube.value === 'normal' ? null : lube.value));
  const ovLim = numInput('proceso-ovality-limit', { step: '0.5', min: '0.5', max: '30', placeholder: String(LIMITS.ovalityLimitPct) }, { min: 0.5, max: 30 },
    (v) => act('setOption', 'ovalityLimitPct', v));
  const field = (forId, label, unit, ...ctrl) => h('div', { class: 'pp-field' },
    h('label', { for: forId }, label, unit ? h('span', { class: 'pnl-muted' }, ` ${unit}`) : null), h('div', { class: 'pp-ctrl' }, ctrl));
  const optCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Opciones del proceso'), h('span', { class: 'pnl-card-sub' }, 'vacío = valor por omisión')),
    h('div', { class: 'pp-form' },
      field('proceso-boost-mode', 'Empuje (boost)', '%', boostMode, boostPct),
      field('proceso-mandrel-clearance', 'Holgura del mandril', 'mm diam.', clearance),
      field('proceso-springback-factor', 'Factor de springback', '× modelo', sbFactor),
      field('proceso-lubrication', 'Lubricación', '', lube),
      field('proceso-ovality-limit', 'Límite de ovalidad', '%', ovLim)));

  // ── Springback por doblez ─────────────────────────────────────────────────────────────────
  const sbBody = h('tbody');
  const sbCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Compensación por doblez'), h('span', { class: 'pnl-card-sub' }, 'clic para seleccionar')),
    h('div', { class: 'pnl-scroll' },
      h('table', { class: 'pnl-table pp-table' },
        h('thead', null, h('tr', null, [
          ['n.º'], ['A final', '°'], ['A carga', '°'], ['Springback', '°'], ['CLR recup.', 'mm'], ['Avance', 'mm'], ['Comp.', 'mm'], ['Velocidad', '°/s'], ['Boost', '%'], ['Mordaza'],
        ].map(([t, u], i) => h('th', { scope: 'col', class: i === 0 || i === 9 ? null : 'num' }, t, u ? h('span', { class: 'pp-unit' }, u) : null)))),
        sbBody)));

  // ── Secuencia ─────────────────────────────────────────────────────────────────────────────
  const seqBody = h('tbody');
  const seqScroll = h('div', { class: 'pnl-scroll pp-seq-scroll' },
    h('table', { class: 'pnl-table pp-table pp-seq' },
      h('thead', null, h('tr', null,
        h('th', { scope: 'col' }, 'Fase'), h('th', { scope: 'col', class: 'num' }, 'Doblez'),
        h('th', { scope: 'col', class: 'num' }, 'Inicio', h('span', { class: 'pp-unit' }, 's')),
        h('th', { scope: 'col', class: 'num' }, 'Duración', h('span', { class: 'pp-unit' }, 's')))),
      seqBody));
  const cycleEl = h('span', { class: 'pp-cycle', id: 'proceso-cycle' });
  const seqCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Secuencia'), cycleEl),
    seqScroll,
    h('p', { class: 'pnl-note' }, 'Clic en una fase para llevar la simulación a su inicio.'));

  // ── Interferencias y mensajes ─────────────────────────────────────────────────────────────
  const interfEl = h('section', { class: 'pnl-card' });
  const msgsEl = h('section', { class: 'pnl-card' });

  el.append(matCard, machCard, optCard, sbCard, seqCard, interfEl, msgsEl);

  // ── Render ────────────────────────────────────────────────────────────────────────────────
  function renderMaterialSelect() {
    if (document.activeElement === matSel) return false;
    const fams = new Map();
    for (const m of cur.materials ?? []) { if (!fams.has(m.family)) fams.set(m.family, []); fams.get(m.family).push(m); }
    setChildren(matSel, [...fams].map(([fam, list]) => h('optgroup', { label: fam }, list.map((m) => h('option', { value: m.id }, m.name)))));
    return true;
  }
  function renderMachineSelect() {
    if (document.activeElement === machSel) return false;
    setChildren(machSel, h('option', { value: 'auto' }, 'Automática'),
      (cur.machines ?? []).map((m) => h('option', { value: m.id }, `${m.name} · DE ≤ ${fmt(m.maxOD, 1)} mm`)));
    return true;
  }

  function renderMaterial() {
    const m = cur.material;
    const ov = cur.materialOverrides ?? {};
    const base = (cur.materials ?? []).find((x) => x.id === (cur.materialId ?? m?.id));
    if (document.activeElement !== matSel && (cur.materialId ?? m?.id)) matSel.value = cur.materialId ?? m.id;
    for (const p of EDIT_PROPS) {
      const inp = propInputs[p.key];
      syncValue(inp, round(m?.[p.key], p.d + 1));
      const over = ov[p.key] != null;
      inp.classList.toggle('is-over', over);
      inp.closest('tr').classList.toggle('is-over', over);
      inp.title = over ? 'Valor editado' : '';
      propBase[p.key].textContent = fmt(base?.[p.key], p.d);
    }
    resetBtn.disabled = !Object.keys(ov).length;
    if (!m) { setChildren(matRO); matNotes.textContent = ''; return; }
    setChildren(matRO,
      h('dt', null, 'Familia'), h('dd', null, m.family ?? '—'),
      h('dt', null, 'Módulo E'), h('dd', null, m.E != null ? `${fmt(m.E / 1000, 0)} GPa` : '—'),
      h('dt', null, 'Densidad'), h('dd', null, m.density != null ? `${fmt(m.density, 0)} kg/m³` : '—'),
      h('dt', null, 'Alargamiento'), h('dd', null, m.elongation != null ? `${fmt(m.elongation, 0)} %` : '—'),
      h('dt', null, 'Anisotropía r'), h('dd', null, fmt(m.r, 2)),
      h('dt', null, 'FLC0'), h('dd', null, m.flc0 != null ? fmt(m.flc0, 3) : 'Keeler (según n y t)'),
      h('dt', null, 'Factor de cordón'), h('dd', null, fmt(m.weldFactor, 2)));
    matNotes.textContent = m.notes ?? '';
  }

  function renderMachine() {
    const { plan, analysis, tube } = cur;
    const mach = plan?.machine ?? cur.machine;
    if (document.activeElement !== machSel) machSel.value = cur.machineId ?? 'auto';
    machInfo.textContent = !mach ? 'Sin plan de proceso.'
      : (cur.machineId ?? 'auto') === 'auto' ? `Selección automática: ${mach.name} (la clase más pequeña que cumple).` : `Máquina fija: ${mach.name}.`;
    if (!mach || !plan) { setChildren(barsEl); return; }
    const maxOf = (k) => (analysis?.bends ?? []).reduce((a, b) => Math.max(a, b[k] ?? 0), 0);
    const maxClr = Math.max(0, ...(cur.lra?.bends ?? []).map((b) => b.clr));
    const int = (v) => (v == null || !Number.isFinite(v) ? '—' : fmt(v, 0));
    setChildren(barsEl,
      capBar('Diámetro exterior', tube?.OD, mach.maxOD, (v) => fmtMm(v, 1)),
      capBar('CLR máximo', maxClr, mach.maxCLR, (v) => fmtMm(v, 0)),
      capBar('Par máximo', analysis?.summary?.maxTorque, mach.maxTorque, (v) => fmtKNm(v, 2)),
      capBar('Mordaza', maxOf('clampForce'), mach.maxClampForce, (v) => fmtKN(v, 1)),
      capBar('Dado de presión', maxOf('pressureDieForce'), mach.maxPressureDieForce, (v) => fmtKN(v, 1)),
      capBar('Empuje (boost)', maxOf('boostForce'), mach.maxBoostForce, (v) => fmtKN(v, 1)),
      capBar('Niveles de dados', plan.stacks?.length, mach.stackLevels, int),
      capBar('Longitud de tubo', plan.layout?.cutLength, mach.maxTubeLength, (v) => fmtMm(v, 0)));
  }

  function renderOptions() {
    const o = cur.options ?? {};
    const manual = o.boost != null && o.boost !== 'auto';
    if (document.activeElement !== boostMode) boostMode.value = manual ? 'manual' : 'auto';
    boostPct.disabled = !manual;
    syncValue(boostPct, manual ? o.boost : null);
    if (!manual && document.activeElement !== boostPct) boostPct.placeholder = 'auto';
    syncValue(clearance, o.mandrelClearance ?? null);
    syncValue(sbFactor, o.springbackFactor ?? null);
    if (document.activeElement !== lube) lube.value = o.lubrication ?? 'normal';
    syncValue(ovLim, o.ovalityLimitPct ?? null);
  }

  let sbRows = [];
  function renderSpringback() {
    const bends = cur.plan?.bends ?? [];
    sbRows = bends.map((b, i) => h('tr', {
      class: 'pp-click', tabindex: '0', 'aria-label': `Doblez ${i + 1}`,
      onclick: () => act('selectBend', i),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act('selectBend', i); } },
    },
      h('th', { scope: 'row', class: 'pp-n' }, String(i + 1)),
      h('td', { class: 'num' }, fmt(b.angle, 2)), h('td', { class: 'num' }, fmt(b.angleLoad, 2)),
      h('td', { class: 'num' }, fmt(b.springback, 2)), h('td', { class: 'num' }, fmt(b.clrAfter, 1)),
      h('td', { class: 'num', title: 'Recta de material avanzada antes del doblez (compensada por recuperación elástica)' }, fmt(b.feedLength, 1)),
      h('td', { class: 'num', title: 'Acortamiento del avance para conservar los puntos de intersección del CAD' }, b.feedCompensation ? `−${fmt(b.feedCompensation, 2)}` : '0'),
      h('td', { class: 'num' }, fmt(b.bendSpeed, 0)), h('td', { class: 'num' }, fmt(b.boostPct, 0)),
      h('td', null, b.clampOK ? pill('ok', 'OK') : h('span', { title: 'La recta frente al doblez es más corta que la mordaza' }, pill('warning', 'Corta')))));
    setChildren(sbBody, sbRows.length ? sbRows : h('tr', null, h('td', { colspan: '10', class: 'pnl-empty' }, 'Sin dobleces.')));
    lastSel = undefined;
  }

  let seqRows = [];
  function renderSequence() {
    const seq = cur.plan?.sequence;
    const phases = seq?.phases ?? [];
    seqRows = phases.map((p) => h('tr', {
      class: `pp-click pp-ph-${p.type}`, tabindex: '0',
      onclick: () => act('seek', p.start),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act('seek', p.start); } },
    },
      h('td', { class: 'pp-ph-label' }, p.label),
      h('td', { class: 'num' }, p.bend >= 0 ? String(p.bend + 1) : '—'),
      h('td', { class: 'num' }, fmt(p.start, 2)), h('td', { class: 'num' }, fmt(p.duration, 2))));
    setChildren(seqBody, seqRows.length ? seqRows : h('tr', null, h('td', { colspan: '4', class: 'pnl-empty' }, 'Sin secuencia.')));
    cycleEl.textContent = seq ? `Ciclo ${fmtTime(seq.totalTime)}` : '';
    lastPhase = undefined;
  }

  function renderInterference() {
    const list = cur.interference ?? [];
    const phases = cur.plan?.sequence?.phases ?? [];
    setChildren(interfEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Interferencias'),
        list.length ? pill('fail', `${list.length}`) : pill('ok', 'Sin interferencias')),
      list.length
        ? h('div', { class: 'pnl-scroll' }, h('table', { class: 'pnl-table pp-table' },
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Fase'), h('th', { scope: 'col', class: 'num' }, 'Doblez'), h('th', { scope: 'col' }, 'Volumen'), h('th', { scope: 'col', class: 'num' }, 's', h('span', { class: 'pp-unit' }, 'mm')))),
          h('tbody', null, list.map((x) => {
            const ph = phases[x.phaseIndex];
            const t = x.t ?? ph?.start;
            return h('tr', { class: 'pp-click pp-row-fail', tabindex: '0', onclick: () => { if (t != null) act('seek', t); } },
              h('td', null, ph ? ph.label : `Fase ${x.phaseIndex + 1}`),
              h('td', { class: 'num' }, x.bend >= 0 ? String(x.bend + 1) : '—'),
              h('td', null, VOLUME_LABEL[x.volume] ?? String(x.volume)),
              h('td', { class: 'num' }, fmt(x.s, 0)));
          }))))
        : h('p', { class: 'pnl-empty' }, 'Sin interferencias entre el tubo y el herramental / máquina en la secuencia.'));
  }

  function renderMessages() {
    const w = cur.plan?.warnings ?? [], a = cur.plan?.assumptions ?? [];
    setChildren(msgsEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Advertencias y supuestos')),
      h('h4', { class: 'pnl-subhead' }, `Advertencias (${w.length})`),
      w.length ? h('ul', { class: 'pp-msgs' }, w.map((s) => h('li', null, statusIcon('warning'), h('span', null, s))))
        : h('p', { class: 'pnl-empty' }, 'El plan no tiene advertencias.'),
      h('h4', { class: 'pnl-subhead' }, `Supuestos (${a.length})`),
      a.length ? h('ul', { class: 'pp-msgs' }, a.map((s) => h('li', null, statusIcon('info'), h('span', null, s)))) : h('p', { class: 'pnl-empty' }, '—'));
  }

  let lastMats = null, lastMachs = null, lastMatKey = null, lastPlanKey = null, lastOpts, lastInterf, lastSel, lastPhase;
  const changed = (a, b) => !a || a.some((v, i) => v !== b[i]);
  function update(ctx2) {
    cur = ctx2;
    if (ctx2.materials !== lastMats && renderMaterialSelect()) lastMats = ctx2.materials;
    if (ctx2.machines !== lastMachs && renderMachineSelect()) lastMachs = ctx2.machines;
    const mk = [ctx2.material, ctx2.materialOverrides, ctx2.materialId, lastMats];
    if (changed(lastMatKey, mk)) { lastMatKey = mk; renderMaterial(); }
    const pk = [ctx2.plan, ctx2.analysis, ctx2.tube, ctx2.machineId, lastMachs];
    if (changed(lastPlanKey, pk)) {
      lastPlanKey = pk;
      renderMachine(); renderSpringback(); renderSequence(); renderMessages();
      lastInterf = undefined;
    }
    if (ctx2.options !== lastOpts) { lastOpts = ctx2.options; renderOptions(); }
    if (ctx2.interference !== lastInterf) { lastInterf = ctx2.interference; renderInterference(); }

    const sel = ctx2.selection?.bend ?? null;
    if (sel !== lastSel) { sbRows.forEach((r, i) => r.classList.toggle('is-sel', i === sel)); lastSel = sel; }
    const ph = currentPhase(ctx2);
    if (ph !== lastPhase) {
      seqRows.forEach((r, i) => { r.classList.toggle('is-cur', i === ph); if (i === ph) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current'); });
      lastPhase = ph;
      const row = seqRows[ph];
      if (row) {
        // Desplaza solo el contenedor de la tabla (no la página) para mantener visible la fase actual.
        const top = row.offsetTop, bottom = top + row.offsetHeight;
        if (top < seqScroll.scrollTop + 24 || bottom > seqScroll.scrollTop + seqScroll.clientHeight) seqScroll.scrollTop = Math.max(0, top - 24);
      }
    }
  }
  update(ctx);
  return { update, dispose() { el.textContent = ''; el.classList.remove('pnl', 'pnl-proceso'); } };
}
