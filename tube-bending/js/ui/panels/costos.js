// Panel "Costos": KPI de costo por pieza, desglose apilado por concepto, captura de supuestos
// (moneda, volumen, lote, tarifas…), tabla por pieza / lote / anual, costo del herramental y supuestos.
// El panel no recalcula: cada cambio válido va por actions.setCostInput(key, value | null).
import { h, setChildren, fmt, fmtMm, fmtPct, fmtMoney, fmtTime } from '../format.js';

export const id = 'costos';
export const title = 'Costos';

// Valores por omisión de computeCost (js/cost.js); solo se usan como placeholder y para el volumen anual.
const DEFAULTS = { currency: 'USD', fxMXN: 18.0, annualVolume: 10000, batchSize: 500, setupHours: 1.5, scrapPct: 2, overheadPct: 15, marginPct: 0, handlingTime: 8 };

// Conceptos del desglose, en orden de la barra apilada.
const CONCEPTS = [
  ['material', 'Material'],
  ['machine', 'Máquina'],
  ['tooling', 'Herramental'],
  ['setup', 'Preparación'],
  ['scrap', 'Scrap'],
  ['consumables', 'Consumibles'],
  ['overhead', 'Indirectos'],
  ['margin', 'Margen'],
];

// Campos numéricos: [clave, etiqueta, unidad, regla]. Reglas: pos (> 0), int (entero ≥ 1), nonneg (≥ 0), pct (0 ≤ x < 100).
const FIELDS = [
  ['fxMXN', 'Tipo de cambio', 'MXN/USD', 'pos'],
  ['annualVolume', 'Volumen anual', 'piezas/año', 'int'],
  ['batchSize', 'Tamaño de lote', 'piezas', 'int'],
  ['setupHours', 'Horas de preparación', 'h/lote', 'nonneg'],
  ['scrapPct', 'Scrap', '%', 'pct'],
  ['overheadPct', 'Indirectos', '% del directo', 'nonneg'],
  ['marginPct', 'Margen', '%', 'nonneg'],
  ['machineRate', 'Tarifa de máquina', 'USD/h', 'pos'],
  ['materialPrice', 'Precio de material', 'USD/kg', 'pos'],
  ['toolLifeParts', 'Vida del herramental', 'piezas', 'int'],
  ['handlingTime', 'Tiempo de manejo', 's/pieza', 'nonneg'],
];
const RULE_MSG = {
  pos: 'Debe ser un número mayor que 0.',
  int: 'Debe ser un número entero mayor o igual a 1.',
  nonneg: 'Debe ser un número mayor o igual a 0.',
  pct: 'Debe estar entre 0 y 100 (sin incluir 100).',
};

/** Valida un número capturado; devuelve { value } o { error } (mensaje en español). */
function validate(rule, n) {
  if (!Number.isFinite(n)) return { error: 'Escriba un número válido.' };
  const ok = rule === 'pos' ? n > 0
    : rule === 'int' ? Number.isInteger(n) && n >= 1
      : rule === 'nonneg' ? n >= 0
        : n >= 0 && n < 100;
  return ok ? { value: n } : { error: RULE_MSG[rule] };
}

const TOOLS = [
  ['bendDie', 'Dado de doblez'],
  ['clampDie', 'Mordaza'],
  ['pressureDie', 'Dado de presión'],
  ['wiperDie', 'Limpiador'],
  ['mandrel', 'Mandril'],
  ['collet', 'Boquilla (collet)'],
];

function card(head, sub, ...body) {
  return h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, head), sub ? h('span', { class: 'pnl-card-sub' }, sub) : null),
    ...body);
}

