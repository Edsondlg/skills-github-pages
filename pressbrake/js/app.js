import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { analyzeSheetMetal, deformPositions } from './sheetmetal.js';
import { planProcess, placement, MATERIALS, DEFAULTS } from './process.js';
import { PressBrake, concreteTextures, brushedTextures } from './machine.js';

const OCCT_VER = '0.0.23';
const OCCT_BASE = `https://cdn.jsdelivr.net/npm/occt-import-js@${OCCT_VER}/dist/`;
const $ = (id) => document.getElementById(id);
const deg = (r) => (r * 180) / Math.PI;

// ---------------- estado ----------------
const state = {
  cfg: { ...DEFAULTS }, kFactor: null,
  mesh: null, model: null, plan: null, name: '',
  timeline: null, t: 0, playing: false, speed: 1,
  mode: 'machine', fold: 1, highlight: true,
};

// ---------------- escena ----------------
const vp = $('viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
vp.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1d22');
scene.fog = new THREE.Fog('#1a1d22', 9000, 20000);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environmentIntensity = 0.75;

const camera = new THREE.PerspectiveCamera(32, 1, 5, 40000);
camera.position.set(1400, 900, 2600);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 80, 0);
controls.maxPolarAngle = Math.PI * 0.53;

// luces
const hemi = new THREE.HemisphereLight('#dfe8f5', '#3a3530', 0.55);
scene.add(hemi);
const key = new THREE.DirectionalLight('#fff6ea', 1.7);
key.position.set(1800, 3200, 2400);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
key.shadow.camera.left = -2600; key.shadow.camera.right = 2600;
key.shadow.camera.top = 2600; key.shadow.camera.bottom = -1600;
key.shadow.camera.near = 500; key.shadow.camera.far = 9000;
key.shadow.bias = -0.0002; key.shadow.normalBias = 1.5;
scene.add(key);
const fill = new THREE.DirectionalLight('#cfe0ff', 0.6);
fill.position.set(-2500, 1500, 1500);
scene.add(fill);
const work = new THREE.SpotLight('#fff1dc', 3.5e5, 2600, 0.6, 0.7, 1.6);
work.position.set(0, 820, 420);
work.target.position.set(0, 0, 0);
work.castShadow = true;
work.shadow.mapSize.set(2048, 2048);
work.shadow.bias = -0.0003;
scene.add(work, work.target);

// piso
const conc = concreteTextures();
const floor = new THREE.Mesh(new THREE.PlaneGeometry(24000, 24000), new THREE.MeshStandardMaterial({ map: conc.color, roughnessMap: conc.rough, roughness: 0.75, metalness: 0.0, color: '#b8b8b8' }));
conc.color.repeat.set(30, 30); conc.rough.repeat.set(30, 30);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
// líneas de seguridad
const stripeMat = new THREE.MeshStandardMaterial({ color: '#e8b400', roughness: 0.6 });
for (const [x, z, w, d] of [[0, 1450, 4800, 70], [-2440, 400, 70, 2160], [2440, 400, 70, 2160]]) {
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w, d), stripeMat);
  s.rotation.x = -Math.PI / 2; s.position.set(x, 0.6, z); s.receiveShadow = true; scene.add(s);
}

let machine = new PressBrake({ length: state.cfg.machineLength, tons: state.cfg.machineTons, punchAngle: state.cfg.punchAngle });
scene.add(machine.group);
floor.position.y = machine.floorY;
scene.children.filter((c) => c.material === stripeMat).forEach((s) => (s.position.y = machine.floorY + 0.6));

// mesa de piezas (alimentación y terminado)
const tableMat = new THREE.MeshPhysicalMaterial({ color: '#5a6470', metalness: 0.6, roughness: 0.35 });
const feedTable = new THREE.Group();
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(700, 30, 500), tableMat);
  top.position.y = -260; top.castShadow = top.receiveShadow = true; feedTable.add(top);
  for (const [x, z] of [[-320, -220], [320, -220], [-320, 220], [320, 220]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(40, 700, 40), tableMat);
    leg.position.set(x, -260 - 365, z); leg.castShadow = true; feedTable.add(leg);
  }
  feedTable.position.set(1900, 0, 1100);
  scene.add(feedTable);
}

