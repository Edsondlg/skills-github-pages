// Herramientas de medición 3D (contrato C5) sobre la API pública de Viewer3D.
// Valores exactos desde la topología B-rep o el núcleo (kernel.distance); la malla solo
// se usa para encontrar la cara opuesta en 'thickness'.
//
// Uso:
//   const mt = new MeasureTools(viewer, { kernel, format, onChange });
//   mt.setTool('none'|'inspect'|'point'|'distance'|'angle'|'radius'|'area'|'coords'|'thickness');
//   mt.list() / mt.remove(id) / mt.clear() / mt.cancel() / mt.pinInspect() / mt.dispose()
//
// Medición: { id: number, tool, title: string, text: string, values: object } (textos en español).
//
// onChange(list, extra) se llama en cada cambio:
//   list   copia de list().
//   extra  { hint: string|null, inspect: InspectInfo|null }  (siempre ambas claves)
//     hint     estado para la UI ('Selecciona la segunda entidad…', errores, 'Calculando…');
//              null con la herramienta 'none'.
//     inspect  entidad inspeccionada con la herramienta 'inspect' (null si no hay):
//              { kind: 'face'|'edge'|'vertex', id, type, title, text, lines: string[],
//                point: [x,y,z], values: { type, area?, radius?, diameter?, normal?, axis?,
//                center?, length?, dir?, semiAngleDeg?, arcAngle?, point } }
//
// kernel (opcional): { distance(a, b) → Promise<{ distance, p1, p2 }> } con
//   a, b = { kind: 'face'|'edge'|'vertex', id } | { kind: 'point', p }. Sin núcleo, 'distance'
//   mide entre los puntos seleccionados.

const fix3 = (v) => {
  const s = (+v).toFixed(3);
  return s === '-0.000' ? '0.000' : s;
};

// Formato por defecto: mm y grados con 3 decimales.
export const DEFAULT_FORMAT = {
  len: (v) => `${fix3(v)} mm`,
  area: (v) => `${fix3(v)} mm²`,
  angle: (v) => `${fix3(v)}°`,
  point: (p) => `(${fix3(p[0])}, ${fix3(p[1])}, ${fix3(p[2])}) mm`,
};

export const TOOLS = ['none', 'inspect', 'point', 'distance', 'angle', 'radius', 'area', 'coords', 'thickness'];

const ALL = ['vertex', 'edge', 'face'];
const FILTERS = {
  none: null, inspect: ALL, point: ALL, distance: ALL, angle: ['edge', 'face'],
  radius: ['edge', 'face'], area: ['face'], coords: ALL, thickness: ['face'],
};
const HINTS = {
  inspect: ['Pasa el cursor y haz clic en una cara, arista o vértice'],
  point: ['Selecciona el primer punto', 'Selecciona el segundo punto…'],
  distance: ['Selecciona la primera entidad (cara, arista o vértice)', 'Selecciona la segunda entidad…'],
  angle: ['Selecciona una cara plana o una arista recta', 'Selecciona la segunda cara plana o arista recta…'],
  radius: ['Selecciona una arista circular o una cara cilíndrica, esférica o tórica'],
  area: ['Haz clic en una cara (Mayús+clic suma caras)'],
  coords: ['Haz clic en un punto del modelo'],
  thickness: ['Haz clic en una cara para medir el espesor de pared'],
};
const FACE_NAMES = {
  plane: 'Plano', cylinder: 'Cilindro', cone: 'Cono', sphere: 'Esfera', torus: 'Toro', bspline: 'Superficie B-spline',
};
const PAR_TOL = 1e-9;

// ---------- vectores [x,y,z] ----------
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => {
  const l = len(a);
  return l > 0 ? mul(a, 1 / l) : [0, 0, 0];
};
const mid = (a, b) => mul(add(a, b), 0.5);
const deg = (r) => (r * 180) / Math.PI;
const acosD = (c) => deg(Math.acos(Math.max(-1, Math.min(1, c))));
const vec = (v) => `(${fix3(v[0])}, ${fix3(v[1])}, ${fix3(v[2])})`;

