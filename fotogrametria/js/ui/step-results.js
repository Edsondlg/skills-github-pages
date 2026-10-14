// Paso 6: resultados — índice de calidad, porcentajes de efectividad, incertidumbre y reporte.
import { h, add, clear, card, field, numInput, fmt, pct, download, downloadText, store, toast } from './dom.js';
import { gauge, barChart, histogram } from './charts.js';
import { metricsToCSV } from '../analysis/metrics.js';

export function renderResults(app) {
  const P = app.panel;
  const M = app.state.metrics || (app.project.calib ? app.computeMetrics() : null);
  add(P, 
    h('div', {}, h('h2', {}, '6 · Resultados'), h('p', { class: 'lead' }, 'Porcentajes de efectividad de cada etapa, incertidumbre estimada y recomendaciones. Todo se calcula con datos del propio proyecto.')),
    card('Objetivo de precisión',
      field('Tolerancia objetivo (± mm)', numInput(app.settings.target, { min: 0.05, max: 10, step: 0.05, onChange: (v) => { app.settings.target = v; store('target', v); app.computeMetrics(); app.refresh(); } })),
      h('p', { class: 'hint' }, 'Las puntuaciones se escalan respecto a esta tolerancia (por defecto ±1 mm, «precisión milimétrica»).'),
    ),
    card('Exportar',
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: !M, onclick: () => openReport(app) }, 'Reporte (imprimir / PDF)'),
        h('button', { class: 'btn', disabled: !M, onclick: () => downloadText(metricsToCSV(M), 'metricas_calidad.csv', 'text/csv') }, 'Métricas CSV'),
        h('button', { class: 'btn', disabled: !app.project.calib, onclick: () => downloadText(JSON.stringify(projectSummary(app), null, 1), 'proyecto_fotogrametria.json', 'application/json') }, 'Resumen JSON'),
      ),
    ),
    M && M.recs.length ? card('Recomendaciones', h('ul', { class: 'hint', style: { margin: 0, paddingLeft: '18px' } }, M.recs.map(r => h('li', {}, r)))) : null,
  );
  const v = app.showView('dash');
  clear(v);
  if (!M) { v.append(h('div', { class: 'empty' }, h('h3', {}, 'Sin resultados todavía'), h('p', {}, 'Cargue fotos y calibre (o pruebe la demostración) para ver las métricas.'), h('button', { class: 'btn primary', onclick: () => app.runDemo() }, '▶ Ejecutar demostración'))); return; }
  v.append(dashboard(app, M));
}

function scoreColor(s) { return s === null || s === undefined ? 'var(--faint)' : s >= 0.7 ? 'var(--ok)' : s >= 0.5 ? 'var(--warn)' : 'var(--bad)'; }
function valueText(it) {
  if (typeof it.value !== 'number') return `${it.value}${it.unit ? ' ' + it.unit : ''}`;
  const d = it.unit === '%' ? 1 : it.unit === 'mm' ? 3 : it.unit === 'px' ? (it.value > 100 ? 1 : 3) : it.value > 100 ? 0 : 2;
  return `${fmt(it.value, d)}${it.unit ? ' ' + it.unit : ''}`;
}

