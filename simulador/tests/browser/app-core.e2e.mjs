// Prueba e2e del flujo principal de la app (index.html por file://): ejemplos → 2D → pieza 3D → propiedades.
// Uso: node tests/browser/app-core.e2e.mjs → imprime "APP CORE E2E OK" o termina con código 1.
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

const SAMPLE_IDS = ['placa-soporte', 'brida-bloques', 'eje-perfil', 'bloque-vistas', 'leva-spline', 'junta-arcos', 'placa-logo', 'pieza-escaneada'];
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
  assert.equal(await page.isVisible('#loadingOverlay'), false, 'la capa de carga sigue visible');

  const state = () => page.evaluate(() => {
    const s = window.__app.getState();
    return { file: s.drawing?.fileName, vol: s.partData?.volume.mm3, mass: s.partData?.mass.g, analytic: s.partData?.precision?.analyticVolume ?? null,
      mode: s.op?.mode, building: s.building, material: s.material.id };
  });
  const builds = () => page.evaluate(() => window.__builds || 0);
  await page.evaluate(() => window.__app.onBuilt(() => (window.__builds = (window.__builds || 0) + 1)));

  for (const id of SAMPLE_IDS) {
    const before = await builds();
    await page.click('#btnExamples');
    await page.click(`#menuExamples [data-value="${id}"]`);
    await page.waitForFunction((n) => (window.__builds || 0) > n && !window.__app.getState().building, before, { timeout: 120000 });
    const st = await state();
    assert.ok(st.vol > 0, `${id}: volumen`);
    if (st.analytic != null) {
      const rel = Math.abs(st.vol - st.analytic) / st.analytic;
      assert.ok(rel <= 1e-8, `${id}: error relativo ${rel}`);
      console.log(`  ${id}: V=${st.vol.toFixed(3)} mm³ · analítico ${st.analytic.toFixed(3)} · rel ${rel.toExponential(2)}`);
    } else console.log(`  ${id}: V=${st.vol.toFixed(3)} mm³ (sin referencia analítica)`);
    const massText = await page.textContent('#kpiMass');
    assert.match(massText, /^[\d.]+\s*(g|kg)$/, `${id}: KPI de masa «${massText}»`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `app-${id}.png`) });
  }

  // Pestaña 2D de la brida
  await page.click('#btnExamples');
  await page.click('#menuExamples [data-value="brida-bloques"]');
  await page.waitForFunction(() => window.__app.getState().drawing?.fileName === 'brida-bloques.dxf' && !window.__app.getState().building);
  await page.click('#viewTabs [data-tab="2d"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'app-brida-bloques-2d.png') });
  await page.click('#viewTabs [data-tab="3d"]');

  // Placa soporte: unidades, material, región
  let n = await builds();
  await page.click('#btnExamples');
  await page.click('#menuExamples [data-value="placa-soporte"]');
  await page.waitForFunction((k) => (window.__builds || 0) > k && !window.__app.getState().building, n);
  const base = await state();

  await page.click('#unitsSeg [data-value="in"]');
  assert.match(await page.textContent('#kpiVolume'), /in³/, 'KPI de volumen en pulgadas');
  assert.match(await page.textContent('#kpiDims'), /in$/, 'KPI de dimensiones en pulgadas');
  await page.click('#unitsSeg [data-value="mm"]');
  assert.match(await page.textContent('#kpiDims'), /mm$/);

  await page.evaluate(() => (window.__buildRef = window.__app.getState().build));
  await page.selectOption('#selMaterial', 'al-6061-t6');
  const alu = await state();
  assert.equal(alu.material, 'al-6061-t6');
  assert.ok(Math.abs(alu.mass / base.mass - 2.7 / 7.87) < 1e-9, `masa con aluminio ${alu.mass} vs ${base.mass}`);
  assert.ok(await page.evaluate(() => window.__app.getState().build === window.__buildRef), 'cambiar material no reconstruye');
  assert.equal(alu.vol, base.vol, 'cambiar material no reconstruye');

  // Clic en la vista 2D sobre la región: la excluye y la vuelve a incluir.
  n = await builds();
  await page.click('#viewTabs [data-tab="split"]');
  await page.waitForTimeout(200);
  const pt = await page.evaluate(() => {
    const s = window.__app.getState();
    const regions = s.profile.regions;
    // Punto interior de la región más pequeña incluida: centroide del contorno si cae dentro.
    const infos = s.profile.loopInfos;
    const idx = regions.map((r, i) => i).sort((a, b) => infos[regions[a].outer].area - infos[regions[b].outer].area)[0];
    const b = infos[regions[idx].outer].bbox;
    const q = window.__app.view2d.worldToScreen([b.minX + 3, (b.minY + b.maxY) / 2]);
    const r = window.__app.view2d.canvas.getBoundingClientRect();
    return { x: r.left + q[0], y: r.top + q[1], regions: regions.length };
  });
  if (pt.regions > 1) {
    await page.mouse.click(pt.x, pt.y);
    await page.waitForFunction((k) => (window.__builds || 0) > k && !window.__app.getState().building, n);
    const after = await state();
    assert.ok(after.vol < base.vol, `volumen tras excluir región ${after.vol} < ${base.vol}`);
  } else {
    // Una sola región: el clic la excluye y no hay pieza que construir (aviso); se vuelve a incluir.
    await page.mouse.click(pt.x, pt.y);
    await page.waitForFunction(() => window.__app.getState().op.regions[0].included === false);
    await page.mouse.click(pt.x, pt.y);
    await page.waitForFunction(() => window.__app.getState().op.regions[0].included === true);
  }
  await page.click('#btnExamples');
  await page.click('#menuExamples [data-value="bloque-vistas"]');
  n = await builds();
  await page.waitForFunction(() => window.__app.getState().drawing?.fileName === 'bloque-vistas.dxf' && !window.__app.getState().building);
  // Regiones múltiples en extrusión: excluir una con clic en 2D.
  n = await builds();
  await page.click('#opSeg [data-value="extrude"]');
  await page.waitForFunction((k) => (window.__builds || 0) > k && !window.__app.getState().building, n);
  const multi = await state();
  n = await builds();
  const p2 = await page.evaluate(() => {
    const s = window.__app.getState();
    const info = s.profile.loopInfos[s.profile.regions[0].outer];
    const q = window.__app.view2d.worldToScreen([info.bbox.minX + 2, info.bbox.minY + 2]);
    const r = window.__app.view2d.canvas.getBoundingClientRect();
    return { x: r.left + q[0], y: r.top + q[1] };
  });
  await page.mouse.click(p2.x, p2.y);
  await page.waitForFunction((k) => (window.__builds || 0) > k && !window.__app.getState().building, n);
  const less = await state();
  assert.ok(less.vol < multi.vol, `volumen tras excluir región en 2D: ${less.vol} < ${multi.vol}`);
  assert.equal(await page.evaluate(() => window.__app.getState().op.regions[0].included), false);

  assert.equal(errors.length, 0, `errores del navegador:\n${errors.join('\n')}`);
  console.log('APP CORE E2E OK');
} finally {
  await browser.close();
}
