import itertools

import pytest

from troquel.design import CLARO_PLACAS, build_design
from troquel.geometry import Bloque, Cilindro, Componente
from troquel.interference import buscar_interferencias
from troquel.spec import DieSpec, SpecError


def diseno(**kw):
    kw.setdefault("largo", 300)
    kw.setdefault("ancho", 200)
    return build_design(DieSpec.from_dict(kw))


CASOS = list(itertools.product(
    ["cuatro", "diagonal", "trasero", "centro"],
    ["friccion", "bolas"],
    [(150, 100, 1.0), (300, 200, 1.5), (520, 260, 3.5)],
))


@pytest.mark.parametrize("arreglo,guia,medidas", CASOS)
def test_carcasa_sin_interferencias_en_todas_las_configuraciones(arreglo, guia, medidas):
    largo, ancho, t = medidas
    d = diseno(largo=largo, ancho=ancho, espesor_lamina=t, arreglo_postes=arreglo, tipo_guia=guia, espiga=True)
    temas_error = [v.tema for v in d.errores]
    assert "interferencia" not in temas_error, [v.mensaje for v in d.errores]
    assert any(v.tema == "interferencia" and v.nivel == "ok" for v in d.verificaciones)
    assert not any(v.tema == "paralelas" for v in d.verificaciones), "las paralelas tapan la placa matriz"
    n_postes = 4 if arreglo == "cuatro" else 2
    assert len([c for c in d.componentes if c.categoria == "poste"]) == n_postes
    assert len([c for c in d.componentes if c.categoria == "buje"]) == n_postes


def test_componentes_de_la_carcasa_completa():
    d = diseno(espiga=True, espesor_respaldo_matriz=15)
    nombres = {c.nombre for c in d.componentes}
    assert {"ZAPATA_INFERIOR", "ZAPATA_SUPERIOR", "PARALELA_DELANTERA", "PARALELA_TRASERA", "PLACA_MATRIZ",
            "RESPALDO_MATRIZ", "PISADOR", "PORTA_PUNZONES", "RESPALDO_PUNZONES", "ESPIGA"} <= nombres
    assert {"POSTE_GUIA_{}".format(i) for i in range(1, 5)} <= nombres
    assert {"BUJE_GUIA_{}".format(i) for i in range(1, 5)} <= nombres


def test_postes_fuera_de_las_placas_y_dentro_de_las_zapatas():
    d = diseno()
    x0, x1 = d.parametros["zapata_x"]
    y0, y1 = d.parametros["zapata_y"]
    for p in d.postes:
        r = p["d_ext"] / 2
        assert abs(p["y"]) - r >= d.spec.ancho / 2 + CLARO_PLACAS - 1e-6
        assert x0 < p["x"] - r and p["x"] + r < x1
        assert y0 < p["y"] - r and p["y"] + r < y1


def test_poste_queda_bajo_la_cara_superior_y_buje_no_toca_zapata_inferior():
    for guia in ("friccion", "bolas"):
        d = diseno(tipo_guia=guia)
        for p in d.postes:
            assert p["z_tope_poste"] <= d.niveles["zapata_sup_1"] - d.spec.claro_superior_poste + 1e-6
            assert p["z_buje_0"] >= d.niveles["zapata_inf_1"] + 5


def test_apilamiento_vertical_consistente():
    d = diseno()
    n, p, t = d.niveles, d.parametros, d.spec.espesor_lamina
    assert n["zapata_inf_1"] - n["zapata_inf_0"] == p["espesor_zapata_inferior"]
    assert n["pisador_0"] == pytest.approx(n["matriz_1"] + t)
    assert n["porta_0"] == pytest.approx(n["pisador_1"] + d.spec.claro_pisador)
    assert n["zapata_sup_1"] == pytest.approx(p["altura_cerrada"])


def test_poka_yoke_cuatro_postes_desfasa_un_poste():
    con = diseno()
    sin = diseno(poka_yoke=False)
    xs_con = sorted(abs(p["x"]) for p in con.postes)
    xs_sin = sorted(abs(p["x"]) for p in sin.postes)
    assert len(set(xs_sin)) == 1
    assert xs_con[0] == pytest.approx(xs_sin[0] - con.spec.desfase_poka_yoke)


def test_poka_yoke_diagonal_usa_diametros_distintos():
    d = diseno(arreglo_postes="diagonal")
    assert d.postes[0]["d"] != d.postes[1]["d"]
    assert len({p["d"] for p in diseno(arreglo_postes="diagonal", poka_yoke=False).postes}) == 1


def test_altura_cerrada_objetivo_ajusta_paralelas():
    d = diseno(altura_cerrada=300)
    assert d.parametros["altura_cerrada"] == pytest.approx(300)
    assert d.parametros["altura_paralelas"] == pytest.approx(300 - d.parametros["altura_cerrada_sin_paralelas"])


