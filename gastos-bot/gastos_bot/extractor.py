"""Lectura de fotos de tickets con Claude (visión + salida estructurada)."""

from __future__ import annotations

import base64
import logging
from datetime import date
from typing import Literal

import anthropic
import pydantic
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Formatos de imagen que acepta la API y tamaño máximo por imagen.
SUPPORTED_IMAGE_TYPES = ("image/jpeg", "image/png", "image/webp", "image/gif")
MAX_IMAGE_BYTES = 5 * 1024 * 1024

CATEGORIES = (
    "alimentos",
    "supermercado",
    "gasolina",
    "transporte",
    "hospedaje",
    "servicios",
    "salud",
    "oficina",
    "tecnologia",
    "hogar",
    "entretenimiento",
    "otros",
)
Category = Literal[
    "alimentos",
    "supermercado",
    "gasolina",
    "transporte",
    "hospedaje",
    "servicios",
    "salud",
    "oficina",
    "tecnologia",
    "hogar",
    "entretenimiento",
    "otros",
]

SYSTEM_PROMPT = """\
Eres el asistente de un grupo que lleva el control de sus gastos. Recibes la foto de un \
ticket de compra, nota de venta, recibo o factura (CFDI) de México y extraes sus datos.

Reglas:
- Copia los datos tal como aparecen en el documento; no inventes nada. Si un dato no \
aparece o no se lee con certeza, usa null.
- Importes: solo el número con punto decimal (1234.5), sin signo de pesos ni comas.
- total es el TOTAL impreso en el ticket. Si hay una propina escrita a mano o en un \
voucher aparte, no la sumes: menciónala en notes.
- Fechas: en México se escriben día/mes/año (03/10/26 es el 3 de octubre de 2026).
- rfc es el RFC del negocio que emite el ticket (suele estar junto a su nombre o \
dirección), nunca el del cliente.
- invoice_portal e invoice_fields sirven para pedir la factura después: incluye la \
página de facturación y cualquier dato impreso que esos portales piden (Web ID, número \
de ticket, estación, TC#, TR#, código de facturación, sucursal, caja...).
- category: alimentos = restaurantes y comida preparada; supermercado = despensa y \
tiendas de conveniencia; transporte = taxis, apps de viaje, casetas, estacionamiento, \
vuelos; servicios = luz, agua, gas, internet, teléfono y suscripciones; oficina = \
papelería y material de trabajo; hogar = muebles, ferretería y artículos para la casa.
- Si el usuario escribió un comentario junto a la foto, úsalo como contexto para la \
descripción y la categoría.
- Si la imagen no es un comprobante de una compra o un pago, pon is_receipt en false, \
category "otros", description vacía y los demás datos en null o vacíos.
"""


class InvoiceField(BaseModel):
    label: str = Field(description="Etiqueta tal como aparece en el ticket, p. ej. 'Web ID'.")
    value: str = Field(description="Valor exacto del dato.")


class TicketData(BaseModel):
    """Datos que Claude extrae de la foto de un ticket."""

    is_receipt: bool = Field(
        description="true si la imagen es un ticket, nota de venta, recibo o factura de una compra o pago."
    )
    is_cfdi: bool = Field(
        description="true si el documento es una factura electrónica (CFDI) ya emitida, con folio fiscal."
    )
    merchant: str | None = Field(
        description="Nombre comercial del negocio, p. ej. 'OXXO', 'Walmart', 'Gasolinera Pemex'."
    )
    legal_name: str | None = Field(description="Razón social del negocio, si aparece.")
    rfc: str | None = Field(
        description="RFC del negocio: 12 o 13 caracteres en mayúsculas, sin espacios ni guiones."
    )
    purchase_date: date | None = Field(description="Fecha de la compra.")
    total: float | None = Field(description="Importe total del ticket, con impuestos.")
    subtotal: float | None = Field(description="Subtotal antes de impuestos, si aparece.")
    iva: float | None = Field(description="IVA desglosado, si aparece.")
    currency: str = Field(description="Código ISO de la moneda: 'MXN' salvo que el ticket indique otra.")
    payment_method: str | None = Field(
        description="Forma de pago si aparece: 'efectivo', 'tarjeta de crédito', 'tarjeta de débito', 'transferencia'..."
    )
    folio: str | None = Field(description="Número de ticket, folio, transacción u operación.")
    category: Category = Field(description="Categoría del gasto.")
    description: str = Field(description="Descripción breve en español (máx. 80 caracteres) de lo que se compró.")
    cfdi_uuid: str | None = Field(description="Folio fiscal (UUID) si el documento es un CFDI.")
    invoice_portal: str | None = Field(description="Página para facturar impresa en el ticket.")
    invoice_fields: list[InvoiceField] = Field(
        description="Otros datos impresos que los portales piden para facturar. Vacía si no hay."
    )
    notes: str | None = Field(description="Dudas o problemas de lectura (borroso, cortado, propina, etc.).")


