// Banco de pruebas del visor 3D: carga el BuildResult de ejemplo y expone window.viewer.
import { Viewer3D } from '../src/viewer/viewer3d.js';
import fixture from '../tests/fixtures/build-result-plate.json';

// Copia del BuildResult con arreglos tipados, como los envía el kernel real.
function toTyped(r) {
  const m = r.mesh;
  return {
    ...r,
    mesh: { ...m, vertices: Float32Array.from(m.vertices), normals: Float32Array.from(m.normals), triangles: Uint32Array.from(m.triangles) },
    edges: { ...r.edges, positions: Float32Array.from(r.edges.positions) },
  };
}

const viewer = new Viewer3D(document.getElementById('viewer'), { theme: 'dark' });
viewer.setModel(fixture);
window.viewer = viewer;
window.fixture = fixture;
window.toTyped = toTyped;

const info = document.getElementById('info');
viewer.on('cursor', ({ pick }) => {
  info.textContent = pick ? `${pick.kind} ${pick.id}  ${viewer.format.point(pick.point)}` : '—';
});
viewer.on('hover', (r) => viewer.setHover(r));
viewer.on('pick', (r) => viewer.setHighlight(r ? [r] : []));

const bar = document.getElementById('bar');
function button(text, fn, toggle) {
  const b = document.createElement('button');
  b.textContent = text;
  b.onclick = () => {
    const on = fn(b);
    if (toggle) b.classList.toggle('on', !!on);
  };
  bar.appendChild(b);
  return b;
}
for (const v of ['iso', 'front', 'back', 'top', 'bottom', 'left', 'right']) button(v, () => viewer.setView(v, { animate: true }));
button('ajustar', () => viewer.fit({ animate: true }));
button('orto', () => {
  viewer.setProjection(viewer.getProjection() === 'perspective' ? 'orthographic' : 'perspective');
  return viewer.getProjection() === 'orthographic';
}, true);
for (const k of ['edges', 'wireframe', 'xray', 'grid', 'axes', 'bbox']) {
  const b = button(k, () => {
    viewer.setDisplay({ [k]: !viewer.getDisplay()[k] });
    return viewer.getDisplay()[k];
  }, true);
  b.classList.toggle('on', viewer.getDisplay()[k]);
}
for (const ax of ['x', 'y', 'z']) {
  button(`corte ${ax}`, () => {
    const s = viewer.getSection();
    viewer.setSection({ enabled: !(s.enabled && s.axis === ax), axis: ax, offset: 0 });
    return viewer.getSection().enabled;
  }, true);
}
button('invertir', () => viewer.setSection({ flip: !viewer.getSection().flip }));
button('tema', () => viewer.setTheme(viewer.themeName === 'dark' ? 'light' : 'dark'));
