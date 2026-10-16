# Simulador Plano 2D → Pieza 3D

Aplicación de navegador que convierte un plano 2D (DXF, DWG, SVG o imagen) en una pieza 3D exacta
(B-rep de OpenCascade) y calcula sus datos físicos: masa, volumen, densidad, caja envolvente,
centro de masa, tensor de inercia y datos de troquelado. Incluye herramientas de medición 2D/3D y
exportación a STEP, STL, OBJ, GLB y reportes. Pensada para ingeniería de producto y cotización en
estampado de metal.

## Descarga rápida

- **Un solo archivo:** descargue solo `simulador/Simulador-Plano-3D.html` (~11 MB) y ábralo con
  doble clic. Lleva todo dentro (estilos, motor CAD y ejemplos).
- **Carpeta completa:** descargue el ZIP del repositorio (botón «Code» → «Download ZIP»),
  descomprímalo y abra `simulador/index.html` con doble clic.

La primera carga tarda unos segundos mientras arranca el motor CAD (OpenCascade en WebAssembly);
la barra superior muestra «Motor CAD listo» cuando termina. No necesita instalación ni internet.
Probado en Chrome y Edge (Chromium); Firefox y Safari en versiones recientes también deberían
funcionar.

## Cómo abrirlo

- **Local:** doble clic en `simulador/index.html` (usa `build/`) o en
  `simulador/Simulador-Plano-3D.html` (todo incrustado). Funciona sin internet.
- **GitHub Pages:** `https://<usuario>.github.io/skills-github-pages/simulador/`, cuando Pages esté
  activo en la rama publicada.

## Funciones

- **Importación**
  - DXF ASCII (unidades `$INSUNITS`, capas, bloques anidados, splines, polilíneas con abombado),
    DWG R13–2018 (se convierte a DXF en el navegador con el conversor WebAssembly de dwgdxf),
    SVG (unidades, transformaciones, curvas Bézier) e imágenes PNG/JPG (trazado por umbral).
  - Unidades del plano automáticas o forzadas (mm, cm, m, in, ft); capas visibles/ocultas; líneas de
    eje y ocultas ignoradas.
- **Detección de geometría:** contornos cerrados, agujeros, cadenas abiertas y **marco del plano**
  (borde simple o doble). El marco se excluye solo; el interruptor «Incluir marco en el modelo» del
  paso 1 lo vuelve a incluir.
- **Operaciones**
  - Extrusión con altura y Z0 por región, agujeros pasantes o ciegos, redondeo de aristas
    verticales y superiores, y chaflán superior.
  - Revolución alrededor del eje X, del eje Y o de una línea elegida con un clic en el plano (línea
    de centros), con ángulo de 1° a 360°.
  - Multivista por siluetas: se encuadra la planta, el alzado y las laterales con «Definir ventana»;
    la pieza es la intersección de las siluetas extruidas. Da igual el sistema de proyección (primer o
    tercer ángulo): cada vista se alinea por su propia caja envolvente.
- **Espesor:** valor libre, calibres de lámina (10–26 ga) o accesos rápidos; extrusión simétrica.
- **Visor 3D:** vistas estándar, ortográfica/perspectiva, aristas, rayos X, alambre, rejilla, caja
  envolvente y corte de sección (X, Y o Z). Pestañas «Plano 2D», «Pieza 3D» y «Dividido».
- **Propiedades:** masa, volumen, densidad, área de superficie, caja envolvente, centro de masa,
  tensor de inercia y momentos principales.
- **Datos de troquelado:** blank, aprovechamiento de lámina, longitud de corte, fuerza de corte,
  pesos (neto, blank, desperdicio) y costo.
- **Materiales:** 53 materiales (aceros, inoxidables, aluminios, cobre y latón, plásticos, caucho…)
  y material personalizado con densidad propia.
- **Medición** en 2D (distancias y radios con referencias a extremos, centros, puntos medios y
  cuadrantes) y en 3D (punto, distancia, ángulo, radio, área, coordenadas y espesor).
- **Unidades de trabajo** mm o in (barra superior) para todos los valores y mediciones; tema
  oscuro o claro.
- **Calibración de imágenes** con dos puntos de distancia conocida.
- **Exportación:** STEP exacto, STL (binario y ASCII), OBJ, GLB, PLY, reporte imprimible / PDF,
  CSV, JSON y PNG.

## Precisión

- La pieza es un B-rep exacto de OpenCascade: arcos, círculos y elipses se conservan como curvas
  analíticas y el STEP sale sin facetar.
- El volumen se verifica contra el área 2D analítica del perfil (extrusión) y el teorema de Pappus
  (revolución); el reporte muestra la diferencia relativa.
