// Genera samples/pieza-escaneada.png (node scripts/make-samples-raster.mjs): "escaneo" sintético
// de una junta para probar el vectorizador ráster.
//
// Imagen 1200 × 800 px RGB, coordenadas de imagen (px, Y hacia abajo). Cotas reales:
//   Contorno exterior: rectángulo redondeado 1000 × 600, esquinas R60, centrado en (600, 400)
//                      → x 100…1100, y 100…700.
//   Barrenos: Ø80 en (300, 400); Ø60 en (900, 250); Ø60 en (900, 550).
//   Ranura: 240 × 120 con esquinas R30, centrada en (600, 400) → x 480…720, y 340…460.
// Papel ≈ 245 y pieza ≈ 30 con ruido suave y bajo (±3, cuantizado) y un ligero degradado de
// iluminación; bordes antialiasados por supermuestreo 4 × 4.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200, H = 800, SS = 4;

const inRoundRect = (cx, cy, w, h, R) => (x, y) => {
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  if (dx > w / 2 || dy > h / 2) return false;
  const qx = dx - (w / 2 - R), qy = dy - (h / 2 - R);
  return qx <= 0 || qy <= 0 || qx * qx + qy * qy <= R * R;
};
const inCircle = (cx, cy, D) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= (D / 2) ** 2;
const outer = inRoundRect(600, 400, 1000, 600, 60);
const holes = [inCircle(300, 400, 80), inCircle(900, 250, 60), inCircle(900, 550, 60), inRoundRect(600, 400, 240, 120, 30)];
const inside = (x, y) => outer(x, y) && !holes.some((h) => h(x, y));

// PRNG determinista (mulberry32).
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Ruido de valor suave: rejilla aleatoria cada `cell` px, interpolación con smoothstep.
function valueNoise(cell, amp, seed) {
  const r = rng(seed), gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2;
  const g = Float64Array.from({ length: gw * gh }, () => (r() * 2 - 1) * amp);
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = x / cell, fy = y / cell, i = Math.floor(fx), j = Math.floor(fy), u = sm(fx - i), v = sm(fy - j);
    const a = g[j * gw + i], b = g[j * gw + i + 1], c = g[(j + 1) * gw + i], d = g[(j + 1) * gw + i + 1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
const paperNoise = valueNoise(48, 3, 7), inkNoise = valueNoise(64, 3, 11);

const px = Buffer.alloc(W * H * 3);
for (let j = 0; j < H; j++)
  for (let i = 0; i < W; i++) {
    let cov = 0;
    // Solo supermuestrear cerca de bordes: si las 4 esquinas coinciden, el píxel es uniforme.
    const c00 = inside(i, j), uniform = c00 === inside(i + 1, j) && c00 === inside(i, j + 1) && c00 === inside(i + 1, j + 1);
    if (uniform) cov = c00 ? 1 : 0;
    else {
      for (let b = 0; b < SS; b++) for (let a = 0; a < SS; a++) if (inside(i + (a + 0.5) / SS, j + (b + 0.5) / SS)) cov++;
      cov /= SS * SS;
    }
    const paper = 246 - (4 * i) / W + paperNoise(i, j), ink = 30 + inkNoise(i, j);
    const v = Math.round(paper + (ink - paper) * cov);
    const p = (j * W + i) * 3;
    px[p] = px[p + 1] = px[p + 2] = v;
  }

// ---------- Escritor PNG (RGB 8 bits, filtro por fila con la heurística de suma mínima) ----------
const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, body) {
  const out = Buffer.alloc(12 + body.length);
  out.writeUInt32BE(body.length, 0);
  out.write(type, 4, 'latin1');
  body.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + body.length)), 8 + body.length);
  return out;
}
function encodePNG(rgb, W, H) {
  const bpp = 3, stride = W * bpp, raw = Buffer.alloc(H * (stride + 1)), cand = Buffer.alloc(stride);
  for (let j = 0; j < H; j++) {
    const o = j * stride;
    let bestF = 0, bestS = Infinity, best = null;
    for (let f = 0; f < 5; f++) {
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? rgb[o + i - bpp] : 0, b = j ? rgb[o - stride + i] : 0, c = i >= bpp && j ? rgb[o - stride + i - bpp] : 0;
        let pr = 0;
        if (f === 1) pr = a;
        else if (f === 2) pr = b;
        else if (f === 3) pr = (a + b) >> 1;
        else if (f === 4) {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (rgb[o + i] - pr) & 255;
        cand[i] = v;
        sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestS) (bestS = sum), (bestF = f), (best = Buffer.from(cand));
    }
    raw[j * (stride + 1)] = bestF;
    best.copy(raw, j * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bits
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const file = path.join(root, 'samples', 'pieza-escaneada.png');
const png = encodePNG(px, W, H);
fs.writeFileSync(file, png);
console.log(`${path.relative(root, file)}: ${W}×${H}, ${(png.length / 1024).toFixed(1)} KB`);
