// Utilidades de DOM y formato.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// Agrega hijos ignorando null/undefined/false (Element.append convertiría null en texto).
export function add(el, ...kids) {
  el.append(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false));
  return el;
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

export const NF = (d) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
export function fmt(v, d = 2) {
  if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) return '—';
  if (typeof v !== 'number') return String(v);
  return NF(d).format(v);
}
export function pct(v, d = 1) { return v === null || v === undefined || !isFinite(v) ? '—' : `${fmt(100 * v, d)} %`; }

export function numInput(value, { min, max, step = 'any', onChange, id } = {}) {
  const el = h('input', { type: 'number', value: String(value), min, max, step, id });
  el.addEventListener('change', () => { const v = parseFloat(el.value); if (isFinite(v) && onChange) onChange(v); });
  return el;
}
export function selectInput(options, value, onChange) {
  const el = h('select', {}, options.map(([v, l]) => h('option', { value: v, selected: String(v) === String(value) }, l)));
  el.addEventListener('change', () => onChange && onChange(el.value));
  return el;
}
export function checkbox(label, checked, onChange) {
  const inp = h('input', { type: 'checkbox', checked });
  inp.addEventListener('change', () => onChange && onChange(inp.checked));
  return h('label', { class: 'check' }, inp, label);
}
export function field(label, control, { hint = null, wide = false } = {}) {
  return h('div', { class: 'field' + (wide ? ' wide' : '') }, h('label', {}, label, hint ? h('div', { class: 'hint' }, hint) : null), control);
}
export function card(title, ...children) {
  return h('section', { class: 'card' }, title ? h('h3', {}, title) : null, ...children);
}
export function kvTable(rows) {
  return h('table', { class: 'kv' }, h('tbody', {}, rows.filter(Boolean).map(([k, v]) => h('tr', {}, h('td', {}, k), h('td', {}, v)))));
}
export function chip(text, kind = '') { return h('span', { class: `chip ${kind}` }, text); }

// Descarga de archivos. Dentro de un visor de artefactos de Claude se usa la capacidad
// «downloads» (con confirmación del usuario; los formatos no admitidos se entregan en .zip);
// en un navegador normal, un enlace de descarga.
const SAVE_EXT = new Set('gif png jpg jpeg webp mp4 webm txt json md docx pptx epub csv ttf html svg pdf xlsx zip'.split(' '));
let dlCap;
function downloadsCap() {
  if (dlCap === undefined) dlCap = window.claude && typeof window.claude.use === 'function' ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  return dlCap;
}
export async function download(blob, name) {
  const cap = await downloadsCap();
  if (cap) {
    let data = blob, filename = name;
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (!SAVE_EXT.has(ext)) {
      const { makeZip } = await import('../core/zip.js');
      data = await makeZip([{ name, data: blob }]);
      filename = name.replace(/\.[^.]+$/, '') + '.zip';
    }
    try { await cap.save({ filename, data }); toast(`Guardado: ${filename}`, 'ok'); }
    catch (e) { if (!e || e.code !== 'declined') toast(`No se pudo guardar ${filename}${e && e.message ? ': ' + e.message : ''}.`, 'bad'); }
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export function downloadText(text, name, type = 'text/plain') { return download(new Blob([text], { type: type + ';charset=utf-8' }), name); }

let toastHost = null;
export function toast(msg, kind = '', ms = 4500) {
  toastHost = toastHost || document.getElementById('toasts');
  if (!toastHost) return;
  const el = h('div', { class: `toast ${kind}`, role: 'status' }, msg);
  toastHost.append(el);
  setTimeout(() => el.remove(), ms);
}

export function setStatus(msg) { const el = document.getElementById('status-msg'); if (el) el.textContent = msg; }
export function setProgress(frac) {
  const p = document.getElementById('progress'), b = document.getElementById('progress-bar');
  if (!p) return;
  if (frac === null || frac === undefined) { p.hidden = true; return; }
  p.hidden = false;
  b.style.width = `${Math.round(100 * Math.max(0, Math.min(1, frac)))}%`;
}

export function modal(content) {
  const dlg = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  clear(body).append(...(Array.isArray(content) ? content : [content]),
    h('div', { class: 'row end', style: { marginTop: '16px' } }, h('button', { class: 'btn primary', onclick: () => dlg.close() }, 'Cerrar')));
  dlg.showModal();
}

// Confirmación dentro de la página (window.confirm no está disponible en todos los entornos).
export function confirmDialog(message, { ok = 'Continuar', cancel = 'Cancelar' } = {}) {
  return new Promise((resolve) => {
    const dlg = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const done = (v) => { dlg.removeEventListener('close', onClose); dlg.close(); resolve(v); };
    const onClose = () => resolve(false);
    clear(body).append(h('p', { style: { fontSize: '15px', margin: '4px 0 0' } }, message),
      h('div', { class: 'row end', style: { marginTop: '18px' } },
        h('button', { class: 'btn', onclick: () => done(false) }, cancel),
        h('button', { class: 'btn primary', onclick: () => done(true) }, ok)));
    dlg.addEventListener('close', onClose, { once: true });
    dlg.showModal();
  });
}

// Guardado local seguro (puede fallar en modo privado).
export function store(key, value) { try { localStorage.setItem('fotometria:' + key, JSON.stringify(value)); } catch { /* sin almacenamiento */ } }
export function load(key, fallback) { try { const v = localStorage.getItem('fotometria:' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
