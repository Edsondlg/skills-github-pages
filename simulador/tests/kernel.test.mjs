// Pruebas del núcleo CAD con OpenCascade real en Node.
import test from 'node:test';
import assert from 'node:assert/strict';
import { segAreaTerm } from '../src/geom2d/segments.js';
import * as K from '../src/kernel/core.js';

await K.init();

const PI = Math.PI;
const close = (a, b, rel = 1e-9, msg = '') =>
  assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${msg} ${a} ≠ ${b} (rel ${rel})`);

const L = (p0, p1) => ({ type: 'line', p0, p1 });
const poly = (pts) => ({ segs: pts.map((p, i) => L(p, pts[(i + 1) % pts.length])) });
const rect = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const circle = (c, r, ccw = true) => ({ segs: [{ type: 'circle', c, r, ccw }] });
const extrudeJob = (regions, thickness, extra = {}) => ({ mode: 'extrude', tol: 0.01, regions, extrude: { thickness, symmetric: false, fillets: {} , ...extra } });

// Placa 100×50 con esquina superior derecha R10 y agujero Ø20 (CCW como el exterior).
export function plateJob() {
  const outer = {
    segs: [
      L([0, 0], [100, 0]),
      L([100, 0], [100, 40]),
      { type: 'arc', c: [90, 40], r: 10, a0: 0, a1: PI / 2, ccw: true },
      L([90, 50], [0, 50]),
      L([0, 50], [0, 0]),
    ],
  };
  return extrudeJob([{ id: 'placa', outer, holes: [{ loop: circle([30, 25], 10, true), op: 'through' }] }], 3);
}

test('1. placa con esquina redondeada y agujero: volumen exacto y topología', () => {
  const r = K.build(plateJob());
  close(r.props.volume, 3 * (5000 - (100 - 25 * PI) - 100 * PI), 1e-9, 'volumen');
  assert.ok(r.props.area > 0);
  assert.equal(r.props.valid, true);
  assert.equal(r.props.closed, true);
  assert.equal(r.props.counts.solids, 1);
  assert.ok(r.topology.faces.some((f) => f.type === 'cylinder' && Math.abs(f.radius - 10) < 1e-9));
  assert.ok(r.topology.edges.some((e) => e.type === 'circle' && Math.abs(e.radius - 10) < 1e-9));
  const ids = new Set(r.topology.faces.map((f) => f.id));
  assert.ok(r.mesh.faceGroups.every((g) => ids.has(g.faceId)));
  assert.equal(r.mesh.faceGroups.length, r.topology.faces.length);
  const eids = new Set(r.topology.edges.map((e) => e.id));
  assert.ok(r.edges.edgeGroups.every((g) => eids.has(g.edgeId)));
  assert.ok(r.mesh.vertices instanceof Float32Array && r.mesh.triangles instanceof Uint32Array);
  assert.deepEqual(r.warnings, []);
});

test('1b. huecos ≤ tol se cierran; huecos mayores dan error en español con la región', () => {
  const gap = { segs: [L([0, 0], [10, 0]), L([10, 0.004], [10, 10]), L([10, 10], [0, 10]), L([0, 10], [0.003, 0])] };
  const r = K.build(extrudeJob([{ id: 'g', outer: gap, holes: [] }], 2));
  assert.ok(Math.abs(r.props.volume - 200) < 0.1);
  assert.equal(r.props.valid, true);
  const bad = { segs: [L([0, 0], [10, 0]), L([10, 0.5], [10, 10]), L([10, 10], [0, 10]), L([0, 10], [0, 0])] };
  assert.throws(() => K.build(extrudeJob([{ id: 'mala', outer: bad, holes: [] }], 2)), /Región «mala».*no cierra/);
});

test('2. caja 40×20×10: tensor de inercia en el centroide y momentos principales', () => {
  const r = K.build(extrudeJob([{ id: 1, outer: rect(0, 0, 40, 20), holes: [] }], 10));
  const V = 8000;
  const { inertia: I, principal, centroid } = r.props;
  close(r.props.volume, V);
  centroid.forEach((c, k) => close(c, [20, 10, 5][k], 1e-9, 'centroide'));
  close(I.Ixx, (V * (20 ** 2 + 10 ** 2)) / 12, 1e-9, 'Ixx');
  close(I.Iyy, (V * (40 ** 2 + 10 ** 2)) / 12, 1e-9, 'Iyy');
  close(I.Izz, (V * (40 ** 2 + 20 ** 2)) / 12, 1e-9, 'Izz');
  for (const p of [I.Pxy, I.Pxz, I.Pyz]) assert.ok(Math.abs(p) < 1e-6 * I.Izz);
  const exp = [I.Ixx, I.Iyy, I.Izz].sort((a, b) => a - b);
  principal.moments.forEach((m, k) => close(m, exp[k], 1e-9, 'principal'));
  assert.ok(principal.moments[0] <= principal.moments[1] && principal.moments[1] <= principal.moments[2]);
  r.props.bbox.size.forEach((s, k) => close(s, [40, 20, 10][k], 1e-9, 'bbox'));
});

test('2b. placa en L: producto de inercia Pxy ≠ 0 frente a cálculo compuesto', () => {
  const t = 5;
  const r = K.build(extrudeJob([{ id: 'L', outer: poly([[0, 0], [40, 0], [40, 10], [10, 10], [10, 40], [0, 40]]), holes: [] }], t));
  // Rectángulos: A = [0,40]×[0,10], B = [0,10]×[10,40]
  const parts = [{ a: 40, b: 10, c: [20, 5] }, { a: 10, b: 30, c: [5, 25] }].map((p) => ({ ...p, V: p.a * p.b * t }));
  const V = parts.reduce((s, p) => s + p.V, 0);
  const C = [0, 1].map((k) => parts.reduce((s, p) => s + p.V * p.c[k], 0) / V);
  let Ixx = 0, Iyy = 0, Izz = 0, Pxy = 0;
  for (const p of parts) {
    const dx = p.c[0] - C[0], dy = p.c[1] - C[1];
    Ixx += (p.V * (p.b ** 2 + t ** 2)) / 12 + p.V * dy * dy;
    Iyy += (p.V * (p.a ** 2 + t ** 2)) / 12 + p.V * dx * dx;
    Izz += (p.V * (p.a ** 2 + p.b ** 2)) / 12 + p.V * (dx * dx + dy * dy);
    Pxy += p.V * dx * dy;
  }
  const I = r.props.inertia;
  close(r.props.volume, V);
  close(r.props.centroid[0], C[0]);
  close(r.props.centroid[1], C[1]);
  close(I.Ixx, Ixx, 1e-9, 'Ixx');
  close(I.Iyy, Iyy, 1e-9, 'Iyy');
  close(I.Izz, Izz, 1e-9, 'Izz');
  assert.ok(Math.abs(Pxy) > 1);
  close(I.Pxy, Pxy, 1e-8, 'Pxy');
  assert.ok(Math.abs(I.Pxz) < 1e-6 * Izz && Math.abs(I.Pyz) < 1e-6 * Izz);
  // Los ejes principales diagonalizan el tensor
  const T = [[I.Ixx, -I.Pxy, -I.Pxz], [-I.Pxy, I.Iyy, -I.Pyz], [-I.Pxz, -I.Pyz, I.Izz]];
  r.props.principal.axes.forEach((ax, k) => {
    const Tv = T.map((row) => row[0] * ax[0] + row[1] * ax[1] + row[2] * ax[2]);
    Tv.forEach((v, j) => assert.ok(Math.abs(v - r.props.principal.moments[k] * ax[j]) < 1e-6 * Izz));
  });
});

test('3. revolución de arandela 360° y 90°; perfil que cruza el eje da error', () => {
  const job = (angleDeg, outer = rect(10, 0, 20, 30)) => ({
    mode: 'revolve', tol: 0.01, regions: [{ id: 'perfil', outer, holes: [] }],
    revolve: { axis: { p: [0, 0], d: [0, 1] }, angleDeg },
  });
  const full = K.build(job(360));
  close(full.props.volume, PI * (400 - 100) * 30, 1e-9, '360');
  assert.equal(full.props.valid, true);
  const quarter = K.build(job(90));
  close(quarter.props.volume, (PI * (400 - 100) * 30) / 4, 1e-9, '90');
  assert.throws(() => K.build(job(360, rect(-5, 0, 20, 30))), /cruza el eje/);
});

test('4. agujero ciego y agujero ignorado (op none)', () => {
  const mk = (op) => extrudeJob([{ id: 1, outer: rect(0, 0, 50, 50), holes: [{ loop: circle([25, 25], 5), op, depth: 4 }] }], 10);
  close(K.build(mk('blind')).props.volume, 25000 - 25 * PI * 4, 1e-9, 'ciego');
  close(K.build(mk('none')).props.volume, 25000, 1e-9, 'none');
  close(K.build(mk('through')).props.volume, 25000 - 25 * PI * 10, 1e-9, 'pasante');
});

test('5. dos regiones con alturas distintas se fusionan (resalte sobre placa)', () => {
  const r = K.build(extrudeJob([
    { id: 'placa', outer: rect(0, 0, 100, 60), holes: [] },
    { id: 'resalte', outer: circle([50, 30], 10), holes: [], height: 15, z0: 5 },
  ], 5));
  close(r.props.volume, 30000 + 100 * PI * 15, 1e-9);
  assert.equal(r.props.counts.solids, 1);
  assert.equal(r.props.valid, true);
  close(r.props.bbox.max[2], 20, 1e-9);
});

test('5b. redondeos: aristas verticales R2 en caja; borde superior y chaflán sin errores', () => {
  const box = () => extrudeJob([{ id: 1, outer: rect(0, 0, 40, 20), holes: [{ loop: circle([20, 10], 4), op: 'through' }] }], 10);
  const j = box();
  j.extrude.fillets = { vertical: 2, top: 0, chamferTop: 0 };
  const r = K.build(j);
  close(r.props.volume, 8000 - 10 * PI * 16 - 4 * (4 - PI) * 10, 1e-7, 'vertical');
  assert.deepEqual(r.warnings, []);
  const j2 = box();
  j2.extrude.fillets = { vertical: 2, top: 1, chamferTop: 0 };
  const r2 = K.build(j2);
  assert.deepEqual(r2.warnings, []);
  assert.ok(r2.props.volume < r.props.volume && r2.props.valid);
  // El agujero no se redondea: sigue habiendo un cilindro de radio 4 de altura completa
  assert.ok(r2.topology.faces.some((f) => f.type === 'cylinder' && Math.abs(f.radius - 4) < 1e-9 && Math.abs(f.area - 2 * PI * 4 * 10) < 1e-6));
  const j3 = box();
  j3.extrude.fillets = { vertical: 0, top: 0, chamferTop: 1 };
  const r3 = K.build(j3);
  assert.deepEqual(r3.warnings, []);
  // Chaflán 1×1 en el perímetro exterior (120 mm): se quitan 0,5 mm² por mm (esquinas: pirámides)
  assert.ok(r3.props.volume < 8000 - 160 * PI && r3.props.valid);
});

test('6. multivista: escuadra en L desde planta y alzado; tamaños discordantes avisan', () => {
  const Lfront = poly([[0, 0], [60, 0], [60, 10], [10, 10], [10, 40], [0, 40]]);
  const job = (front) => ({
    mode: 'multiview', tol: 0.01,
    multiview: { views: [
      { role: 'top', regions: [{ outer: rect(200, 300, 260, 340), holes: [] }] },
      { role: 'front', regions: [{ outer: front, holes: [] }] },
    ] },
  });
  const r = K.build(job(Lfront));
  close(r.props.volume, 900 * 40, 1e-9);
  assert.deepEqual(r.warnings, []);
  r.props.bbox.min.forEach((v) => assert.ok(Math.abs(v) < 1e-9));
  r.props.bbox.size.forEach((s, k) => close(s, [60, 40, 40][k], 1e-9));
  const bad = K.build(job(poly([[0, 0], [61, 0], [61, 10], [10, 10], [10, 40], [0, 40]])));
  assert.ok(bad.warnings.some((w) => /ancho/.test(w) && /0,5 %/.test(w)), bad.warnings.join('|'));
  // Vista lateral izquierda + derecha + planta: perfil en L visto desde un lado
  const side = K.build({ mode: 'multiview', tol: 0.01, multiview: { views: [
    { role: 'top', regions: [{ outer: rect(0, 0, 30, 60), holes: [] }] },
    { role: 'left', regions: [{ outer: poly([[0, 0], [60, 0], [60, 10], [10, 10], [10, 40], [0, 40]]), holes: [] }] },
  ] } });
  close(side.props.volume, 900 * 30, 1e-9);
  // En la vista izquierda u crece hacia −Y: la pata vertical (u ∈ [0,10]) queda en Y ∈ [50,60]
  close(side.props.centroid[1], (600 * 30 + 300 * 55) / 900, 1e-9);
});

// Integración exacta (Gauss-Legendre de 3 puntos) de ½∮(x dy − y dx) para curvas polinómicas por tramos.
const GL = [[-Math.sqrt(3 / 5), 5 / 9], [0, 8 / 9], [Math.sqrt(3 / 5), 5 / 9]];
function greenArea(f, df, spans) {
  let a = 0;
  for (const [u0, u1] of spans) {
    for (const [x, w] of GL) {
      const u = (u0 + u1) / 2 + ((u1 - u0) / 2) * x;
      const p = f(u), d = df(u);
      a += (w * (u1 - u0) / 2) * (p[0] * d[1] - p[1] * d[0]);
    }
  }
  return a / 2;
}
function deBoor(ctrl, knots, deg, u) {
  let k = deg;
  while (k < ctrl.length - 1 && knots[k + 1] <= u) k++;
  const d = [];
  for (let j = 0; j <= deg; j++) d.push(ctrl[j + k - deg].slice());
  for (let r = 1; r <= deg; r++) for (let j = deg; j >= r; j--) {
    const i = j + k - deg, a = (u - knots[i]) / (knots[i + deg - r + 1] - knots[i]);
    d[j] = [(1 - a) * d[j - 1][0] + a * d[j][0], (1 - a) * d[j - 1][1] + a * d[j][1]];
  }
  return d[deg];
}

test('7. elipse, Bézier y spline: caras válidas con área analítica', () => {
  const area = (loop) => {
    const r = K.build(extrudeJob([{ id: 'c', outer: loop, holes: [] }], 1));
    assert.equal(r.props.valid, true);
    return r.props.volume;
  };
  // Elipse completa (rx ≥ ry) y con rx < ry rotada
  close(area({ segs: [{ type: 'ellipse', c: [3, 4], rx: 20, ry: 10, rot: 0, t0: 0, t1: 2 * PI, ccw: true }] }), 200 * PI, 1e-9, 'elipse');
  close(area({ segs: [{ type: 'ellipse', c: [0, 0], rx: 5, ry: 15, rot: 0.3, t0: 0, t1: 2 * PI, ccw: false }] }), 75 * PI, 1e-9, 'elipse rx<ry');
  // Media elipse (rx < ry, rotada) cerrada con una línea, en ambos sentidos
  const e = { type: 'ellipse', c: [1, 2], rx: 5, ry: 15, rot: 0.3, t0: 0, t1: PI, ccw: true };
  const P = (t) => [1 + Math.cos(0.3) * 5 * Math.cos(t) - Math.sin(0.3) * 15 * Math.sin(t), 2 + Math.sin(0.3) * 5 * Math.cos(t) + Math.cos(0.3) * 15 * Math.sin(t)];
  close(area({ segs: [e, L(P(PI), P(0))] }), 37.5 * PI, 1e-9, 'media elipse ccw');
  close(area({ segs: [{ ...e, t0: PI, t1: 0, ccw: false }, L(P(0), P(PI))] }), 37.5 * PI, 1e-9, 'media elipse cw');
  // Media elipse parcial con t0 ≠ 0 en sentido horario: arco de π/2 a −π/2 pasando por 0... (barrido π)
  close(area({ segs: [{ ...e, t0: PI / 2, t1: -PI / 2, ccw: false }, L(P(-PI / 2), P(PI / 2))] }), 37.5 * PI, 1e-9, 'media elipse girada');
  // Bézier cúbica cerrada con una línea
  const bp = [[0, 0], [10, 20], [30, 20], [40, 0]];
  const bez = (t) => { const m = 1 - t; return [0, 1].map((k) => m ** 3 * bp[0][k] + 3 * m * m * t * bp[1][k] + 3 * m * t * t * bp[2][k] + t ** 3 * bp[3][k]); };
  const dbez = (t) => { const m = 1 - t; return [0, 1].map((k) => 3 * m * m * (bp[1][k] - bp[0][k]) + 6 * m * t * (bp[2][k] - bp[1][k]) + 3 * t * t * (bp[3][k] - bp[2][k])); };
  close(area({ segs: [{ type: 'bezier', pts: bp }, L([40, 0], [0, 0])] }), Math.abs(greenArea(bez, dbez, [[0, 1]])), 1e-9, 'bezier');
  // Spline racional: círculo NURBS cuadrático r = 10; se aproxima con tolerancia 1e-5 mm ⇒ |ΔA| ≤ 1e-5·perímetro
  const w = Math.SQRT1_2;
  const ctrl = [[15, 5], [15, 15], [5, 15], [-5, 15], [-5, 5], [-5, -5], [5, -5], [15, -5], [15, 5]];
  const aN = area({ segs: [{ type: 'spline', degree: 2, ctrl, knots: [0, 0, 0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1, 1, 1], weights: [1, w, 1, w, 1, w, 1, w, 1] }] });
  assert.ok(Math.abs(aN - 100 * PI) <= 1e-5 * 20 * PI, `nurbs círculo ${aN}`);
  // Spline cúbica no racional (curva exacta) cerrada con una línea. La integración de Gauss de OCCT
  // sobre bordes B-spline no es exacta en esta compilación (error observado ≈ 4e-6 relativo): tolerancia 1e-5.
  const sc = [[0, 0], [10, 25], [25, 30], [40, 10], [50, 0]];
  const kn = [0, 0, 0, 0, 0.5, 1, 1, 1, 1];
  const f = (u) => deBoor(sc, kn, 3, Math.min(u, 1 - 1e-15));
  const h = 1e-6;
  const df = (u) => { const a = f(u - h), b = f(u + h); return [(b[0] - a[0]) / (2 * h), (b[1] - a[1]) / (2 * h)]; };
  close(area({ segs: [{ type: 'spline', degree: 3, ctrl: sc, knots: kn, weights: null }, L([50, 0], [0, 0])] }), Math.abs(greenArea(f, df, [[0, 0.5], [0.5, 1]])), 1e-5, 'spline');
});

test('7b. spline cerrada (leva): volumen = área 2D exacta (integración por tramos)', () => {
  // Spline cúbica cerrada no racional con 9 tramos; la Gauss por defecto de OCCT daba ~3e-4 de error.
  const ctrl = [[0, -1.6], [1.4, -1.5], [2.1, -0.4], [2.2, 1], [1.4, 2.1], [0.2, 2.6], [-1, 2.2], [-1.9, 1.2], [-2, -0.2], [-1.6, -1.3], [-0.8, -1.7], [0, -1.6]];
  const spline = { type: 'spline', degree: 3, ctrl, knots: [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9], weights: null };
  const r = K.build(extrudeJob([{ id: 'leva', outer: { segs: [spline] }, holes: [] }], 1));
  assert.equal(r.props.valid, true);
  close(r.props.volume, Math.abs(segAreaTerm(spline)), 1e-8, 'volumen spline');
});

test('3b. revolución con chaflán: cara cónica con eje, radios y semiángulo', () => {
  const outer = { segs: [L([10, 0], [20, 0]), L([20, 0], [20, 25]), L([20, 25], [15, 30]), L([15, 30], [10, 30]), L([10, 30], [10, 0])] };
  const r = K.build({ mode: 'revolve', tol: 0.01, regions: [{ id: 1, outer, holes: [] }], revolve: { axis: { p: [0, 0], d: [0, 1] }, angleDeg: 360 } });
  const A = 300 - 12.5, xc = (300 * 15 - 12.5 * (20 - 5 / 3)) / A;
  close(r.props.volume, 2 * PI * xc * A, 1e-9, 'Pappus');
  const cone = r.topology.faces.find((f) => f.type === 'cone');
  assert.ok(cone, 'cara cónica');
  close(cone.semiAngleDeg, 45, 1e-9, 'semiángulo');
  assert.deepEqual([cone.radius, cone.radius2].map((x) => Math.round(x * 1e9) / 1e9).sort(), [15, 20]);
  assert.ok(Math.abs(Math.abs(cone.axis.d[1]) - 1) < 1e-12, 'eje Y');
});

test('8. distancias exactas: caras paralelas de placa t=3 y vértice–punto', () => {
  const r = K.build(plateJob());
  const planes = r.topology.faces.filter((f) => f.type === 'plane' && Math.abs(Math.abs(f.normal[2]) - 1) < 1e-12);
  const top = planes.find((f) => f.center[2] > 2.9), bot = planes.find((f) => f.center[2] < 0.1);
  const d = K.distance({ kind: 'face', id: top.id }, { kind: 'face', id: bot.id });
  close(d.distance, 3, 1e-9);
  const v = r.topology.vertices[0];
  const q = [v.p[0] + 3, v.p[1] + 4, v.p[2] + 12];
  const dv = K.distance({ kind: 'vertex', id: v.id }, { kind: 'point', p: q });
  close(dv.distance, 13, 1e-9);
  dv.p2.forEach((c, k) => close(c, q[k], 1e-9));
  const de = K.distance({ kind: 'edge', id: r.topology.edges.find((e) => e.type === 'circle' && Math.abs(e.center[0] - 30) < 1e-9 && Math.abs(e.center[1] - 25) < 1e-9).id }, { kind: 'point', p: [30, 25, 100] });
  assert.ok(de.distance > 97 - 1e-9 && de.distance < 101);
  assert.throws(() => K.distance({ kind: 'face', id: -1 }, { kind: 'point', p: [0, 0, 0] }), /No existe/);
});

test('9. exportación STEP/STL y formato de aristas', async () => {
  const r = K.build(plateJob());
  assert.equal(r.edges.positions.length % 6, 0);
  assert.ok(r.edges.edgeGroups.every((g) => g.count % 2 === 0));
  const total = r.edges.edgeGroups.reduce((s, g) => s + g.count, 0);
  assert.equal(total * 3, r.edges.positions.length);
  const step = K.exportShape({ format: 'step', name: 'placa' });
  assert.equal(typeof step.data, 'string');
  assert.equal(step.ext, 'step');
  assert.match(step.data, /MILLI/);
  assert.match(step.data, /ADVANCED_FACE/);
  const stl = K.exportShape({ format: 'stl', tolerance: 0.01, angularTolerance: 0.1 });
  assert.ok(stl.data instanceof ArrayBuffer);
  const n = new DataView(stl.data).getUint32(80, true);
  assert.ok(n > 0);
  assert.equal(stl.data.byteLength, 84 + 50 * n);
  const asc = K.exportShape({ format: 'stl-ascii' });
  assert.match(asc.data, /^solid/);
  const t = K.tessellate({ tolerance: 0.05, angularTolerance: 0.3 });
  assert.equal(t.triangles.length % 3, 0);
  assert.equal(t.vertices.length, t.normals.length);
  const viaHandle = await K.handle({ type: 'distance', payload: { a: { kind: 'point', p: [0, 0, 10] }, b: { kind: 'point', p: [0, 0, 0] } } });
  close(viaHandle.distance, 10);
  await assert.rejects(K.handle({ type: 'nada' }), /desconocido/);
});
