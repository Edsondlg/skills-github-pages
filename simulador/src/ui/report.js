// Datos de pieza y reporte: cálculo (funciones puras), formateo, CSV, JSON y HTML imprimible.
// Unidades internas: mm, mm², mm³, g/cm³, MPa, N. Sin acceso al DOM.

const MM_PER_IN = 25.4;
const G_PER_LB = 453.59237;
const G_PER_OZ = G_PER_LB / 16;
const LB_IN3_PER_G_CM3 = 0.036127292; // 1 g/cm³ en lb/in³
const LB_IN2_PER_KG_MM2 = 2.20462262185 / MM_PER_IN ** 2; // 1 kg·mm² = 2.20462 lb·(1/25.4 in)² ≈ 0.00341717 lb·in²
const N_PER_TONF = 9806.65;
const N_PER_USTON = 8896.44;
const N_PER_LBF = 4.4482216;
const STRIP_FACTOR = 0.1; // fuerza de extracción ≈ 10 % de la de corte (estimación)

/**
 * @typedef {Object} PartData
 * @property {{id:string,name:string,density:number,uts:?number,yieldStrength:?number,shear:?number,E:?number}} material
 * @property {string} mode            'extrude' | 'revolve' | 'multiview'
 * @property {{g:number,kg:number,lb:number}} mass
 * @property {{mm3:number,cm3:number,in3:number}} volume
 * @property {{gcm3:number,kgm3:number,lbin3:number}} density
 * @property {{mm2:number,cm2:number,in2:number}} area          superficie total
 * @property {{size:number[],min:number[],max:number[],diagonal:number}} bbox   mm
 * @property {{centroid:number[]}} centroid                     centro de masa (densidad uniforme), mm
 * @property {{Ixx:number,Iyy:number,Izz:number,Pxy:number,Pxz:number,Pyz:number}} inertia   kg·mm² respecto al centroide
 * @property {{kgmm2:object,kgm2:object,lbin2:object}} inertiaUnits   mismos seis términos en otras unidades
 * @property {{moments:number[],momentsKgm2:number[],momentsLbin2:number[],axes:*}} principal   kg·mm² (momentos principales)
 * @property {{x:number,y:number,z:number,principal:number[]}} gyration   radios de giro k=√(I/m), mm
 * @property {?Object} sheet        lámina/troquelado (sólo extrude con perfil):
 *   thickness, blankWidth, blankHeight, blankArea, netArea, utilization (%), cutLength, holes, minHoleDiameter,
 *   shearStrength (MPa|null), cuttingForce {N,kN,tonf,uston}|null, strippingForce (igual, estimación 10 %)|null,
 *   grossWeight {g,kg}, netWeight {g,kg} (= masa del kernel), scrapWeight {g,kg}, scrapPct.
 *   holes y minHoleDiameter cuentan solo agujeros pasantes (los ciegos no se punzonan).
 * @property {?string} sheetNote    por qué no hay datos de lámina (sheetApplicable = false)
 * @property {?Object} profile     perfil 2D: netArea, perimeterOuter, perimeterInner, loops, holes[{d,c}], bbox2d
 * @property {?{kernelVolume:number,analyticVolume:number,absError:number,relError:number,relErrorPct:number}} precision
 * @property {?{pricePerKg:number,netCost:number,blankCost:?number}} cost
 * @property {{counts:Object,valid:boolean,closed:boolean}} topology
 */

const kgmm2To = (v) => ({ kgmm2: v, kgm2: v * 1e-6, lbin2: v * LB_IN2_PER_KG_MM2 });

/**
 * Calcula todos los datos de la pieza a partir del resultado del kernel.
 * sheetApplicable = false (p. ej. regiones con alturas distintas) suprime los datos de lámina y deja sheetNote.
 * blankMargin negativo o inválido cuenta como 0.
 */
