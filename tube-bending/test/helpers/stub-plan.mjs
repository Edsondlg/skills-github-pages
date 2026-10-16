// Test stubs: a minimal TubeModel / LRA / plan for the mechanics module (the real ones come from
// tube-extract.js, geometry.js and process.js).
import { springback } from '../../js/mechanics.js';

const DEG = Math.PI / 180;

// bends: [{ clr, A, R?, L?, t? }] (t: wall of that bend's region); mandrel: 'none' | 'plug' | { balls }
export function makeCase({ material, OD, t, bends, mandrel = 'none', wiper = false, boostPct = 0, clearance, rake = 1 }) {
  const lra = { front: 'A', bends: bends.map((b) => ({ L: b.L ?? 2 * OD, R: b.R ?? 0, A: b.A, clr: b.clr })), tail: 2 * OD };
  let s = 0;
  const layoutBends = [];
  const walls = [];
  lra.bends.forEach((b, i) => {
    const tb = bends[i].t ?? t;
    const sb = springback({ material, OD, t: tb, clr: b.clr, angle: b.A });
    s += b.L;
    const s0 = s, s1 = s0 + b.clr * sb.angleLoad * DEG;
    layoutBends.push({ s0, s1, angleLoad: sb.angleLoad });
    walls.push({ s1, t: tb });
    s = s1;
  });
  const cutLength = s + lra.tail;
  const wallAt = (x) => {
    for (const w of walls) if (x < w.s1) return w.t;
    return walls.length ? walls[walls.length - 1].t : t;
  };
  const tMax = Math.max(t, ...bends.map((b) => b.t ?? t));
  const mType = typeof mandrel === 'string' ? mandrel : 'ball';
  const balls = typeof mandrel === 'object' ? mandrel.balls : 0;
  const c0 = clearance ?? 0.1 * tMax; // mandrel sized to the smallest ID (thickest wall)
  const plan = {
    stacks: bends.map((b) => ({
      clr: b.clr,
      wiperDie: { required: wiper, rake },
      bendDie: { grooveR: OD / 2 },
      clampDie: { length: 3 * OD, serrated: false },
      pressureDie: { length: b.clr * Math.PI / 2 + 2 * OD },
    })),
    mandrel: { type: mType, diameter: mType === 'none' ? 0 : OD - 2 * tMax - c0, balls, pitch: 0.5 * OD, noseProjection: 0.3 * OD },
    bends: layoutBends.map((l, i) => ({ index: i, stack: i, angleLoad: l.angleLoad, boostPct })),
    layout: { cutLength, bends: layoutBends.map(({ s0, s1 }) => ({ s0, s1 })), wallAt },
  };
  const tube = { OD, segments: [], wall: null, nominalWall: t, minWall: Math.min(t, ...bends.map((b) => b.t ?? t)), maxWall: tMax, variableWall: false, totalLength: cutLength };
  return { tube, lra, plan };
}
