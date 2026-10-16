/*
 * Armazón de la interfaz: utilidades de UI sin lógica de dominio.
 * El integrador (main.js) cablea los módulos reales contra estos ids y funciones.
 *
 * ── Ids estables de index.html ───────────────────────────────────────────────
 * Raíz / barra superior
 *   #app #topbar #btnLeftDrawer #btnRightDrawer
 *   #fileChip #fileName #fileFormat #kernelChip #kernelText
 *   #btnOpen #fileInput #btnExamples #menuExamples #btnExport #menuExport
 *   #unitsSeg #btnTheme #btnHelp
 *   (menuExport: .menu-item[data-value] = step|stl|stl-ascii|obj|glb|ply|report-print|report-html|csv|json|png)
 * Panel izquierdo
 *   #sidebarLeft
 *   Paso 1  #stepPlano #stepPlanoSummary #planoEmpty #dropzone #btnDropExample #planoInfo
 *           #infoFormat #infoUnits #infoScale #infoEntities #infoClosed #infoRegions #infoOpenRow #infoOpen
 *           #selDrawingUnits #inpJoinTol #chkIgnoreAux #layerCount #layerList
 *           #imageSection #rngThreshold #thresholdValue #chkThresholdAuto #chkInvert #inpPxScale #btnCalibrate
 *           #frameRow #frameInfo #chkIncludeFrame (marco del plano) #scaleRow #btnResetScale (escala calibrada)
 *   Paso 2  #stepOp #stepOpSummary #opSeg (extrude|revolve|multiview)
 *           #panelExtrude #inpThickness #selGauge #thicknessChips #chkSymmetric #regionCount #regionList
 *           #inpFilletVertical #inpFilletTop #inpChamferTop
 *           #panelRevolve #selAxis #btnPickAxis #axisReadout #rngAngle #inpAngle
 *           #panelMultiview #slotTop #slotFront #slotRight #slotLeft
 *             (cada .slot[data-role]: [data-action=define], [data-action=clear], .slot-status) #mvWarn
 *   Paso 3  #stepMaterial #stepMaterialSummary #selMaterial #densityReadout #densityField #inpDensity
 *           #inpPrice #inpBlankMargin
 *   Pie     #btnGenerate #chkAutoUpdate
 * Centro
 *   #workspace #viewTabs (data-tab = 2d|3d|split) #viewInfo #viewports
 *   2D  #pane2d #view2d #toolbar2d ([data-mode2d] = select|measure|window|axis|calibrate|erase) #btn2dFit
 *       #btn2dClearDims #btn2dShowErased #hint2d #empty2d
 *   3D  #pane3d #view3d #viewBar ([data-view] = iso|front|top|right|fit) #btnProjection
 *       #displayBar ([data-display] = edges|xray|wireframe|grid|bbox)
 *       #toolPalette ([data-tool] = inspect|point|distance|angle|radius|area|coords|thickness) #btnClearMeasures
 *       #sectionBar #chkSection #sectionAxisSeg (x|y|z) #rngSection #sectionValue #btnSectionFlip
 *       #hint3d #empty3d #btnEmptyOpen
 * Panel derecho
 *   #sidebarRight #btnCloseRight #propsSubtitle #propsStale (aviso: pieza desactualizada) #propsEmpty #propsBody
 *   #kpiMass #kpiMassSub #kpiVolume #kpiVolumeSub #kpiArea #kpiAreaSub #kpiDims #kpiDimsSub
 *   #propMaterial #propBBox #propCOM #inertiaUnit #inertiaTensor #propInertia #propSheet #propProfile
 *   #holesTable #topoBadges #propTopology #accuracyBadge #propAccuracy #propCost
 *   #measurePanel #measureCount #measureList #btnMeasureCopy #btnMeasureCSV #btnMeasureClear
 * Barra de estado
 *   #statusbar #statusCoords #statusMode #statusBuild #statusUnits #btnWarnings #warnCount #warnPopover #warnList
 * Capas superpuestas
 *   #drawerBackdrop #dropOverlay #loadingOverlay #loadingTitle #loadingText #toastStack
 *   #modal #modalTitle #modalBody #modalClose #tooltip #helpTemplate
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Convenciones: los estados visuales usan el atributo `hidden`, `aria-pressed`, `aria-selected`,
 * `aria-expanded` y `data-state`; los íconos se declaran como <i data-icon="nombre" data-size="16">
 * y initShell() los sustituye por SVG.
 */
import { icon } from './icons.js';

const THEME_KEY = 'plano3d.theme';
const tabListeners = new Set();
const themeListeners = new Set();
const projectionListeners = new Set();
const shortcuts = [];
let openMenu = null; // { button, menu, close }
let lastFocus = null;

/** Elemento por id (null si no existe). */
export function $(id) {
  return document.getElementById(id);
}

/** Escapa texto para insertarlo en HTML. */
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Sustituye <i data-icon> por SVG dentro de root. */
export function renderIcons(root = document) {
  for (const el of root.querySelectorAll('i[data-icon]')) {
    const tpl = document.createElement('template');
    tpl.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 16);
    const svg = tpl.content.firstElementChild;
    if (el.className) svg.classList.add(...el.className.split(/\s+/).filter(Boolean));
    el.replaceWith(svg);
  }
}

