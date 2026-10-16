import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { importStepTube } from '../js/tube-extract.js';

const FIX = new URL('./fixtures/', import.meta.url);
const NAMES = [
  'soporte_3d_hsla',
  'travesano_calibre_variable',
  'escape_5_dobleces',
  'horquilla_180',
  'horquilla_180_barrido',
  'doblez_compuesto',
  'soporte_3d_bspline',
];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(...a);
const dist = (a, b) => norm(sub(a, b));
function rotate(v, n, deg) { // Rodrigues, right-hand about unit n
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const k = cross(n, v);
  const d = dot(n, v) * (1 - c);
  return [v[0] * c + k[0] * s + n[0] * d, v[1] * c + k[1] * s + n[1] * d, v[2] * c + k[2] * s + n[2] * d];
}

function wallAt(wall, s) {
  for (const p of wall) {
    if (s >= p.s0 - 1e-9 && s <= p.s1 + 1e-9) return p.s1 > p.s0 ? p.t0 + ((p.t1 - p.t0) * (s - p.s0)) / (p.s1 - p.s0) : p.t0;
  }
  return NaN;
}
// Range of the truth thickness within [s-w, s+w] (piecewise linear: endpoints + breakpoints inside).
function truthRange(wall, s, w, L) {
  const xs = [Math.max(0, s - w), s, Math.min(L, s + w)];
  for (const p of wall) for (const b of [p.s0, p.s1]) if (b > s - w && b < s + w) xs.push(b);
  const v = xs.map((x) => wallAt(wall, x)).filter((x) => !Number.isNaN(x));
  return [Math.min(...v), Math.max(...v)];
}

function load(name) {
  const text = readFileSync(new URL(`${name}.stp`, FIX), 'utf8');
  const truth = JSON.parse(readFileSync(new URL(`${name}.truth.json`, FIX), 'utf8'));
  return { tube: importStepTube(text, { fileName: `${name}.stp` }), truth };
}

// Truth ordered like our model (generator start may be our end B).
function alignTruth(tube, truth) {
  const L = truth.totalLength;
  if (dist(tube.segments[0].p0, truth.segments[0].p0) < 1) return truth;
  return {
    ...truth,
    segments: truth.segments.slice().reverse().map((g) => ({ ...g, p0: g.p1, p1: g.p0 })),
    wall: truth.wall && truth.wall.slice().reverse().map((p) => ({ s0: L - p.s1, s1: L - p.s0, t0: p.t1, t1: p.t0 })),
  };
}

