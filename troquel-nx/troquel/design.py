"""Motor de diseño: a partir de un DieSpec calcula toda la carcasa del troquel.

Genera zapatas, paralelas, placa matriz, respaldos, pisador, porta punzones,
postes guía, bujes, espiga, barrenos de tornillería y pasadores, ranuras de
sujeción, lista de materiales y verificaciones de ingeniería.

Las reglas de dimensionamiento son reglas prácticas de taller (ver README); cada
valor automático puede forzarse desde el DieSpec.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from . import catalog as cat
from .geometry import Bloque, Cilindro, Componente, cajas_se_traslapan
from .interference import buscar_interferencias
from .spec import DieSpec, SpecError

OK, INFO, AVISO, ERROR = "ok", "info", "aviso", "error"

CLARO_PLACAS = 10.0  # holgura entre el buje y el borde de las placas
MARGEN_LATERAL = 15.0  # zapata más allá de las placas en Y cuando no hay postes de ese lado
SOBREPASO = 1.0  # las herramientas de corte sobrepasan las caras para evitar caras coplanares


@dataclass
class Verificacion:
    nivel: str
    tema: str
    mensaje: str

    def to_dict(self) -> dict[str, str]:
        return {"nivel": self.nivel, "tema": self.tema, "mensaje": self.mensaje}


@dataclass
class DieDesign:
    spec: DieSpec
    parametros: dict[str, Any]
    niveles: dict[str, float]
    postes: list[dict[str, Any]]
    componentes: list[Componente]
    tornilleria: list[dict[str, Any]]
    verificaciones: list[Verificacion] = field(default_factory=list)

    @property
    def errores(self) -> list[Verificacion]:
        return [v for v in self.verificaciones if v.nivel == ERROR]

    def componente(self, nombre: str) -> Componente:
        for c in self.componentes:
            if c.nombre == nombre:
                return c
        raise KeyError(nombre)

    def lista_materiales(self) -> list[dict[str, Any]]:
        filas: list[dict[str, Any]] = []
        indice: dict[tuple[str, str], dict[str, Any]] = {}
        for c in self.componentes:
            clave = (c.descripcion, c.material)
            if clave in indice:
                indice[clave]["cantidad"] += 1
                continue
            fila = {"descripcion": c.descripcion, "cantidad": 1, "material": c.material, "medidas": c.medidas}
            indice[clave] = fila
            filas.append(fila)
        for t in self.tornilleria:
            filas.append({"descripcion": t["descripcion"], "cantidad": t["cantidad"],
                          "material": t["material"], "medidas": t["medidas"]})
        for i, fila in enumerate(filas, start=1):
            fila["item"] = i
        return [{"item": f["item"], "descripcion": f["descripcion"], "cantidad": f["cantidad"],
                 "material": f["material"], "medidas": f["medidas"]} for f in filas]

    def resumen(self) -> dict[str, Any]:
        p = self.parametros
        return {
            "nombre": self.spec.nombre,
            "placa_matriz": "{} x {} x {} mm".format(_f(self.spec.largo), _f(self.spec.ancho), _f(p["espesor_placa_matriz"])),
            "zapatas": "{} x {} mm (inferior {} mm, superior {} mm)".format(
                _f(p["largo_zapata"]), _f(p["ancho_zapata"]), _f(p["espesor_zapata_inferior"]), _f(p["espesor_zapata_superior"])),
            "guiado": "{} postes '{}' Ø{} con bujes de {}".format(
                len(self.postes), self.spec.arreglo_postes,
                "/".join(sorted({_f(x["d"]) for x in self.postes}, key=float)), self.spec.tipo_guia),
            "altura_cerrada": "{} mm (sin paralelas {} mm)".format(_f(p["altura_cerrada"]), _f(p["altura_cerrada_sin_paralelas"])),
            "fuerza_corte": ("{} kN ({} t)".format(_f(p["fuerza_corte_kN"]), _f(p["fuerza_corte_t"]))
                             if p["fuerza_corte_kN"] is not None else "no calculada (falta perimetro_corte)"),
            "componentes": len(self.componentes),
            "errores": len(self.errores),
            "avisos": len([v for v in self.verificaciones if v.nivel == AVISO]),
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            "spec": self.spec.to_dict(),
            "resumen": self.resumen(),
            "parametros": self.parametros,
            "niveles": self.niveles,
            "postes": self.postes,
            "componentes": [c.to_dict() for c in self.componentes],
            "lista_materiales": self.lista_materiales(),
            "verificaciones": [v.to_dict() for v in self.verificaciones],
        }


def build_design(spec: DieSpec, verificar_interferencias: bool = True) -> DieDesign:
    """Calcula el diseño completo. Lanza SpecError si el troquel es geométricamente imposible."""
    spec.normalize()
    checks: list[Verificacion] = []
    L, W, t = float(spec.largo), float(spec.ancho), float(spec.espesor_lamina)
    dim_mayor = max(L, W)

    # ---------------- Fuerza de corte ----------------
    tau = float(spec.resistencia_corte or cat.RESISTENCIA_CORTE_MPA[spec.material])
    fuerza_kN = fuerza_t = None
    if spec.perimetro_corte:
        fuerza_kN = spec.perimetro_corte * t * tau / 1000.0
        fuerza_t = fuerza_kN / 9.80665

    # ---------------- Espesores ----------------
    h_tamano = 15 + 4 * t + 0.04 * dim_mayor
    h_fuerza = (0.1 * fuerza_kN * 1000.0) ** (1.0 / 3.0) if fuerza_kN else 0.0
    T_d = float(spec.espesor_placa_matriz or cat.tamano_estandar_arriba(max(20.0, h_tamano, h_fuerza), cat.ESPESORES_PLACA))

    tamanos = sorted(float(d) for d in cat.GUIAS[spec.tipo_guia])
    if spec.diametro_poste:
        d = float(spec.diametro_poste)
    else:
        d = next(float(dp) for limite, dp in cat.POSTE_POR_TAMANO if dim_mayor <= limite)
        if t > 3 and d < tamanos[-1]:
            d = tamanos[tamanos.index(d) + 1]

    T_pp = float(spec.espesor_porta_punzones or cat.tamano_estandar_arriba(max(15.0, 0.6 * T_d), cat.ESPESORES_PLACA))
    T_pb = float(spec.espesor_respaldo_punzones or cat.tamano_estandar_arriba(max(8.0, 0.25 * T_d), cat.ESPESORES_PLACA))
    T_st = float(spec.espesor_pisador or cat.tamano_estandar_arriba(max(12.0, 0.5 * T_d), cat.ESPESORES_PLACA))
    T_ls = float(spec.espesor_zapata_inferior or cat.tamano_estandar_arriba(max(40.0, 1.25 * T_d, 1.5 * d), cat.ESPESORES_PLACA))
    T_us = float(spec.espesor_zapata_superior or cat.tamano_estandar_arriba(max(35.0, 1.1 * T_d, 1.2 * d), cat.ESPESORES_PLACA))
    T_db = float(spec.espesor_respaldo_matriz or 0.0)
    g = float(spec.claro_pisador)

    # ---------------- Altura cerrada y paralelas ----------------
    apilado = T_ls + T_db + T_d + t + T_st + g + T_pp + T_pb + T_us
    H_par = 0.0
    if spec.paralelas:
        H_par = float(spec.altura_paralelas)
        if spec.altura_cerrada:
            H_par = float(spec.altura_cerrada) - apilado
            if H_par < 20:
                raise SpecError(
                    "La altura cerrada objetivo ({} mm) deja paralelas de {} mm (mínimo 20). El troquel sin "
                    "paralelas mide {} mm: aumente la altura cerrada, quite las paralelas o reduzca espesores.".format(
                        _f(spec.altura_cerrada), _f(H_par), _f(apilado)))
            checks.append(Verificacion(INFO, "altura", "Paralelas ajustadas a {} mm para lograr la altura cerrada de {} mm.".format(
                _f(H_par), _f(spec.altura_cerrada))))
    elif spec.altura_cerrada:
        delta = float(spec.altura_cerrada) - apilado
        if delta < -0.01:
            raise SpecError(
                "La altura cerrada objetivo ({} mm) es menor que el apilamiento mínimo del troquel ({} mm). "
                "Reduzca espesores de placas o aumente la altura cerrada.".format(_f(spec.altura_cerrada), _f(apilado)))
        if delta > 0.01:
            T_ls += delta
            checks.append(Verificacion(AVISO, "altura", "Zapata inferior engrosada a {} mm para lograr la altura cerrada de {} mm; "
                                       "considere usar paralelas o un bloque elevador.".format(_f(T_ls), _f(spec.altura_cerrada))))

    z = {}
    z["paralelas_0"] = 0.0
    z["zapata_inf_0"] = H_par
    z["zapata_inf_1"] = z["zapata_inf_0"] + T_ls
    z["matriz_0"] = z["zapata_inf_1"] + T_db
    z["matriz_1"] = z["matriz_0"] + T_d
    z["lamina_0"] = z["matriz_1"]
    z["pisador_0"] = z["matriz_1"] + t
    z["pisador_1"] = z["pisador_0"] + T_st
    z["porta_0"] = z["pisador_1"] + g
    z["porta_1"] = z["porta_0"] + T_pp
    z["zapata_sup_0"] = z["porta_1"] + T_pb
    z["zapata_sup_1"] = z["zapata_sup_0"] + T_us
    H = z["zapata_sup_1"]

    # ---------------- Postes y bujes ----------------
    postes = _ubicar_postes(spec, L, W, d, tamanos)
    holgura_poste_buje = z["zapata_sup_0"] - z["zapata_inf_1"]
    largo_poste_bruto = H - spec.claro_superior_poste - z["zapata_inf_0"]
    for p in postes:
        p["largo_poste"] = float(5 * math.floor(largo_poste_bruto / 5.0))
        p["z_tope_poste"] = z["zapata_inf_0"] + p["largo_poste"]
        largo_buje = float(p["largo_buje_catalogo"])
        if largo_buje >= T_us:
            saliente = largo_buje - T_us
            maximo = holgura_poste_buje - 10.0
            if saliente > maximo:
                largo_buje = T_us + max(0.0, maximo)
                checks.append(Verificacion(AVISO, "bujes",
                    "El buje de catálogo ({} mm) chocaría con la zapata inferior; se recortó a {} mm. "
                    "Pida un buje más corto o aumente la altura.".format(_f(p["largo_buje_catalogo"]), _f(largo_buje))))
            p["z_buje_0"] = z["zapata_sup_0"] - (largo_buje - T_us)
        else:
            p["z_buje_0"] = z["zapata_sup_0"]
        p["largo_buje"] = largo_buje
        p["z_buje_1"] = p["z_buje_0"] + largo_buje

    # ---------------- Zapatas ----------------
    od_max = max(p["d_ext"] for p in postes)
    pared = max(20.0, 0.6 * od_max)
    # Con paralelas la zapata sobresale lo suficiente para que no tapen la caída de pedacería.
    bp = float(spec.ancho_paralelas or min(60.0, max(30.0, _ceil5(0.15 * W)))) if spec.paralelas else 0.0
    margen_y = max(MARGEN_LATERAL, bp + 5.0) if spec.paralelas else MARGEN_LATERAL
    x_max = max(L / 2 + spec.margen_sujecion, max(p["x"] + p["d_ext"] / 2 + pared for p in postes))
    x_min = min(-L / 2 - spec.margen_sujecion, min(p["x"] - p["d_ext"] / 2 - pared for p in postes))
    y_max = max(W / 2 + margen_y, max(p["y"] + p["d_ext"] / 2 + pared for p in postes))
    y_min = min(-W / 2 - margen_y, min(p["y"] - p["d_ext"] / 2 - pared for p in postes))
    x_max, y_max = _ceil5(x_max), _ceil5(y_max)
    x_min, y_min = -_ceil5(-x_min), -_ceil5(-y_min)
    Ls, Ws = x_max - x_min, y_max - y_min

    zap_inf = Componente("ZAPATA_INFERIOR", "zapata", "Zapata inferior {} x {} x {}".format(_f(Ls), _f(Ws), _f(T_ls)),
                         cat.MATERIALES["zapata"], "{} x {} x {}".format(_f(Ls), _f(Ws), _f(T_ls)))
    zap_inf.agregar(Bloque(x_min, y_min, z["zapata_inf_0"], Ls, Ws, T_ls, nota="zapata inferior"))
    zap_sup = Componente("ZAPATA_SUPERIOR", "zapata", "Zapata superior {} x {} x {}".format(_f(Ls), _f(Ws), _f(T_us)),
                         cat.MATERIALES["zapata"], "{} x {} x {}".format(_f(Ls), _f(Ws), _f(T_us)))
    zap_sup.agregar(Bloque(x_min, y_min, z["zapata_sup_0"], Ls, Ws, T_us, nota="zapata superior"))

    for p in postes:
        zap_inf.restar(_barreno(p["x"], p["y"], p["d"], z["zapata_inf_0"], z["zapata_inf_1"], "ajuste poste " + p["id"]))
        if p["largo_buje"] >= T_us:
            zap_sup.restar(_barreno(p["x"], p["y"], p["d_ext"], z["zapata_sup_0"], z["zapata_sup_1"], "ajuste buje " + p["id"]))
        else:
            zap_sup.restar(Cilindro(p["x"], p["y"], z["zapata_sup_0"] - SOBREPASO, p["d_ext"], p["largo_buje"] + SOBREPASO,
                                    nota="ajuste buje " + p["id"]))
            z_paso = p["z_buje_1"] - SOBREPASO
            zap_sup.restar(Cilindro(p["x"], p["y"], z_paso, p["d"] + 2, z["zapata_sup_1"] + SOBREPASO - z_paso,
                                    nota="paso libre poste " + p["id"]))

    # Ranuras de sujeción en los extremos X de ambas zapatas.
    ranuras = []
    if spec.ranuras_sujecion:
        ranuras, omitidas = _ranuras(spec, L, x_min, x_max, y_min, y_max, postes)
        for zap, z0, z1 in ((zap_inf, z["zapata_inf_0"], z["zapata_inf_1"]), (zap_sup, z["zapata_sup_0"], z["zapata_sup_1"])):
            for r in ranuras:
                for prim in _primitivas_ranura(r, z0, z1):
                    zap.restar(prim)
        if omitidas:
            checks.append(Verificacion(AVISO, "sujecion", "No hubo espacio para {} ranura(s) de sujeción; "
                                       "use bridas en otra zona o aumente 'margen_sujecion'.".format(omitidas)))

    componentes: list[Componente] = []

    # ---------------- Paralelas ----------------
    if spec.paralelas:
        for nombre, y0 in (("PARALELA_DELANTERA", y_min), ("PARALELA_TRASERA", y_max - bp)):
            par = Componente(nombre, "paralela", "Paralela {} x {} x {}".format(_f(Ls), _f(bp), _f(H_par)),
                             cat.MATERIALES["paralela"], "{} x {} x {}".format(_f(Ls), _f(bp), _f(H_par)))
            par.agregar(Bloque(x_min, y0, 0.0, Ls, bp, H_par, nota=nombre.lower()))
            componentes.append(par)
        if y_min + bp > -W / 2 or y_max - bp < W / 2:
            checks.append(Verificacion(AVISO, "paralelas", "Las paralelas quedan bajo la placa matriz: revise la caída "
                                       "de pedacería y el acceso a los tornillos inferiores."))

    componentes.append(zap_inf)

    # ---------------- Placas ----------------
    def placa(nombre: str, categoria: str, texto: str, material: str, z0: float, espesor: float) -> Componente:
        comp = Componente(nombre, categoria, "{} {} x {} x {}".format(texto, _f(L), _f(W), _f(espesor)), material,
                          "{} x {} x {}".format(_f(L), _f(W), _f(espesor)))
        comp.agregar(Bloque(-L / 2, -W / 2, z0, L, W, espesor, nota=nombre.lower()))
        return comp

    resp_mat = placa("RESPALDO_MATRIZ", "respaldo", "Respaldo de matriz", cat.MATERIALES["respaldo"],
                     z["zapata_inf_1"], T_db) if T_db > 0 else None
    matriz = placa("PLACA_MATRIZ", "placa_matriz", "Placa matriz", cat.MATERIALES["placa_matriz"], z["matriz_0"], T_d)
    pisador = placa("PISADOR", "pisador", "Pisador / placa expulsora", cat.MATERIALES["pisador"], z["pisador_0"], T_st)
    porta = placa("PORTA_PUNZONES", "porta_punzones", "Porta punzones", cat.MATERIALES["porta_punzones"], z["porta_0"], T_pp)
    sufridera = placa("RESPALDO_PUNZONES", "respaldo", "Respaldo de punzones (sufridera)", cat.MATERIALES["respaldo"],
                      z["porta_1"], T_pb)

    # ---------------- Tornillería y pasadores ----------------
    tornilleria: list[dict[str, Any]] = []
    torn = None
    if spec.tornilleria:
        torn = _tornilleria(spec, L, W, T_ls, T_db, T_d, T_us, T_pb, T_pp, z, zap_inf, resp_mat, matriz,
                            zap_sup, sufridera, porta, checks)
        tornilleria = torn["bom"]

    componentes.extend([c for c in (resp_mat, matriz) if c is not None])

    for p in postes:
        poste = Componente("POSTE_GUIA_{}".format(p["id"]), "poste",
                           "Poste guía Ø{} x {}".format(_f(p["d"]), _f(p["largo_poste"])),
                           cat.MATERIALES["poste"], "Ø{} x {}".format(_f(p["d"]), _f(p["largo_poste"])))
        poste.agregar(Cilindro(p["x"], p["y"], z["zapata_inf_0"], p["d"], p["largo_poste"], nota="poste " + p["id"]))
        componentes.append(poste)

    componentes.extend([pisador, porta, sufridera])

    tipo_buje = "de fricción" if spec.tipo_guia == "friccion" else "de bolas"
    for p in postes:
        buje = Componente("BUJE_GUIA_{}".format(p["id"]), "buje",
                          "Buje guía {} Ø{} (ext. Ø{}) x {}".format(tipo_buje, _f(p["d"]), _f(p["d_ext"]), _f(p["largo_buje"])),
                          cat.MATERIALES["buje_" + spec.tipo_guia],
                          "Ø{}/Ø{} x {}".format(_f(p["d_ext"]), _f(p["d"]), _f(p["largo_buje"])))
        buje.agregar(Cilindro(p["x"], p["y"], p["z_buje_0"], p["d_ext"], p["largo_buje"], nota="buje " + p["id"]))
        buje.restar(_barreno(p["x"], p["y"], p["d"], p["z_buje_0"], p["z_buje_1"], "diametro interior"))
        componentes.append(buje)

    componentes.append(zap_sup)

    if spec.espiga:
        esp = Componente("ESPIGA", "espiga", "Espiga (zanco) Ø{} x {}".format(_f(spec.diametro_espiga), _f(spec.largo_espiga)),
                         cat.MATERIALES["espiga"], "Ø{} x {}".format(_f(spec.diametro_espiga), _f(spec.largo_espiga)))
        esp.agregar(Cilindro(0.0, 0.0, H, spec.diametro_espiga, spec.largo_espiga, nota="espiga"))
        componentes.append(esp)

    parametros = {
        "resistencia_corte_MPa": tau,
        "fuerza_corte_kN": _r(fuerza_kN),
        "fuerza_corte_t": _r(fuerza_t),
        "espesor_placa_matriz": T_d,
        "espesor_respaldo_matriz": T_db,
        "espesor_pisador": T_st,
        "espesor_porta_punzones": T_pp,
        "espesor_respaldo_punzones": T_pb,
        "espesor_zapata_inferior": _r(T_ls),
        "espesor_zapata_superior": T_us,
        "altura_paralelas": _r(H_par),
        "ancho_paralelas": bp,
        "largo_zapata": Ls,
        "ancho_zapata": Ws,
        "zapata_x": [x_min, x_max],
        "zapata_y": [y_min, y_max],
        "diametro_poste": d,
        "pared_buje_borde": _r(pared),
        "altura_cerrada": _r(H),
        "altura_cerrada_sin_paralelas": _r(H - H_par),
        "carrera_pisador": _r(t + spec.penetracion_punzon + spec.retraccion_punzon),
        "ranuras_sujecion": ranuras,
        "tornillo": torn["tornillo"] if torn else None,
    }

    _verificar_guiado(spec, postes, parametros, checks)
    _verificaciones_generales(spec, fuerza_t, T_d, H, H_par, checks)

    design = DieDesign(spec=spec, parametros=parametros, niveles={k: _r(v) for k, v in z.items()},
                       postes=[{k: (_r(v) if isinstance(v, float) else v) for k, v in p.items()} for p in postes],
                       componentes=componentes, tornilleria=tornilleria, verificaciones=checks)
    _asegurar_herramientas_validas(design)

    if verificar_interferencias:
        choques = buscar_interferencias(componentes)
        if choques:
            for c in choques:
                checks.append(Verificacion(ERROR, "interferencia", "{} interfiere con {} (~{} mm³).".format(
                    c["a"], c["b"], c["volumen_aprox_mm3"])))
        else:
            checks.append(Verificacion(OK, "interferencia", "Sin interferencias entre componentes (verificación por muestreo)."))
    return design


# ======================================================================
# Ayudantes
# ======================================================================

def _ubicar_postes(spec: DieSpec, L: float, W: float, d: float, tamanos: list[float]) -> list[dict[str, Any]]:
    def datos(dp: float) -> dict[str, float]:
        entrada = cat.GUIAS[spec.tipo_guia][int(dp) if float(dp).is_integer() else dp]
        return {"d": dp, "d_ext": float(entrada["d_ext"]), "largo_buje_catalogo": float(entrada["largo"])}

    diametros = [d, d]
    if spec.arreglo_postes == "cuatro":
        diametros = [d, d, d, d]
    if spec.arreglo_postes == "diagonal" and spec.poka_yoke:
        i = tamanos.index(d)
        diametros = [d, tamanos[i + 1] if i + 1 < len(tamanos) else tamanos[i - 1]]

    info = [datos(dp) for dp in diametros]
    off = spec.desfase_poka_yoke if spec.poka_yoke else 0.0
    arr = spec.arreglo_postes

    def x_esq(i: int) -> float:
        return L / 2 - info[i]["d_ext"] / 2

    def y_lado(i: int) -> float:
        return W / 2 + CLARO_PLACAS + info[i]["d_ext"] / 2

    if arr == "cuatro":
        pos = [(-x_esq(0) + off, y_lado(0)), (x_esq(1), y_lado(1)), (x_esq(2), -y_lado(2)), (-x_esq(3), -y_lado(3))]
    elif arr == "trasero":
        pos = [(-x_esq(0) + off, y_lado(0)), (x_esq(1), y_lado(1))]
    elif arr == "diagonal":
        pos = [(-x_esq(0), y_lado(0)), (x_esq(1), -y_lado(1))]
    else:  # centro
        xc = [L / 2 + CLARO_PLACAS + info[i]["d_ext"] / 2 for i in range(2)]
        pos = [(-xc[0], off), (xc[1], 0.0)]

    return [dict(info[i], id=str(i + 1), x=float(x), y=float(y)) for i, (x, y) in enumerate(pos)]


def _barreno(x: float, y: float, d: float, z0: float, z1: float, nota: str) -> Cilindro:
    """Barreno pasado entre z0 y z1 con sobrepaso en ambos lados."""
    return Cilindro(x, y, z0 - SOBREPASO, d, (z1 - z0) + 2 * SOBREPASO, nota=nota)


def _ranuras(spec: DieSpec, L: float, x_min: float, x_max: float, y_min: float, y_max: float,
             postes: list[dict[str, Any]]) -> tuple[list[dict[str, float]], int]:
    w = spec.ancho_ranura
    Ws = y_max - y_min
    yc = (y_min + y_max) / 2
    candidatos_y = [[yc], [yc - Ws / 4, yc + Ws / 4]]
    if Ws > 350:
        candidatos_y = [candidatos_y[1]]
    ranuras, omitidas = [], 0
    for lado in (-1, 1):
        x_borde = x_max if lado > 0 else x_min
        prof = min(50.0, abs(x_borde) - L / 2 - 5)
        if prof < w:
            omitidas += 2
            continue
        x_fondo = x_borde - lado * prof
        elegidas = None
        for ys in candidatos_y:
            if all(_ranura_libre(x_borde, x_fondo, y, w, postes) and y_min + w < y < y_max - w for y in ys):
                elegidas = ys
                break
        if elegidas is None:
            omitidas += len(candidatos_y[-1])
            continue
        for y in elegidas:
            ranuras.append({"lado": lado, "x_borde": x_borde, "x_fondo": _r(x_fondo), "y": _r(y), "ancho": w})
    return ranuras, omitidas


def _ranura_libre(x_borde: float, x_fondo: float, y: float, w: float, postes: list[dict[str, Any]]) -> bool:
    x0, x1 = min(x_borde, x_fondo), max(x_borde, x_fondo)
    y0, y1 = y - w / 2, y + w / 2
    for p in postes:
        r = p["d_ext"] / 2 + 8
        cx = min(max(p["x"], x0), x1)
        cy = min(max(p["y"], y0), y1)
        if (cx - p["x"]) ** 2 + (cy - p["y"]) ** 2 < r * r:
            return False
    return True


def _primitivas_ranura(r: dict[str, float], z0: float, z1: float) -> list:
    w, lado = r["ancho"], r["lado"]
    x_centro = r["x_fondo"] + lado * w / 2
    if lado > 0:
        bx0, bx1 = x_centro, r["x_borde"] + SOBREPASO
    else:
        bx0, bx1 = r["x_borde"] - SOBREPASO, x_centro
    alto = (z1 - z0) + 2 * SOBREPASO
    return [
        Bloque(bx0, r["y"] - w / 2, z0 - SOBREPASO, bx1 - bx0, w, alto, nota="ranura de sujeción"),
        Cilindro(x_centro, r["y"], z0 - SOBREPASO, w, alto, nota="ranura de sujeción"),
    ]


def _tornilleria(spec, L, W, T_ls, T_db, T_d, T_us, T_pb, T_pp, z, zap_inf, resp_mat, matriz,
                 zap_sup, sufridera, porta, checks) -> dict[str, Any]:
    nombre_t = next(m for limite, m in cat.TORNILLO_POR_TAMANO if max(L, W) <= limite)
    tor = cat.TORNILLOS[nombre_t]
    dt = tor["d"]
    e = 2.5 * dt
    n_x = 2 if L <= 300 else 3 if L <= 600 else 4
    xs = [-(L / 2 - e) + i * (L - 2 * e) / (n_x - 1) for i in range(n_x)]
    ys = [-(W / 2 - e), W / 2 - e]
    tornillos = [(x, y) for y in ys for x in xs]
    desfase = min(2.2 * e, L / 2 - e)
    pasadores = [(-(L / 2 - e) + desfase, W / 2 - e), ((L / 2 - e) - desfase, -(W / 2 - e))]
    dp = dt

    prof_inf = min(2 * dt, T_d - 3)
    prof_sup = min(2 * dt, T_pp - 3)
    cb, pcb = tor["avellanado"], tor["prof_avellanado"]

    for x, y in tornillos:
        # Inferior: el tornillo entra por abajo de la zapata inferior y rosca en la placa matriz.
        zap_inf.restar(Cilindro(x, y, z["zapata_inf_0"] - SOBREPASO, cb, pcb + SOBREPASO, nota="caja tornillo " + nombre_t))
        zap_inf.restar(_barreno(x, y, tor["paso_libre"], z["zapata_inf_0"], z["zapata_inf_1"], "paso tornillo " + nombre_t))
        if resp_mat is not None:
            resp_mat.restar(_barreno(x, y, tor["paso_libre"], z["zapata_inf_1"], z["matriz_0"], "paso tornillo " + nombre_t))
        matriz.restar(Cilindro(x, y, z["matriz_0"] - SOBREPASO, tor["broca_machuelo"], prof_inf + SOBREPASO,
                               nota="rosca " + nombre_t))
        # Superior: entra por arriba de la zapata superior y rosca en el porta punzones.
        zap_sup.restar(Cilindro(x, y, z["zapata_sup_1"] - pcb, cb, pcb + SOBREPASO, nota="caja tornillo " + nombre_t))
        zap_sup.restar(_barreno(x, y, tor["paso_libre"], z["zapata_sup_0"], z["zapata_sup_1"], "paso tornillo " + nombre_t))
        sufridera.restar(_barreno(x, y, tor["paso_libre"], z["porta_1"], z["zapata_sup_0"], "paso tornillo " + nombre_t))
        porta.restar(Cilindro(x, y, z["porta_1"] - prof_sup, tor["broca_machuelo"], prof_sup + SOBREPASO,
                              nota="rosca " + nombre_t))

    for x, y in pasadores:
        zap_inf.restar(_barreno(x, y, dp, z["zapata_inf_0"], z["zapata_inf_1"], "pasador"))
        if resp_mat is not None:
            resp_mat.restar(_barreno(x, y, dp, z["zapata_inf_1"], z["matriz_0"], "pasador"))
        matriz.restar(_barreno(x, y, dp, z["matriz_0"], z["matriz_1"], "pasador"))
        zap_sup.restar(_barreno(x, y, dp, z["zapata_sup_0"], z["zapata_sup_1"], "pasador"))
        sufridera.restar(_barreno(x, y, dp, z["porta_1"], z["zapata_sup_0"], "pasador"))
        porta.restar(_barreno(x, y, dp, z["porta_0"], z["porta_1"], "pasador"))

    largo_inf = _largo_tornillo(T_ls - pcb + T_db, dt, prof_inf, "inferior", checks)
    largo_sup = _largo_tornillo(T_us - pcb + T_pb, dt, prof_sup, "superior", checks)
    pas_inf = _largo_pasador(T_d + T_db, T_ls, dp, "inferior", checks)
    pas_sup = _largo_pasador(T_pp + T_pb, T_us, dp, "superior", checks)

    bom = []
    n = len(tornillos)
    if largo_inf == largo_sup:
        bom.append(_fila_tornillo(nombre_t, largo_inf, 2 * n, "Zapata inf. a placa matriz y zapata sup. a porta punzones"))
    else:
        bom.append(_fila_tornillo(nombre_t, largo_inf, n, "Zapata inferior a placa matriz"))
        bom.append(_fila_tornillo(nombre_t, largo_sup, n, "Zapata superior a porta punzones"))
    if pas_inf == pas_sup:
        bom.append(_fila_pasador(dp, pas_inf, 4, "Placa matriz y porta punzones"))
    else:
        bom.append(_fila_pasador(dp, pas_inf, 2, "Placa matriz"))
        bom.append(_fila_pasador(dp, pas_sup, 2, "Porta punzones"))

    return {
        "tornillo": {"medida": nombre_t, "cantidad_por_lado": n, "largo_inferior": largo_inf, "largo_superior": largo_sup,
                     "pasador_d": dp, "pasador_inferior": pas_inf, "pasador_superior": pas_sup,
                     "posiciones_tornillos": [[_r(x), _r(y)] for x, y in tornillos],
                     "posiciones_pasadores": [[_r(x), _r(y)] for x, y in pasadores]},
        "bom": bom,
    }


def _largo_tornillo(agarre: float, d: float, prof_rosca: float, lado: str, checks: list[Verificacion]) -> float:
    candidatos = [l for l in cat.LARGOS_TORNILLO if agarre + 0.8 * d <= l <= agarre + prof_rosca - 1]
    if candidatos:
        ideales = [l for l in candidatos if l <= agarre + 1.5 * d]
        return float(max(ideales) if ideales else min(candidatos))
    largo = float(next((l for l in cat.LARGOS_TORNILLO if l >= agarre + d), cat.LARGOS_TORNILLO[-1]))
    checks.append(Verificacion(AVISO, "tornilleria", "No hay largo estándar de tornillo {} que rosque bien (agarre {} mm, "
                               "rosca {} mm); se propone {} mm, revise la profundidad de rosca.".format(
                                   lado, _f(agarre), _f(prof_rosca), _f(largo))))
    return largo


def _largo_pasador(placas: float, zapata: float, d: float, lado: str, checks: list[Verificacion]) -> float:
    minimo, maximo = placas + 1.5 * d, placas + zapata
    for l in cat.LARGOS_PASADOR:
        if minimo <= l <= maximo:
            return float(l)
    largo = float(5 * math.ceil(minimo / 5))
    checks.append(Verificacion(AVISO, "tornilleria", "Pasador {}: no hay largo estándar entre {} y {} mm; se propone {} mm "
                               "(especial).".format(lado, _f(minimo), _f(maximo), _f(largo))))
    return largo


def _fila_tornillo(nombre: str, largo: float, cantidad: int, uso: str) -> dict[str, Any]:
    return {"descripcion": "Tornillo cabeza cilíndrica allen ISO 4762 {}x{} ({})".format(nombre, _f(largo), uso),
            "cantidad": cantidad, "material": "Acero grado 12.9", "medidas": "{}x{}".format(nombre, _f(largo))}


def _fila_pasador(d: float, largo: float, cantidad: int, uso: str) -> dict[str, Any]:
    return {"descripcion": "Pasador cilíndrico templado ISO 8734 Ø{}x{} ({})".format(_f(d), _f(largo), uso),
            "cantidad": cantidad, "material": "Acero templado 60 HRC", "medidas": "Ø{}x{}".format(_f(d), _f(largo))}


def _verificar_guiado(spec: DieSpec, postes: list[dict[str, Any]], par: dict[str, Any], checks: list[Verificacion]) -> None:
    carrera_pisador = par["carrera_pisador"]
    for p in postes:
        minimo = max(10.0, 0.5 * p["d"])
        cerrado = min(p["z_tope_poste"], p["z_buje_1"]) - p["z_buje_0"]
        contacto = p["z_tope_poste"] - (p["z_buje_0"] + carrera_pisador)
        abierto = p["z_tope_poste"] - (p["z_buje_0"] + spec.carrera)
        p["enganche_cerrado"] = _r(cerrado)
        p["enganche_al_contacto"] = _r(contacto)
        p["enganche_abierto"] = _r(abierto)
        p["enganche_minimo"] = minimo

    peor = min(postes, key=lambda p: p["enganche_al_contacto"])
    if peor["enganche_al_contacto"] < peor["enganche_minimo"]:
        checks.append(Verificacion(ERROR, "guiado",
            "Cuando el pisador toca la lámina el poste {} sólo entra {} mm en su buje (mínimo {} mm). Use bujes más "
            "largos, postes más largos (reduzca 'claro_superior_poste') o una zapata superior más gruesa.".format(
                peor["id"], _f(peor["enganche_al_contacto"]), _f(peor["enganche_minimo"]))))
    else:
        checks.append(Verificacion(OK, "guiado", "Los postes entran {} mm en los bujes antes de que el pisador toque la "
                                   "lámina (mínimo {} mm).".format(_f(peor["enganche_al_contacto"]), _f(peor["enganche_minimo"]))))

    peor = min(postes, key=lambda p: p["enganche_abierto"])
    if spec.tipo_guia == "bolas":
        if peor["enganche_abierto"] < peor["enganche_minimo"]:
            checks.append(Verificacion(ERROR, "guiado",
                "Con bujes de bolas el poste no debe salir del buje: con la carrera de {} mm el enganche es {} mm "
                "(mínimo {} mm). Reduzca la carrera o use bujes/postes más largos.".format(
                    _f(spec.carrera), _f(peor["enganche_abierto"]), _f(peor["enganche_minimo"]))))
        else:
            checks.append(Verificacion(OK, "guiado", "Con la carrera de {} mm los postes conservan {} mm dentro de los bujes "
                                       "de bolas.".format(_f(spec.carrera), _f(peor["enganche_abierto"]))))
    elif peor["enganche_abierto"] < 0:
        checks.append(Verificacion(AVISO, "guiado",
            "Con la carrera de {} mm los postes salen {} mm de los bujes. Es aceptable con bujes de fricción porque "
            "entran antes del contacto; dé chaflán de entrada a los postes.".format(_f(spec.carrera), _f(-peor["enganche_abierto"]))))
    else:
        checks.append(Verificacion(OK, "guiado", "Con la carrera de {} mm los postes no salen de los bujes.".format(_f(spec.carrera))))


def _verificaciones_generales(spec: DieSpec, fuerza_t, T_d: float, H: float, H_par: float, checks: list[Verificacion]) -> None:
    if fuerza_t is None:
        checks.append(Verificacion(INFO, "fuerza", "Sin 'perimetro_corte' no se calcula la fuerza de corte ni se verifica la prensa."))
    else:
        texto = "Fuerza de corte estimada {} t.".format(_f(fuerza_t))
        if spec.tonelaje_prensa:
            uso = fuerza_t / spec.tonelaje_prensa
            if uso > 1:
                checks.append(Verificacion(ERROR, "fuerza", texto + " Excede la prensa de {} t.".format(_f(spec.tonelaje_prensa))))
            elif uso > 0.8:
                checks.append(Verificacion(AVISO, "fuerza", texto + " Usa el {}% de la prensa de {} t (recomendado <= 80%).".format(
                    _f(100 * uso), _f(spec.tonelaje_prensa))))
            else:
                checks.append(Verificacion(OK, "fuerza", texto + " Usa el {}% de la prensa de {} t.".format(
                    _f(100 * uso), _f(spec.tonelaje_prensa))))
        else:
            checks.append(Verificacion(INFO, "fuerza", texto))
    if T_d > 100:
        checks.append(Verificacion(AVISO, "placa_matriz", "Placa matriz de {} mm: considere seccionarla en insertos.".format(_f(T_d))))
    if spec.ancho_tira and spec.ancho_tira > spec.ancho - 20:
        checks.append(Verificacion(AVISO, "tira", "La tira de {} mm deja menos de 10 mm por lado en la placa matriz de {} mm.".format(
            _f(spec.ancho_tira), _f(spec.ancho))))
    if spec.arreglo_postes == "centro":
        checks.append(Verificacion(AVISO, "guiado", "Con postes al centro la tira no puede avanzar en X (chocaría con los postes): "
                                   "úselo sólo en troqueles de un golpe con alimentación manual."))
    checks.append(Verificacion(INFO, "altura", "Altura cerrada {} mm (incluye paralelas de {} mm).".format(_f(H), _f(H_par))))


def _asegurar_herramientas_validas(design: DieDesign) -> None:
    """Cada corte debe tocar su cuerpo; NX rechaza una resta que no intersecta."""
    for c in design.componentes:
        solidos = [p.bbox() for p in c.solidos]
        for h in c.huecos:
            if not any(cajas_se_traslapan(h.bbox(), s) for s in solidos):
                raise RuntimeError("Corte '{}' de {} no intersecta el cuerpo".format(h.nota, c.nombre))


def _ceil5(v: float) -> float:
    return float(5 * math.ceil(round(v, 6) / 5.0))


def _r(v):
    return None if v is None else round(float(v), 3)


def _f(v: float) -> str:
    return ("%.2f" % float(v)).rstrip("0").rstrip(".")
