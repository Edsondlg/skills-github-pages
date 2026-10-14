from datetime import date
from types import SimpleNamespace

from telegram import Update
from telegram.ext import CommandHandler, MessageHandler

from gastos_bot.extractor import ExtractionError
from tests.conftest import (
    CHAT,
    OTHER_CHAT,
    FakeExtractor,
    add_expense,
    make_bot,
    make_context,
    make_message,
    make_ticket,
    make_update,
    replied_text,
)
from tests.test_cfdi import UUID, cfdi_xml


def photo_message(caption=None):
    return make_message(photo=[SimpleNamespace(file_id="small", file_size=1000), SimpleNamespace(file_id="big", file_size=90000)], caption=caption)


async def test_photo_registers_expense(db):
    extractor = FakeExtractor(make_ticket())
    bot = make_bot(db, extractor)
    message = photo_message(caption="despensa")
    context = make_context(file_bytes=b"jpeg-bytes")

    await bot.on_image(make_update(message), context)

    context.bot.get_file.assert_awaited_once_with("big")
    assert extractor.calls == [dict(image=b"jpeg-bytes", media_type="image/jpeg", caption="despensa", today=date(2026, 10, 14))]
    [expense] = db.between(CHAT)
    assert expense.merchant == "OXXO"
    assert expense.total == 245.5
    assert expense.rfc == "CCO8605231N4"
    assert expense.invoice_status == "pendiente"
    assert expense.user_name == "Ana"
    assert expense.file_id == "big"
    assert expense.source == "foto"
    assert expense.invoice_fields == [{"label": "Web ID", "value": "998877"}]
    text = replied_text(message)
    assert f"Gasto #{expense.id} registrado" in text
    assert "⚠️" not in text


async def test_photo_with_no_invoice_caption(db):
    bot = make_bot(db, FakeExtractor(make_ticket()))
    await bot.on_image(make_update(photo_message(caption="Comida familiar SIN FACTURA")), make_context())
    [expense] = db.between(CHAT)
    assert expense.invoice_status == "no_requiere"


async def test_image_document_is_registered_with_its_type(db):
    extractor = FakeExtractor(make_ticket())
    bot = make_bot(db, extractor)
    doc = SimpleNamespace(file_id="doc1", file_size=2_000_000, mime_type="image/png")
    await bot.on_image(make_update(make_message(document=doc)), make_context())
    assert extractor.calls[0]["media_type"] == "image/png"
    assert db.between(CHAT)[0].source == "imagen"


async def test_large_image_document_is_rejected_before_download(db):
    extractor = FakeExtractor(make_ticket())
    bot = make_bot(db, extractor)
    doc = SimpleNamespace(file_id="doc1", file_size=8_000_000, mime_type="image/jpeg")
    message = make_message(document=doc)
    context = make_context()
    await bot.on_image(make_update(message), context)
    context.bot.get_file.assert_not_awaited()
    assert "5 MB" in replied_text(message)
    assert db.between(CHAT) == []


async def test_photo_warnings_for_missing_total_date_and_duplicates(db):
    existing = add_expense(db, expense_date=date(2026, 10, 14), total=None)
    bot = make_bot(db, FakeExtractor(make_ticket(total=None, purchase_date=None, rfc="12")))
    message = photo_message()
    await bot.on_image(make_update(message), make_context())
    text = replied_text(message)
    assert "No pude leer el total" in text
    assert "No pude leer la fecha" in text
    assert "RFC leído no parece válido" in text
    assert db.between(CHAT)[-1].expense_date == date(2026, 10, 14)
    # Sin total no se puede saber si es duplicado.
    assert f"duplicado del gasto #{existing.id}" not in text


async def test_photo_duplicate_warning(db):
    existing = add_expense(db, folio="A-123")
    bot = make_bot(db, FakeExtractor(make_ticket()))
    message = photo_message()
    await bot.on_image(make_update(message), make_context())
    assert f"duplicado del gasto #{existing.id}" in replied_text(message)


