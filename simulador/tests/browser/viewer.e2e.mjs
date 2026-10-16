// Prueba de navegador del visor 3D (Chromium + SwiftShader).
// Uso: node tests/browser/viewer.e2e.mjs   → imprime "VIEWER E2E OK" o termina con código 1.
// Capturas en dev/build/ (viewer-*.png de la página y viewer-*-x2.png de viewer.screenshot(2)).
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'dev/build');
fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'dev/viewer-entry.js')],
  outfile: path.join(outDir, 'viewer.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  loader: { '.json': 'json' },
  logLevel: 'warning',
});

// Ids del fixture (placa 120×80×6 con buje Ø24×14).
const TOP_FACE = 685705158; // plano z = 6
const BOSS_SIDE = 69570124; // cilindro r = 12
const TOP_FRONT_EDGE = 1203422738; // línea (8,0,6)–(112,0,6)
const HOLE_TOP_CIRCLE = 1322474343; // círculo c=(30,40,6) r=10

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
    else if (m.type() === 'warning') console.log(`  [aviso navegador] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack || e}`));
  await page.goto(pathToFileURL(path.join(root, 'dev/viewer-harness.html')).href);
  await page.waitForFunction(() => window.viewer && window.fixture);

  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const call = (expr) => page.evaluate(expr);
  const checkErrors = (where) => assert.equal(errors.length, 0, `errores del navegador (${where}):\n${errors.join('\n')}`);

  async function shot(name) {
    await settle();
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    const b64 = await page.evaluate(async () => {
      const blob = await window.viewer.screenshot(2);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(s);
    });
    const buf = Buffer.from(b64, 'base64');
    assert.equal(buf.subarray(1, 4).toString(), 'PNG', `${name}: screenshot() no es PNG`);
    fs.writeFileSync(path.join(outDir, `${name}-x2.png`), buf);
    checkErrors(name);
    console.log(`  captura ${name}.png (+ ${name}-x2.png, ${(buf.length / 1024).toFixed(0)} KB)`);
  }

  // Clic real del ratón en la proyección de p; devuelve el resultado del evento 'pick'.
  async function clickPick(p) {
    await settle();
    const s = await page.evaluate((q) => {
      window.__pick = undefined;
      const off = window.viewer.on('pick', (r, mods) => {
        window.__pick = { r, mods };
        off();
      });
      return window.viewer.projectToScreen(q);
    }, p);
    assert.ok(s.visible, `punto ${p} no visible en pantalla`);
    await page.mouse.move(s.x, s.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForFunction(() => window.__pick !== undefined);
    const { r, mods } = await page.evaluate(() => window.__pick);
    assert.equal(typeof mods.shiftKey, 'boolean');
    return r;
  }

  async function pickSuite(label) {
    const v = await clickPick([8, 0, 6]);
    assert.equal(v?.kind, 'vertex', `${label}: vértice → ${JSON.stringify(v)}`);
    assert.deepEqual(v.point, [8, 0, 6]);
    assert.equal(v.snapped, true);

    const e = await clickPick([60, 0, 6]);
    assert.equal(e?.kind, 'edge', `${label}: arista recta → ${JSON.stringify(e)}`);
    assert.equal(e.id, TOP_FRONT_EDGE);
    assert.equal(e.point[1], 0);
    assert.equal(e.point[2], 6);
    assert.ok(Math.abs(e.point[0] - 60) < 1, `${label}: x de arista ${e.point[0]}`);

    const c = await clickPick([30, 30, 6]);
    assert.equal(c?.kind, 'edge', `${label}: círculo → ${JSON.stringify(c)}`);
    assert.equal(c.id, HOLE_TOP_CIRCLE);
    assert.ok(Math.abs(Math.hypot(c.point[0] - 30, c.point[1] - 40) - 10) < 1e-9, `${label}: punto fuera del círculo exacto`);
    assert.equal(c.point[2], 6);

    const f = await clickPick([60, 20, 6]);
    assert.equal(f?.kind, 'face', `${label}: cara → ${JSON.stringify(f)}`);
    assert.equal(f.id, TOP_FACE);
    assert.equal(f.point[2], 6, `${label}: z de cara no ajustada al plano`);
    assert.deepEqual(f.normal, [0, 0, 1]);

    const a = -Math.PI / 4;
    const cyl = await clickPick([80 + 12 * Math.cos(a), 40 + 12 * Math.sin(a), 13]);
    assert.equal(cyl?.kind, 'face', `${label}: cilindro → ${JSON.stringify(cyl)}`);
    assert.equal(cyl.id, BOSS_SIDE);
    assert.ok(Math.abs(Math.hypot(cyl.point[0] - 80, cyl.point[1] - 40) - 12) < 1e-9, `${label}: punto fuera del cilindro exacto`);
    console.log(`  selección OK (${label})`);
  }

  await settle();
  checkErrors('carga');
  await shot('viewer-iso');

  // Selección con ratón real en perspectiva y ortográfica.
  await pickSuite('iso perspectiva');
  await call(() => window.viewer.setProjection('orthographic'));
  await pickSuite('iso ortográfica');
  await call(() => window.viewer.setProjection('perspective'));
  await call(() => window.viewer.setHighlight([]));

  // Un clic fuera de la pieza no selecciona nada.
  {
    await page.mouse.move(640, 790);
    const none = await page.evaluate(() => window.viewer.pick(1270, 20));
    assert.equal(none, null);
  }

  // Sección en Y por el centro; la cara de corte no se puede seleccionar.
  await call(() => window.viewer.setSection({ enabled: true, axis: 'y', offset: 0 }));
  await shot('viewer-section');
  {
    const s = await page.evaluate(() => window.viewer.projectToScreen([60, 20, 6]));
    assert.equal(s.visible, false, 'punto en el lado cortado debería ser invisible');
  }
  await call(() => window.viewer.setSection({ enabled: false }));

  await call(() => window.viewer.setTheme('light'));
  await shot('viewer-light');

  await call(() => {
    const v = window.viewer;
    v.setView('top');
    v.setProjection('orthographic');
    v.setDisplay({ bbox: true });
  });
  await shot('viewer-top-ortho');
  await call(() => {
    const v = window.viewer;
    v.setDisplay({ bbox: false });
    v.setProjection('perspective');
    v.setTheme('dark');
    v.setView('iso');
    v.setDisplay({ xray: true });
  });
  await shot('viewer-xray');
  {
    // Con bbox apagado (y tras reconstruirla al cambiar de tema) no quedan etiquetas a la vista.
    const shown = await page.evaluate(() => [...document.querySelectorAll('.v3d-label')].filter((e) => e.style.display !== 'none').length);
    assert.equal(shown, 0, `etiquetas huérfanas visibles: ${shown}`);
  }
  await call(() => window.viewer.setDisplay({ xray: false }));

  // Gizmo: clic en la esfera +Z → vista superior (animada).
  {
    await settle();
    const g = await page.evaluate(() => {
      const v = window.viewer;
      const sp = v.viewHelper.children.find((c) => c.userData.type === 'posZ');
      v.viewHelper.updateMatrixWorld();
      const q = sp.getWorldPosition(sp.position.clone()).project(v._gizmoCam);
      const el = v.renderer.domElement;
      const rc = el.getBoundingClientRect();
      const dim = 128;
      return { x: rc.right - dim + ((q.x + 1) / 2) * dim, y: rc.bottom - dim + ((1 - q.y) / 2) * dim };
    });
    await page.mouse.move(g.x, g.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(700);
    await settle();
    const dir = await page.evaluate(() => {
      const v = window.viewer;
      return v.camera.position.clone().sub(v.controls.target).normalize().toArray();
    });
    assert.ok(dir[2] > 0.999, `gizmo +Z no llevó a vista superior: ${dir}`);
    console.log('  gizmo OK');
  }

  // Recorrido de la API completa.
  const api = await page.evaluate(async () => {
    const v = window.viewer;
    for (const name of ['iso', 'front', 'back', 'top', 'bottom', 'left', 'right']) {
      v.setView(name);
      v.fit();
      await new Promise((r) => requestAnimationFrame(r));
    }
    for (const p of ['orthographic', 'perspective', 'orthographic', 'perspective']) {
      v.setProjection(p);
      v.setView('iso');
      await new Promise((r) => requestAnimationFrame(r));
    }
    for (const k of ['edges', 'wireframe', 'xray', 'grid', 'axes', 'bbox']) {
      v.setDisplay({ [k]: !v.getDisplay()[k] });
      await new Promise((r) => requestAnimationFrame(r));
      v.setDisplay({ [k]: !v.getDisplay()[k] });
    }
    for (const axis of ['x', 'y', 'z']) {
      for (const flip of [false, true]) {
        v.setSection({ enabled: true, axis, offset: 2, flip });
        await new Promise((r) => requestAnimationFrame(r));
      }
    }
    v.setSection({ enabled: false, flip: false, offset: 0 });
    v.setTheme('light');
    v.setTheme('dark');
    v.setAppearance({ color: '#c08040', metalness: 0.8, roughness: 0.25, opacity: 0.6 });
    v.setAppearance({ color: '#b9c0c8', metalness: 0.55, roughness: 0.36, opacity: 1 });
    const exp = v.getExportMesh();
    const nVerts = exp.geometry.attributes.position.count;
    v.setDisplay({ bbox: true });
    v.clearModel();
    const labelsLeft = document.querySelectorAll('.v3d-label').length;
    v.setDisplay({ bbox: false });
    const empty = v.pick(640, 400);
    v.setModel(window.toTyped(window.fixture), { color: '#a0a8b0' });
    v.setView('iso');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { nVerts, empty, labelsLeft, isExportMesh: exp.isMesh };
  });
  assert.ok(api.isExportMesh && api.nVerts > 0, 'getExportMesh sin vértices');
  assert.equal(api.empty, null);
  assert.equal(api.labelsLeft, 0, 'clearModel dejó etiquetas en el DOM');
  checkErrors('API');

  // Con arreglos tipados la selección sigue funcionando.
  await pickSuite('arreglos tipados');

  await page.evaluate(() => window.viewer.dispose());
  await settle();
  checkErrors('dispose');
  console.log('VIEWER E2E OK');
} catch (e) {
  failed = true;
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
