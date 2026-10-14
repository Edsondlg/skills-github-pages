// Textura fotográfica: para cada triángulo se elige la foto que lo ve mejor (frontal y con más
// resolución, con prueba de visibilidad en GPU), se suavizan las etiquetas para reducir costuras,
// se recortan las regiones usadas de cada foto, se empaquetan en un atlas y se compensa la exposición.
import * as THREE from 'three';
import { projectionFromK, setThreeCameraPose } from '../viewer/camutils.js';
import { projectPoint } from '../core/camera.js';

const yieldUI = () => new Promise(r => setTimeout(r, 0));

export async function bakeTexture({ mesh, project, atlasSize = null, depthWidth = 1024, onProgress = () => {} }) {
  const K = project.calib.K;
  const photos = project.registeredViews();
  const P = mesh.positions, I = mesh.indices;
  const nV = P.length / 3, nT = I.length / 3;
  // normales de triángulo y áreas
  const TN = new Float32Array(nT * 3);
  for (let t = 0; t < nT; t++) {
    const a = 3 * I[3 * t], b = 3 * I[3 * t + 1], c = 3 * I[3 * t + 2];
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    TN[3 * t] = nx / l; TN[3 * t + 1] = ny / l; TN[3 * t + 2] = nz / l;
  }
  // render de profundidad para visibilidad
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  const Wd = depthWidth, Hd = Math.round(depthWidth * K.height / K.width);
  const sc = Wd / K.width;
  const Kd = { fx: K.fx * sc, fy: K.fy * sc, cx: (K.cx + 0.5) * sc - 0.5, cy: (K.cy + 0.5) * sc - 0.5 };
  const rt = new THREE.WebGLRenderTarget(Wd, Hd, { type: THREE.FloatType, format: THREE.RGBAFormat });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  geo.setIndex(new THREE.BufferAttribute(I, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: 'varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vZ; void main(){ gl_FragColor = vec4(vZ, 0.0, 0.0, 1.0); }',
    side: THREE.DoubleSide,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geo, mat));
  // mesa (ocluye lo que está por debajo)
  const table = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), mat);
  table.position.z = -0.5;
  scene.add(table);
  const cam = new THREE.PerspectiveCamera();
  cam.projectionMatrix.copy(projectionFromK(Kd, Wd, Hd, 5, 20000));
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  const buf = new Float32Array(Wd * Hd * 4);
  const bestL = new Int16Array(nT).fill(-1), bestS = new Float32Array(nT);
  const secL = new Int16Array(nT).fill(-1), secS = new Float32Array(nT);
  const vis = new Uint8Array(nV);
  const vu = new Float32Array(nV), vv = new Float32Array(nV);
  const sharp = photos.map(p => p.sharp || 1);
  const medSharp = sharp.slice().sort((a, b) => a - b)[sharp.length >> 1] || 1;
  for (let pi = 0; pi < photos.length; pi++) {
    const p = photos[pi];
    setThreeCameraPose(cam, p.R, p.t);
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, Wd, Hd, buf);
    renderer.setRenderTarget(null);
    const R = p.R, t = p.t;
    const C = [-(R[0] * t[0] + R[3] * t[1] + R[6] * t[2]), -(R[1] * t[0] + R[4] * t[1] + R[7] * t[2]), -(R[2] * t[0] + R[5] * t[1] + R[8] * t[2])];
    for (let i = 0; i < nV; i++) {
      const x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
      const Z = R[6] * x + R[7] * y + R[8] * z + t[2];
      vis[i] = 0;
      if (Z <= 1) continue;
      const X = R[0] * x + R[1] * y + R[2] * z + t[0], Y = R[3] * x + R[4] * y + R[5] * z + t[1];
      const ud = Kd.fx * X / Z + Kd.cx, vd = Kd.fy * Y / Z + Kd.cy;
      const ix = Math.round(ud), iy = Math.round(vd);
      if (ix < 2 || iy < 2 || ix >= Wd - 2 || iy >= Hd - 2) continue;
      // profundidad renderizada (filas de GL invertidas); mínimo en vecindad 3x3 para robustez
      let zr = Infinity;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const zz = buf[((Hd - 1 - (iy + dy)) * Wd + ix + dx) * 4];
        if (zz > 0 && zz < zr) zr = zz;
      }
      if (Z <= zr + Math.max(0.6, 0.0025 * Z)) vis[i] = 1;
      // coordenadas en la foto completa (con distorsión)
      const [u, v] = projectPoint(K, R, t, [x, y, z]);
      vu[i] = u; vv[i] = v;
    }
    const sf = Math.min(1, sharp[pi] / medSharp);
    for (let tr = 0; tr < nT; tr++) {
      const a = I[3 * tr], b = I[3 * tr + 1], c = I[3 * tr + 2];
      if (!vis[a] || !vis[b] || !vis[c]) continue;
      if (vu[a] < 2 || vv[a] < 2 || vu[a] > K.width - 3 || vv[a] > K.height - 3) continue;
      // coseno entre normal y dirección a la cámara
      const mx = (P[3 * a] + P[3 * b] + P[3 * c]) / 3, my = (P[3 * a + 1] + P[3 * b + 1] + P[3 * c + 1]) / 3, mz = (P[3 * a + 2] + P[3 * b + 2] + P[3 * c + 2]) / 3;
      let dx = C[0] - mx, dy = C[1] - my, dz = C[2] - mz;
      const dl = Math.hypot(dx, dy, dz);
      const cosA = Math.abs((TN[3 * tr] * dx + TN[3 * tr + 1] * dy + TN[3 * tr + 2] * dz) / dl);
      if (cosA < 0.2) continue;
      const area = Math.abs((vu[b] - vu[a]) * (vv[c] - vv[a]) - (vu[c] - vu[a]) * (vv[b] - vv[a])) / 2;
      const s = area * cosA * (0.6 + 0.4 * sf);
      if (s > bestS[tr]) { secS[tr] = bestS[tr]; secL[tr] = bestL[tr]; bestS[tr] = s; bestL[tr] = pi; }
      else if (s > secS[tr]) { secS[tr] = s; secL[tr] = pi; }
    }
    onProgress((pi + 1) / photos.length * 0.5, `Textura: visibilidad en foto ${pi + 1}/${photos.length}`);
    await yieldUI();
  }
  rt.dispose(); renderer.dispose(); mat.dispose();
  // suavizado de etiquetas (mayoría entre triángulos que comparten vértices)
  const start = new Int32Array(nV + 1);
  for (let k = 0; k < I.length; k++) start[I[k] + 1]++;
  for (let i = 0; i < nV; i++) start[i + 1] += start[i];
  const vt = new Int32Array(I.length), fill = start.slice(0, nV);
  for (let k = 0; k < I.length; k++) vt[fill[I[k]]++] = (k / 3) | 0;
  const label = Int16Array.from(bestL);
  for (let it = 0; it < 3; it++) {
    const next = Int16Array.from(label);
    for (let tr = 0; tr < nT; tr++) {
      if (label[tr] < 0) continue;
      const cnt = new Map();
      for (let k = 0; k < 3; k++) {
        const v = I[3 * tr + k];
        for (let q = start[v]; q < start[v + 1]; q++) { const l = label[vt[q]]; if (l >= 0) cnt.set(l, (cnt.get(l) || 0) + 1); }
      }
      let bl = label[tr], bc = cnt.get(bl) || 0;
      for (const [l, c] of cnt) if (c > bc) { bl = l; bc = c; }
      if (bl !== label[tr] && bl === secL[tr] && secS[tr] >= 0.55 * bestS[tr]) next[tr] = bl;
    }
    label.set(next);
  }
  // recortes por foto
  const crops = new Map();
  for (let tr = 0; tr < nT; tr++) {
    const l = label[tr];
    if (l < 0) continue;
    let c = crops.get(l);
    if (!c) { c = { l, x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, tris: [] }; crops.set(l, c); }
    c.tris.push(tr);
  }
  // coordenadas UV por foto (recalcular proyecciones para los vértices de los triángulos asignados)
  const uvCache = new Map();
  for (const c of crops.values()) {
    const p = photos[c.l];
    const used = new Map();
    for (const tr of c.tris) for (let k = 0; k < 3; k++) {
      const v = I[3 * tr + k];
      if (used.has(v)) continue;
      const [u, vv2] = projectPoint(K, p.R, p.t, [P[3 * v], P[3 * v + 1], P[3 * v + 2]]);
      used.set(v, [u, vv2]);
      c.x0 = Math.min(c.x0, u); c.y0 = Math.min(c.y0, vv2); c.x1 = Math.max(c.x1, u); c.y1 = Math.max(c.y1, vv2);
    }
    const m = 6;
    c.x0 = Math.max(0, Math.floor(c.x0) - m); c.y0 = Math.max(0, Math.floor(c.y0) - m);
    c.x1 = Math.min(K.width, Math.ceil(c.x1) + m); c.y1 = Math.min(K.height, Math.ceil(c.y1) + m);
    c.w = c.x1 - c.x0; c.h = c.y1 - c.y0;
    uvCache.set(c.l, used);
  }
  // empaquetado en estantes con escala común
  const S = atlasSize || 4096;
  const list = [...crops.values()].sort((a, b) => b.h - a.h);
  const pack = (scale) => {
    let x = 2, y = 2, rowH = 0;
    for (const c of list) {
      const w = Math.ceil(c.w * scale) + 2, hh = Math.ceil(c.h * scale) + 2;
      if (x + w > S) { x = 2; y += rowH; rowH = 0; }
      if (y + hh > S - 12) return false;
      c.ax = x; c.ay = y; c.aw = w - 2; c.ah = hh - 2;
      x += w; rowH = Math.max(rowH, hh);
    }
    return true;
  };
  let lo = 0.02, hi = 1.0;
  if (pack(hi)) lo = hi;
  else { for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (pack(mid)) lo = mid; else hi = mid; } }
  const scale = lo;
  pack(scale);
  // dibujar el atlas
  const atlas = document.createElement('canvas');
  atlas.width = S; atlas.height = S;
  const g = atlas.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#808080'; g.fillRect(0, 0, S, S);
  const meanCol = (cols) => { let r = 0, gg = 0, b = 0; for (const c of cols) { r += c[0]; gg += c[1]; b += c[2]; } const n = Math.max(1, cols.length); return [r / n, gg / n, b / n]; };
  let k = 0;
  for (const c of list) {
    const p = photos[c.l];
    const bmp = await createImageBitmap(p.file);
    g.drawImage(bmp, c.x0, c.y0, c.w, c.h, c.ax, c.ay, c.aw, c.ah);
    bmp.close?.();
    // compensación de exposición: color medio de los vértices (multivista) vs color de la foto
    const used = uvCache.get(c.l);
    const id = g.getImageData(c.ax, c.ay, c.aw, c.ah);
    const ref = [], obs = [];
    let cnt = 0;
    for (const [v, [u, vv2]] of used) {
      if ((cnt++ % 7) !== 0) continue;
      const x = Math.round((u + 0.5 - c.x0) * (c.aw / c.w) - 0.5), y = Math.round((vv2 + 0.5 - c.y0) * (c.ah / c.h) - 0.5);
      if (x < 0 || y < 0 || x >= c.aw || y >= c.ah) continue;
      const o = 4 * (y * c.aw + x);
      obs.push([id.data[o], id.data[o + 1], id.data[o + 2]]);
      ref.push([mesh.colors[3 * v], mesh.colors[3 * v + 1], mesh.colors[3 * v + 2]]);
    }
    if (obs.length > 20) {
      const mr = meanCol(ref), mo = meanCol(obs);
      const gain = mr.map((r, i) => Math.max(0.6, Math.min(1.6, r / Math.max(1, mo[i]))));
      for (let i = 0; i < id.data.length; i += 4) { id.data[i] *= gain[0]; id.data[i + 1] *= gain[1]; id.data[i + 2] *= gain[2]; }
      g.putImageData(id, c.ax, c.ay);
    }
    k++;
    onProgress(0.5 + 0.45 * k / list.length, `Textura: componiendo atlas ${k}/${list.length}`);
    await yieldUI();
  }
  // geometría no indexada con UV
  const pos = new Float32Array(nT * 9), uv = new Float32Array(nT * 6), col = new Float32Array(nT * 9);
  const grayUV = [(S - 6) / S, 1 - (S - 6) / S];
  let untex = 0;
  for (let tr = 0; tr < nT; tr++) {
    const l = label[tr];
    const c = l >= 0 ? crops.get(l) : null;
    const used = l >= 0 ? uvCache.get(l) : null;
    for (let q = 0; q < 3; q++) {
      const v = I[3 * tr + q];
      pos[9 * tr + 3 * q] = P[3 * v]; pos[9 * tr + 3 * q + 1] = P[3 * v + 1]; pos[9 * tr + 3 * q + 2] = P[3 * v + 2];
      for (let ch = 0; ch < 3; ch++) col[9 * tr + 3 * q + ch] = mesh.colors[3 * v + ch] / 255;
      if (c) {
        const [u, vv2] = used.get(v);
        uv[6 * tr + 2 * q] = (c.ax + (u + 0.5 - c.x0) * (c.aw / c.w)) / S;
        uv[6 * tr + 2 * q + 1] = 1 - (c.ay + (vv2 + 0.5 - c.y0) * (c.ah / c.h)) / S;
      } else { uv[6 * tr + 2 * q] = grayUV[0]; uv[6 * tr + 2 * q + 1] = grayUV[1]; }
    }
    if (!c) untex++;
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  tg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  tg.computeVertexNormals();
  const tex = new THREE.CanvasTexture(atlas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  const object = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  object.name = 'pieza_texturizada';
  onProgress(1, 'Textura lista');
  return {
    object, canvas: atlas, size: S, scale, photosUsed: crops.size, untextured: untex / nT,
    info: `${crops.size} fotos · atlas ${S}×${S} · escala ${(scale * 100).toFixed(0)} % · ${(100 * (1 - untex / nT)).toFixed(1)} % de la superficie con foto`,
  };
}
