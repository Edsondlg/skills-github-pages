// Paso 3: calibración de cámara, registro de fotos y validación con puntos de control.
import { h, add, card, kvTable, fmt, pct, chip, field, selectInput, store, downloadText } from './dom.js';
import { barChart } from './charts.js';

export function renderCalib(app) {
  const P = app.panel;
  const cal = app.project.calib;
  const flags = app.settings.calibFlags;
  const model = flags.fixK3 === false ? 'k3' : (flags.fixTangential ? 'notan' : 'std');
  add(P, 
    h('div', {}, h('h2', {}, '3 · Calibración de cámara'), h('p', { class: 'lead' }, 'Se estiman la distancia focal, el punto principal y la distorsión de la lente, y la posición exacta de cada foto respecto al tapete (ajuste de haces).')),
    card('Modelo y ejecución',
      field('Modelo de distorsión', selectInput([['std', 'Estándar (k1, k2, p1, p2)'], ['k3', 'Gran angular (+ k3)'], ['notan', 'Solo radial (k1, k2)']], model, (v) => {
        app.settings.calibFlags = v === 'k3' ? { fixK3: false } : v === 'notan' ? { fixK3: true, fixTangential: true } : { fixK3: true };
        store('calibFlags', app.settings.calibFlags);
        app.refresh();
      })),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: !!app.state.busy || app.project.photos.length < 3, onclick: () => app.runCalibration() }, cal ? 'Recalibrar' : 'Calibrar cámara'),
        cal ? h('button', { class: 'btn', disabled: !!app.state.busy, onclick: () => app.go('recon') }, 'Reconstruir →') : null,
      ),
      app.project.photos.length < 3 ? h('p', { class: 'hint' }, 'Agregue al menos 3 fotos con el tapete visible (recomendado: 20 o más).') : null,
    ),
  );
  if (cal) {
    const K = cal.K, sd = cal.std || {};
    const c = cal.check || {};
    add(P, 
      h('div', { class: 'kpis' },
        kpi('Fotos registradas', pct(cal.registered / Math.max(1, cal.total), 0), `${cal.registered} de ${cal.total}`, cal.registered / Math.max(1, cal.total)),
        kpi('Reproyección RMS', `${fmt(cal.rms, 3)} px`, `${cal.nPoints} esquinas`, Math.max(0, Math.min(1, (2 - cal.rms) / 1.7))),
        kpi('Control 3D (RMS)', c.rms3d !== undefined ? `${fmt(c.rms3d, 3)} mm` : '—', c.n ? `${c.n} esquinas independientes` : 'sin puntos de control', c.rms3d !== undefined ? Math.max(0, Math.min(1, (0.6 - c.rms3d) / 0.55)) : 0),
        kpi('Error de escala', c.scaleErrPPM !== undefined && c.scaleErrPPM !== null ? `${fmt(c.scaleErrPPM / 1e4, 3)} %` : '—', 'en distancias > 100 mm', c.scaleErrPPM ? Math.max(0, Math.min(1, (3000 - c.scaleErrPPM) / 2700)) : 0),
      ),
      card('Parámetros intrínsecos',
        kvTable([
          ['Resolución', `${cal.W} × ${cal.H} px`],
          ['Focal f', `${fmt(K.fx, 2)} px ± ${fmt(sd.f, 2)}`],
          ['Campo de visión H', `${fmt(2 * Math.atan(cal.W / 2 / K.fx) * 180 / Math.PI, 1)}°`],
          ['Punto principal cx, cy', `${fmt(K.cx, 1)}, ${fmt(K.cy, 1)} px ± ${fmt(sd.cx, 1)}`],
          ['k1, k2', `${fmt(K.k1, 5)}, ${fmt(K.k2, 5)}`],
          ['p1, p2', `${fmt(K.p1, 6)}, ${fmt(K.p2, 6)}`],
          ['k3', fmt(K.k3, 5)],
          ['Focal inicial (EXIF)', cal.fInit ? `${fmt(cal.fInit, 1)} px` : 'no disponible'],
          ['Cobertura de la imagen', pct(cal.coverage.frac, 0)],
        ]),
      ),
      c.rms3d !== undefined ? card('Validación con puntos de control',
        h('p', { class: 'hint' }, 'Una de cada cuatro marcas del tapete se excluye del ajuste y luego se triangula: la diferencia con su posición conocida es una medida independiente de la exactitud 3D.'),
        kvTable([
          ['RMS 3D', `${fmt(c.rms3d, 4)} mm`],
          ['RMS X / Y / Z', `${fmt(c.rmsX, 4)} / ${fmt(c.rmsY, 4)} / ${fmt(c.rmsZ, 4)} mm`],
          ['Percentil 95', `${fmt(c.p95, 4)} mm`],
          ['Máximo', `${fmt(c.max3d, 4)} mm`],
          ['Sesgo de escala', c.scaleBias !== null ? `${fmt(c.scaleBias * 1e6, 0)} ppm` : '—'],
        ]),
      ) : null,
      cal.stickers && cal.stickers.length ? card(`Calcomanías sobre la pieza (${cal.stickers.length})`,
        h('div', { style: { maxHeight: '220px', overflow: 'auto' } }, h('table', { class: 'grid' },
          h('thead', {}, h('tr', {}, h('th', {}, 'ID'), h('th', {}, 'X'), h('th', {}, 'Y'), h('th', {}, 'Z'), h('th', {}, 'Lado'), h('th', {}, 'σ'), h('th', {}, 'Fotos'))),
          h('tbody', {}, cal.stickers.map(s => h('tr', {}, h('td', {}, String(s.id)), ...s.center.map(v => h('td', {}, fmt(v, 2))), h('td', {}, fmt(s.side, 2)), h('td', {}, fmt(s.std, 3)), h('td', {}, String(s.views))))))),
        h('button', { class: 'btn small', onclick: () => downloadText(['id,x_mm,y_mm,z_mm,nx,ny,nz,lado_mm,sigma_mm,fotos', ...cal.stickers.map(s => [s.id, ...s.center.map(v => v.toFixed(4)), ...s.normal.map(v => v.toFixed(5)), s.side.toFixed(4), s.std.toFixed(4), s.views].join(','))].join('\n'), 'calcomanias_3d.csv', 'text/csv') }, 'Exportar CSV'),
      ) : null,
      card('Error por foto (RMS, px)', barChart(cal.perPhoto.map(p => p.registered ? p.rms : NaN), { labels: cal.perPhoto.map((p, i) => String(i + 1)), height: 160, ref: Math.max(0.5, 2 * cal.rms), refLabel: 'umbral', color: (v) => !isFinite(v) ? '#888' : v > 2 * cal.rms ? getComputedStyle(document.documentElement).getPropertyValue('--warn') : getComputedStyle(document.documentElement).getPropertyValue('--accent') })),
      h('details', { class: 'card' }, h('summary', {}, 'Registro del ajuste'), h('pre', { class: 'mono', style: { whiteSpace: 'pre-wrap', margin: 0 } }, cal.log.join('\n'))),
    );
  }
  showScene(app);
}

function kpi(k, v, sub, frac) {
  return h('div', { class: 'kpi' }, h('div', { class: 'v' }, v), h('div', { class: 'k' }, k), sub ? h('div', { class: 'k' }, sub) : null, h('div', { class: 'meter' }, h('i', { style: { width: `${Math.round(100 * frac)}%`, background: frac >= 0.7 ? 'var(--ok)' : frac >= 0.5 ? 'var(--warn)' : 'var(--bad)' } })));
}

async function showScene(app) {
  app.showView('3d');
  const v = await app.ensureViewer();
  app.syncViewerScene();
  v.show('cameras', true); v.show('board', true); v.show('stickers', true);
  if (!app.state.recon) v.fit(v.groups.cameras.children.length ? v.groups.cameras : null);
  const info = document.getElementById('hud-info');
  info.textContent = app.project.calib ? 'Pirámides azules: posición y orientación de cada foto. Arrastre para girar, rueda para acercar, clic derecho para desplazar.' : 'Calibre para ver las posiciones de las fotos.';
  document.getElementById('hud-top').replaceChildren();
  document.getElementById('hud-legend').hidden = true;
}

export { chip };
