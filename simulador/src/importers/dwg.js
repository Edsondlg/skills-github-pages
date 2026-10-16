// Importador DWG: convierte DWG → DXF con dwgdxf (acadrust compilado a WebAssembly) y
// analiza el resultado con parseDXF. Sin fetch ni import() dinámico (funciona en file://):
// en el navegador el wasm viene embebido en window.__DWG_WASM_GZ_B64__ (build/dwg-wasm.js);
// en Node se lee de node_modules.
import { initSync, convertDwgToDxf } from '../../node_modules/dwgdxf/dist/wasm/dwgdxf.js';
import { parseDXF } from './dxf.js';

/** Versiones DWG que lee el conversor (firma de 6 bytes → nombre comercial). */
export const DWG_VERSIONS = {
  AC1012: 'AutoCAD R13',
  AC1014: 'AutoCAD R14',
  AC1015: 'AutoCAD 2000',
  AC1018: 'AutoCAD 2004',
  AC1021: 'AutoCAD 2007',
  AC1024: 'AutoCAD 2010',
  AC1027: 'AutoCAD 2013',
  AC1032: 'AutoCAD 2018',
};
// Firmas anteriores a R13 (R1.x–R12 y betas de R13).
const OLD_SIG_RE = /^(AC1\.\d|AC2\.\d|AC100\d|AC101[01]|MC0\.0)/;

/** Firma DWG (primeros 6 bytes como texto). */
export function dwgSignature(bytes) {
  let s = '';
  for (let i = 0; i < Math.min(bytes.length, 6); i++) s += String.fromCharCode(bytes[i]);
  return s;
}

async function gunzipBase64(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function wasmBytes() {
  const b64 = globalThis.__DWG_WASM_GZ_B64__;
  if (b64) return gunzipBase64(b64);
  const fs = globalThis.process?.getBuiltinModule?.('node:fs');
  if (fs) return fs.readFileSync(new URL('../../node_modules/dwgdxf/dist/wasm/dwgdxf_bg.wasm', import.meta.url));
  throw new Error('No se encontró el conversor DWG (build/dwg-wasm.js).');
}

// El módulo wasm se compila (asíncrono) e instancia una sola vez; si falla, el siguiente intento
// lo reintenta. Se usa initSync con el módulo ya compilado: el init asíncrono del glue incluye fetch.
let ready = null;
function initOnce() {
  if (!ready) {
    ready = (async () => initSync({ module: await WebAssembly.compile(await wasmBytes()) }))();
    ready.catch(() => (ready = null));
  }
  return ready;
}

/**
 * Analiza un DWG (R13–2018). Devuelve lo mismo que parseDXF, más format: 'dwg' y
 * version legible (p. ej. 'AC1027 (AutoCAD 2013)').
 * @param {Uint8Array|ArrayBuffer} bytes
 */
export async function parseDWG(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const sig = dwgSignature(u8);
  if (OLD_SIG_RE.test(sig)) {
    throw new Error(`DWG anterior a R13 (${sig}) no soportado: guárdelo como DWG R13 o posterior, o como DXF.`);
  }
  if (!/^AC\d{4}$/.test(sig)) throw new Error('El archivo no es un DWG válido (falta la firma AC10xx).');
  await initOnce();
  let dxf;
  try {
    dxf = convertDwgToDxf(u8);
  } catch (err) {
    const detail = typeof err === 'string' ? err : err?.message || String(err);
    throw new Error(`No se pudo leer el DWG (versión no soportada o archivo dañado): ${detail}`);
  }
  const d = parseDXF(dxf);
  return { ...d, format: 'dwg', version: DWG_VERSIONS[sig] ? `${sig} (${DWG_VERSIONS[sig]})` : sig };
}
