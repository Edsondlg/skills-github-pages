// Prueba e2e de coherencia: lo que se muestra (KPIs, vista 3D) y lo que se exporta o mide
// corresponde siempre a las entradas actuales (o la exportación se rechaza con un motivo).
// Uso: node tests/browser/app-consistency.e2e.mjs → imprime "APP CONSISTENCY E2E OK" o termina con código 1.
// Reconstruye build/; restaurar con `git checkout -- build/` antes de confirmar.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
fs.mkdirSync(path.join(root, 'dev/build'), { recursive: true });
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { cwd: root, stdio: 'inherit' });

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// Extensión en Z de un STL binario.
function stlZ(buf) {
  assert.equal(buf.length, 84 + 50 * buf.readUInt32LE(80), 'STL binario');
  let lo = Infinity, hi = -Infinity;
  for (let o = 84; o < buf.length; o += 50) {
    for (let k = 0; k < 3; k++) {
      const z = buf.readFloatLE(o + 12 + k * 12 + 8);
      lo = Math.min(lo, z);
      hi = Math.max(hi, z);
    }
  }
  return hi - lo;
}

// Extensión en Z de los CARTESIAN_POINT 3D de un STEP (los 2D son de curvas paramétricas).
function stepZ(text) {
  const zs = [...text.matchAll(/CARTESIAN_POINT\('[^']*',\(([^)]*)\)\)/g)].map((m) => m[1].split(',')).filter((c) => c.length === 3).map((c) => Number(c[2]));
  return Math.max(...zs) - Math.min(...zs);
}

// DXF con dos líneas abiertas (no forman ningún contorno).
const OPEN_DXF = '0\nSECTION\n2\nENTITIES\n'
  + '0\nLINE\n8\n0\n10\n0\n20\n0\n11\n50\n21\n0\n'
  + '0\nLINE\n8\n0\n10\n60\n20\n10\n11\n60\n21\n40\n'
  + '0\nENDSEC\n0\nEOF\n';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function newApp() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack || e}`));
  const downloads = [];
  page.on('download', (d) => downloads.push(d));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => document.getElementById('kernelText').textContent.startsWith('Motor CAD listo'), null, { timeout: 120000 });
  await page.evaluate(() => window.__app.loadSample('placa-soporte'));
  await page.waitForFunction(() => window.__app.getState().partData && !window.__app.getState().building, null, { timeout: 120000 });
  const st = await page.evaluate(() => window.__app.getState().partData.bbox.size[2]);
  close(st, 2, 1e-6, 'placa-soporte de 2 mm');
  const download = async (fn) => {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), fn()]);
    return { name: dl.suggestedFilename(), buf: fs.readFileSync(await dl.path()) };
  };
  // Exportación que debe rechazarse: sin descarga y con un aviso; devuelve el texto del aviso.
  const refused = async (kind) => {
    const n = downloads.length;
    const toasts = await page.$$eval('#toastStack .toast', (l) => l.length);
    await page.evaluate((k) => window.__app.exportAs(k), kind);
    await page.waitForTimeout(500);
    assert.equal(downloads.length, n, `exportar ${kind} debía rechazarse, pero se descargó ${downloads.at(-1)?.suggestedFilename()}`);
    const msgs = await page.$$eval('#toastStack .toast-warn .toast-msg, #toastStack .toast-error .toast-msg', (l) => l.map((e) => e.textContent));
    assert.ok(await page.$$eval('#toastStack .toast', (l) => l.length) > toasts || msgs.length, 'aviso del rechazo');
    return msgs.join(' | ');
  };
  const state = () => page.evaluate(() => {
    const s = window.__app.getState();
    return { z: s.partData?.bbox.size[2] ?? null, mass: s.partData?.mass.g ?? null, thickness: s.op?.thickness, building: s.building, dirty: s.dirty, file: s.drawing?.fileName };
  });
  return { ctx, page, errors, download, refused, state };
}

const cases = {
  // (a) Espesor 5 + Enter y exportar enseguida: STL y propiedades de 5 mm.
  async a({ page, download, state }) {
    await page.fill('#inpThickness', '5');
    await page.press('#inpThickness', 'Enter');
    const stl = await download(() => page.evaluate(() => window.__app.exportAs('stl')));
    const s = await state();
    assert.equal(s.thickness, 5);
    close(s.z, 5, 1e-6, 'partData Z');
    close(stlZ(stl.buf), 5, 1e-3, 'STL Z');
    // Motor con otra forma (p. ej. una generación descartada): la exportación vuelve a la pieza aplicada.
    await page.evaluate(async () => {
      const j = structuredClone(window.__app.getState().appliedJob);
      delete j.buildId;
      j.extrude.thickness = 9;
      await window.__app.kernel.build(j);
    });
    const again = await download(() => page.evaluate(() => window.__app.exportAs('stl')));
    close(stlZ(again.buf), 5, 1e-3, 'STL Z tras cambiar la forma del motor');
  },

  // (b) Generación A (7 mm) reemplazada por B (revolución que falla): exportación y medición 3D
  // nunca usan la forma de A.
  async b({ page, download, refused, state }) {
    await page.evaluate(async () => {
      const app = window.__app;
      const inp = document.getElementById('inpThickness');
      inp.value = '7';
      inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      const A = app.rebuild();
      document.querySelector('#opSeg [data-value="revolve"]').click();
      app.setRevolveAxis({ p: [0, 40], d: [1, 0] });
      const B = app.rebuild();
      await Promise.all([A, B]);
    });
    const s = await state();
    close(s.z, 2, 1e-6, 'la vista sigue en la pieza aplicada (2 mm)');
    // Medición 3D por la envoltura de la app: entre las caras superior e inferior de la pieza mostrada.
    const d = await page.evaluate(async () => {
      const app = window.__app;
      const faces = app.getState().build.topology.faces.filter((f) => f.type === 'plane' && Math.abs(Math.abs(f.normal[2]) - 1) < 1e-9);
      const top = faces.find((f) => f.normal[2] > 0), bottom = faces.find((f) => f.normal[2] < 0);
      return (await app.measure.kernel.distance({ kind: 'face', id: top.id }, { kind: 'face', id: bottom.id })).distance;
    });
    close(d, s.z, 1e-6, 'distancia entre caras = espesor mostrado');
    // Las entradas actuales no generan pieza: la exportación se rechaza (o, si sale, es la mostrada).
    const msg = await refused('stl');
    assert.match(msg, /export/i, `aviso: ${msg}`);
    assert.ok(await page.isVisible('#propsStale'), 'aviso de datos desactualizados');
  },

  // (c) Plano nuevo que no genera pieza: nada de la pieza anterior.
  async c({ page, refused, state }) {
    await page.evaluate((text) => window.__app.openFiles([new File([text], 'abierto.dxf')]), OPEN_DXF);
    await page.waitForFunction(() => window.__app.getState().drawing?.fileName === 'abierto.dxf' && !window.__app.getState().building);
    await page.waitForTimeout(300);
    const s = await state();
    assert.equal(s.mass, null, 'sin propiedades de la pieza anterior');
    assert.equal(await page.isVisible('#propsBody'), false, 'KPIs ocultos');
    assert.equal(await page.evaluate(() => window.__app.viewer.getModel() ?? window.__app.getState().build), null, 'sin modelo 3D anterior');
    const msg = await refused('stl');
    assert.match(msg, /pieza|export/i, `aviso: ${msg}`);
  },

  // (d) Sin actualización automática: un valor tecleado sin confirmar + Ctrl+S exporta el STEP nuevo.
  async d({ page, download, state }) {
    await page.evaluate(() => (document.getElementById('chkAutoUpdate').checked = false));
    await page.fill('#inpThickness', '3');
    await page.press('#inpThickness', 'Enter');
    await page.waitForTimeout(700);
    assert.equal((await state()).z, 2, 'sin actualización automática no se genera');
    assert.ok(await page.isVisible('#propsStale'), 'aviso de cambios sin aplicar');
    assert.match(await page.textContent('#propsStale'), /sin aplicar/i);
    await page.fill('#inpThickness', '4'); // sin Enter: el campo sigue enfocado
    const step = await download(() => page.keyboard.press('Control+s'));
    assert.equal(step.name, 'placa-soporte.step');
    close(stepZ(step.buf.toString('latin1')), 4, 1e-6, 'STEP Z');
    const s = await state();
    close(s.z, 4, 1e-6, 'partData Z tras Ctrl+S');
    assert.equal(await page.isVisible('#propsStale'), false, 'aviso oculto tras generar');
  },

  // (e) Multivista con menos de dos ventanas tras una extrusión: aviso visible y exportación rechazada.
  async e({ page, refused }) {
    await page.click('#opSeg [data-value="multiview"]');
    await page.waitForTimeout(600);
    assert.ok(await page.isVisible('#propsStale'), 'aviso de datos desactualizados');
    const msg = await refused('stl');
    assert.match(msg, /dos vistas/i, `aviso: ${msg}`);
    assert.ok(await page.isVisible('#propsStale'));
  },
};

const failed = [];
try {
  for (const [name, fn] of Object.entries(cases)) {
    const app = await newApp();
    try {
      await fn(app);
      assert.equal(app.errors.length, 0, `errores del navegador:\n${app.errors.join('\n')}`);
      console.log(`  (${name}) ok`);
    } catch (e) {
      failed.push(name);
      console.log(`  (${name}) FALLA: ${e.message.split('\n')[0]}`);
    } finally {
      await app.ctx.close();
    }
  }
} finally {
  await browser.close();
}
if (failed.length) {
  console.log(`APP CONSISTENCY E2E FALLA: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('APP CONSISTENCY E2E OK');
