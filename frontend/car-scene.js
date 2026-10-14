import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Browser-only presentation component: no MVC data or server behavior here.
export async function mountCarScene(stage) {
  const viewport = stage.querySelector('[data-car-viewport]');
  const status = stage.querySelector('[data-car-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Turuncu Ferrari 458 Italia üç boyutlu araç görünümü');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x606070, .6));
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(3, 5, -2);
  scene.add(light);
  const draco = new DRACOLoader().setDecoderPath('/build/draco/');
  draco.setWorkerLimit(1);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let frame = 0, lastTime = 0, visible = false, disposed = false;
  let paused = false;
  let targetRotation = -.3;
  let model, resizeObserver, visibilityObserver;
  let timeout;

  function dispose() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timeout);
    cancelAnimationFrame(frame);
    events.abort();
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    draco.dispose();
    const textures = new Set();
    const materials = new Set();
    scene.traverse(object => {
      object.geometry?.dispose();
      if (object.material) for (const material of [object.material].flat()) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  function fallback() {
    stage.dataset.state = 'fallback';
    status.textContent = '3D görünüm açılamadı. Araç illüstrasyonu gösteriliyor.';
    dispose();
  }
  try {
    const gltf = await Promise.race([
      loader.loadAsync('/models/ferrari.glb'),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Model load timeout')), 20000); })
    ]);
    clearTimeout(timeout);
    model = gltf.scene;
    const body = model.getObjectByName('body');
    if (body) {
      body.material = new THREE.MeshPhysicalMaterial({ color: 0xc94b2b, metalness: .75, roughness: .22, clearcoat: 1 });
    }
    const glass = model.getObjectByName('glass');
    if (glass) glass.material = new THREE.MeshPhysicalMaterial({ color: 0x8babb8, metalness: .2, roughness: .15, transparent: true, opacity: .65 });
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const group = new THREE.Group();
    group.add(model);
    scene.add(group);
    model = group;
    model.rotation.y = -.3;
    const size = box.getSize(new THREE.Vector3());
    const radius = size.length() / 2;
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, .025, 96), new THREE.MeshStandardMaterial({color: 0x151719, metalness: .5, roughness: .4}));
    platform.position.y = -size.y / 2 - .05;
    scene.add(platform);
    viewport.appendChild(renderer.domElement);
    function render() { if (!disposed) renderer.render(scene, camera); }
    function resize() {
      const {width, height} = viewport.getBoundingClientRect();
      if (!width || !height || disposed) return;
      camera.aspect = width / height;
      const halfFov = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
      const distance = radius / Math.sin(halfFov) * .93;
      camera.position.set(.85, .24, -1).normalize().multiplyScalar(distance);
      camera.lookAt(0, -.1, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    }
    function tick(time) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (!paused) targetRotation += Math.min((time - (lastTime || time)) / 1000, .05) * .35;
      model.rotation.y += (targetRotation - model.rotation.y) * .12;
      if (Math.abs(targetRotation - model.rotation.y) < .001) model.rotation.y = targetRotation;
      lastTime = time;
      render();
      if (!paused || model.rotation.y !== targetRotation) frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0; lastTime = 0;
      if (!disposed && visible && !document.hidden && (!paused || model.rotation.y !== targetRotation)) frame = requestAnimationFrame(tick);
    }
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    visibilityObserver.observe(stage);
    
    let isDragging = false, lastPointerX = 0;
    viewport.style.cursor = 'grab';
    viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastPointerX = e.clientX;
      viewport.style.cursor = 'grabbing';
      if (viewport.setPointerCapture) viewport.setPointerCapture(e.pointerId);
    }, { signal: events.signal });
    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      targetRotation += deltaX * 0.008;
      sync();
    }, { signal: events.signal });
    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      viewport.style.cursor = 'grab';
    };
    viewport.addEventListener('pointerup', endDrag, { signal: events.signal });
    viewport.addEventListener('pointercancel', endDrag, { signal: events.signal });
    reducedMotion.addEventListener('change', () => { sync(); }, { signal: events.signal });

    document.addEventListener('visibilitychange', sync, {signal: events.signal});
    window.addEventListener('pagehide', dispose, {once: true, signal: events.signal});
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); }, {signal: events.signal});
    resize(); sync();
    stage.dataset.state = 'ready';
    status.textContent = 'Ferrari 458 Italia / Stüdyo görünümü';
    draco.dispose();
  } catch (error) {
    fallback();
    throw error;
  }
}
