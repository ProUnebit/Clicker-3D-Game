import * as THREE from "three";
import { CONFIG } from "./config.js";

/**
 * Create a single lightning strike
 * @param {THREE.Group} lightningGroup
 */
export function createLightning(lightningGroup) {
    const { SEGMENTS, MAX_LENGTH, LINE_WIDTH } = CONFIG.LIGHTNING;
    const { LIGHTNING } = CONFIG.COLORS;

    const lightningMaterial = new THREE.LineBasicMaterial({
        color: LIGHTNING,
        linewidth: LINE_WIDTH,
    });

    const points = [];
    const startX = (Math.random() - 0.5) * 30;
    const startY = (Math.random() - 0.5) * 30;
    const startZ = (Math.random() - 0.5) * 30;

    // Generate points for a curved lightning bolt
    for (let i = 0; i < SEGMENTS; i++) {
        const t = i / SEGMENTS;
        const x = startX + Math.sin(t * Math.PI) * (Math.random() - 0.5) * 2;
        const y = startY + t * MAX_LENGTH - MAX_LENGTH / 2;
        const z = startZ + Math.cos(t * Math.PI) * (Math.random() - 0.5) * 2;
        points.push(new THREE.Vector3(x, y, z));
    }

    const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lightning = new THREE.Line(lightningGeometry, lightningMaterial);

    // Store creation time for cleanup
    lightning.userData.createdAt = performance.now();

    lightningGroup.add(lightning);
}

/**
 * Animate lightning strikes randomly
 * @param {THREE.Group} lightningGroup
 * @param {THREE.Scene} scene
 */
export function animateLightning(lightningGroup, scene) {
    const { SPAWN_CHANCE, FLASH_DURATION, FLASH_INTENSITY, FLASH_DISTANCE } =
        CONFIG.LIGHTNING;
    const { LIGHTNING } = CONFIG.COLORS;

    // Random spawn
    if (Math.random() > SPAWN_CHANCE) {
        createLightning(lightningGroup);

        // Add flash effect
        const flashLight = new THREE.PointLight(
            LIGHTNING,
            FLASH_INTENSITY,
            FLASH_DISTANCE
        );
        const positionX = (Math.random() - 0.5) * 30;
        const positionY = (Math.random() - 0.5) * 30;
        const positionZ = (Math.random() - 0.5) * 30;
        flashLight.position.set(positionX, positionY, positionZ);
        flashLight.userData.createdAt = performance.now();
        scene.add(flashLight);
    }

    // Cleanup old lightning strikes and flashes
    const now = performance.now();
    const objectsToRemove = [];

    // Check lightning group
    lightningGroup.children.forEach((lightning) => {
        if (now - lightning.userData.createdAt >= FLASH_DURATION) {
            objectsToRemove.push({ parent: lightningGroup, child: lightning });
        }
    });

    // Check scene for flash lights
    scene.children.forEach((child) => {
        if (child instanceof THREE.PointLight && child.userData.createdAt) {
            if (now - child.userData.createdAt >= FLASH_DURATION) {
                objectsToRemove.push({ parent: scene, child });
            }
        }
    });

    // Remove expired objects
    objectsToRemove.forEach(({ parent, child }) => {
        parent.remove(child);
    });
}
