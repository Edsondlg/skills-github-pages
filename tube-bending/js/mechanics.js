// Bending mechanics of rotary-draw (mandrel) tube bending — ENGINEERING ESTIMATOR, not FEA.
// Analytical relations (plastic bending of a thin ring, curved-beam neutral axis, elastic
// unloading) plus empirical factors from shop practice. Every empirical constant is in CAL /
// LIMITS so the UI can show it and a user can recalibrate against trials.
// Units: mm, N, MPa, N·m, deg. Strains are true (logarithmic).
// Pure module: no DOM, no three.js.

import { flc0At, flcFromFlc0, fldZoneFromLimit } from './materials.js';

const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------
// Calibration constants (exported, documented). Tuned against the calibration targets in
// test/mechanics.test.mjs (typical shop results for SAE 1010, DP980, AISI 409).
// ---------------------------------------------------------------------------------------------
export const CAL = {
  // Neutral-axis shift toward the intrados, geometric part: e0 = NA_K·rm²/clr.
  // Curved thin ring (elastic curved-beam theory) gives e ≈ rm²/(2·clr) → 0.5; reduced to 0.4 for
  // the plastic state where the stress profile is flatter.
  NA_K: 0.4,
  // Axial tension (drags) / compression (boost) shift the plastic neutral axis of a thin ring:
  // N/Np = 2α/π → shift = rm·sin(α) (rigid-plastic ring under bending + axial force).
  NA_TENSION_EFF: 1.0,
  BOOST_EFF: 0.8,                 // fraction of boost force reaching the bend zone (PD friction losses)
  // Hoop/axial membrane strain ratio (hoop = −ratio·axial). Mandrel support restrains the section;
  // without mandrel the section flattens and contracts more. Literature (FE studies of
  // rotary-draw bending) reports |εθ/εφ| ≈ 0.1–0.3 at extrados.
  HOOP_RATIO: { none: 0.30, plug: 0.22, ball: 0.20 },
  // Springback: beam elastic unloading Δκ = M/(E·I) underestimates measured rotary-draw springback
  // (elastic recovery of tangent/clamp zones, tool compliance, reduced unloading modulus);
  // empirical multiplier.
  SPRINGBACK_CAL: 2.3,
  // Ovality % = OVALITY_K·(OD/t)·(OD/(2·clr))²·f(mandrel)·(1 − exp(−A/OVALITY_ANGLE0))
  //           + OVALITY_CLEARANCE_K·100·clearance/OD
  // Form follows the Brazier/flattening parameter (OD/t)·(OD/2R)²; coefficients empirical.
  OVALITY_K: 6.0,
  OVALITY_MANDREL: { none: 1.0, plug: 0.35, ball: 0.25 },
  OVALITY_BALL_DECAY: 0.85,       // ball mandrel factor ×0.85 per ball
  OVALITY_ANGLE0: 25,             // deg: ovalization saturates once the bend zone is developed
  OVALITY_CLEARANCE_K: 1.0,       // clearance lets the section ovalize at least by c/OD
  OVALITY_MAX_PCT: 40,
  // Wrinkling: critical intrados compressive strain εcr = WRINKLE_K·(t/OD)·support.
  // Classical elastic cylinder buckling gives εcr = 1.21·t/OD; the bend-die groove, pressure die
  // and the tension field raise it (WRINKLE_K = 6 with no internal support, calibrated on
  // "empty bending" limits: OD/t ≈ 30 wrinkles at 2D).
  WRINKLE_K: 6.0,
  SUPPORT: {
    none: 1.0, plug: 1.4, ball: 1.6, perBall: 0.15, maxBalls: 6,
    wiper: 0.6, wiperRakeRef: 1.0, wiperRakeSpan: 4.0, // wiper support fades linearly for rake > 1° to 0 at 5°
    clearanceK: 0.5,                                     // support /(1 + K·clearance/t)
  },
  // Collapse: ovality over the allowable; without mandrel the extrados is unsupported and local
  // kinking occurs before the mean ovality reaches the limit → ×1.25.
  COLLAPSE_NOMANDREL_FACTOR: 1.25,
  // Forces
  PRESSURE_DIE_LEVER_OD: 3,       // lever = min(pressureDie.length/2, 3·OD)
  MANDREL_CONTACT_K: 0.5,         // mandrel contact force = K·σ̄·t·OD·(Lcontact/clr) (crushing pressure σ·t/clr)
  WIPER_LOAD_K: 0.3,              // share of the pressure-die reaction carried by the wiper
  PD_SLIP: 0.2,                   // follower pressure die: relative slip ≈ 20 % → friction μ·0.2·P
  CLAMP_MU: { smooth: 0.15, serrated: 0.30 }, // dry clamp, two gripping faces
  CLAMP_SF: 1.25,
  CLAMP_ARM_K: 0.5,               // clamp also reacts M as a couple over ≈ Lc/2
  TORQUE_MIN_FACTOR: 0.8,         // boost cannot reduce the die torque below 0.8·M
  LUBE_MU_FACTOR: { buena: 0.8, normal: 1.0, pobre: 1.5 },
  // Field sampler (visualization)
  RAMP_OD: 0.5,                   // strain ramp width at each tangent, × OD
  WRINKLE_WAVELENGTH_K: 3.4,      // λ = 3.4·√(r·t) (axisymmetric shell buckling half-wave 1.72√(rt))
  WRINKLE_AMP_K: 0.6,             // amplitude = K·(wrinkleIndex − 1)·t, capped at 1.5·t
  FLATTEN_K: 0.5,                 // extra extrados flattening = K·(collapseIndex − 1)·t, capped at 0.12·OD
  WELD_HALF_WIDTH: 15,            // deg: seam zone where the FLC is multiplied by weldFactor
};

