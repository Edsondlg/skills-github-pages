// Panel "Sección transversal": selector de estación s, corte a escala en s (pared coloreada por
// espesor local), lecturas de espesor/diámetros/ovalidad/deformaciones, gráfica t(φ) y franja
// longitudinal t(s) en extradós e intradós junto con la pared sin formar t0(s).
// Todo sale de sampler.at(s, φ) (estado totalmente formado); el panel no recalcula la tubería.
import { h, svg, setChildren, fmt, fmtMm, fmtDeg, fmtPct, niceTicks, r2 } from '../format.js';
import { bendExtradosAngles, normalizeDeg360 } from '../../geometry.js';
import { FLD_ZONES } from '../../materials.js';

export const id = 'seccion';
export const title = 'Sección transversal';

const STEP = 3;                 // paso angular del corte (°)
const N = 360 / STEP;           // muestras por sección
const HALF = N / 2;             // índice del punto opuesto (φ + 180°)
const STRIP_N = 480;            // muestras uniformes de la franja longitudinal

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

// ── Datos por identidad de entrada ────────────────────────────────────────────────────────────

function prepare(c) {
  const L = c.plan.layout;
  const ext = bendExtradosAngles(c.lra);
  const bends = L.bends.map((b, i) => ({ i, s0: b.s0, s1: b.s1, mid: (b.s0 + b.s1) / 2, ext: ext[i] ?? 90 }));
  return {
    OD: c.tube.OD, cut: L.cutLength, front: L.frontScrap ?? 0, tail: L.tailScrap ?? 0,
    bends, breakpoints: L.breakpoints ?? [], sampler: c.sampler,
    mandrel: c.plan.mandrel, seam: c.options?.seamAngle ?? null, strip: null,
  };
}

/** Doblez que contiene s, o el más cercano (para orientar el corte en las rectas). */
function bendAt(D, s) {
  let best = null, bestD = Infinity;
  for (const b of D.bends) {
    const d = s < b.s0 ? b.s0 - s : s > b.s1 ? s - b.s1 : 0;
    if (d < bestD) { bestD = d; best = b; }
  }
  return { bend: best, inside: bestD === 0 && best != null };
}

function zoneLabel(D, s) {
  const { bend, inside } = bendAt(D, s);
  if (inside) return `Doblez ${bend.i + 1}`;
  if (s < D.front || s > D.cut - D.tail) return 'Material de sujeción';
  return 'Recta';
}

/** Corte en s: φ = extradós + k·3°, k = 0…N−1 (k = 0 extradós, k = N/2 intradós). */
function computeSection(D, s) {
  const { bend, inside } = bendAt(D, s);
  const ext = bend ? bend.ext : 90;
  const R = D.OD / 2;
  const phi = new Float64Array(N), t = new Float64Array(N), rOut = new Float64Array(N), rIn = new Float64Array(N);
  let t0 = 0, iMin = 0, iMax = 0, thinMax = -Infinity;
  const pt = (k) => {
    const o = D.sampler.at(s, phi[k]);
    return { t: o.t, e1: o.e1, e2: o.e2, e3: o.e3, zone: o.zone, thinningPct: o.thinningPct };
  };
  for (let k = 0; k < N; k++) {
    phi[k] = normalizeDeg360(ext + k * STEP);
    const o = D.sampler.at(s, phi[k]);
    t[k] = o.t; t0 = o.t0;
    rOut[k] = R + o.dOut; rIn[k] = R - o.t0 + o.dIn;
    if (o.t < t[iMin]) iMin = k;
    if (o.t > t[iMax]) iMax = k;
    if (o.thinningPct > thinMax) thinMax = o.thinningPct;
  }
  let dMax = -Infinity, dMin = Infinity, kMax = 0, kMin = 0;
  for (let k = 0; k < HALF; k++) {
    const d = rOut[k] + rOut[k + HALF];
    if (d > dMax) { dMax = d; kMax = k; }
    if (d < dMin) { dMin = d; kMin = k; }
  }
  return {
    s, bend, inside, ext, phi, t, rOut, rIn, t0, iMin, iMax, thinMax,
    dMax, dMin, phiDMax: phi[kMax], phiDMin: phi[kMin], ovalityPct: (dMax - dMin) / D.OD * 100,
    atExt: pt(0), atInt: pt(HALF),
  };
}

