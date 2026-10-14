"""Interpretación de los argumentos que escriben los usuarios en los comandos."""

from __future__ import annotations

import re
import unicodedata
from datetime import date, timedelta

from .extractor import CATEGORIES

MONTHS = {
    "enero": 1, "ene": 1,
    "febrero": 2, "feb": 2,
    "marzo": 3, "mar": 3,
    "abril": 4, "abr": 4,
    "mayo": 5, "may": 5,
    "junio": 6, "jun": 6,
    "julio": 7, "jul": 7,
    "agosto": 8, "ago": 8,
    "septiembre": 9, "setiembre": 9, "sep": 9, "sept": 9,
    "octubre": 10, "oct": 10,
    "noviembre": 11, "nov": 11,
    "diciembre": 12, "dic": 12,
}  # fmt: skip

UUID_RE = re.compile(r"^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$", re.I)
RFC_RE = re.compile(r"^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$")

STATUS_ALIASES = {
    "pendiente": "pendiente",
    "facturado": "facturado",
    "facturada": "facturado",
    "no": "no_requiere",
    "norequiere": "no_requiere",
    "no_requiere": "no_requiere",
    "sinfactura": "no_requiere",
}

# Nombre que escribe el usuario en /editar -> columna de la base de datos.
EDIT_FIELDS = {
    "total": "total",
    "subtotal": "subtotal",
    "iva": "iva",
    "fecha": "expense_date",
    "comercio": "merchant",
    "razonsocial": "legal_name",
    "razon": "legal_name",
    "rfc": "rfc",
    "folio": "folio",
    "categoria": "category",
    "descripcion": "description",
    "pago": "payment_method",
    "moneda": "currency",
    "estado": "invoice_status",
    "uuid": "cfdi_uuid",
    "portal": "invoice_portal",
    "notas": "notes",
}


class ParseError(Exception):
    """Argumento inválido; el mensaje se le muestra al usuario."""


def normalize(text: str) -> str:
    """Minúsculas y sin acentos, para comparar lo que escribe el usuario."""
    decomposed = unicodedata.normalize("NFD", text.strip().lower())
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn")


def parse_amount(raw: str) -> float:
    cleaned = raw.replace("$", "").replace(",", "").replace("MXN", "").replace("mxn", "").strip()
    try:
        value = float(cleaned)
    except ValueError:
        raise ParseError(f"'{raw}' no es un importe válido. Ejemplo: 1250.50") from None
    if value < 0:
        raise ParseError("El importe no puede ser negativo.")
    return round(value, 2)


def parse_date(raw: str, today: date) -> date:
    text = normalize(raw)
    if text == "hoy":
        return today
    if text == "ayer":
        return today - timedelta(days=1)
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", text)
    if m:
        year, month, day = (int(g) for g in m.groups())
    else:
        m = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})", text)
        if not m:
            raise ParseError(f"'{raw}' no es una fecha válida. Usa DD/MM/AAAA, p. ej. 03/10/2026.")
        day, month, year = (int(g) for g in m.groups())
        if year < 100:
            year += 2000
    try:
        return date(year, month, day)
    except ValueError:
        raise ParseError(f"'{raw}' no es una fecha válida.") from None


def parse_month(args: list[str], today: date) -> tuple[int, int]:
    """Mes pedido en un comando: vacío = mes actual; '2026-09', '09/2026', 'septiembre [2026]'."""
    if not args:
        return today.year, today.month
    text = normalize(" ".join(args))
    if m := re.fullmatch(r"(\d{4})[-/](\d{1,2})", text):
        year, month = int(m.group(1)), int(m.group(2))
    elif m := re.fullmatch(r"(\d{1,2})[-/](\d{4})", text):
        month, year = int(m.group(1)), int(m.group(2))
    elif m := re.fullmatch(r"([a-z]+)(?:\s+(?:de(?:l)?\s+)?(\d{4}))?", text):
        if m.group(1) not in MONTHS:
            raise ParseError(f"No reconozco el mes '{' '.join(args)}'. Ejemplo: septiembre o 2026-09.")
        month = MONTHS[m.group(1)]
        if m.group(2):
            year = int(m.group(2))
        else:
            # Sin año: el más reciente que no esté en el futuro.
            year = today.year if month <= today.month else today.year - 1
    else:
        raise ParseError(f"No reconozco el mes '{' '.join(args)}'. Ejemplo: septiembre o 2026-09.")
    if not 1 <= month <= 12:
        raise ParseError("El mes debe estar entre 1 y 12.")
    return year, month


def month_bounds(year: int, month: int) -> tuple[date, date]:
    """Primer día del mes y primer día del mes siguiente."""
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def parse_id(raw: str) -> int:
    text = raw.strip().lstrip("#")
    if not text.isdigit():
        raise ParseError(f"'{raw}' no es un número de gasto. Ejemplo: 12")
    return int(text)


def parse_ids_and_uuid(args: list[str]) -> tuple[list[int], str | None]:
    """Argumentos de /facturado: uno o más números de gasto y, opcionalmente, el UUID."""
    ids, uuid = [], None
    for arg in args:
        if UUID_RE.match(arg.strip()):
            uuid = arg.strip().upper()
        else:
            ids.append(parse_id(arg))
    if not ids:
        raise ParseError("Indica el número del gasto. Ejemplo: /facturado 12")
    if uuid and len(ids) > 1:
        raise ParseError("El UUID solo se puede indicar para un gasto a la vez.")
    return ids, uuid


def parse_edit(field_name: str, raw_value: str, today: date) -> tuple[str, object]:
    """Convierte un '/editar <id> <campo> <valor>' en (columna, valor)."""
    key = normalize(field_name).replace(" ", "").replace("_", "")
    column = EDIT_FIELDS.get(key)
    if column is None:
        fields = ", ".join(name for name in EDIT_FIELDS if name != "razonsocial")
        raise ParseError(f"Campo desconocido. Puedes editar: {fields}")
    value = raw_value.strip()
    if not value:
        raise ParseError("Falta el nuevo valor.")

    if column in ("total", "subtotal", "iva"):
        return column, parse_amount(value)
    if column == "expense_date":
        return column, parse_date(value, today)
    if column == "category":
        category = normalize(value)
        if category not in CATEGORIES:
            raise ParseError("Categoría inválida. Usa una de: " + ", ".join(CATEGORIES))
        return column, category
    if column == "invoice_status":
        status = STATUS_ALIASES.get(normalize(value).replace(" ", ""))
        if status is None:
            raise ParseError("Estado inválido. Usa: pendiente, facturado o no")
        return column, status
    if column == "rfc":
        rfc = value.upper().replace(" ", "").replace("-", "")
        if not RFC_RE.match(rfc):
            raise ParseError(f"'{value}' no parece un RFC válido (12 o 13 caracteres).")
        return column, rfc
    if column == "cfdi_uuid":
        if not UUID_RE.match(value):
            raise ParseError("El UUID debe tener el formato XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX.")
        return column, value.upper()
    if column == "currency":
        if not re.fullmatch(r"[A-Za-z]{3}", value):
            raise ParseError("La moneda debe ser un código de 3 letras, p. ej. MXN o USD.")
        return column, value.upper()
    return column, value