// Status limits (exported).
export const LIMITS = {
  thinningWarnPct: 20,
  thinningFailPct: 25,
  ovalityLimitPct: 5,     // default allowable ovality (options.ovalityLimitPct overrides)
  warnFraction: 0.8,      // wrinkle/collapse index above this → warning
  fldRiskMargin: 0.10,    // FLD margin below → warning
  clearanceWarnT: 0.3,    // mandrel clearance above 0.3·t → warning
  seamWarnDeg: 30,        // seam within ±30° of extrados/intrados → warning
};

// ---------------------------------------------------------------------------------------------
// Pure helpers (stable signatures, used by the process planner)
// ---------------------------------------------------------------------------------------------

// Swift hardening σ = K·(eps0 + ε)^n, ε = equivalent plastic strain (≥ 0).
export function flowStress(material, eps) {
  return material.K * Math.pow(material.eps0 + Math.max(0, eps), material.n);
}

// Geometric neutral-axis shift toward the intrados (mm), see CAL.NA_K.
export function neutralAxisShift({ OD, t, clr }) {
  const rm = (OD - t) / 2;
  return CAL.NA_K * rm * rm / clr;
}

// Bending moment (N·m) of the tube section at curvature 1/clr. Numerical integration of
// σ(ε(y))·y over the annulus (midpoint rule, 6 radial × 96 circumferential cells).
// ε(y) = ln((clr + y)/(clr − e)): fiber at radius clr + y, neutral fiber at clr − e.
// σ = sign(ε)·min(E·|ε|, Swift(|ε| − ys/E)) — elastic / plastic with uniaxial fiber assumption.
export function bendingMoment({ material, OD, t, clr, neutralShift }) {
  const e = neutralShift ?? neutralAxisShift({ OD, t, clr });
  const ro = OD / 2, ri = ro - t;
  const NR = 6, NT = 96;
  const dr = (ro - ri) / NR, dth = (2 * Math.PI) / NT;
  const ey = material.ys / material.E;
  const rn = clr - e;
  let M = 0;
  for (let i = 0; i < NR; i++) {
    const rho = ri + (i + 0.5) * dr;
    for (let j = 0; j < NT; j++) {
      const y = rho * Math.cos((j + 0.5) * dth);
      const eps = Math.log((clr + y) / rn);
      const a = Math.abs(eps);
      const s = Math.min(material.E * a, flowStress(material, a - ey)) * Math.sign(eps);
      M += s * y * rho * dr * dth;
    }
  }
  return M / 1000; // N·mm → N·m
}

function sectionI(OD, t) {
  const ID = OD - 2 * t;
  return (Math.PI / 64) * (OD ** 4 - ID ** 4);
}

