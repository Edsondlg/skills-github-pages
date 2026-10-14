"""Bot de Telegram: registra los tickets que se envían al grupo y lleva el control de facturas."""

from __future__ import annotations

import functools
import logging
from datetime import date, datetime
from datetime import time as dt_time

from telegram import BotCommand, Message, Update
from telegram.constants import ChatAction, ParseMode
from telegram.error import TelegramError
from telegram.ext import Application, ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters

from .cfdi import MAX_XML_BYTES, TIPOS, Cfdi, CfdiError, parse_cfdi
from .config import Config
from .db import Database
from .extractor import CATEGORIES, MAX_IMAGE_BYTES, ExtractionError, TicketData, TicketExtractor
from .parsing import (
    RFC_RE,
    ParseError,
    month_bounds,
    normalize,
    parse_edit,
    parse_id,
    parse_ids_and_uuid,
    parse_month,
)
from .reports import (
    build_xlsx,
    esc,
    expense_detail,
    fiscal_text,
    money,
    month_label,
    pending_text,
    recent_text,
    reminder_text,
    split_message,
    summary_text,
)

logger = logging.getLogger(__name__)

# Si el comentario de la foto incluye alguna de estas frases, el gasto no queda pendiente de facturar.
NO_INVOICE_PHRASES = ("sin factura", "no facturar", "nofacturar", "no factura")

COMMANDS = [
    BotCommand("resumen", "Resumen del mes (o /resumen septiembre)"),
    BotCommand("gastos", "Últimos gastos registrados"),
    BotCommand("pendientes", "Tickets por facturar"),
    BotCommand("facturado", "Marcar gastos como facturados"),
    BotCommand("nofacturar", "Marcar gastos que no se van a facturar"),
    BotCommand("editar", "Corregir un dato: /editar 12 total 245.50"),
    BotCommand("borrar", "Borrar un gasto"),
    BotCommand("ver", "Ver un gasto con su foto"),
    BotCommand("exportar", "Excel del mes (o /exportar todo)"),
    BotCommand("datosfiscales", "Tus datos para los portales de facturación"),
    BotCommand("ayuda", "Cómo usar el bot"),
]

HELP_TEXT = f"""\
🤖 <b>Bot de gastos</b>

📸 Envía la foto de un ticket o factura y la registro sola.
     Si en el comentario de la foto escribes «sin factura», no la dejo pendiente de facturar.
📄 Envía el XML de una factura (CFDI) y la vinculo con su ticket.

<b>Consultas</b>
/resumen — gastos del mes por categoría y persona (/resumen septiembre)
/gastos — últimos gastos registrados
/pendientes — tickets por facturar con los datos que piden los portales
/ver 12 — detalle y foto de un gasto
/exportar — Excel del mes (/exportar todo)
/datosfiscales — tus datos para llenar los portales de facturación

<b>Facturación</b>
/facturado 12 — ya se facturó (varios: /facturado 12 13)
/nofacturar 12 — no se va a facturar

<b>Correcciones</b>
/editar 12 total 245.50
/editar 12 fecha 03/10/2026
/editar 12 categoria gasolina
/borrar 12

Campos editables: total, subtotal, iva, fecha, comercio, razon, rfc, folio, categoria, descripcion, pago, moneda, estado, uuid, portal, notas.
Categorías: {", ".join(CATEGORIES)}."""


