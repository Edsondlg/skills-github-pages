// Lista de mediciones (3D + 2D), ficha de inspección, paleta de herramientas y atajos de teclado.
// Las mediciones 3D vienen de MeasureTools (onMeasureChange) y las 2D del evento 'measure' de View2D;
// MeasureTools re-formatea sus textos (lista y etiquetas 3D) en setFormat; los 2D se rehacen aquí desde mm.
import * as ui from './ui-shell.js';

const { $ } = ui;
const TOOL_KEYS = { i: 'inspect', p: 'point', d: 'distance', a: 'angle', r: 'radius', f: 'area', c: 'coords', t: 'thickness' };
const VIEW_KEYS = { 1: 'iso', 2: 'front', 3: 'top', 4: 'right' };
const DISPLAY_KEYS = { e: 'edges', x: 'xray', w: 'wireframe' };

// "Δx 1.000 · Δy 2.000 mm": la unidad una sola vez cuando es común (como MeasureTools).
function lens(f, pairs) {
  const s = pairs.map(([, v]) => f.len(v));
  const u = s[0].match(/ (\S+)$/)?.[1];
  if (u && s.every((x) => x.endsWith(` ${u}`))) return `${pairs.map(([k], i) => `${k} ${s[i].slice(0, -u.length - 1)}`).join(' · ')} ${u}`;
  return pairs.map(([k], i) => `${k} ${s[i]}`).join(' · ');
}

// Título y texto de una cota 2D (payload del evento 'measure' de View2D, en mm).
function text2d(m, f) {
  if (m.kind === 'radius') return { title: 'Radio 2D (plano)', text: `${lens(f, [['R', m.r], ['Ø', m.diameter]])} · centro ${f.point(m.c)}` };
  return { title: 'Distancia 2D (plano)', text: `${f.len(m.d)} · ${lens(f, [['ΔX', m.dx], ['ΔY', m.dy]])} · ${f.angle(m.angleDeg)}` };
}

const csvCell = (s) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

