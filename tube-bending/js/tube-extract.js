// Bent-tube recognition from a parsed STEP B-rep: centerline (straights + bends), OD and wall profile.
// Pure logic: no DOM, no three.js. Output contract: docs/INTERFACES.md §1 (TubeModel).

import { parseStep, entityPart } from './step-parser.js';

const DEG = Math.PI / 180;

// ---------- vector helpers ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const dist = (a, b) => norm(sub(a, b));
const unit = (a) => { const n = norm(a); return n > 0 ? mul(a, 1 / n) : [0, 0, 0]; };
const neg = (a) => [-a[0], -a[1], -a[2]];
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
const angleBetween = (a, b) => Math.atan2(norm(cross(a, b)), dot(a, b));

function anyPerp(n) {
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return unit(cross(n, a));
}

// ---------- STEP topology access ----------
function surfaceKind(ent) {
  if (!ent) return 'other';
  const t = ent.type;
  if (t === 'CYLINDRICAL_SURFACE') return 'cylinder';
  if (t === 'TOROIDAL_SURFACE' || t === 'DEGENERATE_TOROIDAL_SURFACE') return 'torus';
  if (t === 'CONICAL_SURFACE') return 'cone';
  if (t === 'PLANE') return 'plane';
  if (t.startsWith('B_SPLINE_SURFACE') || t === 'BEZIER_SURFACE' || t === 'RATIONAL_B_SPLINE_SURFACE') return 'bspline';
  if (t === 'COMPLEX' && ent.parts.some((p) => p.type.startsWith('B_SPLINE_SURFACE'))) return 'bspline';
  return 'other';
}

function makeReader(parsed) {
  const E = parsed.entities;
  const ls = parsed.lengthScale || 1;
  const get = (r) => (r && typeof r === 'object' && 'ref' in r ? E.get(r.ref) : null);
  const point = (r) => {
    const e = get(r);
    const p = entityPart(e, 'CARTESIAN_POINT');
    if (!p) return null;
    const c = p.args[1];
    return [(c[0] || 0) * ls, (c[1] || 0) * ls, (c[2] || 0) * ls];
  };
  const direction = (r, dflt) => {
    const e = get(r);
    const p = entityPart(e, 'DIRECTION');
    if (!p) return dflt;
    const c = p.args[1];
    return unit([c[0] || 0, c[1] || 0, c[2] || 0]);
  };
  const placement = (r) => {
    const e = entityPart(get(r), 'AXIS2_PLACEMENT_3D');
    if (!e) return null;
    const loc = point(e.args[1]) || [0, 0, 0];
    const axis = direction(e.args[2], [0, 0, 1]);
    return { loc, axis };
  };
  const vertexPoint = (r) => {
    const e = entityPart(get(r), 'VERTEX_POINT');
    return e ? point(e.args[1]) : null;
  };
  // All vertex points on a face's boundaries (deduplicated by vertex id).
  const faceVertices = (face) => {
    const seen = new Set();
    const out = [];
    const addV = (r) => {
      if (!r || seen.has(r.ref)) return;
      seen.add(r.ref);
      const p = vertexPoint(r);
      if (p) out.push(p);
    };
    for (const b of face.args[1] || []) {
      const fb = get(b);
      if (!fb) continue;
      const loop = get(fb.args[1]);
      if (!loop) continue;
      if (loop.type === 'VERTEX_LOOP') { addV(loop.args[1]); continue; }
      const el = entityPart(loop, 'EDGE_LOOP');
      if (!el) continue;
      for (const oer of el.args[1] || []) {
        const oe = entityPart(get(oer), 'ORIENTED_EDGE');
        if (!oe) continue;
        const ec = entityPart(get(oe.args[3]), 'EDGE_CURVE');
        if (!ec) continue;
        addV(ec.args[1]);
        addV(ec.args[2]);
      }
    }
    return out;
  };
  return { E, ls, get, point, direction, placement, faceVertices };
}

