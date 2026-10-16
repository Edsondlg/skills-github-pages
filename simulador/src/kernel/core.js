// Núcleo CAD: construcción B-rep exacta (OpenCascade vía replicad), propiedades físicas,
// medición de distancias, teselado y exportación STEP/STL. Corre en Node y en el navegador.
import opencascade from 'replicad-opencascadejs';
import * as R from 'replicad';
import { segInvalidReason } from '../geom2d/segments.js';

let oc = null;
let current = null; // { shape, faces: Map, edges: Map, vertices: Map }
let currentId = null; // buildId del trabajo que generó `current` (lo asigna la interfaz)

const TAU = Math.PI * 2;
// Integración de Gauss de OCCT: exacta en geometría analítica y polinómica. Las splines
// racionales se aproximan con polinómicas (ver makeSplineEdge) porque ahí pierde precisión.
// Propiedades de masa. Con curvas y superficies analíticas (incluida la elipse) la Gauss por
// defecto de OCCT es exacta y rápida; con B-splines/Bézier comete errores de ~3e-4, así que ahí
// se usa Gauss–Kronrod adaptativa por tramo (IsUseSpan), que coincide con el área 2D exacta (~1e-9).
const GPROP_EPS = 1e-7;
// «free» (forma libre) se calcula una vez por forma con el recorrido indexado de la topología.
const gpropVolume = (w, g, free) => (free
  ? oc.BRepGProp.VolumePropertiesGK(w, g, GPROP_EPS, false, true, true, true, false)
  : oc.BRepGProp.VolumeProperties(w, g, false, false, false));
const gpropSurface = (w, g, free) => (free
  ? oc.BRepGProp.SurfaceProperties(w, g, GPROP_EPS, false)
  : oc.BRepGProp.SurfaceProperties(w, g, false, false));
// Tolerancia (mm) de la aproximación polinómica de splines racionales.
const RATIONAL_APPROX_TOL = 1e-5;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export async function init({ wasmBinary } = {}) {
  if (oc) return { ms: 0 };
  const t0 = now();
  oc = wasmBinary ? await opencascade({ wasmBinary }) : await opencascade();
  R.setOC(oc);
  return { ms: now() - t0 };
}

function needOC() {
  if (!oc) throw new Error('El motor CAD no está inicializado.');
}

// ---------- Recorrido de topología sin fugas ----------
// R.iterTopo deduplica con IsSame en O(n²) y nunca libera los TopoDS intermedios; aquí se usa un
// mapa indexado (hash de OCCT) y se libera todo salvo los objetos devueltos (los libera el llamante).
const TOPO = {
  vertex: ['TopAbs_VERTEX', 'Vertex'], edge: ['TopAbs_EDGE', 'Edge'], face: ['TopAbs_FACE', 'Face'],
  shell: ['TopAbs_SHELL', 'Shell'], solid: ['TopAbs_SOLID', 'Solid'],
};
function mapShapes(w, kind) {
  const [en, cast] = TOPO[kind];
  // TopTools_IndexedMapOfShape no es construible en esta compilación (NCollection_BaseMap sin
  // enlazar): se agrupa por hash de OCCT y solo se compara IsSame dentro de cada cubeta.
  const buckets = new Map();
  const ex = new oc.TopExp_Explorer(w, oc.TopAbs_ShapeEnum[en], oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
  const out = [];
  try {
    for (; ex.More(); ex.Next()) {
      const cur = ex.Current();
      const h = oc.ReplicadShapeHasher.HashCode(cur, R.HASH_CODE_MAX);
      const list = buckets.get(h);
      if (!list || !list.some((s) => s.IsSame(cur))) {
        const s = oc.TopoDS[cast](cur);
        out.push(s);
        if (list) list.push(s); else buckets.set(h, [s]);
      }
      cur.delete();
    }
  } finally {
    ex.delete();
  }
  return out;
}
const deleteAll = (list) => { for (const x of list) x.delete(); };

// Tipos geométricos (nombre interno, forma libre) leídos con adaptadores que se liberan.
const CURVE_KINDS = { GeomAbs_Line: 'line', GeomAbs_Circle: 'circle', GeomAbs_Ellipse: 'ellipse', GeomAbs_BezierCurve: 'bspline', GeomAbs_BSplineCurve: 'bspline' };
const FREE_CURVES = ['GeomAbs_BezierCurve', 'GeomAbs_BSplineCurve', 'GeomAbs_OffsetCurve', 'GeomAbs_OtherCurve'];
const SURF_KINDS = { GeomAbs_Plane: 'plane', GeomAbs_Cylinder: 'cylinder', GeomAbs_Cone: 'cone', GeomAbs_Sphere: 'sphere', GeomAbs_Torus: 'torus', GeomAbs_BezierSurface: 'bspline', GeomAbs_BSplineSurface: 'bspline' };
const FREE_SURFS = ['GeomAbs_BezierSurface', 'GeomAbs_BSplineSurface', 'GeomAbs_OffsetSurface', 'GeomAbs_OtherSurface'];
let typeTables = null;
function typeOf(w, isFace) {
  if (!typeTables || typeTables.oc !== oc) {
    const tbl = (en, kinds, free) => new Map(Object.keys(en).filter((k) => k.startsWith('GeomAbs_'))
      .map((k) => [en[k], { kind: kinds[k] || 'other', free: free.includes(k) }]));
    typeTables = { oc, curve: tbl(oc.GeomAbs_CurveType, CURVE_KINDS, FREE_CURVES), surf: tbl(oc.GeomAbs_SurfaceType, SURF_KINDS, FREE_SURFS) };
  }
  const ad = isFace ? new oc.BRepAdaptor_Surface(w, true) : new oc.BRepAdaptor_Curve(w);
  const t = ad.GetType();
  ad.delete();
  return (isFace ? typeTables.surf : typeTables.curve).get(t) || { kind: 'other', free: true };
}
// ¿Alguna arista o cara de forma libre? (decide la integración de las propiedades de masa)
function freeformOf(w) {
  for (const [kind, isFace] of [['face', true], ['edge', false]]) {
    const list = mapShapes(w, kind);
    const free = list.some((x) => typeOf(x, isFace).free);
    deleteAll(list);
    if (free) return true;
  }
  return false;
}

// ---------- Geometría 2D de segmentos (contrato C1, implementación propia) ----------

const normAng = (a) => {
  let r = a % TAU;
  if (r <= 1e-12) r += TAU;
  return r;
};
const arcSweep = (s) => (s.ccw ? normAng(s.a1 - s.a0) : normAng(s.a0 - s.a1));
const ellSweep = (s) => (s.ccw ? normAng(s.t1 - s.t0) : normAng(s.t0 - s.t1));
const isFullSweep = (sw) => sw >= TAU - 1e-9;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function ellPoint(s, t) {
  const c = Math.cos(s.rot || 0), sn = Math.sin(s.rot || 0);
  const x = s.rx * Math.cos(t), y = s.ry * Math.sin(t);
  return [s.c[0] + c * x - sn * y, s.c[1] + sn * x + c * y];
}

function nurbsPoint(s, u) {
  const p = s.degree, U = s.knots, P = s.ctrl, W = s.weights;
  const n = P.length;
  let k = p;
  while (k < n - 1 && U[k + 1] <= u) k++;
  const d = [];
  for (let j = 0; j <= p; j++) {
    const w = W ? W[j + k - p] : 1;
    const q = P[j + k - p];
    d.push([q[0] * w, q[1] * w, w]);
  }
  for (let r = 1; r <= p; r++) {
    for (let j = p; j >= r; j--) {
      const i = j + k - p;
      const den = U[i + p - r + 1] - U[i];
      const a = den === 0 ? 0 : (u - U[i]) / den;
      for (let m = 0; m < 3; m++) d[j][m] = (1 - a) * d[j - 1][m] + a * d[j][m];
    }
  }
  return [d[p][0] / d[p][2], d[p][1] / d[p][2]];
}

// Punto del segmento para t ∈ [0, 1] (proporcional al parámetro).
function segPoint(s, t) {
  switch (s.type) {
    case 'line':
      return [s.p0[0] + (s.p1[0] - s.p0[0]) * t, s.p0[1] + (s.p1[1] - s.p0[1]) * t];
    case 'arc': {
      const a = s.a0 + (s.ccw ? 1 : -1) * arcSweep(s) * t;
      return [s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)];
    }
    case 'circle': {
      const a = (s.ccw ? 1 : -1) * TAU * t;
      return [s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)];
    }
    case 'ellipse':
      return ellPoint(s, s.t0 + (s.ccw ? 1 : -1) * ellSweep(s) * t);
    case 'bezier': {
      const [a, b, c, d] = s.pts, m = 1 - t;
      const k0 = m * m * m, k1 = 3 * m * m * t, k2 = 3 * m * t * t, k3 = t * t * t;
      return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]];
    }
    case 'spline': {
      const u0 = s.knots[s.degree], u1 = s.knots[s.ctrl.length];
      return nurbsPoint(s, u0 + (u1 - u0) * t);
    }
    default:
      throw new Error(`Tipo de segmento no soportado: ${s.type}`);
  }
}
const segStart = (s) => segPoint(s, 0);
const segEnd = (s) => segPoint(s, 1);

