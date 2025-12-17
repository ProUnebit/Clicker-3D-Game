import * as THREE from "three";
import { CONFIG } from "../config";
import type { FireflyMesh } from "../types";
import {
    getRandomColor,
    getRandomPosition,
    getRandomVelocity,
    bounceOffBounds,
} from "./utils";

/**
 * Initialize fireflies in the scene
 * @param scene - Scene to add fireflies to
 * @returns Array of firefly meshes
 */
export function initFireflies(scene: THREE.Scene): FireflyMesh[] {
    const fireflies: FireflyMesh[] = [];
    const {
        COUNT,
        SIZE,
        SEGMENTS,
        VELOCITY_RANGE,
        PULSE_MIN,
        PULSE_RANGE,
        EMISSIVE_INTENSITY,
        MATERIAL,
    } = CONFIG.FIREFLIES;

    for (let i = 0; i < COUNT; i++) {
        const geometry = new THREE.SphereGeometry(SIZE, SEGMENTS, SEGMENTS);
        const color = getRandomColor();

        const material = new THREE.MeshPhysicalMaterial({
            color,
            emissive: color,
            emissiveIntensity: EMISSIVE_INTENSITY,
            metalness: MATERIAL.METALNESS,
            roughness: MATERIAL.ROUGHNESS,
            opacity: MATERIAL.OPACITY,
            transparent: true,
            transmission: MATERIAL.TRANSMISSION,
            clearcoat: MATERIAL.CLEARCOAT,
            clearcoatRoughness: MATERIAL.CLEARCOAT_ROUGHNESS,
        });

        const firefly = new THREE.Mesh(geometry, material) as FireflyMesh;
        firefly.position.copy(getRandomPosition());

        firefly.userData = {
            velocity: getRandomVelocity(VELOCITY_RANGE),
            pulse: Math.random() * PULSE_RANGE + PULSE_MIN,
            pulseDirection: 1,
        };

        scene.add(firefly);
        fireflies.push(firefly);
    }

    return fireflies;
}

/**
 * Animate all fireflies (movement and pulsing effect)
 * @param fireflies - Array of firefly meshes to animate
 */
export function animateFireflies(fireflies: FireflyMesh[]): void {
    const { EMISSIVE_MAX, EMISSIVE_MIN } = CONFIG.FIREFLIES;

    fireflies.forEach((firefly) => {
        // Update position
        firefly.position.add(firefly.userData.velocity);

        // Update pulsing effect
        firefly.material.emissiveIntensity +=
            firefly.userData.pulse * firefly.userData.pulseDirection;

        // Bounce off boundaries
        bounceOffBounds(firefly);

        // Reverse pulse direction at limits
        if (
            firefly.material.emissiveIntensity >= EMISSIVE_MAX ||
            firefly.material.emissiveIntensity <= EMISSIVE_MIN
        ) {
            firefly.userData.pulseDirection *= -1;
        }
    });
}
