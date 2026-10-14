# -*- coding: utf-8 -*-
# Journal NX Open (Python) generado por troquel-nx.
#
# Cómo usarlo:
#   * Interactivo: en NX, Herramientas > Journal > Reproducir (Alt+F8) y elija este archivo.
#   * Por lotes:   run_journal.exe este_archivo.py -args C:\ruta\salida\TROQUEL.prt
#
# Crea una pieza nueva con un cuerpo por componente de la carcasa (zapatas,
# paralelas, placas, postes, bujes...), cada uno con nombre, capa, color y
# atributos MATERIAL / DESCRIPCION. Compatible con Python 3.6+ (NX 12 en adelante).
#
# NO edite DESIGN_JSON a mano: regenere el journal con troquel-nx.

import json
import os
import sys

import NXOpen
import NXOpen.Features
import NXOpen.GeometricUtilities

DESIGN_JSON = "%%DESIGN_JSON%%"
DESIGN = json.loads(DESIGN_JSON)


def _fmt(valor):
    return ("%.4f" % float(valor)).rstrip("0").rstrip(".")


class Constructor(object):
    def __init__(self, session, part, log):
        self.session = session
        self.part = part
        self.log = log
        self.avisos = []

    # ------------------------------------------------------------------
    # Primitivas
    # ------------------------------------------------------------------
    def _boolean(self, builder, operacion, objetivo):
        tipos = NXOpen.GeometricUtilities.BooleanOperation.BooleanType
        if objetivo is None:
            builder.BooleanOption.Type = tipos.Create
            return
        builder.BooleanOption.Type = tipos.Subtract if operacion == "restar" else tipos.Unite
        builder.BooleanOption.SetTargetBodies([objetivo])

    def _expresion(self, expresion, valor):
        texto = _fmt(valor)
        try:
            expresion.RightHandSide = texto
        except Exception:
            expresion.SetFormula(texto)

    def bloque(self, p, operacion, objetivo):
        builder = self.part.Features.CreateBlockFeatureBuilder(NXOpen.Features.Feature.Null)
        try:
            builder.Type = NXOpen.Features.BlockFeatureBuilder.Types.OriginAndEdgeLengths
            self._boolean(builder, operacion, objetivo)
            origen = NXOpen.Point3d(float(p["x"]), float(p["y"]), float(p["z"]))
            builder.SetOriginAndLengths(origen, _fmt(p["dx"]), _fmt(p["dy"]), _fmt(p["dz"]))
            return builder.CommitFeature()
        finally:
            builder.Destroy()

    def cilindro(self, p, operacion, objetivo):
        builder = self.part.Features.CreateCylinderBuilder(NXOpen.Features.Feature.Null)
        try:
            builder.Type = NXOpen.Features.CylinderBuilder.Types.AxisDiameterAndHeight
            self._boolean(builder, operacion, objetivo)
            self._expresion(builder.Diameter, p["d"])
            self._expresion(builder.Height, p["h"])
            origen = NXOpen.Point3d(float(p["x"]), float(p["y"]), float(p["z"]))
            update = NXOpen.SmartObject.UpdateOption.WithinModeling
            direccion = self.part.Directions.CreateDirection(origen, NXOpen.Vector3d(0.0, 0.0, 1.0), update)
            eje = self.part.Axes.CreateAxis(NXOpen.Point.Null, direccion, update)
            eje.Point = self.part.Points.CreatePoint(origen)
            builder.Axis = eje
            return builder.CommitFeature()
        finally:
            builder.Destroy()

    def primitiva(self, p, operacion, objetivo):
        if p["tipo"] == "bloque":
            return self.bloque(p, operacion, objetivo)
        return self.cilindro(p, operacion, objetivo)

    # ------------------------------------------------------------------
    # Componentes
    # ------------------------------------------------------------------
    def componente(self, comp):
        cuerpo = None
        solidos = [p for p in comp["primitivas"] if p["op"] == "agregar"]
        huecos = [p for p in comp["primitivas"] if p["op"] == "restar"]
        for p in solidos + huecos:
            try:
                feature = self.primitiva(p, p["op"], cuerpo)
            except Exception as exc:
                if cuerpo is None:
                    raise
                self.avisos.append("{}: no se pudo aplicar '{}' ({})".format(comp["nombre"], p.get("nota", ""), exc))
                continue
            cuerpos = list(feature.GetBodies() or [])
            if cuerpos:
                cuerpo = cuerpos[0]
        if cuerpo is None:
            raise RuntimeError("No se creó el cuerpo de " + comp["nombre"])
        self._decorar(cuerpo, comp)
        return cuerpo

    def _decorar(self, cuerpo, comp):
        try:
            cuerpo.SetName(comp["nombre"])
        except Exception as exc:
            self.avisos.append("{}: nombre ({})".format(comp["nombre"], exc))
        try:
            mod = self.session.DisplayManager.NewDisplayModification()
            mod.ApplyToAllFaces = True
            mod.ApplyToOwningParts = False
            mod.NewColor = int(comp["color"])
            mod.NewLayer = int(comp["capa"])
            mod.Apply([cuerpo])
            mod.Dispose()
        except Exception as exc:
            self.avisos.append("{}: color/capa ({})".format(comp["nombre"], exc))
        for titulo, valor in (("MATERIAL", comp["material"]), ("DESCRIPCION", comp["descripcion"]),
                              ("MEDIDAS", comp["medidas"]), ("CATEGORIA", comp["categoria"])):
            try:
                cuerpo.SetUserAttribute(titulo, -1, valor, NXOpen.Update.Option.Now)
            except Exception:
                try:
                    cuerpo.SetAttribute(titulo, valor)
                except Exception as exc:
                    self.avisos.append("{}: atributo {} ({})".format(comp["nombre"], titulo, exc))