function segSamples(s, n = 256) {
  if (s.type === 'line') return [s.p0, s.p1];
  const out = [];
  for (let i = 0; i <= n; i++) out.push(segPoint(s, i / n));
  return out;
}

function segReverse(s) {
  switch (s.type) {
    case 'line': return { ...s, p0: s.p1, p1: s.p0 };
    case 'arc': return { ...s, a0: s.a1, a1: s.a0, ccw: !s.ccw };
    case 'circle': return { ...s, ccw: !s.ccw };
    case 'ellipse': return { ...s, t0: s.t1, t1: s.t0, ccw: !s.ccw };
    case 'bezier': return { ...s, pts: [...s.pts].reverse() };
    case 'spline': {
      const a = s.knots[0], b = s.knots[s.knots.length - 1];
      return {
        ...s,
        ctrl: [...s.ctrl].reverse(),
        weights: s.weights ? [...s.weights].reverse() : s.weights,
        knots: s.knots.map((k) => a + b - k).reverse(),
      };
    }
    default: throw new Error(`Tipo de segmento no soportado: ${s.type}`);
  }
}

const loopReverse = (segs) => segs.map(segReverse).reverse();

function loopPolygon(segs, n = 256) {
  const poly = [];
  for (const s of segs) {
    const pts = segSamples(s, n);
    for (let i = poly.length ? 1 : 0; i < pts.length; i++) poly.push(pts[i]);
  }
  return poly;
}

function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

function distToPolyline(p, poly) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ab = sub(b, a), ap = sub(p, a);
    const L = ab[0] * ab[0] + ab[1] * ab[1];
    const t = L > 0 ? Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / L)) : 0;
    best = Math.min(best, Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t));
  }
  return best;
}

// Caja envolvente exacta: muestreo denso + refinamiento ternario de cada extremo.
function loopsBBox(loops) {
  const lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (const segs of loops) {
    for (const s of segs) {
      const n = s.type === 'line' ? 1 : 256;
      const ts = [];
      for (let i = 0; i <= n; i++) ts.push(i / n);
      const pts = ts.map((t) => segPoint(s, t));
      for (let k = 0; k < 2; k++) {
        for (const sign of [1, -1]) {
          let bi = 0;
          for (let i = 1; i < pts.length; i++) if (sign * pts[i][k] > sign * pts[bi][k]) bi = i;
          let a = ts[Math.max(0, bi - 1)], b = ts[Math.min(n, bi + 1)];
          for (let it = 0; it < 80 && n > 1; it++) {
            const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3;
            if (sign * segPoint(s, m1)[k] < sign * segPoint(s, m2)[k]) a = m1; else b = m2;
          }
          const v = n > 1 ? Math.max(sign * pts[bi][k], sign * segPoint(s, (a + b) / 2)[k]) * sign : pts[bi][k];
          if (sign > 0) hi[k] = Math.max(hi[k], v); else lo[k] = Math.min(lo[k], v);
        }
      }
    }
  }
  return { minU: lo[0], minV: lo[1], maxU: hi[0], maxV: hi[1] };
}

// ---------- Contornos → aristas OCCT ----------

// Une huecos ≤ tol moviendo extremos de segmentos flexibles (línea, Bézier, spline); los arcos,
// círculos y elipses conservan centro y radio exactos. Entre dos rígidos se puentea con una línea.
function closeGaps(segs, tol, label) {
  const rigid = (s) => s.type === 'circle' || s.type === 'ellipse' || s.type === 'arc';
  const n = segs.length;
  const ends = segs.map((s) => ({ ps: segStart(s), pe: segEnd(s) }));
  const bridges = new Map();
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = ends[i].pe, b = ends[j].ps;
    const gap = dist2(a, b);
    if (gap > tol) {
      throw new Error(`${label}: el contorno no cierra (hueco de ${gap.toFixed(4)} mm en (${a[0].toFixed(3)}, ${a[1].toFixed(3)}), mayor que la tolerancia de ${tol} mm).`);
    }
    if (gap === 0) continue;
    const ri = rigid(segs[i]), rj = rigid(segs[j]);
    if (ri && rj) {
      if (gap > 1e-7) bridges.set(i, [a, b]);
      continue;
    }
    const J = ri ? a : rj ? b : [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (!ri) ends[i].pe = J;
    if (!rj) ends[j].ps = J;
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ seg: segs[i], ...ends[i] });
    if (bridges.has(i)) {
      const [a, b] = bridges.get(i);
      out.push({ seg: { type: 'line', p0: a, p1: b }, ps: a, pe: b });
    }
  }
  return out;
}