// mesa de granito para inspección (modo pieza)
const inspect = new THREE.Group();
{
  const granite = new THREE.MeshPhysicalMaterial({ color: '#202326', roughness: 0.18, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.15 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1400, 120, 900), granite);
  slab.position.y = machine.floorY + 700; slab.castShadow = slab.receiveShadow = true; inspect.add(slab);
  const frameMat = new THREE.MeshStandardMaterial({ color: '#3b4148', metalness: 0.7, roughness: 0.4 });
  for (const [x, z] of [[-600, -380], [600, -380], [-600, 380], [600, 380]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(60, 640, 60), frameMat);
    leg.position.set(x, machine.floorY + 320, z); leg.castShadow = true; inspect.add(leg);
  }
  inspect.position.z = 900;
  inspect.visible = false;
  scene.add(inspect);
}

// post-proceso
const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.5, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() {
  const w = vp.clientWidth, h = vp.clientHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(vp);
resize();

// material de lámina
const brushed = brushedTextures();
const sheetMat = new THREE.MeshPhysicalMaterial({
  color: '#cfd3d8', metalness: 1, roughness: 0.3, roughnessMap: brushed.rough, vertexColors: true,
  clearcoat: 0.15, clearcoatRoughness: 0.4, side: THREE.DoubleSide, envMapIntensity: 1.2,
});
let partMesh = null;
let edgeLines = null;

// ---------------- carga STEP ----------------
let occtPromise = null;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function loadOcct() {
  // primero una copia local (vendor/), si no existe se usa el CDN
  if (!occtPromise) {
    occtPromise = loadScript('vendor/occt-import-js.js').then(() => 'vendor/', () => loadScript(OCCT_BASE + 'occt-import-js.js').then(() => OCCT_BASE))
      .then((base) => window.occtimportjs({ locateFile: (f) => base + f }))
      .catch(() => { occtPromise = null; throw new Error('no se pudo descargar el motor CAD (OpenCascade); revisa tu conexión a internet.'); });
  }
  return occtPromise;
}

function showError(msg) { $('errMsg').textContent = msg; $('errbox').hidden = false; }
function showLoading(msg) { $('loading').hidden = !msg; if (msg) $('loadingMsg').textContent = msg; }

async function loadStepBuffer(buf, name) {
  try {
    showLoading('Cargando motor CAD (OpenCascade)…');
    const occt = await loadOcct();
    showLoading('Leyendo geometría STEP…');
    await new Promise((r) => setTimeout(r, 30));
    const res = occt.ReadStepFile(new Uint8Array(buf), { linearDeflectionType: 'bounding_box_ratio', linearDeflection: 0.0008, angularDeflection: 0.25 });
    if (!res.success || !res.meshes.length) throw new Error('El archivo no contiene sólidos legibles.');
    // fusionar todas las mallas
    let nv = 0, ni = 0;
    for (const m of res.meshes) { nv += m.attributes.position.array.length; ni += m.index.array.length; }
    const positions = new Float32Array(nv), index = new Uint32Array(ni), faces = [];
    let vo = 0, io = 0;
    for (const m of res.meshes) {
      positions.set(m.attributes.position.array, vo);
      const base = vo / 3, triBase = io / 3;
      const idx = m.index.array;
      for (let i = 0; i < idx.length; i++) index[io + i] = idx[i] + base;
      for (const f of m.brep_faces) faces.push({ first: f.first + triBase, last: f.last + triBase });
      vo += m.attributes.position.array.length; io += idx.length;
    }
    if (res.meshes.length > 1) console.info(`${res.meshes.length} cuerpos fusionados`);
    showLoading('Analizando lámina: espesor, dobleces, desarrollo…');
    await new Promise((r) => setTimeout(r, 30));
    state.mesh = { positions, index, faces };
    state.name = name;
    analyze();
  } catch (e) {
    console.error(e);
    showError('No se pudo procesar el STEP: ' + e.message);
  } finally {
    showLoading(null);
  }
}

function analyze() {
  state.model = analyzeSheetMetal(state.mesh, { kFactor: state.kFactor });
  buildPartMesh();
  replan();
  $('drop').classList.add('hidden');
  ['btnPlay', 'btnPrev', 'btnNext', 'btnCsv'].forEach((id) => ($(id).disabled = false));
  setMode(state.model.bends.length ? state.mode : 'part');
  if (state.mode === 'machine') setCamera('iso');
  state.t = 0; state.playing = true; updatePlayBtn();
}

function buildPartMesh() {
  if (partMesh) { scene.remove(partMesh); partMesh.geometry.dispose(); }
  const m = state.model;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.positions), 3));
  g.setIndex(new THREE.BufferAttribute(state.mesh.index, 1));
  // UV por proyección según la normal dominante (para el cepillado)
  g.computeVertexNormals();
  const n = g.attributes.normal.array, p = m.positions, uv = new Float32Array((p.length / 3) * 2);
  for (let i = 0; i < p.length / 3; i++) {
    const ax = Math.abs(n[3 * i]), ay = Math.abs(n[3 * i + 1]), az = Math.abs(n[3 * i + 2]);
    const [u, v] = ax > ay && ax > az ? [p[3 * i + 1], p[3 * i + 2]] : ay > az ? [p[3 * i], p[3 * i + 2]] : [p[3 * i], p[3 * i + 1]];
    uv[2 * i] = u / 160; uv[2 * i + 1] = v / 160;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(p.length).fill(1), 3));
  partMesh = new THREE.Mesh(g, sheetMat);
  partMesh.castShadow = partMesh.receiveShadow = true;
  partMesh.matrixAutoUpdate = false;
  scene.add(partMesh);
  paintBendZones();
}