// ───────────────────────── Avisos, modal, carga, estado ─────────────────────────

const TOAST_ICON = { info: 'info', success: 'success', warn: 'warning', error: 'error' };

/**
 * Muestra un aviso flotante.
 * @param {string} msg texto (no HTML)
 * @param {{ type?: 'info'|'success'|'warn'|'error', timeout?: number }} [opts]
 *   timeout en ms (por defecto 4000; 'warn' 6000; 'error' 8000); 0 = permanente.
 * @returns {() => void} función para cerrarlo
 */
export function toast(msg, { type = 'info', timeout } = {}) {
  const stack = $('toastStack');
  if (!TOAST_ICON[type]) type = 'info';
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `${icon(TOAST_ICON[type], 16)}<div class="toast-msg"></div><button class="btn btn-icon btn-ghost" type="button" aria-label="Cerrar aviso">${icon('close', 14)}</button>`;
  el.querySelector('.toast-msg').textContent = msg;
  let timer = 0;
  const close = () => {
    clearTimeout(timer);
    if (!el.isConnected || el.classList.contains('leaving')) return;
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 160);
  };
  el.querySelector('button').addEventListener('click', close);
  stack.appendChild(el);
  while (stack.children.length > 5) stack.firstElementChild.remove();
  const ms = timeout ?? (type === 'error' ? 8000 : type === 'warn' ? 6000 : 4000);
  if (ms > 0) timer = setTimeout(close, ms);
  return close;
}

/**
 * Abre el modal con un título (texto) y un cuerpo HTML.
 * Esc, el botón × o un clic fuera lo cierran; el foco vuelve al elemento previo.
 */
export function showModal(title, html) {
  const modal = $('modal');
  lastFocus = document.activeElement;
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = html;
  renderIcons($('modalBody'));
  modal.hidden = false;
  $('modalClose').focus();
}