export function computePartData({ build, material, profile = null, mode, thickness, pricePerKg, blankMargin = 0, analyticVolume, sheetApplicable = true }) {
  const p = build.props;
  const rho = material.density;
  const massG = (p.volume / 1000) * rho;
  const massKg = massG / 1000;
  const k = rho * 1e-6; // mm^5 (densidad unitaria) → kg·mm²
  const I = {};
  for (const key of ['Ixx', 'Iyy', 'Izz', 'Pxy', 'Pxz', 'Pyz']) I[key] = (p.inertia?.[key] ?? 0) * k;
  const mom = (p.principal?.moments ?? []).map((v) => v * k);
  const kg = (v) => (massKg > 0 && v >= 0 ? Math.sqrt(v / massKg) : 0);
  const size = p.bbox.size;

  /** @type {PartData} */
  const d = {
    material: {
      id: material.id, name: material.name, density: rho,
      uts: material.uts ?? null, yieldStrength: material.yieldStrength ?? null,
      shear: material.shear ?? null, E: material.E ?? null,
    },
    mode,
    mass: { g: massG, kg: massKg, lb: massG / G_PER_LB },
    volume: { mm3: p.volume, cm3: p.volume / 1000, in3: p.volume / MM_PER_IN ** 3 },
    density: { gcm3: rho, kgm3: rho * 1000, lbin3: rho * LB_IN3_PER_G_CM3 },
    area: { mm2: p.area, cm2: p.area / 100, in2: p.area / MM_PER_IN ** 2 },
    bbox: { size: [...size], min: [...p.bbox.min], max: [...p.bbox.max], diagonal: Math.hypot(...size) },
    centroid: { centroid: [...p.centroid] },
    inertia: I,
    inertiaUnits: {
      kgmm2: { ...I },
      kgm2: Object.fromEntries(Object.entries(I).map(([a, v]) => [a, v * 1e-6])),
      lbin2: Object.fromEntries(Object.entries(I).map(([a, v]) => [a, v * LB_IN2_PER_KG_MM2])),
    },
    principal: {
      moments: mom,
      momentsKgm2: mom.map((v) => v * 1e-6),
      momentsLbin2: mom.map((v) => v * LB_IN2_PER_KG_MM2),
      axes: p.principal?.axes ?? null,
    },
    gyration: { x: kg(I.Ixx), y: kg(I.Iyy), z: kg(I.Izz), principal: mom.map(kg) },
    sheet: null,
    sheetNote: null,
    profile: profile ? { ...profile } : null,
    precision: null,
    cost: null,
    topology: { counts: p.counts ?? {}, valid: !!p.valid, closed: !!p.closed },
  };

  if (mode === 'extrude' && profile && thickness > 0 && !sheetApplicable) {
    d.sheetNote = 'Datos de lámina no aplican: hay regiones con alturas distintas.';
  } else if (mode === 'extrude' && profile && thickness > 0) {
    const t = thickness;
    const b = profile.bbox2d;
    const margin = Math.max(0, Number(blankMargin) || 0);
    const blankWidth = b.maxX - b.minX + 2 * margin;
    const blankHeight = b.maxY - b.minY + 2 * margin;
    const blankArea = blankWidth * blankHeight;
    const cutLength = (profile.perimeterOuter ?? 0) + (profile.perimeterInner ?? 0);
    const tau = material.shear ?? (material.uts != null ? 0.8 * material.uts : null);
    const F = tau != null ? cutLength * t * tau : null;
    const force = (n) => ({ N: n, kN: n / 1000, tonf: n / N_PER_TONF, uston: n / N_PER_USTON });
    const wt = (area) => { const g = (area * t * rho) / 1000; return { g, kg: g / 1000 }; };
    const gross = wt(blankArea);
    // Peso neto = masa real del kernel (incluye agujeros ciegos y demás detalles 3D).
    const net = { g: massG, kg: massKg };
    const scrapG = gross.g - net.g;
    // Solo pasantes; op ausente = pasante (perfiles sin op).
    const holes = (profile.holes ?? []).filter((h) => h.op == null || h.op === 'through');
    d.sheet = {
      thickness: t, blankWidth, blankHeight, blankArea,
      netArea: profile.netArea,
      utilization: blankArea > 0 ? (profile.netArea / blankArea) * 100 : 0,
      cutLength,
      holes: holes.length,
      // Solo agujeros circulares (d numérico); los de forma libre traen d = null.
      minHoleDiameter: holes.some((h) => Number.isFinite(h.d)) ? Math.min(...holes.filter((h) => Number.isFinite(h.d)).map((h) => h.d)) : null,
      shearStrength: tau,
      cuttingForce: F != null ? force(F) : null,
      strippingForce: F != null ? force(F * STRIP_FACTOR) : null, // estimación
      grossWeight: gross, netWeight: net,
      scrapWeight: { g: scrapG, kg: scrapG / 1000 },
      scrapPct: gross.g > 0 ? (scrapG / gross.g) * 100 : 0,
    };
  }

  if (analyticVolume != null) {
    const abs = p.volume - analyticVolume;
    const rel = analyticVolume !== 0 ? Math.abs(abs) / Math.abs(analyticVolume) : 0;
    d.precision = { kernelVolume: p.volume, analyticVolume, absError: abs, relError: rel, relErrorPct: rel * 100 };
  }

  if (pricePerKg != null && pricePerKg >= 0) {
    d.cost = {
      pricePerKg,
      netCost: massKg * pricePerKg,
      blankCost: d.sheet ? d.sheet.grossWeight.kg * pricePerKg : null,
    };
  }
  return d;
}

