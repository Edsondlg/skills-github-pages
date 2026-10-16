// Piezas de ejemplo incluidas en samples/. La versión de un solo archivo (sin servidor) inyecta el
// texto de cada STEP en window.__TB_SAMPLES__ = { [id]: text }; si no existe se usa fetch().

export const SAMPLES = [
  {
    id: 'soporte_3d_hsla', file: 'samples/soporte_3d_hsla.stp', name: 'Soporte 3D',
    description: '3 dobleces en 3 planos distintos; requiere giro de boquilla entre dobleces.', materialId: 'hsla420',
  },
  {
    id: 'travesano_calibre_variable', file: 'samples/travesano_calibre_variable.stp', name: 'Travesaño de calibre variable',
    description: 'Pared 2.4 / 1.2 / 2.4 mm con transiciones internas: los dobleces caen en la zona delgada.', materialId: 'dp780',
  },
  {
    id: 'escape_5_dobleces', file: 'samples/escape_5_dobleces.stp', name: 'Escape, 5 dobleces',
    description: 'Dos CLR distintos: herramental apilado en dos niveles.', materialId: 'aisi409',
  },
  {
    id: 'horquilla_180', file: 'samples/horquilla_180.stp', name: 'Horquilla 180°',
    description: 'Doblez de 180° seguido de uno de 90°: el de 180° no tiene punto de intersección (se reportan sus dos tangencias).', materialId: 'sae1010-cew',
  },
  {
    id: 'doblez_compuesto', file: 'samples/doblez_compuesto.stp', name: 'Doblez compuesto',
    description: 'Dos dobleces seguidos sin recta intermedia (L = 0) y con giro de 90° entre ellos.', materialId: 'dp590',
  },
];

/** Texto STEP de una muestra: inyectado en la versión offline o descargado de sample.file. */
export async function loadSampleText(sample) {
  return globalThis.__TB_SAMPLES__?.[sample.id] ?? (await fetch(sample.file)).text();
}
