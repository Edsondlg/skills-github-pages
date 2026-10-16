// Pruebas de geometría 2D exacta (C1 segments.js, C2 loops.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  segStart, segEnd, segPointAt, segReverse, segLength, segBBox, segTessellate, segAreaTerm,
  segMomentTerms, segTransform, isClosedSegment, segClosestPoint, segSnapPoints, segSweep,
} from '../src/geom2d/segments.js';
import { segInvalidReason } from '../src/geom2d/segments.js';
import { buildLoops, loopInfo, orientLoop, pointInPolygon, buildRegions, bboxOfSegments } from '../src/geom2d/loops.js';
// Tiempo de CPU del proceso (ms): no depende de la carga de otros procesos, a diferencia del reloj.
const cpuMs = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };

const PI = Math.PI;
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b} (|Δ|=${Math.abs(a - b)})`);
const nearP = (p, q, tol, msg) => {
  near(p[0], q[0], tol, msg);
  near(p[1], q[1], tol, msg);
};
const L = (p0, p1, meta) => ({ type: 'line', p0, p1, ...(meta ? { meta } : {}) });
const sumArea = (segs) => segs.reduce((a, s) => a + segAreaTerm(s), 0);
const polyArea = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  return a / 2;
};
// Muestras densas por parámetro (incluye extremos).
const sample = (s, n) => Array.from({ length: n + 1 }, (_, i) => segPointAt(s, i / n));

// Rectángulo 100×50 con esquina superior derecha redondeada R10 (ccw).
const plate = () => [
  L([0, 0], [100, 0]),
  L([100, 0], [100, 40]),
  { type: 'arc', c: [90, 40], r: 10, a0: 0, a1: PI / 2, ccw: true },
  L([90, 50], [0, 50]),
  L([0, 50], [0, 0]),
];

test('1. placa con esquina R10 y agujero Ø20: área, perímetro y centroide exactos', () => {
  const hole = { type: 'circle', c: [30, 25], r: 10, ccw: true };
  const { loops, open } = buildLoops([...plate(), hole]);
  assert.equal(loops.length, 2);
  assert.equal(open.length, 0);
  const { regions } = buildRegions(loops);
  assert.equal(regions.length, 1);
  const outer = loopInfo(loops[regions[0].outer]);
  const h = loopInfo(loops[regions[0].holes[0]]);
  const net = outer.area - h.area;
  const expect = 5000 - (100 - 25 * PI) - 100 * PI;
  assert.ok(rel(net, expect) <= 1e-9, `área ${net} vs ${expect}`);
  assert.ok(rel(outer.perimeter, 280 + 5 * PI) <= 1e-12);
  assert.ok(rel(h.perimeter, 20 * PI) <= 1e-12);
  assert.deepEqual(h.circle, { c: [30, 25], r: 10 });
  assert.equal(outer.circle, null);
  // Centroide compuesto: rectángulo − (cuadrado 10×10 − cuarto de círculo) − agujero.
  const qx = 90 + 40 / (3 * PI), qy = 40 + 40 / (3 * PI);
  const parts = [[5000, 50, 25], [-100, 95, 45], [25 * PI, qx, qy]];
  const Ao = parts.reduce((a, p) => a + p[0], 0);
  const cx = parts.reduce((a, p) => a + p[0] * p[1], 0) / Ao, cy = parts.reduce((a, p) => a + p[0] * p[2], 0) / Ao;
  nearP(outer.centroid, [cx, cy], 1e-10, 'centroide contorno');
  const An = Ao - 100 * PI;
  const gx = (Ao * outer.centroid[0] - 100 * PI * h.centroid[0]) / An;
  const gy = (Ao * outer.centroid[1] - 100 * PI * h.centroid[1]) / An;
  nearP([gx, gy], [(Ao * cx - 100 * PI * 30) / An, (Ao * cy - 100 * PI * 25) / An], 1e-10, 'centroide neto');
  assert.ok(rel(An, expect) <= 1e-12);
});

test('2. orientación de arcos, segReverse y barrido de vuelta completa', () => {
  const a = { type: 'arc', c: [1, 2], r: 3, a0: 0, a1: PI / 2, ccw: true, meta: { layer: 'X' } };
  const b = { type: 'arc', c: [1, 2], r: 3, a0: PI / 2, a1: 0, ccw: false };
  nearP(segStart(a), segEnd(b), 1e-15);
  nearP(segEnd(a), segStart(b), 1e-15);
  nearP(segPointAt(a, 0.25), segPointAt(b, 0.75), 1e-14);
  near(segAreaTerm(a), -segAreaTerm(b), 1e-14);
  near(segSweep(a), PI / 2, 0);
  const r = segReverse(a);
  assert.equal(r.meta, a.meta, 'meta por referencia');
  assert.deepEqual(segReverse(r), a);
  nearP(segPointAt(r, 0.3), segPointAt(b, 0.3), 1e-14);
  assert.equal(segSweep({ type: 'arc', c: [0, 0], r: 1, a0: 0, a1: 2 * PI, ccw: true }), 2 * PI);
  assert.equal(segSweep({ type: 'arc', c: [0, 0], r: 1, a0: 0.3, a1: 0.3, ccw: false }), 2 * PI);
  // 10°→370° en grados convertidos: vuelta completa a pesar del redondeo.
  assert.equal(segSweep({ type: 'arc', c: [0, 0], r: 1, a0: (10 * PI) / 180, a1: (370 * PI) / 180, ccw: true }), 2 * PI);
  const tiny = segSweep({ type: 'arc', c: [0, 0], r: 1, a0: 1, a1: 1 + 1e-9, ccw: true });
  assert.ok(rel(tiny, 1e-9) <= 1e-6, `${tiny}`);
  assert.ok(isClosedSegment({ type: 'arc', c: [0, 0], r: 1, a0: 1, a1: 1 + 2 * PI, ccw: true }));
  // Momentos cerrados de arco = mismos por cuadratura (elipse de radios iguales).
  const e = { type: 'ellipse', c: [1, 2], rx: 3, ry: 3, rot: 0, t0: 0.2, t1: 2.5, ccw: false };
  const ar = { type: 'arc', c: [1, 2], r: 3, a0: 0.2, a1: 2.5, ccw: false };
  const me = segMomentTerms(e), ma = segMomentTerms(ar);
  for (const k of ['A', 'Sx', 'Sy']) assert.ok(rel(ma[k], me[k]) <= 1e-12, k);
});

test('3. elipse: área completa, longitud de arco y caja rotada exactas', () => {
  const full = { type: 'ellipse', c: [3, -1], rx: 5, ry: 2, rot: 0.7, t0: 0, t1: 2 * PI, ccw: true };
  assert.ok(isClosedSegment(full));
  assert.ok(rel(segAreaTerm(full), 10 * PI) <= 1e-14);
  const lp = loopInfo({ segs: [full] });
  nearP(lp.centroid, [3, -1], 1e-12);
  const arc = { type: 'ellipse', c: [0, 0], rx: 4, ry: 1, rot: 0.3, t0: 0.1, t1: 2.2, ccw: true };
  const pts = sample(arc, 200000);
  let pl = 0;
  for (let i = 1; i < pts.length; i++) pl += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  assert.ok(rel(segLength(arc), pl) <= 1e-9, `${segLength(arc)} vs ${pl}`);
  // Caja de la elipse completa rotada: semiancho √(a²cos²θ + b²sin²θ).
  const bb = segBBox(full), c = Math.cos(0.7), s = Math.sin(0.7);
  const hx = Math.sqrt(25 * c * c + 4 * s * s), hy = Math.sqrt(25 * s * s + 4 * c * c);
  near(bb.minX, 3 - hx, 1e-13);
  near(bb.maxX, 3 + hx, 1e-13);
  near(bb.minY, -1 - hy, 1e-13);
  near(bb.maxY, -1 + hy, 1e-13);
  // Caja del arco contra muestreo denso.
  const b2 = segBBox(arc);
  const sb = bboxOfSegments([]) ?? { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const [x, y] of pts) {
    sb.minX = Math.min(sb.minX, x);
    sb.maxX = Math.max(sb.maxX, x);
    sb.minY = Math.min(sb.minY, y);
    sb.maxY = Math.max(sb.maxY, y);
  }
  for (const k of ['minX', 'maxX', 'minY', 'maxY']) near(b2[k], sb[k], 1e-8, k);
  assert.ok(b2.minX <= sb.minX && b2.minY <= sb.minY && b2.maxX >= sb.maxX && b2.maxY >= sb.maxY);
});

test('4. contorno de Béziers cúbicas: área contra polígono de 100k puntos', () => {
  const k = 0.5522847498;
  const bz = [
    { type: 'bezier', pts: [[10, 0], [10, 7], [7, 12], [0, 10]] },
    { type: 'bezier', pts: [[0, 10], [-k * 10, 10], [-10, k * 10], [-10, 0]] },
    { type: 'bezier', pts: [[-10, 0], [-10, -9], [-3, -6], [0, -10]] },
    { type: 'bezier', pts: [[0, -10], [4, -13], [12, -5], [10, 0]] },
  ];
  const poly = [];
  for (const s of bz) poly.push(...sample(s, 25000).slice(0, -1));
  assert.equal(poly.length, 100000);
  const A = loopInfo({ segs: bz }).signedArea;
  assert.ok(rel(A, polyArea(poly)) <= 1e-9, `${A} vs ${polyArea(poly)}`);
  // Cerrada en sí misma: es contorno.
  const drop = { type: 'bezier', pts: [[0, 0], [10, 10], [-10, 10], [0, 0]], meta: { layer: 'B' } };
  assert.ok(isClosedSegment(drop));
  const r = buildLoops([drop]);
  assert.equal(r.loops.length, 1);
  assert.ok(rel(segAreaTerm(drop), polyArea(sample(drop, 100000).slice(0, -1))) <= 1e-9);
  const bb = segBBox(drop), sp = sample(drop, 100000);
  const my = sp.reduce((m, p) => Math.max(m, p[1]), -Infinity), mx = sp.reduce((m, p) => Math.min(m, p[0]), Infinity);
  near(bb.maxY, my, 1e-8);
  near(bb.minX, mx, 1e-8);
  assert.ok(bb.maxY >= my && bb.minX <= mx);
});

test('5. splines: cúbica sujeta = Bézier; NURBS racional de cuarto de círculo exacta', () => {
  const P = [[0, 0], [1, 3], [4, 3], [5, 0]];
  const sp = { type: 'spline', degree: 3, ctrl: P, knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: null };
  const bz = { type: 'bezier', pts: P };
  for (const t of [0, 0.1, 0.37, 0.5, 0.9, 1]) nearP(segPointAt(sp, t), segPointAt(bz, t), 1e-14);
  assert.ok(rel(segLength(sp), segLength(bz)) <= 1e-12);
  assert.ok(rel(segAreaTerm(sp), segAreaTerm(bz)) <= 1e-12);
  // Cúbica con nudo interior: reverso conserva puntos y área cambia de signo.
  const sp2 = { type: 'spline', degree: 3, ctrl: [[0, 0], [1, 2], [3, 3], [5, 1], [6, -1]], knots: [0, 0, 0, 0, 0.4, 1, 1, 1, 1], weights: null };
  const rv = segReverse(sp2);
  for (const t of [0, 0.2, 0.4, 0.77, 1]) nearP(segPointAt(rv, 1 - t), segPointAt(sp2, t), 1e-13);
  near(segAreaTerm(rv), -segAreaTerm(sp2), 1e-12);
  assert.ok(rel(segLength(rv), segLength(sp2)) <= 1e-12);
  // Cuarto de círculo racional: grado 2, pesos [1, √2/2, 1].
  const r = 7;
  const q = { type: 'spline', degree: 2, ctrl: [[r, 0], [r, r], [0, r]], knots: [0, 0, 0, 1, 1, 1], weights: [1, Math.SQRT1_2, 1] };
  for (let i = 0; i <= 50; i++) {
    const p = segPointAt(q, i / 50);
    assert.ok(Math.abs(Math.hypot(p[0], p[1]) - r) <= 1e-12 * r, `t=${i / 50}`);
  }
  assert.ok(rel(segLength(q), (PI * r) / 2) <= 1e-12, `${segLength(q)}`);
  assert.ok(rel(segAreaTerm(q), (PI * r * r) / 4) <= 1e-12);
  const cp = segClosestPoint(q, [10, 10]);
  nearP(cp.q, [r * Math.SQRT1_2, r * Math.SQRT1_2], 1e-9);
});

test('6. segTransform: espejo, escala no uniforme, rotación + traslación', () => {
  const meta = { layer: 'L' };
  const a = { type: 'arc', c: [2, 1], r: 3, a0: 0.2, a1: 1.9, ccw: true, meta };
  const m = segTransform(a, [-1, 0, 0, 1, 0, 0]);
  assert.equal(m.type, 'arc');
  assert.equal(m.ccw, false);
  assert.equal(m.meta, meta);
  nearP(segStart(m), [-segStart(a)[0], segStart(a)[1]], 1e-14);
  nearP(segEnd(m), [-segEnd(a)[0], segEnd(a)[1]], 1e-14);
  near(segLength(m), segLength(a), 1e-13);
  const circ = { type: 'circle', c: [1, 1], r: 2, ccw: true };
  const mc = segTransform(circ, [-1, 0, 0, 1, 0, 0]);
  near(segAreaTerm(mc), -segAreaTerm(circ), 1e-12);
  const e = segTransform(circ, [2, 0, 0, 1, 0, 0]);
  assert.equal(e.type, 'ellipse');
  assert.ok(isClosedSegment(e));
  assert.ok(rel(segAreaTerm(e), 2 * segAreaTerm(circ)) <= 1e-14);
  nearP(e.c, [2, 1], 0);
  // Cizalla sobre un arco: la elipse pasa por los puntos transformados.
  const M = [1.3, 0.4, 0.7, -0.9, 5, -2], T = (p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
  const ea = segTransform(a, M);
  assert.equal(ea.type, 'ellipse');
  for (const t of [0, 0.3, 0.5, 1]) nearP(segPointAt(ea, t), T(segPointAt(a, t)), 1e-12);
  const det = M[0] * M[3] - M[1] * M[2];
  assert.ok(rel(segAreaTerm({ ...ea, c: [0, 0] }) - 0, det * segAreaTerm({ ...a, c: [0, 0] })) <= 1e-12);
  const ee = segTransform(ea, [0.5, -1, 2, 0.3, 1, 1]);
  for (const t of [0, 0.4, 1]) {
    const p = segPointAt(ea, t);
    nearP(segPointAt(ee, t), [0.5 * p[0] + 2 * p[1] + 1, -p[0] + 0.3 * p[1] + 1], 1e-11);
  }
  const th = 0.8, rt = segTransform(a, [Math.cos(th), Math.sin(th), -Math.sin(th), Math.cos(th), 10, -4]);
  assert.equal(rt.type, 'arc');
  assert.equal(rt.ccw, true);
  near(rt.r, 3, 1e-14);
  near(segLength(rt), segLength(a), 1e-13);
  const b = segTransform({ type: 'bezier', pts: [[0, 0], [1, 1], [2, 1], [3, 0]], meta }, M);
  assert.equal(b.meta, meta);
  nearP(b.pts[1], T([1, 1]), 1e-15);
});

test('7. buildLoops: orden y sentido, tolerancia de unión, duplicados y rendimiento', () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sq = (x, y, s) => [L([x, y], [x + s, y]), L([x + s, y], [x + s, y + s]), L([x + s, y + s], [x, y + s]), L([x, y + s], [x, y])];
  const segs = shuffle([...plate(), ...sq(200, 0, 10)]).map((s) => (rnd() < 0.5 ? segReverse(s) : s));
  const r = buildLoops(segs);
  assert.equal(r.loops.length, 2);
  assert.equal(r.open.length, 0);
  const areas = r.loops.map((l) => loopInfo(l).area).sort((a, b) => a - b);
  near(areas[0], 100, 1e-9);
  assert.ok(rel(areas[1], 5000 - (100 - 25 * PI)) <= 1e-12);
  for (const l of r.loops)
    for (let i = 0; i < l.segs.length; i++) nearP(segEnd(l.segs[i]), segStart(l.segs[(i + 1) % l.segs.length]), 1e-6);
  // Huecos: 0.5·tol cierra (y suelda las líneas), 10·tol queda abierto.
  const tol = 1e-6;
  const gap = (g) => [L([0, 0], [1, 0]), L([1, 0], [1, 1]), L([1, 1], [0, 1]), L([0, 1], [0, g])];
  const c1 = buildLoops(gap(0.5 * tol), { tol });
  assert.equal(c1.loops.length, 1);
  const s0 = c1.loops[0].segs;
  assert.deepEqual(segEnd(s0[s0.length - 1]), segStart(s0[0]));
  const c2 = buildLoops(gap(10 * tol), { tol });
  assert.equal(c2.loops.length, 0);
  assert.equal(c2.open.length, 1);
  assert.equal(c2.open[0].segs.length, 4);
  // Duplicados (también invertidos) y nulos.
  const meta = { layer: 'A' };
  const base = [...sq(0, 0, 5)].map((s) => ({ ...s, meta }));
  const extra = [segReverse(base[1]), base[2], L([3, 3], [3, 3]), { type: 'circle', c: [2, 2], r: 1 }, { type: 'circle', c: [2, 2], r: 1 }];
  const d = buildLoops([...base, ...extra]);
  assert.equal(d.stats.duplicatesRemoved, 3);
  assert.equal(d.stats.zeroLengthRemoved, 1);
  assert.equal(d.stats.loops, 2);
  assert.equal(d.loops.find((l) => l.segs.length === 4).segs[0].meta, meta);
  // T y ramas: el contorno se cierra, la rama colgante queda abierta.
  const t = buildLoops([...sq(0, 0, 10).slice(1), L([0, 0], [5, 0]), L([5, 0], [10, 0]), L([5, 0], [5, 4])]);
  assert.equal(t.loops.length, 1);
  assert.equal(t.open.length, 1);
  assert.equal(t.stats.junctions, 1);
  near(loopInfo(t.loops[0]).area, 100, 1e-12);
  // 20k segmentos: 5000 cuadrados desordenados.
  const big = [];
  for (let i = 0; i < 5000; i++) big.push(...sq((i % 100) * 3, Math.floor(i / 100) * 3, 2));
  shuffle(big);
  const t0 = cpuMs();
  const g = buildLoops(big.map((s) => (rnd() < 0.5 ? segReverse(s) : s)));
  const ms = cpuMs() - t0;
  assert.equal(g.loops.length, 5000);
  assert.equal(g.open.length, 0);
  assert.ok(ms < 1000, `${ms.toFixed(0)} ms`);
});

test('8. buildRegions: placa con 2 agujeros y una isla dentro de uno', () => {
  const rect = (x, y, w, h) => [L([x, y], [x + w, y]), L([x + w, y], [x + w, y + h]), L([x + w, y + h], [x, y + h]), L([x, y + h], [x, y])];
  const segs = [...rect(0, 0, 100, 60), { type: 'circle', c: [25, 30], r: 10 }, ...rect(50, 10, 40, 40), { type: 'circle', c: [70, 30], r: 8, ccw: false }];
  const { loops } = buildLoops(segs);
  assert.equal(loops.length, 4);
  const { nodes, regions } = buildRegions(loops);
  const idx = (pred) => loops.findIndex((l) => pred(loopInfo(l)));
  const plateI = idx((i) => Math.abs(i.area - 6000) < 1e-9);
  const sqI = idx((i) => Math.abs(i.area - 1600) < 1e-9);
  const holeI = idx((i) => i.circle && i.circle.r === 10);
  const islandI = idx((i) => i.circle && i.circle.r === 8);
  assert.deepEqual([nodes[plateI].depth, nodes[sqI].depth, nodes[holeI].depth, nodes[islandI].depth], [0, 1, 1, 2]);
  assert.equal(nodes[islandI].parent, sqI);
  assert.equal(nodes[plateI].parent, -1);
  assert.equal(regions.length, 2);
  const outerR = regions.find((r) => r.outer === plateI);
  assert.deepEqual(outerR.holes.slice().sort(), [holeI, sqI].sort());
  assert.deepEqual(regions.find((r) => r.outer === islandI).holes, []);
  assert.ok(pointInPolygon([25, 30], loopInfo(loops[holeI]).poly));
  assert.ok(!pointInPolygon([40, 30], loopInfo(loops[holeI]).poly));
  // orientLoop
  const o = orientLoop(loops[plateI], false);
  assert.ok(loopInfo(o).signedArea < 0);
  assert.ok(loopInfo(orientLoop(o, true)).signedArea > 0);
  assert.deepEqual(bboxOfSegments(loops[plateI].segs), { minX: 0, minY: 0, maxX: 100, maxY: 60 });
});

test('9. segTessellate respeta la tolerancia de cuerda', () => {
  const arc = { type: 'arc', c: [5, -3], r: 50, a0: 0.3, a1: 4.0, ccw: true };
  for (const tol of [1e-1, 1e-3, 1e-5]) {
    const pts = segTessellate(arc, tol);
    assert.ok(pts.length <= 4096);
    nearP(pts[0], segStart(arc), 0);
    nearP(pts[pts.length - 1], segEnd(arc), 0);
    let dev = 0;
    for (let i = 1; i < pts.length; i++) {
      const m = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2];
      dev = Math.max(dev, 50 - Math.hypot(m[0] - 5, m[1] + 3));
    }
    assert.ok(dev <= tol, `tol ${tol}: ${dev}`);
  }
  // Curvas generales: cada muestra densa a ≤ tol de la polilínea.
  const curves = [
    { type: 'ellipse', c: [0, 0], rx: 30, ry: 4, rot: 0.4, t0: 0, t1: 5, ccw: true },
    { type: 'bezier', pts: [[0, 0], [40, 30], [-10, 30], [30, 0]] },
  ];
  for (const s of curves) {
    const tol = 0.01, pts = segTessellate(s, tol);
    let worst = 0;
    for (const q of sample(s, 20000)) {
      let d = Infinity;
      for (let i = 1; i < pts.length; i++) d = Math.min(d, segClosestPoint({ type: 'line', p0: pts[i - 1], p1: pts[i] }, q).d);
      worst = Math.max(worst, d);
    }
    assert.ok(worst <= tol, `${s.type}: ${worst}`);
  }
});

test('10. punto más cercano y puntos de enganche', () => {
  const a = { type: 'arc', c: [0, 0], r: 2, a0: 0, a1: PI, ccw: true };
  const c = segClosestPoint(a, [0, 5]);
  nearP(c.q, [0, 2], 1e-15);
  near(c.t, 0.5, 1e-15);
  near(segClosestPoint(a, [3, -1]).t, 0, 0);
  const kinds = segSnapPoints(a).map((s) => s.kind).sort();
  assert.deepEqual(kinds, ['center', 'end', 'end', 'mid', 'quadrant', 'quadrant', 'quadrant']);
  const e = { type: 'ellipse', c: [0, 0], rx: 4, ry: 1, rot: 0, t0: 0, t1: 2 * PI, ccw: true };
  const ce = segClosestPoint(e, [0, 3]);
  nearP(ce.q, [0, 1], 1e-9);
  assert.equal(segSnapPoints(e).length, 5);
});

test('segInvalidReason: detecta geometría corrupta sin evaluarla', () => {
  const ok = [
    { type: 'line', p0: [0, 0], p1: [1, 0] },
    { type: 'arc', c: [0, 0], r: 1, a0: 0, a1: 1, ccw: true },
    { type: 'circle', c: [0, 0], r: 2, ccw: true },
    { type: 'ellipse', c: [0, 0], rx: 2, ry: 1, rot: 0, t0: 0, t1: Math.PI, ccw: true },
    { type: 'bezier', pts: [[0, 0], [1, 1], [2, 1], [3, 0]] },
    { type: 'spline', degree: 3, ctrl: [[0, 0], [1, 1], [2, 1], [3, 0]], knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: null },
  ];
  for (const s of ok) assert.equal(segInvalidReason(s), null, s.type);
  const bad = [
    [{ type: 'line', p0: [0, NaN], p1: [1, 0] }, /no numéricas/],
    [{ type: 'circle', c: [0, 0], r: 0, ccw: true }, /radio ≤ 0/],
    [{ type: 'arc', c: [0, 0], r: -1, a0: 0, a1: 1, ccw: true }, /radio ≤ 0/],
    [{ type: 'ellipse', c: [0, 0], rx: 2, ry: 0, rot: 0, t0: 0, t1: 1, ccw: true }, /semieje/],
    [{ type: 'spline', degree: 3, ctrl: [[0, 0], [1, 1], [2, 0]], knots: [0, 0, 0, 1, 1, 1], weights: null }, /menos puntos de control/],
    [{ type: 'spline', degree: 2, ctrl: [[0, 0], [1, 1], [2, 0], [3, 1]], knots: [0, 0, 0, 2, 1, 1, 1], weights: null }, /decrecientes/],
    [{ type: 'spline', degree: 2, ctrl: [[0, 0], [1, 1], [2, 0]], knots: [0, 0, 0, 0, 0, 0], weights: null }, /dominio/],
    [{ type: 'spline', degree: 2, ctrl: [[0, 0], [1, 1], [2, 0]], knots: [0, 0, 0, 1, 1, 1], weights: [1, 0, 1] }, /pesos/],
  ];
  for (const [s, re] of bad) assert.match(segInvalidReason(s), re);
});
