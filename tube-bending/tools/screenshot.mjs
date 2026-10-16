// Captura de pantalla headless de la app (WebGL vía SwiftShader).
// Uso: node tools/screenshot.mjs [--page index.html] [--out .scratch/shot.png] [--wait 4000]
//        [--eval "js a ejecutar en la página antes de capturar"] [--size 1600x1000]
// Las peticiones a cdn.jsdelivr.net/npm/three@0.160.0 se sirven desde node_modules/three
// (el proxy del contenedor bloquea el CDN); Google Fonts se bloquea (usa la fuente de respaldo).
// Imprime los errores de consola y de página; sale con código 1 si hubo alguno.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const page_ = args.page || 'index.html';
const out = path.resolve(root, args.out || '.scratch/shot.png');
const wait = Number(args.wait || 4000);
const [w, h] = String(args.size || '1600x1000').split('x').map(Number);
fs.mkdirSync(path.dirname(out), { recursive: true });

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', (route) => {
  const rel = new URL(route.request().url()).pathname.replace('/npm/three@0.160.0/', '');
  const file = path.join(root, 'node_modules/three', rel);
  if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'missing ' + rel });
  route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
await page.goto(base + page_, { waitUntil: 'load' });
await page.waitForTimeout(wait);
if (args.eval) {
  const r = await page.evaluate(args.eval);
  if (r !== undefined) console.log('eval →', typeof r === 'string' ? r : JSON.stringify(r, null, 1));
  await page.waitForTimeout(Number(args.after || 1500));
}
await page.screenshot({ path: out });
console.log('screenshot:', out);
for (const e of errors) console.log(e);
await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
