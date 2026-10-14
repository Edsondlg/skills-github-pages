import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHoles, boundaryLoops } from '../../js/analysis/features.js';

// Placa triangulada (rejilla) con barrenos circulares, inclinada en el espacio.
function plateWithHoles(holes, { size = 60, step = 0.25, tilt = 0.3 } = {}) {
  const n = Math.round(size / step) + 1;
  const P = [], I = [];
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = i * step - size / 2, y = j * step - size / 2;
    P.push(x, y * ct, y * st + 10);
  }
  const inside = (x, y) => holes.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r);
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    const x = (i + 0.5) * step - size / 2, y = (j + 0.5) * step - size / 2;
    if (inside(x, y)) continue;
    I.push(a, b, d, a, d, c);
  }
  return { positions: new Float32Array(P), indices: new Uint32Array(I) };
}

test('detecta barrenos circulares y su diámetro', () => {
  const holes = [[-12, 5, 5], [14, -8, 3.25]];
  const m = plateWithHoles(holes);
  const loops = boundaryLoops(m.positions.length / 3, m.indices);
  assert.equal(loops.length, 3, 'contorno exterior + 2 barrenos');
  const det = detectHoles(m.positions, m.indices);
  const circ = det.filter(d => d.type === 'circular');
  console.log('  ', circ.map(c => `Ø${c.diameter.toFixed(3)} rms ${c.fitRms.toFixed(3)}`).join(' · '));
  assert.equal(circ.length, 2);
  const ds = circ.map(c => c.diameter).sort((a, b) => b - a);
  assert.ok(Math.abs(ds[0] - 10) < 0.35 && Math.abs(ds[1] - 6.5) < 0.35);
  // normal perpendicular a la placa inclinada
  const nz = Math.abs(circ[0].normal[2]), ny = Math.abs(circ[0].normal[1]);
  assert.ok(Math.abs(nz - Math.cos(0.3)) < 0.02 && Math.abs(ny - Math.sin(0.3)) < 0.02);
});

// Barreno en lámina apoyada tal como sale de la fusión: la arista superior redondeada hacia fuera,
// la pared inclinada hacia dentro y el borde abierto al pie (corte de la mesa en z = zCut).
function blurredHoleOnTable({ r = 5, t = 2, blur = 0.9, zCut = 0.5, cx = 12, cy = -7, outer = 14 } = {}) {
  const prof = (rho) => t / (1 + Math.exp(-(rho - r) / (blur / 2.5))); // escalón suavizado, 50 % en rho = r
  let lo = r - 4 * blur, hi = r;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (prof(m) < zCut) lo = m; else hi = m; }
  const rho0 = hi, nr = 90, na = 120, P = [], I = [];
  for (let k = 0; k <= nr; k++) {
    const rho = rho0 + (outer - rho0) * Math.pow(k / nr, 1.6);
    for (let j = 0; j < na; j++) { const a = 2 * Math.PI * j / na; P.push(cx + rho * Math.cos(a), cy + rho * Math.sin(a), prof(rho)); }
  }
  for (let k = 0; k < nr; k++) for (let j = 0; j < na; j++) {
    const a = k * na + j, b = k * na + (j + 1) % na, c = a + na, d = b + na;
    I.push(a, c, d, a, d, b);
  }
  return { positions: new Float32Array(P), indices: new Uint32Array(I), edgeR: rho0 };
}

test('barreno en lámina: diámetro a media pared, no en el pie redondeado', () => {
  const m = blurredHoleOnTable();
  const edge = detectHoles(m.positions, m.indices, { thickness: 2 }).find(d => d.type === 'circular');
  assert.ok(edge, 'barreno detectado');
  console.log(`   pie del borde Ø${edge.edgeDiameter.toFixed(3)} -> media pared Ø${edge.diameter.toFixed(3)} (real Ø10), centro ${edge.center.map(v => v.toFixed(2)).join(', ')}`);
  assert.ok(Math.abs(edge.edgeDiameter - 2 * m.edgeR) < 0.05, 'el lazo está al pie de la pared');
  assert.ok(Math.abs(edge.diameter - 10) < 0.1, `Ø medido ${edge.diameter}`);
  assert.ok(Math.hypot(edge.center[0] - 12, edge.center[1] + 7) < 0.05 && Math.abs(edge.center[2] - 1) < 0.05, 'centro a media pared');
  assert.ok(edge.normal[2] > 0.99, 'eje hacia la cara superior');
  // una placa sin pared (barreno medido en su arista) conserva el ajuste del borde
  const flat = detectHoles(plateWithHoles([[0, 0, 4]]).positions, plateWithHoles([[0, 0, 4]]).indices, { thickness: 2 }).find(d => d.type === 'circular');
  assert.equal(flat.section, null);
  assert.ok(Math.abs(flat.diameter - 8) < 0.35);
});

test('ranura alargada y contorno exterior con vértice en «moño»', () => {
  // placa 60×60 (paso 0.25) con barreno Ø10, ranura oblonga 24×8 y una muesca diagonal en el borde
  // exterior que deja un vértice compartido por dos tramos del contorno
  const step = 0.25, size = 60, n = Math.round(size / step) + 1, P = [], I = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) P.push(i * step - size / 2, j * step - size / 2, 0);
  const slot = (x, y) => { const dx = Math.max(0, Math.abs(x - 8) - 8); return Math.hypot(dx, y + 12) < 4; };
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    const x = (i + 0.5) * step - size / 2, y = (j + 0.5) * step - size / 2;
    if (Math.hypot(x + 14, y - 10) < 5 || slot(x, y)) continue;
    if ((i === 100 && j === 0) || (i === 101 && j === 1)) continue; // muesca en moño
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    I.push(a, b, d, a, d, c);
  }
  const det = detectHoles(new Float32Array(P), new Uint32Array(I), { thickness: 2 });
  const circ = det.filter(d => d.type === 'circular'), open = det.filter(d => d.type === 'abertura');
  console.log('  ', det.map(d => d.type === 'circular' ? `Ø${d.diameter.toFixed(2)}` : `${d.size[0].toFixed(2)}×${d.size[1].toFixed(2)}`).join(' · '));
  assert.equal(circ.length, 1);
  assert.ok(Math.abs(circ[0].diameter - 10) < 0.35);
  assert.equal(open.length, 1, 'la ranura se reporta (el contorno exterior no se confunde con ella)');
  assert.ok(Math.abs(open[0].size[0] - 24) < 0.6 && Math.abs(open[0].size[1] - 8) < 0.6, `ranura ${open[0].size}`);
  assert.ok(Math.hypot(open[0].center[0] - 8, open[0].center[1] + 12) < 0.3);
});
