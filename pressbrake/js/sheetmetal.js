// Análisis de lámina doblada a partir de una malla B-rep teselada (salida de occt-import-js).
// Detecta espesor, dobleces (pares de cilindros coaxiales), segmentos planos, árbol de doblez
// y permite deformar la pieza entre estado plano (s=0) y formado (s=1) por doblez.
// Sin dependencias: funciona en navegador y en Node.

const EPS_KEY = 100; // malla de 0.01 mm para fusionar vértices coincidentes

// ---------- vectores mínimos ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const perpBasis = (a) => {
  const h = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = norm(cross(a, h));
  return [u, cross(a, u)];
};
// rotación de v alrededor del eje unitario a por ángulo t (Rodrigues)
const rotate = (v, a, t) => {
  const c = Math.cos(t), s = Math.sin(t), d = dot(a, v), x = cross(a, v);
  return [v[0] * c + x[0] * s + a[0] * d * (1 - c), v[1] * c + x[1] * s + a[1] * d * (1 - c), v[2] * c + x[2] * s + a[2] * d * (1 - c)];
};
const TAU = Math.PI * 2;
const wrap = (x) => ((x % TAU) + TAU) % TAU;

// Transformación rígida {R: matriz 3x3 fila-mayor, t}
const ident = () => ({ R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] });
const apply = (M, p) => {
  const R = M.R;
  return [R[0] * p[0] + R[1] * p[1] + R[2] * p[2] + M.t[0], R[3] * p[0] + R[4] * p[1] + R[5] * p[2] + M.t[1], R[6] * p[0] + R[7] * p[1] + R[8] * p[2] + M.t[2]];
};
const applyR = (M, v) => { const R = M.R; return [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]]; };
const rotMat = (a, t) => {
  const c = Math.cos(t), s = Math.sin(t), C = 1 - c, [x, y, z] = a;
  return [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C];
};
const matMul3 = (A, B) => {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  return r;
};
const compose = (A, B) => ({ R: matMul3(A.R, B.R), t: apply(A, B.t) }); // A∘B

// ---------- clasificación de caras ----------
export function classifyFace(P, N, verts, tris) {
  // normal promedio por área
  let nAvg = [0, 0, 0], area = 0;
  const triN = [];
  for (const [i, j, k] of tris) {
    const a = P(i), b = P(j), c = P(k);
    const cr = cross(sub(b, a), sub(c, a));
    const A = len(cr) / 2;
    area += A;
    nAvg = add(nAvg, mul(cr, 0.5));
    triN.push(A > 1e-12 ? norm(cr) : null);
  }
  const nUnit = norm(nAvg);
  let planar = true;
  for (const n of triN) if (n && dot(n, nUnit) < 0.9995) { planar = false; break; }
  if (planar) {
    const p0 = P(verts[0]);
    return { type: 'plane', normal: nUnit, d: dot(nUnit, p0), area };
  }
  // ¿cilindro? normales de triángulo perpendiculares a un eje común
  const ns = triN.filter(Boolean);
  if (ns.length < 2) return { type: 'other', area };
  let n0 = ns[0], n1 = ns[0], best = 2;
  for (const n of ns) { const d = Math.abs(dot(n, n0)); if (d < best) { best = d; n1 = n; } }
  if (best > 0.9999) return { type: 'other', area };
  const a = norm(cross(n0, n1));
  for (const n of ns) if (Math.abs(dot(n, a)) > 0.03) return { type: 'other', area };
  // ajuste algebraico de círculo (Kasa) en el plano perpendicular al eje
  const [u, w] = perpBasis(a);
  const pts = verts.map((v) => P(v));
  let S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bvec = [0, 0, 0];
  let mx = 0, my = 0;
  for (const p of pts) { mx += dot(p, u) / pts.length; my += dot(p, w) / pts.length; }
  for (const p of pts) {
    const x = dot(p, u) - mx, y = dot(p, w) - my, r = [x, y, 1], z = -(x * x + y * y);
    for (let i = 0; i < 3; i++) { bvec[i] += r[i] * z; for (let j = 0; j < 3; j++) S[i][j] += r[i] * r[j]; }
  }
  const sol0 = solve3(S, bvec);
  if (!sol0) return { type: 'other', area };
  const sol = [mx - sol0[0] / 2, my - sol0[1] / 2];
  const [cx, cy] = sol;
  const c2 = add(mul(u, cx), mul(w, cy));
  const rho = pts.map((p) => { const q = sub(p, c2); return Math.hypot(dot(q, u), dot(q, w)); });
  const r = rho.reduce((s, x) => s + x, 0) / rho.length;
  if (rho.some((x) => Math.abs(x - r) > Math.max(0.02, r * 0.01))) return { type: 'other', area };
  const ang = pts.map((p) => { const q = sub(p, c2); return wrap(Math.atan2(dot(q, w), dot(q, u))); }).sort((x, y) => x - y);
  let gap = TAU - ang[ang.length - 1] + ang[0], gi = 0;
  for (let i = 1; i < ang.length; i++) if (ang[i] - ang[i - 1] > gap) { gap = ang[i] - ang[i - 1]; gi = i; }
  const start = ang[gi], span = TAU - gap;
  const ax = pts.map((p) => dot(p, a));
  return { type: 'cyl', axis: a, u, w, c2, r, start, span, amin: Math.min(...ax), amax: Math.max(...ax), area };
}

