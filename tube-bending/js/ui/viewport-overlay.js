// Controles superpuestos al visor 3D: modo de color + leyenda (arriba a la izquierda), cámaras, corte
// y visibilidad de herramientas (arriba a la derecha), HUD de máquina (abajo a la izquierda) y la capa
// de "soltar archivo". Solo DOM: emite intenciones; la app aplica al visor.
import { h, svg, fmt } from './format.js';
import { fmtClock } from './timeline.js';

export const COLOR_MODES = [
  ['realistic', 'Realista'], ['thickness', 'Espesor'], ['thinning', 'Adelgazamiento'], ['majorStrain', 'Deformación mayor'], ['fld', 'FLD'],
];
export const CAMERAS = [['iso', 'Iso'], ['top', 'Planta'], ['front', 'Frente'], ['head', 'Cabezal'], ['follow', 'Seguir']];
export const GROUPS = [
  ['machine', 'Máquina'], ['bendDie', 'Dado de doblez'], ['clampDie', 'Mordaza'], ['pressureDie', 'Dado de presión'],
  ['wiperDie', 'Limpiador'], ['mandrel', 'Mandril'], ['collet', 'Boquilla (collet)'], ['tube', 'Tubo'],
  ['labels', 'Etiquetas'], ['floor', 'Piso'],
];

const ico = (...paths) => svg('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true', class: 'vo-ico' }, paths.map((d) => svg('path', { d })));

/**
 * createViewportOverlay(stageEl, { onColorMode, onCamera, onCutaway, onVisible, visibility })
 * → { setColorMode(mode, legend), setCamera(id), setCutaway(on), setVisibility(map), setHud(st, info), setDrop(on), setNotice(text|null) }
 */
