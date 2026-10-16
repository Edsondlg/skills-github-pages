// API de la aplicación para la segunda parte de la integración y las pruebas e2e (window.__app).
// main.js crea el contexto y registra aquí sus operaciones.

/**
 * @param {Object} ctx  { S, kernel, viewer, measure, view2d, actions }
 *   actions: { setViewWindow, setRevolveAxis, setImageScale, rebuild, pickAxis, loadSample, openFiles, setMode2d, setFrameLoops }
 * @returns {Object} appApi
 */
export function createAppApi(ctx) {
  const built = new Set();
  const measureListeners = new Set();
  const unitsListeners = new Set();
  const profileListeners = new Set();
  const { S, actions } = ctx;
  return {
    kernel: ctx.kernel,
    viewer: ctx.viewer,
    measure: ctx.measure,
    view2d: ctx.view2d,
    /** Estado actual (referencias vivas; no mutar fuera de las acciones). */
    getState: () => ({
      drawing: S.drawing, profile: S.profile, op: S.op, build: S.build, partData: S.partData,
      material: S.material, formatter: S.F, system: S.F.system, sampleId: S.sampleId, building: S.building,
    }),
    /** cb(partData, build) tras cada generación y cada recálculo de propiedades. */
    onBuilt: (cb) => (built.add(cb), () => built.delete(cb)),
    /** cb(fresh) tras rehacer el perfil (fresh = plano recién abierto; false = opción del paso 1). */
    onProfile: (cb) => (profileListeners.add(cb), () => profileListeners.delete(cb)),
    /** cb(list, { hint, inspect }) en cada cambio de MeasureTools. */
    onMeasureChange: (cb) => (measureListeners.add(cb), () => measureListeners.delete(cb)),
    /** Ventana de una vista ('top'|'front'|'right'|'left') en mm del plano; null la borra. */
    setViewWindow: (role, box) => actions.setViewWindow(role, box),
    /** cb(formatter) tras cambiar mm/in (state.formatter ya actualizado). */
    onUnitsChange: (cb) => (unitsListeners.add(cb), () => unitsListeners.delete(cb)),
    /** 'x' | 'y' | { p:[x,y], d:[dx,dy] } (línea en mm). */
    setRevolveAxis: (axis) => actions.setRevolveAxis(axis),
    /** Escala de la imagen trazada (mm por píxel). */
    setImageScale: (mmPerPx) => actions.setImageScale(mmPerPx),
    /** Lanza la generación ya (sin esperar al antirrebote). Devuelve una promesa. */
    rebuild: () => actions.rebuild(),
    /** Activa el modo 'axis' de la vista 2D; el clic en una línea fija el eje. */
    pickAxis: () => actions.pickAxis(),
    /** Modo de la vista 2D ('select'|'measure'|'window'|'axis'|'calibrate') con su botón y su pista. */
    setMode2d: (mode) => actions.setMode2d(mode),
    /** Marco del plano: null = detección automática (excluido); [] = incluido en el modelo. */
    setFrameLoops: (v) => actions.setFrameLoops(v),
    loadSample: (id) => actions.loadSample(id),
    openFiles: (files) => actions.openFiles(files),
    _emitBuilt: () => { for (const cb of built) cb(S.partData, S.build); },
    _emitUnits: () => { for (const cb of unitsListeners) cb(S.F); },
    _emitProfile: (fresh) => { for (const cb of profileListeners) cb(fresh); },
    _emitMeasure: (list, extra) => { for (const cb of measureListeners) cb(list, extra); },
  };
}
