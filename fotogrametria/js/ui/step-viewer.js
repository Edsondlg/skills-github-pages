// Paso 5: visor 3D — modos de visualización, mediciones, secciones, edición y exportación.
import * as THREE from 'three';
import { h, add, card, kvTable, fmt, download, downloadText, toast, checkbox } from './dom.js';
import { MeasureTool, MEASURE_TYPES, sectionSegments } from '../viewer/tools.js';
import { profileChart } from './charts.js';
import { taubinSmooth, removeSmallComponents, filterTriangles, meshStats } from '../mesh/process.js';
import { disposeGroup, label } from '../viewer/viewer.js';
import { detectHoles } from '../analysis/features.js';

const MODES = [['color', 'Color real'], ['texture', 'Textura foto'], ['shaded', 'Metálico'], ['wire', 'Alambre'], ['points', 'Puntos'], ['confidence', 'Confianza'], ['deviation', 'Desviación CAD']];

export function renderViewer(app) {
  const P = app.panel;
  const rec = app.state.recon;
  add(P, h('div', {}, h('h2', {}, '5 · Visor 3D'), h('p', { class: 'lead' }, 'Gire con el botón izquierdo, desplace con el derecho y acerque con la rueda. Mida directamente sobre la pieza (mm).')));
  if (!rec) {
    add(P, h('div', { class: 'card' }, h('p', { class: 'hint' }, 'Aún no hay una pieza reconstruida.'), h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: () => app.go('recon') }, 'Ir a reconstrucción'),
      h('button', { class: 'btn', onclick: () => app.runDemo() }, 'Ver demostración'))));
    showScene(app);
    return;
  }
  const vs = app.state.view || (app.state.view = { mode: 'color', board: true, cameras: false, grid: true, box: false, stickers: true, cad: true });
  const seq = app.renderSeq;
  setup(app).then(() => {
    if (seq !== app.renderSeq) return; // el usuario cambió de paso mientras se preparaba el visor
    const v = app._viewer;
    const st = rec.meshStats;
    const modeBtns = h('div', { class: 'row' }, MODES.map(([k, l]) => h('button', {
      class: 'btn small' + (vs.mode === k ? ' on' : ''),
      disabled: (k === 'deviation' && !(app.state.cad && app.state.cad.deviation)) || (k === 'texture' && !rec.texture),
      title: k === 'texture' && !rec.texture ? 'Genere la textura fotográfica abajo' : '',
      onclick: () => { vs.mode = k; v.setMode(k); updateLegend(app); app.refresh(); },
    }, l)));
    const tg = (key, text, group) => checkbox(text, vs[key], (on) => { vs[key] = on; v.show(group, on); if (key === 'box') app.refresh(); });
    // ---- medición ----
    const mt = app.measure;
    const list = h('div', {});
    const renderList = () => {
      list.replaceChildren(...(mt.items.length ? mt.items.map(it => h('div', { class: 'row', style: { justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', padding: '3px 0' } },
        h('span', {}, h('b', {}, `${MEASURE_TYPES[it.type].name} ${it.id}: `), h('span', { class: 'mono' }, it.text),
          it.extra && it.extra.dx !== undefined ? h('div', { class: 'hint mono' }, `ΔX ${fmt(it.extra.dx, 2)} · ΔY ${fmt(it.extra.dy, 2)} · ΔZ ${fmt(it.extra.dz, 2)}`) : null),
        h('button', { class: 'btn small ghost', onclick: () => mt.remove(it.id) }, '×'))) : [h('p', { class: 'hint' }, 'Elija una herramienta y haga clic sobre la pieza.')]));
    };
    mt.onChange = renderList;
    renderList();
    const toolBtns = h('div', { class: 'row' }, Object.entries(MEASURE_TYPES).map(([k, t]) => h('button', {
      class: 'btn small' + (mt.mode === k ? ' on' : ''),
      onclick: () => { mt.setMode(mt.mode === k ? null : k); app.refresh(); },
    }, t.name)));
    // ---- sección ----
    const sec = app.state.section || (app.state.section = { axis: null, offset: 0, flip: false });
    const bb = st ? st.bbox : null;
    const secChart = h('div', {});
    const axisIdx = { x: 0, y: 1, z: 2 };
    const updateSection = () => {
      disposeGroup(app.sectionGroup);
      if (!sec.axis) { v.setClipping([]); secChart.replaceChildren(); return; }
      const a = axisIdx[sec.axis];
      const n = new THREE.Vector3(); n.setComponent(a, sec.flip ? 1 : -1);
      const plane = new THREE.Plane(n, sec.flip ? -sec.offset : sec.offset);
      v.setClipping([plane]);
      const cut = new THREE.Plane(new THREE.Vector3().setComponent(a, 1), -sec.offset);
      const segs = sectionSegments(v.mesh, cut);
      if (segs.length) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(segs, 3));
        const ls = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xf5a524, depthTest: false }));
        ls.renderOrder = 8;
        app.sectionGroup.add(ls);
      }
      const [ui, vi] = a === 0 ? [1, 2] : a === 1 ? [0, 2] : [0, 1];
      const s2 = new Float32Array(segs.length / 3 * 2);
      for (let i = 0, j = 0; i < segs.length; i += 3, j += 2) { s2[j] = segs[i + ui]; s2[j + 1] = segs[i + vi]; }
      app.state.sectionProfile = { axis: sec.axis, offset: sec.offset, segs: s2, ui, vi };
      secChart.replaceChildren(profileChart(s2, { width: 340, height: 200, uLabel: 'XYZ'[ui], vLabel: 'XYZ'[vi] }));
    };
    const range = bb && sec.axis ? [bb.min[axisIdx[sec.axis]], bb.max[axisIdx[sec.axis]]] : [0, 1];
    const slider = h('input', { type: 'range', min: range[0], max: range[1], step: 0.05, value: sec.offset });
    const offLbl = h('span', { class: 'mono' }, `${fmt(sec.offset, 2)} mm`);
    slider.addEventListener('input', () => { sec.offset = +slider.value; offLbl.textContent = `${fmt(sec.offset, 2)} mm`; updateSection(); });
    add(P, 
      card('Visualización', modeBtns,
        h('div', { class: 'row' }, tg('board', 'Tapete', 'board'), tg('cameras', 'Cámaras', 'cameras'), tg('grid', 'Rejilla', 'grid'), tg('box', 'Caja', 'box'), tg('stickers', 'Calcomanías', 'stickers'), app.state.cad ? tg('cad', 'CAD', 'cad') : null),
        !rec.texture ? h('button', { class: 'btn small', disabled: !!app.state.busy, onclick: () => buildTexture(app) }, 'Generar textura fotográfica') : h('span', { class: 'hint' }, `Textura: ${rec.texture.info}`),
      ),
      card('Vistas', h('div', { class: 'row' },
        [['top', 'Superior'], ['front', 'Frontal'], ['right', 'Derecha'], ['left', 'Izquierda'], ['back', 'Posterior'], ['iso', 'Isométrica']].map(([k, l]) => h('button', { class: 'btn small', onclick: () => v.view(k) }, l)),
        h('button', { class: 'btn small', onclick: () => v.fit() }, 'Ajustar'))),
      st ? card('Dimensiones de la pieza', kvTable([
        st.footprint ? ['Largo × ancho (huella orientada)', `${fmt(st.footprint.length, 2)} × ${fmt(st.footprint.width, 2)} mm`] : null,
        st.footprint ? ['Giro sobre el tapete', `${fmt(st.footprint.angle, 1)}°`] : null,
        ['Alto Z (sobre la mesa)', `${fmt(st.bbox.max[2], 2)} mm`],
        ['Caja en ejes del tapete X × Y', `${fmt(st.bbox.size[0], 2)} × ${fmt(st.bbox.size[1], 2)} mm`],
        ['Área de superficie', `${fmt(st.area / 100, 2)} cm²`], st.closed ? ['Volumen', `${fmt(st.volume / 1000, 3)} cm³`] : null,
        ['Malla', `${st.vertices.toLocaleString('es-MX')} vért. · ${st.triangles.toLocaleString('es-MX')} triáng.`],
      ])) : null,
      card('Barrenos y aberturas',
        app.state.holes ? (app.state.holes.length ? h('div', { style: { maxHeight: '220px', overflow: 'auto' } }, h('table', { class: 'grid' },
          h('thead', {}, h('tr', {}, ['#', 'Tipo', 'Ø / tamaño (mm)', 'Centro X, Y, Z (mm)'].map(t => h('th', {}, t)))),
          h('tbody', {}, app.state.holes.map((o, i) => (o.type === 'circular' || o.section !== null || app.state.showGaps) ? h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, o.type === 'circular' ? 'Barreno' : o.section !== null ? 'Abertura' : 'Abertura o hueco'),
            h('td', {}, o.type === 'circular' ? `Ø ${fmt(o.diameter, 2)} ±${fmt(o.u95, 2)}` : `${fmt(o.size[0], 1)} × ${fmt(o.size[1], 1)}`),
            h('td', { class: 'mono' }, o.center.map(x => fmt(x, 1)).join(', '))) : null)))) : h('p', { class: 'hint' }, 'No se encontraron bordes cerrados interiores.')) : h('p', { class: 'hint' }, 'Busca bordes cerrados en la malla y ajusta círculos para estimar diámetros y posiciones de barrenos.'),
        (() => {
          const gaps = (app.state.holes || []).filter(o => o.type !== 'circular' && o.section === null).length;
          return gaps ? h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('span', { class: 'hint' }, `${gaps} abertura(s) o hueco(s) sin pared medible (posibles zonas sin cobertura de fotos)`),
            h('button', { class: 'btn small ghost', onclick: () => { app.state.showGaps = !app.state.showGaps; app.refresh(); } }, app.state.showGaps ? 'Ocultar' : 'Mostrar')) : null;
        })(),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => {
            const m = app.state.recon.mesh, vox = rec.voxel || 0.5;
            app.state.holes = detectHoles(m.positions, m.indices, { thickness: (rec.params && rec.params.sheetThickness) || app.settings.recon.sheetThickness, minR: Math.max(1, 2 * vox) });
            // incertidumbre (95 %) del diámetro: ajuste del círculo + resolución de la malla (1 vóxel)
            for (const o of app.state.holes) if (o.type === 'circular') o.u95 = 2 * Math.hypot(o.fitRms, vox);
            showHoleLabels(app);
            app.computeMetrics();
            const hs = app.state.holes, nb = hs.filter(o => o.type === 'circular').length, na = hs.filter(o => o.type !== 'circular' && o.section !== null).length;
            toast(`${nb} barreno(s), ${na} abertura(s) y ${hs.length - nb - na} abertura(s) o hueco(s) sin pared medible.`, 'ok');
            app.refresh();
          } }, app.state.holes ? 'Volver a detectar' : 'Detectar barrenos'),
          app.state.holes && app.state.holes.length ? h('button', { class: 'btn small', onclick: () => downloadText(['n,tipo,diametro_mm,u95_mm,ajuste_rms_mm,diametro_borde_mm,cx,cy,cz,nx,ny,nz,largo_mm,ancho_mm', ...app.state.holes.map((o, i) => [i + 1, o.type, o.diameter ? o.diameter.toFixed(4) : '', o.u95 ? o.u95.toFixed(4) : '', o.fitRms ? o.fitRms.toFixed(4) : '', o.edgeDiameter ? o.edgeDiameter.toFixed(4) : '', ...o.center.map(x => x.toFixed(4)), ...o.normal.map(x => x.toFixed(5)), o.size[0].toFixed(3), o.size[1].toFixed(3)].join(','))].join('\n'), 'barrenos.csv', 'text/csv') }, 'Exportar CSV') : null,
        ),
        h('p', { class: 'hint' }, 'Barrenos y aberturas se miden en un corte a media pared (según el espesor de lámina del paso 4); ± es la incertidumbre al 95 % (ajuste del círculo y resolución de la malla). «Abertura o hueco»: borde sin pared medible; puede ser una zona que las fotos no cubrieron. Los barrenos en paredes vistas por ambas caras no dejan borde abierto: mídalos con la herramienta Radio.'),
      ),
      card('Medición', toolBtns, list, h('div', { class: 'row' },
        h('button', { class: 'btn small', disabled: !mt.items.length, onclick: () => downloadText(mt.toCSV(), 'mediciones.csv', 'text/csv') }, 'Exportar CSV'),
        h('button', { class: 'btn small ghost', disabled: !mt.items.length, onclick: () => mt.clear() }, 'Borrar todo'))),
      card('Sección / corte',
        h('div', { class: 'row' }, ['x', 'y', 'z'].map(ax => h('button', { class: 'btn small' + (sec.axis === ax ? ' on' : ''), onclick: () => {
          sec.axis = sec.axis === ax ? null : ax;
          if (sec.axis && bb) sec.offset = (bb.min[axisIdx[ax]] + bb.max[axisIdx[ax]]) / 2;
          app.refresh();
        } }, `Plano ${ax.toUpperCase()}`)),
        sec.axis ? h('button', { class: 'btn small ghost', onclick: () => { sec.flip = !sec.flip; updateSection(); } }, 'Invertir lado') : null),
        sec.axis ? h('div', {}, slider, h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('span', { class: 'hint' }, 'Posición del plano'), offLbl)) : h('p', { class: 'hint' }, 'Corte la pieza con un plano para ver su perfil (útil para dobleces, embutidos y pestañas).'),
        secChart,
        sec.axis ? h('button', { class: 'btn small', onclick: () => {
          const pr = app.state.sectionProfile;
          if (!pr) return;
          const rows = ['u_mm,v_mm,u2_mm,v2_mm'];
          for (let i = 0; i < pr.segs.length; i += 4) rows.push([pr.segs[i], pr.segs[i + 1], pr.segs[i + 2], pr.segs[i + 3]].map(x => x.toFixed(4)).join(','));
          downloadText(rows.join('\n'), `seccion_${pr.axis}_${pr.offset.toFixed(2)}.csv`, 'text/csv');
        } }, 'Exportar perfil CSV') : null,
      ),
      card('Editar pieza',
        h('div', { class: 'row' },
          h('button', { class: 'btn small' + (app.state.tf === 'translate' ? ' on' : ''), onclick: () => { app.state.tf = app.state.tf === 'translate' ? null : 'translate'; v.enableTransform(app.state.tf); app.refresh(); } }, 'Mover'),
          h('button', { class: 'btn small' + (app.state.tf === 'rotate' ? ' on' : ''), onclick: () => { app.state.tf = app.state.tf === 'rotate' ? null : 'rotate'; v.enableTransform(app.state.tf); app.refresh(); } }, 'Rotar'),
          h('button', { class: 'btn small ghost', onclick: () => { v.resetTransform(); app.state.tf = null; v.enableTransform(null); app.refresh(); } }, 'Restablecer posición'),
        ),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => editMesh(app, (m) => { taubinSmooth(m.positions, m.indices, { iterations: 2 }); return m; }, 'Suavizado aplicado') }, 'Suavizar'),
          h('button', { class: 'btn small', onclick: () => editMesh(app, (m) => removeSmallComponents(m, { minFrac: 0.05, minTris: 200 }), 'Islas eliminadas') }, 'Eliminar islas'),
          h('button', { class: 'btn small', disabled: !sec.axis, title: 'Elimina la parte oculta por el plano de sección', onclick: () => {
            const a = axisIdx[sec.axis];
            v.partRoot.updateMatrixWorld(true);
            const M = v.partRoot.matrixWorld, q = new THREE.Vector3();
            editMesh(app, (m) => filterTriangles(m, (f) => {
              for (let k = 0; k < 3; k++) {
                const i = 3 * m.indices[f + k];
                const c = q.set(m.positions[i], m.positions[i + 1], m.positions[i + 2]).applyMatrix4(M).getComponent(a);
                if (sec.flip ? c < sec.offset : c > sec.offset) return false;
              }
              return true;
            }), 'Recorte aplicado');
            sec.axis = null; app.refresh();
          } }, 'Recortar con el plano'),
          h('button', { class: 'btn small ghost', disabled: !(app.state.undo && app.state.undo.length), onclick: () => { const prev = app.state.undo.pop(); setMeshData(app, prev); toast('Deshecho.'); } }, 'Deshacer'),
        ),
        app.state.tf ? h('p', { class: 'hint' }, 'Arrastre el control en el visor. Las mediciones se hacen en coordenadas del tapete (mm).') : null,
      ),
      card('Exportar',
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => exportMesh(app, 'stl') }, 'STL'),
          h('button', { class: 'btn small', onclick: () => exportMesh(app, 'ply') }, 'PLY (color)'),
          h('button', { class: 'btn small', onclick: () => exportMesh(app, 'obj') }, 'OBJ'),
          h('button', { class: 'btn small', onclick: () => exportMesh(app, 'glb') }, 'GLB'),
          h('button', { class: 'btn small', onclick: () => { const u = v.screenshot(); fetch(u).then(r => r.blob()).then(b => download(b, 'captura_3d.png')); } }, 'Captura PNG'),
        ),
        h('p', { class: 'hint' }, 'Coordenadas en mm, sistema del tapete (Z = altura sobre la mesa). GLB/OBJ incluyen la textura fotográfica si se generó.'),
      ),
    );
    updateSection();
    updateLegend(app);
  });
}

