// Prueba de resistencia: reconstrucciones repetidas (auto-actualización) sin crecimiento del heap wasm.
// Se mide memory.buffer del módulo tras 30 builds de calentamiento, con GC forzado y vueltas del
// bucle de eventos. Antes de las correcciones crecía ~1,1 MB por build (~300 MB en 270 builds).
// Umbral 8 MB: el heap crece por escalones (~27–36 MB cada uno), así que < 8 MB significa «ningún
// escalón» y detecta cualquier fuga ≳ 30 KB por build sostenida.
// Excepción conocida: BRepFilletAPI_MakeFillet (OCCT) retiene ~100 KB por llamada aunque se
// liberen el constructor, la entrada y el resultado (probado: Reset, BRepTools.Clean, borrar en
// distinto orden); 270 builds con redondeos suman ~27 MB = un escalón. Para ese caso el umbral es
// 40 MB (≤ 1 escalón, ≈ 150 KB/build), que sigue detectando la fuga anterior de ~1,1 MB/build.
import test from 'node:test';
import assert from 'node:assert/strict';
import v8 from 'node:v8';
import vm from 'node:vm';
import { getOC } from 'replicad';

const K = await import(process.env.KERNEL_SOAK_MODULE || '../src/kernel/core.js');
await K.init();

const N = 300, WARMUP = 30;
const L = (p0, p1) => ({ type: 'line', p0, p1 });
// GC forzado y una vuelta del bucle de eventos (como entre mensajes del worker) para que los
// finalizadores de los envoltorios de replicad liberen su memoria wasm.
v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc');
const settle = async () => { gc(); await new Promise((r) => setImmediate(r)); };
const heapMB = () => getOC().wasmMemory.buffer.byteLength / 2 ** 20;
// Malla gruesa: la prueba mide fugas, no calidad de malla, y así cabe en el tiempo de la suite.
const MESH = { tolerance: 0.05, angularTolerance: 0.5 };

async function soak(job) {
  let base = 0;
  for (let i = 0; i < N; i++) {
    K.build(job);
    if (i % 10 === 9) await settle();
    if (i === WARMUP - 1) base = heapMB();
  }
  await settle();
  return heapMB() - base;
}

test('soak: placa con 16 agujeros y redondeos verticales R2, 300 reconstrucciones', async () => {
  const holes = [];
  for (let i = 0; i < 16; i++) holes.push({ loop: { segs: [{ type: 'circle', c: [8 + (i % 4) * 8, 6 + Math.floor(i / 4) * 6], r: 1.5, ccw: true }] }, op: 'through' });
  const outer = { segs: [L([0, 0], [40, 0]), L([40, 0], [40, 30]), L([40, 30], [0, 30]), L([0, 30], [0, 0])] };
  const growth = await soak({ mesh: MESH, mode: 'extrude', tol: 0.01, regions: [{ id: 'placa', outer, holes }], extrude: { thickness: 3, symmetric: false, fillets: { vertical: 2, top: 0, chamferTop: 0 } } });
  console.log(`placa con redondeos: +${growth.toFixed(1)} MB en ${N - WARMUP} builds`);
  assert.ok(growth < 40, `el heap wasm creció ${growth.toFixed(1)} MB en ${N - WARMUP} reconstrucciones`);
});

test('soak: leva (spline cerrada), 300 reconstrucciones', async () => {
  const ctrl = [[0, -1.6], [1.4, -1.5], [2.1, -0.4], [2.2, 1], [1.4, 2.1], [0.2, 2.6], [-1, 2.2], [-1.9, 1.2], [-2, -0.2], [-1.6, -1.3], [-0.8, -1.7], [0, -1.6]];
  const spline = { type: 'spline', degree: 3, ctrl, knots: [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9], weights: null };
  const growth = await soak({ mesh: MESH, mode: 'extrude', tol: 0.01, regions: [{ id: 'leva', outer: { segs: [spline] }, holes: [] }], extrude: { thickness: 1, symmetric: false, fillets: {} } });
  console.log(`leva: +${growth.toFixed(1)} MB en ${N - WARMUP} builds`);
  assert.ok(growth < 8, `el heap wasm creció ${growth.toFixed(1)} MB en ${N - WARMUP} reconstrucciones`);
});
