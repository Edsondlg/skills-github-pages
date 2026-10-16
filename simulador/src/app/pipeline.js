// Tubería de procesamiento (funciones puras, sin DOM): plano importado → perfil en mm →
// estado de operación → trabajo del kernel → datos de pieza. Probable en Node.
//
// Flujo típico en la UI:
//   const drawing = importText(detectFormat(name, head), text, name);
//   const profile = prepareProfile(drawing, { unitOverride: 'auto', hiddenLayers });
//   let op = defaultOpState(profile);             // la UI edita op (regiones, agujeros, modo…)
//   const result = await kernel.build(makeJob(profile, op));
//   const part = computeAll({ build: result, profile, op, material, pricePerKg, blankMargin });
import { segTransform, segLength, segInvalidReason } from '../geom2d/segments.js';
import { buildLoops, loopInfo, buildRegions, bboxOfSegments } from '../geom2d/loops.js';
import { parseDXF } from '../importers/dxf.js';
import { parseDWG } from '../importers/dwg.js';
import { parseSVG } from '../importers/svg.js';
import { traceImage } from '../importers/image-trace.js';
import { computePartData } from '../ui/report.js';

/** Factores de conversión a mm para la sobreescritura de unidades. */
export const UNIT_FACTORS = { mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8 };

const ROLE_NAMES = { top: 'superior', front: 'frontal', right: 'lateral derecha', left: 'lateral izquierda' };
const VIEW_ROLES = ['top', 'front', 'right', 'left'];
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp']);

/** Id estable de un segmento del plano (meta.sid asignado al importar; si falta, su índice). */
export const segId = (s, i) => s.meta?.sid ?? i;
// Ids estables al importar: meta.sid = índice en drawing.segments (meta copiado: puede ser compartido).
const withIds = (segs) => segs.map((s, i) => ({ ...s, meta: { ...s.meta, sid: i } }));

/**
 * @typedef {{segs: Object[]}} Loop
 * @typedef {Object} Drawing
 * @property {'dxf'|'dwg'|'svg'|'image'} format
 * @property {string} [version]  solo DWG: versión legible (p. ej. 'AC1027 (AutoCAD 2013)')
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
 * Detecta el formato por extensión; si no la reconoce, olfatea DXF ("0\nSECTION") o DWG (firma AC10xx) en el contenido.
 * @param {string} fileName
 * @param {string|Uint8Array} [firstBytes]  primeros bytes del archivo (opcional)
 * @returns {'dxf'|'dwg'|'svg'|'image'|null}
 */