/** Franja longitudinal: t en extradós/intradós (del doblez contenedor o más cercano) y t0(s). */
function computeStrip(D) {
  const ss = [];
  for (let k = 0; k <= STRIP_N; k++) ss.push(D.cut * k / STRIP_N);
  for (const b of D.bends) ss.push(b.s0, b.s1, b.mid);
  for (const p of D.breakpoints) ss.push(p);
  const s = Float64Array.from(ss.filter((x) => x >= 0 && x <= D.cut)).sort();
  const n = s.length;
  const tExt = new Float64Array(n), tInt = new Float64Array(n), t0 = new Float64Array(n);
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < n; k++) {
    const { bend } = bendAt(D, s[k]);
    const ext = bend ? bend.ext : 90;
    const a = D.sampler.at(s[k], ext); tExt[k] = a.t; t0[k] = a.t0;
    const b = D.sampler.at(s[k], ext + 180); tInt[k] = b.t;
    lo = Math.min(lo, tExt[k], tInt[k], t0[k]); hi = Math.max(hi, tExt[k], tInt[k], t0[k]);
  }
  return { s, tExt, tInt, t0, lo, hi };
}

// ── Rampa de color por espesor (de tokens: falla → acento → acero) ────────────────────────────

function rampColor(u) {
  u = clamp(u, 0, 1);
  if (u <= 0.5) return `color-mix(in oklab, var(--accent) ${r2(u * 200)}%, var(--fail))`;
  return `color-mix(in oklab, var(--steel) ${r2((u - 0.5) * 200)}%, var(--accent))`;
}

// ── Dibujos ───────────────────────────────────────────────────────────────────────────────────