const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Marco de plano: P(x, y) = o + x·ex + y·ey; normal = ex × ey.
function frame(o, ex, ey) {
  const n = cross3(ex, ey);
  return {
    p: (q) => [o[0] + q[0] * ex[0] + q[1] * ey[0], o[1] + q[0] * ex[1] + q[1] * ey[1], o[2] + q[0] * ex[2] + q[1] * ey[2]],
    v: (q) => [q[0] * ex[0] + q[1] * ey[0], q[0] * ex[1] + q[1] * ey[1], q[0] * ex[2] + q[1] * ey[2]],
    n,
  };
}
const FRAME_XY = frame([0, 0, 0], [1, 0, 0], [0, 1, 0]);

function edgeFromCurve(curve) {
  const mk = new oc.BRepBuilderAPI_MakeEdge(curve);
  const e = new R.Edge(mk.Edge());
  mk.delete();
  return e;
}

function makeEllipseEdge(s, F, full) {
  const rot = s.rot || 0;
  const u = [Math.cos(rot), Math.sin(rot)], v = [-Math.sin(rot), Math.cos(rot)];
  // Eje mayor = X; si rx < ry se intercambian ejes y el parámetro se desplaza π/2.
  let A = s.rx, B = s.ry, X = u, shift = 0;
  if (s.ry > s.rx) { A = s.ry; B = s.rx; X = v; shift = -Math.PI / 2; }
  const sign = s.ccw ? 1 : -1;
  const N = F.n.map((c) => c * sign);
  if (Math.abs(A - B) < 1e-12 * A) {
    // Círculo degenerado (rx = ry)
    if (full) return R.makeCircle(A, F.p(s.c), N);
  }
  if (full) return R.makeEllipse(A, B, F.p(s.c), N, F.v(X));
  const start = sign * (s.t0 + shift);
  return R.makeEllipseArc(A, B, start, start + ellSweep(s), F.p(s.c), N, F.v(X));
}

function makeSplineEdge(s, ps, pe, F) {
  const rational = s.weights && s.weights.some((w) => Math.abs(w - s.weights[0]) > 1e-15);
  if (rational) {
    // Muestreo denso (por tramo de nudos) y ajuste B-spline polinómico con tolerancia ≤ 1e-5 mm.
    const n = Math.max(64, 32 * (s.ctrl.length - s.degree) * s.degree);
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(i === 0 ? ps : i === n ? pe : segPoint(s, i / n));
    return R.makeBSplineApproximation(pts.map(F.p), { tolerance: RATIONAL_APPROX_TOL, degMax: 8, degMin: 3 });
  }
  const P = s.ctrl.map((q) => q.slice());
  P[0] = ps;
  P[P.length - 1] = pe;
  const uniq = [], mult = [];
  for (const k of s.knots) {
    if (uniq.length && Math.abs(k - uniq[uniq.length - 1]) <= 1e-12 * Math.max(1, Math.abs(k))) mult[mult.length - 1]++;
    else { uniq.push(k); mult.push(1); }
  }
  const poles = new oc.NCollection_Array1_gp_Pnt(1, P.length);
  const tmp = [];
  P.forEach((q, i) => {
    const g = new oc.gp_Pnt(...F.p(q));
    poles.SetValue(i + 1, g);
    tmp.push(g);
  });
  const knots = new oc.NCollection_Array1_double(1, uniq.length);
  const mults = new oc.NCollection_Array1_int(1, uniq.length);
  uniq.forEach((k, i) => { knots.SetValue(i + 1, k); mults.SetValue(i + 1, mult[i]); });
  const curve = new oc.Geom_BSplineCurve(poles, knots, mults, s.degree, false);
  const e = edgeFromCurve(curve);
  for (const o of [...tmp, poles, knots, mults]) o.delete();
  return e;
}

// Aristas básicas sin fugas: R.makeLine/makeCircle/makeThreePointArc no liberan el constructor,
// los gp_Pnt ni los gp_XYZ intermedios (~0,2–1 KB de heap wasm por arista y reconstrucción).
function withPnts(pts, f) {
  const g = pts.map((p) => new oc.gp_Pnt(p[0], p[1], p[2]));
  try {
    return f(...g);
  } finally {
    deleteAll(g);
  }
}
function edgeOf(mk) {
  try {
    return new R.Edge(mk.Edge());
  } finally {
    mk.delete();
  }
}
const lineEdge = (a, b) => withPnts([a, b], (pa, pb) => edgeOf(new oc.BRepBuilderAPI_MakeEdge(pa, pb)));
function circleEdge(r, c, n) {
  return withPnts([c], (pc) => {
    const d = new oc.gp_Dir(n[0], n[1], n[2]), ax = new oc.gp_Ax2(pc, d), circ = new oc.gp_Circ(ax, r);
    try {
      return edgeOf(new oc.BRepBuilderAPI_MakeEdge(circ));
    } finally {
      circ.delete(); ax.delete(); d.delete();
    }
  });
}
const arcEdge = (a, m, b) => withPnts([a, m, b], (pa, pm, pb) => {
  const mk = new oc.GC_MakeArcOfCircle(pa, pm, pb);
  const curve = mk.Value();
  try {
    return edgeOf(new oc.BRepBuilderAPI_MakeEdge(curve));
  } finally {
    curve.delete(); mk.delete();
  }
});

function makeEdge({ seg: s, ps, pe }, F) {
  switch (s.type) {
    case 'line':
      return lineEdge(F.p(ps), F.p(pe));
    case 'arc': {
      if (isFullSweep(arcSweep(s))) return circleEdge(s.r, F.p(s.c), F.n.map((c) => c * (s.ccw ? 1 : -1)));
      return arcEdge(F.p(ps), F.p(segPoint(s, 0.5)), F.p(pe));
    }
    case 'circle':
      return circleEdge(s.r, F.p(s.c), F.n.map((c) => c * (s.ccw ? 1 : -1)));
    case 'ellipse':
      return makeEllipseEdge(s, F, isFullSweep(ellSweep(s)));
    case 'bezier':
      return R.makeBezierCurve([ps, s.pts[1], s.pts[2], pe].map(F.p));
    case 'spline':
      return makeSplineEdge(s, ps, pe, F);
    default:
      throw new Error(`Tipo de segmento no soportado: ${s.type}`);
  }
}

function makeWire(segs, F, tol, label) {
  const parts = closeGaps(segs, tol, label);
  const edges = parts.map((p) => makeEdge(p, F));
  let wire;
  try {
    wire = R.assembleWire(edges);
  } catch (e) {
    throw new Error(`${label}: no se pudo formar un contorno cerrado (${e.message || e}).`);
  } finally {
    edges.forEach((e) => e.delete());
  }
  return wire;
}

const loopSegs = (loop, label) => {
  const segs = loop && (loop.segs || loop);
  if (!Array.isArray(segs) || !segs.length) throw new Error(`${label}: contorno vacío.`);
  return segs;
};

