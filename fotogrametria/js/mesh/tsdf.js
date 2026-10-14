// Fusión volumétrica TSDF dispersa (bloques de 8³ vóxeles) y extracción de malla con Surface Nets.
// Sin dependencias del DOM: se usa en un Web Worker y en pruebas de Node.

const B = 8, B3 = 512;
const OFF = 1 << 15;
function bkey(bx, by, bz) { return (bx + OFF) + (by + OFF) * 65536 + (bz + OFF) * 4294967296; }

export class SparseTSDF {
  constructor({ voxel = 0.3, trunc = 3, truncBack = 3, region = null, zCut = -Infinity } = {}) {
    this.v = voxel;
    this.tau = trunc * voxel;          // truncamiento delante de la superficie (mm)
    this.tauB = truncBack * voxel;     // detrás de la superficie (para láminas delgadas)
    this.region = region;              // { min:[x,y,z], max:[x,y,z] }
    this.zCut = zCut;
    this.map = new Map();
    this.keys = [];                    // claves de bloque (para recorrer)
    this.coords = [];                  // [bx,by,bz]
    this.cap = 0;
    this.n = 0;
    this.grow(256);
    this.tableZ = [];
  }
  grow(minBlocks) {
    let cap = Math.max(this.cap * 2, minBlocks);
    const re = (Arr, old, per) => { const a = new Arr(cap * per); if (old) a.set(old); return a; };
    this.F = re(Float32Array, this.F, B3);
    this.W = re(Float32Array, this.W, B3);
    this.C = re(Float32Array, this.C, B3 * 3);
    this.CW = re(Float32Array, this.CW, B3);
    this.N = re(Uint8Array, this.N, B3);
    this.cap = cap;
  }
  block(bx, by, bz, create) {
    const k = bkey(bx, by, bz);
    let id = this.map.get(k);
    if (id === undefined && create) {
      if (this.n >= this.cap) this.grow(this.n + 1);
      id = this.n++;
      this.map.set(k, id);
      this.keys.push(k);
      this.coords.push([bx, by, bz]);
      this.F.fill(1, id * B3, id * B3 + B3);
    }
    return id;
  }
  inRegion(x, y, z) {
    if (z < this.zCut) return false;
    const r = this.region;
    if (!r) return true;
    return x >= r.min[0] && x <= r.max[0] && y >= r.min[1] && y <= r.max[1] && z >= r.min[2] && z <= r.max[2];
  }

