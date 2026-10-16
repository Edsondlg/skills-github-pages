// Contenido de demostración del armazón (temporal): soporte 150 × 80 × 2 mm de acero.
// Sin visores reales: las vistas dibujan una rejilla neutra en un lienzo.
import { materialGroups } from '../ui/materials.js';
import * as ui from './ui-shell.js';

const $ = ui.$;

function drawPlaceholder(mount, kind) {
  const canvas = document.createElement('canvas');
  mount.appendChild(canvas);
  const draw = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const light = ui.getTheme() === 'light';
    const minor = light ? 'rgba(80,95,115,0.10)' : 'rgba(200,215,235,0.06)';
    const major = light ? 'rgba(80,95,115,0.22)' : 'rgba(200,215,235,0.13)';
    const step = 20;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);
    for (let x = cx % step; x < w; x += step) {
      g.strokeStyle = (x - cx) % (step * 5) === 0 ? major : minor;
      g.beginPath();
      g.moveTo(x + 0.5, 0);
      g.lineTo(x + 0.5, h);
      g.stroke();
    }
    for (let y = cy % step; y < h; y += step) {
      g.strokeStyle = (y - cy) % (step * 5) === 0 ? major : minor;
      g.beginPath();
      g.moveTo(0, y + 0.5);
      g.lineTo(w, y + 0.5);
      g.stroke();
    }
    if (kind === '2d') {
      // Contorno del soporte (escala 2.4 px/mm) con agujeros.
      const s = Math.min(2.4, (w - 80) / 160);
      const ox = cx - 75 * s;
      const oy = cy + 40 * s;
      const P = (x, y) => [ox + x * s, oy - y * s];
      g.lineWidth = 1.6;
      g.strokeStyle = light ? '#1f2328' : '#d7e0ea';
      g.fillStyle = light ? 'rgba(37,99,217,0.08)' : 'rgba(76,141,255,0.10)';
      g.beginPath();
      const pts = [[0, 0], [150, 0], [150, 80], [100, 80], [100, 45], [50, 45], [50, 80], [0, 80]];
      pts.forEach(([x, y], i) => (i ? g.lineTo(...P(x, y)) : g.moveTo(...P(x, y))));
      g.closePath();
      g.fill();
      g.stroke();
      for (const [x, y, r] of [[15, 15, 4.25], [135, 15, 4.25], [15, 65, 4.25], [135, 65, 4.25]]) {
        g.beginPath();
        g.arc(...P(x, y), r * s, 0, Math.PI * 2);
        g.stroke();
      }
      g.setLineDash([10, 4, 2, 4]);
      g.strokeStyle = light ? '#cf222e' : '#f85149';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(...P(-8, 22.5));
      g.lineTo(...P(158, 22.5));
      g.stroke();
      g.setLineDash([]);
    }
  };
  new ResizeObserver(draw).observe(mount);
  ui.onTheme(draw);
}

