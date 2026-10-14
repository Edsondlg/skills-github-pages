// Herramientas del visor: mediciones (distancia, punto, ángulo, radio) y secciones.
import * as THREE from 'three';
import { label, disposeObject } from './viewer.js';

const TYPES = {
  distance: { n: 2, name: 'Distancia' },
  point: { n: 1, name: 'Punto' },
  angle: { n: 3, name: 'Ángulo' },
  radius: { n: 3, name: 'Radio (3 puntos)' },
};

export function circleFrom3(a, b, c) {
  const ab = b.clone().sub(a), ac = c.clone().sub(a);
  const n = new THREE.Vector3().crossVectors(ab, ac);
  const n2 = n.lengthSq();
  if (n2 < 1e-12) return null;
  const t1 = new THREE.Vector3().crossVectors(n, ab).multiplyScalar(ac.lengthSq());
  const t2 = new THREE.Vector3().crossVectors(ac, n).multiplyScalar(ab.lengthSq());
  const center = a.clone().add(t1.add(t2).multiplyScalar(1 / (2 * n2)));
  return { center, radius: center.distanceTo(a), normal: n.normalize() };
}

export class MeasureTool {
  constructor(viewer, onChange = () => {}) {
    this.v = viewer;
    this.onChange = onChange;
    this.mode = null;
    this.pending = [];
    this.items = [];
    this.group = viewer.groups.measure;
    this.pendingGroup = new THREE.Group();
    this.group.add(this.pendingGroup);
    this.seq = 1;
  }
  setMode(mode) { this.mode = mode; this.clearPending(); }
  clearPending() {
    for (const c of [...this.pendingGroup.children]) { this.pendingGroup.remove(c); disposeObject(c); }
    this.pending = [];
  }
  marker(p, color = 0xf5a524) {
    const r = Math.max(0.35, this.v.camera.position.distanceTo(p) * 0.0035);
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color, depthTest: false }));
    m.renderOrder = 10;
    m.position.copy(p);
    return m;
  }
  // Coordenadas en el sistema del tapete (mundo); si la pieza fue movida, se miden en el mundo.
  handlePick(hit) {
    if (!this.mode || !hit) return false;
    const p = hit.point.clone();
    this.pending.push(p);
    this.pendingGroup.add(this.marker(p));
    if (this.pending.length >= TYPES[this.mode].n) {
      this.finish();
    }
    return true;
  }
  finish() {
    const pts = this.pending.slice();
    const type = this.mode;
    this.clearPending();
    const g = new THREE.Group();
    const item = { id: this.seq++, type, points: pts.map(p => p.toArray()), group: g };
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf5a524, depthTest: false });
    const addLine = (arr) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arr), lineMat); l.renderOrder = 9; g.add(l); };
    pts.forEach(p => g.add(this.marker(p)));
    if (type === 'distance') {
      const [a, b] = pts;
      const d = a.distanceTo(b);
      item.value = d;
      item.extra = { dx: b.x - a.x, dy: b.y - a.y, dz: b.z - a.z };
      item.text = `${d.toFixed(2)} mm`;
      addLine([a, b]);
      const lb = label(`${d.toFixed(2)} mm`);
      lb.position.copy(a.clone().add(b).multiplyScalar(0.5));
      g.add(lb);
    } else if (type === 'point') {
      const [a] = pts;
      item.value = a.z;
      item.text = `X ${a.x.toFixed(2)} · Y ${a.y.toFixed(2)} · Z ${a.z.toFixed(2)}`;
      const lb = label(`(${a.x.toFixed(1)}, ${a.y.toFixed(1)}, ${a.z.toFixed(2)})`, 'small');
      lb.position.copy(a);
      g.add(lb);
      // guía vertical hasta la mesa
      addLine([a, new THREE.Vector3(a.x, a.y, 0)]);
    } else if (type === 'angle') {
      const [a, b, c] = pts;
      const u = a.clone().sub(b).normalize(), w = c.clone().sub(b).normalize();
      const ang = THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(u.dot(w), -1, 1)));
      item.value = ang;
      item.text = `${ang.toFixed(2)}°`;
      addLine([a, b, c]);
      const lb = label(`${ang.toFixed(1)}°`);
      lb.position.copy(b);
      g.add(lb);
    } else if (type === 'radius') {
      const circ = circleFrom3(...pts);
      if (!circ) { item.value = NaN; item.text = 'Puntos colineales'; }
      else {
        item.value = circ.radius;
        item.extra = { diameter: 2 * circ.radius, center: circ.center.toArray() };
        item.text = `R ${circ.radius.toFixed(2)} mm · Ø ${(2 * circ.radius).toFixed(2)} mm`;
        const curve = new THREE.EllipseCurve(0, 0, circ.radius, circ.radius, 0, Math.PI * 2);
        const pts2 = curve.getPoints(96).map(q => new THREE.Vector3(q.x, q.y, 0));
        const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts2), lineMat);
        l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), circ.normal);
        l.position.copy(circ.center);
        l.renderOrder = 9;
        g.add(l);
        const lb = label(`Ø ${(2 * circ.radius).toFixed(2)} mm`);
        lb.position.copy(circ.center);
        g.add(lb);
      }
    }
    this.group.add(g);
    this.items.push(item);
    this.onChange(this.items);
  }
  remove(id) {
    const i = this.items.findIndex(x => x.id === id);
    if (i < 0) return;
    const it = this.items[i];
    this.group.remove(it.group); disposeObject(it.group);
    this.items.splice(i, 1);
    this.onChange(this.items);
  }
  clear() {
    for (const it of this.items) { this.group.remove(it.group); disposeObject(it.group); }
    this.items = [];
    this.clearPending();
    this.onChange(this.items);
  }
  toCSV() {
    const rows = [['id', 'tipo', 'valor', 'texto', 'puntos (mm)']];
    for (const it of this.items) rows.push([it.id, TYPES[it.type].name, isFinite(it.value) ? it.value.toFixed(4) : '', it.text, it.points.map(p => p.map(v => v.toFixed(3)).join(' ')).join(' | ')]);
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}
export const MEASURE_TYPES = TYPES;