// Cara plana: exterior antihorario y agujeros horarios (en el marco F); verifica el área.
function makeRegionFace(outerSegs, holeSegsList, F, tol, label) {
  let outer = outerSegs;
  const oPoly = loopPolygon(outer);
  let oArea = polyArea(oPoly);
  if (oArea < 0) { outer = loopReverse(outer); oArea = -oArea; }
  if (oArea <= 0) throw new Error(`${label}: el contorno exterior tiene área nula.`);
  const holes = holeSegsList.map((h) => {
    const a = polyArea(loopPolygon(h));
    return { segs: a > 0 ? loopReverse(h) : h, area: Math.abs(a) };
  });
  const expected = oArea - holes.reduce((t, h) => t + h.area, 0);
  const outerWire = makeWire(outer, F, tol, label);
  const holeWires = holes.map((h, i) => makeWire(h.segs, F, tol, `${label}, agujero ${i + 1}`));
  let face;
  try {
    face = R.makeFace(outerWire, holeWires);
  } catch (e) {
    throw new Error(`${label}: no se pudo crear la cara (${e.message || e}).`);
  } finally {
    outerWire.delete();
    holeWires.forEach((w) => w.delete());
  }
  const area = surfaceArea(face);
  if (!(area > 0) || Math.abs(area - expected) > 1e-3 * oArea + 1e-6) {
    face.delete();
    throw new Error(`${label}: la cara resultante es inconsistente (área ${area.toFixed(4)} mm² frente a ${expected.toFixed(4)} mm² esperados). Revise que los agujeros estén dentro del contorno y no se crucen.`);
  }
  return face;
}

function surfaceArea(shape, free = freeformOf(shape.wrapped)) {
  const g = new oc.GProp_GProps();
  gpropSurface(shape.wrapped, g, free);
  const a = g.Mass();
  g.delete();
  return a;
}

function volumeOf(shape, free = freeformOf(shape.wrapped)) {
  const g = new oc.GProp_GProps();
  gpropVolume(shape.wrapped, g, free);
  const v = g.Mass();
  g.delete();
  return v;
}

// R.cast copia el TopoDS; el original (devuelto por valor) debe liberarse o retiene la pieza
// entera (y su malla) en el heap. Las funciones de replicad equivalentes no lo liberan.
function own(raw) {
  try {
    return R.cast(raw);
  } finally {
    raw.delete();
  }
}

function extrudeFace(face, vec) {
  const v = new R.Vector(vec);
  const mk = new oc.BRepPrimAPI_MakePrism(face.wrapped, v.wrapped, false, true);
  try {
    return own(mk.Shape());
  } finally {
    mk.delete(); v.delete();
  }
}

function revolveFace(face, p, d, angleDeg) {
  const pp = new oc.gp_Pnt(p[0], p[1], p[2]), dd = new oc.gp_Dir(d[0], d[1], d[2]), ax = new oc.gp_Ax1(pp, dd);
  const mk = new oc.BRepPrimAPI_MakeRevol(face.wrapped, ax, (angleDeg * Math.PI) / 180, false);
  try {
    return own(mk.Shape());
  } finally {
    mk.delete(); ax.delete(); dd.delete(); pp.delete();
  }
}

// Operaciones booleanas (como replicad, con simplificación) que liberan operandos y constructor.
function boolOp(name, a, b) {
  const mk = new oc[name](a.wrapped, b.wrapped);
  try {
    mk.Build();
    mk.SimplifyResult(true, true, 1e-3);
    return own(mk.Shape());
  } finally {
    mk.delete(); a.delete(); b.delete();
  }
}
const fuse = (a, b) => boolOp('BRepAlgoAPI_Fuse', a, b);
const cut = (a, b) => boolOp('BRepAlgoAPI_Cut', a, b);
const common = (a, b) => boolOp('BRepAlgoAPI_Common', a, b);

const regionLabel = (r, i) => `Región «${r.id ?? i + 1}»`;

// ---------- Modos de construcción ----------

function buildExtrude(job, warnings) {
  const ex = job.extrude || {};
  const tol = job.tol ?? 0.01;
  const regions = job.regions || [];
  if (!regions.length) throw new Error('No hay regiones para extruir.');
  let shape = null;
  const tops = [];
  regions.forEach((reg, i) => {
    const label = regionLabel(reg, i);
    const h = reg.height ?? ex.thickness;
    if (!(h > 0)) throw new Error(`${label}: el espesor/altura debe ser mayor que cero.`);
    const z0 = reg.z0 ?? (ex.symmetric ? -h / 2 : 0);
    const holes = reg.holes || [];
    const through = holes.filter((hh) => (hh.op || 'through') === 'through').map((hh, k) => loopSegs(hh.loop, `${label}, agujero ${k + 1}`));
    const outer = loopSegs(reg.outer, label);
    const F = frame([0, 0, z0], [1, 0, 0], [0, 1, 0]);
    const face = makeRegionFace(outer, through, F, tol, label);
    let solid = extrudeFace(face, [0, 0, h]);
    face.delete();
    holes.forEach((hh, k) => {
      if (hh.op !== 'blind') return;
      const hl = `${label}, agujero ciego ${k + 1}`;
      const d = hh.depth;
      if (!(d > 0)) throw new Error(`${hl}: la profundidad debe ser mayor que cero.`);
      const depth = Math.min(d, h);
      if (d > h) warnings.push(`${hl}: la profundidad (${d} mm) supera la altura (${h} mm); se hace pasante.`);
      const over = Math.max(1, h);
      const Fh = frame([0, 0, z0 + h - depth], [1, 0, 0], [0, 1, 0]);
      const hf = makeRegionFace(loopSegs(hh.loop, hl), [], Fh, tol, hl);
      const tool = extrudeFace(hf, [0, 0, depth + over]);
      hf.delete();
      solid = cut(solid, tool);
    });
    tops.push({ top: z0 + h, poly: loopPolygon(outer, 1024) });
    shape = shape ? fuse(shape, solid) : solid;
  });
  shape = applyFillets(shape, ex.fillets || {}, tops, tol, warnings);
  return shape;
}

// Inicio, fin y punto medio (paramétrico) de una arista TopoDS.
function edgePts(e) {
  const ad = new oc.BRepAdaptor_Curve(e);
  const u0 = ad.FirstParameter(), u1 = ad.LastParameter();
  const r = [u0, u1, (u0 + u1) / 2].map((u) => { const q = ad.Value(u); const p = pnt(q); q.delete(); return p; });
  ad.delete();
  return r;
}

function runFillet(shape, edges, radius, chamfer) {
  const mk = chamfer ? new oc.BRepFilletAPI_MakeChamfer(shape.wrapped) : new oc.BRepFilletAPI_MakeFillet(shape.wrapped, oc.ChFi3d_FilletShape.ChFi3d_Rational);
  try {
    for (const e of edges) mk.Add(radius, e);
    const res = own(mk.Shape());
    if (!(volumeOf(res) > 0)) {
      res.delete();
      throw new Error('resultado vacío');
    }
    return res;
  } finally {
    mk.delete();
  }
}

