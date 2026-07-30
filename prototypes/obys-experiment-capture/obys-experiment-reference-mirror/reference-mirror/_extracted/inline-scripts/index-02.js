(function() {
 function loadScript(src) {
 return new Promise(function(resolve, reject) {
 if (window.gsap) return resolve();
 var script = document.createElement('script');
 script.src = src;
 script.onload = resolve;
 script.onerror = reject;
 document.head.appendChild(script);
 });
 }
 function startObysFluidGallery() {
 loadScript('assets/js/vendor/gsap.min.js')
 .then(function() {
 return (async function() {
 // Standalone Three.js mode — renderer creates and owns the visible canvas
 var controls = (function() {
 var _v = {"scale":6.5,"shape_size":0.4,"image_count":32,"parallax":1,"fluidity":0.05,"scroll_sensitivity":1,"inertia_amount":0.1,"horizontal_spread":4,"bw_mode":true,"whitewash_mode":true,"image_shape":"Original","active_state":"Ring","title_0":"Makhno / 2021","title_1":"DES / 2023","title_2":"UKR Letter / 2023","title_3":"SC / 2022","title_4":"Shibuya / 2024","title_5":"Format / 2025","title_6":"Sisiomn / 2023","title_7":"Obys / 2026","title_8":"Supersame / 2020","title_9":"STN / 2023","title_10":"Berti / 2023","title_11":"Museum / 2020","title_12":"TFR / 2024","title_13":"Obys / 2026","title_14":"Makhno / 2020","title_15":"Modular / 2021","title_16":"Grids / 2025","title_17":"Nord / 2023","title_18":"Lean / 2024","title_19":"Modo / 2023","title_20":"Bauhaus / 2020","title_21":"SC / 2022","title_22":"Ukraine / 2022","title_23":"DES / 2023","title_24":"AV / 2019","title_25":"Grids / 2021","title_26":"SSS / 2022","title_27":"Awwwards / 2021","title_28":"Modo / 2023","title_29":"AIM / 2023","title_30":"Grids / 2021","title_31":"Spring / 2020","title_font":"Neue Haas Grotesk Display Pro","custom_font_file":"assets/img-b44/4472bf78c_custom_font_file_mpcm73ev.bin","images":["assets/img-b44/e290ce602_images_0_mpcm73ev.jpg","assets/img-b44/524984858_images_1_mpcm73ev.jpg","assets/img-b44/ef580962a_images_2_mpcm73ev.jpg","assets/img-b44/d5927a84d_images_3_mpcm73ev.jpg","assets/img-b44/bdbe23872_images_4_mpcm73ew.jpg","assets/img-b44/60874c708_images_5_mpcm73ew.jpg","assets/img-b44/41a5c938a_images_6_mpcm73ew.jpg","assets/img-b44/2a9b92d32_images_7_mpcm73ew.jpg","assets/img-b44/badefcf54_images_8_mpcm73ew.jpg","assets/img-b44/81b4626b5_images_9_mpcm73ew.jpg","assets/img-b44/e98e7a4ad_images_10_mpcm73ex.jpg","assets/img-b44/9da65ba70_images_11_mpcm73ex.jpg","assets/img-b44/35b4cd3a3_images_12_mpcm73ey.jpg","assets/img-b44/9434ef1c7_images_13_mpcm73f0.jpg","assets/img-b44/d49140cdd_images_14_mpcm73f0.jpg","assets/img-b44/2d83701a5_images_15_mpcm73f0.jpg","assets/img-b44/841218423_images_16_mpcm73f0.jpg","assets/img-b44/0e40b44a8_images_17_mpcm73f0.jpg","assets/img-b44/b1a375f9d_images_18_mpcm73f1.jpg","assets/img-b44/377f235fb_images_19_mpcm73f1.jpg","assets/img-b44/ea5f456c1_images_20_mpcm73f1.jpg","assets/img-b44/fdb82780a_images_21_mpcm73f1.jpg","assets/img-b44/4d98a80fe_images_22_mpcm73f2.jpg","assets/img-b44/d486bbf5d_images_23_mpcm73f2.jpg","assets/img-b44/acb9e7285_images_24_mpcm73f2.jpg","assets/img-b44/42efa2ea6_images_25_mpcm73f2.jpg","assets/img-b44/af618977f_images_26_mpcm73f2.jpg","assets/img-b44/7f54d1925_images_27_mpcm73f2.jpg","assets/img-b44/011f8c07c_images_28_mpcm73f3.jpg","assets/img-b44/642e5c9f0_images_29_mpcm73f3.jpg","assets/img-b44/681d33c8f_images_30_mpcm73f3.jpg","assets/img-b44/766d05f04_images_31_mpcm73f3.jpg"],"playing":true,"rotation_speed":0.4,"__sys_bg":{"mode":"none","color":"#ffffff","image":null,"fit":"cover"}};
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
 const THREE = await import('./assets/js/vendor/three.module.min.js');
const area = document.getElementById('obys-fluid-gallery');
const defaultCanvas = document.getElementById('canvas');
if (defaultCanvas) defaultCanvas.style.display = 'none';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, area.clientWidth / area.clientHeight, 0.1, 1000);
camera.position.z = 10;
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
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const sceneGroup = new THREE.Group();
scene.add(sceneGroup);
const raycaster = new THREE.Raycaster();
let planes = [];
let targetScrollValue = 0;
let currentScroll = 0;
let globalAngle = 0;
const cameraTarget = new THREE.Vector3();
// Focus State
let isFocused = false;
let wireframeMode = false;
let focusedPlane = null;
let focusProgress = 0;
// Custom Cursor Setup
const cursorEl = document.createElement('div');
cursorEl.className = 'custom-cursor';
area.appendChild(cursorEl);
const cursor = {
 x: window.innerWidth / 2,
 y: window.innerHeight / 2,
 targetX: window.innerWidth / 2,
 targetY: window.innerHeight / 2,
 scale: 1,
 targetScale: 1,
 visible: false
};
area.addEventListener('mouseenter', () => cursor.visible = true);
area.addEventListener('mouseleave', () => cursor.visible = false);
const mouse = new THREE.Vector2();
area.addEventListener('mousemove', (e) => {
 const rect = area.getBoundingClientRect();
 mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
 mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
 
 cursor.targetX = e.clientX - rect.left;
 cursor.targetY = e.clientY - rect.top;
 cursor.visible = true;
});
area.addEventListener('wheel', (e) => {
 if (isFocused) return;
 e.preventDefault();
 const N = planes.length;
 let delta = e.deltaY;
 if (e.deltaMode === 1) delta *= 16;
 if (e.deltaMode === 2) delta *= 100;
 
 const sensitivity = controls.get('scroll_sensitivity') || 1.0;
 const maxScroll = N;
 
 targetScrollValue += delta * 0.002 * sensitivity;
 targetScrollValue = Math.max(0, Math.min(maxScroll, targetScrollValue));
}, { passive: false });
// Focus UI Elements
const focusOverlay = document.createElement('div');
focusOverlay.className = 'focus-overlay';
const focusPanel = document.createElement('div');
focusPanel.className = 'focus-panel';
const focusImageContainer = document.createElement('div');
focusImageContainer.className = 'focus-image-container';
const focusImg = document.createElement('img');
focusImg.style.height = '50vh';
focusImg.style.maxHeight = '50vh';
focusImg.style.width = 'auto';
focusImg.style.maxWidth = '40vw';
focusImg.style.objectFit = 'contain';
focusImg.style.objectPosition = 'center center';
focusImg.style.display = 'block';
focusImg.style.background = 'none';
focusImg.style.padding = '0';
focusImg.style.border = 'none';
focusImageContainer.appendChild(focusImg);
const focusInfo = document.createElement('div');
focusInfo.className = 'focus-info';
const focusTitle = document.createElement('span');
focusTitle.style.fontSize = '13px';
const focusLink = document.createElement('a');
focusLink.className = 'focus-link';
focusLink.textContent = 'Link';
focusLink.style.fontSize = '13px';
focusLink.target = '_blank';
focusLink.rel = 'noopener noreferrer';
focusLink.addEventListener('click', (e) => {
 const url = focusLink.getAttribute('data-url');
 if (url && url !== '#') {
 e.preventDefault();
 e.stopPropagation();
 window.open(url, '_blank', 'noopener,noreferrer');
 }
});
focusInfo.appendChild(focusTitle);
focusInfo.appendChild(focusLink);
focusImageContainer.appendChild(focusInfo);
area.appendChild(focusOverlay);
area.appendChild(focusPanel);
area.appendChild(focusImageContainer);
// Title Display Setup
const titleContainer = document.createElement('div');
titleContainer.className = 'editorial-title-container';
const titleEl = document.createElement('div');
titleEl.className = 'editorial-title';
titleContainer.appendChild(titleEl);
area.appendChild(titleContainer);
const titleStyleFix = document.createElement('style');
titleStyleFix.textContent = `
 #obys-fluid-gallery .editorial-title-container {
 bottom: 38px !important;
 overflow: visible !important;
 padding: 0 24px !important;
 width: 100% !important;
 display: flex !important;
 justify-content: center !important;
 box-sizing: border-box !important;
 }
 #obys-fluid-gallery .editorial-title {
 overflow: visible !important;
 clip-path: none !important;
 line-height: 0.86 !important;
 letter-spacing: -0.05em !important;
 white-space: nowrap !important;
 width: auto !important;
 max-width: none !important;
 }
 #obys-fluid-gallery .editorial-title .char {
 display: inline-block;
 overflow: visible !important;
 }
`;
document.head.appendChild(titleStyleFix);
const popupTimingFix = document.createElement('style');
popupTimingFix.textContent = `
 .focus-image-container {
 transition-duration: 0.4s !important;
 transition-delay: 0s !important;
 transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
 }
 .focus-panel, .focus-overlay {
 transition-duration: 0.6s !important;
 transition-delay: 0.15s !important;
 transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
 }
 .focus-active .focus-image-container {
 transition-duration: 0.6s !important;
 transition-delay: 0.1s !important;
 transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
 }
 .focus-active .focus-panel, .focus-active .focus-overlay {
 transition-duration: 0.5s !important;
 transition-delay: 0s !important;
 transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
 }
`;
document.head.appendChild(popupTimingFix);
let currentActiveTitle = '';
let titleTimeline = null;
async function updateTitleFont() {
 const fontFamily = '"OTF Obys NG", sans-serif';
 area.style.fontFamily = fontFamily;
 titleEl.style.fontFamily = fontFamily;
 titleEl.style.textTransform = 'uppercase';
 focusInfo.style.fontFamily = fontFamily;
 focusLink.style.fontFamily = fontFamily;
 focusTitle.style.fontFamily = fontFamily;
 switcher.style.fontFamily = fontFamily;
 const switcherItems = document.querySelectorAll('.switcher-item, .switcher-comma');
 switcherItems.forEach(item => item.style.fontFamily = fontFamily);
 if (document.fonts && document.fonts.ready) {
 document.fonts.ready.then(() => requestAnimationFrame(updateSwitcherUI));
 }
 setTimeout(updateSwitcherUI, 100);
 requestAnimationFrame(updateSwitcherUI);
}
function showTitle(text) {
 if (currentActiveTitle === text) return;
 currentActiveTitle = text;
 
 if (titleTimeline) titleTimeline.kill();
 
 titleEl.innerHTML = '';
 text.split('').forEach(char => {
 const span = document.createElement('span');
 span.className = 'char';
 span.textContent = char === ' ' ? '\u00A0' : char;
 titleEl.appendChild(span);
 });
 
 titleTimeline = gsap.timeline();
 titleTimeline.fromTo(titleEl.querySelectorAll('.char'), 
 { y: '100%', opacity: 0 },
 {
 y: '0%',
 opacity: 1,
 duration: 0.8,
 ease: 'expo.out',
 stagger: 0.02
 }
 );
}
function hideTitle() {
 if (currentActiveTitle === '') return;
 currentActiveTitle = '';
 
 if (titleTimeline) titleTimeline.kill();
 
 titleTimeline = gsap.timeline();
 titleTimeline.to(titleEl.querySelectorAll('.char'), {
 y: '100%',
 opacity: 0,
 duration: 0.4,
 ease: 'power2.in',
 stagger: 0.01,
 onComplete: () => {
 titleEl.innerHTML = '';
 }
 });
}
function closeFocus() {
 isFocused = false;
 area.classList.remove('focus-active');
}
let isLinkHovered = false;
focusLink.addEventListener('mouseenter', () => isLinkHovered = true);
focusLink.addEventListener('mouseleave', () => isLinkHovered = false);
focusOverlay.addEventListener('click', (e) => {
 e.stopPropagation();
 closeFocus();
});
focusPanel.addEventListener('click', (e) => {
 e.stopPropagation();
 closeFocus();
});
focusImageContainer.addEventListener('click', (e) => {
 if (e.target !== focusLink) {
 e.stopPropagation();
 closeFocus();
 }
});
window.addEventListener('keydown', (e) => {
 if (e.key === 'Escape' && isFocused) closeFocus();
});
area.addEventListener('click', (e) => {
 if (isFocused) return;
 if (currentScroll < 0.9) return; 
 
 if (e.target.closest('.tool-switcher') || e.target.closest('.focus-panel') || e.target.closest('.wireframe-toggle')) {
 return;
 }
 
 raycaster.setFromCamera(mouse, camera);
 const intersects = raycaster.intersectObjects(sceneGroup.children);
 if (intersects.length > 0) {
 const plane = planes.find(p => p.mesh === intersects[0].object);
 if (plane) {
 isFocused = true;
 focusedPlane = plane;
 
 const images = controls.get('images');
 focusImg.src = images[plane.imageIndex];
 
 const titleKey = `title_${plane.imageIndex}`;
 const linkKey = `link_${plane.imageIndex}`;
 focusTitle.textContent = controls.get(titleKey) || `Image ${plane.imageIndex + 1}`;
 
 const linkUrl = controls.get(linkKey);
 
 if (linkUrl && linkUrl.trim() !== '' && linkUrl.trim() !== '#') {
 let finalUrl = linkUrl.trim();
 if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
 finalUrl = 'https://' + finalUrl;
 }
 focusLink.href = finalUrl;
 focusLink.setAttribute('data-url', finalUrl);
 focusLink.style.display = 'block';
 focusLink.style.opacity = '1';
 } else {
 focusLink.href = '#';
 focusLink.setAttribute('data-url', '#');
 focusLink.style.display = 'none';
 }
 
 const isCircle = controls.get('image_shape') === 'Circle';
 focusImg.style.borderRadius = isCircle ? '50%' : '0';
 
 area.classList.add('focus-active');
 }
 }
});
function calculateTargets() {
 const scale = controls.get('scale');
 const spread = controls.get('horizontal_spread');
 const N = planes.length;
 
 for (let i = 0; i < N; i++) {
 const plane = planes[i];
 const dummy = new THREE.Object3D();
 
 const phi = Math.acos(1 - 2 * (i + 0.5) / N);
 const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
 plane.targets.Sphere.position.set(
 scale * Math.cos(theta) * Math.sin(phi),
 scale * Math.sin(theta) * Math.sin(phi),
 scale * Math.cos(phi)
 );
 dummy.position.copy(plane.targets.Sphere.position);
 dummy.lookAt(0, 0, 0);
 dummy.rotateY(Math.PI);
 plane.targets.Sphere.quaternion.copy(dummy.quaternion);
 plane.targets.Sphere.scale = 1;
 
 const angle = (i / N) * Math.PI * 2;
 const rX = scale * 1.5;
 const rZ = scale * 1.8;
 plane.targets.Ring.position.set(
 Math.cos(angle) * rX,
 plane.randoms.ringY * scale * 0.4,
 Math.sin(angle) * rZ
 );
 dummy.position.copy(plane.targets.Ring.position);
 dummy.lookAt(0, dummy.position.y, 0);
 plane.targets.Ring.quaternion.copy(dummy.quaternion);
 plane.targets.Ring.scale = 1;
 
 const t = i / Math.max(1, N - 1);
 const goldenAngle = Math.PI * (3 - Math.sqrt(5));
 const flowerTheta = i * goldenAngle;
 const r = Math.pow(t, 1.4) * scale * 2.2;
 
 plane.targets.Flower.position.set(
 Math.cos(flowerTheta) * r,
 Math.sin(flowerTheta) * r,
 Math.sin(t * Math.PI * 5) * scale * 0.25
 );
 dummy.position.copy(plane.targets.Flower.position);
 dummy.lookAt(
 Math.cos(flowerTheta) * r * 2, 
 Math.sin(flowerTheta) * r * 2, 
 10 + scale
 );
 plane.targets.Flower.quaternion.copy(dummy.quaternion);
 plane.targets.Flower.scale = 0.25 + t * 1.25;
 const cylinderRadius = scale * 0.8;
 const cylinderHeight = scale * 3;
 const numRings = Math.max(3, Math.floor(Math.sqrt(N)));
 const imagesPerRing = Math.ceil(N / numRings);
 const ringIndex = Math.floor(i / imagesPerRing);
 const indexInRing = i % imagesPerRing;
 
 const cylinderAngle = (indexInRing / imagesPerRing) * Math.PI * 2;
 const yPos = (numRings > 1) ? (ringIndex / (numRings - 1) - 0.5) * cylinderHeight : 0;
 
 plane.targets.Cylinder.position.set(
 Math.cos(cylinderAngle) * cylinderRadius,
 yPos,
 Math.sin(cylinderAngle) * cylinderRadius
 );
 dummy.position.copy(plane.targets.Cylinder.position);
 dummy.lookAt(0, dummy.position.y, 0);
 plane.targets.Cylinder.quaternion.copy(dummy.quaternion);
 plane.targets.Cylinder.scale = 0.8;
 
 plane.targets.Horizontal.position.set(i * spread, 0, 0);
 dummy.position.copy(plane.targets.Horizontal.position);
 dummy.rotation.set(0, 0, 0);
 plane.targets.Horizontal.quaternion.copy(dummy.quaternion);
 plane.targets.Horizontal.scale = 1;
 }
}
function updatePlanes() {
 const N = controls.get('image_count');
 const images = controls.get('images') || [];
 if (images.length === 0) return;
 
 const isCircle = controls.get('image_shape') === 'Circle';
 
 while (planes.length < N) {
 const geometry = new THREE.PlaneGeometry(1, 1);
 const material = new THREE.ShaderMaterial({
 uniforms: {
 tDiffuse: { value: null },
 uHover: { value: 0.0 },
 uOpacity: { value: 0.0 },
 uFocusDim: { value: 0.0 },
 uBW: { value: 1.0 },
 uWhiteWash: { value: 1.0 },
 uShape: { value: 0.0 },
 uWireframe: { value: 0.0 }
 },
 vertexShader: `
 varying vec2 vUv;
 void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
 `,
 fragmentShader: `
 uniform sampler2D tDiffuse;
 uniform float uHover;
 uniform float uOpacity;
 uniform float uFocusDim;
 uniform float uBW;
 uniform float uWhiteWash;
 uniform float uShape;
 uniform float uWireframe;
 varying vec2 vUv;
 void main() {
 if (uShape > 0.5) {
 float dist = distance(vUv, vec2(0.5));
 if (dist > 0.5) discard;
 }
 
 if (uWireframe > 0.5) {
 float thickness = 0.009;
 bool edge = vUv.x < thickness || vUv.x > 1.0 - thickness || vUv.y < thickness || vUv.y > 1.0 - thickness;
 bool diagonal = abs(vUv.x - vUv.y) < thickness * 0.5;
 if (edge || diagonal) {
 gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity * 0.2);
 } else {
 discard;
 }
 return;
 }
 vec4 texColor = texture2D(tDiffuse, vUv);
 float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
 vec3 baseColor = mix(texColor.rgb, vec3(gray), uBW);
 vec3 washedColor = mix(baseColor, vec3(1.0), uWhiteWash * 0.4);
 float depthFog = 1.0 - uOpacity;
 vec3 foggedColor = mix(washedColor, vec3(1.0), depthFog * 0.8);
 vec3 finalColor = mix(foggedColor, texColor.rgb, uHover);
 finalColor = mix(finalColor, vec3(1.0), uFocusDim * 0.4);
 gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
 }
 `,
 transparent: true,
 side: THREE.DoubleSide,
 depthWrite: false
 });
 const mesh = new THREE.Mesh(geometry, material);
 sceneGroup.add(mesh);
 
 planes.push({
 mesh,
 targets: {
 Sphere: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 },
 Ring: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 },
 Flower: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 },
 Cylinder: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 },
 Horizontal: { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 }
 },
 finalTargetPos: new THREE.Vector3(),
 finalTargetQuat: new THREE.Quaternion(),
 randoms: {
 ringY: (Math.random() - 0.5),
 cylinderY: (Math.random() - 0.5) * 1.5,
 cylinderScale: (Math.random() - 0.5) * 0.3
 },
 imageIndex: -1,
 currentSrc: '',
 hoverState: 0,
 targetOpacity: 0
 });
 }
 
 while (planes.length > N) {
 const plane = planes.pop();
 sceneGroup.remove(plane.mesh);
 if (plane.mesh.material.uniforms.tDiffuse.value) {
 plane.mesh.material.uniforms.tDiffuse.value.dispose();
 }
 plane.mesh.geometry.dispose();
 plane.mesh.material.dispose();
 }
 planes.forEach((plane, i) => {
 const newIndex = i % images.length;
 const newSrc = images[newIndex];
 
 if (plane.imageIndex !== newIndex || plane.currentSrc !== newSrc || plane.lastShape !== isCircle) {
 plane.imageIndex = newIndex;
 plane.currentSrc = newSrc;
 plane.lastShape = isCircle;
 
 textureLoader.load(newSrc, (tex) => {
 const aspect = isCircle ? 1 : tex.image.width / tex.image.height;
 plane.mesh.geometry.dispose();
 plane.mesh.geometry = new THREE.PlaneGeometry(2 * aspect, 2);
 plane.mesh.material.uniforms.tDiffuse.value = tex;
 plane.mesh.material.needsUpdate = true;
 });
 }
 });
 
 calculateTargets();
}
const switcher = document.createElement('div');
switcher.className = 'tool-switcher';
const states = ['Ring', 'Flower', 'Sphere', 'Cylinder'];
const buttons = {};
states.forEach((state, i) => {
 const item = document.createElement('span');
 item.className = 'switcher-item';
 item.textContent = state;
 item.style.setProperty('font-size', '13px', 'important');
 
 item.addEventListener('click', (e) => {
 e.stopPropagation();
 controls.set('active_state', state);
 targetScrollValue = 0;
 updateSwitcherUI();
 requestAnimationFrame(updateSwitcherUI);
 });
 
 buttons[state] = item;
 switcher.appendChild(item);
 
 if (i < states.length - 1) {
 const comma = document.createElement('span');
 comma.className = 'switcher-comma';
 comma.textContent = ',';
 comma.style.setProperty('font-size', '13px', 'important');
 switcher.appendChild(comma);
 }
});
const underline = document.createElement('div');
underline.className = 'switcher-underline';
switcher.appendChild(underline);
area.appendChild(switcher);
const wireframeToggle = document.createElement('div');
wireframeToggle.className = 'wireframe-toggle';
wireframeToggle.style.position = 'absolute';
wireframeToggle.style.bottom = '11px';
wireframeToggle.style.left = '10px';
wireframeToggle.style.display = 'flex';
wireframeToggle.style.gap = '3px';
wireframeToggle.style.zIndex = '1000';
wireframeToggle.style.cursor = 'pointer';
const photoIcon = document.createElement('div');
photoIcon.style.width = '26px';
photoIcon.style.height = '15px';
photoIcon.style.backgroundColor = 'black';
photoIcon.style.transition = 'opacity 0.3s ease';
const wireIcon = document.createElement('div');
wireIcon.style.width = '26px';
wireIcon.style.height = '15px';
wireIcon.style.border = '1px solid black';
wireIcon.style.boxSizing = 'border-box';
wireIcon.style.position = 'relative';
wireIcon.style.transition = 'opacity 0.3s ease';
const diagonal = document.createElement('div');
diagonal.style.position = 'absolute';
diagonal.style.top = '0';
diagonal.style.left = '0';
diagonal.style.width = '100%';
diagonal.style.height = '100%';
diagonal.style.background = 'linear-gradient(to top right, transparent calc(50% - 0.5px), black, transparent calc(50% + 0.5px))';
wireIcon.appendChild(diagonal);
wireframeToggle.appendChild(photoIcon);
wireframeToggle.appendChild(wireIcon);
area.appendChild(wireframeToggle);
function updateWireframeUI() {
 photoIcon.style.opacity = wireframeMode ? '0.2' : '1';
 wireIcon.style.opacity = wireframeMode ? '1' : '0.2';
}
photoIcon.addEventListener('click', (e) => {
 e.stopPropagation();
 wireframeMode = false;
 updateWireframeUI();
});
wireIcon.addEventListener('click', (e) => {
 e.stopPropagation();
 wireframeMode = true;
 updateWireframeUI();
});
updateWireframeUI();
function updateSwitcherUI() {
 const active = controls.get('active_state');
 const activeItem = buttons[active];
 if (activeItem) {
 underline.style.width = `${activeItem.offsetWidth}px`;
 underline.style.left = `${activeItem.offsetLeft}px`;
 }
}
controls.onChange('active_state', updateSwitcherUI);
setInterval(updateSwitcherUI, 300);
controls.onChange('image_count', updatePlanes);
controls.onChange('images', updatePlanes);
controls.onChange('scale', calculateTargets);
controls.onChange('horizontal_spread', calculateTargets);
controls.onChange('image_shape', updatePlanes);
controls.onChange('title_font', updateTitleFont);
controls.onChange('custom_font_file', updateTitleFont);
updateTitleFont();
updatePlanes();
updateSwitcherUI();
requestAnimationFrame(updateSwitcherUI);
setTimeout(updateSwitcherUI, 300);
window.addEventListener('resize', () => {
 const w = area.clientWidth;
 const h = area.clientHeight;
 renderer.setSize(w, h);
 camera.aspect = w / h;
 camera.updateProjectionMatrix();
 updateSwitcherUI();
});
function animate() {
 requestAnimationFrame(animate);
 
 const delta = clock.getDelta();
 const time = clock.getElapsedTime();
 const playing = controls.get('playing');
 const fluidity = controls.get('fluidity');
 const inertia = controls.get('inertia_amount') || 0.1;
 const activeState = controls.get('active_state');
 const scale = controls.get('scale');
 const spread = controls.get('horizontal_spread');
 const parallax = controls.get('parallax');
 const shapeSize = controls.get('shape_size') || 1.0;
 const imageShape = controls.get('image_shape');
 
 if (isFocused) {
 focusProgress += (1 - focusProgress) * fluidity;
 } else {
 focusProgress += (0 - focusProgress) * fluidity;
 if (focusProgress < 0.001) {
 focusProgress = 0;
 focusedPlane = null;
 }
 }
 
 if (playing && focusProgress < 0.9) {
 globalAngle += controls.get('rotation_speed') * delta * 0.5 * (1 - focusProgress);
 }
 
 raycaster.setFromCamera(mouse, camera);
 const intersects = raycaster.intersectObjects(sceneGroup.children);
 let hoveredPlane = null;
 if (intersects.length > 0 && !isFocused) {
 hoveredPlane = planes.find(p => p.mesh === intersects[0].object);
 }
 
 currentScroll += (targetScrollValue - currentScroll) * inertia;
 
 const N = planes.length;
 
 let transitionProgress = 0;
 let archiveProgress = 0;
 
 if (currentScroll <= 1) {
 transitionProgress = currentScroll;
 archiveProgress = 0;
 } else {
 transitionProgress = 1;
 archiveProgress = currentScroll - 1;
 }
 
 transitionProgress = Math.max(0, Math.min(1, transitionProgress));
 archiveProgress = Math.max(0, Math.min(N - 1, archiveProgress));
 if (hoveredPlane && transitionProgress > 0.9 && !isFocused) {
 const titleKey = `title_${hoveredPlane.imageIndex}`;
 const titleText = controls.get(titleKey) || `Image ${hoveredPlane.imageIndex + 1}`;
 showTitle(titleText);
 } else {
 hideTitle();
 }
 
 if (isFocused) {
 cursorEl.classList.add('is-cross');
 } else {
 cursorEl.classList.remove('is-cross');
 }
 
 if (hoveredPlane) {
 cursor.targetScale = 3.0;
 } else {
 cursor.targetScale = 1.0;
 }
 
 cursor.x += (cursor.targetX - cursor.x) * 0.15;
 cursor.y += (cursor.targetY - cursor.y) * 0.15;
 cursor.scale += (cursor.targetScale - cursor.scale) * 0.15;
 
 cursorEl.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%) scale(${cursor.scale})`;
 cursorEl.style.opacity = cursor.visible ? '1' : '0';
 
 if (focusProgress > 0.1) {
 switcher.style.opacity = '0';
 switcher.style.transform = 'translate(-50%, 10px)';
 switcher.style.pointerEvents = 'none';
 wireframeToggle.style.opacity = '0';
 wireframeToggle.style.pointerEvents = 'none';
 } else {
 switcher.style.opacity = '1';
 switcher.style.transform = 'translate(-50%, 0)';
 switcher.style.pointerEvents = 'auto';
 wireframeToggle.style.opacity = '1';
 wireframeToggle.style.pointerEvents = 'auto';
 }
 
 const rotQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), globalAngle);
 const effectiveSpread = spread * shapeSize;
 const baseZ = 5 + scale * 1.2 * shapeSize;
 
 for (let i = 0; i < planes.length; i++) {
 const plane = planes[i];
 const spatialPos = plane.targets[activeState].position.clone().multiplyScalar(shapeSize);
 const floatAmt = (1 - transitionProgress) * 0.05 * scale * shapeSize * (1 - focusProgress);
 spatialPos.x += Math.sin(time * 0.5 + i) * floatAmt;
 spatialPos.y += Math.sin(time * 0.6 + i) * floatAmt;
 spatialPos.z += Math.sin(time * 0.7 + i) * floatAmt;
 spatialPos.applyQuaternion(rotQuat);
 const spatialQuat = plane.targets[activeState].quaternion.clone();
 spatialQuat.premultiply(rotQuat);
 const horizPos = plane.targets.Horizontal.position.clone().multiplyScalar(shapeSize);
 const horizQuat = plane.targets.Horizontal.quaternion;
 plane.finalTargetPos.lerpVectors(spatialPos, horizPos, transitionProgress);
 plane.finalTargetQuat.slerpQuaternions(spatialQuat, horizQuat, transitionProgress);
 const isHovered = (plane === hoveredPlane);
 plane.hoverState += ( (isHovered ? 1 : 0) - plane.hoverState ) * fluidity * 3.0;
 let currentTargetPos = plane.finalTargetPos.clone();
 let currentTargetQuat = plane.finalTargetQuat.clone();
 let currentTargetScale = (plane.targets[activeState].scale || 1) * shapeSize;
 if (plane === focusedPlane && focusProgress > 0) {
 plane.targetOpacity = 1 - focusProgress;
 } else {
 const dist = camera.position.distanceTo(plane.mesh.position);
 const fadeStart = baseZ - scale * 0.5 * shapeSize;
 const fadeEnd = baseZ + scale * 1.5 * shapeSize;
 let targetOpacity = 1 - (dist - fadeStart) / (fadeEnd - fadeStart);
 targetOpacity = Math.max(0.05, Math.min(1, targetOpacity));
 targetOpacity = THREE.MathUtils.lerp(targetOpacity, 1.0, transitionProgress);
 if (isFocused && plane !== focusedPlane) {
 targetOpacity *= (1 - focusProgress * 0.5);
 }
 plane.targetOpacity = targetOpacity;
 }
 if (plane.mesh.material.uniforms) {
 plane.mesh.material.uniforms.uHover.value = plane.hoverState;
 plane.mesh.material.uniforms.uBW.value = controls.get('bw_mode') ? 1.0 : 0.0;
 plane.mesh.material.uniforms.uWhiteWash.value = controls.get('whitewash_mode') ? 1.0 : 0.0;
 plane.mesh.material.uniforms.uShape.value = imageShape === 'Circle' ? 1.0 : 0.0;
 plane.mesh.material.uniforms.uWireframe.value = wireframeMode ? 1.0 : 0.0;
 const dimTarget = (plane === focusedPlane) ? 0.0 : focusProgress;
 plane.mesh.material.uniforms.uFocusDim.value = dimTarget;
 plane.mesh.material.uniforms.uOpacity.value = (plane === focusedPlane) ? 1.0 : plane.targetOpacity;
 }
 if (plane.hoverState > 0.001 && plane !== focusedPlane) {
 const forwardOffset = new THREE.Vector3(0, 0, plane.hoverState * 0.8 * shapeSize);
 forwardOffset.applyQuaternion(plane.finalTargetQuat);
 currentTargetPos.add(forwardOffset);
 }
 plane.mesh.position.lerp(currentTargetPos, fluidity);
 plane.mesh.quaternion.slerp(currentTargetQuat, fluidity);
 const horizScale = (plane.targets.Horizontal.scale || 1) * shapeSize;
 let targetBaseScale = THREE.MathUtils.lerp(currentTargetScale, horizScale, transitionProgress);
 if (transitionProgress > 0.5 && !isFocused) {
 const distToCamX = Math.abs(plane.mesh.position.x - camera.position.x);
 if (distToCamX < effectiveSpread) {
 targetBaseScale += 0.4 * shapeSize * (1 - distToCamX / effectiveSpread) * transitionProgress;
 }
 }
 if (plane !== focusedPlane) {
 targetBaseScale += plane.hoverState * 0.15 * shapeSize;
 }
 plane.mesh.scale.lerp(new THREE.Vector3(targetBaseScale, targetBaseScale, targetBaseScale), fluidity);
 }
 const parallaxMult = (1 - focusProgress * 0.8);
 const targetCamX = archiveProgress * effectiveSpread + (mouse.x * parallax * scale * 0.5 * parallaxMult);
 const targetCamY = (mouse.y * parallax * scale * 0.5 * parallaxMult);
 camera.position.x += (targetCamX - camera.position.x) * fluidity;
 camera.position.y += (targetCamY - camera.position.y) * fluidity;
 camera.position.z += (baseZ - camera.position.z) * fluidity;
 const targetLookX = archiveProgress * effectiveSpread + (mouse.x * parallax * 0.5 * parallaxMult);
 const targetLookY = (mouse.y * parallax * 0.5 * parallaxMult);
 cameraTarget.set(targetLookX, targetLookY, 0);
 camera.lookAt(cameraTarget);
 renderer.render(scene, camera);
}
animate();
 // System Background Wiring
 if (typeof CanvasRuntimeAPI !== 'undefined') {
 var __sysBgVal = controls.get('__sys_bg');
 if (__sysBgVal) CanvasRuntimeAPI.setBackground(__sysBgVal);
 }
 
 })();
 })
 .catch(function(error) {
 console.error('Obys gallery failed to load:', error);
 });
 }
 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', startObysFluidGallery);
 } else {
 startObysFluidGallery();
 }
})();
