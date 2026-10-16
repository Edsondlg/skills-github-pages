"""Genera archivos STEP de tubos doblados con OpenCascade (OCP) para probar el lector.

Cada tubo se define con una "tortuga": tramos rectos y dobleces (CLR, ángulo, giro del plano).
Las superficies resultantes son analíticas (CYLINDRICAL_SURFACE, TOROIDAL_SURFACE, CONICAL_SURFACE,
PLANE), como las exporta un CAD comercial. Escribe además <nombre>.truth.json con la geometría real.

Uso: python make_fixtures.py <directorio_salida>
"""
import json, math, sys, os
from OCP.gp import gp_Pnt, gp_Dir, gp_Ax2, gp_Vec
from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeTorus, BRepPrimAPI_MakeCone
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse, BRepAlgoAPI_Cut
from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
from OCP.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCP.Interface import Interface_Static
from OCP.BRepOffsetAPI import BRepOffsetAPI_MakePipe
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeFace
from OCP.GC import GC_MakeArcOfCircle
from OCP.gp import gp_Circ
from OCP.BRepBuilderAPI import BRepBuilderAPI_NurbsConvert


def v(a): return gp_Vec(*a)
def add(a, b): return [a[i] + b[i] for i in range(3)]
def mul(a, k): return [x * k for x in a]
def cross(a, b): return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
def dot(a, b): return sum(a[i]*b[i] for i in range(3))
def norm(a):
    l = math.sqrt(dot(a, a)); return [x / l for x in a]
def rot(vec, k, ang):  # Rodrigues
    c, s = math.cos(ang), math.sin(ang)
    kxv = cross(k, vec); kdv = dot(k, vec)
    return [vec[i]*c + kxv[i]*s + k[i]*kdv*(1-c) for i in range(3)]


def build(defn):
    """defn: {OD, ops:[{S:len, rin:[[len, r0, r1],...]?} | {B:angleDeg, R:clr, rot:deg, rin:r}], rin: default inner radius}"""
    ro = defn['OD'] / 2
    pos, T, N = [0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]
    if 'start' in defn:
        pos = defn['start']['pos']; T = norm(defn['start']['T']); N = norm(defn['start']['N'])
    outer, inner = [], []
    truth = {'OD': defn['OD'], 'segments': [], 'wall': []}
    s = 0.0
    for op in defn['ops']:
        if 'S' in op:
            L = op['S']
            if L > 1e-9:
                outer.append(BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(*pos), gp_Dir(*T)), ro, L).Shape())
            pieces = op.get('rin', [[L, defn['rin'], defn['rin']]])
            assert abs(sum(p[0] for p in pieces) - L) < 1e-9, 'pieces must sum to L'
            p = pos[:]
            for (pl, r0, r1) in pieces:
                if pl > 1e-9:
                    ax = gp_Ax2(gp_Pnt(*p), gp_Dir(*T))
                    if abs(r0 - r1) < 1e-9:
                        inner.append(BRepPrimAPI_MakeCylinder(ax, r0, pl).Shape())
                    else:
                        inner.append(BRepPrimAPI_MakeCone(ax, r0, r1, pl).Shape())
                    truth['wall'].append({'s0': s, 's1': s + pl, 't0': ro - r0, 't1': ro - r1})
                p = add(p, mul(T, pl)); s += pl
            truth['segments'].append({'type': 'straight', 'length': L, 'p0': pos, 'p1': add(pos, mul(T, L))})
            pos = add(pos, mul(T, L))
        else:
            if 'rot' in op:
                N = rot(N, T, math.radians(op['rot']))
            A = math.radians(op['B']); R = op['R']
            center = add(pos, mul(N, R)); k = norm(cross(T, N)); xdir = mul(N, -1)
            rin = op.get('rin', defn['rin'])
            ax = gp_Ax2(gp_Pnt(*center), gp_Dir(*k), gp_Dir(*xdir))
            outer.append(BRepPrimAPI_MakeTorus(ax, R, ro, A).Shape())
            inner.append(BRepPrimAPI_MakeTorus(ax, R, rin, A).Shape())
            p0 = pos
            T2, N2 = rot(T, k, A), rot(N, k, A)
            pos = add(center, mul(N2, -R))
            truth['segments'].append({'type': 'bend', 'clr': R, 'angle': op['B'], 'p0': p0, 'p1': pos,
                                      'center': center, 'normal': k, 'rot': op.get('rot', 0)})
            truth['wall'].append({'s0': s, 's1': s + R * A, 't0': ro - rin, 't1': ro - rin})
            s += R * A
            T, N = T2, N2
    truth['totalLength'] = s
    return outer, inner, truth