// Springback by elastic unloading of the loaded moment: Δκ = SPRINGBACK_CAL·M/(E·I).
// Arc length of the bend is conserved: clr·θL = clrAfter·θF, 1/clrAfter = 1/clr − Δκ
// ⇒ θF = θL·(1 − clr·Δκ). M depends on clr only (not on the angle), so the fixed point
// angleLoad − springback(angleLoad) = angle has the closed form angleLoad = angle/(1 − clr·Δκ).
export function springback({ material, OD, t, clr, angle }) {
  const M = bendingMoment({ material, OD, t, clr }) * 1000; // N·mm
  const dk = CAL.SPRINGBACK_CAL * M / (material.E * sectionI(OD, t));
  const ratio = Math.min(clr * dk, 0.5); // guard: > 50 % recovery is outside the model
  const angleLoad = angle / (1 - ratio);
  return { springback: angleLoad - angle, angleLoad, clrAfter: clr / (1 - ratio) };
}

// Membrane strains at an angle from the extrados (true strains).
// y = r(ψ)·cos ψ with r = OD/2, optionally ovalized r(ψ) = (OD/2)·(1 − (ov/2)·cos 2ψ);
// axial εax = ln((clr + y)/(clr − e)); hoop εθ = −hoopRatio·εax (+ tube-making prestrain);
// thickness e3 = −(εax + εθ) (volume constancy). e3t = thickness strain excluding the prestrain
// (the measured wall t0 already contains it).
export function strainsAt({ OD, t, clr, phiFromExtrados, neutralShift = 0, hoopRatio = 0, ovality = 0, prestrain = 0 }) {
  const psi = phiFromExtrados * DEG;
  const c = Math.cos(psi);
  const r = (OD / 2) * (1 - (ovality / 2) * Math.cos(2 * psi));
  const eAx = Math.log((clr + r * c) / (clr - neutralShift));
  const eHoopMech = -hoopRatio * eAx;
  const eHoop = eHoopMech + prestrain;
  return {
    eAx, eHoop,
    e1: Math.max(eAx, eHoop), e2: Math.min(eAx, eHoop),
    e3: -(eAx + eHoop),
    e3t: -(eAx + eHoopMech),
    t: t * Math.exp(-(eAx + eHoopMech)),
  };
}

const isMS = (m) => m.family === 'AHSS' && m.ys >= 900;

// Tooling recommendation from the classic rotary-draw selection chart: difficulty index
// D = (OD/t)/(CLR/OD) (wall factor over bend ratio), corrected by material family and angle.
//   D < 3 none · 3–5 plug · 5–8 1 bola · 8–12 2 bolas · 12–18 3 bolas · 18–26 4 bolas · ≥ 26 5+ bolas
// Wiper: D ≥ 8, or tight radius (CLR/OD < 1.5) with OD/t > 12.
export const TOOLING_CHART = {
  levels: [
    { max: 3, type: 'none', balls: 0 },
    { max: 5, type: 'plug', balls: 0 },
    { max: 8, type: 'ball', balls: 1 },
    { max: 12, type: 'ball', balls: 2 },
    { max: 18, type: 'ball', balls: 3 },
    { max: 26, type: 'ball', balls: 4 },
    { max: Infinity, type: 'ball', balls: 5 },
  ],
  wiperIndex: 8,
  familyFactor: { 'Aluminio': 1.15, 'Inoxidable': 1.1 },
  smallAngleDeg: 45, smallAngleFactor: 0.8,
};

