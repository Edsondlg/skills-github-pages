// Lista de mediciones (3D + 2D), ficha de inspección, paleta de herramientas y atajos de teclado.
// Las mediciones 3D vienen de MeasureTools (onMeasureChange) y las 2D del evento 'measure' de View2D;
// los textos se rehacen desde los valores numéricos (mm) al cambiar de unidades.
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

const vec = (d) => `(${d.map((v) => (+v).toFixed(3)).join(', ')})`;

// Texto de una medición 3D con el formateador f (mismas reglas que MeasureTools).
function text3d(m, f) {
  const v = m.values || {};
  switch (m.tool) {
    case 'point':
      return `${f.len(v.distance)} · ${lens(f, [['Δx', v.dx], ['Δy', v.dy], ['Δz', v.dz]])}`;
    case 'distance': {
      const extra = v.parallel ? 'caras paralelas' : v.exact ? '' : 'entre puntos seleccionados';
      return `${f.len(v.distance)}${extra ? ` · ${extra}` : ''}`;
    }
    case 'radius':
      return `${lens(f, [['R', v.radius], ['Ø', v.diameter]])} · centro ${f.point(v.center)}`;
    case 'area':
      return `${f.area(v.area)} · ${v.count} ${v.count === 1 ? 'cara' : 'caras'}`;
    case 'coords':
      return f.point(v.point);
    case 'thickness':
      return `${f.len(v.thickness)}${v.exact ? '' : ' (aprox. malla)'}`;
    case 'inspect': {
      if (v.type === 'vertex') return f.point(v.point);
      const out = [];
      if (v.radius > 0) out.push(lens(f, [['R', v.radius], ['Ø', v.diameter]]));
      if (v.semiAngleDeg != null) out.push(`Semiángulo ${f.angle(v.semiAngleDeg)}`);
      if (v.normal) out.push(`Normal ${vec(v.normal)}`);
      if (v.axis) out.push(`Eje ${f.point(v.axis.p)} dir ${vec(v.axis.d)}`);
      if (v.center) out.push(`Centro ${f.point(v.center)}`);
      if (v.arcAngle != null) out.push(`Ángulo de arco ${f.angle(v.arcAngle)}`);
      if (v.dir) out.push(`Dirección ${vec(v.dir)}`);
      if (v.length != null) out.push(`Longitud ${f.len(v.length)}`);
      if (v.area != null) out.push(`Área ${f.area(v.area)}`);
      return out.length ? out.join(' · ') : m.text;
    }
    default:
      return m.text; // ángulos: no dependen de las unidades
  }
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
  const sys3d = new Map(); // id → sistema de unidades con el que MeasureTools escribió el texto
  let list2d = []; // [{ id: '2d-n', m: payload }]
  let seq2d = 0;
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
      ...list3d.map((m) => ({ id: `3d-${m.id}`, tool: m.tool, title: m.title, text: sys3d.get(m.id) === f.system ? m.text : text3d(m, f) })),
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
    const f = fmt();
    for (const m of list) if (!sys3d.has(m.id)) sys3d.set(m.id, f.system);
    for (const id of sys3d.keys()) if (!list.some((m) => m.id === id)) sys3d.delete(id);
    inspect = extra.inspect || null;
    ui.setPressed($('toolPalette'), 'tool', measure.tool === 'none' ? null : measure.tool);
    render();
    renderCard();
  });

  view2d.on('measure', (m) => {
    list2d.push({ id: `2d-${++seq2d}`, m });
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
      // View2D no borra una cota suelta: se borran todas las cotas 2D.
      const n = list2d.length;
      view2d.clearMeasures();
      if (n > 1) ui.toast(`Se borraron las ${n} cotas 2D (la vista 2D las borra juntas).`, { type: 'info' });
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
