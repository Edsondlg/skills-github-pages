import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def salida(tmp_path, monkeypatch):
    """Carpeta de salida temporal para los diseños guardados."""
    carpeta = tmp_path / "troqueles"
    monkeypatch.setenv("TROQUEL_OUTPUT_DIR", str(carpeta))
    return carpeta