// Group ADVANCED_FACEs by solid body.
function collectBodies(rd) {
  const { E, get } = rd;
  const shellFaces = (shellRef) => {
    const sh = get(shellRef);
    if (!sh) return [];
    const p = entityPart(sh, 'CLOSED_SHELL') || entityPart(sh, 'OPEN_SHELL') || sh;
    const list = Array.isArray(p.args[1]) ? p.args[1] : [];
    return list.map((r) => get(r)).filter((f) => f && entityPart(f, 'ADVANCED_FACE'));
  };
  const bodies = [];
  for (const e of E.values()) {
    if (e.type === 'MANIFOLD_SOLID_BREP') bodies.push(shellFaces(e.args[1]));
    else if (e.type === 'BREP_WITH_VOIDS') {
      const faces = shellFaces(e.args[1]);
      for (const v of e.args[2] || []) faces.push(...shellFaces(v));
      bodies.push(faces);
    } else if (e.type === 'SHELL_BASED_SURFACE_MODEL') {
      const faces = [];
      for (const s of e.args[1] || []) faces.push(...shellFaces(s));
      bodies.push(faces);
    }
  }
  const nonEmpty = bodies.filter((b) => b.length);
  if (nonEmpty.length) return nonEmpty.map((b) => b.map((f) => entityPart(f, 'ADVANCED_FACE')));
  const all = [];
  for (const e of E.values()) { const f = entityPart(e, 'ADVANCED_FACE'); if (f) all.push(f); }
  return all.length ? [all] : [];
}

// Describe each face of a body geometrically.
function describeFaces(rd, faces) {
  const out = [];
  for (const f of faces) {
    const surf = rd.get(f.args[2]);
    const kind = surfaceKind(surf);
    const d = { kind, verts: rd.faceVertices(f) };
    if (kind === 'cylinder' || kind === 'torus' || kind === 'cone') {
      const pl = rd.placement(surf.args[1]);
      if (!pl) { d.kind = 'other'; out.push(d); continue; }
      d.loc = pl.loc;
      d.axis = pl.axis;
      if (kind === 'cylinder') d.r = surf.args[2] * rd.ls;
      if (kind === 'torus') { d.R = surf.args[2] * rd.ls; d.r = surf.args[3] * rd.ls; }
      if (kind === 'cone') d.r = surf.args[2] * rd.ls;
    }
    out.push(d);
  }
  return out;
}

function axisExtent(face) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of face.verts) {
    const t = dot(sub(v, face.loc), face.axis);
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return [lo, hi];
}

function outerRadiusOf(descs) {
  const cyl = descs.filter((d) => d.kind === 'cylinder' && d.verts.length);
  if (!cyl.length) return null;
  const rmax = Math.max(...cyl.map((d) => d.r));
  const tol = 1e-4 * rmax;
  let wsum = 0;
  let rsum = 0;
  let area = 0;
  for (const d of cyl) {
    if (Math.abs(d.r - rmax) > tol) continue;
    const [lo, hi] = axisExtent(d);
    const w = Math.max(hi - lo, 1e-9);
    wsum += w;
    rsum += w * d.r;
    area += 2 * Math.PI * d.r * (hi - lo);
  }
  return { r: rsum / wsum, area };
}

// ---------- segment recognition ----------
function buildStraights(descs, rOut, tol) {
  const lines = [];
  for (const d of descs) {
    if (d.kind !== 'cylinder' || Math.abs(d.r - rOut) > tol || d.verts.length < 1) continue;
    let [lo, hi] = axisExtent(d);
    if (!(hi - lo > tol)) continue;
    let line = null;
    for (const L of lines) {
      if (norm(cross(L.axis, d.axis)) > Math.sin(0.05 * DEG)) continue;
      const w = sub(d.loc, L.loc);
      if (norm(sub(w, mul(L.axis, dot(w, L.axis)))) > tol) continue;
      line = L;
      break;
    }
    if (line) {
      // re-express the extent in the line's frame
      const s = dot(line.axis, d.axis) < 0 ? -1 : 1;
      const off = dot(sub(d.loc, line.loc), line.axis);
      const a = off + s * lo;
      const b = off + s * hi;
      line.ivals.push([Math.min(a, b), Math.max(a, b)]);
    } else {
      lines.push({ loc: d.loc, axis: d.axis, ivals: [[lo, hi]] });
    }
  }
  const segs = [];
  for (const L of lines) {
    L.ivals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const iv of L.ivals) {
      const last = merged[merged.length - 1];
      if (last && iv[0] <= last[1] + tol) last[1] = Math.max(last[1], iv[1]);
      else merged.push([iv[0], iv[1]]);
    }
    for (const [lo, hi] of merged) {
      segs.push({
        kind: 'straight',
        ends: [add(L.loc, mul(L.axis, lo)), add(L.loc, mul(L.axis, hi))],
        out: [neg(L.axis), L.axis.slice()],
      });
    }
  }
  return segs;
}

