// Standalone Three.js mode — renderer creates and owns the visible canvas
    var controls = (function() {
      var _v = {"playing":true,"unfold_mode":true,"speed":6,"images":["assets/img-b44/7495a4830_images_0_mppswx2e.jpg","assets/img-b44/f0f381f5f_images_1_mppswx2e.jpg","assets/img-b44/708a34e0e_images_2_mppswx2e.jpg","assets/img-b44/5b0f99834_images_3_mppswx2e.jpg","assets/img-b44/15cb01d9b_images_4_mppswx2e.jpg","assets/img-b44/ef562e48c_images_5_mppswx2f.jpg","assets/img-b44/350c9bcdc_images_6_mppswx2f.jpg","assets/img-b44/f3b40461c_images_7_mppswx2f.jpg","assets/img-b44/d021688f1_images_8_mppswx2f.jpg","assets/img-b44/722b74859_images_9_mppswx2f.jpg","assets/img-b44/ac72be7d7_images_10_mppswx2f.jpg","assets/img-b44/c47114386_images_11_mppswx2g.jpg","assets/img-b44/d4370def2_images_12_mppswx2g.jpg","assets/img-b44/6ac9029ef_images_13_mppswx2g.jpg","assets/img-b44/323ddce74_images_14_mppswx2g.jpg","assets/img-b44/568cd5af5_images_15_mppswx2g.jpg","assets/img-b44/1b7c80409_images_16_mppswx2h.jpg","assets/img-b44/33ea5d4d7_images_17_mppswx2h.jpg","assets/img-b44/54926dcac_images_18_mppswx2h.jpg","assets/img-b44/52fb3b79c_images_19_mppswx2i.jpg","assets/img-b44/294bd5672_images_20_mppswx2i.jpg","assets/img-b44/8222ca7ba_images_21_mppswx2i.jpg","assets/img-b44/dd8fd0bff_images_22_mppswx2i.jpg","assets/img-b44/8bcd2480f_images_23_mppswx2i.jpg","assets/img-b44/95cf96f0d_images_24_mppswx2i.jpg","assets/img-b44/9e118f4a5_images_25_mppswx2i.jpg","assets/img-b44/c7346a14b_images_26_mppswx2i.jpg","assets/img-b44/fd582ba3d_images_27_mppswx2j.jpg","assets/img-b44/4bedde2c4_images_28_mppswx2j.jpg","assets/img-b44/23dcbb7c8_images_29_mppswx2j.jpg","assets/img-b44/9370fb575_images_30_mppswx2j.jpg","assets/img-b44/87f830abf_images_31_mppswx2j.jpg"],"bg_color":"#000000","smoothing":0.1,"scroll_influence":0.5,"radius":1,"page_count":32,"tilt_angle":0,"swing_strength":5,"stagger":0.2,"chaos":2,"shape_tilt_x":-35,"shape_tilt_z":-38,"camera_fov":35,"camera_dist":7,"page_scale":0.97};
      var _defaults = JSON.parse(JSON.stringify(_v));
      function _hexToRgb(hex) {
        var h = String(hex || '').replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16)
        };
      }
      function _clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
      function _hexToRgbaCss(hex, opacity0to100) {
        var rgb = _hexToRgb(hex);
        if (!rgb) return 'rgba(0,0,0,1)';
        var op = opacity0to100 != null && !isNaN(Number(opacity0to100)) ? Number(opacity0to100) : 100;
        var a = _clamp(op, 0, 100) / 100;
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
      }
      var api = {
        get: function(k) { return _v[k]; },
        getAll: function() { return Object.assign({}, _v); },
        getDefaults: function() { return JSON.parse(JSON.stringify(_defaults)); },
        getColorWithAlpha: function(baseKey) { return _hexToRgbaCss(_v[baseKey], _v[baseKey + '_opacity']); },
        set: function(k, v) { _v[k] = v; },
        onChange: function() {},
        onAny: function() {},
        onAction: function() {}
      };
      window.ControlsAPI = api;
      window.ChatoolyControls = api;
      return api;
    })();

    

    // Creative Code
    import * as THREE from './assets/js/vendor/three.module.min.js';

// @clay-no-bg-control
const defaultCanvas = document.getElementById('canvas');
if (defaultCanvas) defaultCanvas.style.display = 'none';

