// Geometry layer: vec3/mat4 helpers, TubeModel → LRA (bending program), LRA → centerline,
// XYZ intersection table and bend extrados angles. Pure ES module, no DOM, no three.js.
// Units: mm, degrees. Conventions: docs/INTERFACES.md §2–§3.

export const DEG = Math.PI / 180;

// ───────────────────────────── vec3 ─────────────────────────────
export const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const vScale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const vDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const vCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const vLength = (a) => Math.hypot(a[0], a[1], a[2]);
export const vDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export function vNormalize(a) {
  const l = vLength(a);
  return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
}
/** Rotate vector v about unit axis k by angle (rad), right-hand (Rodrigues). */
export function vRotate(v, k, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const kxv = vCross(k, v), kdv = vDot(k, v);
  return [
    v[0] * c + kxv[0] * s + k[0] * kdv * (1 - c),
    v[1] * c + kxv[1] * s + k[1] * kdv * (1 - c),
    v[2] * c + kxv[2] * s + k[2] * kdv * (1 - c),
  ];
}

// ───────────────────────────── mat4 ─────────────────────────────
// Float64Array(16), column-major like three.js: element (row r, col c) at index c·4 + r.

export function mat4Identity(out = new Float64Array(16)) {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}
export function mat4Copy(a, out = new Float64Array(16)) {
  for (let i = 0; i < 16; i++) out[i] = a[i];
  return out;
}
/** out = a·b (out may alias a or b). */
export function mat4Multiply(a, b, out = new Float64Array(16)) {
  const a00 = a[0], a10 = a[1], a20 = a[2], a30 = a[3];
  const a01 = a[4], a11 = a[5], a21 = a[6], a31 = a[7];
  const a02 = a[8], a12 = a[9], a22 = a[10], a32 = a[11];
  const a03 = a[12], a13 = a[13], a23 = a[14], a33 = a[15];
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    out[c * 4] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3;
    out[c * 4 + 1] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3;
    out[c * 4 + 2] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3;
    out[c * 4 + 3] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3;
  }
  return out;
}
export function mat4Translation(x, y, z, out = new Float64Array(16)) {
  mat4Identity(out);
  out[12] = x; out[13] = y; out[14] = z;
  return out;
}
/** Right-hand rotation about +X by angle (rad): y' = y·c − z·s, z' = y·s + z·c. */
export function mat4RotationX(angle, out = new Float64Array(16)) {
  const c = Math.cos(angle), s = Math.sin(angle);
  mat4Identity(out);
  out[5] = c; out[6] = s; out[9] = -s; out[10] = c;
  return out;
}
/** Right-hand rotation about +Y by angle (rad) (three.js rotation.y): x' = x·c + z·s, z' = −x·s + z·c. */
export function mat4RotationY(angle, out = new Float64Array(16)) {
  const c = Math.cos(angle), s = Math.sin(angle);
  mat4Identity(out);
  out[0] = c; out[2] = -s; out[8] = s; out[10] = c;
  return out;
}
/** Inverse of a rigid transform (rotation + translation). */
export function mat4InvertRigid(m, out = new Float64Array(16)) {
  const r00 = m[0], r10 = m[1], r20 = m[2], r01 = m[4], r11 = m[5], r21 = m[6], r02 = m[8], r12 = m[9], r22 = m[10];
  const tx = m[12], ty = m[13], tz = m[14];
  out[0] = r00; out[1] = r01; out[2] = r02; out[3] = 0;
  out[4] = r10; out[5] = r11; out[6] = r12; out[7] = 0;
  out[8] = r20; out[9] = r21; out[10] = r22; out[11] = 0;
  out[12] = -(r00 * tx + r10 * ty + r20 * tz);
  out[13] = -(r01 * tx + r11 * ty + r21 * tz);
  out[14] = -(r02 * tx + r12 * ty + r22 * tz);
  out[15] = 1;
  return out;
}
export function mat4TransformPoint(m, p) {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
}
export function mat4TransformDirection(m, d) {
  return [
    m[0] * d[0] + m[4] * d[1] + m[8] * d[2],
    m[1] * d[0] + m[5] * d[1] + m[9] * d[2],
    m[2] * d[0] + m[6] * d[1] + m[10] * d[2],
  ];
}
/** Bend-die rotation Rdie_ρ(ψ) = T(0,0,−ρ)·RotY(ψ)·T(0,0,ρ), ψ in rad. */
export function mat4DieRotation(rho, psi, out = new Float64Array(16)) {
  const c = Math.cos(psi), s = Math.sin(psi);
  mat4RotationY(psi, out);
  out[12] = rho * s;
  out[14] = rho * c - rho;
  return out;
}

