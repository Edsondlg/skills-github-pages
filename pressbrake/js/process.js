// Planeación del proceso de plegado: herramental, secuencia (con chequeo de colisiones),
// tonelaje, tiempos de ciclo y costo por pieza.
import { deformPositions, bendFrame, vec } from './sheetmetal.js';

export const MATERIALS = {
  'acero-cr': { name: 'Acero rolado en frío (1008/1010)', Rm: 380, rho: 7.85, price: 1.25, springback: 1.0 },
  'acero-hr': { name: 'Acero rolado en caliente (A36)', Rm: 450, rho: 7.85, price: 1.05, springback: 1.5 },
  galv: { name: 'Acero galvanizado (G90)', Rm: 360, rho: 7.85, price: 1.4, springback: 1.0 },
  ss304: { name: 'Inoxidable 304', Rm: 620, rho: 7.93, price: 4.2, springback: 3.0 },
  ss430: { name: 'Inoxidable 430', Rm: 500, rho: 7.7, price: 2.9, springback: 2.5 },
  al5052: { name: 'Aluminio 5052-H32', Rm: 230, rho: 2.68, price: 5.6, springback: 2.0 },
  al6061: { name: 'Aluminio 6061-T6', Rm: 310, rho: 2.7, price: 6.4, springback: 4.0 },
};

const STD_V = [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200];

export const DEFAULTS = {
  material: 'acero-cr',
  machineTons: 135, machineLength: 3100,
  vFactor: null, // auto 8T / 10T / 12T
  punchAngle: 86, punchHeight: 120, punchHalfBody: 9,
  dieHeight: 60,
  approachMm: 80, vFast: 180, vBend: 10, vReturn: 160, dwell: 0.3,
  backgauge: 1.2, load: 6, unload: 4, flip: 7, rotate: 4, reposition: 2.5,
  machineRate: 55, operatorRate: 12, efficiency: 85,
  setupMin: 20, batch: 100,
  matPrice: null, scrap: 12,
  cutPerM: 0.9, piercePrice: 0.03, includeCut: true,
  margin: 0, currency: 'USD',
};

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export function chooseV(T, factor) {
  const f = factor || (T <= 3 ? 8 : T <= 8 ? 10 : 12);
  const target = f * T;
  return STD_V.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), STD_V[0]);
}

export function tonnage(Rm, T, V, Lmm) {
  // Fórmula clásica de doblado al aire: P[t/m] = 1.42 · σb[kgf/mm²] · T² / V
  return (1.42 * (Rm / 9.81) * T * T / V) * (Lmm / 1000);
}

/** Matriz de colocación en máquina: X a lo largo de la cama, Y arriba, Z hacia el operador. */
export function placement(model, s, bi, sign, tipY) {
  const f = bendFrame(model, s, bi);
  const x = vec.mul(f.axis, sign), y = f.up, z = vec.cross(x, y);
  return { R: [x, y, z], origin: f.inner, tipY };
}
export function toMachine(pl, p) {
  const q = vec.sub(p, pl.origin);
  return [vec.dot(pl.R[0], q), vec.dot(pl.R[1], q) + pl.tipY, vec.dot(pl.R[2], q)];
}

function punchHalfWidth(yRel, cfg) {
  const tipH = cfg.punchHalfBody / Math.tan(rad(cfg.punchAngle / 2));
  if (yRel < tipH) return yRel * Math.tan(rad(cfg.punchAngle / 2));
  if (yRel < cfg.punchHeight) return cfg.punchHalfBody;
  return 45; // portaherramientas / trabe
}

