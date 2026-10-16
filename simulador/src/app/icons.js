// Iconos SVG en línea (trazo de 24×24, currentColor). Sin fuentes ni archivos externos.

const CUBE = 'M12 2.5 20.5 7v10L12 21.5 3.5 17V7z';
const CUBE_INNER = 'M3.5 7 12 11.5 20.5 7M12 11.5v10';
const FACE_TOP = 'M12 2.5 20.5 7 12 11.5 3.5 7z';
const FACE_LEFT = 'M3.5 7 12 11.5v10L3.5 17z';
const FACE_RIGHT = 'M20.5 7 12 11.5v10l8.5-4.5z';
const fill = (d, o = 0.35) => `<path d="${d}" fill="currentColor" fill-opacity="${o}" stroke="none"/>`;
const cubeWith = (face) => `${fill(face, 0.45)}<path d="${CUBE}"/><path d="${CUBE_INNER}"/>`;

const PATHS = {
  logo: `${fill(FACE_TOP, 0.9)}${fill(FACE_RIGHT, 0.55)}${fill(FACE_LEFT, 0.3)}<path d="${CUBE}"/><path d="${CUBE_INNER}"/>`,
  open: '<path d="M3 19V6a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V10"/><path d="M3 19 5.6 11.4A2 2 0 0 1 7.5 10H20a1.5 1.5 0 0 1 1.4 2l-2.2 6.3A2 2 0 0 1 17.3 20H4a1 1 0 0 1-1-1z"/>',
  examples: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><circle cx="17.25" cy="6.75" r="3.75"/><path d="M6.75 13.5 10.5 20.5H3z"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  export: '<path d="M12 15V3.5"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13"/>',
  download: '<path d="M12 3.5V15"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>',
  upload: '<path d="M12 16V4.5"/><path d="M7.5 9 12 4.5 16.5 9"/><path d="M4 15.5v3a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5v-3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2.3-2.5 3.9"/><path d="M12 17.2h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  success: '<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.8 2.8L16 9.8"/>',
  warning: '<path d="M10.3 4 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  chevron: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  'chevron-right': '<path d="m9.5 6.5 5.5 5.5-5.5 5.5"/>',
  copy: '<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M15 9V5a1.5 1.5 0 0 0-1.5-1.5h-8.5A1.5 1.5 0 0 0 3.5 5v8.5A1.5 1.5 0 0 0 5 15h4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="m6 7 .9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7"/><path d="M9 7V4.5A1 1 0 0 1 10 3.5h4a1 1 0 0 1 1 1V7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5M4.5 3v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5M19.5 21v-4h-4"/>',
  play: '<path d="M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z" fill="currentColor" stroke="none"/>',
  cube: `${fill(FACE_TOP, 0.3)}<path d="${CUBE}"/><path d="${CUBE_INNER}"/>`,
  drawing: '<path d="M14.5 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14.5 3v5h5"/><path d="M8 17.5v-5h3.5v-2H16v7z"/>',
  file: '<path d="M14.5 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14.5 3v5h5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="m20.5 15.5-5-5-9.5 9.5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 14.75h18M9 4v16"/>',
  code: '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>',
  printer: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
  camera: '<path d="M4 7.5h3l1.8-2.5h6.4L17 7.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
  layers: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16 9.5 5 9.5-5"/>',
  hole: '<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',
  'panel-left': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9.5 4v16"/>',
  'panel-right': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14.5 4v16"/>',
  split: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  // Vistas estándar (cara resaltada sobre el cubo isométrico; Z arriba, frente = −Y).
  'view-iso': `${fill(FACE_TOP, 0.4)}${fill(FACE_RIGHT, 0.2)}<path d="${CUBE}"/><path d="${CUBE_INNER}"/>`,
  'view-front': cubeWith(FACE_LEFT),
  'view-top': cubeWith(FACE_TOP),
  'view-right': cubeWith(FACE_RIGHT),
  fit: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="8.5" y="8.5" width="7" height="7" rx="1"/>',
  perspective: '<path d="M3 7.5 21 3.5v17L3 16.5z"/><path d="M3 12h18M9 6.2v11.6M15 4.8v14.4"/>',
  orthographic: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 12h18M9 5v14M15 5v14"/>',
  // Visualización
  edges: `<path d="${CUBE}" stroke-width="2.2"/><path d="${CUBE_INNER}" stroke-width="2.2"/>`,
  xray: `<path d="${CUBE}"/><path d="${CUBE_INNER}"/><path d="M3.5 17 12 12.5l8.5 4.5M12 2.5v10" stroke-dasharray="1.8 2"/>`,
  wireframe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  bbox: '<rect x="5" y="5" width="14" height="14" stroke-dasharray="2.5 2.2"/><rect x="3" y="3" width="4" height="4" rx=".6"/><rect x="17" y="3" width="4" height="4" rx=".6"/><rect x="3" y="17" width="4" height="4" rx=".6"/><rect x="17" y="17" width="4" height="4" rx=".6"/>',
  section: '<rect x="4" y="4" width="16" height="16" rx="2"/>' + fill('M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 0.35) + '<path d="M2 12h20"/>',
  invert: '<path d="M7.5 20V4M4.5 7l3-3 3 3"/><path d="M16.5 4v16M13.5 17l3 3 3-3"/>',
  // Herramientas de medición
  inspect: '<path d="M5 3.5 10.6 20l2.4-7 7-2.4z"/><path d="m13 13 6 6"/>',
  select: '<path d="M5 3.5 10.6 20l2.4-7 7-2.4z"/>',
  point: '<circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.2 16.8 16.8 7.2"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7.5 12 2 2M10.5 9l2 2M13.5 6l2 2"/>',
  distance: '<path d="M4 4v16M20 4v16"/><path d="M7.5 12h9"/><path d="M10 9.5 7.5 12l2.5 2.5M14 9.5l2.5 2.5-2.5 2.5"/>',
  angle: '<path d="M4 20h16.5"/><path d="M4 20 14.5 4.5"/><path d="M11.5 20a7.5 7.5 0 0 0-3.3-6.2"/>',
  radius: '<circle cx="12" cy="12" r="9"/><path d="m12 12 6.4-6.4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  area: fill('M4 8 12 3.5l8 5-2 11.5H6z', 0.3) + '<path d="M4 8 12 3.5l8 5-2 11.5H6z"/>',
  coords: '<path d="M4 3.5V20h16.5"/><path d="M14 12v8M4 10h8" stroke-dasharray="1.8 2"/><circle cx="14" cy="10" r="2.2"/>',
  thickness: '<path d="M3 5h18M3 19h18"/><path d="M12 8v8"/><path d="m9.5 10 2.5-2.5 2.5 2.5M9.5 14l2.5 2.5 2.5-2.5"/>',
  // Vista 2D
  window: '<rect x="3.5" y="5" width="13" height="11" rx="1" stroke-dasharray="2.5 2"/><path d="M19 14v7M15.5 17.5h7"/>',
  axis: '<path d="M12 2v20" stroke-dasharray="4 2 1 2"/><path d="M19.5 11.5a7.5 3 0 0 1-15 0"/><path d="M4.5 11.5a7.5 3 0 0 1 13.4-1.8"/><path d="m18.6 7.2.2 2.7-2.6.4"/>',
  calibrate: '<path d="M3 18.5h18"/><path d="M6 18.5v-3M10 18.5v-2M14 18.5v-2M18 18.5v-3"/><circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="7" r="2.2"/><path d="M8.5 7h7" stroke-dasharray="2 2"/>',
  // Operaciones
  extrude: '<path d="M3 16.5 12 21l9-4.5L12 12z"/><path d="M12 3v6.5M9 6l3-3 3 3"/>',
  revolve: '<path d="M12 2v20" stroke-dasharray="3 2.5"/><path d="M19.5 12a7.5 3 0 0 1-15 0"/><path d="M4.5 12a7.5 3 0 0 1 13.4-1.8"/><path d="m18.6 7.7.2 2.7-2.6.4"/>',
  multiview: '<rect x="3" y="3" width="8" height="8" rx="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.2"/><path d="M13 17h8M17 13v8" stroke-dasharray="1.8 2"/>',
};

/** Nombres de icono disponibles. */
export const ICON_NAMES = Object.keys(PATHS);

/**
 * SVG en texto para insertar con innerHTML.
 * @param {string} name  nombre del icono (ver ICON_NAMES)
 * @param {number} [size=16] lado en px
 * @returns {string}
 */
export function icon(name, size = 16) {
  const body = PATHS[name];
  if (!body) throw new Error(`Icono desconocido: ${name}`);
  return `<svg class="icon icon-${name}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
