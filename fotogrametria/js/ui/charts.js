// Gráficas SVG ligeras (barras, histograma, medidor circular, perfil).
const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  for (const c of kids.flat()) if (c) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function gauge(frac, { size = 120, label = '' } = {}) {
  const r = size / 2 - 9, c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, frac || 0));
  const color = f >= 0.7 ? css('--ok') : f >= 0.5 ? css('--warn') : css('--bad');
  return s('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': label },
    s('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: css('--line'), 'stroke-width': 10 }),
    s('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: color, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': `${c * f} ${c}`, transform: `rotate(-90 ${size / 2} ${size / 2})` }),
    s('text', { x: size / 2, y: size / 2 + 8, 'text-anchor': 'middle', style: `font-size:${size * 0.22}px;font-weight:750;fill:${css('--text')}` }, `${Math.round(100 * f)}%`));
}

// Barras verticales con línea de referencia opcional.
export function barChart(values, { labels = null, width = 640, height = 180, ref = null, refLabel = '', unit = '', color = null, max = null } = {}) {
  const pad = { l: 40, r: 10, t: 12, b: 26 };
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const vmax = max ?? Math.max(1e-9, ...values.filter(isFinite), ref || 0) * 1.15;
  const bw = W / Math.max(1, values.length);
  const g = s('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img' });
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + H - H * i / 4;
    g.append(s('line', { x1: pad.l, x2: pad.l + W, y1: y, y2: y, stroke: css('--line'), 'stroke-width': 1 }));
    g.append(s('text', { x: pad.l - 6, y: y + 4, 'text-anchor': 'end' }, (vmax * i / 4).toFixed(vmax < 2 ? 2 : vmax < 20 ? 1 : 0)));
  }
  values.forEach((v, i) => {
    const hgt = isFinite(v) ? H * Math.min(1, v / vmax) : 0;
    const c = color ? color(v, i) : css('--accent');
    g.append(s('rect', { x: pad.l + i * bw + bw * 0.15, y: pad.t + H - hgt, width: Math.max(1, bw * 0.7), height: hgt, rx: 2, fill: c }, s('title', {}, `${labels ? labels[i] : i + 1}: ${isFinite(v) ? v.toFixed(3) : '—'} ${unit}`)));
    if (labels && values.length <= 40) g.append(s('text', { x: pad.l + i * bw + bw / 2, y: height - 8, 'text-anchor': 'middle' }, labels[i]));
  });
  if (ref !== null) {
    const y = pad.t + H - H * Math.min(1, ref / vmax);
    g.append(s('line', { x1: pad.l, x2: pad.l + W, y1: y, y2: y, stroke: css('--warn'), 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }));
    g.append(s('text', { x: pad.l + W - 4, y: y - 5, 'text-anchor': 'end', style: `fill:${css('--warn')}` }, refLabel));
  }
  return g;
}

// Histograma de valores con signo, coloreado por tolerancia.
export function histogram(values, { bins = 41, range = null, tol = null, width = 640, height = 180, unit = 'mm' } = {}) {
  const vals = Array.from(values).filter(isFinite);
  const lim = range ?? Math.max(1e-6, ...vals.map(Math.abs));
  const counts = new Array(bins).fill(0);
  for (const v of vals) { const k = Math.floor((v + lim) / (2 * lim) * bins); if (k >= 0 && k < bins) counts[k]++; }
  const centers = counts.map((_, i) => -lim + (i + 0.5) * 2 * lim / bins);
  const ok = css('--ok'), warn = css('--warn'), bad = css('--bad');
  const g = barChart(counts.map(c => c / Math.max(1, vals.length) * 100), { width, height, unit: '%', color: (v, i) => tol === null ? css('--accent') : (Math.abs(centers[i]) <= tol ? ok : Math.abs(centers[i]) <= 2 * tol ? warn : bad) });
  const pad = { l: 40, r: 10, b: 26 };
  const W = width - pad.l - pad.r;
  for (const t of [-lim, -lim / 2, 0, lim / 2, lim]) {
    g.append(s('text', { x: pad.l + (t + lim) / (2 * lim) * W, y: height - 8, 'text-anchor': 'middle' }, `${t.toFixed(2)}`));
  }
  g.append(s('text', { x: width - 10, y: 12, 'text-anchor': 'end' }, `% de puntos · ${unit}`));
  return g;
}

// Perfil 2D de una sección (segmentos en coordenadas u, v).
export function profileChart(segs, { width = 640, height = 260, uLabel = 'u', vLabel = 'v' } = {}) {
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let i = 0; i < segs.length; i += 2) { u0 = Math.min(u0, segs[i]); u1 = Math.max(u1, segs[i]); v0 = Math.min(v0, segs[i + 1]); v1 = Math.max(v1, segs[i + 1]); }
  const g = s('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img' });
  if (!isFinite(u0)) { g.append(s('text', { x: width / 2, y: height / 2, 'text-anchor': 'middle' }, 'El plano no corta la pieza')); return g; }
  const pad = 34;
  const sc = Math.min((width - 2 * pad) / Math.max(1e-6, u1 - u0), (height - 2 * pad) / Math.max(1e-6, v1 - v0));
  const X = (u) => pad + (u - u0) * sc, Y = (v) => height - pad - (v - v0) * sc;
  // rejilla cada 10 mm
  const step = (u1 - u0) > 300 ? 50 : 10;
  for (let u = Math.ceil(u0 / step) * step; u <= u1; u += step) g.append(s('line', { x1: X(u), x2: X(u), y1: pad / 2, y2: height - pad, stroke: css('--line') }));
  for (let v = Math.ceil(v0 / step) * step; v <= v1; v += step) g.append(s('line', { x1: pad, x2: width - pad / 2, y1: Y(v), y2: Y(v), stroke: css('--line') }));
  let d = '';
  for (let i = 0; i < segs.length; i += 4) d += `M${X(segs[i]).toFixed(1)} ${Y(segs[i + 1]).toFixed(1)}L${X(segs[i + 2]).toFixed(1)} ${Y(segs[i + 3]).toFixed(1)}`;
  g.append(s('path', { d, stroke: css('--accent'), 'stroke-width': 1.6, fill: 'none' }));
  g.append(s('text', { x: pad, y: height - 8 }, `${uLabel}: ${u0.toFixed(1)} … ${u1.toFixed(1)} mm (${(u1 - u0).toFixed(2)} mm)`));
  g.append(s('text', { x: width - pad, y: 14, 'text-anchor': 'end' }, `${vLabel}: ${v0.toFixed(1)} … ${v1.toFixed(1)} mm (${(v1 - v0).toFixed(2)} mm)`));
  return g;
}
