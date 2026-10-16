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

const workerDied = (detail) => new Error(`El motor CAD se detuvo inesperadamente${detail ? ` (${detail})` : ''}. Recargue la página para reiniciarlo.`);

export class KernelClient {
  constructor() {
    this._worker = null;
    this._main = null;
    this._mode = null;
    this._seq = 0;
    this._pending = new Map();
    this._queue = Promise.resolve();
    this._ready = null; // promesa de start(): las llamadas esperan a que el motor esté iniciado
    this._failed = null; // error definitivo: rechaza las llamadas en curso y las futuras
  }

  get mode() { return this._mode; }

  start(opts) {
    if (!this._ready) this._ready = this._start(opts);
    return this._ready;
  }

  async _start({ onStatus = () => {} } = {}) {
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
      // Durante el inicio solo se rechaza el init (y se pasa al hilo principal); después, el fallo es definitivo.
      this._worker.onerror = (e) => (this._mode === 'worker' ? this._fail(workerDied(e.message)) : this._failAll(new Error(e.message || 'Error en el worker del motor CAD.')));
      this._worker.onmessageerror = () => this._fail(workerDied('mensaje ilegible'));
      const r = await this._send('init', { wasmBinary: wasm }, [wasm]);
      this._mode = 'worker';
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
      const r = await this._main.handle({ type: 'init', payload: { wasmBinary: wasm } });
      this._mode = 'main';
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

  _settle({ id, ok, result, error, code }) {
    const p = this._pending.get(id);
    if (!p) return;
    this._pending.delete(id);
    if (ok) return p.resolve(result);
    const err = new Error(error);
    if (code) err.code = code; // p. ej. STALE_SHAPE
    p.reject(err);
  }

  _failAll(err) {
    for (const p of this._pending.values()) p.reject(err);
    this._pending.clear();
  }

  // Fallo definitivo del worker: se termina y toda llamada (pendiente o futura) se rechaza.
  _fail(err) {
    if (!this._failed) this._failed = err;
    if (this._worker) this._worker.terminate();
    this._worker = null;
    this._mode = null;
    this._failAll(this._failed);
  }

  // Llamadas serializadas: el motor procesa una a la vez y conserva la forma actual.
  // Las hechas antes de que start() termine esperan al init; si el init falla, se rechazan.
  call(type, payload) {
    if (this._failed) return Promise.reject(this._failed);
    if (!this._ready) return Promise.reject(new Error('El motor CAD aún no está listo.'));
    const run = () => {
      if (this._failed) throw this._failed;
      if (this._mode === 'worker') return this._send(type, payload);
      if (this._mode === 'main') return this._main.handle({ type, payload });
      throw new Error('El motor CAD aún no está listo.');
    };
    const prev = this._queue;
    const p = this._ready.then(() => prev, () => { throw new Error('El motor CAD no se pudo iniciar.'); }).then(run);
    this._queue = p.catch(() => {});
    return p;
  }

  build(job) { return this.call('build', job); }
  /** buildId opcional: rechaza con code 'STALE_SHAPE' si el motor tiene otra pieza. */
  distance(a, b, buildId) { return this.call('distance', { a, b, buildId }); }
  exportShape(opts) { return this.call('export', opts); }
  tessellate(opts) { return this.call('tessellate', opts); }

  dispose() {
    this._fail(new Error('Motor CAD cerrado.'));
  }
}
