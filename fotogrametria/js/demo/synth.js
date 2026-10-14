// Generador de fotos sintéticas de demostración: pieza estampada (soporte en L con doblez,
// nervio embutido y barrenos) sobre el tapete impreso, vista por una cámara realista
// (distorsión de lente, ruido, viñeteo, JPEG). Incluye la geometría de referencia (verdad).
import * as THREE from 'three';
import { boardPrimitives, rasterizePrims } from '../core/board.js';
import { makeIntrinsics, lookAtPose, undistortNormalized } from '../core/camera.js';
import { rng, gaussRand } from '../core/linalg.js';

export const DEMO_PART = {
  nombre: 'Soporte en L estampado (demo)',
  ancho: 140, fondo: 80, espesor: 2, alturaPestana: 42, radioInterior: 3,
};

function speckleCanvas(sizePx, mmPerTile, seed, { bg = '#c9ccd1', ink = '#1d1f22', dot = 0.9 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = sizePx;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, sizePx, sizePx);
  const rand = rng(seed);
  const pxmm = sizePx / mmPerTile;
  const cell = dot * 1.55;
  g.fillStyle = ink;
  for (let y = 0; y < mmPerTile; y += cell) {
    for (let x = 0; x < mmPerTile; x += cell) {
      const r = dot * (0.35 + 0.35 * rand()) ;
      const cx = (x + rand() * cell) * pxmm, cy = (y + rand() * cell) * pxmm;
      for (const [ox, oy] of [[0, 0], [sizePx, 0], [-sizePx, 0], [0, sizePx], [0, -sizePx]]) {
        g.beginPath(); g.arc(cx + ox, cy + oy, r * pxmm, 0, Math.PI * 2); g.fill();
      }
    }
  }
  return c;
}

function circlePath(cx, cy, r) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, Math.PI * 2, true);
  return p;
}
function obroundPath(cx, cy, len, wid, ccw = true) {
  const p = new THREE.Path();
  const r = wid / 2, a = len / 2 - r;
  p.moveTo(cx - a, cy - r);
  if (ccw) {
    p.absarc(cx - a, cy, r, -Math.PI / 2, Math.PI / 2, true);
    p.lineTo(cx + a, cy + r);
    p.absarc(cx + a, cy, r, Math.PI / 2, -Math.PI / 2, true);
  } else {
    p.lineTo(cx + a, cy - r);
    p.absarc(cx + a, cy, r, -Math.PI / 2, Math.PI / 2, false);
    p.lineTo(cx - a, cy + r);
    p.absarc(cx - a, cy, r, Math.PI / 2, -Math.PI / 2, false);
  }
  return p;
}

// Geometrías de la pieza en coordenadas locales (mm), Z hacia arriba, apoyada en Z = 0.
export function stampedBracketGeometries(P = DEMO_PART) {
  const W = P.ancho, D = P.fondo, t = P.espesor, H = P.alturaPestana, ri = P.radioInterior, ro = ri + t;
  const yb = D / 2 - ro; // inicio del doblez
  const geos = [];
  // Base con barrenos y ranura
  const base = new THREE.Shape();
  const rc = 6;
  base.moveTo(-W / 2, yb);
  base.lineTo(-W / 2, -D / 2 + rc);
  base.absarc(-W / 2 + rc, -D / 2 + rc, rc, Math.PI, 1.5 * Math.PI, false);
  base.lineTo(W / 2 - rc, -D / 2);
  base.absarc(W / 2 - rc, -D / 2 + rc, rc, 1.5 * Math.PI, 2 * Math.PI, false);
  base.lineTo(W / 2, yb);
  base.lineTo(-W / 2, yb);
  base.holes.push(circlePath(-48, -16, 5), circlePath(48, -16, 5), obroundPath(0, -25, 30, 9));
  geos.push(new THREE.ExtrudeGeometry(base, { depth: t, bevelEnabled: false, curveSegments: 48 }));
  // Doblez (sector anular extruido a lo largo de X)
  const bend = new THREE.Shape();
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * i / N;
    const y = yb + ro * Math.cos(a), z = ro + ro * Math.sin(a);
    if (i === 0) bend.moveTo(y, z); else bend.lineTo(y, z);
  }
  for (let i = N; i >= 0; i--) {
    const a = -Math.PI / 2 + (Math.PI / 2) * i / N;
    bend.lineTo(yb + ri * Math.cos(a), ro + ri * Math.sin(a));
  }
  const gb = new THREE.ExtrudeGeometry(bend, { depth: W, bevelEnabled: false, curveSegments: 4 });
  gb.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, -W / 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  geos.push(gb);
  // Pestaña vertical con barreno y ventana
  const fl = new THREE.Shape();
  fl.moveTo(-W / 2, ro); fl.lineTo(W / 2, ro); fl.lineTo(W / 2, H - 5);
  fl.absarc(W / 2 - 5, H - 5, 5, 0, Math.PI / 2, false);
  fl.lineTo(-W / 2 + 5, H);
  fl.absarc(-W / 2 + 5, H - 5, 5, Math.PI / 2, Math.PI, false);
  fl.lineTo(-W / 2, ro);
  fl.holes.push(circlePath(-34, 26, 5));
  const win = new THREE.Path();
  win.moveTo(24, 18); win.lineTo(24, 32); win.lineTo(44, 32); win.lineTo(44, 18); win.lineTo(24, 18);
  fl.holes.push(win);
  const gf = new THREE.ExtrudeGeometry(fl, { depth: t, bevelEnabled: false, curveSegments: 40 });
  gf.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, -1, yb + ro, 0, 1, 0, 0, 0, 0, 0, 1));
  geos.push(gf);
  // Nervio embutido (oblongo con flancos inclinados)
  const rib = new THREE.Shape();
  const rl = 76, rw = 12, rr = rw / 2, ra = rl / 2 - rr, ry = 10;
  rib.moveTo(-ra, ry - rr);
  rib.lineTo(ra, ry - rr);
  rib.absarc(ra, ry, rr, -Math.PI / 2, Math.PI / 2, false);
  rib.lineTo(-ra, ry + rr);
  rib.absarc(-ra, ry, rr, Math.PI / 2, 1.5 * Math.PI, false);
  const gr = new THREE.ExtrudeGeometry(rib, { depth: 1.6, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 2.2, bevelSegments: 4, curveSegments: 32 });
  gr.translate(0, 0, t); // el bisel inferior queda embebido en la base
  geos.push(gr);
  return geos;
}

