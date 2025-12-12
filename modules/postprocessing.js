import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";
import { CONFIG } from "./config.js";

/**
 * Initialize effect composer with post-processing passes
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {{ composer: EffectComposer, fxaaPass: ShaderPass }}
 */
export function initPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);

    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // FXAA anti-aliasing
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms["resolution"].value.set(
        1 / (window.innerWidth * pixelRatio),
        1 / (window.innerHeight * pixelRatio)
    );
    composer.addPass(fxaaPass);

    // Bloom effect
    const { STRENGTH, RADIUS, THRESHOLD } = CONFIG.POST_PROCESSING.BLOOM;
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        STRENGTH,
        RADIUS,
        THRESHOLD
    );
    composer.addPass(bloomPass);

    // Blur for lightning
    const { HORIZONTAL, VERTICAL } = CONFIG.POST_PROCESSING.BLUR;

    const horizontalBlurPass = new ShaderPass(HorizontalBlurShader);
    horizontalBlurPass.uniforms["h"].value = HORIZONTAL / window.innerWidth;
    composer.addPass(horizontalBlurPass);

    const verticalBlurPass = new ShaderPass(VerticalBlurShader);
    verticalBlurPass.uniforms["v"].value = VERTICAL / window.innerHeight;
    composer.addPass(verticalBlurPass);

    return { composer, fxaaPass };
}
