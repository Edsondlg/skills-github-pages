# Bot de gastos para Telegram 📸🧾

Manden la foto de un ticket a su grupo de Telegram y el bot:

- **lee el ticket con IA** (Claude) y registra comercio, fecha, total, IVA, RFC, folio, forma de pago y categoría;
- **guarda los datos que piden los portales de facturación** (página del portal, Web ID, estación, TC#, etc.);
- les dice **qué tickets faltan por facturar** y se los **recuerda antes de que cierre el mes**;
- **vincula las facturas** cuando le mandan el XML (CFDI) y les avisa si salió a nombre de otro RFC;
- hace **resúmenes por mes, categoría y persona**, y **exporta todo a Excel**.

```
Ana:  [foto del ticket]
Bot:  ✅ Gasto #12 registrado
      🏪 OXXO
      📅 03/10/2026 · $245.50
      🛒 Supermercado · Bebidas y botanas
      👤 Ana
      🧾 Factura: ⏳ pendiente
           RFC CCO8605231N4 · Folio A-123
           Portal: facturacion.oxxo.com
           Web ID: 998877
```

## ¿Por qué Telegram y no WhatsApp?

Telegram permite bots en grupos de forma oficial y gratuita: se crean en minutos con @BotFather.
En WhatsApp, la API oficial requiere una cuenta de empresa verificada por Meta y un número dedicado,
y las librerías no oficiales pueden hacer que bloqueen el número. Si más adelante necesitan WhatsApp,
la lectura de tickets, la base de datos y los reportes no dependen de Telegram y se pueden reutilizar.

## Instalación

### 1. Crea el bot en Telegram

1. En Telegram, abre **@BotFather**, envía `/newbot` y sigue las instrucciones. Guarda el **token** que te da.
2. Envía `/setprivacy`, elige tu bot y selecciona **Disable**. Sin esto, el bot no ve las fotos que se mandan
   al grupo (otra opción es hacerlo administrador del grupo).
3. Agrega el bot a su grupo de gastos. Si ya estaba en el grupo antes del paso 2, sácalo y vuelve a agregarlo.

### 2. Consigue una clave de la API de Anthropic

Entra a la consola de Claude (https://platform.claude.com), agrega saldo y crea una **API key**.
Se cobra por cada foto que el bot lee; el costo depende del tamaño de la foto, de `CLAUDE_MODEL` y de
`CLAUDE_EFFORT`. En la consola pueden ver cuánto llevan gastado.

### 3. Configura

```bash
cd gastos-bot
cp .env.example .env
```

Abre `.env` y llena por lo menos `TELEGRAM_BOT_TOKEN` y `ANTHROPIC_API_KEY`. Si quieren ver sus datos
fiscales con `/datosfiscales`, llena también las variables `FISCAL_*`.

### 4. Ponlo a funcionar

El bot tiene que estar encendido todo el tiempo: en una computadora que no se apague, una Raspberry Pi o
un servidor en la nube. No necesita dominio ni IP pública.

**Con Docker** (recomendado):

```bash
docker compose up -d --build
docker compose logs -f   # para ver qué está pasando
```

**Con Python 3.11 o más reciente:**

```bash
python -m venv .venv
source .venv/bin/activate        # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m gastos_bot
```

### 5. Autoriza su grupo

Por seguridad, el bot solo trabaja en los chats que tú autorizas (así nadie más gasta tu saldo).

1. En el grupo, envía `/chatid`. El bot responde con el número del grupo (negativo, p. ej. `-1001234567890`).
2. Pon ese número en `ALLOWED_CHAT_IDS` dentro de `.env` (si son varios, sepáralos con comas).
3. Reinicia el bot para que lea el cambio: `docker compose up -d` (con Docker) o detén y vuelve a ejecutar
   `python -m gastos_bot`.

Si algún día el bot deja de responder en el grupo, envía `/chatid` otra vez: Telegram cambia el número del
grupo cuando lo convierte en «supergrupo» (por ejemplo, al cambiar ciertos ajustes del grupo).

Listo: manden la foto de un ticket al grupo.

## Uso

| Qué hacer | Cómo |
|---|---|
| Registrar un gasto | Mandar la foto del ticket o de la factura (o la imagen como archivo, hasta 5 MB) |
| Registrar un gasto que no se va a facturar | Escribir «sin factura» en el comentario de la foto |
| Resumen del mes | `/resumen` · `/resumen septiembre` · `/resumen 2026-09` |
| Últimos gastos | `/gastos` · `/gastos 20` |
| Ver un gasto con su foto | `/ver 12` |
| Tickets por facturar | `/pendientes` |
| Marcar como facturado | `/facturado 12` · `/facturado 12 13 14` · o mandar el XML de la factura |
| Marcar que no se va a facturar | `/nofacturar 12` |
| Corregir un dato | `/editar 12 total 245.50` · `/editar 12 fecha 03/10/2026` · `/editar 12 categoria gasolina` |
| Borrar un gasto | `/borrar 12` |
| Descargar Excel | `/exportar` · `/exportar septiembre` · `/exportar todo` |
| Ver sus datos fiscales | `/datosfiscales` |
| Ayuda | `/ayuda` |

Campos que se pueden editar: `total`, `subtotal`, `iva`, `fecha`, `comercio`, `razon`, `rfc`, `folio`,
`categoria`, `descripcion`, `pago`, `moneda`, `estado` (`pendiente`, `facturado` o `no`), `uuid`, `portal`, `notas`.

Categorías: alimentos, supermercado, gasolina, transporte, hospedaje, servicios, salud, oficina,
tecnologia, hogar, entretenimiento y otros.

## Cómo funciona la facturación

1. Cada ticket queda **pendiente de facturar**, salvo que la foto diga «sin factura» o que ya sea una factura.
2. `/pendientes` muestra los tickets pendientes con los datos que piden los portales (RFC, folio, página,
   Web ID…). En Telegram basta con tocar un dato para copiarlo; `/datosfiscales` muestra los suyos.
   Muchos comercios solo dejan facturar dentro del mes de la compra, por eso la lista separa los tickets
   de este mes de los de meses anteriores.
3. Cuando ya tengan la factura, `/facturado 12` o **manden el XML al grupo**: el bot busca un ticket
   pendiente con el mismo total (±$1), del mismo emisor (si el ticket tiene RFC) y de hasta dos meses antes
   de la factura, y lo marca como facturado con su folio fiscal (UUID). Si no encuentra el ticket, registra
   la factura como gasto nuevo. Una foto de factura también se vincula así. Si mandan una factura que ya
   estaba registrada (mismo UUID), no la duplica.
4. El día 25 de cada mes (configurable con `RECORDATORIO_DIAS`) el bot avisa en el grupo qué tickets del
   mes siguen sin facturar.

El bot también avisa cuando un ticket parece **duplicado** (mismo día y total, y mismo folio si lo tiene),
cuando no pudo leer el total o la fecha, y cuando el XML de una factura salió a nombre de un RFC distinto
a `FISCAL_RFC`.

## Configuración

| Variable | Para qué sirve | Por defecto |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Token de @BotFather (obligatorio) | — |
| `ANTHROPIC_API_KEY` | Clave para leer los tickets con Claude (obligatoria) | — |
| `ALLOWED_CHAT_IDS` | Chats autorizados, separados por comas | ninguno |
| `FISCAL_RFC`, `FISCAL_NOMBRE`, `FISCAL_CP`, `FISCAL_REGIMEN`, `FISCAL_USO_CFDI`, `FISCAL_EMAIL` | Sus datos para los portales de facturación | vacíos |
| `CLAUDE_MODEL` | Modelo que lee los tickets | `claude-opus-5-5` |
| `CLAUDE_EFFORT` | Cuánto razona el modelo: `low`, `medium`, `high`, `xhigh`, `max` | `medium` |
| `RECORDATORIO_DIAS` | Días del mes del recordatorio (vacío = sin recordatorios) | `25` |
| `RECORDATORIO_HORA` | Hora del recordatorio (0-23) | `10` |
| `TZ_NAME` | Zona horaria | `America/Mexico_City` |
| `DB_PATH` | Archivo de la base de datos | `data/gastos.db` |

Si la API rechaza leer una foto por sus filtros de seguridad, la vuelve a intentar automáticamente con el
modelo de respaldo que recomienda Anthropic.

## Sus datos

- Los gastos se guardan en una base de datos SQLite (`data/gastos.db`) en la máquina donde corre el bot.
  Para respaldarla, copien ese archivo o descarguen `/exportar todo` de vez en cuando. Con Docker:
  `docker compose cp bot:/app/data/gastos.db ./respaldo.db`.
- Las fotos se quedan en Telegram; el bot las envía a la API de Anthropic solo para leerlas.
- Solo los chats de `ALLOWED_CHAT_IDS` pueden usar el bot; cada grupo ve únicamente sus propios gastos.

## Desarrollo

```bash
pip install -r requirements-dev.txt
python -m pytest
```

Las pruebas no usan internet: simulan las respuestas de Telegram y de la API de Anthropic.

| Archivo | Qué hace |
|---|---|
| `gastos_bot/extractor.py` | Lee la foto con Claude (visión + salida JSON con esquema) |
| `gastos_bot/bot.py` | Comandos y mensajes de Telegram, recordatorio mensual |
| `gastos_bot/db.py` | Base de datos SQLite y búsqueda de duplicados y de facturas |
| `gastos_bot/cfdi.py` | Lectura de facturas XML (CFDI 3.3 y 4.0) |
| `gastos_bot/reports.py` | Textos de resumen y pendientes, exportación a Excel |
| `gastos_bot/parsing.py` | Interpretación de lo que se escribe en los comandos |
