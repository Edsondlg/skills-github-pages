// Estéreo multivista PatchMatch en GPU (WebGL2): profundidad + normal por píxel con planos inclinados.
// Las imágenes de trabajo están corregidas de distorsión, recortadas a la región de interés y
// escaladas a un tamaño común W x H (cada vista tiene su propia K de trabajo).
import { GPU } from './gpu.js';

const PREP_FS = `#version 300 es
precision highp float;
uniform sampler2D uSrc;
uniform vec2 uSrcSize;
uniform vec4 uK;
uniform vec4 uD;
uniform float uK3;
uniform vec3 uRoi;
uniform float uLod;
layout(location=0) out vec4 oColor;
layout(location=1) out vec4 oGray;
void main() {
  vec2 pw = gl_FragCoord.xy - 0.5;
  vec2 pf = (pw + 0.5) / uRoi.x + uRoi.yz - 0.5;
  vec2 xn = (pf - uK.zw) / uK.xy;
  float r2 = dot(xn, xn);
  float L = 1.0 + r2 * (uD.x + r2 * (uD.y + r2 * uK3));
  vec2 xd = xn * L + vec2(2.0 * uD.z * xn.x * xn.y + uD.w * (r2 + 2.0 * xn.x * xn.x),
                          uD.z * (r2 + 2.0 * xn.y * xn.y) + 2.0 * uD.w * xn.x * xn.y);
  vec2 po = xd * uK.xy + uK.zw;
  vec2 tc = (po + 0.5) / uSrcSize;
  vec4 c = textureLod(uSrc, tc, uLod);
  if (tc.x < 0.0 || tc.y < 0.0 || tc.x > 1.0 || tc.y > 1.0) c = vec4(0.0, 0.0, 0.0, 0.0);
  oColor = c;
  oGray = vec4(dot(c.rgb, vec3(0.299, 0.587, 0.114)));
}`;

const PM_FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
#define MAXS 8
#define WR 5
#define WSTEP 2
#define NW 36
uniform sampler2DArray uGray;
uniform sampler2D uState;
uniform sampler2D uCost;
uniform int uRef;
uniform int uNSrc;
uniform int uSrc[MAXS];
uniform mat3 uRrs[MAXS];
uniform vec3 uTrs[MAXS];
uniform vec4 uKs[MAXS];
uniform vec4 uKr;
uniform vec2 uSize;
uniform int uMode;
uniform int uParity;
uniform float uSeedF;
uniform float uPerturb;
uniform int uTopK;
uniform mat3 uRr;
uniform vec3 uTr;
uniform vec3 uBoxMin;
uniform vec3 uBoxMax;
uniform vec4 uTable;
uniform float uSigmaC;
uniform float uMinStd;
uniform int uExplore;
layout(location=0) out vec4 oState;
layout(location=1) out vec4 oCost;

float gRef[NW];
float gW[NW];
float gSw, gMr, gVr;

uint pcg(uint v) {
  uint state = v * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}
