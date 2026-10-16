// Visor 3D (contrato C5): escena three.js, vistas, sección, selección exacta B-rep.
// Mundo con Z hacia arriba; unidades en mm.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const fix3 = (v) => {
  const s = (+v).toFixed(3);
  return s === '-0.000' ? '0.000' : s;
};

// Formato por defecto: mm con 3 decimales.
export const DEFAULT_FORMAT = {
  len: (v) => `${fix3(v)} mm`,
  area: (v) => `${fix3(v)} mm²`,
  angle: (v) => `${fix3(v)}°`,
  point: (p) => `(${fix3(p[0])}, ${fix3(p[1])}, ${fix3(p[2])}) mm`,
};

export const THEMES = {
  dark: {
    bgTop: '#4b525c', bgBottom: '#16191d', edge: '#dfe5ec', grid: '#7d8792', gridMajor: '#a3adb8',
    hemiSky: '#e8eef5', hemiGround: '#2a2622', hover: '#3ea6ff', select: '#ff9d2e', measure: '#ffc94a',
    section: '#c45a3c', bbox: '#9fc2e6', wire: '#a9b4bf', labelBg: 'rgba(22,25,30,0.88)', labelFg: '#f3f6f9',
  },
  light: {
    bgTop: '#fdfdfe', bgBottom: '#cdd5de', edge: '#1b1f24', grid: '#97a1ad', gridMajor: '#6c7886',
    hemiSky: '#ffffff', hemiGround: '#8d8a86', hover: '#0b7be0', select: '#e86a00', measure: '#c2410c',
    section: '#b4442b', bbox: '#2f5f8f', wire: '#55606c', labelBg: 'rgba(255,255,255,0.94)', labelFg: '#15191e',
  },
};

const DEFAULT_APPEARANCE = { color: '#b9c0c8', metalness: 0.55, roughness: 0.36, opacity: 1 };

// Direcciones (cámara → desde) de las vistas estándar; Z arriba. Frente = desde −Y, derecha = desde +X.
const VIEW_DIRS = {
  iso: [1, -1, 1], front: [0, -1, 0], back: [0, 1, 0], left: [-1, 0, 0], right: [1, 0, 0],
  top: [0, -1e-4, 1], bottom: [0, 1e-4, -1],
};
// Lado que se conserva en la sección (normal del plano de corte), sin invertir.
const SECTION_KEEP = { x: [-1, 0, 0], y: [0, 1, 0], z: [0, 0, -1] };
const GIZMO_VIEWS = { posX: 'right', negX: 'left', posY: 'back', negY: 'front', posZ: 'top', negZ: 'bottom' };
const ALL_KINDS = ['vertex', 'edge', 'face'];
const VERTEX_PX = 10;
const EDGE_PX = 6;
const GIZMO_DIM = 128;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const st = document.createElement('style');
  st.textContent = `
.v3d-labels{position:absolute;left:0;top:0;pointer-events:none;overflow:hidden}
.v3d-label{padding-bottom:7px;pointer-events:none}
.v3d-label.v3d-center{padding-bottom:0}
.v3d-pill{display:block;font:600 12px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  font-variant-numeric:tabular-nums;white-space:pre;padding:3px 8px;border-radius:10px;
  box-shadow:0 1px 3px rgba(0,0,0,.35);border:1px solid var(--v3d-accent,#888);text-align:center}
.v3d-theme-dark .v3d-pill{background:${THEMES.dark.labelBg};color:${THEMES.dark.labelFg}}
.v3d-theme-light .v3d-pill{background:${THEMES.light.labelBg};color:${THEMES.light.labelFg}}
.v3d-pill.v3d-small{font-weight:500;font-size:11px;padding:1px 6px;border-radius:8px;box-shadow:none}`;
  document.head.appendChild(st);
}

function toF32(a) {
  return a instanceof Float32Array ? a : Float32Array.from(a);
}
function toU32(a) {
  return a instanceof Uint32Array ? a : Uint32Array.from(a);
}
const v3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const arr = (v) => [v.x, v.y, v.z];