async function setup(app) {
  app.showView('3d');
  const v = await app.ensureViewer();
  if (!app.measure) app.measure = new MeasureTool(v);
  if (!app.sectionGroup) { app.sectionGroup = new THREE.Group(); v.scene.add(app.sectionGroup); }
  if (v.meshData !== app.state.recon.mesh) app.syncViewerScene();
  const vs = app.state.view;
  v.setMode(vs.mode);
  v.show('board', vs.board); v.show('cameras', vs.cameras); v.show('grid', vs.grid); v.show('stickers', vs.stickers); v.show('cad', vs.cad);
  v.setBox(vs.box && app.state.recon.meshStats ? { min: app.state.recon.meshStats.bbox.min, max: app.state.recon.meshStats.bbox.max } : null);
  v.groups.box.visible = !!vs.box;
  v.onPick = (hit) => {
    if (app.measure.handlePick(hit)) return;
    if (hit && hit.point) document.getElementById('hud-info').textContent = `X ${fmt(hit.point.x, 2)} · Y ${fmt(hit.point.y, 2)} · Z ${fmt(hit.point.z, 2)} mm${hit.onTable ? ' (mesa)' : ''}`;
  };
  // barra rápida del visor
  const hud = document.getElementById('hud-top');
  hud.replaceChildren(
    ...[['top', 'Superior'], ['front', 'Frontal'], ['iso', 'Iso']].map(([k, l]) => h('button', { class: 'tbtn', onclick: () => v.view(k) }, l)),
    h('span', { class: 'tsep' }),
    ...Object.entries(MEASURE_TYPES).map(([k, t]) => h('button', { class: 'tbtn' + (app.measure.mode === k ? ' on' : ''), onclick: () => { app.measure.setMode(app.measure.mode === k ? null : k); app.refresh(); } }, t.name)),
  );
  document.getElementById('hud-info').textContent = app.measure.mode ? `Herramienta: ${MEASURE_TYPES[app.measure.mode].name} — haga clic sobre la pieza (${MEASURE_TYPES[app.measure.mode].n} punto(s)).` : 'Clic sobre la pieza: coordenadas del punto.';
  return v;
}

