import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Elementos del DOM
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('popup-exit-button');
const loading = document.getElementById('loading');
const welcome = document.getElementById('welcome');
const closeWelcomeButton = document.getElementById('welcome-exit-button');

// Escena básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);
const canvas = document.getElementById('portfolio-canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const raycaster = new THREE.Raycaster();

// Configuración de renderizado
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const intersectObjects = [];
const intersectObjectsNames = [
    "Portfolio", "Github", "TwitterX", "Backpack", "Book", "Cactus", 
    "Can1", "Can2", "Can3", "Mat", "Mug", "Name", "Pokeball", 
    "Rubix Cube", "Skateboard", "Chair"
]

// Carga del modelo
const loader = new GLTFLoader();
loader.load(
    "./public/portfolio_room.glb",
    function(glb){
        glb.scene.traverse(child=>{
            if(intersectObjectsNames.includes(child.name)){
                intersectObjects.push(child);
            }
            if(child.isMesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(glb.scene);
        setupLights();
        loading.classList.add('hidden');
    },
    undefined,
    function(error){
        console.error("Error en la carga:", error);
    }
);

function setupLights(){
    const ambientLight = new THREE.AmbientLight(0xd0d0ff, 0.3);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xFFFFeb, 1.5);
    sun.position.set(15, 25, 10);
    sun.castShadow = true;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xddefff, 0.5);
    fillLight.position.set(-8, 12, 0);
    scene.add(fillLight);
}

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.minDistance = 10; 
controls.maxDistance = 30;

camera.position.set(14.7, 8.2, 6.1);
controls.target.set(-1, 3, -1.5); 
controls.update();

// Animaciones
function jumpObject(object) {
    gsap.timeline()
        .to(object.position, { y: object.position.y + 0.5, duration: 0.3, ease: "power2.out" })
        .to(object.position, { y: object.position.y, duration: 0.3, ease: "bounce.out" });
}

function spinObject(object) {
    gsap.to(object.rotation, { y: object.rotation.y + Math.PI * 2, duration: 1, ease: "power2.inOut" });
}

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

function onClick(event){
   event.preventDefault();
   let clientX = event.touches ? event.touches[0].clientX : event.clientX;
   let clientY = event.touches ? event.touches[0].clientY : event.clientY;

   const rect = canvas.getBoundingClientRect();
   const x = ((clientX - rect.left) / rect.width) * 2 - 1;
   const y = -((clientY - rect.top) / rect.height) * 2 + 1;

   raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
   const intersects = raycaster.intersectObjects(intersectObjects, true);

   if (intersects.length > 0) {
       const intersectedObject = intersects[0].object.parent;
       const name = intersectedObject.name;

       if (name === "Portfolio") {
           popup.classList.toggle("hidden");
       } else if (name === "Github") {
           window.open('https://github.com', '_blank');
       } else if (name === "TwitterX") {
           window.open('https://twitter.com', '_blank');
       } else if (name === "Chair") {
           spinObject(intersectedObject);
       } else {
           jumpObject(intersectedObject);
       }
   }
}

window.addEventListener("pointerdown", onClick);
closePopupButton.addEventListener("click", () => popup.classList.add('hidden'));
closeWelcomeButton.addEventListener("click", () => welcome.classList.add('hidden'));

function animate(){
    controls.update(); 
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();