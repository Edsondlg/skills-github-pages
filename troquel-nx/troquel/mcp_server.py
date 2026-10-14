"""Servidor MCP: permite a Claude diseñar troqueles para Siemens NX conversando en texto.

Arranque (stdio):  python -m troquel.mcp_server
Variables de entorno opcionales:
    TROQUEL_OUTPUT_DIR  carpeta donde se guardan los diseños (por omisión ~/troqueles_nx)
    UGII_BASE_DIR       instalación de NX, para ejecutar el journal con run_journal
    NX_RUN_JOURNAL      ruta directa a run_journal.exe
"""

from __future__ import annotations

from typing import Any

try:  # mcp >= 2.0
    from mcp.server.mcpserver import MCPServer as _Servidor
except ImportError:  # mcp 1.x
    from mcp.server.fastmcp import FastMCP as _Servidor

from . import catalog as cat
from . import proyecto
from .nx_runner import encontrar_run_journal, ejecutar_journal
from .spec import DieSpec, SpecError

INSTRUCCIONES = """\
Diseño de carcasas de troquel (die sets) para Siemens NX. Unidades: milímetros.
Flujo recomendado:
1. Con la descripción del usuario llame a `disenar_troquel` (parámetros estructurados) o a
   `disenar_troquel_desde_texto` (texto libre). Lo único obligatorio es largo x ancho de la placa matriz;
   si faltan, pregúntelos. X = largo en el sentido de avance de la tira, Y = ancho.
2. Muestre al usuario el resumen, las verificaciones con nivel 'error' o 'aviso' y la lista de materiales,
   y proponga correcciones si hay errores.
3. Para cambios use `modificar_troquel` con el diseno_id (texto como "postes de 40, sin paralelas" o un dict).
4. Para construirlo en NX use `ejecutar_en_nx`; si NX no está disponible por lotes, indique abrir el journal
   en NX con Herramientas > Journal > Reproducir (Alt+F8).
Arreglos de postes: cuatro | diagonal | trasero | centro. Guías: friccion | bolas.
"""

mcp = _Servidor(name="troquel-nx", instructions=INSTRUCCIONES)


def _ejecutar(funcion, *args, **kwargs) -> dict[str, Any]:
    try:
        return funcion(*args, **kwargs)
    except SpecError as exc:
        return {"error": str(exc)}


