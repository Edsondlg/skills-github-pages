"""El journal no puede ejecutarse sin NX; se valida con un NXOpen simulado (MagicMock)."""

import ast
import json
import sys
from unittest import mock

import pytest

from troquel.design import build_design
from troquel.nx_journal import datos_para_nx, generar_journal
from troquel.spec import DieSpec


@pytest.fixture
def design():
    return build_design(DieSpec.from_dict({"largo": 300, "ancho": 200, "espiga": True, "espesor_respaldo_matriz": 12}),
                        verificar_interferencias=False)


def test_journal_es_python_36_valido(design):
    ast.parse(generar_journal(design, "C:/troqueles/T.prt"), feature_version=(3, 6))


def test_journal_contiene_el_diseno(design):
    texto = generar_journal(design, "C:/troqueles/T.prt")
    arbol = ast.parse(texto)
    asignacion = next(n for n in arbol.body if isinstance(n, ast.Assign) and n.targets[0].id == "DESIGN_JSON")
    assert json.loads(asignacion.value.value) == json.loads(json.dumps(datos_para_nx(design, "C:/troqueles/T.prt")))


def _nxopen_simulado():
    nx = mock.MagicMock(name="NXOpen")
    modulos = {"NXOpen": nx, "NXOpen.Features": nx.Features, "NXOpen.GeometricUtilities": nx.GeometricUtilities}
    return nx, modulos


def test_journal_construye_todos_los_componentes(design, tmp_path):
    nx, modulos = _nxopen_simulado()
    session = nx.Session.GetSession.return_value
    pieza = session.Parts.Work
    cuerpo_bloque, cuerpo_cil = mock.MagicMock(name="cuerpo_bloque"), mock.MagicMock(name="cuerpo_cilindro")
    pieza.Features.CreateBlockFeatureBuilder.return_value.CommitFeature.return_value.GetBodies.return_value = [cuerpo_bloque]
    pieza.Features.CreateCylinderBuilder.return_value.CommitFeature.return_value.GetBodies.return_value = [cuerpo_cil]
    prt = tmp_path / "SALIDA.prt"
    codigo = compile(generar_journal(design, str(prt)), "journal_nx.py", "exec")
    with mock.patch.dict(sys.modules, modulos), mock.patch.object(sys, "argv", ["journal_nx.py", str(prt)]):
        exec(codigo, {"__name__": "__main__"})

    bloques = sum(1 for c in design.componentes for p in c.primitivas if p.tipo == "bloque")
    cilindros = sum(1 for c in design.componentes for p in c.primitivas if p.tipo == "cilindro")
    assert pieza.Features.CreateBlockFeatureBuilder.call_count == bloques
    assert pieza.Features.CreateCylinderBuilder.call_count == cilindros

    nombres = [llamada.args[0] for cuerpo in (cuerpo_bloque, cuerpo_cil) for llamada in cuerpo.SetName.call_args_list]
    assert sorted(nombres) == sorted(c.nombre for c in design.componentes)

    # Cada barreno se resta del cuerpo; nunca se crea un cuerpo suelto por un hueco.
    huecos = sum(1 for c in design.componentes for p in c.primitivas if p.op == "restar")
    objetivos = (pieza.Features.CreateBlockFeatureBuilder.return_value.BooleanOption.SetTargetBodies.call_count
                 + pieza.Features.CreateCylinderBuilder.return_value.BooleanOption.SetTargetBodies.call_count)
    assert objetivos == huecos

    nuevo = session.Parts.FileNew.return_value
    assert nuevo.NewFileName == str(prt)
    pieza.Save.assert_called_once()
    textos = " ".join(str(c.args[0]) for c in session.ListingWindow.WriteLine.call_args_list)
    assert "Componentes creados: {} de {}".format(len(design.componentes), len(design.componentes)) in textos
    assert "AVISO" not in textos


def test_journal_no_sobrescribe_prt_existente(design, tmp_path):
    nx, modulos = _nxopen_simulado()
    prt = tmp_path / "SALIDA.prt"
    prt.write_text("existente")
    codigo = compile(generar_journal(design, str(prt)), "journal_nx.py", "exec")
    with mock.patch.dict(sys.modules, modulos), mock.patch.object(sys, "argv", ["journal_nx.py", str(prt)]):
        exec(codigo, {"__name__": "__main__"})
    nuevo = nx.Session.GetSession.return_value.Parts.FileNew.return_value
    assert nuevo.NewFileName == str(tmp_path / "SALIDA_v2.prt")