// Separa "104.000 mm" en ["104.000", " mm"].
function splitUnit(s) {
  const m = /^(.*\d)(\D*)$/.exec(s);
  return m ? [m[1], m[2]] : [s, ''];
}

// Punto del eje más cercano a p.
function onAxis(p, axis) {
  const d = norm(axis.d);
  return add(axis.p, mul(d, dot(sub(p, axis.p), d)));
}

function lineDir(e) {
  return norm(e.dir || sub(e.end, e.start));
}

function edgeName(e) {
  if (e.type === 'line') return 'Línea';
  if (e.type === 'circle') return e.closed ? 'Círculo' : 'Arco';
  if (e.type === 'ellipse') return 'Elipse';
  if (e.type === 'bspline') return 'B-spline';
  return 'Curva';
}

export class MeasureTools {
  constructor(viewer, { kernel = null, format, onChange } = {}) {
    this.viewer = viewer;
    this.kernel = kernel;
    this.format = { ...DEFAULT_FORMAT, ...(format || {}) };
    this.onChange = onChange || null;
    this.tool = 'none';
    this._items = [];
    this._nextId = 1;
    this._pending = [];
    this._pendingObjs = [];
    this._area = null;
    this._inspect = null;
    this._inspectEnt = null; // entidad de la inspección actual (para re-formatear)
    this._msg = null;
    this._token = 0;
    this._hl = false;
    this._off = [
      viewer.on('hover', (r) => this._onHover(r)),
      viewer.on('pick', (r, mods) => this._onPick(r, mods || {})),
      viewer.on('model', () => this._onModel()),
      viewer.on('theme', () => this._redrawAll()),
    ];
    this._onKey = (e) => {
      if (e.key === 'Escape') this.cancel();
    };
    window.addEventListener('keydown', this._onKey);
  }

  // ---------- API ----------
  setTool(name) {
    if (!TOOLS.includes(name)) throw new Error(`Herramienta de medición desconocida: ${name}`);
    this._resetInteraction();
    this.tool = name;
    this.viewer.setPickFilter(FILTERS[name]);
    this.viewer.setHover(null);
    this._refreshHighlight();
    this._emit();
    return this;
  }

  /** Cambia el formato: reescribe los textos y etiquetas existentes y la ficha de inspección. */
  setFormat(format) {
    this.format = { ...DEFAULT_FORMAT, ...(format || {}) };
    for (const r of this._items) {
      r.m.text = r.text();
      this._draw(r);
    }
    if (this._inspect && this._inspectEnt) this._inspect = this._inspectInfo(this._inspectEnt);
    this._emit();
  }

  list() {
    return this._items.map((r) => ({ ...r.m }));
  }

  remove(id) {
    const i = this._items.findIndex((r) => r.m.id === id);
    if (i < 0) return this;
    const [rec] = this._items.splice(i, 1);
    this._removeObjs(rec.objs);
    if (this._area === rec) this._area = null;
    this._refreshHighlight();
    this._emit();
    return this;
  }

  clear() {
    for (const r of this._items) this._removeObjs(r.objs);
    this._items = [];
    this._area = null;
    this._refreshHighlight();
    this._emit();
    return this;
  }

  // Esc: anula la selección pendiente, termina la suma de áreas y la inspección.
  cancel() {
    if (!this._pending.length && !this._area && !this._inspect && !this._msg) return this;
    this._resetInteraction();
    this._refreshHighlight();
    this._emit();
    return this;
  }

  // Fija la información de inspección actual como medición de la lista.
  pinInspect() {
    const info = this._inspect;
    if (!info) return null;
    const ent = this._inspectEnt;
    const cur = () => this._inspectInfo(ent);
    const rec = this._add('inspect', info.title, () => cur().lines.slice(1).join(' · ') || cur().text, info.values, () => [
      this.viewer.createMarker(info.point),
      this.viewer.createLabel(cur().lines.slice(0, 2).join('\n'), info.point, { small: true }),
    ]);
    return { ...rec.m };
  }