function showHoleLabels(app) {
  const v = app._viewer;
  if (!app.holeGroup) { app.holeGroup = new THREE.Group(); v.scene.add(app.holeGroup); }
  disposeGroup(app.holeGroup);
  (app.state.holes || []).forEach((o, i) => {
    if (o.type !== 'circular') {
      if (o.section === null) return;
      const lb = label(`${i + 1}: ${o.size[0].toFixed(1)} × ${o.size[1].toFixed(1)}`, 'small');
      lb.position.set(...o.center);
      app.holeGroup.add(lb);
      return;
    }
    const lb = label(`${i + 1}: Ø${o.diameter.toFixed(2)}`, 'small');
    lb.position.set(...o.center);
    app.holeGroup.add(lb);
    const ring = new THREE.Mesh(new THREE.RingGeometry(o.diameter / 2 - 0.15, o.diameter / 2 + 0.15, 48), new THREE.MeshBasicMaterial({ color: 0xf5a524, side: THREE.DoubleSide, depthTest: false }));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...o.normal));
    ring.position.set(...o.center);
    ring.renderOrder = 7;
    app.holeGroup.add(ring);
  });
}

async function showScene(app) {
  app.showView('3d');
  const v = await app.ensureViewer();
  app.syncViewerScene();
  document.getElementById('hud-top').replaceChildren();
  document.getElementById('hud-legend').hidden = true;
  v.view('iso');
}