function buildTorusBends(descs, rOut, tol) {
  const groups = [];
  for (const d of descs) {
    if (d.kind !== 'torus' || Math.abs(d.r - rOut) > tol || !d.verts.length) continue;
    let g = null;
    for (const G of groups) {
      if (Math.abs(G.R - d.R) > tol || dist(G.loc, d.loc) > tol) continue;
      if (norm(cross(G.axis, d.axis)) > Math.sin(0.05 * DEG)) continue;
      g = G;
      break;
    }
    if (!g) { g = { loc: d.loc, axis: d.axis, R: d.R, verts: [] }; groups.push(g); }
    g.verts.push(...d.verts);
  }
  const segs = [];
  for (const g of groups) {
    const N = g.axis;
    const e1 = anyPerp(N);
    const e2 = cross(N, e1);
    const angs = [];
    for (const v of g.verts) {
      const w = sub(v, g.loc);
      angs.push(Math.atan2(dot(w, e2), dot(w, e1)));
    }
    angs.sort((a, b) => a - b);
    const atol = Math.max(tol / g.R, 1e-9);
    const cl = [];
    for (const a of angs) if (!cl.length || a - cl[cl.length - 1] > atol) cl.push(a);
    if (cl.length > 1 && cl[0] + 2 * Math.PI - cl[cl.length - 1] <= atol) cl.pop();
    if (cl.length < 2) continue;
    // The material occupies the complement of the largest circular gap.
    let gi = cl.length - 1;
    let gap = cl[0] + 2 * Math.PI - cl[cl.length - 1];
    for (let i = 0; i + 1 < cl.length; i++) {
      if (cl[i + 1] - cl[i] > gap + 1e-12) { gap = cl[i + 1] - cl[i]; gi = i; }
    }
    const aStart = cl[(gi + 1) % cl.length]; // arc runs counter-clockwise (about N) from aStart …
    const aEnd = cl[gi];                       // … to aEnd
    const sweep = 2 * Math.PI - gap;
    const ua = add(mul(e1, Math.cos(aStart)), mul(e2, Math.sin(aStart)));
    const ub = add(mul(e1, Math.cos(aEnd)), mul(e2, Math.sin(aEnd)));
    const ambiguous = Math.abs(sweep - Math.PI) < 0.5 * DEG;
    // Tangent toward the end at aEnd, at aStart: N × ua; leaving direction at aStart is its opposite.
    segs.push({
      kind: 'bend',
      source: 'torus',
      center: g.loc,
      axis: N,
      clr: g.R,
      ends: [add(g.loc, mul(ua, g.R)), add(g.loc, mul(ub, g.R))],
      out: [neg(cross(N, ua)), cross(N, ub)],
      ambiguous,
    });
  }
  return segs;
}

// Link segment ends that coincide with tangent continuity.
function linkEnds(segs, tol) {
  const links = segs.map(() => [null, null]);
  const cands = [];
  const tangTol = Math.sin(1 * DEG);
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          const d = dist(segs[i].ends[a], segs[j].ends[b]);
          if (d > tol) continue;
          const oa = segs[i].out[a];
          const ob = segs[j].out[b];
          const amb = segs[i].ambiguous || segs[j].ambiguous;
          const c = dot(oa, ob);
          const ok = amb ? norm(cross(oa, ob)) < tangTol : c < -Math.cos(1 * DEG);
          if (!ok) continue;
          cands.push({ i, a, j, b, d });
        }
      }
    }
  }
  cands.sort((x, y) => x.d - y.d);
  for (const c of cands) {
    if (links[c.i][c.a] || links[c.j][c.b]) continue;
    links[c.i][c.a] = { seg: c.j, end: c.b };
    links[c.j][c.b] = { seg: c.i, end: c.a };
  }
  return links;
}