// Intersección de la malla (en coordenadas del mundo) con un plano: segmentos [x0,y0,z0,x1,y1,z1,...].
export function sectionSegments(mesh, plane) {
  const geo = mesh.geometry;
  const pos = geo.attributes.position.array;
  const idx = geo.index ? geo.index.array : null;
  const m = mesh.matrixWorld;
  const nV = pos.length / 3;
  const wp = new Float32Array(pos.length);
  const v = new THREE.Vector3();
  for (let i = 0; i < nV; i++) { v.set(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]).applyMatrix4(m); wp[3 * i] = v.x; wp[3 * i + 1] = v.y; wp[3 * i + 2] = v.z; }
  const n = plane.normal, c = plane.constant;
  const dist = new Float32Array(nV);
  for (let i = 0; i < nV; i++) dist[i] = n.x * wp[3 * i] + n.y * wp[3 * i + 1] + n.z * wp[3 * i + 2] + c;
  const out = [];
  const nT = idx ? idx.length / 3 : nV / 3;
  for (let t = 0; t < nT; t++) {
    const ia = idx ? idx[3 * t] : 3 * t, ib = idx ? idx[3 * t + 1] : 3 * t + 1, ic = idx ? idx[3 * t + 2] : 3 * t + 2;
    const da = dist[ia], db = dist[ib], dc = dist[ic];
    const pts = [];
    const edge = (i, j, di, dj) => {
      if ((di < 0) === (dj < 0)) return;
      const s = di / (di - dj);
      pts.push(wp[3 * i] + s * (wp[3 * j] - wp[3 * i]), wp[3 * i + 1] + s * (wp[3 * j + 1] - wp[3 * i + 1]), wp[3 * i + 2] + s * (wp[3 * j + 2] - wp[3 * i + 2]));
    };
    edge(ia, ib, da, db); edge(ib, ic, db, dc); edge(ic, ia, dc, da);
    if (pts.length === 6) out.push(...pts);
  }
  return new Float32Array(out);
}