export function createViewportOverlay(stage, { onColorMode, onCamera, onCutaway, onVisible, visibility = {} } = {}) {
  // ── modo de color + leyenda ──
  const modeBtns = COLOR_MODES.map(([k, label]) => h('button', {
    type: 'button', class: 'vo-seg-btn', dataset: { mode: k }, 'aria-pressed': 'false', onclick: () => onColorMode?.(k),
  }, label));
  const legendEl = h('div', { class: 'vo-legend', hidden: true });
  const left = h('div', { class: 'vo-group vo-left' },
    h('div', { class: 'vo-seg', role: 'group', 'aria-label': 'Modo de color' }, modeBtns), legendEl);

  // ── cámaras, corte, herramientas ──
  const camBtns = CAMERAS.map(([k, label]) => h('button', {
    type: 'button', class: 'vo-seg-btn', dataset: { camera: k }, 'aria-pressed': 'false', onclick: () => onCamera?.(k),
  }, label));
  let cutaway = false;
  const cutBtn = h('button', {
    type: 'button', class: 'vo-btn', 'aria-pressed': 'false', title: 'Corte longitudinal del tubo y herramental',
    onclick: () => onCutaway?.(!cutaway),
  }, ico('M2 13.5 13.5 2', 'M2.5 8.5a6 6 0 0 0 5 5'), 'Corte');
  const checks = new Map();
  const pop = h('div', { class: 'vo-pop', id: 'vo-tools-pop', hidden: true, role: 'group', 'aria-label': 'Visibilidad' },
    GROUPS.map(([k, label]) => {
      const cb = h('input', { type: 'checkbox', checked: visibility[k] !== false, dataset: { group: k }, onchange: () => onVisible?.(k, cb.checked) });
      checks.set(k, cb);
      return h('label', { class: 'vo-check' }, cb, h('span', null, label));
    }));
  const toolsBtn = h('button', {
    type: 'button', class: 'vo-btn', 'aria-expanded': 'false', 'aria-controls': 'vo-tools-pop',
    onclick: (e) => { e.stopPropagation(); setPop(pop.hidden); },
  }, ico('M2 4h12M2 8h12M2 12h12', 'M5 2.5v3M10 6.5v3M7 10.5v3'), 'Herramientas');
  function setPop(open) { pop.hidden = !open; toolsBtn.setAttribute('aria-expanded', String(open)); }
  document.addEventListener('pointerdown', (e) => { if (!pop.hidden && !pop.contains(e.target) && e.target !== toolsBtn) setPop(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) { setPop(false); toolsBtn.focus(); } });
  const right = h('div', { class: 'vo-group vo-right' },
    h('div', { class: 'vo-seg', role: 'group', 'aria-label': 'Cámara' }, camBtns),
    h('div', { class: 'vo-row' }, cutBtn, h('div', { class: 'vo-popwrap' }, toolsBtn, pop)));

  // ── HUD ──
  const hudVals = {};
  const hudItem = (key, label) => h('div', { class: `vo-hud-i vo-hud-${key}` }, h('span', { class: 'vo-hud-k' }, label), hudVals[key] = h('span', { class: 'vo-hud-v' }, '—'));
  const hud = h('div', { class: 'vo-hud', 'aria-label': 'Estado de la máquina' },
    hudItem('bend', 'Doblez'), hudItem('phase', 'Fase'), hudItem('die', 'Ángulo del dado'),
    hudItem('rot', 'Giro acumulado'), hudItem('car', 'Carro'), hudItem('time', 'Tiempo'));

  const drop = h('div', { class: 'vo-drop', hidden: true }, h('div', null, 'Suelte el archivo STEP para cargarlo'));
  const notice = h('div', { class: 'vo-notice', hidden: true });

  const layer = h('div', { class: 'vo' }, h('div', { class: 'vo-top' }, left, right), hud, notice, drop);
  stage.append(layer);

  const setText = (el, s) => { if (el.textContent !== s) el.textContent = s; };

  function renderLegend(mode, lg) {
    legendEl.textContent = '';
    const stops = lg?.stops ?? [];
    if (mode === 'realistic' || !stops.length) { legendEl.hidden = true; return; }
    legendEl.hidden = false;
    legendEl.append(h('div', { class: 'vo-legend-title' }, lg.title, lg.unit ? h('span', { class: 'vo-legend-unit' }, ` (${lg.unit})`) : null));
    if (mode === 'fld') {
      legendEl.append(h('div', { class: 'vo-legend-swatches' }, stops.map((s) =>
        h('span', { class: 'vo-sw' }, h('i', { style: { background: s.color } }), s.label ?? fmt(s.value, 0)))));
      return;
    }
    const v0 = stops[0].value, v1 = stops[stops.length - 1].value, span = v1 - v0 || 1;
    const pos = (v) => (100 * (v - v0)) / span;
    const grad = stops.map((s) => `${s.color} ${pos(s.value).toFixed(1)}%`).join(', ');
    // Three ticks (min, middle, max) with bare numbers — the unit is in the title. The end ticks are
    // aligned inward so their text never overflows the legend box.
    const mid = stops[Math.floor((stops.length - 1) / 2)];
    const ticks = [stops[0], mid, stops[stops.length - 1]];
    const signed = mode === 'thinning';
    const num = (v) => (signed && v > 0 ? '+' : '') + fmt(v, Math.abs(span) < 10 ? 2 : 1);
    legendEl.append(
      h('div', { class: 'vo-legend-bar', style: { background: `linear-gradient(to right, ${grad})` } }),
      h('div', { class: 'vo-legend-ticks' }, ticks.map((s, i) => h('span', {
        class: i === 0 ? 'vo-tick-start' : i === 2 ? 'vo-tick-end' : null,
        style: { left: `${pos(s.value)}%` },
      }, num(s.value)))),
      signed ? h('div', { class: 'vo-legend-ends' }, h('span', null, 'engrosamiento'), h('span', null, 'adelgazamiento')) : null);
  }

  return {
    setColorMode(mode, legend) {
      for (const b of modeBtns) { const on = b.dataset.mode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }
      renderLegend(mode, legend);
    },
    setCamera(cam) {
      for (const b of camBtns) { const on = b.dataset.camera === cam; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); }
    },
    setCutaway(on) { cutaway = on; cutBtn.classList.toggle('is-on', on); cutBtn.setAttribute('aria-pressed', String(on)); },
    setVisibility(map) { for (const [k, cb] of checks) cb.checked = map[k] !== false; },
    /** st: estado de kin.stateAt; info: { nBends, t, total } */
    setHud(st, { nBends, t, total }) {
      if (!st) return;
      setText(hudVals.bend, st.bendIndex >= 0 ? `${st.bendIndex + 1} / ${nBends}` : `— / ${nBends}`);
      setText(hudVals.phase, st.label || '—');
      setText(hudVals.die, `${fmt(st.dieAngle, 1)}°`);
      setText(hudVals.rot, `${fmt(st.colletRotation, 1)}°`);
      setText(hudVals.car, `${fmt(st.carriageX, 1)} mm`);
      setText(hudVals.time, `${fmtClock(t)} / ${fmtClock(total)}`);
    },
    setDrop(on) { drop.hidden = !on; },
    setNotice(text) { notice.hidden = !text; notice.textContent = text || ''; },
  };
}
