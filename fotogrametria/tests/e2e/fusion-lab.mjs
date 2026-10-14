// Laboratorio de fusión: re-ejecuta TSDF + malla sobre mapas de profundidad volcados por
// pipeline-probe (DUMP=dir) y mide exactitud/completitud contra la verdad, sin repetir la GPU.
// Uso: node tests/e2e/fusion-lab.mjs <dir> [voxel] [trunc] [truncBack] [minViews] [costThr]
import fs from 'node:fs';
import { SparseTSDF } from '../../js/mesh/tsdf.js';
import { removeSmallComponents, taubinSmooth, meshStats, fillSmallHoles, footprint2D } from '../../js/mesh/process.js';
import { TriangleGrid, pointsToMesh, samplePoints } from '../../js/analysis/distance.js';

const dir = process.argv[2];
const meta = JSON.parse(fs.readFileSync(`${dir}/meta.json`, 'utf8'));
const o = meta.tsdfOpts;
const voxel = +(process.argv[3] || o.voxel), trunc = +(process.argv[4] || o.trunc), truncBack = +(process.argv[5] || o.truncBack);
const minViews = +(process.argv[6] || 2), costThr = +(process.argv[7] || 0.4);
const smooth = +(process.env.SMOOTH ?? 2);
const t0 = Date.now();
const tsdf = new SparseTSDF({ ...o, voxel, trunc, truncBack });
const rd = (i, k, T) => { const b = fs.readFileSync(`${dir}/${i}_${k}.bin`); return new T(b.buffer, b.byteOffset, b.byteLength / T.BYTES_PER_ELEMENT); };
meta.maps.forEach((m, i) => {
  tsdf.integrate({ ...m, depth: rd(i, 'depth', Float32Array), normal: rd(i, 'normal', Float32Array), cost: rd(i, 'cost', Float32Array), color: rd(i, 'color', Uint8Array) }, { costThr, maxAngle: +(process.env.MAXANG ?? 80) });
});
let mesh = tsdf.extractMesh({ minWeight: +(process.env.MINW ?? 0.15), minViews });
mesh = removeSmallComponents(mesh, { minFrac: 0.02, minTris: 30 });
let filled = 0;
if (process.env.FILL !== '0') { const r = fillSmallHoles(mesh, { maxWidth: Math.max(2.5, 4 * voxel), maxPerimeter: Math.max(7, 10 * voxel) }); mesh = r.mesh; filled = r.filled; }
if (smooth) taubinSmooth(mesh.positions, mesh.indices, { iterations: smooth });
const st = meshStats(mesh.positions, mesh.indices);
const gt = JSON.parse(fs.readFileSync(`${dir}/gt.json`, 'utf8'));
const gp = new Float32Array(gt.p), gi = new Uint32Array(gt.i);
const grid = new TriangleGrid(gp, gi);
const d = Array.from(pointsToMesh(mesh.positions, grid, 20)).sort((a, b) => a - b);
const q = (p) => d[Math.floor((d.length - 1) * p)];
const recGrid = new TriangleGrid(mesh.positions, mesh.indices);
let s = 7; const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
const S = samplePoints(gp, gi, 1.0, rand);
let nS = 0, nC = 0;
const missing = { flange: [0, 0], base: [0, 0], walls: [0, 0] };
for (let i = 0; i < S.points.length / 3; i++) {
  const z = S.points[3 * i + 2];
  if (z < 1.2) continue;
  const nz = grid.N[3 * S.tris[i] + 2];
  if (nz < -0.3) continue;
  nS++;
  const ok = !!recGrid.closest(S.points[3 * i], S.points[3 * i + 1], z, 1.0);
  if (ok) nC++;
  const cat = Math.abs(nz) < 0.3 ? (z > 6 ? 'flange' : 'walls') : 'base';
  missing[cat][0]++; if (ok) missing[cat][1]++;
}
console.log(JSON.stringify({ voxel, trunc, truncBack, minViews, costThr, smooth, filled, ms: Date.now() - t0, tris: st.triangles, area: Math.round(st.area),
  acc: { med: +q(0.5).toFixed(4), p90: +q(0.9).toFixed(4), p99: +q(0.99).toFixed(4), within05: +(d.filter(x => x < 0.5).length / d.length).toFixed(4), within1: +(d.filter(x => x < 1).length / d.length).toFixed(4) },
  completeness: +(nC / nS).toFixed(4), byCat: Object.fromEntries(Object.entries(missing).map(([k, [a, b]]) => [k, `${(100 * b / Math.max(1, a)).toFixed(1)}% de ${a}`])),
  footprint: (({ length, width, angle }) => [+length.toFixed(2), +width.toFixed(2), +angle.toFixed(2)])(footprint2D(mesh.positions, 0.75 * +(process.env.THICK ?? 2))) }));
if (process.env.SAVE) {
  // STL ASCII mínimo para inspección
  const lines = ['solid m'];
  for (let f = 0; f < mesh.indices.length; f += 3) {
    lines.push('facet normal 0 0 0', 'outer loop');
    for (let k = 0; k < 3; k++) { const v = mesh.indices[f + k]; lines.push(`vertex ${mesh.positions[3 * v]} ${mesh.positions[3 * v + 1]} ${mesh.positions[3 * v + 2]}`); }
    lines.push('endloop', 'endfacet');
  }
  lines.push('endsolid m');
  fs.writeFileSync(process.env.SAVE, lines.join('\n'));
}
if (process.env.HOLES) {
  const { detectHoles } = await import('../../js/analysis/features.js');
  const holes = detectHoles(mesh.positions, mesh.indices, { thickness: +(process.env.THICK ?? 2), minR: Math.max(1, 2 * voxel) });
  for (const o of holes) console.log(o.type, o.type === 'circular' ? `Ø${o.diameter.toFixed(3)} rms ${o.fitRms.toFixed(3)} (borde Ø${o.edgeDiameter.toFixed(3)}, corte ${o.section === null ? '-' : o.section.toFixed(2)})` : `${o.size[0].toFixed(1)}×${o.size[1].toFixed(1)}`, 'centro', o.center.map(v => v.toFixed(1)).join(','), 'n', o.normal.map(v => v.toFixed(2)).join(','));
}
