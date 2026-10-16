// Tubería de procesamiento (funciones puras, sin DOM): plano importado → perfil en mm →
// estado de operación → trabajo del kernel → datos de pieza. Probable en Node.
//
// Flujo típico en la UI:
//   const drawing = importText(detectFormat(name, head), text, name);
//   const profile = prepareProfile(drawing, { unitOverride: 'auto', hiddenLayers });
//   let op = defaultOpState(profile);             // la UI edita op (regiones, agujeros, modo…)
//   const result = await kernel.build(makeJob(profile, op));
//   const part = computeAll({ build: result, profile, op, material, pricePerKg, blankMargin });
import { segTransform, segLength } from '../geom2d/segments.js';
import { buildLoops, loopInfo, buildRegions, bboxOfSegments } from '../geom2d/loops.js';
import { parseDXF } from '../importers/dxf.js';
import { parseSVG } from '../importers/svg.js';
import { traceImage } from '../importers/image-trace.js';
import { computePartData } from '../ui/report.js';

/** Factores de conversión a mm para la sobreescritura de unidades. */
export const UNIT_FACTORS = { mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8 };

const ROLE_NAMES = { top: 'superior', front: 'frontal', right: 'lateral derecha', left: 'lateral izquierda' };
const VIEW_ROLES = ['top', 'front', 'right', 'left'];
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp']);

/**
 * @typedef {{segs: Object[]}} Loop
 * @typedef {Object} Drawing
 * @property {'dxf'|'svg'|'image'} format
 * @property {string} fileName
 * @property {{name:string,toMM:number,detected:boolean}} units   unidades del dibujo; detected=false si se supusieron
 * @property {Array<{name:string,color?:number,linetype?:string,frozen?:boolean,off?:boolean}>} layers
 * @property {Object[]} segments   segmentos en unidades del dibujo (meta.layer, meta.dashed…)
 * @property {Object[]} texts      solo para mostrar
 * @property {string[]} warnings
 * @property {Object} stats
 * @property {number} [threshold]  solo imagen: umbral usado en el trazado
 */

/**
 * Detecta el formato por extensión; si no la reconoce, olfatea DXF en el contenido ("0\nSECTION").
 * @param {string} fileName
 * @param {string|Uint8Array} [firstBytes]  primeros bytes del archivo (opcional)
 * @returns {'dxf'|'svg'|'image'|null}
 */
export function detectFormat(fileName, firstBytes) {
  const ext = String(fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext === 'dxf') return 'dxf';
  if (ext === 'svg') return 'svg';
  if (IMAGE_EXT.has(ext)) return 'image';
  if (firstBytes != null) {
    let head = firstBytes;
    if (typeof head !== 'string') {
      head = '';
      for (let i = 0; i < Math.min(firstBytes.length, 256); i++) head += String.fromCharCode(firstBytes[i]);
    }
    if (/^\s*0\s*\r?\n\s*SECTION\b/.test(head)) return 'dxf';
  }
  return null;
}

/**
 * Importa un plano de texto (DXF o SVG) a un Drawing.
 * DXF: units.detected = false cuando $INSUNITS falta o es «sin unidades» (se supone mm o in según $MEASUREMENT).
 * @param {'dxf'|'svg'} format
 * @param {string} text
 * @param {string} [fileName]
 * @returns {Drawing}
 */
export function importText(format, text, fileName = '') {
  if (format === 'dxf') {
    const d = parseDXF(text);
    const u = d.units;
    return {
      format, fileName,
      units: { name: u.assumed ?? u.name, toMM: u.toMM, detected: !u.assumed },
      layers: d.layers, segments: d.segments, texts: d.texts, warnings: d.warnings, stats: d.stats,
    };
  }
  if (format === 'svg') {
    const d = parseSVG(text);
    const u = d.units || { name: 'mm', toMM: 1 };
    const names = [...new Set(d.segments.map((s) => s.meta?.layer).filter((n) => n != null))];
    return {
      format, fileName,
      units: { name: u.name, toMM: u.toMM, detected: u.detected ?? (u.name !== 'px' && u.name !== 'unitless') },
      layers: (names.length ? names : ['SVG']).map((name) => ({ name })),
      segments: d.segments, texts: [], warnings: d.warnings || [], stats: { segments: d.segments.length },
    };
  }
  throw new Error(`Formato de plano no soportado: ${format}`);
}

