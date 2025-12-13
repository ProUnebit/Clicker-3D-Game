import * as THREE from "three";
import { CONFIG } from "./config.js";
import { divideTriangle } from "./triangles.js";

/**
 * Set up all event listeners
 * @param {Object} params
 * @param {THREE.Mesh[]} params.triangles
 * @param {ScoreManager} params.scoreManager
 * @param {ParticleSystem} params.particleSystem
 * @param {THREE.Scene} params.scene
 * @param {THREE.Camera} params.camera
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {EffectComposer} params.composer
 * @param {ShaderPass} params.fxaaPass
 */
export function setupEvents({
    triangles,
    scoreManager,
    particleSystem,
    scene,
    camera,
    renderer,
    composer,
    fxaaPass,
}) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const instructionsEl = document.getElementById("instructions");

    /**
     * Helper to set pointer coordinates from event
     */
    function setPointerFromEvent(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
    }

    // Mouse hover - push triangles away
    window.addEventListener("pointermove", (event) => {
        setPointerFromEvent(event);
        const intersects = raycaster.intersectObjects(triangles);

        if (intersects.length > 0) {
            intersects.forEach((intersect) => {
                const triangle = intersect.object;

                // Skip if already flashing
                if (triangle.userData.isFlashing) return;

                // Apply push force
                const force = new THREE.Vector3()
                    .subVectors(triangle.position, raycaster.ray.origin)
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
    });

    // Click - increment score and divide triangle
    window.addEventListener("pointerdown", (event) => {
        setPointerFromEvent(event);
        const intersects = raycaster.intersectObjects(triangles);

        if (intersects.length > 0) {
            const triangle = intersects[0].object;

            // Increment score
            scoreManager.increment();

            // Create particle explosion
            const particleColor = triangle.material.color.getHex();
            particleSystem.createExplosion(
                triangle.position.clone(),
                particleColor
            );

            // Try to divide triangle
            const divided =
                CONFIG.TRIANGLES.DIVISION.ENABLED &&
                divideTriangle(scene, triangle, triangles);

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
            if (instructionsEl) {
                instructionsEl.classList.add("acknowledged");
                setTimeout(() => {
                    instructionsEl.classList.remove("acknowledged");
                }, CONFIG.UI.INSTRUCTIONS_FLASH_DURATION);
            }
        }
    });

    // Window resize
    window.addEventListener("resize", () => {
        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);

        // Update FXAA resolution
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms["resolution"].value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
    });
}
