# Simulador de Doblado Rotativo

Simulador de doblado rotativo de tubo con mandril (rotary draw bending). Cargas un tubo doblado en
STEP y el simulador:

1. **Lee la geometría** (rectas, dobleces, CLR, ángulos, diámetro, espesor de pared, incluido el
   **calibre variable** interior) y genera el **programa de doblado LRA/YBC** y la tabla XYZ.
2. **Diseña el herramental**: dado de doblez (apilado si hay varios CLR), mordaza, dado de presión,
   limpiador (wiper), mandril de tapón o de bolas y boquilla (collet).
3. **Define el proceso**: secuencia de máquina (carga, avance, giro, cierre, doblez, retracción del
   mandril, recuperación elástica, regreso, descarga), sobredoblado por springback, empuje (boost),
   velocidades y tiempo de ciclo.
4. **Analiza cada doblez**: deformaciones verdaderas, adelgazamiento y engrosamiento, ovalidad,
   índice de arrugas, índice de colapso, diagrama límite de formado (**FLD**), fuerzas (momento,
   par, dado de presión, mordaza, mandril, limpiador, empuje) contra la capacidad de la máquina.
5. **Calcula costos**: masa (integrando el calibre variable), material, máquina, herramental
   amortizado, preparación, scrap, indirectos y margen, en USD o MXN.
6. **Simula en 3D** la máquina CNC con el tubo deformándose: mapas de espesor, adelgazamiento,
   deformación mayor y zonas FLD; vista de corte con el mandril de bolas dentro del tubo; mostrar u
   ocultar cada herramienta; secciones transversales en cualquier punto del tubo.

## Cómo abrirlo

| Opción | Qué hacer |
|---|---|
| **Archivo único (recomendado)** | Doble clic en `SimuladorDobladoTubo.html`. Funciona sin internet en Chrome, Edge o Firefox. |
| **Ejecutable de escritorio** | Descomprime `SimuladorDoblado-Windows.zip` y da doble clic en `SimuladorDoblado.exe` (deja `resources.neu` junto al ejecutable). También hay zips para macOS y Linux. |
| **Servidor local** | `cd tube-bending && npm install && npm run serve` y abre `http://127.0.0.1:8080/`. |

Para generar los entregables: `npm run build` crea `dist/SimuladorDobladoTubo.html`;
`npm run desktop` crea además los zips de escritorio en `dist/` (descarga Neutralino la primera vez).

## Qué lee del STEP

- AP203 / AP214 / AP242, un sólido de tubo, en mm, m o pulgadas.
- Rectas como superficies cilíndricas y dobleces como superficies toroidales. Si el CAD exportó los
  dobleces como B-spline, el ángulo y el CLR se infieren de las rectas vecinas (con aviso).
- Dobleces de 180° y dobleces compuestos sin recta intermedia.
- Calibre variable: superficies internas cilíndricas, cónicas (transiciones) y toroidales. Si el
  archivo no trae superficie interior, el espesor se captura a mano.
- Extremo inicial A o B a elegir (invierte el orden de doblado).

## Materiales incluidos

Acero bajo carbono (SAE 1010 CEW, SAE 1020 DOM), HSLA (340, 420, 550), AHSS (DP590, DP780, DP980,
CP800, TRIP780, MS1180, MS1500), inoxidable (AISI 409, AISI 304) y aluminio (6061-T4, 6063-T5).
Las propiedades son valores típicos y se pueden editar por pieza (σy, σu, n, K, precio).

## Modelo de ingeniería: alcance y límites

Es un estimador analítico-empírico, no un análisis por elemento finito. Sirve para comparar
alternativas, dimensionar herramental y detectar riesgos antes de la prueba física.

- Deformaciones por flexión pura con desplazamiento del eje neutro, ovalización empírica según
  Brazier y soporte del mandril, arrugas por deformación crítica de pandeo de cascarón con factores de
  soporte (mandril, bolas, limpiador, holgura), colapso por ovalidad admisible.
- FLC según Keeler-Brazier para aceros convencionales y valores publicados para AHSS; zona del cordón
  de soldadura con factor reductor.
- Springback por descarga elástica del momento de doblez con factor de calibración editable.
- Las constantes de calibración están en `js/mechanics.js` (`CAL`, `LIMITS`) y se documentan en el
  código. Ajústelas con datos de prueba de su planta antes de usar los resultados para liberar
  producción.

## Desarrollo

```
tube-bending/
  index.html, css/, js/app.js      interfaz
  js/step-parser.js, tube-extract.js   lectura STEP
  js/geometry.js, kinematics.js        programa LRA y cinemática de la máquina
  js/process.js, mechanics.js, materials.js, machines.js, cost.js   ingeniería
  js/scene/                        visor 3D (three.js)
  js/ui/panels/                    paneles de resultados
  samples/                         piezas de ejemplo
  test/                            pruebas (node --test) y fixtures STEP reales
  tools/                           servidor, capturas, empaquetado
```

`npm test` ejecuta las pruebas. Las fixtures STEP se generan con OpenCascade
(`tools/fixtures/make_fixtures.py`).
