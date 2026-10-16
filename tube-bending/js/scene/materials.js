// PBR materials and procedural canvas textures for the tube bending scene.
import * as THREE from 'three';

// Deterministic PRNG so textures are identical between runs (stable screenshots).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Tileable value noise sampled on a canvas-sized grid (periodic in both axes).
function valueNoise(w, h, cell, seed) {
  const r = rng(seed);
  const gw = Math.max(1, Math.round(w / cell)), gh = Math.max(1, Math.round(h / cell));
  const g = new Float32Array(gw * gh).map(() => r());
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const fy = y / h * gh, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
    const y0 = iy % gh, y1 = (iy + 1) % gh;
    for (let x = 0; x < w; x++) {
      const fx = x / w * gw, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
      const x0 = ix % gw, x1 = (ix + 1) % gw;
      const a = g[y0 * gw + x0], b = g[y0 * gw + x1], c = g[y1 * gw + x0], d = g[y1 * gw + x1];
      out[y * w + x] = (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
    }
  }
  return out;
}

function fbm(w, h, octaves, baseCell, seed) {
  const out = new Float32Array(w * h);
  let amp = 1, sum = 0;
  for (let o = 0; o < octaves; o++) {
    const n = valueNoise(w, h, Math.max(2, baseCell / (1 << o)), seed + o * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    sum += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= sum;
  return out;
}

function toTexture(c, srgb, renderer) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
  t.needsUpdate = true;
  return t;
}

function writeGray(c, values, lo, hi, tint = [1, 1, 1]) {
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(c.width, c.height);
  for (let i = 0; i < values.length; i++) {
    const v = lo + (hi - lo) * Math.min(1, Math.max(0, values[i]));
    img.data[i * 4] = v * tint[0] * 255;
    img.data[i * 4 + 1] = v * tint[1] * 255;
    img.data[i * 4 + 2] = v * tint[2] * 255;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Brushed streak field: lines run along canvas Y (constant per column with slow variation),
 * i.e. streaks parallel to the texture V direction.
 */
function brushedField(w, h, seed, { seamWidth = 0 } = {}) {
  const r = rng(seed);
  const col = new Float32Array(w);
  for (let x = 0; x < w; x++) col[x] = r();
  // Smooth a little across columns, keep high-frequency content.
  const colS = new Float32Array(w);
  for (let x = 0; x < w; x++) colS[x] = 0.5 * col[x] + 0.25 * col[(x + 1) % w] + 0.25 * col[(x + w - 1) % w];
  const slow = valueNoise(w, h, 64, seed + 7);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[y * w + x] = 0.55 * colS[x] + 0.45 * slow[y * w + x];
  // Long scratches.
  for (let k = 0; k < 90; k++) {
    const x = Math.floor(r() * w), y0 = Math.floor(r() * h), len = Math.floor(h * (0.1 + 0.6 * r()));
    const v = r() < 0.5 ? 0 : 1;
    for (let j = 0; j < len; j++) { const y = (y0 + j) % h; out[y * w + x] = out[y * w + x] * 0.4 + v * 0.6; }
  }
  if (seamWidth > 0) {
    // Weld seam centred on u = 0 (wraps on both edges).
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.min(x, w - x);
      if (d < seamWidth) out[y * w + x] = -1 - 0.15 * slow[y * w + x]; // marker: < 0 = seam
    }
  }
  return out;
}

function makeTubeTextures(renderer) {
  const w = 1024, h = 512;
  const f = brushedField(w, h, 11, { seamWidth: 5 });
  const cMap = canvas(w, h), cRough = canvas(w, h);
  const ctxM = cMap.getContext('2d'), ctxR = cRough.getContext('2d');
  const im = ctxM.createImageData(w, h), ir = ctxR.createImageData(w, h);
  for (let i = 0; i < f.length; i++) {
    const v = f[i];
    let m, rr;
    if (v < 0) { // seam: slightly darker straw/blue heat tint, rougher
      const s = -v - 1;
      m = [0.60 - 0.05 * s, 0.57 - 0.05 * s, 0.52 - 0.03 * s];
      rr = 0.62;
    } else {
      const g = 0.80 + 0.14 * v;
      m = [g, g, g * 1.01];
      rr = 0.20 + 0.22 * v;
    }
    im.data[i * 4] = m[0] * 255; im.data[i * 4 + 1] = m[1] * 255; im.data[i * 4 + 2] = Math.min(1, m[2]) * 255; im.data[i * 4 + 3] = 255;
    ir.data[i * 4] = ir.data[i * 4 + 1] = ir.data[i * 4 + 2] = rr * 255; ir.data[i * 4 + 3] = 255;
  }
  ctxM.putImageData(im, 0, 0); ctxR.putImageData(ir, 0, 0);
  return { map: toTexture(cMap, true, renderer), roughnessMap: toTexture(cRough, false, renderer) };
}

function makeBrushedTextures(renderer, seed) {
  const w = 512, h = 512;
  const f = brushedField(w, h, seed);
  return {
    map: toTexture(writeGray(canvas(w, h), f, 0.78, 0.95), true, renderer),
    roughnessMap: toTexture(writeGray(canvas(w, h), f, 0.22, 0.45), false, renderer),
  };
}

// Machined (lathe) finish: fine rings along canvas X lines (constant per row).
function makeMachinedTextures(renderer) {
  const w = 256, h = 512;
  const r = rng(31);
  const row = new Float32Array(h).map(() => r());
  const n = valueNoise(w, h, 32, 33);
  const f = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) f[y * w + x] = 0.6 * row[y] + 0.4 * n[y * w + x];
  return {
    map: toTexture(writeGray(canvas(w, h), f, 0.82, 1.0), true, renderer),
    roughnessMap: toTexture(writeGray(canvas(w, h), f, 0.28, 0.48), false, renderer),
  };
}

// Painted metal: orange-peel micro noise.
function makePaintTextures(renderer) {
  const w = 256, h = 256;
  const f = fbm(w, h, 4, 64, 51);
  return {
    map: toTexture(writeGray(canvas(w, h), f, 0.9, 1.0), true, renderer),
    roughnessMap: toTexture(writeGray(canvas(w, h), f, 0.38, 0.55), false, renderer),
  };
}

function makeConcreteTextures(renderer) {
  const w = 1024, h = 1024;
  const f = fbm(w, h, 6, 256, 71);
  const r = rng(72);
  const cMap = canvas(w, h), cRough = canvas(w, h);
  const ctxM = cMap.getContext('2d'), ctxR = cRough.getContext('2d');
  const im = ctxM.createImageData(w, h), ir = ctxR.createImageData(w, h);
  for (let i = 0; i < f.length; i++) {
    let v = 0.62 + 0.22 * (f[i] - 0.5);
    const speck = r();
    if (speck < 0.02) v -= 0.08 * r(); else if (speck > 0.985) v += 0.06 * r();
    im.data[i * 4] = v * 0.98 * 255; im.data[i * 4 + 1] = v * 0.97 * 255; im.data[i * 4 + 2] = v * 0.95 * 255; im.data[i * 4 + 3] = 255;
    const rv = 0.78 + 0.18 * (1 - f[i]);
    ir.data[i * 4] = ir.data[i * 4 + 1] = ir.data[i * 4 + 2] = rv * 255; ir.data[i * 4 + 3] = 255;
  }
  ctxM.putImageData(im, 0, 0); ctxR.putImageData(ir, 0, 0);
  // Saw-cut slab joints along the edges (tile = one slab).
  ctxM.fillStyle = 'rgba(60,58,55,0.55)';
  ctxM.fillRect(0, 0, w, 3); ctxM.fillRect(0, 0, 3, h);
  return { map: toTexture(cMap, true, renderer), roughnessMap: toTexture(cRough, false, renderer) };
}

export function makeGradientBackground(top = '#c9ced6', bottom = '#eef0f2') {
  const c = canvas(4, 512);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top); g.addColorStop(0.62, bottom); g.addColorStop(1, '#dcdfe3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Builds the material library. Tool materials (`tool*`) are separate instances so the cutaway
 * clipping planes can be applied to tools without affecting the machine.
 */
export function createMaterials(renderer) {
  const tubeTex = makeTubeTextures(renderer);
  const brushed = makeBrushedTextures(renderer, 21);
  const machined = makeMachinedTextures(renderer);
  const paint = makePaintTextures(renderer);
  const concrete = makeConcreteTextures(renderer);

  const painted = (color, rough = 1) => new THREE.MeshStandardMaterial({
    color, map: paint.map, roughnessMap: paint.roughnessMap, roughness: rough, metalness: 0.15,
  });

  const toolSteel = new THREE.MeshStandardMaterial({
    color: 0x4a515c, metalness: 0.9, roughness: 1.0, map: machined.map, roughnessMap: machined.roughnessMap,
    envMapIntensity: 1.0,
  });

  const m = {
    textures: { tubeTex, brushed, machined, paint, concrete },
    // Tube
    tubeOuter: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 1.0, roughness: 1.0, map: tubeTex.map, roughnessMap: tubeTex.roughnessMap,
      envMapIntensity: 1.15,
    }),
    tubeInner: new THREE.MeshStandardMaterial({
      color: 0xb8b2a8, metalness: 0.85, roughness: 0.55, envMapIntensity: 0.8,
    }),
    tubeColor: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.55 }),
    tubeColorInner: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.7, color: 0xcfcfcf }),
    // Machine
    paintYellow: painted(0xf2b705, 1.0),        // ≈ RAL 1003 signal yellow
    paintGrey: painted(0xc4c9cf, 1.0),          // light cool grey cabinet
    paintGreyDark: painted(0x8d939b, 1.0),
    paintBlack: painted(0x1c1d20, 0.9),
    paintOrange: painted(0xd8431c, 0.9),        // gearbox block
    blackMachined: new THREE.MeshStandardMaterial({ color: 0x1a1b1e, metalness: 0.7, roughness: 0.38 }),
    vent: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.3, roughness: 0.7 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xf0f1f3, metalness: 1.0, roughness: 0.07 }),
    steel: new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 1.0, roughness: 1.0, map: brushed.map, roughnessMap: brushed.roughnessMap,
    }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.0, roughness: 0.75 }),
    blockRed: new THREE.MeshStandardMaterial({ color: 0xb3221c, metalness: 0.4, roughness: 0.4 }),
    blockGreen: new THREE.MeshStandardMaterial({ color: 0x2f8f3a, metalness: 0.4, roughness: 0.4 }),
    floor: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: concrete.map, roughnessMap: concrete.roughnessMap, roughness: 1.0, metalness: 0.0,
    }),
    // Tools (clippable instances)
    toolSteel,
    toolChrome: new THREE.MeshStandardMaterial({ color: 0xeceef0, metalness: 1.0, roughness: 0.08 }),
    toolBlack: new THREE.MeshStandardMaterial({ color: 0x18191c, metalness: 0.7, roughness: 0.4 }),
    toolSerrated: new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.9, roughness: 0.6 }),
    // Mandrel
    mandrelChrome: new THREE.MeshStandardMaterial({ color: 0xf4f5f7, metalness: 1.0, roughness: 0.05 }),
    mandrelBronze: new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.95, roughness: 0.3 }),
    // Overlay
    marker: new THREE.MeshBasicMaterial({ color: 0x00b4ff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
    markerRing: new THREE.MeshBasicMaterial({ color: 0x00b4ff, transparent: true, opacity: 0.9 }),
  };
  m.clippable = [m.toolSteel, m.toolChrome, m.toolBlack, m.toolSerrated, m.tubeOuter, m.tubeInner, m.tubeColor, m.tubeColorInner];
  return m;
}

/** Tint the tube steel according to the material family (stainless, carbon steel, aluminium, copper…). */
export function applyTubeTint(materials, material) {
  const fam = String(material?.family || '').toLowerCase();
  let color = 0xffffff, inner = 0xb8b2a8;
  if (/alum/.test(fam)) { color = 0xf2f4f7; inner = 0xc8ccd2; }
  else if (/cobre|copper/.test(fam)) { color = 0xe8a27a; inner = 0xb07050; }
  else if (/lat[oó]n|brass/.test(fam)) { color = 0xe8cf82; inner = 0xb09a5a; }
  else if (/titan/.test(fam)) { color = 0xd9d6cf; inner = 0xa8a49a; }
  else if (/inox|stainless/.test(fam)) { color = 0xffffff; inner = 0xbdb9b2; }
  else if (fam) { color = 0xd6d8da; inner = 0x8f8a80; } // carbon / alloy steel: slightly darker
  materials.tubeOuter.color.setHex(color);
  materials.tubeInner.color.setHex(inner);
}
