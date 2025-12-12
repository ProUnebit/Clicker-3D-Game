import * as THREE from "three";
import { CONFIG } from "./config.js";
import {
    getRandomColor,
    getRandomPosition,
    getRandomVelocity,
    bounceOffBounds,
} from "./utils.js";

/**
 * Initialize triangles in the scene
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh[]} Array of triangle meshes
 */
export function initTriangles(scene) {
    const triangles = [];
    const {
        COUNT,
        EXTRUDE_DEPTH,
        BEVEL_THICKNESS,
        BEVEL_SIZE,
        BEVEL_SEGMENTS,
        VELOCITY_RANGE,
        ROTATION_SPEED_MIN,
        ROTATION_SPEED_RANGE,
        MATERIAL,
    } = CONFIG.TRIANGLES;

    for (let i = 0; i < COUNT; i++) {
        // Create triangle shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 1);
        shape.lineTo(-1, -1);
        shape.lineTo(1, -1);
        shape.lineTo(0, 1);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: EXTRUDE_DEPTH,
            bevelEnabled: true,
            bevelThickness: BEVEL_THICKNESS,
            bevelSize: BEVEL_SIZE,
            bevelSegments: BEVEL_SEGMENTS,
        });

        const color = getRandomColor();
        const material = new THREE.MeshPhysicalMaterial({
            color,
            metalness: MATERIAL.METALNESS,
            roughness: MATERIAL.ROUGHNESS,
            transmission: MATERIAL.TRANSMISSION,
            opacity: MATERIAL.OPACITY,
            transparent: true,
            thickness: MATERIAL.THICKNESS,
            clearcoat: MATERIAL.CLEARCOAT,
            clearcoatRoughness: MATERIAL.CLEARCOAT_ROUGHNESS,
        });

        const triangle = new THREE.Mesh(geometry, material);
        triangle.position.copy(getRandomPosition());

        triangle.userData = {
            velocity: getRandomVelocity(VELOCITY_RANGE),
            rotationSpeed:
                Math.random() * ROTATION_SPEED_RANGE + ROTATION_SPEED_MIN,
            isFlashing: false,
            flashStartTime: 0,
            originalEmissive: null,
        };

        scene.add(triangle);
        triangles.push(triangle);
    }

    return triangles;
}

/**
 * Animate all triangles
 * @param {THREE.Mesh[]} triangles
 */
export function animateTriangles(triangles) {
    triangles.forEach((triangle) => {
        // Rotate
        triangle.rotation.x += triangle.userData.rotationSpeed;
        triangle.rotation.y += triangle.userData.rotationSpeed;

        // Move
        triangle.position.add(triangle.userData.velocity);

        // Bounce off boundaries
        bounceOffBounds(triangle);
    });
}

/**
 * Handle flash effects for triangles
 * Should be called in animation loop
 * @param {THREE.Mesh[]} triangles
 */
export function handleTriangleFlashes(triangles) {
    const { FLASH_DURATION } = CONFIG.TRIANGLES;
    const now = performance.now();

    triangles.forEach((triangle) => {
        if (triangle.userData.isFlashing) {
            const elapsed = now - triangle.userData.flashStartTime;

            if (elapsed >= FLASH_DURATION) {
                // Reset emissive
                if (triangle.userData.originalEmissive) {
                    triangle.material.emissive.copy(
                        triangle.userData.originalEmissive
                    );
                    triangle.material.emissiveIntensity = 0.0;
                }
                triangle.userData.isFlashing = false;
            }
        }
    });
}

/**
 * Handle collisions between triangles
 * @param {THREE.Mesh[]} triangles
 */
export function handleTriangleCollisions(triangles) {
    const maxCheckDistance = 5; // Skip distant objects for performance

    for (let i = 0; i < triangles.length; i++) {
        for (let j = i + 1; j < triangles.length; j++) {
            const triA = triangles[i];
            const triB = triangles[j];

            // Quick AABB check before expensive distance calculation
            const dx = Math.abs(triA.position.x - triB.position.x);
            const dy = Math.abs(triA.position.y - triB.position.y);
            const dz = Math.abs(triA.position.z - triB.position.z);

            if (
                dx > maxCheckDistance ||
                dy > maxCheckDistance ||
                dz > maxCheckDistance
            ) {
                continue;
            }

            const distance = triA.position.distanceTo(triB.position);

            if (distance < triA.scale.x + triB.scale.x) {
                const collisionNormal = new THREE.Vector3()
                    .subVectors(triA.position, triB.position)
                    .normalize();

                triA.userData.velocity.add(
                    collisionNormal.clone().multiplyScalar(0.01)
                );
                triB.userData.velocity.sub(
                    collisionNormal.multiplyScalar(0.01)
                );
            }
        }
    }
}
