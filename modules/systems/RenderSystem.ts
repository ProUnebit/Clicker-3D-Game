import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { initRenderer } from "../renderer";
import { initPostProcessing } from "../postprocessing";

/**
 * RenderSystem - Manages rendering and post-processing
 * Handles WebGL renderer, effect composer, and window resize
 */
export class RenderSystem {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private canvas: HTMLCanvasElement;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private fxaaPass: ShaderPass;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;

        const canvasElement = document.getElementById("three-canvas");
        if (!(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error("Canvas element not found or is not a canvas");
        }
        this.canvas = canvasElement;

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
    render(): void {
        this.composer.render();
    }

    /**
     * Handle window resize
     */
    handleResize(): void {
        // ✅ Теперь ошибок не будет
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);

        const pixelRatio = this.renderer.getPixelRatio();
        this.fxaaPass.material.uniforms["resolution"].value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
    }

    /**
     * Set canvas opacity (for fade effects)
     * @param opacity - Opacity value (0-1)
     */
    setOpacity(opacity: number): void {
        this.renderer.domElement.style.opacity = opacity.toString();
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        this.renderer.dispose();
        // EffectComposer doesn't have a dispose method, but we clean up passes
        this.composer.passes.forEach((pass) => {
            if ("dispose" in pass && typeof pass.dispose === "function") {
                (pass as any).dispose();
            }
        });
    }
}
