"""Vista previa SVG (planta de la mitad inferior + alzado frontal) sin necesidad de NX."""

from __future__ import annotations

from html import escape

from . import catalog as cat
from .design import DieDesign
from .geometry import Bloque



def generar_svg(design: DieDesign) -> str:
    p = design.parametros
    x0, x1 = p["zapata_x"]
    y0, y1 = p["zapata_y"]
    H = p["altura_cerrada"] + (design.spec.largo_espiga if design.spec.espiga else 0)
    ancho_mm = (x1 - x0)
    margen = 40.0
    escala = min(1.0, 520.0 / max(ancho_mm, y1 - y0, H))
    w_vista = ancho_mm * escala
    alto_planta = (y1 - y0) * escala
    alto_alzado = H * escala
    W = max(2 * w_vista + 3 * margen, 560.0)
    y_datos = margen + 20 + max(alto_planta + 50, alto_alzado + 10) + 20
    Ht = y_datos + 110

    partes = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {:.1f} {:.1f}" width="{:.0f}" height="{:.0f}" '
        'font-family="Arial, sans-serif">'.format(W, Ht, W, Ht),
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        '<defs>',
    ]
    cuerpo = []

    # ---------- Planta (vista superior de la mitad inferior) ----------
    ox, oy = margen, margen + 20
    cuerpo.append(_texto(ox, oy - 8, "PLANTA - mitad inferior (bujes punteados)", 13, "bold"))

    def planta(x: float, y: float) -> tuple[float, float]:
        return ox + (x - x0) * escala, oy + (y1 - y) * escala

    # Mitad inferior: todo lo que arranca por debajo de la cara superior de la placa matriz.
    capas_planta = [c for c in design.componentes if c.bbox()[2] < design.niveles["matriz_1"] - 1e-6]
    capas_planta.sort(key=lambda c: c.bbox()[5])
    for i, comp in enumerate(capas_planta):
        mask_id = "m{}".format(i)
        partes.append('<mask id="{}" maskUnits="userSpaceOnUse">'.format(mask_id))
        for prim in comp.solidos:
            partes.append(_forma_planta(prim, planta, escala, "#fff"))
        z_cara = comp.bbox()[5]
        for prim in comp.huecos:
            if prim.bbox()[5] >= z_cara - 1e-6:  # sólo lo que se ve desde arriba
                partes.append(_forma_planta(prim, planta, escala, "#000"))
        partes.append('</mask>')
        bx0, by0, _, bx1, by1, _ = comp.bbox()
        px0, py0 = planta(bx0, by1)
        cuerpo.append('<rect x="{:.2f}" y="{:.2f}" width="{:.2f}" height="{:.2f}" fill="{}" fill-opacity="0.9" '
                      'stroke="none" mask="url(#{})"/>'.format(px0, py0, (bx1 - bx0) * escala, (by1 - by0) * escala,
                                                             cat.COLORES_SVG[comp.categoria], mask_id))
        for prim in comp.solidos:
            cuerpo.append(_forma_planta(prim, planta, escala, "none", stroke="#333"))
    for comp in design.componentes:
        if comp.categoria == "buje":
            for prim in comp.solidos:
                cuerpo.append(_forma_planta(prim, planta, escala, "none", stroke="#8a5a00", dash=True))

    _, ay = planta(x0, y0)
    cuerpo.append(_cota_h(ox, ox + w_vista, ay + 18, "{} mm".format(_f(x1 - x0))))
    cuerpo.append(_cota_v(ox + w_vista + 14, oy, oy + alto_planta, "{} mm".format(_f(y1 - y0))))
    cuerpo.append(_texto(ox, ay + 44, "X = avance de la tira  ->", 11))

    # ---------- Alzado frontal ----------
    fx = 2 * margen + w_vista
    fz = margen + 20 + alto_alzado
    cuerpo.append(_texto(fx, margen + 12, "ALZADO FRONTAL - troquel cerrado", 13, "bold"))

    def alzado(x: float, z: float) -> tuple[float, float]:
        return fx + (x - x0) * escala, fz - z * escala

    # Pintor: primero lo más alejado del observador (Y mayor), al final lo más cercano.
    comps = sorted(design.componentes, key=lambda c: -c.bbox()[1])
    for comp in comps:
        color = cat.COLORES_SVG[comp.categoria]
        for prim in comp.solidos:
            bx0, _, bz0, bx1, _, bz1 = prim.bbox()
            px, pz = alzado(bx0, bz1)
            cuerpo.append('<rect x="{:.2f}" y="{:.2f}" width="{:.2f}" height="{:.2f}" fill="{}" stroke="#333" '
                          'stroke-width="0.6"/>'.format(px, pz, (bx1 - bx0) * escala, (bz1 - bz0) * escala, color))
    cuerpo.append(_cota_v(fx + w_vista + 14, fz - p["altura_cerrada"] * escala, fz,
                          "Altura cerrada {} mm".format(_f(p["altura_cerrada"]))))

    # ---------- Cuadro de datos ----------
    ty = y_datos
    res = design.resumen()
    lineas = [
        "{}  |  Placa matriz {}  |  Zapatas {}".format(res["nombre"], res["placa_matriz"], res["zapatas"]),
        "Guiado: {}  |  Lámina {} mm  |  Carrera {} mm".format(res["guiado"], _f(design.spec.espesor_lamina),
                                                               _f(design.spec.carrera)),
        "Verificaciones: {} errores, {} avisos".format(res["errores"], res["avisos"]),
    ]
    for i, linea in enumerate(lineas):
        cuerpo.append(_texto(margen, ty + i * 18, linea, 12))

    # Leyenda
    for i, (categoria, nombre) in enumerate((("zapata", "Zapatas / paralelas"), ("placa_matriz", "Placa matriz"),
                                             ("pisador", "Pisador"), ("porta_punzones", "Porta punzones"),
                                             ("respaldo", "Respaldos"), ("poste", "Postes"), ("buje", "Bujes"))):
        yy = ty + 70 + (i // 4) * 18
        xx = margen + (i % 4) * 130
        cuerpo.append('<rect x="{}" y="{}" width="10" height="10" fill="{}" stroke="#333" stroke-width="0.5"/>'.format(
            xx, yy - 9, cat.COLORES_SVG[categoria]))
        cuerpo.append(_texto(xx + 14, yy, nombre, 10))

    partes.append('</defs>')
    partes.extend(cuerpo)
    partes.append('</svg>')
    return "\n".join(partes)


def _forma_planta(prim, planta, escala: float, fill: str, stroke: str | None = None, dash: bool = False) -> str:
    trazo = ' stroke="{}" stroke-width="0.8"{}'.format(stroke, ' stroke-dasharray="4 3"' if dash else "") if stroke else ""
    if isinstance(prim, Bloque):
        px, py = planta(prim.x, prim.y + prim.dy)
        return '<rect x="{:.2f}" y="{:.2f}" width="{:.2f}" height="{:.2f}" fill="{}"{}/>'.format(
            px, py, prim.dx * escala, prim.dy * escala, fill, trazo)
    cx, cy = planta(prim.x, prim.y)
    return '<circle cx="{:.2f}" cy="{:.2f}" r="{:.2f}" fill="{}"{}/>'.format(cx, cy, prim.d / 2 * escala, fill, trazo)


def _texto(x: float, y: float, texto: str, tam: int, peso: str = "normal") -> str:
    return '<text x="{:.1f}" y="{:.1f}" font-size="{}" font-weight="{}" fill="#222">{}</text>'.format(
        x, y, tam, peso, escape(texto))


def _cota_h(xa: float, xb: float, y: float, texto: str) -> str:
    return ('<line x1="{a:.1f}" y1="{y:.1f}" x2="{b:.1f}" y2="{y:.1f}" stroke="#555" stroke-width="0.8"/>'
            '<text x="{m:.1f}" y="{t:.1f}" font-size="11" text-anchor="middle" fill="#222">{txt}</text>').format(
        a=xa, b=xb, y=y, m=(xa + xb) / 2, t=y + 13, txt=escape(texto))


def _cota_v(x: float, ya: float, yb: float, texto: str) -> str:
    m = (ya + yb) / 2
    return ('<line x1="{x:.1f}" y1="{a:.1f}" x2="{x:.1f}" y2="{b:.1f}" stroke="#555" stroke-width="0.8"/>'
            '<text x="{tx:.1f}" y="{m:.1f}" font-size="11" fill="#222" transform="rotate(90 {tx:.1f} {m:.1f})" '
            'text-anchor="middle">{txt}</text>').format(x=x, a=ya, b=yb, tx=x + 6, m=m, txt=escape(texto))


def _f(v: float) -> str:
    return ("%.2f" % float(v)).rstrip("0").rstrip(".")