/** Cierra el modal. */
export function closeModal() {
  const modal = $('modal');
  if (modal.hidden) return;
  modal.hidden = true;
  $('modalBody').innerHTML = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/**
 * Capa de carga a pantalla completa.
 * @param {boolean} visible
 * @param {string} [text] línea de progreso
 * @param {string} [title] título (por defecto se conserva el actual)
 */
export function setLoading(visible, text, title) {
  $('loadingOverlay').hidden = !visible;
  if (text != null) $('loadingText').textContent = text;
  if (title != null) $('loadingTitle').textContent = title;
}

/**
 * Estado del motor CAD (chip superior) y modo en la barra de estado.
 * @param {{ text?: string, state?: 'loading'|'ready'|'error', mode?: string }} s
 */
export function setStatus({ text, state, mode } = {}) {
  const chip = $('kernelChip');
  if (state) chip.dataset.state = state;
  if (text != null) {
    $('kernelText').textContent = text;
    chip.title = text;
  }
  if (mode != null) $('statusMode').textContent = mode;
}

/** Coordenadas del cursor en la barra de estado. */
export function setCoords(text) {
  $('statusCoords').textContent = text || '—';
}

/** Texto de la última generación en la barra de estado (p. ej. "Generado en 184 ms"). */
export function setBuildInfo(text) {
  $('statusBuild').textContent = text || 'Sin generar';
}

/**
 * Texto de ayuda contextual (píldora inferior). Texto vacío lo oculta.
 * @param {string} text
 * @param {'2d'|'3d'|'both'} [view='both']
 */
export function setHint(text, view = 'both') {
  const ids = view === '2d' ? ['hint2d'] : view === '3d' ? ['hint3d'] : ['hint2d', 'hint3d'];
  for (const id of ids) {
    const el = $(id);
    el.textContent = text || '';
    el.hidden = !text;
  }
}

/** Nombre y formato del archivo en el chip superior; null = sin plano. */
export function setFile(file) {
  const chip = $('fileChip');
  const badge = $('fileFormat');
  chip.dataset.state = file ? 'loaded' : 'empty';
  $('fileName').textContent = file ? file.name : 'Sin plano';
  chip.title = file ? file.name : '';
  badge.hidden = !file || !file.format;
  badge.textContent = file && file.format ? String(file.format).toUpperCase() : '';
}

/** Alterna el estado vacío/cargado del paso 1. */
export function setPlanoLoaded(loaded) {
  $('stepPlano').dataset.state = loaded ? 'loaded' : 'empty';
  $('planoEmpty').hidden = !!loaded;
  $('planoInfo').hidden = !loaded;
}

/** Muestra u oculta los datos de la pieza (panel derecho). */
export function setPropsVisible(visible) {
  $('sidebarRight').dataset.state = visible ? 'ready' : 'empty';
  $('propsEmpty').hidden = !!visible;
  $('propsBody').hidden = !visible;
}

/** Estado vacío de una vista ('2d' | '3d'). */
export function setEmpty(view, visible) {
  $(view === '2d' ? 'empty2d' : 'empty3d').hidden = !visible;
}

/**
 * Lista de avisos de la barra de estado.
 * @param {Array<string|{ text: string, level?: 'warn'|'error'|'info' }>} list
 */
export function setWarnings(list = []) {
  const items = list.map((w) => (typeof w === 'string' ? { text: w } : w));
  $('warnCount').textContent = String(items.length);
  $('btnWarnings').dataset.count = String(items.length);
  renderList($('warnList'), items, warnItem);
}

// ───────────────────────── Pestañas y tema ─────────────────────────

/** Pestaña activa: '2d' | '3d' | 'split'. Notifica a onTab tras aplicar el diseño. */
export function setActiveTab(name) {
  for (const b of $('viewTabs').querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  $('viewports').dataset.view = name;
  for (const cb of tabListeners) cb(name);
}

/** Pestaña activa actual. */
export function getActiveTab() {
  return $('viewports').dataset.view;
}

/** Suscribe cb(name) a cambios de pestaña; devuelve la función para anular. */
export function onTab(cb) {
  tabListeners.add(cb);
  return () => tabListeners.delete(cb);
}

/** Aplica el tema ('dark' | 'light'), lo recuerda y notifica a onTheme. */
export function setTheme(name) {
  const theme = name === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* almacenamiento no disponible */
  }
  for (const cb of themeListeners) cb(theme);
}

/** Tema actual. */
export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/** Suscribe cb(theme) a cambios de tema. */
export function onTheme(cb) {
  themeListeners.add(cb);
  return () => themeListeners.delete(cb);
}

/** Proyección mostrada en #btnProjection ('perspective' | 'orthographic'), sin notificar. */
export function setProjection(value) {
  const b = $('btnProjection');
  b.dataset.value = value === 'orthographic' ? 'orthographic' : 'perspective';
  b.querySelector('.proj-label').textContent = b.dataset.value === 'orthographic' ? 'Ortográfica' : 'Perspectiva';
}

/** Suscribe cb(value) al clic en #btnProjection (el armazón ya alterna el botón). */
export function onProjection(cb) {
  projectionListeners.add(cb);
  return () => projectionListeners.delete(cb);
}

// ───────────────────────── Controles ─────────────────────────

/**
 * Control segmentado (botones hijos con data-value y aria-pressed).
 * Si hay paneles con data-panel-for="<id del control>", se muestra el de data-panel = valor.
 * @param {HTMLElement} el
 * @param {(value: string) => void} cb llamado al elegir otro valor con el ratón o teclado
 */
export function bindSegmented(el, cb) {
  if (!el.dataset.segBound) {
    el.dataset.segBound = '1';
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-value]');
      if (!b || !el.contains(b) || b.disabled) return;
      if (b.getAttribute('aria-pressed') === 'true') return;
      setSegmented(el, b.dataset.value);
      el.dispatchEvent(new CustomEvent('segchange', { detail: b.dataset.value }));
    });
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const btns = [...el.querySelectorAll('button[data-value]:not(:disabled)')];
      const i = btns.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      const next = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
      next.focus();
      next.click();
      e.preventDefault();
    });
  }
  if (cb) el.addEventListener('segchange', (e) => cb(e.detail));
}

/** Fija el valor de un segmentado sin notificar. */
export function setSegmented(el, value) {
  for (const b of el.querySelectorAll('button[data-value]')) b.setAttribute('aria-pressed', String(b.dataset.value === value));
  if (el.id) {
    for (const p of document.querySelectorAll(`[data-panel-for="${el.id}"]`)) p.hidden = p.dataset.panel !== value;
  }
}

/** Valor actual de un segmentado. */
export function getSegmented(el) {
  const b = el.querySelector('button[aria-pressed="true"]');
  return b ? b.dataset.value : null;
}

/**
 * Grupo de botones con aria-pressed (paleta de herramientas, conmutadores de visualización…).
 * @param {HTMLElement} container
 * @param {{ attr: string, mode?: 'single'|'optional'|'multi' }} opts
 *   attr: nombre del data-atributo (p. ej. 'tool' → data-tool);
 *   'single' siempre uno activo, 'optional' uno o ninguno, 'multi' conmutadores independientes.
 * @param {(value: string|null, pressed: boolean) => void} cb
 *   en 'optional' value es null al desactivar la herramienta activa.
 */
export function bindPressGroup(container, { attr, mode = 'single' }, cb) {
  container.addEventListener('click', (e) => {
    const b = e.target.closest(`[data-${attr}]`);
    if (!b || !container.contains(b) || b.disabled) return;
    const v = b.dataset[attr];
    const pressed = b.getAttribute('aria-pressed') === 'true';
    if (mode === 'multi') {
      b.setAttribute('aria-pressed', String(!pressed));
      cb?.(v, !pressed);
      return;
    }
    if (pressed && mode === 'single') return;
    const next = pressed ? null : v;
    setPressed(container, attr, next);
    cb?.(next, !!next);
  });
}

