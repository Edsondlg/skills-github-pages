# Arquitectura y contratos entre módulos

Simulador que convierte un plano 2D (DXF, SVG o imagen) en una pieza 3D B-rep exacta
(kernel OpenCascade vía `replicad`), calcula propiedades físicas, ofrece herramientas de
medición y exporta STEP / STL / OBJ / GLB / PLY.

## Restricción principal: doble clic (file://)

`index.html` debe funcionar **abriéndolo con doble clic**, sin servidor. En `file://`
Chrome bloquea módulos ES, `fetch`/XHR y `new Worker('archivo.js')`. Por eso:

- El código fuente vive en `src/` como módulos ES (probables en Node con `node --test`).
- `npm run build` (esbuild) genera **scripts clásicos** en `build/`, que se versionan:
  - `build/app.js` — IIFE con la UI, three.js, importadores y geometría 2D.
  - `build/kernel.js` — define `window.__PLANO3D_KERNEL_SRC__` (texto del worker CAD).
  - `build/occt-wasm.js` — define `window.__OCCT_WASM_GZ_B64__` (wasm gzip + base64).
- `index.html` carga esos tres con `<script src>` (y `css/app.css` con `<link>`).
- El worker se crea con `new Worker(URL.createObjectURL(new Blob([src])))`; si falla,
  el kernel corre en el hilo principal (mismo código).
- Prohibido en código de la app: `fetch`/XHR de archivos locales, `import()` dinámico,
  módulos ES en el HTML, CDNs. Los ejemplos se embeben en el bundle (loader `text`/`dataurl`).