function sectionSvg(D, S, size, mode, dom) {
  const R = D.OD / 2;
  let rMax = R;
  for (let k = 0; k < N; k++) rMax = Math.max(rMax, S.rOut[k]);
  const c = size / 2;
  const kpx = (size / 2 - 26) / rMax; // px por mm (a escala, misma en x e y)
  // φ − extradós = k·STEP; extradós arriba, vista desde el extremo delantero (φ crece en sentido antihorario).
  const P = (k, r) => {
    const th = (90 + k * STEP) * Math.PI / 180;
    return [r2(c + kpx * r * Math.cos(th)), r2(c - kpx * r * Math.sin(th))];
  };
  const Pphi = (phi, r) => P(normalizeDeg360(phi - S.ext) / STEP, r);
  const g = [];
  const span = dom.hi - dom.lo;

  if (mode === 'thick') {
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      const tm = (S.t[k] + S.t[k2]) / 2;
      const fill = rampColor(span > 1e-9 ? (tm - dom.lo) / span : 0.5);
      const a = P(k, S.rOut[k]), b = P(k + 1, S.rOut[k2]), d = P(k + 1, S.rIn[k2]), e = P(k, S.rIn[k]);
      g.push(svg('path', { d: `M${a}L${b}L${d}L${e}Z`, style: { fill, stroke: fill }, class: 'sec-seg' }));
    }
  }
  const ring = (arr) => {
    let d = '';
    for (let k = 0; k < N; k++) d += (k ? 'L' : 'M') + P(k, arr[k]).join(' ');
    return d + 'Z';
  };
  const outer = ring(S.rOut), inner = ring(S.rIn);
  g.push(svg('path', { d: outer + inner, class: mode === 'thick' ? 'sec-wall-edge' : 'sec-wall-steel', 'fill-rule': 'evenodd' }));

  // Circunferencias nominales (DE y DI sin formar).
  g.push(svg('circle', { cx: c, cy: c, r: r2(kpx * R), class: 'sec-nominal' }));
  g.push(svg('circle', { cx: c, cy: c, r: r2(kpx * (R - S.t0)), class: 'sec-nominal' }));
  // Mandril dentro del doblez.
  const m = D.mandrel;
  if (S.inside && m && m.type !== 'none' && m.diameter > 0) {
    g.push(svg('circle', { cx: c, cy: c, r: r2(kpx * m.diameter / 2), class: 'sec-mandrel' }));
    g.push(svg('text', { x: c, y: c + 20, 'text-anchor': 'middle', class: 'sec-lab sec-lab-mandrel' }, `Mandril Ø${fmt(m.diameter, 2)} mm`));
  }
  // Centro.
  g.push(svg('path', { d: `M${c - 5} ${c}H${c + 5}M${c} ${c - 5}V${c + 5}`, class: 'sec-center' }));
  // Punto de espesor mínimo.
  const [mnx, mny] = P(S.iMin, (S.rOut[S.iMin] + S.rIn[S.iMin]) / 2);
  g.push(svg('circle', { cx: mnx, cy: mny, r: 3, class: 'sec-min' }));
  // Costura de soldadura.
  if (D.seam != null) {
    const kk = normalizeDeg360(D.seam - S.ext) / STEP;
    const k0 = Math.round(kk) % N;
    const r0 = S.rOut[k0] + 1.5 / kpx, r1 = S.rOut[k0] + 12 / kpx, r3 = S.rOut[k0] + 20 / kpx;
    const [x0, y0] = Pphi(D.seam, r0), [x1, y1] = Pphi(D.seam, r1), [x3, y3] = Pphi(D.seam, r3);
    g.push(svg('path', { d: `M${x0} ${y0}L${x1} ${y1}`, class: 'sec-seam' }));
    g.push(svg('text', { x: x3, y: r2(y3 + 4), 'text-anchor': x3 < c - 4 ? 'end' : x3 > c + 4 ? 'start' : 'middle', class: 'sec-lab' }, 'Costura'));
  }
  // Extradós / intradós.
  g.push(svg('text', { x: c, y: r2(c - kpx * rMax - 9), 'text-anchor': 'middle', class: 'sec-lab sec-lab-strong' }, 'Extradós'));
  g.push(svg('text', { x: c, y: r2(c + kpx * rMax + 18), 'text-anchor': 'middle', class: 'sec-lab sec-lab-strong' }, 'Intradós'));
  // Barra de escala.
  const want = D.OD / 3;
  const L = [1, 2, 5, 10, 20, 25, 50, 100, 200].filter((v) => v <= want).pop() ?? 1;
  const bx = 6, by = size - 8, bw = r2(kpx * L);
  g.push(svg('path', { d: `M${bx} ${by - 4}V${by}H${r2(bx + bw)}V${by - 4}`, class: 'sec-scale' }));
  g.push(svg('text', { x: r2(bx + bw / 2), y: by - 6, 'text-anchor': 'middle', class: 'sec-lab' }, `${fmt(L, 0)} mm`));

  return svg('svg', {
    class: 'pnl-svg sec-svg', width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img',
    'aria-label': `Sección transversal a escala en s = ${fmt(S.s, 1)} mm`,
  }, ...g);
}

