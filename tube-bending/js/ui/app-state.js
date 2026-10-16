// Lógica pura de la app (sin DOM ni three.js) para poder probarla con node --test.
import { fmt } from './format.js';
import { getMaterial } from '../materials.js';

/** Copia de obj con key = value; null, undefined o '' borran la clave. */
export function setOrDelete(obj, key, value) {
  const out = { ...obj };
  if (value == null || value === '') delete out[key];
  else out[key] = value;
  return out;
}

/** Material base con las sobrescrituras del usuario (copia; null si el id no existe). */
export function resolveMaterial(materialId, overrides) {
  const base = getMaterial(materialId);
  return base ? { ...base, ...overrides } : null;
}

/**
 * Reparte las opciones de la UI: planProcess recibe todas (más machineId si no es 'auto');
 * analyzeBends / makeFieldSampler no reciben mandrelClearance (planProcess ya dimensiona el mandril
 * con ella; mecánica tomaría la holgura como si fuera la del mandril estándar).
 */
export function splitOptions(options, machineId) {
  const processOptions = { ...options };
  if (machineId && machineId !== 'auto') processOptions.machineId = machineId;
  else delete processOptions.machineId;
  const { mandrelClearance, machineId: _m, ...mechanicsOptions } = options;
  return { processOptions, mechanicsOptions };
}

/** Instante de "estacionamiento": a la mitad de la fase de doblado del doblez `bend` (o del último). */
export function parkTime(phases, bend) {
  const bends = phases.filter((p) => p.type === 'bend' && p.bend >= 0);
  if (!bends.length) return 0;
  const p = bends.find((b) => b.bend === bend) ?? bends[bends.length - 1];
  return p.start + p.duration / 2;
}

/** Fase que contiene t: { k, progress } (las fases de duración cero en el mismo instante cuentan como hechas). */
export function locatePhase(phases, t) {
  let k = 0;
  for (let i = 0; i < phases.length; i++) if (phases[i].start <= t) k = i;
  const ph = phases[k];
  const progress = ph && ph.duration > 0 ? Math.min(1, Math.max(0, (t - ph.start) / ph.duration)) : 1;
  return { k, progress };
}

/**
 * Tiempo equivalente tras recalcular: misma fase (tipo y doblez) y mismo avance si existe en la nueva
 * secuencia; si no, t acotado a la nueva duración.
 */
export function remapTime(oldPhases, t, newPhases, newTotal) {
  if (oldPhases?.length) {
    const { k, progress } = locatePhase(oldPhases, t);
    const o = oldPhases[k];
    let seen = 0;
    for (let i = 0; i < k; i++) if (oldPhases[i].type === o.type && oldPhases[i].bend === o.bend) seen++;
    for (const p of newPhases) {
      if (p.type === o.type && p.bend === o.bend && seen-- === 0) return p.start + progress * p.duration;
    }
  }
  return Math.min(Math.max(0, t), newTotal);
}

/** Índice de la estación más cercana a s (stations ordenadas ascendentes). */
export function nearestStation(stations, s) {
  let lo = 0, hi = stations.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (stations[mid] <= s) lo = mid; else hi = mid; }
  return Math.abs(stations[hi] - s) < Math.abs(stations[lo] - s) ? hi : lo;
}

/** Texto de la etiqueta de un doblez: "D1 · 90.0° · CLR 101.6". */
export function bendLabelText(i, angle, clr) {
  return `D${i + 1} · ${fmt(angle, 1)}° · CLR ${fmt(clr, 1)}`;
}

/**
 * Etiquetas de los dobleces ya formados: posición = línea de centros a la mitad del arco (de las poses
 * del cuadro actual). midIdx: índice de estación por doblez (nearestStation de (s0+s1)/2).
 */
export function bendLabels(midIdx, poses, formed, lraBends) {
  const out = [];
  for (let j = 0; j < midIdx.length; j++) {
    const m = midIdx[j];
    if (!(formed[m] > 0)) continue;
    const o = 16 * m;
    out.push({ position: [poses[o + 12], poses[o + 13], poses[o + 14]], text: bendLabelText(j, lraBends[j].A, lraBends[j].clr) });
  }
  return out;
}