export function recommendTooling({ material, OD, t, clr, angle }) {
  const WF = OD / t, BR = clr / OD;
  const reasons = [];
  let D = (WF / BR) * (TOOLING_CHART.familyFactor[material.family] ?? 1);
  if (angle < TOOLING_CHART.smallAngleDeg) D *= TOOLING_CHART.smallAngleFactor;
  const lvl = TOOLING_CHART.levels.find((l) => D < l.max);
  reasons.push(`Factor de pared DE/t = ${WF.toFixed(1)}, relación de doblez CLR/DE = ${BR.toFixed(2)} → índice ${D.toFixed(1)}`);
  if (lvl.type === 'none') reasons.push('Pared gruesa y radio amplio: se puede doblar sin mandril');
  else if (lvl.type === 'plug') reasons.push('Se recomienda mandril de tapón para controlar la ovalidad');
  else reasons.push(`Se recomienda mandril de ${lvl.balls} bola${lvl.balls > 1 ? 's' : ''} para soportar el extradós y evitar arrugas`);
  const wiperRequired = D >= TOOLING_CHART.wiperIndex || (BR < 1.5 && WF > 12);
  if (wiperRequired) reasons.push('Se requiere dado limpiador (wiper) para evitar arrugas en el intradós');

  // Extrados strain estimate (pure bending about the centerline, mandrel hoop ratio).
  const eExt = Math.log(1 + 1 / (2 * BR));
  const f0 = flc0At(material, t);
  const use = eExt / f0;
  let boostPct = 0;
  if (BR <= 1.5) boostPct = 10;
  if (use > 0.7) boostPct += 5;
  if (material.family === 'AHSS') boostPct += 5;
  boostPct = Math.min(boostPct, 20);
  if (boostPct > 0) reasons.push(`Empuje (boost) del dado de presión ≈ ${boostPct} % para reducir el adelgazamiento`);
  if (use > 0.9) reasons.push(`Deformación estimada en el extradós (${eExt.toFixed(2)}) cercana o superior al límite FLC0 (${f0.toFixed(2)}): riesgo de fractura, aumente el CLR`);

  let clampLengthFactor = D > 12 ? 3.0 : 2.5;
  let serratedClamp = false;
  if (material.family === 'AHSS' || material.ys >= 550) {
    clampLengthFactor = 3.5; serratedClamp = true;
    reasons.push('Acero de alta resistencia: mordaza larga (3.5×DE) y estriada para evitar deslizamiento');
  }
  if (isMS(material)) {
    clampLengthFactor = 4.0;
    reasons.push('Acero martensítico: mordaza estriada de 4×DE y radios amplios (CLR ≥ 3D)');
  }

  let score = D < 5 ? 0 : D < 12 ? 1 : D < 26 ? 2 : 3;
  if (use > 0.9) score = Math.max(score, 2);
  if (use > 1 || isMS(material)) score = 3;
  const difficulty = ['baja', 'media', 'alta', 'extrema'][score];
  return {
    mandrelType: lvl.type, balls: lvl.balls, wiperRequired, clampLengthFactor, serratedClamp,
    boostPct, difficulty, reasons,
  };
}

// ---------------------------------------------------------------------------------------------
// Per-bend analysis
// ---------------------------------------------------------------------------------------------

function wallStats(plan, tube, s0, s1) {
  const wallAt = plan?.layout?.wallAt;
  const tn = tube.nominalWall ?? tube.minWall;
  if (typeof wallAt !== 'function' || !(s1 > s0)) return { mean: tn, min: tn, max: tn };
  // Midpoint sampling: the tangent points s0/s1 are shared with the neighbouring straights, so a
  // wall change located exactly at a tangent must not leak the neighbour's value into the stats.
  const N = 16;
  let sum = 0, min = Infinity, max = -Infinity;
  for (let k = 0; k < N; k++) {
    const w = wallAt(s0 + (s1 - s0) * (k + 0.5) / N);
    sum += w; min = Math.min(min, w); max = Math.max(max, w);
  }
  return { mean: sum / N, min, max };
}

const norm180 = (a) => { let x = ((a + 180) % 360 + 360) % 360 - 180; if (x === -180) x = 180; return x; };

function angDist(a, b) { return Math.abs(norm180(a - b)); }

