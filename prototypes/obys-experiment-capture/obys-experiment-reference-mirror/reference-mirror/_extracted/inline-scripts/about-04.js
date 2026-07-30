(async function () {
  const root = document.getElementById('obys-bottom-sphere-stable');
  const stage = root.querySelector('.obys-bottom-sphere-stage');
  const errorBox = root.querySelector('.obys-bottom-sphere-error');

  function showError(message) {
    console.error('[Obys bottom sphere]', message);
    errorBox.style.display = 'block';
    errorBox.textContent = String(message && message.message ? message.message : message);
  }

  try {
    const THREE = await import('./assets/js/vendor/three.module.min.js');

    const CONFIG = {
      playing: true,
      rotationSpeed: 0.34,
      scale: 8.5,
      shapeSize: 0.8,
      imageCount: 32,
      parallax: 0.8,
      fluidity: 0.05,
      sphereVerticalOffset: -3.3,
      imageShape: "Original"
    };

    const washOverlay = document.createElement('div');
    washOverlay.className = 'obys-sphere-wash';

    window.__obysSetMode = function(isPride) {
      const canvas = renderer.domElement;
      if (isPride) {
        canvas.style.filter = 'none';
        washOverlay.style.opacity = '0';
      } else {
        canvas.style.filter = 'grayscale(1)';
        washOverlay.style.opacity = '0.4';
      }
    };

    const MY_IMAGES = [
      "assets/img-b44/1ff19066e_images_0_mpqpz3ky.jpg",
      "assets/img-b44/bf06f7bb9_images_1_mpqpz3ky.jpg",
      "assets/img-b44/918583cb1_images_2_mpqpz3ky.jpg",
      "assets/img-b44/28443dab3_images_3_mpqpz3ky.jpg",
      "assets/img-b44/456c3b1d7_images_4_mpqpz3ky.jpg",
      "assets/img-b44/eec4749f2_images_5_mpqpz3ky.jpg",
      "assets/img-b44/4062d0cea_images_6_mpqpz3ky.jpg",
      "assets/img-b44/405ad3717_images_7_mpqpz3ky.jpg",
      "assets/img-b44/c2a9de195_images_8_mpqpz3ky.jpg",
      "assets/img-b44/b3b95f59b_images_9_mpqpz3ky.jpg",
      "assets/img-b44/6fe606841_images_10_mpqpz3ky.jpg",
      "assets/img-b44/db878b423_images_11_mpqpz3kz.jpg",
      "assets/img-b44/d6f509230_images_12_mpqpz3kz.jpg",
      "assets/img-b44/14a4ffb8c_images_13_mpqpz3kz.jpg",
      "assets/img-b44/98db644cf_images_14_mpqpz3kz.jpg",
      "assets/img-b44/7554719ad_images_15_mpqpz3kz.jpg",
      "assets/img-b44/c7a438347_images_16_mpqpz3kz.jpg",
      "assets/img-b44/116c0fffa_images_17_mpqpz3kz.jpg",
      "assets/img-b44/e5a9125b7_images_18_mpqpz3l0.jpg",
      "assets/img-b44/dece359c8_images_19_mpqpz3l0.jpg",
      "assets/img-b44/ca73f66b6_images_20_mpqpz3l0.jpg",
      "assets/img-b44/e0b928cf4_images_21_mpqpz3l0.jpg",
      "assets/img-b44/aab5cab67_images_22_mpqpz3l0.jpg",
      "assets/img-b44/a0f45ce09_images_23_mpqpz3l0.jpg",
      "assets/img-b44/cc93c32b3_images_24_mpqpz3l1.jpg",
      "assets/img-b44/983a69642_images_25_mpqpz3l1.jpg",
      "assets/img-b44/9e2309c2e_images_26_mpqpz3l1.jpg",
      "assets/img-b44/5fa301c63_images_27_mpqpz3l1.jpg",
      "assets/img-b44/64fec2a04_images_28_mpqpz3l1.jpg",
      "assets/img-b44/2e01fb040_images_29_mpqpz3l2.jpg",
      "assets/img-b44/346775d34_images_30_mpqpz3l2.jpg",
      "assets/img-b44/a25ec1ff0_images_31_mpqpz3l2.jpg"
    ];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.appendChild(renderer.domElement);
    stage.appendChild(washOverlay);

    renderer.domElement.style.filter = 'grayscale(1)';

    const clock = new THREE.Clock();
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    let planes = [];
    let globalAngle = 0;
    const cameraTarget = new THREE.Vector3();
    const mouse = new THREE.Vector2(0, 0);
    const dummy = new THREE.Object3D();

    function sizeNow() {
      const rect = stage.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width || root.clientWidth || window.innerWidth || 1));
      const h = Math.max(1, Math.round(rect.height || root.clientHeight || window.innerHeight * 0.8 || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    sizeNow();
    requestAnimationFrame(sizeNow);
    window.addEventListener('resize', sizeNow);
    if ('ResizeObserver' in window) new ResizeObserver(sizeNow).observe(root);

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    }, { passive: true });

    const textureLoader = new THREE.TextureLoader();
    function loadTexture(src) {
      return new Promise((resolve) => {
        textureLoader.load(src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve({ texture: tex, aspect: tex.image.width / tex.image.height });
        }, undefined, () => resolve(null));
      });
    }

    function calculateTargets() {
      const N = planes.length;
      for (let i = 0; i < N; i++) {
        const plane = planes[i];
        const phi = Math.acos(1 - 2 * (i + 0.5) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        plane.target.position.set(
          CONFIG.scale * Math.cos(theta) * Math.sin(phi),
          CONFIG.scale * Math.sin(theta) * Math.sin(phi),
          CONFIG.scale * Math.cos(phi)
        );
        dummy.position.copy(plane.target.position);
        dummy.lookAt(0, 0, 0);
        dummy.rotateY(Math.PI);
        plane.target.quaternion.copy(dummy.quaternion);
      }
    }

    async function updatePlanes() {
      const textures = await Promise.all(MY_IMAGES.map(loadTexture));
      const usable = textures.filter(Boolean);
      for (let i = 0; i < CONFIG.imageCount; i++) {
        const item = usable[i % Math.max(1, usable.length)];
        const aspect = item ? item.aspect : 1.333;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2 * aspect, 2),
          new THREE.MeshBasicMaterial({ map: item ? item.texture : null, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        sceneGroup.add(mesh);
        planes.push({ mesh, target: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() } });
      }
      calculateTargets();
    }

    await updatePlanes();

    const isPride = localStorage.getItem('obys-color-mode') === 'calm';
    if (isPride) window.__obysSetMode(true);

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      if (CONFIG.playing) globalAngle += CONFIG.rotationSpeed * delta * 0.5;
      const rotQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), globalAngle);
      const baseZ = 5 + CONFIG.scale * 1.2 * CONFIG.shapeSize;
      sceneGroup.position.y += (CONFIG.sphereVerticalOffset - sceneGroup.position.y) * CONFIG.fluidity;
      for (let i = 0; i < planes.length; i++) {
        const plane = planes[i];
        const spatialPos = plane.target.position.clone().multiplyScalar(CONFIG.shapeSize);
        const floatAmt = 0.05 * CONFIG.scale * CONFIG.shapeSize;
        spatialPos.x += Math.sin(time * 0.5 + i) * floatAmt;
        spatialPos.y += Math.sin(time * 0.6 + i) * floatAmt;
        spatialPos.z += Math.sin(time * 0.7 + i) * floatAmt;
        spatialPos.applyQuaternion(rotQuat);
        const spatialQuat = plane.target.quaternion.clone();
        spatialQuat.premultiply(rotQuat);
        plane.mesh.position.lerp(spatialPos, CONFIG.fluidity);
        plane.mesh.quaternion.slerp(spatialQuat, CONFIG.fluidity);
        plane.mesh.scale.lerp(new THREE.Vector3(CONFIG.shapeSize, CONFIG.shapeSize, CONFIG.shapeSize), CONFIG.fluidity);
      }
      const targetCamX = mouse.x * CONFIG.parallax * CONFIG.scale * 0.5;
      const targetCamY = mouse.y * CONFIG.parallax * CONFIG.scale * 0.5;
      camera.position.x += (targetCamX - camera.position.x) * CONFIG.fluidity;
      camera.position.y += (targetCamY - camera.position.y) * CONFIG.fluidity;
      camera.position.z += (baseZ - camera.position.z) * CONFIG.fluidity;
      cameraTarget.set(mouse.x * CONFIG.parallax * 0.5, mouse.y * CONFIG.parallax * 0.5, 0);
      camera.lookAt(cameraTarget);
      renderer.render(scene, camera);
    }
    animate();

  } catch (err) { showError(err); }
})();
