"""Intérprete de descripciones en texto libre (español, con algo de inglés).

Convierte frases como::

    "Troquel progresivo de 300x200 para lámina de acero calibre 14, 4 postes de 32
     con bujes de bolas, altura cerrada 260, carrera 50, con espiga"

en los campos de DieSpec. Sólo devuelve lo que encontró explícitamente; los
demás valores quedan en su valor por omisión. Unidades: milímetros.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any

from .catalog import CALIBRES_MM

NUM = r"(\d+(?:\.\d+)?)"
NO_DIM = r"(?![\d.])(?!\s*(?:mm\s*)?[x×*]\s*\d)"  # número completo y que no sea parte de "300x200"


@dataclass
class Interpretacion:
    campos: dict[str, Any] = field(default_factory=dict)
    notas: list[str] = field(default_factory=list)

    def poner(self, campo: str, valor: Any, nota: str | None = None) -> None:
        if campo not in self.campos:
            self.campos[campo] = valor
            if nota:
                self.notas.append(nota)


def normalizar(texto: str) -> str:
    sin_acentos = "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")
    s = sin_acentos.lower().replace("Ø", "ø").replace("⌀", "ø")
    s = re.sub(r"(\d),(\d)", r"\1.\2", s)  # coma decimal
    return re.sub(r"\s+", " ", s)


def interpretar(texto: str) -> Interpretacion:
    s = normalizar(texto)
    r = Interpretacion()

    _dimensiones(s, r)
    _espesor(s, r)
    _material(s, r)
    _postes(s, r)
    _guia(s, r)
    _numero(s, r, "altura_cerrada",
            r"(?:altura\s+(?:cerrada|de\s+cierre|de(?:l)?\s+troquel(?:\s+cerrado)?)|shut\s*height)\D{0,12}?" + NUM,
            "Altura cerrada {} mm", 50, 3000)
    _numero(s, r, "carrera", r"(?:carrera|stroke)\D{0,15}?" + NUM, "Carrera de prensa {} mm", 5, 1000)
    _numero(s, r, "ancho_tira", r"(?:ancho\s+de\s+(?:la\s+)?(?:tira|cinta|fleje)|tira|cinta|fleje|strip)\D{0,12}?" + NUM + NO_DIM,
            "Ancho de tira {} mm", 5, 2000)
    _numero(s, r, "perimetro_corte", r"perimetro(?:\s+(?:de|del)\s+corte)?\D{0,12}?" + NUM,
            "Perímetro de corte {} mm", 1, 100000)
    _tonelaje(s, r)
    _espesores_placas(s, r)
    _opciones(s, r)
    _nombre(texto, r)
    return r


# ----------------------------------------------------------------------
def _dimensiones(s: str, r: Interpretacion) -> None:
    m = re.search(NUM + r"\s*(?:mm)?\s*[x×*]\s*" + NUM, s)
    if m:
        largo, ancho = float(m.group(1)), float(m.group(2))
        r.poner("largo", largo, "Placa matriz {} x {} mm (largo en X = avance x ancho en Y)".format(_f(largo), _f(ancho)))
        r.poner("ancho", ancho)
        return
    for campo, patron in (("largo", r"(?:largo|longitud|length)\D{0,12}?" + NUM),
                          ("ancho", r"(?:ancho(?!\s+de\s+(?:la\s+)?(?:tira|cinta|fleje|ranura|paralela))|width)\D{0,12}?" + NUM)):
        m = re.search(patron, s)
        if m:
            r.poner(campo, float(m.group(1)), "{} de placa matriz {} mm".format(campo.capitalize(), m.group(1)))


def _espesor(s: str, r: Interpretacion) -> None:
    m = re.search(r"calibre\s*(?:no\.?\s*|#\s*)?(\d+)(?!\s*(?:\.\d|mm))", s)
    if m and int(m.group(1)) in CALIBRES_MM:
        mm = CALIBRES_MM[int(m.group(1))]
        r.poner("espesor_lamina", mm, "Lámina calibre {} = {} mm".format(m.group(1), _f(mm)))
        return
    patrones = [
        NUM + r"\s*mm\s+de\s+(?:espesor|grosor|lamina|chapa)",
        r"(?:lamina|espesor|chapa|grosor|sheet|thickness|calibre)[^\d]{0,30}?" + NUM + NO_DIM,
        r"\bt\s*=\s*" + NUM,
    ]
    for patron in patrones:
        for m in re.finditer(patron, s):
            valor = float(m.group(1))
            if 0.1 <= valor <= 12:
                r.poner("espesor_lamina", valor, "Espesor de lámina {} mm".format(_f(valor)))
                return


def _material(s: str, r: Interpretacion) -> None:
    for patron, material in ((r"inoxidable|\binox\b|stainless", "inoxidable"),
                             (r"alta resistencia|\bhsla\b|\bdp ?\d{3}\b", "acero_alta_resistencia"),
                             (r"aluminio|aluminum", "aluminio"),
                             (r"\bcobre\b|copper", "cobre"),
                             (r"\blaton\b|brass", "laton"),
                             (r"\bacero\b|steel", "acero")):
        if re.search(patron, s):
            r.poner("material", material, "Material de lámina: {}".format(material.replace("_", " ")))
            return


_PALABRA_POSTE = r"(?:postes?|columnas?|pilares?|posts?)"


def _postes(s: str, r: Interpretacion) -> None:
    cantidad = None
    m = re.search(r"\b(\d|dos|cuatro|two|four)\s+" + _PALABRA_POSTE, s)
    if m:
        cantidad = {"dos": 2, "two": 2, "cuatro": 4, "four": 4}.get(m.group(1)) or int(m.group(1))

    arreglo = None
    if re.search(r"\bdiagonal", s):
        arreglo = "diagonal"
    elif re.search(r"\b(?:traseros?|atras|posteriores?|rear|back[- ]?post)", s):
        arreglo = "trasero"
    elif re.search(_PALABRA_POSTE + r"\s+(?:\w+\s+){0,2}?(?:centrales|al centro|en el centro)|center[- ]?post", s):
        arreglo = "centro"
    elif cantidad == 4 or re.search(r"\b(?:4|cuatro)\s+esquinas|en las esquinas", s):
        arreglo = "cuatro"
    elif cantidad == 2:
        arreglo = "diagonal"
        r.notas.append("2 postes sin indicar posición: se usa arreglo diagonal")
    if arreglo:
        r.poner("arreglo_postes", arreglo, "Arreglo de postes: {}".format(arreglo))
    if cantidad and cantidad not in (2, 4):
        r.notas.append("Se pidieron {} postes; sólo se admiten 2 o 4".format(cantidad))

    patrones = [
        _PALABRA_POSTE + r"\s+(?:[a-z]+\s+){0,2}?(?:de\s+|a\s+|con\s+|ø\s*|diametro\s+(?:de\s+)?|d\s*=?\s*)ø?\s*" + NUM + NO_DIM,
        r"diametro\s+(?:de\s+)?(?:los\s+|del\s+)?" + _PALABRA_POSTE + r"\s+(?:de\s+|a\s+|=\s*)?" + NUM,
    ]
    for patron in patrones:
        for m in re.finditer(patron, s):
            valor = float(m.group(1))
            if 12 <= valor <= 100:
                r.poner("diametro_poste", valor, "Postes de Ø{} mm".format(_f(valor)))
                return


def _guia(s: str, r: Interpretacion) -> None:
    if re.search(r"\bbolas\b|baleros?|rodamientos?|\bball\b|balines|\brodillos\b", s):
        r.poner("tipo_guia", "bolas", "Bujes de bolas (rodamiento lineal)")
    elif re.search(r"friccion|bronce|deslizamiento|friction|\bplain\b", s):
        r.poner("tipo_guia", "friccion", "Bujes de fricción (bronce)")


def _numero(s: str, r: Interpretacion, campo: str, patron: str, nota: str, minimo: float, maximo: float) -> None:
    for m in re.finditer(patron, s):
        valor = float(m.group(1))
        if minimo <= valor <= maximo:
            r.poner(campo, valor, nota.format(_f(valor)))
            return


def _tonelaje(s: str, r: Interpretacion) -> None:
    m = re.search(r"prensa\s+(?:de\s+)?" + NUM + r"\s*(?:t|ton|tons|toneladas)\b", s) or \
        re.search(NUM + r"\s*(?:ton|tons|toneladas)\b", s)
    if m:
        r.poner("tonelaje_prensa", float(m.group(1)), "Prensa de {} t".format(m.group(1)))


_PLACAS = (
    ("espesor_respaldo_matriz", r"respaldo\s+(?:de\s+)?(?:la\s+)?matriz"),
    ("espesor_respaldo_punzones", r"sufridera|respaldo\s+(?:de\s+)?(?:los\s+)?punzones"),
    ("espesor_porta_punzones", r"porta\s*-?\s*punzones|placa\s+porta"),
    ("espesor_pisador", r"pisador|placa\s+(?:expulsora|separadora|extractora)|stripper"),
    ("espesor_zapata_inferior", r"zapata\s+inferior|base\s+inferior|zapata\s+de\s+abajo"),
    ("espesor_zapata_superior", r"zapata\s+superior|base\s+superior|zapata\s+de\s+arriba"),
    ("espesor_placa_matriz", r"placa\s+matriz|bloque\s+matriz|(?<!respaldo de la )(?<!respaldo de )(?<!respaldo )\bmatriz\b"),
)


def _espesores_placas(s: str, r: Interpretacion) -> None:
    for campo, clave in _PLACAS:
        for m in re.finditer("(?:" + clave + r")[^\d]{0,25}?" + NUM + NO_DIM, s):
            valor = float(m.group(1))
            if 5 <= valor <= 300:
                r.poner(campo, valor, "{} = {} mm".format(campo.replace("_", " ").capitalize(), _f(valor)))
                break


def _opciones(s: str, r: Interpretacion) -> None:
    quitar = r"(?:sin|quita(?:r|le)?|elimina(?:r)?|no\s+(?:lleva|quiero|usar))\s+(?:las\s+|los\s+|la\s+|el\s+)?"
    agregar = r"(?:con|agrega(?:r|le)?|pon(?:er|le)?|añade|anade|lleva|incluye)\s+(?:las\s+|los\s+|la\s+|el\s+|una\s+|un\s+)?"
    if re.search(quitar + r"paralelas", s):
        r.poner("paralelas", False, "Sin paralelas")
    else:
        m = re.search(r"paralelas\s+(?:de\s+)?" + NUM + NO_DIM, s)
        if m:
            r.poner("paralelas", True, "Con paralelas")
            r.poner("altura_paralelas", float(m.group(1)), "Paralelas de {} mm de alto".format(m.group(1)))
        elif re.search(agregar + r"paralelas", s):
            r.poner("paralelas", True, "Con paralelas")
    if re.search(quitar + r"(?:espiga|zanco|shank)", s):
        r.poner("espiga", False, "Sin espiga")
    elif re.search(agregar + r"(?:espiga|zanco)|\bshank\b|espiga\s+(?:de\s+)?ø?\s*\d", s):
        r.poner("espiga", True, "Con espiga (zanco)")
        m = re.search(r"(?:espiga|zanco|shank)\s+(?:de\s+)?ø?\s*" + NUM, s)
        if m:
            r.poner("diametro_espiga", float(m.group(1)), "Espiga de Ø{} mm".format(m.group(1)))
    if re.search(quitar + r"(?:tornilleria|tornillos)", s):
        r.poner("tornilleria", False, "Sin barrenos de tornillería ni pasadores")
    if re.search(quitar + r"ranuras", s):
        r.poner("ranuras_sujecion", False, "Sin ranuras de sujeción")
    if re.search(quitar + r"poka[- ]?yoke|simetric", s):
        r.poner("poka_yoke", False, "Postes simétricos (sin poka-yoke)")


def _nombre(texto: str, r: Interpretacion) -> None:
    m = re.search(r"(?:nombre|llamado|ll[aá]malo|c[oó]digo|n[uú]mero de parte|name)\s*[:=]?\s*[\"']?([A-Za-z0-9][A-Za-z0-9_\-]*)",
                  texto, re.IGNORECASE)
    if m and m.group(1).lower() not in ("del", "de", "la", "el", "es", "que", "para"):
        r.poner("nombre", m.group(1).upper(), "Nombre: {}".format(m.group(1).upper()))


def _f(v: float) -> str:
    return ("%.2f" % float(v)).rstrip("0").rstrip(".")