async def test_not_a_receipt_is_ignored(db):
    bot = make_bot(db, FakeExtractor(make_ticket(is_receipt=False)))
    message = photo_message()
    await bot.on_image(make_update(message), make_context())
    assert db.between(CHAT) == []
    assert "no parece un ticket" in replied_text(message)


async def test_extraction_error_is_reported(db):
    bot = make_bot(db, FakeExtractor(error=ExtractionError("Intenta más tarde.")))
    message = photo_message()
    await bot.on_image(make_update(message), make_context())
    assert db.between(CHAT) == []
    assert "Intenta más tarde." in replied_text(message)


async def test_photo_of_cfdi_links_pending_ticket(db):
    ticket_expense = add_expense(db, rfc="CCO8605231N4", total=245.5)
    bot = make_bot(db, FakeExtractor(make_ticket(is_cfdi=True, cfdi_uuid=UUID, purchase_date=date(2026, 10, 5))))
    message = photo_message()
    await bot.on_image(make_update(message), make_context())
    [expense] = db.between(CHAT)
    assert expense.id == ticket_expense.id
    assert expense.invoice_status == "facturado"
    assert expense.cfdi_uuid == UUID.upper()
    assert f"Factura vinculada al gasto #{expense.id}" in replied_text(message)


async def test_photo_of_unmatched_cfdi_is_registered_as_invoiced(db):
    bot = make_bot(db, FakeExtractor(make_ticket(is_cfdi=True, cfdi_uuid=UUID)))
    await bot.on_image(make_update(photo_message()), make_context())
    [expense] = db.between(CHAT)
    assert (expense.invoice_status, expense.cfdi_uuid) == ("facturado", UUID.upper())

    # La misma factura enviada otra vez no se duplica.
    again = photo_message()
    await bot.on_image(make_update(again), make_context())
    assert len(db.between(CHAT)) == 1
    assert f"ya estaba registrada en el gasto #{expense.id}" in replied_text(again)


def xml_message():
    return make_message(document=SimpleNamespace(file_id="xml1", file_size=4000, mime_type="text/xml"))


async def test_xml_links_pending_ticket(db):
    ticket_expense = add_expense(db, rfc=None, total=245.0, legal_name=None)
    bot = make_bot(db)
    message = xml_message()
    await bot.on_xml(make_update(message), make_context(file_bytes=cfdi_xml()))
    [expense] = db.between(CHAT)
    assert expense.id == ticket_expense.id
    assert expense.invoice_status == "facturado"
    assert expense.cfdi_uuid == UUID.upper()
    assert expense.rfc == "CCO8605231N4"
    assert expense.legal_name == "CADENA COMERCIAL OXXO"
    assert f"Factura vinculada al gasto #{expense.id}" in replied_text(message)


async def test_xml_without_ticket_becomes_new_expense(db):
    bot = make_bot(db)
    message = xml_message()
    await bot.on_xml(make_update(message), make_context(file_bytes=cfdi_xml()))
    [expense] = db.between(CHAT)
    assert expense.source == "xml"
    assert expense.invoice_status == "facturado"
    assert expense.total == 245.5
    assert expense.expense_date == date(2026, 10, 5)
    assert expense.description == "Refresco 600 ml; Papas"
    assert "gasto nuevo" in replied_text(message)

    # La misma factura no se registra dos veces.
    again = xml_message()
    await bot.on_xml(make_update(again), make_context(file_bytes=cfdi_xml()))
    assert len(db.between(CHAT)) == 1
    assert f"ya estaba registrada en el gasto #{expense.id}" in replied_text(again)


async def test_xml_warns_when_issued_to_other_rfc(db):
    bot = make_bot(db)
    message = xml_message()
    await bot.on_xml(make_update(message), make_context(file_bytes=cfdi_xml(receptor_rfc="PEPJ800101AB1")))
    assert "PEPJ800101AB1, no de XAXX010101000" in replied_text(message)