function components(segs, links) {
  const comp = new Array(segs.length).fill(-1);
  let n = 0;
  for (let s = 0; s < segs.length; s++) {
    if (comp[s] >= 0) continue;
    const stack = [s];
    comp[s] = n;
    while (stack.length) {
      const k = stack.pop();
      for (const l of links[k]) if (l && comp[l.seg] < 0) { comp[l.seg] = n; stack.push(l.seg); }
    }
    n++;
  }
  return { comp, n };
}

// Infer a bend between two free chain ends (bend surfaces not toroidal).
function inferBend(Pa, outA, Pb, outB, OD) {
  const tIn = outA;
  const tOut = neg(outB);
  const theta = angleBetween(tIn, tOut);
  if (theta < 0.05 * DEG) return null;
  if (theta > 179.5 * DEG) {
    const D = sub(Pb, Pa);
    const along = dot(D, tIn);
    const perp = sub(D, mul(tIn, along));
    const clr = norm(perp) / 2;
    if (clr < 1e-3 * OD) return null;
    const center = add(Pa, mul(perp, 0.5));
    return { clr, center, residual: Math.abs(along), mismatch: 0, theta };
  }
  // Closest points of the lines Pa + s·tIn and Pb + t·outB (both pointing out of their chains).
  const w0 = sub(Pa, Pb);
  const b = dot(tIn, outB);
  const d = dot(tIn, w0);
  const e = dot(outB, w0);
  const den = 1 - b * b;
  if (den < 1e-12) return null;
  const s = (b * e - d) / den;
  const t = (e - b * d) / den;
  if (!(s > 0 && t > 0)) return null;
  const qa = add(Pa, mul(tIn, s));
  const qb = add(Pb, mul(outB, t));
  const lineGap = dist(qa, qb);
  const half = Math.tan(theta / 2);
  const clr = (s + t) / 2 / half;
  if (clr < 1e-3 * OD) return null;
  const na = unit(sub(tOut, mul(tIn, dot(tOut, tIn))));
  const nb = unit(sub(neg(tIn), mul(tOut, dot(neg(tIn), tOut))));
  const center = mul(add(add(Pa, mul(na, clr)), add(Pb, mul(nb, clr))), 0.5);
  return { clr, center, residual: lineGap + Math.abs(s - t), mismatch: Math.abs(s - t) / half, theta };
}

function inferMissingBends(segs, links, OD, tol, warnings) {
  let inferred = 0;
  let maxMismatch = 0;
  for (;;) {
    const { comp, n } = components(segs, links);
    if (n <= 1) break;
    const free = [];
    for (let i = 0; i < segs.length; i++) {
      for (let a = 0; a < 2; a++) if (!links[i][a] && !segs[i].ambiguous) free.push({ i, a });
    }
    let best = null;
    for (let x = 0; x < free.length; x++) {
      for (let y = x + 1; y < free.length; y++) {
        const A = free[x];
        const B = free[y];
        if (comp[A.i] === comp[B.i]) continue;
        const Pa = segs[A.i].ends[A.a];
        const Pb = segs[B.i].ends[B.a];
        const r = inferBend(Pa, segs[A.i].out[A.a], Pb, segs[B.i].out[B.a], OD);
        if (!r || r.residual > 0.05 * OD) continue;
        if (!best || r.residual < best.r.residual) best = { A, B, r };
      }
    }
    if (!best) break;
    const { A, B, r } = best;
    const Pa = segs[A.i].ends[A.a];
    const Pb = segs[B.i].ends[B.a];
    const tIn = segs[A.i].out[A.a];
    const tOut = neg(segs[B.i].out[B.a]);
    const k = segs.length;
    segs.push({
      kind: 'bend', source: 'inferred', center: r.center, clr: r.clr, axis: unit(cross(tIn, tOut)),
      ends: [Pa, Pb], out: [neg(tIn), tOut], ambiguous: false, tIn, tOut,
    });
    links.push([{ seg: A.i, end: A.a }, { seg: B.i, end: B.a }]);
    links[A.i][A.a] = { seg: k, end: 0 };
    links[B.i][B.a] = { seg: k, end: 1 };
    inferred++;
    maxMismatch = Math.max(maxMismatch, r.mismatch);
  }
  if (inferred) {
    warnings.push(`Se infirieron ${inferred} doblez(ces) a partir de los tramos rectos porque sus superficies no son toroidales (p. ej. B-spline); verifique el radio (CLR) y el ángulo.`);
    if (maxMismatch > 10 * tol) {
      warnings.push(`Los tramos rectos no son tangentes de forma consistente a los dobleces inferidos (diferencia de CLR hasta ${maxMismatch.toFixed(3)} mm).`);
    }
  }
  return inferred;
}

