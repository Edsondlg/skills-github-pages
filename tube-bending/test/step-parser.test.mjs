import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStep } from '../js/step-parser.js';

const wrap = (data, schema = 'AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }') => `ISO-10303-21;
HEADER;
FILE_DESCRIPTION((''),'2;1');
FILE_NAME('pieza.stp','2026-01-01T00:00:00',('a'),('b'),'x','y','');
FILE_SCHEMA(('${schema}'));
ENDSEC;
DATA;
${data}
ENDSEC;
END-ISO-10303-21;
`;

const unitsBlock = (lengthUnit, angleUnit = '#91 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );') => `
#90 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#93)) GLOBAL_UNIT_ASSIGNED_CONTEXT((#92,#91,#94)) REPRESENTATION_CONTEXT('Context #1','3D Context') );
${lengthUnit}
${angleUnit}
#93 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#92,'distance_accuracy_value','x');
#94 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );`;

test('header, simple entities, refs, numbers, enums, $, * and nested lists', () => {
  const p = parseStep(wrap(`#1 = CARTESIAN_POINT('',(1.,-2.5E-1,3));
#2 = ORIENTED_EDGE('',*,*,#3,.T.);
#3 = EDGE_CURVE('e',#4,$,#1,.F.);
#4 = B_SPLINE_CURVE_WITH_KNOTS('',3,((#1,#1),(#1)),.UNSPECIFIED.,.F.,.F.,(4,4),(0.,1.),.PIECEWISE_BEZIER_KNOTS.);
#5 = PRODUCT('id-1','Tubo escape','',(#6));`));
  assert.equal(p.header.fileName, 'pieza.stp');
  assert.match(p.header.schema, /AUTOMOTIVE_DESIGN/);
  assert.deepEqual(p.header.productNames, ['Tubo escape']);
  assert.equal(p.entities.size, 5);
  assert.deepEqual(p.entities.get(1), { id: 1, type: 'CARTESIAN_POINT', args: ['', [1, -0.25, 3]] });
  assert.deepEqual(p.entities.get(2).args, ['', '*', '*', { ref: 3 }, { enum: 'T' }]);
  assert.deepEqual(p.entities.get(3).args, ['e', { ref: 4 }, null, { ref: 1 }, { enum: 'F' }]);
  assert.deepEqual(p.entities.get(4).args[2], [[{ ref: 1 }, { ref: 1 }], [{ ref: 1 }]]);
});

test('complex entity instances', () => {
  const p = parseStep(wrap(`#7 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#8=(BOUNDED_SURFACE()B_SPLINE_SURFACE(1,1,((#1,#2)),.UNSPECIFIED.,.F.,.F.,.F.)REPRESENTATION_ITEM(''));`));
  const e = p.entities.get(7);
  assert.equal(e.type, 'COMPLEX');
  assert.deepEqual(e.parts, [
    { type: 'LENGTH_UNIT', args: [] },
    { type: 'NAMED_UNIT', args: ['*'] },
    { type: 'SI_UNIT', args: [{ enum: 'MILLI' }, { enum: 'METRE' }] },
  ]);
  const b = p.entities.get(8);
  assert.deepEqual(b.parts.map((x) => x.type), ['BOUNDED_SURFACE', 'B_SPLINE_SURFACE', 'REPRESENTATION_ITEM']);
  assert.deepEqual(b.parts[1].args[2], [[{ ref: 1 }, { ref: 2 }]]);
});

test('typed parameters', () => {
  const p = parseStep(wrap(`#1 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#2,'d','');
#3 = PROPERTY_VALUE(( POSITIVE_LENGTH_MEASURE(25.4), DESCRIPTIVE_MEASURE('x') ));`));
  assert.deepEqual(p.entities.get(1).args[0], { type: 'LENGTH_MEASURE', args: [1e-7] });
  assert.deepEqual(p.entities.get(3).args[0], [
    { type: 'POSITIVE_LENGTH_MEASURE', args: [25.4] },
    { type: 'DESCRIPTIVE_MEASURE', args: ['x'] },
  ]);
});

test('string escapes: doubled quotes, \\X2\\ unicode, \\X\\ and semicolons/parens inside strings', () => {
  const p = parseStep(wrap(`#1 = PRODUCT('it''s','Travesa\\X2\\00F1\\X0\\o (calibre; variable)','\\X\\E9t\\X2\\00E9\\X0\\',());`));
  const a = p.entities.get(1).args;
  assert.equal(a[0], "it's");
  assert.equal(a[1], 'Travesaño (calibre; variable)');
  assert.equal(a[2], 'été');
});

