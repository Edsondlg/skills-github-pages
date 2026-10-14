import base64
import json
from datetime import date
from types import SimpleNamespace

import anthropic
import httpx2
import pytest

from gastos_bot.extractor import MAX_IMAGE_BYTES, ExtractionError, TicketData, TicketExtractor
from tests.conftest import make_ticket

TODAY = date(2026, 10, 14)
IMAGE = b"\xff\xd8\xff fake jpeg"


class FakeMessages:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.kwargs = None

    async def parse(self, **kwargs):
        self.kwargs = kwargs
        if self.error:
            raise self.error
        return self.response


def fake_client(response=None, error=None):
    messages = FakeMessages(response, error)
    return SimpleNamespace(beta=SimpleNamespace(messages=messages)), messages


def fake_response(parsed=None, stop_reason="end_turn"):
    return SimpleNamespace(
        stop_reason=stop_reason,
        parsed_output=parsed,
        usage=SimpleNamespace(input_tokens=1500, output_tokens=300),
        _request_id="req_test",
    )


async def test_extract_builds_request_and_returns_ticket():
    ticket = make_ticket()
    client, messages = fake_client(fake_response(ticket))
    extractor = TicketExtractor(client, model="claude-opus-5-5", effort="medium")

    result = await extractor.extract(IMAGE, "image/jpeg", "comida con cliente", TODAY)

    assert result == ticket
    kw = messages.kwargs
    assert kw["model"] == "claude-opus-5-5"
    assert kw["output_format"] is TicketData
    assert kw["output_config"] == {"effort": "medium"}
    assert kw["fallbacks"] == "default"
    assert kw["betas"] == ["server-side-fallback-2026-07-01"]
    image_block, text_block = kw["messages"][0]["content"]
    assert image_block["source"] == {
        "type": "base64",
        "media_type": "image/jpeg",
        "data": base64.standard_b64encode(IMAGE).decode(),
    }
    assert "2026-10-14" in text_block["text"]
    assert "comida con cliente" in text_block["text"]


@pytest.mark.parametrize(
    "response",
    [fake_response(make_ticket(), stop_reason="refusal"), fake_response(None)],
)
async def test_extract_rejects_refusals_and_empty_output(response):
    client, _ = fake_client(response)
    with pytest.raises(ExtractionError):
        await TicketExtractor(client, model="m").extract(IMAGE, "image/jpeg", None, TODAY)


async def test_extract_validates_image_before_calling_api():
    client, messages = fake_client(fake_response(make_ticket()))
    extractor = TicketExtractor(client, model="m")
    with pytest.raises(ExtractionError):
        await extractor.extract(IMAGE, "image/heic", None, TODAY)
    with pytest.raises(ExtractionError):
        await extractor.extract(b"x" * (MAX_IMAGE_BYTES + 1), "image/jpeg", None, TODAY)
    assert messages.kwargs is None


def _status_error(cls, status):
    request = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    return cls("error", response=httpx2.Response(status, request=request), body=None)


def _validation_error():
    try:
        TicketData.model_validate_json('{"is_receipt": tr')
    except Exception as e:  # pydantic.ValidationError
        return e


@pytest.mark.parametrize(
    "error,expected",
    [
        (_status_error(anthropic.AuthenticationError, 401), "ANTHROPIC_API_KEY"),
        (_status_error(anthropic.RateLimitError, 429), "un minuto"),
        (_status_error(anthropic.BadRequestError, 400), "otra foto"),
        (_status_error(anthropic.InternalServerError, 500), "no está disponible"),
        (anthropic.APIConnectionError(request=httpx2.Request("POST", "https://x")), "conectar"),
        (_validation_error(), "más clara"),
    ],
)
async def test_extract_maps_api_errors(error, expected):
    client, _ = fake_client(error=error)
    with pytest.raises(ExtractionError, match=expected):
        await TicketExtractor(client, model="m").extract(IMAGE, "image/png", None, TODAY)


async def test_extract_with_real_sdk_request_shape():
    """Pasa por el SDK real (sin red) para revisar el cuerpo HTTP y la lectura de la respuesta."""
    captured = {}
    ticket = make_ticket(purchase_date=None, total=None)

    def handler(request: httpx2.Request) -> httpx2.Response:
        captured["headers"] = request.headers
        captured["body"] = json.loads(request.content)
        return httpx2.Response(
            200,
            headers={"request-id": "req_123"},
            json={
                "id": "msg_1",
                "type": "message",
                "role": "assistant",
                "model": "claude-opus-5-5",
                "content": [
                    {"type": "thinking", "thinking": "", "signature": "sig"},
                    {"type": "text", "text": ticket.model_dump_json()},
                ],
                "stop_reason": "end_turn",
                "stop_sequence": None,
                "usage": {"input_tokens": 1500, "output_tokens": 300},
            },
        )

    client = anthropic.AsyncAnthropic(
        api_key="sk-test",
        base_url="http://anthropic.test",
        http_client=anthropic.DefaultAsyncHttpxClient(transport=httpx2.MockTransport(handler)),
        max_retries=0,
    )
    result = await TicketExtractor(client, model="claude-opus-5-5").extract(IMAGE, "image/jpeg", None, TODAY)

    assert result == ticket
    body = captured["body"]
    assert "server-side-fallback-2026-07-01" in captured["headers"]["anthropic-beta"]
    assert body["fallbacks"] == "default"
    assert body["model"] == "claude-opus-5-5"
    assert body["output_config"]["effort"] == "medium"
    schema = body["output_config"]["format"]["schema"]
    assert body["output_config"]["format"]["type"] == "json_schema"
    assert schema["additionalProperties"] is False
    assert set(schema["required"]) == set(TicketData.model_fields)
    assert body["messages"][0]["content"][0]["type"] == "image"
    assert "thinking" not in body  # Claude Opus 5.5 siempre piensa; el esfuerzo lo controla
