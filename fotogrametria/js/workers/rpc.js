// Llamadas tipo RPC a Web Workers (promesas).
export function workerRPC(url) {
  const w = new Worker(url, { type: 'module' });
  let seq = 0;
  const pending = new Map();
  w.onmessage = (e) => {
    const { id, error, ...rest } = e.data;
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (error) p.reject(new Error(error)); else p.resolve(rest);
  };
  w.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || 'Error en worker'));
    pending.clear();
  };
  return {
    call(cmd, data = {}, transfer = []) {
      const id = ++seq;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        w.postMessage({ id, cmd, ...data }, transfer);
      });
    },
    terminate() { w.terminate(); },
    get busy() { return pending.size > 0; },
  };
}

// Grupo de workers con cola simple.
export function workerPool(url, size) {
  const workers = Array.from({ length: size }, () => workerRPC(url));
  const queue = [];
  let active = 0;
  const pump = () => {
    while (queue.length) {
      const w = workers.find(x => !x.busy && !x.claimed);
      if (!w) return;
      const job = queue.shift();
      w.claimed = true; active++;
      w.call(job.cmd, job.data, job.transfer).then(job.resolve, job.reject).finally(() => { w.claimed = false; active--; pump(); });
    }
  };
  return {
    call(cmd, data = {}, transfer = []) {
      return new Promise((resolve, reject) => { queue.push({ cmd, data, transfer, resolve, reject }); pump(); });
    },
    terminate() { workers.forEach(w => w.terminate()); },
    size,
  };
}