// ---------- chain walk and output segments ----------
function walkChains(segs, links) {
  const visited = new Array(segs.length).fill(false);
  const chains = [];
  const walkFrom = (s0, entry0) => {
    const chain = [];
    let s = s0;
    let entry = entry0;
    while (s != null && !visited[s]) {
      visited[s] = true;
      chain.push({ seg: s, entry });
      const nx = links[s][1 - entry];
      if (!nx) break;
      s = nx.seg;
      entry = nx.end;
    }
    return chain;
  };
  for (let i = 0; i < segs.length; i++) {
    if (visited[i]) continue;
    for (let a = 0; a < 2; a++) if (!links[i][a] && !visited[i]) chains.push(walkFrom(i, a));
  }
  for (let i = 0; i < segs.length; i++) if (!visited[i]) chains.push(walkFrom(i, 0)); // closed loops
  return chains;
}

function orientChain(segs, chain) {
  const out = [];
  const pushZeroStraight = (p, d) => out.push({ type: 'straight', length: 0, p0: p.slice(), p1: p.slice(), dir: d.slice() });
  let prevDir = null;
  for (let k = 0; k < chain.length; k++) {
    const { seg, entry } = chain[k];
    const S = segs[seg];
    const P0 = S.ends[entry];
    const P1 = S.ends[1 - entry];
    if (S.kind === 'straight') {
      const last = out[out.length - 1];
      if (last && last.type === 'straight') {
        last.p1 = P1.slice();
        last.length = dist(last.p0, last.p1);
        last.dir = unit(sub(last.p1, last.p0));
      } else {
        out.push({ type: 'straight', length: dist(P0, P1), p0: P0.slice(), p1: P1.slice(), dir: unit(sub(P1, P0)) });
      }
      prevDir = out[out.length - 1].dir;
      continue;
    }
    // bend
    const C = S.center;
    const u0 = unit(sub(P0, C));
    const u1 = unit(sub(P1, C));
    let tIn;
    if (!S.ambiguous) tIn = neg(S.out[entry]);
    else if (prevDir) tIn = prevDir;
    else {
      const nx = chain[k + 1] ? segs[chain[k + 1].seg] : null;
      tIn = nx && nx.kind === 'straight' ? neg(unit(sub(nx.ends[1 - chain[k + 1].entry], nx.ends[chain[k + 1].entry]))) : cross(S.axis, u0);
    }
    tIn = unit(sub(tIn, mul(u0, dot(tIn, u0))));
    const normal = unit(cross(u0, tIn));
    let ang = Math.atan2(dot(cross(u0, u1), normal), dot(u0, u1));
    if (ang <= 0) ang += 2 * Math.PI;
    if (S.ambiguous || Math.abs(ang - Math.PI) < 1e-9) ang = Math.min(ang, Math.PI);
    const tOut = cross(normal, u1);
    const last = out[out.length - 1];
    if (!last || last.type === 'bend') pushZeroStraight(P0, tIn);
    out.push({
      type: 'bend',
      clr: S.source === 'torus' ? S.clr : (dist(P0, C) + dist(P1, C)) / 2,
      angle: ang / DEG,
      p0: P0.slice(), p1: P1.slice(), center: C.slice(), normal, tIn, tOut,
      source: S.source,
    });
    prevDir = tOut;
  }
  const last = out[out.length - 1];
  if (last && last.type === 'bend') pushZeroStraight(last.p1, last.tOut);
  // zero-length straights take the tangent of their neighbour
  for (let k = 0; k < out.length; k++) {
    const s = out[k];
    if (s.type !== 'straight' || s.length > 0) continue;
    if (out[k - 1]) s.dir = out[k - 1].tOut.slice();
    else if (out[k + 1]) s.dir = out[k + 1].tIn.slice();
  }
  return out;
}

