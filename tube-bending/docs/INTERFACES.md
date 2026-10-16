# Tube bending simulator — module interfaces

Binding contract between modules. Code identifiers in English; every user-facing string
(labels, warnings, error messages) in Spanish (Mexico). Units at every API boundary: mm, N, MPa,
N·m, degrees, seconds, kg, USD. Pure-logic modules (everything outside `js/scene/` and `js/ui/`)
must import nothing from the DOM or three.js so they run under `node --test`.

```
STEP text ──parseStep──▶ parsed ──extractTube──▶ TubeModel ──lraFromTube──▶ LRA
TubeModel + LRA + material + machine ──planProcess──▶ plan (tools, layout, sequence)
plan + … ──analyzeBends──▶ analysis ──makeFieldSampler──▶ sampler
plan ──buildKinematics──▶ kin (stateAt, posesAt)
kin + sampler ──app glue──▶ viewer (dumb renderer)
```

## 1. TubeModel (`js/tube-extract.js`)

```js
{
  name: string,                 // PRODUCT name or file name
  units: 'mm',
  OD: number,                   // outer diameter
  segments: Segment[],          // ordered end A → end B; strictly alternating straight/bend,
                                // first and last are straights (length may be 0)
  wall: WallPiece[] | null,     // null when the STEP has no inner surface
  nominalWall: number|null,     // length-weighted median thickness
  minWall: number|null, maxWall: number|null,
  variableWall: boolean,        // maxWall - minWall > 0.02 mm
  totalLength: number,          // Σ straight.length + Σ bend.clr·rad(bend.angle)
  source: { format: 'STEP', schema, entityCount, lengthScale, surfaces: {cylinder, torus, cone, plane, bspline, other}, warnings: string[] }
}
Segment =
  { type: 'straight', length, p0: [x,y,z], p1: [x,y,z], dir: [x,y,z] }          // dir unit p0→p1 (tangent if length 0)
| { type: 'bend', clr, angle /*deg, (0,180]*/, p0, p1, center, normal, tIn, tOut, source: 'torus'|'inferred' }
  // normal: unit axis such that rotating tIn about normal by +angle (right-hand) gives tOut;
  // p0/p1 are the centerline tangent points; |p0-center| = |p1-center| = clr.
WallPiece = { s0, s1, t0, t1 }  // s = arc length from end A along the centerline; t linear in [s0,s1];
                                // pieces contiguous and cover [0, totalLength]
```

## 2. LRA (`js/geometry.js`)

```js
lraFromTube(tube, { front: 'A'|'B' }) → {
  front: 'A'|'B',
  bends: [{ L, R, A, clr }],   // L: straight before this bend (L of bend 0 = front-end straight)
                               // R: collet rotation before this bend, deg, right-hand about machine +X
                               //    (feed direction), normalized to (-180,180]; R of bend 0 = 0
                               // A: final bend angle (deg); clr: centerline radius
  tail: number                 // last straight (rear end)
}
bendExtradosAngles(lra) → number[]  // material angle (deg) of each bend's extrados, see §5
```

## 3. Machine frame (three.js world, Y up, mm)

- Tangent point at the origin. Feed direction +X. Tube axis on the X axis (y = 0, z = 0) behind the tangent.
- Bend plane XZ. Bend die center at (0, 0, −clr); the die rotates about +Y by θ ≥ 0 (three.js
  `rotation.y = θ`), so the bent tube swings toward −Z.
- Clamp die on +Z side ahead of the tangent (x ∈ [0, clampLength]); pressure die on +Z side behind
  the tangent (x ∈ [−length, 0]); wiper die on −Z side behind the tangent, tip at the tangent;
  mandrel inside the tube, nose at x = +mandrel.noseProjection; collet grips the rear end.
- Material angle φ (deg): measured about the feed direction +X (right-hand) from the material
  reference direction, which is machine +Y at load time (before any rotation). At cumulative collet
  rotation C (deg), material angle φ points to machine angle φ + C (0° = +Y, 90° = +Z).
  Extrados of the die is machine +Z (angle 90°), intrados −Z (270°).
