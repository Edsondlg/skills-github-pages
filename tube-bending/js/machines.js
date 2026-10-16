// Generic CNC rotary-draw (mandrel) bender classes. No brands: capacities are representative of
// commercial machines of each size class (catalogue ranges, rounded). Units: mm, N, N·m, deg/s,
// mm/s, s, USD/h. maxWallMild: max wall at maxOD in mild steel (ys ≈ 300 MPa).
// "valores típicos, editables".

export const MACHINES = [
  {
    id: 'cnc-38e', name: 'CNC-38 eléctrica', drive: 'eléctrica',
    maxOD: 38.1, maxWallMild: 2.5, maxCLR: 190, maxTorque: 4000, maxClampForce: 60000,
    maxPressureDieForce: 45000, maxBoostForce: 20000, stackLevels: 3,
    feedSpeed: 1000, rotSpeed: 360, bendSpeed: 180, returnSpeed: 240,
    clampTime: 0.4, releaseTime: 0.3, loadTime: 6, unloadTime: 5, stackChangeTime: 1.5,
    hourlyRate: 55, maxTubeLength: 3000,
  },
  {
    id: 'cnc-50', name: 'CNC-50', drive: 'eléctrica',
    maxOD: 50.8, maxWallMild: 3.0, maxCLR: 250, maxTorque: 8000, maxClampForce: 100000,
    maxPressureDieForce: 75000, maxBoostForce: 30000, stackLevels: 3,
    feedSpeed: 900, rotSpeed: 300, bendSpeed: 120, returnSpeed: 180,
    clampTime: 0.5, releaseTime: 0.4, loadTime: 7, unloadTime: 6, stackChangeTime: 2,
    hourlyRate: 65, maxTubeLength: 4000,
  },
  {
    id: 'cnc-63', name: 'CNC-63', drive: 'híbrida',
    maxOD: 63.5, maxWallMild: 3.5, maxCLR: 320, maxTorque: 14000, maxClampForce: 140000,
    maxPressureDieForce: 110000, maxBoostForce: 45000, stackLevels: 3,
    feedSpeed: 800, rotSpeed: 250, bendSpeed: 90, returnSpeed: 140,
    clampTime: 0.6, releaseTime: 0.5, loadTime: 8, unloadTime: 7, stackChangeTime: 2.5,
    hourlyRate: 75, maxTubeLength: 4500,
  },
  {
    id: 'cnc-76', name: 'CNC-76', drive: 'híbrida',
    maxOD: 76.2, maxWallMild: 4.0, maxCLR: 380, maxTorque: 22000, maxClampForce: 190000,
    maxPressureDieForce: 150000, maxBoostForce: 60000, stackLevels: 2,
    feedSpeed: 700, rotSpeed: 200, bendSpeed: 70, returnSpeed: 110,
    clampTime: 0.8, releaseTime: 0.6, loadTime: 10, unloadTime: 8, stackChangeTime: 3,
    hourlyRate: 85, maxTubeLength: 6000,
  },
  {
    id: 'cnc-89h', name: 'CNC-89 hidráulica', drive: 'hidráulica',
    maxOD: 88.9, maxWallMild: 5.0, maxCLR: 450, maxTorque: 35000, maxClampForce: 260000,
    maxPressureDieForce: 210000, maxBoostForce: 90000, stackLevels: 2,
    feedSpeed: 550, rotSpeed: 150, bendSpeed: 50, returnSpeed: 80,
    clampTime: 1.0, releaseTime: 0.8, loadTime: 12, unloadTime: 10, stackChangeTime: 3.5,
    hourlyRate: 95, maxTubeLength: 6000,
  },
  {
    id: 'cnc-114h', name: 'CNC-114 hidráulica', drive: 'hidráulica',
    maxOD: 114.3, maxWallMild: 6.0, maxCLR: 570, maxTorque: 60000, maxClampForce: 400000,
    maxPressureDieForce: 320000, maxBoostForce: 140000, stackLevels: 2,
    feedSpeed: 400, rotSpeed: 120, bendSpeed: 35, returnSpeed: 60,
    clampTime: 1.2, releaseTime: 1.0, loadTime: 15, unloadTime: 12, stackChangeTime: 4,
    hourlyRate: 110, maxTubeLength: 6500,
  },
];

// Smallest machine class that fits. Optional extra checks: clr (≤ maxCLR), clampForce.
// Returns { machine, fits, reasons: string[] } — when nothing fits, the largest class with the
// list of exceeded limits (fits = false).
export function pickMachine({ OD, maxTorque = 0, stacks = 1, length = 0, clr = 0, clampForce = 0 }) {
  const fmt = (x, d = 0) => Number(x).toFixed(d);
  const check = (m) => {
    const r = [];
    if (OD > m.maxOD) r.push(`DE ${fmt(OD, 1)} mm excede la capacidad de ${m.name} (${fmt(m.maxOD, 1)} mm)`);
    if (maxTorque > m.maxTorque) r.push(`Par requerido ${fmt(maxTorque / 1000, 1)} kN·m excede ${fmt(m.maxTorque / 1000, 1)} kN·m de ${m.name}`);
    if (stacks > m.stackLevels) r.push(`Se requieren ${stacks} niveles de herramental; ${m.name} admite ${m.stackLevels}`);
    if (length > m.maxTubeLength) r.push(`Longitud de corte ${fmt(length)} mm excede ${fmt(m.maxTubeLength)} mm de ${m.name}`);
    if (clr > m.maxCLR) r.push(`CLR ${fmt(clr, 1)} mm excede ${fmt(m.maxCLR)} mm de ${m.name}`);
    if (clampForce > m.maxClampForce) r.push(`Fuerza de mordaza ${fmt(clampForce / 1000, 1)} kN excede ${fmt(m.maxClampForce / 1000)} kN de ${m.name}`);
    return r;
  };
  const skipped = [];
  for (const m of MACHINES) {
    const r = check(m);
    if (r.length === 0) {
      const reasons = [`${m.name}: la clase más pequeña que cumple DE, par, niveles y longitud`];
      if (skipped.length) reasons.push(...skipped);
      return { machine: m, fits: true, reasons };
    }
    skipped.push(`Descartada ${m.name}: ${r.join('; ')}`);
  }
  const last = MACHINES[MACHINES.length - 1];
  return { machine: last, fits: false, reasons: ['Ninguna clase de máquina cumple todos los requisitos', ...check(last)] };
}
