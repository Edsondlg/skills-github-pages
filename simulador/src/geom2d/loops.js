// Encadenado de segmentos en contornos, anidamiento y regiones (contrato C2, docs/ARQUITECTURA.md).
import {
  segStart,
  segEnd,
  segLength,
  segReverse,
  segMomentTerms,
  segBBox,
  segTessellate,
  segSweep,
  segTangent,
  segPointAt,
  segClosestPoint,
  isClosedSegment,
} from './segments.js';

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const TAU = 2 * Math.PI;

export function bboxOfSegments(segs) {
  if (!segs.length) return null;
  const r = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const s of segs) {
    const b = segBBox(s);
    if (b.minX < r.minX) r.minX = b.minX;
    if (b.minY < r.minY) r.minY = b.minY;
    if (b.maxX > r.maxX) r.maxX = b.maxX;
    if (b.maxY > r.maxY) r.maxY = b.maxY;
  }
  return r;
}

// Misma geometría (mismo tipo) dentro de tol; a y b comparten sus nodos extremos.
function sameOpen(a, b, tol) {
  if (a.type !== b.type) return false;
  if (a.type === 'line') return true;
  if (a.type === 'arc') return dist(segPointAt(a, 0.5), segPointAt(b, 0.5)) <= tol;
  for (const f of [0.25, 0.5, 0.75]) if (segClosestPoint(b, segPointAt(a, f)).d > tol) return false;
  return segClosestPoint(a, segPointAt(b, 0.5)).d <= tol;
}

function sameClosed(a, ba, b, bb, tol) {
  if (a.type !== b.type) return false;
  if (Math.abs(ba.minX - bb.minX) > tol || Math.abs(ba.minY - bb.minY) > tol) return false;
  if (Math.abs(ba.maxX - bb.maxX) > tol || Math.abs(ba.maxY - bb.maxY) > tol) return false;
  if (a.type === 'circle') return true;
  for (const f of [0, 0.25, 0.5, 0.75]) if (segClosestPoint(b, segPointAt(a, f)).d > tol) return false;
  return true;
}

