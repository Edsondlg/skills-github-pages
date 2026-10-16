// Genera los planos DXF de ejemplo en samples/ (node scripts/make-samples-dxf.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DxfWriter } from './dxf-writer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'samples');
const D = Math.PI / 180;
const B90 = Math.tan(Math.PI / 8); // bulge de un arco de 90°

// Capas y tipos de línea habituales.
function sheet(opts) {
  const w = new DxfWriter(opts);
  w.addLtype('CENTER', 'Center ____ _ ____ _', [31.75, -6.35, 6.35, -6.35]);
  w.addLtype('HIDDEN', 'Hidden __ __ __', [6.35, -3.175]);
  w.addLayer('CONTORNO', { color: 7 })
    .addLayer('BARRENOS', { color: 3 })
    .addLayer('EJES', { color: 1, linetype: 'CENTER' })
    .addLayer('OCULTAS', { color: 6, linetype: 'HIDDEN' })
    .addLayer('COTAS', { color: 2 })
    .addLayer('TEXTO', { color: 4 });
  return w;
}
const cross = (w, c, r) => {
  w.line([c[0] - r, c[1]], [c[0] + r, c[1]], { layer: 'EJES' });
  w.line([c[0], c[1] - r], [c[0], c[1] + r], { layer: 'EJES' });
};
// Bloque anónimo de cota (*Dn): geometría que NO debe importarse.
const dimBlock = (w, name, p1, p2, at) =>
  w.block(name, [0, 0], (b) => {
    b.line(p1, [p1[0], at[1]]).line(p2, [p2[0], at[1]]).line([p1[0], at[1]], [p2[0], at[1]]);
  });

// 1. Placa soporte troquelada 150×80, esquinas R6, muesca 20×15, ranura 30×10, 4×Ø8.5 y Ø25.
function placa() {
  const w = sheet({ insunits: 4 });
  dimBlock(w, '*D1', [0, 0], [150, 0], [0, -12]);
  dimBlock(w, '*D2', [150, 0], [150, 80], [162, 0]);
  dimBlock(w, '*D3', [65, 0], [85, 0], [0, -6]);
  w.lwpolyline(
    [[6, 0], [65, 0], [65, 15], [85, 15], [85, 0], [144, 0, B90], [150, 6], [150, 74, B90], [144, 80], [6, 80, B90], [0, 74], [0, 6, B90]],
    true,
    { layer: 'CONTORNO' },
  );
  w.lwpolyline([[65, 62], [85, 62, 1], [85, 72], [65, 72, 1]], true, { layer: 'CONTORNO' });
  for (const c of [[15, 15], [135, 15], [15, 65], [135, 65]]) {
    w.circle(c, 4.25, { layer: 'BARRENOS' });
    cross(w, c, 7);
  }
  w.circle([75, 40], 12.5, { layer: 'BARRENOS' });
  cross(w, [75, 40], 16);
  w.line([58, 67], [92, 67], { layer: 'EJES' });
  w.dimension([0, 0], [150, 0], [75, -12], '*D1', { layer: 'COTAS' });
  w.dimension([150, 0], [150, 80], [162, 40], '*D2', { layer: 'COTAS' });
  w.dimension([65, 0], [85, 0], [75, -6], '*D3', { layer: 'COTAS' });
  w.text([0, 90], 5, 'PLACA SOPORTE  e=3 mm  4x%%c8.5', 0, { layer: 'TEXTO' });
  w.mtext([0, 100], 3.5, '{\\fArial|b0;Material:} Acero SAE 1010\\PTolerancia \\U+00B10.1', { layer: 'TEXTO' });
  return w;
}