/** Cuenta vértices en interferencia con punzón, matriz o mesa al final del doblez bi. */
export function collisions(model, s, bi, sign, tool, cfg, positionsOut) {
  const b = model.bends[bi];
  const st = s.slice(); st[bi] = 1;
  const pos = deformPositions(model, st, positionsOut);
  const tipY = model.T - tool.depth;
  const pl = placement(model, st, bi, sign, tipY);
  const halfL = b.length / 2 + 0.5; // punzón seccionado al largo del doblez
  const dieHW = Math.max(tool.V / 2 + 10, 20);
  let punch = 0, die = 0;
  const stride = Math.max(1, Math.floor(pos.length / 3 / 6000));
  for (let i = 0; i < pos.length / 3; i += stride) {
    const m = toMachine(pl, [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]]);
    const yRel = m[1] - tipY;
    if (yRel > model.T + 1) {
      const hw = punchHalfWidth(yRel, cfg);
      const inX = yRel >= cfg.punchHeight || Math.abs(m[0]) < halfL;
      if (inX && Math.abs(m[2]) < hw - 0.3) punch++;
    } else if (m[1] < -1) {
      const inGroove = Math.abs(m[2]) < tool.V / 2 + 0.5 && m[1] > -tool.V;
      if (m[1] < -cfg.dieHeight - 1 || (Math.abs(m[2]) < dieHW && !inGroove)) die++;
    }
  }
  return { punch, die, total: punch + die };
}

