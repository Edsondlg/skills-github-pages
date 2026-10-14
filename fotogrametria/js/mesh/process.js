// Post-proceso de mallas: limpieza de componentes pequeñas, relleno de grietas, suavizado de Taubin,
// normales y estadísticas.
import { boundaryLoops } from '../analysis/features.js';
import { eigSym } from '../core/linalg.js';

// Componentes conexas por vértices compartidos (unión-búsqueda).
export function components(nVerts, indices) {
  const parent = new Int32Array(nVerts);
  for (let i = 0; i < nVerts; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let f = 0; f < indices.length; f += 3) {
    const a = find(indices[f]), b = find(indices[f + 1]), c = find(indices[f + 2]);
    if (a !== b) parent[b] = a;
    const a2 = find(a), c2 = find(c);
    if (a2 !== c2) parent[c2] = a2;
  }
  const comp = new Int32Array(nVerts);
  for (let i = 0; i < nVerts; i++) comp[i] = find(i);
  return comp;
}

// Elimina componentes con menos de minFrac de los triángulos de la mayor (o menos de minTris).
export function removeSmallComponents(mesh, { minFrac = 0.01, minTris = 50 } = {}) {
  const { positions, indices } = mesh;
  const nV = positions.length / 3;
  const comp = components(nV, indices);
  const triCount = new Map();
  for (let f = 0; f < indices.length; f += 3) { const c = comp[indices[f]]; triCount.set(c, (triCount.get(c) || 0) + 1); }
  let maxT = 0;
  for (const v of triCount.values()) maxT = Math.max(maxT, v);
  const keepComp = new Set();
  for (const [c, n] of triCount) if (n >= Math.max(minTris, minFrac * maxT)) keepComp.add(c);
  return filterTriangles(mesh, (f) => keepComp.has(comp[indices[f]]));
}

// Conserva los triángulos que cumplen pred(f) y compacta vértices y atributos por vértice.
export function filterTriangles(mesh, pred) {
  const { positions, indices } = mesh;
  const nV = positions.length / 3;
  const remap = new Int32Array(nV).fill(-1);
  const newIdx = [];
  let nNew = 0;
  for (let f = 0; f < indices.length; f += 3) {
    if (!pred(f)) continue;
    for (let k = 0; k < 3; k++) {
      const v = indices[f + k];
      if (remap[v] < 0) remap[v] = nNew++;
      newIdx.push(remap[v]);
    }
  }
  const out = { indices: new Uint32Array(newIdx) };
  for (const [key, arr] of Object.entries(mesh)) {
    if (key === 'indices' || !arr || !arr.length || typeof arr === 'string') continue;
    const per = arr.length / nV;
    if (!Number.isInteger(per)) continue;
    const na = new arr.constructor(nNew * per);
    for (let v = 0; v < nV; v++) {
      const r = remap[v];
      if (r < 0) continue;
      for (let k = 0; k < per; k++) na[r * per + k] = arr[v * per + k];
    }
    out[key] = na;
  }
  return out;
}

function neighbors(nV, indices) {
  const sets = Array.from({ length: nV }, () => []);
  for (let f = 0; f < indices.length; f += 3) {
    const a = indices[f], b = indices[f + 1], c = indices[f + 2];
    sets[a].push(b, c); sets[b].push(a, c); sets[c].push(a, b);
  }
  // CSR con vecinos únicos
  const start = new Int32Array(nV + 1);
  const lists = [];
  for (let i = 0; i < nV; i++) {
    const u = Array.from(new Set(sets[i]));
    start[i + 1] = start[i] + u.length;
    lists.push(u);
  }
  const adj = new Int32Array(start[nV]);
  for (let i = 0; i < nV; i++) adj.set(lists[i], start[i]);
  return { start, adj };
}

