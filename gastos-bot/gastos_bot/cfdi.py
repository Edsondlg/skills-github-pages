"""Lectura de facturas electrónicas (CFDI 3.3 y 4.0) en formato XML."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date, datetime

CFDI_NAMESPACES = ("http://www.sat.gob.mx/cfd/4", "http://www.sat.gob.mx/cfd/3")
TFD_NAMESPACE = "http://www.sat.gob.mx/TimbreFiscalDigital"
IVA_CODE = "002"
MAX_XML_BYTES = 1024 * 1024

TIPOS = {"I": "ingreso", "E": "egreso (nota de crédito)", "P": "pago", "T": "traslado", "N": "nómina"}


class CfdiError(Exception):
    """El archivo no es un CFDI válido; el mensaje se le muestra al usuario."""


@dataclass(frozen=True)
class Cfdi:
    uuid: str
    tipo: str
    emisor_rfc: str
    emisor_nombre: str | None
    receptor_rfc: str | None
    fecha: date
    total: float
    subtotal: float | None
    iva: float | None
    moneda: str
    conceptos: str


def _amount(value: str | None) -> float | None:
    return float(value) if value not in (None, "") else None


def parse_cfdi(data: bytes) -> Cfdi:
    if len(data) > MAX_XML_BYTES:
        raise CfdiError("El archivo XML es demasiado grande para ser una factura.")
    try:
        root = ET.fromstring(data)
    except ET.ParseError:
        raise CfdiError("El archivo no es un XML válido.") from None

    namespace = root.tag[1:].split("}")[0] if root.tag.startswith("{") else ""
    if namespace not in CFDI_NAMESPACES or not root.tag.endswith("}Comprobante"):
        raise CfdiError("El XML no es una factura electrónica (CFDI).")

    def child(name: str) -> ET.Element | None:
        return root.find(f"{{{namespace}}}{name}")

    timbre = root.find(f".//{{{TFD_NAMESPACE}}}TimbreFiscalDigital")
    if timbre is None or not timbre.get("UUID"):
        raise CfdiError("La factura no está timbrada (no tiene folio fiscal).")

    emisor, receptor = child("Emisor"), child("Receptor")
    if emisor is None or not emisor.get("Rfc") or not root.get("Total") or not root.get("Fecha"):
        raise CfdiError("A la factura le faltan datos básicos (emisor, total o fecha).")

    conceptos = [
        c.get("Descripcion", "").strip()
        for c in root.findall(f"{{{namespace}}}Conceptos/{{{namespace}}}Concepto")
    ]
    impuestos = child("Impuestos")
    traslados = (
        impuestos.findall(f"{{{namespace}}}Traslados/{{{namespace}}}Traslado")
        if impuestos is not None
        else []
    )

    try:
        importes_iva = [_amount(t.get("Importe")) or 0.0 for t in traslados if t.get("Impuesto") == IVA_CODE]
        iva = round(sum(importes_iva), 2) if importes_iva else None
        return Cfdi(
            uuid=timbre.get("UUID").upper(),
            tipo=root.get("TipoDeComprobante", "I"),
            emisor_rfc=emisor.get("Rfc").upper(),
            emisor_nombre=emisor.get("Nombre"),
            receptor_rfc=receptor.get("Rfc").upper() if receptor is not None and receptor.get("Rfc") else None,
            fecha=datetime.fromisoformat(root.get("Fecha")).date(),
            total=float(root.get("Total")),
            subtotal=_amount(root.get("SubTotal")),
            iva=iva,
            moneda=root.get("Moneda", "MXN"),
            conceptos="; ".join(c for c in conceptos if c),
        )
    except ValueError:
        raise CfdiError("La factura tiene una fecha o un importe con formato inválido.") from None