/**
 * Marca como pulsado el botón data-<attr>=value (los demás no), o ninguno con null.
 * Con pressed explícito solo cambia ese botón (modo 'multi').
 */
export function setPressed(container, attr, value, pressed) {
  for (const b of container.querySelectorAll(`[data-${attr}][aria-pressed]`)) {
    if (pressed === undefined) b.setAttribute('aria-pressed', String(b.dataset[attr] === value));
    else if (b.dataset[attr] === value) b.setAttribute('aria-pressed', String(!!pressed));
  }
}

/**
 * Menú desplegable: clic, flechas, Inicio/Fin, Esc y clic fuera.
 * @param {HTMLElement} button  botón con aria-expanded
 * @param {HTMLElement} menu    contenedor con .menu-item[data-value]
 * @param {(value: string, item: HTMLElement) => void} [onSelect]
 * @returns {{ open: () => void, close: (focusButton?: boolean) => void }}
 */
export function bindDropdown(button, menu, onSelect) {
  const items = () => [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
  const api = {
    open() {
      if (openMenu && openMenu.menu !== menu) openMenu.close();
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      openMenu = { button, menu, close: api.close };
      hideTooltip();
      items()[0]?.focus();
    },
    close(focusButton = false) {
      if (menu.hidden) return;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (openMenu && openMenu.menu === menu) openMenu = null;
      if (focusButton) button.focus();
    },
  };
  button.addEventListener('click', () => (menu.hidden ? api.open() : api.close()));
  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && menu.hidden) {
      api.open();
      e.preventDefault();
    }
  });
  menu.addEventListener('keydown', (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    let next = null;
    if (e.key === 'ArrowDown') next = list[(i + 1) % list.length];
    else if (e.key === 'ArrowUp') next = list[(i - 1 + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    else if (e.key === 'Escape') {
      api.close(true);
      e.stopPropagation();
    } else if (e.key === 'Tab') api.close();
    if (next) {
      next.focus();
      e.preventDefault();
    }
  });
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[role="menuitem"]');
    if (!item || item.disabled) return;
    api.close(true);
    onSelect?.(item.dataset.value, item);
  });
  return api;
}

/**
 * Sección plegable: .collapsible-head (botón con aria-expanded) + .collapsible-body.
 * @param {HTMLElement} section
 * @param {{ collapsed?: boolean, onToggle?: (open: boolean) => void }} [opts]
 * @returns {(open: boolean) => void} función para abrir/cerrar por código
 */
export function makeCollapsible(section, { collapsed, onToggle } = {}) {
  const head = section.querySelector(':scope > .collapsible-head');
  const set = (open) => {
    section.classList.toggle('collapsed', !open);
    head.setAttribute('aria-expanded', String(open));
  };
  if (!section.dataset.collapsibleBound) {
    section.dataset.collapsibleBound = '1';
    head.addEventListener('click', () => {
      const open = section.classList.contains('collapsed');
      set(open);
      onToggle?.(open);
    });
  }
  if (collapsed != null) set(!collapsed);
  return set;
}

function decimalsOf(step) {
  const s = String(step);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

/**
 * Campo numérico de texto: confirma con Enter o al salir; flechas (Mayús ×10, Alt ×0.1)
 * y rueda (con foco) suman el paso; acepta coma decimal; Esc restaura.
 * @param {HTMLInputElement|HTMLElement} el  el <input> o su contenedor .num-field / .mini-field
 * @param {{ min?: number, max?: number, step?: number, decimals?: number, unit?: string,
 *           onChange?: (value: number) => void }} [opts]
 * @returns {{ input: HTMLInputElement, get: () => number, set: (v: number) => void,
 *             setUnit: (u: string) => void, setRange: (min?: number, max?: number) => void }}
 */
export function numberField(el, { min = -Infinity, max = Infinity, step = 1, decimals, unit, onChange } = {}) {
  const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
  const wrap = input.closest('.num-field, .mini-field') || input;
  const unitEl = wrap.querySelector('.unit');
  const dec = decimals ?? decimalsOf(step);
  let value = Number(String(input.value).replace(',', '.'));
  if (!Number.isFinite(value)) value = Math.max(min, Math.min(max, 0));
  const fmt = (v) => v.toFixed(dec);
  const show = () => {
    input.value = fmt(value);
    wrap.classList.remove('invalid');
  };
  const commit = (v, notify = true) => {
    const c = Math.max(min, Math.min(max, v));
    const changed = Math.abs(c - value) > 1e-12;
    value = Number(c.toFixed(dec));
    show();
    if (changed && notify) onChange?.(value);
  };
  const parse = () => {
    const raw = input.value.trim().replace(',', '.');
    const v = Number(raw);
    if (raw === '' || !Number.isFinite(v)) {
      wrap.classList.add('invalid');
      return null;
    }
    return v;
  };
  const nudge = (dir, e) => {
    const k = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const base = parse() ?? value;
    commit(base + dir * step * k);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = parse();
      if (v != null) commit(v);
      input.select();
    } else if (e.key === 'Escape') {
      show();
      input.blur();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      nudge(e.key === 'ArrowUp' ? 1 : -1, e);
      e.preventDefault();
    }
  });
  input.addEventListener('blur', () => {
    const v = parse();
    if (v == null) show();
    else commit(v);
  });
  input.addEventListener('focus', () => input.select());
  input.addEventListener('input', () => wrap.classList.remove('invalid'));
  input.addEventListener(
    'wheel',
    (e) => {
      if (document.activeElement !== input) return;
      e.preventDefault();
      nudge(e.deltaY < 0 ? 1 : -1, e);
    },
    { passive: false },
  );
  if (unit != null && unitEl) unitEl.textContent = unit;
  show();
  return {
    input,
    get: () => value,
    set: (v) => commit(Number(v), false),
    setUnit: (u) => {
      if (unitEl) unitEl.textContent = u;
    },
    setRange: (lo = min, hi = max) => {
      min = lo;
      max = hi;
      commit(value, false);
    },
  };
}