- Las descargas usan `Blob` + `<a download>` (funciona en file://).

Dependencias (devDependencies, versiones exactas): `three@0.186.1`, `replicad@1.1.0`,
`replicad-opencascadejs@1.1.0`, `esbuild`, `playwright` (solo pruebas; Chromium está en
`/opt/pw-browsers/chromium`, usar `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`).
Imports en `src/`: `import * as THREE from 'three'`, `import ... from 'three/addons/...'`,
`import * as R from 'replicad'`, `import opencascade from 'replicad-opencascadejs'`.

Unidades internas: **milímetros**. Ángulos internos en radianes salvo que el nombre diga `Deg`.
Idioma de la interfaz y de los mensajes de error/advertencia: **español**.

## Estructura

```
simulador/
  index.html              entrada (doble clic / GitHub Pages)
  css/app.css
  build/                  generado (app.js, kernel.js, occt-wasm.js) — versionado
  src/
    geom2d/segments.js    modelo de segmentos 2D y su matemática exacta
    geom2d/loops.js       encadenado en contornos, anidamiento, regiones
    importers/dxf.js      DXF ASCII → segmentos
    importers/svg.js      SVG → segmentos
    importers/image-trace.js  imagen rasterizada → segmentos (aproximado)
    kernel/core.js        construcción B-rep, propiedades, medición, exportación (replicad)
    kernel/worker-entry.js  envoltura de mensajes (worker o hilo principal)
    kernel/client.js      lado UI: decodifica wasm, lanza worker, RPC con promesas
    viewer/viewer3d.js    escena three.js, vistas, sección, selección (picking)
    viewer/measure.js     herramientas de medición 3D
    ui/view2d.js          lienzo 2D del plano (capas, regiones, ventanas, medición 2D)
    ui/materials.js       biblioteca de materiales
    ui/report.js          datos de la pieza, formatos, CSV/JSON/HTML
    ui/exporters.js       descargas STEP/STL (kernel) y OBJ/GLB/PLY (three)
    app/main.js           arranque y cableado de la UI
  samples/                planos de ejemplo (se embeben en app.js)
  tests/                  node --test (geometría, importadores, kernel)
  scripts/build.mjs
```

---

## C1. Geometría 2D — `src/geom2d/segments.js`

Punto: `[x, y]`. Todo segmento puede llevar `meta` (objeto: `{ layer, entity, color, linetype, dashed }`);
**toda función que devuelva un segmento derivado conserva `meta` por referencia**.

```js
{ type: 'line',    p0: [x, y], p1: [x, y] }
{ type: 'arc',     c: [x, y], r, a0, a1, ccw }        // de a0 a a1, antihorario si ccw; barrido en (0, 2π]
{ type: 'circle',  c: [x, y], r, ccw }                // círculo completo; empieza/termina en ángulo 0
{ type: 'ellipse', c: [x, y], rx, ry, rot, t0, t1, ccw } // P(t) = c + Rot(rot)·(rx cos t, ry sin t); completa si barrido = 2π
{ type: 'bezier',  pts: [p0, p1, p2, p3] }            // Bézier cúbica
{ type: 'spline',  degree, ctrl: [[x, y], ...], knots: [...], weights: null | [...] } // NURBS sujeta (clamped)
```

Barrido de arco: `ccw ? norm(a1 - a0) : norm(a0 - a1)` con `norm` llevando a `(0, 2π]`.

Exports:
- `segStart(s)`, `segEnd(s)` → `[x, y]`
- `segPointAt(s, t)` con `t ∈ [0, 1]` (proporcional al parámetro)
- `segReverse(s)` → segmento invertido
- `segLength(s)` — exacta en line/arc/circle; numérica (Gauss–Legendre adaptativa, rel. 1e-12) en el resto
- `segBBox(s)` → `{ minX, minY, maxX, maxY }` exacta (extremos analíticos) salvo spline (teselado fino)
- `segTessellate(s, chordTol)` → `[[x, y], ...]` de inicio a fin inclusive; desviación de cuerda ≤ `chordTol`; máx. 4096 puntos
- `segAreaTerm(s)` → aporte a `½∮(x dy − y dx)` (exacto salvo spline)
- `segMomentTerms(s)` → `{ A, Sx, Sy }`: `A` como arriba, `Sx = ½∮x² dy` (=∬x dA), `Sy = −½∮y² dx` (=∬y dA)
- `segTransform(s, m)` con `m = [a, b, c, d, e, f]`: `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.
  Arco/círculo con transformación de semejanza (incluye espejo, que invierte `ccw`) sigue siendo arco/círculo;
  con escala no uniforme se convierte en `ellipse`. Bézier/spline transforman sus puntos de control.
- `isClosedSegment(s)` → true para circle, elipse completa, spline/bezier con inicio = fin
- `segClosestPoint(s, p)` → `{ d, t, q }` punto más cercano
- `segSnapPoints(s)` → `[{ p, kind: 'end' | 'mid' | 'center' | 'quadrant' }]`

## C2. Contornos y regiones — `src/geom2d/loops.js`

- `buildLoops(segments, { tol = 1e-6 })` →
  `{ loops: Loop[], open: Chain[], stats: { segments, duplicatesRemoved, zeroLengthRemoved, loops, openChains, junctions } }`
  - `Loop = { segs: Segment[] }` conectado y orientado de forma consistente (fin del último = inicio del primero, ± tol).
  - `Chain = { segs: Segment[] }` cadena abierta que no cerró (se informa, no se usa en 3D).
  - Quita duplicados geométricos y segmentos de longitud cero. Suelda extremos de líneas al punto común.
- `loopInfo(loop, chordTol = 0.01)` →
  `{ area, signedArea, perimeter, centroid: [x, y], bbox, circle: null | { c, r }, poly: [[x, y], ...] }`
  (área, perímetro y centroide exactos según C1; `poly` teselado para dibujo y punto-en-polígono).
- `orientLoop(loop, ccw)` → copia con la orientación pedida.
- `pointInPolygon(p, poly)` → boolean.
- `buildRegions(loops, { chordTol })` →
  `{ nodes: [{ loop, parent, depth, children }], regions: [{ outer, holes: [loopIndex, ...] }] }`
  Región = contorno de profundidad par + sus hijos directos (agujeros). Islas dentro de agujeros = nuevas regiones.
- `bboxOfSegments(segs)`.

## C3. Importadores

`src/importers/dxf.js` — `parseDXF(text)` →
```js
{
  units: { insunits: number | null, name: 'mm'|'cm'|'m'|'in'|'ft'|'unitless'|..., toMM: number },
  layers: [{ name, color, linetype, frozen, off }],
  segments: Segment[],          // con meta { layer, entity, color, linetype, dashed }
  texts: [{ text, p: [x, y], h, rot, layer }],   // solo para mostrar
  stats: { entities: { LINE: n, ... }, ignored: { DIMENSION: n, ... } },
  warnings: [string]
}
```
Lanza `Error` (mensaje en español) para DXF binario o ilegible. `dashed` = tipo de línea de
eje/oculta/trazos (CENTER, HIDDEN, DASHED, PHANTOM, DOT, …) resolviendo BYLAYER/BYBLOCK.

`src/importers/svg.js` — `parseSVG(text)` → `{ units, segments, warnings }` (Y invertida: SVG baja, plano sube).

`src/importers/image-trace.js` — `traceImage({ width, height, data }, opts)` →
`{ segments, stats, threshold }` en **píxeles** con Y hacia arriba; la UI aplica la escala (mm/px).

## C4. Kernel CAD — `src/kernel/core.js`, `worker-entry.js`, `client.js`

`core.js` (Node y navegador):
```js
export async function init({ wasmBinary } = {})   // → { ms }
export function build(job)                        // → BuildResult (guarda la forma actual)
export function distance(a, b)                    // → { distance, p1, p2 }
export function exportShape(opts)                 // → { data: ArrayBuffer | string, mime, ext }
export function tessellate(opts)                  // → { vertices, normals, triangles }
export async function handle({ type, payload })   // despacho: 'init'|'build'|'distance'|'export'|'tessellate'
```

`client.js` (UI): `new KernelClient()`, `await start({ onStatus })`, `build(job)`, `distance(a, b)`,
`exportShape(opts)`, `tessellate(opts)`, `mode` (`'worker'` | `'main'`). Mensajes `{ id, type, payload }` →
`{ id, ok, result | error }` con typed arrays transferidos.

### Job
```js
{
  mode: 'extrude' | 'revolve' | 'multiview',
  tol: 0.01,                                   // tolerancia de unión (mm)
  regions: [{                                  // extrude y revolve; coordenadas en mm
    id,
    outer: Loop,
    holes: [{ loop: Loop, op: 'through' | 'blind' | 'none', depth }],
    height,                                    // opcional; por defecto extrude.thickness
    z0                                         // opcional; por defecto 0 (o −t/2 si symmetric)
  }],
  extrude: { thickness, symmetric: false, fillets: { vertical: 0, top: 0, chamferTop: 0 } },
  revolve: { axis: { p: [x, y], d: [dx, dy] }, angleDeg: 360 },
  multiview: { views: [{ role: 'top' | 'front' | 'right' | 'left', regions: [{ outer: Loop, holes: [Loop] }] }] },
  mesh: { tolerance, angularTolerance }        // opcional; por defecto automático según tamaño
}
```

Multivista (reconstrucción por siluetas, alineando por cajas envolventes de cada vista, `u,v` = coords del plano):
- `top`   (vista desde +Z): `X = u − minU`, `Y = v − minV`; prisma a lo largo de Z en `[0, H]`
- `front` (vista desde −Y): `X = u − minU`, `Z = v − minV`; prisma a lo largo de Y en `[0, D]`
- `right` (vista desde +X): `Y = u − minU`, `Z = v − minV`; prisma a lo largo de X en `[0, W]`
- `left`  (vista desde −X): `Y = maxU − u`, `Z = v − minV`; prisma a lo largo de X en `[0, W]`
Intersección de todos los prismas; advertir si W/D/H difieren > 0.5 % entre vistas.

### BuildResult
```js
{
  mesh: { vertices: Float32Array, normals: Float32Array, triangles: Uint32Array,
          faceGroups: [{ start, count, faceId }] },          // start/count en unidades de índice (count/3 triángulos)
  edges: { positions: Float32Array,                        // pares de puntos: cada 6 floats = 1 segmento
           edgeGroups: [{ start, count, edgeId }] },         // start/count en vértices de positions (count par)
  topology: {
    faces: [{ id, type: 'plane'|'cylinder'|'cone'|'sphere'|'torus'|'bspline'|'other', area,
              center: [x,y,z], normal?: [x,y,z], radius?, axis?: { p: [x,y,z], d: [x,y,z] }, semiAngleDeg? }],
    edges: [{ id, type: 'line'|'circle'|'ellipse'|'bspline'|'other', length, start, end, closed,
              radius?, center?, normal?, dir? }],
    vertices: [{ id, p: [x,y,z] }]
  },
  props: {
    volume, area, centroid: [x,y,z],
    inertia: { Ixx, Iyy, Izz, Pxy, Pxz, Pyz },   // respecto al centroide, densidad 1 (mm^5)
    principal: { moments: [I1, I2, I3], axes: [[..], [..], [..]] },  // ascendentes
    bbox: { min: [..], max: [..], size: [..] },
    counts: { solids, shells, faces, edges, vertices, faceTypes: { plane: n, ... } },
    valid, closed
  },
  warnings: [string],
  timings: { buildMs, meshMs, propsMs }
}
```
Tensor: `[[Ixx, −Pxy, −Pxz], [−Pxy, Iyy, −Pyz], [−Pxz, −Pyz, Izz]]`, `Pxy = ∫xy dV` (relativo al centroide).
`faceId`/`edgeId` coinciden con `faceGroups`/`edgeGroups`. Distancia: `a`, `b` =
`{ kind: 'face'|'edge'|'vertex', id }` o `{ kind: 'point', p: [x,y,z] }`.
Exportación: `{ format: 'step'|'stl'|'stl-ascii', tolerance, angularTolerance, name }`.

## C5. Visor 3D — `src/viewer/viewer3d.js`, `src/viewer/measure.js`

```js
new Viewer3D(container, { theme })
  .setModel(buildResult, { color, metalness, roughness }) / .clearModel()
  .setAppearance({ color, metalness, roughness, opacity })
  .setView('iso'|'front'|'back'|'top'|'bottom'|'left'|'right') / .fit()
  .setProjection('perspective'|'orthographic')
  .setDisplay({ edges, wireframe, xray, grid, axes, bbox })
  .setSection({ enabled, axis: 'x'|'y'|'z', offset, flip })
  .screenshot(scale) → Promise<Blob>
  .getExportMesh() → THREE.Mesh
  .pick(clientX, clientY) → { kind: 'vertex'|'edge'|'face', id, point, normal? , snapped } | null
  .setHighlight(entities) / .setHover(entity)
  .on('hover'|'pick'|'cursor', cb) / .resize() / .dispose()

new MeasureTools(viewer, { kernel, format, onChange })
  .setTool('none'|'inspect'|'point'|'distance'|'angle'|'radius'|'area'|'coords'|'thickness')
  .list() / .remove(id) / .clear()
```
Medición: `{ id, tool, title, text, values }` (texto en español, unidades vía `format`).

## C6. Vista 2D — `src/ui/view2d.js`

```js
new View2D(container)
  .setDrawing({ segments, texts, layers }, { loops, loopInfos, open, regions })
  .setLayerVisible(name, bool) / .setRegionState(i, { included, selected, role }) / .fit()
  .setMode('select'|'window'|'measure'|'calibrate'|'axis') / .showAxis({ p, d } | null)
  .showViewBoxes([{ role, box: { minX, minY, maxX, maxY } }]) / .clearMeasures()
  .on('regionClick'|'loopClick'|'window'|'measure'|'calibrate'|'axisPick'|'cursor', cb)
```

## C7. Materiales y reporte — `src/ui/materials.js`, `src/ui/report.js`

`MATERIALS = [{ id, name, group, density /* g/cm³ */, uts?, yieldStrength?, shear? /* MPa */, E? /* GPa */, color, metalness, roughness }]`

`computePartData({ build, material, profile, mode, thickness, pricePerKg, blankMargin })` → datos de pieza
(masa, volumen, área, caja envolvente, centroide, inercia másica, datos de lámina/troquelado, verificación
de precisión, costo). `toCSV`, `toJSON`, `reportHTML`, y formateadores `fmt` métrico/imperial.
