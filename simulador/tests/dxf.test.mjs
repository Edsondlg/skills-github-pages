// Pruebas del importador DXF (contrato C3).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDXF } from '../src/importers/dxf.js';
import { buildLoops, buildRegions, loopInfo } from '../src/geom2d/loops.js';
import { segStart, segEnd, segPointAt, segLength, segAreaTerm, segClosestPoint, segTangent } from '../src/geom2d/segments.js';
import { DxfWriter } from '../scripts/dxf-writer.mjs';

const PI = Math.PI;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => parseDXF(fs.readFileSync(path.join(root, 'samples', f), 'utf8'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);
const nearP = (p, q, tol, msg) => {
  near(p[0], q[0], tol, msg);
  near(p[1], q[1], tol, msg);
};
const sumArea = (segs) => segs.reduce((a, s) => a + segAreaTerm(s), 0);
// Contornos y regiones como los usaría la UI: sin líneas de eje/ocultas.
function regionsOf(r, tol = 0.001) {
  const { loops, open, stats } = buildLoops(r.segments.filter((s) => !s.meta.dashed), { tol });
  const { regions } = buildRegions(loops);
  return { loops, open, stats, regions };
}
const ent = (type, pairs) => [[0, type], [8, '0'], ...pairs];

test('1a. placa-soporte: unidades, entidades, 1 región con 6 agujeros y área neta exacta', () => {
  const r = load('placa-soporte.dxf');
  assert.deepEqual(r.units, { insunits: 4, name: 'mm', toMM: 1 });
  assert.deepEqual(r.stats.entities, { LWPOLYLINE: 2, CIRCLE: 5, LINE: 11, TEXT: 1, MTEXT: 1 });
  assert.deepEqual(r.stats.ignored, { DIMENSION: 3 });
  assert.equal(r.warnings.length, 0);
  assert.ok(r.segments.filter((s) => s.meta.layer === 'EJES').every((s) => s.meta.dashed && s.meta.linetype === 'CENTER'));
  assert.ok(!r.segments.some((s) => s.meta.layer === 'COTAS'), 'los bloques *D de cotas no se expanden');
  assert.deepEqual(r.texts.map((t) => t.text), ['PLACA SOPORTE  e=3 mm  4xØ8.5', 'Material: Acero SAE 1010\nTolerancia ±0.1']);
  const { loops, open, regions } = regionsOf(r);
  assert.equal(open.length, 0);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 6);
  const net = loopInfo(loops[regions[0].outer]).area - regions[0].holes.reduce((a, h) => a + loopInfo(loops[h]).area, 0);
  const exact = 150 * 80 - 20 * 15 - 4 * 36 * (1 - PI / 4) - (20 * 10 + PI * 25) - 4 * PI * 4.25 ** 2 - PI * 12.5 ** 2;
  assert.ok(Math.abs(net - exact) / exact < 1e-9, `${net} vs ${exact}`);
});

test('1b. brida-bloques: bloques anidados con giro y punto base → 1 región, 9 agujeros', () => {
  const r = load('brida-bloques.dxf');
  assert.equal(r.units.toMM, 1);
  assert.deepEqual(r.stats.entities, { CIRCLE: 2, ARC: 1, LINE: 5, INSERT: 8, TEXT: 1 });
  const holes = r.segments.filter((s) => s.meta.block === 'BARRENO');
  assert.equal(holes.length, 8);
  holes.forEach((s, k) => {
    const a = (22.5 + 45 * k) * (PI / 180);
    nearP(s.c, [55 * Math.cos(a), 55 * Math.sin(a)], 1e-12);
    near(s.r, 7, 1e-14);
    assert.equal(s.meta.layer, 'BARRENOS', 'capa 0 del bloque hereda la del INSERT');
    assert.equal(s.meta.color, 3, 'color BYBLOCK → color resuelto del INSERT (BYLAYER → capa)');
  });
  const { regions } = regionsOf(r);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 9);
});

