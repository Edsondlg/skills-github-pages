// Color maps and legends for the tube field display modes. Pure module (no three.js, no DOM).
// Colors are sRGB components in [0, 1].

// Viridis (perceptually uniform, sequential), 11 control points.
const VIRIDIS = [
  [0.267, 0.005, 0.329], [0.283, 0.141, 0.458], [0.254, 0.265, 0.530], [0.207, 0.372, 0.553],
  [0.164, 0.471, 0.558], [0.128, 0.567, 0.551], [0.135, 0.659, 0.518], [0.267, 0.749, 0.441],
  [0.478, 0.821, 0.318], [0.741, 0.873, 0.150], [0.993, 0.906, 0.144],
];

// Diverging blue ↔ white ↔ red (RdBu reversed): low end blue, high end red.
const RDBU = [
  [0.020, 0.188, 0.380], [0.129, 0.400, 0.675], [0.263, 0.576, 0.765], [0.573, 0.773, 0.871],
  [0.820, 0.898, 0.941], [0.969, 0.969, 0.969], [0.992, 0.859, 0.780], [0.957, 0.647, 0.510],
  [0.839, 0.376, 0.302], [0.698, 0.094, 0.169], [0.404, 0.000, 0.122],
];

function sampleTable(table, t, out) {
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0)) * (table.length - 1);
  const i = Math.min(table.length - 2, Math.floor(x));
  const f = x - i;
  const a = table[i], b = table[i + 1];
  out[0] = a[0] + (b[0] - a[0]) * f;
  out[1] = a[1] + (b[1] - a[1]) * f;
  out[2] = a[2] + (b[2] - a[2]) * f;
  return out;
}

/** Sequential perceptual map, t in [0,1]. */
export function sequential(t, out = [0, 0, 0]) { return sampleTable(VIRIDIS, t, out); }
/** Diverging map, t in [0,1], 0.5 = neutral. */
export function diverging(t, out = [0, 0, 0]) { return sampleTable(RDBU, t, out); }

export const FLD_ZONES = ['crack', 'risk', 'thinning', 'safe', 'insufficient', 'compression', 'wrinkleTendency', 'wrinkle'];
export const FLD_HEX = {
  crack: '#d62728', risk: '#ffbf00', safe: '#2ca02c', thinning: '#ff7f0e', insufficient: '#9e9e9e',
  compression: '#4fc3f7', wrinkleTendency: '#1e63d6', wrinkle: '#7b2cbf',
};
export const FLD_LABELS = {
  crack: 'Fractura', risk: 'Riesgo de fractura', safe: 'Seguro', thinning: 'Adelgazamiento excesivo',
  insufficient: 'Deformación insuficiente', compression: 'Compresión', wrinkleTendency: 'Tendencia a arrugas',
  wrinkle: 'Arrugas',
};

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
export function rgbToHex(c) {
  const h = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return '#' + h(c[0]) + h(c[1]) + h(c[2]);
}

const FLD_RGB = Object.fromEntries(Object.entries(FLD_HEX).map(([k, v]) => [k, hexToRgb(v)]));
export function fldColor(zone, out = [0, 0, 0]) {
  const c = FLD_RGB[zone] || FLD_RGB.insufficient;
  out[0] = c[0]; out[1] = c[1]; out[2] = c[2];
  return out;
}

function niceCeil(v) {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v - 1e-12) return m * p;
  return 10 * p;
}
function fmt(v, digits) {
  return v.toLocaleString('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * Display ranges from cached field statistics.
 * stats = { tMin, tMax, thinAbsMax, e1Max } (thinning in %, e1 true strain)
 */
export function rangesFromStats(stats) {
  let tMin = stats.tMin, tMax = stats.tMax;
  if (!(tMax > tMin)) { const c = Number.isFinite(tMin) ? tMin : 1; tMin = c * 0.9; tMax = c * 1.1; }
  return {
    thickness: [tMin, tMax],
    thinning: niceCeil(Math.max(2, stats.thinAbsMax || 0)),
    majorStrain: niceCeil(Math.max(0.02, stats.e1Max || 0) * 100) / 100,
  };
}

/** Normalized map coordinate for a field value in the given mode. */
export function colorFor(mode, fields, ranges, out = [0, 0, 0]) {
  switch (mode) {
    case 'thickness': {
      const [a, b] = ranges.thickness;
      return sequential((fields.t - a) / (b - a), out);
    }
    case 'thinning': return diverging(0.5 + 0.5 * fields.thinningPct / ranges.thinning, out);
    case 'majorStrain': return sequential(fields.e1 / ranges.majorStrain, out);
    case 'fld': return fldColor(fields.zone, out);
    default: out[0] = out[1] = out[2] = 0.8; return out;
  }
}

/** Legend description for a display mode. */
export function legendFor(mode, ranges) {
  const stops = [];
  if (mode === 'thickness') {
    const [a, b] = ranges.thickness;
    for (let i = 0; i <= 5; i++) {
      const v = a + (b - a) * i / 5;
      stops.push({ value: v, color: rgbToHex(sequential(i / 5)), label: fmt(v, 2) + ' mm' });
    }
    return { title: 'Espesor de pared', unit: 'mm', stops };
  }
  if (mode === 'thinning') {
    const m = ranges.thinning;
    for (let i = 0; i <= 6; i++) {
      const v = -m + 2 * m * i / 6;
      const label = (v > 0 ? '+' : '') + fmt(v, 1) + ' %' + (i === 0 ? ' (engrosamiento)' : i === 6 ? ' (adelgazamiento)' : '');
      stops.push({ value: v, color: rgbToHex(diverging(i / 6)), label });
    }
    return { title: 'Adelgazamiento de pared', unit: '%', stops };
  }
  if (mode === 'majorStrain') {
    const m = ranges.majorStrain * 100;
    for (let i = 0; i <= 5; i++) {
      const v = m * i / 5;
      stops.push({ value: v, color: rgbToHex(sequential(i / 5)), label: fmt(v, 1) + ' %' });
    }
    return { title: 'Deformación mayor ε₁', unit: '%', stops };
  }
  if (mode === 'fld') {
    for (const z of FLD_ZONES) stops.push({ value: z, color: FLD_HEX[z], label: FLD_LABELS[z] });
    return { title: 'Diagrama de límite de conformado (FLD)', unit: '', stops };
  }
  return { title: 'Acero (vista realista)', unit: '', stops: [] };
}
