"""Genera el journal de NX Open (Python) que construye el troquel en Siemens NX."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from . import catalog as cat
from .design import DieDesign

_TEMPLATE = Path(__file__).with_name("nx_builder_template.py")
_MARCA = '"%%DESIGN_JSON%%"'


def datos_para_nx(design: DieDesign, ruta_prt: str | None = None) -> dict[str, Any]:
    """Datos mínimos que necesita el journal: componentes con primitivas, capa y color."""
    resumen = ["{}: {}".format(k, v) for k, v in design.resumen().items()]
    componentes = []
    for c in design.componentes:
        d = c.to_dict()
        d["capa"] = cat.CAPAS[c.categoria]
        d["color"] = cat.COLORES_NX[c.categoria]
        componentes.append(d)
    return {
        "nombre": design.spec.nombre,
        "ruta_prt": ruta_prt or "",
        "resumen": resumen,
        "componentes": componentes,
    }


def generar_journal(design: DieDesign, ruta_prt: str | None = None) -> str:
    """Devuelve el texto del journal listo para ejecutarse en NX."""
    plantilla = _TEMPLATE.read_text(encoding="utf-8")
    if plantilla.count(_MARCA) != 1:
        raise RuntimeError("La plantilla del journal no contiene la marca de datos")
    datos = json.dumps(datos_para_nx(design, ruta_prt), ensure_ascii=True, separators=(",", ":"))
    return plantilla.replace(_MARCA, repr(datos))
