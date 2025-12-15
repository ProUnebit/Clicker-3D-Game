import * as THREE from "three";
import { CONFIG } from "./config.js";

/**
 * Create a lightning bolt with branches
 * @param {THREE.Group} lightningGroup
 */
export function createLightning(lightningGroup) {
    const { SEGMENTS, MAX_LENGTH } = CONFIG.LIGHTNING;
    const { LIGHTNING } = CONFIG.COLORS;

    // Random start point
    const startX = (Math.random() - 0.5) * 30;
    const startY = (Math.random() - 0.5) * 30;
    const startZ = (Math.random() - 0.5) * 30;
    const startPoint = new THREE.Vector3(startX, startY, startZ);

    // Random direction
    const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
    ).normalize();

    // Create main bolt
    const mainBolt = createBolt(
        startPoint,
        direction,
        MAX_LENGTH,
        SEGMENTS,
        LIGHTNING,
        1.0
    );
    mainBolt.userData.createdAt = performance.now();
    mainBolt.userData.isMainBolt = true;
    lightningGroup.add(mainBolt);

    // Create 1-3 branches
    const branchCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < branchCount; i++) {
        // Branch starts somewhere along main bolt
        const branchT = 0.3 + Math.random() * 0.4; // 30-70% along main bolt
        const branchStart = startPoint
            .clone()
            .add(direction.clone().multiplyScalar(MAX_LENGTH * branchT));

        // Random branch direction (perpendicular-ish to main bolt)
        const branchDir = new THREE.Vector3(
            direction.x + (Math.random() - 0.5) * 1.5,
            direction.y + (Math.random() - 0.5) * 1.5,
            direction.z + (Math.random() - 0.5) * 1.5
        ).normalize();

        const branchLength = MAX_LENGTH * (0.3 + Math.random() * 0.3); // 30-60% of main length
        const branch = createBolt(
            branchStart,
            branchDir,
            branchLength,
            Math.floor(SEGMENTS * 0.6),
            LIGHTNING,
            0.6
        );
        branch.userData.createdAt = performance.now();
        branch.userData.isMainBolt = false;
        lightningGroup.add(branch);
    }
}

/**
 * Create a single lightning bolt segment
 * @param {THREE.Vector3} start - Start position
 * @param {THREE.Vector3} direction - Direction vector
 * @param {number} length - Total length
 * @param {number} segments - Number of segments
 * @param {number} color - Color
 * @param {number} thickness - Thickness multiplier
 * @returns {THREE.Group}
 */
function createBolt(start, direction, length, segments, color, thickness) {
    const boltGroup = new THREE.Group();

    // Generate jagged path
    const points = [];
    let currentPos = start.clone();
    points.push(currentPos.clone());

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;

        // Move along direction with random offset
        const step = direction.clone().multiplyScalar(length / segments);

        // Add perpendicular random offset (creates zigzag)
        const perpendicular1 = new THREE.Vector3(
            -direction.y,
            direction.x,
            0
        ).normalize();
        const perpendicular2 = new THREE.Vector3()
            .crossVectors(direction, perpendicular1)
            .normalize();

        const offset = perpendicular1
            .clone()
            .multiplyScalar((Math.random() - 0.5) * 0.8)
            .add(
                perpendicular2
                    .clone()
                    .multiplyScalar((Math.random() - 0.5) * 0.8)
            );

        currentPos.add(step).add(offset);
        points.push(currentPos.clone());
    }

    // Create main line (bright core)
    const coreGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const coreMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7, // Было 1.0
        linewidth: 3 * thickness,
    });
    const coreLine = new THREE.Line(coreGeometry, coreMaterial);
    boltGroup.add(coreLine);

    // Create glow layer 1 (inner glow)
    const glow1Geometry = new THREE.BufferGeometry().setFromPoints(points);
    const glow1Material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4, // Было 0.6
        linewidth: 5 * thickness,
        blending: THREE.AdditiveBlending,
    });
    const glow1Line = new THREE.Line(glow1Geometry, glow1Material);
    boltGroup.add(glow1Line);

    // Create glow layer 2 (outer glow)
    const glow2Geometry = new THREE.BufferGeometry().setFromPoints(points);
    const glow2Material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2, // Было 0.3
        linewidth: 8 * thickness,
        blending: THREE.AdditiveBlending,
    });
    const glow2Line = new THREE.Line(glow2Geometry, glow2Material);
    boltGroup.add(glow2Line);

    // Store references for animation
    boltGroup.userData.coreMaterial = coreMaterial;
    boltGroup.userData.glow1Material = glow1Material;
    boltGroup.userData.glow2Material = glow2Material;
    boltGroup.userData.maxOpacity = { core: 0.7, glow1: 0.4, glow2: 0.2 }; // Обновлённые значения

    return boltGroup;
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
        flashLight.userData.initialIntensity = FLASH_INTENSITY;
        scene.add(flashLight);
    }

    // Animate existing lightning bolts
    const now = performance.now();
    const objectsToRemove = [];

    lightningGroup.children.forEach((bolt) => {
        const age = now - bolt.userData.createdAt;
        const progress = age / FLASH_DURATION;

        if (progress >= 1) {
            // Remove expired bolt
            objectsToRemove.push({ parent: lightningGroup, child: bolt });
        } else {
            // Flickering effect
            const flicker = Math.random() > 0.3 ? 1 : 0.3; // 70% chance full brightness, 30% dim

            // Fade out towards end
            const fadeOut = 1 - Math.pow(progress, 2); // Quadratic fade

            // Apply to all materials
            if (bolt.userData.coreMaterial) {
                bolt.userData.coreMaterial.opacity =
                    bolt.userData.maxOpacity.core * fadeOut * flicker;
            }
            if (bolt.userData.glow1Material) {
                bolt.userData.glow1Material.opacity =
                    bolt.userData.maxOpacity.glow1 * fadeOut * flicker;
            }
            if (bolt.userData.glow2Material) {
                bolt.userData.glow2Material.opacity =
                    bolt.userData.maxOpacity.glow2 * fadeOut * flicker;
            }
        }
    });

    // Animate flash lights
    scene.children.forEach((child) => {
        if (child instanceof THREE.PointLight && child.userData.createdAt) {
            const age = now - child.userData.createdAt;
            const progress = age / FLASH_DURATION;

            if (progress >= 1) {
                objectsToRemove.push({ parent: scene, child });
            } else {
                // Fade out flash
                child.intensity =
                    child.userData.initialIntensity * (1 - progress);
            }
        }
    });

    // Remove expired objects
    objectsToRemove.forEach(({ parent, child }) => {
        parent.remove(child);

        // Dispose geometries and materials
        if (child.traverse) {
            child.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
    });
}
