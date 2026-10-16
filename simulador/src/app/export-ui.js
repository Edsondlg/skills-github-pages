// Menú Exportar y atajos Ctrl+S (STEP) / Ctrl+P (reporte imprimible).
import * as ui from './ui-shell.js';
import { exportPart, openPrintableReport } from '../ui/exporters.js';

const LABELS = {
  step: 'STEP', stl: 'STL', 'stl-ascii': 'STL ASCII', obj: 'OBJ', glb: 'GLB', ply: 'PLY',
  'report-print': 'el reporte', 'report-html': 'el reporte HTML', csv: 'CSV', json: 'JSON', png: 'PNG',
};

// Nombre base de los archivos: el del plano sin extensión (p. ej. placa-soporte).
function fileBaseOf(drawing) {
  const n = String(drawing?.fileName || 'pieza').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_').trim();
  return n || 'pieza';
}

/** Cablea el menú Exportar (onMenu('export')) y los atajos de exportación. */
export function initExportUi(app) {
  const btn = ui.$('btnExport');
  let busy = false;

  async function run(kind) {
    const s = app.getState();
    if (s.building) return ui.toast('Espere a que termine la generación de la pieza antes de exportar.', { type: 'warn' });
    if (!s.build || !s.partData) {
      const msg = s.drawing
        ? 'Aún no hay pieza 3D: pulse «Generar pieza 3D» (Ctrl+Enter) y vuelva a exportar.'
        : 'No hay pieza que exportar: abra un plano o un ejemplo y genere la pieza 3D.';
      return ui.toast(msg, { type: 'warn' });
    }
    if (busy) return ui.toast('Ya hay una exportación en curso…', { type: 'info' });
    busy = true;
    btn.setAttribute('aria-busy', 'true');
    btn.classList.add('is-busy');
    const closeWait = ui.toast(`Exportando ${LABELS[kind] || kind}…`, { timeout: 0 });
    try {
      // La captura (PNG y reporte) necesita la vista 3D visible y con tamaño.
      if (/^(png|report)/.test(kind) && ui.getActiveTab() === '2d') {
        ui.setActiveTab('3d');
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      }
      const opts = {
        kernel: app.kernel, viewer: app.viewer, partData: s.partData,
        measurements: app.getMeasurements ? app.getMeasurements() : app.measure.list(),
        fileBase: fileBaseOf(s.drawing), fileName: s.drawing?.fileName, system: s.system,
      };
      if (kind === 'report-print') {
        const { blob, filename } = await exportPart('report-html', opts);
        const opened = openPrintableReport(await blob.text(), filename);
        ui.toast(opened ? 'Reporte abierto: imprímalo o guárdelo como PDF.' : `El navegador bloqueó la ventana; se descargó ${filename}.`, { type: opened ? 'success' : 'warn' });
      } else {
        const { blob, filename } = await exportPart(kind, opts);
        ui.downloadBlob(blob, filename);
        ui.toast(`Exportado ${filename}`, { type: 'success' });
      }
    } catch (e) {
      ui.toast(`No se pudo exportar ${LABELS[kind] || kind}: ${e?.message || e}`, { type: 'error' });
    } finally {
      closeWait();
      busy = false;
      btn.setAttribute('aria-busy', 'false');
      btn.classList.remove('is-busy');
    }
  }

  ui.onMenu('export', (kind) => run(kind));
  ui.onShortcut('s', () => run('step'), { ctrl: true });
  ui.onShortcut('p', () => run('report-print'), { ctrl: true });
  app.exportAs = run; // pruebas e2e
}
