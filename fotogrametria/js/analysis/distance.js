// Distancia punto–malla (con signo) acelerada con una rejilla uniforme de triángulos.

// Punto más cercano de p al triángulo (a, b, c) — Ericson, "Real-Time Collision Detection".
export function closestOnTriangle(px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz, out) {
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  const acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  if (d1 <= 0 && d2 <= 0) { out[0] = ax; out[1] = ay; out[2] = az; return; }
  const bpx = px - bx, bpy = py - by, bpz = pz - bz;
  const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3) { out[0] = bx; out[1] = by; out[2] = bz; return; }
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); out[0] = ax + v * abx; out[1] = ay + v * aby; out[2] = az + v * abz; return; }
  const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
  const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6) { out[0] = cx; out[1] = cy; out[2] = cz; return; }
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); out[0] = ax + w * acx; out[1] = ay + w * acy; out[2] = az + w * acz; return; }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    out[0] = bx + w * (cx - bx); out[1] = by + w * (cy - by); out[2] = bz + w * (cz - bz); return;
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom, w = vc * denom;
  out[0] = ax + abx * v + acx * w; out[1] = ay + aby * v + acy * w; out[2] = az + abz * v + acz * w;
}

export class TriangleGrid {
  // positions: Float32Array (x,y,z...), indices: Uint32Array o null (triángulos consecutivos)
  constructor(positions, indices = null, cell = null) {
    this.P = positions;
    const nT = indices ? indices.length / 3 : positions.length / 9;
    this.I = indices || Uint32Array.from({ length: nT * 3 }, (_, i) => i);
    this.nT = nT;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], positions[i + k]); max[k] = Math.max(max[k], positions[i + k]); }
    this.min = min; this.max = max;
    const ext = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    if (!cell) {
      // ~2 triángulos por celda en promedio sobre la superficie
      let area = 0;
      for (let t = 0; t < nT; t++) area += this.triArea(t);
      cell = Math.max(0.25, Math.sqrt(area / Math.max(1, nT)) * 2.5);
      const maxCells = 4e6;
      while ((ext[0] / cell + 1) * (ext[1] / cell + 1) * (ext[2] / cell + 1) > maxCells) cell *= 1.25;
    }
    this.cell = cell;
    this.nx = Math.max(1, Math.ceil(ext[0] / cell) + 1);
    this.ny = Math.max(1, Math.ceil(ext[1] / cell) + 1);
    this.nz = Math.max(1, Math.ceil(ext[2] / cell) + 1);
    const counts = new Uint32Array(this.nx * this.ny * this.nz + 1);
    const ranges = [];
    for (let t = 0; t < nT; t++) {
      const r = this.triCells(t);
      ranges.push(r);
      for (let z = r[2]; z <= r[5]; z++) for (let y = r[1]; y <= r[4]; y++) for (let x = r[0]; x <= r[3]; x++) counts[(z * this.ny + y) * this.nx + x + 1]++;
    }
    for (let i = 1; i < counts.length; i++) counts[i] += counts[i - 1];
    this.start = counts;
    const fill = Uint32Array.from(counts);
    this.items = new Uint32Array(counts[counts.length - 1]);
    for (let t = 0; t < nT; t++) {
      const r = ranges[t];
      for (let z = r[2]; z <= r[5]; z++) for (let y = r[1]; y <= r[4]; y++) for (let x = r[0]; x <= r[3]; x++) this.items[fill[(z * this.ny + y) * this.nx + x]++] = t;
    }
    // normales de triángulo
    this.N = new Float32Array(nT * 3);
    for (let t = 0; t < nT; t++) {
      const [a, b, c] = this.tri(t);
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      this.N[3 * t] = nx / l; this.N[3 * t + 1] = ny / l; this.N[3 * t + 2] = nz / l;
    }
    this.stamp = new Uint32Array(nT);
    this.stampId = 0;
  }
  tri(t) {
    const P = this.P, I = this.I;
    const a = 3 * I[3 * t], b = 3 * I[3 * t + 1], c = 3 * I[3 * t + 2];
    return [[P[a], P[a + 1], P[a + 2]], [P[b], P[b + 1], P[b + 2]], [P[c], P[c + 1], P[c + 2]]];
  }
  triArea(t) {
    const [a, b, c] = this.tri(t);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    return 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
  }
  cellOf(p, k) { return Math.max(0, Math.min([this.nx, this.ny, this.nz][k] - 1, Math.floor((p - this.min[k]) / this.cell))); }
  triCells(t) {
    const [a, b, c] = this.tri(t);
    const r = [];
    for (let k = 0; k < 3; k++) r.push(this.cellOf(Math.min(a[k], b[k], c[k]), k));
    for (let k = 0; k < 3; k++) r.push(this.cellOf(Math.max(a[k], b[k], c[k]), k));
    return r;
  }
  // Punto más cercano dentro de maxDist. Devuelve { d (con signo), dist, x, y, z, tri } o null.
  closest(px, py, pz, maxDist = Infinity) {
    const out = [0, 0, 0];
    let best = Infinity, bt = -1, bx = 0, by = 0, bz = 0;
    const cx = Math.floor((px - this.min[0]) / this.cell), cy = Math.floor((py - this.min[1]) / this.cell), cz = Math.floor((pz - this.min[2]) / this.cell);
    this.stampId++;
    if (this.stampId === 0xFFFFFFFF) { this.stamp.fill(0); this.stampId = 1; }
    const maxR = Math.ceil(Math.min(maxDist, 1e9) / this.cell) + 1;
    const lim = Math.max(this.nx, this.ny, this.nz) + 1;
    for (let r = 0; r <= Math.min(maxR, lim); r++) {
      // si la mejor distancia ya es menor que la distancia mínima a la capa r, terminar
      if (best < (r - 1) * this.cell) break;
      for (let z = cz - r; z <= cz + r; z++) {
        if (z < 0 || z >= this.nz) continue;
        for (let y = cy - r; y <= cy + r; y++) {
          if (y < 0 || y >= this.ny) continue;
          for (let x = cx - r; x <= cx + r; x++) {
            if (x < 0 || x >= this.nx) continue;
            if (Math.max(Math.abs(x - cx), Math.abs(y - cy), Math.abs(z - cz)) !== r) continue;
            const ci = (z * this.ny + y) * this.nx + x;
            for (let k = this.start[ci]; k < this.start[ci + 1]; k++) {
              const t = this.items[k];
              if (this.stamp[t] === this.stampId) continue;
              this.stamp[t] = this.stampId;
              const P = this.P, I = this.I;
              const a = 3 * I[3 * t], b = 3 * I[3 * t + 1], c = 3 * I[3 * t + 2];
              closestOnTriangle(px, py, pz, P[a], P[a + 1], P[a + 2], P[b], P[b + 1], P[b + 2], P[c], P[c + 1], P[c + 2], out);
              const d = (out[0] - px) ** 2 + (out[1] - py) ** 2 + (out[2] - pz) ** 2;
              if (d < best) { best = d; bt = t; bx = out[0]; by = out[1]; bz = out[2]; }
            }
          }
        }
      }
      if (bt >= 0 && Math.sqrt(best) <= r * this.cell) break;
    }
    if (bt < 0) return null;
    const dist = Math.sqrt(best);
    if (dist > maxDist) return null;
    const N = this.N;
    const s = (px - bx) * N[3 * bt] + (py - by) * N[3 * bt + 1] + (pz - bz) * N[3 * bt + 2];
    return { dist, d: s >= 0 ? dist : -dist, x: bx, y: by, z: bz, tri: bt };
  }
}

// Distancias (sin signo) de un conjunto de puntos a la malla.
export function pointsToMesh(points, grid, maxDist = 50) {
  const n = points.length / 3;
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = grid.closest(points[3 * i], points[3 * i + 1], points[3 * i + 2], maxDist);
    d[i] = r ? r.dist : maxDist;
  }
  return d;
}

// Puntos muestreados uniformemente sobre una malla (para completitud).
export function samplePoints(positions, indices, spacing, rand = Math.random) {
  const pts = [], tris = [];
  const nT = indices.length / 3;
  for (let t = 0; t < nT; t++) {
    const a = 3 * indices[3 * t], b = 3 * indices[3 * t + 1], c = 3 * indices[3 * t + 2];
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const area = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
    let n = area / (spacing * spacing);
    let k = Math.floor(n) + (rand() < n - Math.floor(n) ? 1 : 0);
    for (let i = 0; i < k; i++) {
      let r1 = rand(), r2 = rand();
      if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
      pts.push(positions[a] + r1 * ux + r2 * vx, positions[a + 1] + r1 * uy + r2 * vy, positions[a + 2] + r1 * uz + r2 * vz);
      tris.push(t);
    }
  }
  return { points: new Float32Array(pts), tris: new Uint32Array(tris) };
}