export function runShellDemo() {
  ui.setStatus({ text: 'Motor CAD listo', state: 'ready', mode: 'Motor: OpenCascade 7.8 · worker' });
  ui.setFile({ name: 'soporte-lateral-150x80.dxf', format: 'dxf' });
  ui.setExamples([
    { value: 'bracket', label: 'Soporte con 4 agujeros', desc: 'DXF · 150 × 80 mm', icon: 'drawing' },
    { value: 'flange', label: 'Brida circular', desc: 'DXF · Ø 120 mm, 6 agujeros', icon: 'drawing' },
    { value: 'shaft', label: 'Eje escalonado (revolución)', desc: 'SVG · perfil', icon: 'revolve' },
    { value: 'block', label: 'Bloque en tres vistas', desc: 'DXF · multivista', icon: 'multiview' },
    { value: 'logo', label: 'Logotipo desde imagen', desc: 'PNG · umbral automático', icon: 'image' },
  ]);

  // Paso 1
  ui.setPlanoLoaded(true);
  $('stepPlanoSummary').textContent = 'DXF · 37 entidades';
  $('infoFormat').textContent = 'DXF R2013';
  $('infoUnits').textContent = 'mm (INSUNITS 4)';
  $('infoScale').textContent = '× 1.000';
  $('infoEntities').textContent = '37';
  $('infoClosed').textContent = '6';
  $('infoRegions').textContent = '2';
  $('infoOpen').textContent = '1';
  $('infoOpenRow').classList.add('is-warn');
  const layers = [
    { name: '0', color: '#e6edf3', count: 2 },
    { name: 'CONTORNO', color: '#4c8dff', count: 12 },
    { name: 'AGUJEROS', color: '#3fb950', count: 8 },
    { name: 'EJES', color: '#f85149', count: 6, visible: false },
    { name: 'COTAS', color: '#d29922', count: 7, visible: false },
    { name: 'CAJETIN_PLANO_A4', color: '#a371f7', count: 2, visible: false },
  ];
  ui.renderList($('layerList'), layers, ui.layerItem);
  $('layerCount').textContent = String(layers.length);
  ui.numberField($('inpJoinTol'), { min: 0, step: 0.001, decimals: 3 });

  // Paso 2
  const thick = ui.numberField($('inpThickness'), { min: 0.01, step: 0.1, decimals: 3 });
  $('selGauge').value = '';
  $('thicknessChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-value]');
    if (b) thick.set(Number(b.dataset.value));
  });
  $('thicknessChips').querySelector('[data-value="2"]').setAttribute('aria-pressed', 'true');
  const regions = [
    {
      index: 0, color: '#4c8dff', open: true, selected: true, meta: '4 agujeros · 11 234.5 mm²', height: '2.000', z0: '0.000',
      holes: [
        { label: 'Ø 8.500', op: 'through' },
        { label: 'Ø 8.500', op: 'through' },
        { label: 'Ø 8.500', op: 'blind', depth: '1.000' },
        { free: true, op: 'fill' },
      ],
    },
    { index: 1, color: '#3fb950', meta: '1 agujero · 812.0 mm²', height: '2.000', z0: '0.000', holes: [{ label: 'Ø 12.000' }] },
    { index: 2, color: '#d29922', included: false, meta: 'sin agujeros · 96.4 mm²', height: '2.000', z0: '0.000' },
  ];
  ui.renderList($('regionList'), regions, ui.regionItem);
  $('regionCount').textContent = String(regions.length);
  for (const id of ['inpFilletVertical', 'inpFilletTop', 'inpChamferTop']) ui.numberField($(id), { min: 0, step: 0.1, decimals: 2 });
  $('slotTop').querySelector('.slot-status').dataset.state = 'set';
  $('slotTop').querySelector('.slot-status').textContent = '150.0 × 80.0 mm';
  $('slotFront').querySelector('.slot-status').dataset.state = 'set';
  $('slotFront').querySelector('.slot-status').textContent = '150.0 × 2.0 mm';

  // Paso 3
  const sel = $('selMaterial');
  sel.innerHTML = materialGroups()
    .map((g) => `<optgroup label="${ui.escapeHtml(g.group)}">${g.items.map((m) => `<option value="${m.id}">${ui.escapeHtml(m.name)}</option>`).join('')}</optgroup>`)
    .join('');
  sel.value = 'acero-1008';
  $('densityReadout').innerHTML = '7.870 <span class="unit">g/cm³</span>';
  $('stepMaterialSummary').textContent = 'Acero 1008 · 7.87 g/cm³';
  ui.numberField($('inpPrice'), { min: 0, step: 0.01 });
  ui.numberField($('inpBlankMargin'), { min: 0, step: 0.5, decimals: 1 });

  // Vistas
  drawPlaceholder($('view2d'), '2d');
  drawPlaceholder($('view3d'), '3d');
  ui.setEmpty('2d', false);
  ui.setEmpty('3d', false);
  ui.setPressed($('toolPalette'), 'tool', 'distance');
  ui.bindPressGroup($('toolPalette'), { attr: 'tool', mode: 'optional' }, (t) => ui.setHint(t ? `Herramienta: ${t}` : '', '3d'));
  ui.bindPressGroup($('displayBar'), { attr: 'display', mode: 'multi' });
  ui.bindPressGroup($('toolbar2d'), { attr: 'mode2d', mode: 'single' });
  ui.setHint('Distancia mínima: elige la primera entidad (cara, arista o vértice) · Esc para cancelar', '3d');
  ui.setHint('Clic en una región para incluirla o excluirla · rueda para zoom', '2d');
  $('sectionValue').textContent = '75.000 mm';
  $('viewInfo').textContent = '150.000 × 80.000 × 2.000 mm';

  // Propiedades
  ui.setPropsVisible(true);
  $('propsSubtitle').textContent = 'Extrusión · Acero bajo carbono 1008/1010 · 2.000 mm';
  $('kpiMass').innerHTML = '172.4<span class="unit">g</span>';
  $('kpiMassSub').textContent = '0.380 lb · 0.1724 kg';
  $('kpiVolume').innerHTML = '21 906<span class="unit">mm³</span>';
  $('kpiVolumeSub').textContent = '21.906 cm³ · 1.337 in³';
  $('kpiArea').innerHTML = '23 588<span class="unit">mm²</span>';
  $('kpiAreaSub').textContent = '235.88 cm² · 36.56 in²';
  $('kpiDims').innerHTML = '150 × 80 × 2<span class="unit">mm</span>';
  $('kpiDims').classList.add('kpi-value-sm');
  $('kpiDimsSub').textContent = '5.906 × 3.150 × 0.079 in';
  ui.renderKV($('propMaterial'), [
    { label: 'Material', value: 'Acero 1008/1010 (CRS)' },
    { label: 'Densidad', value: '7.870', unit: 'g/cm³' },
    { label: 'Resistencia a tracción', value: '330', unit: 'MPa' },
    { label: 'Resistencia al corte', value: '250', unit: 'MPa', hint: 'Usada para la fuerza de corte' },
  ]);
  ui.renderKV($('propBBox'), [
    { label: 'Mín (x, y, z)', value: '0.000, 0.000, 0.000', unit: 'mm' },
    { label: 'Máx (x, y, z)', value: '150.000, 80.000, 2.000', unit: 'mm' },
    { label: 'Tamaño', value: '150.000 × 80.000 × 2.000', unit: 'mm' },
    { label: 'Diagonal', value: '170.012', unit: 'mm' },
  ]);
  ui.renderKV($('propCOM'), [
    { label: 'X', value: '75.000', unit: 'mm' },
    { label: 'Y', value: '36.842', unit: 'mm' },
    { label: 'Z', value: '1.000', unit: 'mm' },
  ]);
  $('inertiaTensor').innerHTML =
    '<thead><tr><th></th><th>X</th><th>Y</th><th>Z</th></tr></thead><tbody>' +
    '<tr><th>X</th><td class="diag">88 412</td><td class="off">0</td><td class="off">0</td></tr>' +
    '<tr><th>Y</th><td class="off">0</td><td class="diag">310 127</td><td class="off">−12</td></tr>' +
    '<tr><th>Z</th><td class="off">0</td><td class="off">−12</td><td class="diag">398 424</td></tr></tbody>';
  ui.renderKV($('propInertia'), [
    { section: 'Momentos principales' },
    { label: 'I₁', value: '88 412', unit: 'g·mm²' },
    { label: 'I₂', value: '310 127', unit: 'g·mm²' },
    { label: 'I₃', value: '398 424', unit: 'g·mm²' },
    { section: 'Radios de giro' },
    { label: 'kx · ky · kz', value: '22.65 · 42.41 · 48.07', unit: 'mm' },
  ]);
  ui.renderKV($('propSheet'), [
    { label: 'Blank (con margen 5 mm)', value: '160.0 × 90.0', unit: 'mm' },
    { label: 'Aprovechamiento', value: '76.1', unit: '%', bar: 0.761, barCls: 'is-good' },
    { label: 'Longitud de corte', value: '713.4', unit: 'mm' },
    { label: 'Fuerza de corte', value: '356.7 kN · 36.4', unit: 'ton', hint: 'L × t × τ' },
    { label: 'Peso bruto', value: '226.5', unit: 'g' },
    { label: 'Peso neto', value: '172.4', unit: 'g' },
    { label: 'Desperdicio', value: '54.1', unit: 'g', cls: 'is-warn' },
  ]);
  ui.renderKV($('propProfile'), [
    { label: 'Área neta', value: '10 953.2', unit: 'mm²' },
    { label: 'Perímetro exterior', value: '606.6', unit: 'mm' },
    { label: 'Perímetro de agujeros', value: '106.8', unit: 'mm' },
    { label: 'Agujeros', value: '4' },
  ]);
  $('holesTable').innerHTML =
    '<thead><tr><th>#</th><th>Ø (mm)</th><th>Centro X</th><th>Centro Y</th></tr></thead><tbody>' +
    [[15, 15], [135, 15], [15, 65], [135, 65]].map(([x, y], i) => `<tr><td>${i + 1}</td><td>8.500</td><td>${x.toFixed(3)}</td><td>${y.toFixed(3)}</td></tr>`).join('') +
    '</tbody>';
  $('topoBadges').innerHTML = '<span class="badge badge-success">✓ Sólido válido</span><span class="badge badge-success">✓ Cerrado (estanco)</span><span class="badge">1 sólido</span>';
  ui.renderKV($('propTopology'), [
    { label: 'Caras · aristas · vértices', value: '18 · 48 · 32' },
    { label: 'Tipos de cara', value: '10 plano · 8 cilindro' },
  ]);
  $('accuracyBadge').innerHTML = '<span class="badge badge-success">✓ Error relativo 2.1 × 10⁻⁷</span>';
  ui.renderKV($('propAccuracy'), [
    { label: 'Volumen B-rep', value: '21 906.000', unit: 'mm³' },
    { label: 'Área × espesor', value: '21 906.005', unit: 'mm³' },
  ]);
  ui.renderKV($('propCost'), [
    { label: 'Precio material', value: '1.20', unit: '$/kg' },
    { label: 'Costo neto', value: '0.207', unit: '$' },
    { label: 'Costo con blank', value: '0.272', unit: '$', cls: 'is-strong' },
  ]);

  const measures = [
    { id: 'm1', tool: 'distance', title: 'Distancia mínima · arista ↔ arista', text: '150.000 mm' },
    { id: 'm2', tool: 'radius', title: 'Radio · agujero', text: 'R 4.250 · Ø 8.500 mm' },
    { id: 'm3', tool: 'angle', title: 'Ángulo entre caras', text: '90.000°' },
    { id: 'm4', tool: 'thickness', title: 'Espesor en punto', text: '2.000 mm' },
  ];
  ui.renderList($('measureList'), measures, ui.measureItem);
  $('measureCount').textContent = String(measures.length);

  ui.setCoords('X 112.500  Y 40.250  Z 2.000 mm');
  ui.setBuildInfo('Generado en 184 ms');
  ui.setWarnings([
    { text: 'Capa CONTORNO: 1 cadena abierta (hueco de 0.04 mm en (100.000, 45.000)); aumenta la tolerancia de unión.' },
    { text: 'Se ignoraron 7 entidades de texto/cotas (capa COTAS).', level: 'info' },
  ]);
}