function paintBendZones() {
  const m = state.model, col = partMesh.geometry.attributes.color;
  const on = state.highlight && state.mode === 'part';
  for (let i = 0; i < m.nV; i++) {
    const k = m.keyOf[i];
    const b = m.keyBend[k];
    if (on && b >= 0) { col.setXYZ(i, 1.0, 0.62, 0.18); }
    else col.setXYZ(i, 1, 1, 1);
  }
  col.needsUpdate = true;
}

let lastS = null;
function setShape(s) {
  const key = s.join(',');
  if (key === lastS) return;
  lastS = key;
  const pos = partMesh.geometry.attributes.position;
  deformPositions(state.model, s, pos.array);
  pos.needsUpdate = true;
  partMesh.geometry.computeVertexNormals();
  partMesh.geometry.computeBoundingSphere();
}

// ---------------- plan y línea de tiempo ----------------
function replan() {
  if (!state.model) return;
  state.plan = planProcess(state.model, state.cfg);
  buildTimeline();
  renderResults();
  const maxL = Math.max(40, ...state.model.bends.map((b) => b.length));
  machine.setTools(state.plan.V, maxL);
}

const PH = { handle: 'Manipulación', approach: 'Aproximación', bend: 'Doblado', dwell: 'Descompresión', ret: 'Retorno', unload: 'Descarga' };
const PHC = { handle: 'var(--c-handle)', approach: 'var(--c-approach)', bend: 'var(--c-bend)', dwell: 'var(--c-dwell)', ret: 'var(--c-return)', unload: 'var(--c-unload)' };

function buildTimeline() {
  const plan = state.plan, phases = [];
  let t = 0;
  const eff = 100 / plan.cfg.efficiency; // el tiempo de la animación usa el ciclo neto; la eficiencia se reporta aparte
  void eff;
  plan.steps.forEach((st, i) => {
    for (const k of ['handle', 'approach', 'bend', 'dwell', 'ret']) {
      const d = st.t[k];
      phases.push({ k, i, t0: t, t1: t + d });
      t += d;
    }
  });
  phases.push({ k: 'unload', i: plan.steps.length, t0: t, t1: t + plan.cfg.unload });
  t += plan.cfg.unload;
  // poses precomputadas
  const m = state.model, n = m.bends.length;
  const sBefore = [], poses = [];
  const s = new Array(n).fill(0);
  plan.steps.forEach((st, i) => {
    sBefore.push(s.slice());
    const pStart = placement(m, s, st.bi, st.sign, m.T);
    const s2 = s.slice(); s2[st.bi] = 1;
    const pEnd = placement(m, s2, st.bi, st.sign, m.T - st.tool.depth);
    poses.push({ start: poseMatrix(pStart), end: poseMatrix(pEnd) });
    // tope trasero: borde posterior de la pieza en la pose inicial
    const pos = deformPositions(m, s);
    let minZ = Infinity, maxX = -Infinity, minX = Infinity;
    const M = poses[i].start, v = new THREE.Vector3();
    for (let j = 0; j < pos.length; j += 3) {
      v.set(pos[j], pos[j + 1], pos[j + 2]).applyMatrix4(M);
      if (v.y < m.T + 40 && v.z < minZ) minZ = v.z;
      if (v.x > maxX) maxX = v.x; if (v.x < minX) minX = v.x;
    }
    poses[i].bgZ = Math.max(Math.min(minZ, -plan.V / 2 - 8), -900);
    poses[i].bgSpread = Math.max(30, Math.min((maxX - minX) / 2 * 0.6, 420));
    s[st.bi] = 1;
  });
  const sFinal = s.slice();
  state.timeline = { phases, total: t, poses, sBefore, sFinal };
  // barra
  const tl = $('timeline');
  tl.querySelectorAll('.ph').forEach((e) => e.remove());
  for (const ph of phases) {
    const d = document.createElement('div');
    d.className = 'ph' + (ph.k === 'handle' ? ' step-start' : '');
    d.style.width = ((ph.t1 - ph.t0) / t) * 100 + '%';
    d.style.background = PHC[ph.k];
    d.title = `${ph.k === 'unload' ? '' : `Paso ${ph.i + 1} · `}${PH[ph.k]} · ${(ph.t1 - ph.t0).toFixed(1)} s`;
    if (ph.k === 'handle') { const em = document.createElement('em'); em.textContent = `D${ph.i + 1}`; d.appendChild(em); }
    tl.appendChild(d);
  }
  state.t = Math.min(state.t, t);
}

