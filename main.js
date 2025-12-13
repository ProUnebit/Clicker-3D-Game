import * as THREE from "three";
import { CONFIG } from "./modules/config.js";
import { initScene } from "./modules/scene.js";
import { initCamera, initControls } from "./modules/camera.js";
import { initRenderer } from "./modules/renderer.js";
import { initLighting } from "./modules/lighting.js";
import { initPostProcessing } from "./modules/postprocessing.js";
import { initFireflies, animateFireflies } from "./modules/fireflies.js";
import {
    initTriangles,
    animateTriangles,
    handleTriangleFlashes,
    handleTriangleCollisions,
} from "./modules/triangles.js";
import { animateLightning } from "./modules/lightning.js";
import { ScoreManager } from "./modules/score.js";
import { ParticleSystem } from "./modules/particles.js";
import { MenuManager } from "./modules/menu.js";
import { setupEvents } from "./modules/events.js";

// Initialize core components
const scene = initScene();
const camera = initCamera();
const renderer = initRenderer(document.getElementById("three-canvas"));
const controls = initControls(camera, renderer.domElement);
const { composer, fxaaPass } = initPostProcessing(renderer, scene, camera);

// Initialize lighting
initLighting(scene);

// Initialize game objects
const fireflies = initFireflies(scene);
const triangles = initTriangles(scene);
const lightningGroup = new THREE.Group();
scene.add(lightningGroup);

// Initialize score manager
const scoreManager = new ScoreManager(scene);

// Initialize particle system
const particleSystem = new ParticleSystem(scene);

// Initialize menu manager
const menuManager = new MenuManager();

// Setup event listeners
setupEvents({
    triangles,
    scoreManager,
    particleSystem,
    scene,
    camera,
    renderer,
    composer,
    fxaaPass,
});

// Big Bang explosion effect
let explosionStarted = false;
let gameStartTime = null;
const clock = new THREE.Clock();

/**
 * Main animation loop
 */
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Fade-in and explosion effect
    const elapsedTime = clock.getElapsedTime();
    if (elapsedTime < CONFIG.EXPLOSION.DURATION) {
        const progress = elapsedTime / CONFIG.EXPLOSION.DURATION;
        renderer.domElement.style.opacity = progress;

        if (!explosionStarted) {
            const { INITIAL_SCALE } = CONFIG.EXPLOSION;
            scene.scale.set(INITIAL_SCALE, INITIAL_SCALE, INITIAL_SCALE);
            explosionStarted = true;
        }

        scene.scale.set(progress, progress, progress);
    } else {
        scene.scale.set(1, 1, 1);
    }

    // Animate all game objects
    animateFireflies(fireflies);
    animateTriangles(triangles);
    handleTriangleFlashes(triangles);
    animateLightning(lightningGroup, scene);
    handleTriangleCollisions(triangles);
    particleSystem.update(); // Update particle system

    // Render
    composer.render();
}

// Start animation loop
animate();