/**
 * Traza una imagen (ImageData ya decodificada por la UI) a un Drawing en píxeles (Y hacia arriba).
 * @param {{width:number,height:number,data:Uint8ClampedArray}} imageData
 * @param {Object} [opts]  opciones de traceImage ({ threshold, invert, minArea, simplifyTol, fitCircles, fitArcs })
 *   más { mmPerPx = 1, fileName = '' }
 * @returns {Drawing}
 */
export function importImage(imageData, opts = {}) {
  const { mmPerPx, fileName = '', ...traceOpts } = opts;
  const r = traceImage(imageData, traceOpts);
  const meta = { layer: 'Trazado', entity: 'TRACE' };
  return {
    format: 'image', fileName,
    units: { name: 'px', toMM: mmPerPx ?? 1, detected: false },
    threshold: r.threshold,
    layers: [{ name: 'Trazado' }],
    segments: r.segments.map((s) => (s.meta ? s : { ...s, meta })),
    texts: [], warnings: r.warnings || [], stats: r.stats,
  };
}

/**
 * @typedef {Object} Profile
 * @property {number} toMM        factor aplicado (mm por unidad del dibujo)
 * @property {number} tol         tolerancia de unión de contornos (mm); se usa también como job.tol
 * @property {Object[]} segments  segmentos usados, en mm
 * @property {Loop[]} loops
 * @property {Object[]} loopInfos loopInfo de cada contorno (área, perímetro, centroide, bbox, circle, poly)
 * @property {Loop[]} open        cadenas abiertas (no se usan en 3D)
 * @property {Array<{outer:number,holes:number[]}>} regions   índices en loops
 * @property {Object[]} nodes     árbol de anidamiento de buildRegions
 * @property {Array<{p0:number[],p1:number[],length:number}>} axisLines  líneas de eje/trazos (mm), de mayor a menor
 * @property {Object} stats       { segmentsIn, segmentsUsed, hiddenRemoved, dashedRemoved, duplicatesRemoved,
 *                                  zeroLengthRemoved, loops, regions, holes, openChains }
 * @property {?{minX:number,minY:number,maxX:number,maxY:number}} bbox   de los segmentos usados (mm)
 * @property {string[]} warnings
 */

/**
 * Escala el dibujo a mm, filtra capas y trazos y arma contornos y regiones.
 * Se descartan los segmentos de capas ocultas (hiddenLayers) y de capas congeladas/apagadas del DXF,
 * y los de línea de trazos (ejes, ocultas) si ignoreDashed.
 * @param {Drawing} drawing
 * @param {Object} [o]
 * @param {'auto'|'mm'|'cm'|'m'|'in'|'ft'|number} [o.unitOverride='auto']  número = mm por unidad del dibujo
 * @param {boolean} [o.ignoreDashed=true]
 * @param {string[]} [o.hiddenLayers=[]]
 * @param {number} [o.tol=0.01]       mm
 * @param {number} [o.chordTol=0.01]  mm (teselado de loopInfo/buildRegions)
 * @returns {Profile}
 */
