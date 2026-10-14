from datetime import date

import pytest

from gastos_bot.cfdi import CfdiError, parse_cfdi

UUID = "5f3a2b1c-1234-4abc-9def-0123456789ab"


def cfdi_xml(
    version="4",
    tipo="I",
    total="245.50",
    timbre=True,
    receptor_rfc="XAXX010101000",
    emisor_rfc="CCO8605231N4",
) -> bytes:
    ns = f"http://www.sat.gob.mx/cfd/{version}"
    timbre_xml = (
        '<cfdi:Complemento><tfd:TimbreFiscalDigital Version="1.1" '
        f'UUID="{UUID}" FechaTimbrado="2026-10-05T10:00:00"/></cfdi:Complemento>'
        if timbre
        else ""
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="{ns}" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
    Version="{version}.0" Fecha="2026-10-05T09:58:00" SubTotal="211.64" Moneda="MXN"
    Total="{total}" TipoDeComprobante="{tipo}">
  <cfdi:Emisor Rfc="{emisor_rfc}" Nombre="CADENA COMERCIAL OXXO" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="{receptor_rfc}" Nombre="JUAN PEREZ" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto Descripcion="Refresco 600 ml" Importe="100.00"/>
    <cfdi:Concepto Descripcion="Papas" Importe="111.64"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="33.86">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" Importe="30.00"/>
      <cfdi:Traslado Impuesto="002" Importe="3.86"/>
      <cfdi:Traslado Impuesto="003" Importe="5.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  {timbre_xml}
</cfdi:Comprobante>""".encode()


@pytest.mark.parametrize("version", ["4", "3"])
def test_parse_cfdi(version):
    cfdi = parse_cfdi(cfdi_xml(version=version))
    assert cfdi.uuid == UUID.upper()
    assert cfdi.tipo == "I"
    assert cfdi.emisor_rfc == "CCO8605231N4"
    assert cfdi.emisor_nombre == "CADENA COMERCIAL OXXO"
    assert cfdi.receptor_rfc == "XAXX010101000"
    assert cfdi.fecha == date(2026, 10, 5)
    assert cfdi.total == 245.5
    assert cfdi.subtotal == 211.64
    assert cfdi.iva == 33.86  # solo IVA (002), sin IEPS
    assert cfdi.moneda == "MXN"
    assert cfdi.conceptos == "Refresco 600 ml; Papas"


@pytest.mark.parametrize(
    "data",
    [
        b"esto no es xml",
        b"<factura><total>1</total></factura>",
        cfdi_xml(timbre=False),
        cfdi_xml(total="mucho"),
        cfdi_xml(emisor_rfc=""),
        b"<x>" + b"a" * (1024 * 1024) + b"</x>",
    ],
)
def test_invalid_cfdi(data):
    with pytest.raises(CfdiError):
        parse_cfdi(data)


def test_payment_complement_keeps_its_type():
    assert parse_cfdi(cfdi_xml(tipo="P", total="0")).tipo == "P"


def test_invalid_tax_amount():
    data = cfdi_xml().replace(b'Importe="30.00"', b'Importe="treinta"')
    with pytest.raises(CfdiError):
        parse_cfdi(data)
