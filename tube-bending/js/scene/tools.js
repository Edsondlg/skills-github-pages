// Bend tooling: die stack (bend dies + clamp inserts), clamp dies, pressure dies, wiper dies and mandrel.
// Head-local frame: die axis = local Y axis; stack level i has its groove centre at y = yOffset_i and its
// tube axis (die angle 0) along the line (y = yOffset_i, z = clr_i). The head group is placed at
// (0, headY, headZ) so the active level's groove sits on the world tube axis.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sweepSection, groovedBlockEdges, mesh, cylX } from './shapes.js';

const DEG = Math.PI / 180;
const num = (v, d) => (Number.isFinite(v) && v > 0 ? v : d);

/** Normalises the plan into a head layout with every dimension the scene needs. */
export function computeHeadLayout(OD, plan) {
  const stacks = (plan?.stacks?.length ? plan.stacks : [{ level: 0, clr: 2 * OD, yOffset: 0.75 * OD }]);
  const levels = stacks.map((st, i) => {
    const bd = st.bendDie || {};
    const clr = num(st.clr ?? bd.clr, 2 * OD);
    const gR = Math.max(num(bd.grooveR, OD / 2 * 1.02), OD / 2 * 1.006);
    const h = num(bd.height, 1.5 * OD);
    const outerR = num(bd.outerR, clr + 0.3 * OD);
    const cd = st.clampDie || {}, pd = st.pressureDie || {}, wd = st.wiperDie || {};
    return {
      level: st.level ?? i, clr, yc: Number.isFinite(st.yOffset) ? st.yOffset : h / 2 + i * h, h, gR, outerR,
      hubR: num(bd.hubR, Math.min(clr * 0.45, clr - gR - 10)),
      clampLength: num(bd.clampLength, 3 * OD),
      clamp: { len: num(cd.length, num(bd.clampLength, 3 * OD)), h: num(cd.height, h), w: num(cd.width, OD), serrated: !!cd.serrated },
      pd: { len: num(pd.length, 5 * OD), h: num(pd.height, h), w: num(pd.width, OD) },
      wiper: { required: wd.required !== false && st.wiperDie != null, len: num(wd.length, 3 * OD), rake: Number.isFinite(wd.rake) ? wd.rake : 1,
        tipOffset: Number.isFinite(wd.tipOffset) ? wd.tipOffset : 0.5, th: Math.max(num(wd.thickness, 0.25 * OD), 0.2 * OD) },
    };
  });
  const yLo = Math.min(...levels.map((l) => l.yc - l.h / 2));
  const yHi = Math.max(...levels.map((l) => l.yc + l.h / 2));
  const Rmax = Math.max(...levels.map((l) => Math.max(l.outerR, l.clr + l.gR * 0.2)));
  const clrMax = Math.max(...levels.map((l) => l.clr));
  const minClear = Math.min(...levels.map((l) => l.clr - l.gR));
  const rSp = Math.max(6, Math.min(0.35 * OD + 10, 0.6 * minClear));
  const clampGap = 0.4, pdGap = 0.4;
  const clampStroke = 0.6 * OD;
  const zClampBack = Math.max(...levels.map((l) => l.clr + clampGap + l.clamp.w));
  const clampLenMax = Math.max(...levels.map((l) => l.clamp.len));
  const pdZ0 = Math.max(...levels.map((l) => l.clr + pdGap + l.pd.w));
  const pdLenMax = Math.max(...levels.map((l) => l.pd.len));
  const Rd = Rmax * 1.1 + 12;
  return {
    OD, levels, yLo, yHi, Rmax, clrMax, rSp, clampGap, pdGap, clampStroke, zClampBack, clampLenMax, pdZ0, pdLenMax,
    Rd, armT: 0.2 * OD + 12, topT: 0.22 * OD + 10, pdOpenStroke: 0.4 * OD,
    clampHousingZ0: zClampBack + 12 + clampStroke + 6, clampHousingT: 0.8 * OD + 40,
  };
}