for (const name of NAMES) {
  test(`fixture ${name}: centerline, OD, lengths and wall match ground truth`, () => {
    const { tube, truth: raw } = load(name);
    const truth = alignTruth(tube, raw);
    assert.equal(tube.units, 'mm');
    assert.equal(tube.source.format, 'STEP');
    assert.ok(Math.abs(tube.OD - truth.OD) <= 0.01, `OD ${tube.OD} vs ${truth.OD}`);
    assert.ok(dist(tube.segments[0].p0, truth.segments[0].p0) < 0.1, 'first point matches one truth end');

    // structure: alternating, starting and ending with straights
    const segs = tube.segments;
    assert.equal(segs[0].type, 'straight');
    assert.equal(segs[segs.length - 1].type, 'straight');
    segs.forEach((g, i) => assert.equal(g.type, i % 2 === 0 ? 'straight' : 'bend', `segment ${i} type`));
    assert.equal(segs.length, truth.segments.length);
    const bends = segs.filter((g) => g.type === 'bend');
    assert.equal(bends.length, truth.segments.filter((g) => g.type === 'bend').length, 'bend count');

    const inferred = tube.source.surfaces.torus === 0;
    let sum = 0;
    segs.forEach((g, i) => {
      const t = truth.segments[i];
      assert.equal(g.type, t.type);
      if (g.type === 'straight') {
        assert.ok(Math.abs(g.length - t.length) <= 0.05, `straight ${i}: ${g.length} vs ${t.length}`);
        assert.ok(Math.abs(norm(g.dir) - 1) < 1e-9);
        if (g.length > 0) assert.ok(dist(g.p1, g.p0) - g.length < 1e-6 && dot(sub(g.p1, g.p0), g.dir) > 0);
        sum += g.length;
      } else {
        assert.ok(Math.abs(g.angle - t.angle) <= 0.05, `bend ${i} angle ${g.angle} vs ${t.angle}`);
        assert.ok(Math.abs(g.clr - t.clr) <= (inferred ? 0.1 : 0.05), `bend ${i} clr ${g.clr} vs ${t.clr}`);
        assert.equal(g.source, inferred ? 'inferred' : 'torus');
        assert.ok(g.angle > 0 && g.angle <= 180);
        assert.ok(dist(g.center, t.center) <= 0.1, `bend ${i} center`);
        assert.ok(Math.abs(dist(g.p0, g.center) - g.clr) <= 0.1 && Math.abs(dist(g.p1, g.center) - g.clr) <= 0.1);
        const r = rotate(g.tIn, g.normal, g.angle);
        assert.ok(dist(r, g.tOut) < 1e-3, `bend ${i}: rotating tIn about normal gives tOut`);
        // continuity with neighbours
        assert.ok(dist(segs[i - 1].p1, g.p0) < 0.1 && dist(segs[i + 1].p0, g.p1) < 0.1);
        assert.ok(dot(segs[i - 1].dir, g.tIn) > 0.9999 && dot(segs[i + 1].dir, g.tOut) > 0.9999);
        sum += (g.clr * g.angle * Math.PI) / 180;
      }
    });
    assert.ok(Math.abs(tube.totalLength - sum) < 1e-6, 'totalLength is the sum of segment lengths');
    assert.ok(Math.abs(tube.totalLength - truth.totalLength) <= 0.2, `total ${tube.totalLength} vs ${truth.totalLength}`);

    // End A: longer end straight first
    assert.ok(segs[0].length >= segs[segs.length - 1].length - 0.05);

    if (truth.wall && truth.wall.length) {
      assert.ok(tube.wall, 'wall profile present');
      const w = tube.wall;
      assert.ok(Math.abs(w[0].s0) < 1e-6 && Math.abs(w[w.length - 1].s1 - tube.totalLength) < 1e-6, 'covers [0, L]');
      for (let k = 1; k < w.length; k++) assert.ok(Math.abs(w[k].s0 - w[k - 1].s1) < 1e-9, 'contiguous');
      const L = tube.totalLength;
      for (let k = 0; k < 50; k++) {
        const s = (L * (k + 0.5)) / 50;
        const t = wallAt(w, s);
        const [lo, hi] = truthRange(truth.wall, s, 0.5, L);
        assert.ok(t >= lo - 0.02 && t <= hi + 0.02, `wall at s=${s.toFixed(2)}: ${t} not in [${lo}, ${hi}]`);
      }
    }
    assert.equal(tube.variableWall, name === 'travesano_calibre_variable');
    assert.ok(Array.isArray(tube.source.warnings));
    if (inferred) assert.ok(tube.source.warnings.some((m) => /infirieron/.test(m)));
  });
}

test('variable wall: min/max/nominal thickness of travesano_calibre_variable', () => {
  const { tube } = load('travesano_calibre_variable');
  assert.ok(Math.abs(tube.minWall - 1.2) < 0.01 && Math.abs(tube.maxWall - 2.4) < 0.01);
  assert.ok(Math.abs(tube.nominalWall - 1.2) < 0.01, `nominal ${tube.nominalWall}`);
  const constant = load('escape_5_dobleces').tube;
  assert.ok(Math.abs(constant.nominalWall - 1.5) < 0.01 && constant.variableWall === false);
});

test('surface counts and metadata', () => {
  const { tube } = load('soporte_3d_bspline');
  assert.deepEqual(tube.source.surfaces, { cylinder: 8, torus: 0, cone: 0, plane: 2, bspline: 6, other: 0 });
  assert.equal(tube.source.lengthScale, 1);
  assert.ok(tube.source.entityCount > 100);
  assert.match(tube.source.schema, /AUTOMOTIVE_DESIGN/);
  assert.equal(typeof tube.name, 'string');
});

