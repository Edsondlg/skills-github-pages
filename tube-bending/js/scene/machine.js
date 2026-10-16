// Machine body of a CNC rotary-draw bender, sized from OD and the die stacks:
//  · bed: long low welded cabinet (chamfered top, recessed louvered vent panels, angled foot pads), raised top
//    deck with two linear rails and a rack, mandrel-rod support bracket at the rear;
//  · carriage (moves with carriageX): saddle on rail blocks, orange gearbox, servo motor on a bracket, long
//    black rotary spindle ending in the collet nose (lifts with the tube during `load`);
//  · bend head (moves with headY / stack Z): yellow drum housing under the die stack, black turntable plate,
//    pressure-die assembly on +Z behind the tangent (black slide on two guides with red/green carriage blocks,
//    yellow side cover, boost cylinder, chrome tie rods), corrugated hoses hanging under the head;
//  · swing arm (rotates with the die, mounted into tools.dieGroup): yellow arm + clamp housing with the
//    clamp cylinder behind it and a black top plate from the die to the clamp block.
// World frame: Y up, tangent point at the origin, feed +X, tube axis on the X axis behind the tangent.
// The head group sits at (0, headY, −clr_active) — head-local frame of tools.js (die axis = local Y).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { chamferBox, boxAt, cylX, cylBetween, slabXZ, hull2, circlePts, corrugatedHose, mesh } from './shapes.js';
import { headPlacement } from './tools.js';

const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function chamferBoxAt(x0, x1, y0, y1, z0, z1, c) {
  const g = chamferBox(x1 - x0, y1 - y0, z1 - z0, c);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}
const merge = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));

/** Louvered vent: dark plate with angled slats on the face z = zFace, facing ±Z (dir). */
function ventGeometry(x0, x1, y0, y1, zFace, dir) {
  const parts = [boxAt(x1 - x0, y1 - y0, 2, (x0 + x1) / 2, (y0 + y1) / 2, zFace + dir * 1)];
  const pitch = 11, n = Math.max(1, Math.floor((y1 - y0 - 8) / pitch));
  for (let i = 0; i < n; i++) {
    const y = y0 + 4 + pitch * (i + 0.5);
    const s = new THREE.BoxGeometry(x1 - x0 - 8, 1.6, 8);
    s.rotateX(dir * 40 * DEG);
    s.translate((x0 + x1) / 2, y, zFace + dir * 3.5);
    parts.push(s);
  }
  return merge(parts);
}

/** Rectangular frame (w wide, t thick) on a face z = zFace, facing ±Z. */
function frameGeometry(x0, x1, y0, y1, zFace, dir, w = 6, t = 3) {
  const z = zFace + dir * t / 2;
  return merge([
    boxAt(x1 - x0 + 2 * w, w, t, (x0 + x1) / 2, y0 - w / 2, z),
    boxAt(x1 - x0 + 2 * w, w, t, (x0 + x1) / 2, y1 + w / 2, z),
    boxAt(w, y1 - y0, t, x0 - w / 2, (y0 + y1) / 2, z),
    boxAt(w, y1 - y0, t, x1 + w / 2, (y0 + y1) / 2, z),
  ]);
}

/** Servo motor along −X from x0 (flange) : square flange, round body, finned rear cap, connector. */
function servoGeometry(x0, len, r, y, z) {
  const body = [], fins = [], conn = [];
  body.push(chamferBoxAt(x0 - 0.12 * len, x0, y - 1.1 * r, y + 1.1 * r, z - 1.1 * r, z + 1.1 * r, 0.12 * r));
  body.push(cylX(r, x0 - 0.8 * len, x0 - 0.12 * len, y, z, 40));
  const nf = 9, fx0 = x0 - 0.8 * len, fx1 = x0 - len;
  for (let i = 0; i < nf; i++) {
    const x = fx0 + (fx1 - fx0) * (i + 0.5) / nf;
    fins.push(cylX(r * (i % 2 ? 0.86 : 1.04), x - (fx0 - fx1) / nf * 0.5, x + (fx0 - fx1) / nf * 0.5, y, z, 40));
  }
  fins.push(cylX(r * 0.7, fx1 - 0.03 * len, fx1, y, z, 32));
  conn.push(chamferBoxAt(x0 - 0.45 * len, x0 - 0.22 * len, y + 0.9 * r, y + 1.25 * r, z - 0.32 * r, z + 0.32 * r, 2));
  const c = new THREE.CylinderGeometry(0.2 * r, 0.2 * r, 0.35 * r, 20); c.translate(x0 - 0.335 * len, y + 1.42 * r, z);
  conn.push(c);
  return { body: merge(body), fins: merge(fins), conn: merge(conn) };
}

