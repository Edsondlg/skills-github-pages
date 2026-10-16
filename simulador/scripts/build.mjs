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
    loader: { '.dxf': 'text', '.svg': 'text', '.png': 'dataurl', '.jpg': 'dataurl' },
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

function buildWasm() {
  const wasmPath = path.join(root, 'node_modules/replicad-opencascadejs/dist/replicad_single.wasm');
  const gz = zlib.gzipSync(fs.readFileSync(wasmPath), { level: 9 });
  fs.writeFileSync(path.join(out, 'occt-wasm.js'), `${banner}\nwindow.__OCCT_WASM_GZ_B64__="${gz.toString('base64')}";\n`);
}

const t0 = Date.now();
await Promise.all([buildApp(), buildKernel()]);
const wasmOut = path.join(out, 'occt-wasm.js');
if (process.argv.includes('--wasm') || !fs.existsSync(wasmOut)) buildWasm();
for (const f of ['app.js', 'kernel.js', 'occt-wasm.js']) {
  const s = fs.statSync(path.join(out, f)).size;
  console.log(`build/${f}  ${(s / 1024).toFixed(0)} KB`);
}
console.log(`listo en ${Date.now() - t0} ms`);
