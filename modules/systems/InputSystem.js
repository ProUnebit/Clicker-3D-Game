import * as THREE from "three";
import { CONFIG } from "../config.js";
import { divideTriangle } from "../triangles.js";

/**
 * InputSystem - Manages all user input (mouse, keyboard, touch)
 */
export class InputSystem {
    constructor({
        triangles,
        scoreManager,
        particleSystem,
        scene,
        camera,
        renderSystem,
    }) {
        this.triangles = triangles;
        this.scoreManager = scoreManager;
        this.particleSystem = particleSystem;
        this.scene = scene;
        this.camera = camera;
        this.renderSystem = renderSystem;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.instructionsEl = document.getElementById("instructions");

        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandlePointerMove = this.handlePointerMove.bind(this);
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    }

    /**
     * Initialize event listeners
     */
    initialize() {
        window.addEventListener("resize", this.boundHandleResize);
        window.addEventListener("pointermove", this.boundHandlePointerMove);
        window.addEventListener("pointerdown", this.boundHandlePointerDown);
    }

    /**
     * Set pointer coordinates from event
     */
    setPointerFromEvent(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }

    /**
     * Handle mouse/touch move
     */
    handlePointerMove(event) {
        this.setPointerFromEvent(event);
        const intersects = this.raycaster.intersectObjects(this.triangles);

        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                const triangle = intersect.object;

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
     */
    handlePointerDown(event) {
        this.setPointerFromEvent(event);
        const intersects = this.raycaster.intersectObjects(this.triangles);

        if (intersects.length > 0) {
            const triangle = intersects[0].object;

            // Increment score
            this.scoreManager.increment();

            // Create particle explosion
            const particleColor = triangle.material.color.getHex();
            this.particleSystem.createExplosion(
                triangle.position.clone(),
                particleColor
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
                    this.instructionsEl.classList.remove("acknowledged");
                }, CONFIG.UI.INSTRUCTIONS_FLASH_DURATION);
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.renderSystem.handleResize();
    }

    /**
     * Update triangles reference (for when triangles array changes)
     */
    setTriangles(triangles) {
        this.triangles = triangles;
    }

    /**
     * Cleanup
     */
    dispose() {
        window.removeEventListener("resize", this.boundHandleResize);
        window.removeEventListener("pointermove", this.boundHandlePointerMove);
        window.removeEventListener("pointerdown", this.boundHandlePointerDown);
    }
}
