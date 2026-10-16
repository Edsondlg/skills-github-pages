// Biblioteca de materiales (valores típicos, no certificados).
// density en g/cm³; uts, yieldStrength, shear en MPa; E en GPa.

export const CUSTOM_MATERIAL_ID = 'personalizado';

const G_STEEL = 'Aceros';
const G_STAINLESS = 'Inoxidables';
const G_AL = 'Aluminio';
const G_CU = 'Cobre y aleaciones';
const G_OTHER_METAL = 'Otros metales';
const G_PLASTIC = 'Plásticos';
const G_OTHER = 'Otros';

// Fila compacta: [id, nombre, grupo, densidad, uts, fy, shear, E, color, metalness, roughness]
const ROWS = [
  ['acero-1008', 'Acero bajo carbono 1008/1010 (CRS)', G_STEEL, 7.87, 330, 285, 250, 200, '#8c96a3', 0.9, 0.45],
  ['acero-1018', 'Acero 1018', G_STEEL, 7.87, 440, 370, null, 205, '#8a94a1', 0.9, 0.45],
  ['acero-a36', 'Acero A36', G_STEEL, 7.85, 450, 250, null, 200, '#86909e', 0.9, 0.5],
  ['acero-1045', 'Acero 1045', G_STEEL, 7.85, 625, 530, null, 205, '#808a98', 0.9, 0.4],
  ['acero-galv-g90', 'Acero galvanizado G90', G_STEEL, 7.85, 340, 230, null, null, '#a3adb8', 0.85, 0.55],
  ['acero-hsla-50', 'Acero HSLA grado 50', G_STEEL, 7.85, 450, 345, null, null, '#838d9b', 0.9, 0.45],
  ['acero-dp590', 'Acero DP590', G_STEEL, 7.8, 600, 340, null, null, '#7f8997', 0.9, 0.45],
  ['acero-4140', 'Acero 4140', G_STEEL, 7.85, 655, 415, null, null, '#7b8594', 0.9, 0.4],

  ['inox-304', 'Inoxidable 304', G_STAINLESS, 8.0, 515, 205, null, 193, '#b9c1cb', 1, 0.3],
  ['inox-316', 'Inoxidable 316', G_STAINLESS, 8.0, 515, 205, null, null, '#b4bcc7', 1, 0.3],
  ['inox-430', 'Inoxidable 430', G_STAINLESS, 7.75, 450, 205, null, null, '#bcc3cd', 1, 0.3],
  ['inox-409', 'Inoxidable 409', G_STAINLESS, 7.7, 415, 205, null, null, '#b0b8c2', 1, 0.35],
  ['inox-17-4ph', 'Inoxidable 17-4PH', G_STAINLESS, 7.8, 1100, 1000, null, null, '#aab2bd', 1, 0.3],

  ['al-1100-h14', 'Aluminio 1100-H14', G_AL, 2.71, 125, 115, 75, 69, '#d9dde2', 0.9, 0.4],
  ['al-3003-h14', 'Aluminio 3003-H14', G_AL, 2.73, 150, 145, 95, null, '#d6dadf', 0.9, 0.4],
  ['al-5052-h32', 'Aluminio 5052-H32', G_AL, 2.68, 230, 195, 140, 70, '#d3d8de', 0.9, 0.4],
  ['al-6061-t6', 'Aluminio 6061-T6', G_AL, 2.7, 310, 276, 207, 69, '#cfd4da', 0.9, 0.4],
  ['al-6063-t5', 'Aluminio 6063-T5', G_AL, 2.69, 185, null, null, null, '#d2d7dc', 0.9, 0.4],
  ['al-7075-t6', 'Aluminio 7075-T6', G_AL, 2.81, 572, 503, 331, 72, '#c9cfd6', 0.9, 0.4],
  ['al-2024-t3', 'Aluminio 2024-T3', G_AL, 2.78, 483, 345, 283, null, '#ccd1d8', 0.9, 0.4],

  ['cobre-c110', 'Cobre C110', G_CU, 8.89, 220, null, 150, 117, '#b87333', 1, 0.35],
  ['laton-c260', 'Latón C260', G_CU, 8.53, 340, null, null, null, '#d4a94a', 1, 0.35],
  ['laton-c360', 'Latón C360', G_CU, 8.5, 385, null, null, null, '#cfa443', 1, 0.35],
  ['bronce-c510', 'Bronce fosforado C510', G_CU, 8.86, 515, null, null, null, '#b98a4b', 1, 0.4],
  ['cobre-be-c172', 'Cobre-berilio C172', G_CU, 8.25, 1200, null, null, null, '#c28a52', 1, 0.35],

  ['titanio-gr2', 'Titanio Gr 2', G_OTHER_METAL, 4.51, 345, null, null, null, '#9da3aa', 0.9, 0.4],
  ['ti-6al-4v', 'Ti-6Al-4V', G_OTHER_METAL, 4.43, 950, null, null, null, '#8f959c', 0.9, 0.4],
  ['zamak-3', 'Zamak 3', G_OTHER_METAL, 6.6, 283, null, null, null, '#a8adb3', 0.85, 0.5],
  ['mg-az31b', 'Magnesio AZ31B', G_OTHER_METAL, 1.77, 260, null, null, null, '#c3c7cc', 0.85, 0.5],
  ['niquel-200', 'Níquel 200', G_OTHER_METAL, 8.89, 460, null, null, null, '#b5b9be', 1, 0.3],
  ['inconel-718', 'Inconel 718', G_OTHER_METAL, 8.19, 1375, null, null, null, '#8d9298', 1, 0.35],
  ['hierro-gris', 'Hierro fundido gris', G_OTHER_METAL, 7.2, 250, null, null, null, '#6b7078', 0.8, 0.6],
  ['plomo', 'Plomo', G_OTHER_METAL, 11.34, null, null, null, null, '#6e7681', 0.9, 0.55],

  ['abs', 'ABS', G_PLASTIC, 1.04, null, null, null, null, '#e8e4d8', 0, 0.5],
  ['pla', 'PLA', G_PLASTIC, 1.24, null, null, null, null, '#e9edf0', 0, 0.45],
  ['petg', 'PETG', G_PLASTIC, 1.27, null, null, null, null, '#cfe6ef', 0, 0.35],
  ['nylon-66', 'Nylon 6/6', G_PLASTIC, 1.14, null, null, null, null, '#efe9d9', 0, 0.5],
  ['pom', 'POM (Delrin)', G_PLASTIC, 1.41, null, null, null, null, '#f2f2ee', 0, 0.4],
  ['pc', 'Policarbonato', G_PLASTIC, 1.2, null, null, null, null, '#dbe7ee', 0, 0.3],
  ['pp', 'Polipropileno', G_PLASTIC, 0.9, null, null, null, null, '#f0f0e6', 0, 0.5],
  ['hdpe', 'HDPE', G_PLASTIC, 0.95, null, null, null, null, '#eceae0', 0, 0.55],
  ['pmma', 'Acrílico (PMMA)', G_PLASTIC, 1.18, null, null, null, null, '#e3f0f6', 0, 0.3],
  ['ptfe', 'PTFE', G_PLASTIC, 2.2, null, null, null, null, '#f6f6f3', 0, 0.45],
  ['peek', 'PEEK', G_PLASTIC, 1.3, null, null, null, null, '#c9b99a', 0, 0.45],
  ['pvc', 'PVC rígido', G_PLASTIC, 1.4, null, null, null, null, '#d8dde0', 0, 0.45],
  ['resina-sla', 'Resina SLA', G_PLASTIC, 1.18, null, null, null, null, '#d9d4c7', 0, 0.4],

  ['pino', 'Pino', G_OTHER, 0.5, null, null, null, null, '#d8b98a', 0, 0.6],
  ['roble', 'Roble', G_OTHER, 0.75, null, null, null, null, '#b98f5a', 0, 0.6],
  ['mdf', 'MDF', G_OTHER, 0.75, null, null, null, null, '#c4a77d', 0, 0.6],
  ['vidrio', 'Vidrio', G_OTHER, 2.5, null, null, null, null, '#cfe3e8', 0, 0.3],
  ['caucho', 'Caucho', G_OTHER, 1.2, null, null, null, null, '#3a3d42', 0, 0.6],
  ['concreto', 'Concreto', G_OTHER, 2.4, null, null, null, null, '#a8a8a2', 0, 0.6],
  ['cfrp', 'Fibra de carbono (CFRP)', G_OTHER, 1.55, null, null, null, null, '#2b2e33', 0.2, 0.35],
];

