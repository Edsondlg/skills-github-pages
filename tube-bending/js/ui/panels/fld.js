// Panel "FLD": diagrama límite de formado en deformaciones verdaderas (ε₂ menor × ε₁ mayor).
// Regiones de zona sombreadas igual que el clasificador (materials.js · fldZoneFromLimit), FLC de la
// pared local del doblez seleccionado, banda de riesgo, trayectorias de referencia y los puntos de
// todos los dobleces (el seleccionado resaltado). Se dibuja al ancho real del contenedor.
import { h, svg, setChildren, fmt, fmtMm, fmtDeg, fmtPct, STATUS_LABEL, niceTicks, r2 } from '../format.js';
import { flcCurve, FLD_ZONES, FLD_ZONE_LIMITS } from '../../materials.js';

export const id = 'fld';
export const title = 'Diagrama límite de formado (FLD)';

// Orden de pintado = precedencia inversa del clasificador (lo último pintado gana).
const PAINT_ORDER = ['safe', 'compression', 'wrinkleTendency', 'wrinkle', 'insufficient', 'thinning', 'risk', 'crack'];
const LEGEND_ORDER = ['crack', 'risk', 'thinning', 'safe', 'insufficient', 'compression', 'wrinkleTendency', 'wrinkle'];
const M = { l: 46, r: 10, t: 10, b: 40 }; // márgenes del área de trazo (px)
let uid = 0;

/** Rangos de ejes: datos de todos los dobleces + FLC₀, con mínimos ε₂ −0.3…0.3 y ε₁ −0.05…0.5. */
function axisRanges(bends, material, pw, ph) {
  let x0 = -0.3, x1 = 0.3, y0 = -0.05, y1 = 0.5;
  for (const b of bends) {
    for (const p of b.fldPoints ?? []) {
      if (p.e2 < x0) x0 = p.e2; if (p.e2 > x1) x1 = p.e2;
      if (p.e1 < y0) y0 = p.e1; if (p.e1 > y1) y1 = p.e1;
    }
    if (Number.isFinite(b.wall)) y1 = Math.max(y1, 1.2 * flcCurve(material, b.wall)(0));
  }
  const px = 0.04 * (x1 - x0), py = 0.04 * (y1 - y0);
  const X = niceTicks(x0 - (x0 < -0.3 ? px : 0), x1 + (x1 > 0.3 ? px : 0), Math.max(4, Math.round(pw / 42)));
  const Y = niceTicks(y0 - (y0 < -0.05 ? py : 0), y1 + (y1 > 0.5 ? py : 0), Math.max(4, Math.round(ph / 42)));
  return { X, Y };
}

