// Utilidades de imagen en escala de grises (sin dependencias del DOM).

export function grayFromRGBA(data, w, h) {
  const g = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) {
    g[i] = (data[j] * 77 + data[j + 1] * 150 + data[j + 2] * 29 + 128) >> 8;
  }
  return g;
}

// Reducción por un factor entero s (promedio de bloques s x s).
export function downsampleBox(gray, w, h, s) {
  if (s <= 1) return { gray, w, h };
  const nw = Math.floor(w / s), nh = Math.floor(h / s);
  const out = new Uint8Array(nw * nh);
  const inv = 1 / (s * s);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      let sum = 0;
      for (let dy = 0; dy < s; dy++) {
        const row = (y * s + dy) * w + x * s;
        for (let dx = 0; dx < s; dx++) sum += gray[row + dx];
      }
      out[y * nw + x] = Math.round(sum * inv);
    }
  }
  return { gray: out, w: nw, h: nh };
}

// Imagen integral (w+1)*(h+1).
export function integral(gray, w, h) {
  const W = w + 1;
  const I = new Float64Array(W * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    const o = (y + 1) * W, p = y * W, g = y * w;
    for (let x = 0; x < w; x++) {
      rowSum += gray[g + x];
      I[o + x + 1] = I[p + x + 1] + rowSum;
    }
  }
  return I;
}

// Muestreo bilineal (coordenadas con centros de píxel en enteros).
export function bilinear(gray, w, h, x, y) {
  if (x < 0) x = 0; else if (x > w - 1) x = w - 1;
  if (y < 0) y = 0; else if (y > h - 1) y = h - 1;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = x0 + 1 < w ? x0 + 1 : x0, y1 = y0 + 1 < h ? y0 + 1 : y0;
  const fx = x - x0, fy = y - y0;
  const a = gray[y0 * w + x0], b = gray[y0 * w + x1], c = gray[y1 * w + x0], d = gray[y1 * w + x1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

// Desenfoque gaussiano separable -> Float32Array.
export function gaussianBlur(src, w, h, sigma) {
  const r = Math.max(1, Math.ceil(sigma * 3));
  const k = new Float32Array(2 * r + 1);
  let s = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); s += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= s;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        let xx = x + i; if (xx < 0) xx = 0; else if (xx >= w) xx = w - 1;
        acc += src[o + xx] * k[i + r];
      }
      tmp[o + x] = acc;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) {
        let yy = y + i; if (yy < 0) yy = 0; else if (yy >= h) yy = h - 1;
        acc += tmp[yy * w + x] * k[i + r];
      }
      out[y * w + x] = acc;
    }
  }
  return out;
}

// Nitidez: varianza del laplaciano (en una versión reducida si la imagen es grande).
export function sharpness(gray, w, h) {
  let s = 1;
  while (Math.max(w, h) / s > 1600) s++;
  const d = downsampleBox(gray, w, h, s);
  const g = d.gray, W = d.w, H = d.h;
  let sum = 0, sum2 = 0, n = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const lap = g[i - 1] + g[i + 1] + g[i - W] + g[i + W] - 4 * g[i];
      sum += lap; sum2 += lap * lap; n++;
    }
  }
  const m = sum / n;
  return sum2 / n - m * m;
}

// Contraste global (desviación estándar) y exposición media.
export function exposureStats(gray) {
  let s = 0, s2 = 0, clipLo = 0, clipHi = 0;
  const step = Math.max(1, Math.floor(gray.length / 500000));
  let n = 0;
  for (let i = 0; i < gray.length; i += step) {
    const v = gray[i]; s += v; s2 += v * v; n++;
    if (v <= 2) clipLo++; else if (v >= 253) clipHi++;
  }
  const mean = s / n;
  return { mean, std: Math.sqrt(Math.max(0, s2 / n - mean * mean)), clipLow: clipLo / n, clipHigh: clipHi / n };
}
