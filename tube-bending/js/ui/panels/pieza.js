// Panel "Pieza": carga del STEP (archivo o ejemplo), resumen de la geometría importada, perfil de
// espesor t(s) cuando el calibre es variable, extremo inicial y datos que el STEP no trae (pared
// manual, cordón), programa de doblado LRA y tabla de puntos de intersección XYZ.
import { xyzTable } from '../../geometry.js';
import { h, svg, setChildren, fmt, fmtMm, statusIcon, niceTicks, r2 } from '../format.js';

export const id = 'pieza';
export const title = 'Pieza';

const DEG = Math.PI / 180;
const CLR_TOL = 0.05; // mm: CLRs que difieren menos se consideran el mismo herramental
const SURF_LABEL = { cylinder: 'cilindro', torus: 'toro', cone: 'cono', plane: 'plano', bspline: 'B-spline', other: 'otra' };

/** Número finito de un campo; '' → null; inválido → undefined (no se envía). */
function readNumber(input, { min = -Infinity, max = Infinity, gt } = {}) {
  const raw = input.value.trim();
  if (raw === '') return null;
  const v = Number(raw.replace(',', '.'));
  if (!Number.isFinite(v) || v < min || v > max || (gt != null && !(v > gt))) return undefined;
  return v;
}

/** Fija el valor de un campo sin pisar lo que el usuario está escribiendo. */
function syncValue(input, v) {
  if (document.activeElement === input) return;
  const s = v == null ? '' : String(v);
  if (input.value !== s) input.value = s;
  input.removeAttribute('aria-invalid');
}

function distinctClrs(bends) {
  const out = [];
  for (const b of bends) if (!out.some((c) => Math.abs(c - b.clr) <= CLR_TOL)) out.push(b.clr);
  return out.sort((a, b) => a - b);
}

/** Zonas de doblez [s0, s1] a lo largo de la pieza desde el extremo A (para sombrear t(s)). */
function bendZones(tube) {
  const zones = [];
  let s = 0;
  for (const seg of tube.segments ?? []) {
    if (seg.type === 'bend') { const l = seg.clr * seg.angle * DEG; zones.push([s, s + l]); s += l; } else s += seg.length ?? 0;
  }
  return zones;
}

function wallChart(tube) {
  const W = 360, H = 130, L = 36, R = 8, T = 8, B = 26;
  const total = tube.totalLength || tube.wall.at(-1).s1;
  const tMin = Math.min(...tube.wall.flatMap((w) => [w.t0, w.t1]));
  const tMax = Math.max(...tube.wall.flatMap((w) => [w.t0, w.t1]));
  const pad = Math.max(0.1, (tMax - tMin) * 0.15);
  const ty = niceTicks(Math.max(0, tMin - pad), tMax + pad, 4);
  const tx = niceTicks(0, total, 5);
  const X = (s) => L + (s / total) * (W - L - R);
  const Y = (t) => T + (1 - (t - ty.lo) / (ty.hi - ty.lo)) * (H - T - B);
  const pts = tube.wall.flatMap((w) => [`${r2(X(w.s0))},${r2(Y(w.t0))}`, `${r2(X(w.s1))},${r2(Y(w.t1))}`]).join(' ');
  return svg('svg', { class: 'pnl-svg pp-wchart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Espesor de pared a lo largo de la pieza' },
    bendZones(tube).map(([a, b], i) => svg('g', null,
      svg('rect', { class: 'pp-wzone', x: r2(X(a)), y: T, width: r2(Math.max(1, X(b) - X(a))), height: H - T - B }),
      svg('text', { class: 'pp-wzone-lab', x: r2((X(a) + X(b)) / 2), y: T + 10, 'text-anchor': 'middle' }, `D${i + 1}`))),
    ty.ticks.map((v) => svg('g', null,
      svg('line', { class: 'pp-wgrid', x1: L, x2: W - R, y1: r2(Y(v)), y2: r2(Y(v)) }),
      svg('text', { class: 'pp-wtick', x: L - 4, y: r2(Y(v) + 3.5), 'text-anchor': 'end' }, fmt(v, ty.decimals)))),
    tx.ticks.filter((v) => v <= total + 1e-6).map((v) => svg('text', { class: 'pp-wtick', x: r2(X(v)), y: H - B + 13, 'text-anchor': 'middle' }, fmt(v, 0))),
    svg('line', { class: 'pp-waxis', x1: L, x2: W - R, y1: H - B, y2: H - B }),
    svg('polyline', { class: 'pp-wline', points: pts }),
    svg('text', { class: 'pp-wtitle', x: W - R, y: H - 2, 'text-anchor': 'end' }, 's desde el extremo A (mm)'),
    svg('text', { class: 'pp-wtitle', x: 2, y: T + 2, 'dominant-baseline': 'hanging' }, 't'));
}