function segLength(s) { return s.type === 'straight' ? s.length : s.clr * s.angle * DEG; }

// ---------- centerline projection and wall profile ----------
function makeProjector(segments) {
  const items = [];
  let s = 0;
  for (const g of segments) {
    const L = segLength(g);
    if (g.type === 'straight') items.push({ g, s0: s, L });
    else {
      const u0 = unit(sub(g.p0, g.center));
      items.push({ g, s0: s, L, u0, v0: g.tIn, th: g.angle * DEG });
    }
    s += L;
  }
  return (P) => {
    let best = null;
    for (const it of items) {
      const g = it.g;
      let q;
      let sl;
      if (g.type === 'straight') {
        const t = clamp(dot(sub(P, g.p0), g.dir), 0, it.L);
        q = add(g.p0, mul(g.dir, t));
        sl = it.s0 + t;
      } else {
        const w = sub(P, g.center);
        let phi = Math.atan2(dot(w, it.v0), dot(w, it.u0));
        if (phi < -1e-9 && phi < -(2 * Math.PI - it.th) / 2) phi += 2 * Math.PI; // wrap toward nearer end
        phi = clamp(phi, 0, it.th);
        q = add(g.center, mul(add(mul(it.u0, Math.cos(phi)), mul(it.v0, Math.sin(phi))), g.clr));
        sl = it.s0 + g.clr * phi;
      }
      const d = dist(P, q);
      if (!best || d < best.d - 1e-9) best = { s: sl, d };
    }
    return best;
  };
}

