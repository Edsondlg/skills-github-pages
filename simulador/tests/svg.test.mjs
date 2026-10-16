// Pruebas del importador SVG (C3 svg.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseSVG } from '../src/importers/svg.js';
import { segStart, segEnd } from '../src/geom2d/segments.js';
import { buildLoops, loopInfo, buildRegions } from '../src/geom2d/loops.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);
const svg = (body, attrs = 'width="100mm" height="100mm" viewBox="0 0 100 100"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;
const loopsOf = (segs) => buildLoops(segs).loops;
const areas = (segs) => loopsOf(segs).map((l) => loopInfo(l).signedArea);

test('rect con rx: área neta exacta w·h − (4 − π)·rx²', () => {
  const { segments } = parseSVG(svg('<rect x="10" y="20" width="40" height="30" rx="5"/>'));
  assert.equal(segments.filter((s) => s.type === 'arc').length, 4);
  const { loops, open } = buildLoops(segments);
  assert.equal(loops.length, 1);
  assert.equal(open.length, 0);
  near(loopInfo(loops[0]).area, 40 * 30 - (4 - Math.PI) * 25, 1e-9);
  // rx ≠ ry → cuartos de elipse
  const e = parseSVG(svg('<rect width="40" height="30" rx="8" ry="4"/>')).segments;
  assert.equal(e.filter((s) => s.type === 'ellipse').length, 4);
  near(loopInfo(loopsOf(e)[0]).area, 1200 - (4 - Math.PI) * 32, 1e-9);
});

test('trayecto con dos comandos A = círculo de área πr²', () => {
  const { segments } = parseSVG(svg('<path d="M 60 50 A 10 10 0 0 1 40 50 A 10 10 0 0 1 60 50 Z"/>'));
  assert.deepEqual(segments.map((s) => s.type), ['arc', 'arc']);
  const [l] = loopsOf(segments);
  near(loopInfo(l).area, Math.PI * 100, 1e-9);
  assert.ok(loopInfo(l).circle);
  // arco elíptico rotado y radios demasiado pequeños (se escalan)
  const e = parseSVG(svg('<path d="M0 0 A 1 1 0 0 0 20 0 Z"/>')).segments;
  near(loopInfo(loopsOf(e)[0]).area, (Math.PI * 100) / 2, 1e-9);
  const r = parseSVG(svg('<path d="M0 0 A 20 10 30 1 1 10 10 Z"/>')).segments;
  assert.equal(r[0].type, 'ellipse');
  near(Math.hypot(...segEnd(r[0]).map((v, k) => v - [10, -10][k])), 0, 1e-9);
});

test('sintaxis de trayectos: números compactos, comandos implícitos, Q/T/S, banderas pegadas', () => {
  const { segments, warnings } = parseSVG(svg('<path d="m0 0l10 0 0 10-1e-3 0h-1.5.5v-10.5zM20 20q5-5 10 0t10 0s5 5 10 0c0 5 5 5 5 0a5 5 0 1010 0z"/>'));
  assert.deepEqual(warnings.filter((w) => /trayecto/.test(w)), []);
  const types = segments.map((s) => s.type).join(',');
  assert.equal(types, 'line,line,line,line,line,line,line,bezier,bezier,bezier,bezier,arc,line');
  assert.deepEqual(segEnd(segments[2]), [9.999, -10]);
  near(segEnd(segments[4])[0], 8.999, 1e-12); // h-1.5 y luego h.5
  // T refleja el control de Q: (25,15) → (35,25) en SVG
  const t = segments[8];
  near(t.pts[1][0], 30 + (2 / 3) * 5, 1e-12);
  near(t.pts[1][1], -(20 + (2 / 3) * 5), 1e-12);
});

test('transformaciones: rotate(a cx cy), scale(2,1) círculo → elipse, matrix, anidadas', () => {
  const r = parseSVG(svg('<g transform="rotate(90 50 50)"><line x1="50" y1="50" x2="60" y2="50"/></g>')).segments[0];
  near(r.p1[0], 50, 1e-9);
  near(r.p1[1], -60, 1e-9);
  const e = parseSVG(svg('<g transform="scale(2,1)"><circle cx="20" cy="20" r="5"/></g>')).segments;
  assert.equal(e[0].type, 'ellipse');
  near(Math.abs(areas(e)[0]), 2 * Math.PI * 25, 1e-9);
  const m = parseSVG(svg('<g transform="translate(5) matrix(1 0 0.5 1 10 20)"><rect width="10" height="10"/></g>')).segments;
  near(Math.abs(areas(m)[0]), 100, 1e-9);
  near(m[0].p0[0], 15, 1e-12);
  near(m[0].p0[1], -20, 1e-12);
  // semejanza: el arco sigue siendo arco exacto
  const a = parseSVG(svg('<g transform="rotate(30) scale(3)"><rect width="10" height="10" rx="2"/></g>')).segments;
  assert.equal(a.filter((s) => s.type === 'arc').length, 4);
  near(Math.abs(areas(a)[0]), 9 * (100 - (4 - Math.PI) * 4), 1e-9);
  // escala que iguala los radios de una elipse → círculo exacto
  const c = parseSVG(svg('<g transform="scale(1 2)"><ellipse cx="0" cy="0" rx="6" ry="3"/></g>')).segments;
  assert.equal(c[0].type, 'circle');
  near(c[0].r, 6, 1e-12);
});

test('unidades: width="100mm" con viewBox 0 0 200 100 → toMM = 0.5; in y cm', () => {
  const u = parseSVG(svg('', 'width="100mm" height="50mm" viewBox="0 0 200 100"'));
  assert.equal(u.units.name, 'mm');
  near(u.units.toMM, 0.5, 1e-15);
  assert.deepEqual(u.warnings, []);
  near(parseSVG(svg('', 'width="2in" viewBox="0 0 100 10"')).units.toMM, 0.508, 1e-12);
  assert.equal(parseSVG(svg('', 'width="10cm" height="10cm"')).units.name, 'cm');
});

test('sin unidades: px a 96 ppp con advertencia en español', () => {
  for (const attrs of ['viewBox="0 0 100 100"', 'width="100" height="100"', '']) {
    const r = parseSVG(svg('<circle cx="1" cy="1" r="1"/>', attrs));
    assert.equal(r.units.name, 'px');
    near(r.units.toMM, 25.4 / 96, 1e-15);
    assert.ok(r.warnings.some((w) => /unidades.*escala/.test(w)), r.warnings.join());
  }
  near(parseSVG(svg('', 'width="200" viewBox="0 0 100 100"')).units.toMM, (2 * 25.4) / 96, 1e-15);
});

test('use con x/y, símbolo en defs, metadatos de capa y color', () => {
  const { segments } = parseSVG(
    svg(`<defs><circle id="h" r="2" style="stroke:#f00"/><g id="par"><use href="#h"/><use href="#h" x="10"/></g></defs>
         <g inkscape:label="Barrenos"><use xlink:href="#par" x="20" y="30"/></g>`),
  );
  assert.equal(segments.length, 2);
  assert.deepEqual(segments.map((s) => s.c), [[20, -30], [30, -30]]);
  assert.deepEqual(segments[0].meta, { layer: 'par', entity: 'circle', color: '#f00' });
});

test('robustez XML: comentarios, CDATA, entidades, prefijos, display:none, texto ignorado', () => {
  const text = `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY ns "http://www.w3.org/2000/svg">]>
    <!-- comentario con <rect> dentro --><svg:svg xmlns:svg="&ns;" width="10mm" viewBox="0 0 10 10">
    <svg:style><![CDATA[ a<b ]]></svg:style><svg:g id="a&amp;b" stroke="blue"><svg:line x1="0" y1="0" x2="1" y2="0"/>
    <svg:line display="none" x1="0" y1="0" x2="2" y2="0"/><svg:g style="display:none"><svg:circle r="1"/></svg:g></svg:g>
    <svg:text>hola</svg:text><svg:image href="x.png"/></svg:svg>`;
  const { segments, warnings } = parseSVG(text);
  assert.equal(segments.length, 1);
  assert.deepEqual(segments[0].meta, { layer: 'a&b', entity: 'line', color: 'blue' });
  assert.ok(warnings.some((w) => /<text>/.test(w)));
  assert.throws(() => parseSVG('<html></html>'), /SVG/);
});

test('inversión de Y: el dibujo queda derecho y el exterior es región válida con agujeros', () => {
  const { segments } = parseSVG(svg('<path d="M0 0 H80 V40 H0 Z"/><circle cx="20" cy="10" r="5"/><rect x="50" y="20" width="10" height="10"/>'));
  const { loops } = buildLoops(segments);
  const { regions } = buildRegions(loops);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 2);
  const outer = loopInfo(loops[regions[0].outer]);
  near(outer.area, 80 * 40 - 0, 1e-9);
  assert.deepEqual([outer.bbox.minY, outer.bbox.maxY], [-40, 0]);
  const hole = segments.find((s) => s.type === 'circle');
  assert.ok(hole.c[1] > outer.centroid[1], 'el barreno de arriba sigue arriba');
  near(segStart(segments[0])[1], 0, 0);
});

test('placa-logo.svg: 1 región con 8 agujeros, en mm', () => {
  const text = fs.readFileSync(new URL('../samples/placa-logo.svg', import.meta.url), 'utf8');
  const { units, segments, warnings } = parseSVG(text);
  assert.equal(units.name, 'mm');
  near(units.toMM, 1, 1e-15);
  assert.ok(warnings.every((w) => !/unidades/.test(w)));
  assert.ok(warnings.some((w) => /<text>/.test(w)));
  const { loops, open } = buildLoops(segments);
  assert.equal(open.length, 0);
  const { regions } = buildRegions(loops);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].holes.length, 8);
  near(loopInfo(loops[regions[0].outer]).area, 160 * 100 - (4 - Math.PI) * 64 - 40 * 10, 1e-9);
  const layers = new Set(segments.map((s) => s.meta.layer));
  assert.deepEqual([...layers].sort(), ['Barrenos', 'Contorno', 'Recortes', 'ranura-girada']);
});
