// Worker de fusión volumétrica (TSDF) y extracción/post-proceso de malla.
import { SparseTSDF } from '../mesh/tsdf.js';
import { removeSmallComponents, taubinSmooth, meshStats, fillSmallHoles } from '../mesh/process.js';

let tsdf = null;

self.onmessage = (e) => {
  const { id, cmd } = e.data;
  try {
    if (cmd === 'init') {
      tsdf = new SparseTSDF(e.data.opts);
      self.postMessage({ id });
    } else if (cmd === 'integrate') {
      const r = tsdf.integrate(e.data.dm, e.data.opts || {});
      self.postMessage({ id, ...r, stats: tsdf.stats() });
    } else if (cmd === 'table') {
      const z = Float64Array.from(tsdf.tableZ);
      self.postMessage({ id, z }, [z.buffer]);
    } else if (cmd === 'mesh') {
      const o = { minWeight: 0.15, minViews: 2, smooth: 2, minFrac: 0.02, ...(e.data.opts || {}) };
      let mesh = tsdf.extractMesh({ minWeight: o.minWeight, minViews: o.minViews });
      const raw = mesh.indices.length / 3;
      if (mesh.indices.length) mesh = removeSmallComponents(mesh, { minFrac: o.minFrac, minTris: 30 });
      let filled = 0;
      if (mesh.indices.length && o.fillHoles !== false) {
        const r = fillSmallHoles(mesh, { maxWidth: Math.max(2.5, 4 * tsdf.v), maxPerimeter: Math.max(7, 10 * tsdf.v) });
        mesh = r.mesh; filled = r.filled;
      }
      if (o.smooth > 0 && mesh.indices.length) taubinSmooth(mesh.positions, mesh.indices, { iterations: o.smooth });
      const st = mesh.indices.length ? meshStats(mesh.positions, mesh.indices, { footprintZ: o.footprintZ }) : null;
      const colors = new Uint8Array(mesh.colors.length);
      for (let i = 0; i < colors.length; i++) colors[i] = Math.max(0, Math.min(255, Math.round(mesh.colors[i])));
      self.postMessage({ id, positions: mesh.positions, indices: mesh.indices, colors, conf: mesh.conf, stats: st, rawTriangles: raw, filled },
        [mesh.positions.buffer, mesh.indices.buffer, colors.buffer, mesh.conf.buffer]);
    } else {
      throw new Error('Comando desconocido: ' + cmd);
    }
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) + (err && err.stack ? '\n' + err.stack : '') });
  }
};
