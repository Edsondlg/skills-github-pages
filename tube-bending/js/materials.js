// Material database and forming-limit helpers for rotary-draw tube bending.
// Units: E, ys, uts, K in MPa; density kg/m³; elongation in % (A50/A80); pricePerKg USD/kg.
//
// The values are TYPICAL published values for tube/strip of each grade (mill data sheets,
// WorldAutoSteel AHSS Application Guidelines, ASM Handbook Vol. 1/2/14B). They are
// "valores típicos, editables": the user is expected to replace them with certificate data.
//
// Swift hardening law used everywhere: σ = K·(eps0 + ε)^n. K and eps0 were fitted so that
//   K·eps0^n = ys                               (yield at zero plastic strain)
//   K·n^n·exp(−(n − eps0)) = uts                (Considère: necking at true strain n)
// with the tabulated ys, uts and n.

export const MATERIALS_NOTE = 'Valores típicos, editables';

export const MATERIALS = [
  {
    id: 'sae1010-cew', name: 'SAE 1010 (CEW, soldado y estirado en frío)', family: 'Acero bajo carbono',
    E: 205000, nu: 0.29, density: 7850, ys: 290, uts: 365, elongation: 30, n: 0.20, K: 599, eps0: 0.0266,
    r: 1.2, flc0: null, weldFactor: 0.85, mu: 0.10, pricePerKg: 1.45,
    notes: 'Tubo estructural y de escape de uso general; cordón de soldadura por resistencia (ERW/CEW).',
  },
  {
    id: 'sae1020-dom', name: 'SAE 1020 DOM (estirado sobre mandril)', family: 'Acero bajo carbono',
    E: 205000, nu: 0.29, density: 7850, ys: 480, uts: 550, elongation: 15, n: 0.09, K: 741, eps0: 0.00797,
    r: 1.0, flc0: null, weldFactor: 0.95, mu: 0.10, pricePerKg: 2.2,
    notes: 'Soldado y luego estirado sobre mandril: cordón casi indistinguible. Alto ys por trabajo en frío.',
  },
  {
    id: 'hsla340', name: 'HSLA 340', family: 'HSLA',
    E: 205000, nu: 0.29, density: 7850, ys: 340, uts: 420, elongation: 26, n: 0.17, K: 659, eps0: 0.0203,
    r: 1.0, flc0: null, weldFactor: 0.85, mu: 0.10, pricePerKg: 1.6,
    notes: 'Microaleado, buena formabilidad.',
  },
  {
    id: 'hsla420', name: 'HSLA 420', family: 'HSLA',
    E: 205000, nu: 0.29, density: 7850, ys: 420, uts: 500, elongation: 22, n: 0.14, K: 745, eps0: 0.0167,
    r: 1.0, flc0: null, weldFactor: 0.82, mu: 0.10, pricePerKg: 1.7,
    notes: 'Bastidores y travesaños.',
  },
  {
    id: 'hsla550', name: 'HSLA 550', family: 'HSLA',
    E: 205000, nu: 0.29, density: 7850, ys: 550, uts: 630, elongation: 16, n: 0.11, K: 885, eps0: 0.0133,
    r: 0.9, flc0: null, weldFactor: 0.80, mu: 0.10, pricePerKg: 1.85,
    notes: 'Alta relación ys/uts: recuperación elástica notable.',
  },
  {
    id: 'dp590', name: 'DP590 (doble fase)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 380, uts: 620, elongation: 24, n: 0.16, K: 973, eps0: 0.00281,
    r: 0.95, flc0: 0.20, weldFactor: 0.75, mu: 0.10, pricePerKg: 1.95,
    notes: 'FLC0 medido menor que Keeler (Keeler sobreestima en AHSS).',
  },
  {
    id: 'dp780', name: 'DP780 (doble fase)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 500, uts: 810, elongation: 17, n: 0.13, K: 1201, eps0: 0.00118,
    r: 0.90, flc0: 0.15, weldFactor: 0.72, mu: 0.10, pricePerKg: 2.1,
    notes: 'Sensible a fractura por borde/cordón (HAZ suavizada).',
  },
  {
    id: 'dp980', name: 'DP980 (doble fase)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 700, uts: 1010, elongation: 12, n: 0.09, K: 1372, eps0: 0.000567,
    r: 0.85, flc0: 0.12, weldFactor: 0.70, mu: 0.10, pricePerKg: 2.35,
    notes: 'Doblado a CLR ≤ 2D no recomendado; recuperación elástica alta.',
  },
  {
    id: 'cp800', name: 'CP800 (fase compleja)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 700, uts: 830, elongation: 12, n: 0.09, K: 1122, eps0: 0.00529,
    r: 0.90, flc0: 0.15, weldFactor: 0.75, mu: 0.10, pricePerKg: 2.2,
    notes: 'Mejor doblado local que DP de igual resistencia, menor endurecimiento.',
  },
  {
    id: 'trip780', name: 'TRIP780', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 480, uts: 800, elongation: 24, n: 0.20, K: 1340, eps0: 0.00589,
    r: 0.95, flc0: 0.20, weldFactor: 0.72, mu: 0.10, pricePerKg: 2.4,
    notes: 'Alto n por transformación de austenita retenida.',
  },
  {
    id: 'ms1180', name: 'MS1180 (martensítico)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 1030, uts: 1250, elongation: 5, n: 0.05, K: 1526, eps0: 0.000386,
    r: 0.90, flc0: 0.08, weldFactor: 0.65, mu: 0.10, pricePerKg: 2.7,
    notes: 'Solo radios amplios (CLR ≥ 3D); mordaza estriada larga.',
  },
  {
    id: 'ms1500', name: 'MS1500 (martensítico)', family: 'AHSS',
    E: 207000, nu: 0.30, density: 7850, ys: 1250, uts: 1520, elongation: 4, n: 0.04, K: 1799, eps0: 0.000111,
    r: 0.90, flc0: 0.06, weldFactor: 0.60, mu: 0.10, pricePerKg: 2.9,
    notes: 'Martensítico: doblado muy limitado, recuperación elástica muy alta.',
  },
  {
    id: 'aisi409', name: 'AISI 409 (inoxidable ferrítico, escape)', family: 'Inoxidable',
    E: 200000, nu: 0.28, density: 7700, ys: 240, uts: 410, elongation: 25, n: 0.21, K: 698, eps0: 0.00621,
    r: 1.5, flc0: null, weldFactor: 0.85, mu: 0.12, pricePerKg: 2.9,
    notes: 'Tubo de escape soldado; pared delgada propensa a colapso sin mandril.',
  },
  {
    id: 'aisi304', name: 'AISI 304 (inoxidable austenítico)', family: 'Inoxidable',
    E: 193000, nu: 0.29, density: 8000, ys: 290, uts: 640, elongation: 45, n: 0.42, K: 1368, eps0: 0.0249,
    r: 1.0, flc0: 0.35, weldFactor: 0.85, mu: 0.12, pricePerKg: 4.6,
    notes: 'Endurece mucho por deformación; riesgo de gripado: usar lubricante de alta presión.',
  },
  {
    id: 'al6061-t4', name: 'Aluminio 6061-T4', family: 'Aluminio',
    E: 68900, nu: 0.33, density: 2700, ys: 145, uts: 241, elongation: 20, n: 0.20, K: 404, eps0: 0.00598,
    r: 0.7, flc0: 0.20, weldFactor: 0.85, mu: 0.15, pricePerKg: 5.2,
    notes: 'Doblar en T4 y envejecer a T6 después. Bajo módulo: mayor recuperación elástica angular.',
  },
  {
    id: 'al6063-t5', name: 'Aluminio 6063-T5 (extruido)', family: 'Aluminio',
    E: 68900, nu: 0.33, density: 2700, ys: 145, uts: 186, elongation: 10, n: 0.08, K: 246, eps0: 0.00133,
    r: 0.6, flc0: 0.10, weldFactor: 1.0, mu: 0.15, pricePerKg: 4.6,
    notes: 'Extruido sin costura (weldFactor 1). Ductilidad limitada en T5.',
  },
];

