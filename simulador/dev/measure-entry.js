// Arnés de las herramientas de medición: visor + pieza de prueba + núcleo simulado.
import plate from '../tests/fixtures/build-result-plate.json';
import { Viewer3D } from '../src/viewer/viewer3d.js';
import { MeasureTools } from '../src/viewer/measure.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const addS = (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];

// STUB del núcleo: NO es OpenCascade. Solo resuelve con exactitud los casos del e2e
// (punto/vértice–punto/vértice, punto–plano infinito, plano–plano paralelos) a partir de la
// topología del fixture; cualquier otro caso lanza un error.
const topo = plate.topology;
function geom(ent) {
  if (ent.kind === 'point') return { pt: ent.p };
  if (ent.kind === 'vertex') return { pt: topo.vertices.find((v) => v.id === ent.id).p };
  if (ent.kind === 'face') {
    const f = topo.faces.find((x) => x.id === ent.id);
    if (f?.type === 'plane') return { plane: { c: f.center, n: f.normal } };
  }
  throw new Error(`stub: entidad no soportada (${ent.kind})`);
}
const proj = (p, pl) => addS(p, pl.n, -dot(sub(p, pl.c), pl.n));
const kernel = {
  async distance(a, b) {
    const A = geom(a);
    const B = geom(b);
    if (A.pt && B.pt) return { distance: Math.hypot(...sub(B.pt, A.pt)), p1: A.pt, p2: B.pt };
    if (A.pt && B.plane) {
      const q = proj(A.pt, B.plane);
      return { distance: Math.hypot(...sub(q, A.pt)), p1: A.pt, p2: q };
    }
    if (A.plane && B.pt) {
      const q = proj(B.pt, A.plane);
      return { distance: Math.hypot(...sub(B.pt, q)), p1: q, p2: B.pt };
    }
    if (Math.abs(Math.abs(dot(A.plane.n, B.plane.n)) - 1) < 1e-12) {
      const q = proj(A.plane.c, B.plane);
      return { distance: Math.hypot(...sub(q, A.plane.c)), p1: A.plane.c, p2: q };
    }
    throw new Error('stub: planos no paralelos');
  },
};

const viewer = new Viewer3D(document.getElementById('v'), { theme: 'dark' });
viewer.setModel(plate);

const hintEl = document.getElementById('hint');
const listEl = document.getElementById('list');
const sel = document.getElementById('tool');
let measure = null; // onChange puede llegar antes de la asignación
measure = new MeasureTools(viewer, {
  kernel,
  onChange(list, extra) {
    window.lastChange = { list, extra };
    sel.value = measure ? measure.tool : 'none';
    hintEl.textContent = extra.inspect ? extra.inspect.text : extra.hint || '';
    listEl.replaceChildren(...list.map((m) => {
      const li = document.createElement('li');
      li.textContent = `${m.title}: ${m.text}`;
      return li;
    }));
  },
});
sel.addEventListener('change', () => measure.setTool(sel.value));

Object.assign(window, { viewer, measure, plate, lastChange: null });
