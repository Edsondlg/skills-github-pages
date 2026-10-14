// Paso 7: comparación con el modelo CAD (alineación ICP + mapa de desviaciones).
import * as THREE from 'three';
import { h, add, card, field, numInput, selectInput, kvTable, fmt, pct, toast, download, downloadText } from './dom.js';
import { histogram } from './charts.js';
import { TriangleGrid, samplePoints } from '../analysis/distance.js';
import { autoAlign, icp, invertTransform } from '../analysis/icp.js';
import { vertexNormals } from '../mesh/process.js';
import { updateLegend } from './step-viewer.js';

const yieldUI = () => new Promise(r => setTimeout(r, 0));

export function renderCAD(app) {
  const P = app.panel;
  const rec = app.state.recon;
  const c = app.state.cadOpts || (app.state.cadOpts = { units: 'mm', align: 'auto', tol: 0.5, range: 2.0 });
  const cad = app.state.cad;
  const fi = h('input', { type: 'file', accept: '.stl,.obj', hidden: true, onchange: (e) => { if (e.target.files[0]) loadCAD(app, e.target.files[0]); e.target.value = ''; } });
  add(P, 
    h('div', {}, h('h2', {}, '7 · Comparación con CAD'), h('p', { class: 'lead' }, 'Cargue el modelo nominal (STL u OBJ). Se alinea automáticamente con la medición y se colorea cada punto según su desviación.')),
    card('Modelo CAD', fi,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => fi.click() }, 'Cargar STL / OBJ…'),
        app.state.demo ? h('button', { class: 'btn', onclick: () => useDemoCAD(app) }, 'Usar CAD de la demo') : null),
      app.state.cadGeo ? kvTable([['Archivo', app.state.cadName], ['Triángulos', (app.state.cadGeo.attributes.position.count / 3).toLocaleString('es-MX')], ['Tamaño', sizeText(app.state.cadGeo)]]) : h('p', { class: 'hint' }, 'Sin modelo cargado.'),
      field('Unidades del archivo', selectInput([['mm', 'milímetros'], ['in', 'pulgadas'], ['m', 'metros']], c.units, (v) => { c.units = v; if (app.state.cadFile) loadCAD(app, app.state.cadFile); })),
    ),
    card('Comparación',
      field('Alineación', selectInput([['auto', 'Automática (ejes + ICP)'], ['icp', 'ICP desde posición actual'], ['none', 'Sin alinear (mismo sistema)']], c.align, (v) => { c.align = v; })),
      field('Tolerancia (± mm)', numInput(c.tol, { min: 0.01, max: 10, step: 0.05, onChange: (v) => { c.tol = v; } })),
      field('Rango de color (± mm)', numInput(c.range, { min: 0.05, max: 20, step: 0.1, onChange: (v) => { c.range = v; } })),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', disabled: !rec || !app.state.cadGeo || !!app.state.busy, onclick: () => compare(app) }, 'Comparar')),
      !rec ? h('p', { class: 'hint' }, 'Primero reconstruya la pieza.') : null,
    ),
  );
  if (cad && cad.stats) {
    const s = cad.stats;
    add(P, card('Resultado',
      h('div', { class: 'kpis' },
        h('div', { class: 'kpi' }, h('div', { class: 'v' }, pct(s.inTol, 1)), h('div', { class: 'k' }, `dentro de ±${cad.tol} mm`), h('div', { class: 'meter' }, h('i', { style: { width: `${Math.round(100 * s.inTol)}%`, background: s.inTol >= 0.9 ? 'var(--ok)' : s.inTol >= 0.7 ? 'var(--warn)' : 'var(--bad)' } }))),
        h('div', { class: 'kpi' }, h('div', { class: 'v' }, `${fmt(s.rms, 3)}`, h('small', {}, 'mm')), h('div', { class: 'k' }, 'RMS de desviación')),
      ),
      kvTable([
        ['Alineación', `${cad.alignInfo} · RMS ICP ${fmt(cad.icpRms, 3)} mm`],
        ['Media (sesgo)', `${fmt(s.mean, 3)} mm`], ['Desviación estándar', `${fmt(s.std, 3)} mm`],
        ['Máxima + / −', `${fmt(s.max, 3)} / ${fmt(s.min, 3)} mm`], ['Percentil 95 |d|', `${fmt(s.p95, 3)} mm`],
        ['Cobertura del CAD medido', pct(s.coverage, 1)], ['Puntos evaluados', s.n.toLocaleString('es-MX')],
      ]),
      histogram(cad.deviation, { range: cad.range, tol: cad.tol, width: 360, height: 170 }),
      h('div', { class: 'row' },
        h('button', { class: 'btn small', onclick: () => exportDeviations(app) }, 'Desviaciones CSV'),
        h('button', { class: 'btn small', onclick: () => exportAligned(app) }, 'Medición alineada (STL, coords. CAD)'),
        h('button', { class: 'btn small ghost', onclick: () => { app.state.view.mode = 'deviation'; app.go('viewer'); } }, 'Abrir en visor'),
      ),
    ));
  }
  showScene(app);
}

