// Pruebas de la tubería (src/app/pipeline.js) con el importador DXF y el kernel reales.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as K from '../src/kernel/core.js';
import {
  detectFormat, importText, importImage, prepareProfile, defaultOpState, applySuggested, makeJob,
  profileSummary, analyticVolume, computeAll, UNIT_FACTORS,
} from '../src/app/pipeline.js';
import { SAMPLE_SUGGESTIONS } from '../src/app/sample-suggestions.js';
import { findMaterial } from '../src/ui/materials.js';

await K.init();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PI = Math.PI;
const close = (a, b, rel = 1e-9, msg = '') =>
  assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${msg} ${a} ≠ ${b} (rel ${rel})`);
const load = (name) => importText('dxf', fs.readFileSync(path.join(root, 'samples', name + '.dxf'), 'utf8'), name + '.dxf');

// Regiones/agujeros esperados (sin trazos) y tolerancia de volumen kernel vs analítico.
const EXPECT = {
  'placa-soporte': { holes: [6], rel: 1e-9 },
  'brida-bloques': { holes: [9], rel: 1e-9 },
  'eje-perfil': { holes: [0], rel: 1e-9 },
  'bloque-vistas': { holes: [0, 1, 0], open: 2, rel: null },
  'leva-spline': { holes: [3], rel: 1e-5 }, // spline + elipse: integración B-spline del kernel ~4e-6
  'junta-arcos': { holes: [5], rel: 1e-9 },
};

for (const [id, exp] of Object.entries(EXPECT)) {
  test(`ejemplo ${id}: importar → perfil → trabajo → kernel`, (t) => {
    const drawing = load(id);
    const profile = prepareProfile(drawing);
    assert.deepEqual(profile.regions.map((r) => r.holes.length), exp.holes);
    if (exp.open != null) assert.equal(profile.stats.openChains, exp.open);
    const op = applySuggested(defaultOpState(profile), SAMPLE_SUGGESTIONS[id]);
    assert.ok(op.regions.every((r) => r.included));
    const r = K.build(makeJob(profile, op));
    assert.equal(r.props.valid, true);
    assert.equal(r.props.closed, true);
    assert.equal(r.props.counts.solids, 1);
    const av = analyticVolume(profile, op);
    if (exp.rel != null) close(r.props.volume, av, exp.rel, 'volumen');
    else assert.equal(av, null);
    t.diagnostic(`${id}: regiones ${profile.regions.length}, agujeros ${exp.holes.join('/')}, V kernel ${r.props.volume.toFixed(4)}, V analítico ${av == null ? '—' : av.toFixed(4)}`);
  });
}

test('placa-soporte: resumen 2D (longitud de corte, área neta, agujeros)', () => {
  const profile = prepareProfile(load('placa-soporte'));
  const op = defaultOpState(profile);
  const s = profileSummary(profile, op);
  close(s.perimeterOuter, 442 + 12 * PI, 1e-9, 'perímetro exterior');
  close(s.perimeterInner, 40 + 69 * PI, 1e-9, 'perímetro interior');
  close(s.netArea, 11356 - 217.5 * PI, 1e-9, 'área neta');
  assert.equal(s.loops, 7);
  for (const [k, v] of Object.entries({ minX: 0, minY: 0, maxX: 150, maxY: 80 })) close(s.bbox2d[k], v, 1e-9, k);
  assert.equal(s.holes.length, 6);
  const ds = s.holes.map((h) => h.d).filter((d) => d != null).sort((a, b) => a - b);
  ds.forEach((d, i) => close(d, i < 4 ? 8.5 : 25));
  const slot = s.holes.find((h) => h.d == null);
  close(slot.c[0], 75); close(slot.c[1], 67);
  close(slot.area, 200 + 25 * PI);
  assert.ok(s.holes.every((h) => h.op === 'through'));
  // Ciego: no resta área ni suma corte; 'none': desaparece del resumen.
  const op2 = structuredClone(op);
  op2.regions[0].holes[0] = { op: 'blind', depth: 1 };
  op2.regions[0].holes[1] = { op: 'none', depth: null };
  const s2 = profileSummary(profile, op2);
  const h0 = profile.loopInfos[profile.regions[0].holes[0]], h1 = profile.loopInfos[profile.regions[0].holes[1]];
  close(s2.netArea, s.netArea + h0.area + h1.area);
  close(s2.perimeterInner, s.perimeterInner - h0.perimeter - h1.perimeter);
  assert.equal(s2.holes.length, 5);
  assert.equal(s2.holes.filter((h) => h.op === 'blind').length, 1);
});

test('agujero ciego: volumen analítico = kernel', () => {
  const profile = prepareProfile(load('placa-soporte'));
  const op = { ...defaultOpState(profile), thickness: 4 };
  op.regions[0].holes[5] = { op: 'blind', depth: 1.5 };
  const r = K.build(makeJob(profile, op));
  const A = profile.loopInfos[profile.regions[0].holes[5]].area;
  close(analyticVolume(profile, op), 4 * profileSummary(profile, defaultOpState(profile)).netArea + A * 2.5);
  close(r.props.volume, analyticVolume(profile, op));
});

test('bloque-vistas: multivista reproduce el bloque en L con barreno', () => {
  const profile = prepareProfile(load('bloque-vistas'));
  const op = applySuggested(defaultOpState(profile), SAMPLE_SUGGESTIONS['bloque-vistas']);
  const job = makeJob(profile, op);
  assert.deepEqual(job.multiview.views.map((v) => v.role).sort(), ['front', 'right', 'top']);
  const r = K.build(job);
  // L: (80·12 + 12·28)·50, menos barreno Ø16 que atraviesa el ala de 12 mm.
  close(r.props.volume, (80 * 12 + 12 * 28) * 50 - PI * 64 * 12, 1e-9, 'volumen L');
  close(r.props.bbox.size[0], 80); close(r.props.bbox.size[1], 50); close(r.props.bbox.size[2], 40);
  // Errores en español.
  const bad = structuredClone(op);
  bad.multiview.windows.left = { minX: 500, minY: 500, maxX: 600, maxY: 600 };
  assert.throws(() => makeJob(profile, bad), /vista lateral izquierda no contiene ninguna región/);
  const one = structuredClone(op);
  one.multiview.windows = { top: null, front: op.multiview.windows.front, right: null, left: null };
  assert.throws(() => makeJob(profile, one), /al menos dos vistas/);
});

test('eje-perfil: eje por defecto = línea de centros; revolución = Pappus', () => {
  const profile = prepareProfile(load('eje-perfil'));
  assert.deepEqual(profile.bbox, { minX: 0, minY: 0, maxX: 120, maxY: 15 });
  const op = defaultOpState(profile);
  assert.equal(op.revolve.axisKind, 'x');
  assert.deepEqual(op.revolve.axis, { p: [0, 0], d: [1, 0] });
  op.mode = 'revolve';
  const r = K.build(makeJob(profile, op));
  const info = profile.loopInfos[0];
  close(analyticVolume(profile, op), 2 * PI * info.area * info.centroid[1]);
  close(r.props.volume, analyticVolume(profile, op), 1e-9, 'Pappus');
  // Media vuelta = mitad del volumen.
  const half = { ...op, revolve: { ...op.revolve, angleDeg: 180 } };
  close(K.build(makeJob(profile, half)).props.volume, r.props.volume / 2, 1e-9);
});

test('computeAll: masa = V·ρ/1000 en Acero A36; precisión y lámina', () => {
  const profile = prepareProfile(load('brida-bloques'));
  const op = applySuggested(defaultOpState(profile), SAMPLE_SUGGESTIONS['brida-bloques']);
  const build = K.build(makeJob(profile, op));
  const mat = findMaterial('acero-a36');
  const d = computeAll({ build, profile, op, material: mat, pricePerKg: 30, blankMargin: 5 });
  close(d.mass.g, (build.props.volume * 7.85) / 1000);
  assert.ok(d.precision.relError < 1e-9);
  assert.equal(d.sheet.thickness, 12);
  close(d.sheet.blankWidth, 160);
  assert.equal(d.sheet.holes, 9);
  close(d.cost.netCost, d.mass.kg * 30);
});

test('sobreescritura de unidades: placa como pulgadas escala el área por 25.4²', () => {
  const drawing = load('placa-soporte');
  const mm = prepareProfile(drawing);
  const inch = prepareProfile(drawing, { unitOverride: 'in' });
  assert.equal(inch.toMM, UNIT_FACTORS.in);
  const op = defaultOpState(mm);
  const aMM = profileSummary(mm, op).netArea, aIn = profileSummary(inch, op).netArea;
  close(aIn, aMM * 25.4 ** 2);
  // El espesor sigue en mm: V = área·t.
  close(analyticVolume(inch, op), aIn * op.thickness);
  close(K.build(makeJob(inch, op)).props.volume, aIn * op.thickness, 1e-9);
  assert.equal(prepareProfile(drawing, { unitOverride: 2 }).toMM, 2);
  assert.throws(() => prepareProfile(drawing, { unitOverride: 'yd' }), /Unidad desconocida/);
});

test('leva-spline: unidades en pulgadas detectadas', () => {
  const d = load('leva-spline');
  assert.deepEqual(d.units, { name: 'in', toMM: 25.4, detected: true });
  assert.equal(prepareProfile(d).toMM, 25.4);
});

test('ignoreDashed=false en brida-bloques: el círculo PCD se vuelve contorno', () => {
  const d = load('brida-bloques');
  const a = prepareProfile(d), b = prepareProfile(d, { ignoreDashed: false });
  assert.equal(a.stats.loops, 10);
  assert.equal(b.stats.loops, 11);
  assert.equal(a.stats.dashedRemoved, 3);
});

// Plano sintético: marco de doble línea con dos piezas dentro, y una capa congelada.
const L = (p0, p1, layer = 'CONTORNO') => ({ type: 'line', p0, p1, meta: { layer } });
const rectSegs = (x0, y0, x1, y1, layer) => [L([x0, y0], [x1, y0], layer), L([x1, y0], [x1, y1], layer), L([x1, y1], [x0, y1], layer), L([x0, y1], [x0, y0], layer)];
const synthetic = () => ({
  format: 'dxf', fileName: 'marco.dxf', units: { name: 'mm', toMM: 1, detected: true },
  layers: [{ name: 'MARCO' }, { name: 'CONTORNO' }, { name: 'VIEJO', frozen: true }],
  segments: [
    ...rectSegs(0, 0, 420, 297, 'MARCO'),
    ...rectSegs(10, 10, 410, 287, 'MARCO'),
    ...rectSegs(50, 50, 150, 100),
    { type: 'circle', c: [100, 75], r: 10, ccw: true, meta: { layer: 'CONTORNO' } },
    { type: 'circle', c: [300, 150], r: 40, ccw: true, meta: { layer: 'CONTORNO' } },
    ...rectSegs(200, 200, 260, 240, 'VIEJO'),
  ],
  texts: [], warnings: [], stats: {},
});

const FRAME_WARN = 'Se detectó el marco del plano y se excluyó del modelo (haz clic en él para incluirlo).';

test('marco del plano: se excluye y se avisa; capas congeladas/ocultas se descartan', () => {
  const profile = prepareProfile(synthetic());
  assert.equal(profile.stats.hiddenRemoved, 4);
  // El marco de doble línea sale de las regiones; sus contornos siguen en loops.
  assert.equal(profile.regions.length, 2);
  assert.deepEqual(profile.frameLoops.map((i) => profile.loopInfos[i].area).sort((a, b) => a - b), [400 * 277, 420 * 297]);
  assert.ok(profile.frameLoops.every((i) => profile.nodes[i].frame));
  assert.ok(profile.warnings.includes(FRAME_WARN));
  const op = defaultOpState(profile);
  assert.equal(op.regions.filter((r) => r.included).length, 2);
  assert.deepEqual(op.warnings, []);
  op.thickness = 3;
  const job = makeJob(profile, op);
  assert.equal(job.regions.length, 2);
  const r = K.build(job);
  close(r.props.volume, 3 * (5000 - 100 * PI + 1600 * PI), 1e-9);
  close(analyticVolume(profile, op), r.props.volume);
  // Ocultar la capa del marco deja solo las piezas, sin aviso.
  const p2 = prepareProfile(synthetic(), { hiddenLayers: ['MARCO'] });
  assert.equal(p2.regions.length, 2);
  assert.deepEqual(p2.frameLoops, []);
  assert.ok(!p2.warnings.includes(FRAME_WARN));
  assert.deepEqual(defaultOpState(p2).warnings, []);
  // Una placa rectangular con agujeros simples no es marco.
  const plate = prepareProfile({ ...synthetic(), segments: [...rectSegs(0, 0, 100, 50), { type: 'circle', c: [20, 25], r: 5, ccw: true, meta: { layer: 'CONTORNO' } }, { type: 'circle', c: [80, 25], r: 5, ccw: true, meta: { layer: 'CONTORNO' } }] });
  assert.ok(defaultOpState(plate).regions.every((r) => r.included));
});

const C = (x, y, r) => ({ type: 'circle', c: [x, y], r, ccw: true, meta: { layer: 'CONTORNO' } });
const drw = (segments) => ({ ...synthetic(), segments });
const regionOf = (profile, area) => profile.regions.findIndex((r) => Math.abs(profile.loopInfos[r.outer].area - area) < 1e-6 * area);

test('(a) placa con agujeros de círculos concéntricos: no es marco; islas concéntricas excluidas', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 200, 100), C(50, 50, 8), C(50, 50, 4.5), C(150, 50, 8), C(150, 50, 4.5)]));
  assert.deepEqual(profile.frameLoops, []);
  assert.ok(!profile.warnings.includes(FRAME_WARN));
  assert.equal(profile.regions.length, 3);
  const op = defaultOpState(profile);
  const plate = regionOf(profile, 20000);
  assert.equal(op.regions[plate].included, true);
  assert.equal(profile.regions[plate].holes.length, 2);
  const islands = op.regions.filter((_, i) => i !== plate);
  assert.equal(islands.length, 2);
  assert.ok(islands.every((r) => r.included === false));
  assert.deepEqual(op.warnings, ['Se ignoraron 2 círculos concéntricos dentro de agujeros (avellanados o roscas)']);
  const r = K.build(makeJob(profile, op));
  close(r.props.volume, 2 * (20000 - 2 * 64 * PI), 1e-9);
});

test('(b) A3 de doble borde con una pieza: marco detectado y sin masa', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 420, 297, 'MARCO'), ...rectSegs(10, 10, 410, 287, 'MARCO'), ...rectSegs(100, 100, 200, 150)]));
  assert.equal(profile.frameLoops.length, 2);
  assert.ok(profile.warnings.includes(FRAME_WARN));
  assert.equal(profile.regions.length, 1);
  assert.equal(profile.loops.length, 3);
  const op = defaultOpState(profile);
  assert.equal(op.regions[0].included, true);
  close(profile.loopInfos[profile.regions[0].outer].area, 5000);
  const build = K.build(makeJob(profile, op));
  const d = computeAll({ build, profile, op, material: findMaterial('acero-a36') });
  close(d.mass.g, 5000 * 2 * 7.85 / 1000, 1e-9);
  // frameLoops explícito (vacío) o detectFrame=false: el marco vuelve a ser región.
  for (const o of [{ frameLoops: [] }, { detectFrame: false }]) {
    const p = prepareProfile(drw([...rectSegs(0, 0, 420, 297, 'MARCO'), ...rectSegs(10, 10, 410, 287, 'MARCO'), ...rectSegs(100, 100, 200, 150)]), o);
    assert.deepEqual(p.frameLoops, []);
    assert.equal(p.regions.length, 2);
    assert.ok(!p.warnings.includes(FRAME_WARN));
  }
  // frameLoops explícito con un solo contorno: el borde interior pasa a ser región y la pieza, su agujero.
  const outer = profile.frameLoops.find((i) => profile.loopInfos[i].area === 420 * 297);
  const p3 = prepareProfile(drw([...rectSegs(0, 0, 420, 297, 'MARCO'), ...rectSegs(10, 10, 410, 287, 'MARCO'), ...rectSegs(100, 100, 200, 150)]), { frameLoops: [outer, 99, -1] });
  assert.deepEqual(p3.frameLoops, [outer]);
  assert.equal(p3.regions.length, 1);
  close(p3.loopInfos[p3.regions[0].outer].area, 400 * 277);
  assert.equal(p3.regions[0].holes.length, 1);
  close(p3.loopInfos[p3.regions[0].holes[0]].area, 5000);
});

test('(c) marco de una línea con una pieza de dos agujeros Ø10: la pieza es región con 2 agujeros', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 420, 297, 'MARCO'), ...rectSegs(50, 50, 150, 100), C(75, 75, 5), C(125, 75, 5)]));
  assert.equal(profile.frameLoops.length, 1);
  close(profile.loopInfos[profile.frameLoops[0]].area, 420 * 297);
  assert.equal(profile.regions.length, 1);
  const r0 = profile.regions[0];
  close(profile.loopInfos[r0.outer].area, 5000);
  assert.equal(r0.holes.length, 2);
  assert.ok(r0.holes.every((h) => profile.loopInfos[h].circle && Math.abs(profile.loopInfos[h].circle.r - 5) < 1e-9));
  assert.equal(profile.nodes[r0.outer].parent, -1);
  const op = defaultOpState(profile);
  close(K.build(makeJob(profile, op)).props.volume, 2 * (5000 - 50 * PI), 1e-9);
});

test('(d) junta rectangular (rectángulo con agujero rectangular, sin islas) no es marco', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 100, 100), ...rectSegs(10, 10, 90, 90)]));
  assert.deepEqual(profile.frameLoops, []);
  assert.equal(profile.regions.length, 1);
  assert.equal(profile.regions[0].holes.length, 1);
  assert.equal(defaultOpState(profile).regions[0].included, true);
});

test('alturas distintas por región: sin datos de lámina', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 100, 100), ...rectSegs(200, 0, 300, 100)]));
  const op = defaultOpState(profile);
  op.thickness = 2;
  const mat = findMaterial('acero-a36');
  assert.ok(computeAll({ build: K.build(makeJob(profile, op)), profile, op, material: mat }).sheet);
  op.regions[1].height = 20;
  const build = K.build(makeJob(profile, op));
  const d = computeAll({ build, profile, op, material: mat, pricePerKg: 10 });
  assert.equal(d.sheet, null);
  assert.equal(d.sheetNote, 'Datos de lámina no aplican: hay regiones con alturas distintas.');
  close(d.mass.g, (10000 * 2 + 10000 * 20) * 7.85 / 1000, 1e-9);
  // Un z0 distinto también cambia el apilado.
  const op2 = defaultOpState(profile);
  op2.regions[1].z0 = 5;
  assert.equal(computeAll({ build: K.build(makeJob(profile, op2)), profile, op: op2, material: mat }).sheet, null);
});

test("agujero 'none' con isla dentro: la isla queda en material macizo", () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 100, 100), C(50, 50, 10), C(50, 50, 5)]));
  const op = defaultOpState(profile);
  const plate = regionOf(profile, 10000), island = 1 - plate;
  op.regions[island].included = true;
  op.regions[plate].holes[0].op = 'none';
  const build = K.build(makeJob(profile, op));
  close(build.props.volume, 20000, 1e-9);
  assert.equal(analyticVolume(profile, op), 20000);
  const s = profileSummary(profile, op);
  assert.equal(s.netArea, 10000);
  assert.equal(s.perimeterInner, 0);
  assert.equal(s.holes.length, 0);
  close(s.perimeterOuter, 400);
  const d = computeAll({ build, profile, op, material: findMaterial('acero-a36') });
  assert.ok(d.sheet.utilization <= 100 + 1e-9, `aprovechamiento ${d.sheet.utilization}`);
  assert.ok(d.sheet.scrapWeight.g >= -1e-9);
  close(d.sheet.cutLength, 400);
  // Isla más alta que la placa: no deducible analíticamente.
  op.regions[island].height = 5;
  assert.equal(analyticVolume(profile, op), null);
});

test('agujero ciego: peso neto = masa del kernel y no cuenta como agujero', () => {
  const profile = prepareProfile(drw([...rectSegs(0, 0, 100, 100), C(50, 50, 20)]));
  const op = { ...defaultOpState(profile), thickness: 4 };
  op.regions[0].holes[0] = { op: 'blind', depth: 2 };
  const build = K.build(makeJob(profile, op));
  close(build.props.volume, 40000 - 400 * PI * 2, 1e-9);
  const d = computeAll({ build, profile, op, material: findMaterial('acero-a36') });
  close(d.sheet.netWeight.g, d.mass.g, 1e-12);
  assert.equal(d.sheet.holes, 0);
  assert.equal(d.sheet.minHoleDiameter, null);
});

test('eje por defecto: trazos de una capa oculta no cuentan', () => {
  const base = synthetic();
  const d = { ...base, layers: [...base.layers, { name: 'EJES' }], segments: [...base.segments, { type: 'line', p0: [30, 40], p1: [0, 0], meta: { layer: 'EJES', dashed: true } }] };
  assert.equal(defaultOpState(prepareProfile(d)).revolve.axisKind, 'line');
  const p = prepareProfile(d, { hiddenLayers: ['EJES'] });
  assert.equal(p.axisLines.length, 0);
  assert.equal(defaultOpState(p).revolve.axisKind, 'x');
});

test('eje por defecto: sin trazos → eje X; trazo oblicuo → línea normalizada', () => {
  const base = synthetic();
  assert.equal(defaultOpState(prepareProfile(base)).revolve.axisKind, 'x');
  const withAxis = { ...base, segments: [...base.segments, { type: 'line', p0: [30, 40], p1: [0, 0], meta: { layer: 'EJES', dashed: true } }] };
  const rv = defaultOpState(prepareProfile(withAxis, { unitOverride: 'cm' })).revolve;
  assert.equal(rv.axisKind, 'line');
  assert.deepEqual(rv.axis.p, [300, 400]);
  close(rv.axis.d[0], 0.6); close(rv.axis.d[1], 0.8);
});

test('detectFormat por extensión y por contenido', () => {
  assert.equal(detectFormat('Plano.DXF'), 'dxf');
  assert.equal(detectFormat('logo.svg'), 'svg');
  assert.equal(detectFormat('foto.JPEG'), 'image');
  assert.equal(detectFormat('sin-extension', '  0\r\nSECTION\r\n  2\r\nHEADER'), 'dxf');
  assert.equal(detectFormat('sin-extension', new TextEncoder().encode('0\nSECTION\n')), 'dxf');
  assert.equal(detectFormat('nota.txt', 'hola'), null);
});

test('makeJob: regiones excluidas fuera, agujeros none fuera, sin meta, calidad de malla', () => {
  const profile = prepareProfile(load('placa-soporte'));
  const op = defaultOpState(profile);
  op.regions[0].holes[0].op = 'none';
  const job = makeJob(profile, op, { meshQuality: 'high' });
  assert.equal(job.regions[0].id, 1);
  assert.equal(job.regions[0].holes.length, 5);
  assert.ok(job.regions[0].outer.segs.every((s) => !('meta' in s)));
  assert.ok(job.mesh.tolerance > 0 && job.mesh.angularTolerance === 0.08);
  op.regions[0].included = false;
  assert.throws(() => makeJob(profile, op), /No hay regiones incluidas/);
});

// SVG e imagen: solo si sus importadores reales ya están en el árbol.
const realModule = (rel) => {
  const p = path.join(root, rel);
  return fs.existsSync(p) && !fs.readFileSync(p, 'utf8').includes('PLACEHOLDER-NO-COMMIT');
};

test('SVG: rectángulo con agujero', { skip: !realModule('src/importers/svg.js') && 'importador SVG no disponible' }, () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="50mm" viewBox="0 0 100 50"><rect x="0" y="0" width="100" height="50"/><circle cx="50" cy="25" r="10"/></svg>';
  const d = importText('svg', svg, 'p.svg');
  assert.equal(d.format, 'svg');
  const profile = prepareProfile(d);
  assert.deepEqual(profile.regions.map((r) => r.holes.length), [1]);
  close(profileSummary(profile, defaultOpState(profile)).netArea, 5000 - 100 * PI, 1e-6);
});

test('imagen: cuadrado negro trazado a escala', { skip: !realModule('src/importers/image-trace.js') && 'trazador de imagen no disponible' }, () => {
  const W = 64, H = 64, data = new Uint8ClampedArray(W * H * 4).fill(255);
  for (let y = 16; y < 48; y++) for (let x = 16; x < 48; x++) data.fill(0, (y * W + x) * 4, (y * W + x) * 4 + 3);
  const d = importImage({ width: W, height: H, data }, { mmPerPx: 0.5 });
  assert.equal(d.format, 'image');
  assert.equal(d.units.toMM, 0.5);
  const profile = prepareProfile(d);
  assert.ok(profile.regions.length >= 1);
  const a = profileSummary(profile, defaultOpState(profile)).netArea;
  assert.ok(Math.abs(a - 256) / 256 < 0.1, `área ${a}`);
});
