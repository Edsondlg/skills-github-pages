// 3D viewer: a dumb renderer fed by the app glue (see docs/INTERFACES.md §8).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createMaterials, applyTubeTint, makeGradientBackground } from './materials.js';
import { computeHeadLayout, buildTools } from './tools.js';
import { buildMachine } from './machine.js';
import { TubeMesh } from './tube-mesh.js';

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
/** Unit vector from the target towards the camera: azimuth from −Z towards +X, elevation above the floor. */
const dirFrom = (az, el) => new THREE.Vector3(Math.cos(el * DEG) * Math.sin(az * DEG), Math.sin(el * DEG), -Math.cos(el * DEG) * Math.cos(az * DEG));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function createViewer(container, { quality = 'high' } = {}) {
  const high = quality !== 'medium';
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 2 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);
  const labelRenderer = new CSS2DRenderer();
  Object.assign(labelRenderer.domElement.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none' });
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = makeGradientBackground();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(renderer), 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 10, 60000);
  camera.position.set(1500, 1200, 2200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.maxPolarAngle = Math.PI * 0.495;

  // Lights: warm key (shadows), cool fill, rim.
  const key = new THREE.DirectionalLight(0xfff0dc, 2.1);
  key.castShadow = true;
  key.shadow.mapSize.set(high ? 4096 : 2048, high ? 4096 : 2048);
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 1.5;
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.7);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  scene.add(key, key.target, fill, fill.target, rim, rim.target);
  scene.add(new THREE.HemisphereLight(0xeef3ff, 0x8a8478, 0.35));

  // 'high': RenderPass → GTAO → OutputPass (tone mapping + sRGB) on a multisampled HDR target.
  // 'medium' renders straight to the canvas without post-processing.
  let composer = null, gtao = null;
  if (high) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    gtao = new GTAOPass(scene, camera, 1, 1);
    composer.addPass(gtao);
    composer.addPass(new OutputPass());
  }

  const M = createMaterials(renderer);
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const world = new THREE.Group(); scene.add(world);
  const labelGroup = new THREE.Group(); scene.add(labelGroup);
  let floor = null, contact = null, machine = null, tools = null, layout = null, OD = 50;
  const tube = new TubeMesh(M);
  world.add(tube.group);
  const visState = {};
  let lastTools = {}, cutaway = false, marker = null, markerS = null, pickCb = null;
  let needsRender = true, cam = null, followMode = false, followGoal = null, lastNow = 0, disposed = false;
  let lastPreset = 'iso', reframePending = true;

  function applyVisibility() {
    const groups = { ...(tools?.vis || {}) };
    groups.machine = [...(machine?.vis.machine || []), ...(tools?.vis.machine || [])];
    groups.collet = machine?.vis.collet || [];
    groups.tube = [tube.group];
    groups.floor = floor ? [floor, contact] : [];
    for (const [g, objs] of Object.entries(groups)) for (const o of objs) o.visible = visState[g] !== false;
    // The swing arm's top plate (not clippable) would hide the cut bend: drop it while the cutaway is on.
    for (const n of ['armTopPlate', 'topWasher']) { const o = machine?.group.getObjectByName(n); if (o) o.visible = !cutaway && visState.machine !== false; }
    labelRenderer.domElement.style.display = visState.labels === false ? 'none' : '';
    needsRender = true;
  }

  function sceneBox() {
    const b = new THREE.Box3();
    if (machine) {
      const mb = machine.bounds;
      b.set(new THREE.Vector3(mb.x0, mb.y0, mb.z0), new THREE.Vector3(mb.x1, 0, mb.z1));
    }
    const tb = tubeBox();
    if (tb) b.union(tb);
    return b;
  }
  function tubeBox() {
    const P = tube.poses;
    if (!P) return null;
    const b = new THREE.Box3(), v = new THREE.Vector3();
    for (let k = 0; k < tube.N; k += Math.max(1, tube.N >> 6)) b.expandByPoint(v.set(P[16 * k + 12], P[16 * k + 13], P[16 * k + 14]));
    const k = tube.N - 1;
    b.expandByPoint(v.set(P[16 * k + 12], P[16 * k + 13], P[16 * k + 14]));
    return b.expandByScalar(OD / 2);
  }

  function fitLights() {
    const b = sceneBox(), c = b.getCenter(new THREE.Vector3()), r = b.getSize(new THREE.Vector3()).length() / 2 || 1000;
    key.target.position.copy(c); fill.target.position.copy(c); rim.target.position.copy(c);
    // Warm key from above-front-right of the iso view (+X, −Z), cool fill from the left, rim from behind.
    key.position.copy(c).add(new THREE.Vector3(0.55, 1.0, -0.45).normalize().multiplyScalar(r * 2));
    fill.position.copy(c).add(new THREE.Vector3(0.2, 0.5, 0.9).normalize().multiplyScalar(r * 2));
    rim.position.copy(c).add(new THREE.Vector3(-0.9, 0.7, 0.3).normalize().multiplyScalar(r * 2));
    scene.fog = new THREE.Fog(0x9a9ea3, r * 3, r * 11); // fades the floor into the horizon colour
    const sc = key.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = r * 0.5; sc.far = r * 3.5;
    sc.updateProjectionMatrix();
  }

  /** Bend head + tooling + a slice of the bed under it (world box). */
  function headBox() {
    const b = new THREE.Box3();
    if (machine) b.setFromObject(machine.head);
    if (tools) for (const g of ['clampDie', 'pressureDie', 'wiperDie']) for (const o of tools.vis[g] || []) b.expandByObject(o);
    if (b.isEmpty()) b.set(new THREE.Vector3(-3 * OD, -2 * OD, -3 * OD), new THREE.Vector3(3 * OD, 2 * OD, 3 * OD));
    return b;
  }

  /** Box of the tube ahead of the bend head (front leg + formed part); null before the first frame. */
  const _fb = new THREE.Box3(), _fv = new THREE.Vector3();
  function frontBox() {
    const P = tube.poses;
    if (!P) return null;
    const clr = layout ? layout.clrMax : 2 * OD, xMin = -1.5 * clr;
    _fb.makeEmpty();
    for (let k = 0; k < tube.N; k++) {
      const o = 16 * k;
      if (k > 0 && P[o + 12] < xMin) continue;
      _fb.expandByPoint(_fv.set(P[o + 12], P[o + 13], P[o + 14]));
    }
    return _fb.expandByScalar(OD / 2);
  }

  /**
   * Distance along `dir` (unit, target → camera) at which every corner of `box` fits the view frustum
   * around `target`, with `margin` (> 1 = air around the box).
   */
  function fitDistance(box, target, dir, margin = 1.1) {
    const fwd = dir.clone().negate();
    const right = new THREE.Vector3().crossVectors(fwd, UP);
    if (right.lengthSq() < 1e-10) right.set(1, 0, 0); else right.normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd);
    const tanV = Math.tan(camera.fov * DEG / 2), tanH = tanV * (camera.aspect || 1.6);
    let d = 0;
    const p = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      p.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(target);
      const z = p.dot(dir);
      d = Math.max(d, z + margin * Math.abs(p.dot(right)) / tanH, z + margin * Math.abs(p.dot(up)) / tanV);
    }
    return d;
  }

  /**
   * True if the sight line target → pos runs through the tube (away from the target) or any machine/tool
   * mesh, or if pos is under the floor. Tube: station centres from the poses; machine: raycast.
   */
  const ray2 = new THREE.Raycaster();
  function blocked(target, pos, skip) {
    if (machine && pos.y < machine.floorY + 50) return true;
    const P = tube.poses, seg = new THREE.Line3(target, pos), q = new THREE.Vector3(), c = new THREE.Vector3();
    if (P) {
      for (let k = 0; k < tube.N; k += 2) {
        c.set(P[16 * k + 12], P[16 * k + 13], P[16 * k + 14]);
        if (c.distanceTo(target) < skip) continue;
        seg.closestPointToPoint(c, true, q);
        if (q.distanceTo(c) < 0.75 * OD) return true;
      }
    }
    if (!machine) return false;
    const dir = pos.clone().sub(target), len = dir.length();
    ray2.set(target, dir.divideScalar(len)); ray2.near = skip; ray2.far = len;
    return ray2.intersectObject(machine.group, true).some((h) => h.object.visible);
  }

  function cameraFor(preset) {
    const clr = layout ? layout.clrMax : 2 * OD;
    const tb = tubeBox(), hb = headBox();
    const union = hb.clone(); if (tb) union.union(tb);
    // A slice of the bed below the head so the machine reads as standing on something.
    if (machine) union.min.y = Math.min(union.min.y, machine.bedTopY - 0.25 * (machine.bedTopY - machine.floorY));
    const at = (target, dir, box, margin) => ({ target, pos: target.clone().addScaledVector(dir, fitDistance(box, target, dir, margin)) });
    switch (preset) {
      case 'top': {
        const t = union.getCenter(new THREE.Vector3());
        return at(t, new THREE.Vector3(0, 1, 1e-3).normalize(), union, 1.06);
      }
      case 'front': {
        const t = union.getCenter(new THREE.Vector3());
        return at(t, dirFrom(90, 8), union, 1.08);
      }
      case 'head': {
        // Tangent point seen from the die side at low elevation: tube entering the groove, clamp die,
        // pressure die and wiper. First candidate whose sight line is free of the tube and the machine.
        const t = new THREE.Vector3(0, 0, 0);
        const dMin = 3 * Math.max(clr, 2 * OD);
        const box = new THREE.Box3(new THREE.Vector3(-3 * OD, -OD / 2, -OD / 2), new THREE.Vector3(OD, OD / 2, OD / 2));
        if (tools) for (const g of ['clampDie', 'pressureDie', 'wiperDie']) for (const o of tools.vis[g] || []) if (o.visible !== false) box.expandByObject(o);
        let best = null;
        // With the cutaway on, look down into the cut (mandrel balls inside the bend) instead.
        const cands = cutaway ? [[-40, 50], [-60, 48], [-20, 55], [-50, 65]]
          : [[-50, 22], [-65, 20], [-35, 24], [-80, 20], [-20, 26], [-100, 22], [-50, 34], [-30, 42]];
        for (const [az, el] of cands) {
          const dir = dirFrom(az, el);
          const c = { target: t, pos: t.clone().addScaledVector(dir, Math.max(dMin, fitDistance(box, t, dir, 1.15))) };
          if (!blocked(t, c.pos, 1.6 * OD)) return c;
          best ??= c;
        }
        return best;
      }
      case 'follow': {
        const fb = frontBox() || union, ft = fb.getCenter(new THREE.Vector3());
        const dir = camera.position.clone().sub(controls.target).normalize();
        if (dir.y < Math.sin(25 * DEG)) dir.copy(dirFrom(40, 30));
        return at(ft, dir, fb, 1.25);
      }
      default: {
        // Front-right, ~35° above: the whole formed part, the bend head and some bed.
        const t = union.getCenter(new THREE.Vector3());
        return at(t, dirFrom(42, 35), union, 1.06);
      }
    }
  }

  function setCamera(preset, { instant = false } = {}) {
    lastPreset = preset; if (tube.poses) reframePending = false;
    followMode = preset === 'follow';
    const to = cameraFor(preset);
    if (instant) { camera.position.copy(to.pos); controls.target.copy(to.target); controls.update(); cam = null; }
    else cam = { t0: performance.now(), dur: 900, fromPos: camera.position.clone(), fromTarget: controls.target.clone(), to };
    needsRender = true;
  }

  function setCutaway(on) {
    cutaway = !!on;
    for (const m of M.clippable) { m.clippingPlanes = cutaway ? [cutPlane] : null; m.clipShadows = true; m.needsUpdate = true; }
    // GTAO's normal/depth pass uses an override material that ignores per-material clipping planes.
    if (gtao) gtao.enabled = !cutaway;
    applyVisibility();
  }

  function updateMarker() {
    if (!marker) return;
    marker.visible = markerS != null && !!tube.poses;
    if (!marker.visible) return;
    tube.poseAt(markerS, marker.matrix);
    marker.matrixWorldNeedsUpdate = true;
  }

  // ── public API ──
  const api = {
    renderer, scene, camera, controls, materials: M,
    setup({ OD: od, plan, material }) {
      OD = od;
      if (machine) { world.remove(machine.group); }
      if (tools) { world.remove(tools.mandrel); }
      layout = computeHeadLayout(OD, plan);
      machine = buildMachine({ OD, plan, layout, materials: M });
      tools = buildTools({ OD, plan, layout, materials: M });
      machine.mountTools(tools);
      world.add(machine.group, tools.mandrel);
      applyTubeTint(M, material);
      if (!floor) {
        const tex = M.textures.concrete;
        for (const t of [tex.map, tex.roughnessMap]) t.repeat.set(30, 30); // 1.2 m slabs
        floor = new THREE.Mesh(new THREE.PlaneGeometry(36000, 36000), M.floor);
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor';
        scene.add(floor);
      }
      floor.position.y = machine.floorY;
      if (!contact) { contact = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), M.contactShadow); contact.name = 'contactShadow'; contact.renderOrder = 1; scene.add(contact); }
      { const mb = machine.bounds; contact.scale.set((mb.x1 - mb.x0) * 1.12, 1, (mb.z1 - mb.z0) * 1.6); contact.position.set((mb.x0 + mb.x1) / 2, machine.floorY + 0.5, (mb.z0 + mb.z1) / 2); }
      if (!marker) {
        marker = new THREE.Group(); marker.matrixAutoUpdate = false; marker.name = 'sectionMarker';
        scene.add(marker);
      }
      marker.clear();
      const disc = new THREE.Mesh(new THREE.RingGeometry(OD / 2 + 0.5, OD / 2 + 0.22 * OD, 64).rotateY(Math.PI / 2), M.marker);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(OD / 2 + 0.6, Math.max(0.6, 0.015 * OD), 8, 96).rotateY(Math.PI / 2), M.markerRing);
      marker.add(disc, ring); marker.visible = false;
      api.setFrame({ poses: null, formed: null, tools: {} });
      fitLights();
      if (gtao) {
        const r = Math.min(120, Math.max(40, 1.1 * OD)); // ≈ 70 mm for OD 63.5
        gtao.updateGtaoMaterial({ radius: r, thickness: r, distanceExponent: 1.5, distanceFallOff: 1, scale: 1, samples: 16 });
        gtao.updatePdMaterial({ radius: 6 });
        gtao.blendIntensity = 0.85;
      }
      applyVisibility();
      setCamera('iso', { instant: true });
      reframePending = true;
    },
    buildTube(opts) {
      tube.build(opts);
      applyVisibility();
      needsRender = true;
    },
    setFrame({ poses, formed, tools: st }) {
      lastTools = st || {};
      if (poses) tube.update(poses, formed);
      if (machine) {
        const hp = machine.update(lastTools);
        tools.update(lastTools, layout, hp.clr, machine.rodRearX);
      }
      updateMarker();
      // setup() frames the camera before any pose exists: reframe once the first poses arrive.
      if (poses && reframePending) { reframePending = false; setCamera(lastPreset, { instant: true }); }
      if (followMode) { const fb = frontBox(); if (fb) followGoal = fb.getCenter(followGoal || new THREE.Vector3()); }
      needsRender = true;
    },
    setVisible(group, on) { visState[group] = !!on; applyVisibility(); },
    setColorMode(mode) { tube.setColorMode(mode); needsRender = true; },
    getLegend(mode) { return tube.getLegend(mode ?? tube.mode); },
    setCutaway,
    setCamera: (p) => setCamera(p),
    setLabels(list = []) {
      for (const o of [...labelGroup.children]) { o.element?.remove(); labelGroup.remove(o); }
      for (const { position, text } of list) {
        const el = document.createElement('div');
        el.className = 'scene-label';
        el.textContent = text;
        Object.assign(el.style, { font: '500 12px/1.2 system-ui, sans-serif', color: '#1d2026', background: 'rgba(255,255,255,0.86)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' });
        const o = new CSS2DObject(el);
        o.position.set(...position);
        labelGroup.add(o);
      }
      needsRender = true;
    },
    setSectionMarker(s) { markerS = Number.isFinite(s) ? s : null; updateMarker(); needsRender = true; },
    onPick(cb) { pickCb = cb; },
    getMachineVolumes() { return machine ? machine.volumes() : []; },
    resize() {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      renderer.setSize(w, h); labelRenderer.setSize(w, h);
      if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
      camera.aspect = w / h; camera.updateProjectionMatrix();
      needsRender = true;
    },
    renderNow() { render(); },
    dispose() {
      disposed = true;
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose(); tube.dispose(); envRT.dispose();
      if (composer) { gtao.dispose(); composer.dispose(); }
      scene.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
      renderer.dispose();
      renderer.domElement.remove(); labelRenderer.domElement.remove();
    },
  };

  // Picking (click without drag).
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let downAt = null;
  const onDown = (e) => { downAt = [e.clientX, e.clientY]; };
  const onUp = (e) => {
    if (!downAt || !pickCb || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = tube.pick(ray);
    if (hit) pickCb(hit);
  };
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  controls.addEventListener('change', () => { needsRender = true; });

  function render() {
    if (composer) composer.render(); else renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
  function loop(now) {
    if (disposed) return;
    requestAnimationFrame(loop);
    if (cam) {
      const k = Math.min(1, (now - cam.t0) / cam.dur), e = ease(k);
      camera.position.lerpVectors(cam.fromPos, cam.to.pos, e);
      controls.target.lerpVectors(cam.fromTarget, cam.to.target, e);
      if (k >= 1) cam = null;
      needsRender = true;
    }
    // Follow: glide target and camera together towards the front portion of the tube (critically damped).
    const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0; lastNow = now;
    if (followMode && !cam && followGoal && dt > 0) {
      const delta = followGoal.clone().sub(controls.target);
      if (delta.lengthSq() > 0.01) {
        delta.multiplyScalar(1 - Math.exp(-dt / 0.35));
        controls.target.add(delta); camera.position.add(delta);
        needsRender = true;
      }
    }
    if (controls.update()) needsRender = true;
    if (needsRender) { needsRender = false; render(); }
  }
  const ro = new ResizeObserver(() => api.resize());
  ro.observe(container);
  api.resize();
  requestAnimationFrame(loop);
  return api;
}
