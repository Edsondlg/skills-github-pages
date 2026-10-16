// Per-part cost model for rotary-draw tube bending: material (real wall profile), machine time,
// tooling amortization, setup, scrap, consumables and overhead. Pure ES module.
// Base currency USD; every money output is converted to inputs.currency.
//
// Tooling prices are rule-of-thumb estimates (USD per set, tool-steel dies from a tooling maker,
// order of magnitude of catalogue quotes); "valores típicos, editables".

const TOOL_PRICE = {
  bendDie: (OD, clr) => 900 + 18 * OD + 3 * clr,      // per stack
  clampDie: (OD) => 350 + 8 * OD,                     // per stack, ×1.3 if serrated
  serratedFactor: 1.3,
  pressureDie: (OD, length) => 400 + 6 * OD + 1.2 * length, // per stack
  wiperDie: (OD) => 300 + 9 * OD,                     // per stack that requires it
  mandrel: (OD, balls) => 250 + 6 * OD + 180 * balls,
  collet: (OD) => 200 + 4 * OD,
};
const HARD_PREMIUM = 1.25;                  // AHSS/MS: harder tool steel and coatings on dies and mandrel
const TOOL_LIFE = { default: 150000, ahss: 60000, ms: 30000 }; // parts per tooling set
const CONSUMABLES_USD = 0.02;               // bending lubricant per part
const isMS = (m) => m.family === 'AHSS' && m.ys >= 900;

/** Simpson integral of the steel cross-section area over [0, cutLength] (exact: wallAt is piecewise linear). */
function tubeVolume(OD, layout) {
  const knots = new Set([0, layout.cutLength, layout.frontScrap, layout.cutLength - layout.tailScrap, ...(layout.breakpoints ?? [])]);
  for (const b of layout.bends) { knots.add(b.s0); knots.add(b.s1); }
  const xs = [...knots].filter((x) => x >= 0 && x <= layout.cutLength).sort((a, b) => a - b);
  const area = (s) => { const t = layout.wallAt(s); return Math.PI * (OD - t) * t; };
  let v = 0;
  for (let i = 1; i < xs.length; i++) {
    const a = xs[i - 1], b = xs[i];
    if (b > a) v += (b - a) / 6 * (area(a) + 4 * area((a + b) / 2) + area(b));
  }
  return v; // mm³
}