function sizeText(g) {
  g.computeBoundingBox();
  const s = g.boundingBox.getSize(new THREE.Vector3());
  return `${fmt(s.x, 1)} × ${fmt(s.y, 1)} × ${fmt(s.z, 1)} mm`;
}

async function showScene(app) {
  app.showView('3d');
  const v = await app.ensureViewer();
  app.syncViewerScene();
  if (app.state.cadAligned) v.setCAD(app.state.cadAligned, { visible: app.state.view ? app.state.view.cad !== false : true });
  if (app.state.cad && app.state.cad.deviation) { v.setDeviation(app.state.cad.deviation, app.state.cad.tol, app.state.cad.range); app.state.view = app.state.view || {}; app.state.view.mode = 'deviation'; }
  document.getElementById('hud-top').replaceChildren();
  document.getElementById('hud-info').textContent = app.state.cad ? 'Azul: falta material · verde: dentro de tolerancia · rojo: sobra material (respecto al CAD).' : 'Cargue un CAD para comparar.';
  if (app.state.view) updateLegend(app);
}

async function loadCAD(app, file) {
  const scale = { mm: 1, in: 25.4, m: 1000 }[app.state.cadOpts.units];
  try {
    let geo;
    if (/\.stl$/i.test(file.name)) {
      const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
      geo = new STLLoader().parse(await file.arrayBuffer());
    } else {
      const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
      const obj = new OBJLoader().parse(await file.text());
      const parts = [];
      obj.traverse(o => { if (o.isMesh) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); o.updateMatrixWorld(true); g.applyMatrix4(o.matrixWorld); parts.push(g.attributes.position.array); } });
      const total = parts.reduce((s, a) => s + a.length, 0);
      const pos = new Float32Array(total);
      let o = 0; for (const a of parts) { pos.set(a, o); o += a.length; }
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    }
    if (geo.index) geo = geo.toNonIndexed();
    if (scale !== 1) geo.scale(scale, scale, scale);
    app.state.cadGeo = geo; app.state.cadName = file.name; app.state.cadFile = file;
    app.state.cad = null; app.state.cadAligned = null;
    toast(`CAD cargado: ${(geo.attributes.position.count / 3).toLocaleString('es-MX')} triángulos.`, 'ok');
    app.refresh();
  } catch (e) {
    toast('No se pudo leer el CAD: ' + e.message, 'bad');
  }
}

function useDemoCAD(app) {
  const gt = app.state.demo.gt;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(gt.indices.length * 3);
  for (let i = 0; i < gt.indices.length; i++) for (let k = 0; k < 3; k++) pos[3 * i + k] = gt.positions[3 * gt.indices[i] + k];
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  app.state.cadGeo = geo; app.state.cadName = 'soporte_demo (verdad).stl'; app.state.cadFile = null;
  app.state.cadOpts.align = 'auto';
  app.state.cad = null; app.state.cadAligned = null;
  app.refresh();
}

function scanWorld(app) {
  const v = app._viewer, m = app.state.recon.mesh;
  v.partRoot.updateMatrixWorld(true);
  const M = v.partRoot.matrixWorld;
  const p = new Float32Array(m.positions.length), q = new THREE.Vector3();
  for (let i = 0; i < p.length; i += 3) { q.set(m.positions[i], m.positions[i + 1], m.positions[i + 2]).applyMatrix4(M); p[i] = q.x; p[i + 1] = q.y; p[i + 2] = q.z; }
  return { positions: p, indices: m.indices };
}