// Geometría de referencia en coordenadas del mundo (posiciones + índices) para validar.
export function partGroundTruth(matrix, P = DEMO_PART) {
  const pos = [], idx = [];
  for (const g of stampedBracketGeometries(P)) {
    const gg = g.index ? g.toNonIndexed() : g;
    gg.applyMatrix4(matrix);
    const a = gg.attributes.position.array;
    const base = pos.length / 3;
    for (let i = 0; i < a.length; i++) pos.push(a[i]);
    for (let i = 0; i < a.length / 3; i++) idx.push(base + i);
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

export function demoPartMatrix() {
  return new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(12)).setPosition(4, -6, 0);
}

export function buildDemoScene(board, { partMatrix = demoPartMatrix(), boardPxPerMM = 8 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4a4d52);
  // Mesa
  const tableTex = new THREE.CanvasTexture(speckleCanvas(512, 200, 99, { bg: '#77726c', ink: '#706a64', dot: 3 }));
  tableTex.wrapS = tableTex.wrapT = THREE.RepeatWrapping;
  tableTex.repeat.set(8, 8);
  tableTex.colorSpace = THREE.SRGBColorSpace;
  const table = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.9 }));
  table.position.z = -0.4;
  table.receiveShadow = true;
  scene.add(table);
  // Tapete
  const prims = boardPrimitives(board);
  const ras = rasterizePrims(prims, board.paperW, board.paperH, boardPxPerMM, { paper: 246, ink: 22 });
  const cnv = document.createElement('canvas');
  cnv.width = ras.w; cnv.height = ras.h;
  const ctx = cnv.getContext('2d');
  const id = ctx.createImageData(ras.w, ras.h);
  for (let i = 0; i < ras.data.length; i++) { const v = ras.data[i]; id.data[4 * i] = v; id.data[4 * i + 1] = v; id.data[4 * i + 2] = v; id.data[4 * i + 3] = 255; }
  ctx.putImageData(id, 0, 0);
  const btex = new THREE.CanvasTexture(cnv);
  btex.colorSpace = THREE.SRGBColorSpace;
  btex.anisotropy = 8;
  btex.generateMipmaps = true;
  btex.minFilter = THREE.LinearMipmapLinearFilter;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(board.paperW, board.paperH), new THREE.MeshStandardMaterial({ map: btex, roughness: 0.95 }));
  paper.position.set(board.paperW / 2 - board.u0, board.v0 - board.paperH / 2, 0);
  paper.receiveShadow = true;
  scene.add(paper);
  // Pieza
  const sp = new THREE.CanvasTexture(speckleCanvas(2048, 80, 1234, { bg: '#d5d9df', ink: '#202326', dot: 0.8 }));
  sp.wrapS = sp.wrapT = THREE.RepeatWrapping;
  sp.repeat.set(1 / 80, 1 / 80);
  sp.colorSpace = THREE.SRGBColorSpace;
  sp.anisotropy = 8;
  const mat = new THREE.MeshStandardMaterial({ map: sp, metalness: 0.25, roughness: 0.55, color: 0xffffff });
  const part = new THREE.Group();
  for (const g of stampedBracketGeometries()) {
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true; m.receiveShadow = true;
    part.add(m);
  }
  part.matrixAutoUpdate = false;
  part.matrix.copy(partMatrix);
  scene.add(part);
  // Iluminación difusa (tipo caja de luz) con sombra suave
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.4);
  dl.position.set(-250, -180, 600);
  dl.castShadow = true;
  dl.shadow.mapSize.set(2048, 2048);
  dl.shadow.camera.left = -260; dl.shadow.camera.right = 260; dl.shadow.camera.top = 260; dl.shadow.camera.bottom = -260;
  dl.shadow.camera.near = 100; dl.shadow.camera.far = 1200;
  dl.shadow.radius = 4;
  scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0xffffff, 0.5);
  dl2.position.set(300, 250, 400);
  scene.add(dl2);
  return { scene, part, partMatrix };
}

