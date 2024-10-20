import { initFireflies, animateFireflies } from './modules/fireflies.js';
import { initTriangles, animateTriangles, handleTriangleCollisions } from './modules/triangles.js';
import { createLightning, animateLightning } from './modules/lightning.js';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Set up the spherical environment (inside-out sphere)
const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x111122,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8
});
const environmentSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(environmentSphere);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
pointLight1.position.set(15, 10, 10);
pointLight1.castShadow = true;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1.0);
pointLight2.position.set(-10, -5, -15);
pointLight2.castShadow = true;
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 1.2);
pointLight3.position.set(0, 20, 20);
pointLight3.castShadow = true;
scene.add(pointLight3);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
composer.addPass(fxaaPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.8, 0.4, 0.85);
composer.addPass(bloomPass);

// Initialize fireflies, triangles, and lightning
const fireflies = initFireflies(scene);
const triangles = initTriangles(scene);
const lightningGroup = new THREE.Group();
scene.add(lightningGroup);

const cameraRadius = 25;
const cameraSpeed = 0.001;

// Function to animate the scene
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * cameraSpeed;
    camera.position.x = Math.cos(time) * cameraRadius;
    camera.position.z = Math.sin(time) * cameraRadius;
    camera.lookAt(0, 0, 0);

    handleTriangleCollisions(triangles);
    animateFireflies(fireflies);
    animateTriangles(triangles);
    animateLightning(lightningGroup, scene);

    composer.render();
}

animate();

// Pointer event for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...fireflies, ...triangles]);

    intersects.forEach((intersect) => {
        // Apply a gentle push instead of a strong force
        const direction = new THREE.Vector3().subVectors(intersect.object.position, raycaster.ray.origin).normalize();
        intersect.object.userData.velocity.add(direction.multiplyScalar(0.05)); // Reduced velocity change for smoother movement

        // Add a subtle sparkle effect
        const originalEmissive = intersect.object.material.emissive.clone(); // Store the original emissive color
        intersect.object.material.emissive.set(0xffffff); // Set it to white for a sparkling effect
        intersect.object.material.emissiveIntensity = 0.8;

        // Reset the effect after 0.2 seconds
        setTimeout(() => {
            intersect.object.material.emissive.copy(originalEmissive);
            intersect.object.material.emissiveIntensity = 0.0;
        }, 200);
    });
});