function applyFillets(shape, f, tops, tol, warnings) {
  const vr = f.vertical || 0, tr = f.top || 0, cr = f.chamferTop || 0;
  const tryOp = (name, value, select, chamfer) => {
    const all = mapShapes(shape.wrapped, 'edge');
    try {
      const edges = all.filter((e) => select(e));
      if (!edges.length) {
        warnings.push(`${name}: no se encontraron aristas a las que aplicarlo.`);
        return;
      }
      const res = runFillet(shape, edges, value, chamfer);
      shape.delete();
      shape = res;
    } catch (e) {
      warnings.push(`${name} (${value} mm) no se pudo aplicar; se conserva la pieza sin él.`);
    } finally {
      deleteAll(all);
    }
  };
  if (vr > 0) {
    tryOp('Redondeo de aristas verticales', vr, (e) => {
      if (typeOf(e, false).kind !== 'line') return false;
      const [a, b] = edgePts(e);
      return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6 && Math.abs(a[2] - b[2]) > 1e-6;
    }, false);
  }
  const slack = vr + Math.max(tol, 1e-3);
  const isTopOuter = (e) => {
    const pts = edgePts(e);
    return tops.some(({ top, poly }) => pts.every((p) => Math.abs(p[2] - top) < 1e-6) && distToPolyline(pts[2], poly) <= slack);
  };
  if (tr > 0) tryOp('Redondeo del borde superior', tr, isTopOuter, false);
  else if (cr > 0) tryOp('Chaflán del borde superior', cr, isTopOuter, true);
  if (tr > 0 && cr > 0) warnings.push('Se pidieron redondeo y chaflán superiores a la vez; solo se aplicó el redondeo.');
  return shape;
}

function buildRevolve(job, warnings) {
  const rv = job.revolve || {};
  const tol = job.tol ?? 0.01;
  const axis = rv.axis;
  if (!axis || !axis.p || !axis.d) throw new Error('Falta definir el eje de revolución.');
  const dl = Math.hypot(axis.d[0], axis.d[1]);
  if (!(dl > 0)) throw new Error('El eje de revolución tiene dirección nula.');
  const d = [axis.d[0] / dl, axis.d[1] / dl];
  const angle = rv.angleDeg ?? 360;
  if (!(angle > 0 && angle <= 360)) throw new Error('El ángulo de revolución debe estar entre 0 y 360°.');
  const regions = job.regions || [];
  if (!regions.length) throw new Error('No hay regiones para revolucionar.');
  let shape = null;
  regions.forEach((reg, i) => {
    const label = regionLabel(reg, i);
    const outer = loopSegs(reg.outer, label);
    let lo = Infinity, hi = -Infinity;
    for (const p of loopPolygon(outer)) {
      const s = d[0] * (p[1] - axis.p[1]) - d[1] * (p[0] - axis.p[0]);
      lo = Math.min(lo, s); hi = Math.max(hi, s);
    }
    // Cualquier punto a cada lado del eje (más allá del ruido numérico) es un cruce.
    if (lo < -1e-9 && hi > 1e-9) throw new Error(`${label}: el perfil cruza el eje de revolución; debe quedar a un solo lado del eje.`);
    const holes = (reg.holes || []).filter((h) => (h.op || 'through') !== 'none');
    if (holes.some((h) => h.op === 'blind')) warnings.push(`${label}: en revolución los agujeros ciegos se tratan como huecos del perfil.`);
    const face = makeRegionFace(outer, holes.map((h, k) => loopSegs(h.loop, `${label}, agujero ${k + 1}`)), FRAME_XY, tol, label);
    let solid;
    try {
      solid = revolveFace(face, [axis.p[0], axis.p[1], 0], [d[0], d[1], 0], angle);
    } finally {
      face.delete();
    }
    shape = shape ? fuse(shape, solid) : solid;
  });
  return shape;
}

const VIEW_DEF = {
  top: { dims: ['W', 'D'], depth: 'H' },
  front: { dims: ['W', 'H'], depth: 'D' },
  right: { dims: ['D', 'H'], depth: 'W' },
  left: { dims: ['D', 'H'], depth: 'W' },
};
const DIM_NAME = { W: 'ancho (X)', D: 'profundidad (Y)', H: 'altura (Z)' };

function buildMultiview(job, warnings) {
  const tol = job.tol ?? 0.01;
  const views = (job.multiview && job.multiview.views) || [];
  const roles = new Set(views.map((v) => v.role));
  if (views.length < 2 || roles.size < 2) throw new Error('La reconstrucción por vistas requiere al menos dos vistas distintas.');
  const dims = { W: [], D: [], H: [] };
  const infos = views.map((v, vi) => {
    const def = VIEW_DEF[v.role];
    if (!def) throw new Error(`Vista ${vi + 1}: papel desconocido «${v.role}».`);
    if (!v.regions || !v.regions.length) throw new Error(`Vista «${v.role}»: no tiene regiones.`);
    const bb = loopsBBox(v.regions.map((r, i) => loopSegs(r.outer, `Vista «${v.role}», región ${i + 1}`)));
    dims[def.dims[0]].push({ role: v.role, val: bb.maxU - bb.minU });
    dims[def.dims[1]].push({ role: v.role, val: bb.maxV - bb.minV });
    return { v, def, bb };
  });
  const size = {};
  for (const k of ['W', 'D', 'H']) {
    const list = dims[k];
    if (!list.length) throw new Error(`Las vistas dadas no definen el ${DIM_NAME[k]}; añada otra vista.`);
    const vals = list.map((x) => x.val);
    const mx = Math.max(...vals), mn = Math.min(...vals);
    if (mx > 0 && (mx - mn) / mx > 0.005) {
      warnings.push(`Las vistas no coinciden en ${DIM_NAME[k]}: ${list.map((x) => `${x.role} ${x.val.toFixed(3)} mm`).join(', ')} (diferencia > 0,5 %).`);
    }
    size[k] = mx;
  }
  let shape = null;
  for (const { v, def, bb } of infos) {
    let F, vec;
    const depth = size[def.depth];
    if (v.role === 'top') { F = frame([-bb.minU, -bb.minV, 0], [1, 0, 0], [0, 1, 0]); vec = [0, 0, depth]; }
    else if (v.role === 'front') { F = frame([-bb.minU, 0, -bb.minV], [1, 0, 0], [0, 0, 1]); vec = [0, depth, 0]; }
    else if (v.role === 'right') { F = frame([0, -bb.minU, -bb.minV], [0, 1, 0], [0, 0, 1]); vec = [depth, 0, 0]; }
    else { F = frame([0, bb.maxU, -bb.minV], [0, -1, 0], [0, 0, 1]); vec = [depth, 0, 0]; }
    let prism = null;
    v.regions.forEach((r, i) => {
      const label = `Vista «${v.role}», región ${i + 1}`;
      const face = makeRegionFace(loopSegs(r.outer, label), (r.holes || []).map((h, k) => loopSegs(h, `${label}, agujero ${k + 1}`)), F, tol, label);
      const s = extrudeFace(face, vec);
      face.delete();
      prism = prism ? fuse(prism, s) : s;
    });
    shape = shape ? common(shape, prism) : prism;
  }
  return shape;
}

// ---------- Topología, propiedades y mallas ----------