function solve3(A, b) {
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

// ---------- análisis principal ----------
/**
 * @param {{positions:Float32Array, normals?:Float32Array, index:Uint32Array, faces:{first:number,last:number}[]}} mesh
 * @param {{kFactor?:number|null}} opts
 */
export function analyzeSheetMetal(mesh, opts = {}) {
  const { positions, normals, index, faces } = mesh;
  const nV = positions.length / 3;
  const P = (i) => [positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]];
  const N = normals ? (i) => [normals[3 * i], normals[3 * i + 1], normals[3 * i + 2]] : () => [0, 0, 0];
  const warnings = [];

  // claves de posición para fusionar vértices
  const keyOf = new Int32Array(nV);
  const keyMap = new Map();
  const keyPos = [];
  for (let i = 0; i < nV; i++) {
    const k = `${Math.round(positions[3 * i] * EPS_KEY)},${Math.round(positions[3 * i + 1] * EPS_KEY)},${Math.round(positions[3 * i + 2] * EPS_KEY)}`;
    let id = keyMap.get(k);
    if (id === undefined) { id = keyPos.length; keyMap.set(k, id); keyPos.push(P(i)); }
    keyOf[i] = id;
  }
  const nK = keyPos.length;

  // caras
  const faceInfo = faces.map((f, fi) => {
    const tris = [];
    const vs = new Set();
    for (let t = f.first; t <= f.last; t++) {
      const tri = [index[3 * t], index[3 * t + 1], index[3 * t + 2]];
      tris.push(tri); tri.forEach((v) => vs.add(v));
    }
    const verts = [...vs];
    const cls = classifyFace(P, N, verts, tris);
    return { id: fi, tris, verts, ...cls };
  });

  // área total y volumen (teorema de divergencia)
  let totalArea = 0, volume = 0;
  for (let t = 0; t < index.length / 3; t++) {
    const a = P(index[3 * t]), b = P(index[3 * t + 1]), c = P(index[3 * t + 2]);
    totalArea += len(cross(sub(b, a), sub(c, a))) / 2;
    volume += dot(a, cross(b, c)) / 6;
  }
  volume = Math.abs(volume);

  // agrupar cilindros por eje
  const cyls = faceInfo.filter((f) => f.type === 'cyl');
  const groups = [];
  for (const f of cyls) {
    let g = groups.find((g) => {
      if (Math.abs(dot(g.axis, f.axis)) < 0.999) return false;
      const d = sub(f.c2, g.c2);
      const off = sub(d, mul(g.axis, dot(d, g.axis)));
      return len(off) < 0.05;
    });
    if (!g) { g = { axis: f.axis, u: f.u, w: f.w, c2: f.c2, faces: [] }; groups.push(g); }
    g.faces.push(f);
  }

  const bends = [];
  let holeCount = 0;
  for (const g of groups) {
    const radii = g.faces.map((f) => f.r);
    const rIn = Math.min(...radii), rOut = Math.max(...radii);
    if (rOut - rIn < 0.05) {
      // mismo radio: barreno / avellanado / redondeo
      const totalSpan = g.faces.reduce((s, f) => s + f.span, 0);
      holeCount += Math.round(totalSpan / TAU);
      continue;
    }
    // re-expresar ángulos en la base común del grupo
    const a = g.axis, [u, w] = [g.u, g.w];
    const angs = [];
    let amin = Infinity, amax = -Infinity;
    for (const f of g.faces) {
      for (const v of f.verts) {
        const q = sub(P(v), g.c2);
        angs.push(wrap(Math.atan2(dot(q, w), dot(q, u))));
        const ax = dot(P(v), a);
        amin = Math.min(amin, ax); amax = Math.max(amax, ax);
      }
    }
    angs.sort((x, y) => x - y);
    let gap = TAU - angs[angs.length - 1] + angs[0], gi = 0;
    for (let i = 1; i < angs.length; i++) if (angs[i] - angs[i - 1] > gap) { gap = angs[i] - angs[i - 1]; gi = i; }
    const start = angs[gi], span = TAU - gap;
    if (span > Math.PI * 1.02 || span < 0.02) continue;
    // punto del eje en 3D (c2 está en el plano perpendicular que pasa por el origen)
    bends.push({ axis: a, u, w, c2: g.c2, rIn, rOut, T: rOut - rIn, start, span, amin, amax, faceIds: g.faces.map((f) => f.id) });
  }

  // espesor
  let T;
  if (bends.length) {
    const ts = bends.map((b) => b.T).sort((x, y) => x - y);
    T = ts[Math.floor(ts.length / 2)];
  } else {
    // dos planos paralelos opuestos más grandes
    const planes = faceInfo.filter((f) => f.type === 'plane').sort((x, y) => y.area - x.area);
    const p0 = planes[0];
    let best = null;
    for (const p of planes.slice(1)) {
      if (dot(p.normal, p0.normal) < -0.999) { const d = Math.abs(p.d + p0.d); if (d > 0.05 && (!best || p.area > best.area)) best = { area: p.area, d }; }
    }
    T = best ? best.d : 1;
    if (!best) warnings.push('No se pudo determinar el espesor; se asumió 1 mm.');
  }
  bends.forEach((b) => { if (Math.abs(b.T - T) > 0.05 * T + 0.02) warnings.push(`Doblez con espesor aparente ${b.T.toFixed(2)} mm distinto al nominal ${T.toFixed(2)} mm.`); });

  // pertenencia de cada vértice (clave) a la cuña de un doblez
  const tolR = 0.02 + T * 0.01, tolA = 0.004;
  const inWedge = new Int32Array(nK).fill(-1);
  const wedgeAng = new Float32Array(nK); // ángulo relativo dentro del doblez [0, span]
  const wedgeEnd = new Int8Array(nK); // -1 extremo inicio, +1 extremo fin, 0 interior
  for (let bi = 0; bi < bends.length; bi++) {
    const b = bends[bi];
    for (let k = 0; k < nK; k++) {
      const p = keyPos[k];
      const ax = dot(p, b.axis);
      if (ax < b.amin - tolR || ax > b.amax + tolR) continue;
      const q = sub(p, b.c2);
      const qx = dot(q, b.u), qy = dot(q, b.w);
      const rho = Math.hypot(qx, qy);
      if (rho < b.rIn - tolR || rho > b.rOut + tolR) continue;
      let ang = wrap(Math.atan2(qy, qx) - b.start);
      if (ang > TAU - tolA * 4) ang -= TAU;
      if (ang < -tolA * 4 || ang > b.span + tolA * 4) continue;
      // ángulo tolerante: radio pequeño => usar tolerancia lineal
      const tolAng = Math.max(tolA, (0.01) / Math.max(rho, 0.1));
      inWedge[k] = bi;
      wedgeAng[k] = Math.min(Math.max(ang, 0), b.span);
      wedgeEnd[k] = ang <= tolAng ? -1 : ang >= b.span - tolAng ? 1 : 0;
    }
  }

  // grafo de aristas entre claves, excluyendo interiores de cuña y cuerdas que cruzan un doblez
  const adj = Array.from({ length: nK }, () => []);
  const addEdge = (x, y) => {
    if (x === y) return;
    const bx = inWedge[x], by = inWedge[y];
    if (bx >= 0 && wedgeEnd[x] === 0) return;
    if (by >= 0 && wedgeEnd[y] === 0) return;
    if (bx >= 0 && bx === by && wedgeEnd[x] !== wedgeEnd[y]) return;
    adj[x].push(y); adj[y].push(x);
  };
  for (let t = 0; t < index.length / 3; t++) {
    const a = keyOf[index[3 * t]], b = keyOf[index[3 * t + 1]], c = keyOf[index[3 * t + 2]];
    addEdge(a, b); addEdge(b, c); addEdge(c, a);
  }
  const comp = new Int32Array(nK).fill(-1);
  let nComp = 0;
  for (let k = 0; k < nK; k++) {
    if (comp[k] >= 0 || (inWedge[k] >= 0 && wedgeEnd[k] === 0)) continue;
    const st = [k]; comp[k] = nComp;
    while (st.length) { const x = st.pop(); for (const y of adj[x]) if (comp[y] < 0) { comp[y] = nComp; st.push(y); } }
    nComp++;
  }
  // área por componente
  const compArea = new Float64Array(nComp);
  for (let t = 0; t < index.length / 3; t++) {
    const ks = [keyOf[index[3 * t]], keyOf[index[3 * t + 1]], keyOf[index[3 * t + 2]]];
    const c = ks.map((k) => comp[k]).find((c) => c >= 0);
    if (c === undefined) continue;
    const a = P(index[3 * t]), b = P(index[3 * t + 1]), cc = P(index[3 * t + 2]);
    compArea[c] += len(cross(sub(b, a), sub(cc, a))) / 2;
  }

  // componentes en cada extremo del doblez
  bends.forEach((b) => {
    const ends = { '-1': new Map(), '1': new Map() };
    for (let k = 0; k < nK; k++) if (inWedge[k] >= 0 && bends[inWedge[k]] === b && wedgeEnd[k] !== 0 && comp[k] >= 0) {
      const m = ends[wedgeEnd[k]]; m.set(comp[k], (m.get(comp[k]) || 0) + 1);
    }
    const top = (m) => [...m.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
    b.compStart = top(ends['-1']);
    b.compEnd = top(ends['1']);
  });
  const validBends = bends.filter((b) => b.compStart !== undefined && b.compEnd !== undefined && b.compStart !== b.compEnd);
  if (validBends.length < bends.length) warnings.push(`${bends.length - validBends.length} doblez(es) no separan la pieza en dos alas; se omiten del desdoblado.`);

  // árbol desde la componente de mayor área
  let root = 0;
  for (let c = 1; c < nComp; c++) if (compArea[c] > compArea[root]) root = c;
  const parentBend = new Int32Array(nComp).fill(-2); // -1 = raíz
  parentBend[root] = -1;
  const order = [root];
  const treeBends = [];
  for (let qi = 0; qi < order.length; qi++) {
    const c = order[qi];
    for (const b of validBends) {
      if (b.tree) continue;
      let other = null, parentEnd = 0;
      if (b.compStart === c) { other = b.compEnd; parentEnd = -1; }
      else if (b.compEnd === c) { other = b.compStart; parentEnd = 1; }
      if (other === null) continue;
      if (parentBend[other] !== -2) { b.loop = true; continue; }
      b.tree = true; b.parentComp = c; b.childComp = other; b.parentEnd = parentEnd;
      parentBend[other] = treeBends.length; treeBends.push(b);
      order.push(other);
    }
  }
  const loops = validBends.filter((b) => !b.tree);
  if (loops.length) warnings.push(`${loops.length} doblez(es) forman un lazo cerrado (esquinas unidas); no se pueden desdoblar.`);
  const unreached = [];
  for (let c = 0; c < nComp; c++) if (parentBend[c] === -2) unreached.push(c);
  if (unreached.length) warnings.push(`${unreached.length} región(es) no conectadas con la base (posibles cuerpos sueltos).`);

  // K y parámetros finales de cada doblez
  const kOf = (r) => opts.kFactor ?? (r / T < 1 ? 0.33 : r / T < 3 ? 0.4 : 0.45);
  treeBends.forEach((b, i) => {
    b.id = i;
    b.parentBend = parentBend[b.parentComp];
    b.sigma = b.parentEnd === -1 ? 1 : -1;
    b.phiP = b.parentEnd === -1 ? b.start : b.start + b.span; // ángulo del extremo del padre
    b.theta = b.span;
    b.k = kOf(b.rIn);
    b.Rn = b.rIn + b.k * T;
    const midAx = (b.amin + b.amax) / 2;
    b.C = add(b.c2, mul(b.axis, midAx)); // punto del eje a la mitad del largo
    b.eP = norm(add(mul(b.u, Math.cos(b.phiP)), mul(b.w, Math.sin(b.phiP))));
    b.tP = mul(cross(b.axis, b.eP), b.sigma); // tangente al iniciar el doblez (hacia el hijo)
    b.nP = mul(b.eP, -1); // hacia el centro
    b.O = add(b.C, mul(b.eP, b.Rn)); // origen sobre la fibra neutra (extremo del padre)
    b.length = b.amax - b.amin;
    b.arcNeutral = b.Rn * b.theta;
    b.depth = [];
  });
  // profundidad en el árbol (para secuencia por defecto)
  treeBends.forEach((b) => { let d = 0, p = b.parentBend; while (p >= 0) { d++; p = treeBends[p].parentBend; } b.depthInTree = d; });

  // etiqueta por clave: {bend: idx, alpha} o {comp}
  const keyBend = new Int32Array(nK).fill(-1);
  const keyAlpha = new Float32Array(nK);
  const keyComp = new Int32Array(nK).fill(-1);
  for (let k = 0; k < nK; k++) {
    if (inWedge[k] >= 0 && wedgeEnd[k] === 0) {
      const b = bends[inWedge[k]];
      if (b.tree) {
        keyBend[k] = b.id;
        keyAlpha[k] = b.parentEnd === -1 ? wedgeAng[k] : b.span - wedgeAng[k];
        continue;
      }
    }
    keyComp[k] = comp[k];
  }
  // vértices interiores de dobleces no desdoblables: asignarlos a la componente vecina
  for (let k = 0; k < nK; k++) if (keyBend[k] < 0 && keyComp[k] < 0) {
    const b = bends[inWedge[k]];
    keyComp[k] = b && b.compStart !== undefined ? b.compStart : root;
  }

  // longitudes de ala por doblez (desde la línea tangente)
  const compKeys = Array.from({ length: nComp }, () => []);
  for (let k = 0; k < nK; k++) if (keyComp[k] >= 0) compKeys[keyComp[k]].push(k);
  treeBends.forEach((b) => {
    const eC = rotate(b.eP, b.axis, b.sigma * b.theta);
    const tC = mul(cross(b.axis, eC), b.sigma);
    const tP = mul(b.tP, -1);
    const ext = (keys, origin, t) => keys.reduce((m, k) => Math.max(m, dot(sub(keyPos[k], origin), t)), 0);
    const OC = add(b.C, mul(eC, b.rOut)), OP = add(b.C, mul(b.eP, b.rOut));
    b.flangeChild = ext(compKeys[b.childComp], OC, tC);
    b.flangeParent = ext(compKeys[b.parentComp], OP, tP);
    // medida exterior típica (al vértice virtual) para el ala hija
    const setback = b.theta < Math.PI * 0.999 ? b.rOut * Math.tan(b.theta / 2) : b.rOut;
    b.flangeChildOut = b.flangeChild + setback;
    b.flangeParentOut = b.flangeParent + setback;
  });

  const model = {
    T, volume, totalArea, holeCount, warnings,
    bends: treeBends, root, nComp, compArea: [...compArea],
    nV, keyOf, keyPos, keyBend, keyAlpha, keyComp, positions,
    faceCount: faces.length,
  };
  // superficie de blanco y longitud de corte
  model.blankArea = volume / T;
  model.cutLength = Math.max(0, (totalArea - 2 * model.blankArea) / T);
  model.pierces = 1 + holeCount;
  // desarrollo plano
  const flat = deformPositions(model, treeBends.map(() => 0));
  model.flatBBox = flatExtents(model, flat);
  return model;
}

// ---------- cinemática de doblez ----------
// Transformación rígida del hijo del doblez b con progreso s (1 = formado, 0 = plano),
// expresada en coordenadas finales.
function neutralFrame(b, s, L) {
  // posición sobre la fibra neutra a longitud de arco L, con curvatura escalada s/Rn
  const kap = s / b.Rn;
  const phi = kap * L;
  let X, Y;
  if (Math.abs(kap) < 1e-9) { X = L; Y = 0; } else { X = Math.sin(phi) / kap; Y = (1 - Math.cos(phi)) / kap; }
  return { pos: add(b.O, add(mul(b.tP, X), mul(b.nP, Y))), phi };
}
export function childTransform(b, s) {
  const Lend = b.Rn * b.theta;
  const E1 = neutralFrame(b, 1, Lend).pos;
  const Es = neutralFrame(b, s, Lend).pos;
  const R = rotMat(b.axis, b.sigma * (s - 1) * b.theta);
  const t = sub(Es, applyR({ R }, E1));
  return { R, t };
}
function regionPoint(b, s, p, alpha) {
  // p en coordenadas finales dentro de la cuña; alpha = ángulo desde el extremo del padre
  const q = sub(p, b.C);
  const axial = dot(q, b.axis);
  const qr = sub(q, mul(b.axis, axial));
  const rho = len(qr);
  const d = rho - b.Rn;
  const L = b.Rn * alpha;
  const { pos, phi } = neutralFrame(b, s, L);
  const nC = add(mul(b.tP, -Math.sin(phi)), mul(b.nP, Math.cos(phi)));
  // el eje b.C está a la mitad del largo; O también, así que sumamos la componente axial
  return add(add(pos, mul(nC, -d)), mul(b.axis, axial));
}

/** Transformaciones globales de cada componente y doblez para el estado s[] */
export function kinematics(model, s) {
  const { bends, nComp, root } = model;
  const compT = new Array(nComp).fill(null);
  compT[root] = ident();
  const bendParentT = new Array(bends.length);
  // los dobleces están en orden BFS
  for (const b of bends) {
    const MP = compT[b.parentComp] || ident();
    bendParentT[b.id] = MP;
    compT[b.childComp] = compose(MP, childTransform(b, s[b.id]));
  }
  for (let c = 0; c < nComp; c++) if (!compT[c]) compT[c] = ident();
  return { compT, bendParentT };
}

export function deformPositions(model, s, out) {
  const { nV, keyOf, keyPos, keyBend, keyAlpha, keyComp, bends } = model;
  out = out || new Float32Array(nV * 3);
  const { compT, bendParentT } = kinematics(model, s);
  const nK = keyPos.length;
  const kp = new Float32Array(nK * 3);
  for (let k = 0; k < nK; k++) {
    let p;
    const bi = keyBend[k];
    if (bi >= 0) {
      const b = bends[bi];
      p = apply(bendParentT[bi], regionPoint(b, s[bi], keyPos[k], keyAlpha[k]));
    } else p = apply(compT[keyComp[k]], keyPos[k]);
    kp[3 * k] = p[0]; kp[3 * k + 1] = p[1]; kp[3 * k + 2] = p[2];
  }
  for (let i = 0; i < nV; i++) { const k = keyOf[i]; out[3 * i] = kp[3 * k]; out[3 * i + 1] = kp[3 * k + 1]; out[3 * i + 2] = kp[3 * k + 2]; }
  return out;
}

/** Marco actual del doblez b (en el estado s[]): eje, punto medio interior y dirección hacia el punzón */
export function bendFrame(model, s, bi) {
  const b = model.bends[bi];
  const { bendParentT } = kinematics(model, s);
  const MP = bendParentT[bi];
  const sb = s[bi];
  const Lmid = b.Rn * b.theta / 2;
  const { pos, phi } = neutralFrame(b, sb, Lmid);
  const nC = add(mul(b.tP, -Math.sin(phi)), mul(b.nP, Math.cos(phi)));
  const inner = add(pos, mul(nC, b.Rn - b.rIn));
  return {
    axis: norm(applyR(MP, b.axis)),
    up: norm(applyR(MP, nC)), // hacia el centro de curvatura = hacia el punzón
    inner: apply(MP, inner),
  };
}

function flatExtents(model, flat) {
  // proyección sobre el plano de la componente raíz (estado plano)
  const n = model.bends.length ? model.bends[0].nP : [0, 0, 1];
  const [u, w] = perpBasis(n);
  let minU = Infinity, maxU = -Infinity, minW = Infinity, maxW = -Infinity;
  // mejor orientación: probar rotaciones cada 1° para caja mínima
  const pts = [];
  for (let i = 0; i < flat.length; i += 3) pts.push([dot([flat[i], flat[i + 1], flat[i + 2]], u), dot([flat[i], flat[i + 1], flat[i + 2]], w)]);
  let best = null;
  for (let deg = 0; deg < 90; deg += 1) {
    const t = (deg * Math.PI) / 180, c = Math.cos(t), sn = Math.sin(t);
    minU = minW = Infinity; maxU = maxW = -Infinity;
    for (const [x, y] of pts) { const a = x * c + y * sn, b = -x * sn + y * c; if (a < minU) minU = a; if (a > maxU) maxU = a; if (b < minW) minW = b; if (b > maxW) maxW = b; }
    const area = (maxU - minU) * (maxW - minW);
    if (!best || area < best.area - 1e-6) best = { area, L: Math.max(maxU - minU, maxW - minW), W: Math.min(maxU - minU, maxW - minW), deg };
  }
  return best;
}

export const vec = { sub, add, mul, dot, cross, len, norm, rotate, perpBasis };
