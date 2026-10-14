// Detección de barrenos y aberturas a partir de los bordes de la malla: lazos de borde
// cerrados -> plano (PCA) -> ajuste de círculo (Kasa + Gauss-Newton) -> diámetro y centro.
import { eigSym } from '../core/linalg.js';

// Lazos de borde (aristas usadas por un solo triángulo), como listas de índices de vértice.
// Se recorren aristas (no vértices): un vértice compartido por dos lazos («moño») no corta el contorno.
// minLength: lazos más cortos se ignoran (para medir barrenos hacen falta varios puntos).
export function boundaryLoops(nV, indices, { minLength = 8 } = {}) {
  const edgeCount = new Map();
  const key = (a, b) => a < b ? a * 4294967296 + b : b * 4294967296 + a;
  for (let f = 0; f < indices.length; f += 3) {
    for (let k = 0; k < 3; k++) {
      const a = indices[f + k], b = indices[f + (k + 1) % 3];
      const kk = key(a, b);
      edgeCount.set(kk, (edgeCount.get(kk) || 0) + 1);
    }
  }
  // aristas de borde orientadas (según el triángulo) y las que salen de cada vértice
  const from = [], to = [], out = new Map();
  for (let f = 0; f < indices.length; f += 3) {
    for (let k = 0; k < 3; k++) {
      const a = indices[f + k], b = indices[f + (k + 1) % 3];
      if (edgeCount.get(key(a, b)) !== 1) continue;
      if (!out.has(a)) out.set(a, []);
      out.get(a).push(from.length);
      from.push(a); to.push(b);
    }
  }
  const used = new Uint8Array(from.length);
  const loops = [];
  for (let e0 = 0; e0 < from.length; e0++) {
    if (used[e0]) continue;
    const start = from[e0], loop = [];
    let e = e0, closed = false;
    for (let guard = 0; guard <= from.length; guard++) {
      used[e] = 1; loop.push(from[e]);
      const v = to[e];
      if (v === start) { closed = true; break; }
      const nxt = (out.get(v) || []).find(id => !used[id]);
      if (nxt === undefined) break;
      e = nxt;
    }
    if (closed && loop.length >= minLength) loops.push(loop);
  }
  return loops;
}

function fitCircle2D(u, v) {
  // Kasa: x² + y² + D x + E y + F = 0
  const n = u.length;
  let Sxx = 0, Sxy = 0, Syy = 0, Sx = 0, Sy = 0, Sxz = 0, Syz = 0, Sz = 0;
  for (let i = 0; i < n; i++) {
    const x = u[i], y = v[i], z = x * x + y * y;
    Sxx += x * x; Sxy += x * y; Syy += y * y; Sx += x; Sy += y; Sxz += x * z; Syz += y * z; Sz += z;
  }
  const A = [Sxx, Sxy, Sx, Sxy, Syy, Sy, Sx, Sy, n];
  const bb = [-Sxz, -Syz, -Sz];
  const det = A[0] * (A[4] * A[8] - A[5] * A[7]) - A[1] * (A[3] * A[8] - A[5] * A[6]) + A[2] * (A[3] * A[7] - A[4] * A[6]);
  if (Math.abs(det) < 1e-12) return null;
  const solve = (col) => { const M = A.slice(); for (let r = 0; r < 3; r++) M[r * 3 + col] = bb[r]; return (M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6])) / det; };
  const D = solve(0), E = solve(1), F = solve(2);
  let cx = -D / 2, cy = -E / 2;
  let r = Math.sqrt(Math.max(0, cx * cx + cy * cy - F));
  // refinamiento geométrico (Gauss-Newton sobre la distancia al círculo)
  for (let it = 0; it < 10; it++) {
    let J00 = 0, J01 = 0, J02 = 0, J11 = 0, J12 = 0, J22 = 0, g0 = 0, g1 = 0, g2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = u[i] - cx, dy = v[i] - cy, d = Math.hypot(dx, dy) || 1e-9;
      const res = d - r;
      const a = -dx / d, b = -dy / d, c = -1;
      J00 += a * a; J01 += a * b; J02 += a * c; J11 += b * b; J12 += b * c; J22 += c * c;
      g0 -= a * res; g1 -= b * res; g2 -= c * res;
    }
    const M = [J00, J01, J02, J01, J11, J12, J02, J12, J22];
    const dt = M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6]);
    if (Math.abs(dt) < 1e-15) break;
    const sol = [0, 1, 2].map(col => { const Q = M.slice(); const g = [g0, g1, g2]; for (let rr = 0; rr < 3; rr++) Q[rr * 3 + col] = g[rr]; return (Q[0] * (Q[4] * Q[8] - Q[5] * Q[7]) - Q[1] * (Q[3] * Q[8] - Q[5] * Q[6]) + Q[2] * (Q[3] * Q[7] - Q[4] * Q[6])) / dt; });
    cx += sol[0]; cy += sol[1]; r += sol[2];
    if (Math.hypot(...sol) < 1e-9) break;
  }
  let s2 = 0, mx = 0;
  for (let i = 0; i < n; i++) { const e = Math.hypot(u[i] - cx, v[i] - cy) - r; s2 += e * e; mx = Math.max(mx, Math.abs(e)); }
  return { cx, cy, r, rms: Math.sqrt(s2 / n), max: mx };
}