function poseMatrix(pl) {
  const [x, y, z] = pl.R;
  const M = new THREE.Matrix4().set(
    x[0], x[1], x[2], 0,
    y[0], y[1], y[2], 0,
    z[0], z[1], z[2], 0,
    0, 0, 0, 1,
  );
  const o = new THREE.Vector3(...pl.origin).applyMatrix4(M);
  M.setPosition(-o.x, -o.y + pl.tipY, -o.z);
  return M;
}

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const _q0 = new THREE.Quaternion(), _q1 = new THREE.Quaternion(), _p0 = new THREE.Vector3(), _p1 = new THREE.Vector3(), _sc = new THREE.Vector3();
function lerpPose(A, B, u, lift) {
  A.decompose(_p0, _q0, _sc); B.decompose(_p1, _q1, _sc);
  const q = _q0.clone().slerp(_q1, u);
  const p = _p0.clone().lerp(_p1, u);
  const arc = Math.sin(Math.PI * u);
  p.y += lift * arc; p.z += lift * 1.6 * arc;
  return new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
}

function stagingPose(first) {
  // pieza plana sobre la mesa de alimentación, misma orientación que la primera pose
  const M = first.clone();
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  M.decompose(p, q, sc);
  p.set(feedTable.position.x - 120, -245 + state.model.T, feedTable.position.z);
  return new THREE.Matrix4().compose(p, q, sc);
}
function finishedPose(last) {
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  last.decompose(p, q, sc);
  p.set(feedTable.position.x + 150, -180, feedTable.position.z + 40);
  return new THREE.Matrix4().compose(p, q, sc);
}

// ---------------- simulación por tiempo ----------------
function simulate(t) {
  const tl = state.timeline, plan = state.plan, m = state.model;
  if (!tl) return;
  const ph = tl.phases.find((p) => t >= p.t0 && t < p.t1) || tl.phases[tl.phases.length - 1];
  const u = Math.min(1, Math.max(0, (t - ph.t0) / Math.max(1e-6, ph.t1 - ph.t0)));
  const T = m.T, open = plan.cfg.approachMm;
  let tipY, pose, s, info = {};
  if (ph.k === 'unload') {
    const last = tl.poses[tl.poses.length - 1];
    s = tl.sFinal;
    pose = last ? lerpPose(last.end, finishedPose(last.end), ease(u), 260) : new THREE.Matrix4();
    tipY = T + open;
    info.status = 'DESCARGA';
  } else {
    const st = plan.steps[ph.i], P = tl.poses[ph.i];
    const sb = tl.sBefore[ph.i];
    const depth = st.tool.depth;
    if (ph.k === 'handle') {
      s = sb;
      const from = ph.i === 0 ? stagingPose(P.start) : tl.poses[ph.i - 1].end;
      pose = lerpPose(from, P.start, ease(u), ph.i === 0 ? 280 : 160);
      tipY = T + open;
      const prev = ph.i === 0 ? { bgZ: -300, bgSpread: 200 } : tl.poses[ph.i - 1];
      const ub = ease(Math.min(1, u * 1.6));
      machine.setBackgauge(prev.bgZ + (P.bgZ - prev.bgZ) * ub, prev.bgSpread + (P.bgSpread - prev.bgSpread) * ub);
      info.status = st.handling.kind.toUpperCase();
    } else if (ph.k === 'approach') {
      s = sb; pose = P.start; tipY = T + open * (1 - ease(u));
      info.status = 'BAJADA';
    } else if (ph.k === 'bend') {
      s = sb.slice(); s[st.bi] = u;
      const tipNow = T - depth * u;
      pose = poseMatrix(placement(m, s, st.bi, st.sign, tipNow));
      tipY = tipNow;
      info.status = 'DOBLANDO';
    } else if (ph.k === 'dwell') {
      s = sb.slice(); s[st.bi] = 1; pose = P.end; tipY = T - depth; info.status = 'DESCOMPRESIÓN';
    } else {
      s = sb.slice(); s[st.bi] = 1; pose = P.end; tipY = T - depth + (depth + open) * ease(u); info.status = 'RETORNO';
    }
    if (ph.k !== 'handle') machine.setBackgauge(P.bgZ, P.bgSpread);
    const prog = ph.k === 'bend' ? u : ph.k === 'handle' || ph.k === 'approach' ? 0 : 1;
    const angNow = deg(st.bend.theta) * prog;
    info.step = `${st.step} / ${plan.steps.length}`;
    info.angle = `${(180 - deg(st.bend.theta)).toFixed(1)}° (inc.)`;
    info.angleNow = 180 - angNow;
    info.y = `${tipY.toFixed(2)} mm`;
    info.x = `${(-P.bgZ).toFixed(1)} mm`;
    info.tool = `P${plan.cfg.punchAngle}° / V${plan.V}`;
    info.force = ph.k === 'bend' ? `${(st.tool.tons * Math.min(1, u * 3)).toFixed(1)} t` : '0.0 t';
    $('hudStep').textContent = `Paso ${st.step}/${plan.steps.length} · ${PH[ph.k]}${ph.k === 'handle' ? ' (' + st.handling.kind + ')' : ''}`;
    $('hudY').textContent = info.y;
    $('hudAng').textContent = `${(180 - angNow).toFixed(1)}°`;
    $('hudF').textContent = info.force;
    highlightRow(ph.i);
  }
  if (ph.k === 'unload') { $('hudStep').textContent = 'Descarga de pieza terminada'; $('hudF').textContent = '0.0 t'; highlightRow(-1); }
  $('hudT').textContent = `${t.toFixed(1)} s`;
  info.program = state.name.replace(/\.(step|stp)$/i, '').slice(0, 18);
  machine.setTipY(tipY);
  setShape(s);
  partMesh.matrix.copy(pose);
  partMesh.matrixWorldNeedsUpdate = true;
  drawScreenThrottled(info);
}

