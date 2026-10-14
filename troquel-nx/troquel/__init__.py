"""troquel-nx: diseño de carcasas de troquel (die sets) con texto, Python, MCP y Siemens NX."""

from .design import DieDesign, build_design
from .nx_journal import generar_journal
from .preview import generar_svg
from .spec import DieSpec, SpecError
from .text_parser import interpretar

__all__ = ["DieSpec", "DieDesign", "SpecError", "build_design", "generar_journal", "generar_svg", "interpretar"]
__version__ = "0.1.0"
