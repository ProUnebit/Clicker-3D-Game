import * as THREE from "three";
import { CONFIG } from "./config.js";

/**
 * Initialize WebGL renderer
 * @param {HTMLCanvasElement} canvas
 * @returns {THREE.WebGLRenderer}
 */
export function initRenderer(canvas) {
    const { CLEAR_COLOR, CLEAR_ALPHA } = CONFIG.RENDERER;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(CLEAR_COLOR, CLEAR_ALPHA);
    renderer.domElement.style.opacity = 0; // For fade-in effect

    return renderer;
}
