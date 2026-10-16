// Render de los paneles (paso 1, regiones y propiedades) a partir del estado de la app.
// Sin estado propio: recibe datos y el formateador activo (makeFormatter).
import * as ui from './ui-shell.js';
import { aciToCss } from '../ui/view2d.js';

const $ = ui.$;
const esc = ui.escapeHtml;
const MM_PER_IN = 25.4;
export const REGION_COLORS = ['#4c8dff', '#3fb950', '#d29922', '#a371f7', '#f778ba', '#39c5cf', '#f0883e', '#8b949e'];
const MODE_NAMES = { extrude: 'Extrusión', revolve: 'Revolución', multiview: 'Multivista' };
const FORMAT_NAMES = { dxf: 'DXF', svg: 'SVG', image: 'Imagen' };

/** Separa "12.345 mm" en ["12.345", "mm"]. */
export function splitUnit(s) {
  const i = String(s).lastIndexOf(' ');
  return i < 0 ? [String(s), ''] : [s.slice(0, i), s.slice(i + 1)];
}
const num = (F, mm) => splitUnit(F.len(mm))[0];
const lenUnit = (F) => (F.system === 'imperial' ? 'in' : 'mm');
const group = (v, d) => v.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });

function kpi(id, text, sub) {
  const [v, u] = splitUnit(text);
  $(id).innerHTML = `${esc(v)}<span class="unit">${esc(u)}</span>`;
  $(`${id}Sub`).textContent = sub;
}

// ───────────── Paso 1 ─────────────

