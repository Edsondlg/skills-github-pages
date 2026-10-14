"""Ejecuta el journal en Siemens NX por lotes con run_journal (sin abrir la interfaz)."""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path
from typing import Any


def encontrar_run_journal() -> Path | None:
    """Busca run_journal en NX_RUN_JOURNAL, UGII_BASE_DIR\\NXBIN, UGII_ROOT_DIR o el PATH."""
    candidatos = []
    if os.environ.get("NX_RUN_JOURNAL"):
        candidatos.append(Path(os.environ["NX_RUN_JOURNAL"]))
    for var, sub in (("UGII_BASE_DIR", "NXBIN"), ("UGII_ROOT_DIR", "")):
        if os.environ.get(var):
            base = Path(os.environ[var]) / sub if sub else Path(os.environ[var])
            candidatos += [base / "run_journal.exe", base / "run_journal"]
    en_path = shutil.which("run_journal")
    if en_path:
        candidatos.append(Path(en_path))
    for c in candidatos:
        if c.is_file():
            return c
    return None


def ejecutar_journal(journal: str | os.PathLike, prt: str | os.PathLike, timeout_s: int = 900) -> dict[str, Any]:
    exe = encontrar_run_journal()
    if exe is None:
        return {
            "ejecutado": False,
            "mensaje": ("No encontré run_journal de NX. Defina UGII_BASE_DIR (p. ej. C:\\Program Files\\Siemens\\NX2306) "
                        "o NX_RUN_JOURNAL con la ruta a run_journal.exe. Mientras tanto, abra NX y reproduzca el journal "
                        "con Herramientas > Journal > Reproducir (Alt+F8)."),
            "journal": str(journal),
        }
    comando = [str(exe), str(journal), "-args", str(prt)]
    try:
        proc = subprocess.run(comando, capture_output=True, text=True, timeout=timeout_s)
    except subprocess.TimeoutExpired:
        return {"ejecutado": False, "mensaje": "NX no terminó en {} s.".format(timeout_s), "comando": comando}
    salida = (proc.stdout or "") + (proc.stderr or "")
    return {
        "ejecutado": proc.returncode == 0,
        "codigo_salida": proc.returncode,
        "comando": comando,
        "salida": salida[-4000:],
        "prt": str(prt),
    }