export function buildLoops(segments, { tol = 1e-6 } = {}) {
  const stats = { segments: segments.length, duplicatesRemoved: 0, zeroLengthRemoved: 0, loops: 0, openChains: 0, junctions: 0 };
  const loops = [], open = [];
  const key = (ix, iy) => ix + ',' + iy;

  // 1) Segmentos nulos fuera; cerrados (círculo, elipse completa, bezier/spline cerrada) son contornos por sí solos.
  const closed = [], raw = [];
  for (const s of segments) {
    if (segLength(s) <= tol) stats.zeroLengthRemoved++;
    else (isClosedSegment(s, tol) ? closed : raw).push(s);
  }
  const cgrid = new Map(), kept = [];
  for (const s of closed) {
    const b = segBBox(s), ix = Math.floor((b.minX + b.maxX) / 2 / tol), iy = Math.floor((b.minY + b.maxY) / 2 / tol);
    let dup = false;
    for (let i = ix - 1; i <= ix + 1 && !dup; i++)
      for (let j = iy - 1; j <= iy + 1 && !dup; j++)
        for (const k of cgrid.get(key(i, j)) || []) if (sameClosed(s, b, kept[k].s, kept[k].b, tol)) dup = true;
    if (dup) {
      stats.duplicatesRemoved++;
      continue;
    }
    const k2 = key(ix, iy);
    if (!cgrid.has(k2)) cgrid.set(k2, []);
    cgrid.get(k2).push(kept.length);
    kept.push({ s, b });
    loops.push({ segs: [s] });
  }

  // 2) Nodos: extremos a menos de tol se sueldan (rejilla de celda tol, vecindad 3×3).
  const grid = new Map(), nodes = [];
  const nodeOf = (p, isLine) => {
    const ix = Math.floor(p[0] / tol), iy = Math.floor(p[1] / tol);
    let best = -1, bd = tol;
    for (let i = ix - 1; i <= ix + 1; i++)
      for (let j = iy - 1; j <= iy + 1; j++) {
        const l = grid.get(key(i, j));
        if (l)
          for (const k of l) {
            const d = dist(nodes[k].p, p);
            if (d <= bd) {
              bd = d;
              best = k;
            }
          }
      }
    if (best < 0) {
      best = nodes.length;
      nodes.push({ p, fixed: !isLine, ends: [] });
      const k = key(ix, iy);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(best);
    } else if (!isLine && !nodes[best].fixed) {
      // Las curvas no se pueden mover: el nodo toma su extremo y las líneas se sueldan a él.
      nodes[best].p = p;
      nodes[best].fixed = true;
    }
    return best;
  };

  // 3) Aristas sin duplicados (mismo par de nodos y misma geometría, en cualquier sentido).
  const edges = [], pairs = new Map();
  for (const s of raw) {
    const isLine = s.type === 'line';
    const a = nodeOf(segStart(s), isLine), b = nodeOf(segEnd(s), isLine);
    if (a === b) {
      loops.push({ segs: [s] });
      continue;
    }
    const pk = a < b ? a + ':' + b : b + ':' + a;
    const list = pairs.get(pk) || [];
    if (list.some((k) => sameOpen(s, edges[k].s, tol))) {
      stats.duplicatesRemoved++;
      continue;
    }
    list.push(edges.length);
    pairs.set(pk, list);
    nodes[a].ends.push(edges.length);
    nodes[b].ends.push(edges.length);
    edges.push({ s, a, b, ta: segTangent(s, 0), tb: segTangent(s, 1) });
  }
  for (const n of nodes) if (n.ends.length > 2) stats.junctions++;

  // Segmento orientado del recorrido; las líneas toman las coordenadas de los nodos.
  const oriented = ({ e, fwd }) => {
    const E = edges[e], s = E.s;
    if (s.type === 'line') {
      const o = { type: 'line', p0: nodes[fwd ? E.a : E.b].p.slice(), p1: nodes[fwd ? E.b : E.a].p.slice() };
      if (s.meta !== undefined) o.meta = s.meta;
      return o;
    }
    return fwd ? s : segReverse(s);
  };
  const emit = (path, asLoop) => (asLoop ? loops : open).push({ segs: path.map(oriented) });

  // 4) Poda de ramas colgantes (nodos de grado 1): no pueden cerrar.
  const used = new Uint8Array(edges.length), leftover = [];
  const deg = nodes.map((n) => n.ends.length);
  const stack = [];
  deg.forEach((d, i) => d === 1 && stack.push(i));
  while (stack.length) {
    const v = stack.pop();
    if (deg[v] !== 1) continue;
    const e = nodes[v].ends.find((k) => !used[k]);
    used[e] = 1;
    leftover.push(e);
    const E = edges[e], w = E.a === v ? E.b : E.a;
    deg[v]--;
    if (--deg[w] === 1) stack.push(w);
  }

  // 5) Recorridos. En nodos de grado > 2 se sigue el tramo que menos gira (empate: el más a la izquierda,
  //    luego el de menor índice). Si el recorrido vuelve a un nodo ya visitado se separa ese ciclo, así los
  //    contornos quedan simples. Cada paso consume una arista: termina siempre.
  const choose = (v, dir) => {
    let best = -1, bt = Infinity, bl = -Infinity;
    for (const k of nodes[v].ends) {
      if (used[k]) continue;
      const E = edges[k], o = E.a === v ? E.ta : [-E.tb[0], -E.tb[1]];
      const turn = Math.atan2(dir[0] * o[1] - dir[1] * o[0], dir[0] * o[0] + dir[1] * o[1]);
      const at = Math.abs(turn);
      if (at < bt - 1e-9 || (at <= bt + 1e-9 && turn > bl + 1e-9)) {
        best = k;
        bt = at;
        bl = turn;
      }
    }
    return best;
  };
  const order = [];
  for (let k = 0; k < edges.length; k++) if (deg[edges[k].a] <= 2 && deg[edges[k].b] <= 2) order.push(k);
  for (let k = 0; k < edges.length; k++) if (!(deg[edges[k].a] <= 2 && deg[edges[k].b] <= 2)) order.push(k);
  for (const start of order) {
    if (used[start]) continue;
    const path = [], seen = new Map([[edges[start].a, 0]]);
    let cur = { e: start, fwd: true };
    for (;;) {
      used[cur.e] = 1;
      path.push(cur);
      const E = edges[cur.e], v = cur.fwd ? E.b : E.a;
      if (seen.has(v)) {
        const cyc = path.splice(seen.get(v));
        for (const it of cyc) seen.delete(it.fwd ? edges[it.e].a : edges[it.e].b);
        emit(cyc, true);
        if (!path.length) break;
      }
      seen.set(v, path.length);
      const dir = cur.fwd ? E.tb : [-E.ta[0], -E.ta[1]];
      const next = choose(v, dir);
      if (next < 0) {
        for (const it of path) leftover.push(it.e);
        break;
      }
      cur = { e: next, fwd: edges[next].a === v };
    }
  }

  // 6) Sobrantes → cadenas abiertas (de extremo a extremo); ciclos puros sobrantes → contornos.
  const ldeg = new Map(), lused = new Set(), inLeft = new Set(leftover);
  for (const e of leftover) for (const v of [edges[e].a, edges[e].b]) ldeg.set(v, (ldeg.get(v) || 0) + 1);
  const walk = (v0, e0) => {
    const path = [];
    let v = v0, e = e0;
    for (;;) {
      lused.add(e);
      const E = edges[e], fwd = E.a === v;
      path.push({ e, fwd });
      v = fwd ? E.b : E.a;
      if (v === v0 || ldeg.get(v) !== 2) return { path, closed: v === v0 };
      e = nodes[v].ends.find((k) => inLeft.has(k) && !lused.has(k));
      if (e === undefined) return { path, closed: false };
    }
  };
  for (const e of leftover)
    for (const v of [edges[e].a, edges[e].b])
      if (!lused.has(e) && ldeg.get(v) !== 2) emit(walk(v, e).path, false);
  for (const e of leftover)
    if (!lused.has(e)) {
      const r = walk(edges[e].a, e);
      emit(r.path, r.closed);
    }

  stats.loops = loops.length;
  stats.openChains = open.length;
  return { loops, open, stats };
}

