"""Configuración del bot, leída de variables de entorno (o de un archivo .env)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

DEFAULT_MODEL = "claude-opus-5-5"
EFFORT_LEVELS = ("low", "medium", "high", "xhigh", "max")


class ConfigError(Exception):
    """La configuración está incompleta o tiene un valor inválido."""


@dataclass(frozen=True)
class FiscalData:
    """Datos del receptor que piden los portales de facturación."""

    rfc: str = ""
    nombre: str = ""
    codigo_postal: str = ""
    regimen: str = ""
    uso_cfdi: str = ""
    email: str = ""

    def is_empty(self) -> bool:
        return not any(
            (self.rfc, self.nombre, self.codigo_postal, self.regimen, self.uso_cfdi, self.email)
        )


@dataclass(frozen=True)
class Config:
    telegram_token: str
    allowed_chat_ids: frozenset[int]
    db_path: Path
    timezone: ZoneInfo
    claude_model: str = DEFAULT_MODEL
    claude_effort: str = "medium"
    reminder_days: tuple[int, ...] = (25,)
    reminder_hour: int = 10
    fiscal: FiscalData = field(default_factory=FiscalData)


def _parse_int_list(name: str, raw: str) -> list[int]:
    values = []
    for part in raw.replace(";", ",").split(","):
        part = part.strip()
        if not part:
            continue
        try:
            values.append(int(part))
        except ValueError:
            raise ConfigError(f"{name}: '{part}' no es un número entero") from None
    return values


def load_config(env: dict[str, str] | None = None) -> Config:
    """Construye la configuración. Sin `env`, usa os.environ (cargando .env si existe)."""
    if env is None:
        load_dotenv()
        env = dict(os.environ)

    token = env.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise ConfigError("Falta TELEGRAM_BOT_TOKEN (el token que te da @BotFather).")

    allowed = frozenset(_parse_int_list("ALLOWED_CHAT_IDS", env.get("ALLOWED_CHAT_IDS", "")))

    tz_name = env.get("TZ_NAME", "").strip() or "America/Mexico_City"
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        raise ConfigError(f"TZ_NAME: zona horaria desconocida '{tz_name}'") from None

    effort = env.get("CLAUDE_EFFORT", "").strip() or "medium"
    if effort not in EFFORT_LEVELS:
        raise ConfigError(f"CLAUDE_EFFORT debe ser uno de: {', '.join(EFFORT_LEVELS)}")

    reminder_days = tuple(_parse_int_list("RECORDATORIO_DIAS", env.get("RECORDATORIO_DIAS", "25")))
    for day in reminder_days:
        if not 1 <= day <= 31:
            raise ConfigError("RECORDATORIO_DIAS: cada día debe estar entre 1 y 31")

    hour_values = _parse_int_list("RECORDATORIO_HORA", env.get("RECORDATORIO_HORA", "10"))
    reminder_hour = hour_values[0] if hour_values else 10
    if not 0 <= reminder_hour <= 23:
        raise ConfigError("RECORDATORIO_HORA debe estar entre 0 y 23")

    return Config(
        telegram_token=token,
        allowed_chat_ids=allowed,
        db_path=Path(env.get("DB_PATH", "").strip() or "data/gastos.db"),
        timezone=tz,
        claude_model=env.get("CLAUDE_MODEL", "").strip() or DEFAULT_MODEL,
        claude_effort=effort,
        reminder_days=reminder_days,
        reminder_hour=reminder_hour,
        fiscal=FiscalData(
            rfc=env.get("FISCAL_RFC", "").strip().upper(),
            nombre=env.get("FISCAL_NOMBRE", "").strip(),
            codigo_postal=env.get("FISCAL_CP", "").strip(),
            regimen=env.get("FISCAL_REGIMEN", "").strip(),
            uso_cfdi=env.get("FISCAL_USO_CFDI", "").strip(),
            email=env.get("FISCAL_EMAIL", "").strip(),
        ),
    )
