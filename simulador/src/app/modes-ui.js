// Modos de interacción del plano: ventanas de multivista y marco del plano (calibración y borrado: cleanup-ui.js).
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