function phiChart(S, W) {
  const H = 150, ml = 40, mr = 10, mt = 10, mb = 22;
  const pw = W - ml - mr, ph = H - mt - mb;
  let lo = Math.min(S.t0, S.t[S.iMin]), hi = Math.max(S.t0, S.t[S.iMax]);
  const pad = Math.max(0.1 * (hi - lo), 0.03 * S.t0);
  const yt = niceTicks(lo - pad, hi + pad, 4);
  const X = (psi) => r2(ml + pw * psi / 360);
  const Y = (t) => r2(mt + ph * (1 - (t - yt.lo) / (yt.hi - yt.lo)));
  const g = [];
  for (const v of yt.ticks) {
    g.push(svg('path', { d: `M${ml} ${Y(v)}H${ml + pw}`, class: 'sec-grid' }));
    g.push(svg('text', { x: ml - 4, y: Y(v) + 3.5, 'text-anchor': 'end', class: 'sec-tick' }, fmt(v, Math.max(yt.decimals, 1))));
  }
  const XL = ['Ext', 'Lat', 'Int', 'Lat', 'Ext'];
  for (let i = 0; i <= 4; i++) {
    g.push(svg('path', { d: `M${X(i * 90)} ${mt}V${mt + ph}`, class: 'sec-grid' }));
    g.push(svg('text', { x: X(i * 90), y: H - 6, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', class: 'sec-tick' }, pw >= 340 ? `${XL[i]} ${i * 90}°` : XL[i]));
  }
  g.push(svg('path', { d: `M${ml} ${Y(S.t0)}H${ml + pw}`, class: 'sec-t0' }));
  let d = '';
  for (let k = 0; k <= N; k++) d += (k ? 'L' : 'M') + X(k * STEP) + ' ' + Y(S.t[k % N]);
  g.push(svg('path', { d, class: 'sec-line' }));
  g.push(svg('circle', { cx: X(S.iMin * STEP), cy: Y(S.t[S.iMin]), r: 3, class: 'sec-min' }));
  g.push(svg('text', { x: ml + 4, y: mt + 10, class: 'sec-tick' }, 't (mm)'));
  return svg('svg', { class: 'pnl-svg sec-chart', width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Espesor contra ángulo desde el extradós' }, ...g);
}

function stripChart(D, s, W, onPick) {
  const st = D.strip;
  const H = 180, ml = 40, mr = 10, mt = 18, mb = 22;
  const pw = W - ml - mr, ph = H - mt - mb;
  const pad = Math.max(0.08 * (st.hi - st.lo), 0.05);
  const yt = niceTicks(st.lo - pad, st.hi + pad, 4);
  const X = (x) => r2(ml + pw * x / D.cut);
  const Y = (t) => r2(mt + ph * (1 - (t - yt.lo) / (yt.hi - yt.lo)));
  const g = [];
  // Material de sujeción y dobleces sombreados.
  if (D.front > 0) g.push(svg('rect', { x: X(0), y: mt, width: r2(X(D.front) - X(0)), height: ph, class: 'sec-scrap' }));
  if (D.tail > 0) g.push(svg('rect', { x: X(D.cut - D.tail), y: mt, width: r2(X(D.cut) - X(D.cut - D.tail)), height: ph, class: 'sec-scrap' }));
  const cur = bendAt(D, s);
  for (const b of D.bends) {
    const on = cur.inside && cur.bend === b;
    g.push(svg('rect', { x: X(b.s0), y: mt, width: Math.max(1, r2(X(b.s1) - X(b.s0))), height: ph, class: on ? 'sec-band is-on' : 'sec-band' }));
    g.push(svg('text', { x: X(b.mid), y: mt - 5, 'text-anchor': 'middle', class: 'sec-tick sec-band-lab' }, `D${b.i + 1}`));
  }
  for (const v of yt.ticks) {
    g.push(svg('path', { d: `M${ml} ${Y(v)}H${ml + pw}`, class: 'sec-grid' }));
    g.push(svg('text', { x: ml - 4, y: Y(v) + 3.5, 'text-anchor': 'end', class: 'sec-tick' }, fmt(v, Math.max(yt.decimals, 1))));
  }
  const xt = niceTicks(0, D.cut, Math.max(3, Math.floor(pw / 70)));
  for (const v of xt.ticks) {
    if (v > D.cut + 1e-6) continue;
    g.push(svg('path', { d: `M${X(v)} ${mt + ph}v4`, class: 'sec-axis' }));
    g.push(svg('text', { x: X(v), y: H - 6, 'text-anchor': 'middle', class: 'sec-tick' }, fmt(v, 0)));
  }
  g.push(svg('path', { d: `M${ml} ${mt + ph}H${ml + pw}`, class: 'sec-axis' }));
  const line = (arr, cls) => {
    let d = '';
    for (let k = 0; k < st.s.length; k++) d += (k ? 'L' : 'M') + X(st.s[k]) + ' ' + Y(arr[k]);
    return svg('path', { d, class: cls });
  };
  g.push(line(st.t0, 'sec-t0'));
  g.push(line(st.tInt, 'sec-line-int'));
  g.push(line(st.tExt, 'sec-line-ext'));
  g.push(svg('path', { d: `M${X(s)} ${mt - 2}V${mt + ph}`, class: 'sec-cursor' }));
  g.push(svg('text', { x: ml - 8, y: H - 6, 'text-anchor': 'end', class: 'sec-tick' }, 's (mm)'));
  g.push(svg('text', { x: ml + 4, y: mt + 10, class: 'sec-tick' }, 't (mm)'));
  const el = svg('svg', {
    class: 'pnl-svg sec-chart sec-strip', width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img',
    'aria-label': 'Espesor a lo largo del tubo en extradós e intradós; clic para elegir estación',
  }, ...g);
  el.addEventListener('click', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    onPick(clamp((x - ml) / pw, 0, 1) * D.cut);
  });
  return el;
}

// ── Montaje ───────────────────────────────────────────────────────────────────────────────────

function kv(rows) {
  return h('dl', { class: 'pnl-kv' }, rows.filter(Boolean).map(([k, v, key]) => [h('dt', null, k), h('dd', key ? { dataset: { k: key } } : null, v)]));
}

function card(head, sub, ...body) {
  const subEl = h('span', { class: 'pnl-card-sub' }, sub ?? '');
  const sec = h('section', { class: 'pnl-card' }, h('header', { class: 'pnl-card-head' }, h('h3', null, head), subEl), ...body);
  sec.sub = subEl;
  return sec;
}

const pctE = (e) => fmt(e * 100, 1);
const zoneCell = (z) => h('span', { class: 'sec-zone' }, h('span', { class: 'sec-sw', style: { background: `var(--fld-${z})` } }), FLD_ZONES[z] ?? z);

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-seccion');
  let cur = ctx, D = null, dataKey = null;
  let station = null, lastSelS, lastSelBend, mode = 'thick';
  let width = 0, lastDraw = null, pending = null, raf = 0;

  // Estación
  const sOut = h('span', { class: 'sec-s' });
  const zoneOut = h('span', { class: 'pnl-pill pnl-pill-info' });
  const bandsEl = h('div', { class: 'sec-bands' });
  const slider = h('input', { type: 'range', id: 'sec-s', class: 'sec-slider', min: 0, max: 1, step: 0.5, 'aria-label': 'Estación s a lo largo del tubo (mm)' });
  const stationCard = card('Estación', null, h('div', { class: 'sec-sline' }, sOut, zoneOut), bandsEl, slider);

  // Corte
  const modeBtns = [['thick', 'Por espesor'], ['steel', 'Acero']].map(([k, label]) => h('button', {
    type: 'button', class: 'pnl-chip', 'aria-pressed': 'false', dataset: { mode: k },
    onclick: () => { mode = k; draw(true); },
  }, label));
  const figEl = h('div', { class: 'pnl-figure sec-figure' });
  const legendEl = h('div', { class: 'sec-legend' });
  const readEl = h('div');
  const tableEl = h('div', { class: 'pnl-scroll' });
  const secCard = card('Corte', 'a escala · mm', h('div', { class: 'pnl-chips', role: 'group', 'aria-label': 'Relleno de la pared' }, modeBtns),
    figEl, legendEl,
    h('p', { class: 'pnl-note' }, 'Vista desde el extremo delantero, extradós arriba. Línea discontinua: DE y DI nominales sin formar. Punto: espesor mínimo. Estado totalmente formado.'),
    readEl, tableEl);

  // t(φ)
  const phiEl = h('div', { class: 'pnl-figure' });
  const phiCard = card('Espesor alrededor de la sección', 'φ desde el extradós', phiEl,
    h('div', { class: 'sec-key' }, h('span', { class: 'sec-key-i sec-key-line' }, 't'), h('span', { class: 'sec-key-i sec-key-t0' }, 't0 sin formar')));

  // t(s)
  const stripEl = h('div', { class: 'pnl-figure' });
  const stripCard = card('Espesor a lo largo del tubo', 'clic para elegir estación', stripEl,
    h('div', { class: 'sec-key' },
      h('span', { class: 'sec-key-i sec-key-ext' }, 'Extradós'), h('span', { class: 'sec-key-i sec-key-int' }, 'Intradós'),
      h('span', { class: 'sec-key-i sec-key-t0' }, 't0 sin formar')),
    h('p', { class: 'pnl-note' }, 'Extradós/intradós del doblez que contiene cada estación (o del más cercano en las rectas). Bandas: dobleces; gris: material de sujeción.'));

  const emptyEl = h('p', { class: 'pnl-empty' }, 'Sin datos de proceso.');
  el.append(emptyEl, stationCard, secCard, phiCard, stripCard);

  function pick(s, bendIndex) {
    station = clamp(s, 0, D.cut);
    draw();
    cur.actions?.selectSection?.(station);
    if (bendIndex != null) cur.actions?.selectBend?.(bendIndex);
  }

  slider.addEventListener('input', () => {
    station = Number(slider.value);
    draw();
    pending = station;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (pending != null) { const v = pending; pending = null; cur.actions?.selectSection?.(v); } });
  });

  function drawBands() {
    const pct = (x) => `${r2(x / D.cut * 100)}%`;
    const kids = [];
    if (D.front > 0) kids.push(h('span', { class: 'sec-bscrap', style: { left: '0%', width: pct(D.front) }, title: 'Material de sujeción' }));
    if (D.tail > 0) kids.push(h('span', { class: 'sec-bscrap', style: { left: pct(D.cut - D.tail), width: pct(D.tail) }, title: 'Material de sujeción' }));
    for (const b of D.bends) {
      kids.push(h('button', {
        type: 'button', class: 'sec-band-btn', dataset: { bend: b.i },
        style: { left: pct(b.s0), width: pct(b.s1 - b.s0) }, title: `Doblez ${b.i + 1}: s ${fmt(b.s0, 0)}–${fmt(b.s1, 0)} mm`,
        onclick: () => pick(b.mid, b.i),
      }, `D${b.i + 1}`));
    }
    setChildren(bandsEl, kids);
  }

  function draw(force = false) {
    if (!D) return;
    const w = Math.max(220, Math.floor(figEl.clientWidth || el.clientWidth || 360));
    const key = [station, mode, w, D];
    if (!force && lastDraw && key.every((v, i) => v === lastDraw[i])) return;
    lastDraw = key; width = w;
    const s = station;
    const S = computeSection(D, s);
    if (!D.strip) D.strip = computeStrip(D);
    const dom = { lo: D.strip.lo, hi: D.strip.hi };

    slider.value = String(s);
    sOut.textContent = `s = ${fmtMm(s, 1)}`;
    zoneOut.textContent = zoneLabel(D, s);
    for (const b of bandsEl.querySelectorAll('.sec-band-btn')) b.classList.toggle('is-on', S.inside && Number(b.dataset.bend) === S.bend.i);
    for (const b of modeBtns) { const on = b.dataset.mode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }

    secCard.sub.textContent = `a escala · mm · extradós ${S.inside ? 'del' : 'del doblez más cercano,'} D${S.bend ? S.bend.i + 1 : '—'} (φ ${fmtDeg(S.ext, 0)})`;
    setChildren(figEl, sectionSvg(D, S, Math.min(w, 340), mode, dom));
    setChildren(legendEl, mode === 'thick' ? [
      h('span', { class: 'sec-legend-v' }, fmtMm(dom.lo, 2)),
      h('span', { class: 'sec-ramp', title: 'Espesor local (escala común a todo el tubo)' }),
      h('span', { class: 'sec-legend-v' }, fmtMm(dom.hi, 2)),
    ] : null);

    const at = (k) => `φ ${fmtDeg(S.phi[k], 0)}`;
    setChildren(readEl, kv([
      ['Espesor nominal t0', fmtMm(S.t0, 2), 't0'],
      ['Espesor mín', `${fmtMm(S.t[S.iMin], 3)} · ${at(S.iMin)}`, 'tmin'],
      ['Espesor máx', `${fmtMm(S.t[S.iMax], 3)} · ${at(S.iMax)}`, 'tmax'],
      ['Adelgazamiento máx', fmtPct(Math.max(0, S.thinMax), 1), 'thin'],
      ['D máx', `${fmtMm(S.dMax, 2)} · φ ${fmtDeg(S.phiDMax, 0)}`, 'dmax'],
      ['D mín', `${fmtMm(S.dMin, 2)} · φ ${fmtDeg(S.phiDMin, 0)}`, 'dmin'],
      ['Ovalidad (Dmáx − Dmín)/DE', fmtPct(S.ovalityPct, 2), 'ovality'],
      ['Zona FLD extradós', zoneCell(S.atExt.zone), 'zext'],
      ['Zona FLD intradós', zoneCell(S.atInt.zone), 'zint'],
    ]));
    const row = (label, p) => h('tr', null, h('td', null, label), h('td', { class: 'num' }, fmt(p.t, 3)),
      h('td', { class: 'num' }, pctE(p.e1)), h('td', { class: 'num' }, pctE(p.e2)), h('td', { class: 'num' }, pctE(p.e3)));
    setChildren(tableEl, h('table', { class: 'pnl-table sec-table' },
      h('thead', null, h('tr', null, h('th', null, 'Def. verdadera'), h('th', { class: 'num' }, 't mm'),
        h('th', { class: 'num' }, 'ε1 %'), h('th', { class: 'num' }, 'ε2 %'), h('th', { class: 'num' }, 'ε3 %'))),
      h('tbody', null, row('Extradós', S.atExt), row('Intradós', S.atInt))));

    setChildren(phiEl, phiChart(S, w));
    setChildren(stripEl, stripChart(D, s, w, (v) => pick(v)));
  }

  function update(c) {
    cur = c;
    const ok = c.plan?.layout && c.sampler && c.tube && c.lra;
    stationCard.hidden = secCard.hidden = phiCard.hidden = stripCard.hidden = !ok;
    emptyEl.hidden = !!ok;
    if (!ok) { D = null; dataKey = null; return; }
    const key = [c.plan, c.sampler, c.lra, c.tube, c.options];
    const dataChanged = !dataKey || key.some((v, i) => v !== dataKey[i]);
    if (dataChanged) {
      dataKey = key; D = prepare(c); lastDraw = null;
      slider.max = String(D.cut);
      drawBands();
    }
    const sel = c.selection ?? {};
    const sChanged = sel.s !== lastSelS, bChanged = sel.bend !== lastSelBend;
    lastSelS = sel.s; lastSelBend = sel.bend;
    const mid = (i) => (D.bends[i] ?? D.bends[0])?.mid ?? D.cut / 2;
    if (sChanged && sel.s != null) station = sel.s;
    else if (bChanged || dataChanged || station == null) station = bChanged || sel.s == null ? mid(sel.bend ?? 0) : sel.s;
    station = clamp(station, 0, D.cut);
    draw();
  }

  const ro = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => { const w = Math.floor(figEl.clientWidth); if (D && w && Math.abs(Math.max(220, w) - width) > 2) draw(); })
    : null;
  ro?.observe(el);
  update(ctx);
  return {
    update,
    dispose() {
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.textContent = '';
      el.classList.remove('pnl', 'pnl-seccion');
    },
  };
}