// 2. Brida Ø150, barreno Ø60 con cuñero de 10, 8×Ø14 en PCD 110 por bloques anidados.
function brida() {
  const w = sheet({ insunits: 4 });
  w.block('BARRENO', [0, 0], (b) => b.circle([0, 0], 7, { color: 0 }));
  // Base (10, 10): el barreno queda a 55 del punto de inserción.
  w.block('BARRENO_PCD', [10, 10], (b) => b.insert('BARRENO', [65, 10]));
  w.circle([0, 0], 75, { layer: 'CONTORNO' });
  const yk = Math.sqrt(30 * 30 - 5 * 5), a = Math.atan2(yk, 5) / D;
  w.arc([0, 0], 30, 180 - a, a, { layer: 'CONTORNO' });
  w.line([5, yk], [5, 34], { layer: 'CONTORNO' });
  w.line([5, 34], [-5, 34], { layer: 'CONTORNO' });
  w.line([-5, 34], [-5, yk], { layer: 'CONTORNO' });
  for (let k = 0; k < 8; k++) w.insert('BARRENO_PCD', [0, 0], { rot: 22.5 + 45 * k }, { layer: 'BARRENOS' });
  w.circle([0, 0], 55, { layer: 'EJES' });
  cross(w, [0, 0], 82);
  w.text([-40, -95], 5, 'BRIDA %%c150 - 8 BARRENOS %%c14 EN PCD 110', 0, { layer: 'TEXTO' });
  return w;
}

// 3. Medio perfil de flecha escalonada (revolución en X), cerrado sobre el eje y = 0.
function eje() {
  const w = sheet({ insunits: 4 });
  const pts = [[0, 0], [0, 9], [1, 10], [38, 10]];
  const pts2 = [[40, 12], [40, 14], [41, 15], [79, 15], [80, 14], [80, 12], [100, 12], [100, 10.5], [103, 10.5], [103, 12], [119, 12], [120, 11], [120, 0], [0, 0]];
  const o = { layer: 'CONTORNO' };
  for (let i = 0; i + 1 < pts.length; i++) w.line(pts[i], pts[i + 1], o);
  w.arc([38, 12], 2, 270, 360, o); // radio R2 en el hombro
  for (let i = 0; i + 1 < pts2.length; i++) w.line(pts2[i], pts2[i + 1], o);
  w.line([-10, 0], [130, 0], { layer: 'EJES' });
  w.text([0, -10], 4, 'FLECHA - MEDIO PERFIL (REVOLUCION EN X)', 0, { layer: 'TEXTO' });
  return w;
}

// 4. Bloque en L: frontal, superior (arriba) y lateral derecha (a la derecha), tercer ángulo.
function vistas() {
  const w = sheet({ insunits: 4 });
  const o = { layer: 'CONTORNO' }, h = { layer: 'OCULTAS' };
  w.lwpolyline([[0, 0], [80, 0], [80, 12], [12, 12], [12, 40], [0, 40]], true, o);
  w.line([38, 0], [38, 12], h).line([54, 0], [54, 12], h);
  w.lwpolyline([[0, 70], [80, 70], [80, 120], [0, 120]], true, o);
  w.line([12, 70], [12, 120], o); // arista del escalón
  w.circle([46, 95], 8, { layer: 'BARRENOS' });
  w.lwpolyline([[110, 0], [160, 0], [160, 40], [110, 40]], true, o);
  w.line([110, 12], [160, 12], o); // arista del escalón
  w.line([127, 0], [127, 12], h).line([143, 0], [143, 12], h);
  w.text([0, -10], 4, 'BLOQUE L - VISTAS (3er ANGULO)', 0, { layer: 'TEXTO' });
  return w;
}