/** Fija el valor de un input range y actualiza su relleno. */
export function setRange(el, value) {
  el.value = String(value);
  updateRangeFill(el);
}

function updateRangeFill(el) {
  const lo = Number(el.min || 0);
  const hi = Number(el.max || 100);
  const pct = hi > lo ? ((Number(el.value) - lo) / (hi - lo)) * 100 : 0;
  el.style.setProperty('--pct', `${pct}%`);
}

// ───────────────────────── Listas y tablas ─────────────────────────

/**
 * Tabla clave/valor.
 * @param {HTMLElement} container
 * @param {Array<{ section: string } | { label: string, value: string|number, unit?: string, hint?: string,
 *   cls?: 'is-warn'|'is-bad'|'is-good'|'is-strong'|string, bar?: number, barCls?: string }>} rows
 *   bar: fracción 0–1 dibujada como barra bajo la fila.
 */
export function renderKV(container, rows) {
  container.innerHTML = rows
    .filter(Boolean)
    .map((r) => {
      if (r.section != null) return `<div class="kv-section">${escapeHtml(r.section)}</div>`;
      const cls = ['kv-row', r.cls, r.bar != null ? 'has-bar' : ''].filter(Boolean).join(' ');
      const hint = r.hint ? ` title="${escapeHtml(r.hint)}"` : '';
      const unit = r.unit ? `<span class="unit">${escapeHtml(r.unit)}</span>` : '';
      const bar =
        r.bar != null
          ? `<div class="kv-bar ${escapeHtml(r.barCls || '')}"><span style="width:${(Math.max(0, Math.min(1, r.bar)) * 100).toFixed(1)}%"></span></div>`
          : '';
      return `<div class="${escapeHtml(cls)}"><span class="kv-label"${hint}>${escapeHtml(r.label)}</span><span class="kv-value">${escapeHtml(r.value ?? '—')}${unit}</span>${bar}</div>`;
    })
    .join('');
}

/**
 * Rellena una lista. renderItem devuelve un HTML (string) o un Node por elemento.
 * Si la lista queda vacía se muestra su data-empty (CSS).
 */
export function renderList(container, items, renderItem) {
  container.textContent = '';
  const frag = document.createDocumentFragment();
  items.forEach((item, i) => {
    const out = renderItem(item, i);
    if (typeof out === 'string') {
      const tpl = document.createElement('template');
      tpl.innerHTML = out.trim();
      frag.appendChild(tpl.content);
    } else if (out) frag.appendChild(out);
  });
  renderIcons(frag);
  container.appendChild(frag);
}

// Plantillas de elementos de lista (HTML). Los data-* permiten delegar eventos en el contenedor.

/** Fila de capa: data-layer, input[data-action=visible]. */
export function layerItem({ name, color = '#9aa4b0', count = 0, visible = true }) {
  const n = escapeHtml(name);
  return `<li data-layer="${n}"><label class="layer${visible ? '' : ' is-off'}">
<input type="checkbox" class="chk" data-action="visible"${visible ? ' checked' : ''} aria-label="Mostrar capa ${n}">
<span class="swatch" style="--c:${escapeHtml(color)}"></span><span class="layer-name" title="${n}">${n}</span>
<span class="layer-count">${escapeHtml(count)}</span></label></li>`;
}

/**
 * Fila de región: data-region; input[data-action=include]; button[data-action=toggle];
 * input[data-field=height|z0]; agujeros con holeItem.
 */
