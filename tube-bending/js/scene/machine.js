// Machine body: cabinet bed, bend-head housing (moves with headY), swing arm and clamp housing (rotate with
// the die), pressure-die slide, carriage with collet spindle, mandrel rod rear bracket.
// World frame: Y up, tangent point at the origin, feed +X, tube axis on the X axis behind the tangent.
// The head group sits at (0, headY, −clr_active) — head-local frame of tools.js (die axis = local Y).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { chamferBox, boxAt, cylX, slabXZ, hull2, circlePts, mesh } from './shapes.js';
import { headPlacement } from './tools.js';

const DEG = Math.PI / 180;

function chamferBoxAt(x0, x1, y0, y1, z0, z1, c) {
  const g = chamferBox(x1 - x0, y1 - y0, z1 - z0, c);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}

/** Louvered vent: dark recessed plate with angled slats on the face z = zFace, facing ±Z (dir). */
function ventGeometry(x0, x1, y0, y1, zFace, dir) {
  const parts = [boxAt(x1 - x0, y1 - y0, 2, (x0 + x1) / 2, (y0 + y1) / 2, zFace + dir * 1)];
  const pitch = 14, n = Math.max(1, Math.floor((y1 - y0 - 8) / pitch));
  for (let i = 0; i < n; i++) {
    const y = y0 + 4 + pitch * (i + 0.5);
    const s = new THREE.BoxGeometry(x1 - x0 - 10, 2.2, 9);
    s.rotateX(dir * 35 * DEG);
    s.translate((x0 + x1) / 2, y, zFace + dir * 4);
    parts.push(s);
  }
  return mergeGeometries(parts.map((g) => g.toNonIndexed()));
}

