// Prueba de aceptación de punta a punta (Chromium headless): ejecuta el flujo completo sobre la
// demostración sintética y verifica umbrales de exactitud contra la geometría verdadera.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = { ...process.env, COUNT: process.env.COUNT || '12', FINE: process.env.FINE || '640', COARSE: process.env.COARSE || '320', ITERS: process.env.ITERS || '5' };
console.log('Ejecutando flujo completo (puede tardar 10–15 min con GPU por software)…');
const out = execFileSync(process.execPath, [path.join(here, 'pipeline-probe.mjs')], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 3600000 });
const i = out.indexOf('{'), j = out.lastIndexOf('}');
const r = JSON.parse(out.slice(i, j + 1));
const checks = [
  ['todas las fotos registradas', r.calib.registered === r.calib.total],
  ['reproyección RMS < 1 px', r.calib.rms < 1],
  ['puntos de control RMS 3D < 0.3 mm', r.calib.check.rms3d < 0.3],
  ['ruido sobre la mesa σ < 0.1 mm', r.recon.table && r.recon.table.sigma < 0.1],
  ['≥ 95 % de la malla a < 1 mm de la pieza real', r.acc.within1 >= 0.95],
  ['mediana del error < 0.2 mm', r.acc.med < 0.2],
  ['completitud ≥ 60 % (tolerancia 1 mm)', r.completeness >= 0.6],
];
let ok = true;
for (const [name, pass] of checks) { console.log(`${pass ? '✔' : '✖'} ${name}`); ok = ok && !!pass; }
console.log(JSON.stringify({ calib: { rms: r.calib.rms, check: r.calib.check.rms3d }, acc: r.acc, completeness: r.completeness, table: r.recon.table }, null, 1));
process.exit(ok ? 0 : 1);