export function prepareProfile(drawing, { unitOverride = 'auto', ignoreDashed = true, hiddenLayers = [], tol = 0.01, chordTol = 0.01 } = {}) {
  let toMM;
  if (unitOverride == null || unitOverride === 'auto') toMM = drawing.units.toMM;
  else if (typeof unitOverride === 'number' && unitOverride > 0) toMM = unitOverride;
  else if (UNIT_FACTORS[unitOverride]) toMM = UNIT_FACTORS[unitOverride];
  else throw new Error(`Unidad desconocida: ${unitOverride}`);

  const off = new Set((drawing.layers || []).filter((l) => l.frozen || l.off).map((l) => l.name));
  const hidden = new Set([...off, ...hiddenLayers]);
  const m = [toMM, 0, 0, toMM, 0, 0];
  const scale = (s) => (toMM === 1 ? s : segTransform(s, m));
  const segments = [], axisLines = [];
  let hiddenRemoved = 0, dashedRemoved = 0;
  for (const s of drawing.segments) {
    const layer = s.meta?.layer, dashed = !!s.meta?.dashed;
    // Candidatos a eje: líneas de trazos de capas no congeladas/apagadas, aunque se filtren después.
    if (dashed && s.type === 'line' && !off.has(layer)) {
      const t = scale(s);
      axisLines.push({ p0: t.p0, p1: t.p1, length: segLength(t) });
    }
    if (hidden.has(layer)) hiddenRemoved++;
    else if (ignoreDashed && dashed) dashedRemoved++;
    else segments.push(scale(s));
  }
  axisLines.sort((a, b) => b.length - a.length);

  const L = buildLoops(segments, { tol });
  const loopInfos = L.loops.map((l) => loopInfo(l, chordTol));
  const { nodes, regions } = buildRegions(L.loops, { chordTol });
  const holes = regions.reduce((n, r) => n + r.holes.length, 0);
  const warnings = [];
  if (!L.loops.length) warnings.push('No se encontraron contornos cerrados en el plano.');
  if (L.open.length) warnings.push(`${L.open.length} cadena(s) abierta(s) no forman contorno y no se usarán en 3D.`);
  return {
    toMM, tol, segments, loops: L.loops, loopInfos, open: L.open, regions, nodes, axisLines,
    stats: {
      segmentsIn: drawing.segments.length, segmentsUsed: segments.length, hiddenRemoved, dashedRemoved,
      duplicatesRemoved: L.stats.duplicatesRemoved, zeroLengthRemoved: L.stats.zeroLengthRemoved,
      loops: L.loops.length, regions: regions.length, holes, openChains: L.open.length,
    },
    bbox: bboxOfSegments(segments),
    warnings,
  };
}

// Contorno exterior = rectángulo alineado a los ejes (solo líneas H/V y área = caja).
function isAxisRect(loop, info) {
  const b = info.bbox, size = Math.max(b.maxX - b.minX, b.maxY - b.minY), eps = 1e-9 * Math.max(1, size);
  if (!loop.segs.every((s) => s.type === 'line' && (Math.abs(s.p0[0] - s.p1[0]) <= eps || Math.abs(s.p0[1] - s.p1[1]) <= eps))) return false;
  const boxArea = (b.maxX - b.minX) * (b.maxY - b.minY);
  return boxArea > 0 && Math.abs(info.area - boxArea) <= 1e-6 * boxArea;
}

/**
 * Estado de operación por defecto (lo edita la UI y lo consume makeJob).
 * - regions[i] ↔ profile.regions[i]; holes[k] ↔ profile.regions[i].holes[k].
 *   height/z0/depth null = por defecto (espesor general / 0 / mitad de la altura para ciegos).
 * - Marco: una región cuyo exterior es un rectángulo alineado y cuyos agujeros contienen ≥ 2 exteriores
 *   de otras regiones (borde doble de un plano) se excluye y se avisa en `warnings`.
 * - Eje de revolución: la línea de trazos más larga del dibujo (axisKind 'x'/'y' si coincide con un eje
 *   coordenado), o el eje X si no hay ninguna.
 * @param {Profile} profile
 * @returns {Object} op
 */
