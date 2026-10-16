// Test helpers for geometry/kinematics: fixture → TubeModel, fixture centerline sampling,
// proper rigid fit (Horn quaternion = Kabsch with det = +1), and a hand-built process plan.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DEG, vAdd, vSub, vScale, vCross, vNormalize, vRotate, vLength } from '../../js/geometry.js';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

/** Truth JSON → TubeModel (derives straight dir and bend tIn/tOut). */
export function tubeFromTruth(truth) {
  const segments = truth.segments.map((s) => ({ ...s }));
  for (const s of segments) {
    if (s.type !== 'bend') continue;
    s.tIn = vNormalize(vCross(s.normal, vSub(s.p0, s.center)));
    s.tOut = vNormalize(vCross(s.normal, vSub(s.p1, s.center)));
  }
  segments.forEach((s, i) => {
    if (s.type !== 'straight') return;
    s.dir = s.length > 1e-9 ? vNormalize(vSub(s.p1, s.p0)) : (segments[i - 1]?.tOut ?? segments[i + 1].tIn);
  });
  return { OD: truth.OD, segments, totalLength: truth.totalLength, wall: null, name: truth.name };
}

export function loadFixtures() {
  return readdirSync(FIXTURE_DIR)
    .filter((f) => f.endsWith('.truth.json'))
    .sort()
    .map((f) => {
      const truth = JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8'));
      return { name: f.replace('.truth.json', ''), truth, tube: tubeFromTruth(truth) };
    });
}

/** Centerline point of a TubeModel at arc length s from end A. */
export function tubePointAt(tube, s) {
  let acc = 0;
  for (const seg of tube.segments) {
    const len = seg.type === 'straight' ? seg.length : seg.clr * seg.angle * DEG;
    if (s <= acc + len + 1e-9 || seg === tube.segments[tube.segments.length - 1]) {
      const u = Math.min(Math.max(s - acc, 0), len);
      if (seg.type === 'straight') return vAdd(seg.p0, vScale(seg.dir, u));
      return vAdd(seg.center, vRotate(vSub(seg.p0, seg.center), vNormalize(seg.normal), u / seg.clr));
    }
    acc += len;
  }
  throw new Error('unreachable');
}

/** Sample the fixture centerline at s = k·step from the given front end (same stations as centerlineFromLRA). */
export function sampleTube(tube, step, front = 'A') {
  const total = tube.segments.reduce((a, s) => a + (s.type === 'straight' ? s.length : s.clr * s.angle * DEG), 0);
  const n = Math.max(1, Math.ceil(total / step - 1e-9));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = Math.min(i * step, total);
    pts.push(tubePointAt(tube, front === 'A' ? s : total - s));
  }
  return pts;
}

function jacobiMaxEigvec(N) {
  const a = N.map((r) => r.slice());
  const v = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < 4; p++) for (let q = p + 1; q < 4; q++) off += a[p][q] * a[p][q];
    if (off < 1e-22) break;
    for (let p = 0; p < 4; p++) for (let q = p + 1; q < 4; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 4; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 4; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 4; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
    }
  }
  let best = 0;
  for (let i = 1; i < 4; i++) if (a[i][i] > a[best][best]) best = i;
  return [v[0][best], v[1][best], v[2][best], v[3][best]];
}

/** RMS after the best PROPER rigid motion (rotation det = +1, no reflection) mapping P onto Q. */
export function properRigidRms(P, Q) {
  if (P.length !== Q.length) throw new Error(`point count mismatch ${P.length} vs ${Q.length}`);
  const n = P.length;
  const cp = [0, 0, 0], cq = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { cp[k] += P[i][k] / n; cq[k] += Q[i][k] / n; }
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {
    const a = vSub(P[i], cp), b = vSub(Q[i], cq);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += a[r] * b[c];
  }
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = S;
  const N = [
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ];
  const [w, x, y, z] = jacobiMaxEigvec(N);
  const R = [
    [w * w + x * x - y * y - z * z, 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), w * w - x * x + y * y - z * z, 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), w * w - x * x - y * y + z * z],
  ];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = vSub(P[i], cp), b = vSub(Q[i], cq);
    const ra = [0, 1, 2].map((r) => R[r][0] * a[0] + R[r][1] * a[1] + R[r][2] * a[2]);
    sum += vLength(vSub(ra, b)) ** 2;
  }
  return Math.sqrt(sum / n);
}

/**
 * Hand-built process plan from an LRA (stand-in for the planner): one stack per distinct CLR,
 * angleLoad = A + springback, phases load / [stackChange] / feed / [rotate] / clamp / bend /
 * mandrelRetract / release / return … unload, each of `dur` seconds.
 */
export function planFromLRA(lra, { springback = 0, frontScrap = 0, tailScrap = 0, dur = 1 } = {}) {
  const clrs = [...new Set(lra.bends.map((b) => b.clr))];
  const stacks = clrs.map((clr, level) => ({ level, clr, yOffset: 40 + level * 90 }));
  const bends = [], layoutBends = [];
  let s = frontScrap;
  lra.bends.forEach((b, i) => {
    s += b.L;
    const angleLoad = b.A + springback;
    const s0 = s, s1 = s0 + b.clr * angleLoad * DEG;
    layoutBends.push({ s0, s1 });
    bends.push({ index: i, stack: clrs.indexOf(b.clr), angleLoad });
    s = s1;
  });
  const cutLength = s + lra.tail + tailScrap;
  const phases = [];
  let time = 0;
  const add = (type, bend, params, label) => { phases.push({ type, bend, start: time, duration: dur, label, params }); time += dur; };
  add('load', -1, {}, 'Carga');
  let level = bends[0]?.stack ?? 0;
  lra.bends.forEach((b, i) => {
    const pb = bends[i];
    if (pb.stack !== level) { add('stackChange', i, { fromLevel: level, toLevel: pb.stack }, 'Cambio de nivel'); level = pb.stack; }
    add('feed', i, { distance: layoutBends[i].s0 - (i === 0 ? 0 : layoutBends[i - 1].s1) }, 'Avance');
    if (b.R !== 0) add('rotate', i, { angle: b.R }, 'Giro');
    add('clamp', i, {}, 'Sujeción');
    add('bend', i, { angleLoad: pb.angleLoad, clr: b.clr, boostPct: 0 }, 'Doblado');
    add('mandrelRetract', i, { distance: 10 }, 'Retracción de mandril');
    add('release', i, { angleLoad: pb.angleLoad, angleFinal: b.A }, 'Liberación');
    add('return', i, { angle: pb.angleLoad }, 'Retorno');
  });
  add('unload', -1, {}, 'Descarga');
  return {
    stacks, bends,
    mandrel: { noseProjection: 3, retract: 10 },
    layout: { cutLength, frontScrap, tailScrap, bends: layoutBends },
    sequence: { phases, totalTime: time },
  };
}

/** Time at the end of the last phase of the given type (optionally for a given bend). */
export function phaseEnd(plan, type, bend) {
  const ph = plan.sequence.phases.filter((p) => p.type === type && (bend === undefined || p.bend === bend)).pop();
  return ph.start + ph.duration;
}
export function phaseAt(plan, type, bend, progress) {
  const ph = plan.sequence.phases.find((p) => p.type === type && p.bend === bend);
  return ph.start + progress * ph.duration;
}