export function regionItem({ index, name, color = '#4c8dff', included = true, selected = false, open = false, meta = '', height = '', z0 = '', unit = 'mm', holes = [] }) {
  const cls = ['region', included ? '' : 'is-excluded', selected ? 'is-selected' : '', open ? 'is-open' : ''].filter(Boolean).join(' ');
  const label = escapeHtml(name ?? `Región ${index + 1}`);
  const toggle = holes.length
    ? `<button class="region-name" type="button" data-action="toggle" aria-expanded="${open}">${icon('chevron-right', 12)}${label}</button>`
    : `<span class="region-name">${label}</span>`;
  return `<li class="${cls}" data-region="${index}">
<div class="region-main"><input type="checkbox" class="chk" data-action="include"${included ? ' checked' : ''} aria-label="Incluir ${label}">
<span class="dot" style="--c:${escapeHtml(color)}"></span>${toggle}<span class="region-meta">${escapeHtml(meta)}</span></div>
<div class="region-fields">
<label class="mini-field"><span class="mini-label">Altura</span><input type="text" inputmode="decimal" data-field="height" value="${escapeHtml(height)}"><span class="unit">${escapeHtml(unit)}</span></label>
<label class="mini-field"><span class="mini-label">Z0</span><input type="text" inputmode="decimal" data-field="z0" value="${escapeHtml(z0)}"><span class="unit">${escapeHtml(unit)}</span></label>
</div>${holes.length ? `<ul class="hole-list"${open ? '' : ' hidden'}>${holes.map((h, i) => holeItem({ index: i, unit, ...h })).join('')}</ul>` : ''}</li>`;
}

/** Fila de agujero: data-hole; select[data-field=op] (through|blind|fill); input[data-field=depth]. */
export function holeItem({ index, label, free = false, op = 'through', depth = '', unit = 'mm' }) {
  const opt = (v, t) => `<option value="${v}"${op === v ? ' selected' : ''}>${t}</option>`;
  return `<li class="hole" data-hole="${index}">${icon('hole', 14)}
<span class="hole-label${free ? ' is-free' : ''}">${escapeHtml(free ? 'Forma libre' : label)}</span>
<select class="select" data-field="op" aria-label="Operación del agujero">${opt('through', 'Pasante')}${opt('blind', 'Ciego')}${opt('fill', 'Rellenar')}</select>
<label class="mini-field hole-depth"${op === 'blind' ? '' : ' hidden'}><input type="text" inputmode="decimal" data-field="depth" value="${escapeHtml(depth)}" aria-label="Profundidad"><span class="unit">${escapeHtml(unit)}</span></label></li>`;
}

const MEASURE_ICON = { inspect: 'inspect', point: 'point', distance: 'distance', angle: 'angle', radius: 'radius', area: 'area', coords: 'coords', thickness: 'thickness', measure2d: 'ruler' };

/** Fila de medición: data-measure; button[data-action=delete]. */
export function measureItem({ id, tool, title, text }) {
  return `<li class="measure" data-measure="${escapeHtml(id)}"><span class="measure-icon">${icon(MEASURE_ICON[tool] || 'ruler', 15)}</span>
<span class="measure-title">${escapeHtml(title)}</span><span class="measure-value">${escapeHtml(text)}</span>
<button class="btn btn-icon btn-sm btn-ghost" type="button" data-action="delete" aria-label="Borrar medición">${icon('close', 14)}</button></li>`;
}

/** Fila de aviso de la barra de estado. */
export function warnItem({ text, level = 'warn' }) {
  const ic = level === 'error' ? 'error' : level === 'info' ? 'info' : 'warning';
  return `<li class="warn-item is-${escapeHtml(level)}">${icon(ic, 15)}<span class="warn-text">${escapeHtml(text)}</span></li>`;
}

// ───────────────────────── Teclado, archivos ─────────────────────────

const isTyping = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * Atajo de teclado global. Sin modificador se ignora mientras se escribe en un campo
 * y con el modal abierto. key se compara sin distinguir mayúsculas (e.key).
 * @param {string} key  p. ej. 'i', 'Enter', '?', 'Home'
 * @param {(e: KeyboardEvent) => void} cb
 * @param {{ ctrl?: boolean, shift?: boolean, alt?: boolean }} [mods]  ctrl acepta también ⌘
 * @returns {() => void} anula el atajo
 */
export function onShortcut(key, cb, { ctrl = false, shift, alt = false } = {}) {
  const s = { key: key.toLowerCase(), cb, ctrl, shift, alt };
  shortcuts.push(s);
  return () => shortcuts.splice(shortcuts.indexOf(s), 1);
}

function handleShortcut(e) {
  if (e.defaultPrevented) return;
  const ctrl = e.ctrlKey || e.metaKey;
  if (!$('modal').hidden) return;
  for (const s of shortcuts) {
    if (s.key !== e.key.toLowerCase() || s.ctrl !== ctrl || s.alt !== e.altKey) continue;
    if (s.shift != null && s.shift !== e.shiftKey) continue;
    if (!s.ctrl && isTyping(e.target)) continue;
    e.preventDefault();
    s.cb(e);
    return;
  }
}

/** Descarga un Blob con el nombre dado. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Zona de arrastre del plano. Activa además: soltar en toda la ventana (con #dropOverlay),
 * clic/Enter en el elemento y el cambio de #fileInput (que abren #btnOpen, #btnEmptyOpen y Ctrl+O).
 * @param {HTMLElement} el
 * @param {(files: File[]) => void} onFiles
 */
