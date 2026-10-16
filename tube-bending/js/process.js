// Process planner for rotary-draw (mandrel) tube bending: tooling sizing, material layout (cut length,
// scrap, wall profile in material coordinates), springback compensation, machine choice and the
// timed machine sequence. Contract: docs/INTERFACES.md §4, §5, §7.
// Pure ES module (no DOM, no three.js). Units: mm, N·m, deg, s.
//
// Tool sizing values are design rules of thumb used in industry (tooling-maker catalogues and
// rotary-draw setup guides); each rule is documented where it is applied. They are starting values
// for a tool design, not a replacement for the tooling supplier's drawing.

import { DEG, lraLength } from './geometry.js';
import { MACHINES, pickMachine } from './machines.js';
import { springback, bendingMoment, recommendTooling } from './mechanics.js';

const CLR_TOL = 0.01;          // mm: bends whose CLR differ by less share a stack
const DEFAULT_WALL = 1.5;      // mm: wall used when the STEP has no inner surface and no manual wall
const TORQUE_FRICTION = 1.4;   // die torque ≈ 1.4·M (tool friction, boost reaction, dynamic margin)
const MILD_YS = 300;           // MPa: reference yield of the machine wall rating (maxWallMild)
const FEED_SETTLE = 0.3;       // s: carriage settle after each feed
const ROTATE_SETTLE = 0.2;     // s: collet settle after each rotation
const MANDREL_RETRACT_TIME = 0.4; // s
const WALL_SAMPLES = 16;       // midpoint samples for the local wall of a bend
const SPEED = { ahss: 0.7, ms: 0.5, thinWall: 0.8, thinWallWF: 40 };

// Martensitic grades (MS1180, MS1500): AHSS with ys ≥ 900 MPa (same rule as mechanics.js).
const isMS = (m) => m.family === 'AHSS' && m.ys >= 900;
const f1 = (x) => Number(x).toFixed(1);
const signed = (x) => `${x >= 0 ? '+' : ''}${f1(x)}`;
const MANDREL_RANK = { none: 0, plug: 1, ball: 2 };

/** Wall profile of the part as a function of the distance sp from the FRONT end (the end bent first). */
function partWallProfile(tube, front, options, warnings, assumptions) {
  const pieces = Array.isArray(tube.wall) && tube.wall.length ? tube.wall : null;
  if (!pieces) {
    let t = options.wall ?? tube.nominalWall;
    if (t == null) {
      t = DEFAULT_WALL;
      warnings.push(`El modelo no tiene superficie interior ni se capturó el espesor: se supone pared de ${f1(DEFAULT_WALL)} mm`);
    } else {
      assumptions.push(`Espesor de pared capturado manualmente: ${t.toFixed(2)} mm (constante)`);
    }
    return { at: () => t, kinks: [], max: t };
  }
  const total = tube.totalLength ?? pieces[pieces.length - 1].s1;
  const toA = (sp) => (front === 'B' ? total - sp : sp);
  const atA = (s) => {
    let lo = 0, hi = pieces.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (pieces[mid].s0 <= s) lo = mid; else hi = mid - 1; }
    const p = pieces[lo];
    if (!(p.s1 > p.s0)) return p.t0;
    const u = Math.min(1, Math.max(0, (s - p.s0) / (p.s1 - p.s0)));
    return p.t0 + (p.t1 - p.t0) * u;
  };
  const kinkSet = new Set();
  for (const p of pieces) { kinkSet.add(toA(p.s0)); kinkSet.add(toA(p.s1)); }
  const max = pieces.reduce((m, p) => Math.max(m, p.t0, p.t1), 0);
  return { at: (sp) => atA(Math.min(total, Math.max(0, toA(sp)))), kinks: [...kinkSet].sort((a, b) => a - b), max };
}

/**
 * planProcess({ tube, lra, material, machine?, options? }) → plan (docs/INTERFACES.md §7).
 * options: { machineId, wall (manual wall, mm), springbackFactor (default 1), boost ('auto' | %),
 *            mandrelClearance (mm) }
 */
