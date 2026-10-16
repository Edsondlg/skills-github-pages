import test from 'node:test';
import assert from 'node:assert/strict';
import { MATERIALS, findMaterial, materialGroups, customMaterial, CUSTOM_MATERIAL_ID } from '../src/ui/materials.js';
import { computePartData, makeFormatter, fmt, toCSV, toJSON, reportHTML } from '../src/ui/report.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

function boxBuild(x, y, z) {
  const V = x * y * z;
  return {
    props: {
      volume: V, area: 2 * (x * y + x * z + y * z), centroid: [x / 2, y / 2, z / 2],
      inertia: { Ixx: V * (y * y + z * z) / 12, Iyy: V * (x * x + z * z) / 12, Izz: V * (x * x + y * y) / 12, Pxy: 0, Pxz: 0, Pyz: 0 },
      principal: { moments: [1, 2, 3], axes: null },
      bbox: { min: [0, 0, 0], max: [x, y, z], size: [x, y, z] },
      counts: { solids: 1, shells: 1, faces: 6, edges: 12, vertices: 8, faceTypes: { PLANE: 6 } },
      valid: true, closed: true,
    },
  };
}

test('caja 100x50x10 en A36: masa e inercia', () => {
  const mat = findMaterial('acero-a36');
  const b = boxBuild(100, 50, 10);
  const d = computePartData({ build: b, material: mat, mode: 'multiview' });
  close(d.mass.g, 392.5);
  close(d.mass.kg, 0.3925);
  close(d.mass.lb, 392.5 / 453.59237);
  close(d.volume.cm3, 50);
  const Izz = (50000 * (100 ** 2 + 50 ** 2)) / 12;
  close(d.inertia.Izz, 7.85 * 1e-6 * Izz);
  close(d.inertiaUnits.kgm2.Izz, d.inertia.Izz * 1e-6);
  close(d.inertiaUnits.lbin2.Izz, d.inertia.Izz * 3.41717);
  close(d.gyration.z, Math.sqrt(d.inertia.Izz / d.mass.kg));
  close(d.bbox.diagonal, Math.hypot(100, 50, 10));
  assert.equal(d.sheet, null);
});

test('datos de lámina y fuerza de corte', () => {
  const profile = {
    netArea: 4500, perimeterOuter: 300, perimeterInner: 62.83, loops: 2,
    holes: [{ d: 20, c: [50, 25] }], bbox2d: { minX: 0, minY: 0, maxX: 100, maxY: 50 },
  };
  const build = boxBuild(100, 50, 2);
  const al = findMaterial('al-5052-h32');
  const d = computePartData({ build: boxBuild(90, 50, 2), material: al, profile, mode: 'extrude', thickness: 2, pricePerKg: 10 });
  const s = d.sheet;
  close(s.blankArea, 5000);
  close(s.utilization, 90);
  close(s.cutLength, 362.83);
  close(s.cuttingForce.N, 362.83 * 2 * 140);
  close(s.cuttingForce.tonf, s.cuttingForce.N / 9806.65);
  close(s.strippingForce.N, s.cuttingForce.N * 0.1);
  close(s.grossWeight.g, (5000 * 2 * 2.68) / 1000);
  close(s.scrapPct, 10);
  assert.equal(s.holes, 1);
  assert.equal(s.minHoleDiameter, 20);
  assert.ok(d.cost.blankCost > d.cost.netCost);

  const noShear = { ...al, id: 'x', shear: undefined, uts: 400 };
  close(computePartData({ build, material: noShear, profile, mode: 'extrude', thickness: 2 }).sheet.cuttingForce.N, 362.83 * 2 * 320);
  const none = { id: 'y', name: 'Y', density: 1 };
  assert.equal(computePartData({ build, material: none, profile, mode: 'extrude', thickness: 2 }).sheet.cuttingForce, null);
  // margen del desarrollo
  close(computePartData({ build, material: al, profile, mode: 'extrude', thickness: 2, blankMargin: 5 }).sheet.blankWidth, 110);
});

