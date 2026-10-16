// 3D viewer: a dumb renderer fed by the app glue (see docs/INTERFACES.md §8).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { createMaterials, applyTubeTint, makeGradientBackground } from './materials.js';
import { computeHeadLayout, buildTools } from './tools.js';
import { buildMachine } from './machine.js';
import { TubeMesh } from './tube-mesh.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function createViewer(container, { quality = 'high' } = {}) {
  const high = quality !== 'medium';
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 2 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
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
  const key = new THREE.DirectionalLight(0xfff0dc, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(high ? 4096 : 2048, high ? 4096 : 2048);
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 1.5;
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.7);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  scene.add(key, key.target, fill, fill.target, rim, rim.target);
  scene.add(new THREE.HemisphereLight(0xeef3ff, 0x8a8478, 0.35));

  const M = createMaterials(renderer);
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const world = new THREE.Group(); scene.add(world);
  const labelGroup = new THREE.Group(); scene.add(labelGroup);
  let floor = null, contact = null, machine = null, tools = null, layout = null, OD = 50;
  const tube = new TubeMesh(M);
  world.add(tube.group);
  const visState = {};
  let lastTools = {}, cutaway = false, marker = null, markerS = null, pickCb = null;
  let needsRender = true, cam = null, followMode = false, disposed = false;

  function applyVisibility() {
    const groups = { ...(tools?.vis || {}) };
    groups.machine = [...(machine?.vis.machine || []), ...(tools?.vis.machine || [])];
    groups.collet = machine?.vis.collet || [];
    groups.tube = [tube.group];
    groups.floor = floor ? [floor, contact] : [];
    for (const [g, objs] of Object.entries(groups)) for (const o of objs) o.visible = visState[g] !== false;
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
    scene.fog = new THREE.Fog(0x9da2a8, r * 4, r * 14);
    const sc = key.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = r * 0.5; sc.far = r * 3.5;
    sc.updateProjectionMatrix();
  }

  function cameraFor(preset) {
    const b = sceneBox(), size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const fov = camera.fov * Math.PI / 180, aspect = camera.aspect || 1.6;
    const fit = (r) => r / Math.sin(Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * aspect)) / 2);
    const clr = layout ? layout.clrMax : 2 * OD;
    switch (preset) {
      case 'top': {
        const r = 0.5 * Math.max(size.x, size.z * aspect);
        return { target: c.clone(), pos: c.clone().add(new THREE.Vector3(0, fit(r) * 0.95, 1)) };
      }
      case 'front': {
        const r = 0.5 * Math.max(size.x, size.y * aspect) * 0.95;
        return { target: c.clone(), pos: c.clone().add(new THREE.Vector3(0, size.y * 0.08, fit(r))) };
      }
      case 'head': {
        // Low view into the groove from the die side: tube in the groove, clamp, pressure die and wiper.
        const t = new THREE.Vector3(-0.2 * clr, 0, -0.35 * clr);
        const d = Math.max(7 * OD, 3.6 * (clr + OD));
        return { target: t, pos: t.clone().add(new THREE.Vector3(0.75, 0.42, -0.95).normalize().multiplyScalar(d)) };
      }
      case 'follow': {
        const tb = tubeBox() || b, tc = tb.getCenter(new THREE.Vector3());
        const r = tb.getSize(new THREE.Vector3()).length() / 2;
        return { target: tc, pos: tc.clone().add(new THREE.Vector3(0.45, 0.6, 0.85).normalize().multiplyScalar(fit(r) * 1.05)) };
      }
      default: {
        // Front-right, slightly above: bend head + formed legs + front part of the bed.
        const tb = tubeBox(), hb = new THREE.Box3(new THREE.Vector3(-6 * OD - clr, (machine?.floorY ?? -800) * 0.6, -clr - 3 * OD), new THREE.Vector3(clr + 2 * OD, 2 * OD, 3 * OD));
        if (tb) { const fb = tb.clone(); fb.min.x = Math.max(fb.min.x, -8 * OD); hb.union(fb); }
        const hc = hb.getCenter(new THREE.Vector3()), r = hb.getSize(new THREE.Vector3()).length() / 2;
        return { target: hc, pos: hc.clone().add(new THREE.Vector3(0.75, 0.5, -0.9).normalize().multiplyScalar(fit(r) * 0.9)) };
      }
    }
  }

  function setCamera(preset, { instant = false } = {}) {
    followMode = preset === 'follow';
    const to = cameraFor(preset);
    if (instant) { camera.position.copy(to.pos); controls.target.copy(to.target); controls.update(); cam = null; }
    else cam = { t0: performance.now(), dur: 900, fromPos: camera.position.clone(), fromTarget: controls.target.clone(), to };
    needsRender = true;
  }

  function setCutaway(on) {
    cutaway = !!on;
    for (const m of M.clippable) { m.clippingPlanes = cutaway ? [cutPlane] : null; m.clipShadows = true; m.needsUpdate = true; }
    needsRender = true;
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
      applyVisibility();
      setCamera('iso', { instant: true });
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
      if (followMode && !cam) { const to = cameraFor('follow'); controls.target.lerp(to.target, 0.15); }
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
    renderer.render(scene, camera);
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
    if (controls.update()) needsRender = true;
    if (needsRender) { needsRender = false; render(); }
  }
  const ro = new ResizeObserver(() => api.resize());
  ro.observe(container);
  api.resize();
  requestAnimationFrame(loop);
  return api;
}
