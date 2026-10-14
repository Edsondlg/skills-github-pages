// Arranque de Chromium (Playwright global) con WebGL2 por software para pruebas.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './server.mjs';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require('playwright'); } catch {}
  return require('/opt/node22/lib/node_modules/playwright');
}

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function openPage(relUrl, { timeout = 600000 } = {}) {
  const { chromium } = loadPlaywright();
  const { server, port } = await startServer(ROOT);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=6000'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.setDefaultTimeout(timeout);
  const logs = [];
  page.on('console', m => { const t = m.text(); logs.push(t); if (process.env.VERBOSE) console.log('[page]', t); });
  page.on('pageerror', e => { logs.push('PAGEERROR ' + e.message); console.log('[pageerror]', e.message); });
  await page.goto(`http://127.0.0.1:${port}/${relUrl}`);
  const close = async () => { await browser.close(); server.close(); };
  return { page, browser, close, logs, port };
}
