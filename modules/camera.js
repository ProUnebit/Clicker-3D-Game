import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CONFIG } from "./config.js";

/**
 * Initialize camera
 * @returns {THREE.PerspectiveCamera}
 */
export function initCamera() {
    const { FOV, NEAR, FAR, POSITION } = CONFIG.CAMERA;

    const camera = new THREE.PerspectiveCamera(
        FOV,
        window.innerWidth / window.innerHeight,
        NEAR,
        FAR
    );

    camera.position.set(POSITION.x, POSITION.y, POSITION.z);

    return camera;
}

/**
 * Initialize orbit controls
 * @param {THREE.Camera} camera
 * @param {HTMLElement} domElement
 * @returns {OrbitControls}
 */
export function initControls(camera, domElement) {
    const { DAMPING_FACTOR, MIN_DISTANCE, MAX_DISTANCE, ENABLE_PAN } =
        CONFIG.CONTROLS;

    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = DAMPING_FACTOR;
    controls.minDistance = MIN_DISTANCE;
    controls.maxDistance = MAX_DISTANCE;
    controls.enablePan = ENABLE_PAN;

    return controls;
}
