// Prueba e2e de mediciones, exportaciones, atajos y ayuda (index.html por file://).
// Uso: node tests/browser/app-tools.e2e.mjs → imprime "APP TOOLS E2E OK" o termina con código 1.
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

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack || e}`));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => document.getElementById('kernelText').textContent.startsWith('Motor CAD listo'), null, { timeout: 120000 });

  // Exportar sin pieza: aviso claro, sin descarga
  await page.click('#btnExport');
  await page.click('#menuExport [data-value="step"]');
  await page.waitForSelector('.toast-warn:has-text("No hay pieza que exportar")');

  await page.evaluate(() => window.__app.loadSample('placa-soporte'));
  await page.waitForFunction(() => window.__app.getState().partData && !window.__app.getState().building, null, { timeout: 120000 });
  await page.waitForTimeout(500);
  const rows = () => page.$$eval('#measureList li', (ls) => ls.map((l) => ({ id: l.dataset.measure, text: l.textContent.replace(/\s+/g, ' ').trim() })));
  const pressed = (sel) => page.getAttribute(sel, 'aria-pressed');

  // ── 3D: punto a punto entre dos vértices de la cara superior ──
  const v = await page.evaluate(() => {
    const vw = window.__app.viewer;
    const vs = vw._model.vertices.map((x) => Array.from(x.p));
    const zMax = Math.max(...vs.map((p) => p[2]));
    const top = vs.filter((p) => p[2] > zMax - 1e-6);
    const by = (f) => top.reduce((a, b) => (f(b) < f(a) ? b : a));
    const a = by((p) => p[0] + p[1]);
    const b = by((p) => -(p[0] - p[1]));
    return { a, b, sa: vw.projectToScreen(a), sb: vw.projectToScreen(b), d: Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) };
  });
  const xy = (s) => (Array.isArray(s) ? s : [s.x, s.y]);
  await page.keyboard.press('p');
  assert.equal(await pressed('#toolPalette [data-tool="point"]'), 'true', 'P activa punto a punto');
  await page.mouse.click(...xy(v.sa));
  await page.mouse.click(...xy(v.sb));
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 1);
  let r = await rows();
  assert.ok(r[0].text.includes(`${v.d.toFixed(3)} mm`), `medición 3D «${r[0].text}» ≠ ${v.d.toFixed(3)} mm`);

  // Inspección + Fijar
  await page.keyboard.press('i');
  await page.mouse.click(...xy(v.sa));
  await page.waitForSelector('#inspectCard:not([hidden]) [data-action="pin"]');
  await page.click('#inspectCard [data-action="pin"]');
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 2);
  await page.keyboard.press('Escape');
  assert.equal(await page.$('#toolPalette [aria-pressed="true"]'), null, 'Esc desactiva la herramienta');

  // ── 2D: distancia entre los extremos del lado recto más largo del contorno exterior ──
  await page.click('#viewTabs [data-tab="2d"]');
  await page.waitForTimeout(300);
  await page.click('#toolbar2d [data-mode2d="measure"]');
  const p2 = await page.evaluate(() => {
    const { profile } = window.__app.getState();
    const outer = profile.loopInfos.reduce((a, b) => (b.area > a.area ? b : a));
    let best = null;
    outer.poly.forEach((p, i) => {
      const q = outer.poly[(i + 1) % outer.poly.length];
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (!best || d > best.d) best = { p, q, d };
    });
    const v2 = window.__app.view2d;
    const rc = v2.canvas.getBoundingClientRect();
    const s = (w) => { const [x, y] = v2.worldToScreen(w); return [rc.left + x, rc.top + y]; };
    return { a: s(best.p), b: s(best.q), d: best.d };
  });
  await page.mouse.click(...p2.a);
  await page.mouse.click(...p2.b);
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 3);
  r = await rows();
  assert.ok(r[2].id.startsWith('2d-') && r[2].text.includes(`${p2.d.toFixed(3)} mm`), `medición 2D «${r[2].text}» ≠ ${p2.d.toFixed(3)} mm`);

  // ── Unidades: los textos pasan a pulgadas ──
  await page.click('#unitsSeg [data-value="in"]');
  r = await rows();
  assert.ok(r[0].text.includes(`${(v.d / 25.4).toFixed(4)} in`), `3D en pulgadas «${r[0].text}»`);
  assert.ok(r[2].text.includes(`${(p2.d / 25.4).toFixed(4)} in`), `2D en pulgadas «${r[2].text}»`);
  assert.ok(r.every((x) => !/ mm\b/.test(x.text)), 'quedan textos en mm');
  await page.locator('#measurePanel').screenshot({ path: path.join(outDir, 'app-tools-measures.png') });
  // La etiqueta 3D del visor (CSS2D) también cambia de unidades (se pinta solo con la pestaña 3D visible).
  const pillText = async () => {
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
    return page.evaluate(() => [...document.querySelectorAll('.v3d-labels .v3d-pill')].map((p) => p.textContent).join('\n'));
  };
  const dIn = `${(v.d / 25.4).toFixed(4)} in`;
  await page.click('#viewTabs [data-tab="3d"]');
  let pt = await pillText();
  assert.ok(pt.includes(dIn), `etiqueta 3D en pulgadas «${pt}»`);
  await page.click('#unitsSeg [data-value="mm"]');
  pt = await pillText();
  assert.ok(pt.includes(`${v.d.toFixed(3)} mm`) && !pt.includes(dIn), `etiqueta 3D vuelve a mm «${pt}»`);
  await page.click('#viewTabs [data-tab="2d"]');
  r = await rows();
  assert.ok(r[0].text.includes(`${v.d.toFixed(3)} mm`), 'vuelta a mm');

  // Borrar una cota 2D suelta: la otra sigue en la lista y en el plano.
  await page.mouse.click(...p2.b);
  await page.mouse.click(...p2.a);
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 4);
  r = await rows();
  await page.click(`#measureList li[data-measure="${r[2].id}"] [data-action="delete"]`);
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 3);
  assert.deepEqual((await rows()).map((x) => x.id), [r[0].id, r[1].id, r[3].id], 'solo se borra la cota elegida');
  assert.deepEqual(await page.evaluate(() => window.__app.view2d._measures.map((m) => `2d-${m.id}`)), [r[3].id], 'cota restante en el plano');

  // Borrar una fila (la inspección fijada), copiar, CSV de mediciones
  await page.click(`#measureList li[data-measure="${r[1].id}"] [data-action="delete"]`);
  await page.waitForFunction(() => document.querySelectorAll('#measureList li').length === 2);
  assert.equal(await page.textContent('#measureCount'), '2');
  await page.click('#btnMeasureCopy');
  await page.waitForSelector('.toast:has-text("copiad")');
  const dlOf = async (fn) => {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), fn()]);
    return { name: dl.suggestedFilename(), buf: fs.readFileSync(await dl.path()) };
  };
  const mcsv = await dlOf(() => page.click('#btnMeasureCSV'));
  assert.equal(mcsv.name, 'placa-soporte-mediciones.csv');
  assert.ok(mcsv.buf.toString('utf8').startsWith('﻿Medición,Valor\r\n'), 'CSV de mediciones');
  assert.equal(mcsv.buf.toString('utf8').trim().split('\r\n').length, 3);

  // ── Exportaciones ──
  const mass = await page.evaluate(() => window.__app.getState().partData.mass.g);
  const exp = (kind) => dlOf(async () => {
    await page.click('#btnExport');
    await page.click(`#menuExport [data-value="${kind}"]`);
  });
  const checks = {
    step: (b, n) => { assert.equal(n, 'placa-soporte.step'); const s = b.toString('latin1'); assert.ok(s.includes('ISO-10303-21') && s.includes('MILLI'), 'STEP'); },
    stl: (b) => assert.equal(b.length, 84 + 50 * b.readUInt32LE(80), 'STL binario'),
    'stl-ascii': (b) => assert.ok(b.toString('latin1').startsWith('solid'), 'STL ASCII'),
    obj: (b) => { const s = b.toString(); assert.ok(/^v /m.test(s) && /^f /m.test(s), 'OBJ'); },
    glb: (b) => assert.equal(b.toString('latin1', 0, 4), 'glTF'),
    ply: (b) => assert.equal(b.toString('latin1', 0, 3), 'ply'),
    csv: (b) => { assert.deepEqual([...b.subarray(0, 3)], [0xef, 0xbb, 0xbf]); assert.ok(b.toString('utf8', 3).startsWith('Propiedad,Valor,Unidad'), 'CSV'); },
    json: (b) => { const j = JSON.parse(b.toString()); assert.equal(j.mass.g, mass, 'masa JSON'); assert.equal(j.measurements.length, 2); },
    'report-html': (b) => { const s = b.toString(); assert.ok(s.includes('Reporte de pieza') && s.includes('Distancia 2D'), 'reporte'); },
    png: (b) => {
      assert.deepEqual([...b.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      assert.ok(b.length > 5000, `PNG vacío (${b.length} B): exportado desde la pestaña 2D`);
    },
  };
  for (const [kind, check] of Object.entries(checks)) {
    const { name, buf } = await exp(kind);
    check(buf, name);
    console.log(`  ${kind}: ${name} · ${buf.length} B`);
  }
  assert.equal(await page.getAttribute('#btnExport', 'aria-busy'), 'false');

  // ── Atajos ──
  await page.click('#viewTabs [data-tab="3d"]');
  await page.locator('#view3d').hover();
  await page.keyboard.press('1');
  for (const [key, sel] of [['w', '#displayBar [data-display="wireframe"]'], ['x', '#displayBar [data-display="xray"]']]) {
    const before = await pressed(sel);
    await page.keyboard.press(key);
    assert.notEqual(await pressed(sel), before, `${key} conmuta ${sel}`);
    await page.keyboard.press(key);
    assert.equal(await pressed(sel), before);
  }
  await page.keyboard.press('s');
  assert.equal(await page.isChecked('#chkSection'), true, 'S activa la sección');
  await page.keyboard.press('s');
  assert.equal(await page.isChecked('#chkSection'), false);
  await page.keyboard.press('p');
  assert.equal(await pressed('#toolPalette [data-tool="point"]'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await pressed('#toolPalette [data-tool="point"]'), 'false');
  await page.keyboard.press('Home');

  // ── Ayuda ──
  await page.keyboard.press('?');
  await page.waitForSelector('#modal:not([hidden]) .help');
  assert.match(await page.textContent('#modalBody'), /B-rep exacto/);
  await page.waitForTimeout(200);
  await page.locator('#modal .modal-dialog, #modal > div').first().screenshot({ path: path.join(outDir, 'app-tools-help.png') });
  await page.keyboard.press('Escape');
  assert.equal(await page.isHidden('#modal'), true);

  assert.deepEqual(errors, [], 'errores en consola');
  console.log('APP TOOLS E2E OK');
} catch (e) {
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
