// Pruebas del vectorizador ráster (image-trace.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { traceImage } from '../src/importers/image-trace.js';
import { buildLoops, loopInfo, buildRegions } from '../src/geom2d/loops.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);
const count = (segs, t) => segs.filter((s) => s.type === t).length;

// Imagen RGBA con supermuestreo ss×ss; inside(x, y) en coordenadas de salida (px, Y hacia arriba).
function render(W, H, inside, { ss = 4, ink = 30, paper = 245 } = {}) {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      let cov = 0;
      for (let b = 0; b < ss; b++)
        for (let a = 0; a < ss; a++) if (inside(i + (a + 0.5) / ss, H - (j + (b + 0.5) / ss))) cov++;
      const v = paper + ((ink - paper) * cov) / (ss * ss), p = (j * W + i) * 4;
      data[p] = data[p + 1] = data[p + 2] = Math.round(v);
      data[p + 3] = 255;
    }
  return { width: W, height: H, data };
}

const inRoundRect = (cx, cy, w, h, R) => (x, y) => {
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  if (dx > w / 2 || dy > h / 2) return false;
  const qx = dx - (w / 2 - R), qy = dy - (h / 2 - R);
  return qx <= 0 || qy <= 0 || qx * qx + qy * qy <= R * R;
};

function closedLoops(segments) {
  const { loops, open } = buildLoops(segments, { tol: 1e-6 });
  assert.equal(open.length, 0, 'cadenas abiertas');
  return loops;
}

// Decodificador PNG mínimo (8 bits, sin entrelazado; gris, RGB, gris+alfa, RGBA) → RGBA.
function decodePNG(buf) {
  assert.equal(buf.toString('latin1', 1, 4), 'PNG');
  let pos = 8, W = 0, H = 0, ct = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('latin1', pos + 4, pos + 8), body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      W = body.readUInt32BE(0);
      H = body.readUInt32BE(4);
      ct = body[9];
      assert.equal(body[8], 8, 'solo 8 bits');
      assert.equal(body[12], 0, 'sin entrelazado');
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[ct];
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = W * bpp;
  const px = new Uint8Array(H * stride);
  for (let j = 0; j < H; j++) {
    const f = raw[j * (stride + 1)], src = j * (stride + 1) + 1, o = j * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? px[o + i - bpp] : 0, b = j ? px[o - stride + i] : 0, c = i >= bpp && j ? px[o - stride + i - bpp] : 0;
      let pr = 0;
      if (f === 1) pr = a;
      else if (f === 2) pr = b;
      else if (f === 3) pr = (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[o + i] = (raw[src + i] + pr) & 255;
    }
  }
  const data = new Uint8ClampedArray(W * H * 4);
  for (let k = 0; k < W * H; k++) {
    const s = k * bpp, d = k * 4;
    if (ct === 0 || ct === 4) data[d] = data[d + 1] = data[d + 2] = px[s];
    else (data[d] = px[s]), (data[d + 1] = px[s + 1]), (data[d + 2] = px[s + 2]);
    data[d + 3] = ct === 4 ? px[s + 1] : ct === 6 ? px[s + 3] : 255;
  }
  return { width: W, height: H, data };
}

test('disco r = 100 antialiasado → un círculo con r y centro a < 0.3 px', () => {
  const cx = 150.3, cy = 170.7;
  const img = render(300, 320, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= 100 * 100);
  const { segments, stats } = traceImage(img);
  assert.equal(segments.length, 1);
  const c = segments[0];
  assert.equal(c.type, 'circle');
  assert.equal(c.ccw, true, 'exterior antihorario');
  near(c.r, 100, 0.3, 'radio');
  near(c.c[0], cx, 0.3, 'cx');
  near(c.c[1], cy, 0.3, 'cy');
  assert.deepEqual([stats.contours, stats.circles, stats.arcs, stats.lines], [1, 1, 0, 0]);
});

test('cuadrado 200×200 → 4 rectas unidas, área a ±0.5 %', () => {
  const x0 = 50.25, y0 = 60.75;
  const img = render(300, 300, (x, y) => x >= x0 && x <= x0 + 200 && y >= y0 && y <= y0 + 200);
  const { segments } = traceImage(img);
  assert.deepEqual(segments.map((s) => s.type), ['line', 'line', 'line', 'line']);
  const loops = closedLoops(segments);
  assert.equal(loops.length, 1);
  const info = loopInfo(loops[0]);
  assert.ok(info.signedArea > 0, 'exterior antihorario');
  near(info.area, 40000, 200, 'área');
  near(info.bbox.minX, x0, 0.2, 'minX');
  near(info.bbox.maxY, y0 + 200, 0.2, 'maxY');
});