export function dashboard(app, M) {
  const rec = app.state.recon, cal = app.project.calib;
  const d = h('div', { class: 'dash' });
  // índice global
  d.append(h('div', { class: 'tile w6' }, h('h3', {}, 'Índice global de calidad'),
    h('div', { class: 'gauge' }, gauge(M.index ?? 0, { size: 132, label: 'Índice global' }), h('div', {},
      h('div', { class: `verdict ${M.verdictClass || ''}-t` }, M.verdict || '—'),
      h('div', { class: 'sub' }, M.summary || 'Reconstruya la pieza para estimar la incertidumbre.'),
      h('div', { class: 'sub' }, `Promedio ponderado de ${Object.keys(M.scores).length} indicadores`)))));
  d.append(h('div', { class: 'tile w3' }, h('h3', {}, 'Incertidumbre (95 %)'), h('div', { class: 'big' }, M.uncertainty95 !== undefined ? `±${fmt(M.uncertainty95, 2)}` : '—', h('small', {}, ' mm')), h('div', { class: 'sub' }, `Objetivo ±${fmt(M.target, 2)} mm · ${M.meetsTarget === undefined ? 'pendiente' : M.meetsTarget ? 'CUMPLE' : 'NO CUMPLE'}`)));
  const st = rec && rec.meshStats;
  d.append(h('div', { class: 'tile w3' }, h('h3', {}, 'Pieza (X × Y × Z)'), h('div', { class: 'big', style: { fontSize: '22px' } }, st ? `${fmt(st.bbox.size[0], 1)} × ${fmt(st.bbox.size[1], 1)} × ${fmt(st.bbox.max[2], 1)}` : '—', h('small', {}, ' mm')), h('div', { class: 'sub' }, st ? `Área ${fmt(st.area / 100, 1)} cm² · ${st.triangles.toLocaleString('es-MX')} triángulos` : 'Sin reconstrucción')));
  // barras de efectividad
  const scored = M.items.filter(it => it.score !== null && it.score !== undefined);
  d.append(h('div', { class: 'tile w6' }, h('h3', {}, 'Porcentajes de efectividad por indicador'), h('div', { class: 'bars' }, scored.map(it => h('div', { class: 'barrow', title: it.note || '' },
    h('span', {}, it.label), h('span', { class: 'track' }, h('i', { style: { width: `${Math.round(100 * it.score)}%`, background: scoreColor(it.score) } })), h('span', { class: 'val' }, `${Math.round(100 * it.score)} %`))))));
  // tabla de métricas
  const groups = [...new Set(M.items.map(i => i.group))];
  d.append(h('div', { class: 'tile w6' }, h('h3', {}, 'Valores medidos'), h('div', { style: { maxHeight: '420px', overflow: 'auto' } }, h('table', { class: 'grid' }, h('tbody', {}, groups.flatMap(g => [
    h('tr', {}, h('th', { colspan: 2, style: { textAlign: 'left' } }, g)),
    ...M.items.filter(i => i.group === g).map(it => h('tr', { title: it.note || '' }, h('td', {}, it.label, it.note ? h('div', { class: 'hint' }, it.note) : null), h('td', { class: 'mono' }, valueText(it)))),
  ]))))));
  // error por foto
  if (cal) {
    d.append(h('div', { class: 'tile w6' }, h('h3', {}, 'Error de reproyección por foto (px)'), barChart(cal.perPhoto.map(p => p.registered ? p.rms : NaN), { labels: cal.perPhoto.map((_, i) => String(i + 1)), height: 170, ref: 1.0, refLabel: '1 px' })));
  }
  if (rec) {
    const pv = rec.perView.filter(v => !v.skipped);
    d.append(h('div', { class: 'tile w6' }, h('h3', {}, 'Píxeles confiables por mapa de profundidad (%)'), barChart(pv.map(v => 100 * v.validFrac), { labels: pv.map(v => String(v.index + 1)), height: 170, max: 100, ref: 50, refLabel: '50 %' })));
  }
  if (app.state.cad && app.state.cad.stats) {
    const c = app.state.cad;
    d.append(h('div', { class: 'tile w12' }, h('h3', {}, `Distribución de desviaciones vs CAD (tolerancia ±${c.tol} mm)`), histogram(c.deviation, { range: c.range, tol: c.tol, width: 1100, height: 200 }),
      h('div', { class: 'sub' }, `Dentro de tolerancia: ${pct(c.stats.inTol)} · media ${fmt(c.stats.mean, 3)} mm · RMS ${fmt(c.stats.rms, 3)} mm · σ ${fmt(c.stats.std, 3)} mm`)));
  }
  if (cal && cal.stickers && cal.stickers.length) {
    d.append(h('div', { class: 'tile w12' }, h('h3', {}, 'Puntos de control sobre la pieza (calcomanías)'), h('table', { class: 'grid' },
      h('thead', {}, h('tr', {}, ['ID', 'X (mm)', 'Y (mm)', 'Z (mm)', 'Lado (mm)', 'σ (mm)', 'Fotos'].map(t => h('th', {}, t)))),
      h('tbody', {}, cal.stickers.map(s => h('tr', {}, h('td', {}, String(s.id)), ...s.center.map(x => h('td', {}, fmt(x, 3))), h('td', {}, fmt(s.side, 3)), h('td', {}, fmt(s.std, 3)), h('td', {}, String(s.views))))))));
  }
  if (app.state.demo && rec) {
    d.append(h('div', { class: 'tile w12' }, h('h3', {}, 'Validación contra la geometría real (solo demostración)'), h('div', { id: 'demo-val', class: 'sub' }, 'Calculando…')));
    validateDemo(app).then(r => { const el = document.getElementById('demo-val'); if (el && r) el.textContent = r; });
  }
  return d;
}