  // Integra un mapa de profundidad. dm: { W, H, K:{fx,fy,cx,cy}, R, t, depth, normal, cost, color? }
  integrate(dm, { costThr = 0.35, maxAngle = 80, minRegion = 60, discont = 0.012, sub = 1 } = {}) {
    const { W, H, K, R, t, depth, normal, cost, color } = dm;
    const n = W * H;
    const valid = new Uint8Array(n);
    const cosMax = Math.cos(maxAngle * Math.PI / 180);
    const Xw = new Float32Array(3 * n);
    let nValid = 0;
    const tableZ = this.tableZ;
    for (let i = 0; i < n; i++) {
      const d = depth[i];
      if (!(d > 0) || cost[i] > costThr) continue;
      const x = i % W, y = (i / W) | 0;
      const rx = (x - K.cx) / K.fx, ry = (y - K.cy) / K.fy;
      const rl = Math.hypot(rx, ry, 1);
      const cosA = -(normal[3 * i] * rx + normal[3 * i + 1] * ry + normal[3 * i + 2]) / rl;
      if (cosA < cosMax) continue;
      const cx = rx * d - t[0], cy = ry * d - t[1], cz = d - t[2];
      const wx = R[0] * cx + R[3] * cy + R[6] * cz, wy = R[1] * cx + R[4] * cy + R[7] * cz, wz = R[2] * cx + R[5] * cy + R[8] * cz;
      Xw[3 * i] = wx; Xw[3 * i + 1] = wy; Xw[3 * i + 2] = wz;
      if (Math.abs(wz) < 1.0 && (i % 7) === 0 && tableZ.length < 400000) tableZ.push(wz);
      if (!this.inRegion(wx, wy, wz)) continue;
      valid[i] = 1; nValid++;
    }
    // filtro de discontinuidades y regiones pequeñas (componentes conexas por profundidad)
    const lab = new Int32Array(n).fill(-1);
    const stack = new Int32Array(n);
    let kept = 0;
    for (let s = 0; s < n; s++) {
      if (!valid[s] || lab[s] >= 0) continue;
      let sp = 0, size = 0;
      stack[sp++] = s; lab[s] = s;
      const members = [];
      while (sp) {
        const i = stack[--sp];
        members.push(i); size++;
        const x = i % W, y = (i / W) | 0;
        const d = depth[i];
        for (let q = 0; q < 4; q++) {
          const nx = x + (q === 0 ? 1 : q === 1 ? -1 : 0), ny = y + (q === 2 ? 1 : q === 3 ? -1 : 0);
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const j = ny * W + nx;
          if (!valid[j] || lab[j] >= 0) continue;
          if (Math.abs(depth[j] - d) > discont * d) continue;
          lab[j] = s; stack[sp++] = j;
        }
      }
      if (size < minRegion) for (const i of members) valid[i] = 0; else kept += size;
    }
    if (!kept) return { nValid: 0 };
    // asignación de bloques alrededor de los puntos observados
    const bs = B * this.v, iv = 1 / bs;
    for (let i = 0; i < n; i += sub) {
      if (!valid[i]) continue;
      const x = Xw[3 * i], y = Xw[3 * i + 1], z = Xw[3 * i + 2];
      const r = this.tau;
      for (let dz = -1; dz <= 1; dz += 2) for (let dy = -1; dy <= 1; dy += 2) for (let dx = -1; dx <= 1; dx += 2) {
        this.block(Math.floor((x + dx * r) * iv), Math.floor((y + dy * r) * iv), Math.floor((z + dz * r) * iv), true);
      }
    }
    // actualización por proyección de vóxeles
    const v = this.v, tau = this.tau, tauB = this.tauB;
    for (let b = 0; b < this.n; b++) {
      const [bx, by, bz] = this.coords[b];
      // prueba rápida: centro del bloque delante de la cámara y dentro de la imagen (con margen)
      const ccx = (bx + 0.5) * bs, ccy = (by + 0.5) * bs, ccz = (bz + 0.5) * bs;
      const zc = R[6] * ccx + R[7] * ccy + R[8] * ccz + t[2];
      if (zc <= 1) continue;
      const uc = K.fx * (R[0] * ccx + R[1] * ccy + R[2] * ccz + t[0]) / zc + K.cx;
      const vc = K.fy * (R[3] * ccx + R[4] * ccy + R[5] * ccz + t[1]) / zc + K.cy;
      const mrg = K.fx * bs / zc;
      if (uc < -mrg || vc < -mrg || uc > W + mrg || vc > H + mrg) continue;
      const base = b * B3;
      for (let k = 0; k < B; k++) {
        const z = (bz * B + k + 0.5) * v;
        for (let j = 0; j < B; j++) {
          const y = (by * B + j + 0.5) * v;
          for (let i = 0; i < B; i++) {
            const x = (bx * B + i + 0.5) * v;
            const X = R[0] * x + R[1] * y + R[2] * z + t[0];
            const Y = R[3] * x + R[4] * y + R[5] * z + t[1];
            const Z = R[6] * x + R[7] * y + R[8] * z + t[2];
            if (Z <= 1) continue;
            const u = Math.round(K.fx * X / Z + K.cx), vv = Math.round(K.fy * Y / Z + K.cy);
            if (u < 0 || vv < 0 || u >= W || vv >= H) continue;
            const pi = vv * W + u;
            if (!valid[pi]) continue;
            const dm0 = depth[pi];
            const sdf = dm0 - Z;
            if (sdf < -tauB || sdf > tau * 4) continue;
            const f = Math.max(-1, Math.min(1, sdf / tau));
            const c = cost[pi];
            const rx = (u - K.cx) / K.fx, ry = (vv - K.cy) / K.fy;
            const cosA = -(normal[3 * pi] * rx + normal[3 * pi + 1] * ry + normal[3 * pi + 2]) / Math.hypot(rx, ry, 1);
            const w = Math.max(0.05, 1 - c / costThr) * Math.max(0.1, cosA);
            const id = base + (k * B + j) * B + i;
            const Wo = this.W[id];
            this.F[id] = (this.F[id] * Wo + f * w) / (Wo + w);
            this.W[id] = Wo + w;
            if (Math.abs(sdf) < tau) {
              if (this.N[id] < 255) this.N[id]++;
              if (color) {
                const ci = 4 * pi;
                this.C[3 * id] += color[ci] * w; this.C[3 * id + 1] += color[ci + 1] * w; this.C[3 * id + 2] += color[ci + 2] * w;
                this.CW[id] += w;
              }
            }
          }
        }
      }
    }
    return { nValid: kept };
  }