// Detecta barrenos (lazos circulares) y otras aberturas en la malla.
// thickness: espesor de lámina (mm). Si alrededor del lazo hay una cara superior más alta (barreno
// en lámina apoyada, cuyo lazo queda al pie de la pared), la medida se toma en un corte a media
// pared: la fusión redondea la arista superior hacia fuera y la inferior hacia dentro, y el 50 %
// del escalón conserva la posición real del borde.
export function detectHoles(positions, indices, { minR = 1.0, maxR = 60, circTol = 0.08, minWidth = 3, thickness = null } = {}) {
  const loops = boundaryLoops(positions.length / 3, indices);
  if (!loops.length) return [];
  // contorno exterior: lazos que abarcan buena parte de la pieza
  const bb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { bb[k] = Math.min(bb[k], positions[i + k]); bb[k + 3] = Math.max(bb[k + 3], positions[i + k]); }
  const diag = Math.hypot(bb[3] - bb[0], bb[4] - bb[1], bb[5] - bb[2]);
  const out = [];
  loops.forEach((l, li) => {
    const n = l.length;
    const lb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const a = l[i], b = l[(i + 1) % n];
      perimeter += Math.hypot(positions[3 * a] - positions[3 * b], positions[3 * a + 1] - positions[3 * b + 1], positions[3 * a + 2] - positions[3 * b + 2]);
      for (let k = 0; k < 3; k++) { lb[k] = Math.min(lb[k], positions[3 * a + k]); lb[k + 3] = Math.max(lb[k + 3], positions[3 * a + k]); }
    }
    if (Math.hypot(lb[3] - lb[0], lb[4] - lb[1], lb[5] - lb[2]) > 0.5 * diag) return;
    const c = [0, 0, 0];
    for (const v of l) { c[0] += positions[3 * v]; c[1] += positions[3 * v + 1]; c[2] += positions[3 * v + 2]; }
    c[0] /= n; c[1] /= n; c[2] /= n;
    const C = new Float64Array(9);
    for (const v of l) {
      const d = [positions[3 * v] - c[0], positions[3 * v + 1] - c[1], positions[3 * v + 2] - c[2]];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a * 3 + b] += d[a] * d[b] / n;
    }
    const { values, vectors } = eigSym(C, 3);
    const nrm = [vectors[0], vectors[3], vectors[6]]; // menor varianza = normal del plano
    const e1 = [vectors[2], vectors[5], vectors[8]];
    const e2 = [nrm[1] * e1[2] - nrm[2] * e1[1], nrm[2] * e1[0] - nrm[0] * e1[2], nrm[0] * e1[1] - nrm[1] * e1[0]];
    const planarity = Math.sqrt(Math.max(0, values[0]));
    const u = new Float64Array(n), w = new Float64Array(n);
    l.forEach((v, i) => {
      const d = [positions[3 * v] - c[0], positions[3 * v + 1] - c[1], positions[3 * v + 2] - c[2]];
      u[i] = d[0] * e1[0] + d[1] * e1[1] + d[2] * e1[2];
      w[i] = d[0] * e2[0] + d[1] * e2[1] + d[2] * e2[2];
    });
    const fit = fitCircle2D(u, w);
    const len1 = 4 * Math.sqrt(Math.max(0, values[2])), len2 = 4 * Math.sqrt(Math.max(0, values[1]));
    // cobertura angular alrededor del centro (un arco abierto no es un barreno)
    const maxGap = fit ? angularGap(u, w, fit.cx, fit.cy) : 360;
    const isCirc = fit && fit.r >= minR && fit.r <= maxR && fit.rms <= Math.max(circTol * fit.r, 0.25) && maxGap < 60 && len2 > 1.2 * fit.r;
    const isOpen = len2 > minWidth && len1 < 4 * maxR && planarity < 0.15 * len1;
    if (!isCirc && !isOpen) return;
    const item = { loop: li, n, perimeter, normal: nrm, planarity, section: null };
    const sec = wallSection(positions, indices, c, nrm, e1, e2, u, w, thickness);
    const toWorld = (pu, pw, h) => [0, 1, 2].map(k => c[k] + pu * e1[k] + pw * e2[k] + h * nrm[k]);
    if (isCirc) {
      const hole = { ...item, type: 'circular', center: toWorld(fit.cx, fit.cy, 0), diameter: 2 * fit.r, fitRms: fit.rms, fitMax: fit.max, edgeDiameter: 2 * fit.r, size: [2 * fit.r, 2 * fit.r] };
      const f2 = sec && sec.U.length >= 12 ? fitCircle2D(sec.U, sec.W) : null;
      if (f2 && f2.r > 0.5 * fit.r && f2.r < fit.r + 3 && angularGap(sec.U, sec.W, f2.cx, f2.cy) < 60 && f2.rms <= Math.max(0.1 * f2.r, 0.35)) {
        out.push(Object.assign(hole, { center: toWorld(f2.cx, f2.cy, sec.h), diameter: 2 * f2.r, fitRms: f2.rms, fitMax: f2.max, size: [2 * f2.r, 2 * f2.r], normal: sec.normal, section: sec.hs }));
        return;
      }
      // sin pared que lo confirme, sólo un borde muy redondo cuenta como barreno (si no, es un hueco)
      if (fit.rms <= Math.max(0.06 * fit.r, 0.15)) { out.push(hole); return; }
    }
    if (len2 > minWidth && len1 < 4 * maxR && planarity < 0.15 * len1) {
      const edge = extents2D(u, w);
      let ex = sec && sec.U.length >= 12 ? extents2D(sec.U, sec.W) : edge;
      // el corte debe rodear la abertura y quedar por fuera del pie, sin desbordarse
      if (ex !== edge && (angularGap(sec.U, sec.W, ex.mid[0], ex.mid[1]) > 60 || ex.size[0] < edge.size[0] - 0.5 || ex.size[1] < edge.size[1] - 0.5 || ex.size[0] > edge.size[0] + 6 || ex.size[1] > edge.size[1] + 6)) ex = edge;
      const used = ex !== edge;
      out.push({ ...item, type: 'abertura', center: toWorld(ex.mid[0], ex.mid[1], used ? sec.h : 0), size: ex.size, edgeSize: edge.size,
        normal: used ? sec.normal : nrm, section: used ? sec.hs : null });
    }
  });
  const rank = (o) => o.type === 'circular' ? 0 : o.section !== null ? 1 : 2;
  out.sort((a, b) => rank(a) - rank(b) || (b.diameter || b.size[0]) - (a.diameter || a.size[0]));
  return out;
}