- Las propiedades de contornos con B-splines usan integración adaptativa.
- STL, OBJ, GLB y PLY son mallas teseladas (aproximadas); para fabricación use el STEP.

## Recorrido con los ejemplos

Menú **Ejemplos** de la barra superior:

1. **Placa soporte**: placa 150×80 con esquinas R6, muesca, ranura y barrenos; extrusión de 2 mm.
2. **Brida con bloques**: brida Ø150 con barrenos definidos con bloques anidados.
3. **Flecha escalonada**: medio perfil revolucionado 360° alrededor de su línea de centros. Pruebe
   «Elegir línea…» y haga clic en la línea de centros.
4. **Bloque en L (vistas)**: reconstrucción por multivista. Borre una ventana y vuelva a definirla
   arrastrando un rectángulo en la vista 2D.
5. **Leva (pulgadas)**: plano en pulgadas con contorno SPLINE.
6. **Junta (solo líneas y arcos)**: entidades desordenadas y duplicadas que se unen solas.
7. **Placa con logo (SVG)**: recortes Bézier, ranuras y elipse.
8. **Junta escaneada (imagen)**: trazado de una imagen. Pruebe «Calibrar con 2 puntos».

## Atajos de teclado

Los atajos sin `Ctrl` no actúan mientras se escribe en un campo ni con un diálogo abierto.

| Tecla | Acción |
| --- | --- |
| `Ctrl+O` | Abrir plano |
| `G` · `Ctrl+Enter` | Generar la pieza 3D |
| `Ctrl+S` | Exportar STEP |
| `Ctrl+P` | Reporte (imprimir / PDF) |
| `I` | Inspeccionar (cara, arista o vértice) |
| `P` | Punto a punto |
| `D` | Distancia mínima |
| `A` | Ángulo |
| `R` | Radio / Ø |
| `F` | Área |
| `C` | Coordenadas |
| `T` | Espesor |
| `1` `2` `3` `4` | Vistas isométrica, frente, superior y derecha |
| `Inicio` (`Home`) | Ajustar a la vista (2D, 3D o ambas en vista dividida) |
| `O` | Ortográfica / perspectiva |
| `S` | Corte de sección |
| `E` | Aristas |
| `X` | Rayos X |
| `W` | Alambre |
| `Esc` | Cerrar diálogo, menú o panel; cancelar la herramienta de medición, la ventana de vista, la calibración o la elección del eje |
| `?` | Ayuda |

Las herramientas de medición (`I` a `T`) pasan a la pestaña «Pieza 3D» si está abierta la del plano.
La ayuda (`?`) de la aplicación muestra la misma lista.

## Limitaciones

- DXF binario no soportado (guarde el DXF como ASCII).
- La multivista reconstruye por siluetas: no reproduce cavidades ocultas ni huecos que no se vean en
  ninguna vista.
- Las imágenes se trazan de forma aproximada; las medidas dependen de la calibración (mm/px).
- Archivos muy grandes (decenas de miles de entidades) pueden tardar o agotar la memoria del
  navegador.

## Para desarrolladores

```
simulador/
  index.html        página (abre build/app.js)
  Simulador-Plano-3D.html  versión de un solo archivo (npm run build:single)
  css/              estilos
  src/app/          integración: main.js, pipeline.js, paneles, modos (modes-ui.js), app-api.js
  src/importers/    DXF, DWG, SVG e imagen
  src/geom2d/       geometría 2D (segmentos, contornos, regiones)
  src/kernel/       motor CAD (OpenCascade vía replicad) en un worker
  src/viewer/       visor 3D (three.js) y medición
  src/ui/           vista 2D, materiales, reportes
  samples/          planos de ejemplo
  scripts/          build.mjs y generadores de ejemplos
  tests/            pruebas de Node (*.test.mjs) y del navegador (browser/*.e2e.mjs)
  build/            paquete generado (se publica tal cual)
  docs/             ARQUITECTURA.md (contratos entre módulos)
```

```
cd simulador
npm ci
npm run build          # genera build/
npm run build:single   # además, Simulador-Plano-3D.html (un solo archivo, ~11 MB)
npm test           # pruebas de Node
node tests/browser/app-core.e2e.mjs    # e2e (Playwright + Chromium)
node tests/browser/app-modes.e2e.mjs
```

`build:single` incrusta en `index.html` el CSS, `build/occt-wasm.js`, `build/kernel.js` y
`build/app.js`. Las pruebas e2e de `tests/browser/` reconstruyen `build/`. Los contratos entre módulos están en
`docs/ARQUITECTURA.md`. La app debe seguir funcionando desde `file://`: nada de `fetch`/XHR ni
`import()` dinámico.

## Licencias

- OpenCascade Technology: LGPL-2.1 (vía `replicad-opencascadejs`).
- replicad: MIT.
- three.js: MIT.
