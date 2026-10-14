from __future__ import annotations

from datetime import date, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from zoneinfo import ZoneInfo

import pytest

from gastos_bot.bot import ExpenseBot
from gastos_bot.config import Config, FiscalData
from gastos_bot.db import Database
from gastos_bot.extractor import TicketData

TZ = ZoneInfo("America/Mexico_City")
CHAT = -1001234567890
OTHER_CHAT = -1009999999999
NOW = datetime(2026, 10, 14, 12, 0, tzinfo=TZ)
TODAY = NOW.date()


@pytest.fixture
def db():
    database = Database(":memory:")
    yield database
    database.close()


def add_expense(db: Database, chat_id: int = CHAT, **values):
    defaults = dict(
        expense_date=date(2026, 10, 3),
        merchant="OXXO",
        total=245.5,
        category="supermercado",
        user_name="Ana",
    )
    defaults.update(values)
    return db.add(chat_id, created_at=NOW, **defaults)


def make_ticket(**overrides) -> TicketData:
    data = dict(
        is_receipt=True,
        is_cfdi=False,
        merchant="OXXO",
        legal_name="Cadena Comercial OXXO SA de CV",
        rfc="CCO8605231N4",
        purchase_date=date(2026, 10, 3),
        total=245.5,
        subtotal=211.64,
        iva=33.86,
        currency="MXN",
        payment_method="tarjeta de débito",
        folio="A-123",
        category="supermercado",
        description="Bebidas y botanas",
        cfdi_uuid=None,
        invoice_portal="facturacion.oxxo.com",
        invoice_fields=[{"label": "Web ID", "value": "998877"}],
        notes=None,
    )
    data.update(overrides)
    return TicketData.model_validate(data)


class FakeExtractor:
    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.calls = []

    async def extract(self, image, media_type, caption, today):
        self.calls.append(dict(image=image, media_type=media_type, caption=caption, today=today))
        if self.error:
            raise self.error
        return self.result


def make_config(**overrides) -> Config:
    values = dict(
        telegram_token="123456:TEST-TOKEN",
        allowed_chat_ids=frozenset({CHAT}),
        db_path=":memory:",
        timezone=TZ,
        reminder_days=(25,),
        fiscal=FiscalData(rfc="XAXX010101000", nombre="Juan Pérez"),
    )
    values.update(overrides)
    return Config(**values)


def make_bot(db, extractor=None, **config_overrides) -> ExpenseBot:
    bot = ExpenseBot(make_config(**config_overrides), db, extractor or FakeExtractor())
    bot.now = lambda: NOW
    return bot


def make_message(*, photo=None, document=None, caption=None, chat_id=CHAT):
    message = MagicMock()
    message.chat_id = chat_id
    message.photo = photo or []
    message.document = document
    message.caption = caption
    message.reply_text = AsyncMock()
    message.reply_html = AsyncMock()
    message.reply_photo = AsyncMock()
    message.reply_document = AsyncMock()
    return message


def make_update(message=None, chat_id=CHAT, user_id=42, first_name="Ana"):
    message = message or make_message(chat_id=chat_id)
    return SimpleNamespace(
        effective_message=message,
        effective_chat=SimpleNamespace(id=chat_id),
        effective_user=SimpleNamespace(id=user_id, first_name=first_name),
    )


def make_context(args=None, file_bytes=b"fake-image"):
    telegram_file = MagicMock()
    telegram_file.download_as_bytearray = AsyncMock(return_value=bytearray(file_bytes))
    bot = MagicMock()
    bot.get_file = AsyncMock(return_value=telegram_file)
    bot.send_chat_action = AsyncMock()
    bot.send_message = AsyncMock()
    return SimpleNamespace(args=args or [], bot=bot)


def replied_text(message) -> str:
    """Todo el texto que el bot respondió a un mensaje."""
    texts = []
    for mock in (message.reply_text, message.reply_html):
        for call in mock.await_args_list:
            texts.append(call.args[0] if call.args else call.kwargs["text"])
    return "\n".join(texts)
