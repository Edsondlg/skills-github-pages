// Prueba e2e de reinicios de estado: lo que se conserva al rehacer el perfil (paso 1) y lo que se
// reinicia al abrir un plano nuevo (imagen, modo 2D, cargas concurrentes, carga fallida).
// Uso: node tests/browser/app-resets.e2e.mjs → imprime "APP RESETS E2E OK" o termina con código 1.
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

const PNG_B64 = fs.readFileSync(path.join(root, 'samples/pieza-escaneada.png')).toString('base64');
const DEFAULT_MM_PER_PX = 0.25; // valor inicial de «Escala (mm/px)»
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

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
  // Espera a que la pieza mostrada corresponda a las entradas actuales.
  const settled = () => page.waitForFunction(() => {
    const s = window.__app.getState();
    return s.partData && !s.building && !s.dirty;
  }, null, { timeout: 120000 });
  const sample = async (id) => {
    await page.evaluate((x) => window.__app.loadSample(x), id);
    await settled();
  };
  const state = () => page.evaluate(() => {
    const s = window.__app.getState();
    return {
      file: s.drawing?.fileName ?? null, vol: s.partData?.volume.mm3 ?? null, z: s.partData?.bbox.size[2] ?? null,
      op: s.op, toMM: s.profile?.toMM ?? null, hasProfile: !!s.profile, dirty: s.dirty, mode2d: window.__app.view2d.mode,
    };
  });
  return { ctx, page, errors, downloads, settled, sample, state };
}

