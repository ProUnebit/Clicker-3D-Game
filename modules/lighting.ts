import * as THREE from "three";
import { CONFIG } from "../config";

/**
 * Initialize all scene lighting
 * @param scene - Scene to add lights to
 */
export function initLighting(scene: THREE.Scene): void {
    // Ambient light
    const { COLOR: ambientColor, INTENSITY: ambientIntensity } =
        CONFIG.LIGHTING.AMBIENT;

    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    // Warm light 1
    const {
        COLOR: color1,
        INTENSITY: intensity1,
        DISTANCE: distance1,
        POSITION: pos1,
    } = CONFIG.LIGHTING.WARM_LIGHT_1;

    const warmLight1 = new THREE.PointLight(color1, intensity1, distance1);
    warmLight1.position.set(pos1.x, pos1.y, pos1.z);
    warmLight1.castShadow = true;
    scene.add(warmLight1);

    // Warm light 2
    const {
        COLOR: color2,
        INTENSITY: intensity2,
        DISTANCE: distance2,
        POSITION: pos2,
    } = CONFIG.LIGHTING.WARM_LIGHT_2;

    const warmLight2 = new THREE.PointLight(color2, intensity2, distance2);
    warmLight2.position.set(pos2.x, pos2.y, pos2.z);
    warmLight2.castShadow = true;
    scene.add(warmLight2);
}
