# FotoMetría 3D — fotogrametría de piezas estampadas en el navegador

Sistema completo de fotogrametría que corre **100 % en el navegador** (sin servidor, sin instalar nada):
imprime un tapete de calibración, carga las fotos de la pieza, calibra la cámara, reconstruye la pieza en
3D con la GPU, permite medirla y manipularla, la compara contra el CAD y entrega un reporte con
porcentajes de efectividad y la incertidumbre estimada en milímetros.

> Las fotos se procesan localmente en su computadora; nunca se suben a ningún servidor.

## Cómo abrirlo

- **GitHub Pages:** active Pages en el repositorio (Settings → Pages → rama `main`) y abra
  `https://<usuario>.github.io/<repositorio>/fotogrametria/`.
- **Local:** sirva la carpeta con cualquier servidor estático (los módulos ES no funcionan con `file://`):

  ```bash
  cd fotogrametria
  npx http-server -p 8080 -c-1 .      # o: python3 -m http.server 8080
  # abrir http://localhost:8080
  ```

Requisitos: Chrome/Edge 113+, Firefox 115+ o Safari 16.4+ con **WebGL2** (cualquier GPU de los
últimos ~8 años). Para fotos de iPhone use JPEG («Más compatible») en vez de HEIC.

Pulse **▶ Demo** para ver el flujo completo con 22 fotos sintéticas de un soporte estampado.

## Flujo de trabajo (7 pasos)

| Paso | Qué hace |
|---|---|
| 1 · Patrones | Genera el **tapete de calibración** (anillo de marcadores ArUco 5×5 + moteado aleatorio + barras de escala) en PDF vectorial a tamaño real, **calcomanías de control** para la pieza (IDs 200–249) y **hojas de moteado**. Permite corregir la escala de la impresora midiendo las barras impresas. |
| 2 · Fotos | Carga por arrastre; detecta los marcadores en paralelo (Web Workers), mide nitidez y exposición, y muestra cada foto con sus marcadores. |
| 3 · Calibración | Calibra la cámara (focal, punto principal, distorsión k1 k2 p1 p2 [k3]) y la pose de cada foto con ajuste de haces robusto; refina las esquinas con el modelo de lente y valida con **puntos de control independientes**. |
| 4 · Reconstruir | Localiza la pieza, calcula mapas de profundidad con **PatchMatch multivista en la GPU** (planos inclinados, correlación normalizada, mejores vistas) y los fusiona en un volumen **TSDF** del que se extrae una malla con color. |
| 5 · Visor 3D | Gire, desplace y acerque la pieza; modos color real, **textura fotográfica**, metálico, alambre, puntos, confianza y desviación. Medición de **distancia, coordenadas, ángulo y radio/diámetro**, **secciones** con perfil exportable, mover/rotar, suavizar, recortar y exportar **STL, PLY, OBJ, GLB**. |
| 6 · Resultados | **Índice global de calidad**, porcentajes de efectividad por indicador, **incertidumbre estimada (95 %)**, dimensiones, gráficas, recomendaciones y **reporte imprimible/PDF**, CSV y JSON. |
| 7 · Comparar CAD | Carga STL/OBJ nominal, alinea automáticamente (ejes principales + ICP punto-a-plano con compatibilidad de normales), colorea la desviación y reporta % dentro de tolerancia, media, RMS, máximos y cobertura. |

## Guía rápida de captura (precisión milimétrica)

1. Imprima el tapete **al 100 %** en papel mate y péguelo sobre una base **rígida y plana**.
2. Mida con calibrador las barras de escala impresas y capture los valores (paso 1).
3. Piezas brillantes: **spray revelador mate** + moteado (marcador, aerógrafo u hoja de moteado).
   Opcional: calcomanías de control en zonas planas.
4. 20–40 fotos, misma cámara y zoom, en 2–3 anillos (≈40°, 55°, 75° de elevación) alrededor de toda
   la pieza; cada foto con la pieza completa y ≥ 6 marcadores. Luz difusa, fotos nítidas.

## ¿Qué precisión da y cómo se sabe?

El sistema **mide** su propia precisión en cada proyecto, no la supone:

- **Puntos de control independientes:** 1 de cada 4 marcadores del tapete se excluye de la calibración
  y luego se triangula; el error contra su posición conocida da la exactitud 3D real de la red de fotos.
- **Ruido de profundidad:** la parte visible del tapete es un plano conocido (Z = 0); la dispersión de la
  superficie reconstruida sobre él mide el ruido de la reconstrucción densa.
- **Incertidumbre (95 %)** = 2·√(σ_control² + σ_superficie² + (vóxel/4)²), comparada con la tolerancia
  objetivo (±1 mm por defecto) para emitir el veredicto «cumple / no cumple».
- Además: % de fotos registradas, error de reproyección, cobertura angular, % de superficie vista por
  ≥ 3 fotos, % de píxeles con correspondencia confiable, nitidez, etc.

### Validación con datos sintéticos (verdad conocida)

Pruebas automáticas con fotos renderizadas de la pieza demo (cámara con distorsión, ruido, JPEG):

| Prueba | Resultado medido |
|---|---|
| Esquinas de marcadores (render CPU, vistas oblicuas) | 0.01–0.04 px RMS |
| Focal / punto principal (14 vistas) | 0.007 % / < 0.1 px |
| Puntos de control 3D (render CPU) | 0.0025 mm RMS |
| Flujo completo en navegador (12 fotos de 1600×1200, calidad de prueba 640 px) | control 3D 0.11 mm RMS; ruido de mesa σ 0.024 mm; **99.7 % de la malla a < 1 mm** y 96.4 % a < 0.5 mm de la pieza real (mediana 0.03 mm) |

Con fotos reales la precisión depende sobre todo de la textura de la pieza, la planitud del tapete,
la nitidez y la geometría de la toma; el reporte lo indica en cada caso.

## Arquitectura

```
fotogrametria/
├─ index.html, css/app.css         interfaz (español, tema claro/oscuro)
├─ js/app.js                       estado, navegación y orquestación
├─ js/project.js                   fotos, detección, calibración, control, calcomanías
├─ js/core/                        álgebra lineal, modelo de cámara (Brown–Conrady), EXIF,
│                                  detector ArUco propio con refinamiento subpíxel por bordes,
│                                  calibración Zhang + Levenberg–Marquardt (Schur), PnP,
│                                  triangulación, tapete/patrones, PDF vectorial
├─ js/mvs/                         WebGL2: corrección de distorsión + recorte, PatchMatch MVS,
│                                  selección de vistas y orquestación de la reconstrucción
├─ js/mesh/                        TSDF disperso + Surface Nets, limpieza/suavizado, textura
├─ js/analysis/                    métricas, distancias punto–malla, ICP
├─ js/viewer/                      visor three.js, mediciones y secciones
├─ js/workers/                     detección (pool) y fusión TSDF en hilos separados
├─ js/demo/                        generador de la demostración (pieza estampada procedural)
├─ lib/three/                      three.js r180 (MIT) incluido localmente (funciona sin internet)
└─ tests/                          pruebas unitarias (Node) y de punta a punta (Chromium headless)
```

## Pruebas

```bash
cd fotogrametria
npm test                 # unitarias: detector, calibración, TSDF, ICP (≈ 30 s)
npm run test:e2e         # flujo completo en Chromium headless con GPU por software (≈ 10–15 min)
```

## Limitaciones conocidas

- Se reconstruye lo que ven las cámaras: la cara apoyada en la mesa no aparece (voltee la pieza y
  haga una segunda sesión si la necesita).
- Superficies espejo o totalmente lisas no tienen correspondencias: aplique revelador mate y moteado.
- Las paredes muy delgadas (< 3 vóxeles) pueden perder una de sus caras; indique el espesor de lámina.
- Todas las fotos deben ser de la misma cámara, con el mismo zoom y la misma orientación de imagen.

## Créditos y licencias

- [three.js](https://threejs.org) r180 — licencia MIT (`lib/three/LICENSE`).
- Tabla de códigos del diccionario ArUco `DICT_5X5_250` tomada de OpenCV (Apache 2.0) para
  compatibilidad con otros programas; el detector y la calibración son implementaciones propias.