/** Ficha del plano, capas y sección de imagen. */
export function renderPlano(drawing, profile, { hiddenLayers, theme }) {
  const st = profile.stats;
  const fmtName = FORMAT_NAMES[drawing.format] || drawing.format;
  $('stepPlanoSummary').textContent = `${fmtName} · ${drawing.segments.length} entidades`;
  $('infoFormat').textContent = fmtName;
  const u = drawing.units;
  $('infoUnits').textContent = drawing.format === 'image' ? 'px (escala manual)' : `${u.name}${u.detected ? '' : ' (supuesto)'}`;
  $('infoScale').textContent = `× ${+profile.toMM.toPrecision(6)} mm`;
  $('infoEntities').textContent = String(drawing.segments.length);
  $('infoClosed').textContent = String(st.loops);
  $('infoRegions').textContent = `${st.regions} · ${st.holes} agujeros`;
  $('infoOpen').textContent = String(st.openChains);
  $('infoOpenRow').hidden = !st.openChains;
  $('infoOpenRow').classList.toggle('is-warn', st.openChains > 0);
  $('imageSection').hidden = drawing.format !== 'image';
  $('selDrawingUnits').disabled = drawing.format === 'image';

  const counts = new Map();
  for (const s of drawing.segments) {
    const n = s.meta?.layer ?? '0';
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  const layers = (drawing.layers || []).map((l) => l.name);
  for (const n of counts.keys()) if (!layers.includes(n)) layers.push(n);
  const info = new Map((drawing.layers || []).map((l) => [l.name, l]));
  const items = layers
    .filter((n) => counts.get(n) || info.get(n)?.color != null)
    .map((name) => {
      const c = info.get(name)?.color;
      return { name, color: c != null ? aciToCss(c, theme) : '#9aa4b0', count: counts.get(name) || 0, visible: !hiddenLayers.has(name) && !info.get(name)?.frozen && !info.get(name)?.off };
    });
  ui.renderList($('layerList'), items, ui.layerItem);
  $('layerCount').textContent = String(items.length);
}

// ───────────── Paso 2: regiones ─────────────

/** Lista de regiones con altura/Z0 y agujeros (valores de campos en mm). */
export function renderRegions(profile, op, F, { selected = -1, open = new Set() } = {}) {
  const fx = (v) => (v == null ? '' : String(+v.toFixed(3)));
  const items = profile.regions.map((r, i) => {
    const rs = op.regions[i];
    const info = profile.loopInfos[r.outer];
    const n = r.holes.length;
    return {
      index: i,
      color: REGION_COLORS[i % REGION_COLORS.length],
      included: rs.included,
      selected: i === selected,
      open: open.has(i),
      meta: `${n ? `${n} agujero${n > 1 ? 's' : ''}` : 'sin agujeros'} · ${F.area(info.area)}`,
      height: fx(rs.height),
      z0: fx(rs.z0),
      holes: r.holes.map((li, k) => {
        const hi = profile.loopInfos[li];
        const hs = rs.holes[k];
        return {
          label: hi.circle ? `Ø ${F.len(2 * hi.circle.r)}` : '',
          free: !hi.circle,
          op: hs.op === 'none' ? 'fill' : hs.op,
          depth: fx(hs.depth),
        };
      }),
    };
  });
  ui.renderList($('regionList'), items, ui.regionItem);
  for (const inp of $('regionList').querySelectorAll('input[data-field]')) inp.placeholder = inp.dataset.field === 'z0' ? '0' : 'auto';
  $('regionCount').textContent = String(items.length);
}

/** Estado de las ranuras de multivista. */
export function renderSlots(op, F) {
  const ids = { top: 'slotTop', front: 'slotFront', right: 'slotRight', left: 'slotLeft' };
  for (const [role, id] of Object.entries(ids)) {
    const w = op.multiview?.windows?.[role];
    const st = $(id).querySelector('.slot-status');
    st.dataset.state = w ? 'set' : 'empty';
    st.textContent = w ? `${num(F, Math.abs(w.maxX - w.minX))} × ${num(F, Math.abs(w.maxY - w.minY))} ${lenUnit(F)}` : 'sin definir';
  }
}

/** Texto del eje de revolución: punto (en las unidades activas) y dirección unitaria. */
export function axisText(rv, F) {
  const d = (v) => String(+(+v).toFixed(4) || 0);
  const pt = (p) => `(${num(F, p[0])}, ${num(F, p[1])}) ${lenUnit(F)}`;
  if (rv.axisKind === 'x') return `Eje X · por ${pt([0, 0])} · dir (1, 0)`;
  if (rv.axisKind === 'y') return `Eje Y · por ${pt([0, 0])} · dir (0, 1)`;
  return `Línea · por ${pt(rv.axis.p)} · dir (${d(rv.axis.d[0])}, ${d(rv.axis.d[1])})`;
}

// ───────────── Panel derecho ─────────────

/** Rellena todos los datos de la pieza. */
export function renderProps(pd, F, { thickness } = {}) {
  ui.setPropsVisible(true);
  const imp = F.system === 'imperial';
  const sub = (...xs) => xs.join(' · ');
  $('propsSubtitle').textContent = sub(MODE_NAMES[pd.mode] || pd.mode, pd.material.name, ...(pd.mode === 'extrude' && thickness ? [F.len(thickness)] : []));

  const m = pd.mass;
  kpi('kpiMass', F.mass(m.g), imp ? sub(`${group(m.g, 2)} g`, `${m.kg.toFixed(4)} kg`) : sub(`${m.lb.toFixed(4)} lb`, `${m.kg.toFixed(4)} kg`));
  const v = pd.volume;
  kpi('kpiVolume', F.vol(v.mm3), imp ? sub(`${group(v.mm3, 1)} mm³`, `${v.cm3.toFixed(3)} cm³`) : sub(`${group(v.mm3, 0)} mm³`, `${v.in3.toFixed(3)} in³`));
  const a = pd.area;
  kpi('kpiArea', F.area(a.mm2), imp ? sub(`${group(a.mm2, 1)} mm²`, `${a.cm2.toFixed(2)} cm²`) : sub(`${group(a.mm2, 1)} mm²`, `${a.in2.toFixed(3)} in²`));
  const sz = pd.bbox.size;
  const short = (x) => String(+(imp ? x / MM_PER_IN : x).toFixed(imp ? 3 : 2));
  kpi('kpiDims', `${sz.map(short).join(' × ')} ${lenUnit(F)}`,
    imp ? sz.map((x) => x.toFixed(2)).join(' × ') + ' mm' : sz.map((x) => (x / MM_PER_IN).toFixed(3)).join(' × ') + ' in');
  $('kpiDims').classList.add('kpi-value-sm');
  $('viewInfo').textContent = `${sz.map((x) => num(F, x)).join(' × ')} ${lenUnit(F)}`;

  const mat = pd.material;
  const mpa = (x) => (x != null ? { value: String(x), unit: 'MPa' } : { value: '—' });
  ui.renderKV($('propMaterial'), [
    { label: 'Material', value: mat.name },
    { label: 'Densidad', value: F.density(pd.density.gcm3) },
    { label: 'Resistencia a tracción', ...mpa(mat.uts) },
    { label: 'Límite elástico', ...mpa(mat.yieldStrength) },
    { label: 'Resistencia al corte', ...mpa(mat.shear), hint: 'Usada para la fuerza de corte' },
    mat.E != null && { label: 'Módulo de Young', value: String(mat.E), unit: 'GPa' },
  ]);

  const b = pd.bbox;
  const pts = (p) => F.point(p.map((x) => (Math.abs(x) < 5e-7 ? 0 : x))).replace(/^\(|\)/g, '');
  ui.renderKV($('propBBox'), [
    { label: 'Mín (x, y, z)', value: pts(b.min) },
    { label: 'Máx (x, y, z)', value: pts(b.max) },
    { label: 'Tamaño', value: `${sz.map(short).join(' × ')}`, unit: lenUnit(F) },
    { label: 'Diagonal', value: F.len(b.diagonal) },
  ]);
  const c = pd.centroid.centroid;
  ui.renderKV($('propCOM'), ['X', 'Y', 'Z'].map((l, i) => ({ label: l, value: F.len(Math.abs(c[i]) < 5e-7 ? 0 : c[i]) })));

  // Inercia: tensor en el centro de masa (productos con signo de tensor: −P).
  const I = pd.inertia;
  const iu = splitUnit(F.inertia(1))[1];
  const iv = (x) => splitUnit(F.inertia(x))[0];
  $('inertiaUnit').textContent = iu;
  const T = [[I.Ixx, -I.Pxy, -I.Pxz], [-I.Pxy, I.Iyy, -I.Pyz], [-I.Pxz, -I.Pyz, I.Izz]];
  const tiny = 1e-9 * Math.max(Math.abs(I.Ixx), Math.abs(I.Iyy), Math.abs(I.Izz));
  $('inertiaTensor').innerHTML = '<thead><tr><th></th><th>X</th><th>Y</th><th>Z</th></tr></thead><tbody>' +
    T.map((row, r) => `<tr><th>${'XYZ'[r]}</th>${row.map((x, k) => `<td class="${r === k ? 'diag' : 'off'}">${esc(iv(Math.abs(x) < tiny ? 0 : x))}</td>`).join('')}</tr>`).join('') + '</tbody>';
  const g = pd.gyration;
  ui.renderKV($('propInertia'), [
    { section: 'Momentos principales' },
    ...pd.principal.moments.map((x, i) => ({ label: `I${'₁₂₃'[i]}`, value: F.inertia(x) })),
    { section: 'Radios de giro' },
    { label: 'kx', value: F.len(g.x) },
    { label: 'ky', value: F.len(g.y) },
    { label: 'kz', value: F.len(g.z) },
  ]);

  // Lámina / troquelado (solo extrusión)
  const sh = pd.sheet;
  $('propSheet').closest('.prop-section').hidden = !sh;
  if (sh) {
    const util = sh.utilization;
    ui.renderKV($('propSheet'), [
      { label: 'Espesor', value: F.len(sh.thickness) },
      { label: 'Blank', value: `${num(F, sh.blankWidth)} × ${num(F, sh.blankHeight)}`, unit: lenUnit(F) },
      { label: 'Área del blank', value: F.area(sh.blankArea) },
      { label: 'Área neta', value: F.area(sh.netArea) },
      { label: 'Aprovechamiento', value: F.pct(util), bar: util / 100, barCls: util >= 70 ? 'is-good' : util >= 45 ? '' : 'is-warn' },
      { label: 'Longitud de corte', value: F.len(sh.cutLength) },
      { label: 'Agujeros', value: String(sh.holes) },
      sh.minHoleDiameter != null && { label: 'Agujero mínimo', value: `Ø ${F.len(sh.minHoleDiameter)}`, cls: sh.minHoleDiameter < sh.thickness ? 'is-warn' : '', hint: 'Recomendado ≥ espesor' },
      { label: 'Fuerza de corte', value: sh.cuttingForce ? `${F.force(sh.cuttingForce.N)} · ${sh.cuttingForce.tonf.toFixed(2)} tonf` : '— (sin τ del material)', hint: 'L × t × τ' },
      sh.strippingForce && { label: 'Fuerza de extracción', value: F.force(sh.strippingForce.N), hint: 'Estimación: 10 % de la de corte' },
      { label: 'Peso bruto', value: F.mass(sh.grossWeight.g) },
      { label: 'Peso neto', value: F.mass(sh.netWeight.g) },
      { label: 'Desperdicio', value: `${F.mass(sh.scrapWeight.g)} · ${F.pct(sh.scrapPct)}`, cls: sh.scrapPct > 50 ? 'is-warn' : '' },
    ]);
  }

  // Perfil 2D
  const pr = pd.profile;
  $('propProfile').closest('.prop-section').hidden = !pr;
  if (pr) {
    ui.renderKV($('propProfile'), [
      { label: 'Área neta', value: F.area(pr.netArea) },
      { label: 'Perímetro exterior', value: F.len(pr.perimeterOuter) },
      { label: 'Perímetro de agujeros', value: F.len(pr.perimeterInner) },
      { label: 'Contornos', value: String(pr.loops) },
      { label: 'Agujeros', value: String(pr.holes.length) },
    ]);
    const u = lenUnit(F);
    $('holesTable').innerHTML = pr.holes.length
      ? `<thead><tr><th>#</th><th>Ø (${u})</th><th>Centro X</th><th>Centro Y</th><th>Tipo</th></tr></thead><tbody>` +
        pr.holes.map((h, i) => `<tr><td>${i + 1}</td><td>${h.d != null ? esc(num(F, h.d)) : 'libre'}</td><td>${esc(num(F, h.c[0]))}</td><td>${esc(num(F, h.c[1]))}</td><td>${h.op === 'blind' ? 'ciego' : 'pasante'}</td></tr>`).join('') + '</tbody>'
      : '';
  }

  // Topología
  const t = pd.topology, cn = t.counts || {};
  const badge = (ok, yes, no) => `<span class="badge ${ok ? 'badge-success' : 'badge-danger'}">${ok ? '✓' : '✗'} ${ok ? yes : no}</span>`;
  $('topoBadges').innerHTML = badge(t.valid, 'Sólido válido', 'Sólido no válido') + badge(t.closed, 'Cerrado (estanco)', 'Abierto') +
    `<span class="badge">${cn.solids ?? 1} sólido${(cn.solids ?? 1) === 1 ? '' : 's'}</span>`;
  ui.renderKV($('propTopology'), [
    { label: 'Caras · aristas · vértices', value: `${cn.faces ?? '—'} · ${cn.edges ?? '—'} · ${cn.vertices ?? '—'}` },
    cn.shells != null && { label: 'Cascarones', value: String(cn.shells) },
  ]);

  // Precisión
  const p = pd.precision;
  $('propAccuracy').closest('.prop-section').hidden = false;
  if (p) {
    const exact = p.relError < 1e-9;
    const cls = exact || p.relError < 1e-6 ? 'badge-success' : p.relError < 1e-3 ? 'badge-warning' : 'badge-danger';
    $('accuracyBadge').innerHTML = `<span class="badge ${cls}">${exact ? '✓ Volumen exacto' : `Error relativo ${p.relError.toExponential(2)}`}</span>`;
    ui.renderKV($('propAccuracy'), [
      { label: 'Volumen B-rep', value: F.vol(p.kernelVolume) },
      { label: 'Volumen analítico 2D', value: F.vol(p.analyticVolume) },
      { label: 'Error absoluto', value: `${p.absError.toExponential(3)} mm³` },
      { label: 'Error relativo', value: exact ? `${p.relError.toExponential(2)} (exacto)` : p.relError.toExponential(3) },
    ]);
  } else {
    $('accuracyBadge').innerHTML = '<span class="badge">Sin referencia analítica</span>';
    ui.renderKV($('propAccuracy'), [{ label: 'Volumen B-rep', value: F.vol(pd.volume.mm3), hint: 'Redondeos, multivista o revolución a ambos lados del eje' }]);
  }

  // Costo
  const co = pd.cost;
  $('propCost').closest('.prop-section').hidden = !co;
  if (co) {
    ui.renderKV($('propCost'), [
      { label: 'Precio material', value: co.pricePerKg.toFixed(2), unit: '$/kg' },
      { label: 'Costo neto', value: co.netCost.toFixed(3), unit: '$' },
      co.blankCost != null && { label: 'Costo con blank', value: co.blankCost.toFixed(3), unit: '$', cls: 'is-strong' },
    ]);
  }
}
