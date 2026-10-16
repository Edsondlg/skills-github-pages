// Planos de ejemplo embebidos en el bundle (solo navegador: esbuild carga .dxf/.svg como texto,
// .dwg como Uint8Array y .png/.jpg como data URL; ver scripts/build.mjs). Las sugerencias viven en sample-suggestions.js.
import placaSoporte from '../../samples/placa-soporte.dxf';
import bridaBloques from '../../samples/brida-bloques.dxf';
import bridaBloquesDwg from '../../samples/brida-bloques.dwg';
import ejePerfil from '../../samples/eje-perfil.dxf';
import bloqueVistas from '../../samples/bloque-vistas.dxf';
import levaSpline from '../../samples/leva-spline.dxf';
import juntaArcos from '../../samples/junta-arcos.dxf';
import placaLogo from '../../samples/placa-logo.svg';
import piezaEscaneada from '../../samples/pieza-escaneada.png';
import { SAMPLE_SUGGESTIONS } from './sample-suggestions.js';

export { SAMPLE_SUGGESTIONS };

const S = (id, title, description, format, fileName, content) => ({ id, title, description, format, fileName, content, suggested: SAMPLE_SUGGESTIONS[id] });

/**
 * @type {Array<{id:string,title:string,description:string,format:'dxf'|'dwg'|'svg'|'image',fileName:string,
 *   content:string,suggested:{mode:string,thickness:number,materialId:string,mmPerPx?:number,revolve?:Object,multiview?:{windows:Object}}}>}
 * content: texto (dxf/svg), bytes (dwg) o data URL (imagen).
 */
export const SAMPLES = [
  S('placa-soporte', 'Placa soporte', 'Placa troquelada 150×80 mm con esquinas R6, muesca, ranura, 4 barrenos Ø8.5 y uno Ø25. Extrusión de 2 mm.', 'dxf', 'placa-soporte.dxf', placaSoporte),
  S('brida-bloques', 'Brida con bloques', 'Brida Ø150 con barreno Ø60 y cuñero; 8 barrenos Ø14 en PCD 110 definidos con bloques anidados. Extrusión de 12 mm.', 'dxf', 'brida-bloques.dxf', bridaBloques),
  S('brida-bloques-dwg', 'Brida con bloques (DWG)', 'La misma brida guardada como DWG de AutoCAD 2013; se convierte a DXF en el navegador. Extrusión de 12 mm.', 'dwg', 'brida-bloques.dwg', bridaBloquesDwg),
  S('eje-perfil', 'Flecha escalonada', 'Medio perfil de una flecha con hombros, chaflanes y ranura; revolución de 360° alrededor de su línea de centros.', 'dxf', 'eje-perfil.dxf', ejePerfil),
  S('bloque-vistas', 'Bloque en L (vistas)', 'Vistas frontal, superior y lateral derecha (tercer ángulo) de un bloque en L con barreno Ø16; reconstrucción por vistas.', 'dxf', 'bloque-vistas.dxf', bloqueVistas),
  S('leva-spline', 'Leva (pulgadas)', 'Leva dibujada en pulgadas con contorno SPLINE, ranura elíptica y ventana hexagonal. Extrusión de 12.7 mm (½ in).', 'dxf', 'leva-spline.dxf', levaSpline),
  S('junta-arcos', 'Junta (solo líneas y arcos)', 'Junta con entidades desordenadas, una duplicada y un hueco de 0.0005 mm que se cierra solo. Extrusión de 1.5 mm.', 'dxf', 'junta-arcos.dxf', juntaArcos),
  S('placa-logo', 'Placa con logo (SVG)', 'Placa 160×100 mm en SVG (mm) con recorte Bézier, ranuras, elipse y 4 barrenos Ø7. Extrusión de 2 mm.', 'svg', 'placa-logo.svg', placaLogo),
  S('pieza-escaneada', 'Junta escaneada (imagen)', 'Imagen 1200×800 px de una junta 1000×600 px con barrenos Ø80/Ø60/Ø60 y ranura; a 0.15 mm/px mide 150×90 mm. Extrusión de 1.5 mm.', 'image', 'pieza-escaneada.png', piezaEscaneada),
];
