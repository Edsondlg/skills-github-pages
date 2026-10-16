// Banco de pruebas de la escena 3D con la tubería real: STEP → tubo → LRA → plan → análisis → cinemática → visor.
// window.demo expone ayudantes para --eval (setTime, play, setMode, setCutaway, setCamera, setVisible, …).
import { importStepTube } from '../tube-extract.js';
import { lraFromTube } from '../geometry.js';
import { planProcess } from '../process.js';
import { getMaterial } from '../materials.js';
import { analyzeBends, makeFieldSampler } from '../mechanics.js';
import { buildKinematics } from '../kinematics.js';
import { createViewer } from '../scene/viewer.js';
import { buildStations } from '../scene/tube-mesh.js';

const SAMPLE = new URLSearchParams(location.search).get('sample') || 'escape_5_dobleces';
const MATERIAL = new URLSearchParams(location.search).get('material') || 'aisi409';
const QUALITY = new URLSearchParams(location.search).get('quality') === 'medium' ? 'medium' : 'high';
const $ = (id) => document.getElementById(id);
const demo = { t: 0, playing: false };
window.demo = demo;

const MODES = [['realistic', 'Realista'], ['thickness', 'Espesor'], ['thinning', 'Adelgazamiento'], ['majorStrain', 'Deformación ε₁'], ['fld', 'FLD']];
const CAMS = [['iso', 'Isométrica'], ['top', 'Superior'], ['front', 'Frontal'], ['head', 'Cabezal'], ['follow', 'Seguir']];
const GROUPS = [['machine', 'Máquina'], ['bendDie', 'Dado'], ['clampDie', 'Mordaza'], ['pressureDie', 'Dado de presión'], ['wiperDie', 'Limpiador'], ['mandrel', 'Mandril'], ['collet', 'Boquilla'], ['tube', 'Tubo'], ['floor', 'Piso']];

