import asyncio
import json
import xml.etree.ElementTree as ET
from pathlib import Path

from troquel import cli, proyecto
from troquel.design import build_design
from troquel.mcp_server import mcp
from troquel.nx_runner import ejecutar_journal
from troquel.preview import generar_svg
from troquel.spec import DieSpec

TEXTO = "troquel de 300x200 lámina calibre 14, 4 postes de 32 con bujes de bolas, altura cerrada 260, nombre PRUEBA_1"


def test_svg_bien_formado():
    svg = generar_svg(build_design(DieSpec.from_dict({"largo": 300, "ancho": 200, "nombre": "SVG_1"})))
    raiz = ET.fromstring(svg)
    assert raiz.tag.endswith("svg")
    assert "SVG_1" in svg and "PLANTA" in svg and "ALZADO" in svg


def test_guardar_listar_y_modificar(salida):
    campos, notas = proyecto.campos_desde_texto(TEXTO)
    archivos = proyecto.guardar(proyecto.disenar(campos))
    for clave in ("spec", "diseno", "journal_nx", "vista_svg", "lista_materiales_csv"):
        assert Path(archivos[clave]).is_file() and Path(archivos[clave]).parent == salida / "PRUEBA_1"
    assert proyecto.listar() == ["PRUEBA_1"]

    design, notas = proyecto.modificar("PRUEBA_1", texto="postes de 40, sin paralelas")
    assert {p["d"] for p in design.postes} == {40}
    assert design.parametros["altura_paralelas"] == 0
    assert design.parametros["altura_cerrada"] == 260


def test_cli_texto_y_modificacion(salida, capsys):
    assert cli.main([TEXTO]) == 0
    assert "PRUEBA_1" in capsys.readouterr().out
    assert cli.main(["--modificar", "PRUEBA_1", "--nombre", "PRUEBA_2", "postes de 40", "--json"]) == 0
    res = json.loads(capsys.readouterr().out)
    assert res["diseno_id"] == "PRUEBA_2"
    assert sorted(proyecto.listar()) == ["PRUEBA_1", "PRUEBA_2"]


def test_cli_sin_dimensiones_falla(salida, capsys):
    assert cli.main(["4 postes de bolas"]) == 1
    assert "dimensiones" in capsys.readouterr().err


def _llamar(nombre, argumentos):
    r = asyncio.run(mcp.call_tool(nombre, argumentos))
    if isinstance(r, tuple):
        r = r[0]
    contenido = getattr(r, "content", r)
    return json.loads(contenido[0].text)


def test_mcp_flujo_completo(salida):
    nombres = {t.name for t in asyncio.run(mcp.list_tools())}
    assert {"disenar_troquel", "disenar_troquel_desde_texto", "modificar_troquel", "obtener_diseno",
            "listar_disenos", "catalogo_guias", "ejecutar_en_nx"} <= nombres

    res = _llamar("disenar_troquel_desde_texto", {"descripcion": TEXTO})
    assert res["diseno_id"] == "PRUEBA_1" and "interpretacion" in res and res["archivos"]["journal_nx"].endswith(".py")

    res = _llamar("disenar_troquel", {"largo": 400, "ancho": 250, "nombre": "MCP_2", "arreglo_postes": "trasero",
                                      "opciones": {"espesor_placa_matriz": 40}})
    assert res["resumen"]["placa_matriz"] == "400 x 250 x 40 mm"

    res = _llamar("modificar_troquel", {"diseno_id": "MCP_2", "cambios": {"diametro_poste": 40}})
    assert "Ø40" in res["resumen"]["guiado"]

    assert _llamar("listar_disenos", {})["disenos"] == ["MCP_2", "PRUEBA_1"]
    assert "primitivas" not in _llamar("obtener_diseno", {"diseno_id": "MCP_2"})["componentes"][0]


def test_mcp_errores_legibles(salida):
    assert "dimensiones" in _llamar("disenar_troquel_desde_texto", {"descripcion": "postes de bolas"})["error"]
    assert "No existe" in _llamar("modificar_troquel", {"diseno_id": "NADA", "cambios_texto": "postes de 40"})["error"]


def test_ejecutar_sin_nx_da_instrucciones(salida, monkeypatch, tmp_path):
    for var in ("NX_RUN_JOURNAL", "UGII_BASE_DIR", "UGII_ROOT_DIR"):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setenv("PATH", str(tmp_path))
    res = ejecutar_journal(tmp_path / "j.py", tmp_path / "j.prt")
    assert res["ejecutado"] is False and "Alt+F8" in res["mensaje"]