// ───────────────────────────── angles ─────────────────────────────
/** Normalize degrees to (−180, 180]; values within 1e-7 of ±180 snap to 180, |x| < 1e-9 snaps to 0. */
export function normalizeDeg180(x) {
  let r = ((((x + 180) % 360) + 360) % 360) - 180;
  if (Math.abs(r + 180) < 1e-7 || Math.abs(r - 180) < 1e-7) r = 180;
  if (Math.abs(r) < 1e-9) r = 0;
  return r;
}
/** Normalize degrees to [0, 360). */
export function normalizeDeg360(x) {
  let r = ((x % 360) + 360) % 360;
  if (r >= 360 - 1e-9) r = 0;
  return r;
}

// ───────────────────────────── TubeModel → LRA ─────────────────────────────
function reverseSegment(seg) {
  if (seg.type === 'straight') {
    return { ...seg, p0: seg.p1, p1: seg.p0, dir: vScale(seg.dir, -1) };
  }
  // Travelling B → A: tangents swap and flip; the rotation axis flips.
  return { ...seg, p0: seg.p1, p1: seg.p0, tIn: vScale(seg.tOut, -1), tOut: vScale(seg.tIn, -1), normal: vScale(seg.normal, -1) };
}

/** Segments in bending order (front end first). */
function orderedSegments(tube, front) {
  if (front === 'B') return tube.segments.slice().reverse().map(reverseSegment);
  return tube.segments;
}

/**
 * Bending program from the tube geometry.
 *
 * Derivation (pinned by tests G1/G2/G5): at bend i the machine bends about +Y and the front leg
 * turns by +A_i about +Y, so in the travel direction (front → rear) the TubeModel axis n_i equals
 * −(machine +Y) and the world bend axis w_i = −n_i is the machine +Y at that moment. Machine +Y at
 * cumulative collet rotation C_i shows material angle −C_i (material angle φ is at machine angle
 * φ + C). The material frame (local X = −travel direction, local Y = material reference) is chosen
 * on the front straight so that C_0 = 0 (local Y = w_0) and is carried rigidly through each bend
 * (rotation by +A_i about n_i). At bend i, b = (w_i·Y, w_i·Z) = (cos C_i, −sin C_i), and
 * R_i = C_i − C_{i−1}.
 */
export function lraFromTube(tube, { front = 'A' } = {}) {
  const segs = orderedSegments(tube, front);
  const straights = segs.filter((s) => s.type === 'straight');
  const bendSegs = segs.filter((s) => s.type === 'bend');
  const bends = [];
  let X = null, Y = null, Z = null, Cprev = 0;
  for (let i = 0; i < bendSegs.length; i++) {
    const b = bendSegs[i];
    const n = vNormalize(b.normal);
    const w = vScale(n, -1);
    let C;
    if (i === 0) {
      X = vScale(vNormalize(b.tIn), -1);
      Y = vNormalize(vSub(w, vScale(X, vDot(w, X))));
      Z = vCross(X, Y);
      C = 0;
    } else {
      C = Math.atan2(-vDot(w, Z), vDot(w, Y)) / DEG;
    }
    bends.push({ L: straights[i].length, R: i === 0 ? 0 : normalizeDeg180(C - Cprev), A: b.angle, clr: b.clr });
    const a = b.angle * DEG;
    X = vRotate(X, n, a); Y = vRotate(Y, n, a); Z = vRotate(Z, n, a);
    Cprev = C;
  }
  return { front, bends, tail: straights[straights.length - 1].length };
}

/** Material angle (deg, [0,360)) of each bend's extrados: 90 − C_i, C_i = Σ_{j≤i} R_j. */
export function bendExtradosAngles(lra) {
  let C = 0;
  return lra.bends.map((b) => {
    C += b.R;
    return normalizeDeg360(90 - C);
  });
}

// ───────────────────────────── LRA → centerline ─────────────────────────────
/** Total centerline length of an LRA. */
export function lraLength(lra) {
  return lra.bends.reduce((acc, b) => acc + b.L + b.clr * b.A * DEG, 0) + lra.tail;
}