// 5. Leva en pulgadas: SPLINE cerrada, barreno Ø0.75, ranura elíptica y ventana hexagonal de 12 entidades.
function leva() {
  const w = sheet({ insunits: 1, measurement: 0 });
  const Q = [];
  for (let i = 0; i < 11; i++) {
    const t = (i * 2 * Math.PI) / 11, r = 1.5 + 0.35 * (1 - Math.cos(t));
    Q.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  const M = [(Q[10][0] + Q[1][0]) / 2, (Q[10][1] + Q[1][1]) / 2]; // cierre tangente
  const ctrl = [M, ...Q.slice(1), M];
  const knots = [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9];
  w.spline({ degree: 3, knots, ctrl, flags: 8 | 1 }, { layer: 'CONTORNO' });
  w.circle([0, 0], 0.375, { layer: 'BARRENOS' });
  w.ellipse([0, -0.9], [0.35, 0], 0.15 / 0.35, 0, 2 * Math.PI, { layer: 'CONTORNO', extrusion: [0, 0, -1] });
  // Hexágono redondeado: 6 LINE + 6 ARC; los ARC impares en OCS con extrusión (0, 0, −1).
  const c = [0, 0.95], R = 0.35, rf = 0.06, V = [];
  for (let k = 0; k < 6; k++) V.push([c[0] + R * Math.cos((90 + 60 * k) * D), c[1] + R * Math.sin((90 + 60 * k) * D)]);
  const unit = (a, b) => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  const corners = V.map((v, k) => {
    const ui = unit(v, V[(k + 5) % 6]), uo = unit(v, V[(k + 1) % 6]), d = rf / Math.tan(60 * D);
    const bi = unit([0, 0], [ui[0] + uo[0], ui[1] + uo[1]]), cc = [v[0] + (bi[0] * rf) / Math.sin(60 * D), v[1] + (bi[1] * rf) / Math.sin(60 * D)];
    const tin = [v[0] + ui[0] * d, v[1] + ui[1] * d], tout = [v[0] + uo[0] * d, v[1] + uo[1] * d];
    return { cc, tin, tout, a0: Math.atan2(tin[1] - cc[1], tin[0] - cc[0]) / D, a1: Math.atan2(tout[1] - cc[1], tout[0] - cc[0]) / D };
  });
  corners.forEach((q, k) => {
    if (k % 2) w.arc([-q.cc[0], q.cc[1]], rf, 180 - q.a1, 180 - q.a0, { layer: 'CONTORNO', extrusion: [0, 0, -1] });
    else w.arc(q.cc, rf, q.a0, q.a1, { layer: 'CONTORNO' });
    w.line(q.tout, corners[(k + 1) % 6].tin, { layer: 'CONTORNO' });
  });
  cross(w, [0, 0], 0.6);
  w.text([-1, -2.6], 0.15, 'LEVA - PULGADAS', 0, { layer: 'TEXTO' });
  return w;
}

// 6. Junta solo con LINE y ARC: orden barajado, líneas invertidas, una duplicada y un hueco de 0.0005.
function junta() {
  const w = sheet({ insunits: 4 });
  const items = [];
  const L = (p0, p1) => items.push((rev) => (rev ? w.line(p1, p0, { layer: 'CONTORNO' }) : w.line(p0, p1, { layer: 'CONTORNO' })));
  const A = (c, r, a0, a1, layer = 'CONTORNO') => items.push(() => w.arc(c, r, a0, a1, { layer }));
  const rrect = (hx, hy, r) => {
    L([-(hx - r), -hy], [hx - r, -hy]);
    L([hx, -(hy - r)], [hx, hy - r]);
    L([hx - r, hy], [-(hx - r), hy]);
    L([-hx, hy - r], [-hx, -(hy - r)]);
    A([hx - r, -(hy - r)], r, 270, 360);
    A([hx - r, hy - r], r, 0, 90);
    A([-(hx - r), hy - r], r, 90, 180);
    A([-(hx - r), -(hy - r)], r, 180, 270);
  };
  rrect(60, 35, 10);
  rrect(45, 20, 5);
  for (const c of [[52.5, 0], [-52.5, 0], [0, 27.5], [0, -27.5]]) {
    A(c, 3, 0, 180, 'BARRENOS');
    A(c, 3, 180, 360, 'BARRENOS');
  }
  L([-50, -35], [50.0005, -35]); // reemplaza la línea inferior: hueco de 0.0005 con el arco
  items.splice(0, 1);
  L([45, -15], [45, 15]); // duplicada
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((f, i) => f(i % 3 === 0));
  return w;
}

const samples = {
  'placa-soporte.dxf': placa,
  'brida-bloques.dxf': brida,
  'eje-perfil.dxf': eje,
  'bloque-vistas.dxf': vistas,
  'leva-spline.dxf': leva,
  'junta-arcos.dxf': junta,
};
fs.mkdirSync(dir, { recursive: true });
for (const [name, fn] of Object.entries(samples)) {
  fs.writeFileSync(path.join(dir, name), fn().toString());
  console.log('escrito', path.join('samples', name));
}