async function validateDemo(app) {
  const { TriangleGrid, pointsToMesh } = await import('../analysis/distance.js');
  const gt = app.state.demo.gt;
  if (!app.state.demoGrid) app.state.demoGrid = new TriangleGrid(gt.positions, gt.indices);
  const d = Array.from(pointsToMesh(app.state.recon.mesh.positions, app.state.demoGrid, 20)).sort((a, b) => a - b);
  const q = (p) => d[Math.floor((d.length - 1) * p)];
  const w1 = d.filter(x => x <= 1).length / d.length, w05 = d.filter(x => x <= 0.5).length / d.length;
  return `Distancia de los vértices reconstruidos a la pieza verdadera: mediana ${fmt(q(0.5), 3)} mm · p90 ${fmt(q(0.9), 3)} mm · p95 ${fmt(q(0.95), 3)} mm · ${pct(w05)} dentro de ±0.5 mm · ${pct(w1)} dentro de ±1 mm.`;
}

function projectSummary(app) {
  const cal = app.project.calib, rec = app.state.recon, M = app.state.metrics;
  return {
    fecha: new Date().toISOString(),
    tapete: { codigo: app.project.board.code, papel_mm: [app.project.board.paperW, app.project.board.paperH], marcador_mm: app.project.board.markerSize, escala: [app.settings.board.scaleX, app.settings.board.scaleY] },
    camara: cal ? { K: cal.K, desviaciones: cal.std, rms_px: cal.rms, puntos: cal.nPoints, control: cal.check } : null,
    fotos: app.project.photos.map(p => ({ nombre: p.name, ancho: p.width, alto: p.height, marcadores: p.nMat, registrada: !!p.registered, rms_px: p.rms, R: p.R, t_mm: p.t })),
    calcomanias: cal ? cal.stickers : [],
    reconstruccion: rec ? { malla: rec.meshStats, voxel_mm: rec.voxel, gsd_mm: rec.gsd, caja: rec.partBox, ruido_mesa: rec.tableStats, tiempos_ms: rec.timings, parametros: rec.params } : null,
    metricas: M ? { indice: M.index, veredicto: M.verdict, incertidumbre95_mm: M.uncertainty95, items: M.items, recomendaciones: M.recs } : null,
    cad: app.state.cad && app.state.cad.stats ? { archivo: app.state.cad.name, tolerancia: app.state.cad.tol, estadisticas: app.state.cad.stats, R: app.state.cad.R, t: app.state.cad.t } : null,
  };
}

