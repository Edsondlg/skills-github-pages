// Limpieza del plano: borrar líneas (modo 'erase', B; Ctrl+Z deshace) y calibrar la escala con una cota
// conocida (diámetro/radio de un círculo o arco, o distancia entre 2 puntos) en todos los formatos.
// Estado por objeto de dibujo (WeakMap): un archivo nuevo o un nuevo trazado de la imagen lo reinician.
import * as ui from './ui-shell.js';
import { segId } from './pipeline.js';

const $ = ui.$;
const UNIT_MM = { mm: 1, in: 25.4 };
const isTyping = (t) => t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);

/**
 * @param {Object} app  API de la app (window.__app)
 * @returns {{ profileOptions(drawing): { erasedIds: number[], unitOverride: number|null }, clearScale(drawing): void }}
 */
export function initCleanup(app) {
  const { view2d } = app;
  // dibujo → { erased: Set<segId>, undo: [{ type: 'erase'|'restore', ids }], scale: mm por unidad calibrado | null }
  const store = new WeakMap();
  const of = (d) => {
    let c = store.get(d);
    if (!c) store.set(d, (c = { erased: new Set(), undo: [], scale: null }));
    return c;
  };
  let showErased = true;

  const show2d = () => {
    if (ui.getActiveTab() === '3d') ui.setActiveTab('2d');
  };

  // Borrados del dibujo actual → índices de la vista 2D (iguales a los del dibujo).
  const syncView = () => {
    const { drawing: d, profile } = app.getState();
    if (!d || !profile) return;
    const er = of(d).erased, idx = [];
    if (er.size) d.segments.forEach((s, i) => er.has(segId(s, i)) && idx.push(i));
    view2d.setErased(idx, { show: showErased });
  };

  // ───────────── Borrar líneas ─────────────
  const apply = (c, type, ids) => {
    for (const id of ids) type === 'erase' ? c.erased.add(id) : c.erased.delete(id);
    app.reprocess({ keepView: true });
  };
  const change = (type, indices) => {
    const d = app.getState().drawing;
    if (!d) return;
    const c = of(d);
    const ids = indices.map((i) => segId(d.segments[i], i)).filter((id) => c.erased.has(id) === (type === 'restore'));
    if (!ids.length) return;
    c.undo.push({ type, ids });
    apply(c, type, ids);
  };
  view2d.on('erase', ({ indices }) => change('erase', indices));
  view2d.on('restore', ({ indices }) => change('restore', indices));

  // Ctrl+Z: listener propio (el atajo con Ctrl del armazón se dispara aun escribiendo).
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'z') return;
    if (!$('modal').hidden || isTyping(e.target)) return;
    const d = app.getState().drawing, c = d && store.get(d);
    if (!c?.undo.length) return;
    e.preventDefault();
    const last = c.undo.pop();
    apply(c, last.type === 'erase' ? 'restore' : 'erase', last.ids);
  });

  ui.onShortcut('b', () => {
    if (!app.getState().profile) return;
    show2d();
    app.setMode2d('erase');
  });

  $('btn2dShowErased').addEventListener('click', (e) => {
    showErased = !showErased;
    e.currentTarget.setAttribute('aria-pressed', String(showErased));
    syncView();
  });

  // ───────────── Calibración por cota conocida ─────────────
  $('btnCalibrate').addEventListener('click', () => {
    if (!app.getState().profile) return;
    show2d();
    view2d.clearMeasures();
    app.setMode2d('calibrate');
  });
  view2d.on('calibrate', ({ d }) => {
    app.setMode2d('select');
    if (!(d > 1e-9)) return view2d.clearMeasures();
    openModal('dist', d);
  });
  view2d.on('calibrateCircle', ({ r }) => {
    app.setMode2d('select');
    if (r > 1e-9) openModal('circle', r);
  });

  // kind: 'dist' (2 puntos, measured = distancia) | 'circle' (measured = radio). Medidas en mm con la escala vigente.
  function openModal(kind, measured) {
    const st = app.getState(), F = st.formatter, circle = kind === 'circle';
    const label = (cota, u) => (circle ? `${cota === 'r' ? 'Radio' : 'Diámetro'} real (${u})` : `Distancia real entre los puntos (${u})`);
    const shown = circle ? 2 * measured : measured;
    ui.showModal(circle ? 'Calibrar escala con un círculo' : 'Calibrar escala', `
      <form id="calibForm" class="form calib-form">
        <p class="calib-measured">${circle ? 'Diámetro' : 'Distancia'} medido con la escala actual: <strong>${ui.escapeHtml(F.len(shown))}</strong></p>
        ${circle ? `<label class="row"><span class="row-label">Cota</span>
          <select id="selCalibCota" class="select"><option value="d">Diámetro</option><option value="r">Radio</option></select></label>` : ''}
        <label class="row"><span class="row-label">Unidad</span>
          <select id="selCalibUnit" class="select"><option value="mm">mm</option><option value="in">in</option></select></label>
        <label class="row"><span id="calibLabel" class="row-label">${label('d', 'mm')}</span>
          <span class="num-field"><input id="inpCalibDist" type="text" inputmode="decimal" value="${+shown.toFixed(3)}" aria-label="${label('d', 'mm')}"></span>
        </label>
        <p id="calibError" class="calib-error" hidden>Escriba una medida mayor que cero.</p>
        <div class="calib-actions">
          <button id="btnCalibCancel" class="btn" type="button">Cancelar</button>
          <button id="btnCalibOk" class="btn btn-primary" type="submit">Aceptar</button>
        </div>
      </form>`);
    const inp = $('inpCalibDist'), unit = $('selCalibUnit'), cota = $('selCalibCota');
    const relabel = () => {
      const t = label(cota?.value || 'd', unit.value);
      $('calibLabel').textContent = t;
      inp.setAttribute('aria-label', t);
    };
    unit.addEventListener('change', relabel);
    cota?.addEventListener('change', relabel);
    inp.focus();
    inp.select();
    $('btnCalibCancel').addEventListener('click', () => {
      ui.closeModal();
      view2d.clearMeasures();
    });
    $('calibForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = Number(String(inp.value).trim().replace(',', '.'));
      if (!(v > 0) || !Number.isFinite(v)) {
        $('calibError').hidden = false;
        return;
      }
      ui.closeModal();
      view2d.clearMeasures();
      const realMM = v * UNIT_MM[unit.value];
      const ref = circle ? (cota.value === 'r' ? measured : 2 * measured) : measured;
      setScale(st.profile.toMM * (realMM / ref));
    });
  }

  // toMM nuevo: mm/px en imágenes; mm por unidad del dibujo (guardado por dibujo) en DXF/DWG/SVG.
  function setScale(toMM) {
    const d = app.getState().drawing;
    if (!d || !(toMM > 0) || !Number.isFinite(toMM)) return;
    if (d.format === 'image') {
      app.setImageScale(toMM);
      ui.toast(`Escala calibrada: ${+toMM.toPrecision(6)} mm/px`, { type: 'success' });
      return;
    }
    of(d).scale = toMM;
    app.reprocess();
    ui.toast(`Escala calibrada: × ${+toMM.toPrecision(6)} mm por unidad del plano`, { type: 'success' });
  }

  $('btnResetScale').addEventListener('click', () => {
    const d = app.getState().drawing;
    if (!d || !store.get(d)?.scale) return;
    of(d).scale = null;
    app.reprocess();
  });

  app.onProfile(() => {
    const d = app.getState().drawing;
    const cal = !!(d && d.format !== 'image' && store.get(d)?.scale);
    $('scaleRow').hidden = !cal;
    if (cal && app.getState().profile) $('infoScale').textContent += ' (calibrada)';
    syncView();
  });

  return {
    profileOptions: (d) => {
      const c = d && store.get(d);
      return { erasedIds: c ? [...c.erased] : [], unitOverride: c?.scale ?? null };
    },
    clearScale: (d) => {
      const c = d && store.get(d);
      if (c) c.scale = null;
    },
  };
}