// Círculo si es un círculo, una elipse/arco completo de radios iguales, o arcos concéntricos que suman 2π.
function detectCircle(segs) {
  if (segs.length === 1) {
    const s = segs[0];
    if (s.type === 'circle' || (s.type === 'arc' && segSweep(s) === TAU)) return { c: s.c.slice(), r: s.r };
    if (s.type === 'ellipse' && segSweep(s) === TAU && Math.abs(s.rx - s.ry) <= 1e-12 * s.rx) return { c: s.c.slice(), r: s.rx };
  }
  const f = segs[0];
  if (f.type !== 'arc') return null;
  const eps = 1e-9 * f.r + 1e-12;
  let sum = 0;
  for (const s of segs) {
    if (s.type !== 'arc' || Math.abs(s.r - f.r) > eps || dist(s.c, f.c) > eps) return null;
    sum += (s.ccw !== false ? 1 : -1) * segSweep(s);
  }
  return Math.abs(Math.abs(sum) - TAU) <= 1e-9 ? { c: f.c.slice(), r: f.r } : null;
}

export function loopInfo(loop, chordTol = 0.01) {
  let A = 0, Sx = 0, Sy = 0, perimeter = 0;
  const poly = [];
  for (const s of loop.segs) {
    const m = segMomentTerms(s);
    A += m.A;
    Sx += m.Sx;
    Sy += m.Sy;
    perimeter += segLength(s);
    const pts = segTessellate(s, chordTol);
    for (let i = poly.length ? 1 : 0; i < pts.length; i++) poly.push(pts[i]);
  }
  if (poly.length > 1) poly.pop(); // el cierre es implícito
  const bbox = bboxOfSegments(loop.segs);
  const centroid = A !== 0 ? [Sx / A, Sy / A] : [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2];
  return { area: Math.abs(A), signedArea: A, perimeter, centroid, bbox, circle: detectCircle(loop.segs), poly };
}

export function orientLoop(loop, ccw) {
  let A = 0;
  for (const s of loop.segs) A += segMomentTerms(s).A;
  if (A > 0 === !!ccw || A === 0) return { ...loop, segs: loop.segs.slice() };
  return { ...loop, segs: loop.segs.map(segReverse).reverse() };
}

// Regla par-impar (rayo horizontal hacia +x). poly sin repetir el primer punto.
export function pointInPolygon(p, poly) {
  const [x, y] = p;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Nodo i ↔ loops[i]; parent = índice del menor contorno que lo contiene (−1 si ninguno).
export function buildRegions(loops, { chordTol = 0.01 } = {}) {
  const infos = loops.map((l) => loopInfo(l, chordTol));
  const nodes = loops.map((loop) => ({ loop, parent: -1, depth: 0, children: [] }));
  const order = loops.map((_, i) => i).sort((a, b) => infos[b].area - infos[a].area || a - b);
  const inBox = (o, i) => o.minX <= i.minX && o.minY <= i.minY && o.maxX >= i.maxX && o.maxY >= i.maxY;
  for (let k = 0; k < order.length; k++) {
    const bi = order[k], B = infos[bi], n = B.poly.length;
    // Tres puntos repartidos del borde de B; mayoría para tolerar contactos.
    const probes = [B.poly[0], B.poly[Math.floor(n / 3)], B.poly[Math.floor((2 * n) / 3)]];
    for (let j = k - 1; j >= 0; j--) {
      const ai = order[j], A = infos[ai];
      if (!(A.area > B.area) || !inBox(A.bbox, B.bbox)) continue;
      if (probes.filter((p) => pointInPolygon(p, A.poly)).length >= 2) {
        nodes[bi].parent = ai;
        nodes[bi].depth = nodes[ai].depth + 1;
        nodes[ai].children.push(bi);
        break;
      }
    }
  }
  for (const nd of nodes) nd.children.sort((a, b) => a - b);
  const regions = [];
  nodes.forEach((nd, i) => {
    if (nd.depth % 2 === 0) regions.push({ outer: i, holes: nd.children.slice() });
  });
  return { nodes, regions };
}