// Bend-level quantities shared by analyzeBends and makeFieldSampler.
function bendModel({ OD, t, clr, angle, angleLoad, material, mandrel, wiper, boostPct, clampDie, pressureDie, options }) {
  const type = mandrel?.type ?? 'none';
  const balls = type === 'ball' ? Math.min(mandrel.balls ?? 0, CAL.SUPPORT.maxBalls) : 0;
  const WF = OD / t, BR = clr / OD;
  const rm = (OD - t) / 2;

  // Mandrel clearance (mm): ID at the local wall minus mandrel diameter.
  let clearance = null;
  if (type !== 'none') clearance = options.mandrelClearance ?? ((OD - 2 * t) - mandrel.diameter);
  const cPos = clearance == null ? 0 : Math.max(0, clearance);

  // Ovality (%)
  let fm = CAL.OVALITY_MANDREL[type] ?? 1;
  if (type === 'ball') fm *= Math.pow(CAL.OVALITY_BALL_DECAY, balls);
  let ovalityPct = CAL.OVALITY_K * WF * (OD / (2 * clr)) ** 2 * fm * (1 - Math.exp(-angle / CAL.OVALITY_ANGLE0))
    + CAL.OVALITY_CLEARANCE_K * 100 * cPos / OD;
  ovalityPct = Math.min(ovalityPct, CAL.OVALITY_MAX_PCT);
  const ov = ovalityPct / 100;

  // Lubrication-scaled friction
  const mu = material.mu * (CAL.LUBE_MU_FACTOR[options.lubrication ?? 'normal'] ?? 1);

  // Moment and forces (first pass with the geometric neutral axis)
  const e0 = neutralAxisShift({ OD, t, clr });
  const M = bendingMoment({ material, OD, t, clr, neutralShift: e0 }); // N·m
  const Mn = M * 1000; // N·mm
  const pdLen = pressureDie?.length ?? (clr * angleLoad * DEG + 2 * OD);
  const lever = Math.min(pdLen / 2, CAL.PRESSURE_DIE_LEVER_OD * OD);
  const pressureDieForce = Mn / lever;
  const eExt0 = Math.log((clr + OD / 2) / (clr - e0));
  const sigBar = flowStress(material, 0.5 * eExt0);
  let mandrelForce = 0;
  if (type !== 'none') {
    const nose = mandrel.noseProjection ?? 0.3 * OD;
    const Lc = Math.max(0.5 * OD, type === 'ball' ? nose + balls * (mandrel.pitch ?? 0.5 * OD) : nose + 0.5 * OD);
    mandrelForce = mu * CAL.MANDREL_CONTACT_K * sigBar * t * OD * Lc / clr;
  }
  const wiperOn = !!wiper?.required;
  const wiperForce = wiperOn ? mu * CAL.WIPER_LOAD_K * pressureDieForce : 0;
  const pdDrag = mu * CAL.PD_SLIP * pressureDieForce;
  const area = Math.PI * (OD - t) * t;
  const boostForce = (boostPct / 100) * material.ys * area;
  const net = mandrelForce + wiperForce + pdDrag - CAL.BOOST_EFF * boostForce;
  const torque = Math.max(CAL.TORQUE_MIN_FACTOR * M, M + net * clr / 1000);
  const muC = clampDie?.serrated ? CAL.CLAMP_MU.serrated : CAL.CLAMP_MU.smooth;
  const Lclamp = clampDie?.length ?? 3 * OD;
  const clampForce = CAL.CLAMP_SF * Math.max(Math.max(net, 0) / (2 * muC), Mn / (CAL.CLAMP_ARM_K * Lclamp));

  // Neutral axis with the axial force (tension from drags, compression from boost).
  const Np = sigBar * 2 * Math.PI * rm * t;
  const ratio = Math.max(-0.9, Math.min(0.9, net / Np));
  const e = e0 + CAL.NA_TENSION_EFF * rm * Math.sin((Math.PI / 2) * ratio);

  const hoopRatio = CAL.HOOP_RATIO[type] ?? CAL.HOOP_RATIO.none;
  const prestrain = (options.tubePrestrain ?? true) ? t / (OD - t) : 0;

  // Wrinkling
  const S = CAL.SUPPORT;
  let support = S[type] ?? 1;
  if (type === 'ball') support += S.perBall * balls;
  if (wiperOn) {
    const rake = wiper.rake ?? S.wiperRakeRef;
    support += S.wiper * Math.max(0, Math.min(1, 1 - Math.max(0, rake - S.wiperRakeRef) / S.wiperRakeSpan));
  }
  support /= 1 + S.clearanceK * cPos / t;
  const intr = strainsAt({ OD, t, clr, phiFromExtrados: 180, neutralShift: e, hoopRatio, ovality: ov });
  const epsCr = CAL.WRINKLE_K * (t / OD) * support;
  const wrinkleIndex = Math.max(0, -intr.eAx) / epsCr;

  const ovalityLimitPct = options.ovalityLimitPct ?? LIMITS.ovalityLimitPct;
  const collapseIndex = ovalityPct / ovalityLimitPct * (type === 'none' ? CAL.COLLAPSE_NOMANDREL_FACTOR : 1);

  return {
    type, balls, WF, BR, clearance, ovalityPct, ov, mu, e, hoopRatio, prestrain, support, epsCr,
    wrinkleIndex, collapseIndex, moment: M, torque, pressureDieForce, clampForce, mandrelForce,
    wiperForce, boostForce, flc0: flc0At(material, t),
  };
}

// Demote strain-only wrinkle zones using the bend's support-aware wrinkle index: the FLD
// thickening criterion is sheet-metal practice and ignores mandrel/wiper support.
function demoteWrinkle(zone, wrinkleIndex) {
  if (zone !== 'wrinkle' && zone !== 'wrinkleTendency') return zone;
  if (wrinkleIndex > 1) return zone;
  if (wrinkleIndex > LIMITS.warnFraction) return 'wrinkleTendency';
  return 'compression';
}

