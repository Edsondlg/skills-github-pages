// Prueba e2e de la limpieza del plano (index.html por file://): borrar líneas (clic, ventana, captura,
// Mayús+clic, Ctrl+Z) y calibrar la escala con una cota conocida (círculo en DXF e imagen).
// Uso: node tests/browser/app-cleanup.e2e.mjs → imprime "APP CLEANUP E2E OK" o termina con código 1.
// Reconstruye build/; restaurar con `git checkout -- build/ Simulador-Plano-3D.html` antes de confirmar.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { cwd: root, stdio: 'inherit' });

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
  const close = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${msg}: ${a} vs ${b} (rel ${Math.abs(a - b) / Math.abs(b)})`);
  const info = () => page.evaluate(() => {
    const s = window.__app.getState();
    return { vol: s.partData.volume.mm3, sizeX: s.partData.bbox.size[0], holes: s.profile.stats.holes, erased: s.profile.stats.erasedRemoved, toMM: s.profile.toMM };
  });
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
  // Índices de los círculos del dibujo con radio r (unidades del dibujo).
  const circles = (r) => page.evaluate((rr) => window.__app.getState().drawing.segments
    .map((s, i) => ({ i, c: s.c, r: s.r, type: s.type })).filter((s) => s.type === 'circle' && Math.abs(s.r - rr) < 1e-6), r);
  // Acción del ratón que provoca una generación.
  const andBuild = async (fn) => {
    const n = await builds();
    await fn();
    await waitBuilt(n).catch(async (e) => {
      console.error(JSON.stringify(await page.evaluate(() => ({ st: window.__app.getState().profile.stats, mode: window.__app.view2d.mode, tab: document.querySelector('#viewTabs [aria-selected="true"]')?.dataset.tab }))));
      throw e;
    });
  };
  // Vista 2D visible y con el encuadre asentado (el reencuadre al mostrar la pestaña va en un rAF).
  const settle2d = () => page.waitForFunction(() => new Promise((res) => {
    const v = window.__app.view2d, t0 = JSON.stringify(v.getTransform());
    requestAnimationFrame(() => requestAnimationFrame(() => res(v.canvas.clientWidth > 0 && JSON.stringify(v.getTransform()) === t0)));
  }), null, { timeout: 10000 });
  const drag = async (a, b) => {
    const p = await toPage(a), q = await toPage(b);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move((p.x + q.x) / 2, (p.y + q.y) / 2, { steps: 4 });
    await page.mouse.move(q.x, q.y, { steps: 4 });
    await page.mouse.up();
  };

  // ── (a) placa-soporte: borrar líneas ──
  await loadSample('placa-soporte');
  const base = await info();
  const holes85 = await circles(4.25);
  assert.equal(holes85.length, 4, 'cuatro barrenos Ø8.5');
  await page.keyboard.press('b');
  await settle2d();
  assert.equal(await page.evaluate(() => window.__app.view2d.mode), 'erase', 'B activa el borrado');
  assert.equal(await page.getAttribute('#toolbar2d [data-mode2d="erase"]', 'aria-pressed'), 'true');
  assert.match(await page.textContent('#hint2d'), /borrar/i);
  const view0 = await page.evaluate(() => window.__app.view2d.getTransform());
  const h = holes85[0];
  let q = await toPage([h.c[0] + h.r * Math.SQRT1_2, h.c[1] + h.r * Math.SQRT1_2]);
  await andBuild(() => page.mouse.click(q.x, q.y));
  let st = await info();
  assert.equal(st.holes, base.holes - 1, 'un barreno menos');
  assert.equal(st.erased, 1);
  close(st.vol - base.vol, Math.PI * 4.25 ** 2 * 2, 1e-6, 'volumen del barreno borrado');
  assert.deepEqual(await page.evaluate(() => window.__app.view2d.getTransform()), view0, 'el borrado conserva el encuadre');
  assert.equal(await page.evaluate(() => window.__app.view2d.mode), 'erase', 'sigue en modo borrar');

  // Ctrl+Z restaura.
  await andBuild(() => page.keyboard.press('Control+z'));
  st = await info();
  assert.equal(st.holes, base.holes, 'Ctrl+Z restaura el barreno');
  assert.equal(st.erased, 0);
  close(st.vol, base.vol, 1e-9, 'volumen tras deshacer');

  // Ventana izq→der alrededor del contorno no circular más pequeño (grupo de segmentos).
  const group = await page.evaluate(() => {
    const p = window.__app.getState().profile;
    const li = p.regions.flatMap((r) => r.holes).filter((k) => !p.loopInfos[k].circle).sort((a, b) => p.loopInfos[a].area - p.loopInfos[b].area)[0];
    return { bbox: p.loopInfos[li].bbox, n: p.loops[li].segs.length };
  });
  assert.ok(group.n >= 2, 'el grupo tiene varios segmentos');
  const m = 1;
  await andBuild(() => drag([group.bbox.minX - m, group.bbox.maxY + m], [group.bbox.maxX + m, group.bbox.minY - m]));
  st = await info();
  assert.equal(st.erased, group.n, 'ventana: todos los segmentos del contorno');
  assert.equal(st.holes, base.holes - 1, 'ventana: un agujero menos');

  // Captura der→izq que solo cruza el borde de otro barreno Ø8.5.
  const h2 = holes85[1];
  const e2 = [h2.c[0] + h2.r * Math.SQRT1_2, h2.c[1] + h2.r * Math.SQRT1_2]; // lejos de las líneas de centros
  await andBuild(() => drag([e2[0] + 0.3, e2[1] + 0.3], [e2[0] - 0.3, e2[1] - 0.3]));
  st = await info();
  assert.equal(st.erased, group.n + 1, 'captura: el barreno que cruza');
  assert.equal(st.holes, base.holes - 2);

  // Mayús+clic restaura solo ese barreno.
  q = await toPage(e2);
  await page.keyboard.down('Shift');
  await andBuild(() => page.mouse.click(q.x, q.y));
  await page.keyboard.up('Shift');
  st = await info();
  assert.equal(st.erased, group.n, 'Mayús+clic restaura uno');
  assert.equal(st.holes, base.holes - 1);

  // Mostrar borradas: alterna la vista sin rehacer el perfil.
  await page.click('#btn2dShowErased');
  assert.equal(await page.getAttribute('#btn2dShowErased', 'aria-pressed'), 'false');
  await page.click('#btn2dShowErased');

  // Archivo nuevo: sin borrados.
  await loadSample('placa-soporte');
  st = await info();
  assert.equal(st.erased, 0, 'archivo nuevo sin borrados');
  assert.equal(st.holes, base.holes);
  close(st.vol, base.vol, 1e-9, 'volumen del archivo nuevo');
  console.log('  (a) borrar: clic, Ctrl+Z, ventana, captura, Mayús+clic y archivo nuevo OK');

  // ── (b) placa-soporte: calibrar con un barreno Ø8.5 = 0.5 in ──
  close(st.sizeX, 150, 1e-9, 'ancho inicial');
  await page.click('#toolbar2d [data-mode2d="calibrate"]');
  await settle2d();
  const h3 = (await circles(4.25))[2];
  q = await toPage([h3.c[0] + h3.r * Math.SQRT1_2, h3.c[1] + h3.r * Math.SQRT1_2]);
  await page.mouse.click(q.x, q.y);
  await page.waitForSelector('#modal:not([hidden]) #inpCalibDist');
  assert.match(await page.textContent('#modalBody'), /Diámetro real \(mm\)/);
  await page.selectOption('#selCalibUnit', 'in');
  assert.match(await page.textContent('#modalBody'), /Diámetro real \(in\)/);
  await page.fill('#inpCalibDist', '0.5');
  await andBuild(() => page.click('#btnCalibOk'));
  st = await info();
  close(st.sizeX, 150 * 12.7 / 8.5, 1e-9, 'ancho calibrado');
  assert.equal(await page.isVisible('#scaleRow'), true, 'acción «Restablecer escala» visible');
  assert.match(await page.textContent('#infoScale'), /calibrada/);
  await andBuild(() => page.click('#btnResetScale'));
  st = await info();
  close(st.sizeX, 150, 1e-9, 'ancho restablecido');
  assert.equal(await page.isVisible('#scaleRow'), false);
  console.log('  (b) calibrar DXF por círculo (0.5 in) y restablecer OK');

  // ── (c) pieza-escaneada: calibrar con el barreno Ø80 px ──
  await loadSample('pieza-escaneada');
  st = await info();
  const big = await page.evaluate(() => window.__app.getState().drawing.segments
    .map((s, i) => ({ i, c: s.c, r: s.r, type: s.type })).filter((s) => s.type === 'circle').sort((a, b) => b.r - a.r)[0]);
  assert.ok(Math.abs(big.r - 40) < 2, `radio del barreno grande ${big.r} px`);
  await page.click('#toolbar2d [data-mode2d="calibrate"]');
  await settle2d();
  q = await toPage([(big.c[0] + big.r) * st.toMM, big.c[1] * st.toMM]);
  await page.mouse.click(q.x, q.y);
  await page.waitForSelector('#modal:not([hidden]) #inpCalibDist');
  await page.fill('#inpCalibDist', '12');
  await andBuild(() => page.click('#btnCalibOk'));
  const px = await info();
  close(px.toMM, 12 / (2 * big.r), 1e-9, 'mm/px calibrado');
  close(Number(await page.inputValue('#inpPxScale')), px.toMM, 1e-3, 'campo mm/px');
  console.log(`  (c) imagen calibrada por círculo: ${px.toMM.toFixed(6)} mm/px OK`);

  assert.deepEqual(errors, [], 'errores de consola');
  console.log('APP CLEANUP E2E OK');
} catch (e) {
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
