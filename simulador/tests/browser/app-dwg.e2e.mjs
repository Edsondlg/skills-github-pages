// Prueba e2e de la importación DWG (index.html y Simulador-Plano-3D.html por file://): abrir
// brida-bloques.dwg da el mismo volumen que brida-bloques.dxf, la insignia dice DWG y no hay errores.
// Uso: node tests/browser/app-dwg.e2e.mjs → imprime "APP DWG E2E OK" o termina con código 1.
// Reconstruye build/ y el archivo único; restaurar con `git checkout -- build/ Simulador-Plano-3D.html` antes de confirmar.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs'), '--single'], { cwd: root, stdio: 'inherit' });

const dxf = [...fs.readFileSync(path.join(root, 'samples/brida-bloques.dxf'))];
const dwg = [...fs.readFileSync(path.join(root, 'samples/brida-bloques.dwg'))];
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
try {
  for (const file of ['index.html', 'Simulador-Plano-3D.html']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && errors.push(`${file} console: ${m.text()}`));
    page.on('pageerror', (e) => errors.push(`${file} pageerror: ${e.stack || e}`));
    await page.goto(pathToFileURL(path.join(root, file)).href);
    await page.waitForFunction(() => document.getElementById('kernelText').textContent.startsWith('Motor CAD listo'), null, { timeout: 120000 });
    await page.evaluate(() => window.__app.onBuilt(() => (window.__builds = (window.__builds || 0) + 1)));

    const built = async (name, start) => {
      const before = await page.evaluate(() => window.__builds || 0);
      await start();
      await page.waitForFunction(([n, f]) => (window.__builds || 0) > n && !window.__app.getState().building && window.__app.getState().drawing?.fileName === f,
        [before, name], { timeout: 120000 });
      return page.evaluate(() => {
        const s = window.__app.getState();
        return { format: s.drawing.format, version: s.drawing.version ?? null, vol: s.partData.volume.mm3, badge: document.getElementById('fileFormat').textContent };
      });
    };
    const open = (bytes, name) => built(name, () => page.evaluate(([b, n]) => window.__app.openFiles([new File([new Uint8Array(b)], n)]), [bytes, name]));
    const example = (id, name) => built(name, async () => {
      await page.click('#btnExamples');
      await page.click(`#menuExamples [data-value="${id}"]`);
    });

    // Archivo abierto por el usuario.
    const a = await open(dxf, 'brida-bloques.dxf');
    const b = await open(dwg, 'brida-bloques.dwg');
    assert.equal(a.badge, 'DXF');
    assert.equal(b.format, 'dwg');
    assert.equal(b.badge, 'DWG');
    assert.equal(b.version, 'AC1027 (AutoCAD 2013)');
    assert.ok(a.vol > 0 && rel(b.vol, a.vol) <= 1e-9, `${file}: volumen DWG ${b.vol} ≠ DXF ${a.vol}`);
    // Ejemplo DWG del menú frente al ejemplo DXF.
    const c = await example('brida-bloques', 'brida-bloques.dxf');
    const d = await example('brida-bloques-dwg', 'brida-bloques.dwg');
    assert.equal(d.badge, 'DWG');
    assert.ok(rel(d.vol, c.vol) <= 1e-9, `${file}: volumen del ejemplo DWG ${d.vol} ≠ DXF ${c.vol}`);
    console.log(`  ${file}: abierto V=${b.vol.toFixed(4)} mm³ (DXF ${a.vol.toFixed(4)}) · ejemplo V=${d.vol.toFixed(4)} mm³ (DXF ${c.vol.toFixed(4)})`);
    await page.close();
  }
  assert.deepEqual(errors, [], `errores en consola:\n${errors.join('\n')}`);
  console.log('APP DWG E2E OK');
} catch (e) {
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