const area = document.querySelector('#obys-rotational-embed .tool-canvas-area');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, area.clientWidth / area.clientHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(area.clientWidth, area.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
area.appendChild(renderer.domElement);

window.renderer = renderer;
window.scene = scene;
window.camera = camera;

// Sculpture Group
const sculptureGroup = new THREE.Group();
scene.add(sculptureGroup);

// Geometry - Fixed 1800x1440 ratio (1.25)
const aspect = 1800 / 1440;
const pageHeight = 1.2;
const pageWidth = pageHeight * aspect; // 1.5
const geometry = new THREE.PlaneGeometry(pageWidth, pageHeight, 1, 1);
// Pivot at the left edge
geometry.translate(pageWidth / 2, 0, 0);

let textures = [];
let pages = [];
let currentImages = [];

function createCroppedTexture(imgUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d');
      
      const imgAspect = img.width / img.height;
      const targetAspect = 1800 / 1440;
      
      let drawW = canvas.width;
      let drawH = canvas.height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgAspect > targetAspect) {
        drawW = canvas.height * imgAspect;
        offsetX = (canvas.width - drawW) / 2;
      } else {
        drawH = canvas.width / imgAspect;
        offsetY = (canvas.height - drawH) / 2;
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = imgUrl;
  });
}

async function loadImages(urls) {
  if (!urls || urls.length === 0) return;
  const newTextures = await Promise.all(urls.map(url => createCroppedTexture(url)));
  textures.forEach(t => { if (t) t.dispose(); });
  textures = newTextures.filter(t => t !== null);
  updateMaterials();
}

function updateMaterials() {
  if (textures.length === 0) return;
  pages.forEach((page, i) => {
    const tex = textures[i % textures.length];
    page.material.map = tex;
    page.material.needsUpdate = true;
  });
}

function buildSculpture(count) {
  pages.forEach(p => {
    sculptureGroup.remove(p);
    p.material.dispose();
  });
  pages = [];
  
  for (let i = 0; i < count; i++) {
    // Pure color rendering, no lighting, no tint
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.05
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.userData = {
      index: i,
      offsetY: (Math.random() - 0.5) * 0.2,
      randPhase: Math.random() * Math.PI * 2,
      randSpeed: 0.5 + Math.random() * 0.5
    };
    
    sculptureGroup.add(mesh);
    pages.push(mesh);
  }
  updateMaterials();
}