test('1c. eje-perfil, bloque-vistas, leva-spline, junta-arcos: regiones esperadas', () => {
  const e = load('eje-perfil.dxf');
  assert.deepEqual(e.stats.entities, { LINE: 17, ARC: 1, TEXT: 1 });
  const axis = e.segments.filter((s) => s.meta.dashed);
  assert.equal(axis.length, 1);
  assert.deepEqual([axis[0].p0, axis[0].p1], [[-10, 0], [130, 0]]);
  let g = regionsOf(e);
  assert.deepEqual([g.regions.length, g.regions[0].holes.length, g.open.length], [1, 0, 0]);
  const bb = loopInfo(g.loops[0]).bbox;
  assert.deepEqual([bb.minX, bb.minY, bb.maxX, bb.maxY], [0, 0, 120, 15]);

  const v = load('bloque-vistas.dxf');
  assert.equal(v.segments.filter((s) => s.meta.dashed && s.meta.linetype === 'HIDDEN').length, 4);
  g = regionsOf(v);
  assert.deepEqual(g.regions.map((x) => x.holes.length), [0, 1, 0]);
  assert.equal(g.open.length, 2, 'aristas de escalón (líneas interiores) quedan abiertas');

  const l = load('leva-spline.dxf');
  assert.deepEqual(l.units, { insunits: 1, name: 'in', toMM: 25.4 });
  assert.deepEqual(l.stats.entities, { SPLINE: 1, CIRCLE: 1, ELLIPSE: 1, ARC: 6, LINE: 8, TEXT: 1 });
  const sp = l.segments.find((s) => s.type === 'spline');
  assert.equal(sp.weights, null);
  assert.equal(sp.ctrl.length, 12);
  nearP(segStart(sp), segEnd(sp), 1e-15);
  g = regionsOf(l, 1e-6);
  assert.deepEqual([g.regions.length, g.regions[0].holes.length, g.open.length], [1, 3, 0]);

  const j = load('junta-arcos.dxf');
  assert.deepEqual(j.stats.entities, { ARC: 16, LINE: 9 });
  assert.ok(j.segments.every((s) => s.type === 'line' || s.type === 'arc'));
  g = regionsOf(j, 0.001);
  assert.deepEqual([g.regions.length, g.regions[0].holes.length, g.open.length, g.stats.duplicatesRemoved], [1, 5, 0, 1]);
  assert.ok(regionsOf(j, 1e-6).open.length > 0, 'sin tolerancia el hueco de 0.0005 no cierra');
});

test('2. LWPOLYLINE con bulge: semicírculo exacto en ambos sentidos', () => {
  for (const b of [1, -1]) {
    const w = new DxfWriter();
    w.lwpolyline([[0, 0], [10, 0, b], [10, 10], [0, 10]], true);
    const r = parseDXF(w.toString());
    const arc = r.segments.find((s) => s.type === 'arc');
    assert.equal(r.segments.length, 4);
    nearP(arc.c, [10, 5], 1e-15);
    near(arc.r, 5, 1e-15);
    assert.equal(arc.ccw, b > 0);
    nearP(segStart(arc), [10, 0], 1e-14);
    nearP(segEnd(arc), [10, 10], 1e-14);
    nearP(segPointAt(arc, 0.5), [10 + 5 * b, 5], 1e-14);
    near(sumArea(r.segments), 100 + (b * PI * 25) / 2, 1e-12);
  }
  // Bulge de 90°: tan(π/8).
  const w = new DxfWriter();
  w.lwpolyline([[0, 0, Math.tan(PI / 8)], [10, 10]], false);
  const a = parseDXF(w.toString()).segments[0];
  nearP(a.c, [0, 10], 1e-14);
  near(a.r, 10, 1e-14);
});