let lastScreen = 0;
function drawScreenThrottled(info) {
  const now = performance.now();
  if (now - lastScreen < 120) return;
  lastScreen = now;
  machine.drawScreen(info);
}

let lastRow = -2;
function highlightRow(i) {
  if (i === lastRow) return;
  lastRow = i;
  document.querySelectorAll('#seqTable tr[data-step]').forEach((tr) => tr.classList.toggle('cur', +tr.dataset.step === i));
}

// ---------------- modo pieza ----------------
function partView() {
  const m = state.model, n = m.bends.length;
  const s = new Array(n).fill(state.fold);
  setShape(s);
  // orientar la base hacia arriba y centrar
  const up = n ? m.bends.find((b) => b.parentBend === -1).nP.map((x) => -x) : [0, 1, 0];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...up).normalize(), new THREE.Vector3(0, 1, 0));
  const g = partMesh.geometry;
  g.computeBoundingBox();
  const c = g.boundingBox.getCenter(new THREE.Vector3()).applyQuaternion(q);
  const M = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const box = g.boundingBox.clone().applyMatrix4(M);
  M.setPosition(-c.x, -box.min.y + machine.floorY + 760.5, -c.z + 900);
  partMesh.matrix.copy(M);
  partMesh.matrixWorldNeedsUpdate = true;
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  const part = mode === 'part';
  machine.group.visible = !part;
  feedTable.visible = !part;
  inspect.visible = part;
  $('partbar').hidden = !part || !state.model;
  $('hud').hidden = part || !state.model;
  if (state.model) { paintBendZones(); lastS = null; }
  if (part && state.model) {
    partView();
    const r = Math.max(state.model.flatBBox.L, 120);
    controls.target.set(0, machine.floorY + 780, 900);
    camera.position.set(r * 1.4, machine.floorY + 780 + r * 1.2, 900 + r * 2.0);
  } else if (state.model) setCamera('iso');
}

function setCamera(v) {
  const r = state.model ? Math.max(200, state.model.flatBBox.L) : 400;
  const views = {
    iso: [[650 + r * 1.5, 420 + r * 0.8, 1150 + r * 2.2], [0, 20, 0]],
    front: [[0, 300, 1500 + r * 2.5], [0, 60, 0]],
    side: [[900 + r * 3, 90, 60], [0, 20, 0]],
    close: [[r * 1.1 + 120, r * 0.7 + 160, r * 1.6 + 260], [0, 0, 0]],
    wide: [[2600, 1300, 4200], [0, 300, 0]],
  };
  if (state.mode === 'part') return;
  const [p, t] = views[v];
  camera.position.set(...p); controls.target.set(...t);
  document.querySelectorAll('#camSeg button').forEach((b) => b.classList.toggle('on', b.dataset.cam === v));
}