export function defaultOpState(profile) {
  const warnings = [];
  const regions = profile.regions.map((r) => {
    const contained = r.holes.reduce((n, h) => n + profile.nodes[h].children.length, 0);
    const frame = contained >= 2 && isAxisRect(profile.loops[r.outer], profile.loopInfos[r.outer]);
    return { included: !frame, height: null, z0: null, holes: r.holes.map(() => ({ op: 'through', depth: null })) };
  });
  if (regions.some((r) => !r.included)) warnings.push('Se excluyó un posible marco del plano');

  let revolve = { axisKind: 'x', axis: { p: [0, 0], d: [1, 0] }, angleDeg: 360 };
  const a = profile.axisLines?.[0];
  if (a) {
    let d = [a.p1[0] - a.p0[0], a.p1[1] - a.p0[1]];
    const l = Math.hypot(d[0], d[1]);
    d = [d[0] / l, d[1] / l];
    if (d[0] < -1e-12 || (Math.abs(d[0]) <= 1e-12 && d[1] < 0)) d = [-d[0], -d[1]];
    const eps = profile.tol ?? 0.01;
    if (Math.abs(d[1]) <= 1e-9 && Math.abs(a.p0[1]) <= eps) revolve = { axisKind: 'x', axis: { p: [0, 0], d: [1, 0] }, angleDeg: 360 };
    else if (Math.abs(d[0]) <= 1e-9 && Math.abs(a.p0[0]) <= eps) revolve = { axisKind: 'y', axis: { p: [0, 0], d: [0, 1] }, angleDeg: 360 };
    else revolve = { axisKind: 'line', axis: { p: a.p0.slice(), d }, angleDeg: 360 };
  }
  return {
    mode: 'extrude', thickness: 2, symmetric: false, regions,
    fillets: { vertical: 0, top: 0, chamferTop: 0 },
    revolve,
    multiview: { windows: { top: null, front: null, right: null, left: null } },
    warnings,
  };
}

/**
 * Aplica una sugerencia de ejemplo ({ mode, thickness, revolve?, multiview?: { windows } }) a un op.
 * @returns {Object} op nuevo
 */
export function applySuggested(op, suggested = {}) {
  const r = { ...op };
  if (suggested.mode) r.mode = suggested.mode;
  if (suggested.thickness != null) r.thickness = suggested.thickness;
  if (suggested.revolve) r.revolve = { ...op.revolve, ...suggested.revolve };
  if (suggested.multiview?.windows) r.multiview = { ...op.multiview, windows: { ...op.multiview.windows, ...suggested.multiview.windows } };
  return r;
}

const clean = (loop) => ({ segs: loop.segs.map(({ meta, ...s }) => s) });
const regionState = (op, i) => op.regions?.[i] ?? { included: true, height: null, z0: null, holes: [] };
const holeState = (rs, k) => rs.holes?.[k] ?? { op: 'through', depth: null };
const regionHeight = (op, rs) => rs.height ?? op.thickness;
// Profundidad de un agujero ciego; por defecto la mitad de la altura.
const blindDepth = (hs, h) => hs.depth ?? h / 2;

function revolveAxis(rv) {
  if (rv.axisKind === 'y') return { p: [0, 0], d: [0, 1] };
  if (rv.axisKind === 'line') return { p: rv.axis.p.slice(), d: rv.axis.d.slice() };
  return { p: [0, 0], d: [1, 0] };
}

function normBox(w) {
  return { minX: Math.min(w.minX, w.maxX), minY: Math.min(w.minY, w.maxY), maxX: Math.max(w.minX, w.maxX), maxY: Math.max(w.minY, w.maxY) };
}

const MESH_QUALITY = { low: [1e-3, 0.3], high: [5e-5, 0.08] };

/**
 * Arma el trabajo del kernel (contrato C4). Regiones excluidas y agujeros 'none' no se envían.
 * id de región = índice en profile.regions + 1 (coincide con la numeración de la UI).
 * Multivista: una región pertenece a la ventana de una vista si la caja de su exterior cae dentro (± tol);
 * los agujeros 'through' y 'blind' son huecos de la silueta.
 * @param {Profile} profile
 * @param {Object} op   estado de defaultOpState (editado)
 * @param {{meshQuality?: 'low'|'normal'|'high'|{tolerance:number,angularTolerance:number}}} [o]
 * @returns {Object} job
 */