/** @type {Array<{id:string,name:string,group:string,density:number,uts?:number,yieldStrength?:number,shear?:number,E?:number,color:string,metalness:number,roughness:number}>} */
export const MATERIALS = ROWS.map(([id, name, group, density, uts, fy, shear, E, color, metalness, roughness]) => {
  const m = { id, name, group, density };
  if (uts != null) m.uts = uts;
  if (fy != null) m.yieldStrength = fy;
  if (shear != null) m.shear = shear;
  if (E != null) m.E = E;
  return Object.assign(m, { color, metalness, roughness });
});

/** Busca un material por id; undefined si no existe. */
export function findMaterial(id) {
  return MATERIALS.find((m) => m.id === id);
}

/** Grupos en orden de aparición: [{ group, items }]. */
export function materialGroups() {
  const out = [];
  for (const m of MATERIALS) {
    let g = out.find((x) => x.group === m.group);
    if (!g) out.push((g = { group: m.group, items: [] }));
    g.items.push(m);
  }
  return out;
}

/** Material personalizado a partir de una densidad (g/cm³). */
export function customMaterial(density, name = 'Personalizado') {
  return {
    id: CUSTOM_MATERIAL_ID,
    name,
    group: 'Personalizado',
    density: Number(density),
    color: '#9aa4b0',
    metalness: 0.5,
    roughness: 0.5,
  };
}