def _replies_parse_errors(handler):
    """Responde con el mensaje de error cuando el usuario escribió mal un comando."""

    @functools.wraps(handler)
    async def wrapper(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        try:
            return await handler(self, update, context)
        except ParseError as e:
            await update.effective_message.reply_text(f"⚠️ {e}")

    return wrapper


async def _reply_long(message: Message, html: str) -> None:
    for chunk in split_message(html):
        await message.reply_html(chunk)


class ExpenseBot:
    def __init__(self, config: Config, db: Database, extractor: TicketExtractor):
        self.config = config
        self.db = db
        self.extractor = extractor

    def now(self) -> datetime:
        return datetime.now(self.config.timezone)

    def today(self) -> date:
        return self.now().date()

    def build_application(self) -> Application:
        app = (
            ApplicationBuilder()
            .token(self.config.telegram_token)
            .concurrent_updates(4)
            .post_init(self._post_init)
            .build()
        )
        new_messages = filters.UpdateType.MESSAGE
        allowed = filters.Chat(chat_id=self.config.allowed_chat_ids) & new_messages

        # /start y /chatid responden en cualquier chat para poder configurar el bot.
        app.add_handler(CommandHandler("start", self.start, filters=new_messages))
        app.add_handler(CommandHandler("chatid", self.chat_id, filters=new_messages))
        for name, callback in (
            ("ayuda", self.help),
            ("help", self.help),
            ("resumen", self.summary),
            ("gastos", self.recent),
            ("pendientes", self.pending),
            ("facturado", self.mark_invoiced),
            ("nofacturar", self.mark_no_invoice),
            ("editar", self.edit),
            ("borrar", self.delete),
            ("ver", self.show),
            ("exportar", self.export),
            ("datosfiscales", self.fiscal),
        ):
            app.add_handler(CommandHandler(name, callback, filters=allowed))
        app.add_handler(MessageHandler(allowed & (filters.PHOTO | filters.Document.IMAGE), self.on_image))
        app.add_handler(MessageHandler(allowed & filters.Document.FileExtension("xml"), self.on_xml))
        app.add_error_handler(self.on_error)

        if self.config.reminder_days:
            app.job_queue.run_daily(
                self.send_reminders,
                time=dt_time(hour=self.config.reminder_hour, tzinfo=self.config.timezone),
                name="recordatorio-facturas",
            )
        return app

    async def _post_init(self, app: Application) -> None:
        await app.bot.set_my_commands(COMMANDS)

    # --- Configuración y ayuda -------------------------------------------------

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_chat.id in self.config.allowed_chat_ids:
            await self.help(update, context)
        else:
            await self.chat_id(update, context)

    async def chat_id(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        chat_id = update.effective_chat.id
        if chat_id in self.config.allowed_chat_ids:
            text = f"El ID de este chat es <code>{chat_id}</code> y ya está autorizado. ✅"
        else:
            text = (
                f"El ID de este chat es <code>{chat_id}</code>.\n"
                "Todavía no está autorizado: agrégalo a ALLOWED_CHAT_IDS en la configuración del "
                "bot y reinícialo."
            )
        await update.effective_message.reply_html(text)

    async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        await update.effective_message.reply_html(HELP_TEXT)

    async def fiscal(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        await update.effective_message.reply_html(fiscal_text(self.config.fiscal))

    # --- Tickets y facturas ----------------------------------------------------

    async def on_image(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        if message.photo:
            photo = message.photo[-1]  # la resolución más alta
            file_id, size, media_type, source = photo.file_id, photo.file_size, "image/jpeg", "foto"
        else:
            doc = message.document
            file_id, size, media_type, source = doc.file_id, doc.file_size, doc.mime_type, "imagen"
        if size and size > MAX_IMAGE_BYTES:
            await message.reply_text("⚠️ La imagen pesa más de 5 MB. Envíala como foto (no como archivo).")
            return

        await context.bot.send_chat_action(message.chat_id, ChatAction.TYPING)
        telegram_file = await context.bot.get_file(file_id)
        image = bytes(await telegram_file.download_as_bytearray())
        try:
            ticket = await self.extractor.extract(image, media_type, message.caption, self.today())
        except ExtractionError as e:
            await message.reply_text(f"⚠️ {e}")
            return
        if not ticket.is_receipt:
            await message.reply_text("🤔 Esto no parece un ticket ni una factura, así que no registré nada.")
            return
        await message.reply_html(self._register_ticket(update, ticket, file_id, source))

    def _register_ticket(self, update: Update, ticket: TicketData, file_id: str, source: str) -> str:
        chat_id = update.effective_chat.id
        today = self.today()
        expense_date = ticket.purchase_date or today
        rfc = ticket.rfc.upper().replace(" ", "").replace("-", "") if ticket.rfc else None
        caption = normalize(update.effective_message.caption or "")

        if ticket.is_cfdi and ticket.cfdi_uuid:
            existing = self.db.find_by_uuid(chat_id, ticket.cfdi_uuid)
            if existing:
                return f"Esta factura ya estaba registrada en el gasto #{existing.id}."

        # La foto de una factura puede corresponder a un ticket que ya estaba registrado.
        if ticket.is_cfdi and ticket.total is not None:
            match = self.db.find_invoice_match(chat_id, rfc, ticket.total, expense_date)
            if match:
                expense = self.db.update(
                    chat_id,
                    match.id,
                    invoice_status="facturado",
                    cfdi_uuid=ticket.cfdi_uuid.upper() if ticket.cfdi_uuid else match.cfdi_uuid,
                    rfc=match.rfc or rfc,
                    legal_name=match.legal_name or ticket.legal_name,
                )
                return expense_detail(expense, f"✅ <b>Factura vinculada al gasto #{expense.id}</b>")

        if ticket.is_cfdi:
            status = "facturado"
        elif any(phrase in caption for phrase in NO_INVOICE_PHRASES):
            status = "no_requiere"
        else:
            status = "pendiente"
        currency = (ticket.currency or "").strip().upper()
        duplicate = self.db.find_duplicate(chat_id, expense_date, ticket.total, ticket.folio)
        user = update.effective_user
        expense = self.db.add(
            chat_id,
            created_at=self.now(),
            user_id=user.id if user else None,
            user_name=user.first_name if user else None,
            expense_date=expense_date,
            merchant=ticket.merchant,
            legal_name=ticket.legal_name,
            rfc=rfc,
            total=ticket.total,
            subtotal=ticket.subtotal,
            iva=ticket.iva,
            currency=currency if len(currency) == 3 else "MXN",
            payment_method=ticket.payment_method,
            folio=ticket.folio,
            category=ticket.category,
            description=ticket.description or None,
            invoice_status=status,
            cfdi_uuid=ticket.cfdi_uuid.upper() if ticket.is_cfdi and ticket.cfdi_uuid else None,
            invoice_portal=ticket.invoice_portal,
            invoice_fields=[field.model_dump() for field in ticket.invoice_fields],
            notes=ticket.notes,
            source=source,
            file_id=file_id,
        )

        warnings = []
        if ticket.total is None:
            warnings.append(f"No pude leer el total. Corrígelo con /editar {expense.id} total 123.45")
        if ticket.purchase_date is None:
            warnings.append(
                f"No pude leer la fecha y usé la de hoy. Corrígela con /editar {expense.id} fecha DD/MM/AAAA"
            )
        elif ticket.purchase_date > today:
            warnings.append(f"La fecha quedó en el futuro; revísala con /editar {expense.id} fecha DD/MM/AAAA")
        if rfc and not RFC_RE.match(rfc):
            warnings.append(f"El RFC leído no parece válido; revísalo con /editar {expense.id} rfc …")
        if duplicate:
            warnings.append(
                f"Parece duplicado del gasto #{duplicate.id}. Si lo es, bórralo con /borrar {expense.id}"
            )
        text = expense_detail(expense, f"✅ <b>Gasto #{expense.id} registrado</b>")
        if warnings:
            text += "\n\n" + "\n".join(f"⚠️ {w}" for w in warnings)
        return text

    async def on_xml(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        message = update.effective_message
        if message.document.file_size and message.document.file_size > MAX_XML_BYTES:
            await message.reply_text("⚠️ El archivo XML es demasiado grande para ser una factura.")
            return
        telegram_file = await context.bot.get_file(message.document.file_id)
        data = bytes(await telegram_file.download_as_bytearray())
        try:
            cfdi = parse_cfdi(data)
        except CfdiError as e:
            await message.reply_text(f"⚠️ {e}")
            return
        await message.reply_html(self._register_cfdi(update, cfdi))

    def _register_cfdi(self, update: Update, cfdi: Cfdi) -> str:
        if cfdi.tipo != "I":
            kind = esc(TIPOS.get(cfdi.tipo, cfdi.tipo))
            return f"Este CFDI es de tipo {kind}; solo registro facturas de compra, así que no hice cambios."

        chat_id = update.effective_chat.id
        notes = []
        expected_rfc = self.config.fiscal.rfc
        if expected_rfc and cfdi.receptor_rfc and cfdi.receptor_rfc != expected_rfc:
            notes.append(
                f"⚠️ La factura está a nombre del RFC {esc(cfdi.receptor_rfc)}, no de {esc(expected_rfc)}. "
                "Revisa que esté bien emitida."
            )

        existing = self.db.find_by_uuid(chat_id, cfdi.uuid)
        if existing:
            return "\n\n".join([f"Esta factura ya estaba registrada en el gasto #{existing.id}.", *notes])

        match = self.db.find_invoice_match(chat_id, cfdi.emisor_rfc, cfdi.total, cfdi.fecha)
        if match:
            expense = self.db.update(
                chat_id,
                match.id,
                invoice_status="facturado",
                cfdi_uuid=cfdi.uuid,
                rfc=cfdi.emisor_rfc,
                legal_name=match.legal_name or cfdi.emisor_nombre,
            )
            title = f"✅ <b>Factura vinculada al gasto #{expense.id}</b>"
        else:
            user = update.effective_user
            expense = self.db.add(
                chat_id,
                created_at=self.now(),
                user_id=user.id if user else None,
                user_name=user.first_name if user else None,
                expense_date=cfdi.fecha,
                merchant=cfdi.emisor_nombre,
                legal_name=cfdi.emisor_nombre,
                rfc=cfdi.emisor_rfc,
                total=cfdi.total,
                subtotal=cfdi.subtotal,
                iva=cfdi.iva,
                currency=cfdi.moneda,
                category="otros",
                description=cfdi.conceptos[:200] or None,
                invoice_status="facturado",
                cfdi_uuid=cfdi.uuid,
                source="xml",
            )
            title = f"✅ <b>Factura registrada como gasto nuevo #{expense.id}</b>"
            notes.append(
                "No encontré un ticket pendiente con el mismo total, así que la registré como gasto "
                f"nuevo en la categoría «otros» (cámbiala con /editar {expense.id} categoria …). "
                f"Si la factura es de tickets que ya estaban registrados, bórrala con /borrar {expense.id} "
                "y marca esos tickets con /facturado."
            )
        return "\n\n".join([expense_detail(expense, title), *notes])

    # --- Consultas ----------------------------------------------------------------

    @_replies_parse_errors
    async def summary(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        year, month = parse_month(context.args, self.today())
        start, end = month_bounds(year, month)
        expenses = self.db.between(update.effective_chat.id, start, end)
        await _reply_long(update.effective_message, summary_text(expenses, month_label(year, month)))

    async def recent(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        limit = 10
        if context.args and context.args[0].isdigit():
            limit = max(1, min(int(context.args[0]), 50))
        expenses = self.db.recent(update.effective_chat.id, limit)
        await _reply_long(update.effective_message, recent_text(expenses))

    async def pending(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        expenses = self.db.pending(update.effective_chat.id)
        await _reply_long(update.effective_message, pending_text(expenses, self.today()))

    @_replies_parse_errors
    async def show(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if not context.args:
            raise ParseError("Indica el número del gasto. Ejemplo: /ver 12")
        message = update.effective_message
        expense = self.db.get(update.effective_chat.id, parse_id(context.args[0]))
        if expense is None:
            await message.reply_text(f"No encontré el gasto #{context.args[0].lstrip('#')}.")
            return
        detail = expense_detail(expense)
        if not expense.file_id:
            await message.reply_html(detail)
            return
        # El pie de foto admite hasta 1024 caracteres.
        caption = detail if len(detail) <= 1024 else None
        if expense.source == "foto":
            await message.reply_photo(expense.file_id, caption=caption, parse_mode=ParseMode.HTML)
        else:
            await message.reply_document(expense.file_id, caption=caption, parse_mode=ParseMode.HTML)
        if caption is None:
            await message.reply_html(detail)

    @_replies_parse_errors
    async def export(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        chat_id = update.effective_chat.id
        if context.args and normalize(context.args[0]) in ("todo", "todos"):
            expenses = self.db.between(chat_id)
            period, filename = "todos los meses", "gastos-todos.xlsx"
        else:
            year, month = parse_month(context.args, self.today())
            start, end = month_bounds(year, month)
            expenses = self.db.between(chat_id, start, end)
            period, filename = month_label(year, month), f"gastos-{year}-{month:02d}.xlsx"
        message = update.effective_message
        if not expenses:
            await message.reply_text(f"No hay gastos registrados en {period}.")
            return
        await message.reply_document(
            build_xlsx(expenses, self.config.timezone),
            filename=filename,
            caption=f"📎 {len(expenses)} gasto(s) de {period}",
        )

    # --- Cambios -------------------------------------------------------------------

    async def _set_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE, status: str) -> None:
        ids, uuid = parse_ids_and_uuid(context.args)
        chat_id = update.effective_chat.id
        updated, missing = [], []
        for expense_id in ids:
            values = {"invoice_status": status}
            if uuid:
                values["cfdi_uuid"] = uuid
            (updated if self.db.update(chat_id, expense_id, **values) else missing).append(f"#{expense_id}")
        label = "facturado" if status == "facturado" else "sin factura"
        lines = []
        if updated:
            lines.append(f"✅ Marcado como {label}: {', '.join(updated)}")
        if missing:
            lines.append(f"No encontré: {', '.join(missing)}")
        await update.effective_message.reply_text("\n".join(lines))

    @_replies_parse_errors
    async def mark_invoiced(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        await self._set_status(update, context, "facturado")

    @_replies_parse_errors
    async def mark_no_invoice(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        await self._set_status(update, context, "no_requiere")

    @_replies_parse_errors
    async def edit(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if len(context.args) < 3:
            raise ParseError("Uso: /editar <número> <campo> <valor>. Ejemplo: /editar 12 total 245.50")
        expense_id = parse_id(context.args[0])
        column, value = parse_edit(context.args[1], " ".join(context.args[2:]), self.today())
        expense = self.db.update(update.effective_chat.id, expense_id, **{column: value})
        if expense is None:
            await update.effective_message.reply_text(f"No encontré el gasto #{expense_id}.")
            return
        await update.effective_message.reply_html(expense_detail(expense, f"✏️ <b>Gasto #{expense.id} actualizado</b>"))

    @_replies_parse_errors
    async def delete(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if not context.args:
            raise ParseError("Indica el número del gasto. Ejemplo: /borrar 12")
        expense_id = parse_id(context.args[0])
        chat_id = update.effective_chat.id
        expense = self.db.get(chat_id, expense_id)
        if expense is None or not self.db.delete(chat_id, expense_id):
            await update.effective_message.reply_text(f"No encontré el gasto #{expense_id}.")
            return
        name = expense.merchant or expense.description or "sin comercio"
        await update.effective_message.reply_text(
            f"🗑️ Borré el gasto #{expense_id} ({name}, {money(expense.total, expense.currency)})."
        )

    # --- Recordatorio y errores ----------------------------------------------------

    async def send_reminders(self, context: ContextTypes.DEFAULT_TYPE) -> None:
        today = self.today()
        if today.day not in self.config.reminder_days:
            return
        start, end = month_bounds(today.year, today.month)
        for chat_id in self.config.allowed_chat_ids:
            pending = [e for e in self.db.pending(chat_id) if start <= e.expense_date < end]
            if not pending:
                continue
            try:
                for chunk in split_message(reminder_text(pending, today)):
                    await context.bot.send_message(chat_id, chunk, parse_mode=ParseMode.HTML)
            except TelegramError as e:
                logger.warning("No pude enviar el recordatorio al chat %s: %s", chat_id, e)

    async def on_error(self, update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        logger.error("Error al procesar una actualización", exc_info=context.error)
        if isinstance(update, Update) and update.effective_message:
            try:
                await update.effective_message.reply_text("⚠️ Ocurrió un error inesperado. Intenta de nuevo.")
            except TelegramError:
                pass