export function makeJob(profile, op, { meshQuality = 'normal' } = {}) {
  const job = { mode: op.mode, tol: profile.tol ?? 0.01, regions: [] };
  const included = profile.regions.map((r, i) => ({ r, i, rs: regionState(op, i) })).filter((x) => x.rs.included !== false);

  if (op.mode === 'extrude' || op.mode === 'revolve') {
    if (!included.length) throw new Error('No hay regiones incluidas para construir la pieza.');
    job.regions = included.map(({ r, i, rs }) => {
      const h = regionHeight(op, rs);
      const holes = [];
      r.holes.forEach((li, k) => {
        const hs = holeState(rs, k);
        if (hs.op === 'none') return;
        holes.push({ loop: clean(profile.loops[li]), op: hs.op, depth: hs.op === 'blind' ? blindDepth(hs, h) : undefined });
      });
      const reg = { id: i + 1, outer: clean(profile.loops[r.outer]), holes };
      if (rs.height != null) reg.height = rs.height;
      if (rs.z0 != null) reg.z0 = rs.z0;
      return reg;
    });
    if (op.mode === 'extrude') {
      job.extrude = { thickness: op.thickness, symmetric: !!op.symmetric, fillets: { vertical: 0, top: 0, chamferTop: 0, ...op.fillets } };
    } else {
      job.revolve = { axis: revolveAxis(op.revolve), angleDeg: op.revolve.angleDeg ?? 360 };
    }
  } else if (op.mode === 'multiview') {
    const tol = job.tol, views = [];
    for (const role of VIEW_ROLES) {
      const w0 = op.multiview?.windows?.[role];
      if (!w0) continue;
      const w = normBox(w0);
      const regions = included
        .filter(({ r }) => {
          const b = profile.loopInfos[r.outer].bbox;
          return b.minX >= w.minX - tol && b.minY >= w.minY - tol && b.maxX <= w.maxX + tol && b.maxY <= w.maxY + tol;
        })
        .map(({ r, rs }) => ({
          outer: clean(profile.loops[r.outer]),
          holes: r.holes.filter((_, k) => holeState(rs, k).op !== 'none').map((li) => clean(profile.loops[li])),
        }));
      if (!regions.length) throw new Error(`La vista ${ROLE_NAMES[role]} no contiene ninguna región; ajuste su ventana.`);
      views.push({ role, regions });
    }
    if (views.length < 2) throw new Error('Defina al menos dos vistas (ventanas) para reconstruir la pieza.');
    job.multiview = { views };
  } else {
    throw new Error(`Modo de construcción desconocido: ${op.mode}`);
  }

  if (typeof meshQuality === 'object' && meshQuality) job.mesh = { ...meshQuality };
  else if (MESH_QUALITY[meshQuality] && profile.bbox) {
    const b = profile.bbox, diag = Math.hypot(b.maxX - b.minX, b.maxY - b.minY);
    const [k, ang] = MESH_QUALITY[meshQuality];
    job.mesh = { tolerance: Math.max(0.001, diag * k), angularTolerance: ang };
  }
  return job;
}

/**
 * Resumen 2D de las regiones incluidas (entrada `profile` de computePartData).
 * Cómo cuentan los agujeros:
 * - 'through': se restan de netArea, su perímetro suma a perimeterInner (longitud de corte) y se listan.
 * - 'blind': no se restan ni suman corte (no atraviesan la lámina), pero se listan con op 'blind'.
 * - 'none': se ignoran por completo (no son agujeros).
 * @returns {{netArea:number, perimeterOuter:number, perimeterInner:number, loops:number,
 *   holes:Array<{d:?number,c:number[],area:number,perimeter:number,op:string}>, bbox2d:?Object}}
 */
