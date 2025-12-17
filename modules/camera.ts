import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CONFIG } from "../config";

/**
 * Initialize perspective camera
 * @returns Configured THREE.PerspectiveCamera
 */
export function initCamera(): THREE.PerspectiveCamera {
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
 * Initialize orbit controls for camera
 * @param camera - Camera to control
 * @param domElement - DOM element to attach controls to
 * @returns Configured OrbitControls
 */
export function initControls(
    camera: THREE.Camera,
    domElement: HTMLElement
): OrbitControls {
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