/** computeCost({ tube, plan, material, machine?, analysis?, inputs? }) → cost breakdown. */
export function computeCost({ tube, plan, material, machine, analysis, inputs = {} }) {
  const mach = machine ?? plan.machine;
  const OD = tube.OD;
  const inp = {
    currency: 'USD', fxMXN: 18.0, annualVolume: 10000, batchSize: 500, setupHours: 1.5, scrapPct: 2,
    overheadPct: 15, marginPct: 0, handlingTime: 8, ...inputs,
  };
  const fx = inp.currency === 'MXN' ? inp.fxMXN : 1;
  const usd = (x) => `${x.toFixed(2)} USD`;
  const assumptions = [];

  const massKg = tubeVolume(OD, plan.layout) * 1e-9 * material.density;
  const price = inp.materialPrice ?? material.pricePerKg;
  const rate = inp.machineRate ?? mach.hourlyRate;
  const cycleTime = plan.sequence.totalTime + inp.handlingTime;

  // Tooling set
  const hard = material.family === 'AHSS';
  const prem = hard ? HARD_PREMIUM : 1;
  const t = { bendDie: 0, clampDie: 0, pressureDie: 0, wiperDie: 0, mandrel: 0, collet: 0 };
  for (const st of plan.stacks) {
    t.bendDie += TOOL_PRICE.bendDie(OD, st.clr) * prem;
    t.clampDie += TOOL_PRICE.clampDie(OD) * (st.clampDie.serrated ? TOOL_PRICE.serratedFactor : 1) * prem;
    t.pressureDie += TOOL_PRICE.pressureDie(OD, st.pressureDie.length) * prem;
    if (st.wiperDie.required) t.wiperDie += TOOL_PRICE.wiperDie(OD) * prem;
  }
  if (plan.mandrel.type !== 'none') t.mandrel = TOOL_PRICE.mandrel(OD, plan.mandrel.balls) * prem;
  t.collet = TOOL_PRICE.collet(OD); // standard collet, no premium
  const toolingUSD = Object.values(t).reduce((a, b) => a + b, 0);
  const life = inp.toolLifeParts ?? (isMS(material) ? TOOL_LIFE.ms : hard ? TOOL_LIFE.ahss : TOOL_LIFE.default);
  // Amortization rule: the set is paid by the parts it makes before it is replaced, but never over
  // more than one year of volume — per part = tooling / min(toolLife, annualVolume).
  const amortParts = Math.min(life, inp.annualVolume);

  const p = {};
  p.material = massKg * price;
  p.machine = rate * cycleTime / 3600;
  p.tooling = toolingUSD / amortParts;
  p.setup = inp.setupHours * rate / inp.batchSize;
  p.scrap = (inp.scrapPct / 100) * (p.material + p.machine);
  p.consumables = CONSUMABLES_USD;
  const direct = p.material + p.machine + p.tooling + p.setup + p.scrap + p.consumables;
  p.overhead = (inp.overheadPct / 100) * direct;
  p.margin = (inp.marginPct / 100) * (direct + p.overhead);
  const keys = ['material', 'machine', 'tooling', 'setup', 'scrap', 'consumables', 'overhead', 'margin'];
  const perPart = {}, perBatch = {};
  for (const k of keys) { perPart[k] = p[k] * fx; perBatch[k] = p[k] * fx * inp.batchSize; }
  perPart.total = keys.reduce((a, k) => a + perPart[k], 0);
  perBatch.total = keys.reduce((a, k) => a + perBatch[k], 0);

  const tooling = {};
  for (const k of Object.keys(t)) tooling[k] = t[k] * fx;
  tooling.total = toolingUSD * fx;
  tooling.life = life;

  assumptions.push(
    `Moneda: ${inp.currency}${inp.currency === 'MXN' ? ` (tipo de cambio ${inp.fxMXN} MXN/USD)` : ''}`,
    `Masa por pieza ${massKg.toFixed(3)} kg: densidad ${material.density} kg/m³ integrada sobre la longitud de corte ${plan.layout.cutLength.toFixed(1)} mm con el perfil de pared (incluye material de sujeción)`,
    `Precio del material: ${usd(price)}/kg${inp.materialPrice != null ? ' (capturado)' : ` (${material.name}, valor típico)`}`,
    `Tarifa de máquina: ${usd(rate)}/h${inp.machineRate != null ? ' (capturada)' : ` (${mach.name})`}`,
    `Tiempo de ciclo: ${plan.sequence.totalTime.toFixed(1)} s de secuencia + ${inp.handlingTime} s de manejo`,
    `Preparación: ${inp.setupHours} h por lote de ${inp.batchSize} piezas`,
    `Merma: ${inp.scrapPct} % de material + máquina; consumibles (lubricante) ${usd(CONSUMABLES_USD)}/pieza`,
    `Gastos indirectos: ${inp.overheadPct} % del costo directo; margen: ${inp.marginPct} %`,
    `Herramental estimado ${usd(toolingUSD)} por juego${hard ? ' (incluye +25 % por acero de herramienta para AHSS)' : ''}; vida ${life} piezas${inp.toolLifeParts != null ? ' (capturada)' : ''}`,
    `Amortización del herramental: costo / mín(vida, volumen anual ${inp.annualVolume}) = ${usd(toolingUSD / amortParts)}/pieza`,
  );
  if (analysis?.summary?.status === 'fail') assumptions.push('El análisis indica falla en algún doblez: el costo supone que el proceso se corrige sin cambiar el herramental');

  return {
    currency: inp.currency, fx: inp.fxMXN,
    massKg, cutLength: plan.layout.cutLength, cycleTime, partsPerHour: 3600 / cycleTime,
    perPart, perBatch, annual: { total: perPart.total * inp.annualVolume },
    tooling, assumptions,
  };
}