  dispose() {
    this._resetInteraction();
    for (const r of this._items) this._removeObjs(r.objs);
    this._items = [];
    this._refreshHighlight();
    this.viewer.setHover(null);
    this.viewer.setPickFilter(null);
    for (const off of this._off) off();
    window.removeEventListener('keydown', this._onKey);
  }

  // ---------- estado interno ----------
  _resetInteraction() {
    this._token++;
    this._pending = [];
    this._removeObjs(this._pendingObjs);
    this._pendingObjs = [];
    this._area = null;
    this._inspect = null;
    this._inspectEnt = null;
    this._msg = null;
  }

  _hint() {
    if (this._msg) return this._msg;
    const h = HINTS[this.tool];
    return h ? h[Math.min(this._pending.length, h.length - 1)] : null;
  }

  _emit() {
    if (this.onChange) this.onChange(this.list(), { hint: this._hint(), inspect: this._inspect });
  }

  _refreshHighlight() {
    const ents = this._pending.map((e) => ({ kind: e.kind, id: e.id }));
    if (this._area) for (const id of this._area.m.values.faces) ents.push({ kind: 'face', id });
    if (this._inspect) ents.push({ kind: this._inspect.kind, id: this._inspect.id });
    // No borra un resaltado ajeno (de la app) si nunca resaltamos nada.
    if (!ents.length && !this._hl) return;
    this._hl = ents.length > 0;
    this.viewer.setHighlight(ents);
  }

  _removeObjs(objs) {
    for (const o of objs) this.viewer.removeOverlay(o);
    objs.length = 0;
  }

  // text: () => string (lee this.format al ejecutarse); build también lee this.format.
  _add(tool, title, text, values, build) {
    const rec = { m: { id: this._nextId++, tool, title, text: text(), values }, text, build, objs: [] };
    this._draw(rec);
    this._items.push(rec);
    this._emit();
    return rec;
  }

  _draw(rec) {
    this._removeObjs(rec.objs);
    rec.objs = rec.build();
    for (const o of rec.objs) this.viewer.addOverlay(o);
  }

  _redrawAll() {
    for (const r of this._items) this._draw(r);
    const p = this._pending[0];
    if (p) {
      this._removeObjs(this._pendingObjs);
      this._pendingObjs = [this.viewer.createMarker(p.point)];
      this.viewer.addOverlay(this._pendingObjs[0]);
    }
  }

  _onModel() {
    this._resetInteraction();
    for (const r of this._items) this._removeObjs(r.objs);
    this._items = [];
    this._hl = false;
    this._emit();
  }

  // Entidad con su topología.
  _entity(r) {
    const v = this.viewer;
    const topo = r.kind === 'face' ? v.getFace(r.id) : r.kind === 'edge' ? v.getEdge(r.id) : v.getVertex(r.id);
    return { kind: r.kind, id: r.id, point: r.point.slice(), normal: r.normal ? r.normal.slice() : null, topo };
  }

  // ¿La entidad sirve para la herramienta actual?
  _accepts(r) {
    const t = this.tool;
    if (t === 'none' || !r) return false;
    const kinds = FILTERS[t];
    if (kinds && !kinds.includes(r.kind)) return false;
    if (t === 'angle') {
      const topo = r.kind === 'face' ? this.viewer.getFace(r.id) : this.viewer.getEdge(r.id);
      return !!topo && (r.kind === 'face' ? topo.type === 'plane' && !!topo.normal : topo.type === 'line');
    }
    if (t === 'radius') {
      if (r.kind === 'edge') {
        const e = this.viewer.getEdge(r.id);
        return !!e && e.type === 'circle' && e.radius > 0;
      }
      const f = this.viewer.getFace(r.id);
      return !!f && ['cylinder', 'sphere', 'torus'].includes(f.type) && f.radius > 0;
    }
    return true;
  }

