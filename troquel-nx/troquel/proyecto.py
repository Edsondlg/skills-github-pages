"""Servicio común para la CLI y el servidor MCP: diseñar, guardar, cargar y modificar."""

from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from typing import Any

from .design import DieDesign, build_design
from .nx_journal import generar_journal
from .preview import generar_svg
from .spec import DieSpec, SpecError
from .text_parser import interpretar


def carpeta_salida(base: str | os.PathLike | None = None) -> Path:
    if base:
        return Path(base).expanduser().resolve()
    env = os.environ.get("TROQUEL_OUTPUT_DIR")
    return Path(env).expanduser().resolve() if env else (Path.home() / "troqueles_nx").resolve()


def disenar(campos: dict[str, Any]) -> DieDesign:
    return build_design(DieSpec.from_dict(dict(campos)))


def campos_desde_texto(texto: str) -> tuple[dict[str, Any], list[str]]:
    r = interpretar(texto)
    if "largo" not in r.campos or "ancho" not in r.campos:
        raise SpecError("No encontré las dimensiones de la placa matriz en el texto. Indíquelas como '300x200' "
                        "(largo en el sentido de avance x ancho, en mm).")
    return r.campos, r.notas


def guardar(design: DieDesign, base: str | os.PathLike | None = None) -> dict[str, str]:
    """Escribe spec.json, diseno.json, journal NX, vista SVG y lista de materiales CSV."""
    carpeta = carpeta_salida(base) / design.spec.nombre
    carpeta.mkdir(parents=True, exist_ok=True)
    nombre = design.spec.nombre
    rutas = {
        "carpeta": carpeta,
        "spec": carpeta / "spec.json",
        "diseno": carpeta / "diseno.json",
        "journal_nx": carpeta / "{}_journal_nx.py".format(nombre),
        "vista_svg": carpeta / "{}_vista.svg".format(nombre),
        "lista_materiales_csv": carpeta / "{}_lista_materiales.csv".format(nombre),
        "prt": carpeta / "{}.prt".format(nombre),
    }
    rutas["spec"].write_text(json.dumps(design.spec.to_dict(), indent=2, ensure_ascii=False), encoding="utf-8")
    rutas["diseno"].write_text(json.dumps(design.to_dict(), indent=2, ensure_ascii=False), encoding="utf-8")
    rutas["journal_nx"].write_text(generar_journal(design, str(rutas["prt"])), encoding="utf-8")
    rutas["vista_svg"].write_text(generar_svg(design), encoding="utf-8")
    with open(rutas["lista_materiales_csv"], "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Item", "Descripcion", "Cantidad", "Material", "Medidas"])
        for fila in design.lista_materiales():
            w.writerow([fila["item"], fila["descripcion"], fila["cantidad"], fila["material"], fila["medidas"]])
    return {k: str(v) for k, v in rutas.items()}


def cargar_campos(diseno_id: str, base: str | os.PathLike | None = None) -> dict[str, Any]:
    ruta = carpeta_salida(base) / diseno_id / "spec.json"
    if not ruta.is_file():
        disponibles = ", ".join(listar(base)) or "ninguno"
        raise SpecError("No existe el diseño '{}'. Disponibles: {}".format(diseno_id, disponibles))
    return json.loads(ruta.read_text(encoding="utf-8"))


def listar(base: str | os.PathLike | None = None) -> list[str]:
    carpeta = carpeta_salida(base)
    if not carpeta.is_dir():
        return []
    return sorted(p.parent.name for p in carpeta.glob("*/spec.json"))


def modificar(diseno_id: str, cambios: dict[str, Any] | None = None, texto: str | None = None,
              nuevo_nombre: str | None = None, base: str | os.PathLike | None = None) -> tuple[DieDesign, list[str]]:
    campos = cargar_campos(diseno_id, base)
    notas: list[str] = []
    if texto:
        r = interpretar(texto)
        campos.update(r.campos)
        notas.extend(r.notas)
    if cambios:
        campos.update(cambios)
        notas.extend("{} = {}".format(k, v) for k, v in cambios.items())
    if nuevo_nombre:
        campos["nombre"] = nuevo_nombre
    if not notas and not nuevo_nombre:
        raise SpecError("No se reconoció ningún cambio. Ejemplos: 'postes de 40', 'altura cerrada 300', 'sin paralelas'.")
    return disenar(campos), notas


def resultado(design: DieDesign, archivos: dict[str, str] | None = None, notas: list[str] | None = None) -> dict[str, Any]:
    """Respuesta compacta para mostrar al usuario (CLI y MCP)."""
    salida: dict[str, Any] = {"diseno_id": design.spec.nombre}
    if notas is not None:
        salida["interpretacion"] = notas
    salida["resumen"] = design.resumen()
    salida["verificaciones"] = [v.to_dict() for v in design.verificaciones if v.nivel != "info"]
    salida["lista_materiales"] = design.lista_materiales()
    if archivos:
        salida["archivos"] = archivos
        salida["siguiente_paso"] = (
            "En NX: Herramientas > Journal > Reproducir (Alt+F8) y elija '{}'. O use la herramienta "
            "ejecutar_en_nx / la opción --nx para correrlo por lotes con run_journal.".format(archivos["journal_nx"]))
    return salida
