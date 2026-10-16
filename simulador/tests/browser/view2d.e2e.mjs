// Prueba E2E de la vista 2D (arnés dev/view2d-harness.html desde file://).
// Uso: node tests/browser/view2d.e2e.mjs   → imprime "VIEW2D E2E OK".
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'dev/build');
fs.mkdirSync(out, { recursive: true });
await esbuild.build({
  entryPoints: [path.join(root, 'dev/view2d-entry.js')],
  outfile: path.join(out, 'view2d-harness.js'),
  bundle: true,
  format: 'iife',
  target: ['chrome100'],
  logLevel: 'warning',
});

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(pathToFileURL(path.join(root, 'dev/view2d-harness.html')).href);
  await page.waitForFunction(() => window.view && window.data);

  const frame = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const rect = await page.evaluate(() => {
    const r = view.canvas.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const client = async (p, off = [0, 0]) => {
    const q = await page.evaluate((p) => view.worldToScreen(p), p);
    return [q[0] + rect.x + off[0], q[1] + rect.y + off[1]];
  };
  const clickWorld = async (p, opts = {}, off) => {
    const [x, y] = await client(p, off);
    await page.mouse.click(x, y, opts);
    await frame();
  };
  const last = (name) => page.evaluate((n) => events.filter((x) => x.name === n).map((x) => x.e).pop() || null, name);
  const T = () => page.evaluate(() => view.getTransform());
  const D = await page.evaluate(() => ({
    plate: data.plateRegion,
    infos: data.loopInfos.map((i) => ({ circle: i.circle, bbox: i.bbox, area: i.area })),
    regions: data.regions,
  }));
  const loopOfCircle = (c, r) => D.infos.findIndex((i) => i.circle && i.circle.c[0] === c[0] && i.circle.c[1] === c[1] && i.circle.r === r);
  assert.ok(D.plate >= 0, 'región de la placa');

  // 2) Selección: región de la placa, agujero, isla.
  await clickWorld([65, 60]);
  let ev = await last('regionClick');
  assert.equal(ev.regionIndex, D.plate, 'regionClick en la placa');
  assert.equal(D.regions[D.plate].outer, ev.loopIndex);
  const hole = loopOfCircle([12, 12], 4.25);
  await clickWorld([12, 12]);
  ev = await last('loopClick');
  assert.ok(ev, 'loopClick en el agujero');
  assert.equal(ev.loopIndex, hole);
  assert.equal(ev.regionIndex, D.plate);
  await clickWorld([100, 40]);
  ev = await last('regionClick');
  assert.ok(ev.regionIndex >= 0 && ev.regionIndex !== D.plate, 'la isla es su propia región');
  await clickWorld([100, 58]);
  assert.equal((await last('loopClick')).loopIndex, loopOfCircle([100, 40], 22), 'agujero grande');
  await clickWorld([65, 60]); // deja la placa seleccionada

  // 3) Medición con referencias exactas y radio con Mayús.
  await page.evaluate(() => view.setMode('measure'));
  await clickWorld([6, 0], {}, [2, -2]);
  await clickWorld([150, 74], {}, [-2, 2]);
  ev = await last('measure');
  assert.equal(ev.kind, 'distance');
  assert.ok(Math.abs(ev.d - Math.hypot(144, 74)) <= 1e-9, `distancia ${ev.d}`);
  assert.deepEqual([ev.p1, ev.p2, ev.snap1, ev.snap2], [[6, 0], [150, 74], 'end', 'end']);
  assert.equal(ev.dx, 144);
  assert.equal(ev.dy, 74);
  await page.keyboard.down('Shift');
  await clickWorld([12 + 4.25 * Math.cos(1), 12 + 4.25 * Math.sin(1)]);
  await page.keyboard.up('Shift');
  ev = await last('measure');
  assert.equal(ev.kind, 'radius');
  assert.equal(ev.r, 4.25);
  assert.deepEqual(ev.c, [12, 12]);

  // Calibración: dos extremos referenciados.
  await page.evaluate(() => view.setMode('calibrate'));
  await clickWorld([6, 80], {}, [1, 1]);
  await clickWorld([144, 80], {}, [-1, 1]);
  ev = await last('calibrate');
  assert.equal(ev.d, 138, 'calibración exacta');

  // 4) Ventana: rectángulo arrastrado.
  await page.evaluate(() => view.setMode('window'));
  const a = await client([-5, 90]), b = await client([160, -5]);
  await page.mouse.move(a[0], a[1]);
  await page.mouse.down();
  await page.mouse.move(b[0], b[1], { steps: 6 });
  await page.mouse.up();
  await frame();
  ev = await last('window');
  const tr = await T();
  const tol = 1 / tr.scale;
  const wa = await page.evaluate(([q, r]) => view.screenToWorld([q[0] - r.x, q[1] - r.y]), [a, rect]);
  const wb = await page.evaluate(([q, r]) => view.screenToWorld([q[0] - r.x, q[1] - r.y]), [b, rect]);
  for (const [got, exp] of [[ev.minX, Math.min(wa[0], wb[0])], [ev.maxX, Math.max(wa[0], wb[0])], [ev.minY, Math.min(wa[1], wb[1])], [ev.maxY, Math.max(wa[1], wb[1])]])
    assert.ok(Math.abs(got - exp) <= tol, `ventana ${got} vs ${exp}`);
  assert.ok(Math.abs(ev.minX + 5) <= tol && Math.abs(ev.maxY - 90) <= tol, 'ventana en coordenadas de mundo');

  // 5) Eje: clic sobre la línea de centros.
  await page.evaluate(() => view.setMode('axis'));
  await clickWorld([65, 40], {}, [0, 2]);
  ev = await last('axisPick');
  assert.deepEqual(ev.d, [1, 0], 'dirección exacta');
  assert.deepEqual(ev.p, [-10, 40]);

  // 6) Zoom con la rueda en el cursor, encuadre con doble clic central, desplazamiento con botón derecho, fit().
  await page.evaluate(() => view.setMode('select'));
  const T0 = await T();
  const P = [rect.x + 500, rect.y + 300];
  await page.mouse.move(P[0], P[1]);
  const w0 = await page.evaluate(([x, y]) => view.screenToWorld([x, y]), [500, 300]);
  await page.mouse.wheel(0, -360);
  await frame();
  const T1 = await T();
  assert.ok(T1.scale > T0.scale * 1.2, 'zoom con la rueda');
  const w1 = await page.evaluate(([x, y]) => view.screenToWorld([x, y]), [500, 300]);
  assert.ok(Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) < 1e-9 * T0.scale + 1e-9, 'zoom centrado en el cursor');
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(P[0] + 100, P[1] + 50, { steps: 4 });
  await page.mouse.up({ button: 'right' });
  await frame();
  const T2 = await T();
  assert.ok(Math.abs(T2.tx - T1.tx - 100) < 1e-6 && Math.abs(T2.ty - T1.ty - 50) < 1e-6, 'desplazamiento con botón derecho');
  await page.mouse.click(P[0], P[1], { button: 'middle' });
  await page.mouse.click(P[0], P[1], { button: 'middle' });
  await frame();
  assert.deepEqual(await T(), T0, 'doble clic central = encuadrar');
  await page.mouse.wheel(0, 500);
  await frame();
  assert.notDeepEqual(await T(), T0);
  await page.evaluate(() => view.fit());
  assert.deepEqual(await T(), T0, 'fit() restaura');

  // 1) Capturas en ambos temas (ratón fuera del dibujo).
  await page.mouse.move(rect.x + rect.w - 5, rect.y + 5);
  await frame();
  await page.screenshot({ path: path.join(out, 'view2d-dark.png') });
  // La isla incluida se rellena igual que la placa (par-impar con el agujero que la rodea).
  const px = await page.evaluate(() => {
    view.render();
    const at = (w) => Array.from(view.ctx.getImageData(...view.worldToScreen(w).map((v) => v * devicePixelRatio), 1, 1).data);
    return { island: at([95, 36]), plate: at([65, 66]), hole: at([100, 59]) };
  });
  const close = (u, v) => u.every((c, i) => Math.abs(c - v[i]) <= 8);
  assert.ok(close(px.island, px.plate), `relleno de la isla ${px.island} vs ${px.plate}`);
  assert.ok(!close(px.hole, px.plate), 'el agujero no se rellena');
  await page.evaluate(() => {
    document.body.className = 'light';
    view.setTheme('light');
  });
  await frame();
  await page.screenshot({ path: path.join(out, 'view2d-light.png') });
  const blob = await page.evaluate(async () => {
    const b = await view.screenshot();
    return { type: b.type, size: b.size };
  });
  assert.equal(blob.type, 'image/png');
  assert.ok(blob.size > 1000);

  // Rendimiento: 50 000 segmentos (render + vaciado del lienzo).
  const perf = await page.evaluate(() => {
    loadStress(50000);
    const flush = () => view.ctx.getImageData(0, 0, 1, 1);
    const time = (fn) => {
      view.render();
      flush();
      const t0 = performance.now();
      for (let i = 0; i < 30; i++) {
        fn(i);
        view.render();
        flush();
      }
      return (performance.now() - t0) / 30;
    };
    const fit = time(() => {});
    view.zoomAt(null, 6);
    const zoomed = time((i) => view.zoomAt(null, i % 2 ? 1.05 : 1 / 1.05));
    const t0 = performance.now();
    view.fit();
    return { fit, zoomed, segs: view._segs.length, fitMs: performance.now() - t0 };
  });
  assert.equal(perf.segs, 50000);
  console.log(`render 50k segmentos: ${perf.fit.toFixed(2)} ms (encuadre), ${perf.zoomed.toFixed(2)} ms (zoom ×6) — media de 30`);
  await page.evaluate(() => loadDemo());
  await frame();

  assert.deepEqual(errors, [], 'errores de consola');
  console.log('VIEW2D E2E OK');
} finally {
  await browser.close();
  if (errors.length) console.error(errors.join('\n'));
}