// Suavizado de Taubin (preserva volumen). Los vértices de borde se mantienen fijos.
export function taubinSmooth(positions, indices, { iterations = 3, lambda = 0.5, mu = -0.53 } = {}) {
  const nV = positions.length / 3;
  const { start, adj } = neighbors(nV, indices);
  const border = boundaryVertices(nV, indices);
  const tmp = new Float32Array(positions.length);
  const step = (fac) => {
    for (let i = 0; i < nV; i++) {
      const s = start[i], e = start[i + 1];
      if (e === s || border[i]) { tmp[3 * i] = positions[3 * i]; tmp[3 * i + 1] = positions[3 * i + 1]; tmp[3 * i + 2] = positions[3 * i + 2]; continue; }
      let x = 0, y = 0, z = 0;
      for (let k = s; k < e; k++) { const j = adj[k]; x += positions[3 * j]; y += positions[3 * j + 1]; z += positions[3 * j + 2]; }
      const n = e - s;
      tmp[3 * i] = positions[3 * i] + fac * (x / n - positions[3 * i]);
      tmp[3 * i + 1] = positions[3 * i + 1] + fac * (y / n - positions[3 * i + 1]);
      tmp[3 * i + 2] = positions[3 * i + 2] + fac * (z / n - positions[3 * i + 2]);
    }
    positions.set(tmp);
  };
  for (let it = 0; it < iterations; it++) { step(lambda); step(mu); }
  return positions;
}

export function boundaryVertices(nV, indices) {
  const edges = new Map();
  const key = (a, b) => a < b ? a * 4294967296 + b : b * 4294967296 + a;
  for (let f = 0; f < indices.length; f += 3) {
    for (let k = 0; k < 3; k++) {
      const a = indices[f + k], b = indices[f + (k + 1) % 3];
      const kk = key(a, b);
      edges.set(kk, (edges.get(kk) || 0) + 1);
    }
  }
  const border = new Uint8Array(nV);
  for (const [kk, n] of edges) {
    if (n === 1) { border[Math.floor(kk / 4294967296)] = 1; border[kk % 4294967296] = 1; }
  }
  return border;
}

export function vertexNormals(positions, indices) {
  const n = new Float32Array(positions.length);
  for (let f = 0; f < indices.length; f += 3) {
    const a = indices[f] * 3, b = indices[f + 1] * 3, c = indices[f + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { n[i] += nx; n[i + 1] += ny; n[i + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

export function meshStats(positions, indices) {
  let area = 0, vol = 0;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], positions[i + k]); max[k] = Math.max(max[k], positions[i + k]); }
  }
  for (let f = 0; f < indices.length; f += 3) {
    const a = indices[f] * 3, b = indices[f + 1] * 3, c = indices[f + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    area += 0.5 * Math.hypot(nx, ny, nz);
    vol += (positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1])
      - positions[a + 1] * (positions[b] * positions[c + 2] - positions[b + 2] * positions[c])
      + positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c])) / 6;
  }
  const border = boundaryVertices(positions.length / 3, indices);
  let nb = 0; for (const b of border) nb += b;
  return { vertices: positions.length / 3, triangles: indices.length / 3, area, volume: Math.abs(vol), closed: nb === 0, borderVertices: nb, bbox: { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] } };
}

// Área proyectada sobre el plano XY (huella sobre la mesa) por rasterizado de triángulos.
export function projectedArea(positions, indices, cell = 0.25) {
  const st = meshStats(positions, indices);
  const { min, max } = st.bbox;
  const nx = Math.ceil((max[0] - min[0]) / cell) + 1, ny = Math.ceil((max[1] - min[1]) / cell) + 1;
  if (nx * ny > 64e6) return null;
  const grid = new Uint8Array(nx * ny);
  for (let f = 0; f < indices.length; f += 3) {
    const p = [indices[f], indices[f + 1], indices[f + 2]].map(i => [(positions[3 * i] - min[0]) / cell, (positions[3 * i + 1] - min[1]) / cell]);
    const x0 = Math.max(0, Math.floor(Math.min(p[0][0], p[1][0], p[2][0]))), x1 = Math.min(nx - 1, Math.ceil(Math.max(p[0][0], p[1][0], p[2][0])));
    const y0 = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1]))), y1 = Math.min(ny - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
    const area2 = (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[2][0] - p[0][0]) * (p[1][1] - p[0][1]);
    if (Math.abs(area2) < 1e-12) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((p[1][0] - px) * (p[2][1] - py) - (p[2][0] - px) * (p[1][1] - py)) / area2;
      const w1 = ((p[2][0] - px) * (p[0][1] - py) - (p[0][0] - px) * (p[2][1] - py)) / area2;
      const w2 = 1 - w0 - w1;
      if (w0 >= 0 && w1 >= 0 && w2 >= 0) grid[y * nx + x] = 1;
    }
  }
  let n = 0; for (const g of grid) n += g;
  return n * cell * cell;
}

