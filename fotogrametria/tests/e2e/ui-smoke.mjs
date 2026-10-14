// Prueba de humo de la interfaz: carga, navegación, demostración completa, CAD y textura.
import { openPage } from './browser.mjs';
import fs from 'node:fs';
const OUT = process.env.OUTDIR || '/tmp';
const FULL = process.env.FULL !== '0';
const { page, close, logs } = await openPage('index.html');
const errors = () => logs.filter(l => l.startsWith('PAGEERROR') || /Uncaught|TypeError|ReferenceError|SyntaxError/.test(l));
await page.waitForFunction(() => !!window.fotoApp, null, { timeout: 30000 });
const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/ui_${name}.png` }); };
const steps = ['patterns', 'photos', 'calib', 'recon', 'viewer', 'results', 'cad'];
for (const s of steps) {
  await page.evaluate((s) => window.fotoApp.go(s), s);
  await page.waitForTimeout(500);
  await shot('empty_' + s);
}
console.log('navegación ok; errores:', errors());
if (FULL) {
  const t0 = Date.now();
  await page.evaluate(() => { window.fotoApp.settings.recon.quality = 'prueba'; });
  page.on('dialog', d => d.accept());
  await page.evaluate(() => window.fotoApp.runDemo({ count: +window.__COUNT || 10, width: 1600, height: 1200 }).then(() => { window.__demoDone = true; }), null);
  await page.waitForFunction(() => window.__demoDone === true, null, { timeout: 3000000, polling: 2000 });
  console.log('demo terminada en', ((Date.now() - t0) / 1000).toFixed(0), 's');
  const st = await page.evaluate(() => {
    const a = window.fotoApp;
    return { calib: a.project.calib && { rms: a.project.calib.rms, reg: a.project.calib.registered, check: a.project.calib.check && a.project.calib.check.rms3d }, tris: a.state.recon && a.state.recon.meshStats && a.state.recon.meshStats.triangles, index: a.state.metrics && a.state.metrics.index, u95: a.state.metrics && a.state.metrics.uncertainty95, verdict: a.state.metrics && a.state.metrics.verdict };
  });
  console.log(JSON.stringify(st));
  await shot('viewer');
  for (const m of ['shaded', 'confidence', 'points']) { await page.evaluate((m) => { window.fotoApp.state.view.mode = m; window.fotoApp._viewer.setMode(m); }, m); await shot('mode_' + m); }
  await page.evaluate(() => { window.fotoApp.state.view.mode = 'color'; window.fotoApp._viewer.setMode('color'); });
  // medición por API: distancia entre dos vértices
  const meas = await page.evaluate(() => {
    const a = window.fotoApp, v = a._viewer, T = window.fotoApp._viewer.mesh.geometry.attributes.position;
    a.measure.setMode('distance');
    const p0 = { point: new (v.camera.position.constructor)(T.getX(0), T.getY(0), T.getZ(0)) };
    const p1 = { point: new (v.camera.position.constructor)(T.getX(100), T.getY(100), T.getZ(100)) };
    a.measure.handlePick(p0); a.measure.handlePick(p1);
    return a.measure.items.map(i => i.text);
  });
  console.log('medición:', meas);
  // barrenos y ranuras (botón del visor)
  await page.evaluate(() => window.fotoApp.go('viewer'));
  await page.getByRole('button', { name: 'Detectar barrenos' }).click();
  await page.waitForFunction(() => Array.isArray(window.fotoApp.state.holes), null, { timeout: 120000, polling: 500 });
  console.log('barrenos:', await page.evaluate(() => window.fotoApp.state.holes.filter(o => o.type === 'circular' || o.section !== null)
    .map(o => `${o.type === 'circular' ? `Ø${o.diameter.toFixed(2)} ±${o.u95.toFixed(2)}` : `${o.size[0].toFixed(1)}×${o.size[1].toFixed(1)}`} en ${o.center.map(v => v.toFixed(1)).join(', ')}`)));
  await shot('holes');
  // sección
  await page.evaluate(() => { const a = window.fotoApp; a.state.section = { axis: 'x', offset: 0, flip: false }; a.refresh(); });
  await shot('section');
  await page.evaluate(() => { const a = window.fotoApp; a.state.section = { axis: null, offset: 0, flip: false }; a.go('results'); });
  await shot('results');
  // CAD de la demo
  await page.evaluate(() => window.fotoApp.go('cad'));
  await page.getByText('Usar CAD de la demo').click();
  await page.getByRole('button', { name: 'Comparar', exact: true }).click();
  await page.waitForFunction(() => window.fotoApp.state.cad && window.fotoApp.state.cad.stats, null, { timeout: 600000, polling: 1000 });
  const cad = await page.evaluate(() => { const c = window.fotoApp.state.cad; return { inTol: c.stats.inTol, rms: c.stats.rms, mean: c.stats.mean, cov: c.stats.coverage, align: c.alignInfo, icp: c.icpRms, t: c.t.map(v => +v.toFixed(3)), Rdiag: [c.R[0], c.R[4], c.R[8]].map(v => +v.toFixed(5)) }; });
  console.log('CAD:', JSON.stringify(cad));
  if (process.env.MESHDUMP) {
    // malla reconstruida y CAD (coordenadas del tapete) para repetir la alineación fuera del navegador
    const d = await page.evaluate(() => { const a = window.fotoApp, m = a.state.recon.mesh; return { p: Array.from(m.positions), i: Array.from(m.indices), cad: Array.from(a.state.cadGeo.attributes.position.array) }; });
    fs.writeFileSync(process.env.MESHDUMP, JSON.stringify(d));
  }
  await shot('cad');
  // textura
  await page.evaluate(() => window.fotoApp.go('viewer'));
  await page.getByText('Generar textura fotográfica').click();
  await page.waitForFunction(() => window.fotoApp.state.recon.texture, null, { timeout: 600000, polling: 1000 });
  console.log('textura:', await page.evaluate(() => window.fotoApp.state.recon.texture.info));
  await shot('texture');
  await page.evaluate(() => window.fotoApp.go('results'));
  await shot('results_final');
}
console.log('errores de página:', errors());
await close();