export function setDropzone(el, onFiles) {
  const input = $('fileInput');
  const overlay = $('dropOverlay');
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  let depth = 0;
  const reset = () => {
    depth = 0;
    overlay.hidden = true;
    el.classList.remove('dragover');
  };
  el.addEventListener('click', () => input.click());
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', () => {
    const files = [...input.files];
    input.value = '';
    if (files.length) onFiles(files);
  });
  window.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (depth++ === 0) {
      overlay.hidden = false;
      el.classList.add('dragover');
    }
  });
  window.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  window.addEventListener('dragleave', (e) => {
    if (!hasFiles(e)) return;
    if (--depth <= 0) reset();
  });
  window.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    reset();
    const files = [...e.dataTransfer.files];
    if (files.length) onFiles(files);
  });
}

// ───────────────────────── Información emergente ─────────────────────────

let tipTimer = 0;
let tipTarget = null;

function showTooltip(target) {
  const tip = $('tooltip');
  const text = target.dataset.tip;
  if (!text || (openMenu && openMenu.button === target)) return;
  tip.innerHTML = `<span>${escapeHtml(text)}</span>${target.dataset.kbd ? `<kbd>${escapeHtml(target.dataset.kbd)}</kbd>` : ''}`;
  tip.hidden = false;
  const r = target.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const gap = 8;
  let side = target.dataset.tipSide || 'bottom';
  if (side === 'bottom' && r.bottom + gap + t.height > innerHeight - 4) side = 'top';
  let x;
  let y;
  if (side === 'right') {
    x = r.right + gap;
    y = r.top + (r.height - t.height) / 2;
  } else {
    x = r.left + (r.width - t.width) / 2;
    y = side === 'top' ? r.top - gap - t.height : r.bottom + gap;
  }
  tip.style.left = `${Math.round(Math.max(4, Math.min(innerWidth - t.width - 4, x)))}px`;
  tip.style.top = `${Math.round(Math.max(4, Math.min(innerHeight - t.height - 4, y)))}px`;
}

function hideTooltip() {
  clearTimeout(tipTimer);
  tipTarget = null;
  const tip = $('tooltip');
  if (tip) tip.hidden = true;
}

function initTooltips() {
  const enter = (target, delay) => {
    if (target === tipTarget) return;
    hideTooltip();
    tipTarget = target;
    tipTimer = setTimeout(() => showTooltip(target), delay);
  };
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-tip]');
    if (t) enter(t, 400);
    else if (tipTarget) hideTooltip();
  });
  document.addEventListener('focusin', (e) => {
    const t = e.target.closest?.('[data-tip]');
    if (t && t.matches(':focus-visible')) enter(t, 150);
  });
  document.addEventListener('focusout', hideTooltip);
  document.addEventListener('pointerdown', hideTooltip, true);
  document.addEventListener('scroll', hideTooltip, true);
}

// ───────────────────────── Paneles deslizantes ─────────────────────────

/** Abre/cierra el panel deslizante ('left' | 'right') en pantallas estrechas; open omitido = alternar. */
export function toggleDrawer(side, open) {
  const app = $('app');
  const cls = side === 'left' ? 'left-open' : 'right-open';
  const next = open ?? !app.classList.contains(cls);
  app.classList.remove('left-open', 'right-open');
  if (next) app.classList.add(cls);
  $('drawerBackdrop').hidden = !next;
  $(side === 'left' ? 'btnLeftDrawer' : 'btnRightDrawer').setAttribute('aria-expanded', String(next));
}

// ───────────────────────── Inicialización ─────────────────────────

/**
 * Cablea el comportamiento puramente visual del armazón: iconos, información emergente,
 * plegables, menús (sin acciones), segmentados con paneles, pestañas, tema, ayuda,
 * paneles deslizantes, avisos, sección y listas de regiones/capas. Llamar una vez tras DOMContentLoaded.
 * Las acciones de dominio se conectan después con los helpers (bindDropdown devuelve el api, etc.).
 * @returns {{ exportMenu: object, examplesMenu: object }} apis de bindDropdown para Exportar y Ejemplos
 *   (para recibir la selección: escuchar 'click' en el menú o usar onMenu()).
 */
