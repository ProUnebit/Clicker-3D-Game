import { initFireflies, animateFireflies } from './modules/fireflies.js';
import { initTriangles, animateTriangles, handleTriangleCollisions } from './modules/triangles.js';
import { createLightning, animateLightning } from './modules/lightning.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(25, 0, 0); // Initial position of the camera

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x050005, 1); // Set the background color to an even darker purple

// Set up OrbitControls for mouse interaction with the camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enablePan = false;

// Set up Effect Composer for post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const fxaaPass = new ShaderPass(FXAAShher);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
composer.addPass(fxaaPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

// Lighting and environment setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const warmLight1 = new THREE.PointLight(0xffa07a, 1.0, 50);
warmLight1.position.set(15, 5, 10);
warmLight1.castShadow = true;
scene.add(warmLight1);

const warmLight2 = new THREE.PointLight(0xffd700, 1.0, 50);
warmLight2.position.set(-15, 5, -10);
warmLight2.castShadow = true;
scene.add(warmLight2);

// Initialize modules
const fireflies = initFireflies(scene);
const triangles = initTriangles(scene);
const lightningGroup = new THREE.Group();
scene.add(lightningGroup);

// Score setup
let score = 0;
let scoreTextMesh;
let font;

const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
    createScoreText();
});

function createScoreText() {
    if (!font) return;

    const geometry = new THREE.TextGeometry(`Score: ${score}`, {
        font: font,
        size: 0.5,
        height: 0.05,
    });

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scoreTextMesh = new THREE.Mesh(geometry, material);
    scoreTextMesh.position.set(-10, 10, 0);
    scene.add(scoreTextMesh);
}

function updateScoreText() {
    if (scoreTextMesh) {
        scene.remove(scoreTextMesh);
    }
    createScoreText();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    animateFireflies(fireflies);
    animateTriangles(triangles);
    animateLightning(lightningGroup, scene);
    handleTriangleCollisions(triangles);

    composer.render();
}

animate();

// Mouse interaction for triangles
window.addEventListener('pointermove', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(triangles);

    if (intersects.length > 0) {
        intersects.forEach((intersect) => {
            const triangle = intersect.object;

            // Apply a small force away from the cursor
            const force = new THREE.Vector3().subVectors(triangle.position, raycaster.ray.origin).normalize().multiplyScalar(0.05);
            triangle.position.add(force);

            // Save original geometry and transform to a sphere
            const originalGeometry = triangle.geometry;
            triangle.geometry = new THREE.SphereGeometry(0.5, 16, 16);

            // Flash the triangle white for a short duration
            const originalEmissive = triangle.material.emissive.clone();
            triangle.material.emissive.set(0xffffff);
            triangle.material.emissiveIntensity = 0.5;

            setTimeout(() => {
                triangle.geometry = originalGeometry; // Revert back to the original geometry (triangle)
                triangle.material.emissive.copy(originalEmissive);
                triangle.material.emissiveIntensity = 0.0;
            }, 50); // Duration of 50ms for the sphere transformation
        });
    }
});
