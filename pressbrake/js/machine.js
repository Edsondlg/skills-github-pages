// Modelo 3D procedural de una plegadora CNC (unidades: mm).
// X = largo de la cama, Y = vertical, Z = hacia el operador (+) / tope trasero (−).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------- texturas procedurales ----------
function canvasTex(w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(ctx, w, h, base, amp, n, size = 1.5) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const v = Math.floor((Math.random() - 0.5) * amp);
    ctx.fillStyle = `rgba(${128 + v},${128 + v},${128 + v},0.08)`;
    const r = Math.random() * size + 0.3;
    ctx.fillRect(Math.random() * w, Math.random() * h, r, r);
  }
}
export function concreteTextures() {
  const color = canvasTex(1024, 1024, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, '#8d8f90'); g.addColorStop(1, '#7c7e80');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '60,60,60' : '170,170,170'},${Math.random() * 0.05})`;
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * 120, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 60000; i++) {
      const v = Math.random() < 0.5 ? 40 : 200;
      ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    ctx.strokeStyle = 'rgba(40,40,40,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(w, 1); ctx.moveTo(1, 0); ctx.lineTo(1, h); ctx.stroke();
  }, { repeat: [6, 6] });
  const rough = canvasTex(512, 512, (ctx, w, h) => {
    noise(ctx, w, h, '#8a8a8a', 160, 30000, 3);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(30,30,30,${Math.random() * 0.25})`;
      ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 60, 5 + Math.random() * 30, Math.random() * 3, 0, 7); ctx.fill();
    }
  }, { repeat: [6, 6], srgb: false });
  return { color, rough };
}
export function brushedTextures() {
  const rough = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6a6a6a'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * h, v = 70 + Math.random() * 90;
      ctx.strokeStyle = `rgba(${v},${v},${v},0.35)`;
      ctx.lineWidth = Math.random() * 1.2;
      ctx.beginPath(); ctx.moveTo(Math.random() * w - 100, y); ctx.lineTo(Math.random() * w + 100, y + (Math.random() - 0.5) * 1.5); ctx.stroke();
    }
  }, { srgb: false });
  return { rough };
}

// ---------- materiales ----------
export function makeMaterials() {
  const paint = (color, rough = 0.42) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0.15, clearcoat: 0.55, clearcoatRoughness: 0.25 });
  const brushed = brushedTextures();
  return {
    red: paint('#b1121c', 0.38),
    grey: paint('#cfd2d1', 0.5),
    greyDark: paint('#9ea3a6', 0.5),
    navy: paint('#222a35', 0.48),
    black: new THREE.MeshStandardMaterial({ color: '#141619', roughness: 0.55, metalness: 0.3 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.9 }),
    tool: new THREE.MeshPhysicalMaterial({ color: '#a7adb3', metalness: 1, roughness: 0.22, roughnessMap: brushed.rough, clearcoat: 0.2 }),
    toolDark: new THREE.MeshStandardMaterial({ color: '#4b5157', metalness: 0.9, roughness: 0.35 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#e4e7ea', metalness: 1, roughness: 0.08 }),
    led: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e8', emissiveIntensity: 4 }),
    ledRed: new THREE.MeshStandardMaterial({ color: '#ff3b30', emissive: '#ff2a1f', emissiveIntensity: 3 }),
    ledGreen: new THREE.MeshStandardMaterial({ color: '#30d158', emissive: '#21c24a', emissiveIntensity: 3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#0b0f14', metalness: 0, roughness: 0.05, clearcoat: 1 }),
    yellow: paint('#f2c200', 0.45),
  };
}

const extrudeX = (shape, len, mat) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: 24 });
  g.rotateY(Math.PI / 2); // extrusión a lo largo de +X; el perfil queda en el plano (Z, Y) con Z invertido
  g.translate(-len / 2, 0, 0);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const box = (w, h, d, mat, r = 0) => {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
};

// perfil del punzón en (z, y) — punta en y = 0
function punchShape(angleDeg, halfBody, height, tipR = 0.6) {
  const s = new THREE.Shape();
  const ta = Math.tan(((angleDeg / 2) * Math.PI) / 180);
  const hTip = halfBody / ta;
  s.moveTo(-tipR * ta, tipR * 0.3);
  s.quadraticCurveTo(0, -tipR * 0.2, tipR * ta, tipR * 0.3);
  s.lineTo(halfBody, hTip);
  s.lineTo(halfBody, height - 30);
  s.lineTo(halfBody + 4, height - 26);
  s.lineTo(halfBody + 4, height);
  s.lineTo(-halfBody - 4, height);
  s.lineTo(-halfBody - 4, height - 26);
  s.lineTo(-halfBody, height - 30);
  s.lineTo(-halfBody, hTip);
  s.closePath();
  return s;
}
// perfil de la matriz en V — parte superior en y = 0
function dieShape(V, height, width) {
  const s = new THREE.Shape();
  const hw = width / 2, depthV = V * 0.55, rs = Math.min(1.5, V * 0.08);
  s.moveTo(-hw, -height);
  s.lineTo(hw, -height);
  s.lineTo(hw, -6);
  s.lineTo(hw - 6, 0);
  s.lineTo(V / 2 + rs, 0);
  s.quadraticCurveTo(V / 2, 0, V / 2 - rs * 0.6, -rs * 0.6);
  s.lineTo(1, -depthV);
  s.lineTo(-1, -depthV);
  s.lineTo(-V / 2 + rs * 0.6, -rs * 0.6);
  s.quadraticCurveTo(-V / 2, 0, -V / 2 - rs, 0);
  s.lineTo(-hw + 6, 0);
  s.lineTo(-hw, -6);
  s.closePath();
  return s;
}

function plateTexture(lines, { w = 1024, h = 256, bg = 'rgba(0,0,0,0)', color = '#fff', font = 'bold 120px Inter, Arial' } = {}) {
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 110));
  });
}