def bend_inner_idx(defn):
    idx, i = set(), 0
    for op in defn['ops']:
        if 'S' in op:
            i += sum(1 for p in op.get('rin', [[op['S'], 0, 0]]) if p[0] > 1e-9)
        else:
            idx.add(i); i += 1
    return idx


def fuse(shapes):
    res = shapes[0]
    for sh in shapes[1:]:
        res = BRepAlgoAPI_Fuse(res, sh).Shape()
    return res


def write_step(shape, path, name):
    Interface_Static.SetCVal_s('write.step.schema', 'AP214')
    Interface_Static.SetCVal_s('write.step.unit', 'MM')
    Interface_Static.SetCVal_s('write.step.product.name', name)
    w = STEPControl_Writer()
    w.Transfer(shape, STEPControl_AsIs)
    assert w.Write(path) == 1, 'STEP write failed'


def make(defn, outdir, name, bspline_bends=False):
    outer, inner, truth = build(defn)
    if bspline_bends:  # dobleces exportados como B-spline (como hacen algunos CAD)
        conv = lambda sh: BRepBuilderAPI_NurbsConvert(sh, True).Shape()
        kinds = [seg['type'] for seg in truth['segments'] if not (seg['type'] == 'straight' and seg['length'] <= 1e-9)]
        outer = [conv(sh) if k == 'bend' else sh for sh, k in zip(outer, kinds)]
        inner = [conv(sh) if isinstance(sh, object) and i in bend_inner_idx(defn) else sh for i, sh in enumerate(inner)]
    solid = BRepAlgoAPI_Cut(fuse(outer), fuse(inner)).Shape()
    u = ShapeUpgrade_UnifySameDomain(solid, True, True, True); u.Build(); solid = u.Shape()
    write_step(solid, os.path.join(outdir, name + '.stp'), name)
    truth['name'] = name
    with open(os.path.join(outdir, name + '.truth.json'), 'w') as f:
        json.dump(truth, f, indent=1)


def make_pipe_sweep(defn, outdir, name):
    """Variante con BRepOffsetAPI_MakePipe: superficies no analíticas (extrusión/revolución/B-spline)."""
    ro = defn['OD'] / 2
    outer, inner, truth = build(defn)
    pos, T, N = [0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]
    wb = BRepBuilderAPI_MakeWire()
    for op in defn['ops']:
        if 'S' in op:
            L = op['S']
            if L > 1e-9:
                e = BRepBuilderAPI_MakeEdge(gp_Pnt(*pos), gp_Pnt(*add(pos, mul(T, L)))).Edge(); wb.Add(e)
            pos = add(pos, mul(T, L))
        else:
            if 'rot' in op: N = rot(N, T, math.radians(op['rot']))
            A = math.radians(op['B']); R = op['R']
            center = add(pos, mul(N, R)); k = norm(cross(T, N))
            circ = gp_Circ(gp_Ax2(gp_Pnt(*center), gp_Dir(*k), gp_Dir(*mul(N, -1))), R)
            T2, N2 = rot(T, k, A), rot(N, k, A)
            end = add(center, mul(N2, -R))
            arc = GC_MakeArcOfCircle(circ, gp_Pnt(*pos), gp_Pnt(*end), True).Value()
            wb.Add(BRepBuilderAPI_MakeEdge(arc).Edge())
            pos, T, N = end, T2, N2
    wire = wb.Wire()
    def ring(r):
        c = gp_Circ(gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(1, 0, 0)), r)
        return BRepBuilderAPI_MakeFace(BRepBuilderAPI_MakeWire(BRepBuilderAPI_MakeEdge(c).Edge()).Wire()).Face()
    so = BRepOffsetAPI_MakePipe(wire, ring(ro)).Shape()
    si = BRepOffsetAPI_MakePipe(wire, ring(defn['rin'])).Shape()
    solid = BRepAlgoAPI_Cut(so, si).Shape()
    write_step(solid, os.path.join(outdir, name + '.stp'), name)
    truth['name'] = name
    with open(os.path.join(outdir, name + '.truth.json'), 'w') as f:
        json.dump(truth, f, indent=1)


