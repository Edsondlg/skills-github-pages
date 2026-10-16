// Genera versiones DWG de los planos DXF de ejemplo (node scripts/make-samples-dwg.mjs):
//   tests/fixtures/dwg/<nombre>-<año>.dwg  para las pruebas (AutoCAD 2013 y 2000).
//   samples/brida-bloques.dwg               ejemplo DWG de la aplicación (AutoCAD 2013).
// Usa @node-projects/acad-ts (dependencia de desarrollo): lee el DXF y escribe el DWG.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACadVersion, DwgWriter, DxfReader, DxfReaderConfiguration } from '@node-projects/acad-ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'tests/fixtures/dwg');
fs.mkdirSync(outDir, { recursive: true });

const DWG_SAMPLES = ['placa-soporte', 'brida-bloques', 'eje-perfil', 'leva-spline'];
const DWG_VERSIONS = { 2013: ACadVersion.AC1027, 2000: ACadVersion.AC1015 };

function toDwg(name, version) {
  const dxf = new Uint8Array(fs.readFileSync(path.join(root, 'samples', `${name}.dxf`)));
  // Los DXF de ejemplo son mínimos: se crean las tablas por defecto (estilo Standard, ByBlock…).
  const cfg = new DxfReaderConfiguration();
  cfg.createDefaults = true;
  const doc = DxfReader.readFromStreamWithConfig(dxf, cfg);
  doc.header.version = version;
  return DwgWriter.writeToBuffer(doc);
}

for (const name of DWG_SAMPLES) {
  for (const [year, version] of Object.entries(DWG_VERSIONS)) {
    const file = path.join(outDir, `${name}-${year}.dwg`);
    try {
      const bytes = toDwg(name, version);
      fs.writeFileSync(file, bytes);
      console.log(`${path.relative(root, file)}  ${bytes.length} B`);
    } catch (err) {
      console.error(`${name} (${year}): no se pudo escribir el DWG: ${err.message}`);
      process.exitCode = 1;
    }
  }
}
fs.copyFileSync(path.join(outDir, 'brida-bloques-2013.dwg'), path.join(root, 'samples/brida-bloques.dwg'));
console.log('samples/brida-bloques.dwg');
