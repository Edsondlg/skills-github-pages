// Empaqueta el simulador en scripts clásicos (sin módulos ES) para que
// index.html funcione abriéndolo con doble clic (file://) y también en GitHub Pages.
//
// Salidas en build/:
//   app.js        Interfaz + three.js + importadores + geometría 2D (IIFE).
//   kernel.js     Código del worker CAD (replicad + OpenCascade) guardado como
//                 texto en window.__PLANO3D_KERNEL_SRC__; se lanza como Worker
//                 desde un Blob (Chrome no permite Workers de archivo en file://).
//   occt-wasm.js  Binario WebAssembly de OpenCascade comprimido (gzip) y en
//                 base64, en window.__OCCT_WASM_GZ_B64__ (fetch está bloqueado en file://).
//   dwg-wasm.js   Conversor DWG→DXF (dwgdxf/acadrust) en WebAssembly, gzip + base64, en
//                 window.__DWG_WASM_GZ_B64__ (lo usa src/importers/dwg.js).
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build');
fs.mkdirSync(out, { recursive: true });

const banner = '/* Simulador Plano 2D → Pieza 3D. Archivo generado por scripts/build.mjs; no editar. */';

async function buildApp() {
  await esbuild.build({
    entryPoints: [path.join(root, 'src/app/main.js')],
    outfile: path.join(out, 'app.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome100', 'firefox115', 'safari16'],
    minify: true,
    legalComments: 'eof',
    banner: { js: banner },
    loader: { '.dxf': 'text', '.dwg': 'binary', '.svg': 'text', '.png': 'dataurl', '.jpg': 'dataurl' },
    // En un IIFE no existe import.meta; src/importers/dwg.js solo lo usa en Node.
    define: { 'import.meta.url': '"file:///dwgdxf/dwgdxf.js"' },
    logLevel: 'warning',
  });
}

async function buildKernel() {
  const r = await esbuild.build({
    entryPoints: [path.join(root, 'src/kernel/worker-entry.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome100', 'firefox115', 'safari16'],
    // El glue de Emscripten solo usa node:* cuando corre en Node.
    external: ['node:*'],
    // En un IIFE no existe import.meta; el wasm se entrega como wasmBinary.
    define: { 'import.meta.url': '"file:///occt/replicad_single.js"' },
    minify: true,
    legalComments: 'eof',
    write: false,
    logLevel: 'warning',
  });
  const code = r.outputFiles[0].text;
  fs.writeFileSync(path.join(out, 'kernel.js'), `${banner}\nwindow.__PLANO3D_KERNEL_SRC__=${JSON.stringify(code)};\n`);
}

function buildWasm(wasmPath, outName, globalName) {
  const gz = zlib.gzipSync(fs.readFileSync(path.join(root, wasmPath)), { level: 9 });
  fs.writeFileSync(path.join(out, outName), `${banner}\nwindow.${globalName}="${gz.toString('base64')}";\n`);
}
const WASMS = [
  ['node_modules/replicad-opencascadejs/dist/replicad_single.wasm', 'occt-wasm.js', '__OCCT_WASM_GZ_B64__'],
  ['node_modules/dwgdxf/dist/wasm/dwgdxf_bg.wasm', 'dwg-wasm.js', '__DWG_WASM_GZ_B64__'],
];

// Versión de un solo archivo (--single): index.html con CSS y scripts incrustados, para
// compartir o abrir con doble clic sin la carpeta completa.
function buildSingle() {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  // "</script" dentro del JS cerraría la etiqueta; "<\/script" es equivalente en JS.
  const inlineJs = (f) => `<script>${read(f).replace(/<\/script/gi, '<\\/script')}</script>`;
  const swaps = [
    ['<link rel="stylesheet" href="css/app.css">', () => `<style>${read('css/app.css')}</style>`],
    ['<script src="build/occt-wasm.js"></script>', () => inlineJs('build/occt-wasm.js')],
    ['<script src="build/dwg-wasm.js"></script>', () => inlineJs('build/dwg-wasm.js')],
    ['<script src="build/kernel.js"></script>', () => inlineJs('build/kernel.js')],
    ['<script src="build/app.js"></script>', () => inlineJs('build/app.js')],
  ];
  let html = read('index.html');
  for (const [tag, content] of swaps) {
    if (html.split(tag).length !== 2) throw new Error(`index.html: no se encontró exactamente una vez ${tag}`);
    html = html.replace(tag, () => content());
  }
  const file = path.join(root, 'Simulador-Plano-3D.html');
  fs.writeFileSync(file, html);
  console.log(`Simulador-Plano-3D.html  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

const t0 = Date.now();
await Promise.all([buildApp(), buildKernel()]);
for (const [wasmPath, outName, globalName] of WASMS) {
  if (process.argv.includes('--wasm') || !fs.existsSync(path.join(out, outName))) buildWasm(wasmPath, outName, globalName);
}
for (const f of ['app.js', 'kernel.js', 'occt-wasm.js', 'dwg-wasm.js']) {
  const s = fs.statSync(path.join(out, f)).size;
  console.log(`build/${f}  ${(s / 1024).toFixed(0)} KB`);
}
if (process.argv.includes('--single')) buildSingle();
console.log(`listo en ${Date.now() - t0} ms`);
