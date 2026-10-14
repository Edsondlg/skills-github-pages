import pytest

from troquel.text_parser import interpretar


def campos(texto):
    return interpretar(texto).campos


def test_frase_completa():
    c = campos("Troquel progresivo de 300x200 para lámina de acero calibre 14, 4 postes de 32 con bujes de bolas, "
               "altura cerrada 260, carrera 50, con espiga")
    assert c == {"largo": 300, "ancho": 200, "espesor_lamina": 1.9, "material": "acero", "arreglo_postes": "cuatro",
                 "diametro_poste": 32, "tipo_guia": "bolas", "altura_cerrada": 260, "carrera": 50, "espiga": True}


def test_coma_decimal_prensa_perimetro_y_nombre():
    c = campos("Troquel para lámina, 300x200 mm, espesor 1,2 mm, 2 postes traseros de 40, prensa de 60 toneladas, "
               "perímetro de corte 450, llamado TRQ-450")
    assert c["espesor_lamina"] == 1.2
    assert c["arreglo_postes"] == "trasero"
    assert c["diametro_poste"] == 40
    assert c["tonelaje_prensa"] == 60
    assert c["perimetro_corte"] == 450
    assert c["nombre"] == "TRQ-450"


@pytest.mark.parametrize("texto,esperado", [
    ("300 x 200, 1.5 mm de espesor", 1.5),
    ("lámina de acero de 2.5 mm, 400x300", 2.5),
    ("t=0.8, 200x150", 0.8),
    ("calibre 16, 200x150", 1.52),
    ("troquel para lamina, 300x200", None),
])
def test_espesor_de_lamina(texto, esperado):
    assert campos(texto).get("espesor_lamina") == esperado


@pytest.mark.parametrize("texto,esperado", [
    ("2 postes diagonales", "diagonal"),
    ("dos postes", "diagonal"),
    ("cuatro columnas", "cuatro"),
    ("postes al centro", "centro"),
    ("back post die set", "trasero"),
])
def test_arreglo_de_postes(texto, esperado):
    assert campos(texto)["arreglo_postes"] == esperado


def test_espesores_de_placas():
    c = campos("placa matriz de 40, zapata inferior 60 mm, zapata superior de 45, pisador 25, sufridera 12, "
               "porta punzones de 30, respaldo de matriz 15")
    assert c == {"espesor_placa_matriz": 40, "espesor_zapata_inferior": 60, "espesor_zapata_superior": 45,
                 "espesor_pisador": 25, "espesor_respaldo_punzones": 12, "espesor_porta_punzones": 30,
                 "espesor_respaldo_matriz": 15}


def test_dimensiones_no_se_confunden_con_espesores():
    c = campos("matriz 300x200, placa matriz de 35")
    assert (c["largo"], c["ancho"], c["espesor_placa_matriz"]) == (300, 200, 35)


def test_frases_de_modificacion():
    assert campos("cambia los postes a 40 y quita las paralelas") == {"diametro_poste": 40, "paralelas": False}
    assert campos("sube la altura cerrada a 300") == {"altura_cerrada": 300}
    assert campos("paralelas de 70, sin espiga, sin tornillería") == {
        "paralelas": True, "altura_paralelas": 70, "espiga": False, "tornilleria": False}
    assert campos("con espiga de 50") == {"espiga": True, "diametro_espiga": 50}
