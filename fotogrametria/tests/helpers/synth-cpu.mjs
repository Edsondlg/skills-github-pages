// Renderizador sintético por CPU de vistas del tapete (para pruebas con verdad conocida).
import { undistortNormalized, projectPoint, makeIntrinsics, lookAtPose } from '../../js/core/camera.js';
import { mat3TVec, rng, gaussRand } from '../../js/core/linalg.js';
import { gaussianBlur } from '../../js/core/image.js';

// raster: { data, w, h, pxPerMM } del papel; board: tapete (u0, v0); escala física opcional.
export function renderBoardView(raster, board, K, R, t, o = {}) {
  const { supersample = 3, blurSigma = 0.6, noise = 1.5, seed = 1, table = 95, light = true } = o;
  const w = K.width, h = K.height;
  const W1 = w + 1;
  // rejilla de coordenadas normalizadas sin distorsión en las esquinas de los píxeles
  const gx = new Float64Array(W1 * (h + 1)), gy = new Float64Array(W1 * (h + 1));
  for (let j = 0; j <= h; j++) {
    for (let i = 0; i <= w; i++) {
      const [x, y] = undistortNormalized(K, (i - 0.5 - K.cx) / K.fx, (j - 0.5 - K.cy) / K.fy);
      gx[j * W1 + i] = x; gy[j * W1 + i] = y;
    }
  }
  const C = mat3TVec(R, t).map(v => -v);
  const sx = board.scaleX || 1, sy = board.scaleY || 1;
  const img = new Float32Array(w * h);
  const n = supersample;
  const rd = raster.data, rw = raster.w, rh = raster.h, ppm = raster.pxPerMM;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const a = j * W1 + i;
      const x00 = gx[a], x10 = gx[a + 1], x01 = gx[a + W1], x11 = gx[a + W1 + 1];
      const y00 = gy[a], y10 = gy[a + 1], y01 = gy[a + W1], y11 = gy[a + W1 + 1];
      let acc = 0;
      for (let b = 0; b < n; b++) {
        const fy = (b + 0.5) / n;
        for (let c = 0; c < n; c++) {
          const fx = (c + 0.5) / n;
          const x = (x00 * (1 - fx) + x10 * fx) * (1 - fy) + (x01 * (1 - fx) + x11 * fx) * fy;
          const y = (y00 * (1 - fx) + y10 * fx) * (1 - fy) + (y01 * (1 - fx) + y11 * fx) * fy;
          // dirección del rayo en el mundo
          const dx = R[0] * x + R[3] * y + R[6], dy = R[1] * x + R[4] * y + R[7], dz = R[2] * x + R[5] * y + R[8];
          const lam = -C[2] / dz;
          let val = table;
          if (lam > 0) {
            const X = C[0] + lam * dx, Y = C[1] + lam * dy;
            const u = X / sx + board.u0, v = board.v0 - Y / sy;
            const rx = u * ppm - 0.5, ry = v * ppm - 0.5;
            if (rx >= 0 && ry >= 0 && rx < rw - 1 && ry < rh - 1) {
              const ix = Math.floor(rx), iy = Math.floor(ry), ffx = rx - ix, ffy = ry - iy;
              const p = iy * rw + ix;
              val = (rd[p] * (1 - ffx) + rd[p + 1] * ffx) * (1 - ffy) + (rd[p + rw] * (1 - ffx) + rd[p + rw + 1] * ffx) * ffy;
            }
          }
          acc += val;
        }
      }
      let v = acc / (n * n);
      if (light) {
        const ux = (i - w / 2) / w, uy = (j - h / 2) / h;
        v *= 0.92 - 0.25 * (ux * ux + uy * uy) + 0.08 * ux;
      }
      img[j * w + i] = v;
    }
  }
  const bl = blurSigma > 0 ? gaussianBlur(img, w, h, blurSigma) : img;
  const rand = rng(seed);
  const out = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) out[k] = Math.max(0, Math.min(255, Math.round(bl[k] + (noise > 0 ? gaussRand(rand) * noise : 0))));
  return out;
}

export function groundTruthCorners(board, K, R, t) {
  const gt = new Map();
  for (const m of board.markers) {
    const pts = m.corners.map(X => projectPoint(K, R, t, X));
    gt.set(m.id, pts);
  }
  return gt;
}

export function defaultCamera(w = 1600, h = 1200) {
  return makeIntrinsics({ width: w, height: h, f: 1450, cx: w / 2 - 0.5 + 12.3, cy: h / 2 - 0.5 - 7.9, k1: -0.11, k2: 0.09, p1: 0.0007, p2: -0.0004, k3: -0.02 });
}

// Poses en anillos alrededor del tapete, mirando a un punto cercano al centro.
export function ringPoses(count, { radius = 380, elevDeg = [35, 55, 72], target = [0, 0, 10], seed = 3 } = {}) {
  const rand = rng(seed);
  const poses = [];
  for (let k = 0; k < count; k++) {
    const el = elevDeg[k % elevDeg.length] * Math.PI / 180;
    const az = (k / count) * 2 * Math.PI + rand() * 0.3;
    const r = radius * (0.9 + 0.2 * rand());
    const eye = [r * Math.cos(el) * Math.cos(az), r * Math.cos(el) * Math.sin(az), r * Math.sin(el)];
    const tgt = [target[0] + (rand() - 0.5) * 40, target[1] + (rand() - 0.5) * 30, target[2]];
    const up = [Math.cos(az + Math.PI + (rand() - 0.5) * 0.6), Math.sin(az + Math.PI + (rand() - 0.5) * 0.6), 0];
    poses.push({ eye, ...lookAtPose(eye, tgt, up) });
  }
  return poses;
}