export class PressBrake {
  constructor(cfg = {}) {
    this.cfg = Object.assign({ length: 3100, punchAngle: 86, punchHalfBody: 9, punchHeight: 120, V: 16, dieHeight: 60, tons: 135 }, cfg);
    this.mat = makeMaterials();
    this.group = new THREE.Group();
    this.ram = new THREE.Group();
    this.toolGroup = new THREE.Group();
    this.dieGroup = new THREE.Group();
    this.bg = new THREE.Group();
    this.group.add(this.ram, this.dieGroup, this.bg);
    this.ram.add(this.toolGroup);
    this.build();
    this.setTools(this.cfg.V, 200);
    this.setTipY(150);
  }

  build() {
    const M = this.mat, L = this.cfg.length;
    const g = this.group;
    const floorY = -980;
    this.floorY = floorY;
    const halfX = L / 2 + 330;

    // --- bastidores laterales (perfil en C) ---
    const side = new THREE.Shape();
    side.moveTo(-750, floorY + 40);
    side.lineTo(340, floorY + 40);
    side.lineTo(340, -330);
    side.quadraticCurveTo(340, -260, 300, -250);
    side.lineTo(120, -250);
    side.quadraticCurveTo(-120, -250, -140, 0);
    side.lineTo(-140, 520);
    side.quadraticCurveTo(-120, 760, 120, 760);
    side.lineTo(300, 760);
    side.quadraticCurveTo(340, 770, 340, 840);
    side.lineTo(340, 1880);
    side.lineTo(-750, 1880);
    side.closePath();
    for (const sx of [-1, 1]) {
      const sideG = new THREE.ExtrudeGeometry(side, { depth: 180, bevelEnabled: true, bevelSize: 12, bevelThickness: 12, bevelSegments: 4, curveSegments: 20 });
      sideG.rotateY(-Math.PI / 2);
      const m = new THREE.Mesh(sideG, M.grey);
      m.castShadow = m.receiveShadow = true;
      m.position.x = sx * halfX + (sx > 0 ? 180 : 0);
      g.add(m);
      // cubierta lateral exterior con rejilla
      const cover = box(30, 1500, 700, M.greyDark, 10);
      cover.position.set(sx * (halfX + 212), floorY + 900, -250);
      g.add(cover);
      const vent = box(32, 520, 320, M.navy, 4);
      vent.position.set(sx * (halfX + 214), floorY + 820, -60);
      g.add(vent);
      // cilindros hidráulicos sobre el bastidor
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(95, 95, 520, 48), M.grey);
      cyl.position.set(sx * (halfX - 90), 1350, -60);
      cyl.castShadow = true;
      g.add(cyl);
    }
    // --- viga superior / cubierta ---
    const top = box(2 * halfX + 260, 360, 820, M.grey, 24);
    top.position.set(0, 1720, -260);
    g.add(top);
    const back = box(2 * halfX - 600, 900, 40, M.red, 8);
    back.position.set(-150, 2050, -660);
    back.rotation.x = -0.04;
    g.add(back);