/** Rectangular panel outline (frame) slightly proud of a face. */
function frameGeometry(x0, x1, y0, y1, zFace, dir, w = 6) {
  return mergeGeometries([
    boxAt(x1 - x0 + 2 * w, w, 3, (x0 + x1) / 2, y0 - w / 2, zFace + dir * 1.5),
    boxAt(x1 - x0 + 2 * w, w, 3, (x0 + x1) / 2, y1 + w / 2, zFace + dir * 1.5),
    boxAt(w, y1 - y0, 3, x0 - w / 2, (y0 + y1) / 2, zFace + dir * 1.5),
    boxAt(w, y1 - y0, 3, x1 + w / 2, (y0 + y1) / 2, zFace + dir * 1.5),
  ]);
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
  const cabinetH = 820;
  const footH = 22;
  const floorY = bedTopY - cabinetH - footH;

  // ── head (moves with headY / stack Z) ──
  const head = new THREE.Group(); head.name = 'head';
  group.add(head);
  const cl = L.clampLenMax;
  const pdHousZ0 = L.pdZ0 + L.pdOpenStroke + 14, pdHousZ1 = pdHousZ0 + 0.8 * OD + 50;
  const pdHousX0 = -(L.pdLenMax * 1.25 + 20), pdHousX1 = -(0.12 * cl + 15);
  const housingBottomLocal = bedTopY - headYmax - 8;
  const fp = hull2([
    ...circlePts(0, 0, L.Rd, 48),
    [pdHousX0 - 10, -L.Rd * 0.75], [pdHousX0 - 10, pdHousZ1 + 10], [L.Rd * 0.5, pdHousZ1 + 10],
  ]);
  add(head, mesh(slabXZ(fp, housingBottomLocal, housingTopLocal - housingBottomLocal, 4), M.paintYellow, { name: 'headHousing' }));
  // Turntable ring under the swing arm.
  const tt = new THREE.CylinderGeometry(L.Rd * 0.92, L.Rd * 0.92, 5, 64);
  tt.translate(0, housingTopLocal + 0.2 - 2.5, 0);
  add(head, mesh(tt, M.blackMachined, { name: 'turntable' }));
  // Pressure-die slide housing (static on the head, +Z side behind the tangent).
  add(head, mesh(chamferBoxAt(pdHousX0, pdHousX1, housingTopLocal, L.yHi, pdHousZ0, pdHousZ1, 4), M.paintYellow, { name: 'pdHousing' }));
  add(head, mesh(chamferBoxAt(pdHousX0 + 12, pdHousX1 - 12, L.yLo + 6, L.yHi - 6, pdHousZ0 - 3, pdHousZ0 + 1, 1), M.blackMachined, { name: 'pdSlideFace' }));
  // Pressure-die follower (rides with the pressure die: open + travel).
  const follower = new THREE.Group(); follower.name = 'pdFollower';
  const pdLen = L.pdLenMax;
  add(follower, mesh(chamferBoxAt(-pdLen, 0, L.yLo + 2, L.yHi - 2, L.pdZ0, L.pdZ0 + 12, 1.5), M.blackMachined, { name: 'pdBacking' }));

  // Swing arm + clamp housing (rotate with the die; mounted into tools.dieGroup).
  const swing = new THREE.Group(); swing.name = 'swingArm';
  const armZ1 = L.clampHousingZ0 + L.clampHousingT;
  const armFp = hull2([...circlePts(0, 0, L.Rmax * 0.9, 48), [-0.1 * cl, armZ1], [cl * 1.04, armZ1], [cl * 1.04, 0]]);
  add(swing, mesh(slabXZ(armFp, L.yLo - L.armT, L.armT - 0.5, 2), M.paintYellow, { name: 'swingArmPlate' }));
  add(swing, mesh(chamferBoxAt(-0.04 * cl, cl * 1.04, L.yLo - L.armT + 1, L.yHi + 4, L.clampHousingZ0, armZ1, 5), M.paintYellow, { name: 'clampHousing' }));
  const capR = Math.min((L.yHi - L.yLo) * 0.32, 0.22 * cl + 10);
  const cap = new THREE.CylinderGeometry(capR, capR, 14, 40).rotateX(Math.PI / 2);
  cap.translate(cl / 2, (L.yHi + L.yLo) / 2, armZ1 + 7);
  add(swing, mesh(cap, M.blackMachined, { name: 'clampCylinderCap' }));
  const washer = new THREE.CylinderGeometry(L.rSp * 1.65, L.rSp * 1.65, L.topT + 2, 40);
  washer.translate(0, L.yHi + (L.topT + 2) / 2, 0);
  add(swing, mesh(washer, M.steel, { name: 'topWasher' }));

  // ── bed (static) ──
  const footprintPts = fp.map(([x, z]) => [x, z]);
  const hx0 = Math.min(...footprintPts.map((p) => p[0])), hx1 = Math.max(...footprintPts.map((p) => p[0]));
  const hz0 = Math.min(...footprintPts.map((p) => p[1])) - clrMax, hz1 = Math.max(...footprintPts.map((p) => p[1])) - clrMin;
  const headBase = { x0: hx0 - 30, x1: hx1 + 40, z0: hz0 - 30, z1: hz1 + 30 };
  const spL = Math.max(0.9 * OD, 60), blockL = Math.max(220, 3 * OD);
  const carriageW = Math.max(180, 2.8 * OD);
  const rodRearX = -cutLength - spL - blockL - 70;
  const bedX0 = rodRearX - 90;
  const bedW = Math.max(carriageW + 120, 6 * OD);
  const bed = { x0: bedX0, x1: headBase.x0 + 40, z0: -bedW / 2, z1: bedW / 2 };
  const yb0 = floorY + footH;
  const cab = new THREE.Group(); cab.name = 'bed';
  group.add(cab);
  const bedMesh = add(cab, mesh(chamferBoxAt(bed.x0, bed.x1, yb0, bedTopY, bed.z0, bed.z1, 10), M.paintGrey, { name: 'bedCabinet' }));
  const headBaseMesh = add(cab, mesh(chamferBoxAt(headBase.x0, headBase.x1, yb0, bedTopY, headBase.z0, headBase.z1, 10), M.paintGrey, { name: 'headBase' }));
  // Plinth bands.
  add(cab, mesh(mergeGeometries([
    chamferBoxAt(bed.x0 + 6, bed.x1 - 6, yb0, yb0 + 70, bed.z0 - 4, bed.z1 + 4, 3),
    chamferBoxAt(headBase.x0 + 6, headBase.x1 - 6, yb0, yb0 + 70, headBase.z0 - 4, headBase.z1 + 4, 3),
  ]), M.paintGreyDark, { name: 'plinth' }));
  // Louvered vents and panel frames on both long faces.
  const vents = [], frames = [];
  const vy0 = yb0 + 140, vy1 = bedTopY - 150;
  const span = bed.x1 - bed.x0 - 120;
  const nv = Math.max(1, Math.round(span / 700));
  const vw = Math.min(420, span / nv - 160);
  for (let i = 0; i < nv; i++) {
    const cx = bed.x0 + 60 + span * (i + 0.5) / nv;
    for (const [zf, dir] of [[bed.z1, 1], [bed.z0, -1]]) {
      vents.push(ventGeometry(cx - vw / 2, cx + vw / 2, vy0, vy1, zf, dir));
      frames.push(frameGeometry(cx - vw / 2, cx + vw / 2, vy0, vy1, zf, dir));
    }
  }
  {
    const cx = (headBase.x0 + headBase.x1) / 2, w = Math.min(360, (headBase.x1 - headBase.x0) - 160);
    vents.push(ventGeometry(cx - w / 2, cx + w / 2, vy0, vy1, headBase.z1, 1));
    frames.push(frameGeometry(cx - w / 2, cx + w / 2, vy0, vy1, headBase.z1, 1));
    vents.push(ventGeometry(cx - w / 2, cx + w / 2, vy0, vy1, headBase.z0, -1));
    frames.push(frameGeometry(cx - w / 2, cx + w / 2, vy0, vy1, headBase.z0, -1));
  }
  add(cab, mesh(mergeGeometries(vents), M.vent, { name: 'vents', cast: false }));
  add(cab, mesh(mergeGeometries(frames.map((g) => g.toNonIndexed())), M.paintGreyDark, { name: 'ventFrames', cast: false }));
  // Foot pads.
  const feet = [];
  for (const [x0, x1, z0, z1] of [[bed.x0, bed.x1, bed.z0, bed.z1], [headBase.x0, headBase.x1, headBase.z0, headBase.z1]]) {
    const nx = Math.max(2, Math.round((x1 - x0) / 1200) + 1);
    for (let i = 0; i < nx; i++) for (const z of [z0 + 45, z1 - 45]) {
      const x = x0 + 45 + (x1 - x0 - 90) * i / (nx - 1);
      const f = new THREE.CylinderGeometry(32, 40, footH, 24); f.translate(x, floorY + footH / 2, z);
      feet.push(f);
    }
  }
  add(cab, mesh(mergeGeometries(feet), M.rubber, { name: 'feet' }));
  // Top rails (carriage guide) and top cover strip.
  const railH = 16, railZ = carriageW * 0.36;
  const rails = [];
  for (const z of [-railZ, railZ]) rails.push(boxAt(bed.x1 - bed.x0 - 40, railH, 22, (bed.x0 + bed.x1) / 2, bedTopY + railH / 2, z));
  add(cab, mesh(mergeGeometries(rails), M.steel, { name: 'topRails' }));
  add(cab, mesh(boxAt(bed.x1 - bed.x0 - 40, 3, railZ * 2 - 40, (bed.x0 + bed.x1) / 2, bedTopY + 1.5, 0), M.paintBlack, { name: 'railCover', cast: false }));

  // Mandrel rod rear support bracket.
  const brW = Math.max(80, 1.6 * OD);
  const bracket = mergeGeometries([
    chamferBoxAt(rodRearX - 40, rodRearX + 40, bedTopY, 0.6 * OD + 20, -brW / 2, brW / 2, 4),
  ]);
  add(cab, mesh(bracket, M.paintGreyDark, { name: 'rodBracket' }));
  const clampBlk = cylX(Math.max(14, 0.3 * OD), rodRearX - 46, rodRearX + 46, 0, 0, 32);
  add(cab, mesh(clampBlk, M.blackMachined, { name: 'rodClamp' }));

  // ── carriage (moves with carriageX) ──
  const carriage = new THREE.Group(); carriage.name = 'carriage';
  group.add(carriage);
  const grip = plan?.collet?.gripLength ?? 1.5 * OD;
  const colletR = (plan?.collet?.OD ?? OD + 30) / 2;
  const spR = Math.max(colletR * 1.15, 0.8 * OD);
  const blkTop = spR + 0.25 * OD + 18;
  const carriageMesh = add(carriage, mesh(chamferBoxAt(-spL - blockL, -spL, bedTopY + railH, blkTop, -carriageW / 2, carriageW / 2, 8), M.paintGrey, { name: 'carriageBlock' }));
  add(carriage, mesh(mergeGeometries([
    chamferBoxAt(-spL - blockL + 20, -spL - 20, bedTopY + railH + 25, blkTop - 25, carriageW / 2 - 1, carriageW / 2 + 2, 1),
    chamferBoxAt(-spL - blockL + 20, -spL - 20, bedTopY + railH + 25, blkTop - 25, -carriageW / 2 - 2, -carriageW / 2 + 1, 1),
  ]), M.paintGreyDark, { name: 'carriageCover' }));
  add(carriage, mesh(chamferBoxAt(-spL - blockL - 10, -spL + 10, bedTopY + railH - 2, bedTopY + railH + 18, -carriageW / 2 - 8, carriageW / 2 + 8, 2), M.paintBlack, { name: 'carriageShoes' }));
  // Rotating collet spindle.
  const rot = new THREE.Group(); rot.name = 'colletRotation';
  carriage.add(rot);
  const tubeR = OD / 2;
  add(rot, mesh(cylX(spR, -spL - blockL * 0.15, -0.3 * grip, 0, 0, 48), M.blackMachined, { name: 'colletSpindle' }), 'collet');
  // Collet nose: hollow, tapered toward +X, grips the tube over [0, grip].
  const nose = [
    new THREE.Vector2(tubeR + 0.25, grip), new THREE.Vector2(tubeR + 0.25 + 0.12 * (colletR - tubeR), grip + 0.5),
    new THREE.Vector2(tubeR + 0.55 * (colletR - tubeR), grip), new THREE.Vector2(colletR, grip * 0.35),
    new THREE.Vector2(colletR, -0.3 * grip), new THREE.Vector2(tubeR + 0.25, -0.3 * grip), new THREE.Vector2(tubeR + 0.25, grip),
  ];
  const ng = new THREE.LatheGeometry(nose, 64); ng.rotateZ(-Math.PI / 2); // lathe Y → +X
  add(rot, mesh(ng, M.steel, { name: 'colletNose' }), 'collet');
  const slits = [];
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    const g = new THREE.BoxGeometry(grip * 0.85, 1.6, 0.7 * (colletR - tubeR));
    g.translate(grip * 0.55, 0, 0);
    const rr = tubeR + 0.45 * (colletR - tubeR);
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(a).multiply(new THREE.Matrix4().makeTranslation(0, rr * 0, rr)));
    slits.push(g);
  }
  add(rot, mesh(mergeGeometries(slits), M.blackMachined, { name: 'colletSlits', cast: false }), 'collet');

  // ── API ──
  let tools = null;
  function mountTools(t) {
    tools = t;
    head.add(t.dieGroup, t.pdOpen, t.staticTools);
    t.dieGroup.add(swing);
    t.pdTravel.add(follower);
  }

  let lastState = null;
  function update(st = {}) {
    lastState = st;
    const hp = headPlacement(L, st);
    head.position.set(0, hp.y, hp.z);
    carriage.position.set(Number.isFinite(st.carriageX) ? st.carriageX : -cutLength, 0, 0);
    rot.rotation.x = (st.colletRotation || 0) * DEG;
    return hp;
  }

  const box = new THREE.Box3();
  function aabb(name, obj) {
    obj.updateWorldMatrix(true, false);
    box.setFromObject(obj);
    return { name, min: box.min.toArray(), max: box.max.toArray() };
  }
  /** AABBs of the bed, the carriage block (at its current position) and the head body (current headY). */
  function volumes() {
    group.updateMatrixWorld(true);
    const b = aabb('bed', bedMesh), hb = aabb('headBase', headBaseMesh);
    const bedV = { name: 'bed', min: b.min.map((v, i) => Math.min(v, hb.min[i])), max: b.max.map((v, i) => Math.max(v, hb.max[i])) };
    const headV = aabb('headBody', head.getObjectByName('headHousing'));
    const pdV = aabb('pdHousing', head.getObjectByName('pdHousing'));
    headV.min = headV.min.map((v, i) => Math.min(v, pdV.min[i]));
    headV.max = headV.max.map((v, i) => Math.max(v, pdV.max[i]));
    return [bedV, aabb('carriage', carriageMesh), headV];
  }

  update({});
  return {
    group, head, carriage, vis, floorY, bedTopY, rodRearX, mountTools, update, volumes,
    bounds: { x0: bed.x0, x1: headBase.x1, z0: Math.min(bed.z0, headBase.z0), z1: Math.max(bed.z1, headBase.z1), y0: floorY },
    get state() { return lastState; },
    get tools() { return tools; },
  };
}
