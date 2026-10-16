// Dynamic tube mesh: outer and inner surfaces, end annuli and weld seam, deformed per material station by
// the kinematic poses. Vertex fields are sampled once at build; each frame only positions/normals change.
import * as THREE from 'three';
import { colorFor, rangesFromStats, legendFor, FLD_ZONES } from './colormaps.js';

const DEG = Math.PI / 180;

/**
 * Material stations s (0 = front … cutLength = rear): ≤ 2° of arc inside every bend, ≤ 0.5·OD on the
 * straights, plus every wall-profile breakpoint and both ends. Sorted, unique.
 */
export function buildStations(plan, OD) {
  const lay = plan.layout;
  const L = lay.cutLength;
  const out = [0, L];
  const step = 0.5 * OD;
  const fill = (a, b, n) => { for (let i = 1; i < n; i++) out.push(a + (b - a) * i / n); };
  const bends = (lay.bends || []).map((b, i) => {
    const pb = plan.bends?.[i];
    const st = plan.stacks?.find((x) => x.level === pb?.stack) ?? plan.stacks?.[pb?.stack ?? 0];
    const clr = st?.clr ?? st?.bendDie?.clr;
    let ang = clr > 0 ? (b.s1 - b.s0) / clr / DEG : NaN;
    if (!(ang > 0)) ang = pb?.angleLoad > 0 ? pb.angleLoad : 180;
    return { s0: b.s0, s1: b.s1, ang };
  }).sort((a, b) => a.s0 - b.s0);
  let cur = 0;
  for (const b of bends) {
    if (b.s0 > cur) fill(cur, b.s0, Math.ceil((b.s0 - cur) / step));
    out.push(b.s0, b.s1);
    fill(b.s0, b.s1, Math.max(1, Math.ceil(b.ang / 2 - 1e-9)));
    cur = Math.max(cur, b.s1);
  }
  if (L > cur) fill(cur, L, Math.ceil((L - cur) / step));
  for (const v of lay.breakpoints || []) if (v >= 0 && v <= L) out.push(v);
  out.sort((a, b) => a - b);
  const res = [];
  for (const v of out) if (!res.length || v - res[res.length - 1] > 1e-6) res.push(v);
  res[res.length - 1] = L; // exact rear end
  return Float64Array.from(res);
}

const _c = new THREE.Color();

/** Tube mesh. `group` holds every part; call build() then update() each frame. */
export class TubeMesh {
  constructor(materials) {
    this.M = materials;
    this.group = new THREE.Group();
    this.group.name = 'tube';
    this.mode = 'realistic';
    this.weldMaterial = new THREE.MeshStandardMaterial({ color: 0x9a8f80, metalness: 0.85, roughness: 0.6 });
    materials.clippable.push(this.weldMaterial);
    materials.tubeInner.side = THREE.DoubleSide;
    materials.tubeColorInner.side = THREE.DoubleSide;
    this.poses = null;
  }

