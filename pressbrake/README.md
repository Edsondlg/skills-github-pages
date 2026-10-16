# Simulador de Plegado (press brake)

Aplicación web 100 % en el navegador: cargas una pieza de lámina en **STEP** y simula todo el proceso de plegadora CNC.

**Abrir:** `pressbrake/index.html` (GitHub Pages: `https://<usuario>.github.io/skills-github-pages/pressbrake/`).
Ejemplos directos: `?sample=bracket`, `?sample=canal`, `?sample=tray`.

## Qué hace
- **Lectura STEP** con OpenCascade (occt-import-js, WASM). El archivo no sale de tu equipo.
- **Reconocimiento de lámina:** espesor, dobleces (cilindros coaxiales interior/exterior), radio, ángulo, largo de doblez, alas, barrenos.
- **Desarrollo plano** con factor K (auto o manual): tamaño de blank, longitud de corte y perforaciones.
- **Secuencia de doblado** automática con chequeo de colisión pieza ↔ punzón / matriz / mesa y tipo de manipulación (reposición, giro, volteo).
- **Herramental y fuerza:** V recomendada, radio natural, tonelaje por doblez (fórmula de doblado al aire), ángulo de comando con recuperación elástica.
- **Tiempos:** carga, tope trasero, aproximación, doblado, descompresión, retorno, descarga; OEE.
- **Costo por pieza:** material + merma, corte láser, doblado (máquina + operador), preparación prorrateada al lote, margen. Exporta CSV y reporte imprimible.
- **Visualización 3D** (three.js, PBR, sombras, bloom): plegadora animada con trabe, punzón seccionado, matriz V, tope trasero, consola CNC en vivo; modo *Pieza / desarrollo* para ver plano ↔ formado.

## Limitaciones
- Dobleces con radio interior 0 (aristas vivas) no se detectan como doblez.
- Piezas con esquinas cerradas/soldadas (lazos) no se desdoblan.
- Tiempos, tonelaje y K son estimaciones de ingeniería: ajusta los parámetros a tu máquina.

## Pruebas
```
cd pressbrake && npm install && npm test
```
Valida espesor, número de dobleces, barrenos, desdoblado plano exacto y secuencia sin colisiones en las piezas de `samples/`.