async function init() {
  const text = await (await fetch(`samples/${SAMPLE}.stp`)).text();
  const tube = importStepTube(text, { fileName: `${SAMPLE}.stp` });
  const lra = lraFromTube(tube, { front: 'A' });
  const material = getMaterial(MATERIAL);
  const options = { seamAngle: 0 };
  const plan = planProcess({ tube, lra, material, options });
  const analysis = analyzeBends({ tube, lra, plan, material, options });
  const sampler = makeFieldSampler({ tube, lra, plan, analysis, material, options });
  const OD = tube.OD;
  const kin = buildKinematics({ lra, plan, OD });

  const viewer = await createViewer($('view'), { quality: QUALITY });
  viewer.setup({ OD, plan, material });
  const sampleVertex = (s, phi) => {
    const f = sampler.at(s, phi);
    const t0 = f.t0;
    return { rOut0: OD / 2, rIn0: OD / 2 - t0, dOut: f.dOut, dIn: f.dIn, fields: { t: f.t, thinningPct: f.thinningPct, e1: f.e1, e2: f.e2, zone: f.zone } };
  };
  let s = buildStations(plan, OD);
  let poses = new Float32Array(16 * s.length), formed = new Float32Array(s.length);
  viewer.buildTube({ s, ringSegments: 48, seamAngle: 0, sampleVertex });
  Object.assign(demo, { viewer, kin, plan, tube, lra, analysis, sampler, stations: s });

  const slider = $('time');
  slider.max = String(kin.duration);
  function setTime(t) {
    demo.t = Math.min(kin.duration, Math.max(0, t));
    kin.posesAt(demo.t, s, poses, formed);
    const st = kin.stateAt(demo.t);
    viewer.setFrame({ poses, formed, tools: st });
    slider.value = String(demo.t);
    $('info').textContent = `t = ${demo.t.toFixed(2)} / ${kin.duration.toFixed(1)} s · ${st.label || ''}${st.bendIndex >= 0 ? ` · doblez ${st.bendIndex + 1}` : ''}`;
    return st;
  }
  /** Time at fraction `frac` of the phase `type` of bend `bend`. */
  function phaseTime(type, bend, frac = 0.5) {
    const ph = plan.sequence.phases.find((p) => p.type === type && p.bend === bend);
    return ph ? ph.start + frac * ph.duration : null;
  }
  let last = 0;
  function tick(now) {
    if (!demo.playing) return;
    const dt = last ? (now - last) / 1000 : 0; last = now;
    setTime(demo.t + dt >= kin.duration ? 0 : demo.t + dt);
    requestAnimationFrame(tick);
  }
  function play(on = true) {
    demo.playing = on; last = 0;
    $('play').textContent = on ? '⏸ Pausa' : '▶ Reproducir';
    if (on) requestAnimationFrame(tick);
  }
  const legendEl = $('legend');
  function setMode(m) {
    viewer.setColorMode(m);
    for (const b of document.querySelectorAll('[data-mode]')) b.classList.toggle('on', b.dataset.mode === m);
    const lg = viewer.getLegend(m);
    legendEl.style.display = m === 'realistic' ? 'none' : 'block';
    legendEl.innerHTML = `<b>${lg.title}</b>` + lg.stops.map((st) => `<div><span class="sw" style="background:${st.color}"></span>${st.label}</div>`).join('');
    return lg;
  }
  let cut = false;
  function setCutaway(b) { cut = !!b; viewer.setCutaway(cut); $('cut').classList.toggle('on', cut); }
  function setCamera(p) { viewer.setCamera(p); }
  const vis = {};
  function setVisible(g, b) { vis[g] = !!b; viewer.setVisible(g, !!b); document.querySelector(`[data-group="${g}"]`)?.classList.toggle('on', !!b); }
  /** Rebuilds the tube with N evenly spaced stations × 48 segments and times `n` setFrame calls (ms avg). */
  function perf(N = 2500, n = 100) {
    const L = plan.layout.cutLength;
    const s2 = new Float64Array(N).map((_, i) => L * i / (N - 1));
    viewer.buildTube({ s: s2, ringSegments: 48, seamAngle: 0, sampleVertex });
    const P = [new Float32Array(16 * N), new Float32Array(16 * N)], F = [new Float32Array(N), new Float32Array(N)];
    kin.posesAt(phaseTime('bend', 1, 0.3), s2, P[0], F[0]); kin.posesAt(phaseTime('bend', 1, 0.7), s2, P[1], F[1]);
    const st = kin.stateAt(demo.t);
    viewer.setFrame({ poses: P[0], formed: F[0], tools: st });
    const t0 = performance.now();
    for (let i = 0; i < n; i++) viewer.setFrame({ poses: P[i & 1], formed: F[i & 1], tools: st });
    const avg = (performance.now() - t0) / n;
    viewer.buildTube({ s, ringSegments: 48, seamAngle: 0, sampleVertex });
    setTime(demo.t);
    return { N, ringSegments: 48, calls: n, avgMs: +avg.toFixed(3) };
  }

  // Controls.
  const row = $('controls');
  const btn = (label, attrs, onclick) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; Object.assign(b.dataset, attrs); b.onclick = onclick; row.appendChild(b); return b; };
  const sep = () => { const d = document.createElement('span'); d.className = 'sep'; row.appendChild(d); };
  for (const [m, l] of MODES) btn(l, { mode: m }, () => setMode(m));
  sep();
  btn('Corte', {}, () => setCutaway(!cut)).id = 'cut';
  sep();
  for (const [p, l] of CAMS) btn(l, { cam: p }, () => setCamera(p));
  sep();
  for (const [g, l] of GROUPS) { const b = btn(l, { group: g }, () => setVisible(g, vis[g] === false)); b.classList.add('on'); }
  $('play').onclick = () => play(!demo.playing);
  slider.oninput = () => { play(false); setTime(Number(slider.value)); };
  viewer.onPick(({ s: ps, phi }) => { viewer.setSectionMarker(ps); $('info').textContent += ` · s = ${ps.toFixed(1)} mm, φ = ${phi.toFixed(0)}°`; });

  Object.assign(demo, { setTime, play, setMode, setCutaway, setCamera, setVisible, phaseTime, perf });
  setMode('realistic');
  setTime(phaseTime('bend', 1, 0.5) ?? 0);
}

demo.ready = init();
demo.ready.catch((e) => { console.error(e); document.getElementById('info').textContent = 'Error: ' + e.message; });
