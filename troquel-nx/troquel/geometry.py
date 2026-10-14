"""Primitivas sólidas simples (bloques y cilindros verticales) y componentes.

Cada componente del troquel es un cuerpo: la primera primitiva "agregar" crea el
cuerpo, las demás "agregar" se unen y las "restar" son barrenos, cajas y ranuras.
Este mismo modelo lo consumen el journal de NX, la vista previa SVG y la
verificación de interferencias.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Union

AGREGAR = "agregar"
RESTAR = "restar"


@dataclass
class Bloque:
    """Prisma alineado a los ejes; (x, y, z) es la esquina mínima."""

    x: float
    y: float
    z: float
    dx: float
    dy: float
    dz: float
    op: str = AGREGAR
    nota: str = ""

    tipo = "bloque"

    def bbox(self) -> tuple[float, float, float, float, float, float]:
        return (self.x, self.y, self.z, self.x + self.dx, self.y + self.dy, self.z + self.dz)

    def contiene(self, px: float, py: float, pz: float, margen: float = 0.0) -> bool:
        """Punto dentro del bloque; ``margen`` > 0 lo agranda, < 0 lo encoge."""
        return (
            self.x - margen < px < self.x + self.dx + margen
            and self.y - margen < py < self.y + self.dy + margen
            and self.z - margen < pz < self.z + self.dz + margen
        )

    def to_dict(self) -> dict[str, Any]:
        return {"tipo": "bloque", "op": self.op, "x": _r(self.x), "y": _r(self.y), "z": _r(self.z),
                "dx": _r(self.dx), "dy": _r(self.dy), "dz": _r(self.dz), "nota": self.nota}


@dataclass
class Cilindro:
    """Cilindro con eje +Z; (x, y, z) es el centro de la base inferior."""

    x: float
    y: float
    z: float
    d: float
    h: float
    op: str = AGREGAR
    nota: str = ""

    tipo = "cilindro"

    def bbox(self) -> tuple[float, float, float, float, float, float]:
        r = self.d / 2.0
        return (self.x - r, self.y - r, self.z, self.x + r, self.y + r, self.z + self.h)

    def contiene(self, px: float, py: float, pz: float, margen: float = 0.0) -> bool:
        r = self.d / 2.0 + margen
        if r <= 0:
            return False
        return (self.z - margen < pz < self.z + self.h + margen
                and (px - self.x) ** 2 + (py - self.y) ** 2 < r * r)

    def to_dict(self) -> dict[str, Any]:
        return {"tipo": "cilindro", "op": self.op, "x": _r(self.x), "y": _r(self.y), "z": _r(self.z),
                "d": _r(self.d), "h": _r(self.h), "nota": self.nota}


Primitiva = Union[Bloque, Cilindro]


@dataclass
class Componente:
    nombre: str
    categoria: str
    descripcion: str
    material: str
    medidas: str
    primitivas: list[Primitiva] = field(default_factory=list)

    def agregar(self, p: Primitiva) -> Primitiva:
        p.op = AGREGAR
        self.primitivas.append(p)
        return p

    def restar(self, p: Primitiva) -> Primitiva:
        p.op = RESTAR
        self.primitivas.append(p)
        return p

    @property
    def solidos(self) -> list[Primitiva]:
        return [p for p in self.primitivas if p.op == AGREGAR]

    @property
    def huecos(self) -> list[Primitiva]:
        return [p for p in self.primitivas if p.op == RESTAR]

    def bbox(self) -> tuple[float, float, float, float, float, float]:
        cajas = [p.bbox() for p in self.solidos]
        return (min(c[0] for c in cajas), min(c[1] for c in cajas), min(c[2] for c in cajas),
                max(c[3] for c in cajas), max(c[4] for c in cajas), max(c[5] for c in cajas))

    def contiene(self, px: float, py: float, pz: float, eps: float = 0.01) -> bool:
        """Punto estrictamente dentro del material (las caras en contacto no cuentan)."""
        if not any(p.contiene(px, py, pz, -eps) for p in self.solidos):
            return False
        return not any(p.contiene(px, py, pz, eps) for p in self.huecos)

    def to_dict(self) -> dict[str, Any]:
        return {
            "nombre": self.nombre,
            "categoria": self.categoria,
            "descripcion": self.descripcion,
            "material": self.material,
            "medidas": self.medidas,
            "primitivas": [p.to_dict() for p in self.primitivas],
        }


def primitiva_desde_dict(data: dict[str, Any]) -> Primitiva:
    if data["tipo"] == "bloque":
        return Bloque(data["x"], data["y"], data["z"], data["dx"], data["dy"], data["dz"],
                      data.get("op", AGREGAR), data.get("nota", ""))
    return Cilindro(data["x"], data["y"], data["z"], data["d"], data["h"],
                    data.get("op", AGREGAR), data.get("nota", ""))


def cajas_se_traslapan(a: tuple, b: tuple, minimo: float = 1e-6) -> bool:
    """True si dos cajas alineadas comparten un volumen con espesor > ``minimo`` en cada eje."""
    return all(min(a[i + 3], b[i + 3]) - max(a[i], b[i]) > minimo for i in range(3))


def _r(v: float) -> float:
    return round(float(v), 4)
