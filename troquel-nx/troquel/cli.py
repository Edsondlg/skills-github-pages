"""Línea de comandos: diseñe un troquel con una frase.

Ejemplos:
    python -m troquel "troquel de 300x200, lámina calibre 14, 4 postes de 32, bujes de bolas"
    python -m troquel --spec mi_troquel.json --out C:\\troqueles --nx
    python -m troquel --modificar TROQUEL_001 "postes de 40, sin paralelas"
    python -m troquel --catalogo
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import catalog as cat
from . import proyecto
from .nx_runner import ejecutar_journal
from .spec import SpecError

ICONOS = {"ok": "[OK]   ", "aviso": "[AVISO]", "error": "[ERROR]", "info": "[i]    "}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="troquel", description="Diseño de carcasas de troquel para Siemens NX.")
    parser.add_argument("texto", nargs="*", help="Descripción en texto libre (o los cambios con --modificar).")
    parser.add_argument("--spec", help="Archivo JSON con los campos de DieSpec.")
    parser.add_argument("--modificar", metavar="DISENO_ID", help="Modifica un diseño guardado con el texto dado.")
    parser.add_argument("--nombre", help="Nombre del diseño (sobrescribe el del texto).")
    parser.add_argument("--out", help="Carpeta de salida (por omisión TROQUEL_OUTPUT_DIR o ~/troqueles_nx).")
    parser.add_argument("--nx", action="store_true", help="Ejecuta el journal en NX con run_journal al terminar.")
    parser.add_argument("--json", action="store_true", help="Imprime el resultado completo en JSON.")
    parser.add_argument("--catalogo", action="store_true", help="Muestra el catálogo de postes y bujes.")
    args = parser.parse_args(argv)

    if args.catalogo:
        print(json.dumps(cat.GUIAS, indent=2, ensure_ascii=False))
        return 0

    texto = " ".join(args.texto).strip()
    try:
        if args.modificar:
            design, notas = proyecto.modificar(args.modificar, texto=texto or None, nuevo_nombre=args.nombre, base=args.out)
        elif args.spec:
            campos = json.loads(Path(args.spec).read_text(encoding="utf-8"))
            if args.nombre:
                campos["nombre"] = args.nombre
            design, notas = proyecto.disenar(campos), None
        elif texto:
            campos, notas = proyecto.campos_desde_texto(texto)
            if args.nombre:
                campos["nombre"] = args.nombre
            design = proyecto.disenar(campos)
        else:
            parser.print_help()
            return 2
    except SpecError as exc:
        print("ERROR: {}".format(exc), file=sys.stderr)
        return 1

    archivos = proyecto.guardar(design, args.out)
    res = proyecto.resultado(design, archivos, notas)
    if args.nx:
        res["nx"] = ejecutar_journal(archivos["journal_nx"], archivos["prt"])

    if args.json:
        print(json.dumps(res, indent=2, ensure_ascii=False))
    else:
        _imprimir(res)
    return 1 if design.errores else 0


def _imprimir(res: dict) -> None:
    if res.get("interpretacion"):
        print("Entendí:")
        for n in res["interpretacion"]:
            print("  - " + n)
    print("\nDiseño {}".format(res["diseno_id"]))
    for k, v in res["resumen"].items():
        print("  {:<15} {}".format(k, v))
    print("\nVerificaciones:")
    for v in res["verificaciones"]:
        print("  {} {}".format(ICONOS.get(v["nivel"], v["nivel"]), v["mensaje"]))
    print("\nLista de materiales:")
    for f in res["lista_materiales"]:
        print("  {:>2}. {:>2} x {}".format(f["item"], f["cantidad"], f["descripcion"]))
    print("\nArchivos:")
    for k, v in res["archivos"].items():
        print("  {:<22} {}".format(k, v))
    if "nx" in res:
        print("\nNX: " + json.dumps(res["nx"], ensure_ascii=False, indent=2))
    else:
        print("\n" + res["siguiente_paso"])


if __name__ == "__main__":
    raise SystemExit(main())
