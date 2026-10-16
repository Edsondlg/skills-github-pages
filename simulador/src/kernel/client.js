// Cliente del motor CAD (lado de la interfaz). Decodifica el wasm embebido,
// lanza el Worker desde un Blob y expone llamadas con promesas. Si el Worker
// falla (políticas del navegador), ejecuta el motor en el hilo principal.

async function decodeWasm() {
  const b64 = globalThis.__OCCT_WASM_GZ_B64__;
  if (!b64) throw new Error('No se encontró el motor CAD (build/occt-wasm.js).');
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

export class KernelClient {
  constructor() {
    this._worker = null;
    this._main = null;
    this._mode = null;
    this._seq = 0;
    this._pending = new Map();
    this._queue = Promise.resolve();
  }

  get mode() { return this._mode; }

  async start({ onStatus = () => {} } = {}) {
    const src = globalThis.__PLANO3D_KERNEL_SRC__;
    if (!src) throw new Error('No se encontró el código del motor CAD (build/kernel.js).');
    onStatus('Descomprimiendo motor CAD…');
    let wasm = await decodeWasm();
    onStatus('Iniciando OpenCascade…');
    try {
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      this._worker = new Worker(url);
      URL.revokeObjectURL(url);
      this._worker.onmessage = (e) => this._settle(e.data);
      this._worker.onerror = (e) => this._failAll(new Error(e.message || 'Error en el worker del motor CAD.'));
      this._mode = 'worker';
      const r = await this._send('init', { wasmBinary: wasm }, [wasm]);
      onStatus('Motor CAD listo');
      return r;
    } catch (err) {
      // Respaldo: mismo código en el hilo principal (la transferencia vació el buffer).
      if (this._worker) this._worker.terminate();
      this._worker = null;
      this._failAll(err);
      if (wasm.byteLength === 0) wasm = await decodeWasm();
      new Function(src)();
      this._main = globalThis.__PLANO3D_KERNEL__;
      this._mode = 'main';
      const r = await this._main.handle({ type: 'init', payload: { wasmBinary: wasm } });
      onStatus('Motor CAD listo (hilo principal)');
      return r;
    }
  }

  _send(type, payload, transfer = []) {
    const id = ++this._seq;
    return new Promise((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      this._worker.postMessage({ id, type, payload }, transfer);
    });
  }

  _settle({ id, ok, result, error }) {
    const p = this._pending.get(id);
    if (!p) return;
    this._pending.delete(id);
    if (ok) p.resolve(result); else p.reject(new Error(error));
  }

  _failAll(err) {
    for (const p of this._pending.values()) p.reject(err);
    this._pending.clear();
  }

  // Llamadas serializadas: el motor procesa una a la vez y conserva la forma actual.
  call(type, payload) {
    const run = () => {
      if (this._mode === 'worker') return this._send(type, payload);
      if (this._mode === 'main') return this._main.handle({ type, payload });
      return Promise.reject(new Error('El motor CAD aún no está listo.'));
    };
    const p = this._queue.then(run, run);
    this._queue = p.catch(() => {});
    return p;
  }

  build(job) { return this.call('build', job); }
  distance(a, b) { return this.call('distance', { a, b }); }
  exportShape(opts) { return this.call('export', opts); }
  tessellate(opts) { return this.call('tessellate', opts); }

  dispose() {
    if (this._worker) this._worker.terminate();
    this._worker = null;
    this._mode = null;
    this._failAll(new Error('Motor CAD cerrado.'));
  }
}
