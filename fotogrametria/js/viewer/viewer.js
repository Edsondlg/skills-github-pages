// Visor 3D (three.js): tapete, cámaras, malla reconstruida con modos de visualización,
// herramientas de medición, sección y exportación. Unidades: mm, Z hacia arriba.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { turbo, deviationColor } from '../core/colormap.js';
import { boardPrimitives, rasterizePrims } from '../core/board.js';

const SRGB2LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) { const c = i / 255; SRGB2LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

export function label(text, cls = '') {
  const el = document.createElement('div');
  el.className = 'label3d ' + cls;
  el.textContent = text;
  return new CSS2DObject(el);
}

export class Viewer3D {
  constructor(host) {
    this.host = host;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    this.renderer = renderer;
    const lr = new CSS2DRenderer();
    lr.domElement.style.position = 'absolute';
    lr.domElement.style.inset = '0';
    lr.domElement.style.pointerEvents = 'none';
    host.appendChild(lr.domElement);
    this.labelRenderer = lr;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 20000);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(-260, -380, 330);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(0, 0, 10);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3f46, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-300, -400, 700);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.55);
    fill.position.set(400, 300, 200);
    this.scene.add(fill);
    this.camLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.scene.add(this.camLight);

    this.groups = {};
    for (const g of ['board', 'grid', 'cameras', 'mesh', 'cad', 'stickers', 'measure', 'helpers', 'box']) {
      this.groups[g] = new THREE.Group();
      this.groups[g].name = g;
      this.scene.add(this.groups[g]);
    }
    this.partRoot = new THREE.Group(); // contenedor transformable de la pieza
    this.groups.mesh.add(this.partRoot);
    this.mode = 'color';
    this.meshData = null;
    this.clipPlanes = [];
    this.tool = null;
    this.onMeasure = null;
    this.onPick = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._setupTheme();
    this._buildGrid(400);
    this._bindEvents();
    this.resize();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(host);
    this._loop = this._loop.bind(this);
    this._running = true;
    requestAnimationFrame(this._loop);
  }

  _setupTheme() {
    const dark = getComputedStyle(document.documentElement).getPropertyValue('color-scheme').trim() !== 'light';
    this.scene.background = new THREE.Color(dark ? 0x10151b : 0xe9edf2);
  }
  refreshTheme() { this._setupTheme(); this._buildGrid(this.gridSize || 400); }

  _buildGrid(size) {
    this.gridSize = size;
    const g = this.groups.grid;
    g.clear();
    const dark = this.scene.background.getHSL({}).l < 0.5;
    const minor = new THREE.GridHelper(size, size / 10, dark ? 0x26303b : 0xc9d1da, dark ? 0x1b232c : 0xdbe1e8);
    minor.rotation.x = Math.PI / 2;
    minor.position.z = -0.6;
    g.add(minor);
    const major = new THREE.GridHelper(size, size / 50, dark ? 0x3a4654 : 0xaab4bf, dark ? 0x2a3440 : 0xbfc8d2);
    major.rotation.x = Math.PI / 2;
    major.position.z = -0.55;
    g.add(major);
    const axes = new THREE.AxesHelper(40);
    axes.position.z = 0.05;
    g.add(axes);
  }

  resize() {
    const w = Math.max(10, this.host.clientWidth), h = Math.max(10, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _loop() {
    if (!this._running) return;
    this.controls.update();
    this.camLight.position.copy(this.camera.position);
    if (this.host.offsetParent !== null) {
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    }
    requestAnimationFrame(this._loop);
  }

  // ---------- Tapete ----------
  setBoard(board, { textured = true } = {}) {
    const g = this.groups.board;
    disposeGroup(g);
    if (!board) return;
    let mat;
    if (textured) {
      const prims = boardPrimitives(board);
      const ppm = Math.min(4, 4096 / Math.max(board.paperW, board.paperH));
      const ras = rasterizePrims(prims, board.paperW, board.paperH, ppm, { paper: 242, ink: 30 });
      const data = new Uint8Array(ras.w * ras.h * 4);
      // filas invertidas: la fila 0 de la textura corresponde a v = 0 (borde inferior del papel)
      for (let y = 0; y < ras.h; y++) {
        const src = (ras.h - 1 - y) * ras.w, dst = y * ras.w;
        for (let x = 0; x < ras.w; x++) { const v = ras.data[src + x], o = 4 * (dst + x); data[o] = v; data[o + 1] = v; data[o + 2] = v; data[o + 3] = 255; }
      }
      const tex = new THREE.DataTexture(data, ras.w, ras.h, THREE.RGBAFormat);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92 });
    } else {
      mat = new THREE.MeshBasicMaterial({ color: 0xf2f2f2, transparent: true, opacity: 0.85 });
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(board.paperW, board.paperH), mat);
    plane.position.set(board.paperW / 2 - board.u0, board.v0 - board.paperH / 2, -0.3);
    plane.renderOrder = -1;
    g.add(plane);
    // contorno de la zona libre
    const f = board.free;
    const pts = [[f.x0, f.y0], [f.x1, f.y0], [f.x1, f.y1], [f.x0, f.y1], [f.x0, f.y0]].map(([x, y]) => new THREE.Vector3(x, y, 0.05));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x2dd4bf, dashSize: 4, gapSize: 3 })).computeLineDistances());
    this.board = board;
    this._buildGrid(Math.ceil(Math.max(board.paperW, board.paperH) * 1.6 / 100) * 100);
  }

  // ---------- Cámaras ----------
  setCameras(K, views, { size = 30, highlight = null } = {}) {
    const g = this.groups.cameras;
    disposeGroup(g);
    if (!K || !views) return;
    const w = K.width, h = K.height;
    const corners = [[0, 0], [w, 0], [w, h], [0, h]].map(([u, v]) => [(u - K.cx) / K.fx, (v - K.cy) / K.fy, 1]);
    views.forEach((v, i) => {
      if (!v.R) return;
      const R = v.R, t = v.t;
      const toW = (p) => { const s = size; const c = [p[0] * s - t[0], p[1] * s - t[1], p[2] * s - t[2]]; return new THREE.Vector3(R[0] * c[0] + R[3] * c[1] + R[6] * c[2], R[1] * c[0] + R[4] * c[1] + R[7] * c[2], R[2] * c[0] + R[5] * c[1] + R[8] * c[2]); };
      const C = toW([0, 0, 0]);
      const P = corners.map(toW);
      const pos = [];
      for (const p of P) pos.push(C.x, C.y, C.z, p.x, p.y, p.z);
      for (let k = 0; k < 4; k++) { const a = P[k], b = P[(k + 1) % 4]; pos.push(a.x, a.y, a.z, b.x, b.y, b.z); }
      // marca de "arriba" de la imagen
      const top = toW([0, (0 - K.cy) / K.fy * 1.25, 1]);
      pos.push(P[0].x, P[0].y, P[0].z, top.x, top.y, top.z, top.x, top.y, top.z, P[1].x, P[1].y, P[1].z);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const color = highlight === i ? 0xf5a524 : (v.color || 0x60a5fa);
      const ls = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color }));
      ls.userData.viewIndex = i;
      g.add(ls);
      const lb = label(String(v.label ?? i + 1), 'small');
      lb.position.copy(C);
      g.add(lb);
    });
  }

  // ---------- Caja de la pieza ----------
  setBox(box, color = 0xf5a524) {
    const g = this.groups.box;
    disposeGroup(g);
    if (!box) return;
    const b3 = new THREE.Box3(new THREE.Vector3(...box.min), new THREE.Vector3(...box.max));
    g.add(new THREE.Box3Helper(b3, color));
  }

  // ---------- Malla ----------
  // data: { positions, indices, colors (Uint8 RGB), conf }
  setMesh(data) {
    // la malla texturizada pertenece a la app: se retira sin destruirla
    if (this.texturedMesh) { this.partRoot.remove(this.texturedMesh); this.texturedMesh = null; }
    disposeGroup(this.partRoot);
    this.wire = null;
    this.meshData = data;
    this.deviation = null;
    if (!data || !data.indices || !data.indices.length) { this.mesh = null; return; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const n = data.positions.length / 3;
    const col = new Float32Array(n * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.geometry = geo;
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide }));
    this.mesh.name = 'pieza';
    this.partRoot.add(this.mesh);
    this.wire = null; // se crea al elegir el modo alambre
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true }));
    this.points.visible = false;
    this.partRoot.add(this.points);
    this.setMode(this.mode);
    this.applyClipping();
  }

  setTexturedMesh(obj) {
    if (this.texturedMesh && this.texturedMesh !== obj) this.partRoot.remove(this.texturedMesh);
    this.texturedMesh = obj;
    if (obj && obj.parent !== this.partRoot) { obj.visible = false; this.partRoot.add(obj); }
    this.applyClipping();
    this.setMode(this.mode);
  }

  setDeviation(values, tol, range) {
    this.deviation = values ? { values, tol, range } : null;
    if (values) this.setMode('deviation'); else if (this.mode === 'deviation') this.setMode('color');
  }

  setMode(mode) {
    this.mode = mode;
    if (!this.mesh) return;
    const d = this.meshData;
    const col = this.geometry.attributes.color.array;
    const n = col.length / 3;
    const mat = this.mesh.material;
    this.mesh.visible = mode !== 'points' && mode !== 'texture';
    this.points.visible = mode === 'points';
    if (mode === 'wire' && !this.wire) {
      this.wire = new THREE.LineSegments(new THREE.WireframeGeometry(this.geometry), new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.35 }));
      this.partRoot.add(this.wire);
      this.applyClipping();
    }
    if (this.wire) this.wire.visible = mode === 'wire';
    if (this.texturedMesh) this.texturedMesh.visible = mode === 'texture';
    if (mode === 'texture' && !this.texturedMesh) { this.mesh.visible = true; mode = 'color'; }
    mat.metalness = 0; mat.roughness = 0.85; mat.vertexColors = true; mat.color.set(0xffffff); mat.flatShading = false;
    if (mode === 'color' || mode === 'points' || mode === 'wire') {
      for (let i = 0; i < n; i++) { col[3 * i] = SRGB2LIN[d.colors[3 * i]]; col[3 * i + 1] = SRGB2LIN[d.colors[3 * i + 1]]; col[3 * i + 2] = SRGB2LIN[d.colors[3 * i + 2]]; }
      if (mode === 'wire') { for (let i = 0; i < col.length; i++) col[i] *= 0.6; }
    } else if (mode === 'shaded') {
      mat.vertexColors = false; mat.color.set(0xb9c2cc); mat.metalness = 0.55; mat.roughness = 0.38;
    } else if (mode === 'confidence') {
      for (let i = 0; i < n; i++) { const [r, g, b] = turbo(Math.min(1, (d.conf[i] - 1) / 11)); col[3 * i] = SRGB2LIN[Math.round(r * 255)]; col[3 * i + 1] = SRGB2LIN[Math.round(g * 255)]; col[3 * i + 2] = SRGB2LIN[Math.round(b * 255)]; }
    } else if (mode === 'deviation') {
      const dv = this.deviation;
      for (let i = 0; i < n; i++) {
        let c = [0.5, 0.5, 0.5];
        if (dv && isFinite(dv.values[i])) c = deviationColor(dv.values[i] / dv.range, dv.tol / dv.range);
        col[3 * i] = SRGB2LIN[Math.round(c[0] * 255)]; col[3 * i + 1] = SRGB2LIN[Math.round(c[1] * 255)]; col[3 * i + 2] = SRGB2LIN[Math.round(c[2] * 255)];
      }
    }
    this.geometry.attributes.color.needsUpdate = true;
    mat.needsUpdate = true;
  }

  // ---------- CAD de referencia ----------
  setCAD(geometry, { visible = true, opacity = 0.25 } = {}) {
    disposeGroup(this.groups.cad);
    if (!geometry) return;
    // gris neutro (el azul de la escala de desviación significa «falta material») y desplazado en
    // profundidad: donde la medición coincide con el CAD se ve la medición; el CAD sólo asoma donde falta
    const m = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xb8c0ca, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, metalness: 0.1, roughness: 0.6,
      polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }));
    m.visible = visible;
    this.cadMesh = m;
    this.groups.cad.add(m);
  }

  // ---------- Calcomanías ----------
  setStickers(stickers) {
    const g = this.groups.stickers;
    disposeGroup(g);
    if (!stickers) return;
    for (const s of stickers) {
      const pts = [...s.corners, s.corners[0]].map(p => new THREE.Vector3(...p));
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf5a524 })));
      const lb = label(`#${s.id}`, 'sticker small');
      lb.position.set(...s.center);
      g.add(lb);
    }
  }

  // ---------- Vistas ----------
  fit(obj = null, dir = null) {
    const box = new THREE.Box3();
    if (obj) box.setFromObject(obj);
    else if (this.mesh && this.partRoot.children.length) box.setFromObject(this.partRoot);
    else if (this.board) box.set(new THREE.Vector3(-this.board.paperW / 2, -this.board.paperH / 2, 0), new THREE.Vector3(this.board.paperW / 2, this.board.paperH / 2, 30));
    else box.set(new THREE.Vector3(-100, -100, 0), new THREE.Vector3(100, 100, 50));
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() / 2 || 100;
    const d = dir ? new THREE.Vector3(...dir).normalize() : this.camera.position.clone().sub(this.controls.target).normalize();
    const dist = r / Math.sin(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 1.05;
    this.controls.target.copy(c);
    this.camera.position.copy(c).addScaledVector(d, dist);
    this.camera.near = Math.max(0.1, dist / 200);
    this.camera.far = dist * 50;
    this.camera.updateProjectionMatrix();
  }
  view(name) {
    const dirs = { top: [0, -0.0001, 1], front: [0, -1, 0.0001], back: [0, 1, 0.0001], left: [-1, 0, 0.0001], right: [1, 0, 0.0001], iso: [-0.55, -0.8, 0.65] };
    this.fit(null, dirs[name] || dirs.iso);
  }

  show(groupName, on) { if (this.groups[groupName]) this.groups[groupName].visible = on; }

  // ---------- Recorte / sección ----------
  setClipping(planes) { this.clipPlanes = planes || []; this.applyClipping(); }
  applyClipping() {
    const apply = (o) => o.traverse(x => { if (x.material) { x.material.clippingPlanes = this.clipPlanes.length ? this.clipPlanes : null; x.material.clipShadows = true; x.material.needsUpdate = true; } });
    apply(this.partRoot);
    apply(this.groups.cad);
  }

  // ---------- Selección de puntos ----------
  _bindEvents() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
      down = null;
      if (moved > 4 || e.button !== 0) return;
      const hit = this.pick(e.clientX, e.clientY);
      if (this.onPick) this.onPick(hit, e);
    });
  }

  pick(clientX, clientY) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = [];
    if (this.mesh && this.mesh.visible) targets.push(this.mesh);
    if (this.texturedMesh && this.texturedMesh.visible) targets.push(this.texturedMesh);
    if (this.points && this.points.visible) { this.raycaster.params.Points.threshold = 0.6; targets.push(this.points); }
    if (this.cadMesh && this.cadMesh.visible) targets.push(this.cadMesh);
    let hits = this.raycaster.intersectObjects(targets, true);
    if (this.clipPlanes.length) hits = hits.filter(h => this.clipPlanes.every(p => p.distanceToPoint(h.point) >= -1e-6));
    if (!hits.length) {
      // plano de la mesa
      const p = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), p)) return { point: p, object: null, onTable: true };
      return null;
    }
    const h = hits[0];
    const nrm = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null;
    return { point: h.point.clone(), normal: nrm, object: h.object, index: h.index, face: h.face };
  }

  // Coordenadas del punto en el sistema de la pieza (inverso de la transformación aplicada).
  toPartCoords(p) { return this.partRoot.worldToLocal(p.clone()); }

  // ---------- Transformación (mover/rotar la pieza) ----------
  enableTransform(mode) {
    if (!this.tc) {
      this.tc = new TransformControls(this.camera, this.renderer.domElement);
      this.tc.addEventListener('dragging-changed', (e) => { this.controls.enabled = !e.value; });
      this.scene.add(this.tc.getHelper ? this.tc.getHelper() : this.tc);
    }
    if (!mode) { this.tc.detach(); return; }
    this.tc.setMode(mode);
    this.tc.attach(this.partRoot);
  }
  resetTransform() { this.partRoot.position.set(0, 0, 0); this.partRoot.rotation.set(0, 0, 0); this.partRoot.scale.set(1, 1, 1); this.partRoot.updateMatrixWorld(true); }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose() {
    this._running = false;
    this._ro.disconnect();
    this.renderer.dispose();
  }
}

export function disposeObject(o) {
  o.traverse?.((x) => {
    if (x.geometry) x.geometry.dispose();
    if (x.material) {
      const ms = Array.isArray(x.material) ? x.material : [x.material];
      for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
    }
    if (x.element && x.element.remove) x.element.remove();
  });
}
export function disposeGroup(g) {
  for (const c of [...g.children]) { g.remove(c); disposeObject(c); }
}
