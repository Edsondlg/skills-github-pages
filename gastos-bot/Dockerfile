FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY gastos_bot ./gastos_bot

# La base de datos vive en /app/data (un volumen, para que no se pierda al actualizar).
RUN useradd --create-home bot && mkdir -p /app/data && chown bot /app/data
USER bot
VOLUME ["/app/data"]

CMD ["python", "-m", "gastos_bot"]