// Rellena grietas y huecos pequeños de la reconstrucción (no los barrenos reales): lazos de borde
// estrechos (ancho < maxWidth) o de perímetro corto, triangulados en abanico desde su centroide.
export function fillSmallHoles(mesh, { maxWidth = 2.5, maxPerimeter = 7, maxLength = 60 } = {}) {
  const P = mesh.positions, I = mesh.indices;
  const nV = P.length / 3;
  const loops = boundaryLoops(nV, I);
  if (loops.length < 2) return { mesh, filled: 0 };
  const per = loops.map(l => { let s = 0; for (let i = 0; i < l.length; i++) { const a = l[i], b = l[(i + 1) % l.length]; s += Math.hypot(P[3 * a] - P[3 * b], P[3 * a + 1] - P[3 * b + 1], P[3 * a + 2] - P[3 * b + 2]); } return s; });
  const maxPer = Math.max(...per);
  const newP = [], newIdx = [], extra = {};
  for (const key of Object.keys(mesh)) if (key !== 'positions' && key !== 'indices' && mesh[key] && mesh[key].length && Number.isInteger(mesh[key].length / nV)) extra[key] = [];
  let filled = 0, nNew = nV;
  loops.forEach((l, li) => {
    if (per[li] === maxPer || per[li] > 3 * maxLength) return;
    const n = l.length;
    const c = [0, 0, 0];
    for (const v of l) { c[0] += P[3 * v] / n; c[1] += P[3 * v + 1] / n; c[2] += P[3 * v + 2] / n; }
    const C = new Float64Array(9);
    for (const v of l) { const d = [P[3 * v] - c[0], P[3 * v + 1] - c[1], P[3 * v + 2] - c[2]]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a * 3 + b] += d[a] * d[b] / n; }
    const { values } = eigSym(C, 3);
    const length = 4 * Math.sqrt(Math.max(0, values[2])), width = 4 * Math.sqrt(Math.max(0, values[1]));
    const narrow = width < maxWidth && length < maxLength;
    if (!(narrow || per[li] < maxPerimeter)) return;
    // vértice central con atributos promediados
    newP.push(...c);
    for (const [key, arr] of Object.entries(extra)) {
      const src = mesh[key], k = src.length / nV;
      for (let q = 0; q < k; q++) { let s = 0; for (const v of l) s += src[v * k + q]; arr.push(s / n); }
    }
    const ci = nNew++;
    for (let i = 0; i < n; i++) newIdx.push(l[(i + 1) % n], l[i], ci);
    filled++;
  });
  if (!filled) return { mesh, filled: 0 };
  const out = { positions: new Float32Array(P.length + newP.length), indices: new Uint32Array(I.length + newIdx.length) };
  out.positions.set(P); out.positions.set(newP, P.length);
  out.indices.set(I); out.indices.set(newIdx, I.length);
  for (const [key, arr] of Object.entries(extra)) {
    const src = mesh[key];
    const a = new src.constructor(src.length + arr.length);
    a.set(src); a.set(arr.map(x => (src instanceof Uint8Array ? Math.round(x) : x)), src.length);
    out[key] = a;
  }
  return { mesh: out, filled };
}