// ---------- Formateo ----------

/**
 * Fábrica de formateadores: makeFormatter('metric'|'imperial').
 * Entradas siempre en unidades internas (mm, mm², mm³, g, g/cm³, kg·mm², N).
 * Devuelve { system, len, area, vol, mass, density, inertia, force, pct, angle, point }.
 */
export function makeFormatter(system = 'metric') {
  const imp = system === 'imperial';
  const ok = (n) => Number.isFinite(n);
  const dash = '—';
  return {
    system,
    len: (mm) => (!ok(mm) ? dash : imp ? `${(mm / MM_PER_IN).toFixed(4)} in` : `${mm.toFixed(3)} mm`),
    area: (mm2) => {
      if (!ok(mm2)) return dash;
      if (imp) return `${(mm2 / MM_PER_IN ** 2).toFixed(4)} in²`;
      return Math.abs(mm2) >= 1e4 ? `${(mm2 / 100).toFixed(3)} cm²` : `${mm2.toFixed(3)} mm²`;
    },
    vol: (mm3) => {
      if (!ok(mm3)) return dash;
      if (imp) return `${(mm3 / MM_PER_IN ** 3).toFixed(4)} in³`;
      return Math.abs(mm3) >= 1e3 ? `${(mm3 / 1000).toFixed(3)} cm³` : `${mm3.toFixed(3)} mm³`;
    },
    mass: (g) => {
      if (!ok(g)) return dash;
      if (imp) return Math.abs(g) >= G_PER_LB ? `${(g / G_PER_LB).toFixed(3)} lb` : `${(g / G_PER_OZ).toFixed(3)} oz`;
      return Math.abs(g) >= 1000 ? `${(g / 1000).toFixed(3)} kg` : `${g.toFixed(3)} g`;
    },
    density: (gcm3) => (!ok(gcm3) ? dash : imp ? `${(gcm3 * LB_IN3_PER_G_CM3).toFixed(5)} lb/in³` : `${gcm3.toFixed(3)} g/cm³`),
    inertia: (kgmm2) => {
      if (!ok(kgmm2)) return dash;
      const v = imp ? kgmm2 * LB_IN2_PER_KG_MM2 : kgmm2;
      const a = Math.abs(v);
      const s = a !== 0 && (a < 1e-3 || a >= 1e9) ? v.toExponential(4) : v.toFixed(3);
      return `${s} ${imp ? 'lb·in²' : 'kg·mm²'}`;
    },
    force: (N) => {
      if (!ok(N)) return dash;
      if (imp) return `${(N / N_PER_LBF).toFixed(1)} lbf`;
      return Math.abs(N) >= 1000 ? `${(N / 1000).toFixed(3)} kN` : `${N.toFixed(1)} N`;
    },
    pct: (v) => (!ok(v) ? dash : `${v.toFixed(2)} %`),
    angle: (deg) => (!ok(deg) ? dash : `${deg.toFixed(3)}°`),
    point: (pt) => {
      if (!pt || !pt.every(ok)) return dash;
      const f = (v) => (imp ? (v / MM_PER_IN).toFixed(4) : v.toFixed(3));
      return `(${pt.map(f).join(', ')}) ${imp ? 'in' : 'mm'}`;
    },
  };
}

/**
 * Formateador global conmutable (para la UI): fmt.setSystem('imperial').
 * Delega en makeFormatter; reportHTML usa su propio formateador según `options.system`.
 */
export const fmt = (() => {
  let cur = makeFormatter('metric');
  const o = { setSystem(s) { cur = makeFormatter(s); }, get system() { return cur.system; } };
  for (const k of ['len', 'area', 'vol', 'mass', 'density', 'inertia', 'force', 'pct', 'angle', 'point']) {
    o[k] = (...a) => cur[k](...a);
  }
  return o;
})();

// ---------- Filas del reporte (compartidas por CSV y HTML) ----------

const num = (v, n = 6) => (v == null || !Number.isFinite(v) ? '' : String(+v.toPrecision(n)));