  _onHover(r) {
    if (this.tool === 'none') return;
    this.viewer.setHover(this._accepts(r) ? { kind: r.kind, id: r.id } : null);
  }

  _onPick(r, mods) {
    const t = this.tool;
    if (t === 'none') return;
    if (t === 'inspect') {
      this._inspectEnt = r ? this._entity(r) : null;
      this._inspect = this._inspectEnt ? this._inspectInfo(this._inspectEnt) : null;
      this._msg = null;
      this._refreshHighlight();
      this._emit();
      return;
    }
    if (!r) return;
    if (!this._accepts(r)) {
      this._msg = `Entidad no válida. ${HINTS[t][Math.min(this._pending.length, HINTS[t].length - 1)]}`;
      this._emit();
      return;
    }
    this._msg = null;
    const e = this._entity(r);
    if (t === 'point' || t === 'distance' || t === 'angle') {
      if (!this._pending.length) {
        this._pending = [e];
        this._pendingObjs = [this.viewer.createMarker(e.point)];
        this.viewer.addOverlay(this._pendingObjs[0]);
        this._refreshHighlight();
        this._emit();
        return;
      }
      const a = this._pending[0];
      this._pending = [];
      this._removeObjs(this._pendingObjs);
      this._refreshHighlight();
      if (t === 'point') this._measurePoints(a, e);
      else if (t === 'angle') this._measureAngle(a, e);
      else this._measureDistance(a, e);
      return;
    }
    if (t === 'radius') this._measureRadius(e);
    else if (t === 'area') this._measureArea(e, !!mods.shiftKey);
    else if (t === 'coords') this._measureCoords(e);
    else if (t === 'thickness') this._measureThickness(e);
  }