const hashOf = (s) => oc.ReplicadShapeHasher.HashCode(s, R.HASH_CODE_MAX);
const pnt = (p) => [p.X(), p.Y(), p.Z()];
const dirArr = (d) => [d.X(), d.Y(), d.Z()];
// Cono reconstruido a partir de puntos evaluados (gp_Cone no está enlazado en esta compilación):
// dos circunferencias isoparamétricas u (en v0 y v1) dan eje, radio de referencia y semiángulo.
function circleThrough(a, b, c) {
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const ab = sub(b, a), ac = sub(c, a), n = cross(ab, ac), n2 = dot(n, n);
  const t1 = cross(n, ab).map((x) => x * dot(ac, ac)), t2 = cross(ac, n).map((x) => x * dot(ab, ab));
  const off = [0, 1, 2].map((k) => (t1[k] + t2[k]) / (2 * n2));
  const center = [a[0] + off[0], a[1] + off[1], a[2] + off[2]];
  const len = Math.sqrt(n2);
  return { center, radius: Math.sqrt(dot(off, off)), normal: n.map((x) => x / len) };
}

function coneInfo(ad) {
  const u0 = ad.FirstUParameter(), v0 = ad.FirstVParameter(), v1 = ad.LastVParameter();
  const at = (u, v) => { const q = ad.Value(u, v); const r = pnt(q); q.delete(); return r; };
  const ring = (v) => circleThrough(at(u0, v), at(u0 + 2 * Math.PI / 3, v), at(u0 + 4 * Math.PI / 3, v));
  const c0 = ring(v0), c1 = ring(v1);
  const d = [c1.center[0] - c0.center[0], c1.center[1] - c0.center[1], c1.center[2] - c0.center[2]];
  const h = Math.hypot(...d);
  if (!(h > 1e-12)) return {};
  const dir = d.map((x) => x / h);
  return {
    radius: c0.radius,
    radius2: c1.radius,
    semiAngleDeg: (Math.atan2(Math.abs(c1.radius - c0.radius), h) * 180) / Math.PI,
    axis: { p: c0.center, d: dir },
  };
}

function ax1Info(ax) {
  const l = ax.Location(), d = ax.Direction();
  const r = { p: pnt(l), d: dirArr(d) };
  l.delete(); d.delete();
  return r;
}

// face: TopoDS_Face; type: tipo interno; free: la cara o sus aristas son de forma libre.
function faceInfo(face, id, type, free) {
  const g = new oc.GProp_GProps();
  gpropSurface(face, g, free);
  const c = g.CentreOfMass();
  const info = { id, type, area: g.Mass(), center: pnt(c) };
  c.delete(); g.delete();
  const ad = new oc.BRepAdaptor_Surface(face, true);
  try {
    if (type === 'plane') {
      const fw = new R.Face(oc.TopoDS.Face(face));
      const n = fw.normalAt();
      info.normal = n.toTuple();
      n.delete(); fw.delete();
    } else if (type === 'cylinder') {
      const cy = ad.Cylinder(), ax = cy.Axis();
      info.radius = cy.Radius();
      info.axis = ax1Info(ax);
      ax.delete(); cy.delete();
    } else if (type === 'cone') {
      Object.assign(info, coneInfo(ad));
    } else if (type === 'sphere') {
      const sp = ad.Sphere(), l = sp.Location();
      info.radius = sp.Radius();
      info.sphereCenter = pnt(l);
      l.delete(); sp.delete();
    }
    // Toro: gp_Torus no está enlazado en esta compilación; solo se informa el tipo.
  } finally {
    ad.delete();
  }
  return info;
}

function edgeInfo(edge, id, type) {
  const [start, end] = edgePts(edge);
  const g = new oc.GProp_GProps();
  oc.BRepGProp.LinearProperties(edge, g, true, false);
  const info = { id, type, length: g.Mass(), start, end, closed: oc.BRep_Tool.IsClosed(edge) };
  g.delete();
  const ad = new oc.BRepAdaptor_Curve(edge);
  try {
    if (type === 'line') {
      const L = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]) || 1;
      info.dir = [0, 1, 2].map((k) => (end[k] - start[k]) / L);
    } else if (type === 'circle' || type === 'ellipse') {
      const cv = type === 'circle' ? ad.Circle() : ad.Ellipse();
      const ax = cv.Axis(), l = ax.Location(), d = ax.Direction();
      if (type === 'circle') info.radius = cv.Radius();
      else { info.radius = cv.MajorRadius(); info.minorRadius = cv.MinorRadius(); }
      info.center = pnt(l);
      info.normal = dirArr(d);
      l.delete(); d.delete(); ax.delete(); cv.delete();
    }
  } finally {
    ad.delete();
  }
  return info;
}

// Un único recorrido indexado por pieza. Los TopoDS quedan en «owned» hasta releaseCurrent.
// Ids = ReplicadShapeHasher, los mismos que usan los extractores de malla de replicad.
function collectTopology(shape) {
  const w = shape.wrapped;
  const F = mapShapes(w, 'face'), E = mapShapes(w, 'edge'), V = mapShapes(w, 'vertex');
  const owned = [...F, ...E, ...V];
  try {
    const ft = F.map((f) => typeOf(f, true)), et = E.map((e) => typeOf(e, false));
    const free = ft.some((t) => t.free) || et.some((t) => t.free);
    const faces = new Map(), edges = new Map(), vertices = new Map();
    const topo = { faces: [], edges: [], vertices: [] };
    F.forEach((f, i) => {
      const id = hashOf(f);
      faces.set(id, f);
      topo.faces.push(faceInfo(f, id, ft[i].kind, free && (ft[i].free || freeformOf(f))));
    });
    E.forEach((e, i) => {
      const id = hashOf(e);
      edges.set(id, e);
      topo.edges.push(edgeInfo(e, id, et[i].kind));
    });
    for (const v of V) {
      const id = hashOf(v);
      vertices.set(id, v);
      const p = oc.BRep_Tool.Pnt(v);
      topo.vertices.push({ id, p: pnt(p) });
      p.delete();
    }
    return { maps: { faces, edges, vertices }, owned, topo, free };
  } catch (e) {
    deleteAll(owned);
    throw e;
  }
}

// Valores y vectores propios de una matriz simétrica 3×3 (Jacobi cíclico).
function jacobiEigen(M) {
  const a = M.map((r) => r.slice());
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 100; sweep++) {
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    const scale = Math.abs(a[0][0]) + Math.abs(a[1][1]) + Math.abs(a[2][2]);
    if (off <= 1e-15 * scale || off === 0) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (a[p][q] === 0) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) {
        const akp = a[k][p], akq = a[k][q];
        a[k][p] = c * akp - s * akq;
        a[k][q] = s * akp + c * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p][k], aqk = a[q][k];
        a[p][k] = c * apk - s * aqk;
        a[q][k] = s * apk + c * aqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = v[k][p], vkq = v[k][q];
        v[k][p] = c * vkp - s * vkq;
        v[k][q] = s * vkp + c * vkq;
      }
    }
  }
  const pairs = [0, 1, 2].map((i) => ({ val: a[i][i], vec: [v[0][i], v[1][i], v[2][i]] }));
  pairs.sort((x, y) => x.val - y.val);
  return { moments: pairs.map((p) => p.val), axes: pairs.map((p) => p.vec) };
}