/** Plan completo: herramental, secuencia, tiempos y costos. */
export function planProcess(model, cfgIn = {}) {
  const cfg = { ...DEFAULTS, ...cfgIn };
  const mat = MATERIALS[cfg.material] || MATERIALS['acero-cr'];
  const T = model.T;
  const warnings = [];
  const V = chooseV(T, cfg.vFactor);
  const natR = 0.156 * V; // radio interior natural en doblado al aire (acero dulce)
  const bends = model.bends;
  const n = bends.length;

  const tools = bends.map((b) => {
    const over = mat.springback;
    const thetaCmd = Math.min(deg(b.theta) + over, 179);
    const depth = Math.min((V / 2) * Math.tan(rad(thetaCmd) / 2), V * 0.9);
    return { V, depth, thetaCmd, tons: tonnage(mat.Rm, T, V, b.length) };
  });

  // --- secuencia golosa con chequeo de colisión ---
  const s = new Array(n).fill(0);
  const remaining = new Set(bends.map((b) => b.id));
  const seq = [];
  let prev = null;
  const scratch = new Float32Array(model.nV * 3);
  const rootN = n ? bends.find((b) => b.parentBend === -1).nP : [0, 0, 1];
  while (remaining.size) {
    let best = null;
    for (const bi of remaining) {
      for (const sign of [1, -1]) {
        const col = collisions(model, s, bi, sign, tools[bi], cfg, scratch);
        const pl = placement(model, s, bi, sign, 0);
        const h = handling(prev, pl, rootN, cfg);
        const score = col.total * 1000 + h.time * 10 - bends[bi].depthInTree * 5 - (bends[bi].flangeChild < 3 * V ? 3 : 0);
        if (!best || score < best.score) best = { bi, sign, col, h, score, pl };
      }
    }
    s[best.bi] = 1; remaining.delete(best.bi);
    seq.push(best);
    prev = best.pl;
  }

  // --- tiempos ---
  const steps = seq.map((st, i) => {
    const b = bends[st.bi], tool = tools[st.bi];
    const hand = i === 0 ? { kind: 'carga', time: cfg.load } : st.h;
    const tHandle = Math.max(hand.time, cfg.backgauge);
    const tApproach = cfg.approachMm / cfg.vFast;
    const tBend = (tool.depth + T + 2) / cfg.vBend;
    const tReturn = (tool.depth + cfg.approachMm) / cfg.vReturn;
    const total = tHandle + tApproach + tBend + cfg.dwell + tReturn;
    const flangeMin = Math.min(b.flangeChildOut, b.flangeParentOut);
    const minFl = 0.7 * V;
    const notes = [];
    if (flangeMin < minFl) notes.push(`Ala corta (${flangeMin.toFixed(1)} mm < ${minFl.toFixed(1)} mm mín. para V${V})`);
    if (st.col.punch) notes.push('Interferencia con punzón: evaluar punzón cuello de ganso');
    if (st.col.die) notes.push('Interferencia con matriz/mesa');
    if (b.length > cfg.machineLength) notes.push('Largo de doblez excede la máquina');
    return {
      step: i + 1, bend: b, bi: st.bi, sign: st.sign, tool, handling: hand,
      t: { handle: tHandle, approach: tApproach, bend: tBend, dwell: cfg.dwell, ret: tReturn, total },
      flangeMin, notes, collision: st.col,
    };
  });
  const tUnload = cfg.unload;
  const cycleRaw = n ? steps.reduce((a, st) => a + st.t.total, 0) + tUnload : 0; // sin dobleces no pasa por la plegadora
  const cycle = cycleRaw / (cfg.efficiency / 100);
  const maxTons = Math.max(0, ...tools.map((t) => t.tons));
  if (maxTons > cfg.machineTons) warnings.push(`Tonelaje requerido ${maxTons.toFixed(1)} t excede la capacidad de ${cfg.machineTons} t.`);
  if (model.bends.some((b) => b.rIn < natR * 0.6)) warnings.push(`Radio interior de diseño menor que el natural (~${natR.toFixed(1)} mm con V${V}); el radio real saldrá mayor o se requiere acuñado.`);
  if (steps.some((s) => s.collision.total)) warnings.push('La mejor secuencia encontrada tiene interferencias; revisar herramental.');

  // --- costos ---
  const massKg = (model.volume / 1000) * mat.rho / 1000; // mm³ → cm³ → g → kg
  const blank = model.flatBBox;
  const blankMassKg = (blank.L * blank.W * T / 1000) * mat.rho / 1000;
  const matPrice = cfg.matPrice ?? mat.price;
  const materialCost = blankMassKg * (1 + cfg.scrap / 100) * matPrice;
  const cutCost = cfg.includeCut ? (model.cutLength / 1000) * cfg.cutPerM + model.pierces * cfg.piercePrice : 0;
  const rateH = cfg.machineRate + cfg.operatorRate;
  const bendCost = (cycle / 3600) * rateH;
  const setupCost = n ? ((cfg.setupMin / 60) * rateH) / Math.max(1, cfg.batch) : 0;
  const subtotal = materialCost + cutCost + bendCost + setupCost;
  const price = subtotal * (1 + cfg.margin / 100);
  const batchHours = n ? (cfg.setupMin / 60) + (cycle * cfg.batch) / 3600 : 0;

  return {
    cfg, mat, V, natR, tools, steps, warnings: [...model.warnings, ...warnings],
    cycleRaw, cycle, piecesPerHour: cycle > 0 ? 3600 / cycle : 0, maxTons,
    massKg, blankMassKg, blank,
    cost: { material: materialCost, cut: cutCost, bend: bendCost, setup: setupCost, subtotal, price, batchTotal: price * cfg.batch, batchHours },
  };
}

function handling(prev, pl, rootN, cfg) {
  if (!prev) return { kind: 'carga', time: cfg.load };
  // orientación de la cara base respecto a la máquina
  const ny = (R) => vec.dot(R[1], rootN);
  const flipped = Math.sign(ny(prev.R)) !== Math.sign(ny(pl.R)) && Math.abs(ny(pl.R)) > 0.3 && Math.abs(ny(prev.R)) > 0.3;
  if (flipped) return { kind: 'volteo', time: cfg.flip };
  // giro alrededor de la vertical: comparar dirección del eje de pieza en planta
  const ax0 = prev.R[0], ax1 = pl.R[0];
  const c = vec.dot(ax0, ax1);
  if (c < 0.2) return { kind: 'giro', time: cfg.rotate };
  return { kind: 'reposición', time: cfg.reposition };
}