  // Texto "Δx a · Δy b · Δz c mm" con la unidad una sola vez cuando es común.
  _joinLens(parts) {
    const strs = parts.map(([, v]) => this.format.len(v));
    const sp = strs.map(splitUnit);
    const unit = sp[0][1];
    if (unit && sp.every(([n, u]) => u === unit && /^[-+−]?[\d.,\s']+$/.test(n))) {
      return parts.map(([k], i) => `${k} ${sp[i][0]}`).join(' · ') + unit;
    }
    return parts.map(([k], i) => `${k} ${strs[i]}`).join(' · ');
  }

  // Cota: línea p1–p2, marcas en los extremos y etiqueta en el punto medio.
  _dim(p1, p2, label, { dashed = false } = {}) {
    const v = this.viewer;
    return [
      v.createLine([...p1, ...p2], { width: 2, dashed }),
      v.createMarker([...p1, ...p2]),
      v.createLabel(label, mid(p1, p2)),
    ];
  }

  // ---------- herramientas ----------
  _measurePoints(a, b) {
    const p1 = a.point;
    const p2 = b.point;
    const d = sub(p2, p1);
    const dist = len(d);
    const deltas = () => this._joinLens([['Δx', d[0]], ['Δy', d[1]], ['Δz', d[2]]]);
    this._add('point', 'Distancia entre puntos', () => `${this.format.len(dist)} · ${deltas()}`,
      { distance: dist, dx: d[0], dy: d[1], dz: d[2], p1, p2 },
      () => this._dim(p1, p2, `${this.format.len(dist)}\n${deltas()}`));
  }

  async _measureDistance(a, b) {
    const ref = (e) => ({ kind: e.kind, id: e.id });
    const ra = ref(a);
    const rb = ref(b);
    const parallel = a.kind === 'face' && b.kind === 'face' && a.topo?.type === 'plane' && b.topo?.type === 'plane'
      && Math.abs(dot(norm(a.topo.normal), norm(b.topo.normal))) > 1 - PAR_TOL;
    let res;
    let exact = true;
    if (this.kernel) {
      const token = this._token;
      this._msg = 'Calculando distancia…';
      this._emit();
      try {
        res = await this.kernel.distance(ra, rb);
      } catch (err) {
        if (token !== this._token) return;
        this._msg = `No se pudo calcular la distancia: ${err?.message || err}`;
        this._emit();
        return;
      }
      if (token !== this._token) return;
      this._msg = null;
    } else {
      exact = false;
      res = { distance: len(sub(b.point, a.point)), p1: a.point, p2: b.point };
    }
    const { distance: d, p1, p2 } = res;
    const values = { distance: d, p1, p2, parallel, exact, a: ra, b: rb };
    if (parallel) values.planeDistance = Math.abs(dot(sub(b.topo.center, a.topo.center), norm(a.topo.normal)));
    const extra = parallel ? 'caras paralelas' : exact ? '' : 'entre puntos seleccionados';
    this._add('distance', exact ? 'Distancia mínima' : 'Distancia entre puntos seleccionados',
      () => `${this.format.len(d)}${extra ? ` · ${extra}` : ''}`, values,
      () => this._dim(p1, p2, `${this.format.len(d)}${extra ? `\n${extra}` : ''}`));
  }

  _measureAngle(a, b) {
    const fa = a.kind === 'face';
    const fb = b.kind === 'face';
    let title;
    let values;
    let label;
    let text;
    const F = { angle: (v) => this.format.angle(v) };
    if (fa && fb) {
      // Normales exteriores: ángulo interior = 180° − ángulo entre normales.
      const phi = acosD(dot(norm(a.topo.normal), norm(b.topo.normal)));
      const interior = 180 - phi;
      title = 'Ángulo entre caras';
      values = { angle: interior, supplement: phi };
      label = () => `${F.angle(interior)}\nsupl. ${F.angle(phi)}`;
      text = () => `${F.angle(interior)} (suplementario ${F.angle(phi)})`;
    } else if (!fa && !fb) {
      let d1 = lineDir(a.topo);
      let d2 = lineDir(b.topo);
      // Con un vértice común, ambas direcciones salen de él (ángulo real de la esquina).
      const tol = this.viewer.getModelRadius() * 1e-9;
      const ends = (e) => [e.start, e.end];
      outer: for (const [i, pa] of ends(a.topo).entries()) {
        for (const [j, pb] of ends(b.topo).entries()) {
          if (len(sub(pa, pb)) <= tol) {
            if (i === 1) d1 = mul(d1, -1);
            if (j === 1) d2 = mul(d2, -1);
            break outer;
          }
        }
      }
      const beta = acosD(dot(d1, d2));
      const acute = Math.min(beta, 180 - beta);
      title = 'Ángulo entre aristas';
      values = { angle: acute, angle180: beta };
      label = () => `${F.angle(acute)}\n0–180°: ${F.angle(beta)}`;
      text = () => `${F.angle(acute)} (0–180°: ${F.angle(beta)})`;
    } else {
      const f = fa ? a : b;
      const e = fa ? b : a;
      const ang = deg(Math.asin(Math.min(1, Math.abs(dot(norm(f.topo.normal), lineDir(e.topo))))));
      title = 'Ángulo entre arista y cara';
      values = { angle: ang };
      label = () => F.angle(ang);
      text = label;
    }
    values.a = { kind: a.kind, id: a.id };
    values.b = { kind: b.kind, id: b.id };
    this._add('angle', title, text, values, () => this._dim(a.point, b.point, label(), { dashed: true }));
  }

  _measureRadius(e) {
    const t = e.topo;
    const p = e.point;
    let R = t.radius;
    let center;
    let name;
    let axis = null;
    if (e.kind === 'edge') {
      center = t.center;
      name = edgeName(t);
      if (t.normal) axis = { p: t.center, d: norm(t.normal) };
    } else if (t.type === 'cylinder') {
      name = 'Cilindro';
      axis = t.axis;
      center = onAxis(p, t.axis);
    } else if (t.type === 'sphere') {
      name = 'Esfera';
      // Centro a lo largo de la normal; de las dos opciones, la más cercana al centroide de la cara.
      const n = norm(e.normal || sub(p, t.center));
      const c1 = sub(p, mul(n, R));
      const c2 = add(p, mul(n, R));
      center = len(sub(c1, t.center)) <= len(sub(c2, t.center)) ? c1 : c2;
    } else {
      name = 'Toro';
      axis = t.axis || null;
      center = t.axis ? onAxis(p, t.axis) : t.center;
    }
    const rd = () => this._joinLens([['R', R], ['Ø', 2 * R]]);
    this._add('radius', `Radio (${name})`, () => `${rd()} · centro ${this.format.point(center)}`,
      { radius: R, diameter: 2 * R, center, axis, point: p, type: t.type, entity: { kind: e.kind, id: e.id } },
      () => {
        const v = this.viewer;
        return [
          v.createLine([...center, ...p], { width: 1.5, dashed: true }),
          v.createMarker([...center, ...p]),
          v.createLabel(rd(), p),
        ];
      });
  }

  _measureArea(e, accumulate) {
    const sum = (v) => {
      v.area = v.faces.reduce((s, id) => s + (this.viewer.getFace(id)?.area || 0), 0);
      v.count = v.faces.length;
    };
    const txt = (v) => () => `${this.format.area(v.area)} · ${v.count} ${v.count === 1 ? 'cara' : 'caras'}`;
    const rec = accumulate ? this._area : null;
    if (!rec) {
      const st = { labelAt: e.point };
      const values = { area: 0, count: 0, faces: [e.id] };
      sum(values);
      this._area = this._add('area', 'Área', txt(values), values, () => [
        this.viewer.createLabel(`${this.format.area(values.area)}${values.count > 1 ? `\n${values.count} caras` : ''}`, st.labelAt),
      ]);
      this._area.st = st;
      this._refreshHighlight();
      return;
    }
    // Mayús+clic: añade la cara (o la quita si ya estaba).
    const v = rec.m.values;
    const i = v.faces.indexOf(e.id);
    if (i >= 0) v.faces.splice(i, 1);
    else v.faces.push(e.id);
    if (!v.faces.length) {
      this.remove(rec.m.id);
      return;
    }
    rec.st.labelAt = e.point;
    sum(v);
    rec.m.text = rec.text();
    this._draw(rec);
    this._refreshHighlight();
    this._emit();
  }

  _measureCoords(e) {
    const p = e.point;
    const xyz = () => this._joinLens([['X', p[0]], ['Y', p[1]], ['Z', p[2]]]);
    this._add('coords', 'Coordenadas', () => this.format.point(p), { point: p, x: p[0], y: p[1], z: p[2] },
      () => [this.viewer.createMarker(p), this.viewer.createLabel(xyz(), p)]);
  }

  // Espesor de pared en el punto: material justo bajo la cara, en dirección −normal.
  _measureThickness(e) {
    const v = this.viewer;
    const p = e.point;
    const n = norm(e.normal || e.topo?.normal || [0, 0, 1]);
    const R = v.getModelRadius();
    // Rayo desde fuera del modelo hacia la cara: el último impacto antes de p es la cara
    // opuesta más cercana (la pared detrás del punto).
    const L = 4 * R + 1;
    const origin = sub(p, mul(n, L));
    const selfTol = R * 1e-2;
    let hit = null;
    for (const h of v.raycastModel(origin, n)) {
      if (h.distance >= L - R * 1e-6) break;
      if (h.faceId === e.id && h.distance > L - selfTol) break;
      hit = h;
    }
    if (!hit) {
      this._msg = 'No se encontró la cara opuesta en esa dirección';
      this._emit();
      return;
    }
    let t = L - hit.distance;
    let p2 = add(origin, mul(n, hit.distance));
    let method = 'malla';
    const f1 = e.topo;
    const f2 = hit.faceId != null ? v.getFace(hit.faceId) : null;
    if (f1 && f2 && f1.type === 'plane' && f2.type === 'plane' && f1.normal && f2.normal
      && Math.abs(dot(norm(f1.normal), norm(f2.normal))) > 1 - PAR_TOL) {
      const n1 = norm(f1.normal);
      t = Math.abs(dot(sub(f2.center, p), n1));
      p2 = sub(p, mul(n, t));
      method = 'planos paralelos';
    } else if (f1 && f2 && f1.type === 'cylinder' && f2.type === 'cylinder' && f1.axis && f2.axis) {
      const d1 = norm(f1.axis.d);
      const off = sub(f2.axis.p, f1.axis.p);
      const offPerp = len(cross(off, d1));
      if (Math.abs(dot(d1, norm(f2.axis.d))) > 1 - PAR_TOL && offPerp <= R * 1e-9) {
        const c = onAxis(p, f1.axis);
        const radial = norm(sub(p, c));
        t = Math.abs(f1.radius - f2.radius);
        p2 = add(c, mul(radial, f2.radius));
        method = 'cilindros coaxiales';
      }
    }
    const exact = method !== 'malla';
    this._add('thickness', 'Espesor de pared', () => `${this.format.len(t)}${exact ? '' : ' (aprox. malla)'}`,
      { thickness: t, p1: p, p2, exact, method, faces: [e.id, hit.faceId] },
      () => this._dim(p, p2, `Espesor ${this.format.len(t)}${exact ? '' : ' ≈'}`));
  }

  // ---------- inspección ----------
  _inspectInfo(e) {
    const F = this.format;
    const t = e.topo;
    const values = { point: e.point };
    const lines = [];
    let title;
    let type = t?.type || 'other';
    if (e.kind === 'vertex') {
      type = 'vertex';
      title = 'Vértice';
      const p = t ? t.p : e.point;
      values.point = p;
      lines.push(title, F.point(p));
    } else if (e.kind === 'face') {
      const name = FACE_NAMES[type] || 'Superficie';
      title = `Cara: ${name}`;
      lines.push(name);
      values.type = type;
      if (t?.radius > 0) {
        values.radius = t.radius;
        values.diameter = 2 * t.radius;
        lines.push(this._joinLens([['R', t.radius], ['Ø', 2 * t.radius]]));
      }
      if (t?.semiAngleDeg != null) {
        values.semiAngleDeg = t.semiAngleDeg;
        lines.push(`Semiángulo ${F.angle(t.semiAngleDeg)}`);
      }
      if (type === 'plane' && t?.normal) {
        values.normal = norm(t.normal);
        lines.push(`Normal ${vec(values.normal)}`);
      }
      if (t?.axis) {
        values.axis = { p: t.axis.p, d: norm(t.axis.d) };
        lines.push(`Eje ${F.point(t.axis.p)} dir ${vec(values.axis.d)}`);
      }
      if (t?.area != null) {
        values.area = t.area;
        lines.push(`Área ${F.area(t.area)}`);
      }
    } else {
      const name = t ? edgeName(t) : 'Arista';
      title = `Arista: ${name}`;
      lines.push(name);
      values.type = type;
      if (t?.radius > 0) {
        values.radius = t.radius;
        values.diameter = 2 * t.radius;
        lines.push(this._joinLens([['R', t.radius], ['Ø', 2 * t.radius]]));
      }
      if (t?.center) {
        values.center = t.center;
        lines.push(`Centro ${F.point(t.center)}`);
      }
      if (type === 'circle' && !t.closed && t.radius > 0 && t.length != null) {
        values.arcAngle = deg(t.length / t.radius);
        lines.push(`Ángulo de arco ${F.angle(values.arcAngle)}`);
      }
      if (type === 'line') {
        values.dir = lineDir(t);
        lines.push(`Dirección ${vec(values.dir)}`);
      }
      if (t?.length != null) {
        values.length = t.length;
        lines.push(`Longitud ${F.len(t.length)}`);
      }
    }
    values.type = values.type || type;
    return { kind: e.kind, id: e.id, type, title, text: lines.join(' · '), lines, point: values.point, values };
  }
}
