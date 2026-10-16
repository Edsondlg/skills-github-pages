// Formateadores numéricos/unidades (es-MX) y mini-ayudantes DOM/SVG compartidos por los paneles.
// Sin dependencias. Todos los formateadores devuelven '—' para valores nulos o no finitos.

const NBSP = ' ';
const MINUS = '−';
const nfCache = new Map();
function nf(d) {
  let f = nfCache.get(d);
  if (!f) {
    f = new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
    nfCache.set(d, f);
  }
  return f;
}

/** Número con d decimales, separador de miles es-MX y signo menos tipográfico; '—' si no es finito. */
export function fmt(n, d = 1) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) < 0.5 * 10 ** -d) n = 0; // evita "-0.0"
  const s = nf(d).format(Math.abs(n));
  return n < 0 ? MINUS + s : s;
}
const unit = (n, d, u) => (n == null || !Number.isFinite(n) ? '—' : `${fmt(n, d)}${NBSP}${u}`);
export const fmtMm = (n, d = 1) => unit(n, d, 'mm');
export const fmtDeg = (n, d = 1) => (n == null || !Number.isFinite(n) ? '—' : `${fmt(n, d)}°`);
export const fmtPct = (n, d = 1) => unit(n, d, '%');
/** Fuerza en N → "12.3 kN". */
export const fmtKN = (N, d = 1) => unit(N == null ? N : N / 1000, d, 'kN');
/** Momento en N·m → "3.36 kN·m". */
export const fmtKNm = (Nm, d = 2) => unit(Nm == null ? Nm : Nm / 1000, d, 'kN·m');
/** Dinero: "$15.03 USD" / "$270.58 MXN". */
export function fmtMoney(v, currency = 'USD', d = 2) {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v < 0 ? MINUS : ''}$${fmt(Math.abs(v), d)}${NBSP}${currency}`;
}
/** Tiempo en s → "51.8 s", "2 min 05 s", "1 h 04 min". */
export function fmtTime(s) {
  if (s == null || !Number.isFinite(s)) return '—';
  if (s < 60) return `${fmt(s, 1)}${NBSP}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60), r = Math.round(s - 60 * m);
    return r === 60 ? `${m + 1}${NBSP}min 00${NBSP}s` : `${m}${NBSP}min ${String(r).padStart(2, '0')}${NBSP}s`;
  }
  const hh = Math.floor(s / 3600), m = Math.round((s - 3600 * hh) / 60);
  return m === 60 ? `${hh + 1}${NBSP}h 00${NBSP}min` : `${hh}${NBSP}h ${String(m).padStart(2, '0')}${NBSP}min`;
}

// ── DOM ──────────────────────────────────────────────────────────────────────────────────────

function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : String(c));
  }
}

/**
 * h('div', { class: 'x', style: {…}|'…', dataset: {…}, onclick: fn, id, title, … }, ...children)
 * Atributos con valor null/undefined/false se omiten; true → atributo vacío.
 */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'class') el.className = v;
      else if (k === 'value' || k === 'checked' || k === 'selected') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, children);
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
/** svg('circle', { cx, cy, r, class }, ...children) — atributos vía setAttribute; on* → listeners. */
export function svg(tag, attrs, ...children) {
  const el = document.createElementNS(SVGNS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, children);
  return el;
}

/** Vacía un elemento y le agrega los hijos dados. */
export function setChildren(el, ...children) {
  el.textContent = '';
  append(el, children);
  return el;
}

/** Redondeo a 2 decimales para coordenadas SVG compactas. */
export const r2 = (x) => Math.round(x * 100) / 100;

// ── Estado (pastillas e iconos) ─────────────────────────────────────────────────────────────

export const STATUS_LABEL = { ok: 'OK', warning: 'Advertencia', fail: 'Falla', info: 'Nota' };

/** Icono de severidad en SVG en línea (sin emoji). */
export function statusIcon(status) {
  const cls = `pnl-ico pnl-ico-${status}`;
  if (status === 'fail') {
    return svg('svg', { class: cls, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      svg('circle', { cx: 8, cy: 8, r: 7 }),
      svg('path', { d: 'M5.2 5.2 10.8 10.8M10.8 5.2 5.2 10.8', class: 'pnl-ico-mark' }));
  }
  if (status === 'warning') {
    return svg('svg', { class: cls, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      svg('path', { d: 'M8 1.3 15.2 14.4H.8Z' }),
      svg('path', { d: 'M8 5.6V9.8M8 11.6V12.6', class: 'pnl-ico-mark' }));
  }
  if (status === 'ok') {
    return svg('svg', { class: cls, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
      svg('circle', { cx: 8, cy: 8, r: 7 }),
      svg('path', { d: 'M4.6 8.2 7 10.6 11.4 5.6', class: 'pnl-ico-mark' }));
  }
  return svg('svg', { class: cls, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
    svg('circle', { cx: 8, cy: 8, r: 7 }),
    svg('path', { d: 'M8 7.2V11.8M8 4.4V5.4', class: 'pnl-ico-mark' }));
}

/** Pastilla de estado: OK / Advertencia / Falla (texto opcional). */
export function pill(status, text) {
  return h('span', { class: `pnl-pill pnl-pill-${status}` }, text ?? STATUS_LABEL[status] ?? status);
}

/** Pasos "bonitos" de eje: devuelve { lo, hi, step, ticks[] } que cubre [a, b] con ≈ n divisiones. */
export function niceTicks(a, b, n = 6) {
  if (!(b > a)) b = a + 1;
  const raw = (b - a) / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  const lo = Math.floor(a / step + 1e-9) * step, hi = Math.ceil(b / step - 1e-9) * step;
  const ticks = [];
  for (let k = 0, v = lo; v <= hi + step * 1e-6; k++, v = lo + k * step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9) + (step / p === 2.5 ? 1 : 0));
  return { lo, hi, step, ticks, decimals };
}