/** Head translation for a given headY (interpolates Z between stack levels during stack changes). */
export function headPlacement(L, tools) {
  const lv = L.levels.slice().sort((a, b) => b.yc - a.yc); // headY = −yc ascending
  let headY = tools?.headY;
  const active = L.levels.find((l) => l.level === tools?.activeStack) || L.levels[0];
  if (!Number.isFinite(headY)) headY = -active.yc;
  if (lv.length === 1) return { y: headY, z: -lv[0].clr, clr: lv[0].clr };
  const ys = lv.map((l) => -l.yc);
  let z;
  if (headY <= ys[0]) z = -lv[0].clr;
  else if (headY >= ys[ys.length - 1]) z = -lv[lv.length - 1].clr;
  else {
    for (let i = 0; i < ys.length - 1; i++) {
      if (headY >= ys[i] && headY <= ys[i + 1]) {
        const f = (headY - ys[i]) / (ys[i + 1] - ys[i] || 1);
        z = -(lv[i].clr + (lv[i + 1].clr - lv[i].clr) * f);
        break;
      }
    }
  }
  return { y: headY, z, clr: -z };
}

// Die profile radius at height y (head local) for level l: groove bottom inside the groove, rim outside.
function dieRadiusAt(l, y) {
  const dy = y - l.yc;
  if (Math.abs(dy) < l.gR) return Math.min(l.outerR, l.clr - Math.sqrt(l.gR * l.gR - dy * dy));
  return l.outerR;
}

function bendDieGeometry(l, rSp) {
  const yb = l.yc - l.h / 2, yt = l.yc + l.h / 2, R = l.outerR, c = Math.min(2, l.h * 0.03);
  const V = (r, y) => new THREE.Vector2(r, y);
  const parts = [];
  const seg = 96;
  parts.push([V(rSp, yb), V(R - c, yb)], [V(R - c, yb), V(R, yb + c)]);
  if (R > l.clr) {
    parts.push([V(R, yb + c), V(R, l.yc - l.gR)], [V(R, l.yc - l.gR), V(l.clr, l.yc - l.gR)]);
    const arc = [];
    for (let i = 0; i <= 32; i++) { const b = -Math.PI / 2 + Math.PI * i / 32; arc.push(V(l.clr - l.gR * Math.cos(b), l.yc + l.gR * Math.sin(b))); }
    parts.push(arc, [V(l.clr, l.yc + l.gR), V(R, l.yc + l.gR)], [V(R, l.yc + l.gR), V(R, yt - c)]);
  } else {
    const b0 = Math.acos(Math.min(1, (l.clr - R) / l.gR));
    const arc = [];
    for (let i = 0; i <= 32; i++) { const b = -b0 + 2 * b0 * i / 32; arc.push(V(l.clr - l.gR * Math.cos(b), l.yc + l.gR * Math.sin(b))); }
    parts.push([V(R, yb + c), arc[0]], arc, [arc[arc.length - 1], V(R, yt - c)]);
  }
  parts.push([V(R, yt - c), V(R - c, yt)], [V(R - c, yt), V(rSp, yt)], [V(rSp, yt), V(rSp, yb)]);
  const geos = parts.filter((p) => p.length > 1 && p[0].distanceTo(p[p.length - 1]) > 1e-6).map((p) => {
    const g = new THREE.LatheGeometry(p, seg);
    // Machined-ring UVs: u around, v = radius-ish along profile.
    return g;
  });
  return mergeGeometries(geos);
}

function slicePositions(x0, x1, dense = false) {
  const xs = [];
  if (!dense) return [x0, x1];
  const n = 40;
  // Dense near x1 (the tip at the die).
  for (let i = 0; i <= n; i++) { const t = i / n; xs.push(x0 + (x1 - x0) * (1 - Math.pow(1 - t, 2.2))); }
  return xs;
}

/**
 * Builds the tooling. Returns groups to insert into the head (built by machine.js) and the world mandrel.
 */