function lraText(lra) {
  const f2 = (x) => x.toFixed(2);
  const lines = ['Doblez\tL (mm)\tR (°)\tA (°)\tCLR (mm)'];
  lra.bends.forEach((b, i) => lines.push([i + 1, f2(b.L), f2(b.R), f2(b.A), f2(b.clr)].join('\t')));
  lines.push(['Cola', f2(lra.tail), '', '', ''].join('\t'));
  return lines.join('\n');
}

export function mount(el, ctx) {
  el.classList.add('pnl', 'pnl-pieza');
  let cur = ctx;

  // ── Carga ─────────────────────────────────────────────────────────────────────────────────
  const fileInput = h('input', {
    type: 'file', id: 'pieza-file', accept: '.stp,.step,.STP,.STEP', class: 'pp-file-input',
    onchange: () => { const f = fileInput.files?.[0]; if (f) cur.actions?.loadFile?.(f); fileInput.value = ''; },
  });
  const fileNameEl = h('span', { class: 'pp-drop-file' });
  const errorEl = h('div', { class: 'pp-error', role: 'alert', hidden: true });
  const drop = h('div', { class: 'pp-drop', id: 'pieza-drop' },
    h('div', { class: 'pp-drop-text' },
      h('strong', null, 'Arrastre aquí un archivo STEP'),
      h('span', { class: 'pnl-muted' }, 'AP203 / AP214 / AP242 · .stp, .step')),
    h('label', { class: 'pp-btn pp-btn-primary', for: 'pieza-file' }, 'Abrir STEP…'),
    fileInput);
  let dragDepth = 0;
  drop.addEventListener('dragenter', (e) => { e.preventDefault(); dragDepth++; drop.classList.add('is-over'); });
  drop.addEventListener('dragover', (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
  drop.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; drop.classList.remove('is-over'); } });
  drop.addEventListener('drop', (e) => {
    e.preventDefault(); dragDepth = 0; drop.classList.remove('is-over');
    const f = e.dataTransfer?.files?.[0];
    if (f) cur.actions?.loadFile?.(f);
  });
  const samplesEl = h('div', { class: 'pp-samples' });
  const loadCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Archivo'), fileNameEl),
    errorEl, drop,
    h('h4', { class: 'pnl-subhead' }, 'Piezas de ejemplo'),
    samplesEl);

  // ── Resumen ───────────────────────────────────────────────────────────────────────────────
  const summaryEl = h('section', { class: 'pnl-card' });

  // ── Configuración (formulario: se construye una sola vez) ────────────────────────────────
  const frontBtns = ['A', 'B'].map((f) => h('button', {
    type: 'button', id: `pieza-front-${f}`, class: 'pp-seg-btn', 'aria-pressed': 'false',
    onclick: () => { if ((cur.lra?.front ?? 'A') !== f) cur.actions?.setFront?.(f); },
  }, `Extremo ${f}`));
  const frontNote = h('p', { class: 'pnl-note' });
  const wallInput = h('input', { type: 'number', id: 'pieza-wall', class: 'pp-input', min: '0.1', step: '0.05', inputmode: 'decimal', required: true, placeholder: 'requerido' });
  const wallRow = h('div', { class: 'pp-field pp-field-req', hidden: true },
    h('label', { for: 'pieza-wall' }, 'Espesor de pared', h('span', { class: 'pnl-muted' }, ' mm · el STEP no tiene superficie interior')),
    wallInput);
  wallInput.addEventListener('change', () => {
    const v = readNumber(wallInput, { gt: 0, max: (cur.tube?.OD ?? Infinity) / 2 });
    if (v === undefined || v === null) { wallInput.setAttribute('aria-invalid', 'true'); return; }
    wallInput.removeAttribute('aria-invalid');
    cur.actions?.setOption?.('wall', v);
  });
  const seamInput = h('input', { type: 'number', id: 'pieza-seam', class: 'pp-input', min: '-360', max: '360', step: '1', inputmode: 'decimal', placeholder: '—' });
  seamInput.addEventListener('change', () => {
    const v = readNumber(seamInput, { min: -360, max: 360 });
    if (v === undefined) { seamInput.setAttribute('aria-invalid', 'true'); return; }
    seamInput.removeAttribute('aria-invalid');
    cur.actions?.setOption?.('seamAngle', v);
  });
  const cfgCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Preparación')),
    h('div', { class: 'pp-field' },
      h('span', { class: 'pp-label', id: 'pieza-front-label' }, 'Extremo inicial'),
      h('div', { class: 'pp-seg', role: 'group', 'aria-labelledby': 'pieza-front-label' }, frontBtns)),
    frontNote,
    wallRow,
    h('div', { class: 'pp-field' },
      h('label', { for: 'pieza-seam' }, 'Cordón de soldadura', h('span', { class: 'pnl-muted' }, ' ° · opcional')),
      seamInput),
    h('p', { class: 'pnl-note' }, 'Ángulo de material φ del cordón: 0° = +Y de la máquina al cargar, 90° = +Z (extradós del primer doblez). Vacío = sin cordón (tubo sin costura).'));

  // ── LRA ───────────────────────────────────────────────────────────────────────────────────
  const lraBody = h('tbody');
  const lraFoot = h('tfoot');
  const copyMsg = h('span', { class: 'pnl-card-sub', 'aria-live': 'polite' });
  const copyArea = h('textarea', { id: 'pieza-lra-text', class: 'pp-copy-area', readonly: true, rows: '4', hidden: true, 'aria-label': 'Programa LRA en texto' });
  const copyBtn = h('button', { type: 'button', id: 'pieza-copy-lra', class: 'pp-btn' }, 'Copiar LRA');
  copyBtn.addEventListener('click', () => {
    if (!cur.lra) return;
    const text = lraText(cur.lra);
    const fallback = () => {
      copyArea.value = text; copyArea.hidden = false; copyArea.focus(); copyArea.select();
      copyMsg.textContent = 'Copie el texto seleccionado (Ctrl+C)';
    };
    try {
      navigator.clipboard.writeText(text).then(() => { copyArea.hidden = true; copyMsg.textContent = 'Copiado al portapapeles'; }, fallback);
    } catch { fallback(); }
  });
  const lraCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Programa de doblado (LRA)'), copyMsg, copyBtn),
    h('div', { class: 'pnl-scroll' },
      h('table', { class: 'pnl-table pp-table' },
        h('thead', null, h('tr', null,
          h('th', { scope: 'col' }, 'Doblez'),
          h('th', { scope: 'col', class: 'num' }, 'L recta', h('span', { class: 'pp-unit' }, 'mm')),
          h('th', { scope: 'col', class: 'num' }, 'R giro', h('span', { class: 'pp-unit' }, '°')),
          h('th', { scope: 'col', class: 'num' }, 'A ángulo', h('span', { class: 'pp-unit' }, '°')),
          h('th', { scope: 'col', class: 'num' }, 'CLR', h('span', { class: 'pp-unit' }, 'mm')))),
        lraBody, lraFoot)),
    copyArea);

  // ── XYZ ───────────────────────────────────────────────────────────────────────────────────
  const xyzBody = h('tbody');
  const xyzNote = h('p', { class: 'pnl-note' });
  const xyzCard = h('section', { class: 'pnl-card' },
    h('header', { class: 'pnl-card-head' }, h('h3', null, 'Puntos de intersección (XYZ)'), h('span', { class: 'pnl-card-sub' }, 'coordenadas del modelo, mm')),
    h('div', { class: 'pnl-scroll' },
      h('table', { class: 'pnl-table pp-table' },
        h('thead', null, h('tr', null,
          h('th', { scope: 'col' }, 'Punto'),
          h('th', { scope: 'col', class: 'num' }, 'X'), h('th', { scope: 'col', class: 'num' }, 'Y'), h('th', { scope: 'col', class: 'num' }, 'Z'),
          h('th', { scope: 'col', class: 'num' }, 'CLR'))),
        xyzBody)),
    xyzNote);

  el.append(loadCard, summaryEl, cfgCard, lraCard, xyzCard);

  // ── Render ────────────────────────────────────────────────────────────────────────────────
  let lastSamples = null, lastSampleId, lastMaterials = null;
  function renderSamples() {
    const mats = cur.materials ?? [];
    setChildren(samplesEl, (cur.samples ?? []).map((s) => {
      const m = mats.find((x) => x.id === s.materialId);
      const on = s.id === cur.currentSampleId;
      return h('button', {
        type: 'button', id: `pieza-sample-${s.id}`, class: 'pp-sample' + (on ? ' is-on' : ''), 'aria-pressed': String(on),
        onclick: () => cur.actions?.loadSample?.(s.id),
      },
        h('span', { class: 'pp-sample-name' }, s.name),
        h('span', { class: 'pp-sample-desc' }, s.description),
        h('span', { class: 'pp-sample-mat' }, 'Material sugerido: ', h('b', null, m?.name ?? s.materialId)));
    }));
  }

  function renderSummary() {
    const { tube, lra } = cur;
    if (!tube) { setChildren(summaryEl, h('p', { class: 'pnl-empty' }, 'Abra un archivo STEP o elija una pieza de ejemplo.')); return; }
    const bends = lra?.bends ?? [];
    const clrs = distinctClrs(bends);
    const surf = tube.source?.surfaces ?? {};
    const surfText = Object.entries(surf).filter(([, n]) => n > 0).map(([k, n]) => `${SURF_LABEL[k] ?? k} ${n}`).join(' · ') || '—';
    const warns = tube.source?.warnings ?? [];
    const wallKnown = tube.nominalWall != null;
    setChildren(summaryEl,
      h('header', { class: 'pnl-card-head' }, h('h3', null, 'Resumen de la pieza'),
        tube.variableWall ? h('span', { class: 'pp-badge', id: 'pieza-variable-badge' }, 'Calibre variable') : null),
      h('dl', { class: 'pnl-kv' },
        h('dt', null, 'Nombre'), h('dd', { class: 'pp-dd-text', title: tube.name }, tube.name || '—'),
        h('dt', null, 'Archivo'), h('dd', { class: 'pp-dd-text', title: cur.fileName }, cur.fileName || '—'),
        h('dt', null, 'Diámetro exterior (DE)'), h('dd', null, fmtMm(tube.OD, 2)),
        h('dt', null, 'Espesor nominal'), h('dd', null, wallKnown ? fmtMm(tube.nominalWall, 2) : (cur.options?.wall != null ? `${fmtMm(cur.options.wall, 2)} (manual)` : 'sin dato')),
        wallKnown ? [h('dt', null, 'Espesor mín. / máx.'), h('dd', null, `${fmt(tube.minWall, 2)} / ${fmtMm(tube.maxWall, 2)}`)] : null,
        h('dt', null, 'Longitud desarrollada'), h('dd', null, fmtMm(tube.totalLength, 1)),
        h('dt', null, 'N.º de dobleces'), h('dd', null, String(bends.length)),
        h('dt', null, 'CLR distintos'), h('dd', null, clrs.length ? `${clrs.length}: ${clrs.map((c) => fmt(c, 2)).join(' / ')} mm` : '—'),
        h('dt', null, 'Superficies del STEP'), h('dd', { class: 'pp-dd-text', title: tube.source?.schema }, surfText),
        h('dt', null, 'Entidades'), h('dd', null, tube.source?.entityCount != null ? fmt(tube.source.entityCount, 0) : '—')),
      tube.variableWall && tube.wall?.length ? h('div', { class: 'pp-wwrap' },
        h('h4', { class: 'pnl-subhead' }, 'Espesor de pared t(s)', h('span', { class: 'pp-unit-inline' }, ' mm')),
        wallChart(tube),
        h('p', { class: 'pnl-note' }, 'Zonas sombreadas: dobleces (D1 = primero desde el extremo A).')) : null,
      warns.length ? h('ul', { class: 'pp-warns' }, warns.map((w) => h('li', null, statusIcon('warning'), h('span', null, w)))) : null);
  }

  function renderForm() {
    const front = cur.lra?.front ?? 'A';
    frontBtns.forEach((b, i) => {
      const on = ['A', 'B'][i] === front;
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on));
      b.disabled = !cur.tube;
    });
    const first = cur.lra?.bends?.[0];
    frontNote.textContent = !cur.lra ? 'Extremo de la pieza que entra primero a la máquina.'
      : front === 'A'
        ? `Se dobla primero el extremo A (inicio del modelo STEP); recta inicial ${fmtMm(first?.L, 1)}. B invierte el orden de dobleces.`
        : `Se dobla primero el extremo B (final del modelo STEP); recta inicial ${fmtMm(first?.L, 1)}. A sigue el orden del modelo.`;
    const needWall = !!cur.tube && cur.tube.wall == null;
    wallRow.hidden = !needWall;
    syncValue(wallInput, cur.options?.wall ?? null);
    if (needWall && cur.options?.wall == null) wallInput.setAttribute('aria-invalid', 'true');
    syncValue(seamInput, cur.options?.seamAngle ?? null);
  }

  function renderTables() {
    const { lra, tube } = cur;
    if (!lra) { setChildren(lraBody); setChildren(lraFoot); setChildren(xyzBody); xyzNote.textContent = ''; return; }
    setChildren(lraBody, lra.bends.map((b, i) => h('tr', null,
      h('th', { scope: 'row', class: 'pp-n' }, String(i + 1)),
      h('td', { class: 'num' }, fmt(b.L, 2)), h('td', { class: 'num' }, fmt(b.R, 2)),
      h('td', { class: 'num' }, fmt(b.A, 2)), h('td', { class: 'num' }, fmt(b.clr, 2)))));
    setChildren(lraFoot, h('tr', null,
      h('th', { scope: 'row' }, 'Cola'), h('td', { class: 'num' }, fmt(lra.tail, 2)),
      h('td', { class: 'num pnl-muted' }, '—'), h('td', { class: 'num pnl-muted' }, '—'), h('td', { class: 'num pnl-muted' }, '—')));
    copyArea.hidden = true; copyMsg.textContent = `desde el extremo ${lra.front ?? 'A'}`;

    let rows = [];
    try { rows = tube?.segments?.length ? xyzTable(tube) : []; } catch { rows = []; }
    let endN = 0;
    const tangentCount = new Map();
    setChildren(xyzBody, rows.map((r) => {
      let label, flag = null;
      if (r.kind === 'end') label = `Extremo ${endN++ === 0 ? 'A' : 'B'}`;
      else if (r.kind === 'tangent180') {
        const k = (tangentCount.get(r.bend) ?? 0) + 1; tangentCount.set(r.bend, k);
        label = `D${r.bend + 1} · T${k}`;
        flag = h('span', { class: 'pp-flag', title: 'Doblez de 180°: no hay punto de intersección; se dan los dos puntos de tangencia' }, '180°');
      } else label = `D${r.bend + 1}`;
      return h('tr', { class: r.kind === 'tangent180' ? 'pp-row-t180' : null },
        h('th', { scope: 'row' }, h('span', { class: 'pp-pt' }, label, flag)),
        h('td', { class: 'num' }, fmt(r.x, 2)), h('td', { class: 'num' }, fmt(r.y, 2)), h('td', { class: 'num' }, fmt(r.z, 2)),
        h('td', { class: 'num' }, r.kind === 'end' ? '—' : fmt(r.clr, 2)));
    }));
    xyzNote.textContent = tangentCount.size
      ? 'Siempre del extremo A al B. Filas «180°»: puntos de tangencia de un doblez de 180°, que no tiene intersección finita.'
      : 'Siempre del extremo A al B (independiente del extremo inicial).';
  }

  let lastData = null, lastError;
  function update(ctx2) {
    cur = ctx2;
    if (ctx2.importError !== lastError) {
      lastError = ctx2.importError;
      errorEl.hidden = !lastError;
      setChildren(errorEl, lastError ? [statusIcon('fail'), h('span', null, lastError)] : []);
    }
    fileNameEl.textContent = ctx2.fileName ?? '';
    fileNameEl.className = 'pnl-card-sub pp-drop-file';
    if (ctx2.samples !== lastSamples || ctx2.currentSampleId !== lastSampleId || ctx2.materials !== lastMaterials) {
      lastSamples = ctx2.samples; lastSampleId = ctx2.currentSampleId; lastMaterials = ctx2.materials;
      renderSamples();
    }
    const data = [ctx2.tube, ctx2.lra, ctx2.options, ctx2.fileName];
    if (!lastData || data.some((v, i) => v !== lastData[i])) {
      lastData = data;
      renderSummary(); renderForm(); renderTables();
    }
  }
  update(ctx);
  return { update, dispose() { el.textContent = ''; el.classList.remove('pnl', 'pnl-pieza'); } };
}
