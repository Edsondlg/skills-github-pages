// Paso 1: patrones de referencia (tapete, calcomanías, moteado) y verificación de escala.
import { h, add, clear, card, field, numInput, selectInput, checkbox, kvTable, fmt, download, toast } from './dom.js';
import { PAPER_SIZES, boardPrimitives, primitivesToSVG, stickerSheet, speckleSheet, parseBoardCode, PART_ID_START } from '../core/board.js';
import { makePDF } from '../core/pdf.js';

export function renderPatterns(app) {
  const P = app.panel;
  const b = app.project.board;
  const s = app.settings.board;
  const st = app.settings.stickers || (app.settings.stickers = { size: 12, count: 30 });
  const sp = app.settings.speckle || (app.settings.speckle = { dot: 0.8, density: 0.35 });
  const paperKey = Object.entries(PAPER_SIZES).find(([, [w, hh]]) => Math.abs(w - s.paperW) < 0.01 && Math.abs(hh - s.paperH) < 0.01)?.[0] || 'custom';
  const setB = (o) => { try { app.setBoard(o); app.refresh(); } catch (e) { toast(e.message, 'bad'); } };

  add(P, 
    h('div', {}, h('h2', {}, '1 · Patrones de referencia'), h('p', { class: 'lead' }, 'Imprima el tapete con marcadores ArUco: da la escala métrica, la calibración de la cámara y la posición de cada foto. Agregue moteado o calcomanías a la pieza para darle textura.')),
    card('Tapete de calibración',
      field('Tamaño de papel', selectInput([...Object.keys(PAPER_SIZES).map(k => [k, `${k} (${PAPER_SIZES[k][0]} × ${PAPER_SIZES[k][1]} mm)`]), ['custom', 'Personalizado']], paperKey, (v) => {
        if (v === 'custom') { app.settings.board.paper = 'custom'; app.refresh(); return; }
        const [w, hh] = PAPER_SIZES[v];
        setB({ paper: v, paperW: w, paperH: hh });
      })),
      paperKey === 'custom' ? field('Ancho × alto (mm)', h('div', { class: 'row' }, numInput(s.paperW, { min: 150, max: 2000, onChange: (v) => setB({ paperW: v }) }), numInput(s.paperH, { min: 150, max: 2000, onChange: (v) => setB({ paperH: v }) }))) : null,
      field('Lado del marcador (mm)', numInput(s.markerSize, { min: 10, max: 120, step: 1, onChange: (v) => setB({ markerSize: v, gap: Math.round(v * 0.25 * 10) / 10 }) })),
      field('Separación (mm)', numInput(s.gap, { min: 2, max: 60, step: 0.5, onChange: (v) => setB({ gap: v }) })),
      field('Anillos de marcadores', selectInput([[1, '1 anillo (más zona libre)'], [2, '2 anillos (más puntos)']], s.rings, (v) => setB({ rings: +v }))),
      field('Margen de impresión (mm)', numInput(s.margin, { min: 0, max: 30, step: 0.5, onChange: (v) => setB({ margin: v }) })),
      checkbox('Moteado aleatorio en la zona libre (recomendado)', s.speckle, (v) => setB({ speckle: v })),
      s.speckle ? field('Punto de moteado (mm)', numInput(s.speckleDot, { min: 0.3, max: 5, step: 0.1, onChange: (v) => setB({ speckleDot: v }) }), { hint: '≈ 3–5 píxeles en sus fotos' }) : null,
      s.speckle ? field('Densidad de moteado (%)', numInput(Math.round(s.speckleDensity * 100), { min: 10, max: 60, step: 1, onChange: (v) => setB({ speckleDensity: v / 100 }) })) : null,
      kvTable([
        ['Marcadores', `${b.markers.length} (IDs 0–${b.markers.length - 1}) · ${b.checkIds.length} de control`],
        ['Zona libre para la pieza', `${fmt(b.free.x1 - b.free.x0, 1)} × ${fmt(b.free.y1 - b.free.y0, 1)} mm`],
        ['Diccionario', 'ArUco DICT_5X5_250'],
        ['Código del tapete', h('span', { class: 'mono' }, b.code)],
      ]),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => downloadBoardPDF(app) }, 'Descargar PDF (tamaño real)'),
        h('button', { class: 'btn', onclick: () => download(new Blob([primitivesToSVG(boardPrimitives(b), b.paperW, b.paperH, b.speckleColor)], { type: 'image/svg+xml' }), `tapete_${b.code}.svg`) }, 'SVG'),
        h('button', { class: 'btn ghost', onclick: () => { app.state.sheet = 'board'; showSheet(app); } }, 'Ver'),
      ),
      h('p', { class: 'hint' }, 'Imprima con «Tamaño real / 100 %» (sin «Ajustar a la página»). Para A2 o mayor, use un centro de impresión y monte sobre una placa rígida.'),
    ),
    card('Verificación de escala de la impresión',
      h('p', { class: 'hint' }, 'Mida con un calibrador o regla de acero las barras impresas en la zona libre (de la primera a la última marca) y escriba el valor real. Corrige errores de escala de la impresora.'),
      field(`Barra X medida (nominal ${fmt(b.scaleBars[0].length, 1)} mm)`, numInput(+(b.scaleBars[0].length * (s.scaleX || 1)).toFixed(2), { min: 10, step: 0.05, onChange: (v) => setB({ scaleX: v / b.scaleBars[0].length }) })),
      field(`Barra Y medida (nominal ${fmt(b.scaleBars[1].length, 1)} mm)`, numInput(+(b.scaleBars[1].length * (s.scaleY || 1)).toFixed(2), { min: 10, step: 0.05, onChange: (v) => setB({ scaleY: v / b.scaleBars[1].length }) })),
      kvTable([['Factor de escala X', fmt(s.scaleX || 1, 5)], ['Factor de escala Y', fmt(s.scaleY || 1, 5)]]),
      h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => setB({ scaleX: 1, scaleY: 1 }) }, 'Restablecer a 1.0')),
    ),
    card('Calcomanías de control para la pieza',
      h('p', { class: 'hint' }, `Marcadores IDs ${PART_ID_START}–249 para pegar sobre la pieza (papel adhesivo mate). Se triangulan como puntos de referencia de alta precisión.`),
      field('Lado (mm)', numInput(st.size, { min: 5, max: 40, step: 0.5, onChange: (v) => { st.size = v; app.refresh(); } })),
      field('Cantidad', numInput(st.count, { min: 1, max: 50, step: 1, onChange: (v) => { st.count = v; app.refresh(); } })),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: async () => { const sh = stickerSheet({ size: st.size, count: st.count }); download(await makePDF([{ prims: sh.prims, W: sh.paperW, H: sh.paperH }], { title: 'Calcomanias de control' }), `calcomanias_${st.size}mm.pdf`); } }, 'Descargar PDF'),
        h('button', { class: 'btn ghost', onclick: () => { app.state.sheet = 'stickers'; showSheet(app); } }, 'Ver'),
      ),
    ),
    card('Moteado para la pieza',
      h('p', { class: 'hint' }, 'Hoja de puntos aleatorios para imprimir en papel adhesivo y pegar en zonas planas sin textura. Alternativa: spray revelador mate + puntos con marcador.'),
      field('Punto (mm)', numInput(sp.dot, { min: 0.3, max: 4, step: 0.1, onChange: (v) => { sp.dot = v; app.refresh(); } })),
      field('Densidad (%)', numInput(Math.round(sp.density * 100), { min: 10, max: 60, step: 1, onChange: (v) => { sp.density = v / 100; app.refresh(); } })),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: async () => { const sh = speckleSheet({ dot: sp.dot, density: sp.density }); download(await makePDF([{ prims: sh.prims, W: sh.paperW, H: sh.paperH }], { title: 'Moteado' }), `moteado_${sp.dot}mm.pdf`); } }, 'Descargar PDF'),
        h('button', { class: 'btn ghost', onclick: () => { app.state.sheet = 'speckle'; showSheet(app); } }, 'Ver'),
      ),
    ),
    card('Cargar tapete por código',
      h('p', { class: 'hint' }, 'El código está impreso al pie del tapete. Úselo para trabajar con un tapete ya impreso.'),
      (() => {
        const inp = h('input', { type: 'text', placeholder: 'p. ej. 420_297_8_30_7.5_1_1_1_0.32_7' });
        return h('div', { class: 'row' }, h('div', { class: 'grow' }, inp), h('button', { class: 'btn', onclick: () => {
          const o = parseBoardCode(inp.value);
          if (!o) { toast('Código no válido.', 'bad'); return; }
          setB({ ...o, paper: 'custom' });
          toast('Tapete cargado.', 'ok');
        } }, 'Aplicar'));
      })(),
    ),
  );
  showSheet(app);
}