export function profileSummary(profile, op) {
  let netArea = 0, perimeterOuter = 0, perimeterInner = 0, loops = 0;
  const holes = [];
  let bbox2d = null;
  profile.regions.forEach((r, i) => {
    const rs = regionState(op, i);
    if (rs.included === false) return;
    const oi = profile.loopInfos[r.outer];
    netArea += oi.area;
    perimeterOuter += oi.perimeter;
    loops++;
    const b = oi.bbox;
    bbox2d = bbox2d
      ? { minX: Math.min(bbox2d.minX, b.minX), minY: Math.min(bbox2d.minY, b.minY), maxX: Math.max(bbox2d.maxX, b.maxX), maxY: Math.max(bbox2d.maxY, b.maxY) }
      : { ...b };
    r.holes.forEach((li, k) => {
      const hop = holeState(rs, k).op;
      if (hop === 'none') return;
      const hi = profile.loopInfos[li];
      loops++;
      if (hop === 'through') {
        netArea -= hi.area;
        perimeterInner += hi.perimeter;
      }
      holes.push({ d: hi.circle ? 2 * hi.circle.r : null, c: (hi.circle ? hi.circle.c : hi.centroid).slice(), area: hi.area, perimeter: hi.perimeter, op: hop });
    });
  });
  return { netArea, perimeterOuter, perimeterInner, loops, holes, bbox2d };
}

/**
 * Volumen exacto por matemática 2D, o null si no es deducible (redondeos/chaflanes, multivista,
 * o revolución con regiones a ambos lados del eje).
 * Extrusión: Σ (A_ext − Σ A_pasantes − Σ A_ciegos·(prof/h))·h por región (prof ≥ h cuenta como pasante;
 * 'none' no se resta). Revolución (Pappus): θ·Σ A·r̄ (exterior menos agujeros no 'none').
 * @returns {?number} mm³
 */
export function analyticVolume(profile, op) {
  const inc = profile.regions.map((r, i) => ({ r, rs: regionState(op, i) })).filter((x) => x.rs.included !== false);
  if (!inc.length) return null;
  const info = (i) => profile.loopInfos[i];
  if (op.mode === 'extrude') {
    const f = op.fillets || {};
    if ((f.vertical || 0) > 0 || (f.top || 0) > 0 || (f.chamferTop || 0) > 0) return null;
    let V = 0;
    for (const { r, rs } of inc) {
      const h = regionHeight(op, rs);
      let A = info(r.outer).area;
      r.holes.forEach((li, k) => {
        const hs = holeState(rs, k);
        if (hs.op === 'through') A -= info(li).area;
        else if (hs.op === 'blind') A -= info(li).area * Math.min(blindDepth(hs, h), h) / h;
      });
      V += A * h;
    }
    return V;
  }
  if (op.mode === 'revolve') {
    const { p, d } = revolveAxis(op.revolve);
    const dl = Math.hypot(d[0], d[1]);
    const side = (q) => (d[0] * (q[1] - p[1]) - d[1] * (q[0] - p[0])) / dl;
    let sum = 0, sgn = 0;
    for (const { r, rs } of inc) {
      const oi = info(r.outer);
      const s = Math.sign(side(oi.centroid));
      if (sgn && s && s !== sgn) return null;
      sgn = sgn || s;
      sum += oi.area * Math.abs(side(oi.centroid));
      r.holes.forEach((li, k) => {
        if (holeState(rs, k).op !== 'none') sum -= info(li).area * Math.abs(side(info(li).centroid));
      });
    }
    return ((op.revolve.angleDeg ?? 360) * Math.PI / 180) * sum;
  }
  return null;
}

/**
 * Datos completos de la pieza: computePartData con profileSummary, analyticVolume y espesor.
 * @param {{build:Object, profile:Profile, op:Object, material:Object, pricePerKg?:number, blankMargin?:number}} a
 * @returns {Object} PartData (ver ui/report.js)
 */
export function computeAll({ build, profile, op, material, pricePerKg, blankMargin = 0 }) {
  return computePartData({
    build, material, mode: op.mode,
    profile: profileSummary(profile, op),
    thickness: op.mode === 'extrude' ? op.thickness : undefined,
    pricePerKg, blankMargin,
    analyticVolume: analyticVolume(profile, op) ?? undefined,
  });
}
