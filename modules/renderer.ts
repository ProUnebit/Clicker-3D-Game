import * as THREE from "three";
import { CONFIG } from "../config";

/**
 * Initialize WebGL renderer
 * @param canvas - HTML canvas element to render to
 * @returns Configured THREE.WebGLRenderer
 */
export function initRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const { CLEAR_COLOR, CLEAR_ALPHA } = CONFIG.RENDERER;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(CLEAR_COLOR, CLEAR_ALPHA);
    renderer.setPixelRatio(pixelRatio);
    renderer.domElement.style.opacity = "0"; // For fade-in effect

    return renderer;
}