test('3. OCS: CIRCLE/ARC con extrusión (0,0,−1) en (10,0) quedan en x = −10 con sentido horario', () => {
  const w = new DxfWriter();
  w.circle([10, 0], 2, { extrusion: [0, 0, -1] });
  w.arc([10, 0], 2, 0, 90, { extrusion: [0, 0, -1] });
  w.lwpolyline([[10, 0], [20, 0, 1], [20, 10]], false, { extrusion: [0, 0, -1] });
  w.arc([10, 0], 2, 0, 90, { extrusion: [1, 0, 0] });
  const r = parseDXF(w.toString());
  const [c, a, l1, l2] = r.segments;
  assert.equal(r.segments.length, 4);
  nearP(c.c, [-10, 0], 0);
  assert.equal(c.ccw, false);
  nearP(a.c, [-10, 0], 0);
  assert.equal(a.ccw, false);
  nearP(segStart(a), [-12, 0], 1e-14);
  nearP(segEnd(a), [-10, 2], 1e-14);
  nearP(segPointAt(a, 0.5), [-10 - 2 * Math.SQRT1_2, 2 * Math.SQRT1_2], 1e-14);
  assert.deepEqual([l1.p0, l1.p1], [[-10, 0], [-20, 0]]);
  assert.equal(l2.ccw, false);
  nearP(segPointAt(l2, 0.5), [-25, 5], 1e-14);
  assert.ok(r.warnings.some((m) => /extrusión no paralela a Z/.test(m)));
});

test('4. INSERT: escala, giro, punto base, anidado, MINSERT y escala no uniforme', () => {
  const w = new DxfWriter();
  w.block('B', [1, 1], (b) => b.line([1, 1], [2, 1]).circle([2, 1], 0.5));
  w.block('N', [0, 0], (b) => b.insert('B', [5, 0]));
  w.insert('B', [10, 10], { sx: 2, sy: 2, rot: 90 });
  w.insert('N', [0, 0], { rot: 90 });
  w.insert('B', [10, 10], { sx: 2, sy: 1 });
  w.insert('B', [0, 0], { cols: 3, rows: 2, dc: 10, dr: 20 });
  w.insert('FALTA', [0, 0]);
  const r = parseDXF(w.toString());
  const [l1, c1, l2, c2, l3, e3, ...arr] = r.segments;
  assert.deepEqual([l1.p0, l1.p1], [[10, 10], [10, 12]]);
  assert.deepEqual([c1.type, c1.c, c1.r], ['circle', [10, 12], 1]);
  assert.deepEqual([l2.p0, l2.p1], [[0, 5], [0, 6]]);
  assert.deepEqual(c2.c, [0, 6]);
  assert.deepEqual([l3.p0, l3.p1], [[10, 10], [12, 10]]);
  assert.equal(e3.type, 'ellipse');
  nearP(e3.c, [12, 10], 1e-15);
  near(Math.max(e3.rx, e3.ry), 1, 1e-15);
  near(Math.min(e3.rx, e3.ry), 0.5, 1e-15);
  near(segLength(e3), 4.844224110273838, 1e-9);
  assert.equal(arr.length, 12);
  assert.deepEqual(arr.filter((s) => s.type === 'line').map((s) => s.p0), [[0, 0], [10, 0], [20, 0], [0, 20], [10, 20], [20, 20]]);
  assert.equal(r.stats.entities.INSERT, 5);
  assert.ok(r.warnings.includes('Bloque inexistente omitido: FALTA'));
  // Ciclo de bloques: se corta con advertencia.
  const w2 = new DxfWriter();
  w2.block('A', [0, 0], (b) => b.line([0, 0], [1, 0]).insert('A', [1, 0]));
  w2.insert('A', [0, 0]);
  const r2 = parseDXF(w2.toString());
  assert.equal(r2.segments.length, 1);
  assert.ok(r2.warnings.some((m) => /circular/.test(m)));
});

