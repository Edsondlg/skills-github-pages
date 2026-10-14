"""Verificación aproximada de interferencias entre componentes (por muestreo).

Para cada par de componentes cuyas cajas envolventes se traslapan se toma una
rejilla de puntos en la zona común y se cuenta cuántos caen dentro del material
de ambos. Las caras en contacto (poste en su barreno, placas apiladas) no cuentan
como interferencia.
"""

from __future__ import annotations

import math
from itertools import combinations

from .geometry import Componente, cajas_se_traslapan

MAX_PUNTOS_POR_PAR = 20000


def buscar_interferencias(componentes: list[Componente], paso: float = 2.0) -> list[dict]:
    resultado = []
    for a, b in combinations(componentes, 2):
        caja_a, caja_b = a.bbox(), b.bbox()
        if not cajas_se_traslapan(caja_a, caja_b, minimo=0.05):
            continue
        zona = [max(caja_a[i], caja_b[i]) for i in range(3)] + [min(caja_a[i + 3], caja_b[i + 3]) for i in range(3)]
        lados = [zona[i + 3] - zona[i] for i in range(3)]
        h = paso
        while math.prod(max(1, int(lado / h)) for lado in lados) > MAX_PUNTOS_POR_PAR:
            h *= 1.25
        n = [max(1, int(lado / h)) for lado in lados]
        dentro = 0
        for i in range(n[0]):
            px = zona[0] + (i + 0.5) * lados[0] / n[0]
            for j in range(n[1]):
                py = zona[1] + (j + 0.5) * lados[1] / n[1]
                for k in range(n[2]):
                    pz = zona[2] + (k + 0.5) * lados[2] / n[2]
                    if a.contiene(px, py, pz) and b.contiene(px, py, pz):
                        dentro += 1
        if dentro:
            volumen_celda = (lados[0] / n[0]) * (lados[1] / n[1]) * (lados[2] / n[2])
            resultado.append({
                "a": a.nombre,
                "b": b.nombre,
                "volumen_aprox_mm3": round(dentro * volumen_celda, 1),
            })
    return resultado