test('verificación de precisión', () => {
  const d = computePartData({ build: boxBuild(10, 10, 10), material: findMaterial('abs'), mode: 'multiview', analyticVolume: 1000.001 });
  close(d.precision.relError, 0.001 / 1000.001);
});

test('formato imperial y métrico', () => {
  const im = makeFormatter('imperial');
  assert.equal(im.len(25.4), '1.0000 in');
  assert.equal(im.mass(453.59237), '1.000 lb');
  assert.equal(im.mass(28.349523125), '1.000 oz');
  const me = makeFormatter('metric');
  assert.equal(me.len(12.3456), '12.346 mm');
  assert.equal(me.mass(392.5), '392.500 g');
  assert.equal(me.mass(1500), '1.500 kg');
  assert.equal(me.density(7.85), '7.850 g/cm³');
  fmt.setSystem('imperial');
  assert.equal(fmt.len(25.4), '1.0000 in');
  fmt.setSystem('metric');
  assert.equal(fmt.len(25.4), '25.400 mm');
});

test('CSV, JSON y HTML', () => {
  const d = computePartData({ build: boxBuild(100, 50, 10), material: findMaterial('acero-a36'), mode: 'multiview' });
  const meas = [{ title: 'Dist, "A-B"', text: '12.5 mm, línea' }];
  const csv = toCSV(d, meas);
  assert.equal(csv.split('\n')[0], 'Propiedad,Valor,Unidad');
  assert.ok(csv.includes('"Medición: Dist, ""A-B"""'));
  assert.ok(csv.includes('"12.5 mm, línea"'));
  const back = JSON.parse(toJSON(d, meas));
  assert.equal(back.mass.g, d.mass.g);
  assert.deepEqual(back.measurements, meas);
  const html = reportHTML(d, { fileName: 'pieza <1>.dxf', imageDataURL: 'data:image/png;base64,AAAA', measurements: meas, date: '2026-01-01' });
  assert.ok(html.includes('Reporte de pieza'));
  assert.ok(html.includes('pieza &lt;1&gt;.dxf'));
  assert.ok(html.includes(makeFormatter('metric').mass(d.mass.g)));
  assert.ok(html.includes('data:image/png;base64,AAAA'));
  assert.ok(reportHTML(d, { system: 'imperial' }).includes('lb'));
});

test('catálogo de materiales', () => {
  const ids = new Set();
  for (const m of MATERIALS) {
    assert.ok(!ids.has(m.id), `id repetido ${m.id}`);
    ids.add(m.id);
    assert.ok(m.density > 0, m.id);
    assert.match(m.color, /^#[0-9a-f]{6}$/, m.id);
    assert.ok(m.metalness >= 0 && m.metalness <= 1 && m.roughness >= 0 && m.roughness <= 1, m.id);
  }
  assert.equal(findMaterial('acero-a36').density, 7.85);
  assert.equal(materialGroups().reduce((n, g) => n + g.items.length, 0), MATERIALS.length);
  assert.equal(customMaterial(3.3, 'X').id, CUSTOM_MATERIAL_ID);
});

test('agujeros de forma libre (d = null) no anulan el Ø mínimo', () => {
  const build = { props: { volume: 9000, area: 1, centroid: [0, 0, 0], inertia: { Ixx: 0, Iyy: 0, Izz: 0, Pxy: 0, Pxz: 0, Pyz: 0 }, principal: { moments: [0, 0, 0], axes: [] }, bbox: { min: [0, 0, 0], max: [100, 50, 2], size: [100, 50, 2] }, counts: {}, valid: true, closed: true } };
  const profile = { netArea: 4500, perimeterOuter: 300, perimeterInner: 50, loops: 3, holes: [{ d: null, c: [10, 10] }, { d: 8.5, c: [50, 25] }], bbox2d: { minX: 0, minY: 0, maxX: 100, maxY: 50 } };
  const pd = computePartData({ build, material: findMaterial('a36') ?? MATERIALS[0], profile, mode: 'extrude', thickness: 2 });
  assert.equal(pd.sheet.minHoleDiameter, 8.5);
});