// Validez B-rep de OCCT (una vez por pieza). Crear y borrar un BRepCheck_Analyzer por pieza
// retiene la pieza analizada (~0,5 MB con 16 agujeros); un único analizador reutilizado con Init
// y devuelto después a una forma mínima no pierde memoria.
let analyzer = null;
function isValidShape(w) {
  if (!analyzer || analyzer.oc !== oc) {
    const tiny = R.makeBox([0, 0, 0], [1, 1, 1]);
    analyzer = { oc, tiny, an: new oc.BRepCheck_Analyzer(tiny.wrapped, true, false) };
  }
  try {
    analyzer.an.Init(w, true);
    return analyzer.an.IsValid();
  } finally {
    analyzer.an.Init(analyzer.tiny.wrapped, true);
  }
}

function computeProps(shape, topo, free) {
  const g = new oc.GProp_GProps();
  gpropVolume(shape.wrapped, g, free);
  const volume = g.Mass();
  const cP = g.CentreOfMass();
  const centroid = pnt(cP);
  const I = (dx, dy, dz) => {
    const d = new oc.gp_Dir(dx, dy, dz), ax = new oc.gp_Ax1(cP, d);
    const val = g.MomentOfInertia(ax);
    ax.delete(); d.delete();
    return val;
  };
  const Ixx = I(1, 0, 0), Iyy = I(0, 1, 0), Izz = I(0, 0, 1);
  // I(u) = uᵀ·T·u con u = (a+b)/√2 ⇒ Pab = (Iaa + Ibb)/2 − I(u)
  const Pxy = (Ixx + Iyy) / 2 - I(1, 1, 0), Pxz = (Ixx + Izz) / 2 - I(1, 0, 1), Pyz = (Iyy + Izz) / 2 - I(0, 1, 1);
  cP.delete(); g.delete();
  const principal = jacobiEigen([[Ixx, -Pxy, -Pxz], [-Pxy, Iyy, -Pyz], [-Pxz, -Pyz, Izz]]);

  const box = new oc.Bnd_Box();
  oc.BRepBndLib.AddOptimal(shape.wrapped, box, false, false);
  const lo = box.CornerMin(), hi = box.CornerMax();
  const min = pnt(lo), max = pnt(hi);
  lo.delete(); hi.delete(); box.delete();

  const shells = mapShapes(shape.wrapped, 'shell'), solidList = mapShapes(shape.wrapped, 'solid');
  const solids = solidList.length;
  const closed = shells.length > 0 && shells.every((s) => oc.BRep_Tool.IsClosed(s));
  const nShells = shells.length;
  deleteAll(shells); deleteAll(solidList);
  const valid = isValidShape(shape.wrapped);
  const faceTypes = {};
  for (const f of topo.faces) faceTypes[f.type] = (faceTypes[f.type] || 0) + 1;
  return {
    volume,
    area: surfaceArea(shape, free),
    centroid,
    inertia: { Ixx, Iyy, Izz, Pxy, Pxz, Pyz },
    principal,
    bbox: { min, max, size: [0, 1, 2].map((k) => max[k] - min[k]) },
    counts: { solids, shells: nShells, faces: topo.faces.length, edges: topo.edges.length, vertices: topo.vertices.length, faceTypes },
    valid,
    closed,
  };
}

function meshOpts(opts, bbox) {
  const diag = bbox ? Math.hypot(...bbox.size) : 100;
  return {
    tolerance: opts && opts.tolerance > 0 ? opts.tolerance : Math.max(0.001, diag * 2e-4),
    angularTolerance: opts && opts.angularTolerance > 0 ? opts.angularTolerance : 0.15,
  };
}

function meshShape(shape, o) {
  const m = shape.mesh(o);
  return {
    vertices: new Float32Array(m.vertices),
    normals: new Float32Array(m.normals),
    triangles: new Uint32Array(m.triangles),
    faceGroups: m.faceGroups,
  };
}

// meshEdges ya entrega pares de puntos por segmento (cada grupo tiene count par).
function meshEdgeLines(shape, o) {
  const m = shape.meshEdges(o);
  for (const gr of m.edgeGroups) {
    if (gr.count % 2) throw new Error('Formato inesperado en las aristas teseladas.');
  }
  return { positions: new Float32Array(m.lines), edgeGroups: m.edgeGroups };
}

function releaseCurrent() {
  if (!current) return;
  deleteAll(current.owned);
  // Sin Clean, la triangulación de la malla queda retenida en el heap tras borrar la forma.
  oc.BRepTools.Clean(current.shape.wrapped, true);
  current.shape.delete();
  current = null;
}

// Texto de una excepción de OCCT (WebAssembly.Exception o puntero numérico de Emscripten).
function ocDetail(e) {
  try {
    if (typeof WebAssembly !== 'undefined' && WebAssembly.Exception && e instanceof WebAssembly.Exception && oc && oc.getExceptionMessage) {
      return oc.getExceptionMessage(e).filter(Boolean).join(': ');
    }
    if (typeof e === 'number' && oc && oc.OCJS) {
      const f = oc.OCJS.getStandard_FailureData(e);
      const msg = f.GetMessageString();
      f.delete();
      if (msg) return msg;
    }
  } catch (_) { /* se usa el texto genérico */ }
  if (typeof e === 'number') return `código ${e}`;
  if (typeof e === 'string') return e;
  return (e && typeof e.message === 'string' && e.message) || '';
}

function ocError(e) {
  if (e instanceof Error) return e;
  const d = ocDetail(e);
  return new Error(`Error interno de OpenCascade${d ? ` (${d})` : ''}. Revise la geometría del plano.`);
}

// Rechaza geometría corrupta antes de evaluarla: una spline con nudos inconsistentes
// puede dejar la evaluación NURBS en un bucle sin fin.
function validateJobSegments(job) {
  const check = (loop, where) => {
    for (const s of loop?.segs || []) {
      const why = segInvalidReason(s);
      if (why) throw new Error(`${where}: ${why}.`);
    }
  };
  for (const r of job.regions || []) {
    check(r.outer, `Región «${r.id}»`);
    for (const h of r.holes || []) check(h.loop, `Región «${r.id}», agujero`);
  }
  for (const v of job.multiview?.views || []) {
    for (const r of v.regions || []) {
      check(r.outer, `Vista ${v.role}`);
      for (const h of r.holes || []) check(h.loop ?? h, `Vista ${v.role}, agujero`);
    }
  }
}

