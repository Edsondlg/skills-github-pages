// Prueba e2e del motor CAD en Chromium abriendo la página con file:// (como doble clic).
// Requiere `npm run build` previo. Uso: node tests/browser/kernel.e2e.mjs
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dev = path.join(root, 'dev/build');
fs.mkdirSync(dev, { recursive: true });

const entry = `
import { KernelClient } from '../../src/kernel/client.js';
const L = (p0, p1) => ({ type: 'line', p0, p1 });
window.runKernelTest = async () => {
  const k = new KernelClient();
  const status = [];
  await k.start({ onStatus: (s) => status.push(s) });
  const outer = { segs: [L([0,0],[100,0]), L([100,0],[100,40]),
    { type: 'arc', c: [90,40], r: 10, a0: 0, a1: Math.PI / 2, ccw: true }, L([90,50],[0,50]), L([0,50],[0,0])] };
  const hole = { segs: [{ type: 'circle', c: [30,25], r: 10, ccw: true }] };
  const r = await k.build({ mode: 'extrude', tol: 0.01, regions: [{ id: 'placa', outer, holes: [{ loop: hole, op: 'through' }] }],
    extrude: { thickness: 3, symmetric: false, fillets: { vertical: 0, top: 0, chamferTop: 0 } } });
  const top = r.topology.faces.filter((f) => f.type === 'plane' && f.normal && Math.abs(f.normal[2]) > 0.99);
  const d = await k.distance({ kind: 'face', id: top[0].id }, { kind: 'face', id: top[1].id });
  const step = await k.exportShape({ format: 'step', name: 'placa' });
  const stl = await k.exportShape({ format: 'stl', tolerance: 0.01, angularTolerance: 0.1 });
  return { mode: k.mode, status, volume: r.props.volume, typed: r.mesh.vertices instanceof Float32Array,
    dist: d.distance, stepHasMilli: String(step.data).includes('MILLI'), stlBytes: stl.data.byteLength || stl.data.length };
};
// Carreras: llamada antes de que start() termine; worker caído o terminado (sin cuelgues).
window.runRaceTest = async () => {
  const job = { mode: 'extrude', tol: 0.01, regions: [{ id: 'c', outer: { segs: [L([0,0],[10,0]), L([10,0],[10,10]), L([10,10],[0,10]), L([0,10],[0,0])] }, holes: [] }],
    extrude: { thickness: 2, symmetric: false, fillets: {} } };
  const msg = (p) => p.then(() => 'resuelta', (e) => e.message);
  const a = new KernelClient();
  const starting = a.start();
  const early = a.build(job);
  await starting;
  const vEarly = (await early).props.volume;
  const pending = msg(a.build(job));
  a._worker.dispatchEvent(new ErrorEvent('error', { message: 'fallo simulado' }));
  const crashed = [await pending, await msg(a.build(job))];
  const b = new KernelClient();
  await b.start();
  const pendingB = msg(b.build(job));
  b.dispose();
  const terminated = [await pendingB, await msg(b.build(job))];
  return { mode: a.mode, vEarly, crashed, terminated };
};
`;
fs.writeFileSync(path.join(dev, 'kernel-e2e-entry.js'), entry);
await esbuild.build({ entryPoints: [path.join(dev, 'kernel-e2e-entry.js')], outfile: path.join(dev, 'kernel-e2e.js'),
  bundle: true, format: 'iife', platform: 'browser', logLevel: 'warning' });
const page = (sabotage) => `<!doctype html><meta charset="utf-8">
<script>${sabotage ? 'window.Worker = function () { throw new Error("sin workers"); };' : ''}</script>
<script src="../../build/occt-wasm.js"></script><script src="../../build/kernel.js"></script><script src="kernel-e2e.js"></script>`;
fs.writeFileSync(path.join(dev, 'kernel-e2e.html'), page(false));
fs.writeFileSync(path.join(dev, 'kernel-e2e-main.html'), page(true));

const expected = 3 * (5000 - (100 - 25 * Math.PI) - 100 * Math.PI);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let failed = false;
for (const [file, mode] of [['kernel-e2e.html', 'worker'], ['kernel-e2e-main.html', 'main']]) {
  const p = await browser.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const t0 = Date.now();
  await p.goto('file://' + path.join(dev, file));
  const r = await p.evaluate(() => window.runKernelTest());
  const ok = r.mode === mode && Math.abs(r.volume - expected) / expected < 1e-9 && r.typed &&
    Math.abs(r.dist - 3) < 1e-9 && r.stepHasMilli && r.stlBytes > 84 && errors.length === 0;
  console.log(`${file}: modo=${r.mode} volumen=${r.volume} dist=${r.dist} stl=${r.stlBytes}B ${Date.now() - t0}ms ${ok ? 'OK' : 'FALLA'}`, errors);
  if (!ok) failed = true;
  if (mode === 'worker') {
    const q = await p.evaluate(() => window.runRaceTest());
    const died = /^El motor CAD se detuvo inesperadamente \(fallo simulado\)/;
    const rok = Math.abs(q.vEarly - 200) < 1e-9 && q.crashed.every((m) => died.test(m)) && q.terminated.every((m) => m === 'Motor CAD cerrado.');
    console.log(`carreras: ${JSON.stringify(q)} ${rok ? 'OK' : 'FALLA'}`);
    if (!rok) failed = true;
  }
  await p.close();
}
await browser.close();
if (failed) process.exit(1);
console.log('E2E OK');