function render(state) {
  const { analysis, material, sel, wrapW } = state;
  const bends = analysis.bends;
  const sb = bends[sel];
  const W = Math.max(300, Math.round(wrapW));
  const pw = W - M.l - M.r;
  const ph = Math.round(Math.min(Math.max(pw * 0.92, 240), 560));
  const H = ph + M.t + M.b;
  const { X, Y } = axisRanges(bends, material, pw, ph);
  const sx = (e2) => r2(M.l + (e2 - X.lo) / (X.hi - X.lo) * pw);
  const sy = (e1) => r2(M.t + (Y.hi - e1) / (Y.hi - Y.lo) * ph);
  const pt = (e2, e1) => `${sx(e2)},${sy(e1)}`;
  const clipId = `fld-clip-${state.uid}`;
  const g = [];

  // Rejilla y marcas.
  const grid = [], ticks = [];
  for (const v of X.ticks) {
    grid.push(svg('path', { d: `M${sx(v)} ${M.t}V${M.t + ph}`, class: v === 0 ? 'fld-axis0' : 'fld-grid' }));
    ticks.push(svg('text', { x: sx(v), y: M.t + ph + 13, 'text-anchor': 'middle', class: 'fld-tick fld-tick-x', 'data-v': +v.toFixed(10) }, fmt(v, X.decimals)));
  }
  for (const v of Y.ticks) {
    grid.push(svg('path', { d: `M${M.l} ${sy(v)}H${M.l + pw}`, class: v === 0 ? 'fld-axis0' : 'fld-grid' }));
    ticks.push(svg('text', { x: M.l - 5, y: sy(v), 'text-anchor': 'end', 'dominant-baseline': 'central', class: 'fld-tick fld-tick-y', 'data-v': +v.toFixed(10) }, fmt(v, Y.decimals)));
  }

  // Regiones de zona (semiplanos opacos en un grupo translúcido, recortados al área de trazo).
  const xa = X.lo - 1, xb = X.hi + 1;
  const above = (f) => { const top = Math.max(Y.hi, f(xa), f(xb)) + 1; return `${pt(xa, f(xa))} ${pt(0, f(0))} ${pt(xb, f(xb))} ${pt(xb, top)} ${pt(xa, top)}`; };
  const below = (f) => { const bot = Math.min(Y.lo, f(xa), f(xb)) - 1; return `${pt(xa, f(xa))} ${pt(xb, f(xb))} ${pt(xb, bot)} ${pt(xa, bot)}`; };
  const L = FLD_ZONE_LIMITS;
  const flc = flcCurve(material, sb.wall);
  const f0 = flc(0);
  const risk = (e2) => (1 - L.riskMargin) * flc(e2);
  const region = {
    safe: `${pt(xa, Y.lo - 1)} ${pt(xb, Y.lo - 1)} ${pt(xb, Y.hi + 1)} ${pt(xa, Y.hi + 1)}`,
    compression: below((e2) => -e2), // e3 > 0
    wrinkleTendency: below((e2) => -L.wrinkleTendencyE3 - e2),
    wrinkle: below((e2) => -L.wrinkleE3 - e2),
    insufficient: `${pt(-L.insufficientE2, Y.lo - 1)} ${pt(L.insufficientE2, Y.lo - 1)} ${pt(L.insufficientE2, L.insufficientE1)} ${pt(-L.insufficientE2, L.insufficientE1)}`,
    thinning: above((e2) => -L.thinningE3 - e2), // e3 = −(e1+e2) < thinningE3
    risk: above(risk),
    crack: above(flc),
  };
  const zones = svg('g', { class: 'fld-zones', 'clip-path': `url(#${clipId})` },
    PAINT_ORDER.map((z) => svg('polygon', { points: region[z], fill: `var(--fld-${z})` })));

  // Trayectorias de referencia (rayos desde el origen) con etiqueta junto al borde.
  const refs = [
    { dx: -1, dy: 2, label: 'Tensión uniaxial' },
    { dx: 0, dy: 1, label: 'Deformación plana' },
    { dx: 1, dy: 1, label: 'Biaxial' },
    { dx: -1, dy: 1, label: 'Cortante puro' },
  ];
  const refEls = refs.map(({ dx, dy, label }) => {
    const k = Math.min(dx < 0 ? X.lo / dx : dx > 0 ? X.hi / dx : Infinity, Y.hi / dy);
    const ex = dx * k, ey = dy * k;
    const kl = 0.93 * k;
    const lx = sx(dx * kl), ly = sy(dy * kl);
    const anchor = dx > 0 ? 'end' : 'start';
    return svg('g', { class: 'fld-ref' },
      svg('path', { d: `M${sx(0)} ${sy(0)}L${sx(ex)} ${sy(ey)}` }),
      svg('text', { x: r2(lx + (dx > 0 ? -4 : 4)), y: r2(ly + (dx === 0 ? 2 : 0)), 'text-anchor': anchor, 'dominant-baseline': 'hanging' }, label));
  });

  // FLC y línea de riesgo.
  const curve = (f) => `M${pt(X.lo, f(X.lo))} L${pt(0, f(0))} L${pt(X.hi, f(X.hi))}`;
  const lines = svg('g', { 'clip-path': `url(#${clipId})` },
    svg('path', { d: curve(risk), class: 'fld-risk' }),
    svg('path', { d: curve(flc), class: 'fld-flc' }));
  // Etiqueta sobre la rama izquierda de la FLC, a media altura entre FLC₀ y el borde superior.
  const dL = Math.max(0, (Y.hi - f0) * 0.45);
  const flcLabel = svg('text', { x: r2(sx(-dL) + 6), y: sy(f0 + dL), 'dominant-baseline': 'central', class: 'fld-flc-label' }, 'FLC');

  // Puntos: otros dobleces primero (tenues), el seleccionado al final (encima).
  const dots = [];
  const order = bends.map((b, i) => i).filter((i) => i !== sel).concat(sel);
  for (const i of order) {
    const on = i === sel;
    const b = bends[i];
    (b.fldPoints ?? []).forEach((p, k) => {
      dots.push(svg('circle', {
        cx: sx(p.e2), cy: sy(p.e1), r: on ? 4.2 : 2.6,
        class: on ? 'fld-pt is-sel' : 'fld-pt', fill: `var(--fld-${p.zone})`,
        'data-e1': p.e1, 'data-e2': p.e2, 'data-bend': i, 'data-k': k,
      }));
    });
  }

  g.push(svg('defs', null, svg('clipPath', { id: clipId }, svg('rect', { x: M.l, y: M.t, width: pw, height: ph }))));
  g.push(zones, svg('g', { class: 'fld-grids' }, grid), lines, svg('g', { 'clip-path': `url(#${clipId})` }, refEls), flcLabel);
  g.push(svg('rect', { x: M.l, y: M.t, width: pw, height: ph, class: 'fld-frame' }));
  g.push(svg('g', null, ticks));
  g.push(svg('text', { x: r2(M.l + pw / 2), y: H - 6, 'text-anchor': 'middle', class: 'fld-axis-title' }, 'Deformación menor ε₂'));
  g.push(svg('text', { x: 0, y: 0, transform: `translate(11 ${r2(M.t + ph / 2)}) rotate(-90)`, 'text-anchor': 'middle', class: 'fld-axis-title' }, 'Deformación mayor ε₁'));
  g.push(svg('g', { class: 'fld-pts' }, dots));

  return svg('svg', {
    class: 'pnl-svg fld-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img',
    'aria-label': `Diagrama límite de formado, doblez D${sel + 1}, FLC₀ ${fmt(f0, 3)}`,
  }, ...g);
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-fld');
  const chipsEl = h('div', { class: 'pnl-chips', role: 'tablist', 'aria-label': 'Doblez' });
  const figEl = h('div', { class: 'pnl-figure fld-fig' });
  const tipEl = h('div', { class: 'fld-tip', role: 'tooltip', hidden: true });
  const wrapEl = h('div', { class: 'fld-wrap' }, figEl, tipEl);
  const legendEl = h('ul', { class: 'fld-legend' });
  const capEl = h('p', { class: 'pnl-note' });
  const subEl = h('span', { class: 'pnl-card-sub' });
  const emptyEl = h('p', { class: 'pnl-empty', hidden: true }, 'Sin análisis de dobleces.');
  const cardEl = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Deformaciones en el doblez'), subEl),
    chipsEl, wrapEl, legendEl, capEl);
  el.append(emptyEl, cardEl);

  const state = { uid: ++uid, analysis: null, material: null, sel: 0, wrapW: 0 };
  let cur = ctx, lastKey = null;

  function effectiveSel(analysis, bend) {
    const bs = analysis.bends;
    if (bend != null && bend >= 0 && bend < bs.length) return bend;
    let w = 0; // sin selección: el doblez con menor margen FLD
    bs.forEach((b, i) => { if (b.fldMargin < bs[w].fldMargin) w = i; });
    return w;
  }

  function draw() {
    const { analysis, material, sel } = state;
    const bends = analysis.bends;
    const sb = bends[sel];
    state.wrapW = wrapEl.clientWidth || 400;
    setChildren(figEl, render(state));
    tipEl.hidden = true;

    setChildren(chipsEl, bends.map((b, i) => h('button', {
      type: 'button', role: 'tab', class: `pnl-chip fld-chip fld-chip-${b.status}` + (i === sel ? ' is-on' : ''),
      'aria-selected': String(i === sel),
      title: `D${i + 1} · ${STATUS_LABEL[b.status] ?? b.status} · margen FLD ${fmtPct(b.fldMargin * 100, 0)}`,
      onclick: () => cur.actions?.selectBend(i),
    }, `D${i + 1}`)));

    const present = new Set();
    for (const b of bends) for (const p of b.fldPoints ?? []) present.add(p.zone);
    setChildren(legendEl,
      h('li', null, h('span', { class: 'fld-key fld-key-flc' }), 'FLC'),
      h('li', null, h('span', { class: 'fld-key fld-key-risk' }), `Banda de riesgo (${fmt(FLD_ZONE_LIMITS.riskMargin * 100, 0)} % bajo FLC)`),
      LEGEND_ORDER.filter((z) => present.has(z)).map((z) => h('li', null, h('span', { class: 'fld-key fld-key-zone', style: { background: `var(--fld-${z})` } }), FLD_ZONES[z])));

    const f0 = flcCurve(material, sb.wall)(0);
    subEl.textContent = `deformaciones verdaderas · ${material.name}`;
    setChildren(capEl,
      `D${sel + 1}: FLC₀ = ${fmt(f0, 3)} (ε₁ verdadera en deformación plana) para la pared local media t = ${fmtMm(sb.wall, 2)}`,
      Number.isFinite(sb.wallMin) && sb.wallMin < sb.wall - 0.005 ? ` (mín. ${fmtMm(sb.wallMin, 2)})` : '',
      ` · margen FLD ${fmtPct(sb.fldMargin * 100, 1)}. `,
      'Sombreado según ε₃ = −(ε₁+ε₂); el color de cada punto es su zona calculada (incluye preformado y cordón de soldadura).');
  }

  function showTip(c) {
    const b = Number(c.dataset.bend), k = Number(c.dataset.k);
    const p = state.analysis.bends[b]?.fldPoints?.[k];
    if (!p) return;
    setChildren(tipEl,
      h('strong', null, `D${b + 1} · φ ${fmtDeg(p.phi, 0)}`),
      h('dl', { class: 'pnl-kv' },
        h('dt', null, 'ε₁'), h('dd', null, fmt(p.e1, 3)),
        h('dt', null, 'ε₂'), h('dd', null, fmt(p.e2, 3)),
        h('dt', null, 'ε₃'), h('dd', null, fmt(p.e3, 3))),
      h('span', { class: 'fld-tip-zone' }, h('span', { class: 'fld-key fld-key-zone', style: { background: `var(--fld-${p.zone})` } }), FLD_ZONES[p.zone] ?? p.zone));
    tipEl.hidden = false;
    const wr = wrapEl.getBoundingClientRect(), cr = c.getBoundingClientRect();
    const cx = cr.left + cr.width / 2 - wr.left, cy = cr.top - wr.top;
    const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
    tipEl.style.left = `${Math.round(Math.min(Math.max(cx - tw / 2, 0), wr.width - tw))}px`;
    tipEl.style.top = `${Math.round(cy - th - 6 < 0 ? cy + cr.height + 6 : cy - th - 6)}px`;
  }
  const onOver = (ev) => { const c = ev.target.closest?.('circle.fld-pt'); if (c) showTip(c); };
  const onOut = (ev) => { if (ev.target.closest?.('circle.fld-pt')) tipEl.hidden = true; };
  figEl.addEventListener('pointerover', onOver);
  figEl.addEventListener('pointerdown', onOver);
  figEl.addEventListener('pointerout', onOut);

  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    if (state.analysis && Math.abs(wrapEl.clientWidth - state.wrapW) > 2) draw();
  }) : null;
  ro?.observe(wrapEl);

  function update(ctx2) {
    cur = ctx2;
    const analysis = ctx2.analysis, material = ctx2.material;
    const ok = !!(analysis?.bends?.length && material);
    const sel = ok ? effectiveSel(analysis, ctx2.selection?.bend ?? null) : null;
    const key = [analysis, material, sel];
    if (lastKey && key.every((v, i) => v === lastKey[i])) return;
    lastKey = key;
    emptyEl.hidden = ok; cardEl.hidden = !ok;
    if (!ok) { setChildren(figEl); return; }
    Object.assign(state, { analysis, material, sel });
    draw();
  }
  update(ctx);
  return {
    update,
    dispose() {
      ro?.disconnect();
      el.textContent = '';
      el.classList.remove('pnl', 'pnl-fld');
    },
  };
}
