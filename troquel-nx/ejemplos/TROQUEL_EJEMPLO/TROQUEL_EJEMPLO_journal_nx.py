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

DESIGN_JSON = '{"nombre":"TROQUEL_EJEMPLO","ruta_prt":"","resumen":["nombre: TROQUEL_EJEMPLO","placa_matriz: 300 x 200 x 35 mm","zapatas: 420 x 380 mm (inferior 50 mm, superior 40 mm)","guiado: 4 postes \'cuatro\' \\u00d832 con bujes de bolas","altura_cerrada: 260 mm (sin paralelas 178.9 mm)","fuerza_corte: 342 kN (34.87 t)","componentes: 16","errores: 0","avisos: 0"],"componentes":[{"nombre":"PARALELA_DELANTERA","categoria":"paralela","descripcion":"Paralela 420 x 30 x 81.1","material":"Acero AISI 1045","medidas":"420 x 30 x 81.1","primitivas":[{"tipo":"bloque","op":"agregar","x":-210.0,"y":-190.0,"z":0.0,"dx":420.0,"dy":30.0,"dz":81.1,"nota":"paralela_delantera"}],"capa":40,"color":130},{"nombre":"PARALELA_TRASERA","categoria":"paralela","descripcion":"Paralela 420 x 30 x 81.1","material":"Acero AISI 1045","medidas":"420 x 30 x 81.1","primitivas":[{"tipo":"bloque","op":"agregar","x":-210.0,"y":160.0,"z":0.0,"dx":420.0,"dy":30.0,"dz":81.1,"nota":"paralela_trasera"}],"capa":40,"color":130},{"nombre":"ZAPATA_INFERIOR","categoria":"zapata","descripcion":"Zapata inferior 420 x 380 x 50","material":"Acero AISI 1045 (o hierro fundido) - rectificada","medidas":"420 x 380 x 50","primitivas":[{"tipo":"bloque","op":"agregar","x":-210.0,"y":-190.0,"z":81.1,"dx":420.0,"dy":380.0,"dz":50.0,"nota":"zapata inferior"},{"tipo":"cilindro","op":"restar","x":-120.0,"y":135.0,"z":80.1,"d":32.0,"h":52.0,"nota":"ajuste poste 1"},{"tipo":"cilindro","op":"restar","x":125.0,"y":135.0,"z":80.1,"d":32.0,"h":52.0,"nota":"ajuste poste 2"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-135.0,"z":80.1,"d":32.0,"h":52.0,"nota":"ajuste poste 3"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-135.0,"z":80.1,"d":32.0,"h":52.0,"nota":"ajuste poste 4"},{"tipo":"bloque","op":"restar","x":-211.0,"y":-106.0,"z":80.1,"dx":40.0,"dy":22.0,"dz":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-171.0,"y":-95.0,"z":80.1,"d":22.0,"h":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":-211.0,"y":84.0,"z":80.1,"dx":40.0,"dy":22.0,"dz":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-171.0,"y":95.0,"z":80.1,"d":22.0,"h":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":171.0,"y":-106.0,"z":80.1,"dx":40.0,"dy":22.0,"dz":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":171.0,"y":-95.0,"z":80.1,"d":22.0,"h":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":171.0,"y":84.0,"z":80.1,"dx":40.0,"dy":22.0,"dz":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":171.0,"y":95.0,"z":80.1,"d":22.0,"h":52.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":80.1,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":80.1,"d":11.0,"h":52.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":80.1,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":80.1,"d":11.0,"h":52.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":80.1,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":80.1,"d":11.0,"h":52.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":80.1,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":80.1,"d":11.0,"h":52.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-70.0,"y":75.0,"z":80.1,"d":10.0,"h":52.0,"nota":"pasador"},{"tipo":"cilindro","op":"restar","x":70.0,"y":-75.0,"z":80.1,"d":10.0,"h":52.0,"nota":"pasador"}],"capa":10,"color":130},{"nombre":"PLACA_MATRIZ","categoria":"placa_matriz","descripcion":"Placa matriz 300 x 200 x 35","material":"Acero D2 templado 58-60 HRC","medidas":"300 x 200 x 35","primitivas":[{"tipo":"bloque","op":"agregar","x":-150.0,"y":-100.0,"z":131.1,"dx":300.0,"dy":200.0,"dz":35.0,"nota":"placa_matriz"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":130.1,"d":8.5,"h":21.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":130.1,"d":8.5,"h":21.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":130.1,"d":8.5,"h":21.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":130.1,"d":8.5,"h":21.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":-70.0,"y":75.0,"z":130.1,"d":10.0,"h":37.0,"nota":"pasador"},{"tipo":"cilindro","op":"restar","x":70.0,"y":-75.0,"z":130.1,"d":10.0,"h":37.0,"nota":"pasador"}],"capa":20,"color":211},{"nombre":"POSTE_GUIA_1","categoria":"poste","descripcion":"Poste gu\\u00eda \\u00d832 x 165","material":"Acero 52100 templado 60 HRC - rectificado (cat\\u00e1logo)","medidas":"\\u00d832 x 165","primitivas":[{"tipo":"cilindro","op":"agregar","x":-120.0,"y":135.0,"z":81.1,"d":32.0,"h":165.0,"nota":"poste 1"}],"capa":30,"color":186},{"nombre":"POSTE_GUIA_2","categoria":"poste","descripcion":"Poste gu\\u00eda \\u00d832 x 165","material":"Acero 52100 templado 60 HRC - rectificado (cat\\u00e1logo)","medidas":"\\u00d832 x 165","primitivas":[{"tipo":"cilindro","op":"agregar","x":125.0,"y":135.0,"z":81.1,"d":32.0,"h":165.0,"nota":"poste 2"}],"capa":30,"color":186},{"nombre":"POSTE_GUIA_3","categoria":"poste","descripcion":"Poste gu\\u00eda \\u00d832 x 165","material":"Acero 52100 templado 60 HRC - rectificado (cat\\u00e1logo)","medidas":"\\u00d832 x 165","primitivas":[{"tipo":"cilindro","op":"agregar","x":125.0,"y":-135.0,"z":81.1,"d":32.0,"h":165.0,"nota":"poste 3"}],"capa":30,"color":186},{"nombre":"POSTE_GUIA_4","categoria":"poste","descripcion":"Poste gu\\u00eda \\u00d832 x 165","material":"Acero 52100 templado 60 HRC - rectificado (cat\\u00e1logo)","medidas":"\\u00d832 x 165","primitivas":[{"tipo":"cilindro","op":"agregar","x":-125.0,"y":-135.0,"z":81.1,"d":32.0,"h":165.0,"nota":"poste 4"}],"capa":30,"color":186},{"nombre":"PISADOR","categoria":"pisador","descripcion":"Pisador / placa expulsora 300 x 200 x 18","material":"Acero AISI 4140 pretemplado","medidas":"300 x 200 x 18","primitivas":[{"tipo":"bloque","op":"agregar","x":-150.0,"y":-100.0,"z":168.0,"dx":300.0,"dy":200.0,"dz":18.0,"nota":"pisador"}],"capa":22,"color":36},{"nombre":"PORTA_PUNZONES","categoria":"porta_punzones","descripcion":"Porta punzones 300 x 200 x 22","material":"Acero AISI 4140 pretemplado","medidas":"300 x 200 x 22","primitivas":[{"tipo":"bloque","op":"agregar","x":-150.0,"y":-100.0,"z":188.0,"dx":300.0,"dy":200.0,"dz":22.0,"nota":"porta_punzones"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":191.0,"d":8.5,"h":20.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":191.0,"d":8.5,"h":20.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":191.0,"d":8.5,"h":20.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":191.0,"d":8.5,"h":20.0,"nota":"rosca M10"},{"tipo":"cilindro","op":"restar","x":-70.0,"y":75.0,"z":187.0,"d":10.0,"h":24.0,"nota":"pasador"},{"tipo":"cilindro","op":"restar","x":70.0,"y":-75.0,"z":187.0,"d":10.0,"h":24.0,"nota":"pasador"}],"capa":23,"color":108},{"nombre":"RESPALDO_PUNZONES","categoria":"respaldo","descripcion":"Respaldo de punzones (sufridera) 300 x 200 x 10","material":"Acero A2 templado 54-56 HRC","medidas":"300 x 200 x 10","primitivas":[{"tipo":"bloque","op":"agregar","x":-150.0,"y":-100.0,"z":210.0,"dx":300.0,"dy":200.0,"dz":10.0,"nota":"respaldo_punzones"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":209.0,"d":11.0,"h":12.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":209.0,"d":11.0,"h":12.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":209.0,"d":11.0,"h":12.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":209.0,"d":11.0,"h":12.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-70.0,"y":75.0,"z":209.0,"d":10.0,"h":12.0,"nota":"pasador"},{"tipo":"cilindro","op":"restar","x":70.0,"y":-75.0,"z":209.0,"d":10.0,"h":12.0,"nota":"pasador"}],"capa":21,"color":103},{"nombre":"BUJE_GUIA_1","categoria":"buje","descripcion":"Buje gu\\u00eda de bolas \\u00d832 (ext. \\u00d850) x 90","material":"Buje de bolas con jaula (cat\\u00e1logo)","medidas":"\\u00d850/\\u00d832 x 90","primitivas":[{"tipo":"cilindro","op":"agregar","x":-120.0,"y":135.0,"z":170.0,"d":50.0,"h":90.0,"nota":"buje 1"},{"tipo":"cilindro","op":"restar","x":-120.0,"y":135.0,"z":169.0,"d":32.0,"h":92.0,"nota":"diametro interior"}],"capa":31,"color":78},{"nombre":"BUJE_GUIA_2","categoria":"buje","descripcion":"Buje gu\\u00eda de bolas \\u00d832 (ext. \\u00d850) x 90","material":"Buje de bolas con jaula (cat\\u00e1logo)","medidas":"\\u00d850/\\u00d832 x 90","primitivas":[{"tipo":"cilindro","op":"agregar","x":125.0,"y":135.0,"z":170.0,"d":50.0,"h":90.0,"nota":"buje 2"},{"tipo":"cilindro","op":"restar","x":125.0,"y":135.0,"z":169.0,"d":32.0,"h":92.0,"nota":"diametro interior"}],"capa":31,"color":78},{"nombre":"BUJE_GUIA_3","categoria":"buje","descripcion":"Buje gu\\u00eda de bolas \\u00d832 (ext. \\u00d850) x 90","material":"Buje de bolas con jaula (cat\\u00e1logo)","medidas":"\\u00d850/\\u00d832 x 90","primitivas":[{"tipo":"cilindro","op":"agregar","x":125.0,"y":-135.0,"z":170.0,"d":50.0,"h":90.0,"nota":"buje 3"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-135.0,"z":169.0,"d":32.0,"h":92.0,"nota":"diametro interior"}],"capa":31,"color":78},{"nombre":"BUJE_GUIA_4","categoria":"buje","descripcion":"Buje gu\\u00eda de bolas \\u00d832 (ext. \\u00d850) x 90","material":"Buje de bolas con jaula (cat\\u00e1logo)","medidas":"\\u00d850/\\u00d832 x 90","primitivas":[{"tipo":"cilindro","op":"agregar","x":-125.0,"y":-135.0,"z":170.0,"d":50.0,"h":90.0,"nota":"buje 4"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-135.0,"z":169.0,"d":32.0,"h":92.0,"nota":"diametro interior"}],"capa":31,"color":78},{"nombre":"ZAPATA_SUPERIOR","categoria":"zapata","descripcion":"Zapata superior 420 x 380 x 40","material":"Acero AISI 1045 (o hierro fundido) - rectificada","medidas":"420 x 380 x 40","primitivas":[{"tipo":"bloque","op":"agregar","x":-210.0,"y":-190.0,"z":220.0,"dx":420.0,"dy":380.0,"dz":40.0,"nota":"zapata superior"},{"tipo":"cilindro","op":"restar","x":-120.0,"y":135.0,"z":219.0,"d":50.0,"h":42.0,"nota":"ajuste buje 1"},{"tipo":"cilindro","op":"restar","x":125.0,"y":135.0,"z":219.0,"d":50.0,"h":42.0,"nota":"ajuste buje 2"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-135.0,"z":219.0,"d":50.0,"h":42.0,"nota":"ajuste buje 3"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-135.0,"z":219.0,"d":50.0,"h":42.0,"nota":"ajuste buje 4"},{"tipo":"bloque","op":"restar","x":-211.0,"y":-106.0,"z":219.0,"dx":40.0,"dy":22.0,"dz":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-171.0,"y":-95.0,"z":219.0,"d":22.0,"h":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":-211.0,"y":84.0,"z":219.0,"dx":40.0,"dy":22.0,"dz":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-171.0,"y":95.0,"z":219.0,"d":22.0,"h":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":171.0,"y":-106.0,"z":219.0,"dx":40.0,"dy":22.0,"dz":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":171.0,"y":-95.0,"z":219.0,"d":22.0,"h":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"bloque","op":"restar","x":171.0,"y":84.0,"z":219.0,"dx":40.0,"dy":22.0,"dz":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":171.0,"y":95.0,"z":219.0,"d":22.0,"h":42.0,"nota":"ranura de sujeci\\u00f3n"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":249.0,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":-75.0,"z":219.0,"d":11.0,"h":42.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":249.0,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":-75.0,"z":219.0,"d":11.0,"h":42.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":249.0,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":-125.0,"y":75.0,"z":219.0,"d":11.0,"h":42.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":249.0,"d":17.5,"h":12.0,"nota":"caja tornillo M10"},{"tipo":"cilindro","op":"restar","x":125.0,"y":75.0,"z":219.0,"d":11.0,"h":42.0,"nota":"paso tornillo M10"},{"tipo":"cilindro","op":"restar","x":-70.0,"y":75.0,"z":219.0,"d":10.0,"h":42.0,"nota":"pasador"},{"tipo":"cilindro","op":"restar","x":70.0,"y":-75.0,"z":219.0,"d":10.0,"h":42.0,"nota":"pasador"}],"capa":10,"color":130}]}'
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