export function getMaterial(id) {
  return MATERIALS.find((m) => m.id === id) || null;
}

// ---------------------------------------------------------------------------------------------
// Forming limit curve
// ---------------------------------------------------------------------------------------------

// Keeler–Brazier (NADDRG) FLD0, engineering %: FLD0 = (23.3 + 14.13·t)·n/0.21, t in mm capped at
// 0.125 in = 3.175 mm; n/0.21 capped at 1 (the original chart saturates for n ≥ 0.21).
export const KEELER = { a: 23.3, b: 14.13, nRef: 0.21, tCap: 3.175 };
// FLC branch slopes in true-strain space (Keeler–Goodwin shape): left side follows ≈ constant
// thickness (slope −1), right side rises more gently (≈ 0.5).
export const FLC_SLOPES = { left: -1.0, right: 0.5 };

export function keelerFld0True(n, t) {
  const tc = Math.min(Math.max(t, 0), KEELER.tCap);
  const eng = (KEELER.a + KEELER.b * tc) * Math.min(n, KEELER.nRef) / KEELER.nRef; // %
  return Math.log(1 + eng / 100);
}

// FLC0 (true major strain at plane strain) for thickness t (mm).
// material.flc0 is given at t = 1 mm and scaled by the Keeler thickness term
// (23.3 + 14.13·t)/(23.3 + 14.13·1) — assumption: the thickness effect of Keeler applies to
// measured FLC0 values too. null → Keeler–Brazier from n.
export function flc0At(material, t) {
  if (material.flc0 == null) return keelerFld0True(material.n, t);
  const tc = Math.min(Math.max(t, 0), KEELER.tCap);
  return material.flc0 * (KEELER.a + KEELER.b * tc) / (KEELER.a + KEELER.b * 1);
}