- Local section frame of material station s: origin on the centerline, local +X = tangent toward
  the front end, material angle φ ↦ local point (0, r·cos φ, r·sin φ).

## 4. Material coordinate and layout (`plan.layout`, `js/process.js`)

s = 0 at the front end (the end bent first), increasing toward the rear. Bend i occupies
[s0_i, s1_i] with s1_i − s0_i = clr_i · rad(angleLoad_i) (material wrapped on the die).

```js
plan.layout = {
  cutLength,          // total cut length incl. scrap
  frontScrap,         // extra grip material ahead of the first straight (trimmed later), ≥ 0
  tailScrap,          // extra material behind the last straight for the collet, ≥ 0
  bends: [{ s0, s1 }],
  wallAt(s) → t,      // thickness at material station s (maps the TubeModel wall profile; stretches bend arcs by angleLoad/A)
  breakpoints: number[] // s values where the wall profile has kinks (mesh stations must include them)
}
```

## 5. Sequence (`plan.sequence`, produced by `planProcess`, consumed by kinematics)

```js
plan.sequence = { phases: Phase[], totalTime }
Phase = { type, bend /*index or -1*/, start /*s, cumulative*/, duration, label /*Spanish*/, params }
```
Phase types, in order per bend i (zero-duration phases may be omitted):

| type | params | effect |
|---|---|---|
| `load` | `{}` | (once, first) tube appears: drops in from +Y onto the axis; front end (s=0) at x = 0 |
| `stackChange` | `{ fromLevel, toLevel }` | bend head shifts vertically so stack `toLevel` groove is at y = 0 |
| `feed` | `{ distance }` | whole tube translates +X by `distance` (feed_i = s0_i − s1_{i−1}; feed_0 = s0_0) |
| `rotate` | `{ angle }` | whole tube rotates by `angle` deg right-hand about the X axis (= LRA R_i) |
| `clamp` | `{}` | clamp die and pressure die close |
| `bend` | `{ angleLoad, clr, boostPct }` | die rotates 0 → angleLoad; material wraps; rear pulled +X by clr·θ; pressure die travels with tube |
| `mandrelRetract` | `{ distance }` | mandrel moves −X by `distance` |
| `release` | `{ angleLoad, angleFinal }` | clamp & pressure die open; springback: bend relaxes angleLoad → angleFinal with radius clr·angleLoad/angleFinal, rear end and tangent fixed |
| `return` | `{ angle }` | die (with open clamp) rotates back angleLoad → 0; pressure die and mandrel return |
| `unload` | `{}` | (once, last) finished part lifts +Y |

Kinematic composition (pose M(s) of station s): at load M(s) = translate(−s, 0, 0); each phase
left-multiplies: feed d → T(d,0,0); rotate α → RotX(α); bend θ on [s0, s0+clr·θ] with
Rdie(φ) = T(0,0,−clr)·RotY(φ)·T(0,0,clr): s < s0 → Rdie(θ); s0 ≤ s ≤ s0+clr·θ (u = s−s0) →
Rdie(θ − u/clr)·T(u,0,0); s > s0+clr·θ → T(clr·θ,0,0). Release replaces (θ, clr) by
(θf, clr·θl/θf) with the same u-mapping.

## 6. Engineering outputs (`js/mechanics.js`)

