// Envoltura de mensajes del motor CAD. Se empaqueta como texto (build/kernel.js) y
// corre dentro de un Worker creado desde un Blob; si el Worker no está disponible,
// el cliente ejecuta este mismo código en el hilo principal.
import { handle } from './core.js';

// Buffers de typed arrays de un resultado, sin repetir (para transferirlos).
function collectTransfers(value, out = new Set(), depth = 0) {
  if (!value || typeof value !== 'object' || depth > 4) return out;
  if (ArrayBuffer.isView(value)) out.add(value.buffer);
  else if (value instanceof ArrayBuffer) out.add(value);
  else for (const k in value) collectTransfers(value[k], out, depth + 1);
  return out;
}

const inWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

if (inWorker) {
  self.onmessage = async (e) => {
    const { id, type, payload } = e.data || {};
    try {
      const result = await handle({ type, payload });
      self.postMessage({ id, ok: true, result }, [...collectTransfers(result)]);
    } catch (err) {
      self.postMessage({ id, ok: false, error: (err && err.message) || String(err) });
    }
  };
} else {
  globalThis.__PLANO3D_KERNEL__ = { handle };
}