async function downloadBoardPDF(app) {
  const b = app.project.board;
  const blob = await makePDF([{ prims: boardPrimitives(b), W: b.paperW, H: b.paperH, speckleColor: b.speckleColor }], { title: `Tapete de calibracion ${b.code}` });
  download(blob, `tapete_${Math.round(b.paperW)}x${Math.round(b.paperH)}_${b.markerSize}mm.pdf`);
  toast('PDF generado. Imprima al 100 % y verifique las barras de escala.', 'ok');
}

function showSheet(app) {
  const v = app.showView('pattern');
  clear(v);
  const b = app.project.board;
  let svg, cap;
  if (app.state.sheet === 'stickers') {
    const st = app.settings.stickers;
    const sh = stickerSheet({ size: st.size, count: st.count });
    svg = primitivesToSVG(sh.prims, sh.paperW, sh.paperH);
    cap = `Calcomanías de ${st.size} mm · IDs ${sh.ids[0]}–${sh.ids[sh.ids.length - 1]} · hoja carta/A4 vertical`;
  } else if (app.state.sheet === 'speckle') {
    const sp = app.settings.speckle;
    const sh = speckleSheet({ dot: sp.dot, density: sp.density });
    svg = primitivesToSVG(sh.prims, sh.paperW, sh.paperH);
    cap = `Moteado de ${sp.dot} mm · ${Math.round(sp.density * 100)} % de cobertura`;
  } else {
    svg = primitivesToSVG(boardPrimitives(b), b.paperW, b.paperH, b.speckleColor);
    cap = `Tapete ${fmt(b.paperW, 0)} × ${fmt(b.paperH, 0)} mm · ${b.markers.length} marcadores de ${b.markerSize} mm · origen (0,0) en el centro de la zona libre, X → derecha, Y → arriba`;
  }
  v.append(h('div', { class: 'pattern-wrap' }, h('div', {}, h('div', { class: 'pattern-sheet', html: svg }), h('div', { class: 'pattern-caption' }, cap))));
}
