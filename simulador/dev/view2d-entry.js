// Arnés de desarrollo de la vista 2D: dibujo sintético generado por código (sin DXF).
// Expone window.view, window.data, window.events, window.loadStress(n) y window.loadDemo().
import { View2D } from '../src/ui/view2d.js';
import { buildLoops, loopInfo, buildRegions } from '../src/geom2d/loops.js';

const D = Math.PI / 180;
const L = (p0, p1, layer) => ({ type: 'line', p0, p1, meta: { layer } });
const A = (c, r, a0, a1, layer) => ({ type: 'arc', c, r, a0: a0 * D, a1: a1 * D, ccw: true, meta: { layer } });
const C = (c, r, layer) => ({ type: 'circle', c, r, ccw: true, meta: { layer } });

function makeDrawing() {
  const segs = [];
  // Placa 150×80 con esquinas R6.
  segs.push(
    L([6, 0], [144, 0], 'CONTORNO'), A([144, 6], 6, -90, 0, 'CONTORNO'),
    L([150, 6], [150, 74], 'CONTORNO'), A([144, 74], 6, 0, 90, 'CONTORNO'),
    L([144, 80], [6, 80], 'CONTORNO'), A([6, 74], 6, 90, 180, 'CONTORNO'),
    L([0, 74], [0, 6], 'CONTORNO'), A([6, 6], 6, 180, 270, 'CONTORNO'),
  );
  // 4 agujeros Ø8.5.
  for (const c of [[12, 12], [138, 12], [12, 68], [138, 68]]) segs.push(C(c, 4.25, 'AGUJEROS'));
  // Colisa (obround) 30×10.
  segs.push(
    L([30, 35], [50, 35], 'AGUJEROS'), A([50, 40], 5, -90, 90, 'AGUJEROS'),
    L([50, 45], [30, 45], 'AGUJEROS'), A([30, 40], 5, 90, 270, 'AGUJEROS'),
  );
  // Agujero grande con isla cuadrada dentro.
  segs.push(C([100, 40], 22, 'AGUJEROS'));
  segs.push(L([92, 32], [108, 32], 'CONTORNO'), L([108, 32], [108, 48], 'CONTORNO'), L([108, 48], [92, 48], 'CONTORNO'), L([92, 48], [92, 32], 'CONTORNO'));
  // Eje de simetría (trazo y punto) en la capa EJES.
  segs.push({ type: 'line', p0: [-10, 40], p1: [160, 40], meta: { layer: 'EJES', dashed: true, linetype: 'CENTER' } });
  // Cadena abierta con hueco de 2 mm.
  segs.push(L([180, 0], [220, 0], 'BOCETO'), L([220, 0], [220, 30], 'BOCETO'), L([220, 30], [180, 30], 'BOCETO'), L([180, 30], [180, 2], 'BOCETO'));
  // Segunda pieza: arandela.
  segs.push(C([205, 62], 12, 'CONTORNO'), C([205, 62], 5, 'AGUJEROS'));
  const texts = [
    { text: 'PLACA A-01  e = 3 mm', p: [0, -9], h: 4, rot: 0, layer: 'TEXTO' },
    { text: '4× Ø8.5', p: [18, 61], h: 2.5, rot: 0, layer: 'TEXTO' },
  ];
  const layers = [
    { name: 'CONTORNO', color: 7, linetype: 'CONTINUOUS' },
    { name: 'AGUJEROS', color: 4, linetype: 'CONTINUOUS' },
    { name: 'EJES', color: 1, linetype: 'CENTER' },
    { name: 'BOCETO', color: 2, linetype: 'CONTINUOUS' },
    { name: 'TEXTO', color: 8, linetype: 'CONTINUOUS' },
  ];
  return { segments: segs, texts, layers };
}

function topology(drawing) {
  // Las líneas de construcción (trazos) no forman contornos.
  const solid = drawing.segments.filter((s) => !(s.meta && s.meta.dashed));
  const { loops, open, stats } = buildLoops(solid, { tol: 1e-6 });
  const loopInfos = loops.map((l) => loopInfo(l, 0.01));
  const { nodes, regions } = buildRegions(loops);
  return { loops, loopInfos, open, regions, nodes, stats };
}

// Dibujo de estrés: n líneas en una malla ondulada.
function makeStress(n = 50000) {
  const segs = [], cols = 250;
  for (let k = 0; k < n; k++) {
    const i = k % cols, j = Math.floor(k / cols);
    const x = i * 2, y = j * 2 + Math.sin(i * 0.15) * 3;
    const x2 = x + 1.8, y2 = j * 2 + Math.sin((i + 0.9) * 0.15) * 3 + (k % 3) * 0.4;
    segs.push(L([x, y], [x2, y2], k % 7 === 0 ? 'AGUJEROS' : 'CONTORNO'));
  }
  return { segments: segs, texts: [], layers: [{ name: 'CONTORNO', color: 7 }, { name: 'AGUJEROS', color: 4 }] };
}

const drawing = makeDrawing();
const topo = topology(drawing);
const view = new View2D(document.getElementById('view'), { theme: 'dark' });
view.setDrawing(drawing, topo);
// Estado de ejemplo: placa con papel 'top', arandela excluida.
const plateRegion = topo.regions.findIndex((r) => {
  const b = topo.loopInfos[r.outer].bbox;
  return b.minX === 0 && b.maxX === 150 && b.minY === 0 && b.maxY === 80;
});
const washerRegion = topo.regions.findIndex((r) => Math.abs(topo.loopInfos[r.outer].area - Math.PI * 144) < 1e-6);
view.setRegionState(plateRegion, { role: 'top' });
view.setRegionState(washerRegion, { included: false });

const events = [];
for (const name of ['regionClick', 'loopClick', 'window', 'measure', 'calibrate', 'axisPick'])
  view.on(name, (e) => events.push({ name, e }));
const status = document.getElementById('status');
view.on('cursor', (c) => {
  status.textContent = c ? `X ${c.x.toFixed(3)}   Y ${c.y.toFixed(3)}${c.snap ? '   · ' + c.snap.kind : ''}` : '';
});
view.on('axisPick', (e) => view.showAxis(e));
view.on('regionClick', (e) => {
  if (e.regionIndex < 0) return;
  topo.regions.forEach((_, i) => view.setRegionState(i, { selected: i === e.regionIndex }));
});

for (const b of document.querySelectorAll('[data-mode]'))
  b.addEventListener('click', () => {
    view.setMode(b.dataset.mode);
    for (const o of document.querySelectorAll('[data-mode]')) o.classList.toggle('on', o === b);
  });
document.getElementById('theme').addEventListener('click', () => {
  const t = view.theme === 'dark' ? 'light' : 'dark';
  document.body.className = t;
  view.setTheme(t);
});
document.getElementById('fit').addEventListener('click', () => view.fit());
document.getElementById('clear').addEventListener('click', () => view.clearMeasures());

Object.assign(window, {
  view,
  events,
  data: { drawing, ...topo, plateRegion, washerRegion },
  loadStress: (n) => view.setDrawing(makeStress(n), {}),
  loadDemo: () => view.setDrawing(drawing, topo),
});
