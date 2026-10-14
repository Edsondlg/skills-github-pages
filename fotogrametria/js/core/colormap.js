// Mapas de color para profundidad, desviación y confianza.

// Aproximación polinómica del mapa "Turbo" (Google). t en [0,1] -> [r,g,b] en [0,1].
export function turbo(t) {
  t = Math.max(0, Math.min(1, t));
  const r = 0.13572138 + t * (4.61539260 + t * (-42.66032258 + t * (132.13108234 + t * (-152.94239396 + t * 59.28637943))));
  const g = 0.09140261 + t * (2.19418839 + t * (4.84296658 + t * (-14.18503333 + t * (4.27729857 + t * 2.82956604))));
  const b = 0.10667330 + t * (12.64194608 + t * (-60.58204836 + t * (110.36276771 + t * (-89.90310912 + t * 27.34824973))));
  return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
}

// Divergente azul-verde-rojo para desviaciones con signo (v en [-1, 1]); verde en 0.
export function deviationColor(v, tolFrac = 0.33) {
  const a = Math.max(-1, Math.min(1, v));
  if (Math.abs(a) <= tolFrac) {
    const k = Math.abs(a) / tolFrac;
    return a < 0 ? [0.1 * k, 0.75 + 0.1 * k, 0.25 + 0.5 * k] : [0.25 + 0.6 * k, 0.8, 0.2 - 0.1 * k];
  }
  const k = (Math.abs(a) - tolFrac) / (1 - tolFrac);
  return a < 0 ? [0.1 - 0.1 * k, 0.85 - 0.65 * k, 0.75 + 0.25 * k] : [0.85 + 0.15 * k, 0.8 - 0.7 * k, 0.1];
}

// Imagen RGBA (Uint8ClampedArray) de un mapa de profundidad con valores inválidos en gris.
export function depthToImage(depth, W, H, valid, { lo = null, hi = null } = {}) {
  let mn = Infinity, mx = -Infinity;
  if (lo === null || hi === null) {
    const vals = [];
    for (let i = 0; i < depth.length; i += 7) if (valid(i)) vals.push(depth[i]);
    vals.sort((a, b) => a - b);
    mn = vals[Math.floor(vals.length * 0.02)] ?? 0; mx = vals[Math.floor(vals.length * 0.98)] ?? 1;
  } else { mn = lo; mx = hi; }
  const img = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    if (!valid(i)) { img[4 * i] = 40; img[4 * i + 1] = 42; img[4 * i + 2] = 46; img[4 * i + 3] = 255; continue; }
    const [r, g, b] = turbo(1 - (depth[i] - mn) / (mx - mn || 1));
    img[4 * i] = r * 255; img[4 * i + 1] = g * 255; img[4 * i + 2] = b * 255; img[4 * i + 3] = 255;
  }
  return img;
}
