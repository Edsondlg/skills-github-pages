"""Especificación (datos de entrada) de un troquel.

Sistema de coordenadas usado en todo el proyecto (mm):
  X = largo, dirección de avance de la tira
  Y = ancho (+Y = parte trasera de la prensa)
  Z = vertical hacia arriba; Z = 0 en la base del troquel
El origen en XY es el centro de la placa matriz. El troquel se modela cerrado
(en altura de cierre).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, fields
from typing import Any

from .catalog import GUIAS, RESISTENCIA_CORTE_MPA

ARREGLOS = ("cuatro", "diagonal", "trasero", "centro")
TIPOS_GUIA = ("friccion", "bolas")

_ALIAS_ARREGLO = {
    "cuatro": "cuatro", "4": "cuatro", "four": "cuatro", "4 postes": "cuatro", "esquinas": "cuatro",
    "diagonal": "diagonal", "diagonales": "diagonal",
    "trasero": "trasero", "traseros": "trasero", "atras": "trasero", "rear": "trasero", "back": "trasero",
    "centro": "centro", "central": "centro", "centrales": "centro", "center": "centro",
}
_ALIAS_GUIA = {
    "friccion": "friccion", "fricción": "friccion", "bronce": "friccion", "friction": "friccion", "plain": "friccion",
    "bolas": "bolas", "balero": "bolas", "baleros": "bolas", "ball": "bolas", "rodamiento": "bolas",
}
_ALIAS_MATERIAL = {
    "acero": "acero", "steel": "acero",
    "acero_alta_resistencia": "acero_alta_resistencia", "hsla": "acero_alta_resistencia",
    "inoxidable": "inoxidable", "inox": "inoxidable", "stainless": "inoxidable",
    "aluminio": "aluminio", "aluminum": "aluminio",
    "cobre": "cobre", "copper": "cobre",
    "laton": "laton", "latón": "laton", "brass": "laton",
}


class SpecError(ValueError):
    """Dato de entrada inválido o diseño geométricamente imposible."""


@dataclass
class DieSpec:
    # --- Dimensiones básicas ---
    largo: float  # largo de la placa matriz (X, dirección de avance), mm
    ancho: float  # ancho de la placa matriz (Y), mm
    nombre: str = "TROQUEL_001"
    espesor_lamina: float = 1.5
    material: str = "acero"
    resistencia_corte: float | None = None  # MPa; si falta se toma de la tabla por material
    perimetro_corte: float | None = None  # mm; permite calcular la fuerza de corte
    tonelaje_prensa: float | None = None  # toneladas métricas
    ancho_tira: float | None = None

    # --- Guiado ---
    arreglo_postes: str = "cuatro"  # cuatro | diagonal | trasero | centro
    tipo_guia: str = "friccion"  # friccion | bolas
    diametro_poste: float | None = None  # None = automático
    poka_yoke: bool = True  # un poste desfasado (o de otro diámetro) para evitar montaje girado
    desfase_poka_yoke: float = 5.0
    claro_superior_poste: float = 10.0  # el poste queda por debajo de la cara superior de la zapata

    # --- Altura y carrera ---
    carrera: float = 60.0  # carrera de la prensa (apertura del troquel), mm
    altura_cerrada: float | None = None  # objetivo de altura de cierre (incluye paralelas)

    # --- Espesores (None = automático) ---
    espesor_zapata_inferior: float | None = None
    espesor_zapata_superior: float | None = None
    espesor_placa_matriz: float | None = None
    espesor_respaldo_matriz: float = 0.0  # 0 = sin placa de respaldo bajo la matriz
    espesor_porta_punzones: float | None = None
    espesor_respaldo_punzones: float | None = None  # sufridera
    espesor_pisador: float | None = None

    # --- Pisador / punzones ---
    claro_pisador: float = 2.0  # holgura entre pisador y porta punzones con el troquel cerrado
    penetracion_punzon: float = 1.0
    retraccion_punzon: float = 1.5  # punzón escondido dentro del pisador con el troquel abierto

    # --- Carcasa ---
    paralelas: bool = True
    altura_paralelas: float = 50.0
    ancho_paralelas: float | None = None
    margen_sujecion: float = 60.0  # extensión de las zapatas en X para bridas de sujeción
    ranuras_sujecion: bool = True
    ancho_ranura: float = 22.0
    espiga: bool = False
    diametro_espiga: float = 40.0
    largo_espiga: float = 60.0
    tornilleria: bool = True

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def field_names(cls) -> set[str]:
        return {f.name for f in fields(cls)}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DieSpec":
        desconocidos = set(data) - cls.field_names()
        if desconocidos:
            raise SpecError(
                "Parámetros desconocidos: {}. Válidos: {}".format(
                    ", ".join(sorted(desconocidos)), ", ".join(sorted(cls.field_names()))
                )
            )
        if "largo" not in data or "ancho" not in data:
            raise SpecError("Faltan las dimensiones del troquel: indique 'largo' y 'ancho' de la placa matriz en mm.")
        spec = cls(**data)
        spec.normalize()
        return spec

    def normalize(self) -> None:
        """Normaliza alias (inglés/español) y valida rangos. Lanza SpecError."""
        self.arreglo_postes = _alias(self.arreglo_postes, _ALIAS_ARREGLO, "arreglo_postes", ARREGLOS)
        self.tipo_guia = _alias(self.tipo_guia, _ALIAS_GUIA, "tipo_guia", TIPOS_GUIA)
        self.material = _alias(self.material, _ALIAS_MATERIAL, "material", tuple(RESISTENCIA_CORTE_MPA))
        self.nombre = _clean_name(self.nombre)

        _rango("largo", self.largo, 60, 3000)
        _rango("ancho", self.ancho, 60, 2000)
        _rango("espesor_lamina", self.espesor_lamina, 0.1, 12)
        _rango("carrera", self.carrera, 5, 1000)
        _rango("desfase_poka_yoke", self.desfase_poka_yoke, 0, 50)
        _rango("claro_superior_poste", self.claro_superior_poste, 0, 50)
        _rango("claro_pisador", self.claro_pisador, 0, 50)
        _rango("penetracion_punzon", self.penetracion_punzon, 0, 20)
        _rango("retraccion_punzon", self.retraccion_punzon, 0, 20)
        _rango("altura_paralelas", self.altura_paralelas, 10, 500)
        _rango("margen_sujecion", self.margen_sujecion, 20, 300)
        _rango("ancho_ranura", self.ancho_ranura, 8, 60)
        _rango("diametro_espiga", self.diametro_espiga, 10, 120)
        _rango("largo_espiga", self.largo_espiga, 10, 300)
        _rango("espesor_respaldo_matriz", self.espesor_respaldo_matriz, 0, 100)
        for nombre in ("resistencia_corte", "perimetro_corte", "tonelaje_prensa", "ancho_tira",
                       "altura_cerrada", "ancho_paralelas"):
            valor = getattr(self, nombre)
            if valor is not None and valor <= 0:
                raise SpecError("'{}' debe ser mayor que cero (recibido {}).".format(nombre, valor))
        for nombre in ("espesor_zapata_inferior", "espesor_zapata_superior", "espesor_placa_matriz",
                       "espesor_porta_punzones", "espesor_respaldo_punzones", "espesor_pisador"):
            valor = getattr(self, nombre)
            if valor is not None:
                _rango(nombre, valor, 5, 300)
        if self.diametro_poste is not None:
            disponibles = sorted(GUIAS[self.tipo_guia])
            if float(self.diametro_poste) not in [float(d) for d in disponibles]:
                raise SpecError(
                    "No hay poste de Ø{} en el catálogo de guías '{}'. Disponibles: {}".format(
                        _fmt(self.diametro_poste), self.tipo_guia, ", ".join(_fmt(d) for d in disponibles)
                    )
                )
            self.diametro_poste = float(self.diametro_poste)


def _alias(valor: str, tabla: dict[str, str], campo: str, validos: tuple[str, ...]) -> str:
    clave = str(valor).strip().lower()
    if clave in tabla:
        return tabla[clave]
    raise SpecError("Valor inválido para '{}': {!r}. Opciones: {}".format(campo, valor, ", ".join(validos)))


def _rango(nombre: str, valor: float, minimo: float, maximo: float) -> None:
    if valor is None or not (minimo <= float(valor) <= maximo):
        raise SpecError("'{}' = {} fuera de rango ({} a {} mm).".format(nombre, valor, minimo, maximo))


def _clean_name(nombre: str) -> str:
    limpio = "".join(c if (c.isalnum() and c.isascii()) or c in "-_" else "_" for c in str(nombre).strip())
    limpio = limpio.strip("_").upper()
    return limpio or "TROQUEL_001"


def _fmt(valor: float) -> str:
    return ("%.2f" % float(valor)).rstrip("0").rstrip(".")
