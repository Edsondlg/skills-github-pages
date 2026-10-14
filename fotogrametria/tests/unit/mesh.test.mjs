import test from 'node:test';
import assert from 'node:assert/strict';
import { footprint2D, fillSmallHoles, meshStats } from '../../js/mesh/process.js';
import { boundaryLoops } from '../../js/analysis/features.js';

test('huella orientada: largo, ancho y giro de una pieza girada sobre el tapete', () => {
  for (const [deg, cx, cy] of [[12, 4, -6], [-80, -20, 15], [90, 0, 0]]) {
    const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180), P = [];
    let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 4000; i++) { const x = (rnd() - 0.5) * 140, y = (rnd() - 0.5) * 80; P.push(cx + c * x - s * y, cy + s * x + c * y, 5 * rnd()); }
    for (const [x, y] of [[-70, -40], [70, -40], [70, 40], [-70, 40]]) P.push(cx + c * x - s * y, cy + s * x + c * y, 0);
    const f = footprint2D(new Float32Array(P));
    const want = deg > 90 ? deg - 180 : deg <= -90 ? deg + 180 : deg;
    assert.ok(Math.abs(f.length - 140) < 1e-3 && Math.abs(f.width - 80) < 1e-3, `${deg}°: ${f.length} × ${f.width}`);
    assert.ok(Math.abs(f.angle - want) < 1e-3, `${deg}°: giro ${f.angle}`);
    assert.ok(Math.hypot(f.center[0] - cx, f.center[1] - cy) < 1e-3);
  }
});

test('relleno de grietas: cierra huecos pequeños y respeta barrenos reales', () => {
  // placa 40×40 (paso 0.5) con un hueco de 1 celda (grieta) y un barreno de Ø10
  const step = 0.5, n = 81, P = [], C = [], I = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { P.push(i * step - 20, j * step - 20, 0); C.push(200, 100, 50); }
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    const x = (i + 0.5) * step - 20, y = (j + 0.5) * step - 20;
    if (Math.hypot(x - 8, y - 8) < 5) continue;   // barreno
    if (i === 20 && j === 20) continue;             // grieta de 0.5 mm
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    I.push(a, b, d, a, d, c);
  }
  const mesh = { positions: new Float32Array(P), indices: new Uint32Array(I), colors: new Uint8Array(C) };
  assert.equal(boundaryLoops(n * n, mesh.indices, { minLength: 3 }).length, 3);
  const { mesh: out, filled } = fillSmallHoles(mesh, { maxWidth: 2.5, maxPerimeter: 7 });
  assert.equal(filled, 1);
  assert.equal(boundaryLoops(out.positions.length / 3, out.indices, { minLength: 3 }).length, 2, 'queda el contorno y el barreno');
  assert.equal(out.colors.length, out.positions.length, 'color promediado para el vértice nuevo');
  assert.deepEqual(Array.from(out.colors.slice(-3)), [200, 100, 50]);
  assert.ok(Math.abs(meshStats(out.positions, out.indices).area - (1600 - Math.PI * 25)) < 2);
});