test('5. SPLINE: nudos y pesos, no anclada → anclada, y por puntos de ajuste → Bézier', () => {
  const w = new DxfWriter();
  const h = Math.SQRT1_2;
  w.spline({ degree: 2, knots: [0, 0, 0, 1, 1, 1], ctrl: [[1, 0], [1, 1], [0, 1]], weights: [1, h, 1] });
  w.spline({ degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], ctrl: [[0, 0], [1, 2], [3, 2], [4, 0]], weights: [2, 2, 2, 2] });
  const P = [[0, 0], [2, 3], [5, 3], [7, 0]];
  w.spline({ degree: 3, knots: [0, 1, 2, 3, 4, 5, 6, 7], ctrl: P });
  const F = [[0, 0], [10, 5], [20, 0], [30, 5]];
  w.spline({ degree: 3, fit: F, t0: [1, 0], t1: [0, 1] });
  const r = parseDXF(w.toString());
  const [q, nr, un, ...bz] = r.segments;
  assert.deepEqual(q.weights, [1, h, 1]);
  for (const t of [0, 0.2, 0.37, 0.5, 0.9, 1]) near(Math.hypot(...segPointAt(q, t)), 1, 1e-14);
  assert.equal(nr.weights, null, 'pesos iguales → no racional');
  nearP(segPointAt(nr, 0.5), [2, 1.5], 1e-15);
  // B-spline cúbica uniforme: extremos (P0 + 4P1 + P2)/6 y (P1 + 4P2 + P3)/6.
  assert.equal(un.knots.slice(0, 4).every((u) => u === 3), true);
  nearP(segStart(un), [(P[0][0] + 4 * P[1][0] + P[2][0]) / 6, (P[0][1] + 4 * P[1][1] + P[2][1]) / 6], 1e-14);
  nearP(segEnd(un), [(P[1][0] + 4 * P[2][0] + P[3][0]) / 6, (P[1][1] + 4 * P[2][1] + P[3][1]) / 6], 1e-14);
  assert.equal(bz.length, 3);
  bz.forEach((b, i) => {
    assert.equal(b.type, 'bezier');
    assert.deepEqual(b.pts[0], F[i]);
    assert.deepEqual(b.pts[3], F[i + 1]);
  });
  nearP(segTangent(bz[0], 0), [1, 0], 1e-14);
  nearP(segTangent(bz[2], 1), [0, 1], 1e-14);
  nearP(segTangent(bz[0], 1), segTangent(bz[1], 0), 1e-12, 'continuidad G1');
});

test('6. Unidades: tabla $INSUNITS, sin unidades → mm con advertencia, $MEASUREMENT como pista', () => {
  const table = { 1: ['in', 25.4], 2: ['ft', 304.8], 4: ['mm', 1], 5: ['cm', 10], 6: ['m', 1000], 8: ['µin', 25.4e-6], 9: ['mil', 0.0254], 10: ['yd', 914.4], 14: ['dm', 100] };
  for (const [k, [name, toMM]] of Object.entries(table)) {
    const r = parseDXF(new DxfWriter({ insunits: +k }).toString());
    assert.deepEqual(r.units, { insunits: +k, name, toMM });
    assert.equal(r.warnings.length, 1, 'solo "sin entidades"');
  }
  const u0 = parseDXF(new DxfWriter({ insunits: 0 }).toString());
  assert.deepEqual(u0.units, { insunits: 0, name: 'unitless', toMM: 1, assumed: 'mm' });
  assert.ok(u0.warnings.some((m) => /se asumen milímetros/.test(m)));
  const un = parseDXF(new DxfWriter({ insunits: null, measurement: 0 }).toString());
  assert.deepEqual(un.units, { insunits: null, name: 'unitless', toMM: 25.4, assumed: 'in' });
  assert.ok(un.warnings.some((m) => /pulgadas/.test(m)));
});

test('7. DXF binario o ilegible → error en español', () => {
  const bin = 'AutoCAD Binary DXF\r\n\x1a\x00\x00\x00';
  assert.throws(() => parseDXF(bin), /DXF binario no soportado: guárdalo como DXF ASCII/);
  assert.throws(() => parseDXF(new TextEncoder().encode(bin)), /DXF binario no soportado/);
  assert.throws(() => parseDXF(''), /DXF ilegible/);
  assert.throws(() => parseDXF('hola\nmundo\n'), /DXF ilegible/);
  assert.throws(() => parseDXF('0\nLINE\n8\n0\n'), /DXF ilegible/);
});

