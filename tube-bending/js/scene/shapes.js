// Geometry helpers shared by machine.js and tools.js.
import * as THREE from 'three';

function signedArea2(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/**
 * Sweeps a planar cross-section along +X.
 * edges: array of polylines of [z, y] points; points inside one polyline get smooth normals, joints between
 * polylines are sharp (the last point of an edge should equal the first point of the next one).
 * xs: increasing slice positions. clampX(z, y, x) → x lets callers carve the ends (e.g. wiper tip).
 */
export function sweepSection(edges, xs, { clampX = null, uvScale = 0.01 } = {}) {
  // Orientation: make the polygon CCW in (z, y) so the side triangles face outward.
  let poly = [];
  for (const e of edges) for (let i = 0; i < e.length - 1; i++) poly.push(e[i]);
  if (signedArea2(poly) < 0) {
    edges = edges.slice().reverse().map((e) => e.slice().reverse());
    poly = [];
    for (const e of edges) for (let i = 0; i < e.length - 1; i++) poly.push(e[i]);
  }
  const pos = [], uv = [], idx = [];
  const X = (z, y, x) => (clampX ? clampX(z, y, x) : x);
  let vAcc = 0;
  for (const e of edges) {
    const base = pos.length / 3;
    const cum = [0];
    for (let i = 1; i < e.length; i++) cum.push(cum[i - 1] + Math.hypot(e[i][0] - e[i - 1][0], e[i][1] - e[i - 1][1]));
    for (let s = 0; s < xs.length; s++) {
      for (let i = 0; i < e.length; i++) {
        const [z, y] = e[i];
        pos.push(X(z, y, xs[s]), y, z);
        uv.push(xs[s] * uvScale, (vAcc + cum[i]) * uvScale);
      }
    }
    vAcc += cum[cum.length - 1];
    const n = e.length;
    for (let s = 0; s < xs.length - 1; s++) {
      for (let i = 0; i < n - 1; i++) {
        const a = base + s * n + i, b = base + (s + 1) * n + i, c = base + (s + 1) * n + i + 1, d = base + s * n + i + 1;
        idx.push(a, b, c, a, c, d);
      }
    }
  }
  // Caps.
  const contour = poly.map(([z, y]) => new THREE.Vector2(z, y));
  const tris = THREE.ShapeUtils.triangulateShape(contour.slice(), []);
  for (const [cap, x] of [[0, xs[0]], [1, xs[xs.length - 1]]]) {
    const base = pos.length / 3;
    for (const [z, y] of poly) { pos.push(X(z, y, x), y, z); uv.push(z * uvScale, y * uvScale); }
    for (const t of tris) {
      const p = poly[t[0]], q = poly[t[1]], r = poly[t[2]];
      const ccw = ((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) > 0; // CCW in (z,y) → normal −X
      const wantNegX = cap === 0;
      if (ccw === wantNegX) idx.push(base + t[0], base + t[1], base + t[2]);
      else idx.push(base + t[0], base + t[2], base + t[1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Arc polyline in (z, y): centre (cz, cy), radius r, angles a0→a1 (rad, measured from +z toward +y). */
export function arcPts(cz, cy, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    pts.push([cz + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * Section of a grooved block: rectangle z ∈ [z0, z1], y ∈ [y0, y1] with a half-round groove of radius gr
 * centred at (zc, yc) cut into the face z = zFace (zFace = z0 → groove opens toward −z, i.e. the tube is on −z).
 */
export function groovedBlockEdges({ z0, z1, y0, y1, yc, zc, gr, face, n = 20 }) {
  const ga = Math.min(gr, (y1 - y0) / 2 - 0.5);
  if (face === 'min') {
    // Face at z0 with groove; groove centre zc (≤ z0 typically, depth reaches zc + gr).
    const dz = z0 - zc; // distance from groove centre to the face plane
    const half = Math.sqrt(Math.max(0, ga * ga - dz * dz));
    const a = Math.atan2(half, dz);
    return [
      [[z0, y0], [z1, y0]],
      [[z1, y0], [z1, y1]],
      [[z1, y1], [z0, y1]],
      [[z0, y1], [z0, yc + half]],
      arcPts(zc, yc, ga, a, -a, n),
      [[z0, yc - half], [z0, y0]],
    ].filter((e) => e.length > 1 && !(e.length === 2 && e[0][0] === e[1][0] && e[0][1] === e[1][1]));
  }
  // Face at z1 with groove opening toward +z.
  const dz = zc - z1;
  const half = Math.sqrt(Math.max(0, ga * ga - dz * dz));
  const a = Math.atan2(half, -dz);
  return [
    [[z0, y0], [z1, y0]],
    [[z1, y0], [z1, yc - half]],
    arcPts(zc, yc, ga, 2 * Math.PI - a, a, n),
    [[z1, yc + half], [z1, y1]],
    [[z1, y1], [z0, y1]],
    [[z0, y1], [z0, y0]],
  ].filter((e) => e.length > 1 && !(e.length === 2 && e[0][0] === e[1][0] && e[0][1] === e[1][1]));
}

/** Box with all 12 edges chamfered, centred at the origin. */
export function chamferBox(sx, sy, sz, c) {
  c = Math.min(c, sx / 2 - 0.01, sy / 2 - 0.01, sz / 2 - 0.01);
  const hx = sx / 2, hy = sy / 2;
  const s = new THREE.Shape();
  s.moveTo(-hx + c, -hy); s.lineTo(hx - c, -hy); s.lineTo(hx, -hy + c); s.lineTo(hx, hy - c);
  s.lineTo(hx - c, hy); s.lineTo(-hx + c, hy); s.lineTo(-hx, hy - c); s.lineTo(-hx, -hy + c); s.closePath();
  // Inner shape shrunk by c so the bevel restores the outer size on the caps.
  const si = new THREE.Shape();
  const ix = hx - c, iy = hy - c, ic = Math.max(0.001, c * 0.4);
  si.moveTo(-ix + ic, -iy); si.lineTo(ix - ic, -iy); si.lineTo(ix, -iy + ic); si.lineTo(ix, iy - ic);
  si.lineTo(ix - ic, iy); si.lineTo(-ix + ic, iy); si.lineTo(-ix, iy - ic); si.lineTo(-ix, -iy + ic); si.closePath();
  const g = new THREE.ExtrudeGeometry(si, { depth: Math.max(0.01, sz - 2 * c), bevelEnabled: true, bevelThickness: c, bevelSize: c, bevelSegments: 1, curveSegments: 1 });
  g.translate(0, 0, -(sz - 2 * c) / 2);
  g.computeVertexNormals();
  return g;
}

/** Convex hull (monotone chain) of [x, z] points. */
export function hull2(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** Vertical slab from an outline in the XZ plane ([x, z] points), spanning y ∈ [y0, y0 + h]. */
export function slabXZ(points, y0, h, bevel = 0) {
  const s = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(s, {
    depth: h - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0 + bevel, 0);
  g.computeVertexNormals();
  return g;
}

export function circlePts(cx, cz, r, n = 32) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
  return out;
}

/** Corrugated hose following a curve. */
export function corrugatedHose(curve, radius, { segments = 160, radial = 12, pitch = null } = {}) {
  const g = new THREE.TubeGeometry(curve, segments, radius, radial, false);
  const len = curve.getLength();
  const p = pitch || radius * 0.9;
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const s = uv.getX(i) * len;
    const k = 0.12 * radius * Math.cos(2 * Math.PI * s / p);
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * k, pos.getY(i) + nor.getY(i) * k, pos.getZ(i) + nor.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

/** Cylinder along X between x0 and x1 at (y, z). */
export function cylX(r, x0, x1, y = 0, z = 0, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), seg);
  g.rotateZ(Math.PI / 2);
  g.translate((x0 + x1) / 2, y, z);
  return g;
}

/** Cylinder between two 3D points. */
export function cylBetween(a, b, r, seg = 16) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  g.applyQuaternion(q);
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return g;
}

export function boxAt(sx, sy, sz, cx, cy, cz) {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  g.translate(cx, cy, cz);
  return g;
}

export function mesh(geometry, material, { cast = true, receive = true, name } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = cast; m.receiveShadow = receive;
  if (name) m.name = name;
  return m;
}
