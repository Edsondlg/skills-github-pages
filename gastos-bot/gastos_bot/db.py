"""Almacenamiento de los gastos en SQLite."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path

STATUSES = ("pendiente", "facturado", "no_requiere")

# Tolerancia (en pesos) al comparar el total de una factura con el de un ticket.
INVOICE_TOTAL_TOLERANCE = 1.0
# Una factura se busca entre los tickets de hasta ~2 meses antes de su fecha de emisión.
INVOICE_LOOKBACK_DAYS = 62

_SCHEMA = """
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    user_id INTEGER,
    user_name TEXT,
    created_at TEXT NOT NULL,
    expense_date TEXT NOT NULL,
    merchant TEXT,
    legal_name TEXT,
    rfc TEXT,
    total REAL,
    subtotal REAL,
    iva REAL,
    currency TEXT NOT NULL DEFAULT 'MXN',
    payment_method TEXT,
    folio TEXT,
    category TEXT NOT NULL DEFAULT 'otros',
    description TEXT,
    invoice_status TEXT NOT NULL DEFAULT 'pendiente',
    cfdi_uuid TEXT,
    invoice_portal TEXT,
    invoice_fields TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'foto',
    file_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_expenses_chat_date ON expenses (chat_id, expense_date);
"""

# Columnas que se pueden escribir al crear o editar un gasto.
_WRITABLE = (
    "user_id",
    "user_name",
    "expense_date",
    "merchant",
    "legal_name",
    "rfc",
    "total",
    "subtotal",
    "iva",
    "currency",
    "payment_method",
    "folio",
    "category",
    "description",
    "invoice_status",
    "cfdi_uuid",
    "invoice_portal",
    "invoice_fields",
    "notes",
    "source",
    "file_id",
)


@dataclass
class Expense:
    id: int
    chat_id: int
    created_at: datetime
    expense_date: date
    user_id: int | None = None
    user_name: str | None = None
    merchant: str | None = None
    legal_name: str | None = None
    rfc: str | None = None
    total: float | None = None
    subtotal: float | None = None
    iva: float | None = None
    currency: str = "MXN"
    payment_method: str | None = None
    folio: str | None = None
    category: str = "otros"
    description: str | None = None
    invoice_status: str = "pendiente"
    cfdi_uuid: str | None = None
    invoice_portal: str | None = None
    invoice_fields: list[dict[str, str]] = field(default_factory=list)
    notes: str | None = None
    source: str = "foto"
    file_id: str | None = None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> Expense:
        data = dict(row)
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        data["expense_date"] = date.fromisoformat(data["expense_date"])
        data["invoice_fields"] = json.loads(data["invoice_fields"] or "[]")
        return cls(**data)


def _to_db(values: dict) -> dict:
    unknown = set(values) - set(_WRITABLE)
    if unknown:
        raise ValueError(f"Columnas desconocidas: {sorted(unknown)}")
    out = dict(values)
    if "expense_date" in out:
        out["expense_date"] = out["expense_date"].isoformat()
    if "invoice_fields" in out:
        out["invoice_fields"] = json.dumps(out["invoice_fields"] or [], ensure_ascii=False)
    if out.get("invoice_status", "pendiente") not in STATUSES:
        raise ValueError(f"Estado inválido: {out['invoice_status']}")
    return out


class Database:
    def __init__(self, path: Path | str):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(path))
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(_SCHEMA)

    def close(self) -> None:
        self._conn.close()

    def _select(
        self, where: str, params: tuple, order: str = "expense_date, id", limit: int = -1
    ) -> list[Expense]:
        rows = self._conn.execute(
            f"SELECT * FROM expenses WHERE {where} ORDER BY {order} LIMIT ?", (*params, limit)
        ).fetchall()
        return [Expense.from_row(r) for r in rows]

    def add(self, chat_id: int, created_at: datetime, **values) -> Expense:
        values = _to_db(values)
        columns = ["chat_id", "created_at", *values]
        placeholders = ", ".join("?" for _ in columns)
        with self._conn:
            cur = self._conn.execute(
                f"INSERT INTO expenses ({', '.join(columns)}) VALUES ({placeholders})",
                (chat_id, created_at.isoformat(), *values.values()),
            )
        return self.get(chat_id, cur.lastrowid)

    def get(self, chat_id: int, expense_id: int) -> Expense | None:
        found = self._select("chat_id = ? AND id = ?", (chat_id, expense_id))
        return found[0] if found else None

    def update(self, chat_id: int, expense_id: int, **values) -> Expense | None:
        values = _to_db(values)
        if values:
            assignments = ", ".join(f"{col} = ?" for col in values)
            with self._conn:
                self._conn.execute(
                    f"UPDATE expenses SET {assignments} WHERE chat_id = ? AND id = ?",
                    (*values.values(), chat_id, expense_id),
                )
        return self.get(chat_id, expense_id)

    def delete(self, chat_id: int, expense_id: int) -> bool:
        with self._conn:
            cur = self._conn.execute(
                "DELETE FROM expenses WHERE chat_id = ? AND id = ?", (chat_id, expense_id)
            )
        return cur.rowcount > 0

    def recent(self, chat_id: int, limit: int) -> list[Expense]:
        return self._select("chat_id = ?", (chat_id,), order="id DESC", limit=limit)

    def between(self, chat_id: int, start: date | None = None, end: date | None = None) -> list[Expense]:
        """Gastos con fecha en [start, end); sin límites, todos los del chat."""
        where, params = "chat_id = ?", [chat_id]
        if start is not None:
            where += " AND expense_date >= ?"
            params.append(start.isoformat())
        if end is not None:
            where += " AND expense_date < ?"
            params.append(end.isoformat())
        return self._select(where, tuple(params))

    def pending(self, chat_id: int) -> list[Expense]:
        return self._select("chat_id = ? AND invoice_status = 'pendiente'", (chat_id,))

    def find_by_uuid(self, chat_id: int, uuid: str) -> Expense | None:
        found = self._select("chat_id = ? AND upper(cfdi_uuid) = upper(?)", (chat_id, uuid))
        return found[0] if found else None

    def find_duplicate(
        self, chat_id: int, expense_date: date, total: float | None, folio: str | None
    ) -> Expense | None:
        """Otro gasto del mismo día y por el mismo total (y mismo folio, si ambos lo tienen)."""
        if total is None:
            return None
        for other in self._select(
            "chat_id = ? AND expense_date = ? AND total IS NOT NULL AND abs(total - ?) < 0.005",
            (chat_id, expense_date.isoformat(), total),
        ):
            if folio and other.folio and folio.strip() != other.folio.strip():
                continue
            return other
        return None

    def find_invoice_match(
        self, chat_id: int, rfc: str | None, total: float, invoice_date: date
    ) -> Expense | None:
        """El ticket pendiente que mejor corresponde a una factura (mismo total y RFC compatible)."""
        candidates = [
            e
            for e in self._select(
                "chat_id = ? AND invoice_status = 'pendiente' AND total IS NOT NULL"
                " AND abs(total - ?) <= ?",
                (chat_id, total, INVOICE_TOTAL_TOLERANCE),
            )
            if (not e.rfc or not rfc or e.rfc.upper() == rfc.upper())
            and invoice_date - timedelta(days=INVOICE_LOOKBACK_DAYS)
            <= e.expense_date
            <= invoice_date + timedelta(days=1)
        ]
        if not candidates:
            return None
        return min(
            candidates,
            key=lambda e: (
                0 if rfc and e.rfc and e.rfc.upper() == rfc.upper() else 1,
                abs(e.total - total),
                abs((invoice_date - e.expense_date).days),
            ),
        )
