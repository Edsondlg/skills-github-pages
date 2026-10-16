// Prueba de navegador del armazón de la UI (file://, Chromium).
// Uso: node tests/browser/shell.e2e.mjs → imprime "SHELL E2E OK" o termina con código 1.
// Reconstruye build/app.js; restaurar con `git checkout -- build/` antes de confirmar.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'dev/build');
fs.mkdirSync(outDir, { recursive: true });
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { cwd: root, stdio: 'inherit' });

// Ids documentados en el bloque de comentario inicial de ui-shell.js.
const shellSrc = fs.readFileSync(path.join(root, 'src/app/ui-shell.js'), 'utf8');
const header = shellSrc.slice(0, shellSrc.indexOf('*/'));
const ids = [...new Set([...header.matchAll(/#([A-Za-z][\w-]*)/g)].map((m) => m[1]))];
const htmlIds = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const undocumented = htmlIds.filter((id) => !ids.includes(id));
assert.deepEqual(undocumented, [], 'ids de index.html sin documentar en ui-shell.js');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.stack || e}`));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => document.querySelector('#measureList .measure'));

  const missing = await page.evaluate((list) => list.filter((id) => !document.getElementById(id)), ids);
  assert.deepEqual(missing, [], 'ids documentados que faltan en el DOM');
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  const shot = async (name) => {
    await page.waitForTimeout(250);
    assert.ok(await noOverflow(), `${name}: desbordamiento horizontal`);
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(`  captura dev/build/${name}.png`);
  };

  await shot('shell-dark');
  await page.click('#btnTheme');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
  await shot('shell-light');
  await page.click('#btnTheme');

  await page.click('#viewTabs [data-tab="split"]');
  assert.equal(await page.evaluate(() => document.getElementById('viewports').dataset.view), 'split');
  await shot('shell-split');
  await page.click('#viewTabs [data-tab="3d"]');

  await page.click('#btnExport');
  assert.equal(await page.isVisible('#menuExport'), true);
  await page.keyboard.press('ArrowDown');
  await shot('shell-menu');
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#menuExport'), false);

  await page.click('#btnHelp');
  assert.equal(await page.isVisible('#modal'), true);
  await shot('shell-help');
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#modal'), false);

  // Toast y campo numérico
  await page.evaluate(() => document.getElementById('inpThickness').focus());
  await page.keyboard.press('ArrowUp');
  assert.equal(await page.inputValue('#inpThickness'), '2.100');

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.click('#btnRightDrawer');
  await shot('shell-narrow');
  assert.equal(errors.length, 0, `errores del navegador:\n${errors.join('\n')}`);
  console.log('SHELL E2E OK');
} catch (e) {
  console.error(e);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
