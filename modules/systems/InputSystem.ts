import * as THREE from "three";
import { CONFIG } from "../../config";
import type { TriangleMesh, InputSystemConfig } from "../../types";
import { divideTriangle } from "../triangles";

/**
 * InputSystem - Manages all user input (mouse, keyboard, touch)
 * Handles raycasting, click detection, and hover effects
 */
export class InputSystem {
    private triangles: TriangleMesh[];
    private scoreManager: InputSystemConfig["scoreManager"];
    private particleSystem: InputSystemConfig["particleSystem"];
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderSystem: InputSystemConfig["renderSystem"];

    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;
    private instructionsEl: HTMLElement | null;

    private boundHandleResize: () => void;
    private boundHandlePointerMove: (event: PointerEvent) => void;
    private boundHandlePointerDown: (event: PointerEvent) => void;

    constructor(config: InputSystemConfig) {
        this.triangles = config.triangles;
        this.scoreManager = config.scoreManager;
        this.particleSystem = config.particleSystem;
        this.scene = config.scene;
        this.camera = config.camera;
        this.renderSystem = config.renderSystem;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.instructionsEl = document.getElementById("instructions");

        // Bind event handlers
        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandlePointerMove = this.handlePointerMove.bind(this);
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    }

    /**
     * Initialize event listeners
     */
    initialize(): void {
        window.addEventListener("resize", this.boundHandleResize);
        window.addEventListener("pointermove", this.boundHandlePointerMove);
        window.addEventListener("pointerdown", this.boundHandlePointerDown);
    }

    /**
     * Set pointer coordinates from event
     * @param event - Pointer event
     */
    private setPointerFromEvent(event: PointerEvent): void {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }

    /**
     * Handle mouse/touch move
     * @param event - Pointer move event
     */
    private handlePointerMove(event: PointerEvent): void {
        this.setPointerFromEvent(event);
        const intersects = this.raycaster.intersectObjects(
            this.triangles as THREE.Object3D[]
        );

        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                const triangle = intersect.object as TriangleMesh;

                // Skip if already flashing
                if (triangle.userData.isFlashing) return;

                // Apply push force
                const force = new THREE.Vector3()
                    .subVectors(triangle.position, this.raycaster.ray.origin)
                    .normalize()
                    .multiplyScalar(CONFIG.TRIANGLES.PUSH_FORCE);
                triangle.position.add(force);

                // Start flash effect
                triangle.userData.isFlashing = true;
                triangle.userData.flashStartTime = performance.now();
                triangle.userData.originalEmissive =
                    triangle.material.emissive.clone();

                triangle.material.emissive.set(CONFIG.COLORS.FLASH);
                triangle.material.emissiveIntensity = 0.5;
            });
        }
    }

    /**
     * Handle click/tap
     * @param event - Pointer down event
     */
    private handlePointerDown(event: PointerEvent): void {
        this.setPointerFromEvent(event);
        const intersects = this.raycaster.intersectObjects(
            this.triangles as THREE.Object3D[]
        );

        if (intersects.length > 0) {
            const triangle = intersects[0].object as TriangleMesh;

            // Get triangle color
            const triangleColor = triangle.material.color.getHex();

            // Increment score with color
            this.scoreManager.increment(triangleColor);

            // Create particle explosion
            this.particleSystem.createExplosion(
                triangle.position.clone(),
                triangleColor
            );

            // Try to divide triangle
            const divided =
                CONFIG.TRIANGLES.DIVISION.ENABLED &&
                divideTriangle(this.scene, triangle, this.triangles);

            // If not divided (too small), just do scale animation
            if (!divided) {
                triangle.scale.multiplyScalar(
                    CONFIG.TRIANGLES.CLICK_SCALE_FACTOR
                );
                setTimeout(() => {
                    triangle.scale.multiplyScalar(
                        1 / CONFIG.TRIANGLES.CLICK_SCALE_FACTOR
                    );
                }, CONFIG.TRIANGLES.CLICK_SCALE_DURATION);
            }

            // Flash instructions
            if (this.instructionsEl) {
                this.instructionsEl.classList.add("acknowledged");
                setTimeout(() => {
                    this.instructionsEl?.classList.remove("acknowledged");
                }, CONFIG.UI.INSTRUCTIONS_FLASH_DURATION);
            }
        }
    }

    /**
     * Handle window resize
     */
    private handleResize(): void {
        this.renderSystem.handleResize();
    }

    /**
     * Update triangles reference (for when triangles array changes due to division)
     * @param triangles - New triangles array
     */
    setTriangles(triangles: TriangleMesh[]): void {
        this.triangles = triangles;
    }

    /**
     * Cleanup event listeners
     */
    dispose(): void {
        window.removeEventListener("resize", this.boundHandleResize);
        window.removeEventListener("pointermove", this.boundHandlePointerMove);
        window.removeEventListener("pointerdown", this.boundHandlePointerDown);
    }
}