export function detectFormat(fileName, firstBytes) {
  const ext = String(fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext === 'dxf') return 'dxf';
  if (ext === 'dwg') return 'dwg';
  if (ext === 'svg') return 'svg';
  if (IMAGE_EXT.has(ext)) return 'image';
  if (firstBytes != null) {
    let head = firstBytes;
    if (typeof head !== 'string') {
      head = '';
      for (let i = 0; i < Math.min(firstBytes.length, 256); i++) head += String.fromCharCode(firstBytes[i]);
    }
    if (/^\s*0\s*\r?\n\s*SECTION\b/.test(head)) return 'dxf';
    if (/^AC10\d\d/.test(head)) return 'dwg';
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
  if (format === 'dxf') return drawingFromDXF(format, parseDXF(text), fileName);
  if (format === 'svg') {
    const d = parseSVG(text);
    const u = d.units || { name: 'mm', toMM: 1 };
    const names = [...new Set(d.segments.map((s) => s.meta?.layer).filter((n) => n != null))];
    return {
      format, fileName,
      units: { name: u.name, toMM: u.toMM, detected: u.detected ?? (u.name !== 'px' && u.name !== 'unitless') },
      layers: (names.length ? names : ['SVG']).map((name) => ({ name })),
      segments: withIds(d.segments), texts: [], warnings: d.warnings || [], stats: { segments: d.segments.length },
    };
  }
  throw new Error(`Formato de plano no soportado: ${format}`);
}

/**
 * Importa un DWG (R13–2018): se convierte a DXF y se analiza igual (ver importers/dwg.js).
 * @param {Uint8Array|ArrayBuffer} bytes
 * @param {string} [fileName]
 * @returns {Promise<Drawing>}  con format 'dwg' y version
 */
export async function importDWG(bytes, fileName = '') {
  const d = await parseDWG(bytes);
  return { ...drawingFromDXF('dwg', d, fileName), version: d.version };
}

// Resultado de parseDXF → Drawing.
function drawingFromDXF(format, d, fileName) {
  const u = d.units;
  return {
    format, fileName,
    units: { name: u.assumed ?? u.name, toMM: u.toMM, detected: !u.assumed },
    layers: d.layers, segments: withIds(d.segments), texts: d.texts, warnings: d.warnings, stats: d.stats,
  };
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
    segments: withIds(r.segments.map((s) => (s.meta ? s : { ...s, meta }))),
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
 * @property {Array<{outer:number,holes:number[]}>} regions   índices en loops (sin los contornos del marco)
 * @property {Object[]} nodes     árbol de anidamiento de buildRegions; nodes[i] ↔ loops[i]. Los contornos del marco
 *                                no participan: { parent: -1, depth: 0, children: [], frame: true }
 * @property {number[]} frameLoops  índices en loops del marco del plano excluido (vacío si no hay)
 * @property {number[]} annotationLoops  índices en loops de los círculos exteriores de pares concéntricos
 *                                (avellanado/rosca) excluidos del anidamiento; nodos con annotation: true
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
 * @param {boolean} [o.detectFrame=true]  detectar el marco del plano (ver detectFrameLoops) y sacarlo de las regiones
 * @param {boolean} [o.concentricAsAnnotation=true]  par de círculos concéntricos (agujero + isla) = avellanado o rosca:
 *   el círculo exterior se trata como anotación y el interior queda como barreno
 * @param {?number[]} [o.annotationLoops=null]  índices en loops de las anotaciones; si se da, sustituye a la detección
 * @param {boolean} [o.mergeDoubleLines=true]  par de contornos anidados casi paralelos y muy próximos (chaflán o
 *   arista dibujados con doble línea) = un solo contorno: el interior de un exterior o el exterior de un agujero
 *   pasa a ser anotación (ver detectDoubleLines)
 * @param {Iterable<number>} [o.erasedIds=[]]  ids de segmento (segId) borrados por el usuario: se descartan antes
 *   de armar los contornos
 * @param {?number[]} [o.frameLoops=null]  índices en loops del marco elegidos por el usuario (posiblemente vacío);
 *   si se da, sustituye a la detección. Los índices son estables para el mismo dibujo y las mismas opciones.
 * Los contornos del marco siguen en loops/loopInfos (para dibujarlos) con sus índices originales; las regiones se
 * calculan sin ellos y sus índices outer/holes apuntan a loops.
 * @returns {Profile}
 */
export function prepareProfile(drawing, { unitOverride = 'auto', ignoreDashed = true, hiddenLayers = [], tol = 0.01, chordTol = 0.01, detectFrame = true, frameLoops = null, concentricAsAnnotation = true, annotationLoops = null, mergeDoubleLines = true, erasedIds = [] } = {}) {
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
  let hiddenRemoved = 0, dashedRemoved = 0, erasedRemoved = 0;
  const invalid = new Map(); // motivo → cantidad
  const erased = new Set(erasedIds);
  for (let i = 0; i < drawing.segments.length; i++) {
    const s = drawing.segments[i];
    if (erased.size && erased.has(segId(s, i))) { erasedRemoved++; continue; }
    const why = segInvalidReason(s);
    if (why) { invalid.set(why, (invalid.get(why) || 0) + 1); continue; }
    const layer = s.meta?.layer, dashed = !!s.meta?.dashed;
    // Candidatos a eje: líneas de trazos de capas visibles, aunque se filtren después por ser trazos.
    if (dashed && s.type === 'line' && !hidden.has(layer)) {
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
  const warnings = [];
  for (const [why, n] of invalid) warnings.push(`Se omitieron ${n} entidad(es) con geometría inválida: ${why}.`);
  let frame;
  if (Array.isArray(frameLoops)) frame = [...new Set(frameLoops)].filter((i) => Number.isInteger(i) && i >= 0 && i < L.loops.length).sort((a, b) => a - b);
  else if (detectFrame) {
    frame = detectFrameLoops(L.loops, loopInfos, buildRegions(L.loops, { chordTol }).nodes, tol, mergeDoubleLines);
    if (frame.length) warnings.push('Se detectó el marco del plano y se excluyó del modelo (actívalo con «Incluir marco en el modelo» en el paso 1).');
  } else frame = [];
  // Anotaciones: círculo exterior de pares concéntricos (se anida sin el marco).
  const fr = new Set(frame);
  let annotation = [];
  if (Array.isArray(annotationLoops)) annotation = [...new Set(annotationLoops)].filter((i) => Number.isInteger(i) && i >= 0 && i < L.loops.length && !fr.has(i)).sort((a, b) => a - b);
  else {
    if (mergeDoubleLines) {
      annotation = detectDoubleLines(loopInfos, regionsWithout(L.loops, frame, chordTol).nodes, tol);
      if (annotation.length) warnings.push(`Se interpretaron ${annotation.length} contornos dobles (chaflán o arista) como una sola línea.`);
    }
    const found = concentricAsAnnotation ? detectConcentricAnnotations(L.loops, loopInfos, regionsWithout(L.loops, [...frame, ...annotation], chordTol).nodes, tol) : [];
    annotation = [...annotation, ...found.map((p) => p.outer)].sort((a, b) => a - b);
    if (found.length) {
      const ds = found.slice(0, 3).map((p) => (2 * loopInfos[p.inner].circle.r).toFixed(3)).join(', ');
      warnings.push(`Se interpretaron ${found.length} pares de círculos concéntricos como avellanado o rosca: se usa el círculo interior como barreno (Ø ${ds}).`);
    }
  }
  const { nodes, regions } = regionsWithout(L.loops, [...frame, ...annotation], chordTol, new Set(annotation));
  const holes = regions.reduce((n, r) => n + r.holes.length, 0);
  if (!L.loops.length) warnings.push('No se encontraron contornos cerrados en el plano.');
  if (L.open.length) warnings.push(`${L.open.length} cadena(s) abierta(s) no forman contorno y no se usarán en 3D.`);
  return {
    toMM, tol, segments, loops: L.loops, loopInfos, open: L.open, regions, nodes, frameLoops: frame, annotationLoops: annotation, axisLines,
    stats: {
      segmentsIn: drawing.segments.length, segmentsUsed: segments.length, hiddenRemoved, dashedRemoved, erasedRemoved,
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

// Dos círculos concéntricos (mismo centro dentro de tol).
function concentricCircles(a, b, tol) {
  return !!(a.circle && b.circle) && Math.hypot(a.circle.c[0] - b.circle.c[0], a.circle.c[1] - b.circle.c[1]) <= tol;
}

/**
 * Marco del plano (índices en loops) sobre el anidamiento completo; [] si no hay. Candidatos: rectángulos
 * alineados de profundidad 0, el mayor primero.
 * - Borde doble: R con un único agujero H rectangular alineado, metido en los cuatro lados > 0 y
 *   ≤ max(20 mm, 8 % del lado menor de R), y H contiene ≥ 1 isla → [R, H].
 * - Línea sencilla: R con algún agujero que contiene una isla, sin ser el par (agujero, isla) dos círculos
 *   concéntricos (avellanado/rosca) → [R].
 */
function detectFrameLoops(loops, infos, nodes, tol, skipThin = false) {
  const cands = nodes.map((_, i) => i).filter((i) => nodes[i].parent === -1 && isAxisRect(loops[i], infos[i]))
    .sort((a, b) => infos[b].area - infos[a].area);
  for (const r of cands) {
    const R = infos[r].bbox;
    // Con mergeDoubleLines las dobles líneas de arista no son marco: un contorno pegado al borde (≤ 1 mm) se ignora
    // y un agujero cuya isla es su doble línea no cuenta como agujero con pieza dentro.
    const thin = (h) => { const H = infos[h].bbox; return Math.max(H.minX - R.minX, H.minY - R.minY, R.maxX - H.maxX, R.maxY - H.maxY) <= 1 && isDouble(infos, r, h, tol); };
    const kids = skipThin ? nodes[r].children.filter((h) => !thin(h)) : nodes[r].children;
    if (kids.length === 1 && nodes[kids[0]].children.length >= 1 && isAxisRect(loops[kids[0]], infos[kids[0]])) {
      const H = infos[kids[0]].bbox;
      const lim = Math.max(20, 0.08 * Math.min(R.maxX - R.minX, R.maxY - R.minY));
      const inset = [H.minX - R.minX, H.minY - R.minY, R.maxX - H.maxX, R.maxY - H.maxY];
      if (inset.every((d) => d > 0 && d <= lim)) return [r, kids[0]].sort((a, b) => a - b);
    }
    if (kids.some((h) => nodes[h].children.some((isl) => !concentricCircles(infos[h], infos[isl], tol) && !(skipThin && isDouble(infos, h, isl, tol))))) return [r];
  }
  return [];
}

// Pares (agujero circular H, isla circular I) concéntricos con I menor: H es anotación (avellanado/rosca).
function detectConcentricAnnotations(loops, infos, nodes, tol) {
  const out = [];
  nodes.forEach((n, h) => {
    if (n.frame || n.depth % 2 !== 1 || !infos[h].circle) return;
    const inner = n.children.find((i) => concentricCircles(infos[h], infos[i], tol) && infos[i].circle.r < infos[h].circle.r);
    if (inner != null) out.push({ outer: h, inner });
  });
  return out;
}

// Distancia de p al polígono cerrado poly.
function distToPoly(p, poly) {
  let best = Infinity;
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    const t = l2 > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
    const d = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    if (d < best) best = d;
  }
  return best;
}

// ≤ n puntos repartidos del polígono.
const sample = (poly, n = 256) => (poly.length <= n ? poly : Array.from({ length: n }, (_, k) => poly[Math.floor((k * poly.length) / n)]));

// Contorno doble: A contiene directamente a B, distancia de Hausdorff (muestreada) H ≤ max(3·tol, 1.5 % de la
// diagonal de la caja del menor) y sin tocarse (distancia mínima ≥ 0.25·H).
function isDouble(infos, a, b, tol) {
  const ab = infos[a].bbox, bb = infos[b].bbox;
  const lim = Math.max(3 * tol, 0.015 * Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY));
  // Cota inferior barata: el retranqueo de las cajas no supera la distancia de Hausdorff.
  if (Math.max(bb.minX - ab.minX, bb.minY - ab.minY, ab.maxX - bb.maxX, ab.maxY - bb.maxY) > lim) return false;
  let H = 0, min = Infinity;
  for (const [P, Q] of [[infos[a].poly, infos[b].poly], [infos[b].poly, infos[a].poly]])
    for (const p of sample(P)) {
      const d = distToPoly(p, Q);
      if (d > H) H = d;
      if (d < min) min = d;
      if (H > lim) return false;
    }
  return H > 0 && min >= 0.25 * H;
}

// Contornos dobles (índices a descartar). Recorrido de arriba abajo con la profundidad efectiva (sin los ya
// descartados): A exterior (par) → se descarta B; A agujero (impar) → se descarta A.
function detectDoubleLines(infos, nodes, tol) {
  const out = [];
  const visit = (i, e) => {
    const kids = nodes[i].children, c = kids.find((k) => isDouble(infos, i, k, tol));
    if (c == null) return kids.forEach((k) => visit(k, e + 1));
    if (e % 2 === 0) {
      out.push(c);
      for (const k of [...kids.filter((k) => k !== c), ...nodes[c].children]) visit(k, e + 1);
    } else {
      out.push(i);
      for (const k of kids) visit(k, e);
    }
  };
  nodes.forEach((n, i) => n.parent === -1 && !n.frame && visit(i, 0));
  return out.sort((a, b) => a - b);
}

// buildRegions sin los contornos excluidos, con los índices remapeados a loops.
// Los índices de `annotation` llevan annotation: true en vez de frame: true.
function regionsWithout(loops, excluded, chordTol, annotation = new Set()) {
  if (!excluded.length) return buildRegions(loops, { chordTol });
  const ex = new Set(excluded);
  const keep = loops.map((_, i) => i).filter((i) => !ex.has(i));
  const sub = buildRegions(keep.map((i) => loops[i]), { chordTol });
  const nodes = loops.map((loop, i) => ({ loop, parent: -1, depth: 0, children: [], ...(annotation.has(i) ? { annotation: true } : { frame: true }) }));
  sub.nodes.forEach((n, j) => {
    nodes[keep[j]] = { loop: n.loop, parent: n.parent < 0 ? -1 : keep[n.parent], depth: n.depth, children: n.children.map((c) => keep[c]) };
  });
  const regions = sub.regions.map((r) => ({ outer: keep[r.outer], holes: r.holes.map((h) => keep[h]) }));
  return { nodes, regions };
}

/**
 * Estado de operación por defecto (lo edita la UI y lo consume makeJob).
 * - regions[i] ↔ profile.regions[i]; holes[k] ↔ profile.regions[i].holes[k].
 *   height/z0/depth null = por defecto (espesor general / 0 / mitad de la altura para ciegos).
 * - El marco del plano ya viene fuera de profile.regions (prepareProfile).
 * - Eje de revolución: la línea de trazos más larga del dibujo (axisKind 'x'/'y' si coincide con un eje
 *   coordenado), o el eje X si no hay ninguna.
 * @param {Profile} profile
 * @returns {Object} op
 */
export function defaultOpState(profile) {
  const warnings = [];
  const regions = profile.regions.map((r) => ({ included: true, height: null, z0: null, holes: r.holes.map(() => ({ op: 'through', depth: null })) }));

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
// Rango en z de una región extruida [z0, z0 + h] (mismo criterio que el kernel).
const zRange = (op, rs) => { const h = regionHeight(op, rs), z0 = rs.z0 ?? (op.symmetric ? -h / 2 : 0); return [z0, z0 + h]; };

/**
 * absorber[i] = índice de la región incluida cuyo agujero 'none' (material macizo) contiene a la región i
 * (a cualquier nivel), o -1. Esas regiones quedan dentro del sólido: el kernel las fusiona sin cambio,
 * así que no cuentan en el resumen 2D ni en el volumen analítico.
 */
function absorbers(profile, op) {
  const byOuter = new Map(profile.regions.map((r, i) => [r.outer, i]));
  return profile.regions.map((r) => {
    let hole = profile.nodes[r.outer].parent;
    while (hole >= 0) {
      const j = byOuter.get(profile.nodes[hole].parent);
      if (j == null) return -1;
      const rs = regionState(op, j);
      if (rs.included !== false && holeState(rs, profile.regions[j].holes.indexOf(hole)).op === 'none') return j;
      hole = profile.nodes[profile.regions[j].outer].parent;
    }
    return -1;
  });
}

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
 * - 'none': se ignoran por completo (no son agujeros); las regiones dentro de un agujero 'none' quedan en
 *   material macizo y tampoco cuentan.
 * @returns {{netArea:number, perimeterOuter:number, perimeterInner:number, loops:number,
 *   holes:Array<{d:?number,c:number[],area:number,perimeter:number,op:string}>, bbox2d:?Object}}
 */
export function profileSummary(profile, op) {
  let netArea = 0, perimeterOuter = 0, perimeterInner = 0, loops = 0;
  const holes = [];
  let bbox2d = null;
  const abs = absorbers(profile, op);
  profile.regions.forEach((r, i) => {
    const rs = regionState(op, i);
    if (rs.included === false || abs[i] >= 0) return;
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
 * Las regiones dentro de un agujero 'none' no suman (ya son material); en extrusión, si sobresalen en z de la
 * región que las contiene, el volumen no es deducible (null).
 * @returns {?number} mm³
 */
export function analyticVolume(profile, op) {
  const abs = absorbers(profile, op);
  const all = profile.regions.map((r, i) => ({ r, i, rs: regionState(op, i) })).filter((x) => x.rs.included !== false);
  if (!all.length) return null;
  if (op.mode === 'extrude') {
    for (const { i, rs } of all) {
      if (abs[i] < 0) continue;
      const [a, b] = zRange(op, rs), [A, B] = zRange(op, regionState(op, abs[i]));
      if (a < A || b > B) return null;
    }
  }
  const inc = all.filter((x) => abs[x.i] < 0);
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
 * Sin datos de lámina (sheet null + sheetNote) si alguna región incluida tiene altura o z0 distintos del espesor
 * general: la pieza ya no es una lámina de espesor uniforme.
 * @param {{build:Object, profile:Profile, op:Object, material:Object, pricePerKg?:number, blankMargin?:number}} a
 * @returns {Object} PartData (ver ui/report.js)
 */
export function computeAll({ build, profile, op, material, pricePerKg, blankMargin = 0 }) {
  let sheetApplicable = true;
  if (op.mode === 'extrude') {
    const [A, B] = zRange(op, {});
    sheetApplicable = profile.regions.every((_, i) => {
      const rs = regionState(op, i);
      if (rs.included === false) return true;
      const [a, b] = zRange(op, rs);
      return Math.abs(a - A) <= 1e-9 && Math.abs(b - B) <= 1e-9;
    });
  }
  return computePartData({
    build, material, mode: op.mode,
    profile: profileSummary(profile, op),
    thickness: op.mode === 'extrude' ? op.thickness : undefined,
    pricePerKg, blankMargin, sheetApplicable,
    analyticVolume: analyticVolume(profile, op) ?? undefined,
  });
}