    // --- mesa (viga inferior) ---
    const bedH = -this.cfg.dieHeight - 70;
    const bed = box(L + 120, bedH - floorY - 40, 110, M.navy, 6);
    bed.position.set(0, (bedH + floorY + 40) / 2, -10);
    g.add(bed);
    // franjas de acero inoxidable
    for (const y of [-330, -520, -760]) {
      const strip = box(L + 60, 16, 6, M.chrome, 2);
      strip.position.set(0, y, 48);
      g.add(strip);
    }
    const bedTop = box(L + 40, 70, 90, M.black, 4);
    bedTop.position.set(0, -this.cfg.dieHeight - 35, -10);
    g.add(bedTop);
    // base al piso
    const plinth = box(L + 900, 40, 1200, M.black, 4);
    plinth.position.set(0, floorY + 20, -260);
    g.add(plinth);

    // --- trabe (ram) ---
    const R = this.ram;
    const clampH = 70;
    this.ramBase = this.cfg.punchHeight + clampH; // altura de la cara inferior de la trabe sobre la punta
    const ramPlate = box(L + 200, 820, 100, M.red, 10);
    ramPlate.position.set(0, this.ramBase + 410, 0);
    R.add(ramPlate);
    // carenado frontal curvo
    const fair = new THREE.Shape();
    fair.moveTo(0, 0); fair.quadraticCurveTo(120, 20, 150, 220); fair.lineTo(150, 520); fair.lineTo(0, 520); fair.closePath();
    for (const x0 of [-L / 2 + 440, L / 2 + 80]) {
      const fg = new THREE.ExtrudeGeometry(fair, { depth: 520, bevelEnabled: true, bevelSize: 8, bevelThickness: 8, bevelSegments: 4 });
      fg.rotateY(-Math.PI / 2);
      const fm = new THREE.Mesh(fg, M.red);
      fm.castShadow = true;
      fm.position.set(x0, this.ramBase + 160, 50);
      R.add(fm);
    }
    // tira LED bajo el carenado
    for (const x of [-560, 0, 560]) {
      const led = box(380, 6, 10, M.led, 2);
      led.position.set(x, this.ramBase + 640, 58);
      R.add(led);
    }
    const name = new THREE.Mesh(new THREE.PlaneGeometry(520, 130), new THREE.MeshStandardMaterial({ map: plateTexture(['PRESS·SIM']), transparent: true, roughness: 0.4 }));
    name.position.set(0, this.ramBase + 470, 51);
    R.add(name);
    const model = new THREE.Mesh(new THREE.PlaneGeometry(420, 60), new THREE.MeshStandardMaterial({ map: plateTexture([`CNC ${this.cfg.tons} t × ${(L / 1000).toFixed(1)} m`], { font: 'bold 90px Inter, Arial' }), transparent: true }));
    model.position.set(L / 2 - 260, this.ramBase + 260, 51);
    R.add(model);
    // sujetadores intermedios (clamps)
    const clampG = new RoundedBoxGeometry(110, clampH, 74, 2, 6);
    for (let x = -L / 2 + 80; x <= L / 2 - 80; x += 145) {
      const c = new THREE.Mesh(clampG, M.toolDark);
      c.position.set(x, this.cfg.punchHeight + clampH / 2, 0);
      c.castShadow = true;
      R.add(c);
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 14, 16), M.black);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(x, this.cfg.punchHeight + clampH / 2, 42);
      R.add(knob);
    }

    // --- tope trasero ---
    this.backgauge = new THREE.Group();
    const rail = box(L - 300, 80, 60, M.greyDark, 6);
    rail.position.set(0, -90, 0);
    this.backgauge.add(rail);
    this.fingers = [];
    for (const sx of [-1, 1]) {
      const f = new THREE.Group();
      const body = box(70, 130, 220, M.black, 6);
      body.position.set(0, -40, -110);
      const tip = box(60, 40, 40, M.tool, 3);
      tip.position.set(0, 20, 0);
      const nose = box(60, 10, 14, M.tool, 2);
      nose.position.set(0, 5, 18);
      f.add(body, tip, nose);
      f.userData.sx = sx;
      this.backgauge.add(f);
      this.fingers.push(f);
    }
    this.backgauge.position.set(0, 0, -260);
    g.add(this.backgauge);
    this.bgRail = rail;

    // --- soportes frontales de lámina ---
    for (const x of [-980, 760]) {
      const sup = new THREE.Shape();
      sup.moveTo(0, 0); sup.lineTo(420, 0); sup.lineTo(420, -40); sup.lineTo(60, -360); sup.lineTo(0, -360); sup.closePath();
      const sg = new THREE.ExtrudeGeometry(sup, { depth: 60, bevelEnabled: true, bevelSize: 4, bevelThickness: 4 });
      sg.rotateY(-Math.PI / 2);
      const sm = new THREE.Mesh(sg, M.grey);
      sm.castShadow = sm.receiveShadow = true;
      sm.position.set(x + 30, -this.cfg.dieHeight - 6, 50);
      g.add(sm);
      const top2 = box(70, 10, 420, M.chrome, 2);
      top2.position.set(x, -this.cfg.dieHeight - 1, 260);
      g.add(top2);
    }
    const supRail = box(L - 400, 22, 30, M.chrome, 4);
    supRail.position.set(0, -260, 64);
    g.add(supRail);

    // --- consola CNC en brazo ---
    const pend = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 700, 24), M.greyDark);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-350, 560, 0);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 300, 24), M.greyDark);
    post.position.set(-700, 420, 0);
    const housing = box(420, 340, 70, M.black, 14);
    housing.position.set(-700, 160, 0);
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 800; this.screenCanvas.height = 480;
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(330, 198), new THREE.MeshStandardMaterial({ map: this.screenTex, emissive: '#ffffff', emissiveMap: this.screenTex, emissiveIntensity: 0.9, roughness: 0.15 }));
    screen.position.set(-700, 190, 36);
    pend.add(arm, post, housing, screen);
    const btnY = 30;
    [['#2c7be5', -800], ['#30d158', -755], ['#ffffff', -710], ['#2c7be5', -665]].forEach(([c, x]) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 10, 20), new THREE.MeshStandardMaterial({ color: c, roughness: 0.3 }));
      b.rotation.x = Math.PI / 2; b.position.set(x, btnY + 32, 36); pend.add(b);
    });
    const estop = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 24), new THREE.MeshStandardMaterial({ color: '#d0021b', roughness: 0.35 }));
    estop.rotation.x = Math.PI / 2; estop.position.set(-560, btnY + 32, 40); pend.add(estop);
    pend.position.set(-L / 2 - 120, 200, 260);
    pend.rotation.y = 0.35;
    g.add(pend);
    this.pendant = pend;

    // --- pedal ---
    const pedal = new THREE.Group();
    const pb = box(360, 120, 260, M.black, 20);
    pb.position.y = 60;
    const cover = box(370, 110, 120, M.yellow, 16);
    cover.position.set(0, 140, -40);
    pedal.add(pb, cover);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 950, 12), M.black);
    pole.position.set(0, 520, -80);
    pedal.add(pole);
    pedal.position.set(-L / 2 + 250, floorY, 900);
    g.add(pedal);

    // --- semáforo / baliza ---
    const beacon = new THREE.Group();
    [[M.ledRed, 0], [this.mat.yellow, 60], [M.ledGreen, 120]].forEach(([m, y]) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 56, 24), m);
      c.position.y = y; beacon.add(c);
    });
    beacon.position.set(halfX + 90, 1940, 100);
    g.add(beacon);
    this.beacon = beacon;
  }

  /** Coloca punzón y matriz para V y largo de doblez dados. */
  setTools(V, length) {
    const M = this.mat, c = this.cfg;
    c.V = V;
    this.toolGroup.clear();
    this.dieGroup.clear();
    // segmentos de punzón estándar
    const segs = [];
    let rem = Math.max(20, Math.floor(length / 5) * 5);
    const std = [200, 100, 50, 40, 20, 15, 10, 5];
    while (rem > 0) { const s = std.find((x) => x <= rem) || 5; segs.push(s); rem -= s; }
    const pshape = punchShape(c.punchAngle, c.punchHalfBody, c.punchHeight);
    let x = -segs.reduce((a, b) => a + b, 0) / 2;
    for (const s of segs) {
      const m = extrudeX(pshape, s - 0.4, M.tool);
      m.position.x = x + s / 2;
      this.toolGroup.add(m);
      x += s;
    }
    // matriz: segmentada a lo largo de la cama
    const dshape = dieShape(V, c.dieHeight, Math.max(V + 26, 46));
    const dieLen = Math.min(c.length - 100, 2400);
    const nSeg = 6;
    for (let i = 0; i < nSeg; i++) {
      const m = extrudeX(dshape, dieLen / nSeg - 1, M.tool);
      m.position.x = -dieLen / 2 + (i + 0.5) * (dieLen / nSeg);
      this.dieGroup.add(m);
    }
    const holder = box(dieLen + 40, 20, 70, M.toolDark, 3);
    holder.position.y = -c.dieHeight - 10;
    this.dieGroup.add(holder);
  }

  /** Altura de la punta del punzón (mm). */
  setTipY(y) { this.ram.position.y = y; this.tipY = y; }

  /** Tope trasero: z del dedo (negativo = detrás de la línea de doblez), separación en X. */
  setBackgauge(z, spread, h = 0) {
    this.backgauge.position.z = 0;
    for (const f of this.fingers) f.position.set(f.userData.sx * spread, h, z - 20);
    this.bgRail.position.set(0, -90, z - 260);
  }

  drawScreen(info) {
    const c = this.screenCanvas, ctx = c.getContext('2d'), w = c.width, h = c.height;
    ctx.fillStyle = '#0d1520'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#16324f'; ctx.fillRect(0, 0, w, 54);
    ctx.fillStyle = '#e8f1ff'; ctx.font = 'bold 30px Arial'; ctx.fillText('PRESS·SIM  CNC', 20, 38);
    ctx.textAlign = 'right'; ctx.fillText(info.status || 'AUTO', w - 20, 38); ctx.textAlign = 'left';
    ctx.font = '26px Arial'; ctx.fillStyle = '#9fb7d3';
    const rows = [
      ['Programa', info.program || '—'], ['Paso', info.step || '—'], ['Ángulo', info.angle || '—'],
      ['Y (punzón)', info.y || '—'], ['X (tope)', info.x || '—'], ['Herramienta', info.tool || '—'], ['Fuerza', info.force || '—'],
    ];
    rows.forEach(([k, v], i) => {
      ctx.fillStyle = '#7f9bbd'; ctx.fillText(k, 24, 100 + i * 50);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px Arial'; ctx.fillText(v, 270, 100 + i * 50); ctx.font = '26px Arial';
    });
    // mini perfil
    ctx.strokeStyle = '#2ee6a6'; ctx.lineWidth = 6;
    const cx = 640, cy = 330, a = ((info.angleNow || 0) / 2) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx - 110 * Math.cos(a), cy - 110 * Math.sin(a)); ctx.lineTo(cx, cy); ctx.lineTo(cx + 110 * Math.cos(a), cy - 110 * Math.sin(a)); ctx.stroke();
    ctx.fillStyle = '#c8d3df'; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 120); ctx.lineTo(cx + 14, cy - 120); ctx.lineTo(cx, cy - 6); ctx.fill();
    ctx.fillStyle = '#5c6b7a'; ctx.fillRect(cx - 70, cy + 6, 50, 60); ctx.fillRect(cx + 20, cy + 6, 50, 60);
    this.screenTex.needsUpdate = true;
  }
}
