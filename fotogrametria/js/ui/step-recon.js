// Paso 4: reconstrucción densa (PatchMatch en GPU + fusión TSDF + malla).
import { h, add, card, field, numInput, kvTable, fmt, pct, store } from './dom.js';
import { QUALITY } from '../mvs/pipeline.js';

export function renderRecon(app) {
  const P = app.panel;
  const r = app.settings.recon;
  const rec = app.state.recon;
  const busy = app.state.busy === 'recon';
  const set = (o) => { Object.assign(r, o); store('recon', r); app.refresh(); };
  const seg = h('div', { class: 'seg' }, Object.entries(QUALITY).filter(([, q]) => !q.hidden).map(([k, q]) => h('button', { class: r.quality === k ? 'on' : '', onclick: () => set({ quality: k }) }, q.label)));
  const log = h('div', { class: 'hint mono', id: 'recon-log', style: { maxHeight: '160px', overflow: 'auto', whiteSpace: 'pre-wrap' } });
  add(P, 
    h('div', {}, h('h2', {}, '4 · Reconstrucción densa'), h('p', { class: 'lead' }, 'Estéreo multivista en la GPU (PatchMatch con planos inclinados) y fusión volumétrica de los mapas de profundidad en una malla con color.')),
    card('Parámetros',
      field('Calidad', seg, { wide: true }),
      h('p', { class: 'hint' }, `Resolución de trabajo: ${QUALITY[r.quality].fine} px (lado mayor) · ${QUALITY[r.quality].iters} iteraciones · ${QUALITY[r.quality].nsrc} vistas vecinas. «Alta» y «Máxima» requieren una GPU dedicada.`),
      field('Altura máxima de la pieza (mm)', numInput(r.maxHeight, { min: 5, max: 600, step: 1, onChange: (v) => set({ maxHeight: v }) })),
      field('Espesor de lámina (mm)', numInput(r.sheetThickness, { min: 0.2, max: 20, step: 0.1, onChange: (v) => set({ sheetThickness: v }) }), { hint: 'Evita que se mezclen las dos caras de paredes delgadas' }),
      field('Corte sobre la mesa (mm)', numInput(r.zCut, { min: 0.1, max: 10, step: 0.1, onChange: (v) => set({ zCut: v }) }), { hint: 'Se descarta lo que esté por debajo (la mesa)' }),
      h('details', {}, h('summary', { class: 'hint', style: { cursor: 'pointer' } }, 'Avanzado'),
        field('Vistas mínimas por punto', numInput(r.minViews, { min: 1, max: 6, step: 1, onChange: (v) => set({ minViews: v }) })),
        field('Suavizado (iteraciones)', numInput(r.smooth, { min: 0, max: 10, step: 1, onChange: (v) => set({ smooth: v }) })),
        field('Umbral de costo NCC', numInput(r.costThr, { min: 0.1, max: 0.8, step: 0.05, onChange: (v) => set({ costThr: v }) })),
        field('Tamaño de vóxel (mm, 0 = auto)', numInput(r.voxel || 0, { min: 0, max: 3, step: 0.05, onChange: (v) => set({ voxel: v > 0 ? v : null }) })),
      ),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: !!app.state.busy || !app.project.photos.length, onclick: () => app.runReconstruction() }, rec ? 'Reconstruir de nuevo' : 'Reconstruir'),
        busy ? h('button', { class: 'btn danger', onclick: () => app.cancel() }, 'Cancelar') : null,
        rec ? h('button', { class: 'btn', onclick: () => app.go('viewer') }, 'Ver en 3D →') : null,
      ),
      !app.project.calib ? h('p', { class: 'hint' }, 'Se calibrará automáticamente antes de reconstruir.') : null,
      log,
    ),
  );
  if (rec) {
    const st = rec.meshStats;
    const ts = rec.tableStats;
    const pv = rec.perView.filter(v => !v.skipped);
    add(P, 
      card('Resultado',
        kvTable([
          ['Tiempo total', `${fmt(rec.wallTime / 1000, 1)} s (GPU fina ${fmt(rec.timings.fine / 1000, 1)} s)`],
          ['Mapas de profundidad', `${pv.length} · ${rec.fineSize[0]} × ${rec.fineSize[1]} px`],
          ['Píxeles confiables (prom.)', pct(pv.reduce((s, v) => s + v.validFrac, 0) / Math.max(1, pv.length))],
          ['Resolución en la pieza (GSD)', `${fmt(rec.gsd, 3)} mm/px`],
          ['Tamaño de vóxel', `${fmt(rec.voxel, 3)} mm`],
          ['Caja de la pieza', `${fmt(rec.partBox.max[0] - rec.partBox.min[0], 0)} × ${fmt(rec.partBox.max[1] - rec.partBox.min[1], 0)} × ${fmt(rec.partBox.max[2], 0)} mm`],
          st ? ['Malla', `${st.vertices.toLocaleString('es-MX')} vért. · ${st.triangles.toLocaleString('es-MX')} triáng.`] : null,
          ts ? ['Ruido en plano de mesa (1σ)', `${fmt(ts.sigma, 3)} mm (RMS ${fmt(ts.rms, 3)})`] : null,
        ]),
        ...(rec.warnings || []).map(w => h('p', { class: 'hint warn-t' }, '⚠ ' + w)),
      ),
      rec.previews && rec.previews.length ? card('Mapas de profundidad (vista previa)', h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' } }, rec.previews.map(pv => {
        const c = h('canvas', { width: pv.w, height: pv.h, title: `Foto ${pv.index + 1}`, style: { width: '100%', borderRadius: '6px' } });
        c.getContext('2d').putImageData(new ImageData(pv.rgba, pv.w, pv.h), 0, 0);
        return c;
      }))) : null,
    );
  }
  app.onReconProgress = (stage, f, msg) => {
    const el = document.getElementById('recon-log');
    if (!el) return;
    if (stage === 'caja' || stage === 'listo' || f >= 1) { el.textContent += msg + '\n'; el.scrollTop = el.scrollHeight; }
  };
  showScene(app);
}

async function showScene(app) {
  app.showView('3d');
  const v = await app.ensureViewer();
  app.syncViewerScene();
  v.show('cameras', !app.state.recon);
  document.getElementById('hud-top').replaceChildren();
  document.getElementById('hud-legend').hidden = true;
  document.getElementById('hud-info').textContent = app.state.recon ? 'Malla reconstruida con el color de las fotos.' : 'La reconstrucción usa la GPU de su equipo; puede tardar de segundos a minutos.';
  if (app.state.recon) v.view('iso');
}