test('comments are skipped and entities may span lines', () => {
  const p = parseStep(wrap(`/* comentario ; #9 = X(); */
#1 = CARTESIAN_POINT('',
   (1.,2.,
    3.)) /* tail */ ;`));
  assert.equal(p.entities.size, 1);
  assert.deepEqual(p.entities.get(1).args[1], [1, 2, 3]);
});

test('units: millimetre and radian', () => {
  const p = parseStep(wrap(unitsBlock('#92 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );')));
  assert.equal(p.lengthScale, 1);
  assert.equal(p.angleScale, 1);
  assert.equal(p.warnings.length, 0);
});

test('units: metre → 1000', () => {
  const p = parseStep(wrap(unitsBlock('#92 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT($,.METRE.) );')));
  assert.equal(p.lengthScale, 1000);
});

test('units: inch (conversion based) and degree', () => {
  const p = parseStep(wrap(unitsBlock(
    `#92 = ( CONVERSION_BASED_UNIT('INCH',#95) LENGTH_UNIT() NAMED_UNIT(#96) );
#95 = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(25.4),#97);
#96 = DIMENSIONAL_EXPONENTS(1.,0.,0.,0.,0.,0.,0.);
#97 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );`,
    `#91 = ( CONVERSION_BASED_UNIT('DEGREE',#98) NAMED_UNIT(#96) PLANE_ANGLE_UNIT() );
#98 = PLANE_ANGLE_MEASURE_WITH_UNIT(PLANE_ANGLE_MEASURE(0.01745329252),#99);
#99 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );`,
  )));
  assert.equal(p.lengthScale, 25.4);
  assert.ok(Math.abs(p.angleScale - Math.PI / 180) < 1e-12);
});

test('units: foot, and unnamed conversion unit falls back on its measure', () => {
  const foot = parseStep(wrap(unitsBlock(`#92 = ( CONVERSION_BASED_UNIT('FOOT',#95) LENGTH_UNIT() NAMED_UNIT(*) );
#95 = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.3048),#97);
#97 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT($,.METRE.) );`)));
  assert.equal(foot.lengthScale, 304.8);
  const custom = parseStep(wrap(unitsBlock(`#92 = ( CONVERSION_BASED_UNIT('PULGADA',#95) LENGTH_UNIT() NAMED_UNIT(*) );
#95 = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(2.54),#97);
#97 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.CENTI.,.METRE.) );`)));
  assert.ok(Math.abs(custom.lengthScale - 25.4) < 1e-9);
});

test('units: missing length unit defaults to mm with a Spanish warning', () => {
  const p = parseStep(wrap(`#1 = CARTESIAN_POINT('',(0.,0.,0.));`));
  assert.equal(p.lengthScale, 1);
  assert.equal(p.warnings.length, 1);
  assert.match(p.warnings[0], /milímetros/);
});

test('rejects non-STEP text with a Spanish message', () => {
  assert.throws(() => parseStep('hola mundo'), /no es un STEP válido/);
});

test('performance: ~5 MB file parses in < 1.5 s', () => {
  const lines = [
    "#{i} = CARTESIAN_POINT('',(424.85280945721,402.73372541309,19.05));",
    "#{i} = EDGE_CURVE('',#22,#24,#26,.T.);",
    "#{i} = ( GEOMETRIC_REPRESENTATION_CONTEXT(2) PARAMETRIC_REPRESENTATION_CONTEXT() REPRESENTATION_CONTEXT('2D SPACE','') );",
    "#{i} = B_SPLINE_CURVE_WITH_KNOTS('',3,(#1,#2,#3,#4),.UNSPECIFIED.,.F.,.F.,(4,4),(0.,1.570796326795),.PIECEWISE_BEZIER_KNOTS.);",
    "#{i} = PRODUCT('it''s','name','',(#8));",
  ];
  const parts = [];
  let size = 0;
  let i = 1;
  while (size < 5 * 1024 * 1024) {
    const l = lines[i % lines.length].replace('{i}', String(i)) + '\n';
    parts.push(l);
    size += l.length;
    i++;
  }
  const text = wrap(parts.join(''));
  const t0 = performance.now();
  const p = parseStep(text);
  const ms = performance.now() - t0;
  assert.equal(p.entities.size, i - 1);
  assert.ok(ms < 1500, `parse took ${ms.toFixed(0)} ms`);
});
