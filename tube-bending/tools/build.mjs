// Empaqueta la app en UN solo HTML autónomo y offline: dist/SimuladorDobladoTubo.html
//  - JS: esbuild agrupa js/app.js con three.js (desde node_modules) → un <script type="module"> en línea.
//  - CSS: cada <link rel="stylesheet" href="css/…"> local se incrusta.
//  - Piezas de ejemplo: samples/*.stp se incrustan en window.__TB_SAMPLES__ (id = nombre sin extensión).
//  - Se elimina el <script type="importmap"> (ya no hace falta).
// Uso: node tools/build.mjs [--out dist/SimuladorDobladoTubo.html]
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const out = path.resolve(root, outArg > 0 ? process.argv[outArg + 1] : 'dist/SimuladorDobladoTubo.html');

const threeDir = path.join(root, 'node_modules/three');
const result = await esbuild.build({
  entryPoints: [path.join(root, 'js/app.js')],
  bundle: true, format: 'esm', minify: true, write: false, target: 'es2020', legalComments: 'inline',
  plugins: [{
    name: 'three-local',
    setup(b) {
      b.onResolve({ filter: /^three$/ }, () => ({ path: path.join(threeDir, 'build/three.module.js') }));
      b.onResolve({ filter: /^three\/addons\// }, (a) => ({ path: path.join(threeDir, 'examples/jsm', a.path.slice('three/addons/'.length)) }));
    },
  }],
});
let js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/i, '');
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)"\s*\/?>/gi, (_, href) =>
  `<style>\n${fs.readFileSync(path.join(root, href), 'utf8')}\n</style>`);
const samples = {};
for (const f of fs.readdirSync(path.join(root, 'samples')).filter((f) => /\.(stp|step)$/i.test(f))) {
  samples[f.replace(/\.(stp|step)$/i, '')] = fs.readFileSync(path.join(root, 'samples', f), 'utf8');
}
const samplesTag = `<script>window.__TB_SAMPLES__=${JSON.stringify(samples).replace(/<\/script/gi, '<\\/script')};</script>`;
const moduleTag = /<script type="module" src="js\/app\.js"><\/script>/i;
if (!moduleTag.test(html)) throw new Error('index.html debe cargar <script type="module" src="js/app.js"></script>');
html = html.replace(moduleTag, () => `${samplesTag}\n<script type="module">\n${js}\n</script>`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${path.relative(root, out)}  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