  build({ s, ringSegments = 48, seamAngle = null, sampleVertex }) {
    this.disposeGeometry();
    const N = s.length, M = Math.max(8, ringSegments | 0), R = M + 1;
    this.s = Float64Array.from(s); this.N = N; this.Mseg = M;
    this.seam = Number.isFinite(seamAngle) ? seamAngle : null;
    const phi0 = this.seam ?? 0;
    this.phi0 = phi0;
    const cosA = new Float32Array(M), sinA = new Float32Array(M);
    for (let j = 0; j < M; j++) { const a = (phi0 + 360 * j / M) * DEG; cosA[j] = Math.cos(a); sinA[j] = Math.sin(a); }
    this.cosA = cosA; this.sinA = sinA;
    const NV = N * M;
    const rO0 = new Float32Array(NV), rI0 = new Float32Array(NV), dO = new Float32Array(NV), dI = new Float32Array(NV);
    const fT = new Float32Array(NV), fThin = new Float32Array(NV), fE1 = new Float32Array(NV), fE2 = new Float32Array(NV);
    const fZone = new Uint8Array(NV);
    const zoneIdx = Object.fromEntries(FLD_ZONES.map((z, i) => [z, i]));
    let tMin = Infinity, tMax = -Infinity, thinAbsMax = 0, e1Max = 0;
    for (let k = 0; k < N; k++) {
      for (let j = 0; j < M; j++) {
        const v = sampleVertex(this.s[k], phi0 + 360 * j / M);
        const i = k * M + j;
        rO0[i] = v.rOut0; rI0[i] = v.rIn0; dO[i] = v.dOut || 0; dI[i] = v.dIn || 0;
        const f = v.fields || {};
        fT[i] = Number.isFinite(f.t) ? f.t : v.rOut0 - v.rIn0;
        fThin[i] = f.thinningPct || 0; fE1[i] = f.e1 || 0; fE2[i] = f.e2 || 0;
        fZone[i] = zoneIdx[f.zone] ?? zoneIdx.insufficient;
        const t0 = v.rOut0 - v.rIn0;
        tMin = Math.min(tMin, fT[i], t0); tMax = Math.max(tMax, fT[i], t0);
        thinAbsMax = Math.max(thinAbsMax, Math.abs(fThin[i])); e1Max = Math.max(e1Max, fE1[i]);
      }
    }
    this.cache = { rO0, rI0, dO, dI, fT, fThin, fE1, fE2, fZone };
    this.ranges = rangesFromStats({ tMin, tMax, thinAbsMax, e1Max });
    // Formed-state local normals (account for dr/dφ from ovalization / wrinkles).
    const nOy = new Float32Array(NV), nOz = new Float32Array(NV), nIy = new Float32Array(NV), nIz = new Float32Array(NV);
    const dphi = 2 * Math.PI / M;
    for (let k = 0; k < N; k++) {
      for (let j = 0; j < M; j++) {
        const i = k * M + j, ip = k * M + (j + 1) % M, im = k * M + (j + M - 1) % M;
        for (const [r0, d, ny, nz] of [[rO0, dO, nOy, nOz], [rI0, dI, nIy, nIz]]) {
          const r = r0[i] + d[i];
          const dr = ((r0[ip] + d[ip]) - (r0[im] + d[im])) / (2 * dphi);
          const q = dr / Math.max(1e-6, r);
          // radial (c, s) − q · tangential (−s, c)
          const y = cosA[j] + q * sinA[j], z = sinA[j] - q * cosA[j];
          const l = Math.hypot(y, z) || 1;
          ny[i] = y / l; nz[i] = z / l;
        }
      }
    }
    this.normals = { nOy, nOz, nIy, nIz };

    // Geometries.
    const nv = N * R;
    const idxO = new Uint32Array((N - 1) * M * 6), idxI = new Uint32Array((N - 1) * M * 6);
    let p = 0;
    for (let k = 0; k < N - 1; k++) {
      for (let j = 0; j < M; j++) {
        const a = k * R + j, b = (k + 1) * R + j, c = b + 1, d = a + 1;
        idxO[p] = a; idxO[p + 1] = b; idxO[p + 2] = d; idxO[p + 3] = b; idxO[p + 4] = c; idxO[p + 5] = d;
        idxI[p] = a; idxI[p + 1] = d; idxI[p + 2] = b; idxI[p + 3] = b; idxI[p + 4] = d; idxI[p + 5] = c;
        p += 6;
      }
    }
    const uv = new Float32Array(nv * 2);
    const vScale = 1 / (Math.PI * (rO0[0] || 1)); // texture: u around (πOD), v repeats every πOD/2
    for (let k = 0; k < N; k++) for (let j = 0; j <= M; j++) { const o = (k * R + j) * 2; uv[o] = j / M; uv[o + 1] = this.s[k] * vScale * 2; }
    this.vScale = vScale * 2;
    const colors = new THREE.BufferAttribute(new Float32Array(nv * 3), 3);
    colors.setUsage(THREE.DynamicDrawUsage);
    const mk = (index, withUv) => {
      const g = new THREE.BufferGeometry();
      const pos = new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage);
      const nor = new THREE.BufferAttribute(new Float32Array(nv * 3), 3).setUsage(THREE.DynamicDrawUsage);
      g.setAttribute('position', pos); g.setAttribute('normal', nor); g.setAttribute('color', colors);
      if (withUv) g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(new THREE.BufferAttribute(index, 1));
      return g;
    };
    this.colors = colors;
    this.gOuter = mk(idxO, true);
    this.gInner = mk(idxI, false);
    // End annuli: rings [front outer, front inner, rear outer, rear inner] × R.
    const capPos = new Float32Array(4 * R * 3), capNor = new Float32Array(4 * R * 3), capCol = new Float32Array(4 * R * 3);
    const capIdx = [];
    for (let e = 0; e < 2; e++) {
      const o = e * 2 * R, ii = o + R;
      for (let j = 0; j < M; j++) {
        const a = o + j, b = o + j + 1, c = ii + j + 1, d = ii + j;
        // Front cap (s=0) faces local +X; rear faces −X.
        if (e === 0) capIdx.push(a, d, b, b, d, c); else capIdx.push(a, b, d, b, c, d);
      }
    }
    this.gCaps = new THREE.BufferGeometry();
    this.gCaps.setAttribute('position', new THREE.BufferAttribute(capPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.gCaps.setAttribute('normal', new THREE.BufferAttribute(capNor, 3).setUsage(THREE.DynamicDrawUsage));
    this.gCaps.setAttribute('color', new THREE.BufferAttribute(capCol, 3));
    this.gCaps.setIndex(capIdx);
    // Weld seam: 5 vertices across, raised bead.
    this.gSeam = null;
    if (this.seam != null) {
      const W = 5, halfW = Math.min(2.5, 0.06 * rO0[0]) / Math.max(1, rO0[0]); // rad
      const seamIdx = [];
      for (let k = 0; k < N - 1; k++) for (let w = 0; w < W - 1; w++) {
        const a = k * W + w, b = (k + 1) * W + w;
        seamIdx.push(a, b, a + 1, b, b + 1, a + 1);
      }
      const prof = [];
      for (let w = 0; w < W; w++) { const t = -1 + 2 * w / (W - 1); prof.push({ a: t * halfW, h: 0.06 + Math.max(0, 1 - t * t) * Math.min(0.6, 0.012 * rO0[0]) }); }
      this.seamProf = prof.map((q) => ({ c: Math.cos(q.a), s: Math.sin(q.a), h: q.h }));
      this.gSeam = new THREE.BufferGeometry();
      this.gSeam.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * W * 3), 3).setUsage(THREE.DynamicDrawUsage));
      this.gSeam.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(N * W * 3), 3).setUsage(THREE.DynamicDrawUsage));
      this.gSeam.setIndex(seamIdx);
    }

    const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); o.name = name; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; return o; };
    this.outer = mesh(this.gOuter, this.M.tubeOuter, 'tubeOuter');
    this.inner = mesh(this.gInner, this.M.tubeInner, 'tubeInner');
    this.inner.castShadow = false;
    this.caps = mesh(this.gCaps, this.M.tubeOuter, 'tubeCaps');
    this.group.add(this.outer, this.inner, this.caps);
    if (this.gSeam) { this.seamMesh = mesh(this.gSeam, this.weldMaterial, 'weldSeam'); this.seamMesh.castShadow = false; this.group.add(this.seamMesh); }
    this.formedFlag = new Int8Array(N).fill(-1);
    this.setColorMode(this.mode);
  }

  /** Recomputes the per-mode colour tables (formed / unformed) and applies them. */
  setColorMode(mode) {
    this.mode = mode;
    if (!this.cache) return;
    const real = mode === 'realistic';
    this.outer.material = real ? this.M.tubeOuter : this.M.tubeColor;
    this.inner.material = real ? this.M.tubeInner : this.M.tubeColorInner;
    this.caps.material = real ? this.M.tubeOuter : this.M.tubeColor;
    if (real) return;
    const { N, Mseg: M, cache: C } = this;
    const NV = N * M;
    const colF = new Float32Array(NV * 3), colU = new Float32Array(NV * 3);
    const fields = { t: 0, thinningPct: 0, e1: 0, e2: 0, zone: 'insufficient' };
    const rgb = [0, 0, 0];
    for (let i = 0; i < NV; i++) {
      fields.t = C.fT[i]; fields.thinningPct = C.fThin[i]; fields.e1 = C.fE1[i]; fields.e2 = C.fE2[i]; fields.zone = FLD_ZONES[C.fZone[i]];
      colorFor(mode, fields, this.ranges, rgb);
      _c.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
      colF[i * 3] = _c.r; colF[i * 3 + 1] = _c.g; colF[i * 3 + 2] = _c.b;
      fields.t = C.rO0[i] - C.rI0[i]; fields.thinningPct = 0; fields.e1 = 0; fields.e2 = 0; fields.zone = 'insufficient';
      colorFor(mode, fields, this.ranges, rgb);
      _c.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
      colU[i * 3] = _c.r; colU[i * 3 + 1] = _c.g; colU[i * 3 + 2] = _c.b;
    }
    this.colF = colF; this.colU = colU;
    this.formedFlag.fill(-1);
    if (this.lastFormed) this.updateColors(this.lastFormed);
  }

  getLegend(mode) {
    return legendFor(mode, this.ranges || rangesFromStats({ tMin: 1, tMax: 1, thinAbsMax: 0, e1Max: 0 }));
  }

  updateColors(formed) {
    if (this.mode === 'realistic' || !this.colF) return;
    const { N, Mseg: M } = this, R = M + 1;
    const col = this.colors.array;
    let changed = false;
    for (let k = 0; k < N; k++) {
      const fl = formed && formed[k] > 0.5 ? 1 : 0;
      if (fl === this.formedFlag[k]) continue;
      this.formedFlag[k] = fl; changed = true;
      const src = fl ? this.colF : this.colU;
      for (let j = 0; j <= M; j++) {
        const si = (k * M + (j % M)) * 3, di = (k * R + j) * 3;
        col[di] = src[si]; col[di + 1] = src[si + 1]; col[di + 2] = src[si + 2];
      }
    }
    if (changed) {
      this.colors.needsUpdate = true;
      const cc = this.gCaps.attributes.color.array;
      for (let e = 0; e < 2; e++) {
        const k = e === 0 ? 0 : N - 1;
        for (let q = 0; q < 2; q++) for (let j = 0; j <= M; j++) {
          const di = ((e * 2 + q) * R + j) * 3, si = (k * R + j) * 3;
          cc[di] = col[si]; cc[di + 1] = col[si + 1]; cc[di + 2] = col[si + 2];
        }
      }
      this.gCaps.attributes.color.needsUpdate = true;
    }
  }

  /** poses: 16·N column-major (local section frame → world); formed: N values 0..1. */
  update(poses, formed) {
    if (!this.cache) return;
    this.poses = poses; this.lastFormed = formed;
    const { N, Mseg: M, cosA, sinA } = this, R = M + 1;
    const { rO0, rI0, dO, dI } = this.cache;
    const { nOy, nOz, nIy, nIz } = this.normals;
    const pO = this.gOuter.attributes.position.array, nO = this.gOuter.attributes.normal.array;
    const pI = this.gInner.attributes.position.array, nI = this.gInner.attributes.normal.array;
    for (let k = 0; k < N; k++) {
      const o = 16 * k;
      const m4 = poses[o + 4], m5 = poses[o + 5], m6 = poses[o + 6];
      const m8 = poses[o + 8], m9 = poses[o + 9], m10 = poses[o + 10];
      const tx = poses[o + 12], ty = poses[o + 13], tz = poses[o + 14];
      const f = formed ? formed[k] : 0, g = 1 - f;
      const base = k * M;
      let w = k * R * 3;
      for (let jj = 0; jj <= M; jj++, w += 3) {
        const j = jj === M ? 0 : jj;
        const i = base + j;
        const c = cosA[j], s = sinA[j];
        let r = rO0[i] + f * dO[i];
        let ly = r * c, lz = r * s;
        pO[w] = m4 * ly + m8 * lz + tx; pO[w + 1] = m5 * ly + m9 * lz + ty; pO[w + 2] = m6 * ly + m10 * lz + tz;
        let ny = g * c + f * nOy[i], nz = g * s + f * nOz[i];
        nO[w] = m4 * ny + m8 * nz; nO[w + 1] = m5 * ny + m9 * nz; nO[w + 2] = m6 * ny + m10 * nz;
        r = rI0[i] + f * dI[i];
        ly = r * c; lz = r * s;
        pI[w] = m4 * ly + m8 * lz + tx; pI[w + 1] = m5 * ly + m9 * lz + ty; pI[w + 2] = m6 * ly + m10 * lz + tz;
        ny = -(g * c + f * nIy[i]); nz = -(g * s + f * nIz[i]);
        nI[w] = m4 * ny + m8 * nz; nI[w + 1] = m5 * ny + m9 * nz; nI[w + 2] = m6 * ny + m10 * nz;
      }
    }
    this.gOuter.attributes.position.needsUpdate = true; this.gOuter.attributes.normal.needsUpdate = true;
    this.gInner.attributes.position.needsUpdate = true; this.gInner.attributes.normal.needsUpdate = true;
    // Caps.
    const cp = this.gCaps.attributes.position.array, cn = this.gCaps.attributes.normal.array;
    for (let e = 0; e < 2; e++) {
      const k = e === 0 ? 0 : N - 1, o = 16 * k, sg = e === 0 ? 1 : -1;
      const nx = sg * poses[o], ny = sg * poses[o + 1], nz = sg * poses[o + 2];
      for (let q = 0; q < 2; q++) {
        const src = q === 0 ? pO : pI;
        for (let j = 0; j <= M; j++) {
          const di = ((e * 2 + q) * R + j) * 3, si = (k * R + j) * 3;
          cp[di] = src[si]; cp[di + 1] = src[si + 1]; cp[di + 2] = src[si + 2];
          cn[di] = nx; cn[di + 1] = ny; cn[di + 2] = nz;
        }
      }
    }
    this.gCaps.attributes.position.needsUpdate = true; this.gCaps.attributes.normal.needsUpdate = true;
    // Seam bead (follows ring vertex j = 0, which sits at the seam angle).
    if (this.gSeam) {
      const sp = this.gSeam.attributes.position.array, sn = this.gSeam.attributes.normal.array;
      const prof = this.seamProf, W = prof.length;
      const c0 = cosA[0], s0 = sinA[0];
      for (let k = 0; k < N; k++) {
        const o = 16 * k, i = k * M, f = formed ? formed[k] : 0;
        const m4 = poses[o + 4], m5 = poses[o + 5], m6 = poses[o + 6], m8 = poses[o + 8], m9 = poses[o + 9], m10 = poses[o + 10];
        const r0 = rO0[i] + f * dO[i];
        for (let q = 0; q < W; q++) {
          const pr = prof[q];
          const c = c0 * pr.c - s0 * pr.s, s = s0 * pr.c + c0 * pr.s;
          const r = r0 + pr.h, ly = r * c, lz = r * s, w = (k * W + q) * 3;
          sp[w] = m4 * ly + m8 * lz + poses[o + 12]; sp[w + 1] = m5 * ly + m9 * lz + poses[o + 13]; sp[w + 2] = m6 * ly + m10 * lz + poses[o + 14];
          sn[w] = m4 * c + m8 * s; sn[w + 1] = m5 * c + m9 * s; sn[w + 2] = m6 * c + m10 * s;
        }
      }
      this.gSeam.attributes.position.needsUpdate = true; this.gSeam.attributes.normal.needsUpdate = true;
    }
    this.updateColors(formed);
  }

  /** World matrix of the section frame at material station s (interpolated between stations). */
  poseAt(s, out = new THREE.Matrix4()) {
    if (!this.poses) return null;
    const S = this.s, N = this.N;
    let lo = 0, hi = N - 1;
    s = Math.min(S[N - 1], Math.max(S[0], s));
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (S[mid] <= s) lo = mid; else hi = mid; }
    const f = S[hi] > S[lo] ? (s - S[lo]) / (S[hi] - S[lo]) : 0;
    const P = this.poses, a = 16 * lo, b = 16 * hi, near = f < 0.5 ? a : b;
    const e = out.elements;
    for (let c = 0; c < 16; c++) e[c] = P[near + c];
    e[12] = P[a + 12] + (P[b + 12] - P[a + 12]) * f;
    e[13] = P[a + 13] + (P[b + 13] - P[a + 13]) * f;
    e[14] = P[a + 14] + (P[b + 14] - P[a + 14]) * f;
    return out;
  }

  /** Ray pick on the outer surface → { s, phi, point } or null. */
  pick(raycaster) {
    if (!this.outer || !this.group.visible) return null;
    this.gOuter.computeBoundingSphere();
    this.gOuter.computeBoundingBox();
    const hits = raycaster.intersectObject(this.outer, false);
    if (!hits.length) return null;
    const h = hits[0];
    const s = h.uv ? h.uv.y / this.vScale : null;
    let phi = h.uv ? this.phi0 + 360 * h.uv.x : null;
    if (phi != null) { phi %= 360; if (phi < 0) phi += 360; }
    return { s, phi, point: [h.point.x, h.point.y, h.point.z] };
  }

  disposeGeometry() {
    for (const g of [this.gOuter, this.gInner, this.gCaps, this.gSeam]) g?.dispose();
    this.group.clear();
    this.cache = null; this.poses = null; this.lastFormed = null;
  }

  dispose() { this.disposeGeometry(); this.weldMaterial.dispose(); }
}