// Fondo degradado vertical (se dibuja como textura de pantalla completa).
function gradientTexture(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Textura circular para marcadores de puntos.
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.beginPath();
  g.arc(32, 32, 26, 0, Math.PI * 2);
  g.fillStyle = '#ffffff';
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = 'rgba(0,0,0,0.55)';
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Paso "redondo" 1-2-5 × 10^k mayor o igual que v.
function niceStep(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

export class Viewer3D {
  constructor(container, { theme = 'dark', format } = {}) {
    injectStyle();
    this.container = container;
    this.format = { ...DEFAULT_FORMAT, ...(format || {}) };
    this.themeName = THEMES[theme] ? theme : 'dark';
    this.theme = THEMES[this.themeName];
    this._listeners = new Map();
    this._lineMaterials = new Set();
    this._clippable = new Set();
    this._appearance = { ...DEFAULT_APPEARANCE };
    this._display = { edges: true, wireframe: false, xray: false, grid: true, axes: true, bbox: false };
    this._section = { enabled: false, axis: 'x', offset: 0, flip: false };
    this._plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    this._projection = 'perspective';
    this._pickKinds = null;
    this._model = null;
    this._raf = 0;
    this._anim = null;
    this._hoverKey = '';
    this._w = 1;
    this._h = 1;
    this._raycaster = new THREE.Raycaster();

    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.classList.add('v3d-root', `v3d-theme-${this.themeName}`);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.localClippingEnabled = true;
    renderer.autoClear = false;
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', outline: 'none', touchAction: 'none' });
    renderer.domElement.tabIndex = 0;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    this.css2d = new CSS2DRenderer();
    this.css2d.domElement.className = 'v3d-labels';
    container.appendChild(this.css2d.domElement);

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this._envTex = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    scene.environment = this._envTex;
    scene.environmentIntensity = 0.85;

    // Luz suave hemisférica (Z arriba) + luz principal y de relleno que siguen a la cámara.
    this._hemi = new THREE.HemisphereLight(this.theme.hemiSky, this.theme.hemiGround, 0.9);
    this._hemi.position.set(0, 0, 1);
    this._key = new THREE.DirectionalLight('#ffffff', 1.5);
    this._fill = new THREE.DirectionalLight('#ffffff', 0.35);
    scene.add(this._hemi, this._key, this._key.target, this._fill, this._fill.target);

    this._persp = new THREE.PerspectiveCamera(32, 1, 0.1, 1e5);
    this._ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1e5);
    this._persp.up.set(0, 0, 1);
    this._ortho.up.set(0, 0, 1);
    this._orthoHalfH = 50;
    this.camera = this._persp;

    const controls = new OrbitControls(this._persp, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.14;
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 1.1;
    controls.minZoom = 0.01;
    controls.maxZoom = 2000;
    controls.addEventListener('change', () => this.requestRender());
    controls.addEventListener('start', () => {
      this._anim = null;
    });
    this.controls = controls;

    this.viewHelper = new ViewHelper(this._persp, renderer.domElement);
    this.viewHelper.setLabels('X', 'Y', 'Z');
    this._gizmoCam = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 4);
    this._gizmoCam.position.set(0, 0, 2);

    this._modelGroup = new THREE.Group();
    this._helperGroup = new THREE.Group();
    this._overlayGroup = new THREE.Group();
    this._measureGroup = new THREE.Group();
    scene.add(this._modelGroup, this._helperGroup, this._overlayGroup, this._measureGroup);

    this._dotTex = dotTexture();
    this._applyBackground();

    this._bindEvents();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(container);
    this.resize();
    this._fitTo(VIEW_DIRS.iso, false);
  }

  // ---------- eventos ----------
  on(name, cb) {
    if (!this._listeners.has(name)) this._listeners.set(name, new Set());
    this._listeners.get(name).add(cb);
    return () => this.off(name, cb);
  }
  off(name, cb) {
    this._listeners.get(name)?.delete(cb);
  }
  _emit(name, ...args) {
    for (const cb of this._listeners.get(name) || []) cb(...args);
  }

  _bindEvents() {
    const el = this.renderer.domElement;
    let down = null;
    let hoverEv = null;
    let hoverRaf = 0;
    const mods = (e) => ({ shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, clientX: e.clientX, clientY: e.clientY });
    const doHover = () => {
      hoverRaf = 0;
      const e = hoverEv;
      if (!e || this._disposed) return;
      const r = this.pick(e.clientX, e.clientY);
      this._emit('cursor', { point: r ? r.point : null, pick: r, clientX: e.clientX, clientY: e.clientY });
      this._emit('hover', r, mods(e));
    };
    this._onPointerDown = (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button };
    };
    this._onPointerMove = (e) => {
      if (e.buttons !== 0 || this._anim) return;
      hoverEv = e;
      if (!hoverRaf) hoverRaf = requestAnimationFrame(doHover);
    };
    this._onPointerUp = (e) => {
      const d = down;
      down = null;
      if (!d || d.button !== 0 || e.button !== 0) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
      if (this._display.axes && this._gizmoClick(e.clientX, e.clientY)) return;
      const r = this.pick(e.clientX, e.clientY);
      this._emit('pick', r, mods(e));
    };
    this._onPointerLeave = () => {
      hoverEv = null;
      this._emit('cursor', { point: null, pick: null });
      this._emit('hover', null, {});
    };
    el.addEventListener('pointerdown', this._onPointerDown);
    el.addEventListener('pointermove', this._onPointerMove);
    el.addEventListener('pointerup', this._onPointerUp);
    el.addEventListener('pointerleave', this._onPointerLeave);
    this._cancelHoverRaf = () => hoverRaf && cancelAnimationFrame(hoverRaf);
  }

  // Clic en el gizmo de ejes: orienta la vista con animación.
  _gizmoClick(clientX, clientY) {
    const el = this.renderer.domElement;
    const rect = el.getBoundingClientRect();
    const ox = rect.left + el.offsetWidth - GIZMO_DIM;
    const oy = rect.top + el.offsetHeight - GIZMO_DIM;
    const mx = ((clientX - ox) / GIZMO_DIM) * 2 - 1;
    const my = -((clientY - oy) / GIZMO_DIM) * 2 + 1;
    if (Math.abs(mx) > 1 || Math.abs(my) > 1) return false;
    this._raycaster.setFromCamera(new THREE.Vector2(mx, my), this._gizmoCam);
    const sprites = this.viewHelper.children.filter((c) => c.isSprite);
    const hit = this._raycaster.intersectObjects(sprites, false)[0];
    if (!hit) return false;
    const view = GIZMO_VIEWS[hit.object.userData.type];
    if (view) this.setView(view, { animate: true });
    return true;
  }

  // ---------- render bajo demanda ----------
  requestRender() {
    if (this._raf || this._disposed) return;
    this._raf = requestAnimationFrame((t) => this._frame(t));
  }

  _frame(t) {
    this._raf = 0;
    if (this._anim) {
      this._stepAnim(t);
      this.requestRender();
    }
    this.controls.update();
    this._renderScene(true);
  }

  _renderScene(withGizmo) {
    const r = this.renderer;
    this._updateLightsAndClip();
    r.setRenderTarget(null);
    r.clear();
    r.render(this.scene, this.camera);
    if (withGizmo && this._display.axes) this.viewHelper.render(r);
    this.css2d.render(this.scene, this.camera);
  }

  _updateLightsAndClip() {
    const cam = this.camera;
    cam.updateMatrixWorld();
    const { center, radius } = this._sceneSphere();
    const tgt = this.controls.target;
    const k = new THREE.Vector3(-0.45, 0.75, 0.6).normalize().applyQuaternion(cam.quaternion).multiplyScalar(radius * 4);
    this._key.position.copy(tgt).add(k);
    this._key.target.position.copy(tgt);
    const f = new THREE.Vector3(0.6, -0.4, 0.5).normalize().applyQuaternion(cam.quaternion).multiplyScalar(radius * 4);
    this._fill.position.copy(tgt).add(f);
    this._fill.target.position.copy(tgt);
    this._key.target.updateMatrixWorld();
    this._fill.target.updateMatrixWorld();
    // Planos near/far ajustados a la escena para buena precisión de profundidad.
    const dist = cam.position.distanceTo(center);
    const near = Math.max(dist - radius * 1.1, radius * 1e-3);
    const far = dist + radius * 1.1;
    if (Math.abs(cam.near - near) > 1e-9 || Math.abs(cam.far - far) > 1e-9) {
      cam.near = near;
      cam.far = far;
      cam.updateProjectionMatrix();
    }
  }

  _sceneSphere() {
    const s = this._model ? this._model.sphere : new THREE.Sphere(new THREE.Vector3(), 50);
    let radius = s.radius;
    if (this._grid && this._grid.visible) radius = Math.max(radius, this._grid.userData.halfDiag);
    return { center: s.center, radius: Math.max(radius, 1e-3) };
  }

  resize() {
    if (this._disposed) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this._w = w;
    this._h = h;
    this.renderer.setSize(w, h, false);
    this.css2d.setSize(w, h);
    const aspect = w / h;
    this._persp.aspect = aspect;
    this._persp.updateProjectionMatrix();
    this._setOrthoFrustum();
    for (const m of this._lineMaterials) m.resolution.set(w, h);
    this.requestRender();
  }

  _setOrthoFrustum() {
    const a = this._w / this._h;
    const hh = this._orthoHalfH;
    Object.assign(this._ortho, { left: -hh * a, right: hh * a, top: hh, bottom: -hh });
    this._ortho.updateProjectionMatrix();
  }

  // ---------- tema y fondo ----------
  setTheme(name) {
    if (!THEMES[name]) return;
    this.container.classList.remove(`v3d-theme-${this.themeName}`);
    this.themeName = name;
    this.theme = THEMES[name];
    this.container.classList.add(`v3d-theme-${name}`);
    this._applyBackground();
    this._hemi.color.set(this.theme.hemiSky);
    this._hemi.groundColor.set(this.theme.hemiGround);
    if (this._model) {
      const m = this._model;
      m.edgeMat.color.set(this.theme.edge);
      m.capMat.color.set(this.theme.section);
      m.wire.material.color.set(this.theme.wire);
      m.hoverFace.material.color.set(this.theme.hover);
      m.hoverEdge.material.color.set(this.theme.hover);
      m.hoverPts.material.color.set(this.theme.hover);
      m.selFace.material.color.set(this.theme.select);
      m.selEdge.material.color.set(this.theme.select);
      m.selPts.material.color.set(this.theme.select);
      this._buildGrid();
      this._buildBBox();
    }
    this._emit('theme', name);
    this.requestRender();
  }

  _applyBackground() {
    if (this.scene.background) this.scene.background.dispose();
    this.scene.background = gradientTexture(this.theme.bgTop, this.theme.bgBottom);
  }

  // ---------- modelo ----------
  setModel(result, appearance = {}) {
    this.clearModel();
    const m = result.mesh;
    const pos = toF32(m.vertices);
    const nrm = toF32(m.normals);
    const idx = toU32(m.triangles);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geom.setIndex(new THREE.BufferAttribute(idx, 1));
    geom.computeBoundingBox();
    geom.computeBoundingSphere();
    const box = geom.boundingBox.clone();
    const center = box.getCenter(new THREE.Vector3());
    const sphere = new THREE.Sphere(center.clone(), Math.max(box.getSize(new THREE.Vector3()).length() / 2, 1e-3));

    Object.assign(this._appearance, DEFAULT_APPEARANCE, appearance);
    const mat = new THREE.MeshStandardMaterial({
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = 'pieza';
    this._clippable.add(mat);

    // Tapa de sección: caras traseras en color de sección, recortadas por el mismo plano.
    const capMat = new THREE.MeshBasicMaterial({
      color: this.theme.section, side: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4,
    });
    const cap = new THREE.Mesh(geom, capMat);
    cap.visible = false;
    this._clippable.add(capMat);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geom),
      new THREE.LineBasicMaterial({ color: this.theme.wire, transparent: true, opacity: 0.7 }),
    );
    wire.visible = false;
    this._clippable.add(wire.material);

    // Aristas B-rep como líneas gruesas.
    const ePos = toF32(result.edges.positions);
    const edgeGeo = new LineSegmentsGeometry();
    if (ePos.length) edgeGeo.setPositions(ePos);
    const edgeMat = this._lineMaterial({ color: this.theme.edge, linewidth: 1.5 });
    this._clippable.add(edgeMat);
    const edgeLines = new LineSegments2(edgeGeo, edgeMat);
    edgeLines.renderOrder = 1;

    this._modelGroup.add(mesh, cap, wire, edgeLines);

    // Topología indexada.
    const topo = result.topology || { faces: [], edges: [], vertices: [] };
    const faceById = new Map(topo.faces.map((f) => [f.id, f]));
    const edgeTopo = new Map(topo.edges.map((e) => [e.id, e]));
    const edgeById = new Map();
    for (const g of result.edges.edgeGroups || []) edgeById.set(g.edgeId, { start: g.start, count: g.count, topo: edgeTopo.get(g.edgeId) || null });
    for (const e of topo.edges) if (!edgeById.has(e.id)) edgeById.set(e.id, { start: 0, count: 0, topo: e });
    const faceGroups = [...(m.faceGroups || [])].sort((a, b) => a.start - b.start);
    const faceRange = new Map(faceGroups.map((g) => [g.faceId, g]));
    const vertices = topo.vertices.map((v) => ({ id: v.id, p: v3(v.p) }));

    this._model = {
      result, geom, mesh, mat, cap, capMat, wire, edgeLines, edgeMat, edgePos: ePos, box, sphere,
      faceById, edgeById, faceGroups, faceRange, vertices,
    };
    this._buildHighlightObjects();
    this._buildGrid();
    this._buildBBox();
    this._applyAppearance();
    this._applyDisplay();
    this._applySection();
    this.controls.maxDistance = sphere.radius * 60;
    this.controls.minDistance = sphere.radius * 1e-3;
    this._fitTo(this._currentDir(), false);
    this._emit('model', result);
    this.requestRender();
  }

  clearModel() {
    const m = this._model;
    if (!m) return;
    this._model = null;
    this._hoverKey = '';
    const disposeObj = (o) => {
      o.traverse((c) => {
        if (c.geometry && c.geometry !== m.geom) c.geometry.dispose();
        if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((mt) => this._disposeMaterial(mt));
      });
    };
    for (const g of [this._modelGroup, this._overlayGroup, this._helperGroup]) {
      for (const c of [...g.children]) {
        g.remove(c);
        disposeObj(c);
      }
    }
    m.geom.dispose();
    this._grid = null;
    this._bboxGroup = null;
    this._emit('model', null);
    this.requestRender();
  }

  getModel() {
    return this._model ? this._model.result : null;
  }
  getFace(id) {
    return this._model?.faceById.get(id) || null;
  }
  getEdge(id) {
    return this._model?.edgeById.get(id)?.topo || null;
  }
  getVertex(id) {
    const v = this._model?.vertices.find((x) => x.id === id);
    return v ? { id: v.id, p: arr(v.p) } : null;
  }
  getModelRadius() {
    return this._model ? this._model.sphere.radius : 50;
  }

  _disposeMaterial(mt) {
    this._lineMaterials.delete(mt);
    this._clippable.delete(mt);
    mt.dispose();
  }

  _lineMaterial(opts) {
    const m = new LineMaterial({ worldUnits: false, ...opts });
    m.resolution.set(this._w, this._h);
    this._lineMaterials.add(m);
    return m;
  }

  setAppearance(a = {}) {
    Object.assign(this._appearance, a);
    this._applyAppearance();
    this.requestRender();
  }

  _applyAppearance() {
    const m = this._model;
    if (!m) return;
    const a = this._appearance;
    m.mat.color.set(a.color);
    m.mat.metalness = a.metalness;
    m.mat.roughness = a.roughness;
    const xray = this._display.xray;
    const opacity = xray ? Math.min(a.opacity ?? 1, 0.22) : a.opacity ?? 1;
    m.mat.transparent = opacity < 1;
    m.mat.opacity = opacity;
    m.mat.depthWrite = !xray;
    m.mat.needsUpdate = true;
  }

  // ---------- visualización ----------
  setDisplay(d = {}) {
    Object.assign(this._display, d);
    this._applyDisplay();
    this._applyAppearance();
    this.requestRender();
  }

  getDisplay() {
    return { ...this._display };
  }

  _applyDisplay() {
    const d = this._display;
    const m = this._model;
    if (m) {
      m.edgeLines.visible = d.edges;
      m.edgeMat.depthTest = !d.xray;
      m.edgeMat.linewidth = d.xray ? 1.25 : 1.5;
      m.mesh.visible = !d.wireframe;
      m.wire.visible = d.wireframe;
      m.cap.visible = this._section.enabled && !d.xray && !d.wireframe;
    }
    if (this._grid) this._grid.visible = d.grid;
    if (this._bboxGroup) this._bboxGroup.visible = d.bbox;
  }

  _buildGrid() {
    if (this._grid) {
      this._helperGroup.remove(this._grid);
      this._grid.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      this._grid = null;
    }
    const m = this._model;
    if (!m) return;
    const size = m.box.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.y, 1e-3);
    const major = niceStep(span / 4);
    const minor = major / 5;
    const half = Math.ceil((span * 0.85) / major) * major;
    const cx = Math.round((m.box.min.x + m.box.max.x) / 2 / major) * major;
    const cy = Math.round((m.box.min.y + m.box.max.y) / 2 / major) * major;
    const z = m.box.min.z - m.sphere.radius * 1e-3;
    const minorPts = [];
    const majorPts = [];
    const n = Math.round((2 * half) / minor);
    for (let i = 0; i <= n; i++) {
      const t = -half + i * minor;
      const isMajor = Math.abs(t / major - Math.round(t / major)) < 1e-6;
      const dst = isMajor ? majorPts : minorPts;
      dst.push(cx + t, cy - half, z, cx + t, cy + half, z, cx - half, cy + t, z, cx + half, cy + t, z);
    }
    const mk = (pts, color, opacity) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
      l.renderOrder = -1;
      return l;
    };
    const grid = new THREE.Group();
    grid.add(mk(minorPts, this.theme.grid, 0.22), mk(majorPts, this.theme.gridMajor, 0.5));
    grid.userData.halfDiag = Math.hypot(half, half) + Math.hypot(cx - m.sphere.center.x, cy - m.sphere.center.y);
    grid.userData.step = { major, minor };
    grid.visible = this._display.grid;
    this._grid = grid;
    this._helperGroup.add(grid);
  }

  _buildBBox() {
    if (this._bboxGroup) {
      this._helperGroup.remove(this._bboxGroup);
      this._bboxGroup.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) this._disposeMaterial(c.material);
      });
      this._bboxGroup = null;
    }
    const m = this._model;
    if (!m) return;
    const { min: a, max: b } = m.box;
    const c = [
      [a.x, a.y, a.z], [b.x, a.y, a.z], [b.x, b.y, a.z], [a.x, b.y, a.z],
      [a.x, a.y, b.z], [b.x, a.y, b.z], [b.x, b.y, b.z], [a.x, b.y, b.z],
    ];
    const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const pts = [];
    for (const [i, j] of E) pts.push(...c[i], ...c[j]);
    const g = new THREE.Group();
    const line = this.createLine(pts, { color: this.theme.bbox, width: 1, dashed: true, onTop: false });
    g.add(line);
    const size = m.box.getSize(new THREE.Vector3());
    const lab = (txt, p) => {
      const o = this.createLabel(txt, p, { anchor: 'center', small: true, color: this.theme.bbox });
      g.add(o);
    };
    lab(`X ${this.format.len(size.x)}`, [(a.x + b.x) / 2, a.y, a.z]);
    lab(`Y ${this.format.len(size.y)}`, [b.x, (a.y + b.y) / 2, a.z]);
    lab(`Z ${this.format.len(size.z)}`, [b.x, a.y, (a.z + b.z) / 2]);
    g.visible = this._display.bbox;
    this._bboxGroup = g;
    this._helperGroup.add(g);
  }

  // ---------- sección ----------
  setSection(s = {}) {
    Object.assign(this._section, s);
    this._applySection();
    this._applyDisplay();
    this.requestRender();
  }

  getSection() {
    return { ...this._section };
  }

  _applySection() {
    const s = this._section;
    const m = this._model;
    const center = m ? m.box.getCenter(new THREE.Vector3()) : new THREE.Vector3();
    const n = v3(SECTION_KEEP[s.axis] || SECTION_KEEP.x);
    if (s.flip) n.negate();
    const p = center.clone();
    const ax = s.axis in SECTION_KEEP ? s.axis : 'x';
    p[ax] += +s.offset || 0;
    this._plane.setFromNormalAndCoplanarPoint(n, p);
    const planes = s.enabled ? [this._plane] : null;
    for (const mt of this._clippable) mt.clippingPlanes = planes;
  }

  _isClipped(p, eps = 0) {
    return this._section.enabled && this._plane.distanceToPoint(p) < -eps;
  }

  // ---------- cámara y vistas ----------
  _currentDir() {
    return this.camera.position.clone().sub(this.controls.target).normalize();
  }

  setView(name, { animate = false } = {}) {
    const d = VIEW_DIRS[name];
    if (!d) return;
    this._fitTo(d, animate);
  }

  fit({ animate = false } = {}) {
    this._fitTo(this._currentDir(), animate);
  }

  // Encuadra la caja del modelo mirando desde la dirección dir.
  _fitTo(dirArr, animate) {
    const dir = (Array.isArray(dirArr) ? v3(dirArr) : dirArr.clone()).normalize();
    const box = this._model ? this._model.box : new THREE.Box3(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(50, 50, 50));
    const center = box.getCenter(new THREE.Vector3());
    // Base de la vista (derecha u, arriba v, hacia la cámara w).
    const u = new THREE.Vector3(0, 0, 1).cross(dir).normalize();
    const v = dir.clone().cross(u);
    const aspect = this._w / this._h;
    const tanV = Math.tan(THREE.MathUtils.degToRad(this._persp.fov / 2)) / 1.12;
    const tanH = tanV * aspect;
    let dist = 0;
    let hu = 0;
    let hv = 0;
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(center);
      const cu = Math.abs(c.dot(u));
      const cv = Math.abs(c.dot(v));
      const cw = c.dot(dir);
      dist = Math.max(dist, cw + cu / tanH, cw + cv / tanV);
      hu = Math.max(hu, cu);
      hv = Math.max(hv, cv);
    }
    const R = box.getSize(new THREE.Vector3()).length() / 2 || 1;
    const halfH = Math.max(hv, hu / aspect, 1e-3) * 1.12;
    const goal = { dir, target: center, dist: Math.max(dist, 1e-3), halfH, R };
    if (animate) {
      this._anim = { t0: null, from: this._camState(), to: goal, dur: 380 };
      this.requestRender();
    } else {
      this._anim = null;
      this._applyCamState(goal);
    }
  }

  _camState() {
    const target = this.controls.target.clone();
    const off = this.camera.position.clone().sub(target);
    const dist = off.length();
    const halfH = this._projection === 'orthographic' ? this._orthoHalfH / this._ortho.zoom : dist * Math.tan(THREE.MathUtils.degToRad(this._persp.fov / 2)) / 1;
    return { dir: off.normalize(), target, dist, halfH, R: this.getModelRadius() };
  }

  _applyCamState(s) {
    this._stopInertia();
    this.controls.target.copy(s.target);
    if (this._projection === 'orthographic') {
      const D = Math.max(s.dist, s.R * 4);
      this._ortho.position.copy(s.target).addScaledVector(s.dir, D);
      this._ortho.zoom = this._orthoHalfH / s.halfH;
      this._ortho.updateProjectionMatrix();
    } else {
      this._persp.position.copy(s.target).addScaledVector(s.dir, s.dist);
    }
    this.camera.lookAt(s.target);
    this.controls.update();
    this.requestRender();
  }

  _stepAnim(t) {
    const a = this._anim;
    if (a.t0 === null) a.t0 = t;
    const k = Math.min(1, (t - a.t0) / a.dur);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const q = new THREE.Quaternion().setFromUnitVectors(a.from.dir, a.to.dir);
    const qi = new THREE.Quaternion().slerp(q, e);
    const st = {
      dir: a.from.dir.clone().applyQuaternion(qi).normalize(),
      target: a.from.target.clone().lerp(a.to.target, e),
      dist: a.from.dist + (a.to.dist - a.from.dist) * e,
      halfH: a.from.halfH * Math.pow(a.to.halfH / a.from.halfH, e),
      R: a.to.R,
    };
    if (this._projection === 'perspective') {
      // En perspectiva se interpola la distancia equivalente al tamaño visible.
      st.dist = a.from.dist * Math.pow(a.to.dist / a.from.dist, e);
    }
    if (k >= 1) {
      this._anim = null;
      this._applyCamState(a.to);
    } else {
      this._applyCamState(st);
    }
  }

  // Detiene la inercia de OrbitControls (campos internos de r186).
  _stopInertia() {
    const c = this.controls;
    if (c._sphericalDelta) c._sphericalDelta.set(0, 0, 0);
    if (c._panOffset) c._panOffset.set(0, 0, 0);
    if ('_scale' in c) c._scale = 1;
  }

  setProjection(mode) {
    if (mode !== 'perspective' && mode !== 'orthographic') return;
    if (mode === this._projection) return;
    const target = this.controls.target;
    const tanV = Math.tan(THREE.MathUtils.degToRad(this._persp.fov / 2));
    const R = this.getModelRadius();
    this._stopInertia();
    if (mode === 'orthographic') {
      const off = this._persp.position.clone().sub(target);
      const dist = off.length();
      this._orthoHalfH = Math.max(dist * tanV, 1e-3);
      this._ortho.zoom = 1;
      this._setOrthoFrustum();
      this._ortho.position.copy(target).addScaledVector(off.normalize(), Math.max(dist, R * 4));
      this._ortho.quaternion.copy(this._persp.quaternion);
      this.camera = this._ortho;
    } else {
      const off = this._ortho.position.clone().sub(target).normalize();
      const halfH = this._orthoHalfH / this._ortho.zoom;
      this._persp.position.copy(target).addScaledVector(off, halfH / tanV);
      this._persp.quaternion.copy(this._ortho.quaternion);
      this.camera = this._persp;
    }
    this._projection = mode;
    this.controls.object = this.camera;
    this.viewHelper.camera = this.camera;
    this.camera.lookAt(target);
    this.controls.update();
    this.requestRender();
  }

  getProjection() {
    return this._projection;
  }

  // ---------- selección (picking) ----------
  setPickFilter(kinds) {
    this._pickKinds = kinds && kinds.length ? kinds.slice() : null;
  }

  // Proyecta un punto 3D a coordenadas de cliente (px).
  projectToScreen(p) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.camera.updateMatrixWorld();
    const q = v3(p).project(this.camera);
    const inside = q.z >= -1 && q.z <= 1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1;
    const pv = v3(p);
    return {
      x: rect.left + ((q.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - q.y) / 2) * rect.height,
      visible: inside && !this._isClipped(pv, 1e-9) && this._isVisible(pv),
    };
  }

  _occlusionOn() {
    return !this._display.xray && !this._display.wireframe;
  }

  // Primer impacto del rayo con la malla que no esté recortado por la sección.
  _firstHit(ray) {
    this._raycaster.ray.copy(ray);
    this._raycaster.near = 0;
    this._raycaster.far = Infinity;
    const hits = this._raycaster.intersectObject(this._model.mesh, false);
    for (const h of hits) if (!this._isClipped(h.point, this._model.sphere.radius * 1e-6)) return h;
    return null;
  }

  _rayAtNdc(x, y) {
    this._raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return this._raycaster.ray.clone();
  }

  // ¿El punto p (sobre la superficie) es visible desde la cámara?
  _isVisible(p) {
    if (!this._model || !this._occlusionOn()) return true;
    const q = p.clone().project(this.camera);
    const ray = this._rayAtNdc(q.x, q.y);
    const t = p.clone().sub(ray.origin).dot(ray.direction);
    const h = this._firstHit(ray);
    const eps = this._model.sphere.radius * 2e-3 + t * 1e-5;
    return !h || h.distance >= t - eps;
  }

  pick(clientX, clientY, opts = {}) {
    const m = this._model;
    if (!m) return null;
    const kinds = opts.kinds || this._pickKinds || ALL_KINDS;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    if (px < 0 || py < 0 || px > rect.width || py > rect.height) return null;
    const W = rect.width;
    const H = rect.height;
    const cam = this.camera;
    cam.updateMatrixWorld();
    const ndcX = (px / W) * 2 - 1;
    const ndcY = 1 - (py / H) * 2;
    const vp = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).elements;
    // Proyección rápida a píxeles; devuelve false si queda detrás de la cámara.
    const proj = (x, y, z, out) => {
      const w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
      if (w <= 1e-12) return false;
      out[0] = (((vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w + 1) / 2) * W;
      out[1] = ((1 - (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w) / 2) * H;
      return true;
    };
    const s = [0, 0];
    const clipEps = m.sphere.radius * 1e-6;

    if (kinds.includes('vertex')) {
      const cands = [];
      for (const v of m.vertices) {
        if (!proj(v.p.x, v.p.y, v.p.z, s)) continue;
        const d = Math.hypot(s[0] - px, s[1] - py);
        if (d <= VERTEX_PX) cands.push({ v, d });
      }
      cands.sort((a, b) => a.d - b.d);
      for (const { v } of cands) {
        if (this._isClipped(v.p, clipEps) || !this._isVisible(v.p)) continue;
        return { kind: 'vertex', id: v.id, point: arr(v.p), snapped: true };
      }
    }

    if (kinds.includes('edge') && m.edgePos.length) {
      const P = m.edgePos;
      const a = [0, 0];
      const b = [0, 0];
      const cands = [];
      for (const [id, g] of m.edgeById) {
        let best = Infinity;
        let bestSeg = -1;
        for (let i = g.start; i + 1 < g.start + g.count; i += 2) {
          const o = i * 3;
          if (!proj(P[o], P[o + 1], P[o + 2], a) || !proj(P[o + 3], P[o + 4], P[o + 5], b)) continue;
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const l2 = dx * dx + dy * dy;
          let t = l2 > 0 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0;
          t = Math.max(0, Math.min(1, t));
          const d = Math.hypot(a[0] + t * dx - px, a[1] + t * dy - py);
          if (d < best) {
            best = d;
            bestSeg = i;
          }
        }
        if (best <= EDGE_PX) cands.push({ id, g, d: best, seg: bestSeg });
      }
      cands.sort((x, y) => x.d - y.d);
      if (cands.length) {
        const ray = this._rayAtNdc(ndcX, ndcY);
        for (const c of cands) {
          const o = c.seg * 3;
          const p0 = new THREE.Vector3(P[o], P[o + 1], P[o + 2]);
          const p1 = new THREE.Vector3(P[o + 3], P[o + 4], P[o + 5]);
          const q = new THREE.Vector3();
          ray.distanceSqToSegment(p0, p1, null, q);
          if (this._isClipped(q, clipEps) || !this._isVisible(q)) continue;
          return { kind: 'edge', id: c.id, point: arr(snapToEdge(q, c.g.topo)), snapped: true };
        }
      }
    }

    if (kinds.includes('face')) {
      const h = this._firstHit(this._rayAtNdc(ndcX, ndcY));
      if (h) {
        const fg = this._faceGroupOfTriangle(h.faceIndex);
        if (fg) {
          const topo = m.faceById.get(fg.faceId) || null;
          const meshN = h.face.normal.clone();
          const { point, normal } = snapToFace(h.point, meshN, topo);
          return { kind: 'face', id: fg.faceId, point: arr(point), normal: arr(normal), snapped: false };
        }
      }
    }
    return null;
  }

  // Triángulo → grupo de cara por búsqueda binaria.
  _faceGroupOfTriangle(tri) {
    const G = this._model.faceGroups;
    const idx = tri * 3;
    let lo = 0;
    let hi = G.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const g = G[mid];
      if (idx < g.start) hi = mid - 1;
      else if (idx >= g.start + g.count) lo = mid + 1;
      else return g;
    }
    return null;
  }

  // Rayo contra la malla del modelo (sin sección): impactos ordenados con su cara B-rep.
  raycastModel(origin, dir) {
    if (!this._model) return [];
    this._raycaster.set(v3(origin), v3(dir).normalize());
    this._raycaster.near = 0;
    this._raycaster.far = Infinity;
    return this._raycaster.intersectObject(this._model.mesh, false).map((h) => ({
      distance: h.distance,
      point: arr(h.point),
      normal: arr(h.face.normal),
      faceId: this._faceGroupOfTriangle(h.faceIndex)?.faceId ?? null,
    }));
  }

  // ---------- resaltado ----------
  _buildHighlightObjects() {
    const m = this._model;
    const faceOverlay = (color, opacity, order) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', m.geom.attributes.position);
      g.setAttribute('normal', m.geom.attributes.normal);
      g.setIndex(m.geom.index);
      g.boundingSphere = m.geom.boundingSphere;
      g.boundingBox = m.geom.boundingBox;
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      this._clippable.add(mat);
      const mesh = new THREE.Mesh(g, [mat]);
      mesh.renderOrder = order;
      mesh.visible = false;
      return mesh;
    };
    const edgeOverlay = (color, order) => {
      const mat = this._lineMaterial({ color, linewidth: 3.5 });
      this._clippable.add(mat);
      const l = new LineSegments2(new LineSegmentsGeometry(), mat);
      l.renderOrder = order;
      l.visible = false;
      return l;
    };
    const ptsOverlay = (color, order) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
      const mat = new THREE.PointsMaterial({
        color, size: 11, sizeAttenuation: false, map: this._dotTex, transparent: true, alphaTest: 0.3, depthTest: false,
      });
      const p = new THREE.Points(g, mat);
      p.renderOrder = order;
      p.visible = false;
      p.frustumCulled = false;
      return p;
    };
    m.selFace = faceOverlay(this.theme.select, 0.45, 2);
    m.hoverFace = faceOverlay(this.theme.hover, 0.38, 3);
    m.selEdge = edgeOverlay(this.theme.select, 4);
    m.hoverEdge = edgeOverlay(this.theme.hover, 5);
    m.selPts = ptsOverlay(this.theme.select, 10);
    m.hoverPts = ptsOverlay(this.theme.hover, 11);
    this._overlayGroup.add(m.selFace, m.hoverFace, m.selEdge, m.hoverEdge, m.selPts, m.hoverPts);
  }

  _fillOverlay(entities, faceMesh, edgeLine, pts) {
    const m = this._model;
    faceMesh.geometry.clearGroups();
    const edgePts = [];
    const vPts = [];
    let nFaces = 0;
    for (const e of entities) {
      if (!e) continue;
      if (e.kind === 'face') {
        const g = m.faceRange.get(e.id);
        if (g) {
          faceMesh.geometry.addGroup(g.start, g.count, 0);
          nFaces++;
        }
      } else if (e.kind === 'edge') {
        const g = m.edgeById.get(e.id);
        if (g) for (let i = g.start * 3; i < (g.start + g.count) * 3; i++) edgePts.push(m.edgePos[i]);
      } else if (e.kind === 'vertex') {
        const v = m.vertices.find((x) => x.id === e.id);
        if (v) vPts.push(v.p.x, v.p.y, v.p.z);
      } else if (e.kind === 'point' && e.p) {
        vPts.push(...e.p);
      }
    }
    faceMesh.visible = nFaces > 0;
    const old = edgeLine.geometry;
    const ng = new LineSegmentsGeometry();
    if (edgePts.length) ng.setPositions(edgePts);
    edgeLine.geometry = ng;
    old.dispose();
    edgeLine.visible = edgePts.length > 0;
    const oldPts = pts.geometry;
    pts.geometry = new THREE.BufferGeometry();
    pts.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vPts.length ? vPts : [0, 0, 0], 3));
    oldPts.dispose();
    pts.visible = vPts.length > 0;
  }

  setHighlight(entities) {
    const m = this._model;
    if (!m) return;
    this._fillOverlay(entities || [], m.selFace, m.selEdge, m.selPts);
    this.requestRender();
  }

  setHover(entity) {
    const m = this._model;
    if (!m) return;
    const key = entity ? `${entity.kind}:${entity.id}` : '';
    if (key === this._hoverKey) return;
    this._hoverKey = key;
    this._fillOverlay(entity ? [entity] : [], m.hoverFace, m.hoverEdge, m.hoverPts);
    this.renderer.domElement.style.cursor = entity ? 'crosshair' : '';
    this.requestRender();
  }

  // ---------- gráficos auxiliares (usados por las mediciones) ----------
  // Pares de puntos [x,y,z, x,y,z, ...] → líneas gruesas.
  createLine(points, { color, width = 2, dashed = false, onTop = true } = {}) {
    const g = new LineSegmentsGeometry();
    g.setPositions(points);
    const R = this.getModelRadius();
    const mat = this._lineMaterial({
      color: color || this.theme.measure, linewidth: width, dashed, dashSize: R * 0.025, gapSize: R * 0.018,
      depthTest: !onTop, transparent: onTop,
    });
    const l = new LineSegments2(g, mat);
    if (dashed) l.computeLineDistances();
    l.renderOrder = onTop ? 20 : 1;
    return l;
  }

  createMarker(points, { color, size = 9 } = {}) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const mat = new THREE.PointsMaterial({
      color: color || this.theme.measure, size, sizeAttenuation: false, map: this._dotTex, transparent: true, alphaTest: 0.3, depthTest: false,
    });
    const p = new THREE.Points(g, mat);
    p.renderOrder = 21;
    p.frustumCulled = false;
    return p;
  }

  createLabel(text, position, { anchor = 'above', small = false, color } = {}) {
    const el = document.createElement('div');
    el.className = `v3d-label${anchor === 'center' ? ' v3d-center' : ''}`;
    const pill = document.createElement('span');
    pill.className = `v3d-pill${small ? ' v3d-small' : ''}`;
    pill.textContent = text;
    pill.style.setProperty('--v3d-accent', color || this.theme.measure);
    el.appendChild(pill);
    const o = new CSS2DObject(el);
    o.position.copy(v3(position));
    if (anchor === 'above') o.center.set(0.5, 1);
    o.userData.label = { text, anchor, small, color: color || null };
    return o;
  }

  setLabelText(label, text) {
    label.userData.label.text = text;
    label.element.firstChild.textContent = text;
    this.requestRender();
  }

  addOverlay(obj) {
    this._measureGroup.add(obj);
    this.requestRender();
  }

  removeOverlay(obj) {
    if (!obj) return;
    this._measureGroup.remove(obj);
    obj.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) this._disposeMaterial(c.material);
      if (c.isCSS2DObject) c.element.remove();
    });
    this.requestRender();
  }

  // ---------- exportación y captura ----------
  getExportMesh() {
    const m = this._model;
    if (!m) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', m.geom.attributes.position.clone());
    g.setAttribute('normal', m.geom.attributes.normal.clone());
    g.setIndex(m.geom.index.clone());
    const a = this._appearance;
    const mat = new THREE.MeshStandardMaterial({ color: a.color, metalness: a.metalness, roughness: a.roughness });
    const mesh = new THREE.Mesh(g, mat);
    mesh.name = 'pieza';
    return mesh;
  }

  // PNG a scale × tamaño del visor (sin gizmo; etiquetas dibujadas encima).
  screenshot(scale = 1) {
    const r = this.renderer;
    const w = this._w;
    const h = this._h;
    const maxDim = r.capabilities.maxTextureSize || 4096;
    const s = Math.max(0.1, Math.min(scale || 1, maxDim / Math.max(w, h)));
    const W = Math.round(w * s);
    const H = Math.round(h * s);
    const pr = r.getPixelRatio();
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ctx = out.getContext('2d');
    r.setPixelRatio(1);
    r.setSize(W, H, false);
    try {
      this._renderScene(false);
      // Copia en la misma tarea: funciona sin preserveDrawingBuffer.
      ctx.drawImage(r.domElement, 0, 0);
    } finally {
      r.setPixelRatio(pr);
      r.setSize(w, h, false);
      this._renderScene(true);
    }
    this._drawLabels(ctx, W, H, s);
    return new Promise((resolve, reject) => {
      out.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen'))), 'image/png');
    });
  }

  _drawLabels(ctx, W, H, s) {
    const labels = [];
    this.scene.traverseVisible((o) => {
      if (o.isCSS2DObject && o.userData.label) labels.push(o);
    });
    const th = this.theme;
    for (const o of labels) {
      const q = o.getWorldPosition(new THREE.Vector3()).project(this.camera);
      if (q.z < -1 || q.z > 1) continue;
      const { text, anchor, small, color } = o.userData.label;
      const x = ((q.x + 1) / 2) * W;
      const y = ((1 - q.y) / 2) * H;
      const fs = (small ? 11 : 12) * s;
      ctx.font = `${small ? 500 : 600} ${fs}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      const lines = text.split('\n');
      const lh = fs * 1.3;
      const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const pw = tw + (small ? 12 : 16) * s;
      const ph = lines.length * lh + (small ? 2 : 6) * s;
      const bx = x - pw / 2;
      const by = anchor === 'center' ? y - ph / 2 : y - ph - 7 * s;
      ctx.beginPath();
      ctx.roundRect(bx, by, pw, ph, (small ? 8 : 10) * s);
      ctx.fillStyle = th.labelBg;
      ctx.fill();
      ctx.lineWidth = s;
      ctx.strokeStyle = color || th.measure;
      ctx.stroke();
      ctx.fillStyle = th.labelFg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      lines.forEach((l, i) => ctx.fillText(l, x, by + (small ? 1 : 3) * s + lh * (i + 0.5)));
    }
  }

  dispose() {
    if (this._disposed) return;
    this.clearModel();
    for (const c of [...this._measureGroup.children]) this.removeOverlay(c);
    this._disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._cancelHoverRaf();
    this._ro.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('pointerleave', this._onPointerLeave);
    this.controls.dispose();
    this.viewHelper.dispose();
    this._envTex.dispose();
    this._dotTex.dispose();
    if (this.scene.background) this.scene.background.dispose();
    this.renderer.dispose();
    el.remove();
    this.css2d.domElement.remove();
    this.container.classList.remove('v3d-root', `v3d-theme-${this.themeName}`);
    this._listeners.clear();
  }
}

// ---------- geometría exacta ----------
// Ajusta un punto de la polilínea de la arista a la curva exacta (línea o círculo).
export function snapToEdge(q, topo) {
  if (!topo) return q;
  if (topo.type === 'line' && topo.start && topo.end) {
    const a = v3(topo.start);
    const b = v3(topo.end);
    const ab = b.clone().sub(a);
    const l2 = ab.lengthSq();
    if (l2 === 0) return a;
    const t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / l2));
    return a.addScaledVector(ab, t);
  }
  if (topo.type === 'circle' && topo.center && topo.normal && topo.radius) {
    const c = v3(topo.center);
    const n = v3(topo.normal).normalize();
    const w = q.clone().sub(c);
    w.addScaledVector(n, -w.dot(n));
    if (w.lengthSq() < 1e-24) return q;
    return c.add(w.setLength(topo.radius));
  }
  return q;
}

// Proyecta un punto de la malla sobre la superficie exacta (plano o cilindro) y da su normal.
export function snapToFace(p, meshNormal, topo) {
  const mn = meshNormal.clone().normalize();
  if (topo && topo.type === 'plane' && topo.normal && topo.center) {
    const n = v3(topo.normal).normalize();
    if (n.dot(mn) < 0) n.negate();
    const c = v3(topo.center);
    const point = p.clone().addScaledVector(n, -p.clone().sub(c).dot(n));
    return { point, normal: n };
  }
  if (topo && topo.type === 'cylinder' && topo.axis && topo.radius) {
    const a = v3(topo.axis.p);
    const d = v3(topo.axis.d).normalize();
    const w = p.clone().sub(a);
    const along = w.dot(d);
    const radial = w.addScaledVector(d, -along);
    if (radial.lengthSq() > 1e-24) {
      const n = radial.clone().normalize();
      const point = a.clone().addScaledVector(d, along).addScaledVector(n, topo.radius);
      if (n.dot(mn) < 0) n.negate();
      return { point, normal: n };
    }
  }
  return { point: p.clone(), normal: mn };
}