function buildWall(descs, rOut, segments, totalLength, tol, warnings) {
  const project = makeProjector(segments);
  const pieces = [];
  let rejected = 0;
  for (const d of descs) {
    if (d.kind === 'plane' || !d.verts.length) continue;
    if (d.kind === 'cylinder' && Math.abs(d.r - rOut) <= tol) continue;
    if (d.kind === 'torus' && Math.abs(d.r - rOut) <= tol) continue;
    const pr = d.verts.map((v) => project(v));
    if (pr.some((p) => p.d > rOut - tol)) continue; // outer (or mixed) face
    let lo = pr[0];
    let hi = pr[0];
    for (const p of pr) { if (p.s < lo.s) lo = p; if (p.s > hi.s) hi = p; }
    if (hi.s - lo.s <= tol) continue;
    const near = (target) => {
      const sel = pr.filter((p) => Math.abs(p.s - target) <= tol);
      return sel.reduce((a, p) => a + p.d, 0) / sel.length;
    };
    let r0 = near(lo.s);
    let r1 = near(hi.s);
    if (d.kind === 'cylinder' || d.kind === 'torus') {
      if (Math.abs(r0 - d.r) > 5 * tol || Math.abs(r1 - d.r) > 5 * tol) { rejected++; continue; }
      r0 = d.r;
      r1 = d.r;
    }
    pieces.push({ s0: Math.max(0, lo.s), s1: Math.min(totalLength, hi.s), t0: rOut - r0, t1: rOut - r1 });
  }
  if (rejected) warnings.push(`Se ignoraron ${rejected} superficie(s) interior(es) que no son concéntricas con la línea central.`);
  if (!pieces.length) return null;

  const bp = [0, totalLength];
  for (const p of pieces) bp.push(p.s0, p.s1);
  bp.sort((a, b) => a - b);
  const xs = [];
  for (const x of bp) if (!xs.length || x - xs[xs.length - 1] > 1e-6) xs.push(x);
  const at = (p, s) => (p.s1 - p.s0 > 0 ? p.t0 + ((p.t1 - p.t0) * (s - p.s0)) / (p.s1 - p.s0) : p.t0);
  const elems = [];
  let disagree = false;
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i];
    const b = xs[i + 1];
    const cov = pieces.filter((p) => p.s0 <= a + 1e-6 && p.s1 >= b - 1e-6);
    if (!cov.length) { elems.push({ s0: a, s1: b, t0: null, t1: null }); continue; }
    let pick = cov[0];
    const m = (a + b) / 2;
    for (const p of cov) {
      if (Math.abs(at(p, m) - at(pick, m)) > 0.02) disagree = true;
      if (at(p, m) > at(pick, m)) pick = p;
    }
    elems.push({ s0: a, s1: b, t0: at(pick, a), t1: at(pick, b) });
  }
  if (disagree) warnings.push('Hay superficies interiores que se contradicen en el mismo tramo; se tomó el menor radio interior (mayor espesor).');
  // Fill gaps: bridge linearly between neighbours, extend at the ends.
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].t0 != null) continue;
    let j = i;
    while (j < elems.length && elems[j].t0 == null) j++;
    const left = i > 0 ? elems[i - 1].t1 : null;
    const right = j < elems.length ? elems[j].t0 : null;
    const a = elems[i].s0;
    const b = elems[j - 1].s1;
    for (let k = i; k < j; k++) {
      const e = elems[k];
      const f = (s) => {
        if (left == null) return right;
        if (right == null) return left;
        return left + ((right - left) * (s - a)) / (b - a);
      };
      e.t0 = f(e.s0);
      e.t1 = f(e.s1);
    }
    i = j - 1;
  }
  // Merge collinear neighbours.
  const wall = [];
  for (const e of elems) {
    const last = wall[wall.length - 1];
    if (last && Math.abs(last.t1 - e.t0) < 1e-9) {
      const slopeL = (last.t1 - last.t0) / (last.s1 - last.s0);
      const slopeE = (e.t1 - e.t0) / (e.s1 - e.s0);
      if (Math.abs(slopeL - slopeE) < 1e-9) { last.s1 = e.s1; last.t1 = e.t1; continue; }
    }
    wall.push({ ...e });
  }
  return wall;
}

function wallStats(wall) {
  let lo = Infinity;
  let hi = -Infinity;
  const samples = [];
  for (const p of wall) {
    lo = Math.min(lo, p.t0, p.t1);
    hi = Math.max(hi, p.t0, p.t1);
    const n = p.t0 === p.t1 ? 1 : 16;
    const L = (p.s1 - p.s0) / n;
    for (let k = 0; k < n; k++) samples.push({ t: p.t0 + ((p.t1 - p.t0) * (k + 0.5)) / n, w: L });
  }
  samples.sort((a, b) => a.t - b.t);
  const total = samples.reduce((a, x) => a + x.w, 0);
  let acc = 0;
  let med = samples.length ? samples[samples.length - 1].t : null;
  for (const x of samples) { acc += x.w; if (acc >= total / 2) { med = x.t; break; } }
  return { nominalWall: med, minWall: lo, maxWall: hi, variableWall: hi - lo > 0.02 };
}

// ---------- public API ----------
/**
 * Recognise the bent tube in a parsed STEP file.
 * @param {ReturnType<typeof parseStep>} parsed
 * @param {{ fileName?: string, defaultWall?: number }} [opts]
 * @returns {object} TubeModel (docs/INTERFACES.md §1)
 */
