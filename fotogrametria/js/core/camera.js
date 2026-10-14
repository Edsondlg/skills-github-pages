// Modelo de cámara estenopeica con distorsión de Brown–Conrady (compatible con OpenCV).
// Convención de cámara: x a la derecha, y hacia abajo, z hacia adelante.
// Pose: Xc = R·Xw + t (R por filas, 9 elementos).
// Coordenadas de píxel: el centro del píxel (i, j) está en (i, j).
import { mat3Vec, mat3TVec, v3 } from './linalg.js';

export function makeIntrinsics(o) {
  const f = o.f ?? o.fx;
  return {
    width: o.width, height: o.height,
    fx: o.fx ?? f, fy: o.fy ?? f,
    cx: o.cx ?? (o.width - 1) / 2, cy: o.cy ?? (o.height - 1) / 2,
    k1: o.k1 ?? 0, k2: o.k2 ?? 0, p1: o.p1 ?? 0, p2: o.p2 ?? 0, k3: o.k3 ?? 0,
  };
}

export function hasDistortion(K) {
  return K.k1 !== 0 || K.k2 !== 0 || K.k3 !== 0 || K.p1 !== 0 || K.p2 !== 0;
}

// Coordenadas normalizadas ideales -> normalizadas distorsionadas.
export function distortNormalized(K, x, y) {
  const r2 = x * x + y * y;
  const L = 1 + r2 * (K.k1 + r2 * (K.k2 + r2 * K.k3));
  return [
    x * L + 2 * K.p1 * x * y + K.p2 * (r2 + 2 * x * x),
    y * L + K.p1 * (r2 + 2 * y * y) + 2 * K.p2 * x * y,
  ];
}

// Inversa de la distorsión por Newton (converge para distorsiones realistas).
export function undistortNormalized(K, xd, yd) {
  if (!hasDistortion(K)) return [xd, yd];
  let x = xd, y = yd;
  for (let it = 0; it < 20; it++) {
    const r2 = x * x + y * y;
    const L = 1 + r2 * (K.k1 + r2 * (K.k2 + r2 * K.k3));
    const fxv = x * L + 2 * K.p1 * x * y + K.p2 * (r2 + 2 * x * x) - xd;
    const fyv = y * L + K.p1 * (r2 + 2 * y * y) + 2 * K.p2 * x * y - yd;
    if (Math.abs(fxv) + Math.abs(fyv) < 1e-14) break;
    const dL = K.k1 + 2 * K.k2 * r2 + 3 * K.k3 * r2 * r2;
    const a = L + 2 * x * x * dL + 2 * K.p1 * y + 6 * K.p2 * x;
    const b = 2 * x * y * dL + 2 * K.p1 * x + 2 * K.p2 * y;
    const c = 2 * x * y * dL + 2 * K.p1 * x + 2 * K.p2 * y;
    const d = L + 2 * y * y * dL + 6 * K.p1 * y + 2 * K.p2 * x;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-15) break;
    x -= (d * fxv - b * fyv) / det;
    y -= (-c * fxv + a * fyv) / det;
  }
  return [x, y];
}

// Píxel (distorsionado) -> coordenadas normalizadas ideales.
export function pixelToNormalized(K, u, v) {
  return undistortNormalized(K, (u - K.cx) / K.fx, (v - K.cy) / K.fy);
}
// Normalizadas ideales -> píxel (con distorsión).
export function normalizedToPixel(K, x, y) {
  const [xd, yd] = distortNormalized(K, x, y);
  return [K.fx * xd + K.cx, K.fy * yd + K.cy];
}
// Píxel distorsionado -> píxel ideal (sin distorsión) con la misma K.
export function undistortPixel(K, u, v) {
  const [x, y] = pixelToNormalized(K, u, v);
  return [K.fx * x + K.cx, K.fy * y + K.cy];
}
export function distortPixel(K, u, v) {
  return normalizedToPixel(K, (u - K.cx) / K.fx, (v - K.cy) / K.fy);
}