float rnd(inout uint s) { s = pcg(s); return float(s) * (1.0 / 4294967296.0); }
vec3 rayOf(vec2 p) { return vec3((p.x - uKr.z) / uKr.x, (p.y - uKr.w) / uKr.y, 1.0); }
vec3 randUnit(inout uint s) {
  float z = 2.0 * rnd(s) - 1.0;
  float ph = 6.2831853 * rnd(s);
  float r = sqrt(max(0.0, 1.0 - z * z));
  return vec3(r * cos(ph), r * sin(ph), z);
}
vec3 facing(vec3 n, vec3 ray) {
  if (dot(n, ray) >= -1e-3) return -normalize(ray);
  return n;
}
vec3 randomNormal(vec3 ray, inout uint s) {
  vec3 n = normalize(-normalize(ray) + 0.95 * randUnit(s));
  return facing(n, ray);
}
vec3 perturbNormal(vec3 n, vec3 ray, float sc, inout uint s) {
  vec3 m = normalize(n + sc * randUnit(s));
  if (dot(m, ray) >= -1e-3) return n;
  return m;
}
vec2 depthRange(vec3 ray) {
  mat3 Rt = transpose(uRr);
  vec3 C = -(Rt * uTr);
  vec3 dw = Rt * ray;
  dw = vec3(abs(dw.x) < 1e-9 ? 1e-9 : dw.x, abs(dw.y) < 1e-9 ? 1e-9 : dw.y, abs(dw.z) < 1e-9 ? 1e-9 : dw.z);
  vec3 t0 = (uBoxMin - C) / dw;
  vec3 t1 = (uBoxMax - C) / dw;
  vec3 tmn = min(t0, t1), tmx = max(t0, t1);
  float a = max(max(tmn.x, tmn.y), tmn.z);
  float b = min(min(tmx.x, tmx.y), tmx.z);
  return vec2(max(a, 1.0), b);
}
void prepareRef(ivec2 ip) {
  float c = texelFetch(uGray, ivec3(ip, uRef), 0).r;
  int k = 0;
  float sw = 0.0, sr = 0.0, srr = 0.0;
  ivec2 lim = ivec2(uSize) - 1;
  float i2s = 1.0 / (2.0 * uSigmaC * uSigmaC);
  for (int j = -WR; j <= WR; j += WSTEP) {
    for (int i = -WR; i <= WR; i += WSTEP) {
      ivec2 q = clamp(ip + ivec2(i, j), ivec2(0), lim);
      float v = texelFetch(uGray, ivec3(q, uRef), 0).r;
      float dc = v - c;
      float w = exp(-dc * dc * i2s - float(i * i + j * j) / float(2 * WR * WR));
      gRef[k] = v; gW[k] = w;
      sw += w; sr += w * v; srr += w * v * v;
      k++;
    }
  }
  gSw = sw; gMr = sr / sw; gVr = max(srr / sw - gMr * gMr, 0.0);
}
float costHyp(vec3 ray, vec3 n, float d) {
  vec3 X = d * ray;
  float rho = dot(n, X);
  if (rho > -1e-6) return 2.0;
  float cs[MAXS];
  int nv = 0;
  for (int s = 0; s < MAXS; s++) {
    if (s >= uNSrc) break;
    mat3 A = uRrs[s] + outerProduct(uTrs[s], n) / rho;
    vec3 Yp = A * ray;
    vec3 ax = A[0] / uKr.x;
    vec3 ay = A[1] / uKr.y;
    vec4 Ks = uKs[s];
    float layer = float(uSrc[s]);
    float ss = 0.0, sss = 0.0, srs = 0.0;
    bool ok = true;
    int k = 0;
    for (int j = -WR; j <= WR; j += WSTEP) {
      for (int i = -WR; i <= WR; i += WSTEP) {
        vec3 Y = Yp + float(i) * ax + float(j) * ay;
        vec2 uv = Ks.xy * Y.xy / Y.z + Ks.zw;
        ok = ok && Y.z > 0.0 && uv.x >= 0.0 && uv.y >= 0.0 && uv.x <= uSize.x - 1.0 && uv.y <= uSize.y - 1.0;
        float v = texture(uGray, vec3((uv + 0.5) / uSize, layer)).r;
        float w = gW[k];
        ss += w * v; sss += w * v * v; srs += w * v * gRef[k];
        k++;
      }
    }
    float c = 2.0;
    if (ok) {
      float ms = ss / gSw;
      float vs = sss / gSw - ms * ms;
      float cv = srs / gSw - gMr * ms;
      if (vs > uMinStd * uMinStd) c = clamp(1.0 - cv / sqrt(vs * gVr), 0.0, 2.0);
      nv++;
    }
    cs[s] = c;
  }
  if (nv == 0) return 2.0;
  for (int a = 1; a < MAXS; a++) {
    if (a >= uNSrc) break;
    float key = cs[a];
    int b = a - 1;
    while (b >= 0 && cs[b] > key) { cs[b + 1] = cs[b]; b--; }
    cs[b + 1] = key;
  }
  int K = min(uTopK, uNSrc);
  float sum = 0.0;
  for (int a = 0; a < MAXS; a++) { if (a >= K) break; sum += cs[a]; }
  return sum / float(K);
}
const ivec2 OFFS[8] = ivec2[8](ivec2(-1, 0), ivec2(1, 0), ivec2(0, -1), ivec2(0, 1), ivec2(-5, 0), ivec2(5, 0), ivec2(0, -5), ivec2(0, 5));
void main() {
  ivec2 ip = ivec2(gl_FragCoord.xy);
  vec4 st = texelFetch(uState, ip, 0);
  float c0 = texelFetch(uCost, ip, 0).r;
  if (uMode == 1 && ((ip.x + ip.y) & 1) != uParity) { oState = st; oCost = vec4(c0, 0.0, 0.0, 0.0); return; }
  vec2 p = vec2(ip);
  vec3 ray = rayOf(p);
  vec2 dr = depthRange(ray);
  if (dr.y <= dr.x) { oState = vec4(0.0, 0.0, -1.0, 0.0); oCost = vec4(2.0, 0.0, 0.0, 0.0); return; }
  prepareRef(ip);
  if (sqrt(gVr) < uMinStd) { oState = vec4(0.0, 0.0, -1.0, 0.0); oCost = vec4(2.0, 0.0, 0.0, 0.0); return; }
  uint seed = pcg(uint(ip.x) * 1973u + pcg(uint(ip.y) * 9277u + uint(uSeedF)));
  vec3 bn; float bd; float bc;
  float range = dr.y - dr.x;
  if (uMode == 0 || st.w <= 0.0) {
    bd = mix(dr.x, dr.y, rnd(seed));
    bn = randomNormal(ray, seed);
    bc = costHyp(ray, bn, bd);
    for (int r = 0; r < 2; r++) {
      float d2 = mix(dr.x, dr.y, rnd(seed));
      vec3 n2 = randomNormal(ray, seed);
      float c = costHyp(ray, n2, d2);
      if (c < bc) { bc = c; bn = n2; bd = d2; }
    }
  } else {
    bn = st.xyz; bd = st.w; bc = c0;
  }
  if (uMode == 2) {
    bc = costHyp(ray, bn, bd);
  } else {
    if (uMode == 1) {
      for (int k = 0; k < 8; k++) {
        ivec2 q = ip + OFFS[k];
        if (q.x < 0 || q.y < 0 || q.x >= int(uSize.x) || q.y >= int(uSize.y)) continue;
        vec4 sq = texelFetch(uState, q, 0);
        if (sq.w <= 0.0) continue;
        vec3 nq = sq.xyz;
        float den = dot(nq, ray);
        if (den > -1e-6) continue;
        float d = dot(nq, sq.w * rayOf(vec2(q))) / den;
        if (d < dr.x || d > dr.y) continue;
        float c = costHyp(ray, nq, d);
        if (c < bc) { bc = c; bn = nq; bd = d; }
      }
    }
    if (dot(uTable.xyz, uTable.xyz) > 0.5) {
      float den = dot(uTable.xyz, ray);
      if (den < -1e-6) {
        float d = uTable.w / den;
        if (d >= dr.x && d <= dr.y) {
          float c = costHyp(ray, uTable.xyz, d);
          if (c < bc) { bc = c; bn = uTable.xyz; bd = d; }
        }
      }
    }
    if (uMode == 1) {
      int nr = uExplore == 1 ? 4 : 3;
      for (int r = 0; r < 4; r++) {
        if (r >= nr) break;
        float d2 = bd; vec3 n2 = bn;
        if (r == 3) { d2 = mix(dr.x, dr.y, rnd(seed)); n2 = randomNormal(ray, seed); }
        else {
          if (r != 1) d2 = clamp(bd + (rnd(seed) - 0.5) * uPerturb * range, dr.x, dr.y);
          if (r != 0) n2 = perturbNormal(bn, ray, min(1.0, 3.0 * uPerturb), seed);
        }
        float c = costHyp(ray, n2, d2);
        if (c < bc) { bc = c; bn = n2; bd = d2; }
      }
    }
  }
  oState = vec4(bn, bd);
  oCost = vec4(bc, 0.0, 0.0, 0.0);
}`;

function colMajor3(R) { return [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]]; }

export class PatchMatchEngine {
  constructor({ width, height, numViews, gpu = null }) {
    this.gpu = gpu || new GPU();
    const g = this.gpu;
    if (numViews > g.maxLayers) throw new Error(`Demasiadas vistas para la GPU (${numViews} > ${g.maxLayers}).`);
    this.W = width; this.H = height; this.N = numViews;
    this.prep = g.program(PREP_FS);
    this.pm = g.program(PM_FS);
    this.gray = g.textureArray(width, height, numViews, { internal: 'R16F', filter: 'linear' });
    this.colorArr = g.textureArray(width, height, numViews, { internal: 'RGBA8', filter: 'linear' });
    this.state = [g.texture2D(width, height, { internal: 'RGBA32F' }), g.texture2D(width, height, { internal: 'RGBA32F' })];
    this.cost = [g.texture2D(width, height, { internal: 'R32F' }), g.texture2D(width, height, { internal: 'R32F' })];
    this.cams = new Array(numViews);
  }

  // Prepara la vista i: corrige distorsión, recorta y escala. source: ImageBitmap/canvas/ImageData.
  // Kfull: intrínsecos completos con distorsión; roi: { x0, y0, s } (s = escala trabajo/original).
  async prepareView(i, source, Kfull, roi, { readColor = true } = {}) {
    const g = this.gpu, gl = g.gl;
    const sw = source.width, sh = source.height;
    const tex = g.texture2D(sw, sh, { internal: 'RGBA8', source, filter: 'linear', mip: true });
    const lod = Math.max(0, Math.log2(1 / roi.s) - 0.25);
    g.run(this.prep, [{ tex: this.colorArr, layer: i }, { tex: this.gray, layer: i }], this.W, this.H, {
      uSrcSize: [sw, sh], uK: [Kfull.fx, Kfull.fy, Kfull.cx, Kfull.cy], uD: [Kfull.k1, Kfull.k2, Kfull.p1, Kfull.p2], uK3: Kfull.k3 || 0,
      uRoi: [roi.s, roi.x0, roi.y0], uLod: lod,
    }, { uSrc: tex });
    g.deleteTexture(tex);
    // K de trabajo (estenopeica, sin distorsión)
    const s = roi.s;
    this.cams[i] = {
      fx: Kfull.fx * s, fy: Kfull.fy * s,
      cx: s * Kfull.cx + s * (0.5 - roi.x0) - 0.5, cy: s * Kfull.cy + s * (0.5 - roi.y0) - 0.5,
    };
    let color = null;
    if (readColor) color = g.read(this.colorArr, { layer: i });
    await g.finish();
    return { color, Kw: this.cams[i] };
  }

  readColor(i) { return this.gpu.read(this.colorArr, { layer: i }); }

  setPose(i, R, t) { this.cams[i] = { ...this.cams[i], R, t }; }

  // Calcula el mapa de profundidad de la vista ref usando las vistas fuente srcs.
  async computeDepth(ref, srcs, o = {}) {
    const p = {
      iterations: 7, topK: Math.min(3, srcs.length), sigmaC: 0.3, minStd: 0.012,
      box: null, table: true, perturb0: 0.3, perturbDecay: 0.5, perturbMin: 0.004, seed: 1, ...o,
    };
    const g = this.gpu;
    const cr = this.cams[ref];
    const nS = Math.min(8, srcs.length);
    const Rrs = [], Trs = [], Ks = [], layers = [];
    for (let k = 0; k < 8; k++) {
      if (k < nS) {
        const cs = this.cams[srcs[k]];
        // X_s = Rs Rr^T X_r + (ts - Rs Rr^T tr)
        const R = mul3(cs.R, tr3(cr.R));
        const tv = sub3(cs.t, mulv3(R, cr.t));
        Rrs.push(...colMajor3(R)); Trs.push(...tv); Ks.push(cs.fx, cs.fy, cs.cx, cs.cy); layers.push(srcs[k]);
      } else { Rrs.push(1, 0, 0, 0, 1, 0, 0, 0, 1); Trs.push(0, 0, 0); Ks.push(1, 1, 0, 0); layers.push(0); }
    }
    const box = p.box || { min: [-1e4, -1e4, -1e4], max: [1e4, 1e4, 1e4] };
    // plano de la mesa (Z = 0) en coordenadas de la cámara de referencia: n·X = rho
    const nc = [cr.R[2], cr.R[5], cr.R[8]];
    const rho = nc[0] * cr.t[0] + nc[1] * cr.t[1] + nc[2] * cr.t[2];
    const base = {
      uRef: ref, uNSrc: nS, uSrc: layers, uRrs: Rrs, uTrs: Trs, uKs: Ks,
      uKr: [cr.fx, cr.fy, cr.cx, cr.cy], uSize: [this.W, this.H], uTopK: Math.max(1, Math.min(p.topK, nS)),
      uRr: colMajor3(cr.R), uTr: cr.t, uBoxMin: box.min, uBoxMax: box.max,
      uTable: p.table ? [nc[0], nc[1], nc[2], rho] : [0, 0, 0, 0], uSigmaC: p.sigmaC, uMinStd: p.minStd,
    };
    let a = 0;
    const tex = { uGray: this.gray };
    g.run(this.pm, [this.state[1 - a], this.cost[1 - a]], this.W, this.H, { ...base, uMode: 0, uParity: 0, uSeedF: p.seed * 7919 % 100000, uPerturb: 0, uExplore: 0 }, { ...tex, uState: this.state[a], uCost: this.cost[a] });
    a = 1 - a;
    let pert = p.perturb0;
    for (let it = 0; it < p.iterations; it++) {
      for (let parity = 0; parity < 2; parity++) {
        g.run(this.pm, [this.state[1 - a], this.cost[1 - a]], this.W, this.H, {
          ...base, uMode: 1, uParity: parity, uSeedF: (p.seed * 131 + it * 17 + parity * 7 + 3) % 100000, uPerturb: pert, uExplore: it < p.iterations / 2 ? 1 : 0,
        }, { ...tex, uState: this.state[a], uCost: this.cost[a] });
        a = 1 - a;
      }
      pert = Math.max(p.perturbMin, pert * p.perturbDecay);
      await g.finish();
    }
    const st = g.read(this.state[a]);
    const cs = g.read(this.cost[a]);
    const n = this.W * this.H;
    const depth = new Float32Array(n), normal = new Float32Array(3 * n), cost = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      normal[3 * i] = st[4 * i]; normal[3 * i + 1] = st[4 * i + 1]; normal[3 * i + 2] = st[4 * i + 2];
      depth[i] = st[4 * i + 3];
      cost[i] = cs[4 * i];
    }
    return { depth, normal, cost, W: this.W, H: this.H, K: { fx: cr.fx, fy: cr.fy, cx: cr.cx, cy: cr.cy }, R: cr.R, t: cr.t };
  }

  dispose() {
    const g = this.gpu;
    for (const t of [this.gray, this.colorArr, ...this.state, ...this.cost]) g.deleteTexture(t);
  }
}

function mul3(A, B) {
  const C = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  return C;
}
function tr3(A) { return [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]]; }
function mulv3(A, v) { return [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]]; }
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