function angularGap(u, w, cx, cy) {
  const ang = Array.from(u, (x, i) => Math.atan2(w[i] - cy, x - cx) * 180 / Math.PI).sort((a, b) => a - b);
  let gap = 360 - ang[ang.length - 1] + ang[0];
  for (let i = 1; i < ang.length; i++) gap = Math.max(gap, ang[i] - ang[i - 1]);
  return gap;
}

// Largo y ancho (extremos sobre los ejes principales) y punto medio, en coordenadas del lazo.
function extents2D(U, W) {
  const n = U.length;
  let mu = 0, mw = 0;
  for (let i = 0; i < n; i++) { mu += U[i] / n; mw += W[i] / n; }
  let suu = 0, suw = 0, sww = 0;
  for (let i = 0; i < n; i++) { const a = U[i] - mu, b = W[i] - mw; suu += a * a; suw += a * b; sww += b * b; }
  const th = 0.5 * Math.atan2(2 * suw, suu - sww), ca = Math.cos(th), sa = Math.sin(th);
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const a = ca * U[i] + sa * W[i], b = -sa * U[i] + ca * W[i];
    a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b);
  }
  const am = (a0 + a1) / 2, bm = (b0 + b1) / 2;
  const L = a1 - a0, Wd = b1 - b0;
  return { size: L >= Wd ? [L, Wd] : [Wd, L], mid: [ca * am - sa * bm, sa * am + ca * bm] };
}