# ----------------------------------------------------------------------
# Pieza de salida
# ----------------------------------------------------------------------
def _carpeta_journal():
    try:
        return os.path.dirname(os.path.abspath(__file__))
    except NameError:
        if sys.argv and sys.argv[0]:
            return os.path.dirname(os.path.abspath(sys.argv[0]))
        return os.getcwd()


def _ruta_salida():
    argumentos = [a for a in sys.argv[1:] if a.strip()]
    if argumentos:
        ruta = argumentos[0]
    else:
        ruta = DESIGN.get("ruta_prt") or ""
        if not ruta or not os.path.isdir(os.path.dirname(ruta)):
            ruta = os.path.join(_carpeta_journal(), DESIGN["nombre"] + ".prt")
    base, ext = os.path.splitext(ruta)
    ext = ext or ".prt"
    candidata, n = base + ext, 2
    while os.path.exists(candidata):
        candidata = "{}_v{}{}".format(base, n, ext)
        n += 1
    return candidata


def _pieza_nueva(session, ruta):
    try:
        nuevo = session.Parts.FileNew()
        nuevo.TemplateFileName = "model-plain-1-mm-template.prt"
        nuevo.UseBlankTemplate = False
        nuevo.ApplicationName = "ModelTemplate"
        nuevo.Units = NXOpen.Part.Units.Millimeters
        nuevo.TemplatePresentationName = "Model"
        nuevo.NewFileName = ruta
        nuevo.MasterFileName = ""
        nuevo.MakeDisplayedPart = True
        nuevo.Commit()
        nuevo.Destroy()
        pieza = session.Parts.Work
        if pieza is not None:
            return pieza
    except Exception:
        pass
    return session.Parts.NewDisplay(ruta, NXOpen.Part.Units.Millimeters)


def main():
    session = NXOpen.Session.GetSession()
    lw = session.ListingWindow
    lw.Open()

    def log(texto):
        lw.WriteLine(texto)

    log("=== troquel-nx: {} ===".format(DESIGN["nombre"]))
    for linea in DESIGN.get("resumen", []):
        log("  " + linea)

    ruta = _ruta_salida()
    pieza = _pieza_nueva(session, ruta)
    session.SetUndoMark(NXOpen.Session.MarkVisibility.Visible, "Troquel " + DESIGN["nombre"])

    constructor = Constructor(session, pieza, log)
    creados = 0
    for comp in DESIGN["componentes"]:
        try:
            constructor.componente(comp)
            creados += 1
            log("  + {} ({})".format(comp["nombre"], comp["descripcion"]))
        except Exception as exc:
            constructor.avisos.append("{}: NO SE CREÓ ({})".format(comp["nombre"], exc))

    try:
        pieza.ModelingViews.WorkView.Orient(NXOpen.View.Canned.Isometric, NXOpen.View.ScaleAdjustment.Fit)
    except Exception:
        pass

    pieza.Save(NXOpen.BasePart.SaveComponents.TrueValue, NXOpen.BasePart.CloseAfterSave.FalseValue)
    log("Componentes creados: {} de {}".format(creados, len(DESIGN["componentes"])))
    for aviso in constructor.avisos:
        log("  AVISO: " + aviso)
    log("Guardado en: " + ruta)


if __name__ == "__main__":
    main()