export function analyzeBends({ tube, lra, plan, material, options = {} }) {
  const OD = tube.OD;
  const seamAngle = options.seamAngle ?? null;
  const bends = [];
  let C = 0;
  lra.bends.forEach((lb, i) => {
    C += lb.R ?? 0;
    const phiExt = 90 - C;
    const pb = plan?.bends?.[i] ?? {};
    const stack = plan?.stacks?.[pb.stack ?? 0] ?? {};
    const clr = lb.clr ?? stack.clr;
    const angle = lb.A;
    const lay = plan?.layout?.bends?.[i];
    const ws = wallStats(plan, tube, lay?.s0, lay?.s1);
    const t = ws.mean;
    const sb = springback({ material, OD, t, clr, angle });
    const angleLoad = pb.angleLoad ?? sb.angleLoad;
    const boostPct = pb.boostPct ?? 0;
    const bm = bendModel({
      OD, t, clr, angle, angleLoad, material, mandrel: plan?.mandrel, wiper: stack.wiperDie, boostPct,
      clampDie: stack.clampDie, pressureDie: stack.pressureDie, options,
    });

    const common = { OD, t, clr, neutralShift: bm.e, hoopRatio: bm.hoopRatio, ovality: bm.ov, prestrain: bm.prestrain };
    const ext = strainsAt({ ...common, phiFromExtrados: 0 });
    const intr = strainsAt({ ...common, phiFromExtrados: 180 });
    const thinningPct = (1 - Math.exp(ext.e3t)) * 100;
    const thickeningPct = (Math.exp(intr.e3t) - 1) * 100;

    const fldPoints = [];
    let fldMargin = Infinity;
    let fldMarginWeld = Infinity;
    const NP = 36;
    for (let k = 0; k < NP; k++) {
      const phi = k * 360 / NP;
      const p = strainsAt({ ...common, phiFromExtrados: phi });
      const inWeld = seamAngle != null && angDist(phiExt + phi, seamAngle) <= CAL.WELD_HALF_WIDTH;
      const lim = flcFromFlc0(bm.flc0, p.e2) * (inWeld ? material.weldFactor : 1);
      const zone = demoteWrinkle(fldZoneFromLimit(p.e1, p.e2, lim, p.e3t), bm.wrinkleIndex);
      const m = (lim - p.e1) / lim;
      fldMargin = Math.min(fldMargin, m);
      if (inWeld) fldMarginWeld = Math.min(fldMarginWeld, m);
      fldPoints.push({ phi, e1: p.e1, e2: p.e2, e3: p.e3t, zone });
    }
    const seamRelAngle = seamAngle == null ? null : norm180(seamAngle - phiExt);

    // Status and messages
    const messages = [];
    let level = 0; // 0 ok, 1 warning, 2 fail
    const flag = (lv, msg) => { level = Math.max(level, lv); messages.push(msg); };
    const pct = (x) => `${x.toFixed(1)} %`;
    if (fldMargin < 0) flag(2, `Fractura probable: la deformación supera la curva límite de formado (margen FLD ${pct(fldMargin * 100)})`);
    else if (fldMargin < LIMITS.fldRiskMargin) flag(1, `Riesgo de fractura: margen FLD de solo ${pct(fldMargin * 100)}`);
    if (thinningPct > LIMITS.thinningFailPct) flag(2, `Adelgazamiento excesivo en el extradós: ${pct(thinningPct)} (límite ${LIMITS.thinningFailPct} %)`);
    else if (thinningPct > LIMITS.thinningWarnPct) flag(1, `Adelgazamiento alto en el extradós: ${pct(thinningPct)}`);
    if (bm.wrinkleIndex > 1) flag(2, `Arrugas en el intradós (índice ${bm.wrinkleIndex.toFixed(2)}): agregue soporte (mandril/bolas, limpiador) o aumente el CLR`);
    else if (bm.wrinkleIndex > LIMITS.warnFraction) flag(1, `Tendencia a arrugas en el intradós (índice ${bm.wrinkleIndex.toFixed(2)})`);
    if (bm.collapseIndex > 1) flag(2, `Ovalidad/colapso excesivo: ${pct(bm.ovalityPct)} (índice ${bm.collapseIndex.toFixed(2)})`);
    else if (bm.collapseIndex > LIMITS.warnFraction) flag(1, `Ovalidad cercana al límite: ${pct(bm.ovalityPct)}`);
    if (bm.clearance != null) {
      if (bm.clearance < 0) flag(2, `El mandril no pasa: diámetro mayor que el DI local (interferencia ${(-bm.clearance).toFixed(2)} mm)`);
      else if (bm.clearance > LIMITS.clearanceWarnT * t) flag(1, `Holgura de mandril grande (${bm.clearance.toFixed(2)} mm) por pared local delgada: mayor ovalidad`);
    }
    if (seamRelAngle != null) {
      const a = Math.abs(seamRelAngle);
      if (a <= LIMITS.seamWarnDeg) flag(1, `Cordón de soldadura a ${seamRelAngle.toFixed(0)}° del extradós: gírelo hacia el eje neutro (±90°)`);
      else if (a >= 180 - LIMITS.seamWarnDeg) flag(1, `Cordón de soldadura en el intradós (${seamRelAngle.toFixed(0)}° del extradós): gírelo hacia el eje neutro (±90°)`);
      if (fldMarginWeld < 0) flag(2, 'Fractura probable en la zona del cordón de soldadura');
    }
    const mach = plan?.machine;
    if (mach) {
      if (bm.torque > mach.maxTorque) flag(2, `Par requerido ${(bm.torque / 1000).toFixed(1)} kN·m excede la capacidad de la máquina (${(mach.maxTorque / 1000).toFixed(1)} kN·m)`);
      if (bm.clampForce > mach.maxClampForce) flag(1, `Fuerza de mordaza requerida ${(bm.clampForce / 1000).toFixed(0)} kN excede ${(mach.maxClampForce / 1000).toFixed(0)} kN: use mordaza estriada o más larga`);
      if (bm.pressureDieForce > mach.maxPressureDieForce) flag(1, `Fuerza del dado de presión ${(bm.pressureDieForce / 1000).toFixed(0)} kN excede la capacidad (${(mach.maxPressureDieForce / 1000).toFixed(0)} kN)`);
      if (bm.boostForce > mach.maxBoostForce) flag(1, `Fuerza de empuje ${(bm.boostForce / 1000).toFixed(0)} kN excede la capacidad (${(mach.maxBoostForce / 1000).toFixed(0)} kN)`);
    }

    bends.push({
      index: i, clr, angle, angleLoad, springback: angleLoad * (sb.springback / sb.angleLoad), // model recovery at the actual load angle
      clrAfter: sb.clrAfter, wall: t, wallMin: ws.min, WF: bm.WF, BR: bm.BR,
      strain: {
        extrados: { e1: ext.e1, e2: ext.e2, e3: ext.e3t },
        intrados: { e1: intr.e1, e2: intr.e2, e3: intr.e3t },
      },
      thinningPct, thickeningPct, ovalityPct: bm.ovalityPct, mandrelClearance: bm.clearance,
      wrinkleIndex: bm.wrinkleIndex, collapseIndex: bm.collapseIndex, fldMargin, seamRelAngle,
      moment: bm.moment, torque: bm.torque, pressureDieForce: bm.pressureDieForce, clampForce: bm.clampForce,
      mandrelForce: bm.mandrelForce, wiperForce: bm.wiperForce, boostForce: bm.boostForce,
      fldPoints, status: ['ok', 'warning', 'fail'][level], messages,
      // internal, for the field sampler
      _model: { phiExt, e: bm.e, hoopRatio: bm.hoopRatio, ov: bm.ov, prestrain: bm.prestrain, flc0: bm.flc0, s0: lay?.s0, s1: lay?.s1 },
    });
  });

  const max = (k) => bends.reduce((m, b) => Math.max(m, b[k]), 0);
  const worst = bends.reduce((m, b) => Math.max(m, ['ok', 'warning', 'fail'].indexOf(b.status)), 0);
  const messages = [];
  for (const b of bends) for (const m of b.messages) messages.push(`Doblez ${b.index + 1}: ${m}`);
  return {
    bends,
    summary: {
      status: ['ok', 'warning', 'fail'][worst],
      maxThinningPct: max('thinningPct'), maxOvalityPct: max('ovalityPct'),
      maxWrinkleIndex: max('wrinkleIndex'), maxCollapseIndex: max('collapseIndex'),
      minFldMargin: bends.reduce((m, b) => Math.min(m, b.fldMargin), Infinity),
      maxTorque: max('torque'), messages,
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Field sampler for the 3D view
// ---------------------------------------------------------------------------------------------
// at(s, phi): s = material station (plan.layout coordinate), phi = material angle (deg).
// Inside bend i the strains are those of analyzeBends at ψ = phi − φext,i, scaled by a smooth
// ramp w(s) (smoothstep over CAL.RAMP_OD·OD centred on each tangent). Outside bends only the
// tube-making prestrain (hoop) remains. Geometry offsets (fully formed state):
//   dOut = −(OD/2)(ov/2)·cos2ψ                       ovalization (extrados/intrados in, sides out)
//        − flat·max(0,cosψ)²                          extra extrados flattening when collapseIndex > 1
//        + A·max(0,−cosψ)²·sin(2π(s − s0)/λ)          intrados ripples when wrinkleIndex > 1
//   dIn  = dOut + (t0 − t)                            inner surface follows thinning/thickening
// PERFORMANCE CONTRACT: at() allocates nothing; it returns ONE reused object, overwritten on every
// call — copy the fields you need before the next call.
export function makeFieldSampler({ tube, lra, plan, analysis, material, options = {} }) {
  const OD = tube.OD, R = OD / 2;
  const wallAt = typeof plan?.layout?.wallAt === 'function' ? plan.layout.wallAt : () => tube.nominalWall;
  const seamAngle = options.seamAngle ?? null;
  const prestrainOn = options.tubePrestrain ?? true;
  const h = CAL.RAMP_OD * OD / 2;
  const B = analysis.bends.map((b) => {
    const m = b._model;
    const s0 = m.s0 ?? 0, s1 = m.s1 ?? s0 + b.clr * b.angleLoad * DEG;
    const lambda = CAL.WRINKLE_WAVELENGTH_K * Math.sqrt(R * b.wall);
    return {
      s0, s1, a: s0 - h, b: s1 + h, clr: b.clr, phiExt: m.phiExt, rn: b.clr - m.e, hr: m.hoopRatio, ov: m.ov,
      wi: b.wrinkleIndex, k: 2 * Math.PI / lambda,
      amp: b.wrinkleIndex > 1 ? Math.min(CAL.WRINKLE_AMP_K * (b.wrinkleIndex - 1) * b.wall, 1.5 * b.wall) : 0,
      flat: b.collapseIndex > 1 ? Math.min(CAL.FLATTEN_K * (b.collapseIndex - 1) * b.wall, 0.12 * OD) : 0,
    };
  });
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const out = { t0: 0, t: 0, thinningPct: 0, e1: 0, e2: 0, e3: 0, zone: 'safe', dOut: 0, dIn: 0 };
  return {
    at(s, phi) {
      const t0 = wallAt(s);
      let w = 0, bb = null;
      for (let i = 0; i < B.length; i++) {
        const b = B[i];
        if (s <= b.a || s >= b.b) continue;
        const wi = smooth((s - b.a) / (2 * h)) * smooth((b.b - s) / (2 * h));
        if (wi > w) { w = wi; bb = b; }
      }
      const pre = prestrainOn ? t0 / (OD - t0) : 0;
      let eAx = 0, eHm = 0, dOut = 0, wIdx = 0;
      if (bb) {
        const psi = (phi - bb.phiExt) * DEG;
        const c = Math.cos(psi), c2 = Math.cos(2 * psi);
        const ov = bb.ov * w;
        eAx = w * Math.log((bb.clr + R * (1 - 0.5 * ov * c2) * c) / bb.rn);
        eHm = -bb.hr * eAx;
        dOut = -R * 0.5 * ov * c2;
        if (bb.flat > 0 && c > 0) dOut -= w * bb.flat * c * c;
        if (bb.amp > 0 && c < 0) dOut += w * bb.amp * c * c * Math.sin(bb.k * (s - bb.s0));
        wIdx = bb.wi;
      }
      const eH = eHm + pre;
      const e1 = eAx > eH ? eAx : eH, e2 = eAx > eH ? eH : eAx;
      const t = t0 * Math.exp(-(eAx + eHm));
      let lim = flcFromFlc0(flc0At(material, t0), e2);
      if (seamAngle != null) {
        let d = (phi - seamAngle) % 360; if (d < 0) d += 360; if (d > 180) d = 360 - d;
        if (d <= CAL.WELD_HALF_WIDTH) lim *= material.weldFactor;
      }
      out.t0 = t0; out.t = t;
      out.thinningPct = (1 - t / t0) * 100;
      const e3 = -(eAx + eHm);
      out.e1 = e1; out.e2 = e2; out.e3 = e3;
      out.zone = demoteWrinkle(fldZoneFromLimit(e1, e2, lim, e3), wIdx);
      out.dOut = dOut; out.dIn = dOut + (t0 - t);
      return out;
    },
  };
}