const cases = {
  // (4) Eje elegido por el usuario + cambio de «Tolerancia de unión»: se conserva el eje y el volumen.
  async axis({ page, settled, sample, state }) {
    await sample('eje-perfil');
    await page.evaluate(() => window.__app.setRevolveAxis({ p: [0, -20], d: [1, 0] }));
    await settled();
    const before = await state();
    close(before.vol, 243789, 1, 'volumen con el eje elegido');
    await page.fill('#inpJoinTol', '0.02');
    await page.press('#inpJoinTol', 'Enter');
    await settled();
    const s = await state();
    assert.equal(s.op.revolve.axisKind, 'line', 'eje elegido conservado');
    close(s.op.revolve.axis.p[1], -20, 1e-9, 'punto del eje');
    close(s.vol, before.vol, before.vol * 1e-6, 'volumen tras el cambio de tolerancia');
    assert.equal(await page.inputValue('#selAxis'), 'line', '#selAxis');
    const readout = await page.textContent('#axisReadout');
    assert.match(readout, /^Línea · por \(0(\.0+)?, -20(\.0+)?\) mm · dir \(1, 0\)$/, `lectura del eje: ${readout}`);
  },

  // (4) Opciones por región: altura de la región 1 tras un cambio inocuo del paso 1.
  async region({ page, settled, sample, state }) {
    await sample('placa-soporte');
    await page.evaluate(() => {
      const inp = document.querySelector('#regionList [data-region="0"] input[data-field="height"]');
      inp.value = '5';
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await settled();
    close((await state()).z, 5, 1e-6, 'altura 5 aplicada');
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => document.getElementById('chkIgnoreAux').click());
      await page.waitForTimeout(100);
    }
    await settled();
    const s = await state();
    assert.equal(s.op.regions[0].height, 5, 'altura por región conservada');
    close(s.z, 5, 1e-6, 'pieza de 5 mm');
    assert.equal(await page.inputValue('#regionList [data-region="0"] input[data-field="height"]'), '5', 'campo de altura');
  },

  // (5) Imagen nueva: escala, umbral e inversión vuelven a sus valores por defecto.
  async image({ page, settled, sample, state }) {
    await sample('pieza-escaneada');
    await page.evaluate(() => window.__app.setImageScale(0.5));
    await page.evaluate(() => {
      const r = document.getElementById('rngThreshold');
      r.value = '100';
      r.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await settled();
    assert.equal((await state()).toMM, 0.5);
    assert.equal(await page.isChecked('#chkThresholdAuto'), false, 'umbral manual antes');
    await page.evaluate((b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return window.__app.openFiles([new File([bytes], 'otra.png', { type: 'image/png' })]);
    }, PNG_B64);
    await settled();
    const s = await state();
    assert.equal(s.file, 'otra.png');
    assert.equal(s.toMM, DEFAULT_MM_PER_PX, 'escala por defecto en la imagen nueva');
    close(Number(await page.inputValue('#inpPxScale')), DEFAULT_MM_PER_PX, 1e-9, 'campo mm/px');
    assert.equal(await page.isChecked('#chkThresholdAuto'), true, 'umbral automático');
    assert.equal(await page.isChecked('#chkInvert'), false, 'sin invertir');
  },

  // (8) Plano nuevo con una ventana de multivista pendiente: la vista 2D vuelve a «select».
  async mode2d({ page, sample, state }) {
    await sample('bloque-vistas');
    await page.evaluate(() => document.querySelector('#slotLeft [data-action="define"]').click());
    assert.equal((await state()).mode2d, 'window');
    await sample('placa-soporte');
    assert.equal((await state()).mode2d, 'select', 'modo 2D');
    assert.equal(await page.$$eval('#panelMultiview .slot.is-active', (l) => l.length), 0, 'sin ranura pendiente');
    assert.doesNotMatch(await page.textContent('#hint2d'), /rectángulo/, 'pista de ventana borrada');
  },

  // (9) Cargas concurrentes: gana la última iniciada (la imagen lenta no reemplaza al DXF).
  async race({ page, settled, state }) {
    await page.evaluate(() => Promise.all([window.__app.loadSample('pieza-escaneada'), window.__app.loadSample('placa-soporte')]));
    await settled();
    await page.waitForTimeout(300);
    const s = await state();
    assert.equal(s.file, 'placa-soporte.dxf', 'plano final');
    close(Number(await page.inputValue('#inpPxScale')), DEFAULT_MM_PER_PX, 1e-9, 'la escala del ejemplo descartado no se aplica');
  },

  // Carga fallida tras la placa: nada de la placa (op, regiones, pieza) y exportación rechazada.
  async failed({ page, downloads, sample, state }) {
    await sample('placa-soporte');
    await page.evaluate(() => window.__app.openFiles([new File(['esto no es un dxf'], 'basura.dxf')]));
    await page.waitForTimeout(300);
    const s = await state();
    assert.equal(s.op, null, 'sin op de la placa');
    assert.equal(s.hasProfile, false, 'sin perfil');
    assert.equal(s.vol, null, 'sin propiedades de la placa');
    assert.equal(await page.$$eval('#regionList [data-region]', (l) => l.length), 0, 'sin regiones de la placa');
    assert.equal(await page.textContent('#fileName'), 'basura.dxf', 'chip del archivo');
    assert.ok(await page.evaluate(() => window.__app.prepareExport()), 'prepareExport rechaza');
    const n = downloads.length;
    await page.evaluate(() => window.__app.exportAs('stl'));
    await page.waitForTimeout(500);
    assert.equal(downloads.length, n, 'sin descarga');
  },

  // Perfil que falla al rehacerse (paso 1): error visible, perfil vacío y exportación rechazada.
  async reprocessFail({ page, sample, state }) {
    await sample('placa-soporte');
    await page.evaluate(() => {
      const sel = document.getElementById('selDrawingUnits');
      sel.add(new Option('zz', 'zz'));
      sel.value = 'zz';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const s = await state();
    assert.equal(s.hasProfile, false, 'perfil borrado');
    assert.equal(s.dirty, true);
    assert.match(String(await page.evaluate(() => window.__app.prepareExport())), /perfil/, 'motivo del rechazo');
    assert.ok(await page.isVisible('#propsStale'), 'aviso visible');
    assert.equal(await page.getAttribute('#propsStale', 'data-state'), 'error');
    // Volver a una unidad válida recupera el perfil y la pieza.
    await page.evaluate(() => {
      const sel = document.getElementById('selDrawingUnits');
      sel.value = 'auto';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => {
      const st = window.__app.getState();
      return st.partData && !st.building && !st.dirty;
    }, null, { timeout: 120000 });
    assert.ok((await state()).vol > 0);
  },
};

const only = process.argv.slice(2);
const failed = [];
try {
  for (const [name, fn] of Object.entries(cases)) {
    if (only.length && !only.includes(name)) continue;
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
  console.log(`APP RESETS E2E FALLA: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('APP RESETS E2E OK');