```js
analyzeBends({ tube, lra, plan, material, options }) → analysis = {
  bends: [{
    index, clr, angle, angleLoad, springback, clrAfter, wall /*local t*/, wallMin, WF /*OD/t*/, BR /*clr/OD*/,
    strain: { extrados: {e1,e2,e3}, intrados: {e1,e2,e3} },   // true strains
    thinningPct, thickeningPct, ovalityPct, mandrelClearance,
    wrinkleIndex, collapseIndex, fldMargin, seamRelAngle,
    moment /*N·m*/, torque /*N·m*/, pressureDieForce, clampForce, mandrelForce, wiperForce, boostForce /*N*/,
    fldPoints: [{ phi /*deg from extrados*/, e1, e2, e3, zone }],
    status: 'ok'|'warning'|'fail', messages: string[]
  }],
  summary: { status, maxThinningPct, maxOvalityPct, maxWrinkleIndex, maxCollapseIndex, minFldMargin, maxTorque, messages: string[] }
}
makeFieldSampler({ tube, lra, plan, analysis, material, options }) → {
  at(s, phi) → { t0, t, thinningPct, e1, e2, e3, zone, dOut, dIn }
  // s: material station; phi: material angle (deg, §3); dOut/dIn: radial offsets (mm) of the outer and
  // inner surfaces from OD/2 and OD/2 − t0 once that station is fully formed (ovalization, thinning,
  // wrinkle ripples on the intrados when wrinkleIndex > 1, flattening when collapseIndex > 1).
}
FLD zones: 'crack' | 'risk' | 'safe' | 'thinning' | 'insufficient' | 'compression' | 'wrinkleTendency' | 'wrinkle'
```

## 7. Tooling (`plan.stacks`, `plan.mandrel`, `plan.collet`, `plan.bends`, `js/process.js`)

```js
planProcess({ tube, lra, material, machine, options }) → plan = {
  machine,                       // entry of MACHINES (js/machines.js)
  stacks: [{                     // one per distinct CLR, level 0 = bottom of the die stack
    level, clr, yOffset,         // yOffset: groove centre height above the stack base (mm)
    bendDie:     { clr, grooveR, outerR, hubR, height, clampLength },
    clampDie:    { length, height, width, serrated },
    pressureDie: { length, height, width },
    wiperDie:    { required, length, rake /*deg*/, tipOffset /*mm*/, thickness }
  }],
  mandrel: { type: 'none'|'plug'|'ball', diameter, balls, pitch, ballWidth, shankLength, noseProjection, rodLength, retract },
  collet:  { gripLength, OD },
  bends: [{ index, stack, angleLoad, springback, clrAfter, boostPct, bendSpeed, clampOK, notes: string[] }],
  layout,                        // §4
  sequence,                      // §5
  warnings: string[]
}
```

## 8. Viewer (`js/scene/viewer.js`) — a dumb renderer; app glue feeds it

```js
const viewer = await createViewer(containerEl, { quality: 'high'|'medium' })
viewer.setup({ OD, plan, material })                       // builds machine + tools sized from plan
viewer.buildTube({ s: Float64Array, ringSegments, seamAngle, sampleVertex: (s, phiDeg) => ({ rOut0, rIn0, dOut, dIn, fields: { t, thinningPct, e1, e2, zone } }) })
viewer.setFrame({ poses: Float32Array /*16·N column-major*/, formed: Float32Array /*N, 0..1*/, tools: ToolState })
viewer.setVisible(group, bool) // 'machine'|'bendDie'|'clampDie'|'pressureDie'|'wiperDie'|'mandrel'|'collet'|'tube'|'labels'|'floor'
viewer.setColorMode(mode)      // 'realistic'|'thickness'|'thinning'|'majorStrain'|'fld'
viewer.getLegend(mode) → { title, unit, stops: [{ value, color, label }] }
viewer.setCutaway(bool); viewer.setCamera(preset /*'iso'|'top'|'front'|'head'|'follow'*/)
viewer.setLabels([{ position: [x,y,z], text }]); viewer.setSectionMarker(s|null)
viewer.onPick(cb /*({ s, phi, point })*/); viewer.getMachineVolumes() → [{ name, min:[..], max:[..] }]
viewer.resize(); viewer.dispose()
ToolState = { dieAngle, clampOpen /*0 closed..1 open*/, pressureDieOpen, pressureDieTravel, mandrelOffset,
              carriageX, colletRotation, headY, activeStack, loadOffsetY }
```
Kinematics (`js/kinematics.js`): `buildKinematics({ lra, plan, OD })` → `{ stateAt(t) → ToolState & { phaseIndex, phase, progress, bendIndex, label }, posesAt(t, sArray, outPoses, outFormed), centerlineAt(t, sArray), interference(volumes, OD) → [{ phaseIndex, bend, volume, point }] }`.
