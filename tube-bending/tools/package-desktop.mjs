// Empaqueta la app como ejecutable de escritorio (doble clic) con Neutralino:
//   1. node tools/build.mjs → dist/SimuladorDobladoTubo.html (HTML único, offline)
//   2. copia ese HTML a desktop/resources/index.html
//   3. neu update (descarga los binarios de Neutralino a desktop/bin, una sola vez) + neu build --release
//   4. arma dist/SimuladorDoblado-<sistema>.zip con el binario + resources.neu
// Uso: node tools/package-desktop.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desk = path.join(root, 'desktop');
const neu = path.join(root, 'node_modules/.bin/neu');
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

run('node', [path.join(root, 'tools/build.mjs')], root);
fs.mkdirSync(path.join(desk, 'resources'), { recursive: true });
fs.copyFileSync(path.join(root, 'dist/SimuladorDobladoTubo.html'), path.join(desk, 'resources/index.html'));
if (!fs.existsSync(path.join(desk, 'bin'))) run(neu, ['update'], desk);
fs.rmSync(path.join(desk, 'dist'), { recursive: true, force: true });
run(neu, ['build', '--release'], desk);

const built = path.join(desk, 'dist/SimuladorDoblado');
const targets = {
  Windows: ['SimuladorDoblado-win_x64.exe'],
  macOS: ['SimuladorDoblado-mac_universal'],
  Linux: ['SimuladorDoblado-linux_x64'],
};
const LEEME = `Simulador de Doblado Rotativo\r\n\r\nDescomprima la carpeta completa y dé doble clic en el ejecutable.\r\nEl archivo resources.neu debe quedar junto al ejecutable.\r\nWindows usa WebView2 (incluido en Windows 10/11 actualizados).\r\nAlternativa sin instalar nada: abra SimuladorDobladoTubo.html con doble clic.\r\n`;
for (const [os, files] of Object.entries(targets)) {
  const stage = path.join(desk, 'dist', `SimuladorDoblado-${os}`);
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(stage, { recursive: true });
  for (const f of files) {
    const out = os === 'Windows' ? 'SimuladorDoblado.exe' : 'SimuladorDoblado';
    fs.copyFileSync(path.join(built, f), path.join(stage, out));
    fs.chmodSync(path.join(stage, out), 0o755);
  }
  fs.copyFileSync(path.join(built, 'resources.neu'), path.join(stage, 'resources.neu'));
  fs.copyFileSync(path.join(root, 'dist/SimuladorDobladoTubo.html'), path.join(stage, 'SimuladorDobladoTubo.html'));
  fs.writeFileSync(path.join(stage, 'LEEME.txt'), LEEME);
  const zip = path.join(root, 'dist', `SimuladorDoblado-${os}.zip`);
  fs.rmSync(zip, { force: true });
  run('zip', ['-qr', zip, path.basename(stage)], path.dirname(stage));
  console.log(path.relative(root, zip), (fs.statSync(zip).size / 1024 / 1024).toFixed(2), 'MB');
}
