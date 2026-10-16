// Operaciones sugeridas para los planos de ejemplo (objeto puro; lo usan samples.js y las pruebas).
// Forma: { mode, thickness, materialId, revolve?, multiview?: { windows } }; se aplica con applySuggested.
// Medidas en mm, según scripts/make-samples-dxf.mjs.

export const SAMPLE_SUGGESTIONS = {
  'placa-soporte': { mode: 'extrude', thickness: 2, materialId: 'acero-1008' },
  'brida-bloques': { mode: 'extrude', thickness: 12, materialId: 'acero-a36' },
  // Medio perfil cerrado sobre y = 0: revolución completa alrededor de la línea de centros (eje X).
  'eje-perfil': {
    mode: 'revolve', thickness: 2, materialId: 'acero-1045',
    revolve: { axisKind: 'x', axis: { p: [0, 0], d: [1, 0] }, angleDeg: 360 },
  },
  // Tercer ángulo: frontal L en (0..80, 0..40), superior en (0..80, 70..120), lateral derecha en (110..160, 0..40).
  // Ventanas con 5 mm de holgura alrededor de cada vista.
  'bloque-vistas': {
    mode: 'multiview', thickness: 2, materialId: 'acero-1018',
    multiview: {
      windows: {
        front: { minX: -5, minY: -5, maxX: 85, maxY: 45 },
        top: { minX: -5, minY: 65, maxX: 85, maxY: 125 },
        right: { minX: 105, minY: -5, maxX: 165, maxY: 45 },
      },
    },
  },
  'leva-spline': { mode: 'extrude', thickness: 12.7, materialId: 'al-6061-t6' },
  // Junta troquelada en aluminio blando (sella por deformación).
  'junta-arcos': { mode: 'extrude', thickness: 1.5, materialId: 'al-1100-h14' },
};