export function buildMachine({ OD, plan, layout: L, materials: M }) {
  const group = new THREE.Group(); group.name = 'machine';
  const vis = { machine: [], collet: [] };
  const add = (parent, m, key = 'machine') => { parent.add(m); vis[key].push(m); return m; };
  const cutLength = plan?.layout?.cutLength ?? 10 * OD;
  const yc = L.levels.map((l) => l.yc);
  const headYmin = -Math.max(...yc), headYmax = -Math.min(...yc);
  const clrMin = Math.min(...L.levels.map((l) => l.clr)), clrMax = L.clrMax;

  // ── key heights ──
  const housingTopLocal = L.yLo - L.armT - 1.5;
  const bedTopY = headYmin + housingTopLocal - (0.5 * OD + 60);
  const housingBottomLocal = bedTopY - headYmax - 8;

  // ── head (moves with headY / stack Z) ──
  const head = new THREE.Group(); head.name = 'head';
  group.add(head);
  const cl = L.clampLenMax;
  const Rdrum = L.Rd * 0.95;
  // Pressure-die assembly stations (head local, +Z behind the tangent).
  const pdLen = L.pdLenMax;
  const slideT = 0.3 * OD + 14, blockT = 0.16 * OD + 8, railT = 0.12 * OD + 6, plateT = 0.18 * OD + 8;
  const slideZ0 = L.pdZ0, slideZ1 = slideZ0 + slideT;
  const railZ1 = slideZ1 + blockT + railT, plateZ1 = railZ1 + plateT;
  const coverZ0 = plateZ1 + L.pdOpenStroke + 6, coverZ1 = coverZ0 + 0.5 * OD + 34;
  const pdX0 = -(pdLen * 1.25 + 20), pdX1 = -(0.12 * cl + 15);
  const pdYlo = L.yLo + 2, pdYhi = L.yHi - 2;
  const coverTop = L.yHi + 8;
  // Drum: the bend-axis housing under the die stack (static on the head: rotationally symmetric).
  const drum = new THREE.CylinderGeometry(Rdrum, Rdrum, housingTopLocal - 10 - housingBottomLocal, 96, 1);
  drum.translate(0, (housingTopLocal - 10 + housingBottomLocal) / 2, 0);
  const drumCap = new THREE.CylinderGeometry(Rdrum - 6, Rdrum, 10, 96, 1);
  drumCap.translate(0, housingTopLocal - 5, 0);
  add(head, mesh(merge([drum, drumCap]), M.paintYellow, { name: 'headHousing' }));
  const ring = new THREE.CylinderGeometry(Rdrum * 0.9, Rdrum * 0.9, 5, 96);
  ring.translate(0, housingTopLocal + 0.5 - 2.5, 0);
  add(head, mesh(ring, M.blackMachined, { name: 'turntable' }));
  // Yellow pressure-die pedestal joining the drum, below the slide.
  const pedFp = hull2([[pdX0, Rdrum * 0.45], [pdX0, coverZ1], [pdX1 + 30, coverZ1], [Rdrum * 0.55, Rdrum * 0.82], [0, Rdrum * 0.6]]);
  const pedTop = housingTopLocal - 10;
  add(head, mesh(slabXZ(pedFp, housingBottomLocal, pedTop - housingBottomLocal, 6), M.paintYellow, { name: 'pdPedestal' }));
  // Yellow side cover (static) behind the slide; black backplate with the two guide rails (moves with open).
  const coverGeo = chamferBoxAt(pdX0, pdX1, pedTop - 1, coverTop, coverZ0, coverZ1, 8);
  const pdCover = add(head, mesh(coverGeo, M.paintYellow, { name: 'pdHousing' }));
  const pdOpenParts = new THREE.Group(); pdOpenParts.name = 'pdOpenParts';
  const plate = chamferBoxAt(pdX0 + 8, pdX1 - 4, pedTop, pdYhi + 6, railZ1, plateZ1, 2);
  const yr = [pdYlo + 0.24 * (pdYhi - pdYlo), pdYlo + 0.76 * (pdYhi - pdYlo)];
  const rails = yr.map((y) => chamferBoxAt(pdX0 + 14, pdX1 - 10, y - 0.11 * OD - 5, y + 0.11 * OD + 5, railZ1 - railT, railZ1, 1));
  add(pdOpenParts, mesh(plate, M.blackMachined, { name: 'pdBackplate' }));
  add(pdOpenParts, mesh(merge(rails), M.steelDark, { name: 'pdRails' }));
  // Boost cylinder on top of the cover (grey body, chrome rod to a lug on the follower).
  const cylR = 0.28 * OD + 14, cylY = coverTop + cylR + 4, cylZ = (coverZ0 + coverZ1) / 2;
  const cylX0 = pdX0 + 10, cylX1 = pdX0 + 0.55 * (pdX1 - pdX0);
  const cylBody = merge([
    cylX(cylR, cylX0 + 18, cylX1 - 18, cylY, cylZ, 40),
    chamferBoxAt(cylX0, cylX0 + 22, cylY - cylR * 1.2, cylY + cylR * 1.2, cylZ - cylR * 1.2, cylZ + cylR * 1.2, 3),
    chamferBoxAt(cylX1 - 22, cylX1, cylY - cylR * 1.2, cylY + cylR * 1.2, cylZ - cylR * 1.2, cylZ + cylR * 1.2, 3),
  ]);
  add(head, mesh(cylBody, M.paintGreyDark, { name: 'pdCylinder' }));
  const tieR = Math.max(4, 0.07 * OD + 3);
  const tie = [];
  for (const dz of [-1, 1]) {
    const z = cylZ + dz * cylR * 0.95;
    tie.push(cylX(tieR * 0.8, cylX0 - 4, cylX1 + 4, cylY + cylR * 0.95, z, 12), cylX(tieR * 0.8, cylX0 - 4, cylX1 + 4, cylY - cylR * 0.95, z, 12));
  }
  // Two long tie rods: from the rear bracket diagonally down over the head to the front of the pedestal.
  const brX = pdX0 - 30, brTop = cylY + cylR + 30;
  for (const z of [coverZ0 + 12, coverZ1 - 12]) tie.push(cylBetween([brX, brTop - 14, z], [pdX1 + 10, pedTop + 6, z], tieR, 16));
  add(head, mesh(merge(tie), M.chrome, { name: 'tieRods' }));
  add(head, mesh(merge([
    chamferBoxAt(brX - 22, brX + 22, housingBottomLocal, brTop, coverZ0 - 4, coverZ1 + 4, 4),
    chamferBoxAt(pdX1 - 4, pdX1 + 28, pedTop - 2, pedTop + 18, coverZ0 - 4, coverZ1 + 4, 3),
  ]), M.blackMachined, { name: 'tieBrackets' }));
  const boostRod = mesh(new THREE.CylinderGeometry(0.45 * cylR, 0.45 * cylR, 1, 24).rotateZ(Math.PI / 2).translate(0.5, 0, 0), M.chrome, { name: 'pdBoostRod' });
  boostRod.position.set(cylX1, cylY, cylZ);
  add(pdOpenParts, boostRod);
  // Pressure-die follower (rides with open + travel): black slide, red/green carriage blocks, lug.
  const follower = new THREE.Group(); follower.name = 'pdFollower';
  add(follower, mesh(chamferBoxAt(-pdLen, 0, pdYlo, pdYhi, slideZ0, slideZ1, 2), M.blackMachined, { name: 'pdSlide' }));
  const blocks = { r: [], g: [] };
  const bl = Math.min(0.3 * pdLen, 1.1 * OD + 30);
  for (const [i, y] of yr.entries()) for (const x of [-0.8 * pdLen, -0.25 * pdLen]) {
    (i === 0 ? blocks.g : blocks.r).push(chamferBoxAt(x - bl / 2, x + bl / 2, y - 0.17 * OD - 8, y + 0.17 * OD + 8, slideZ1, slideZ1 + blockT, 1.5));
  }
  add(follower, mesh(merge(blocks.r), M.blockRed, { name: 'pdBlocksRed' }));
  add(follower, mesh(merge(blocks.g), M.blockGreen, { name: 'pdBlocksGreen' }));
  const lugX = -0.12 * pdLen;
  add(follower, mesh(merge([
    chamferBoxAt(lugX - 0.4 * OD - 8, lugX + 0.4 * OD + 8, pdYhi - 10, cylY + cylR * 0.9, slideZ0 + 4, cylZ + cylR * 0.8, 3),
  ]), M.blackMachined, { name: 'pdLug' }));
  // Hydraulic hoses hanging in loops from under the head into the head base front.
  const hoseR = Math.max(6, 0.1 * OD + 5);
  const hoses = [];
  const hy0 = housingBottomLocal + 70, drop = Math.max(160, 2.5 * OD + 100);
  for (const [k, zz] of [-0.45, -0.15, 0.2].entries()) {
    const z = zz * Rdrum, xa = Math.sqrt(Math.max(0, Rdrum * Rdrum - z * z)) - 4;
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xa - 10, hy0 + k * 18, z),
      new THREE.Vector3(xa + 60 + 25 * k, hy0 - 20, z + 10),
      new THREE.Vector3(xa + 85 + 25 * k, hy0 - drop * (0.75 + 0.15 * k), z + 25),
      new THREE.Vector3(xa + 40, hy0 - drop * (1.05 + 0.1 * k), z + 10),
      new THREE.Vector3(xa - 20, hy0 - drop * (0.8 + 0.1 * k), z - 10),
    ]);
    hoses.push(corrugatedHose(c, hoseR, { segments: 140, radial: 10 }));
  }
  add(head, mesh(merge(hoses), M.hose, { name: 'hoses' }));

  // Swing arm (rotates with the die; mounted into tools.dieGroup).
  const swing = new THREE.Group(); swing.name = 'swingArm';
  const armZ1 = L.clampHousingZ0 + L.clampHousingT;
  const armFp = hull2([...circlePts(0, 0, L.Rmax * 0.9, 48), [-0.1 * cl, armZ1], [cl * 1.04, armZ1], [cl * 1.04, 0]]);
  add(swing, mesh(slabXZ(armFp, L.yLo - L.armT, L.armT - 0.5, 3), M.paintYellow, { name: 'swingArmPlate' }));
  add(swing, mesh(chamferBoxAt(-0.04 * cl, cl * 1.04, L.yLo - L.armT + 1, L.yHi, L.clampHousingZ0, armZ1, 6), M.paintYellow, { name: 'clampHousing' }));
  // Black top plate spanning from the spindle to the clamp block.
  const topFp = hull2([...circlePts(0, 0, L.rSp * 2.3, 32), [0.1 * cl, L.clampHousingZ0 + 4], [cl * 0.95, L.clampHousingZ0 + 4], [cl * 0.95, armZ1 - 6], [0.1 * cl, armZ1 - 6]]);
  add(swing, mesh(slabXZ(topFp, L.yHi + 1, L.topT - 1, 2), M.blackMachined, { name: 'armTopPlate' }));
  // Clamp cylinder behind the clamp housing (grey body, black end cap).
  const ccR = Math.min((L.yHi - L.yLo) * 0.3, 0.2 * cl + 12), ccL = 0.9 * OD + 50, ccY = (L.yHi + L.yLo) / 2;
  const cc = new THREE.CylinderGeometry(ccR, ccR, ccL, 40).rotateX(Math.PI / 2).translate(cl / 2, ccY, armZ1 + ccL / 2);
  add(swing, mesh(cc, M.paintGreyDark, { name: 'clampCylinder' }));
  const ccCap = chamferBoxAt(cl / 2 - ccR * 1.15, cl / 2 + ccR * 1.15, ccY - ccR * 1.15, ccY + ccR * 1.15, armZ1 + ccL, armZ1 + ccL + 18, 3);
  add(swing, mesh(ccCap, M.blackMachined, { name: 'clampCylinderCap' }));
  const washer = new THREE.CylinderGeometry(L.rSp * 1.65, L.rSp * 1.65, L.topT + 2, 40);
  washer.translate(0, L.yHi + (L.topT + 2) / 2, 0);
  add(swing, mesh(washer, M.steel, { name: 'topWasher' }));

  // ── bed (static) ──
  const fpAll = [...circlePts(0, 0, Rdrum, 32), ...pedFp, [brX - 22, coverZ1 + 4]];
  const hx0 = Math.min(...fpAll.map((p) => p[0])), hx1 = Math.max(...fpAll.map((p) => p[0]));
  const hz0 = Math.min(...fpAll.map((p) => p[1])) - clrMax, hz1 = Math.max(...fpAll.map((p) => p[1])) - clrMin;
  const headBase = { x0: hx0 - 30, x1: hx1 + 30, z0: hz0 - 30, z1: hz1 + 30 };
  const spL = Math.max(2.4 * OD, 140), blockL = Math.max(220, 3 * OD);
  const carriageW = Math.max(200, 3 * OD);
  const rodRearX = -cutLength - spL - blockL - 90;
  const bedX0 = rodRearX - 110;
  const bedW = Math.max(carriageW + 160, 6.5 * OD);
  const bed = { x0: bedX0, x1: headBase.x0 + 40, z0: -bedW / 2, z1: bedW / 2 };
  const len = headBase.x1 - bed.x0;
  const deckH = 0.5 * OD + 30;
  const footH = 46;
  const totalH = clamp(len / 3.6, 560, 900);           // floor → deck top: long, low cabinet
  const floorY = bedTopY - totalH;
  const yb0 = floorY + footH, cabTop = bedTopY - deckH;
  const cab = new THREE.Group(); cab.name = 'bed';
  group.add(cab);
  const ch = 16;
  const bedMesh = add(cab, mesh(chamferBoxAt(bed.x0, bed.x1, yb0, cabTop, bed.z0, bed.z1, ch), M.paintGrey, { name: 'bedCabinet' }));
  const headBaseMesh = add(cab, mesh(chamferBoxAt(headBase.x0, headBase.x1, yb0, bedTopY, headBase.z0, headBase.z1, ch), M.paintGrey, { name: 'headBase' }));
  // Raised top deck with two linear rails and a rack.
  const dz = bedW / 2 - 34;
  const deckMesh = add(cab, mesh(chamferBoxAt(bed.x0 + 20, bed.x1 - 1, cabTop - 1, bedTopY, -dz, dz, 6), M.paintGrey, { name: 'deck' }));
  const railH = 18, railZ = carriageW * 0.34, railW = 20;
  const railGeo = [];
  for (const z of [-railZ, railZ]) railGeo.push(chamferBoxAt(bed.x0 + 40, bed.x1 - 6, bedTopY, bedTopY + railH, z - railW / 2, z + railW / 2, 1.2));
  add(cab, mesh(merge(railGeo), M.steelDark, { name: 'topRails' }));
  const rackZ = -railZ - railW / 2 - 26, teeth = [chamferBoxAt(bed.x0 + 40, bed.x1 - 6, bedTopY, bedTopY + 14, rackZ - 9, rackZ + 9, 1)];
  for (let x = bed.x0 + 46; x < bed.x1 - 10; x += 9) teeth.push(boxAt(4.2, 5, 18, x, bedTopY + 16, rackZ));
  add(cab, mesh(merge(teeth), M.steelDark, { name: 'rack', cast: false }));
  add(cab, mesh(boxAt(bed.x1 - bed.x0 - 60, 1.2, 2 * railZ - railW - 14, (bed.x0 + bed.x1) / 2, bedTopY + 0.6, 0), M.paintBlack, { name: 'railCover', cast: false }));
  // Recessed panels with dark louvered vents (two per long side) + one per side on the head base.
  const vents = [], frames = [], panels = [];
  const vy0 = yb0 + 0.24 * (cabTop - yb0), vy1 = cabTop - 0.22 * (cabTop - yb0);
  const span = bed.x1 - bed.x0;
  const vw = clamp(0.16 * span, 220, 520);
  const panel = (x0, x1, zf, dir) => {
    panels.push(boxAt(x1 - x0 + 40, vy1 - vy0 + 40, 2, (x0 + x1) / 2, (vy0 + vy1) / 2, zf + dir * 0.6));
    frames.push(frameGeometry(x0 - 20, x1 + 20, vy0 - 20, vy1 + 20, zf, dir, 7, 4));
    vents.push(ventGeometry(x0, x1, vy0, vy1, zf, dir));
  };
  for (const f of [0.3, 0.7]) {
    const cx = bed.x0 + span * f;
    for (const [zf, dir] of [[bed.z1, 1], [bed.z0, -1]]) panel(cx - vw / 2, cx + vw / 2, zf, dir);
  }
  {
    const cx = (headBase.x0 + headBase.x1) / 2, w = clamp(0.35 * (headBase.x1 - headBase.x0), 160, vw);
    panel(cx - w / 2, cx + w / 2, headBase.z1, 1);
    panel(cx - w / 2, cx + w / 2, headBase.z0, -1);
  }
  add(cab, mesh(merge(panels), M.paintGreyDark, { name: 'ventPanels', cast: false }));
  add(cab, mesh(merge(vents), M.vent, { name: 'vents', cast: false }));
  add(cab, mesh(merge(frames), M.paintGrey, { name: 'ventFrames', cast: false }));
  // Plinth shadow gap + angled heavy foot pads at the corners.
  add(cab, mesh(merge([
    chamferBoxAt(bed.x0 + 30, bed.x1, floorY + 8, yb0 + 4, bed.z0 + 24, bed.z1 - 24, 2),
    chamferBoxAt(headBase.x0 + 30, headBase.x1 - 30, floorY + 8, yb0 + 4, headBase.z0 + 24, headBase.z1 - 24, 2),
  ]), M.paintBlack, { name: 'plinth', cast: false }));
  const feet = [], pads = [];
  const foot = (x, z, sx, sz) => {
    const f = new THREE.CylinderGeometry(52, 78, footH - 8, 4, 1); f.rotateY(Math.PI / 4);
    f.translate(x, floorY + 8 + (footH - 8) / 2, z);
    feet.push(f, chamferBoxAt(x - 62, x + 62, yb0 - 10, yb0 + 2, z - 62, z + 62, 3));
    const p = new THREE.CylinderGeometry(70, 74, 8, 32); p.translate(x + sx * 4, floorY + 4, z + sz * 4);
    pads.push(p);
  };
  for (const [x0, x1, z0, z1] of [[bed.x0, bed.x1 - 60, bed.z0, bed.z1], [headBase.x0 + 60, headBase.x1, headBase.z0, headBase.z1]]) {
    for (const [x, sx] of [[x0 + 70, -1], [x1 - 70, 1]]) for (const [z, sz] of [[z0 + 70, -1], [z1 - 70, 1]]) foot(x, z, sx, sz);
  }
  add(cab, mesh(merge(feet), M.paintGreyDark, { name: 'feet' }));
  add(cab, mesh(merge(pads), M.rubber, { name: 'footPads' }));

  // Mandrel rod rear support bracket (black upright) with a steel rod clamp.
  const brW = Math.max(90, 1.8 * OD), rodTop = 0.6 * OD + 40;
  add(cab, mesh(merge([
    chamferBoxAt(rodRearX - 30, rodRearX + 30, bedTopY, rodTop, -brW / 2, brW / 2, 5),
    chamferBoxAt(rodRearX - 70, rodRearX + 70, bedTopY, bedTopY + 24, -brW / 2 - 30, brW / 2 + 30, 4),
  ]), M.paintBlack, { name: 'rodBracket' }));
  add(cab, mesh(cylX(Math.max(16, 0.32 * OD), rodRearX - 42, rodRearX + 42, 0, 0, 32), M.steel, { name: 'rodClamp' }));

  // ── carriage (moves with carriageX) ──
  const carriage = new THREE.Group(); carriage.name = 'carriage';
  group.add(carriage);
  const grip = plan?.collet?.gripLength ?? 1.5 * OD;
  const colletR = (plan?.collet?.OD ?? OD + 30) / 2;
  const spR = Math.max(colletR * 1.12, 0.8 * OD);
  const gbX0 = -spL - blockL, gbX1 = -spL;
  const saddleY0 = bedTopY + railH + 22, saddleY1 = saddleY0 + 26;
  const gbHalf = spR + 30, gbTop = spR + 0.25 * OD + 22;
  const carriageMesh = add(carriage, mesh(chamferBoxAt(gbX0 - 20, gbX1 + 10, saddleY0, saddleY1, -carriageW / 2, carriageW / 2, 4), M.paintBlack, { name: 'carriageSaddle' }));
  const rb = [];
  for (const z of [-railZ, railZ]) for (const x of [gbX0 + 30, gbX1 - 30]) rb.push(chamferBoxAt(x - 34, x + 34, bedTopY + railH - 8, saddleY0, z - railW / 2 - 12, z + railW / 2 + 12, 2));
  add(carriage, mesh(merge(rb), M.steelDark, { name: 'carriageBlocks' }));
  const gearbox = add(carriage, mesh(chamferBoxAt(gbX0, gbX1, saddleY1, gbTop, -gbHalf, gbHalf, 10), M.paintOrange, { name: 'gearbox' }));
  add(carriage, mesh(cylX(spR + 14, gbX1 - 2, gbX1 + 14, 0, 0, 48), M.blackMachined, { name: 'spindleFlange' }));
  // Rotation servo on a bracket on top of the gearbox, pointing back.
  const mr = Math.max(40, 0.6 * OD + 14), mLen = Math.max(220, 3 * OD + 40);
  const my = gbTop + 22 + 1.1 * mr, mx0 = gbX1 - 30;
  add(carriage, mesh(merge([
    chamferBoxAt(mx0 - 8, mx0 + 8, gbTop, my + 1.1 * mr, -1.1 * mr - 6, 1.1 * mr + 6, 2),
    chamferBoxAt(mx0 - 0.6 * mLen, mx0, gbTop, gbTop + 22, -0.8 * mr, 0.8 * mr, 3),
  ]), M.blackMachined, { name: 'motorBracket' }));
  const servo = servoGeometry(mx0 - 8, mLen, mr, my, 0);
  add(carriage, mesh(servo.body, M.paintBlack, { name: 'servoBody' }));
  add(carriage, mesh(servo.fins, M.blackMachined, { name: 'servoFins' }));
  add(carriage, mesh(servo.conn, M.steelDark, { name: 'servoConnector' }));
  // Rotating spindle + collet nose.
  const rot = new THREE.Group(); rot.name = 'colletRotation';
  carriage.add(rot);
  const tubeR = OD / 2;
  add(rot, mesh(cylX(spR * 0.82, gbX1 + 14, -0.3 * grip - 6, 0, 0, 48), M.paintBlack, { name: 'colletSpindle' }), 'collet');
  add(rot, mesh(cylX(spR, -0.3 * grip - 10, -0.3 * grip + 2, 0, 0, 48), M.blackMachined, { name: 'colletRing' }), 'collet');
  const nose = new THREE.Group(); nose.name = 'colletNose';
  rot.add(nose);
  const prof = [
    new THREE.Vector2(tubeR + 0.25, grip), new THREE.Vector2(tubeR + 0.25 + 0.12 * (colletR - tubeR), grip + 0.5),
    new THREE.Vector2(tubeR + 0.55 * (colletR - tubeR), grip), new THREE.Vector2(colletR, grip * 0.35),
    new THREE.Vector2(colletR, -0.3 * grip), new THREE.Vector2(tubeR + 0.25, -0.3 * grip), new THREE.Vector2(tubeR + 0.25, grip),
  ];
  const ng = new THREE.LatheGeometry(prof, 64); ng.rotateZ(-Math.PI / 2); // lathe Y → +X
  add(nose, mesh(ng, M.steel, { name: 'colletNoseBody' }), 'collet');
  const slits = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.BoxGeometry(grip * 0.85, 1.6, 0.7 * (colletR - tubeR));
    g.translate(grip * 0.55, 0, tubeR + 0.45 * (colletR - tubeR));
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(i * Math.PI / 2));
    slits.push(g);
  }
  add(nose, mesh(mergeGeometries(slits), M.blackMachined, { name: 'colletSlits', cast: false }), 'collet');

  // ── API ──
  let tools = null;
  function mountTools(t) {
    tools = t;
    head.add(t.dieGroup, t.pdOpen, t.staticTools);
    t.dieGroup.add(swing);
    t.pdOpen.add(pdOpenParts);
    t.pdTravel.add(follower);
  }

  let lastState = null;
  function update(st = {}) {
    lastState = st;
    const hp = headPlacement(L, st);
    head.position.set(0, hp.y, hp.z);
    carriage.position.set(Number.isFinite(st.carriageX) ? st.carriageX : -cutLength, 0, 0);
    rot.rotation.x = (st.colletRotation || 0) * DEG;
    // During `load` the tube is lowered into the machine: the collet nose rides up with it.
    const lift = Math.max(0, st.loadOffsetY || 0);
    nose.position.set(0, lift * Math.cos(rot.rotation.x), -lift * Math.sin(rot.rotation.x));
    const travel = st.pressureDieTravel || 0;
    boostRod.scale.x = Math.max(1, lugX + travel - cylX1);
    return hp;
  }

  const box = new THREE.Box3();
  function aabbOf(name, objs) {
    box.makeEmpty();
    for (const o of objs) { o.updateWorldMatrix(true, false); box.expandByObject(o); }
    return { name, min: box.min.toArray(), max: box.max.toArray() };
  }
  /** Static machine bodies only (no tooling), as tight world AABBs at the current machine state. */
  function volumes() {
    group.updateMatrixWorld(true);
    return [
      aabbOf('Bancada', [bedMesh, headBaseMesh, deckMesh]),
      aabbOf('Carro', [carriageMesh, gearbox]),
      aabbOf('Carcasa del cabezal', [head.getObjectByName('headHousing'), head.getObjectByName('pdPedestal')]),
      aabbOf('Carcasa del dado de presión', [pdCover]),
    ];
  }

  update({});
  return {
    group, head, carriage, vis, floorY, bedTopY, rodRearX, mountTools, update, volumes,
    bounds: { x0: bed.x0, x1: headBase.x1, z0: Math.min(bed.z0, headBase.z0), z1: Math.max(bed.z1, headBase.z1), y0: floorY },
    get state() { return lastState; },
    get tools() { return tools; },
  };
}
