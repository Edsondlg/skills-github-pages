// Estado del visor entre pasos (Chromium headless, < 1 min): el corte del paso 5 no debe quedarse
// aplicado en otros pasos (p. ej. la comparación con CAD) y debe restaurarse al volver al visor.
import { openPage } from './browser.mjs';
const { page, close, logs } = await openPage('index.html', { timeout: 120000 });
await page.waitForFunction(() => !!window.fotoApp);
const r = await page.evaluate(async () => {
  const a = window.fotoApp;
  const { meshStats } = await import('./js/mesh/process.js');
  const positions = new Float32Array([-10, -10, 1, 10, -10, 1, 10, 10, 1, -10, 10, 1]);
  const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
  const mesh = { positions, indices, colors: new Uint8Array(12).fill(180), conf: new Float32Array(4).fill(1) };
  a.state.recon = { mesh, meshStats: meshStats(positions, indices), voxel: 0.5, gsd: 0.2, params: { sheetThickness: 2, qualityLabel: 'prueba' }, perView: [], previews: [], partBox: { min: [-12, -12, -3], max: [12, 12, 5] }, timings: {}, warnings: [] };
  a.state.section = { axis: 'x', offset: 0, flip: false };
  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  a.go('viewer'); await wait(2500);
  const inViewer = a._viewer.clipPlanes.length;
  a.go('cad'); await wait(500);
  const inCad = a._viewer.clipPlanes.length, linesInCad = a.sectionGroup ? a.sectionGroup.children.length : 0;
  a.go('viewer'); await wait(2500);
  return { inViewer, inCad, linesInCad, back: a._viewer.clipPlanes.length };
});
const errs = logs.filter(l => l.startsWith('PAGEERROR'));
const checks = [
  ['corte activo en el visor', r.inViewer === 1],
  ['sin corte ni líneas de sección en otro paso', r.inCad === 0 && r.linesInCad === 0],
  ['corte restaurado al volver al visor', r.back === 1],
  ['sin errores de página', errs.length === 0],
];
for (const [name, ok] of checks) console.log(`${ok ? '✔' : '✖'} ${name}`);
if (errs.length) console.log(errs.join('\n'));
await close();
process.exit(checks.every(c => c[1]) ? 0 : 1);
