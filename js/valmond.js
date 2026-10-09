/* Valmond sahifasi: sarlavha, paydo bo'lish effekti va 3D korobka (Three.js) */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sarlavha: pastga tushganda fon paydo bo'ladi
const head = document.querySelector("[data-head]");
const onScroll = () => head.classList.toggle("is-solid", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Yil
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Paydo bo'lish
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + "s";
  io.observe(el);
});

// ——— 3D: korobka (data-stage="box", ochiladi) va pachka (data-stage="pack") ———
const conn = navigator.connection;
const slow = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""));
let libs;
const loadLibs = () => (libs ||= Promise.all([
  import("three"),
  import("three/addons/loaders/GLTFLoader.js"),
  import("three/addons/controls/OrbitControls.js"),
  import("three/addons/environments/RoomEnvironment.js"),
]));
if (!slow) {
  // Model blok ko'rinishga yaqinlashganda yuklanadi
  const lazy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      lazy.unobserve(e.target);
      init3d(e.target).catch((err) => console.warn("Valmond 3D yuklanmadi, rasm ko'rsatiladi:", err));
    });
  }, { rootMargin: "300px" });
  document.querySelectorAll("[data-stage]").forEach((s) => lazy.observe(s));
}

async function init3d(stage) {
  const [THREE, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }] = await loadLibs();
  const isBox = stage.dataset.stage === "box";
  const host = stage.querySelector("[data-canvas]");
  const pull = stage.querySelector("[data-pull]");
  const pullLabel = stage.querySelector("[data-pull-label]");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Teksturalarda suratdagi yorug'lik bor: Neutral ranglarni o'zgartirmaydi, ACES esa oqartirib "multfilm" qiladi
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10);

  // Yumshoq neytral asosiy yorug'lik (chap-yuqoridan, deraza kabi)
  const key = new THREE.DirectionalLight(0xfffaf3, 1.35);
  key.position.set(-0.25, 0.7, 0.35);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.002;
  Object.assign(key.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45, near: 0.05, far: 2 });
  scene.add(key);

  const gltf = await new GLTFLoader().loadAsync(stage.dataset.model);
  const model = gltf.scene;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.map) m.map.anisotropy = maxAniso;
      // Karton va qog'oz — mat, plastmassadek yaltiramasin
      if ("roughness" in m) m.roughness = Math.max(m.roughness ?? 1, 0.8);
      if ("metalness" in m) m.metalness = 0;
      // Pachka teksturasi suratdan sarg'ish-yashil chiqqan: asl och krem rangga yaqinlashtiramiz
      if (/parchment|pack_/i.test(m.name) && m.color) m.color.setRGB(1.0, 0.955, 0.975);
    });
  });

  // Markazlash: model markazi (0,0,0) da
  const bbox = new THREE.Box3().setFromObject(model);
  const size = bbox.getSize(new THREE.Vector3());
  model.position.sub(bbox.getCenter(new THREE.Vector3()));
  scene.add(model);
  const floorY = -size.y / 2 - 0.0005;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.ShadowMaterial({ opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = floorY;
  ground.receiveShadow = true;
  scene.add(ground);

  // Kontakt soyasi: narsa stolga tegib turgandek ko'rinsin
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const g = cv.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(40,28,20,.55)");
  grd.addColorStop(0.55, "rgba(40,28,20,.22)");
  grd.addColorStop(1, "rgba(40,28,20,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 1.25, size.z * 1.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = floorY + 0.0003;
  contact.renderOrder = -1;
  scene.add(contact);

  // Ochiladigan qismlar
  const drawer = model.getObjectByName("Drawer");
  const packs = [1, 2, 3, 4].map((n) => model.getObjectByName("Butter_200g_" + n)).filter(Boolean);
  const drawerX = drawer ? drawer.position.x : 0;
  const packBase = packs.map((p) => p.position.clone());
  const slide = isBox ? size.x * 1.015 : 0; // tortma g'ilofdan to'liq chiqadi (modeldagi 0,243 ga teng)
  const lift = size.y * 0.55;               // pachkalar qancha ko'tariladi

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.rotateSpeed = 0.7;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.42;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.7;
  renderer.domElement.style.touchAction = "pan-y"; // telefonda sahifa vertikal suriladi

  let resumeTimer;
  const pauseSpin = () => { controls.autoRotate = false; clearTimeout(resumeTimer); };
  const resumeSpin = () => {
    clearTimeout(resumeTimer);
    if (!reduce) resumeTimer = setTimeout(() => (controls.autoRotate = true), 5000);
  };
  controls.addEventListener("start", pauseSpin);
  controls.addEventListener("end", resumeSpin);

  const dir = new THREE.Vector3(0.42, 0.72, 1).normalize();
  // Kamera masofasi: yopiqda korobkaga, ochiqda butun tortmaga moslanadi
  let distClosed = 1, distOpen = 1, openD = 0;
  function applyDist() {
    const off = camera.position.clone().sub(controls.target);
    if (off.lengthSq() === 0) off.copy(dir);
    off.setLength(distClosed + (distOpen - distClosed) * openD);
    camera.position.copy(controls.target).add(off);
  }
  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const k = (isBox ? 0.9 : 1.15) / Math.sin(Math.min(vFov, hFov) / 2);
    distClosed = (Math.hypot(size.x * 1.2, size.z) / 2) * k;
    distOpen = (Math.hypot(size.x + slide, size.z) / 2) * k * 1.05;
    applyDist();
  }
  camera.position.copy(dir);
  fit();
  new ResizeObserver(fit).observe(host);

  // Ochilish holati: t = 0 (yopiq) .. 1 (ochiq, pachkalar ko'tarilgan)
  let t = 0, target = 0, holding = false;
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (x, a, b) => ease((x - a) / (b - a));
  const DRAWER_END = 0.55;
  function applyOpen() {
    const d = Math.min(1, t / DRAWER_END); // tortma barmoqqa aynan ergashadi
    if (drawer) drawer.position.x = drawerX + d * slide;
    packs.forEach((p, i) => {
      // tortma to'liq chiqqandan keyingina ko'tariladi (g'ilofni teshmasligi uchun)
      const a = 0.58 + i * 0.07;
      const k = seg(t, a, a + 0.21);
      p.position.y = packBase[i].y + k * lift;
      p.rotation.z = k * 0.05 * (i % 2 ? -1 : 1);
    });
    contact.scale.x = 1 + d * (slide / size.x);
    contact.position.x = (d * slide) / 2;
    const nx = d * slide * 0.5;
    camera.position.x += nx - controls.target.x; // kamera ham birga siljiydi
    controls.target.set(nx, 0, 0);
    openD = d;
    applyDist();
    if (pull && !holding) pull.value = Math.round(t * 1000);
    if (pull) stage.style.setProperty("--pull", t);
    if (pullLabel) { const txt = t > 0.5 ? pullLabel.dataset.close : pullLabel.dataset.open; if (pullLabel.textContent !== txt) pullLabel.textContent = txt; }
  }
  const settle = () => { holding = false; target = t > 0.3 ? 1 : 0; resumeSpin(); };

  if (isBox) {
    // 1) Pastdagi tortqich (input range — klaviatura bilan ham ishlaydi)
    if (pull) {
      pull.addEventListener("input", () => {
        holding = true; pauseSpin(); stage.classList.add("was-pulled");
        t = target = pull.value / 1000;
        applyOpen();
      });
      pull.addEventListener("change", settle);
    }

    // 2) Korobkaning o'zini ushlab tortish: tortma o'qi bo'ylab
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    const toScreen = (v) => {
      const p = v.clone().project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return new THREE.Vector2((p.x + 1) / 2 * r.width, (1 - p.y) / 2 * r.height);
    };
    let drag = null;
    host.addEventListener("pointerdown", (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      if (!ray.intersectObject(model, true).length) return; // bo'sh joy — aylantirish
      controls.enabled = false; // bu bosish aylantirmaydi, tortadi
      pauseSpin();
      const a = toScreen(new THREE.Vector3(controls.target.x, 0, 0));
      const b = toScreen(new THREE.Vector3(controls.target.x + slide, 0, 0));
      const axis = b.sub(a);
      drag = { x: e.clientX, y: e.clientY, t0: t, axis, len2: Math.max(axis.lengthSq(), 1), id: e.pointerId };
      try { host.setPointerCapture(e.pointerId); } catch {}
      host.classList.add("is-pulling");
    }, { capture: true });
    host.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      const along = (dx * drag.axis.x + dy * drag.axis.y) / drag.len2; // tortma yo'liga nisbatan ulush
      holding = true;
      stage.classList.add("was-pulled");
      t = target = Math.min(1, Math.max(0, drag.t0 + along * DRAWER_END));
      applyOpen();
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6;
      drag = null;
      controls.enabled = true;
      host.classList.remove("is-pulling");
      if (!moved) { holding = false; target = t > 0.3 ? 0 : 1; resumeSpin(); } // oddiy bosish — ochadi/yopadi
      else settle();
    };
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
  }

  // Faqat ko'rinib turganda chizish
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!visible) return;
    if (!holding && t !== target) {
      // bir tekis tezlik, oxirida sekinlashadi; qo'yib yuborilganda sakramaydi
      const delta = target - t;
      const speed = Math.min(reduce ? 3 : 0.65, Math.abs(delta) * 3 + 0.05);
      t += Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
      if (Math.abs(target - t) < 0.001) t = target;
      applyOpen();
    }
    controls.update();
    renderer.render(scene, camera);
  });

  stage.classList.add("is-3d");
}
