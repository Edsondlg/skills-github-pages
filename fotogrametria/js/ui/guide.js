// Guía de captura (contenido del modal).
import { h } from './dom.js';

export function guideContent() {
  const ill = `
  <svg viewBox="0 0 520 250" width="100%" style="max-width:520px;display:block;margin:6px auto" role="img" aria-label="Posiciones de cámara">
    <ellipse cx="260" cy="200" rx="200" ry="34" fill="none" stroke="currentColor" stroke-opacity=".35"/>
    <ellipse cx="260" cy="200" rx="140" ry="24" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 4"/>
    <rect x="200" y="186" width="120" height="26" rx="3" fill="none" stroke="#2dd4bf" stroke-width="2"/>
    <path d="M232 199 h40 v-14 h6 v20 h-46 z" fill="#8b98a5"/>
    <g fill="#60a5fa">
      ${[[60, 150], [120, 120], [200, 105], [320, 105], [400, 120], [460, 150]].map(([x, y]) => `<rect x="${x - 9}" y="${y - 6}" width="18" height="12" rx="2"/><line x1="${x}" y1="${y}" x2="260" y2="195" stroke="#60a5fa" stroke-opacity=".35"/>`).join('')}
    </g>
    <g fill="#f5a524">
      ${[[150, 60], [260, 40], [370, 60]].map(([x, y]) => `<rect x="${x - 9}" y="${y - 6}" width="18" height="12" rx="2"/><line x1="${x}" y1="${y}" x2="260" y2="195" stroke="#f5a524" stroke-opacity=".35"/>`).join('')}
    </g>
    <text x="16" y="236" fill="currentColor" font-size="12">Anillo bajo (35–45°) · anillo medio (50–60°) · anillo alto (70–80°)</text>
  </svg>`;
  return [
    h('h2', {}, 'Guía de captura para precisión milimétrica'),
    h('div', { html: ill }),
    h('h3', {}, 'Preparación'),
    h('ol', {},
      h('li', {}, 'Imprima el tapete al 100 % (tamaño real) en papel mate y péguelo sobre una superficie rígida y plana (MDF, vidrio, aluminio o cartón pluma).'),
      h('li', {}, 'Mida las barras de escala impresas con un calibrador o regla de acero y capture los valores en el paso 1 (corrige la escala de la impresora).'),
      h('li', {}, 'Las piezas estampadas suelen ser brillantes y lisas: aplique spray revelador mate (como el de líquidos penetrantes o spray para escaneo 3D) y agregue moteado con marcador, aerógrafo o la hoja de moteado adhesiva.'),
      h('li', {}, 'Opcional: pegue calcomanías de control (IDs 200–249) sobre zonas planas de la pieza para obtener puntos de referencia de alta precisión.'),
      h('li', {}, 'Coloque la pieza dentro del recuadro central del tapete sin cubrir los marcadores.'),
    ),
    h('h3', {}, 'Toma de fotos'),
    h('ul', {},
      h('li', {}, 'Use la misma cámara y el mismo zoom en todas las fotos (bloquee el enfoque/zoom; en el celular use la cámara principal 1×, sin modo retrato).'),
      h('li', {}, '20 a 40 fotos: 2 o 3 anillos alrededor de la pieza (ver dibujo), una foto cada 20–30° de giro.'),
      h('li', {}, 'Cada foto debe mostrar la pieza completa y al menos 6 marcadores del tapete. Llene el encuadre: acérquese lo más posible.'),
      h('li', {}, 'Luz difusa y uniforme (nublado, caja de luz o dos lámparas con difusor). Evite flash directo, sombras duras y reflejos.'),
      h('li', {}, 'Fotos nítidas: ISO bajo, apoye la cámara o use temporizador. No mueva la pieza ni el tapete durante la sesión.'),
      h('li', {}, 'Incluya fotos donde los marcadores queden cerca de las esquinas de la imagen: mejora la calibración de la lente.'),
    ),
    h('h3', {}, 'Qué precisión esperar'),
    h('p', { class: 'hint' }, 'Con un celular moderno, tapete A3 bien medido y pieza con textura, la incertidumbre típica es de 0.1 a 0.5 mm (95 %). El sistema la estima y la reporta en «Resultados» a partir de puntos de control independientes y del ruido medido sobre la mesa.'),
  ];
}