// Proyección de un punto del mundo. Devuelve [u, v, profundidad].
export function projectPoint(K, R, t, X) {
  const Xc = mat3Vec(R, X);
  const x = Xc[0] + t[0], y = Xc[1] + t[1], z = Xc[2] + t[2];
  const [u, v] = normalizedToPixel(K, x / z, y / z);
  return [u, v, z];
}

export function cameraCenter(R, t) {
  const c = mat3TVec(R, t);
  return [-c[0], -c[1], -c[2]];
}
// Dirección del eje óptico en el mundo (tercera fila de R).
export function opticalAxis(R) { return [R[6], R[7], R[8]]; }

// Rayo en el mundo para un píxel: origen (centro) y dirección unitaria.
export function pixelRay(K, R, t, u, v) {
  const [x, y] = pixelToNormalized(K, u, v);
  const d = v3.normalize(mat3TVec(R, [x, y, 1]));
  return { o: cameraCenter(R, t), d };
}

// Pose de una cámara situada en `eye` mirando a `target` (convención OpenCV).
export function lookAtPose(eye, target, up = [0, 0, 1]) {
  const z = v3.normalize(v3.sub(target, eye));
  let x = v3.cross(z, up);
  if (v3.norm(x) < 1e-9) x = v3.cross(z, [0, 1, 0]);
  x = v3.normalize(x);
  const y = v3.cross(z, x);
  const R = [x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]];
  const t = v3.scale(mat3Vec(R, eye), -1);
  return { R, t };
}

// Proyección con jacobiano analítico.
// Parámetros intrínsecos en el orden: [f, cx, cy, k1, k2, p1, p2, k3] con fx = fy = f
// (o [fx, fy, ...] si sepFocal). Pose con incremento local: R <- exp([dθ]x)·R, t <- t + dt.
// Devuelve { u, v, z, Ji (2 x nI), Jp (2 x 6), Jx (2 x 3) }.
export function projectJac(K, R, t, X, sepFocal = false) {
  const RX = mat3Vec(R, X);
  const Xc = RX[0] + t[0], Yc = RX[1] + t[1], Zc = RX[2] + t[2];
  const iz = 1 / Zc;
  const x = Xc * iz, y = Yc * iz;
  const r2 = x * x + y * y, r4 = r2 * r2, r6 = r4 * r2;
  const L = 1 + K.k1 * r2 + K.k2 * r4 + K.k3 * r6;
  const xd = x * L + 2 * K.p1 * x * y + K.p2 * (r2 + 2 * x * x);
  const yd = y * L + K.p1 * (r2 + 2 * y * y) + 2 * K.p2 * x * y;
  const u = K.fx * xd + K.cx, v = K.fy * yd + K.cy;

  const dL = K.k1 + 2 * K.k2 * r2 + 3 * K.k3 * r4; // dL/d(r2)
  const dxd_dx = L + 2 * x * x * dL + 2 * K.p1 * y + 6 * K.p2 * x;
  const dxd_dy = 2 * x * y * dL + 2 * K.p1 * x + 2 * K.p2 * y;
  const dyd_dx = 2 * x * y * dL + 2 * K.p1 * x + 2 * K.p2 * y;
  const dyd_dy = L + 2 * y * y * dL + 6 * K.p1 * y + 2 * K.p2 * x;
  // d(x,y)/dXc
  const dx_dX = [iz, 0, -x * iz], dy_dX = [0, iz, -y * iz];
  const du_dXc = [0, 0, 0], dv_dXc = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    du_dXc[k] = K.fx * (dxd_dx * dx_dX[k] + dxd_dy * dy_dX[k]);
    dv_dXc[k] = K.fy * (dyd_dx * dx_dX[k] + dyd_dy * dy_dX[k]);
  }
  // Pose: dXc/dθ = -[RX]x, dXc/dt = I
  const a = RX;
  // -[a]x = [[0, a2, -a1], [-a2, 0, a0], [a1, -a0, 0]]
  const negSkew = [0, a[2], -a[1], -a[2], 0, a[0], a[1], -a[0], 0];
  const Jp = new Float64Array(12);
  for (let j = 0; j < 3; j++) {
    Jp[j] = du_dXc[0] * negSkew[j] + du_dXc[1] * negSkew[3 + j] + du_dXc[2] * negSkew[6 + j];
    Jp[6 + j] = dv_dXc[0] * negSkew[j] + dv_dXc[1] * negSkew[3 + j] + dv_dXc[2] * negSkew[6 + j];
    Jp[3 + j] = du_dXc[j];
    Jp[9 + j] = dv_dXc[j];
  }
  // Punto del mundo: dXc/dX = R
  const Jx = new Float64Array(6);
  for (let j = 0; j < 3; j++) {
    Jx[j] = du_dXc[0] * R[j] + du_dXc[1] * R[3 + j] + du_dXc[2] * R[6 + j];
    Jx[3 + j] = dv_dXc[0] * R[j] + dv_dXc[1] * R[3 + j] + dv_dXc[2] * R[6 + j];
  }
  // Intrínsecos
  let Ji;
  if (sepFocal) {
    Ji = new Float64Array(18);
    Ji[0] = xd; Ji[1] = 0; Ji[2] = 1; Ji[3] = 0;
    Ji[9] = 0; Ji[10] = yd; Ji[11] = 0; Ji[12] = 1;
    fillDist(Ji, 4, 13);
  } else {
    Ji = new Float64Array(16);
    Ji[0] = xd; Ji[1] = 1; Ji[2] = 0;
    Ji[8] = yd; Ji[9] = 0; Ji[10] = 1;
    fillDist(Ji, 3, 11);
  }
  function fillDist(J, ou, ov) {
    J[ou] = K.fx * x * r2; J[ov] = K.fy * y * r2; // k1
    J[ou + 1] = K.fx * x * r4; J[ov + 1] = K.fy * y * r4; // k2
    J[ou + 2] = K.fx * 2 * x * y; J[ov + 2] = K.fy * (r2 + 2 * y * y); // p1
    J[ou + 3] = K.fx * (r2 + 2 * x * x); J[ov + 3] = K.fy * 2 * x * y; // p2
    J[ou + 4] = K.fx * x * r6; J[ov + 4] = K.fy * y * r6; // k3
  }
  return { u, v, z: Zc, Ji, Jp, Jx };
}

