"""Punto de entrada: python -m gastos_bot"""

import logging
import os
import sys

import anthropic
from telegram import Update

from .bot import ExpenseBot
from .config import ConfigError, load_config
from .db import Database
from .extractor import TicketExtractor


def main() -> None:
    logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
    # httpx registra cada consulta a Telegram; solo mostramos sus advertencias.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpx2").setLevel(logging.WARNING)

    try:
        config = load_config()
    except ConfigError as e:
        sys.exit(f"Error de configuración: {e}")

    logger = logging.getLogger("gastos_bot")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        logger.warning("ANTHROPIC_API_KEY no está definida: sin una clave de Anthropic no podré leer los tickets.")
    if not config.allowed_chat_ids:
        logger.warning(
            "ALLOWED_CHAT_IDS está vacío: el bot solo responderá /start y /chatid. "
            "Envía /chatid en tu grupo y agrega ese número a la configuración."
        )

    db = Database(config.db_path)
    extractor = TicketExtractor(
        anthropic.AsyncAnthropic(), model=config.claude_model, effort=config.claude_effort
    )
    app = ExpenseBot(config, db, extractor).build_application()
    logger.info("Iniciando el bot. Modelo: %s. Chats autorizados: %s", config.claude_model, sorted(config.allowed_chat_ids))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
