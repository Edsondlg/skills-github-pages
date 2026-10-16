// Escritor DXF ASCII mínimo (R2000, AC1015) para generar planos de ejemplo y pruebas.
// Ángulos de ARC en grados (como en DXF); opts comunes: { layer, color, linetype, extrusion: [x, y, z] }.
const TAU = 2 * Math.PI;
const fmt = (x) => (typeof x === 'number' ? (Object.is(x, -0) ? '0' : String(x)) : String(x));

export class DxfWriter {
  constructor({ insunits = 4, measurement = 1, acadver = 'AC1015' } = {}) {
    this.header = { insunits, measurement, acadver };
    this.layers = [];
    this.ltypes = [];
    this.blocks = [];
    this.ents = [];
    this.cur = this.ents;
    this.h = 0x100;
  }
  addLayer(name, { color = 7, linetype = 'CONTINUOUS', frozen = false, off = false } = {}) {
    this.layers.push({ name, color: off ? -color : color, linetype, flags: frozen ? 1 : 0 });
    return this;
  }
  addLtype(name, desc, pattern) {
    this.ltypes.push({ name, desc, pattern });
    return this;
  }
  // Define un bloque; fn(w) dibuja en él con los mismos métodos.
  block(name, base, fn) {
    const prev = this.cur, ents = [];
    this.cur = ents;
    fn(this);
    this.cur = prev;
    this.blocks.push({ name, base, ents });
    return this;
  }
  raw(pairs) {
    this.cur.push(pairs);
    return this;
  }
  entity(type, opts, sub, body) {
    const p = [[0, type], [5, (this.h++).toString(16).toUpperCase()], [100, 'AcDbEntity'], [8, opts.layer ?? '0']];
    if (opts.linetype) p.push([6, opts.linetype]);
    if (opts.color !== undefined) p.push([62, opts.color]);
    if (opts.paper) p.push([67, 1]);
    p.push([100, sub], ...body);
    if (opts.extrusion) p.push([210, opts.extrusion[0]], [220, opts.extrusion[1]], [230, opts.extrusion[2]]);
    return this.raw(p);
  }
  line(p0, p1, o = {}) {
    return this.entity('LINE', o, 'AcDbLine', [[10, p0[0]], [20, p0[1]], [30, 0], [11, p1[0]], [21, p1[1]], [31, 0]]);
  }
  circle(c, r, o = {}) {
    return this.entity('CIRCLE', o, 'AcDbCircle', [[10, c[0]], [20, c[1]], [30, 0], [40, r]]);
  }
  arc(c, r, a0, a1, o = {}) {
    return this.entity('ARC', o, 'AcDbCircle', [[10, c[0]], [20, c[1]], [30, 0], [40, r], [100, 'AcDbArc'], [50, a0], [51, a1]]);
  }
  // pts: [[x, y, bulge?], ...]
  lwpolyline(pts, closed, o = {}) {
    const b = [[90, pts.length], [70, closed ? 1 : 0]];
    for (const q of pts) {
      b.push([10, q[0]], [20, q[1]]);
      if (q[2]) b.push([42, q[2]]);
    }
    return this.entity('LWPOLYLINE', o, 'AcDbPolyline', b);
  }
  polyline2d(pts, closed, o = {}) {
    this.entity('POLYLINE', o, 'AcDb2dPolyline', [[66, 1], [10, 0], [20, 0], [30, 0], [70, closed ? 1 : 0]]);
    for (const q of pts) {
      const v = [[0, 'VERTEX'], [8, o.layer ?? '0'], [100, 'AcDbVertex'], [10, q[0]], [20, q[1]], [30, 0]];
      if (q[2]) v.push([42, q[2]]);
      if (q[3]) v.push([70, q[3]]);
      this.raw(v);
    }
    return this.raw([[0, 'SEQEND'], [8, o.layer ?? '0']]);
  }
  ellipse(c, major, ratio, p0 = 0, p1 = TAU, o = {}) {
    const b = [[10, c[0]], [20, c[1]], [30, 0], [11, major[0]], [21, major[1]], [31, 0]];
    if (o.extrusion) b.push([210, o.extrusion[0]], [220, o.extrusion[1]], [230, o.extrusion[2]]);
    b.push([40, ratio], [41, p0], [42, p1]);
    return this.entity('ELLIPSE', { ...o, extrusion: undefined }, 'AcDbEllipse', b);
  }
  // { degree, knots, ctrl, weights, fit, flags, t0, t1 }
  spline({ degree = 3, knots = [], ctrl = [], weights = null, fit = [], flags = 8, t0 = null, t1 = null }, o = {}) {
    const b = [[210, 0], [220, 0], [230, 1], [70, flags | (weights ? 4 : 0)], [71, degree], [72, knots.length], [73, ctrl.length], [74, fit.length]];
    if (t0) b.push([12, t0[0]], [22, t0[1]], [32, 0]);
    if (t1) b.push([13, t1[0]], [23, t1[1]], [33, 0]);
    for (const k of knots) b.push([40, k]);
    if (weights) for (const w of weights) b.push([41, w]);
    for (const q of ctrl) b.push([10, q[0]], [20, q[1]], [30, 0]);
    for (const q of fit) b.push([11, q[0]], [21, q[1]], [31, 0]);
    return this.entity('SPLINE', o, 'AcDbSpline', b);
  }
  // { sx, sy, rot (grados), cols, rows, dc, dr }
  insert(name, p, { sx = 1, sy = 1, rot = 0, cols = 1, rows = 1, dc = 0, dr = 0 } = {}, o = {}) {
    const b = [[2, name], [10, p[0]], [20, p[1]], [30, 0], [41, sx], [42, sy], [43, 1], [50, rot]];
    if (cols > 1 || rows > 1) b.push([70, cols], [71, rows], [44, dc], [45, dr]);
    return this.entity('INSERT', o, 'AcDbBlockReference', b);
  }
  text(p, h, s, rot = 0, o = {}) {
    return this.entity('TEXT', o, 'AcDbText', [[10, p[0]], [20, p[1]], [30, 0], [40, h], [1, s], [50, rot], [100, 'AcDbText']]);
  }
  mtext(p, h, s, o = {}) {
    return this.entity('MTEXT', o, 'AcDbMText', [[10, p[0]], [20, p[1]], [30, 0], [40, h], [71, 1], [1, s]]);
  }
  // Cota alineada mínima (se ignora al importar); su bloque anónimo *D no se expande.
  dimension(p1, p2, at, blockName, o = {}) {
    return this.entity('DIMENSION', o, 'AcDbDimension', [
      [2, blockName], [10, at[0]], [20, at[1]], [30, 0], [70, 1], [100, 'AcDbAlignedDimension'],
      [13, p1[0]], [23, p1[1]], [33, 0], [14, p2[0]], [24, p2[1]], [34, 0],
    ]);
  }
  // Segmento del modelo C1 → entidad (arco horario se escribe antihorario: misma geometría, sentido inverso).
  segment(s, o = {}) {
    const deg = (a) => (a * 180) / Math.PI;
    switch (s.type) {
      case 'line':
        return this.line(s.p0, s.p1, o);
      case 'circle':
        return this.circle(s.c, s.r, o);
      case 'arc':
        return s.ccw !== false ? this.arc(s.c, s.r, deg(s.a0), deg(s.a1), o) : this.arc(s.c, s.r, deg(s.a1), deg(s.a0), o);
      case 'ellipse': {
        const M = [s.rx * Math.cos(s.rot), s.rx * Math.sin(s.rot)], ratio = s.ry / s.rx;
        return s.ccw !== false
          ? this.ellipse(s.c, M, ratio, s.t0, s.t1, o)
          : this.ellipse(s.c, M, ratio, s.t1, s.t0, o);
      }
      case 'bezier':
        return this.spline({ degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], ctrl: s.pts }, o);
      case 'spline':
        return this.spline({ degree: s.degree, knots: s.knots, ctrl: s.ctrl, weights: s.weights }, o);
    }
    throw new Error(`Tipo desconocido: ${s.type}`);
  }
  toString() {
    const out = [];
    const put = (pairs) => {
      for (const [c, v] of pairs) out.push(String(c).padStart(3), fmt(v));
    };
    const { insunits, measurement, acadver } = this.header;
    put([[0, 'SECTION'], [2, 'HEADER'], [9, '$ACADVER'], [1, acadver]]);
    if (insunits !== null) put([[9, '$INSUNITS'], [70, insunits]]);
    if (measurement !== null) put([[9, '$MEASUREMENT'], [70, measurement]]);
    put([[0, 'ENDSEC'], [0, 'SECTION'], [2, 'TABLES']]);
    const lts = [{ name: 'CONTINUOUS', desc: 'Solid line', pattern: [] }, ...this.ltypes];
    put([[0, 'TABLE'], [2, 'LTYPE'], [70, lts.length]]);
    for (const l of lts) {
      put([[0, 'LTYPE'], [100, 'AcDbSymbolTableRecord'], [100, 'AcDbLinetypeTableRecord'], [2, l.name], [70, 0], [3, l.desc], [72, 65], [73, l.pattern.length]]);
      put([[40, l.pattern.reduce((a, x) => a + Math.abs(x), 0)], ...l.pattern.map((x) => [49, x])]);
    }
    put([[0, 'ENDTAB'], [0, 'TABLE'], [2, 'LAYER'], [70, this.layers.length + 1]]);
    for (const l of [{ name: '0', color: 7, linetype: 'CONTINUOUS', flags: 0 }, ...this.layers])
      put([[0, 'LAYER'], [100, 'AcDbSymbolTableRecord'], [100, 'AcDbLayerTableRecord'], [2, l.name], [70, l.flags], [62, l.color], [6, l.linetype]]);
    put([[0, 'ENDTAB'], [0, 'ENDSEC'], [0, 'SECTION'], [2, 'BLOCKS']]);
    for (const b of this.blocks) {
      put([[0, 'BLOCK'], [8, '0'], [100, 'AcDbBlockBegin'], [2, b.name], [70, b.name.startsWith('*') ? 1 : 0], [10, b.base[0]], [20, b.base[1]], [30, 0], [3, b.name]]);
      for (const e of b.ents) put(e);
      put([[0, 'ENDBLK'], [8, '0'], [100, 'AcDbBlockEnd']]);
    }
    put([[0, 'ENDSEC'], [0, 'SECTION'], [2, 'ENTITIES']]);
    for (const e of this.ents) put(e);
    put([[0, 'ENDSEC'], [0, 'EOF']]);
    return out.join('\n') + '\n';
  }
}