function updateLegend(app) {
  const L = document.getElementById('hud-legend');
  const vs = app.state.view;
  if (vs.mode === 'confidence') {
    L.hidden = false;
    L.replaceChildren(h('b', {}, 'Fotos que ven cada punto'), h('div', { class: 'ramp', style: { background: 'linear-gradient(90deg,#30123b,#4686fb,#1ae4b6,#a2fc3c,#fabd31,#e4460a,#7a0403)' } }), h('div', { class: 'ticks' }, h('span', {}, '1'), h('span', {}, '4'), h('span', {}, '8'), h('span', {}, '≥12')));
  } else if (vs.mode === 'deviation' && app.state.cad && app.state.cad.deviation) {
    const c = app.state.cad;
    L.hidden = false;
    L.replaceChildren(h('b', {}, `Desviación vs CAD (tol. ±${c.tol} mm)`), h('div', { class: 'ramp', style: { background: 'linear-gradient(90deg,#0033ff,#1aa0ff,#33cc77,#33cc33,#99cc33,#ff9900,#ff1a1a)' } }), h('div', { class: 'ticks' }, h('span', {}, `−${c.range}`), h('span', {}, `−${c.tol}`), h('span', {}, '0'), h('span', {}, `+${c.tol}`), h('span', {}, `+${c.range}`)));
  } else L.hidden = true;
}
export { updateLegend };