def test_altura_cerrada_sin_paralelas_engruesa_zapata_inferior():
    base = diseno(paralelas=False)
    d = diseno(paralelas=False, altura_cerrada=base.parametros["altura_cerrada"] + 12)
    assert d.parametros["espesor_zapata_inferior"] == pytest.approx(base.parametros["espesor_zapata_inferior"] + 12)
    assert d.parametros["altura_cerrada"] == pytest.approx(base.parametros["altura_cerrada"] + 12)


def test_altura_cerrada_imposible():
    with pytest.raises(SpecError):
        diseno(altura_cerrada=150)
    with pytest.raises(SpecError):
        diseno(paralelas=False, altura_cerrada=120)


def test_espesores_forzados_se_respetan():
    d = diseno(espesor_placa_matriz=40, espesor_zapata_inferior=65, espesor_pisador=25, diametro_poste=40)
    assert d.parametros["espesor_placa_matriz"] == 40
    assert d.parametros["espesor_zapata_inferior"] == 65
    assert d.parametros["espesor_pisador"] == 25
    assert {p["d"] for p in d.postes} == {40}


def test_guiado_con_bolas_y_carrera_excesiva_es_error():
    d = diseno(tipo_guia="bolas", carrera=250)
    assert any(v.tema == "guiado" for v in d.errores)


def test_guiado_friccion_carrera_grande_es_aviso_no_error():
    d = diseno(tipo_guia="friccion", carrera=250)
    assert not any(v.tema == "guiado" for v in d.errores)
    assert any(v.tema == "guiado" and v.nivel == "aviso" for v in d.verificaciones)


def test_fuerza_de_corte_y_prensa():
    d = diseno(perimetro_corte=1000, espesor_lamina=2, tonelaje_prensa=40)
    # 1000 mm x 2 mm x 300 MPa = 600 kN = 61.2 t > 40 t
    assert d.parametros["fuerza_corte_kN"] == pytest.approx(600)
    assert any(v.tema == "fuerza" for v in d.errores)
    assert not any(v.tema == "fuerza" for v in diseno(perimetro_corte=1000, espesor_lamina=2, tonelaje_prensa=100).errores)


def test_lista_de_materiales_agrupa_y_cuenta_tornilleria():
    d = diseno()
    bom = d.lista_materiales()
    postes = [f for f in bom if f["descripcion"].startswith("Poste")]
    assert len(postes) == 1 and postes[0]["cantidad"] == 4
    n = d.parametros["tornillo"]["cantidad_por_lado"]
    tornillos = sum(f["cantidad"] for f in bom if f["descripcion"].startswith("Tornillo"))
    assert tornillos == 2 * n
    assert [f["item"] for f in bom] == list(range(1, len(bom) + 1))


def test_ranuras_de_sujecion_no_tocan_postes_ni_placas():
    for arreglo in ("cuatro", "centro", "trasero", "diagonal"):
        d = diseno(arreglo_postes=arreglo)
        assert d.parametros["ranuras_sujecion"], arreglo
        for r in d.parametros["ranuras_sujecion"]:
            assert min(abs(r["x_fondo"]), abs(r["x_borde"])) >= d.spec.largo / 2


def test_verificador_de_interferencias_detecta_choques():
    a = Componente("A", "zapata", "a", "m", "")
    a.agregar(Bloque(0, 0, 0, 100, 100, 20))
    b = Componente("B", "poste", "b", "m", "")
    b.agregar(Cilindro(50, 50, 10, 20, 50))
    assert buscar_interferencias([a, b])
    a.restar(Cilindro(50, 50, -1, 20, 22))  # barreno exacto: sólo contacto
    assert buscar_interferencias([a, b]) == []


def test_validacion_de_especificacion():
    with pytest.raises(SpecError):
        DieSpec.from_dict({"largo": 300})
    with pytest.raises(SpecError):
        DieSpec.from_dict({"largo": 300, "ancho": 200, "parametro_inventado": 1})
    with pytest.raises(SpecError):
        DieSpec.from_dict({"largo": 300, "ancho": 200, "arreglo_postes": "triangular"})
    with pytest.raises(SpecError):
        DieSpec.from_dict({"largo": 300, "ancho": 200, "diametro_poste": 33})
    s = DieSpec.from_dict({"largo": 300, "ancho": 200, "arreglo_postes": "rear", "tipo_guia": "ball",
                           "material": "Stainless", "nombre": "mi troquel #1"})
    assert (s.arreglo_postes, s.tipo_guia, s.material, s.nombre) == ("trasero", "bolas", "inoxidable", "MI_TROQUEL__1")
