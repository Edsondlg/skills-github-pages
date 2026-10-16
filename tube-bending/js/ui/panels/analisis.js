// Panel "Análisis por doblez": resumen de estado con KPI contra límites, tabla por doblez con celdas
// sombreadas al cruzar un límite, fuerzas del doblez seleccionado contra la capacidad de la máquina
// y la lista de mensajes (análisis + proceso) agrupada por doblez.
import { LIMITS } from '../../mechanics.js';
import { h, setChildren, fmt, fmtPct, fmtDeg, fmtMm, fmtKN, fmtKNm, STATUS_LABEL, statusIcon, pill } from '../format.js';

export const id = 'analisis';
export const title = 'Análisis por doblez';

const RANK = { ok: 0, warning: 1, fail: 2 };
const worse = (a, b) => (RANK[b] > RANK[a] ? b : a);

// ── Clasificación contra límites (mismos umbrales que mechanics.js) ────────────────────────────
const thinLevel = (p) => (p > LIMITS.thinningFailPct ? 'fail' : p > LIMITS.thinningWarnPct ? 'warning' : 'ok');
const indexLevel = (x) => (x > 1 ? 'fail' : x > LIMITS.warnFraction ? 'warning' : 'ok');
const fldLevel = (m) => (m < 0 ? 'fail' : m < LIMITS.fldRiskMargin ? 'warning' : 'ok');
const ovalLevel = (p, lim) => (p > lim ? 'fail' : p > LIMITS.warnFraction * lim ? 'warning' : 'ok');

// ── Mensajes ────────────────────────────────────────────────────────────────────────────────
const BEND_PREFIX = /^Doblez (\d+):\s*/;
// Falla: fractura, colapso, arrugas declaradas, interferencia del mandril, par fuera de capacidad.
const FAIL_RX = /^Fractura|colapso|^Arrugas en|no pasa|^Par requerido .*excede/i;

function classify(text, fromPlan) {
  if (fromPlan) return /excede|Ninguna clase/.test(text) ? 'warning' : 'info';
  return FAIL_RX.test(text) ? 'fail' : 'warning';
}

/** Agrupa summary.messages y plan.warnings: [{ bend: n|null, items: [{ status, text }] }]. */
function groupMessages(analysis, plan) {
  const groups = new Map();
  const add = (raw, fromPlan) => {
    const m = BEND_PREFIX.exec(raw);
    const key = m ? Number(m[1]) : null;
    let text = m ? raw.slice(m[0].length) : raw;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ status: classify(text, fromPlan), text });
  };
  for (const s of analysis?.summary?.messages ?? []) add(s, false);
  for (const s of plan?.warnings ?? []) add(s, true);
  for (const items of groups.values()) items.sort((a, b) => (RANK[b.status] ?? -1) - (RANK[a.status] ?? -1));
  return [...groups.entries()]
    .sort(([a], [b]) => (a == null ? -1 : b == null ? 1 : a - b))
    .map(([bend, items]) => ({ bend, items }));
}

// ── Piezas ──────────────────────────────────────────────────────────────────────────────────
function kpi(label, value, status, hint) {
  return h('div', { class: `an-kpi an-kpi-${status}`, title: hint },
    h('span', { class: 'an-kpi-label' }, label),
    h('span', { class: 'an-kpi-value' }, statusIcon(status), value),
    h('span', { class: 'an-kpi-hint' }, hint));
}

const cell = (text, level, attrs) => h('td', { class: 'num' + (level && level !== 'ok' ? ` an-c-${level}` : ''), ...attrs }, text);

const COLS = [
  ['n.º', null], ['Ángulo / carga', '°'], ['CLR', 'mm'], ['t local', 'mm'], ['DE/t', null], ['CLR/DE', null],
  ['Adelg.', '%'], ['Engros.', '%'], ['Ovalidad', '%'], ['Arrugas', 'índice'], ['Colapso', 'índice'],
  ['Margen FLD', '%'], ['Springback', '°'], ['Estado', null],
];