@mcp.tool()
def disenar_troquel(
    largo: float,
    ancho: float,
    espesor_lamina: float = 1.5,
    nombre: str = "TROQUEL_001",
    arreglo_postes: str = "cuatro",
    tipo_guia: str = "friccion",
    diametro_poste: float | None = None,
    altura_cerrada: float | None = None,
    carrera: float = 60.0,
    material: str = "acero",
    perimetro_corte: float | None = None,
    tonelaje_prensa: float | None = None,
    ancho_tira: float | None = None,
    espiga: bool = False,
    paralelas: bool = True,
    opciones: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Diseña la carcasa completa del troquel y genera el journal de NX, la vista SVG y la lista de materiales.

    largo/ancho: tamaño de la placa matriz en mm (largo = sentido de avance de la tira).
    arreglo_postes: cuatro | diagonal | trasero | centro. tipo_guia: friccion | bolas.
    diametro_poste: None = automático según el tamaño. altura_cerrada: objetivo en mm (ajusta las paralelas).
    material: acero | acero_alta_resistencia | inoxidable | aluminio | cobre | laton.
    perimetro_corte (mm) + tonelaje_prensa (t): calcula la fuerza de corte y verifica la prensa.
    opciones: cualquier otro campo de DieSpec, p. ej. {"espesor_placa_matriz": 40, "espesor_zapata_inferior": 60,
    "espesor_pisador": 25, "espesor_respaldo_matriz": 15, "altura_paralelas": 60, "poka_yoke": false,
    "tornilleria": false, "ranuras_sujecion": false, "margen_sujecion": 80, "diametro_espiga": 50}.
    """
    campos = {k: v for k, v in dict(
        largo=largo, ancho=ancho, espesor_lamina=espesor_lamina, nombre=nombre, arreglo_postes=arreglo_postes,
        tipo_guia=tipo_guia, diametro_poste=diametro_poste, altura_cerrada=altura_cerrada, carrera=carrera,
        material=material, perimetro_corte=perimetro_corte, tonelaje_prensa=tonelaje_prensa, ancho_tira=ancho_tira,
        espiga=espiga, paralelas=paralelas).items() if v is not None}
    campos.update(opciones or {})

    def hacer() -> dict[str, Any]:
        design = proyecto.disenar(campos)
        return proyecto.resultado(design, proyecto.guardar(design))

    return _ejecutar(hacer)


@mcp.tool()
def disenar_troquel_desde_texto(descripcion: str, nombre: str | None = None) -> dict[str, Any]:
    """Diseña el troquel a partir de una descripción en español, p. ej.
    "troquel progresivo de 300x200 para lámina calibre 14, 4 postes de 32 con bujes de bolas, altura cerrada 260".
    Devuelve también 'interpretacion' con lo que se entendió del texto.
    """
    def hacer() -> dict[str, Any]:
        campos, notas = proyecto.campos_desde_texto(descripcion)
        if nombre:
            campos["nombre"] = nombre
        design = proyecto.disenar(campos)
        return proyecto.resultado(design, proyecto.guardar(design), notas)

    return _ejecutar(hacer)


@mcp.tool()
def modificar_troquel(diseno_id: str, cambios_texto: str | None = None, cambios: dict[str, Any] | None = None,
                      nuevo_nombre: str | None = None) -> dict[str, Any]:
    """Modifica un diseño guardado. cambios_texto: p. ej. "postes de 40, altura cerrada 300, sin paralelas".
    cambios: dict con campos de DieSpec, p. ej. {"diametro_poste": 40}. nuevo_nombre: guarda como otro diseño.
    """
    def hacer() -> dict[str, Any]:
        design, notas = proyecto.modificar(diseno_id, cambios=cambios, texto=cambios_texto, nuevo_nombre=nuevo_nombre)
        return proyecto.resultado(design, proyecto.guardar(design), notas)

    return _ejecutar(hacer)


@mcp.tool()
def obtener_diseno(diseno_id: str, incluir_geometria: bool = False) -> dict[str, Any]:
    """Devuelve el diseño guardado: parámetros calculados, niveles Z, postes, verificaciones y lista de materiales.
    incluir_geometria=True agrega las primitivas (bloques/cilindros) de cada componente.
    """
    def hacer() -> dict[str, Any]:
        design = proyecto.disenar(proyecto.cargar_campos(diseno_id))
        datos = design.to_dict()
        if not incluir_geometria:
            datos["componentes"] = [{k: v for k, v in c.items() if k != "primitivas"} for c in datos["componentes"]]
        return datos

    return _ejecutar(hacer)


@mcp.tool()
def listar_disenos() -> dict[str, Any]:
    """Lista los diseños guardados en la carpeta de salida."""
    return {"carpeta": str(proyecto.carpeta_salida()), "disenos": proyecto.listar()}


@mcp.tool()
def catalogo_guias() -> dict[str, Any]:
    """Catálogo de postes y bujes (diámetro de poste -> diámetro exterior y largo del buje), parámetros
    disponibles de DieSpec y materiales de lámina."""
    return {
        "guias": {tipo: {str(d): v for d, v in tabla.items()} for tipo, tabla in cat.GUIAS.items()},
        "materiales_lamina_MPa": cat.RESISTENCIA_CORTE_MPA,
        "parametros": sorted(DieSpec.field_names()),
        "nota": "Valores típicos; verifíquelos contra el catálogo de su proveedor.",
    }


@mcp.tool()
def ejecutar_en_nx(diseno_id: str, timeout_s: int = 900) -> dict[str, Any]:
    """Construye el diseño en Siemens NX por lotes (run_journal) y guarda el .prt junto al journal."""
    def hacer() -> dict[str, Any]:
        design = proyecto.disenar(proyecto.cargar_campos(diseno_id))
        archivos = proyecto.guardar(design)
        res = ejecutar_journal(archivos["journal_nx"], archivos["prt"], timeout_s=timeout_s)
        res["run_journal"] = str(encontrar_run_journal() or "")
        return res

    return _ejecutar(hacer)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()