export function extractTube(parsed, { fileName, defaultWall } = {}) {
  const warnings = [...(parsed.warnings || [])];
  const rd = makeReader(parsed);
  const bodies = collectBodies(rd);
  if (!bodies.length) {
    throw new Error('El archivo STEP no contiene caras de sólido (ADVANCED_FACE): exporte el tubo como sólido B-rep (AP203/AP214/AP242).');
  }
  let descs = null;
  let outer = null;
  let bodiesWithCyl = 0;
  for (const b of bodies) {
    const ds = describeFaces(rd, b);
    const o = outerRadiusOf(ds);
    if (!o) continue;
    bodiesWithCyl++;
    if (!outer || o.area > outer.area) { outer = o; descs = ds; }
  }
  if (!outer) throw new Error('No se encontraron superficies cilíndricas: el archivo no parece contener un tubo.');
  if (bodiesWithCyl > 1) warnings.push(`El archivo contiene ${bodiesWithCyl} sólidos; se usó el tubo con mayor superficie cilíndrica exterior.`);

  const rOut = outer.r;
  const OD = 2 * rOut;
  const tol = 1e-3 * OD;

  const surfaces = { cylinder: 0, torus: 0, cone: 0, plane: 0, bspline: 0, other: 0 };
  for (const d of descs) surfaces[d.kind]++;

  const segs = [...buildStraights(descs, rOut, tol), ...buildTorusBends(descs, rOut, tol)];
  const links = linkEnds(segs, tol);
  inferMissingBends(segs, links, OD, tol, warnings);

  const chains = walkChains(segs, links);
  const chainLen = (ch) => ch.reduce((a, { seg }) => {
    const S = segs[seg];
    return a + (S.kind === 'straight' ? dist(S.ends[0], S.ends[1]) : S.clr * angleBetween(sub(S.ends[0], S.center), sub(S.ends[1], S.center)));
  }, 0);
  chains.sort((a, b) => chainLen(b) - chainLen(a));
  if (!chains.length) throw new Error('No se pudo reconstruir la línea central del tubo: no hay tramos rectos ni dobleces reconocibles.');
  if (chains.length > 1) {
    warnings.push(`No se pudieron unir ${chains.length - 1} tramo(s) a la línea central principal; se ignoraron. Revise que el tubo sea una sola pieza continua.`);
  }
  let chain = chains[0];
  let segments = orientChain(segs, chain);

  // End A: the end whose end-straight is longer; tie → smaller x of its end point.
  const first = segments[0];
  const last = segments[segments.length - 1];
  let flip = false;
  if (last.length > first.length + tol) flip = true;
  else if (Math.abs(last.length - first.length) <= tol && last.p1[0] < first.p0[0] - 1e-9) flip = true;
  if (flip) {
    // Re-walk from the other end so bends are oriented by the same code path.
    chain = chain.slice().reverse().map(({ seg, entry }) => ({ seg, entry: 1 - entry }));
    segments = orientChain(segs, chain);
  }

  const totalLength = segments.reduce((a, g) => a + segLength(g), 0);

  let wall = buildWall(descs, rOut, segments, totalLength, tol, warnings);
  if (!wall && defaultWall > 0) {
    wall = [{ s0: 0, s1: totalLength, t0: defaultWall, t1: defaultWall }];
    warnings.push(`El STEP no tiene superficie interior; se usó el espesor de pared indicado (${defaultWall} mm) en todo el tubo.`);
  }
  const stats = wall ? wallStats(wall) : { nominalWall: null, minWall: null, maxWall: null, variableWall: false };

  const productName = (parsed.header && parsed.header.productNames || []).find((n) => n && n.trim());
  const baseName = fileName ? String(fileName).replace(/^.*[\\/]/, '').replace(/\.(stp|step)$/i, '') : '';
  return {
    name: productName || baseName || 'Tubo importado',
    units: 'mm',
    OD,
    segments,
    wall,
    ...stats,
    totalLength,
    source: {
      format: 'STEP',
      schema: parsed.header ? parsed.header.schema : '',
      entityCount: parsed.entities.size,
      lengthScale: parsed.lengthScale,
      surfaces,
      warnings,
    },
  };
}

/** Parse STEP text and extract the tube. */
export function importStepTube(text, opts) {
  return extractTube(parseStep(text), opts);
}
