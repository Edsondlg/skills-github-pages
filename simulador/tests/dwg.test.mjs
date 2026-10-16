// Pruebas del importador DWG (src/importers/dwg.js): los DWG generados con
// scripts/make-samples-dwg.mjs deben dar las mismas regiones, agujeros y áreas que su DXF.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDWG } from '../src/importers/dwg.js';
import { detectFormat, importText, importDWG, prepareProfile, defaultOpState, profileSummary } from '../src/app/pipeline.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = path.join(root, 'tests/fixtures/dwg');
const close = (a, b, rel, msg = '') =>
  assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${msg} ${a} ≠ ${b} (rel ${rel})`);

// Regiones, agujeros por región y área neta de un Drawing.
function summary(drawing) {
  const profile = prepareProfile(drawing);
  const s = profileSummary(profile, defaultOpState(profile));
  return { holes: profile.regions.map((r) => r.holes.length), netArea: s.netArea };
}

const SAMPLES = { 'placa-soporte': 1e-9, 'brida-bloques': 1e-9, 'eje-perfil': 1e-9, 'leva-spline': 1e-6 };
const VERSIONS = { 2013: 'AC1027 (AutoCAD 2013)', 2000: 'AC1015 (AutoCAD 2000)' };

for (const [name, rel] of Object.entries(SAMPLES)) {
  const ref = summary(importText('dxf', fs.readFileSync(path.join(root, 'samples', `${name}.dxf`), 'utf8'), `${name}.dxf`));
  for (const [year, version] of Object.entries(VERSIONS)) {
    test(`${name}-${year}.dwg = ${name}.dxf`, async (t) => {
      const bytes = new Uint8Array(fs.readFileSync(path.join(fixtures, `${name}-${year}.dwg`)));
      const d = await parseDWG(bytes);
      assert.equal(d.format, 'dwg');
      assert.equal(d.version, version);
      const drawing = await importDWG(bytes, `${name}-${year}.dwg`);
      assert.equal(drawing.format, 'dwg');
      assert.equal(drawing.version, version);
      const got = summary(drawing);
      assert.deepEqual(got.holes, ref.holes);
      close(got.netArea, ref.netArea, rel, 'área neta');
      t.diagnostic(`${name}-${year}: agujeros ${got.holes.join('/')}, área neta ${got.netArea.toFixed(6)}; avisos: ${d.warnings.join(' | ') || '—'}`);
    });
  }
}

test('ejemplo de la app samples/brida-bloques.dwg = brida-bloques.dxf', async () => {
  const ref = summary(importText('dxf', fs.readFileSync(path.join(root, 'samples/brida-bloques.dxf'), 'utf8')));
  const got = summary(await importDWG(fs.readFileSync(path.join(root, 'samples/brida-bloques.dwg'))));
  assert.deepEqual(got.holes, ref.holes);
  close(got.netArea, ref.netArea, 1e-9, 'área neta');
});

test('detectFormat reconoce .dwg y la firma AC10xx', () => {
  assert.equal(detectFormat('pieza.DWG'), 'dwg');
  assert.equal(detectFormat('sin-extension', new TextEncoder().encode('AC1027\0\0\0')), 'dwg');
  assert.equal(detectFormat('sin-extension', new TextEncoder().encode('hola')), null);
});

test('errores en español: archivo dañado, no DWG y versión anterior a R13', async () => {
  const good = new Uint8Array(fs.readFileSync(path.join(fixtures, 'brida-bloques-2013.dwg')));
  await assert.rejects(parseDWG(good.slice(0, 200)), /^Error: No se pudo leer el DWG \(versión no soportada o archivo dañado\): /);
  await assert.rejects(parseDWG(new TextEncoder().encode('0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n')), /no es un DWG válido/);
  await assert.rejects(parseDWG(new Uint8Array(0)), /no es un DWG válido/);
  await assert.rejects(parseDWG(new TextEncoder().encode('AC1009' + '\0'.repeat(100))), /anterior a R13 \(AC1009\)/);
  await assert.rejects(importDWG(new TextEncoder().encode('AC1.50' + '\0'.repeat(100))), /anterior a R13/);
  // Tras un error el conversor sigue disponible.
  assert.equal((await parseDWG(good)).format, 'dwg');
});

// Archivos reales de AutoCAD (datos de prueba de LibreDWG, GPL: solo en local, no se versionan).
const LIBREDWG = '/tmp/claude-0/-home-user-skills-github-pages/6741ae73-0b6c-5c10-85e3-5e27832e04a5/scratchpad/dwgfiles';
const REAL = ['r14', '2000', '2004', '2007', '2010', '2013', '2018'];
test('DWG reales de AutoCAD R14–2018 (LibreDWG)', { skip: !fs.existsSync(LIBREDWG) && 'sin archivos de LibreDWG' }, async (t) => {
  const counts = [];
  for (const v of REAL) {
    const f = path.join(LIBREDWG, `example_${v}.dwg`);
    if (!fs.existsSync(f)) continue;
    const d = await parseDWG(new Uint8Array(fs.readFileSync(f)));
    assert.ok(d.segments.length > 0, `example_${v}: sin segmentos`);
    counts.push(d.segments.length);
    t.diagnostic(`example_${v}: ${d.version}, ${d.segments.length} segmentos; avisos: ${d.warnings.join(' | ') || '—'}`);
  }
  assert.ok(counts.length > 0);
});
