"""Catálogos y tablas de referencia para el diseño de la carcasa (die set).

Todos los valores están en milímetros salvo que se indique otra unidad. Son
valores típicos de taller: antes de comprar, verifíquelos contra el catálogo de
su proveedor (Misumi, Danly, Fibro, Agathon, etc.). Para usar sus propios
componentes basta con editar estas tablas.
"""

from __future__ import annotations

# Resistencia al corte aproximada (MPa) por material de la lámina.
RESISTENCIA_CORTE_MPA: dict[str, float] = {
    "acero": 300.0,  # acero bajo carbono (SAE 1008-1020)
    "acero_alta_resistencia": 450.0,  # HSLA / DP
    "inoxidable": 450.0,
    "aluminio": 150.0,
    "cobre": 180.0,
    "laton": 250.0,
}

# Postes guía y bujes. Clave = diámetro del poste.
#   d_ext: diámetro exterior del buje (ajuste a presión en la zapata superior)
#   largo: largo del buje
GUIAS: dict[str, dict[float, dict[str, float]]] = {
    "friccion": {  # buje de bronce con grafito / fricción
        16: {"d_ext": 25, "largo": 40},
        20: {"d_ext": 30, "largo": 50},
        25: {"d_ext": 38, "largo": 60},
        32: {"d_ext": 45, "largo": 70},
        40: {"d_ext": 55, "largo": 80},
        50: {"d_ext": 70, "largo": 100},
        63: {"d_ext": 85, "largo": 120},
    },
    "bolas": {  # buje de bolas con jaula (rodamiento lineal)
        16: {"d_ext": 28, "largo": 50},
        20: {"d_ext": 35, "largo": 63},
        25: {"d_ext": 42, "largo": 75},
        32: {"d_ext": 50, "largo": 90},
        40: {"d_ext": 60, "largo": 100},
        50: {"d_ext": 75, "largo": 120},
        63: {"d_ext": 90, "largo": 150},
    },
}

# Diámetro de poste sugerido según la dimensión mayor de la placa matriz.
POSTE_POR_TAMANO: list[tuple[float, float]] = [
    (160, 20),
    (250, 25),
    (400, 32),
    (630, 40),
    (1000, 50),
    (float("inf"), 63),
]

# Espesores comerciales de placa.
ESPESORES_PLACA: list[float] = [
    8, 10, 12, 15, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40,
    45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120,
]

# Tornillos de cabeza cilíndrica con hexágono interior (ISO 4762 / DIN 912).
#   d: rosca nominal, avellanado: diámetro del caja (cbore), prof_avellanado,
#   broca_machuelo: diámetro de broca para roscar, paso_libre: barreno pasado
TORNILLOS: dict[str, dict[str, float]] = {
    "M8": {"d": 8, "avellanado": 14, "prof_avellanado": 9, "broca_machuelo": 6.8, "paso_libre": 9},
    "M10": {"d": 10, "avellanado": 17.5, "prof_avellanado": 11, "broca_machuelo": 8.5, "paso_libre": 11},
    "M12": {"d": 12, "avellanado": 20, "prof_avellanado": 13, "broca_machuelo": 10.2, "paso_libre": 13.5},
    "M16": {"d": 16, "avellanado": 26, "prof_avellanado": 17, "broca_machuelo": 14, "paso_libre": 17.5},
}

# Tornillo sugerido según la dimensión mayor de la placa matriz.
TORNILLO_POR_TAMANO: list[tuple[float, str]] = [
    (200, "M8"),
    (400, "M10"),
    (630, "M12"),
    (float("inf"), "M16"),
]

LARGOS_TORNILLO: list[float] = [
    16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90,
    100, 110, 120, 130, 140, 150, 160, 180, 200,
]

# Pasadores cilíndricos templados (ISO 8734 / DIN 6325).
LARGOS_PASADOR: list[float] = [
    16, 20, 24, 30, 36, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160,
]

# Calibres de lámina de acero (gauge) a milímetros.
CALIBRES_MM: dict[int, float] = {
    7: 4.55, 8: 4.18, 9: 3.80, 10: 3.42, 11: 3.04, 12: 2.66, 13: 2.28,
    14: 1.90, 15: 1.71, 16: 1.52, 17: 1.37, 18: 1.21, 19: 1.06,
    20: 0.91, 22: 0.76, 24: 0.61, 26: 0.45, 28: 0.38,
}

# Material y tratamiento sugerido por tipo de componente (para la lista de materiales).
MATERIALES: dict[str, str] = {
    "zapata": "Acero AISI 1045 (o hierro fundido) - rectificada",
    "placa_matriz": "Acero D2 templado 58-60 HRC",
    "respaldo": "Acero A2 templado 54-56 HRC",
    "porta_punzones": "Acero AISI 4140 pretemplado",
    "pisador": "Acero AISI 4140 pretemplado",
    "paralela": "Acero AISI 1045",
    "espiga": "Acero AISI 1045",
    "poste": "Acero 52100 templado 60 HRC - rectificado (catálogo)",
    "buje_friccion": "Bronce con grafito (catálogo)",
    "buje_bolas": "Buje de bolas con jaula (catálogo)",
}

# Capa y color (índice de la paleta por defecto de NX) por categoría de componente.
CAPAS: dict[str, int] = {
    "zapata": 10,
    "placa_matriz": 20,
    "respaldo": 21,
    "pisador": 22,
    "porta_punzones": 23,
    "poste": 30,
    "buje": 31,
    "paralela": 40,
    "espiga": 41,
}

COLORES_NX: dict[str, int] = {
    "zapata": 130,
    "placa_matriz": 211,
    "respaldo": 103,
    "pisador": 36,
    "porta_punzones": 108,
    "poste": 186,
    "buje": 78,
    "paralela": 130,
    "espiga": 6,
}

# Colores para la vista previa SVG.
COLORES_SVG: dict[str, str] = {
    "zapata": "#9aa3ad",
    "placa_matriz": "#4f7cc4",
    "respaldo": "#c48a4f",
    "pisador": "#5fae6b",
    "porta_punzones": "#d9a441",
    "poste": "#c0392b",
    "buje": "#b07d2b",
    "paralela": "#7d868f",
    "espiga": "#e0c341",
}


def tamano_estandar_arriba(valor: float, tabla: list[float]) -> float:
    """Menor valor de ``tabla`` que es >= ``valor``; si no hay, redondea a 5 mm hacia arriba."""
    for v in tabla:
        if v >= valor - 1e-9:
            return float(v)
    return float(5 * -(-valor // 5))
