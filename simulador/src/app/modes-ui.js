// Modos de interacción del plano: ventanas de multivista, calibración de imágenes y marco del plano.
// Se apoya solo en la API de la app (app-api.js) y en las utilidades del armazón (ui-shell.js).
import * as ui from './ui-shell.js';

const $ = ui.$;
const ROLES = ['top', 'front', 'right', 'left'];
const SLOT_IDS = { top: 'slotTop', front: 'slotFront', right: 'slotRight', left: 'slotLeft' };
const WINDOW_HINTS = {
  top: 'Arrastra un rectángulo alrededor de la vista Planta (vista desde arriba)',
  front: 'Arrastra un rectángulo alrededor de la vista Alzado (vista de frente)',
  right: 'Arrastra un rectángulo alrededor de la vista Lateral derecha',
  left: 'Arrastra un rectángulo alrededor de la vista Lateral izquierda',
};
const MISMATCH = /no coinciden/;

/** @param {Object} app  API de la app (window.__app) */
export function initModes(app) {
  const { view2d } = app;
  let pendingRole = null; // vista cuya ventana se está dibujando
  let frameCount = 0; // contornos del marco detectados en el plano actual

  // Pestaña con la vista 2D visible (la dividida también sirve).
  const show2d = () => {
    if (ui.getActiveTab() === '3d') ui.setActiveTab('2d');
  };

  // ───────────── Multivista ─────────────
  const setPending = (role) => {
    pendingRole = role;
    for (const r of ROLES) $(SLOT_IDS[r]).classList.toggle('is-active', r === role);
  };
  const cancelWindow = () => {
    if (!pendingRole) return;
    setPending(null);
    app.setMode2d('select');
  };

  $('panelMultiview').addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    const slot = b && b.closest('.slot[data-role]');
    if (!slot) return;
    const role = slot.dataset.role;
    if (b.dataset.action === 'clear') {
      if (pendingRole === role) cancelWindow();
      app.setViewWindow(role, null);
    } else if (b.dataset.action === 'define' && app.getState().profile) {
      show2d();
      app.setMode2d('window');
      setPending(role);
      ui.setHint(WINDOW_HINTS[role], '2d');
    }
  });

  view2d.on('window', (box) => {
    if (!pendingRole) return;
    const role = pendingRole;
    setPending(null);
    app.setMode2d('select');
    app.setViewWindow(role, box);
    const n = ROLES.filter((r) => app.getState().op?.multiview.windows[r]).length;
    if (n < 2) ui.setHint('Define al menos una vista más para reconstruir la pieza', '2d');
  });

  // Otro modo de la barra 2D anula la ventana pendiente.
  $('toolbar2d').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode2d]');
    if (b && b.dataset.mode2d !== 'window') setPending(null);
  });

  // Esc cancela la ventana o la calibración en curso (sin ocupar el atajo global).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !$('modal').hidden) return;
    if (pendingRole) cancelWindow();
    else if (view2d.mode === 'calibrate' || view2d.mode === 'axis') app.setMode2d('select');
  });

  // Avisos del núcleo cuando las vistas no miden lo mismo.
  const mvWarn = $('mvWarn');
  app.onBuilt((pd, build) => {
    const list = app.getState().op?.mode === 'multiview' ? (build?.warnings || []).filter((w) => MISMATCH.test(w)) : [];
    mvWarn.hidden = !list.length;
    mvWarn.querySelector('span').textContent = list.join(' ');
  });

  // ───────────── Calibración de imágenes ─────────────
  $('btnCalibrate').addEventListener('click', () => {
    if (!app.getState().profile) return;
    show2d();
    view2d.clearMeasures();
    app.setMode2d('calibrate');
  });

  view2d.on('calibrate', ({ d }) => {
    app.setMode2d('select');
    const st = app.getState();
    if (st.drawing?.format !== 'image') {
      view2d.clearMeasures();
      ui.toast('La calibración con 2 puntos solo se aplica a imágenes; en DXF/SVG elija las «Unidades del plano».', { type: 'info' });
      return;
    }
    if (!(d > 1e-9)) return view2d.clearMeasures();
    openCalibrateModal(d, st.formatter, st.profile.toMM);
  });

  // toMM de una imagen = escala vigente en mm/px (sin el redondeo del campo).
  function openCalibrateModal(d, F, scale) {
    ui.showModal('Calibrar escala de la imagen', `
      <form id="calibForm" class="form calib-form">
        <p class="calib-measured">Distancia medida con la escala actual: <strong>${ui.escapeHtml(F.len(d))}</strong></p>
        <label class="row"><span class="row-label">Distancia real entre los puntos (mm)</span>
          <span class="num-field"><input id="inpCalibDist" type="text" inputmode="decimal" value="${+d.toFixed(3)}" aria-label="Distancia real entre los puntos (mm)"><span class="unit">mm</span></span>
        </label>
        <p id="calibError" class="calib-error" hidden>Escriba una distancia mayor que cero.</p>
        <div class="calib-actions">
          <button id="btnCalibCancel" class="btn" type="button">Cancelar</button>
          <button id="btnCalibOk" class="btn btn-primary" type="submit">Aceptar</button>
        </div>
      </form>`);
    const inp = $('inpCalibDist');
    inp.focus();
    inp.select();
    $('btnCalibCancel').addEventListener('click', () => {
      ui.closeModal();
      view2d.clearMeasures();
    });
    $('calibForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const real = Number(String(inp.value).trim().replace(',', '.'));
      if (!(real > 0) || !Number.isFinite(real)) {
        $('calibError').hidden = false;
        return;
      }
      ui.closeModal();
      view2d.clearMeasures();
      const mmPerPx = scale * (real / d);
      app.setImageScale(mmPerPx);
      ui.toast(`Escala calibrada: ${+mmPerPx.toPrecision(6)} mm/px`, { type: 'success' });
    });
  }

  // ───────────── Marco del plano ─────────────
  const chkFrame = $('chkIncludeFrame');
  const renderFrame = (fresh) => {
    const p = app.getState().profile;
    if (!p) return;
    if (fresh) chkFrame.checked = false;
    // Con el marco incluido el perfil ya no lo detecta: se conserva la cuenta de la detección.
    if (!chkFrame.checked) frameCount = p.frameLoops.length;
    $('frameRow').hidden = !frameCount;
    $('frameInfo').textContent = `Marco del plano detectado (${frameCount} ${frameCount === 1 ? 'contorno' : 'contornos'})`;
  };
  app.onProfile((fresh) => {
    if (fresh) setPending(null);
    renderFrame(fresh);
  });
  chkFrame.addEventListener('change', () => app.setFrameLoops(chkFrame.checked ? [] : null));
}