  // Valor de un vóxel por índice global (o null si no existe).
  idx(gx, gy, gz) {
    const bx = Math.floor(gx / B), by = Math.floor(gy / B), bz = Math.floor(gz / B);
    const id = this.map.get(bkey(bx, by, bz));
    if (id === undefined) return -1;
    return id * B3 + ((gz - bz * B) * B + (gy - by * B)) * B + (gx - bx * B);
  }

  // Extracción de malla (Surface Nets con proyección a la isosuperficie).
  extractMesh({ minWeight = 0.6, minViews = 2 } = {}) {
    const v = this.v;
    const F = this.F, Wt = this.W, Nn = this.N;
    const ok = (id) => id >= 0 && Wt[id] >= minWeight && Nn[id] >= minViews;
    const VI = new Int32Array(this.n * B3).fill(-2); // vértice de la celda cuyo vértice mínimo es el vóxel
    const pos = [], col = [], conf = [];
    const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const CX = [0, 1, 0, 1, 0, 1, 0, 1], CY = [0, 0, 1, 1, 0, 0, 1, 1], CZ = [0, 0, 0, 0, 1, 1, 1, 1];
    const ids = new Int32Array(8), vals = new Float32Array(8);
    const self = this;
    function cellVertex(gx, gy, gz) {
      const id0 = self.idx(gx, gy, gz);
      if (id0 < 0) return -1;
      if (VI[id0] !== -2) return VI[id0];
      let neg = 0, posn = 0;
      for (let c = 0; c < 8; c++) {
        const id = c === 0 ? id0 : self.idx(gx + CX[c], gy + CY[c], gz + CZ[c]);
        if (!ok(id)) { VI[id0] = -1; return -1; }
        ids[c] = id; vals[c] = F[id];
        if (vals[c] < 0) neg++; else posn++;
      }
      if (!neg || !posn) { VI[id0] = -1; return -1; }
      let sx = 0, sy = 0, sz = 0, cnt = 0;
      for (const [a, b2] of EDGES) {
        const fa = vals[a], fb = vals[b2];
        if ((fa < 0) === (fb < 0)) continue;
        const tt = fa / (fa - fb);
        sx += CX[a] + (CX[b2] - CX[a]) * tt; sy += CY[a] + (CY[b2] - CY[a]) * tt; sz += CZ[a] + (CZ[b2] - CZ[a]) * tt;
        cnt++;
      }
      let lx = sx / cnt, ly = sy / cnt, lz = sz / cnt;
      // pasos de Newton hacia F = 0 con interpolación trilineal
      for (let it = 0; it < 2; it++) {
        const f = tri(vals, lx, ly, lz);
        const g = triGrad(vals, lx, ly, lz);
        const g2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
        if (g2 < 1e-12) break;
        lx = clamp01(lx - f * g[0] / g2); ly = clamp01(ly - f * g[1] / g2); lz = clamp01(lz - f * g[2] / g2);
      }
      const vi = pos.length / 3;
      pos.push((gx + lx + 0.5) * v, (gy + ly + 0.5) * v, (gz + lz + 0.5) * v);
      let r = 0, gg = 0, bb = 0, cw = 0, nv = 0;
      for (let c = 0; c < 8; c++) {
        const id = ids[c];
        const w = self.CW[id];
        if (w > 0) { r += self.C[3 * id]; gg += self.C[3 * id + 1]; bb += self.C[3 * id + 2]; cw += w; }
        if (Nn[id] > nv) nv = Nn[id];
      }
      if (cw > 0) col.push(r / cw, gg / cw, bb / cw); else col.push(160, 160, 160);
      conf.push(nv);
      VI[id0] = vi;
      return vi;
    }
    const idx = [];
    const q = [0, 0, 0, 0];
    for (let b = 0; b < this.n; b++) {
      const [bx, by, bz] = this.coords[b];
      for (let k = 0; k < B; k++) for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) {
        const id0 = b * B3 + (k * B + j) * B + i;
        if (!ok(id0)) continue;
        const gx = bx * B + i, gy = by * B + j, gz = bz * B + k;
        const f0 = F[id0];
        for (let ax = 0; ax < 3; ax++) {
          let id1;
          if (ax === 0) id1 = i < B - 1 ? id0 + 1 : this.idx(gx + 1, gy, gz);
          else if (ax === 1) id1 = j < B - 1 ? id0 + B : this.idx(gx, gy + 1, gz);
          else id1 = k < B - 1 ? id0 + B * B : this.idx(gx, gy, gz + 1);
          if (!ok(id1)) continue;
          if ((f0 < 0) === (F[id1] < 0)) continue;
          if (ax === 0) { q[0] = cellVertex(gx, gy - 1, gz - 1); q[1] = cellVertex(gx, gy, gz - 1); q[2] = cellVertex(gx, gy, gz); q[3] = cellVertex(gx, gy - 1, gz); }
          else if (ax === 1) { q[0] = cellVertex(gx - 1, gy, gz - 1); q[1] = cellVertex(gx - 1, gy, gz); q[2] = cellVertex(gx, gy, gz); q[3] = cellVertex(gx, gy, gz - 1); }
          else { q[0] = cellVertex(gx - 1, gy - 1, gz); q[1] = cellVertex(gx, gy - 1, gz); q[2] = cellVertex(gx, gy, gz); q[3] = cellVertex(gx - 1, gy, gz); }
          if (q[0] < 0 || q[1] < 0 || q[2] < 0 || q[3] < 0) continue;
          // orientación: la normal apunta hacia F > 0 (exterior)
          if (f0 < 0) idx.push(q[0], q[1], q[2], q[0], q[2], q[3]);
          else idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
        }
      }
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col), conf: new Float32Array(conf), indices: new Uint32Array(idx) };
  }

  stats() {
    let nObs = 0;
    for (let i = 0; i < this.n * B3; i++) if (this.N[i] > 0) nObs++;
    return { blocks: this.n, voxels: this.n * B3, observed: nObs, memMB: (this.cap * B3 * 25) / 1048576 };
  }
}

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function tri(c, x, y, z) {
  const c00 = c[0] * (1 - x) + c[1] * x, c10 = c[2] * (1 - x) + c[3] * x;
  const c01 = c[4] * (1 - x) + c[5] * x, c11 = c[6] * (1 - x) + c[7] * x;
  return (c00 * (1 - y) + c10 * y) * (1 - z) + (c01 * (1 - y) + c11 * y) * z;
}
function triGrad(c, x, y, z) {
  const dx = ((c[1] - c[0]) * (1 - y) + (c[3] - c[2]) * y) * (1 - z) + ((c[5] - c[4]) * (1 - y) + (c[7] - c[6]) * y) * z;
  const dy = ((c[2] - c[0]) * (1 - x) + (c[3] - c[1]) * x) * (1 - z) + ((c[6] - c[4]) * (1 - x) + (c[7] - c[5]) * x) * z;
  const c0 = (c[0] * (1 - x) + c[1] * x) * (1 - y) + (c[2] * (1 - x) + c[3] * x) * y;
  const c1 = (c[4] * (1 - x) + c[5] * x) * (1 - y) + (c[6] * (1 - x) + c[7] * x) * y;
  return [dx, dy, c1 - c0];
}