function kpi(label, value, hint, cls) {
  return h('div', { class: 'co-kpi' + (cls ? ` ${cls}` : '') },
    h('span', { class: 'co-kpi-label' }, label),
    h('span', { class: 'co-kpi-value' }, value),
    hint ? h('span', { class: 'co-kpi-hint' }, hint) : null);
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-costos');
  const summaryEl = h('section', { class: 'pnl-card co-summary' });
  const tableEl = h('section', { class: 'pnl-card' });
  const toolingEl = h('section', { class: 'pnl-card' });
  const notesEl = h('section', { class: 'pnl-card' });

  // ── Formulario (se construye una sola vez; update() solo sincroniza valores sin foco) ──────────
  const inputs = new Map(); // key → { input, err, wrap, rule }
  const errors = new Set(); // claves con error visible (se conserva el texto del usuario)
  let cur = ctx;

  const currencySel = h('select', { id: 'cost-currency', class: 'co-input', onchange: () => applyCurrency() },
    h('option', { value: 'USD' }, 'USD (dólar)'),
    h('option', { value: 'MXN' }, 'MXN (peso)'));
  const currencyWrap = h('div', { class: 'co-field' },
    h('label', { for: 'cost-currency' }, 'Moneda'), currencySel);

  function setError(key, msg) {
    const f = inputs.get(key);
    if (msg) {
      errors.add(key);
      f.err.textContent = msg; f.err.hidden = false;
      f.input.setAttribute('aria-invalid', 'true');
      f.wrap.classList.add('is-invalid');
    } else {
      errors.delete(key);
      f.err.textContent = ''; f.err.hidden = true;
      f.input.removeAttribute('aria-invalid');
      f.wrap.classList.remove('is-invalid');
    }
  }

  function apply(key) {
    const f = inputs.get(key);
    const ci = cur.costInputs ?? {};
    const raw = f.input.value.trim();
    if (f.input.validity.badInput) { setError(key, 'Escriba un número válido.'); return; }
    if (raw === '') {
      setError(key, null);
      if (ci[key] != null) cur.actions.setCostInput(key, null); // vacío → valor por omisión
      return;
    }
    const r = validate(f.rule, Number(raw));
    if (r.error) { setError(key, r.error); return; }
    setError(key, null);
    if (ci[key] !== r.value) cur.actions.setCostInput(key, r.value);
  }

  function applyCurrency() {
    const v = currencySel.value;
    syncFx(v);
    if ((cur.costInputs?.currency ?? DEFAULTS.currency) !== v) cur.actions.setCostInput('currency', v);
  }

  for (const [key, label, unit, rule] of FIELDS) {
    const fid = `cost-${key}`;
    const err = h('p', { class: 'co-err', id: `${fid}-err`, role: 'alert', hidden: true });
    const input = h('input', {
      id: fid, class: 'co-input', type: 'number', inputmode: 'decimal', step: 'any', autocomplete: 'off',
      min: rule === 'pos' ? null : rule === 'int' ? '1' : '0', max: rule === 'pct' ? '100' : null,
      'aria-describedby': `${fid}-err`,
      onchange: () => apply(key),
      onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); apply(key); } },
    });
    const wrap = h('div', { class: 'co-field', dataset: { key } },
      h('label', { for: fid }, label, ' ', h('span', { class: 'co-unit' }, `(${unit})`)), input, err);
    inputs.set(key, { input, err, wrap, rule });
  }
  const resetBtn = h('button', { type: 'button', id: 'cost-reset', class: 'co-btn', onclick: resetAll }, 'Restablecer');
  const formGrid = h('div', { class: 'co-grid' }, currencyWrap, FIELDS.map(([k]) => inputs.get(k).wrap));
  const formEl = card('Supuestos de costo', 'vacío = valor por omisión',
    h('div', { class: 'co-form' }, formGrid),
    h('div', { class: 'co-actions' },
      h('span', { class: 'pnl-note' }, 'Se aplica al salir del campo o con Enter. Tarifas y precios en USD.'),
      resetBtn));

  function resetAll() {
    for (const k of inputs.keys()) setError(k, null);
    const keys = Object.keys(cur.costInputs ?? {});
    for (const k of keys) cur.actions.setCostInput(k, null);
    syncForm(true);
  }

  function syncFx(currency) { inputs.get('fxMXN').wrap.hidden = currency !== 'MXN'; }

  let defaultLife = null;
  function syncForm(force) {
    const ci = cur.costInputs ?? {};
    const active = el.ownerDocument.activeElement;
    if (active !== currencySel || force) currencySel.value = ci.currency ?? DEFAULTS.currency;
    syncFx(currencySel.value);
    if (ci.toolLifeParts == null && cur.cost) defaultLife = cur.cost.tooling.life;
    const ph = {
      ...DEFAULTS,
      machineRate: cur.plan?.machine?.hourlyRate ?? cur.machine?.hourlyRate,
      materialPrice: cur.material?.pricePerKg,
      toolLifeParts: defaultLife,
    };
    for (const [key, { input, wrap }] of inputs) {
      input.placeholder = ph[key] != null ? String(ph[key]) : '';
      wrap.classList.toggle('is-set', ci[key] != null);
      if (!force && (input === active || errors.has(key))) continue; // conserva lo que el usuario escribe
      input.value = ci[key] != null ? String(ci[key]) : '';
    }
  }

  el.append(summaryEl, formEl, tableEl, toolingEl, notesEl);

  // ── Salidas ────────────────────────────────────────────────────────────────────────────────
  function render() {
    const { cost, plan } = cur;
    if (!cost) {
      setChildren(summaryEl, h('p', { class: 'pnl-empty' }, 'Sin datos de costo.'));
      setChildren(tableEl); setChildren(toolingEl); setChildren(notesEl);
      return;
    }
    const cur$ = cost.currency;
    const money = (v, d) => fmtMoney(v, cur$, d);
    const vol = cur.costInputs?.annualVolume ?? DEFAULTS.annualVolume;
    const batch = cur.costInputs?.batchSize ?? DEFAULTS.batchSize;
    const pp = cost.perPart, total = pp.total;
    const seq = plan?.sequence?.totalTime;

    // KPI + barra apilada
    const pct = (v) => (total > 0 ? 100 * v / total : 0);
    const shown = CONCEPTS.filter(([k]) => pp[k] > 0);
    setChildren(summaryEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Resumen'),
        h('span', { class: 'pnl-card-sub' }, cur$ === 'MXN' ? `MXN · ${fmt(cost.fx, 2)} MXN/USD` : 'USD')),
      h('div', { class: 'co-kpis' },
        h('div', { class: 'co-kpi co-kpi-main' },
          h('span', { class: 'co-kpi-label' }, 'Costo por pieza'),
          h('span', { class: 'co-kpi-value', id: 'cost-kpi-perPart' }, money(total)),
          h('span', { class: 'co-kpi-hint' }, `lote de ${fmt(batch, 0)} · ${money(cost.perBatch.total)}`)),
        kpi('Piezas por hora', fmt(cost.partsPerHour, 1), 'pzas/h'),
        kpi('Tiempo de ciclo', fmtTime(cost.cycleTime),
          Number.isFinite(seq) ? `secuencia ${fmt(seq, 1)} s + manejo ${fmt(cost.cycleTime - seq, 1)} s` : null),
        kpi('Masa por pieza', `${fmt(cost.massKg, 3)} kg`, 'con material de sujeción'),
        kpi('Longitud de corte', fmtMm(cost.cutLength, 1), null),
        kpi('Costo anual', money(cost.annual.total, 0), `${fmt(vol, 0)} piezas/año`)),
      h('h4', { class: 'pnl-subhead' }, 'Desglose por pieza'),
      h('div', { class: 'co-bar', role: 'img', 'aria-label': 'Desglose del costo por pieza: ' + shown.map(([k, l]) => `${l} ${fmtPct(pct(pp[k]))}`).join(', ') },
        shown.map(([k, l]) => h('span', { class: `co-seg co-c-${k}`, style: { flexGrow: String(pp[k]) }, title: `${l}: ${money(pp[k])} (${fmtPct(pct(pp[k]))})` }))),
      h('ul', { class: 'co-legend' }, CONCEPTS.map(([k, l]) => h('li', { class: 'co-leg' + (pp[k] > 0 ? '' : ' is-zero') },
        h('span', { class: `co-sw co-c-${k}`, 'aria-hidden': 'true' }),
        h('span', { class: 'co-leg-label' }, l),
        h('span', { class: 'co-leg-val' }, money(pp[k])),
        h('span', { class: 'co-leg-pct' }, fmtPct(pct(pp[k])))))));

    // Tabla por pieza / lote / anual
    setChildren(tableEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Costo por concepto'),
        h('span', { class: 'pnl-card-sub' }, `lote ${fmt(batch, 0)} pzas · ${fmt(vol, 0)} pzas/año`)),
      h('div', { class: 'pnl-scroll' }, h('table', { class: 'pnl-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Concepto'),
          h('th', { class: 'num', scope: 'col' }, 'Por pieza'), h('th', { class: 'num', scope: 'col' }, 'Por lote'), h('th', { class: 'num', scope: 'col' }, 'Anual'))),
        h('tbody', null, CONCEPTS.map(([k, l]) => h('tr', null, h('td', null, l),
          h('td', { class: 'num' }, money(pp[k], 3)), h('td', { class: 'num' }, money(cost.perBatch[k])), h('td', { class: 'num' }, money(pp[k] * vol, 0))))),
        h('tfoot', null, h('tr', null, h('th', null, 'Total'),
          h('th', { class: 'num' }, money(total, 3)), h('th', { class: 'num' }, money(cost.perBatch.total)), h('th', { class: 'num' }, money(cost.annual.total, 0)))))));

    // Herramental
    const t = cost.tooling;
    const share = (v) => (t.total > 0 ? pp.tooling * v / t.total : 0);
    setChildren(toolingEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Herramental'), h('span', { class: 'pnl-card-sub' }, 'juego completo · estimado')),
      h('div', { class: 'pnl-scroll' }, h('table', { class: 'pnl-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Concepto'), h('th', { class: 'num', scope: 'col' }, 'Juego'), h('th', { class: 'num', scope: 'col' }, 'Por pieza'))),
        h('tbody', null, TOOLS.map(([k, l]) => h('tr', { class: t[k] > 0 ? null : 'co-row-zero' }, h('td', null, l),
          h('td', { class: 'num' }, money(t[k], 0)), h('td', { class: 'num' }, money(share(t[k]), 3))))),
        h('tfoot', null,
          h('tr', null, h('th', null, 'Total'), h('th', { class: 'num' }, money(t.total, 0)), h('th', { class: 'num' }, money(pp.tooling, 3)))))),
      h('dl', { class: 'pnl-kv co-kv' },
        h('dt', null, 'Vida del herramental'), h('dd', null, `${fmt(t.life, 0)} piezas`),
        h('dt', null, 'Piezas de amortización'), h('dd', null, `${fmt(Math.min(t.life, vol), 0)} piezas`),
        h('dt', null, 'Amortización por pieza'), h('dd', null, money(pp.tooling, 3))),
      h('p', { class: 'pnl-note' }, 'Amortización = costo del juego / mín(vida, volumen anual).'));

    // Supuestos
    const pa = plan?.assumptions ?? [];
    setChildren(notesEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Supuestos')),
      h('h4', { class: 'pnl-subhead' }, 'Costo'),
      h('ul', { class: 'co-notes' }, cost.assumptions.map((a) => h('li', null, a))),
      pa.length ? [h('h4', { class: 'pnl-subhead' }, 'Proceso'), h('ul', { class: 'co-notes' }, pa.map((a) => h('li', null, a)))] : null);
  }

  let lastOut = null, lastForm = null;
  function update(ctx2) {
    cur = ctx2;
    const out = [ctx2.cost, ctx2.plan, ctx2.costInputs];
    if (!lastOut || out.some((v, i) => v !== lastOut[i])) { lastOut = out; render(); }
    const form = [ctx2.costInputs, ctx2.plan, ctx2.material, ctx2.cost];
    if (!lastForm || form.some((v, i) => v !== lastForm[i])) { lastForm = form; syncForm(false); }
  }
  update(ctx);
  return { update, dispose() { el.textContent = ''; el.classList.remove('pnl', 'pnl-costos'); } };
}
