// Paso 2: carga de fotos, detección de marcadores e inspección de cada foto.
import { h, add, clear, card, kvTable, fmt, chip, toast } from './dom.js';
import { projectPoint } from '../core/camera.js';
import { PART_ID_START } from '../core/board.js';

const STATUS_KIND = { 'pendiente': '', 'detectando': 'info', 'detectada': 'ok', 'registrada': 'ok', 'registrada (PnP)': 'ok', 'sin tablero': 'bad', 'error': 'bad', 'tamaño distinto': 'warn' };

export function renderPhotos(app) {
  const P = app.panel;
  const pr = app.project;
  const photos = pr.photos;
  const nDet = photos.filter(p => p.dets).length;
  const nBoard = photos.filter(p => (p.nMat || 0) >= 3).length;
  const nReg = photos.filter(p => p.registered).length;
  const fileInput = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: (e) => { app.addFiles([...e.target.files]); e.target.value = ''; } });
  add(P, 
    h('div', {}, h('h2', {}, '2 · Fotos'), h('p', { class: 'lead' }, 'Cargue 20–40 fotos de la pieza sobre el tapete, tomadas desde varias alturas y alrededor de toda la pieza, con la misma cámara y zoom.')),
    card('Fotos del proyecto',
      fileInput,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => fileInput.click() }, 'Agregar fotos…'),
        h('button', { class: 'btn', disabled: !photos.length || !!app.state.busy, onclick: () => app.runCalibration().then(() => app.go('calib')) }, 'Calibrar →'),
        h('button', { class: 'btn ghost danger', disabled: !photos.length || !!app.state.busy, onclick: () => { if (confirm('¿Quitar todas las fotos?')) { pr.clear(); app.invalidate('photos'); app.refresh(); } } }, 'Quitar todas'),
      ),
      h('div', { class: 'kpis' },
        kpi('Fotos', photos.length),
        kpi('Con tablero', `${nBoard}/${nDet || 0}`),
        kpi('Registradas', nReg),
        kpi('Marcadores/foto', nDet ? fmt(photos.filter(p => p.dets).reduce((s, p) => s + (p.nMat || 0), 0) / nDet, 1) : '—'),
      ),
    ),
    app.state.selPhoto ? photoInfo(app, photos.find(p => p.id === app.state.selPhoto)) : null,
    card('Consejos rápidos',
      h('ul', { class: 'hint', style: { margin: 0, paddingLeft: '18px' } },
        h('li', {}, 'Cada foto debe ver la pieza completa y ≥ 6 marcadores.'),
        h('li', {}, 'Mismo zoom y enfoque en todas (no use zoom digital).'),
        h('li', {}, 'Luz difusa, sin reflejos ni sombras duras.'),
        h('li', {}, 'Piezas brillantes: spray revelador mate + moteado.'),
      ),
      h('button', { class: 'btn small ghost', onclick: () => document.getElementById('btn-guide').click() }, 'Ver guía completa'),
    ),
  );
  renderStage(app);
  app.onPhotoUpdated = () => { if (app.state.step === 'photos' && !app.state.selPhoto) updateThumbs(app); };
}

function kpi(k, v) { return h('div', { class: 'kpi' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)); }

function photoInfo(app, p) {
  if (!p) return null;
  const ex = p.exif || {};
  return card(`Foto: ${p.name}`,
    kvTable([
      ['Estado', chip(p.status, STATUS_KIND[p.status] || '')],
      p.width ? ['Resolución', `${p.width} × ${p.height} px`] : null,
      ex.model ? ['Cámara', `${ex.make || ''} ${ex.model}`.trim()] : null,
      ex.focalMM ? ['Focal (EXIF)', `${fmt(ex.focalMM, 2)} mm${ex.focal35 ? ` · eq. 35 mm: ${ex.focal35} mm` : ''}`] : null,
      p.dets ? ['Marcadores del tapete', String(p.nMat)] : null,
      p.dets && p.nPart ? ['Calcomanías en pieza', String(p.nPart)] : null,
      p.sharp !== undefined ? ['Nitidez (var. laplaciano)', fmt(p.sharp, 0)] : null,
      p.expo ? ['Exposición media', `${fmt(p.expo.mean, 0)} / 255 · saturado ${fmt(100 * p.expo.clipHigh, 1)} %`] : null,
      p.registered ? ['Error de reproyección', `${fmt(p.rms, 3)} px (${p.nPts} esquinas)`] : null,
    ]),
    h('div', { class: 'row' },
      h('button', { class: 'btn small', onclick: () => { app.state.selPhoto = null; app.refresh(); } }, '← Volver a la cuadrícula'),
      h('button', { class: 'btn small ghost danger', onclick: () => { app.project.removePhoto(p.id); app.state.selPhoto = null; app.invalidate('photos'); app.refresh(); } }, 'Quitar foto'),
    ),
  );
}

function renderStage(app) {
  const v = app.showView('photos');
  clear(v);
  if (app.state.selPhoto) { renderDetail(app, v); return; }
  const wrap = h('div', { class: 'photos-wrap' });
  const dz = h('div', { class: 'dropzone' },
    h('div', {}, h('strong', {}, 'Arrastre aquí sus fotos'), ' o haga clic para seleccionarlas'),
    h('div', { class: 'hint' }, 'JPG/PNG de la misma cámara · se procesan localmente en su navegador (no se suben a ningún servidor)'));
  const fi = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: (e) => { app.addFiles([...e.target.files]); e.target.value = ''; } });
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); app.addFiles([...e.dataTransfer.files]); });
  wrap.append(dz, fi, h('div', { class: 'thumbs', id: 'thumbs' }));
  v.append(wrap);
  updateThumbs(app);
}

