import * as THREE from "three";
import { CONFIG } from "./config.js";
import { initScene } from "./scene.js";
import { initCamera, initControls } from "./camera.js";
import { initLighting } from "./lighting.js";
import { initFireflies } from "./fireflies.js";
import { initTriangles } from "./triangles.js";
import { ScoreManager } from "./score.js";
import { ParticleSystem } from "./particles.js";
import { RenderSystem } from "./systems/RenderSystem.js";
import { PhysicsSystem } from "./systems/PhysicsSystem.js";
import { AnimationSystem } from "./systems/AnimationSystem.js";
import { InputSystem } from "./systems/InputSystem.js";

/**
 * GameManager - Main game controller
 * Manages game state, systems, and lifecycle
 */
export class GameManager {
    constructor() {
        this.state = "menu"; // menu | playing | paused
        this.animationId = null;
        this.clock = new THREE.Clock();

        // Core Three.js objects
        this.scene = null;
        this.camera = null;
        this.controls = null;

        // Game objects
        this.fireflies = [];
        this.triangles = [];
        this.lightningGroup = null;

        // Managers
        this.scoreManager = null;
        this.particleSystem = null;

        // Systems
        this.renderSystem = null;
        this.physicsSystem = null;
        this.animationSystem = null;
        this.inputSystem = null;

        // Big Bang effect
        this.explosionStarted = false;
        this.gameStartTime = null;
    }

    /**
     * Initialize all game components
     */
    initialize() {
        console.log("🎮 GameManager: Initializing...");

        // Initialize Three.js core
        this.scene = initScene();
        this.camera = initCamera();
        this.controls = initControls(
            this.camera,
            document.getElementById("three-canvas")
        );

        // Initialize lighting
        initLighting(this.scene);

        // Initialize game objects
        this.fireflies = initFireflies(this.scene);
        this.triangles = initTriangles(this.scene);
        this.lightningGroup = new THREE.Group();
        this.scene.add(this.lightningGroup);

        // Initialize managers
        this.scoreManager = new ScoreManager(this.scene);
        this.particleSystem = new ParticleSystem(this.scene);

        // Initialize systems
        this.renderSystem = new RenderSystem(this.scene, this.camera);
        this.physicsSystem = new PhysicsSystem(this.triangles);
        this.animationSystem = new AnimationSystem(
            this.fireflies,
            this.triangles,
            this.lightningGroup,
            this.scene
        );
        this.inputSystem = new InputSystem({
            triangles: this.triangles,
            scoreManager: this.scoreManager,
            particleSystem: this.particleSystem,
            scene: this.scene,
            camera: this.camera,
            renderSystem: this.renderSystem,
        });

        // Initialize input system
        this.inputSystem.initialize();

        console.log("✅ GameManager: Initialized");
    }

    /**
     * Start the game
     */
    start() {
        if (this.state === "playing") return;

        console.log("▶️ GameManager: Starting game");
        this.state = "playing";
        this.explosionStarted = false;
        this.gameStartTime = null;

        // Start animation loop if not already running
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.state !== "playing") return;

        console.log("⏸️ GameManager: Pausing game");
        this.state = "paused";
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.state !== "paused") return;

        console.log("▶️ GameManager: Resuming game");
        this.state = "playing";
    }

    /**
     * Restart the game
     */
    restart() {
        console.log("🔄 GameManager: Restarting game");

        // Stop current game
        this.stop();

        // Cleanup
        this.cleanup();

        // Re-initialize
        this.initialize();

        // Start again
        this.start();
    }

    /**
     * Stop the game
     */
    stop() {
        console.log("⏹️ GameManager: Stopping game");
        this.state = "menu";

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Always update controls
        if (this.controls) {
            this.controls.update();
        }

        // Only update game logic if playing
        if (this.state === "playing") {
            // Big Bang explosion effect
            if (!this.explosionStarted) {
                this.gameStartTime = this.clock.getElapsedTime();
                this.explosionStarted = true;
                const { INITIAL_SCALE } = CONFIG.EXPLOSION;
                this.scene.scale.set(
                    INITIAL_SCALE,
                    INITIAL_SCALE,
                    INITIAL_SCALE
                );
            }

            const elapsedTime =
                this.clock.getElapsedTime() - this.gameStartTime;
            if (elapsedTime < CONFIG.EXPLOSION.DURATION) {
                const progress = elapsedTime / CONFIG.EXPLOSION.DURATION;
                this.renderSystem.setOpacity(progress);
                this.scene.scale.set(progress, progress, progress);
            } else {
                this.renderSystem.setOpacity(1);
                this.scene.scale.set(1, 1, 1);
            }

            // Update all systems
            this.animationSystem.update();
            this.physicsSystem.update();
            this.particleSystem.update();

            // Update systems with new triangles array (in case divisions happened)
            this.physicsSystem.setTriangles(this.triangles);
            this.animationSystem.setTriangles(this.triangles);
            this.inputSystem.setTriangles(this.triangles);
        } else {
            // Menu is showing - keep canvas visible but dim
            this.renderSystem.setOpacity(0.3);
        }

        // Always render
        this.renderSystem.render();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        console.log("🗑️ GameManager: Cleaning up");

        // Dispose systems
        if (this.inputSystem) this.inputSystem.dispose();
        if (this.renderSystem) this.renderSystem.dispose();
        if (this.physicsSystem) this.physicsSystem.dispose();
        if (this.animationSystem) this.animationSystem.dispose();
        if (this.particleSystem) this.particleSystem.clear();

        // Clear scene
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat) => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        // Reset references
        this.fireflies = [];
        this.triangles = [];
    }

    /**
     * Get current game state
     */
    getState() {
        return this.state;
    }
}
