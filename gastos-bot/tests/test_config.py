import pytest

from gastos_bot.config import DEFAULT_MODEL, ConfigError, load_config


def test_defaults_and_parsing():
    config = load_config(
        {
            "TELEGRAM_BOT_TOKEN": "123:abc",
            "ALLOWED_CHAT_IDS": "-1001234567890, 55",
            "FISCAL_RFC": "xaxx010101000",
            "RECORDATORIO_DIAS": "20,28",
        }
    )
    assert config.allowed_chat_ids == frozenset({-1001234567890, 55})
    assert config.claude_model == DEFAULT_MODEL
    assert config.claude_effort == "medium"
    assert config.reminder_days == (20, 28)
    assert config.reminder_hour == 10
    assert str(config.timezone) == "America/Mexico_City"
    assert config.fiscal.rfc == "XAXX010101000"
    assert not config.fiscal.is_empty()


def test_empty_reminder_days_disables_reminders():
    config = load_config({"TELEGRAM_BOT_TOKEN": "123:abc", "RECORDATORIO_DIAS": ""})
    assert config.reminder_days == ()
    assert config.allowed_chat_ids == frozenset()


@pytest.mark.parametrize(
    "env",
    [
        {},
        {"TELEGRAM_BOT_TOKEN": "x", "ALLOWED_CHAT_IDS": "abc"},
        {"TELEGRAM_BOT_TOKEN": "x", "CLAUDE_EFFORT": "turbo"},
        {"TELEGRAM_BOT_TOKEN": "x", "RECORDATORIO_DIAS": "32"},
        {"TELEGRAM_BOT_TOKEN": "x", "RECORDATORIO_HORA": "24"},
        {"TELEGRAM_BOT_TOKEN": "x", "TZ_NAME": "Marte/Base"},
    ],
)
def test_invalid_config(env):
    with pytest.raises(ConfigError):
        load_config(env)
