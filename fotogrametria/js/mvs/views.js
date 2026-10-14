// Selección de vistas y regiones de interés (ROI) para el estéreo multivista.
import { cameraCenter } from '../core/camera.js';
import { v3, mat3Vec } from '../core/linalg.js';

export function boxPoints(box, n = 3) {
  const pts = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    pts.push([
      box.min[0] + (box.max[0] - box.min[0]) * i / (n - 1),
      box.min[1] + (box.max[1] - box.min[1]) * j / (n - 1),
      box.min[2] + (box.max[2] - box.min[2]) * k / (n - 1),
    ]);
  }
  return pts;
}

// Proyección ideal (sin distorsión) a coordenadas de píxel.
function projIdeal(K, R, t, X) {
  const c = mat3Vec(R, X);
  const z = c[2] + t[2];
  return [K.fx * (c[0] + t[0]) / z + K.cx, K.fy * (c[1] + t[1]) / z + K.cy, z];
}

// ROI en la imagen ideal (sin distorsión) que contiene la caja, con la relación de aspecto W/H.
// Devuelve { x0, y0, s } con s = escala (píxeles de trabajo por píxel original) o null.
export function computeROI(K, R, t, box, W, H, { margin = 0.04, maxScale = 1.0 } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, nIn = 0;
  for (const X of boxPoints(box, 5)) {
    const [u, v, z] = projIdeal(K, R, t, X);
    if (!(z > 1)) continue;
    nIn++;
    x0 = Math.min(x0, u); y0 = Math.min(y0, v); x1 = Math.max(x1, u); y1 = Math.max(y1, v);
  }
  if (nIn < 4) return null;
  const fw = K.width, fh = K.height;
  x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(fw, x1); y1 = Math.min(fh, y1);
  if (x1 - x0 < 16 || y1 - y0 < 16) return null;
  const mw = (x1 - x0) * (1 + 2 * margin), mh = (y1 - y0) * (1 + 2 * margin);
  let s = Math.min(W / mw, H / mh, maxScale);
  const rw = W / s, rh = H / s;
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // mantener dentro del cuadro si es posible
  if (rw <= fw) cx = Math.min(Math.max(cx, rw / 2), fw - rw / 2); else cx = fw / 2;
  if (rh <= fh) cy = Math.min(Math.max(cy, rh / 2), fh - rh / 2); else cy = fh / 2;
  return { x0: cx - rw / 2, y0: cy - rh / 2, s, w: rw, h: rh };
}

// Selección de vistas fuente para una vista de referencia (ángulo de triangulación y escala).
export function selectSources(ref, cams, box, { maxSources = 6, minAngle = 4, maxAngle = 50, idealAngle = 16, sigma = 12 } = {}) {
  const pts = boxPoints({ min: lerp3(box.min, box.max, 0.2), max: lerp3(box.min, box.max, 0.8) }, 3);
  const cr = cams[ref];
  const Cr = cameraCenter(cr.R, cr.t);
  const scored = [];
  for (let j = 0; j < cams.length; j++) {
    if (j === ref || !cams[j]) continue;
    const cj = cams[j];
    const Cj = cameraCenter(cj.R, cj.t);
    let score = 0;
    for (const X of pts) {
      const a = projIdeal(cr.K, cr.R, cr.t, X), b = projIdeal(cj.K, cj.R, cj.t, X);
      if (!(a[2] > 0 && b[2] > 0)) continue;
      if (a[0] < 0 || a[1] < 0 || a[0] > cr.K.width || a[1] > cr.K.height) continue;
      if (b[0] < 0 || b[1] < 0 || b[0] > cj.K.width || b[1] > cj.K.height) continue;
      const ra = v3.normalize(v3.sub(Cr, X)), rb = v3.normalize(v3.sub(Cj, X));
      const ang = Math.acos(Math.max(-1, Math.min(1, v3.dot(ra, rb)))) * 180 / Math.PI;
      if (ang < minAngle || ang > maxAngle) continue;
      const g = Math.exp(-((ang - idealAngle) ** 2) / (2 * sigma * sigma));
      const da = v3.dist(Cr, X), db = v3.dist(Cj, X);
      const scale = Math.min(da, db) / Math.max(da, db);
      score += g * scale * scale;
    }
    if (score > 0) scored.push({ j, score });
  }
  scored.sort((a, b) => b.score - a.score);
  // diversidad: evitar dos fuentes casi idénticas
  const out = [];
  for (const s of scored) {
    if (out.length >= maxSources) break;
    const Cj = cameraCenter(cams[s.j].R, cams[s.j].t);
    let dup = false;
    for (const o of out) {
      const Co = cameraCenter(cams[o.j].R, cams[o.j].t);
      if (v3.dist(Cj, Co) < 0.03 * v3.dist(Cj, Cr)) { dup = true; break; }
    }
    if (!dup) out.push(s);
  }
  return out.map(s => s.j);
}

function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