// ---------------- resultados ----------------
const fmtMoney = (x) => `${state.cfg.currency === 'EUR' ? '€' : '$'}${x.toFixed(x < 10 ? 3 : 2)} ${state.cfg.currency}`;
const fmtS = (x) => `${x.toFixed(1)} s`;

function renderResults() {
  const { model: m, plan: p } = state;
  $('resEmpty').hidden = true; $('res').hidden = false;
  $('partName').textContent = state.name;
  $('kCost').textContent = fmtMoney(p.cost.price);
  $('kCostSub').textContent = `lote de ${p.cfg.batch} pzas · ${fmtMoney(p.cost.batchTotal)}`;
  $('kCycle').textContent = fmtS(p.cycle);
  $('kCycleSub').textContent = `neto ${fmtS(p.cycleRaw)} · OEE ${p.cfg.efficiency}%`;
  $('kPph').textContent = p.piecesPerHour ? p.piecesPerHour.toFixed(0) : '—';
  $('kBends').textContent = m.bends.length;
  $('kBendsSub').textContent = `${p.steps.filter((s) => s.handling.kind === 'volteo').length} volteos · ${p.steps.filter((s) => s.handling.kind === 'giro').length} giros`;
  $('kTons').textContent = `${p.maxTons.toFixed(1)} t`;
  $('kTonsSub').textContent = `${((p.maxTons / p.cfg.machineTons) * 100).toFixed(1)}% de ${p.cfg.machineTons} t`;
  $('kMass').textContent = `${(p.massKg * 1000).toFixed(0)} g`;
  $('kMassSub').textContent = `blank ${(p.blankMassKg * 1000).toFixed(0)} g`;

  const parts = [
    ['Material', p.cost.material, '#8d99a8'], ['Corte láser', p.cost.cut, '#2ea8ff'],
    ['Doblado', p.cost.bend, '#e0262f'], ['Preparación', p.cost.setup, '#f5b301'],
  ];
  const tot = p.cost.subtotal || 1;
  $('costBar').innerHTML = parts.map(([, v, c]) => `<div style="width:${(v / tot) * 100}%;background:${c}"></div>`).join('');
  $('costTable').innerHTML = parts.map(([k, v, c]) => `<tr><td><span class="dot" style="background:${c}"></span>${k}</td><td>${fmtMoney(v)}</td></tr>`).join('')
    + (p.cfg.margin ? `<tr><td>Margen ${p.cfg.margin}%</td><td>${fmtMoney(p.cost.price - p.cost.subtotal)}</td></tr>` : '')
    + `<tr><td><b>Total por pieza</b></td><td><b>${fmtMoney(p.cost.price)}</b></td></tr>`;

  $('partTable').innerHTML = [
    ['Material', p.mat.name], ['Espesor detectado', `${m.T.toFixed(2)} mm`],
    ['Desarrollo (blank)', `${m.flatBBox.L.toFixed(1)} × ${m.flatBBox.W.toFixed(1)} mm`],
    ['Longitud de corte', `${(m.cutLength / 1000).toFixed(3)} m · ${m.pierces} perforaciones`],
    ['Barrenos detectados', m.holeCount],
    ['Matriz / punzón', `V${p.V} · punzón ${p.cfg.punchAngle}°`],
    ['Radio natural (aire)', `≈ ${p.natR.toFixed(1)} mm`],
    ['Caras B-rep', m.faceCount],
  ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  const rows = p.steps.map((st, i) => {
    const b = st.bend;
    const main = `<tr data-step="${i}"><td>${st.step}</td><td>${(180 - deg(b.theta)).toFixed(1)}°</td><td>${b.rIn.toFixed(1)}</td><td>${b.length.toFixed(0)}</td><td>${st.flangeMin.toFixed(1)}</td><td>${st.tool.tons.toFixed(1)}</td><td>${st.tool.thetaCmd.toFixed(1)}°</td><td>${st.handling.kind}</td><td>${st.t.total.toFixed(1)}</td></tr>`;
    return main + (st.notes.length ? `<tr class="note"><td></td><td colspan="8">⚠ ${st.notes.join(' · ')}</td></tr>` : '');
  }).join('');
  $('seqTable').innerHTML = `<tr><th>#</th><th>Ángulo</th><th>Ri</th><th>Largo</th><th>Ala mín</th><th>t</th><th>Comando</th><th>Manip.</th><th>s</th></tr>${rows}`;
  lastRow = -2;

  $('batchTable').innerHTML = [
    ['Piezas', p.cfg.batch], ['Preparación', `${p.cfg.setupMin} min`],
    ['Tiempo total de lote', `${p.cost.batchHours.toFixed(2)} h`], ['Costo total de lote', fmtMoney(p.cost.batchTotal)],
  ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  const w = [...p.warnings];
  if (!m.bends.length) w.unshift('No se detectaron dobleces: la pieza se trata como blank plano.');
  $('warnings').innerHTML = w.length ? `<div class="warn"><b>Observaciones</b><ul>${w.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '';
  document.querySelectorAll('[data-cur]').forEach((el) => (el.textContent = `${state.cfg.currency}${el.textContent.replace(/^[A-Z]{3}/, '')}`));
}

// ---------------- parámetros ----------------
const sel = $('p-material');
for (const [k, v] of Object.entries(MATERIALS)) sel.add(new Option(v.name, k));
const numIds = ['matPrice', 'scrap', 'machineTons', 'machineLength', 'vFactor', 'punchAngle', 'approachMm', 'vFast', 'vBend', 'vReturn', 'load', 'reposition', 'rotate', 'flip', 'unload', 'backgauge', 'machineRate', 'operatorRate', 'efficiency', 'setupMin', 'batch', 'cutPerM', 'piercePrice', 'margin'];
function fillParams() {
  sel.value = state.cfg.material;
  for (const id of numIds) { const v = state.cfg[id]; $('p-' + id).value = v ?? ''; }
  $('p-matPrice').value = state.cfg.matPrice ?? MATERIALS[state.cfg.material].price;
  $('p-includeCut').checked = state.cfg.includeCut;
  $('p-currency').value = state.cfg.currency;
}
fillParams();
document.querySelectorAll('#params input, #params select').forEach((el) => el.addEventListener('change', () => {
  const prevMat = state.cfg.material;
  state.cfg.material = sel.value;
  for (const id of numIds) { const v = $('p-' + id).value; state.cfg[id] = v === '' ? (id === 'vFactor' ? null : DEFAULTS[id]) : +v; }
  if (prevMat !== state.cfg.material) { state.cfg.matPrice = MATERIALS[state.cfg.material].price; $('p-matPrice').value = state.cfg.matPrice; }
  state.cfg.includeCut = $('p-includeCut').checked;
  state.cfg.currency = $('p-currency').value;
  state.cfg.batch = Math.max(1, state.cfg.batch);
  const k = $('p-k').value === '' ? null : +$('p-k').value;
  const geomChanged = el.id === 'p-machineLength' || el.id === 'p-machineTons' || el.id === 'p-punchAngle';
  if (geomChanged) {
    scene.remove(machine.group);
    machine = new PressBrake({ length: state.cfg.machineLength, tons: state.cfg.machineTons, punchAngle: state.cfg.punchAngle });
    scene.add(machine.group);
    machine.group.visible = state.mode === 'machine';
  }
  if (state.model && k !== state.kFactor) { state.kFactor = k; const keep = state.mode; analyze(); setMode(keep); return; }
  state.kFactor = k;
  replan();
}));

// ---------------- eventos UI ----------------
$('file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (f) loadStepBuffer(await f.arrayBuffer(), f.name);
  e.target.value = '';
});
$('sample').addEventListener('change', async (e) => {
  const url = e.target.value;
  if (!url) return;
  showLoading('Descargando pieza de ejemplo…');
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    await loadStepBuffer(await r.arrayBuffer(), 'Ejemplo · ' + e.target.selectedOptions[0].text);
  } catch (err) { showLoading(null); showError('No se pudo cargar el ejemplo: ' + err.message); }
  e.target.value = '';
});
const drop = $('drop');
vp.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); drop.classList.remove('hidden'); });
vp.addEventListener('dragleave', () => { drop.classList.remove('over'); if (state.model) drop.classList.add('hidden'); });
vp.addEventListener('drop', async (e) => {
  e.preventDefault(); drop.classList.remove('over');
  const f = e.dataTransfer.files[0];
  if (f) loadStepBuffer(await f.arrayBuffer(), f.name);
  else if (state.model) drop.classList.add('hidden');
});
document.querySelectorAll('#modeSeg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
document.querySelectorAll('#camSeg button').forEach((b) => b.addEventListener('click', () => { if (state.mode !== 'machine') setMode('machine'); setCamera(b.dataset.cam); }));
$('foldSlider').addEventListener('input', (e) => { state.fold = +e.target.value; if (state.mode === 'part') partView(); });
$('hl').addEventListener('change', (e) => { state.highlight = e.target.checked; paintBendZones(); });
function updatePlayBtn() { $('btnPlay').textContent = state.playing ? '❚❚' : '▶'; }
$('btnPlay').addEventListener('click', () => { state.playing = !state.playing; if (state.mode !== 'machine') setMode('machine'); updatePlayBtn(); });
$('speed').addEventListener('change', (e) => (state.speed = +e.target.value));
function jumpStep(dir) {
  const tl = state.timeline; if (!tl) return;
  const starts = tl.phases.filter((p) => p.k === 'handle' || p.k === 'unload').map((p) => p.t0);
  const cur = state.t;
  const target = dir > 0 ? starts.find((s) => s > cur + 0.01) ?? 0 : [...starts].reverse().find((s) => s < cur - 0.3) ?? 0;
  state.t = target;
  if (state.mode !== 'machine') setMode('machine');
}
$('btnNext').addEventListener('click', () => jumpStep(1));
$('btnPrev').addEventListener('click', () => jumpStep(-1));
$('timeline').addEventListener('pointerdown', (e) => {
  const seek = (ev) => { const r = $('timeline').getBoundingClientRect(); state.t = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)) * state.timeline.total; };
  if (!state.timeline) return;
  if (state.mode !== 'machine') setMode('machine');
  seek(e);
  const mv = (ev) => seek(ev);
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', () => window.removeEventListener('pointermove', mv), { once: true });
});
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); $('btnPlay').click(); }
  if (e.code === 'ArrowRight') jumpStep(1);
  if (e.code === 'ArrowLeft') jumpStep(-1);
});
$('btnCsv').addEventListener('click', () => {
  const { plan: p, model: m } = state;
  const lines = [['paso', 'angulo_incluido', 'angulo_comando', 'radio_int', 'largo_mm', 'ala_min_mm', 'tonelaje_t', 'V', 'manipulacion', 't_manip', 't_aprox', 't_doblado', 't_descomp', 't_retorno', 't_total']];
  p.steps.forEach((s) => lines.push([s.step, (180 - deg(s.bend.theta)).toFixed(2), s.tool.thetaCmd.toFixed(2), s.bend.rIn.toFixed(2), s.bend.length.toFixed(1), s.flangeMin.toFixed(1), s.tool.tons.toFixed(2), p.V, s.handling.kind, ...['handle', 'approach', 'bend', 'dwell', 'ret', 'total'].map((k) => s.t[k].toFixed(2))]));
  lines.push([]);
  lines.push(['pieza', state.name]); lines.push(['espesor_mm', m.T.toFixed(3)]); lines.push(['blank_mm', `${m.flatBBox.L.toFixed(1)}x${m.flatBBox.W.toFixed(1)}`]);
  lines.push(['ciclo_s', p.cycle.toFixed(2)]); lines.push(['piezas_hora', p.piecesPerHour.toFixed(1)]);
  for (const [k, v] of Object.entries(p.cost)) lines.push([`costo_${k}`, v.toFixed(4)]);
  lines.push(['moneda', p.cfg.currency]);
  const csv = lines.map((l) => l.join(',')).join('\n');
  const btn = $('btnCsv');
  const done = (msg) => { btn.textContent = msg; setTimeout(() => (btn.textContent = 'Copiar CSV'), 1800); };
  const fallback = () => { $('csvText').value = csv; $('csvbox').hidden = false; $('csvText').select(); };
  try { navigator.clipboard.writeText(csv).then(() => done('Copiado ✓'), fallback); } catch { fallback(); }
});
$('errClose').addEventListener('click', () => ($('errbox').hidden = true));
$('csvClose').addEventListener('click', () => ($('csvbox').hidden = true));

// ---------------- bucle ----------------
const clock = new THREE.Clock();
function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (state.model && state.mode === 'machine') {
    if (state.playing) {
      state.t += dt * state.speed;
      if (state.t >= state.timeline.total) state.t = 0;
    }
    simulate(state.t);
    $('playhead').style.left = (state.t / state.timeline.total) * 100 + '%';
    $('clock').textContent = `${state.t.toFixed(1)} / ${state.timeline.total.toFixed(1)} s`;
  }
  controls.update();
  composer.render();
  requestAnimationFrame(loop);
}
machine.setBackgauge(-300, 200);
machine.drawScreen({ status: 'LISTO' });
loop();

// pieza por parámetro de URL (?sample=bracket)
// sin parámetro se abre con el soporte de ejemplo para mostrar la simulación completa
const qs = new URLSearchParams(location.search).get('sample') || 'bracket';
if (qs !== 'none') { $('sample').value = `samples/${qs}.step`; $('sample').dispatchEvent(new Event('change')); }
window.__sim = state;
window.__dbg = { get part() { return partMesh; }, THREE, camera, controls };