function fileBaseOf(drawing) {
  const n = String(drawing?.fileName || 'pieza').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_').trim();
  return n || 'pieza';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Respaldo (file:// sin permiso de portapapeles)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Cablea la lista de mediciones, la paleta, la ficha de inspección y los atajos. */
export function initToolsUi(app) {
  const { measure, view2d } = app;
  const fmt = () => app.getState().formatter;
  let list3d = [];
  let list2d = []; // [{ id: '2d-<id de View2D>', m: payload }]
  let inspect = null;

  const listEl = $('measureList');
  listEl.dataset.empty = 'Mide en la vista 3D con la paleta de herramientas o en el plano 2D con el modo Medir.';
  const card = document.createElement('div');
  card.id = 'inspectCard';
  card.className = 'inspect-card';
  card.hidden = true;
  listEl.before(card);

  function entries() {
    const f = fmt();
    return [
      ...list3d.map((m) => ({ id: `3d-${m.id}`, tool: m.tool, title: m.title, text: m.text })),
      ...list2d.map((e) => ({ id: e.id, tool: 'measure2d', ...text2d(e.m, f) })),
    ];
  }
  // Para exportaciones (reporte, CSV, JSON): [{ title, text }] en las unidades actuales.
  app.getMeasurements = () => entries().map(({ title, text }) => ({ title, text }));

  function render() {
    const items = entries();
    ui.renderList(listEl, items, ui.measureItem);
    $('measureCount').textContent = String(items.length);
    for (const id of ['btnMeasureCopy', 'btnMeasureCSV', 'btnMeasureClear']) $(id).disabled = !items.length;
  }

  function renderCard() {
    card.hidden = !inspect;
    if (!inspect) return (card.innerHTML = '');
    const lines = inspect.lines.slice(1).map((l) => `<div class="inspect-line">${ui.escapeHtml(l)}</div>`).join('');
    card.innerHTML = `<div class="inspect-head"><span class="inspect-title">${ui.escapeHtml(inspect.title)}</span>
<button class="btn btn-sm" type="button" data-action="pin" data-tip="Añadir a la lista de mediciones"><i data-icon="plus"></i>Fijar</button></div>${lines}`;
    ui.renderIcons(card);
  }
  card.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="pin"]') && measure.pinInspect()) ui.toast('Inspección fijada en la lista', { type: 'success', timeout: 2000 });
  });

  app.onMeasureChange((list, extra) => {
    list3d = list;
    inspect = extra.inspect || null;
    ui.setPressed($('toolPalette'), 'tool', measure.tool === 'none' ? null : measure.tool);
    render();
    renderCard();
  });

  view2d.on('measure', (m) => {
    list2d.push({ id: `2d-${m.id}`, m });
    render();
  });
  // View2D borra sus cotas en clearMeasures() y setDrawing(): la lista las sigue.
  for (const k of ['clearMeasures', 'setDrawing']) {
    const orig = view2d[k].bind(view2d);
    view2d[k] = (...args) => {
      const r = orig(...args);
      if (list2d.length) {
        list2d = [];
        render();
      }
      return r;
    };
  }
  app.onUnitsChange(() => render());

  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action="delete"]');
    if (!b) return;
    const id = b.closest('[data-measure]').dataset.measure;
    if (id.startsWith('3d-')) measure.remove(Number(id.slice(3)));
    else {
      const e2 = list2d.find((x) => x.id === id);
      if (!e2) return;
      view2d.removeMeasure(e2.m.id);
      list2d = list2d.filter((x) => x !== e2);
      render();
    }
  });

  $('btnMeasureCopy').addEventListener('click', async () => {
    const items = entries();
    if (!items.length) return;
    const ok = await copyText(items.map((m) => `${m.title}: ${m.text}`).join('\n'));
    ui.toast(ok ? `${items.length} ${items.length === 1 ? 'medición copiada' : 'mediciones copiadas'} al portapapeles` : 'No se pudo copiar al portapapeles', { type: ok ? 'success' : 'warn' });
  });
  $('btnMeasureCSV').addEventListener('click', () => {
    const items = entries();
    if (!items.length) return;
    const csv = `﻿Medición,Valor\r\n${items.map((m) => `${csvCell(m.title)},${csvCell(m.text)}`).join('\r\n')}\r\n`;
    const name = `${fileBaseOf(app.getState().drawing)}-mediciones.csv`;
    ui.downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), name);
    ui.toast(`Descargado ${name}`, { type: 'success' });
  });
  $('btnMeasureClear').addEventListener('click', () => {
    measure.clear();
    view2d.clearMeasures();
  });

  // ── Atajos ──
  const click = (sel) => document.querySelector(sel)?.click();
  for (const [k, tool] of Object.entries(TOOL_KEYS)) {
    ui.onShortcut(k, () => {
      if (ui.getActiveTab() === '2d') ui.setActiveTab('3d');
      click(`#toolPalette [data-tool="${tool}"]`);
    });
  }
  for (const [k, view] of Object.entries(VIEW_KEYS)) ui.onShortcut(k, () => click(`#viewBar [data-view="${view}"]`));
  for (const [k, d] of Object.entries(DISPLAY_KEYS)) ui.onShortcut(k, () => click(`#displayBar [data-display="${d}"]`));
  ui.onShortcut('Home', () => {
    const tab = ui.getActiveTab();
    if (tab !== '3d') click('#btn2dFit');
    if (tab !== '2d') click('#viewBar [data-view="fit"]');
  });
  ui.onShortcut('o', () => click('#btnProjection'));
  ui.onShortcut('s', () => click('#chkSection'));
  ui.onShortcut('g', () => click('#btnGenerate'));

  // Esc (si el armazón no cerró nada): sin herramienta 3D y modo 2D de selección.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || !$('modal').hidden) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (measure.tool !== 'none') measure.setTool('none');
    if (view2d.mode && view2d.mode !== 'select') click('#toolbar2d [data-mode2d="select"]');
  });

  // Teclas mostradas en las descripciones emergentes = atajos reales.
  for (const [k, view] of Object.entries(VIEW_KEYS)) {
    const b = document.querySelector(`#viewBar [data-view="${view}"]`);
    if (b) b.dataset.kbd = k;
  }
  for (const [k, d] of Object.entries(DISPLAY_KEYS)) {
    const b = document.querySelector(`#displayBar [data-display="${d}"]`);
    if (b) b.dataset.kbd = k.toUpperCase();
  }
  for (const b of document.querySelectorAll('#toolbar2d [data-mode2d]')) delete b.dataset.kbd;
  render();
}