async function compare(app) {
  const o = app.state.cadOpts;
  app.state.busy = 'cad'; app.updateRail();
  const status = (m) => { document.getElementById('status-msg').textContent = m; };
  try {
    status('Preparando el CAD…'); await yieldUI();
    const cadPos = app.state.cadGeo.attributes.position.array;
    const grid = new TriangleGrid(cadPos, null);
    const scan = scanWorld(app);
    const normals = vertexNormals(scan.positions, scan.indices);
    let R = [1, 0, 0, 0, 1, 0, 0, 0, 1], t = [0, 0, 0], info = 'sin alinear', rmsI = NaN;
    status('Alineando medición con el CAD…'); await yieldUI();
    if (o.align === 'auto') {
      const S = samplePoints(cadPos, Uint32Array.from({ length: cadPos.length / 3 }, (_, i) => i), 2.0);
      const r = autoAlign(scan.positions, S.points, grid, { normals });
      R = r.R; t = r.t; rmsI = r.rms; info = `automática (${r.start})`;
    } else if (o.align === 'icp') {
      const r = icp(scan.positions, grid, R, t, { iterations: 40, maxDist: 10, normals });
      R = r.R; t = r.t; rmsI = r.rms; info = 'ICP desde posición actual';
    }
    status('Calculando desviaciones…'); await yieldUI();
    const n = scan.positions.length / 3;
    const dev = new Float32Array(n);
    const maxD = Math.max(5, o.range * 3);
    const vals = [];
    for (let i = 0; i < n; i++) {
      const x = scan.positions[3 * i], y = scan.positions[3 * i + 1], z = scan.positions[3 * i + 2];
      const px = R[0] * x + R[1] * y + R[2] * z + t[0], py = R[3] * x + R[4] * y + R[5] * z + t[1], pz = R[6] * x + R[7] * y + R[8] * z + t[2];
      const c = grid.closest(px, py, pz, maxD);
      dev[i] = c ? c.d : NaN;
      if (c) vals.push(c.d);
      if ((i & 16383) === 0) { status(`Calculando desviaciones… ${Math.round(100 * i / n)} %`); await yieldUI(); }
    }
    vals.sort((a, b) => a - b);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const rmsv = Math.sqrt(vals.reduce((s, v) => s + v * v, 0) / vals.length);
    const std = Math.sqrt(Math.max(0, rmsv * rmsv - mean * mean));
    const abs = vals.map(Math.abs).sort((a, b) => a - b);
    // cobertura: muestras del CAD (caras visibles desde arriba) cerca de la medición alineada
    const inv = invertTransform(R, t);
    const cadInBoard = new Float32Array(cadPos.length);
    for (let i = 0; i < cadPos.length; i += 3) {
      const x = cadPos[i], y = cadPos[i + 1], z = cadPos[i + 2];
      cadInBoard[i] = inv.R[0] * x + inv.R[1] * y + inv.R[2] * z + inv.t[0];
      cadInBoard[i + 1] = inv.R[3] * x + inv.R[4] * y + inv.R[5] * z + inv.t[1];
      cadInBoard[i + 2] = inv.R[6] * x + inv.R[7] * y + inv.R[8] * z + inv.t[2];
    }
    const scanGrid = new TriangleGrid(scan.positions, scan.indices);
    const S2 = samplePoints(cadInBoard, Uint32Array.from({ length: cadInBoard.length / 3 }, (_, i) => i), 2.0);
    const cg = new TriangleGrid(cadInBoard, null);
    let nS = 0, nC = 0;
    for (let i = 0; i < S2.points.length / 3; i++) {
      if (cg.N[3 * S2.tris[i] + 2] < -0.3 || S2.points[3 * i + 2] < (app.settings.recon.zCut + 0.5)) continue;
      nS++;
      if (scanGrid.closest(S2.points[3 * i], S2.points[3 * i + 1], S2.points[3 * i + 2], Math.max(1, 2 * o.tol))) nC++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(cadInBoard, 3));
    geo.computeVertexNormals();
    app.state.cadAligned = geo;
    app.state.cad = {
      name: app.state.cadName, tol: o.tol, range: o.range, R, t, deviation: dev, alignInfo: info, icpRms: rmsI,
      stats: { n: vals.length, mean, rms: rmsv, std, min: vals[0], max: vals[vals.length - 1], p95: abs[Math.floor(abs.length * 0.95)], inTol: abs.filter(a => a <= o.tol).length / abs.length, coverage: nS ? nC / nS : 0 },
    };
    app.state.view = app.state.view || { mode: 'deviation', board: true, cameras: false, grid: true, box: false, stickers: true, cad: true };
    app.state.view.mode = 'deviation';
    app.computeMetrics();
    toast(`Comparación lista: ${(100 * app.state.cad.stats.inTol).toFixed(1)} % dentro de ±${o.tol} mm.`, 'ok', 6000);
  } catch (e) {
    console.error(e);
    toast('Error en la comparación: ' + e.message, 'bad');
  } finally {
    app.state.busy = null; status('Listo.'); app.updateRail();
    app.refresh();
  }
}

function exportDeviations(app) {
  const c = app.state.cad, m = app.state.recon.mesh;
  const rows = ['x_mm,y_mm,z_mm,desviacion_mm'];
  for (let i = 0; i < c.deviation.length; i++) if (isFinite(c.deviation[i])) rows.push(`${m.positions[3 * i].toFixed(3)},${m.positions[3 * i + 1].toFixed(3)},${m.positions[3 * i + 2].toFixed(3)},${c.deviation[i].toFixed(4)}`);
  downloadText(rows.join('\n'), 'desviaciones_cad.csv', 'text/csv');
}

async function exportAligned(app) {
  const c = app.state.cad;
  const scan = scanWorld(app);
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(scan.positions.length);
  for (let i = 0; i < p.length; i += 3) {
    const x = scan.positions[i], y = scan.positions[i + 1], z = scan.positions[i + 2];
    p[i] = c.R[0] * x + c.R[1] * y + c.R[2] * z + c.t[0]; p[i + 1] = c.R[3] * x + c.R[4] * y + c.R[5] * z + c.t[1]; p[i + 2] = c.R[6] * x + c.R[7] * y + c.R[8] * z + c.t[2];
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setIndex(new THREE.BufferAttribute(Uint32Array.from(scan.indices), 1));
  const { STLExporter } = await import('three/addons/exporters/STLExporter.js');
  download(new Blob([new STLExporter().parse(new THREE.Mesh(g), { binary: true })], { type: 'model/stl' }), 'medicion_en_coordenadas_cad.stl');
}