test('8. dashed y propiedades resueltas por BYLAYER y BYBLOCK', () => {
  const w = new DxfWriter();
  w.addLtype('HIDDEN', 'Hidden', [6.35, -3.175]).addLtype('ACAD_ISO02W100', 'ISO dash', [12, -3]);
  w.addLayer('EJES', { color: 1, linetype: 'CENTER' }).addLayer('CONTORNO', { color: 7 }).addLayer('ISO', { linetype: 'ACAD_ISO02W100' });
  w.block('BB', [0, 0], (b) => {
    b.line([0, 0], [1, 0]); // capa 0, BYLAYER → capa del INSERT
    b.line([0, 1], [1, 1], { linetype: 'BYBLOCK', color: 0 });
    b.line([0, 2], [1, 2], { layer: 'CONTORNO' });
  });
  w.insert('BB', [0, 0], {}, { layer: 'EJES' });
  w.insert('BB', [0, 10], {}, { layer: 'CONTORNO', linetype: 'HIDDEN', color: 5 });
  w.line([0, 0], [5, 5], { layer: 'EJES' });
  w.line([0, 0], [5, 5], { layer: 'EJES', linetype: 'CONTINUOUS' });
  w.line([0, 0], [5, 5], { layer: 'ISO' });
  const m = parseDXF(w.toString()).segments.map((s) => [s.meta.layer, s.meta.linetype, s.meta.dashed, s.meta.color]);
  assert.deepEqual(m, [
    ['EJES', 'CENTER', true, 1],
    ['EJES', 'CENTER', true, 1], // BYBLOCK → lo resuelto del INSERT (BYLAYER de EJES)
    ['CONTORNO', 'CONTINUOUS', false, 7],
    ['CONTORNO', 'CONTINUOUS', false, 7],
    ['CONTORNO', 'HIDDEN', true, 5],
    ['CONTORNO', 'CONTINUOUS', false, 7],
    ['EJES', 'CENTER', true, 1],
    ['EJES', 'CONTINUOUS', false, 1],
    ['ISO', 'ACAD_ISO02W100', true, 7],
  ]);
});

test('8b. Lector robusto: CRLF, espacios, línea impar final, \\U+, MTEXT, papel, POLYLINE 2D/3D, ELLIPSE con Nz < 0', () => {
  const pairs = [
    [0, 'SECTION'], [2, 'ENTITIES'],
    ...ent('TEXT', [[10, 1], [20, 2], [40, 2.5], [1, 'Di\\U+00E1metro %%c10 %%d %%p'], [50, 30]]),
    ...ent('MTEXT', [[10, 0], [20, 0], [40, 2], [3, '{\\H1.5x;\\C1;Lí'], [1, 'nea}\\Pdos \\S1^2; \\\\fin']]),
    ...ent('LINE', [[67, 1], [10, 0], [20, 0], [11, 1], [21, 1]]),
    ...ent('POLYLINE', [[66, 1], [70, 1]]), ...ent('VERTEX', [[10, 0], [20, 0], [42, 1]]), ...ent('VERTEX', [[10, 4], [20, 0]]),
    ...ent('VERTEX', [[10, 4], [20, 4]]), [0, 'SEQEND'],
    ...ent('POLYLINE', [[66, 1], [70, 8]]), ...ent('VERTEX', [[10, 0], [20, 0]]), [0, 'SEQEND'],
    ...ent('ELLIPSE', [[10, 0], [20, 0], [11, 2], [21, 0], [40, 0.5], [41, 0], [42, PI / 2], [230, -1]]),
    ...ent('HATCH', []), ...ent('MLINE', []), ...ent('POINT', [[10, 1], [20, 1]]),
    [0, 'ENDSEC'], [0, 'EOF'],
  ];
  const text = pairs.map(([c, v]) => `  ${c}\r\n${v}${c === 1 || c === 3 ? "" : "  "}`).join('\r\n') + '\r\n  999';
  const r = parseDXF(text);
  assert.deepEqual(r.texts.map((t) => [t.text, t.rot]), [['Diámetro Ø10 ° ±', 30], ['Línea\ndos 1/2 \\fin', 0]]);
  assert.deepEqual(r.stats.entities, { TEXT: 1, MTEXT: 1, POLYLINE: 2, ELLIPSE: 1 });
  assert.deepEqual(r.stats.ignored, { PAPERSPACE: 1, HATCH: 1, MLINE: 1, POINT: 1 });
  const [a, l1, l2, e] = r.segments;
  assert.equal(r.segments.length, 4);
  nearP(a.c, [2, 0], 0);
  assert.equal(a.ccw, true);
  assert.deepEqual([l1.p0, l1.p1, l2.p0, l2.p1], [[4, 0], [4, 4], [4, 4], [0, 0]]);
  nearP(segStart(e), [2, 0], 1e-15);
  nearP(segEnd(e), [0, -1], 1e-15, 'Nz < 0 invierte el sentido del parámetro');
  assert.ok(r.warnings.some((m) => /Polilínea 3D/.test(m)));
  assert.ok(r.warnings.some((m) => /no soportada.*MLINE/.test(m)));
});

