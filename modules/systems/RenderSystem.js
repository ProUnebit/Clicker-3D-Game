import { initRenderer } from "../renderer.js";
import { initPostProcessing } from "../postprocessing.js";

/**
 * RenderSystem - Manages rendering and post-processing
 */
export class RenderSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.canvas = document.getElementById("three-canvas");

        // Initialize renderer and composer
        this.renderer = initRenderer(this.canvas);
        const { composer, fxaaPass } = initPostProcessing(
            this.renderer,
            this.scene,
            this.camera
        );
        this.composer = composer;
        this.fxaaPass = fxaaPass;
    }

    /**
     * Render the scene
     */
    render() {
        this.composer.render();
    }

    /**
     * Update on window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);

        // Update FXAA resolution
        const pixelRatio = this.renderer.getPixelRatio();
        this.fxaaPass.material.uniforms["resolution"].value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
    }

    /**
     * Set canvas opacity (for fade effects)
     */
    setOpacity(opacity) {
        this.renderer.domElement.style.opacity = opacity;
    }

    /**
     * Cleanup
     */
    dispose() {
        this.renderer.dispose();
        this.composer.dispose();
    }
}