export { projectionFromK, setThreeCameraPose } from '../viewer/camutils.js';
import { projectionFromK, setThreeCameraPose } from '../viewer/camutils.js';

export function demoCameraPoses(count = 22, { radius = 400, target = [0, 0, 10], seed = 21 } = {}) {
  const rand = rng(seed);
  const rings = count >= 18 ? [[40, Math.round(count * 0.41)], [58, Math.round(count * 0.36)]] : [[42, Math.ceil(count / 2)], [62, Math.floor(count / 2)]];
  const used = rings.reduce((s, r) => s + r[1], 0);
  if (count >= 18) rings.push([76, count - used]);
  const poses = [];
  let k = 0;
  for (const [el0, n] of rings) {
    for (let i = 0; i < n; i++, k++) {
      const el = (el0 + (rand() - 0.5) * 6) * Math.PI / 180;
      const az = (i / n) * 2 * Math.PI + (el0 / 30) + (rand() - 0.5) * 0.25;
      const r = radius * (0.92 + 0.16 * rand());
      const eye = [r * Math.cos(el) * Math.cos(az), r * Math.cos(el) * Math.sin(az), r * Math.sin(el)];
      const tgt = [target[0] + (rand() - 0.5) * 30, target[1] + (rand() - 0.5) * 30, target[2]];
      const roll = (rand() - 0.5) * 0.5;
      const up = [Math.cos(az + Math.PI + roll), Math.sin(az + Math.PI + roll), 0.0];
      poses.push(lookAtPose(eye, tgt, up));
    }
  }
  return poses;
}

export function demoCamera(width = 2400, height = 1800) {
  return makeIntrinsics({ width, height, f: 0.83 * width, cx: width / 2 - 0.5 + 0.006 * width, cy: height / 2 - 0.5 - 0.004 * height, k1: -0.085, k2: 0.06, p1: 0.0004, p2: -0.0003, k3: 0 });
}