test('9. Rendimiento: 100k LINE en < 1.5 s', () => {
  const parts = ['0\nSECTION\n2\nENTITIES\n'];
  for (let i = 0; i < 100000; i++)
    parts.push(`0\nLINE\n5\n${(i + 256).toString(16)}\n100\nAcDbEntity\n8\nCONTORNO\n100\nAcDbLine\n10\n${i}.5\n20\n${i % 977}.25\n30\n0.0\n11\n${i + 1}.5\n21\n${(i * 7) % 991}.75\n31\n0.0\n`);
  parts.push('0\nENDSEC\n0\nEOF\n');
  const text = parts.join('');
  const t0 = performance.now();
  const r = parseDXF(text);
  const ms = performance.now() - t0;
  assert.equal(r.segments.length, 100000);
  assert.deepEqual(r.segments[99999].p1, [100000.5, (99999 * 7) % 991 + 0.75]);
  assert.ok(ms < 1500, `${ms.toFixed(0)} ms`);
});

test('10. Ida y vuelta: segmentos → DXF (escritor) → segmentos', () => {
  const segs = [
    { type: 'line', p0: [1.25, -3.5], p1: [7.125, 2 / 3] },
    { type: 'arc', c: [3, 4], r: 2.5, a0: 0.3, a1: 2.1, ccw: true },
    { type: 'arc', c: [-3, 1], r: 1.75, a0: 2.5, a1: -0.4, ccw: false },
    { type: 'circle', c: [10, 10], r: 0.5, ccw: true },
    { type: 'ellipse', c: [5, -5], rx: 4, ry: 1.5, rot: 0.6, t0: 0.2, t1: 4, ccw: true },
    { type: 'ellipse', c: [0, 0], rx: 3, ry: 2, rot: -0.3, t0: 1, t1: -1, ccw: false },
    { type: 'spline', degree: 2, ctrl: [[1, 0], [1, 1], [0, 1]], knots: [0, 0, 0, 1, 1, 1], weights: [1, Math.SQRT1_2, 1] },
    { type: 'spline', degree: 3, ctrl: [[0, 0], [1, 2], [2, -1], [4, 1], [5, 0]], knots: [0, 0, 0, 0, 0.4, 1, 1, 1, 1], weights: null },
    { type: 'bezier', pts: [[0, 0], [1, 3], [4, 3], [5, 0]] },
  ];
  const w = new DxfWriter();
  for (const s of segs) w.segment(s, { layer: 'CONTORNO' });
  const r = parseDXF(w.toString());
  assert.equal(r.segments.length, segs.length);
  segs.forEach((s, i) => {
    const q = r.segments[i];
    near(segLength(q), segLength(s), 1e-9 * segLength(s), s.type);
    near(Math.abs(segAreaTerm(q)), Math.abs(segAreaTerm(s)), 1e-9, s.type);
    for (let k = 0; k <= 16; k++) assert.ok(segClosestPoint(q, segPointAt(s, k / 16)).d < 1e-9, `${s.type} muestra ${k}`);
    const ends = [segStart(q), segEnd(q)], e0 = [segStart(s), segEnd(s)];
    assert.ok(e0.every((p) => ends.some((x) => Math.hypot(x[0] - p[0], x[1] - p[1]) < 1e-12)), `${s.type} extremos`);
    assert.equal(q.meta.layer, 'CONTORNO');
  });
});
