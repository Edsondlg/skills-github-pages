# Simulador Plano 2D → Pieza 3D

Aplicación de navegador que convierte un plano 2D (DXF, SVG o imagen) en una pieza 3D exacta
(B-rep de OpenCascade) y calcula sus datos físicos: masa, volumen, densidad, caja envolvente,
centro de masa, tensor de inercia y datos de troquelado. Incluye herramientas de medición 2D/3D y
exportación a STEP, STL, OBJ, GLB y reportes. Pensada para ingeniería de producto y cotización en
estampado de metal.

## Cómo abrirlo

- **Local:** doble clic en `simulador/index.html`. Funciona en Chrome, Edge o Firefox, sin instalar
  nada y sin internet (todo va dentro de `build/`).
- **GitHub Pages:** `https://<usuario>.github.io/skills-github-pages/simulador/`, cuando Pages esté
  activo en la rama publicada.

## Funciones

- **Importación**
  - DXF ASCII (unidades `$INSUNITS`, capas, bloques anidados, splines, polilíneas con abombado),
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
- **Propiedades:** masa, volumen, densidad, área de superficie, caja envolvente, centro de masa,
  tensor de inercia y momentos principales.
- **Datos de troquelado:** blank, aprovechamiento de lámina, longitud de corte, fuerza de corte,
  pesos (neto, blank, desperdicio) y costo.
- **Materiales:** 53 materiales (aceros, inoxidables, aluminios, cobre y latón, plásticos, caucho…)
  y material personalizado con densidad propia.
- **Medición** en 2D (distancias y radios con referencias a extremos, centros, puntos medios y
  cuadrantes) y en 3D (punto, distancia, ángulo, radio, área, coordenadas y espesor).
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

| Tecla | Acción |
| --- | --- |
| `I` | Vista isométrica |
| `P` | Perspectiva / ortográfica |
| `D` | Medir distancia |
| `A` | Medir ángulo |
| `R` | Medir radio |
| `F` | Ajustar a la vista |
| `C` | Coordenadas de un punto |
| `T` | Espesor |
| `Esc` | Cancelar la herramienta, la ventana o la calibración en curso |
| `1`–`4` | Vistas frontal, superior, derecha e isométrica |
| `Home` | Ajustar la vista 2D |
| `O` | Abrir plano |
| `E` | Elegir eje de revolución |
| `X` | Corte de sección |
| `W` | Ventana de vista (multivista) |
| `S` | Seleccionar (2D) |
| `G` | Generar la pieza |
| `Ctrl+O` | Abrir plano |
| `Ctrl+S` | Exportar STEP |
| `Ctrl+P` | Reporte imprimible |
| `?` | Ayuda |

La ayuda (`?`) de la aplicación muestra la lista vigente.

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
  css/              estilos
  src/app/          integración: main.js, pipeline.js, paneles, modos (modes-ui.js), app-api.js
  src/importers/    DXF, SVG e imagen
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
npm run build      # genera build/
npm test           # pruebas de Node
node tests/browser/app-core.e2e.mjs    # e2e (Playwright + Chromium)
node tests/browser/app-modes.e2e.mjs
```

Las pruebas e2e de `tests/browser/` reconstruyen `build/`. Los contratos entre módulos están en
`docs/ARQUITECTURA.md`. La app debe seguir funcionando desde `file://`: nada de `fetch`/XHR ni
`import()` dinámico.

## Licencias

- OpenCascade Technology: LGPL-2.1 (vía `replicad-opencascadejs`).
- replicad: MIT.
- three.js: MIT.