window.addEventListener('resize', () => {
  const w = area.clientWidth;
  const h = area.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Interaction
let targetRotation = 0;
let currentRotation = 0;

// Scroll influence now follows the whole page scroll, not only wheel events over the embed.
let lastPageScrollY = window.scrollY || window.pageYOffset || 0;

function updatePageScrollInfluence() {
  const currentScrollY = window.scrollY || window.pageYOffset || 0;
  const scrollDelta = currentScrollY - lastPageScrollY;

  if (scrollDelta !== 0) {
    const influence = controls.get('scroll_influence');
    targetRotation += scrollDelta * 0.003 * influence;
  }

  lastPageScrollY = currentScrollY;
  requestAnimationFrame(updatePageScrollInfluence);
}

updatePageScrollInfluence();

const clock = new THREE.Clock();

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

let unfoldTime = 0;
let progress = 0;

function animate() {
  requestAnimationFrame(animate);
  
  const delta = Math.min(clock.getDelta(), 0.1);
  const isPlaying = controls.get('playing');
  const speed = controls.get('speed') * 0.01;
  const smoothing = controls.get('smoothing');
  const count = controls.get('page_count');
  const radius = controls.get('radius');
  const scale = controls.get('page_scale');
  const tilt = THREE.MathUtils.degToRad(controls.get('tilt_angle'));
  const swing = controls.get('swing_strength') * 0.01;
  const stagger = controls.get('stagger');
  const chaos = controls.get('chaos') * 0.01;
  const unfoldMode = controls.get('unfold_mode');
  
  // Update camera
  camera.fov = controls.get('camera_fov');
  camera.position.z = controls.get('camera_dist');
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  
  // Background
  renderer.setClearColor(controls.get('bg_color'));
  
  // Rebuild if count changes
  if (pages.length !== count) {
    buildSculpture(count);
  }
  
  // Check for image updates
  const images = controls.get('images');
  if (JSON.stringify(images) !== JSON.stringify(currentImages)) {
    currentImages = [...images];
    loadImages(currentImages);
  }
  
  if (isPlaying) {
    const speedMultiplier = 1.0 - (progress * 0.65);
    targetRotation += speed * delta * 10 * speedMultiplier;
  }
  
  // Smooth rotation
  currentRotation += (targetRotation - currentRotation) * smoothing;
  
  // Unfold Logic
  let targetProgress = 0;
  if (unfoldMode) {
    unfoldTime += delta;
    const t = unfoldTime % 12.0;
    if (t < 4.0) {
      targetProgress = 0;
    } else if (t < 7.0) {
      targetProgress = easeInOutQuint((t - 4.0) / 3.0);
    } else if (t < 9.0) {
      targetProgress = 1;
    } else {
      targetProgress = 1 - easeInOutQuint((t - 9.0) / 3.0);
    }
  } else {
    unfoldTime = 0;
    targetProgress = 0;
  }
  
  if (!unfoldMode && progress > 0) {
    progress = Math.max(0, progress - delta * 0.33);
  } else {
    progress = targetProgress;
  }
  
  pages.forEach((page, i) => {
    const ud = page.userData;
    const baseAngle = (i / count) * Math.PI * 2 + currentRotation;
    const relativeAngle = baseAngle - Math.PI / 2;
    
    let wrappedAngle = relativeAngle % (Math.PI * 2);
    if (wrappedAngle > Math.PI) wrappedAngle -= Math.PI * 2;
    if (wrappedAngle < -Math.PI) wrappedAngle += Math.PI * 2;
    
    // 1. Collision-safe Cylinder State
    const minSafeRadius = (pageWidth * scale) * 0.55;
    const effectiveRadius = Math.max(radius, minSafeRadius);
    const rStagger = effectiveRadius + (i % 3) * 0.015; // Prevent Z-fighting
    
    const targetX_cyl = -Math.sin(wrappedAngle) * rStagger;
    const targetZ_cyl = Math.cos(wrappedAngle) * rStagger;
    const targetY_cyl = ud.offsetY * chaos;
    
    const frontFactor = Math.max(0, Math.cos(wrappedAngle));
    const staggerOffset = i * stagger;
    const smoothFlip = Math.sin(wrappedAngle * 2 + staggerOffset) * swing * frontFactor;
    
    const outwardTilt = (Math.PI / count) * 0.8; // Prevent edge penetration
    const targetRotY_cyl = -wrappedAngle + smoothFlip - outwardTilt;
    const targetRotX_cyl = tilt + Math.sin(currentRotation * 0.5 + ud.randPhase) * chaos * 0.2;
    
    // 2. Collision-safe Line State
    const spacing = pageWidth * scale * 1.4; 
    const targetX_line = -(wrappedAngle / (Math.PI * 2)) * (spacing * count) - (pageWidth * scale) / 2;
    
    const parallaxZ = Math.sin(ud.randPhase) * 0.15;
    const targetZ_line = effectiveRadius + parallaxZ;
    const targetY_line = 0;
    
    const targetRotY_line = 0;
    const targetRotX_line = 0;
    
    // 3. Transition Collision Avoidance
    const transitionArc = Math.sin(progress * Math.PI);
    const avoidZ = transitionArc * ((i - count / 2) * 0.15); // Fan out in depth
    const avoidY = transitionArc * ((i % 2 === 0) ? 0.1 : -0.1); // Stagger vertically
    
    // Interpolate
    page.position.x = THREE.MathUtils.lerp(targetX_cyl, targetX_line, progress);
    page.position.y = THREE.MathUtils.lerp(targetY_cyl, targetY_line, progress) + avoidY;
    page.position.z = THREE.MathUtils.lerp(targetZ_cyl, targetZ_line, progress) + avoidZ;
    
    page.rotation.y = THREE.MathUtils.lerp(targetRotY_cyl, targetRotY_line, progress);
    page.rotation.x = THREE.MathUtils.lerp(targetRotX_cyl, targetRotX_line, progress);
    
    page.scale.setScalar(scale);
    
    // 4. Hide wrap jump during transition
    const isWrapping = Math.abs(wrappedAngle) > Math.PI - 0.3;
    if (progress > 0.05 && progress < 0.95 && isWrapping) {
      page.material.opacity = Math.max(0, page.material.opacity - delta * 5);
    } else {
      page.material.opacity = Math.min(1, page.material.opacity + delta * 5);
    }
  });
  
  // Global Tilt
  const globalTiltX = THREE.MathUtils.degToRad(controls.get('shape_tilt_x')) * (1 - progress);
  const globalTiltZ = THREE.MathUtils.degToRad(controls.get('shape_tilt_z')) * (1 - progress);
  
  sculptureGroup.rotation.x = globalTiltX + Math.cos(currentRotation * 0.1) * 0.02 * (1 - progress);
  sculptureGroup.rotation.z = globalTiltZ;
  sculptureGroup.rotation.y = Math.sin(currentRotation * 0.1) * 0.02 * (1 - progress);
  
  renderer.render(scene, camera);
}

// Init
buildSculpture(20);
animate();
