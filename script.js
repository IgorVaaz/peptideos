const productMaterials = {};
const productGroups = {};

function initVial3D(containerId, productKey, defaultAccentColor) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Iluminação estilo laboratório
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
  sideLight.position.set(-5, -2, -2);
  scene.add(sideLight);

  const group = new THREE.Group();

  // 1. Corpo de Vidro Transparente
  const glassGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.9,
    ior: 1.5
  });
  const glassBody = new THREE.Mesh(glassGeo, glassMat);

  // 2. Gargalo da Ampola
  const neckGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
  const neck = new THREE.Mesh(neckGeo, glassMat);
  neck.position.y = 0.95;

  // 3. Tampa de Alumínio (Lacrada)
  const capGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 32);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.2;

  // 4. Rótulo Interno com Cor Personalizável
  const labelGeo = new THREE.CylinderGeometry(0.71, 0.71, 1.1, 32, 1, true, 0, Math.PI * 1.6);
  const labelMat = new THREE.MeshStandardMaterial({
    color: defaultAccentColor,
    roughness: 0.4,
    side: THREE.DoubleSide
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.y = -Math.PI / 1.2;
  productMaterials[productKey] = labelMat;

  // 5. Conteúdo Líquido/Ativo Interno
  const liquidGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.8, 32);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85
  });
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = -0.3;

  group.add(glassBody, neck, cap, label, liquid);
  group.position.y = -0.2;
  scene.add(group);
  productGroups[productKey] = group;

  // Interatividade (Mouse e Touch)
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };

  const onStart = (x, y) => { isDragging = true; prevMouse = { x, y }; };
  const onMove = (x, y) => {
    if (!isDragging) return;
    group.rotation.y += (x - prevMouse.x) * 0.01;
    group.rotation.x += (y - prevMouse.y) * 0.01;
    prevMouse = { x, y };
  };
  const onEnd = () => { isDragging = false; };

  container.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
  container.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onEnd);

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
  });
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
  });
  container.addEventListener('touchend', onEnd);

  // Redimensionamento
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Loop de Animação
  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) group.rotation.y += 0.006;
    renderer.render(scene, camera);
  }
  animate();
}

// Inicializar Cenas 3D dos Produtos das Fotos
document.addEventListener('DOMContentLoaded', () => {
  initVial3D('canvas-nad', 'nad', 0x38bdf8);
  initVial3D('canvas-ss31', 'ss31', 0x0284c7);
  initVial3D('canvas-retatrutida', 'retatrutida', 0x2563eb);
  initVial3D('canvas-klow', 'klow', 0x06b6d4);
});

// Troca Dinâmica de Cor do Rótulo
function changeColor(productKey, hexColor, element) {
  if (productMaterials[productKey]) {
    productMaterials[productKey].color.setHex(hexColor);
  }
  element.parentElement.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
  element.classList.add('active');
}

// Filtro por Categoria
function filterCategory(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (category === 'all' || card.getAttribute('data-category') === category) ? 'flex' : 'none';
  });
}