function openReport(app) {
  const M = app.state.metrics;
  const w = window.open('', '_blank');
  if (!w) { toast('Permita ventanas emergentes para abrir el reporte.', 'warn'); return; }
  let shot = '';
  try { if (app._viewer && app.state.recon) shot = app._viewer.screenshot(); } catch { shot = ''; }
  const cal = app.project.calib, rec = app.state.recon;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = M.items.map(it => `<tr><td>${esc(it.group)}</td><td>${esc(it.label)}${it.note ? `<div class="n">${esc(it.note)}</div>` : ''}</td><td class="r">${esc(valueText(it))}</td><td class="r">${it.score === null || it.score === undefined ? '' : Math.round(100 * it.score) + ' %'}</td></tr>`).join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte de fotogrametría</title>
<style>body{font:13px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#111;margin:28px;max-width:960px}h1{font-size:22px;margin:0}h2{font-size:15px;margin:22px 0 8px;border-bottom:2px solid #0d9488;padding-bottom:4px}
table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:5px 6px;vertical-align:top}th{text-align:left;background:#f3f5f7}.r{text-align:right;font-family:ui-monospace,Menlo,Consolas,monospace}.n{color:#666;font-size:11.5px}
.kpi{display:inline-block;border:1px solid #ccc;border-radius:8px;padding:8px 12px;margin:4px 8px 4px 0}.kpi b{display:block;font-size:20px}.ok{color:#15803d}.warn{color:#b45309}.bad{color:#b91c1c}img{max-width:100%;border:1px solid #ccc;border-radius:6px}
@media print{body{margin:12mm}button{display:none}}</style></head><body>
<button onclick="print()" style="float:right;padding:8px 14px">Imprimir / Guardar PDF</button>
<h1>Reporte de reconstrucción fotogramétrica</h1><div class="n">${new Date().toLocaleString('es-MX')} · FotoMetría 3D · tapete ${esc(app.project.board.code)}</div>
<h2>Resumen</h2>
<div class="kpi">Índice global<b class="${M.verdictClass || ''}">${M.index !== null ? Math.round(100 * M.index) + ' %' : '—'}</b>${esc(M.verdict || '')}</div>
<div class="kpi">Incertidumbre 95 %<b>${M.uncertainty95 !== undefined ? '±' + M.uncertainty95.toFixed(2) + ' mm' : '—'}</b>objetivo ±${M.target} mm</div>
${rec && rec.meshStats ? `<div class="kpi">Dimensiones X×Y×Z<b>${rec.meshStats.bbox.size[0].toFixed(2)} × ${rec.meshStats.bbox.size[1].toFixed(2)} × ${rec.meshStats.bbox.max[2].toFixed(2)} mm</b>área ${(rec.meshStats.area / 100).toFixed(1)} cm²</div>` : ''}
${cal ? `<div class="kpi">Fotos registradas<b>${cal.registered}/${cal.total}</b>RMS ${cal.rms.toFixed(3)} px</div>` : ''}
<p>${esc(M.summary || '')}</p>
${shot ? `<h2>Vista 3D</h2><img src="${shot}" alt="Vista 3D de la pieza">` : ''}
<h2>Indicadores</h2><table><thead><tr><th>Grupo</th><th>Indicador</th><th class="r">Valor</th><th class="r">Efectividad</th></tr></thead><tbody>${rows}</tbody></table>
${cal ? `<h2>Cámara</h2><table><tbody><tr><td>Focal</td><td class="r">${cal.K.fx.toFixed(2)} px</td></tr><tr><td>Punto principal</td><td class="r">${cal.K.cx.toFixed(1)}, ${cal.K.cy.toFixed(1)} px</td></tr><tr><td>Distorsión k1, k2, p1, p2, k3</td><td class="r">${[cal.K.k1, cal.K.k2, cal.K.p1, cal.K.p2, cal.K.k3].map(x => x.toFixed(5)).join(', ')}</td></tr></tbody></table>` : ''}
${app.state.cad && app.state.cad.stats ? `<h2>Comparación con CAD (${esc(app.state.cad.name)})</h2><table><tbody><tr><td>Dentro de ±${app.state.cad.tol} mm</td><td class="r">${(100 * app.state.cad.stats.inTol).toFixed(1)} %</td></tr><tr><td>Media / RMS / σ</td><td class="r">${app.state.cad.stats.mean.toFixed(3)} / ${app.state.cad.stats.rms.toFixed(3)} / ${app.state.cad.stats.std.toFixed(3)} mm</td></tr><tr><td>Máx + / máx −</td><td class="r">${app.state.cad.stats.max.toFixed(3)} / ${app.state.cad.stats.min.toFixed(3)} mm</td></tr></tbody></table>` : ''}
<h2>Recomendaciones</h2><ul>${M.recs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
<p class="n">La incertidumbre se estima combinando el error 3D en puntos de control independientes (marcadores excluidos del ajuste), el ruido de profundidad medido sobre el plano conocido de la mesa y la resolución volumétrica. Para piezas críticas, verifique con un patrón dimensional conocido.</p>
</body></html>`;
  w.document.write(html);
  w.document.close();
}
export { download };
