// Worker de detección: decodifica la foto, detecta marcadores y mide nitidez/exposición.
import { detectMarkers, refineCornersEdges } from '../core/aruco.js';
import { grayFromRGBA, sharpness, exposureStats } from '../core/image.js';

async function loadGray(file) {
  const bmp = await createImageBitmap(file);
  const W = bmp.width, H = bmp.height;
  const c = new OffscreenCanvas(W, H);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(bmp, 0, 0);
  bmp.close();
  const data = g.getImageData(0, 0, W, H).data;
  return { gray: grayFromRGBA(data, W, H), W, H };
}

self.onmessage = async (e) => {
  const { id, cmd } = e.data;
  try {
    if (cmd === 'detect') {
      const { gray, W, H } = await loadGray(e.data.file);
      const t0 = performance.now();
      const dets = detectMarkers(gray, W, H, e.data.opts || {});
      const ms = performance.now() - t0;
      const sharp = sharpness(gray, W, H);
      const expo = exposureStats(gray);
      self.postMessage({ id, width: W, height: H, dets, sharp, expo, ms });
    } else if (cmd === 'refine') {
      const { gray, W, H } = await loadGray(e.data.file);
      const out = e.data.markers.map(m => {
        const r = refineCornersEdges(gray, W, H, m.corners, { K: e.data.K, cells: 7 });
        return r ? { ...m, corners: r.corners, edgeRms: r.rms, refined: true } : { ...m, refined: false };
      });
      self.postMessage({ id, dets: out });
    } else {
      throw new Error('Comando desconocido: ' + cmd);
    }
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