/** Secciones [{ title, rows:[{ l, v, u, s }] }]: l etiqueta, v valor crudo, u unidad, s texto formateado. */
function buildSections(d, f) {
  const R = (l, v, u, s) => ({ l, v, u, s: s ?? `${v}${u ? ' ' + u : ''}` });
  const [sx, sy, sz] = d.bbox.size;
  const sections = [];
  sections.push({
    title: 'Resumen',
    rows: [
      R('Masa', num(d.mass.g), 'g', f.mass(d.mass.g)),
      R('Masa (kg)', num(d.mass.kg), 'kg'),
      R('Masa (lb)', num(d.mass.lb), 'lb'),
      R('Volumen', num(d.volume.mm3), 'mm³', f.vol(d.volume.mm3)),
      R('Densidad', num(d.density.gcm3), 'g/cm³', f.density(d.density.gcm3)),
      R('Área superficial', num(d.area.mm2), 'mm²', f.area(d.area.mm2)),
      R('Caja envolvente', `${num(sx)} x ${num(sy)} x ${num(sz)}`, 'mm', `${f.len(sx)} × ${f.len(sy)} × ${f.len(sz)}`),
    ],
  });
  const m = d.material;
  const mrows = [R('Material', m.name, '', m.name), R('Densidad', num(m.density), 'g/cm³', f.density(m.density))];
  if (m.uts != null) mrows.push(R('Resistencia a la tracción (UTS)', num(m.uts), 'MPa'));
  if (m.yieldStrength != null) mrows.push(R('Límite de fluencia', num(m.yieldStrength), 'MPa'));
  if (m.shear != null) mrows.push(R('Resistencia al corte', num(m.shear), 'MPa'));
  if (m.E != null) mrows.push(R('Módulo de elasticidad (E)', num(m.E), 'GPa'));
  sections.push({ title: 'Material', rows: mrows });
  sections.push({
    title: 'Geometría',
    rows: [
      R('Volumen (cm³)', num(d.volume.cm3), 'cm³'),
      R('Volumen (in³)', num(d.volume.in3), 'in³'),
      R('Área superficial (cm²)', num(d.area.cm2), 'cm²'),
      R('Área superficial (in²)', num(d.area.in2), 'in²'),
      R('Dimensión X', num(sx), 'mm', f.len(sx)),
      R('Dimensión Y', num(sy), 'mm', f.len(sy)),
      R('Dimensión Z', num(sz), 'mm', f.len(sz)),
      R('Mínimo de la caja', d.bbox.min.map((v) => num(v)).join('; '), 'mm', f.point(d.bbox.min)),
      R('Máximo de la caja', d.bbox.max.map((v) => num(v)).join('; '), 'mm', f.point(d.bbox.max)),
      R('Diagonal de la caja', num(d.bbox.diagonal), 'mm', f.len(d.bbox.diagonal)),
    ],
  });
  const I = d.inertia;
  const irow = (l, v) => R(l, num(v), 'kg·mm²', f.inertia(v));
  sections.push({
    title: 'Centro de masa e inercia',
    rows: [
      R('Centro de masa', d.centroid.centroid.map((v) => num(v)).join('; '), 'mm', f.point(d.centroid.centroid)),
      irow('Ixx (centroide)', I.Ixx), irow('Iyy (centroide)', I.Iyy), irow('Izz (centroide)', I.Izz),
      irow('Pxy', I.Pxy), irow('Pxz', I.Pxz), irow('Pyz', I.Pyz),
      R('Izz (kg·m²)', num(d.inertiaUnits.kgm2.Izz), 'kg·m²'),
      R('Izz (lb·in²)', num(d.inertiaUnits.lbin2.Izz), 'lb·in²'),
      ...d.principal.moments.map((v, i) => irow(`Momento principal I${i + 1}`, v)),
      R('Radio de giro kx', num(d.gyration.x), 'mm', f.len(d.gyration.x)),
      R('Radio de giro ky', num(d.gyration.y), 'mm', f.len(d.gyration.y)),
      R('Radio de giro kz', num(d.gyration.z), 'mm', f.len(d.gyration.z)),
    ],
  });
  const s = d.sheet;
  if (s) {
    const rows = [
      R('Espesor', num(s.thickness), 'mm', f.len(s.thickness)),
      R('Desarrollo (ancho)', num(s.blankWidth), 'mm', f.len(s.blankWidth)),
      R('Desarrollo (alto)', num(s.blankHeight), 'mm', f.len(s.blankHeight)),
      R('Área del desarrollo', num(s.blankArea), 'mm²', f.area(s.blankArea)),
      R('Área neta', num(s.netArea), 'mm²', f.area(s.netArea)),
      R('Aprovechamiento', num(s.utilization), '%', f.pct(s.utilization)),
      R('Longitud de corte', num(s.cutLength), 'mm', f.len(s.cutLength)),
      R('Número de agujeros', String(s.holes), ''),
      R('Ø mínimo de agujero', num(s.minHoleDiameter), 'mm', s.minHoleDiameter == null ? '—' : f.len(s.minHoleDiameter)),
    ];
    if (s.cuttingForce) {
      const c = s.cuttingForce;
      rows.push(
        R('Resistencia al corte usada', num(s.shearStrength), 'MPa'),
        R('Fuerza de corte', num(c.N), 'N', f.force(c.N)),
        R('Fuerza de corte (kN)', num(c.kN), 'kN'),
        R('Fuerza de corte (tonf métricas)', num(c.tonf), 'tonf'),
        R('Fuerza de corte (toneladas cortas EE. UU.)', num(c.uston), 'ton'),
        R('Fuerza de extracción (estimada, 10 % de F)', num(s.strippingForce.N), 'N', f.force(s.strippingForce.N)),
      );
    } else {
      rows.push(R('Fuerza de corte', '', '', 'N/D (material sin resistencia al corte ni UTS)'));
    }
    rows.push(
      R('Peso bruto (desarrollo)', num(s.grossWeight.g), 'g', f.mass(s.grossWeight.g)),
      R('Peso neto', num(s.netWeight.g), 'g', f.mass(s.netWeight.g)),
      R('Peso de merma', num(s.scrapWeight.g), 'g', f.mass(s.scrapWeight.g)),
      R('Merma', num(s.scrapPct), '%', f.pct(s.scrapPct)),
    );
    sections.push({ title: 'Lámina / troquelado', rows });
  } else if (d.sheetNote) {
    sections.push({ title: 'Lámina / troquelado', rows: [R('Nota', d.sheetNote, '', d.sheetNote)] });
  }
  const pr = d.profile;
  if (pr) {
    sections.push({
      title: 'Perfil 2D',
      rows: [
        R('Área neta', num(pr.netArea), 'mm²', f.area(pr.netArea)),
        R('Perímetro exterior', num(pr.perimeterOuter), 'mm', f.len(pr.perimeterOuter)),
        R('Perímetro interior', num(pr.perimeterInner), 'mm', f.len(pr.perimeterInner)),
        R('Contornos', String(pr.loops ?? ''), ''),
        R('Agujeros', String((pr.holes ?? []).length), ''),
      ],
    });
  }
  const t = d.topology;
  const c = t.counts;
  sections.push({
    title: 'Topología y validez',
    rows: [
      R('Sólidos', String(c.solids ?? ''), ''), R('Cascos', String(c.shells ?? ''), ''),
      R('Caras', String(c.faces ?? ''), ''), R('Aristas', String(c.edges ?? ''), ''),
      R('Vértices', String(c.vertices ?? ''), ''),
      R('Válida', t.valid ? 'Sí' : 'No', ''), R('Cerrada (estanca)', t.closed ? 'Sí' : 'No', ''),
    ],
  });
  if (d.precision) {
    const p = d.precision;
    sections.push({
      title: 'Verificación de precisión',
      rows: [
        R('Volumen del kernel', num(p.kernelVolume), 'mm³', f.vol(p.kernelVolume)),
        R('Volumen analítico', num(p.analyticVolume), 'mm³', f.vol(p.analyticVolume)),
        R('Error relativo', num(p.relErrorPct, 4), '%', `${p.relErrorPct.toExponential(3)} %`),
      ],
    });
  }
  if (d.cost) {
    const rows = [
      R('Precio por kg', num(d.cost.pricePerKg), '$/kg'),
      R('Costo de material neto', num(d.cost.netCost, 8), '$', d.cost.netCost.toFixed(2)),
    ];
    if (d.cost.blankCost != null) rows.push(R('Costo de material (desarrollo)', num(d.cost.blankCost, 8), '$', d.cost.blankCost.toFixed(2)));
    sections.push({ title: 'Costo', rows });
  }
  return sections;
}