export function buildTools({ OD, plan, layout: L, materials: M }) {
  const vis = { bendDie: [], clampDie: [], pressureDie: [], wiperDie: [], mandrel: [], machine: [] };
  const add = (parent, m, group) => { parent.add(m); vis[group].push(m); return m; };

  const dieGroup = new THREE.Group(); dieGroup.name = 'dieGroup';
  const clampMoving = new THREE.Group(); clampMoving.name = 'clampMoving';
  dieGroup.add(clampMoving);
  const pdOpen = new THREE.Group(); pdOpen.name = 'pdOpen';
  const pdTravel = new THREE.Group(); pdTravel.name = 'pdTravel';
  pdOpen.add(pdTravel);
  const staticTools = new THREE.Group(); staticTools.name = 'staticTools';

  // ---- Bend dies, clamp inserts (rotate with the die) ----
  for (const l of L.levels) {
    add(dieGroup, mesh(bendDieGeometry(l, L.rSp), M.toolSteel, { name: `bendDie${l.level}` }), 'bendDie');
    const zc = l.clr, depth = Math.min(0.75 * OD, l.clr - L.rSp - 4);
    const ins = sweepSection(
      groovedBlockEdges({ z0: zc - l.gR - depth * 0.6 - 2, z1: zc - L.clampGap, y0: l.yc - l.h / 2 + 0.5, y1: l.yc + l.h / 2 - 0.5, yc: l.yc, zc, gr: l.gR, face: 'max' }),
      slicePositions(0, l.clampLength, false).length === 2 ? [0, l.clampLength * 0.02, l.clampLength * 0.05, l.clampLength * 0.1, l.clampLength * 0.2, l.clampLength] : [0, l.clampLength],
      { clampX: (z, y, x) => Math.max(x, Math.sqrt(Math.max(0, dieRadiusAt(l, y) ** 2 - z * z)) - 0.05) });
    add(dieGroup, mesh(ins, M.toolSteel, { name: `clampInsert${l.level}` }), 'bendDie');
    // Clamp die (moves +Z when opening).
    const cg = sweepSection(
      groovedBlockEdges({ z0: zc + L.clampGap, z1: zc + L.clampGap + l.clamp.w, y0: l.yc - l.clamp.h / 2, y1: l.yc + l.clamp.h / 2, yc: l.yc, zc, gr: l.gR, face: 'min' }),
      [0, l.clamp.len]);
    add(clampMoving, mesh(cg, l.clamp.serrated ? M.toolSerrated : M.toolSteel, { name: `clampDie${l.level}` }), 'clampDie');
    // Pressure die.
    const pg = sweepSection(
      groovedBlockEdges({ z0: zc + L.pdGap, z1: zc + L.pdGap + l.pd.w, y0: l.yc - l.pd.h / 2, y1: l.yc + l.pd.h / 2, yc: l.yc, zc, gr: l.gR, face: 'min' }),
      [-l.pd.len, 0]);
    add(pdTravel, mesh(pg, M.toolSteel, { name: `pressureDie${l.level}` }), 'pressureDie');
    // Wiper die (static, tip carved to the die profile so it nests in the groove).
    if (l.wiper.required) {
      const hw = Math.min(l.h - 1, 2 * l.gR + 0.5 * OD);
      const z1 = zc - 0.3, z0 = zc - l.gR - l.wiper.th;
      const wg = sweepSection(
        groovedBlockEdges({ z0, z1, y0: l.yc - hw / 2, y1: l.yc + hw / 2, yc: l.yc, zc, gr: l.gR, face: 'max', n: 28 }),
        slicePositions(-l.wiper.len, 0, true),
        { clampX: (z, y, x) => Math.min(x, -Math.sqrt(Math.max(0, dieRadiusAt(l, y) ** 2 - z * z)) - 0.35 - Math.max(0, l.wiper.tipOffset) * 0.2) });
      // Rake: tail backs off from the tube.
      const p = wg.attributes.position, tr = Math.tan(l.wiper.rake * DEG);
      for (let i = 0; i < p.count; i++) { const x = p.getX(i); if (x < 0) p.setZ(i, p.getZ(i) - (-x) * tr); }
      wg.computeVertexNormals();
      add(staticTools, mesh(wg, M.toolSteel, { name: `wiperDie${l.level}` }), 'wiperDie');
      // Wiper holder (black), carved clear of the die rim.
      const hz1 = z0 - l.wiper.len * tr - 0.5, hz0 = hz1 - (0.35 * OD + 12);
      const hg = sweepSection(
        [[[hz0, l.yc - hw / 2 - 4], [hz1, l.yc - hw / 2 - 4]], [[hz1, l.yc - hw / 2 - 4], [hz1, l.yc + hw / 2 + 4]],
          [[hz1, l.yc + hw / 2 + 4], [hz0, l.yc + hw / 2 + 4]], [[hz0, l.yc + hw / 2 + 4], [hz0, l.yc - hw / 2 - 4]]],
        slicePositions(-l.wiper.len * 1.15, 0, true),
        { clampX: (z, y, x) => Math.min(x, -Math.sqrt(Math.max(0, (L.Rmax + 4) ** 2 - z * z)) - 2) });
      add(staticTools, mesh(hg, M.toolBlack, { name: `wiperHolder${l.level}` }), 'wiperDie');
    }
  }
  // Spindle, top nut and cap screws (rotate with the die).
  const spTop = L.yHi + L.topT + 0.35 * OD + 14;
  const spBot = L.yLo - L.armT - 30;
  const sp = new THREE.CylinderGeometry(L.rSp, L.rSp, spTop - spBot, 40);
  sp.translate(0, (spTop + spBot) / 2, 0);
  add(dieGroup, mesh(sp, M.toolChrome, { name: 'spindle' }), 'bendDie');
  const nutH = 0.3 * OD + 10;
  const nut = new THREE.CylinderGeometry(L.rSp * 1.7, L.rSp * 1.7, nutH, 6);
  nut.translate(0, L.yHi + L.topT + 2 + nutH / 2, 0);
  add(dieGroup, mesh(nut, M.toolSteel, { name: 'topNut' }), 'bendDie');
  const topLevel = L.levels.reduce((a, b) => (a.yc + a.h / 2 > b.yc + b.h / 2 ? a : b));
  const boltR = (L.rSp * 1.9 + (topLevel.clr - topLevel.gR)) / 2;
  const bolts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i + 0.5) / 6 * Math.PI * 2;
    const b = new THREE.CylinderGeometry(0.08 * OD + 3, 0.08 * OD + 3, 4, 16);
    b.translate(boltR * Math.cos(a), L.yHi + 2, boltR * Math.sin(a));
    bolts.push(b);
  }
  if (boltR + 0.08 * OD + 3 < topLevel.clr - topLevel.gR - 2) add(dieGroup, mesh(mergeGeometries(bolts), M.toolBlack, { name: 'dieBolts' }), 'bendDie');

  // Clamp backing plate + piston rod (move with the clamp, rod stretches to the clamp housing).
  const cl = L.clampLenMax;
  const bp = new THREE.BoxGeometry(cl, L.yHi - L.yLo, 10);
  bp.translate(cl / 2, (L.yHi + L.yLo) / 2, L.zClampBack + 5);
  add(clampMoving, mesh(bp, M.toolBlack, { name: 'clampBacking' }), 'clampDie');
  const clampRod = mesh(new THREE.CylinderGeometry(0.12 * OD + 4, 0.12 * OD + 4, 1, 24).rotateX(Math.PI / 2).translate(0, 0, 0.5), M.chrome, { name: 'clampRod' });
  clampRod.position.set(cl / 2, (L.yHi + L.yLo) / 2, L.zClampBack + 10);
  dieGroup.add(clampRod); vis.machine.push(clampRod);

  // ---- Mandrel (world space) ----
  const mandrel = new THREE.Group(); mandrel.name = 'mandrel';
  const md = plan?.mandrel || { type: 'none' };
  const mType = md.type || 'none';
  const mand = { type: mType, balls: [], links: [], shank: null, rod: null };
  // Shank + balls + links: hidden while the tube is being lowered in (`load`, loadOffsetY > 0).
  const mandrelHead = new THREE.Group(); mandrelHead.name = 'mandrelHead';
  mandrel.add(mandrelHead);
  if (mType !== 'none') {
    const dia = num(md.diameter, OD * 0.85);
    const shankL = num(md.shankLength, 2.5 * OD);
    const shank = new THREE.Group();
    const r = dia / 2, ch = Math.min(0.12 * dia, 4);
    const prof = [new THREE.Vector2(0.001, -shankL), new THREE.Vector2(r, -shankL), new THREE.Vector2(r, -ch), new THREE.Vector2(r - ch, 0), new THREE.Vector2(0.001, 0)];
    const parts = [];
    for (let i = 0; i < prof.length - 1; i++) parts.push(new THREE.LatheGeometry([prof[i], prof[i + 1]], 48));
    const sg = mergeGeometries(parts); sg.rotateZ(-Math.PI / 2); // lathe Y → +X (nose at x = 0, body toward −X)
    shank.add(mesh(sg, M.mandrelChrome, { name: 'mandrelShank' }));
    mandrelHead.add(shank); mand.shank = shank;
    if (mType === 'ball') {
      const n = Math.max(0, Math.round(md.balls ?? 3));
      const pitch = num(md.pitch, 0.6 * OD), bw = Math.min(num(md.ballWidth, 0.45 * OD), dia);
      const hb = bw / 2;
      const bprof = [];
      bprof.push(new THREE.Vector2(0.001, -hb));
      for (let i = 0; i <= 16; i++) { const x = -hb + bw * i / 16; bprof.push(new THREE.Vector2(Math.sqrt(Math.max(0, r * r - x * x)), x)); }
      bprof.push(new THREE.Vector2(0.001, hb));
      const bg = new THREE.LatheGeometry(bprof, 40); bg.rotateZ(-Math.PI / 2);
      const lr = Math.max(2, 0.18 * dia);
      const lg = new THREE.CylinderGeometry(lr, lr, 1, 16).rotateZ(Math.PI / 2);
      for (let k = 0; k < n; k++) {
        const b = mesh(bg, M.mandrelChrome, { name: `mandrelBall${k}` });
        mandrelHead.add(b); mand.balls.push(b);
        const link = mesh(lg, M.mandrelBronze, { name: `mandrelLink${k}` });
        mandrelHead.add(link); mand.links.push(link);
      }
      mand.pitch = pitch; mand.bw = bw;
    }
    mand.dia = dia; mand.shankL = shankL;
    mand.nose0 = Number.isFinite(md.noseProjection) ? md.noseProjection : 0;
    const rr = Math.max(3, Math.min(0.14 * dia, 0.12 * OD + 3));
    const rod = mesh(new THREE.CylinderGeometry(rr, rr, 1, 20).rotateZ(Math.PI / 2).translate(-0.5, 0, 0), M.chrome, { name: 'mandrelRod' });
    mandrel.add(rod); mand.rod = rod;
  }
  mandrel.traverse((o) => { if (o.isMesh) vis.mandrel.push(o); });

  const tmpV = new THREE.Vector3();
  function placeOnArc(obj, a, clr, theta) {
    // Arc length a from the tangent point along the (bent) tube centreline toward the front.
    if (a <= 0) { obj.position.set(a, 0, 0); obj.rotation.set(0, 0, 0); return; }
    const w = clr * theta;
    if (a <= w) {
      const al = a / clr;
      obj.position.set(clr * Math.sin(al), 0, -clr + clr * Math.cos(al));
      obj.rotation.set(0, al, 0);
    } else {
      const ex = clr * Math.sin(theta), ez = -clr + clr * Math.cos(theta);
      tmpV.set(Math.cos(theta), 0, -Math.sin(theta)).multiplyScalar(a - w);
      obj.position.set(ex + tmpV.x, 0, ez + tmpV.z);
      obj.rotation.set(0, theta, 0);
    }
  }

  function update(tools, L, clrActive, rodRearX) {
    const theta = (tools.dieAngle || 0) * DEG;
    dieGroup.rotation.y = theta;
    const co = Math.min(1, Math.max(0, tools.clampOpen ?? 0)) * L.clampStroke;
    clampMoving.position.z = co;
    const rodLen = Math.max(1, L.clampHousingZ0 - (L.zClampBack + 10 + co));
    clampRod.position.z = L.zClampBack + 10 + co;
    clampRod.scale.set(1, 1, rodLen);
    pdOpen.position.z = (tools.pressureDieOpen ?? 0) * L.pdOpenStroke;
    pdTravel.position.x = tools.pressureDieTravel || 0;
    mandrelHead.visible = !((tools.loadOffsetY || 0) > 0);
    if (mand.type !== 'none') {
      const nose = mand.nose0 + (tools.mandrelOffset || 0);
      mand.shank.position.set(nose, 0, 0);
      let prev = new THREE.Vector3(nose, 0, 0);
      for (let k = 0; k < mand.balls.length; k++) {
        const b = mand.balls[k];
        placeOnArc(b, nose + (k + 0.5) * mand.pitch, clrActive, theta);
        const link = mand.links[k];
        const d = tmpV.copy(b.position).sub(prev);
        const len = d.length();
        link.position.copy(prev).addScaledVector(d, 0.5);
        link.rotation.set(0, Math.atan2(-d.z, d.x), 0);
        link.scale.set(Math.max(0.01, len), 1, 1);
        prev = b.position.clone();
      }
      const rodFront = nose - mand.shankL;
      mand.rod.position.set(rodFront, 0, 0);
      mand.rod.scale.set(Math.max(1, rodFront - rodRearX), 1, 1);
    }
  }

  return { dieGroup, clampMoving, pdOpen, pdTravel, staticTools, mandrel, vis, update, mand };
}

export { dieRadiusAt, cylX };