// Returns e2 → e1Limit (true strains).
export function flcCurve(material, t) {
  const f0 = flc0At(material, t);
  return (e2) => flcFromFlc0(f0, e2);
}

export function flcFromFlc0(f0, e2) {
  return e2 < 0 ? f0 + FLC_SLOPES.left * e2 : f0 + FLC_SLOPES.right * e2;
}

// ---------------------------------------------------------------------------------------------
// FLD zones (AutoForm-like classification). Thresholds exported so the UI can show them.
// ---------------------------------------------------------------------------------------------
export const FLD_ZONE_LIMITS = {
  riskMargin: 0.10,        // e1 within 10 % below the FLC → 'risk'
  thinningE3: -0.25,       // e3 = −(e1+e2) below → 'thinning' (excessive thinning, ≈ 22 %)
  insufficientE1: 0.02,    // e1 below and |e2| below → 'insufficient' (insufficient stretching)
  insufficientE2: 0.02,
  wrinkleTendencyE3: 0.03, // thickening e3 above → 'wrinkleTendency'
  wrinkleE3: 0.10,         // thickening e3 above → 'wrinkle'
};

export const FLD_ZONES = {
  crack: 'Fractura',
  risk: 'Riesgo de fractura',
  thinning: 'Adelgazamiento excesivo',
  safe: 'Seguro',
  insufficient: 'Estirado insuficiente',
  compression: 'Compresión',
  wrinkleTendency: 'Tendencia a arrugas',
  wrinkle: 'Arrugas',
};

// Classify a strain point. e1 ≥ e2 (major/minor true strains), flc = flcCurve(...).
// Precedence: crack > risk > thinning > insufficient > wrinkle > wrinkleTendency > compression > safe.
// 'compression' = below the pure-shear line (e1 < −e2 ⇔ e3 > 0) with little thickening.
// Optional e3: thickness strain to use for the thinning/thickening checks (default −(e1+e2)).
// The mechanics module passes ln(t/t0) so that a tube-making surface prestrain already contained
// in the measured wall t0 is not counted as thinning.
export function fldZone(e1, e2, flc, e3) {
  return fldZoneFromLimit(e1, e2, flc(e2), e3);
}

// Same classification with the FLC value at e2 already evaluated (allocation-free hot path).
export function fldZoneFromLimit(e1, e2, lim, e3 = -(e1 + e2)) {
  const L = FLD_ZONE_LIMITS;
  if (e1 >= lim) return 'crack';
  if (e1 >= (1 - L.riskMargin) * lim) return 'risk';
  if (e3 < L.thinningE3) return 'thinning';
  if (e1 < L.insufficientE1 && Math.abs(e2) < L.insufficientE2) return 'insufficient';
  if (e3 > L.wrinkleE3) return 'wrinkle';
  if (e3 > L.wrinkleTendencyE3) return 'wrinkleTendency';
  if (e1 < -e2) return 'compression';
  return 'safe';
}
