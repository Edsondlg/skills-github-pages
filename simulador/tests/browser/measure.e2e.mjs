// E2E de las herramientas de medición 3D: empaqueta el arnés, lo abre por file:// y mide
// con clics reales sobre la placa de prueba. Uso: node tests/browser/measure.e2e.mjs
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'dev/build');

await esbuild.build({
  entryPoints: [path.join(root, 'dev/measure-entry.js')],
  outfile: path.join(outDir, 'measure.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  loader: { '.json': 'json' },
  logLevel: 'warning',
});

const fail = (msg) => {
  throw new Error(msg);
};
const near = (a, b, tol, what) => {
  if (!(Math.abs(a - b) <= tol)) fail(`${what}: ${a} ≠ ${b} (tol ${tol})`);
};
const eq = (a, b, what) => {
  if (a !== b) fail(`${what}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(pathToFileURL(path.join(root, 'dev/measure-harness.html')).href);
  await page.waitForFunction(() => window.viewer && window.measure && window.viewer.getModel());
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  const ids = await page.evaluate(() => {
    const t = window.plate.topology;
    const face = (pred) => t.faces.find(pred).id;
    return {
      top: face((f) => f.type === 'plane' && f.normal[2] === 1 && f.center[2] === 6),
      bottom: face((f) => f.type === 'plane' && f.normal[2] === -1),
      front: face((f) => f.type === 'plane' && f.normal[1] === -1),
      boss: face((f) => f.type === 'cylinder' && f.radius === 12),
      topArea: t.faces.find((f) => f.type === 'plane' && f.normal[2] === 1 && f.center[2] === 6).area,
      frontArea: t.faces.find((f) => f.type === 'plane' && f.normal[1] === -1).area,
      frontEdge: t.edges.find((e) => e.type === 'line' && e.start.join() === '8,0,6' && e.end.join() === '112,0,6'),
      hole: t.edges.find((e) => e.type === 'circle' && e.closed && e.radius === 10 && e.center.join() === '30,40,6'),
    };
  });
  eq(ids.top, 685705158, 'id cara superior');
  near(ids.topArea, 8677.982357, 1e-9, 'área cara superior');
  eq(ids.frontEdge?.id, 1203422738, 'id arista frontal');
  near(ids.frontEdge.length, 104, 1e-12, 'longitud arista frontal');
  eq(ids.hole?.id, 1322474343, 'id círculo Ø20');

  const screen = async (p) => {
    const s = await page.evaluate((q) => window.viewer.projectToScreen(q), p);
    if (!s.visible) fail(`punto no visible ${JSON.stringify(p)}`);
    return s;
  };
  const click = async (p, { shift = false } = {}) => {
    const s = await screen(p);
    if (shift) await page.keyboard.down('Shift');
    await page.mouse.click(s.x, s.y);
    if (shift) await page.keyboard.up('Shift');
  };
  const tool = (t) => page.evaluate((x) => window.measure.setTool(x) && true, t);
  const state = () => page.evaluate(() => window.lastChange);
  const last = async () => (await state()).list.at(-1);
  const count = async () => (await state()).list.length;
  const overlays = () => page.evaluate(() => window.viewer._measureGroup.children.length);

  // 1. Distancia entre puntos (vértices exactos).
  await tool('point');
  eq((await state()).extra.hint, 'Selecciona el primer punto', 'pista paso 1');
  await click([8, 0, 6]);
  eq((await state()).extra.hint, 'Selecciona el segundo punto…', 'pista paso 2');
  await click([112, 0, 6]);
  let m = await last();
  eq(m.tool, 'point', 'herramienta punto');
  near(m.values.distance, 104, 1e-6, 'distancia puntos');
  near(m.values.dx, 104, 1e-6, 'Δx');
  near(m.values.dy, 0, 1e-9, 'Δy');
  eq(m.text, '104.000 mm · Δx 104.000 · Δy 0.000 · Δz 0.000 mm', 'texto puntos');

  // 2. Radio de la arista superior del agujero Ø20.
  await tool('radius');
  await click([30, 30, 6]);
  m = await last();
  eq(m.tool, 'radius', 'herramienta radio');
  near(m.values.radius, 10, 1e-9, 'R');
  near(m.values.diameter, 20, 1e-9, 'Ø');
  eq(m.values.entity.id, ids.hole.id, 'arista del radio');
  eq(m.text.startsWith('R 10.000 · Ø 20.000 mm'), true, `texto radio "${m.text}"`);

  // 3. Área: cara superior; Mayús+clic suma la cara frontal.
  await tool('area');
  await click([20, 62, 6]);
  m = await last();
  near(m.values.area, ids.topArea, 1e-9, 'área 1 cara');
  eq(m.values.count, 1, 'nº caras');
  const nArea = await count();
  await click([30, 0, 3], { shift: true });
  m = await last();
  eq(await count(), nArea, 'Mayús+clic no crea otra medición');
  near(m.values.area, ids.topArea + ids.frontArea, 1e-9, 'área sumada');
  eq(m.values.count, 2, 'nº caras sumadas');
  eq(JSON.stringify(m.values.faces), JSON.stringify([ids.top, ids.front]), 'caras del área');

  // 4. Ángulo cara superior / cara frontal.
  await tool('angle');
  await click([100, 40, 6]);
  await click([90, 0, 3]);
  m = await last();
  eq(m.tool, 'angle', 'herramienta ángulo');
  near(m.values.angle, 90, 1e-9, 'ángulo');
  eq(m.text, '90.000° (suplementario 90.000°)', 'texto ángulo');

  // 5. Distancia mínima cara superior / cara inferior (núcleo simulado).
  await tool('distance');
  await click([45, 65, 6]);
  eq((await state()).extra.hint, 'Selecciona la segunda entidad…', 'pista distancia');
  await page.evaluate(() => window.viewer.setView('bottom'));
  await click([45, 65, 0]);
  await page.waitForFunction(() => window.lastChange.list.at(-1).tool === 'distance');
  m = await last();
  near(m.values.distance, 6, 1e-9, 'distancia caras');
  eq(m.values.parallel, true, 'caras paralelas');
  eq(m.text, '6.000 mm · caras paralelas', 'texto distancia');
  await page.evaluate(() => window.viewer.setView('iso'));

  // 6. Espesor: placa (planos paralelos) y pared del saliente (cilindros coaxiales).
  await tool('thickness');
  await click([60, 20, 6]);
  m = await last();
  eq(m.tool, 'thickness', 'herramienta espesor');
  near(m.values.thickness, 6, 1e-9, 'espesor placa');
  eq(m.values.method, 'planos paralelos', 'método espesor placa');
  eq(m.values.faces[1], ids.bottom, 'cara opuesta');
  await click([86, 40 - 6 * Math.sqrt(3), 10]);
  m = await last();
  near(m.values.thickness, 6, 1e-9, 'espesor saliente');
  eq(m.values.method, 'cilindros coaxiales', 'método espesor saliente');

  // 7. Coordenadas de un vértice.
  await tool('coords');
  await click([112, 0, 6]);
  m = await last();
  eq(JSON.stringify(m.values.point), JSON.stringify([112, 0, 6]), 'coordenadas');
  eq(m.text, '(112.000, 0.000, 6.000) mm', 'texto coordenadas');

  // 8. Inspección del cilindro del saliente.
  await tool('inspect');
  const nBefore = await count();
  const th = (-20 * Math.PI) / 180;
  const sb = await screen([80 + 12 * Math.cos(th), 40 + 12 * Math.sin(th), 16]);
  await page.mouse.move(sb.x - 20, sb.y - 20);
  await page.mouse.move(sb.x, sb.y);
  await page.waitForFunction((id) => window.viewer._hoverKey === `face:${id}`, ids.boss);
  await page.mouse.click(sb.x, sb.y);
  const info = (await state()).extra.inspect;
  eq(info?.kind, 'face', 'inspección: tipo');
  eq(info.id, ids.boss, 'inspección: id');
  eq(info.type, 'cylinder', 'inspección: superficie');
  eq(info.lines[0], 'Cilindro', 'inspección: nombre');
  near(info.values.radius, 12, 1e-12, 'inspección: R');
  eq(await count(), nBefore, 'inspección no añade a la lista');
  const pinned = await page.evaluate(() => window.measure.pinInspect());
  eq(pinned.tool, 'inspect', 'inspección fijada');
  eq(pinned.text.startsWith('R 12.000 · Ø 24.000 mm'), true, `texto fijado "${pinned.text}"`);
  eq(await count(), nBefore + 1, 'fijar añade a la lista');

  // 8b. setFormat re-formatea lista, etiquetas del visor y ficha de inspección existentes.
  const frames = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const pills = async () => (await frames(), await page.evaluate(() => [...document.querySelectorAll('.v3d-labels .v3d-pill')].map((p) => p.textContent).join('\n')));
  const texts = async () => (await state()).list.map((x) => x.text).join('\n');
  const mmPills = await pills();
  const mmTexts = await texts();
  eq(mmPills.includes('104.000 mm'), true, `etiqueta punto en mm "${mmPills}"`);
  await page.evaluate(() => {
    const f = (v) => (v / 25.4).toFixed(4);
    window.measure.setFormat({
      len: (v) => `${f(v)} in`,
      area: (v) => `${(v / 645.16).toFixed(4)} in²`,
      point: (p) => `(${p.map(f).join(', ')}) in`,
    });
  });
  const inTexts = await texts();
  const inPills = await pills();
  for (const [where, s] of [['lista', inTexts], ['etiquetas', inPills]]) {
    eq(s.includes('4.0945 in'), true, `${where}: punto 104 mm → 4.0945 in "${s}"`);
    eq(s.includes('R 0.3937 · Ø 0.7874 in'), true, `${where}: radio en pulgadas "${s}"`);
    eq(s.includes(`${((ids.topArea + ids.frontArea) / 645.16).toFixed(4)} in²`), true, `${where}: área en in² "${s}"`);
    eq(s.includes('90.000°'), true, `${where}: ángulo sin cambios "${s}"`);
    eq(/\bmm\b/.test(s), false, `${where}: no quedan mm "${s}"`);
  }
  eq((await state()).extra.inspect.lines.some((l) => l.includes(' in')), true, 'ficha de inspección en pulgadas');
  eq((await state()).list.at(-1).text.startsWith('R 0.4724 · Ø 0.9449 in'), true, 'texto fijado en pulgadas');
  await page.evaluate(() => window.measure.setFormat({}));
  eq(await texts(), mmTexts, 'lista vuelve a mm');
  eq(await pills(), mmPills, 'etiquetas vuelven a mm');

  await page.mouse.move(5, 790);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(outDir, 'measure-tools.png') });

  // 9. Esc anula la selección pendiente; remove / clear vacían lista y gráficos.
  await tool('point');
  const ov0 = await overlays();
  await click([8, 0, 6]);
  eq(await overlays(), ov0 + 1, 'marca pendiente');
  await page.keyboard.press('Escape');
  eq(await overlays(), ov0, 'Esc quita la marca');
  eq((await state()).extra.hint, 'Selecciona el primer punto', 'Esc reinicia la pista');
  await click([112, 0, 6]);
  eq((await state()).extra.hint, 'Selecciona el segundo punto…', 'tras Esc empieza de nuevo');
  await tool('none');
  eq(await overlays(), ov0, 'cambiar de herramienta anula lo pendiente');
  eq((await state()).extra.hint, null, 'sin pista en none');
  const n0 = await count();
  const firstId = (await state()).list[0].id;
  await page.evaluate((id) => window.measure.remove(id), firstId);
  eq(await count(), n0 - 1, 'remove');
  if (!((await overlays()) < ov0)) fail('remove no quitó gráficos');
  await page.evaluate(() => window.measure.clear());
  eq(await count(), 0, 'clear');
  eq(await overlays(), 0, 'clear quita gráficos');
  eq(await page.evaluate(() => document.querySelectorAll('.v3d-labels .v3d-pill').length
    - document.querySelectorAll('.v3d-labels .v3d-small').length), 0, 'sin etiquetas de medición');
  // Cambio de modelo: borra las mediciones.
  await tool('coords');
  await click([112, 0, 6]);
  eq(await count(), 1, 'medición antes de cambiar modelo');
  await page.evaluate(() => window.viewer.setModel(window.plate));
  eq(await count(), 0, 'cambio de modelo borra');
  eq(await overlays(), 0, 'cambio de modelo quita gráficos');

  if (errors.length) fail(`errores en consola:\n${errors.join('\n')}`);
  console.log('MEASURE E2E OK');
} finally {
  await browser.close();
}