// Matriz de proyección ideal 3x4 (sin distorsión): P = K [R | t]
export function projectionMatrix(K, R, t) {
  const Km = [K.fx, 0, K.cx, 0, K.fy, K.cy, 0, 0, 1];
  const P = new Float64Array(12);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) P[i * 4 + j] = Km[i * 3] * R[j] + Km[i * 3 + 1] * R[3 + j] + Km[i * 3 + 2] * R[6 + j];
    P[i * 4 + 3] = Km[i * 3] * t[0] + Km[i * 3 + 1] * t[1] + Km[i * 3 + 2] * t[2];
  }
  return P;
}

// Ángulo (grados) entre dos rayos que observan el punto X desde dos centros.
export function triangulationAngle(c1, c2, X) {
  const a = v3.normalize(v3.sub(c1, X)), b = v3.normalize(v3.sub(c2, X));
  return Math.acos(Math.max(-1, Math.min(1, v3.dot(a, b)))) * 180 / Math.PI;
}

// Focal (px) estimada a partir de EXIF (focal equivalente a 35 mm).
export function focalFromExif(exif, width, height) {
  if (!exif) return null;
  if (exif.focal35 > 0) {
    const diag35 = Math.hypot(36, 24);
    return exif.focal35 / diag35 * Math.hypot(width, height);
  }
  if (exif.focalMM > 0 && exif.focalPlaneXRes > 0) {
    // FocalPlaneXResolution en píxeles por unidad (normalmente pulgadas)
    const unitMM = exif.focalPlaneUnit === 3 ? 10 : (exif.focalPlaneUnit === 4 ? 1 : 25.4);
    const pxPerMM = exif.focalPlaneXRes / unitMM;
    const f = exif.focalMM * pxPerMM;
    // Validar contra el ancho real de imagen (EXIF a veces está en otra resolución)
    if (exif.pixelXDim > 0 && exif.pixelXDim !== width) return f * width / exif.pixelXDim;
    return f;
  }
  return null;
}