export function planProcess({ tube, lra, material, machine, options = {} }) {
  if (!lra?.bends?.length) throw new Error('La pieza no tiene dobleces: no hay proceso de doblado que planear');
  if (!material) throw new Error('Seleccione un material para planear el proceso');
  const OD = tube.OD;
  const opts = { springbackFactor: 1, boost: 'auto', ...options };
  const warnings = [], assumptions = [];
  const front = lra.front === 'B' ? 'B' : 'A';
  const nb = lra.bends.length;

  // ─── 1. Part wall profile and per-bend quantities (part coordinates from the front end) ───
  const wall = partWallProfile(tube, front, opts, warnings, assumptions);
  const partLength = lraLength(lra);
  const info = [];
  {
    let sp = 0;
    for (const b of lra.bends) {
      sp += b.L;
      const p0 = sp, p1 = sp + b.clr * b.A * DEG;
      // Local wall: mean over the bend arc (midpoint rule, same sampling as mechanics.wallStats).
      let sum = 0;
      for (let k = 0; k < WALL_SAMPLES; k++) sum += wall.at(p0 + (p1 - p0) * (k + 0.5) / WALL_SAMPLES);
      const t = sum / WALL_SAMPLES;
      // Springback compensation: overbend by the model springback × user calibration factor.
      // The arc length is conserved on release, so the relaxed radius is clr·angleLoad/A.
      const sb = springback({ material, OD, t, clr: b.clr, angle: b.A });
      const springbackDeg = sb.springback * opts.springbackFactor;
      const angleLoad = b.A + springbackDeg;
      const rec = recommendTooling({ material, OD, t, clr: b.clr, angle: b.A });
      const moment = bendingMoment({ material, OD, t, clr: b.clr });
      info.push({ p0, p1, t, springback: springbackDeg, angleLoad, clrAfter: b.clr * angleLoad / b.A, rec, moment });
      sp = p1;
    }
  }
  if (opts.springbackFactor !== 1) assumptions.push(`Recuperación elástica del modelo multiplicada por ${opts.springbackFactor} (calibración del usuario)`);

  // ─── 2. Stacks: one per distinct CLR; level 0 (bottom) = most used CLR (ties: first used) ───
  const groups = [];
  lra.bends.forEach((b, i) => {
    let g = groups.find((x) => Math.abs(x.clr - b.clr) <= CLR_TOL);
    if (!g) { g = { clr: b.clr, bends: [], first: i }; groups.push(g); }
    g.bends.push(i);
  });
  groups.sort((a, b) => b.bends.length - a.bends.length || a.first - b.first);
  const stackOf = new Array(nb);
  groups.forEach((g, k) => { for (const i of g.bends) stackOf[i] = k; });

  // Die height (all stacks share the OD): max(1.6·OD, OD + 25) — groove centred, ≥ 12.5 mm land
  // above and below the groove.
  const dieHeight = Math.max(1.6 * OD, OD + 25);
  // Clamp die length: recommendTooling.clampLengthFactor·OD (worst bend of the stack), never
  // below 1.5·OD (minimum grip for a smooth clamp on mild steel).
  const clampLen = groups.map((g) => Math.max(1.5, ...g.bends.map((i) => info[i].rec.clampLengthFactor)) * OD);

  // ─── 3. Scrap ───
  // Front scrap: the clamp grips the straight ahead of the tangent (L_i). If the first straight is
  // shorter than the clamp, grip material is added at the front and trimmed after bending.
  const clampOK = lra.bends.map((b, i) => b.L >= clampLen[stackOf[i]] - 1e-9);
  const frontScrap = clampOK[0] ? 0 : clampLen[stackOf[0]] - lra.bends[0].L;
  // Collet: grip length max(1.5·OD, 40 mm); body OD + 30 mm (jaw and nose wall).
  const collet = { gripLength: Math.max(1.5 * OD, 40), OD: OD + 30 };
  // Tail scrap: at the last bend the collet must grip gripLength of material and keep a safety gap
  // of max(OD, 20 mm) to the tangent point (collet nose clear of bend die / wiper tip).
  const colletSafety = Math.max(OD, 20);
  const tailNeeded = collet.gripLength + colletSafety;
  const tailScrap = lra.tail >= tailNeeded ? 0 : tailNeeded - lra.tail;
  assumptions.push(`Mordaza: si la recta frontal es menor que la mordaza se agrega material de sujeción al frente (se recorta después); boquilla: sujeción ${f1(collet.gripLength)} mm + ${f1(colletSafety)} mm de holgura al punto de tangencia`);

  // ─── 4. Layout in material coordinates (s = 0 at the front end) ───
  // zones map material [m0, m1] linearly onto part [p0, p1]; scrap zones map onto an end value.
  const zones = [];
  const layoutBends = [];
  let m = 0, p = 0;
  const zone = (len, plen) => { zones.push({ m0: m, m1: m + len, p0: p, p1: p + plen }); m += len; p += plen; };
  if (frontScrap > 0) zone(frontScrap, 0);
  lra.bends.forEach((b, i) => {
    zone(b.L, b.L);
    const s0 = m;
    // Material wrapped on the die: clr·rad(angleLoad) of tube maps onto clr·rad(A) of the part.
    zone(b.clr * info[i].angleLoad * DEG, b.clr * b.A * DEG);
    layoutBends.push({ s0, s1: m });
  });
  zone(lra.tail, lra.tail);
  if (tailScrap > 0) zone(tailScrap, 0);
  const cutLength = m;
  const realZones = zones.filter((z) => z.m1 > z.m0);
  const partOf = (s) => {
    let lo = 0, hi = realZones.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (realZones[mid].m0 <= s) lo = mid; else hi = mid - 1; }
    const z = realZones[lo];
    const u = Math.min(1, Math.max(0, (s - z.m0) / (z.m1 - z.m0)));
    return z.p0 + (z.p1 - z.p0) * u;
  };
  const wallAt = (s) => wall.at(partOf(Math.min(cutLength, Math.max(0, s))));
  const breakpoints = [];
  for (const k of wall.kinks) {
    const z = realZones.find((x) => x.p1 > x.p0 && k >= x.p0 - 1e-9 && k <= x.p1 + 1e-9);
    if (!z) continue;
    breakpoints.push(z.m0 + (Math.min(Math.max(k, z.p0), z.p1) - z.p0) * (z.m1 - z.m0) / (z.p1 - z.p0));
  }
  breakpoints.sort((a, b) => a - b);
  const layout = { cutLength, frontScrap, tailScrap, bends: layoutBends, wallAt, breakpoints };

  // ─── 5. Stack tooling ───
  const stacks = groups.map((g, k) => {
    const clr = g.clr;
    const maxLoad = Math.max(...g.bends.map((i) => info[i].angleLoad));
    const serrated = g.bends.some((i) => info[i].rec.serratedClamp);
    const wiperRequired = g.bends.some((i) => info[i].rec.wiperRequired);
    const yOffset = k * dieHeight + dieHeight / 2; // Σ heights of lower levels + own half height
    return {
      level: k, clr, yOffset,
      bendDie: {
        clr,
        // Groove radius: OD/2 + 0.5 % (≥ 0.05 mm) running clearance for tube OD tolerance.
        grooveR: OD / 2 + Math.max(0.005 * OD / 2, 0.05),
        // Outer radius: groove bottom + wall around the groove of max(0.3·OD, 8 mm).
        outerR: clr + OD / 2 + Math.max(0.3 * OD, 8),
        // Hub (bore boss) radius: inside the intrados with 0.6·OD of material, ≥ 0.25·CLR.
        hubR: Math.max(clr - OD / 2 - 0.6 * OD, 0.25 * clr),
        height: dieHeight,
        clampLength: clampLen[k],
      },
      // Clamp: length per recommendation, same height as the die, width 0.75·OD (groove half + back).
      clampDie: { length: clampLen[k], height: dieHeight, width: 0.75 * OD, serrated },
      // Pressure die: covers the full wrapped length of the largest bend of the stack + 2·OD support.
      pressureDie: { length: clr * maxLoad * DEG + 2 * OD, height: dieHeight, width: 0.9 * OD },
      // Wiper: length ≈ 0.5·CLR + OD, 1° rake, tip 0.5 mm behind the tangent, feather edge 0.08·OD.
      wiperDie: { required: wiperRequired, length: 0.5 * clr + OD, rake: 1, tipOffset: 0.5, thickness: 0.08 * OD },
    };
  });

  // ─── 6. Mandrel: worst case recommendation over all bends ───
  let worst = info[0].rec;
  for (const { rec } of info) {
    if (MANDREL_RANK[rec.mandrelType] > MANDREL_RANK[worst.mandrelType]
      || (rec.mandrelType === worst.mandrelType && rec.balls > worst.balls)) worst = rec;
  }
  let mandrel;
  if (worst.mandrelType === 'none') {
    mandrel = { type: 'none', diameter: 0, balls: 0, pitch: 0, ballWidth: 0, shankLength: 0, noseProjection: 0, rodLength: 0, retract: 0, clearance: null };
  } else {
    // The mandrel must pass the smallest ID that slides over it: max wall over [s0_0, cutLength]
    // (wallAt is piecewise linear, so the max is at an end or a breakpoint).
    const sStart = layoutBends[0].s0;
    let tPass = Math.max(wallAt(sStart), wallAt(cutLength));
    for (const b of breakpoints) if (b >= sStart && b <= cutLength) tPass = Math.max(tPass, wallAt(b));
    const clearance = opts.mandrelClearance ?? Math.max(0.1 * tPass, 0.15);
    assumptions.push(`Holgura diametral del mandril: ${clearance.toFixed(2)} mm (${opts.mandrelClearance != null ? 'capturada' : 'máx(0.1·t, 0.15 mm)'}) sobre el DI mínimo que pasa (pared ${tPass.toFixed(2)} mm)`);
    const balls = worst.mandrelType === 'ball' ? Math.max(1, worst.balls) : 0;
    const pitch = 0.5 * OD; // link pitch ≈ 0.5·OD
    mandrel = {
      type: worst.mandrelType,
      diameter: OD - 2 * tPass - clearance,
      balls, pitch,
      ballWidth: balls ? 0.3 * OD : 0,
      shankLength: 3 * OD,
      // Nose past the tangent: plug 0.25·OD, ball mandrel 0.15·OD (balls carry the support).
      noseProjection: (worst.mandrelType === 'plug' ? 0.25 : 0.15) * OD,
      rodLength: cutLength + 300,
      retract: (balls + 1) * pitch, // pull the balls back out of the bend before releasing
      clearance,
    };
  }

  // ─── 7. Machine ───
  const maxTorque = Math.max(...info.map((x) => TORQUE_FRICTION * x.moment));
  const maxClr = Math.max(...lra.bends.map((b) => b.clr));
  let mach = machine;
  if (!mach && opts.machineId) {
    mach = MACHINES.find((x) => x.id === opts.machineId);
    if (!mach) warnings.push(`Máquina "${opts.machineId}" no encontrada: se selecciona automáticamente`);
  }
  if (!mach) {
    const pick = pickMachine({ OD, maxTorque, stacks: stacks.length, length: cutLength, clr: maxClr });
    mach = pick.machine;
    if (!pick.fits) warnings.push('Ninguna clase de máquina cumple todos los requisitos: se usa la de mayor capacidad');
  }
  const tMax = Math.max(wall.max, ...info.map((x) => x.t));
  if (OD > mach.maxOD + 1e-6) warnings.push(`DE ${f1(OD)} mm excede la capacidad de ${mach.name} (${f1(mach.maxOD)} mm)`);
  // Wall rating maxWallMild is at maxOD in mild steel; the bending moment scales ~ ys·OD²·t, so the
  // admissible wall is scaled (conservatively, linearly) by maxOD/OD and by 300 MPa/ys.
  const wallCap = mach.maxWallMild * (mach.maxOD / OD) * (MILD_YS / material.ys);
  if (tMax > wallCap + 1e-6) warnings.push(`Pared ${tMax.toFixed(2)} mm excede la capacidad equivalente de ${mach.name} para ${material.name} (${wallCap.toFixed(2)} mm)`);
  if (maxTorque > mach.maxTorque) warnings.push(`Par estimado ${(maxTorque / 1000).toFixed(1)} kN·m excede ${(mach.maxTorque / 1000).toFixed(1)} kN·m de ${mach.name}`);
  if (stacks.length > mach.stackLevels) warnings.push(`Se requieren ${stacks.length} niveles de herramental; ${mach.name} admite ${mach.stackLevels}`);
  if (cutLength > mach.maxTubeLength) warnings.push(`Longitud de corte ${cutLength.toFixed(0)} mm excede ${mach.maxTubeLength} mm de ${mach.name}`);
  if (maxClr > mach.maxCLR) warnings.push(`CLR ${f1(maxClr)} mm excede ${mach.maxCLR} mm de ${mach.name}`);
  assumptions.push(`Par de doblado estimado = ${TORQUE_FRICTION}·momento plástico (fricción y empuje)`);

  // ─── 8. Per-bend plan ───
  const bends = lra.bends.map((b, i) => {
    const x = info[i];
    const notes = [];
    // Bend speed: AHSS ×0.7, martensitic ×0.5 (replaces the AHSS factor), thin wall OD/t > 40 ×0.8.
    let f = 1;
    if (isMS(material)) f *= SPEED.ms;
    else if (material.family === 'AHSS') f *= SPEED.ahss;
    if (OD / x.t > SPEED.thinWallWF) { f *= SPEED.thinWall; notes.push(`Pared delgada (DE/t = ${f1(OD / x.t)}): velocidad de doblado reducida`); }
    if (!clampOK[i]) {
      notes.push('Recta corta para mordaza: se usa material de sujeción (scrap) o mordaza corta');
      if (i === 0) notes.push(`Se agregan ${f1(frontScrap)} mm de material de sujeción al frente (se recorta después)`);
      else warnings.push(`Doblez ${i + 1}: recta de ${f1(b.L)} mm menor que la mordaza (${f1(clampLen[stackOf[i]])} mm); requiere mordaza corta o especial`);
    }
    const boostPct = opts.boost === 'auto' ? x.rec.boostPct : Number(opts.boost);
    return {
      index: i, stack: stackOf[i], angle: b.A, angleLoad: x.angleLoad, springback: x.springback,
      clrAfter: x.clrAfter, boostPct, bendSpeed: mach.bendSpeed * f, clampOK: clampOK[i], wall: x.t, notes,
    };
  });
  if (material.family === 'AHSS') assumptions.push(`Velocidad de doblado ×${isMS(material) ? SPEED.ms : SPEED.ahss} por ${isMS(material) ? 'acero martensítico' : 'AHSS'}`);

  // ─── 9. Sequence ───
  const phases = [];
  let time = 0;
  const add = (type, bend, duration, label, params = {}) => {
    phases.push({ type, bend, start: time, duration, label, params });
    time += duration;
  };
  add('load', -1, mach.loadTime, 'Carga del tubo');
  let level = 0;
  lra.bends.forEach((b, i) => {
    const pb = bends[i];
    if (pb.stack !== level) {
      add('stackChange', i, mach.stackChangeTime, `Cambio de nivel de herramental ${level} → ${pb.stack}`, { fromLevel: level, toLevel: pb.stack });
      level = pb.stack;
    }
    const distance = layoutBends[i].s0 - (i === 0 ? 0 : layoutBends[i - 1].s1);
    add('feed', i, distance / mach.feedSpeed + FEED_SETTLE, `Avance ${f1(distance)} mm`, { distance });
    if (b.R !== 0) add('rotate', i, Math.abs(b.R) / mach.rotSpeed + ROTATE_SETTLE, `Giro ${signed(b.R)}°`, { angle: b.R });
    add('clamp', i, mach.clampTime, 'Cierre de mordaza y dado de presión');
    add('bend', i, pb.angleLoad / pb.bendSpeed, `Doblez ${i + 1}: ${f1(pb.angleLoad)}° (carga)`,
      { angleLoad: pb.angleLoad, clr: b.clr, boostPct: pb.boostPct });
    if (mandrel.type !== 'none') add('mandrelRetract', i, MANDREL_RETRACT_TIME, `Retracción del mandril ${f1(mandrel.retract)} mm`, { distance: mandrel.retract });
    add('release', i, mach.releaseTime, `Liberación: recuperación elástica a ${f1(b.A)}°`, { angleLoad: pb.angleLoad, angleFinal: b.A });
    add('return', i, pb.angleLoad / mach.returnSpeed, 'Retorno del dado', { angle: pb.angleLoad });
  });
  add('unload', -1, mach.unloadTime, 'Descarga de la pieza');
  const totalTime = phases.reduce((a, ph) => a + ph.duration, 0);

  return {
    machine: mach, stacks, mandrel, collet, bends, layout,
    sequence: { phases, totalTime },
    options: opts, warnings, assumptions,
  };
}