/**
 * Piecewise description of the formed centerline, built as a turtle walking from the front end
 * (s = 0) toward the rear, in an arbitrary world frame (the front straight starts at the origin
 * going −X, material reference +Y). Each bend replays the machine: in the machine frame of bend i
 * (rear tangent at the origin, rear orientation RotX(C_i)) the arc point at die angle ψ ∈ [0, A]
 * is (ρ·sinψ, 0, −ρ·(1 − cosψ)) with orientation RotY(ψ)·RotX(C_i); the front tangent is ψ = A.
 */
export function lraPieces(lra) {
  const pieces = [];
  let G = mat4Identity(); // material frame of the current straight (rotation only)
  let p = [0, 0, 0];
  let s = 0, C = 0;
  const line = (L) => {
    const d = [-G[0], -G[1], -G[2]];
    pieces.push({ type: 'line', s0: s, s1: s + L, p0: p, d });
    p = vAdd(p, vScale(d, L));
    s += L;
  };
  const tmp = new Float64Array(16), tmp2 = new Float64Array(16);
  for (const b of lra.bends) {
    C += b.R;
    line(b.L);
    const A = b.A * DEG, rho = b.clr;
    // W_R = G · (RotY(A)·RotX(C))^T
    mat4Multiply(mat4RotationY(A, tmp), mat4RotationX(C * DEG, tmp2), tmp);
    const WR = mat4Multiply(G, mat4InvertRigid(tmp, tmp2));
    const PA = [rho * Math.sin(A), 0, -rho * (1 - Math.cos(A))];
    const Wt = vSub(p, mat4TransformDirection(WR, PA));
    pieces.push({ type: 'arc', s0: s, s1: s + rho * A, WR, Wt, A, rho });
    G = mat4Multiply(WR, mat4RotationX(C * DEG, tmp));
    p = Wt;
    s += rho * A;
  }
  line(lra.tail);
  return pieces;
}

function piecePoint(pc, s) {
  if (pc.type === 'line') return vAdd(pc.p0, vScale(pc.d, s - pc.s0));
  const psi = pc.A - (s - pc.s0) / pc.rho;
  const P = [pc.rho * Math.sin(psi), 0, -pc.rho * (1 - Math.cos(psi))];
  return vAdd(pc.Wt, mat4TransformDirection(pc.WR, P));
}

/** Centerline points (front end → rear) at s = 0, step, 2·step, …, total (always included). */
export function centerlineFromLRA(lra, { step = 5 } = {}) {
  const pieces = lraPieces(lra);
  const total = pieces[pieces.length - 1].s1;
  const pts = [];
  let k = 0;
  const n = Math.max(1, Math.ceil(total / step - 1e-9));
  for (let i = 0; i <= n; i++) {
    const s = Math.min(i * step, total);
    while (k < pieces.length - 1 && s > pieces[k].s1) k++;
    pts.push(piecePoint(pieces[k], s));
  }
  return pts;
}

// ───────────────────────────── XYZ table ─────────────────────────────
/**
 * Intersection-point (virtual sharp) table, end A → end B: end A, one vertex per bend, end B.
 * A 180° bend has no finite intersection: its two tangent points are emitted instead
 * (kind 'tangent180'). Row: { x, y, z, clr, kind: 'end'|'vertex'|'tangent180', bend }.
 */
export function xyzTable(tube) {
  const rows = [];
  const row = (p, clr, kind, bend) => rows.push({ x: p[0], y: p[1], z: p[2], clr, kind, bend });
  const segs = tube.segments;
  row(segs[0].p0, 0, 'end', -1);
  let bi = 0;
  for (const seg of segs) {
    if (seg.type !== 'bend') continue;
    if (seg.angle >= 180 - 1e-6) {
      row(seg.p0, seg.clr, 'tangent180', bi);
      row(seg.p1, seg.clr, 'tangent180', bi);
    } else {
      const d = seg.clr * Math.tan((seg.angle * DEG) / 2);
      row(vAdd(seg.p0, vScale(vNormalize(seg.tIn), d)), seg.clr, 'vertex', bi);
    }
    bi++;
  }
  row(segs[segs.length - 1].p1, 0, 'end', -1);
  return rows;
}