export function initShell() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    /* sin almacenamiento */
  }
  if (saved) document.documentElement.dataset.theme = saved;

  renderIcons();
  for (const b of document.querySelectorAll('button[data-tip]:not([aria-label])')) b.setAttribute('aria-label', b.dataset.tip);
  initTooltips();

  for (const s of document.querySelectorAll('[data-collapsible]')) makeCollapsible(s);
  for (const seg of document.querySelectorAll('.seg')) bindSegmented(seg);

  const exportMenu = bindDropdown($('btnExport'), $('menuExport'), (v, item) => menuHandlers.export?.(v, item));
  const examplesMenu = bindDropdown($('btnExamples'), $('menuExamples'), (v, item) => menuHandlers.examples?.(v, item));

  // Pestañas
  const tabs = $('viewTabs');
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b && b.getAttribute('aria-selected') !== 'true') setActiveTab(b.dataset.tab);
  });
  tabs.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const list = [...tabs.querySelectorAll('[data-tab]')];
    const i = list.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    const next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    setActiveTab(next.dataset.tab);
    next.focus();
  });

  // Operación: resumen del paso 2
  bindSegmented($('opSeg'), () => {
    const b = $('opSeg').querySelector('[aria-pressed="true"]');
    $('stepOpSummary').textContent = b ? b.textContent.trim() : '';
  });
  bindSegmented($('unitsSeg'), (v) => {
    $('statusUnits').textContent = v;
  });

  // Proyección
  $('btnProjection').addEventListener('click', () => {
    const next = $('btnProjection').dataset.value === 'orthographic' ? 'perspective' : 'orthographic';
    setProjection(next);
    for (const cb of projectionListeners) cb(next);
  });

  // Sección: atenúa controles cuando está desactivada
  const syncSection = () => $('sectionBar').classList.toggle('is-off', !$('chkSection').checked);
  $('chkSection').addEventListener('change', syncSection);
  syncSection();

  // Deslizadores: relleno de la pista
  for (const r of document.querySelectorAll('input[type="range"]')) updateRangeFill(r);
  document.addEventListener('input', (e) => {
    if (e.target.matches?.('input[type="range"]')) updateRangeFill(e.target);
  });

  // Tema, ayuda, apertura de archivo
  $('btnTheme').addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  const help = () => showModal('Ayuda', $('helpTemplate').innerHTML);
  $('btnHelp').addEventListener('click', help);
  onShortcut('?', help);
  const openFile = () => $('fileInput').click();
  $('btnOpen').addEventListener('click', openFile);
  $('btnEmptyOpen').addEventListener('click', openFile);
  onShortcut('o', openFile, { ctrl: true });

  // Modal
  $('modalClose').addEventListener('click', closeModal);
  $('modal').addEventListener('mousedown', (e) => {
    if (e.target === $('modal')) closeModal();
  });

  // Paneles deslizantes
  $('btnLeftDrawer').addEventListener('click', () => toggleDrawer('left'));
  $('btnRightDrawer').addEventListener('click', () => toggleDrawer('right'));
  $('btnCloseRight').addEventListener('click', () => toggleDrawer('right', false));
  $('drawerBackdrop').addEventListener('click', () => toggleDrawer('right', false));

  // Avisos
  const warnBtn = $('btnWarnings');
  const pop = $('warnPopover');
  const setPop = (open) => {
    pop.hidden = !open;
    warnBtn.setAttribute('aria-expanded', String(open));
  };
  warnBtn.addEventListener('click', () => setPop(pop.hidden));

  // Clic fuera: menús y avisos
  document.addEventListener('mousedown', (e) => {
    if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.button.contains(e.target)) openMenu.close();
    if (!pop.hidden && !pop.contains(e.target) && !warnBtn.contains(e.target)) setPop(false);
  });

  // Esc: cierra lo que esté encima
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('modal').hidden) closeModal();
      else if (openMenu) openMenu.close(true);
      else if (!pop.hidden) setPop(false);
      else if ($('app').classList.contains('left-open') || $('app').classList.contains('right-open')) toggleDrawer('right', false);
      else return;
      e.preventDefault();
      return;
    }
    handleShortcut(e);
  });

  // Capas: atenúa la fila al ocultar
  $('layerList').addEventListener('change', (e) => {
    if (e.target.matches('[data-action="visible"]')) e.target.closest('.layer').classList.toggle('is-off', !e.target.checked);
  });

  // Regiones: plegar agujeros, excluir, mostrar profundidad en agujeros ciegos
  const regions = $('regionList');
  regions.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action="toggle"]');
    if (!t) return;
    const li = t.closest('.region');
    const open = !li.classList.contains('is-open');
    li.classList.toggle('is-open', open);
    t.setAttribute('aria-expanded', String(open));
    const holes = li.querySelector('.hole-list');
    if (holes) holes.hidden = !open;
  });
  regions.addEventListener('change', (e) => {
    if (e.target.matches('[data-action="include"]')) e.target.closest('.region').classList.toggle('is-excluded', !e.target.checked);
    if (e.target.matches('select[data-field="op"]')) e.target.closest('.hole').querySelector('.hole-depth').hidden = e.target.value !== 'blind';
  });

  // Densidad editable solo con material personalizado (el integrador decide cuál es)
  return { exportMenu, examplesMenu };
}

const menuHandlers = {};

/**
 * Acción al elegir en un menú de la barra superior.
 * @param {'export'|'examples'} name
 * @param {(value: string, item: HTMLElement) => void} cb  value = data-value del elemento
 */
export function onMenu(name, cb) {
  menuHandlers[name] = cb;
}

/**
 * Rellena el menú Ejemplos.
 * @param {Array<{ value: string, label: string, desc?: string, icon?: string }>} items
 */
export function setExamples(items) {
  $('menuExamples').innerHTML = items
    .map(
      (it) =>
        `<button class="menu-item${it.desc ? ' menu-item-2l' : ''}" role="menuitem" type="button" data-value="${escapeHtml(it.value)}">${icon(it.icon || 'drawing', 16)}<span>${escapeHtml(it.label)}${it.desc ? `<span class="menu-desc">${escapeHtml(it.desc)}</span>` : ''}</span></button>`,
    )
    .join('');
}
