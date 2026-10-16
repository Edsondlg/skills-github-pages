// Prueba e2e de los modos de la app (index.html por file://): ventanas de multivista, eje de revolución
// elegido con clic, calibración de imagen con 2 puntos y marco del plano.
// Uso: node tests/browser/app-modes.e2e.mjs → imprime "APP MODES E2E OK" o termina con código 1.
// Reconstruye build/; restaurar con `git checkout -- build/` antes de confirmar.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'dev/build');
fs.mkdirSync(outDir, { recursive: true });
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { cwd: root, stdio: 'inherit' });

// Volumen del bloque en L (tests/pipeline.test.mjs): (80·12 + 12·28)·50 − π·64·12.
const L_VOLUME = (80 * 12 + 12 * 28) * 50 - Math.PI * 64 * 12;

// DXF mínimo: marco doble A4 (297×210, interior a 10 mm) y una placa de 100×50.
function frameDxf() {
  const rect = (x0, y0, x1, y1) => [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]];
  const lines = [...rect(0, 0, 297, 210), ...rect(10, 10, 287, 200), ...rect(60, 60, 160, 110)];
  const ent = lines.map(([a, b, c, d]) => `0\nLINE\n8\n0\n10\n${a}\n20\n${b}\n11\n${c}\n21\n${d}\n`).join('');
  return `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${ent}0\nENDSEC\n0\nEOF\n`;
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack || e}`));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => document.getElementById('kernelText').textContent.startsWith('Motor CAD listo'), null, { timeout: 120000 });
  await page.evaluate(() => window.__app.onBuilt(() => (window.__builds = (window.__builds || 0) + 1)));

  const builds = () => page.evaluate(() => window.__builds || 0);
  const waitBuilt = (n) => page.waitForFunction((k) => (window.__builds || 0) > k && !window.__app.getState().building, n, { timeout: 120000 });
  const volume = () => page.evaluate(() => window.__app.getState().partData.volume.mm3);
  const close = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${msg}: ${a} vs ${b} (rel ${Math.abs(a - b) / Math.abs(b)})`);
  // Punto del plano (mm) → coordenadas de página.
  const toPage = (p) => page.evaluate((w) => {
    const q = window.__app.view2d.worldToScreen(w);
    const r = window.__app.view2d.canvas.getBoundingClientRect();
    return { x: r.left + q[0], y: r.top + q[1] };
  }, p);
  const loadSample = async (id) => {
    const n = await builds();
    await page.click('#btnExamples');
    await page.click(`#menuExamples [data-value="${id}"]`);
    await waitBuilt(n);
  };

  // ── (a) bloque-vistas: ventanas dibujadas con el ratón ──
  await loadSample('bloque-vistas');
  for (const r of ['front', 'top', 'right']) await page.click(`.slot[data-role="${r}"] [data-action="clear"]`);
  assert.equal(await page.locator('.slot-status[data-state="set"]').count(), 0, 'ranuras vacías tras borrar');
  // Caja de las regiones de cada vista (frontal y = 0..40 x < 100; superior y > 60; lateral x > 100).
  const boxes = await page.evaluate(() => {
    const p = window.__app.getState().profile;
    const out = {};
    const test = { front: (b) => b.maxX < 100 && b.maxY < 60, top: (b) => b.minY > 60, right: (b) => b.minX > 100 };
    for (const [role, f] of Object.entries(test)) {
      const bs = p.regions.map((r) => p.loopInfos[r.outer].bbox).filter(f);
      out[role] = { minX: Math.min(...bs.map((b) => b.minX)) - 3, minY: Math.min(...bs.map((b) => b.minY)) - 3, maxX: Math.max(...bs.map((b) => b.maxX)) + 3, maxY: Math.max(...bs.map((b) => b.maxY)) + 3 };
    }
    return out;
  });
  const defineWindow = async (role) => {
    await page.click(`.slot[data-role="${role}"] [data-action="define"]`);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => document.getElementById('viewports').dataset.view), '2d', 'pestaña 2D');
    assert.equal(await page.evaluate((r) => document.querySelector(`.slot[data-role="${r}"]`).classList.contains('is-active'), role), true, 'ranura activa');
    if (role === 'top') assert.equal(await page.textContent('#hint2d'), 'Arrastra un rectángulo alrededor de la vista Planta (vista desde arriba)');
    const b = boxes[role];
    const a = await toPage([b.minX, b.maxY]), c = await toPage([b.maxX, b.minY]);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(c.x, c.y, { steps: 6 });
    await page.mouse.up();
    await page.waitForFunction((r) => !!window.__app.getState().op.multiview.windows[r], role);
  };
  // Esc cancela una ventana pendiente.
  await page.click('.slot[data-role="front"] [data-action="define"]');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.slot.is-active').count(), 0, 'Esc anula la ventana pendiente');
  assert.equal(await page.evaluate(() => window.__app.view2d.mode), 'select');

  let n = await builds();
  await defineWindow('front');
  await page.waitForTimeout(700);
  assert.equal(await builds(), n, 'con una sola vista no se genera');
  await defineWindow('top');
  await waitBuilt(n);
  n = await builds();
  await defineWindow('right');
  await waitBuilt(n);
  close(await volume(), L_VOLUME, 1e-8, 'volumen L por ventanas dibujadas');
  const statuses = await page.$$eval('.slot-status', (els) => els.map((e) => [e.closest('.slot').dataset.role, e.dataset.state, e.textContent, getComputedStyle(e, '::before').content]));
  for (const [role, state, text, before] of statuses) {
    if (role === 'left') continue;
    assert.equal(state, 'set', `${role}: estado`);
    assert.match(text, /^[\d.]+ × [\d.]+ mm$/, `${role}: «${text}»`);
    assert.equal(before, '"✓ "', `${role}: ✓`);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'app-modes-multiview-2d.png') });
  await page.click('#viewTabs [data-tab="3d"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'app-modes-multiview-3d.png') });
  await page.click('.slot[data-role="right"] [data-action="clear"]');
  assert.equal(await page.getAttribute('#slotRight .slot-status', 'data-state'), 'empty');
  assert.equal(await page.textContent('#slotRight .slot-status'), 'sin definir');

  // ── (b) eje-perfil: eje elegido con clic en la línea de centros ──
  await loadSample('eje-perfil');
  const v0 = await volume();
  await page.click('#btnPickAxis');
  await page.waitForTimeout(300); // la vista 2D se ajusta al mostrarse
  assert.equal(await page.evaluate(() => window.__app.view2d.mode), 'axis');
  assert.equal(await page.textContent('#hint2d'), 'Haz clic en la línea de eje (línea de centros)');
  n = await builds();
  const ax = await toPage([-5, 0]); // tramo de la línea de centros fuera del perfil (va de x = −10 a 130)
  await page.mouse.click(ax.x, ax.y);
  await waitBuilt(n);
  const rv = await page.evaluate(() => window.__app.getState().op.revolve);
  assert.equal(rv.axisKind, 'line');
  close(await volume(), v0, 1e-9, 'volumen con el eje elegido');
  assert.match(await page.textContent('#axisReadout'), /^Línea · por \(-10\.000, 0\.000\) mm · dir \(1, 0\)$/);
  await page.click('#unitsSeg [data-value="in"]');
  assert.match(await page.textContent('#axisReadout'), /^Línea · por \(-0\.3937, 0\.0000\) in/);
  await page.click('#unitsSeg [data-value="mm"]');

  // ── (c) pieza-escaneada: calibración con 2 puntos ──
  await loadSample('pieza-escaneada');
  const ref = await page.evaluate(() => window.__app.getState().partData.bbox.size.slice());
  n = await builds();
  await page.evaluate(() => window.__app.setImageScale(0.25)); // escala equivocada
  await waitBuilt(n);
  // Esquinas opuestas del contorno exterior (caja del contorno; la vista 2D las ajusta a sus extremos).
  const corners = await page.evaluate(() => {
    const p = window.__app.getState().profile;
    const outer = p.regions.map((r) => r.outer).sort((a, b) => p.loopInfos[b].area - p.loopInfos[a].area)[0];
    const b = p.loopInfos[outer].bbox;
    return [[b.minX, b.minY], [b.maxX, b.maxY]];
  });
  await page.click('#btnCalibrate');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__app.view2d.mode), 'calibrate');
  for (const c of corners) {
    const q = await toPage(c);
    await page.mouse.click(q.x, q.y);
  }
  await page.waitForSelector('#modal:not([hidden]) #inpCalibDist');
  assert.match(await page.textContent('#modalBody'), /Distancia real entre los puntos \(mm\)/);
  const real = Math.hypot(1000, 600) * 0.15; // la junta mide 1000 × 600 px; a 0.15 mm/px, 150 × 90 mm
  n = await builds();
  await page.fill('#inpCalibDist', real.toFixed(4));
  await page.click('#btnCalibOk');
  await waitBuilt(n);
  assert.equal(await page.isVisible('#modal'), false);
  const px = Number(await page.inputValue('#inpPxScale'));
  close(px, 0.15, 0.005, 'mm/px calibrado');
  const size = await page.evaluate(() => window.__app.getState().partData.bbox.size.slice());
  close(size[0], ref[0], 0.005, 'ancho tras calibrar');
  close(size[1], ref[1], 0.005, 'alto tras calibrar');
  // Invertir y volver a trazar la imagen.
  const loops0 = await page.evaluate(() => window.__app.getState().profile.loops.length);
  await page.click('#imageSection .switch:has(#chkInvert)');
  await page.waitForFunction((k) => window.__app.getState().profile.loops.length !== k, loops0);
  n = await builds();
  await page.click('#imageSection .switch:has(#chkInvert)');
  await page.waitForFunction((k) => window.__app.getState().profile.loops.length === k, loops0);
  await waitBuilt(n);
  close((await page.evaluate(() => window.__app.getState().partData.bbox.size[0])), size[0], 1e-9, 'ancho tras invertir dos veces');

  // ── (d) marco del plano ──
  n = await builds();
  await page.evaluate((text) => window.__app.openFiles([new File([text], 'marco.dxf')]), frameDxf());
  await waitBuilt(n);
  assert.equal(await page.isVisible('#frameRow'), true, 'fila del marco visible');
  assert.equal(await page.textContent('#frameInfo'), 'Marco del plano detectado (2 contornos)');
  const t = await page.evaluate(() => window.__app.getState().op.thickness);
  close(await volume(), 100 * 50 * t, 1e-9, 'volumen sin marco');
  await page.locator('#frameRow').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outDir, 'app-modes-frame.png') });
  n = await builds();
  await page.click('#frameRow .switch');
  await waitBuilt(n);
  const withFrame = await volume();
  assert.ok(withFrame > 100 * 50 * t * 1.5, `volumen con marco ${withFrame}`);
  assert.equal(await page.isVisible('#frameRow'), true, 'la fila sigue visible con el marco incluido');
  // Cambiar una opción del paso 1 conserva la elección.
  n = await builds();
  await page.selectOption('#selDrawingUnits', 'mm');
  await waitBuilt(n);
  close(await volume(), withFrame, 1e-9, 'marco incluido tras reprocesar');
  n = await builds();
  await page.click('#frameRow .switch');
  await waitBuilt(n);
  close(await volume(), 100 * 50 * t, 1e-9, 'volumen sin marco otra vez');
  // Un plano sin marco oculta la fila.
  await loadSample('placa-soporte');
  assert.equal(await page.isVisible('#frameRow'), false, 'fila oculta sin marco');

  assert.equal(errors.length, 0, `errores del navegador:\n${errors.join('\n')}`);
  console.log('APP MODES E2E OK');
} finally {
  await browser.close();
}