// Distancia de (x, y) al polígono (px, py) y si está dentro.
function polyDist(px, py, x, y) {
  const n = px.length;
  let d2 = Infinity, inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const ax = px[j], ay = py[j], bx = px[i], by = py[i];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)) : 0;
    const ex = ax + t * dx - x, ey = ay + t * dy - y;
    d2 = Math.min(d2, ex * ex + ey * ey);
  }
  return { d: Math.sqrt(d2), inside };
}

// Corte de la pared de una abertura a media altura. Devuelve los puntos del corte (U, W) en el
// marco del lazo, o null si alrededor no hay una cara más alta (lámina vista por ambos lados o
// abertura ya medida en su arista).
function wallSection(positions, indices, c, n0, e1, e2, lu, lw, thickness) {
  const nV = positions.length / 3;
  let u0 = Infinity, u1 = -Infinity, w0 = Infinity, w1 = -Infinity;
  for (let i = 0; i < lu.length; i++) { u0 = Math.min(u0, lu[i]); u1 = Math.max(u1, lu[i]); w0 = Math.min(w0, lw[i]); w1 = Math.max(w1, lw[i]); }
  const reach = 6;
  const rel = new Float64Array(3 * nV).fill(NaN);
  const dist = new Float64Array(nV).fill(NaN);
  const ring = [];
  for (let v = 0; v < nV; v++) {
    const dx = positions[3 * v] - c[0], dy = positions[3 * v + 1] - c[1], dz = positions[3 * v + 2] - c[2];
    const h = dx * n0[0] + dy * n0[1] + dz * n0[2];
    if (Math.abs(h) > reach) continue;
    const pu = dx * e1[0] + dy * e1[1] + dz * e1[2], pw = dx * e2[0] + dy * e2[1] + dz * e2[2];
    if (pu < u0 - reach || pu > u1 + reach || pw < w0 - reach || pw > w1 + reach) continue;
    const { d, inside } = polyDist(lu, lw, pu, pw);
    if (d > reach) continue;
    rel[3 * v] = pu; rel[3 * v + 1] = pw; rel[3 * v + 2] = h;
    dist[v] = inside ? -d : d;
    if (!inside && d > 1.5 && d < 5) ring.push(h);
  }
  if (ring.length < 12) return null;
  ring.sort((a, b) => a - b);
  let hTop = ring[ring.length >> 1];
  const sgn = hTop < 0 ? -1 : 1;
  hTop *= sgn;
  const inR = Math.min(u1 - u0, w1 - w0) / 2;
  if (hTop < Math.max(0.3, 0.1 * inR)) return null;
  // la cara de alrededor debe ser una sola superficie paralela (no las dos caras de una pared)
  const iqr = ring[Math.floor(0.75 * (ring.length - 1))] - ring[Math.floor(0.25 * (ring.length - 1))];
  if (iqr > 0.25 * hTop + 0.15) return null;
  const t = thickness > 0 ? thickness : hTop;
  const hs = Math.min(0.85 * hTop, Math.max(0.15 * hTop, hTop - t / 2));
  // intersección de la malla con el plano h = hs cerca del lazo
  const U = [], W = [];
  for (let f = 0; f < indices.length; f += 3) {
    const a = indices[f], b = indices[f + 1], d = indices[f + 2];
    if (dist[a] !== dist[a] || dist[b] !== dist[b] || dist[d] !== dist[d]) continue;
    const tri = [a, b, d];
    for (let k = 0; k < 3; k++) {
      const p = tri[k], q = tri[(k + 1) % 3];
      const hp = sgn * rel[3 * p + 2] - hs, hq = sgn * rel[3 * q + 2] - hs;
      if ((hp < 0) === (hq < 0)) continue;
      const s = hp / (hp - hq);
      const dd = dist[p] + s * (dist[q] - dist[p]);
      if (dd < -Math.min(3, 0.5 * inR) || dd > 3) continue;
      U.push(rel[3 * p] + s * (rel[3 * q] - rel[3 * p]));
      W.push(rel[3 * p + 1] + s * (rel[3 * q + 1] - rel[3 * p + 1]));
    }
  }
  if (U.length < 12) return null;
  return { U: Float64Array.from(U), W: Float64Array.from(W), hs, h: sgn * hs, normal: n0.map(x => sgn * x) };
}