// Renderiza las fotos de demostración. Devuelve { files, K, poses, gt, partMatrix }.
export async function renderDemoPhotos(board, { count = 22, width = 2400, height = 1800, supersample = 2, noise = 1.6, quality = 0.93, onProgress = null } = {}) {
  const K = demoCamera(width, height);
  const poses = demoCameraPoses(count);
  const { scene, partMatrix } = buildDemoScene(board);
  // cámara ideal de render con focal reducida para cubrir el campo distorsionado
  let maxScale = 1;
  for (const [u, v] of [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1], [width / 2, 0], [0, height / 2]]) {
    const [x, y] = undistortNormalized(K, (u - K.cx) / K.fx, (v - K.cy) / K.fy);
    maxScale = Math.max(maxScale, Math.abs(x * K.fx) / Math.abs(u - K.cx || 1), Math.abs(y * K.fy) / Math.abs(v - K.cy || 1));
  }
  const s = 1 / (maxScale * 1.02);
  const Wr = width * supersample, Hr = height * supersample;
  const Kr = { fx: K.fx * s * supersample, fy: K.fy * s * supersample, cx: (K.cx + 0.5) * supersample - 0.5, cy: (K.cy + 0.5) * supersample - 0.5 };
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  renderer.setSize(16, 16, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const rt = new THREE.WebGLRenderTarget(Wr, Hr, { samples: 4, colorSpace: THREE.SRGBColorSpace });
  const cam = new THREE.PerspectiveCamera();
  cam.projectionMatrix.copy(projectionFromK(Kr, Wr, Hr));
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  const buf = new Uint8Array(Wr * Hr * 4);
  const out = document.createElement('canvas');
  out.width = width; out.height = height;
  const octx = out.getContext('2d');
  const files = [];
  // tabla de muestreo: para cada píxel distorsionado, su posición en la imagen ideal
  const mapX = new Float32Array(width * height), mapY = new Float32Array(width * height);
  for (let v = 0, k = 0; v < height; v++) for (let u = 0; u < width; u++, k++) {
    const [x, y] = undistortNormalized(K, (u - K.cx) / K.fx, (v - K.cy) / K.fy);
    mapX[k] = Kr.fx * x + Kr.cx; mapY[k] = Kr.fy * y + Kr.cy;
  }
  const sc = 0.25 * s * supersample; // desplazamiento de submuestras (antialias)
  const subs = [[-sc, -sc], [sc, -sc], [-sc, sc], [sc, sc]];
  for (let i = 0; i < poses.length; i++) {
    const { R, t } = poses[i];
    setThreeCameraPose(cam, R, t);
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, Wr, Hr, buf);
    renderer.setRenderTarget(null);
    const img = octx.createImageData(width, height);
    const d = img.data;
    const rand = rng(1000 + i);
    for (let v = 0, k = 0; v < height; v++) {
      for (let u = 0; u < width; u++, k++) {
        let r = 0, g = 0, b = 0;
        for (let q = 0; q < 4; q++) {
          const x = mapX[k] + subs[q][0], y = Hr - 1 - (mapY[k] + subs[q][1]); // filas de GL de abajo hacia arriba
          const x0 = Math.max(0, Math.min(Wr - 2, Math.floor(x))), y0 = Math.max(0, Math.min(Hr - 2, Math.floor(y)));
          const fx = Math.min(1, Math.max(0, x - x0)), fy = Math.min(1, Math.max(0, y - y0));
          const p = (y0 * Wr + x0) * 4, p2 = p + Wr * 4;
          const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
          r += buf[p] * w00 + buf[p + 4] * w10 + buf[p2] * w01 + buf[p2 + 4] * w11;
          g += buf[p + 1] * w00 + buf[p + 5] * w10 + buf[p2 + 1] * w01 + buf[p2 + 5] * w11;
          b += buf[p + 2] * w00 + buf[p + 6] * w10 + buf[p2 + 2] * w01 + buf[p2 + 6] * w11;
        }
        const nx = (u - width / 2) / width, ny = (v - height / 2) / height;
        const vig = 0.25 * (1 - 0.28 * (nx * nx + ny * ny));
        const n = noise * gaussRand(rand);
        const o = k * 4;
        d[o] = r * vig + n; d[o + 1] = g * vig + n; d[o + 2] = b * vig + n; d[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    const blob = await new Promise(res => out.toBlob(res, 'image/jpeg', quality));
    const name = `demo_${String(i + 1).padStart(2, '0')}.jpg`;
    const file = typeof File !== 'undefined' ? new File([blob], name, { type: 'image/jpeg' }) : Object.assign(blob, { name });
    files.push(file);
    if (onProgress) onProgress(i + 1, poses.length);
    await new Promise(r => setTimeout(r, 0));
  }
  rt.dispose();
  renderer.dispose();
  renderer.forceContextLoss?.();
  return { files, K, poses, partMatrix, gt: partGroundTruth(partMatrix) };
}

// Mapa de profundidad verdadero (z de cámara, mm) para una cámara estenopeica de trabajo.
export function renderDepthGT(scene, Kw, R, t, W, H) {
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: true });
  const mat = new THREE.ShaderMaterial({
    vertexShader: 'varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vZ; void main(){ gl_FragColor = vec4(vZ, 0.0, 0.0, 1.0); }',
    side: THREE.DoubleSide,
  });
  const prev = scene.overrideMaterial, prevBg = scene.background;
  scene.overrideMaterial = mat; scene.background = null;
  const cam = new THREE.PerspectiveCamera();
  cam.projectionMatrix.copy(projectionFromK(Kw, W, H));
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  setThreeCameraPose(cam, R, t);
  renderer.setRenderTarget(rt);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, cam);
  const buf = new Float32Array(W * H * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf);
  scene.overrideMaterial = prev; scene.background = prevBg;
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[y * W + x] = buf[((H - 1 - y) * W + x) * 4];
  rt.dispose(); mat.dispose(); renderer.dispose();
  return out;
}
