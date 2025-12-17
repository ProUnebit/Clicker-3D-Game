import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CONFIG } from "../config";
import type { GameState, FireflyMesh, TriangleMesh } from "../types";
import { initScene } from "./scene";
import { initCamera, initControls } from "./camera";
import { initLighting } from "./lighting";
import { initFireflies } from "./fireflies";
import { initTriangles } from "./triangles";
import { ScoreManager } from "./ScoreManager";
import { ParticleSystem } from "./particles";
import { RenderSystem } from "./systems/RenderSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { AnimationSystem } from "./systems/AnimationSystem";
import { InputSystem } from "./systems/InputSystem";

/**
 * GameManager - Main game controller
 * Manages game state, systems, and lifecycle
 */
export class GameManager {
    private state: GameState;
    private animationId: number | null;
    private clock: THREE.Clock;

    // Core Three.js objects
    private scene: THREE.Scene | null;
    private camera: THREE.PerspectiveCamera | null;
    private controls: OrbitControls | null;

    // Game objects
    private fireflies: FireflyMesh[];
    private triangles: TriangleMesh[];
    private lightningGroup: THREE.Group | null;

    // Managers
    private scoreManager: ScoreManager | null;
    private particleSystem: ParticleSystem | null;

    // Systems
    private renderSystem: RenderSystem | null;
    private physicsSystem: PhysicsSystem | null;
    private animationSystem: AnimationSystem | null;
    private inputSystem: InputSystem | null;

    // Big Bang effect
    private explosionStarted: boolean;
    private gameStartTime: number | null;

    constructor() {
        this.state = "menu";
        this.animationId = null;
        this.clock = new THREE.Clock();

        // Initialize as null - will be set in initialize()
        this.scene = null;
        this.camera = null;
        this.controls = null;

        this.fireflies = [];
        this.triangles = [];
        this.lightningGroup = null;

        this.scoreManager = null;
        this.particleSystem = null;

        this.renderSystem = null;
        this.physicsSystem = null;
        this.animationSystem = null;
        this.inputSystem = null;

        this.explosionStarted = false;
        this.gameStartTime = null;
    }

    /**
     * Initialize all game components
     */
    initialize(): void {
        console.log("🎮 GameManager: Initializing...");

        // Initialize Three.js core
        this.scene = initScene();
        this.camera = initCamera();

        const canvasElement = document.getElementById("three-canvas");
        if (!(canvasElement instanceof HTMLElement)) {
            throw new Error("Canvas element not found");
        }
        this.controls = initControls(this.camera, canvasElement);

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
    start(): void {
        if (this.state === "playing") return;

        console.log("▶️ GameManager: Starting game");
        this.state = "playing";
        this.explosionStarted = false;
        this.gameStartTime = null;

        // Animation loop is already running from startAnimationLoop()
    }

    /**
     * Start the animation loop (call once during initialization)
     * This keeps the canvas rendering even in menu state
     */
    startAnimationLoop(): void {
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Pause the game
     */
    pause(): void {
        if (this.state !== "playing") return;

        console.log("⏸️ GameManager: Pausing game");
        this.state = "paused";
    }

    /**
     * Resume the game
     */
    resume(): void {
        if (this.state !== "paused") return;

        console.log("▶️ GameManager: Resuming game");
        this.state = "playing";
    }

    /**
     * Restart the game
     */
    restart(): void {
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
    stop(): void {
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
    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);

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
                this.scene?.scale.set(
                    INITIAL_SCALE,
                    INITIAL_SCALE,
                    INITIAL_SCALE
                );
            }

            if (this.gameStartTime !== null) {
                const elapsedTime =
                    this.clock.getElapsedTime() - this.gameStartTime;
                if (elapsedTime < CONFIG.EXPLOSION.DURATION) {
                    const progress = elapsedTime / CONFIG.EXPLOSION.DURATION;
                    this.renderSystem?.setOpacity(progress);
                    this.scene?.scale.set(progress, progress, progress);
                } else {
                    this.renderSystem?.setOpacity(1);
                    this.scene?.scale.set(1, 1, 1);
                }
            }

            // Update all systems
            this.animationSystem?.update();
            this.physicsSystem?.update();
            this.particleSystem?.update();

            // Update systems with new triangles array (in case divisions happened)
            this.physicsSystem?.setTriangles(this.triangles);
            this.animationSystem?.setTriangles(this.triangles);
            this.inputSystem?.setTriangles(this.triangles);
        } else {
            // Menu is showing - keep canvas visible but dim
            this.renderSystem?.setOpacity(0.3);
        }

        // Always render
        this.renderSystem?.render();
    };

    /**
     * Cleanup resources
     */
    private cleanup(): void {
        console.log("🗑️ GameManager: Cleaning up");

        // Dispose systems
        this.inputSystem?.dispose();
        this.renderSystem?.dispose();
        this.physicsSystem?.dispose();
        this.animationSystem?.dispose();
        this.particleSystem?.clear();

        // Clear scene
        if (this.scene) {
            this.scene.traverse((object) => {
                if ("geometry" in object && object.geometry) {
                    (object.geometry as THREE.BufferGeometry).dispose();
                }
                if ("material" in object && object.material) {
                    const material = object.material as
                        | THREE.Material
                        | THREE.Material[];
                    if (Array.isArray(material)) {
                        material.forEach((mat) => mat.dispose());
                    } else {
                        material.dispose();
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
     * @returns Current game state
     */
    getState(): GameState {
        return this.state;
    }
}