async def test_xml_payment_complement_is_not_registered(db):
    bot = make_bot(db)
    message = xml_message()
    await bot.on_xml(make_update(message), make_context(file_bytes=cfdi_xml(tipo="P", total="0")))
    assert db.between(CHAT) == []
    assert "tipo pago" in replied_text(message)


async def test_invalid_xml_is_reported(db):
    bot = make_bot(db)
    message = xml_message()
    await bot.on_xml(make_update(message), make_context(file_bytes=b"<html></html>"))
    assert "no es una factura" in replied_text(message)


async def test_mark_invoiced_and_no_invoice(db):
    a, b = add_expense(db), add_expense(db)
    other = add_expense(db, chat_id=OTHER_CHAT)
    bot = make_bot(db)

    message = make_message()
    await bot.mark_invoiced(make_update(message), make_context(args=[str(a.id), f"#{other.id}"]))
    assert db.get(CHAT, a.id).invoice_status == "facturado"
    assert db.get(OTHER_CHAT, other.id).invoice_status == "pendiente"
    text = replied_text(message)
    assert f"facturado: #{a.id}" in text
    assert f"No encontré: #{other.id}" in text

    await bot.mark_invoiced(make_update(make_message()), make_context(args=[str(b.id), UUID]))
    assert db.get(CHAT, b.id).cfdi_uuid == UUID.upper()

    await bot.mark_no_invoice(make_update(make_message()), make_context(args=[str(a.id)]))
    assert db.get(CHAT, a.id).invoice_status == "no_requiere"


async def test_edit_and_parse_errors(db):
    e = add_expense(db)
    bot = make_bot(db)

    message = make_message()
    await bot.edit(make_update(message), make_context(args=[str(e.id), "total", "1,000.50"]))
    assert db.get(CHAT, e.id).total == 1000.5
    assert "actualizado" in replied_text(message)

    message = make_message()
    await bot.edit(make_update(message), make_context(args=[str(e.id), "categoria", "viajes"]))
    assert "Categoría inválida" in replied_text(message)

    message = make_message()
    await bot.edit(make_update(message), make_context(args=[str(e.id)]))
    assert "Uso: /editar" in replied_text(message)

    message = make_message()
    await bot.edit(make_update(message), make_context(args=["999", "total", "5"]))
    assert "No encontré el gasto #999" in replied_text(message)


async def test_delete(db):
    e = add_expense(db)
    bot = make_bot(db)
    message = make_message()
    await bot.delete(make_update(message), make_context(args=[str(e.id)]))
    assert db.get(CHAT, e.id) is None
    assert "Borré el gasto" in replied_text(message)

    message = make_message()
    await bot.delete(make_update(message), make_context(args=[str(e.id)]))
    assert "No encontré" in replied_text(message)


async def test_summary_recent_and_pending(db):
    add_expense(db, total=100.0, expense_date=date(2026, 9, 2))
    add_expense(db, total=200.0)
    bot = make_bot(db)

    message = make_message()
    await bot.summary(make_update(message), make_context())
    assert "Resumen de octubre 2026" in replied_text(message)
    assert "$200.00" in replied_text(message)

    message = make_message()
    await bot.summary(make_update(message), make_context(args=["septiembre"]))
    assert "Resumen de septiembre 2026" in replied_text(message)

    message = make_message()
    await bot.summary(make_update(message), make_context(args=["brumario"]))
    assert "No reconozco el mes" in replied_text(message)

    message = make_message()
    await bot.recent(make_update(message), make_context(args=["1"]))
    assert "$200.00" in replied_text(message)
    assert "$100.00" not in replied_text(message)

    message = make_message()
    await bot.pending(make_update(message), make_context())
    assert "2 tickets por facturar" in replied_text(message)


async def test_export(db):
    add_expense(db)
    bot = make_bot(db)
    message = make_message()
    await bot.export(make_update(message), make_context())
    call = message.reply_document.await_args
    assert call.kwargs["filename"] == "gastos-2026-10.xlsx"
    assert call.args[0][:2] == b"PK"  # un .xlsx es un zip

    message = make_message()
    await bot.export(make_update(message), make_context(args=["todo"]))
    assert message.reply_document.await_args.kwargs["filename"] == "gastos-todos.xlsx"

    message = make_message()
    await bot.export(make_update(message), make_context(args=["2025-01"]))
    message.reply_document.assert_not_awaited()
    assert "No hay gastos" in replied_text(message)


