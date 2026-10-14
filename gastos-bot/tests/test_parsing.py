from datetime import date

import pytest

from gastos_bot.parsing import (
    ParseError,
    month_bounds,
    parse_amount,
    parse_date,
    parse_edit,
    parse_ids_and_uuid,
    parse_month,
)

TODAY = date(2026, 10, 14)
UUID = "5F3A2B1C-1234-4ABC-9DEF-0123456789AB"


@pytest.mark.parametrize("raw,expected", [("245.50", 245.5), ("$1,234.5", 1234.5), ("99", 99.0)])
def test_parse_amount(raw, expected):
    assert parse_amount(raw) == expected


@pytest.mark.parametrize("raw", ["abc", "-5"])
def test_parse_amount_invalid(raw):
    with pytest.raises(ParseError):
        parse_amount(raw)


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("03/10/2026", date(2026, 10, 3)),
        ("3-10-26", date(2026, 10, 3)),
        ("2026-10-03", date(2026, 10, 3)),
        ("hoy", TODAY),
        ("Ayer", date(2026, 10, 13)),
    ],
)
def test_parse_date(raw, expected):
    assert parse_date(raw, TODAY) == expected


@pytest.mark.parametrize("raw", ["31/02/2026", "10/2026", "mañana"])
def test_parse_date_invalid(raw):
    with pytest.raises(ParseError):
        parse_date(raw, TODAY)


@pytest.mark.parametrize(
    "args,expected",
    [
        ([], (2026, 10)),
        (["2026-09"], (2026, 9)),
        (["09/2025"], (2025, 9)),
        (["septiembre"], (2026, 9)),
        (["Diciembre"], (2025, 12)),  # sin año: el diciembre más reciente
        (["ene", "2026"], (2026, 1)),
        (["enero", "de", "2026"], (2026, 1)),
    ],
)
def test_parse_month(args, expected):
    assert parse_month(args, TODAY) == expected


@pytest.mark.parametrize("args", [["brumario"], ["2026-13"], ["ayer"]])
def test_parse_month_invalid(args):
    with pytest.raises(ParseError):
        parse_month(args, TODAY)


def test_month_bounds_december():
    assert month_bounds(2026, 12) == (date(2026, 12, 1), date(2027, 1, 1))


def test_parse_ids_and_uuid():
    assert parse_ids_and_uuid(["12", "#13"]) == ([12, 13], None)
    assert parse_ids_and_uuid(["12", UUID.lower()]) == ([12], UUID)
    with pytest.raises(ParseError):
        parse_ids_and_uuid([])
    with pytest.raises(ParseError):
        parse_ids_and_uuid(["12", "13", UUID])
    with pytest.raises(ParseError):
        parse_ids_and_uuid(["doce"])


@pytest.mark.parametrize(
    "field,value,expected",
    [
        ("total", "$1,250.50", ("total", 1250.5)),
        ("fecha", "03/10/2026", ("expense_date", date(2026, 10, 3))),
        ("Categoría", "Tecnología", ("category", "tecnologia")),
        ("estado", "no requiere", ("invoice_status", "no_requiere")),
        ("estado", "Facturado", ("invoice_status", "facturado")),
        ("rfc", "cco-860523-1n4", ("rfc", "CCO8605231N4")),
        ("uuid", UUID.lower(), ("cfdi_uuid", UUID)),
        ("moneda", "usd", ("currency", "USD")),
        ("descripción", "Comida con cliente", ("description", "Comida con cliente")),
        ("razon", "Cadena Comercial OXXO", ("legal_name", "Cadena Comercial OXXO")),
    ],
)
def test_parse_edit(field, value, expected):
    assert parse_edit(field, value, TODAY) == expected


@pytest.mark.parametrize(
    "field,value",
    [
        ("color", "rojo"),
        ("categoria", "viajes"),
        ("estado", "quizá"),
        ("rfc", "123"),
        ("uuid", "no-es-uuid"),
        ("moneda", "pesos"),
        ("total", " "),
    ],
)
def test_parse_edit_invalid(field, value):
    with pytest.raises(ParseError):
        parse_edit(field, value, TODAY)