class ExtractionError(Exception):
    """No se pudo leer el ticket; el mensaje se le muestra al usuario."""


class TicketExtractor:
    def __init__(self, client: anthropic.AsyncAnthropic, model: str, effort: str = "medium"):
        self._client = client
        self._model = model
        self._effort = effort

    async def extract(
        self, image: bytes, media_type: str, caption: str | None, today: date
    ) -> TicketData:
        if media_type not in SUPPORTED_IMAGE_TYPES:
            raise ExtractionError("Formato de imagen no soportado. Envía el ticket como foto.")
        if len(image) > MAX_IMAGE_BYTES:
            raise ExtractionError(
                "La imagen pesa más de 5 MB. Envíala como foto (no como archivo)."
            )

        text = f"Fecha de hoy: {today.isoformat()}."
        if caption:
            text += f"\nComentario del usuario: {caption}"

        try:
            response = await self._client.beta.messages.parse(
                model=self._model,
                max_tokens=16000,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": base64.standard_b64encode(image).decode("ascii"),
                                },
                            },
                            {"type": "text", "text": text},
                        ],
                    }
                ],
                output_format=TicketData,
                output_config={"effort": self._effort},
                # Si el modelo rechaza la solicitud, la API la reintenta con el modelo
                # de respaldo que Anthropic recomienda.
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            )
        except (anthropic.AuthenticationError, anthropic.PermissionDeniedError) as e:
            logger.error("Credenciales de Anthropic rechazadas: %s", e)
            raise ExtractionError(
                "La clave de Anthropic no es válida. Revisa ANTHROPIC_API_KEY en la configuración."
            ) from e
        except anthropic.RateLimitError as e:
            raise ExtractionError(
                "Hay demasiadas solicitudes en este momento. Intenta de nuevo en un minuto."
            ) from e
        except anthropic.BadRequestError as e:
            logger.warning("Solicitud rechazada por la API: %s", e)
            raise ExtractionError("No pude procesar esta imagen. Intenta con otra foto.") from e
        except anthropic.APIStatusError as e:
            logger.warning("Error del servicio (%s): %s", e.status_code, e)
            raise ExtractionError(
                "El servicio de lectura no está disponible. Intenta más tarde."
            ) from e
        except anthropic.APIConnectionError as e:
            logger.warning("Error de conexión con Anthropic: %s", e)
            raise ExtractionError(
                "No me pude conectar al servicio de lectura. Intenta más tarde."
            ) from e
        except pydantic.ValidationError as e:
            # Respuesta cortada (max_tokens) o rechazada a medio camino.
            logger.warning("Respuesta incompleta al leer el ticket: %s", e)
            raise ExtractionError(
                "No pude leer el ticket completo. Intenta con una foto más clara."
            ) from e

        if response.stop_reason == "refusal":
            raise ExtractionError("El servicio no pudo procesar esta imagen.")
        if response.parsed_output is None:
            raise ExtractionError("No pude leer el ticket. Intenta con una foto más clara.")

        logger.info(
            "Ticket leído (request_id=%s, tokens entrada=%s, salida=%s)",
            response._request_id,
            response.usage.input_tokens,
            response.usage.output_tokens,
        )
        return response.parsed_output