test('length unit scaling: metre file gives the same tube in mm', () => {
  const text = readFileSync(new URL('horquilla_180.stp', FIX), 'utf8');
  // Same numbers declared in metres: every length must come out 1000× bigger in mm.
  const metre = text.replace('SI_UNIT(.MILLI.,.METRE.)', 'SI_UNIT($,.METRE.)');
  assert.notEqual(metre, text);
  const t = importStepTube(metre);
  assert.ok(Math.abs(t.OD - 25400) < 1e-6);
  assert.ok(Math.abs(t.totalLength - 919389.3) < 1);
  assert.equal(t.source.lengthScale, 1000);
});

test('missing inner surface: wall null, or defaultWall with a warning', () => {
  // Plain-face-only STEP with one cylinder face (no inner surface).
  const step = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION((''),'2;1');
FILE_NAME('c.stp','',(''),(''),'','','');
FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));
ENDSEC;
DATA;
#1 = MANIFOLD_SOLID_BREP('',#2);
#2 = CLOSED_SHELL('',(#3));
#3 = ADVANCED_FACE('',(#4),#20,.T.);
#4 = FACE_BOUND('',#5,.T.);
#5 = EDGE_LOOP('',(#6));
#6 = ORIENTED_EDGE('',*,*,#7,.T.);
#7 = EDGE_CURVE('',#8,#10,#30,.T.);
#8 = VERTEX_POINT('',#9);
#9 = CARTESIAN_POINT('',(0.,10.,0.));
#10 = VERTEX_POINT('',#11);
#11 = CARTESIAN_POINT('',(0.,10.,100.));
#20 = CYLINDRICAL_SURFACE('',#21,10.);
#21 = AXIS2_PLACEMENT_3D('',#22,$,$);
#22 = CARTESIAN_POINT('',(0.,0.,0.));
#30 = LINE('',#9,#31);
#90 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNIT_ASSIGNED_CONTEXT((#92)) REPRESENTATION_CONTEXT('','') );
#92 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
ENDSEC;
END-ISO-10303-21;
`;
  const a = importStepTube(step, { fileName: 'recto.stp' });
  assert.equal(a.OD, 20);
  assert.equal(a.segments.length, 1);
  assert.ok(Math.abs(a.segments[0].length - 100) < 1e-9);
  assert.equal(a.wall, null);
  assert.equal(a.nominalWall, null);
  assert.equal(a.name, 'recto');
  const b = importStepTube(step, { defaultWall: 1.5 });
  assert.deepEqual(b.wall, [{ s0: 0, s1: 100, t0: 1.5, t1: 1.5 }]);
  assert.equal(b.nominalWall, 1.5);
  assert.ok(b.source.warnings.some((m) => /espesor de pared indicado/.test(m)));
});

test('error path: a STEP with only a PLANE face throws a Spanish, actionable error', () => {
  const step = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION((''),'2;1');
FILE_NAME('placa.stp','',(''),(''),'','','');
FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF'));
ENDSEC;
DATA;
#1 = MANIFOLD_SOLID_BREP('',#2);
#2 = CLOSED_SHELL('',(#3));
#3 = ADVANCED_FACE('',(#4),#20,.T.);
#4 = FACE_BOUND('',#5,.T.);
#5 = EDGE_LOOP('',(#6));
#6 = ORIENTED_EDGE('',*,*,#7,.T.);
#7 = EDGE_CURVE('',#8,#8,#30,.T.);
#8 = VERTEX_POINT('',#9);
#9 = CARTESIAN_POINT('',(0.,0.,0.));
#20 = PLANE('',#21);
#21 = AXIS2_PLACEMENT_3D('',#9,$,$);
ENDSEC;
END-ISO-10303-21;
`;
  assert.throws(() => importStepTube(step), (e) => e instanceof Error && /No se encontraron superficies cilíndricas/.test(e.message) && /tubo/.test(e.message));
});