async def test_show_sends_photo_or_document(db):
    photo = add_expense(db, file_id="photo-id", source="foto")
    image = add_expense(db, file_id="doc-id", source="imagen")
    bot = make_bot(db)

    message = make_message()
    await bot.show(make_update(message), make_context(args=[str(photo.id)]))
    assert message.reply_photo.await_args.args[0] == "photo-id"
    assert f"Gasto #{photo.id}" in message.reply_photo.await_args.kwargs["caption"]

    message = make_message()
    await bot.show(make_update(message), make_context(args=[str(image.id)]))
    assert message.reply_document.await_args.args[0] == "doc-id"


async def test_reminders_only_on_configured_days(db):
    add_expense(db, expense_date=date(2026, 10, 3))
    add_expense(db, expense_date=date(2026, 9, 3))  # mes anterior: no entra en el recordatorio
    add_expense(db, chat_id=OTHER_CHAT)  # chat no autorizado
    bot = make_bot(db, reminder_days=(14,))

    context = make_context()
    await bot.send_reminders(context)
    context.bot.send_message.assert_awaited_once()
    chat_id, text = context.bot.send_message.await_args.args
    assert chat_id == CHAT
    assert "1 ticket de octubre 2026" in text

    bot = make_bot(db, reminder_days=(25,))
    context = make_context()
    await bot.send_reminders(context)
    context.bot.send_message.assert_not_awaited()


async def test_start_and_chatid(db):
    bot = make_bot(db)
    message = make_message(chat_id=OTHER_CHAT)
    await bot.start(make_update(message, chat_id=OTHER_CHAT), make_context())
    assert str(OTHER_CHAT) in replied_text(message)
    assert "no está autorizado" in replied_text(message)

    message = make_message()
    await bot.start(make_update(message), make_context())
    assert "/pendientes" in replied_text(message)


def _update(chat_id: int, bot, **message_fields) -> Update:
    return Update.de_json(
        {
            "update_id": 1,
            "message": {
                "message_id": 10,
                "date": 1760000000,
                "chat": {"id": chat_id, "type": "supergroup", "title": "Gastos"},
                "from": {"id": 42, "is_bot": False, "first_name": "Ana"},
                **message_fields,
            },
        },
        bot,
    )


def test_application_only_handles_allowed_chats(db):
    app = make_bot(db).build_application()
    bot = SimpleNamespace(username="GastosBot")  # sin red: solo lo que piden los filtros
    handlers = app.handlers[0]
    photo = {"photo": [{"file_id": "f", "file_unique_id": "u", "width": 10, "height": 10}]}
    command = {"text": "/resumen", "entities": [{"type": "bot_command", "offset": 0, "length": 8}]}
    chatid = {"text": "/chatid", "entities": [{"type": "bot_command", "offset": 0, "length": 7}]}

    def matching(update):
        return [h for h in handlers if h.check_update(update)]

    [photo_handler] = matching(_update(CHAT, bot, **photo))
    assert isinstance(photo_handler, MessageHandler)
    assert matching(_update(OTHER_CHAT, bot, **photo)) == []
    [summary_handler] = matching(_update(CHAT, bot, **command))
    assert isinstance(summary_handler, CommandHandler) and "resumen" in summary_handler.commands
    assert matching(_update(OTHER_CHAT, bot, **command)) == []
    # /chatid funciona en cualquier chat para poder configurar el bot.
    assert len(matching(_update(OTHER_CHAT, bot, **chatid))) == 1
    assert [job.name for job in app.job_queue.jobs()] == ["recordatorio-facturas"]


def test_reminders_can_be_disabled(db):
    app = make_bot(db, reminder_days=()).build_application()
    assert app.job_queue.jobs() == ()