async function thumbUrl(p) {
  if (p.thumbUrl) return p.thumbUrl;
  if (p._thumbP) return p._thumbP;
  p._thumbP = (async () => {
    const bmp = await createImageBitmap(p.file, { resizeWidth: 360, resizeQuality: 'medium' });
    const c = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8));
    p.thumbUrl = URL.createObjectURL(blob);
    return p.thumbUrl;
  })();
  return p._thumbP;
}

function updateThumbs(app) {
  const grid = document.getElementById('thumbs');
  if (!grid) return;
  clear(grid);
  app.project.photos.forEach((p, i) => {
    const img = h('img', { alt: p.name, loading: 'lazy' });
    thumbUrl(p).then(u => { img.src = u; }).catch(() => {});
    const kind = STATUS_KIND[p.status] || '';
    const el = h('div', { class: 'thumb', title: p.name, onclick: () => { app.state.selPhoto = p.id; app.refresh(); } },
      img,
      h('div', { class: 'badge' }, chip(`#${i + 1}`, 'info')),
      h('button', { class: 'x', title: 'Quitar', onclick: (e) => { e.stopPropagation(); app.project.removePhoto(p.id); app.invalidate('photos'); app.refresh(); } }, '×'),
      h('div', { class: 'meta' }, h('span', { class: 'name' }, p.name), chip(p.dets ? `${p.nMat} mk` : p.status, kind)),
    );
    grid.append(el);
  });
}

async function renderDetail(app, v) {
  const pr = app.project;
  const idx = pr.photos.findIndex(p => p.id === app.state.selPhoto);
  const p = pr.photos[idx];
  if (!p) { app.state.selPhoto = null; renderStage(app); return; }
  const opts = app.state.photoOverlay || (app.state.photoOverlay = { markers: true, reproj: true });
  const canvas = h('canvas');
  const nav = (d) => { const q = pr.photos[(idx + d + pr.photos.length) % pr.photos.length]; app.state.selPhoto = q.id; app.refresh(); };
  const toggle = (k, label) => h('button', { class: 'btn small' + (opts[k] ? ' on' : ''), onclick: () => { opts[k] = !opts[k]; renderDetail(app, clear(v)); } }, label);
  v.append(h('div', { class: 'photo-detail' },
    h('div', { class: 'photo-toolbar' },
      h('button', { class: 'btn small', onclick: () => nav(-1) }, '◀'),
      h('button', { class: 'btn small', onclick: () => nav(1) }, '▶'),
      h('strong', {}, `${idx + 1}/${pr.photos.length} · ${p.name}`),
      h('span', { class: 'grow' }),
      toggle('markers', 'Marcadores'),
      pr.calib ? toggle('reproj', 'Error de reproyección ×50') : null,
      h('button', { class: 'btn small', onclick: () => { app.state.selPhoto = null; app.refresh(); } }, 'Cuadrícula'),
    ),
    canvas,
    h('div', { class: 'hint', style: { marginTop: '8px' } }, 'Verde: marcadores del tapete · naranja: calcomanías de la pieza · rojo: error de reproyección amplificado 50×.'),
  ));
  const bmp = await createImageBitmap(p.file);
  const maxW = 1800;
  const sc = Math.min(1, maxW / bmp.width);
  canvas.width = Math.round(bmp.width * sc); canvas.height = Math.round(bmp.height * sc);
  const g = canvas.getContext('2d');
  g.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  const lw = Math.max(1.5, canvas.width / 900);
  if (opts.markers && p.dets) {
    g.lineWidth = lw;
    g.font = `${Math.round(12 * lw)}px system-ui`;
    for (const d of p.dets) {
      const isPart = d.id >= PART_ID_START;
      g.strokeStyle = isPart ? '#f5a524' : (d.refined === false ? '#f05252' : '#22c55e');
      g.beginPath();
      d.corners.forEach(([x, y], k) => { const X = (x + 0.5) * sc - 0.5, Y = (y + 0.5) * sc - 0.5; if (k) g.lineTo(X, Y); else g.moveTo(X, Y); });
      g.closePath(); g.stroke();
      const [x0, y0] = d.corners[0];
      g.fillStyle = g.strokeStyle;
      g.fillRect(x0 * sc - 2 * lw, y0 * sc - 2 * lw, 4 * lw, 4 * lw);
      const cx = d.corners.reduce((s, c) => s + c[0], 0) / 4 * sc, cy = d.corners.reduce((s, c) => s + c[1], 0) / 4 * sc;
      g.fillStyle = 'rgba(0,0,0,.6)';
      const txt = String(d.id);
      const tw = g.measureText(txt).width;
      g.fillRect(cx - tw / 2 - 3, cy - 9 * lw, tw + 6, 13 * lw);
      g.fillStyle = '#fff';
      g.fillText(txt, cx - tw / 2, cy + 2 * lw);
    }
  }
  if (opts.reproj && pr.calib && p.registered) {
    g.strokeStyle = '#f05252'; g.lineWidth = lw;
    for (const d of p.dets || []) {
      const X = pr.cornerMap.get(d.id);
      if (!X) continue;
      d.corners.forEach(([u, vv], k) => {
        const [pu, pv] = projectPoint(pr.calib.K, p.R, p.t, X[k]);
        const ex = (pu - u) * 50, ey = (pv - vv) * 50;
        g.beginPath(); g.moveTo(u * sc, vv * sc); g.lineTo((u + ex) * sc, (vv + ey) * sc); g.stroke();
      });
    }
  }
}

export { thumbUrl };