FIXTURES = {
    # Tubo estructural 3 dobleces en 3 planos, pared constante. OD 50.8 x 1.65, CLR 2D.
    'soporte_3d_hsla': {'OD': 50.8, 'rin': 25.4 - 1.65, 'ops': [
        {'S': 180}, {'B': 90, 'R': 101.6}, {'S': 220}, {'B': 45, 'R': 101.6, 'rot': 90},
        {'S': 160}, {'B': 60, 'R': 101.6, 'rot': -120}, {'S': 250}]},
    # Calibre variable (tubo con extremos reforzados y transiciones cónicas internas). OD 38.1.
    'travesano_calibre_variable': {'OD': 38.1, 'rin': 19.05 - 1.2, 'ops': [
        {'S': 200, 'rin': [[120, 19.05 - 2.4, 19.05 - 2.4], [30, 19.05 - 2.4, 19.05 - 1.2], [50, 19.05 - 1.2, 19.05 - 1.2]]},
        {'B': 75, 'R': 76.2},
        {'S': 300}, {'B': 75, 'R': 76.2, 'rot': 180},
        {'S': 210, 'rin': [[60, 19.05 - 1.2, 19.05 - 1.2], [30, 19.05 - 1.2, 19.05 - 2.4], [120, 19.05 - 2.4, 19.05 - 2.4]]}]},
    # Escape: 5 dobleces, dos CLR distintos (herramental apilado), OD 63.5 x 1.5.
    'escape_5_dobleces': {'OD': 63.5, 'rin': 31.75 - 1.5, 'ops': [
        {'S': 150}, {'B': 30, 'R': 95.25}, {'S': 120}, {'B': 90, 'R': 127, 'rot': 35},
        {'S': 200}, {'B': 50, 'R': 95.25, 'rot': -70}, {'S': 140}, {'B': 110, 'R': 127, 'rot': 160},
        {'S': 130}, {'B': 25, 'R': 95.25, 'rot': 90}, {'S': 180}]},
    # Horquilla 180° más un doblez fuera de plano; OD 25.4 x 1.2, CLR 2D.
    'horquilla_180': {'OD': 25.4, 'rin': 12.7 - 1.2, 'ops': [
        {'S': 300}, {'B': 180, 'R': 50.8}, {'S': 260}, {'B': 90, 'R': 50.8, 'rot': 90}, {'S': 120}]},
    # Dos dobleces consecutivos sin recta entre ellos (doblez compuesto).
    'doblez_compuesto': {'OD': 31.75, 'rin': 15.875 - 1.5, 'ops': [
        {'S': 160}, {'B': 45, 'R': 63.5}, {'S': 0}, {'B': 60, 'R': 63.5, 'rot': 90}, {'S': 200}]},
}
# Posición/orientación arbitraria en el espacio del CAD (no alineada a ejes)
FIXTURES['soporte_3d_hsla']['start'] = {'pos': [120.0, -35.0, 410.0], 'T': [0.6, 0.48, 0.64], 'N': [-0.8, 0.36, 0.48]}

if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, d in FIXTURES.items():
        make(d, out, name)
        print('ok', name)
    make(FIXTURES['soporte_3d_hsla'], out, 'soporte_3d_bspline', bspline_bends=True)
    print('ok soporte_3d_bspline')
    make_pipe_sweep(FIXTURES['horquilla_180'], out, 'horquilla_180_barrido')
    print('ok horquilla_180_barrido (pipe sweep)')