function setMeshData(app, m) {
  const rec = app.state.recon;
  rec.mesh = m;
  rec.meshStats = m.indices.length ? meshStats(m.positions, m.indices, { footprintZ: 0.75 * ((rec.params && rec.params.sheetThickness) || app.settings.recon.sheetThickness) }) : null;
  rec.texture = null;
  app.state.holes = null;
  if (app.holeGroup) disposeGroup(app.holeGroup);
  app._viewer.setTexturedMesh(null);
  app._viewer.setMesh(m);
  if (app.state.cad) { app.state.cad = null; toast('La comparación CAD se reinició porque cambió la malla.', 'warn'); }
  app.computeMetrics();
  app.refresh();
}

function editMesh(app, fn, msg) {
  const rec = app.state.recon;
  const cur = rec.mesh;
  const copy = { positions: Float32Array.from(cur.positions), indices: Uint32Array.from(cur.indices), colors: Uint8Array.from(cur.colors), conf: Float32Array.from(cur.conf) };
  app.state.undo = app.state.undo || [];
  app.state.undo.push(cur);
  if (app.state.undo.length > 4) app.state.undo.shift();
  const out = fn(copy);
  setMeshData(app, out);
  toast(msg, 'ok');
}

// Geometría en coordenadas del mundo (aplica la transformación del usuario) con colores sRGB o lineales.
function exportGeometry(app, linear) {
  const v = app._viewer;
  const m = app.state.recon.mesh;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(m.positions), 3));
  g.setIndex(new THREE.BufferAttribute(Uint32Array.from(m.indices), 1));
  const col = new Float32Array(m.colors.length);
  for (let i = 0; i < col.length; i++) { const c = m.colors[i] / 255; col[i] = linear ? (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)) : c; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  v.partRoot.updateMatrixWorld(true);
  g.applyMatrix4(v.partRoot.matrixWorld);
  g.computeVertexNormals();
  return g;
}