function forceBar(label, value, fmtV, cap, fmtC, relMax) {
  const rel = cap == null;
  const ref = rel ? relMax : cap;
  const used = ref > 0 ? value / ref : 0;
  const status = rel ? 'rel' : used > 1 ? 'fail' : used >= LIMITS.warnFraction ? 'warning' : 'ok';
  // Escala: con capacidad, 0…máx(1.15·cap, 1.05·valor) para que la marca de capacidad quede visible.
  const span = rel ? relMax : Math.max(cap * 1.15, value * 1.05);
  const w = span > 0 ? Math.min(100, (value / span) * 100) : 0;
  const capPos = rel || !(span > 0) ? null : (cap / span) * 100;
  return h('div', { class: `an-bar an-bar-${status}` },
    h('div', { class: 'an-bar-head' },
      h('span', { class: 'an-bar-label' }, label),
      h('span', { class: 'an-bar-val' }, fmtV(value)),
      h('span', { class: 'an-bar-pct' }, rel ? (ref > 0 ? `${fmt(used * 100, 0)} % rel.` : '—') : `${fmt(used * 100, 0)} %`)),
    h('div', { class: 'an-bar-track', title: rel ? 'Escala relativa al doblez de mayor fuerza' : `Capacidad ${fmtC(cap)}` },
      h('div', { class: 'an-bar-fill', style: { width: `${w.toFixed(1)}%` } }),
      capPos != null ? h('div', { class: 'an-bar-cap', style: { left: `${capPos.toFixed(1)}%` } }) : null),
    rel ? null : h('div', { class: 'an-bar-capt' }, `cap. ${fmtC(cap)}`));
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-analisis');
  const summaryEl = h('section', { class: 'pnl-card an-summary' });
  const tbody = h('tbody');
  const tableCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Resultados por doblez'),
      h('span', { class: 'pnl-card-sub' }, 'clic en una fila para seleccionar')),
    h('div', { class: 'pnl-scroll an-scroll' },
      h('table', { class: 'pnl-table an-table' },
        h('thead', null, h('tr', null, COLS.map(([t, u], i) => h('th', { class: i === 0 || i === COLS.length - 1 ? null : 'num', scope: 'col' },
          t, u ? h('span', { class: 'an-unit' }, u) : null)))),
        tbody)),
    h('p', { class: 'pnl-note' },
      `Sombreado: adelgazamiento > ${LIMITS.thinningWarnPct} / ${LIMITS.thinningFailPct} %, ovalidad > ${fmt(LIMITS.warnFraction * 100, 0)} % / 100 % del límite, `
      + `índices > ${fmt(LIMITS.warnFraction, 1)} / 1, margen FLD < ${fmt(LIMITS.fldRiskMargin * 100, 0)} / 0 %.`));
  const forcesEl = h('section', { class: 'pnl-card an-forces' });
  const msgsEl = h('section', { class: 'pnl-card an-msgs' });
  el.append(summaryEl, tableCard, forcesEl, msgsEl);

  let cur = ctx;
  let rows = [];
  let lastData = null, lastSel, lastActive, lastForceKey = null;

  function renderData() {
    const { analysis, plan, tube, options } = cur;
    const bends = analysis?.bends ?? [];
    if (!bends.length) {
      setChildren(summaryEl, h('p', { class: 'pnl-empty' }, 'Sin resultados de análisis.'));
      setChildren(tbody); rows = []; setChildren(msgsEl);
      return;
    }
    const OD = tube?.OD;
    const ovLim = options?.ovalityLimitPct ?? LIMITS.ovalityLimitPct;
    const s = analysis.summary;

    // Resumen
    const counts = { ok: 0, warning: 0, fail: 0 };
    for (const b of bends) counts[b.status] = (counts[b.status] ?? 0) + 1;
    setChildren(summaryEl,
      h('div', { class: `an-banner an-banner-${s.status}` },
        statusIcon(s.status),
        h('span', { class: 'an-banner-title' }, 'Estado general'),
        pill(s.status),
        h('span', { class: 'an-counts' }, ['ok', 'warning', 'fail'].map((k) =>
          h('span', { class: `an-count an-count-${k}` + (counts[k] ? '' : ' is-zero') }, h('b', null, String(counts[k])), ' ', STATUS_LABEL[k])))),
      h('div', { class: 'an-kpis' },
        kpi('Adelgazamiento máx.', fmtPct(s.maxThinningPct), thinLevel(s.maxThinningPct), `límite ${LIMITS.thinningWarnPct} / ${LIMITS.thinningFailPct} %`),
        kpi('Ovalidad máx.', fmtPct(s.maxOvalityPct), ovalLevel(s.maxOvalityPct, ovLim), `límite ${fmt(ovLim, 1)} %`),
        kpi('Índice de arrugas máx.', fmt(s.maxWrinkleIndex, 2), indexLevel(s.maxWrinkleIndex), `adv. > ${fmt(LIMITS.warnFraction, 1)} · falla > 1`),
        kpi('Margen FLD mín.', fmtPct(s.minFldMargin * 100), fldLevel(s.minFldMargin), `adv. < ${fmt(LIMITS.fldRiskMargin * 100, 0)} % · falla < 0`)));

    // Tabla
    rows = bends.map((b, i) => {
      const tr = h('tr', {
        class: `an-row an-row-${b.status}`, tabindex: '0', 'aria-label': `Doblez ${i + 1}`,
        onclick: () => cur.actions?.selectBend?.(i),
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cur.actions?.selectBend?.(i); } },
      },
        h('th', { scope: 'row', class: 'an-n', title: STATUS_LABEL[b.status] }, h('span', { class: 'an-n-in' }, String(i + 1), statusIcon(b.status))),
        cell([fmtDeg(b.angle), h('span', { class: 'an-sub' }, ' / ', fmtDeg(b.angleLoad))]),
        cell(fmt(b.clr, 1)),
        cell(fmt(b.wall, 2), b.mandrelClearance != null && b.mandrelClearance < 0 ? 'fail' : null,
          { title: b.wallMin != null ? `t mín. ${fmtMm(b.wallMin, 2)}` : null }),
        cell(fmt(b.WF, 1)),
        cell(fmt(b.BR ?? (OD ? b.clr / OD : null), 2)),
        cell(fmt(b.thinningPct, 1), thinLevel(b.thinningPct)),
        cell(fmt(b.thickeningPct, 1)),
        cell(fmt(b.ovalityPct, 2), ovalLevel(b.ovalityPct, ovLim)),
        cell(fmt(b.wrinkleIndex, 2), indexLevel(b.wrinkleIndex)),
        cell(fmt(b.collapseIndex, 2), indexLevel(b.collapseIndex)),
        cell(fmt(b.fldMargin * 100, 1), fldLevel(b.fldMargin)),
        cell(fmt(b.springback, 2)),
        h('td', { class: 'an-st' }, pill(b.status)));
      return tr;
    });
    setChildren(tbody, rows);
    lastSel = undefined; lastActive = undefined; // reaplica marcas sobre las filas nuevas

    // Mensajes
    const groups = groupMessages(analysis, plan);
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    setChildren(msgsEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Mensajes'), h('span', { class: 'pnl-card-sub' }, total ? `${total} en total` : 'sin observaciones')),
      total ? groups.map((g) => h('div', { class: 'an-msg-group' },
        h('h4', { class: 'pnl-subhead' }, g.bend == null ? 'Proceso / general' : `Doblez ${g.bend}`,
          g.bend != null && bends[g.bend - 1] ? h('span', { class: 'an-msg-pill' }, pill(bends[g.bend - 1].status)) : null),
        h('ul', { class: 'an-msg-list' }, g.items.map((it) =>
          h('li', { class: `an-msg an-msg-${it.status}` }, statusIcon(it.status), h('span', null, it.text))))))
        : h('p', { class: 'pnl-empty' }, 'El análisis no reporta advertencias ni fallas.'));
  }

  function renderForces(sel) {
    const { analysis, plan } = cur;
    const bends = analysis?.bends ?? [];
    const mach = plan?.machine ?? cur.machine;
    const b = sel != null ? bends[sel] : null;
    const head = h('header', { class: 'pnl-card-head' },
      h('h3', null, b ? `Fuerzas · doblez ${sel + 1}` : 'Fuerzas'),
      h('span', { class: 'pnl-card-sub' }, mach?.name ? `Máquina: ${mach.name}` : 'sin máquina'));
    if (!b) { setChildren(forcesEl, head, h('p', { class: 'pnl-empty' }, 'Seleccione un doblez en la tabla para ver sus fuerzas.')); return; }
    const maxOf = (k) => bends.reduce((m, x) => Math.max(m, x[k] ?? 0), 0);
    const kNm = (v) => fmtKNm(v);
    const kN = (v) => fmtKN(v);
    setChildren(forcesEl, head,
      h('div', { class: 'an-bars' },
        forceBar('Momento de doblez', b.moment, kNm, mach?.maxTorque, kNm),
        forceBar('Par requerido', b.torque, kNm, mach?.maxTorque, kNm),
        forceBar('Dado de presión', b.pressureDieForce, kN, mach?.maxPressureDieForce, kN),
        forceBar('Mordaza', b.clampForce, kN, mach?.maxClampForce, kN),
        forceBar('Mandril', b.mandrelForce, kN, null, kN, maxOf('mandrelForce')),
        forceBar('Limpiador', b.wiperForce, kN, null, kN, maxOf('wiperForce')),
        forceBar('Empuje (boost)', b.boostForce, kN, mach?.maxBoostForce, kN)),
      h('p', { class: 'pnl-note' }, 'Momento y par contra el par máximo de la máquina. Mandril y limpiador no tienen capacidad de máquina: '
        + 'su barra es relativa al doblez de mayor fuerza de la pieza (100 % rel.).'));
  }

  function update(ctx2) {
    cur = ctx2;
    const data = [ctx2.analysis, ctx2.plan, ctx2.tube, ctx2.options];
    const dataChanged = !lastData || data.some((v, i) => v !== lastData[i]);
    if (dataChanged) { lastData = data; renderData(); }

    const sel = ctx2.selection?.bend ?? null;
    const st = ctx2.sim?.state;
    const active = st && st.phase === 'bend' && st.bendIndex >= 0 ? st.bendIndex : null;
    if (sel !== lastSel) {
      rows.forEach((r, i) => { r.classList.toggle('is-sel', i === sel); r.setAttribute('aria-selected', String(i === sel)); });
      lastSel = sel;
    }
    if (active !== lastActive) {
      rows.forEach((r, i) => r.classList.toggle('is-active', i === active));
      lastActive = active;
    }
    const fk = [ctx2.analysis, ctx2.plan, sel];
    if (!lastForceKey || fk.some((v, i) => v !== lastForceKey[i])) { lastForceKey = fk; renderForces(sel); }
  }
  update(ctx);
  return { update, dispose() { el.textContent = ''; el.classList.remove('pnl', 'pnl-analisis'); } };
}