export function build(job) {
  needOC();
  if (!job || !job.mode) throw new Error('Trabajo de construcción sin modo.');
  validateJobSegments(job);
  const warnings = [];
  const t0 = now();
  let shape;
  try {
    if (job.mode === 'extrude') shape = buildExtrude(job, warnings);
    else if (job.mode === 'revolve') shape = buildRevolve(job, warnings);
    else if (job.mode === 'multiview') shape = buildMultiview(job, warnings);
    else throw new Error(`Modo de construcción desconocido: ${job.mode}`);
  } catch (e) {
    throw ocError(e);
  }
  const buildMs = now() - t0;
  const t1 = now();
  let walk, props;
  try {
    walk = collectTopology(shape);
    if (!(volumeOf(shape, walk.free) > 0)) throw new Error('La pieza resultante está vacía (volumen nulo). Revise las vistas o regiones.');
    props = computeProps(shape, walk.topo, walk.free);
  } catch (e) {
    if (walk) deleteAll(walk.owned);
    shape.delete();
    throw ocError(e);
  }
  // La pieza anterior se libera solo cuando la nueva es utilizable.
  releaseCurrent();
  current = { shape, ...walk.maps, owned: walk.owned, bbox: props.bbox };
  currentId = job.buildId ?? null;
  const topo = walk.topo;
  const t2 = now();
  const mo = meshOpts(job.mesh, props.bbox);
  const mesh = meshShape(shape, mo);
  const edges = meshEdgeLines(shape, mo);
  const t3 = now();
  if (!props.valid) warnings.push('El sólido no supera la verificación de validez de OpenCascade; los resultados pueden ser imprecisos.');
  if (!props.closed) warnings.push('El sólido no está cerrado (tiene bordes libres).');
  if (props.counts.solids > 1) warnings.push(`La pieza tiene ${props.counts.solids} sólidos separados.`);
  return { mesh, edges, topology: topo, props, warnings, timings: { buildMs, meshMs: t3 - t2, propsMs: t2 - t1 } };
}

// buildId opcional: si no coincide con la pieza actual del motor, error STALE_SHAPE
// (la comprobación y el uso de la forma ocurren en la misma llamada serializada).
function needShape(buildId) {
  needOC();
  if (!current) throw new Error('No hay ninguna pieza construida.');
  if (buildId != null && buildId !== currentId) {
    const err = new Error('La pieza del motor CAD no corresponde a la mostrada; vuelva a generarla.');
    err.code = 'STALE_SHAPE';
    throw err;
  }
}

function resolveEntity(x) {
  if (!x) throw new Error('Entidad de medición vacía.');
  if (x.kind === 'point') {
    const p = new oc.gp_Pnt(x.p[0], x.p[1], x.p[2]);
    const mk = new oc.BRepBuilderAPI_MakeVertex(p);
    const v = mk.Vertex();
    mk.delete(); p.delete();
    return { shape: v, owned: true };
  }
  const map = { face: current.faces, edge: current.edges, vertex: current.vertices }[x.kind];
  if (!map) throw new Error(`Tipo de entidad desconocido: ${x.kind}`);
  const s = map.get(x.id);
  if (!s) throw new Error(`No existe la entidad ${x.kind} ${x.id} en la pieza actual.`);
  return { shape: s.wrapped || s, owned: false };
}

export function distance(a, b, buildId) {
  needShape(buildId);
  const A = resolveEntity(a), B = resolveEntity(b);
  const ds = new oc.BRepExtrema_DistShapeShape(A.shape, B.shape);
  try {
    if (!ds.IsDone() || ds.NbSolution() < 1) throw new Error('No se pudo calcular la distancia.');
    const p1 = ds.PointOnShape1(1), p2 = ds.PointOnShape2(1);
    const r = { distance: ds.Value(), p1: pnt(p1), p2: pnt(p2) };
    p1.delete(); p2.delete();
    return r;
  } finally {
    ds.delete();
    if (A.owned) A.shape.delete();
    if (B.owned) B.shape.delete();
  }
}

function readFS(path, asText) {
  const data = oc.FS.readFile(path, asText ? { encoding: 'utf8' } : undefined);
  oc.FS.unlink(path);
  return data;
}

export function exportShape(opts = {}) {
  needShape(opts.buildId);
  const format = opts.format || 'step';
  const shape = current.shape;
  if (format === 'step') {
    const doc = R.createAssembly([{ shape, name: opts.name || 'pieza', color: '#9aa4ad' }]);
    const tmp = new oc.STEPCAFControl_Writer();
    oc.Interface_Static.SetCVal('xstep.cascade.unit', 'MM');
    oc.Interface_Static.SetCVal('write.step.unit', 'MM');
    tmp.delete();
    const session = new oc.XSControl_WorkSession();
    const writer = new oc.STEPCAFControl_Writer(session, false);
    const progress = new oc.Message_ProgressRange();
    try {
      writer.SetColorMode(true);
      writer.SetNameMode(true);
      oc.Interface_Static.SetIVal('write.surfacecurve.mode', 1);
      oc.Interface_Static.SetIVal('write.precision.mode', 0);
      oc.Interface_Static.SetIVal('write.step.assembly', 2);
      oc.Interface_Static.SetIVal('write.step.schema', 5);
      if (!writer.Perform(doc.wrapped, 'pieza.step', progress)) throw new Error('No se pudo escribir el archivo STEP.');
      return { data: readFS('/pieza.step', true), mime: 'application/step', ext: 'step' };
    } finally {
      progress.delete(); writer.delete(); session.delete(); doc.delete();
    }
  }
  if (format === 'stl' || format === 'stl-ascii') {
    const ascii = format === 'stl-ascii';
    const o = meshOpts(opts, null);
    if (!(opts.tolerance > 0)) {
      const box = new oc.Bnd_Box();
      oc.BRepBndLib.AddOptimal(shape.wrapped, box, false, false);
      const lo = box.CornerMin(), hi = box.CornerMax();
      o.tolerance = Math.max(0.001, Math.hypot(hi.X() - lo.X(), hi.Y() - lo.Y(), hi.Z() - lo.Z()) * 2e-4);
      lo.delete(); hi.delete(); box.delete();
    }
    oc.ReplicadMeshExtractor.mesh(shape.wrapped, o.tolerance, o.angularTolerance);
    if (!oc.StlAPI.Write(shape.wrapped, 'pieza.stl', ascii)) throw new Error('No se pudo escribir el archivo STL.');
    const raw = readFS('/pieza.stl', ascii);
    const data = ascii ? raw : raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
    return { data, mime: ascii ? 'model/stl' : 'model/stl', ext: 'stl' };
  }
  throw new Error(`Formato de exportación no soportado: ${format}`);
}

export function tessellate(opts = {}) {
  needShape(opts.buildId);
  // Sin tolerancia explícita se escala con la pieza, como la malla de visualización.
  return meshShape(current.shape, meshOpts(opts, current.bbox));
}

export async function handle({ type, payload } = {}) {
  try {
    switch (type) {
      case 'init': return await init(payload || {});
      case 'build': return build(payload);
      case 'distance': return distance(payload.a, payload.b, payload.buildId);
      case 'export': return exportShape(payload || {});
      case 'tessellate': return tessellate(payload || {});
      default: throw new Error(`Mensaje desconocido para el motor CAD: ${type}`);
    }
  } catch (e) {
    throw ocError(e);
  }
}
