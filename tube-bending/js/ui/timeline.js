// Línea de tiempo de la simulación: reproducir/pausa, fase anterior/siguiente, velocidad y una barra
// de desplazamiento con los segmentos de fase proporcionales a su duración (coloreados por tipo) y
// marcas de doblez D1…Dn. La app es dueña del tiempo: este módulo solo emite intenciones (onSeek…)
// y pinta lo que recibe en setTime().
import { h, svg, fmt } from './format.js';

export const SPEEDS = [0.25, 0.5, 1, 2, 4];

const TYPE_LABEL = {
  load: 'Carga', stackChange: 'Cambio de nivel', feed: 'Avance', rotate: 'Giro', clamp: 'Cierre',
  bend: 'Doblez', mandrelRetract: 'Retracción del mandril', release: 'Liberación', return: 'Retorno', unload: 'Descarga',
};
const EPS = 1e-6;

const icon = (d) => svg('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }, svg('path', { d }));
const ICON_PLAY = 'M4.5 2.5v11l9-5.5z';
const ICON_PAUSE = 'M4 2.5h3v11H4zM9 2.5h3v11H9z';

/** "12.3 s" con el tiempo en segundos; mm:ss.d cuando pasa de un minuto. */
export function fmtClock(s) {
  if (!Number.isFinite(s)) return '—';
  if (s < 60) return `${fmt(s, 1)} s`;
  const m = Math.floor(s / 60);
  return `${m}:${fmt(s - 60 * m, 1).padStart(4, '0')}`;
}

/** Índice de la fase siguiente / anterior a t (salta fases de duración cero en el mismo instante). */
export function nextPhaseStart(phases, t) {
  for (const ph of phases) if (ph.start > t + EPS) return ph.start;
  return null;
}
export function prevPhaseStart(phases, t) {
  for (let k = phases.length - 1; k >= 0; k--) if (phases[k].start < t - EPS) return phases[k].start;
  return phases.length ? phases[0].start : null;
}

/**
 * createTimeline(el, { onSeek(t), onPlay(bool), onSpeed(x), onBend(i) }) → API
 * API: setSequence(phases, total), setTime(t, playing), setSpeed(x), seekPhase(k), next(), prev(),
 *      segmentCount, dispose()
 */
export function createTimeline(el, { onSeek, onPlay, onSpeed, onBend } = {}) {
  let phases = [], total = 0, t = 0, playing = false, speed = 1;

  const btnPrev = h('button', { type: 'button', class: 'tl-btn', title: 'Fase anterior (←)', 'aria-label': 'Fase anterior', onclick: () => api.prev() },
    icon('M3 2.5h2v11H3zM13 2.5v11L6 8z'));
  const btnPlay = h('button', { type: 'button', class: 'tl-btn tl-play', title: 'Reproducir (Espacio)', 'aria-label': 'Reproducir', onclick: () => onPlay?.(!playing) },
    icon(ICON_PLAY));
  const btnNext = h('button', { type: 'button', class: 'tl-btn', title: 'Fase siguiente (→)', 'aria-label': 'Fase siguiente', onclick: () => api.next() },
    icon('M11 2.5h2v11h-2zM3 2.5v11L10 8z'));
  const speedSel = h('select', { class: 'tl-speed', 'aria-label': 'Velocidad de reproducción', title: 'Velocidad',
    onchange: () => onSpeed?.(Number(speedSel.value)) },
  SPEEDS.map((x) => h('option', { value: String(x) }, `${fmt(x, x < 1 ? 2 : 0)}×`)));
  speedSel.value = '1';
  const clock = h('span', { class: 'tl-clock' });

  const segs = h('div', { class: 'tl-segs' });
  const marks = h('div', { class: 'tl-marks' });
  const head = h('div', { class: 'tl-head' });
  const tip = h('div', { class: 'tl-tip', hidden: true });
  const track = h('div', {
    class: 'tl-track', role: 'slider', tabindex: '0', 'aria-label': 'Tiempo de la simulación', 'aria-valuemin': '0',
  }, segs, head, tip);
  const scrub = h('div', { class: 'tl-scrub' }, marks, track);

  el.classList.add('tl');
  el.append(h('div', { class: 'tl-ctrl' }, btnPrev, btnPlay, btnNext, speedSel), scrub, clock);

  // ── arrastre / clic para buscar ──
  const tAtX = (clientX) => {
    const r = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / Math.max(1, r.width))) * total;
  };
  let dragging = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !total) return;
    dragging = true; track.setPointerCapture(e.pointerId);
    onSeek?.(tAtX(e.clientX));
  });
  track.addEventListener('pointermove', (e) => {
    if (dragging) onSeek?.(tAtX(e.clientX));
    else if (total) showTip(e.clientX);
  });
  const endDrag = (e) => { dragging = false; if (track.hasPointerCapture?.(e.pointerId)) track.releasePointerCapture(e.pointerId); };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', () => { tip.hidden = true; });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'Home') { onSeek?.(0); e.preventDefault(); }
    else if (e.key === 'End') { onSeek?.(total); e.preventDefault(); }
  });

  function phaseAt(time) {
    let k = 0;
    for (let i = 0; i < phases.length; i++) if (phases[i].start <= time + EPS) k = i;
    return k;
  }
  function showTip(clientX) {
    const time = tAtX(clientX), ph = phases[phaseAt(time)];
    if (!ph) return;
    tip.hidden = false;
    tip.textContent = `${ph.label || TYPE_LABEL[ph.type] || ph.type} · ${fmtClock(time)}`;
    const r = track.getBoundingClientRect();
    tip.style.left = `${Math.min(Math.max(clientX - r.left, 60), r.width - 60)}px`;
  }

  function typeClass(type) {
    if (type === 'bend') return 'tl-seg-bend';
    if (type === 'feed') return 'tl-seg-feed';
    if (type === 'rotate') return 'tl-seg-rotate';
    return 'tl-seg-other';
  }

  const api = {
    setSequence(ph, tot) {
      phases = ph || []; total = tot || 0;
      segs.textContent = ''; marks.textContent = '';
      track.setAttribute('aria-valuemax', String(total));
      for (let k = 0; k < phases.length; k++) {
        const p = phases[k];
        segs.append(h('span', {
          class: `tl-seg ${typeClass(p.type)}`, dataset: { k: String(k), type: p.type },
          style: { left: `${(100 * p.start) / total}%`, width: `${(100 * p.duration) / total}%` },
        }));
        if (p.type === 'bend' && p.bend >= 0) {
          marks.append(h('button', {
            type: 'button', class: 'tl-mark', dataset: { bend: String(p.bend) },
            style: { left: `${(100 * (p.start + p.duration / 2)) / total}%` },
            title: p.label, 'aria-label': `Ir al doblez ${p.bend + 1}`,
            onclick: () => { onBend?.(p.bend); onSeek?.(p.start + p.duration / 2); },
          }, `D${p.bend + 1}`));
        }
      }
      api.setTime(Math.min(t, total), playing);
    },
    setTime(time, isPlaying) {
      t = time;
      if (isPlaying !== playing) {
        playing = isPlaying;
        btnPlay.replaceChildren(icon(playing ? ICON_PAUSE : ICON_PLAY));
        const lab = playing ? 'Pausa' : 'Reproducir';
        btnPlay.setAttribute('aria-label', lab); btnPlay.title = `${lab} (Espacio)`;
        btnPlay.classList.toggle('is-on', playing);
      }
      const f = total > 0 ? t / total : 0;
      head.style.left = `${100 * f}%`;
      track.setAttribute('aria-valuenow', t.toFixed(2));
      track.setAttribute('aria-valuetext', fmtClock(t));
      const txt = `${fmtClock(t)} / ${fmtClock(total)}`;
      if (clock.textContent !== txt) clock.textContent = txt;
    },
    setSpeed(x) { speed = x; speedSel.value = String(x); },
    get speed() { return speed; },
    seekPhase(k) { const p = phases[k]; if (p) onSeek?.(p.start); return p?.start ?? null; },
    next() { const s = nextPhaseStart(phases, t); if (s != null) onSeek?.(s); },
    prev() { const s = prevPhaseStart(phases, t); if (s != null) onSeek?.(s); },
    get segmentCount() { return segs.childElementCount; },
    dispose() { el.textContent = ''; el.classList.remove('tl'); },
  };
  return api;
}