async function exportMesh(app, fmtName) {
  const name = 'pieza_reconstruida';
  const rec = app.state.recon;
  if (fmtName === 'stl') {
    const { STLExporter } = await import('three/addons/exporters/STLExporter.js');
    const res = new STLExporter().parse(new THREE.Mesh(exportGeometry(app, false)), { binary: true });
    download(new Blob([res], { type: 'model/stl' }), `${name}.stl`);
  } else if (fmtName === 'ply') {
    const { PLYExporter } = await import('three/addons/exporters/PLYExporter.js');
    new PLYExporter().parse(new THREE.Mesh(exportGeometry(app, false), new THREE.MeshBasicMaterial({ vertexColors: true })), (res) => download(new Blob([res], { type: 'application/octet-stream' }), `${name}.ply`), { binary: true });
  } else if (fmtName === 'obj') {
    const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
    const obj = rec.texture ? texturedForExport(app) : new THREE.Mesh(exportGeometry(app, false), new THREE.MeshBasicMaterial({ vertexColors: true }));
    let txt = new OBJExporter().parse(obj);
    if (rec.texture) {
      txt = `mtllib ${name}.mtl\nusemtl textura\n` + txt;
      downloadText(`newmtl textura\nKa 1 1 1\nKd 1 1 1\nmap_Kd ${name}_textura.jpg\n`, `${name}.mtl`);
      download(await new Promise(r => rec.texture.canvas.toBlob(r, 'image/jpeg', 0.92)), `${name}_textura.jpg`);
    }
    downloadText(txt, `${name}.obj`);
  } else if (fmtName === 'glb') {
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const obj = rec.texture ? texturedForExport(app) : new THREE.Mesh(exportGeometry(app, true), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
    const res = await new GLTFExporter().parseAsync(obj, { binary: true });
    download(new Blob([res], { type: 'model/gltf-binary' }), `${name}.glb`);
  }
  toast(`Exportado ${fmtName.toUpperCase()} (mm).`, 'ok');
}

function texturedForExport(app) {
  const t = app._viewer.texturedMesh.clone();
  app._viewer.partRoot.updateMatrixWorld(true);
  t.geometry = t.geometry.clone().applyMatrix4(app._viewer.partRoot.matrixWorld);
  t.visible = true;
  return t;
}

async function buildTexture(app) {
  const { bakeTexture } = await import('../mesh/texture.js');
  app.state.busy = 'viewer';
  try {
    const rec = app.state.recon;
    const res = await bakeTexture({ mesh: rec.mesh, project: app.project, onProgress: (f, msg) => { document.getElementById('status-msg').textContent = msg; } });
    rec.texture = res;
    app._viewer.setTexturedMesh(res.object);
    app.state.view.mode = 'texture';
    app._viewer.setMode('texture');
    toast('Textura fotográfica generada.', 'ok');
  } catch (e) {
    console.error(e);
    toast('No se pudo generar la textura: ' + e.message, 'bad');
  } finally {
    app.state.busy = null;
    document.getElementById('status-msg').textContent = 'Listo.';
    app.refresh();
  }
}
