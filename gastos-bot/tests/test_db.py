from datetime import date

import pytest

from gastos_bot.db import Database
from tests.conftest import CHAT, OTHER_CHAT, add_expense


def test_add_and_get_roundtrip(db):
    e = add_expense(db, invoice_fields=[{"label": "Web ID", "value": "1"}], rfc="CCO8605231N4")
    got = db.get(CHAT, e.id)
    assert got == e
    assert got.expense_date == date(2026, 10, 3)
    assert got.invoice_fields == [{"label": "Web ID", "value": "1"}]
    assert got.invoice_status == "pendiente"
    assert got.currency == "MXN"


def test_chats_are_isolated(db):
    e = add_expense(db, chat_id=OTHER_CHAT)
    assert db.get(CHAT, e.id) is None
    assert db.update(CHAT, e.id, total=1.0) is None
    assert db.delete(CHAT, e.id) is False
    assert db.get(OTHER_CHAT, e.id).total == 245.5
    assert db.recent(CHAT, 10) == []


def test_update_and_delete(db):
    e = add_expense(db)
    updated = db.update(CHAT, e.id, total=300.0, invoice_status="facturado", expense_date=date(2026, 10, 5))
    assert (updated.total, updated.invoice_status, updated.expense_date) == (300.0, "facturado", date(2026, 10, 5))
    assert db.delete(CHAT, e.id) is True
    assert db.get(CHAT, e.id) is None


def test_rejects_unknown_columns_and_statuses(db):
    with pytest.raises(ValueError):
        add_expense(db, chat_id_hack=1)
    e = add_expense(db)
    with pytest.raises(ValueError):
        db.update(CHAT, e.id, invoice_status="quizá")


def test_between_recent_and_pending(db):
    sep = add_expense(db, expense_date=date(2026, 9, 30))
    oct1 = add_expense(db, expense_date=date(2026, 10, 1), invoice_status="facturado")
    oct2 = add_expense(db, expense_date=date(2026, 10, 31))
    assert [e.id for e in db.between(CHAT, date(2026, 10, 1), date(2026, 11, 1))] == [oct1.id, oct2.id]
    assert [e.id for e in db.between(CHAT)] == [sep.id, oct1.id, oct2.id]
    assert [e.id for e in db.recent(CHAT, 2)] == [oct2.id, oct1.id]
    assert [e.id for e in db.pending(CHAT)] == [sep.id, oct2.id]


def test_find_duplicate(db):
    e = add_expense(db, folio="A-1")
    assert db.find_duplicate(CHAT, date(2026, 10, 3), 245.5, "A-1").id == e.id
    assert db.find_duplicate(CHAT, date(2026, 10, 3), 245.5, None).id == e.id
    assert db.find_duplicate(CHAT, date(2026, 10, 3), 245.5, "A-2") is None
    assert db.find_duplicate(CHAT, date(2026, 10, 4), 245.5, "A-1") is None
    assert db.find_duplicate(CHAT, date(2026, 10, 3), 245.6, "A-1") is None
    assert db.find_duplicate(CHAT, date(2026, 10, 3), None, "A-1") is None


def test_find_by_uuid_is_case_insensitive(db):
    e = add_expense(db, cfdi_uuid="ABCDEF00-0000-0000-0000-000000000000")
    assert db.find_by_uuid(CHAT, "abcdef00-0000-0000-0000-000000000000").id == e.id
    assert db.find_by_uuid(OTHER_CHAT, "ABCDEF00-0000-0000-0000-000000000000") is None


def test_find_invoice_match_prefers_same_rfc(db):
    no_rfc = add_expense(db, total=500.0, expense_date=date(2026, 10, 2))
    same_rfc = add_expense(db, total=500.4, expense_date=date(2026, 10, 1), rfc="CCO8605231N4")
    other_rfc = add_expense(db, total=500.0, expense_date=date(2026, 10, 9), rfc="WAL9709244W4")
    # El mismo emisor gana aunque el total difiera unos centavos.
    assert db.find_invoice_match(CHAT, "cco8605231n4", 500.0, date(2026, 10, 10)).id == same_rfc.id
    # Sin RFC (foto de factura ilegible): total más cercano y luego la fecha más cercana.
    assert db.find_invoice_match(CHAT, None, 500.0, date(2026, 10, 10)).id == other_rfc.id
    # Un emisor distinto nunca coincide: solo queda el ticket sin RFC.
    db.update(CHAT, same_rfc.id, invoice_status="facturado")
    assert db.find_invoice_match(CHAT, "CCO8605231N4", 500.0, date(2026, 10, 10)).id == no_rfc.id


def test_find_invoice_match_respects_status_total_and_dates(db):
    add_expense(db, total=100.0, invoice_status="facturado")
    add_expense(db, total=200.0, expense_date=date(2026, 7, 1))  # demasiado antiguo
    add_expense(db, total=300.0, expense_date=date(2026, 10, 20))  # posterior a la factura
    add_expense(db, total=None)
    assert db.find_invoice_match(CHAT, None, 100.0, date(2026, 10, 10)) is None
    assert db.find_invoice_match(CHAT, None, 200.0, date(2026, 10, 10)) is None
    assert db.find_invoice_match(CHAT, None, 300.0, date(2026, 10, 10)) is None
    assert db.find_invoice_match(CHAT, None, 245.5, date(2026, 10, 10)) is None
    assert db.find_invoice_match(CHAT, None, 301.5, date(2026, 10, 25)) is None  # fuera de tolerancia


def test_database_file_is_created(tmp_path):
    path = tmp_path / "sub" / "gastos.db"
    database = Database(path)
    add_expense(database)
    database.close()
    reopened = Database(path)
    assert len(reopened.between(CHAT)) == 1
    reopened.close()