test('anillo → 2 contornos; buildRegions: 1 región con 1 agujero', () => {
  const img = render(260, 260, (x, y) => {
    const d2 = (x - 130) ** 2 + (y - 130) ** 2;
    return d2 <= 100 * 100 && d2 >= 50 * 50;
  });
  const { segments } = traceImage(img);
  const loops = closedLoops(segments);
  assert.equal(loops.length, 2);
  const { regions } = buildRegions(loops);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 1);
  const hole = segments.find((s) => s.r < 75);
  assert.equal(hole.ccw, false, 'agujero horario');
  near(hole.r, 50, 0.3, 'radio del agujero');
});

test('Otsu entre dos grises planos (40 / 220) → ~130; invert traza la parte clara', () => {
  const sq = (x, y) => x >= 60 && x <= 140 && y >= 60 && y <= 140;
  const img = render(200, 200, sq, { ss: 1, ink: 220, paper: 40 }); // cuadrado claro sobre fondo oscuro
  const normal = traceImage(img);
  near(normal.threshold, 130, 1, 'umbral');
  // Sin invertir, el material es el fondo oscuro: marco de la imagen + agujero cuadrado.
  assert.equal(closedLoops(normal.segments).length, 2);
  const inv = traceImage(img, { invert: true });
  assert.equal(inv.threshold, normal.threshold);
  const loops = closedLoops(inv.segments);
  assert.equal(loops.length, 1);
  const info = loopInfo(loops[0]);
  assert.ok(info.signedArea > 0);
  near(info.area, 80 * 80, 1e-6, 'área del cuadrado claro');
  // Umbral manual: 0..255 aceptado, fuera de rango rechazado.
  assert.equal(traceImage(img, { threshold: 100 }).threshold, 100);
  assert.throws(() => traceImage(img, { threshold: 300 }), /Umbral/);
});

test('rectángulo redondeado → rectas + arcos con radios a ±1 px', () => {
  const R = 40;
  const img = render(500, 340, inRoundRect(250.4, 170.2, 400, 240, R));
  const { segments, stats } = traceImage(img);
  assert.equal(stats.arcs, 4);
  assert.equal(stats.lines, 4);
  for (const s of segments.filter((s) => s.type === 'arc')) near(s.r, R, 1, 'radio');
  const info = loopInfo(closedLoops(segments)[0]);
  near(info.area, 400 * 240 - (4 - Math.PI) * R * R, 0.005 * 400 * 240, 'área');
});

test('samples/pieza-escaneada.png → 1 región con 4 agujeros y cotas reales', () => {
  const img = decodePNG(fs.readFileSync(new URL('../samples/pieza-escaneada.png', import.meta.url)));
  assert.deepEqual([img.width, img.height], [1200, 800]);
  const { segments, stats } = traceImage(img);
  const loops = closedLoops(segments);
  const { regions } = buildRegions(loops);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 4);
  assert.equal(stats.contours, 5);
  // Barrenos: Ø80 en (300, 400), Ø60 en (900, 250) y (900, 550) en coordenadas de imagen (Y abajo).
  const H = 800;
  for (const [x, y, D] of [[300, 400, 80], [900, 250, 60], [900, 550, 60]]) {
    const c = segments.find((s) => s.type === 'circle' && Math.hypot(s.c[0] - x, s.c[1] - (H - y)) < 3);
    assert.ok(c, `barreno en (${x}, ${y})`);
    near(2 * c.r, D, 0.01 * D, `Ø${D}`);
  }
  const outer = loopInfo(loops[regions[0].outer]).bbox;
  near(outer.minX, 100, 1, 'minX');
  near(outer.maxX, 1100, 1, 'maxX');
  near(outer.minY, 100, 1, 'minY');
  near(outer.maxY, 700, 1, 'maxY');
});

test('rendimiento: 2000×2000 en menos de 1.5 s', () => {
  const W = 2000, H = 2000;
  const outer = inRoundRect(1000, 1000, 1800, 1800, 100);
  const img = render(W, H, (x, y) => {
    if (!outer(x, y)) return false;
    const gx = (x - 200) / 160, gy = (y - 200) / 160, ix = Math.round(gx), iy = Math.round(gy);
    if (ix >= 0 && ix <= 10 && iy >= 0 && iy <= 10 && (gx - ix) ** 2 + (gy - iy) ** 2 <= 0.25 ** 2) return false;
    return true;
  }, { ss: 1 });
  traceImage(img); // calentamiento del JIT
  const t0 = performance.now();
  const { stats } = traceImage(img);
  const ms = performance.now() - t0;
  assert.equal(stats.contours, 122);
  assert.ok(ms < 1500, `${ms.toFixed(0)} ms`);
});