// ---------- CSV / JSON ----------

// Celdas numéricas (o listas «x; y; z») que nunca se alteran.
const NUMERIC_CELL = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?(; [-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?)*$/i;
const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  // Inyección de fórmulas: texto que empieza con = @ + - (o tab/CR) se antepone con «'».
  if (/^[=@+\-\t\r]/.test(s) && !NUMERIC_CELL.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV `Propiedad,Valor,Unidad`; las mediciones ({title,text}) van al final. */
export function toCSV(partData, measurements = []) {
  const lines = [['Propiedad', 'Valor', 'Unidad']];
  for (const sec of buildSections(partData, makeFormatter('metric'))) {
    for (const r of sec.rows) lines.push([`${sec.title}: ${r.l}`, r.v, r.u]);
  }
  for (const m of measurements) lines.push([`Medición: ${m.title}`, m.text, '']);
  return lines.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

/** JSON legible con los datos y las mediciones. */
export function toJSON(partData, measurements = []) {
  return JSON.stringify({ ...partData, measurements }, null, 2);
}

// ---------- HTML ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const CSS = `
@page { size: auto; margin: 14mm; }
* { box-sizing: border-box; }
body { font: 13px/1.4 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1c2128; margin: 0; padding: 24px; max-width: 900px; margin-inline: auto; }
header { border-bottom: 2px solid #2d6cdf; padding-bottom: 8px; margin-bottom: 14px; }
h1 { margin: 0 0 4px; font-size: 22px; }
h2 { font-size: 15px; margin: 18px 0 6px; color: #2d6cdf; break-after: avoid; }
.meta { color: #57606a; }
.meta span { margin-right: 16px; }
img.snap { display: block; max-width: 100%; max-height: 320px; margin: 10px auto; border: 1px solid #d0d7de; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; break-inside: avoid; }
th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #e3e7eb; }
th { background: #f3f5f8; font-weight: 600; }
td.v { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.note { color: #57606a; font-size: 11px; margin-top: 4px; }
button.print { position: fixed; top: 12px; right: 12px; padding: 6px 12px; font: inherit; cursor: pointer; }
@media print { button.print { display: none; } body { padding: 0; } }
`;

/** Documento HTML autónomo e imprimible. Opciones: { fileName, imageDataURL, measurements, system, date }. */
export function reportHTML(partData, { fileName = '', imageDataURL = '', measurements = [], system = 'metric', date = new Date() } = {}) {
  const f = makeFormatter(system);
  const dateStr = date instanceof Date ? date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : String(date);
  const table = (title, rows) =>
    `<section><h2>${esc(title)}</h2><table><tbody>${rows.map((r) => `<tr><th>${esc(r.l)}</th><td class="v">${esc(r.s)}</td></tr>`).join('')}</tbody></table></section>`;

  let body = '';
  for (const sec of buildSections(partData, f)) {
    body += table(sec.title, sec.rows);
    if (sec.title === 'Lámina / troquelado' && partData.sheet) {
      body += '<p class="note">La fuerza de extracción es una estimación (≈ 10 % de la fuerza de corte). Valores de material típicos, no certificados.</p>';
    }
    if (sec.title === 'Perfil 2D') {
      const holes = partData.profile.holes ?? [];
      if (holes.length) {
        body += `<table><thead><tr><th>#</th><th>Ø</th><th>Centro (x, y)</th></tr></thead><tbody>${holes
          .map((h, i) => `<tr><td>${i + 1}</td><td>${esc(f.len(h.d))}</td><td>${esc(f.point(h.c))}</td></tr>`)
          .join('')}</tbody></table>`;
      }
    }
  }
  body += `<section><h2>Mediciones</h2>${
    measurements.length
      ? `<table><tbody>${measurements.map((m) => `<tr><th>${esc(m.title)}</th><td>${esc(m.text)}</td></tr>`).join('')}</tbody></table>`
      : '<p class="note">Sin mediciones.</p>'
  }</section>`;

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Reporte de pieza${fileName ? ' - ' + esc(fileName) : ''}</title>
<style>${CSS}</style></head><body>
<button class="print" onclick="window.print()">Imprimir</button>
<header><h1>Reporte de pieza</h1>
<div class="meta"><span><b>Archivo:</b> ${esc(fileName)}</span><span><b>Fecha:</b> ${esc(dateStr)}</span><span><b>Material:</b> ${esc(partData.material.name)}</span></div></header>
${imageDataURL ? `<img class="snap" alt="Vista 3D de la pieza" src="${esc(imageDataURL)}">` : ''}
${body}
</body></html>`;
}
