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
            scale: 1.0, // Track current scale level for division
            generation: 0, // Track how many times this has been split
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
 * Create a new triangle (used for division)
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} position
 * @param {number} color
 * @param {number} scale
 * @param {THREE.Vector3} velocity
 * @param {number} generation
 * @returns {THREE.Mesh}
 */
export function createTriangle(
    scene,
    position,
    color,
    scale,
    velocity,
    generation = 0
) {
    const {
        EXTRUDE_DEPTH,
        BEVEL_THICKNESS,
        BEVEL_SIZE,
        BEVEL_SEGMENTS,
        ROTATION_SPEED_MIN,
        ROTATION_SPEED_RANGE,
        MATERIAL,
    } = CONFIG.TRIANGLES;

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
    triangle.position.copy(position);
    triangle.scale.set(scale, scale, scale);

    triangle.userData = {
        velocity: velocity.clone(),
        rotationSpeed:
            Math.random() * ROTATION_SPEED_RANGE + ROTATION_SPEED_MIN,
        isFlashing: false,
        flashStartTime: 0,
        originalEmissive: null,
        scale: scale,
        generation: generation,
    };

    scene.add(triangle);
    return triangle;
}

/**
 * Divide triangle into two smaller triangles
 * @param {THREE.Scene} scene
 * @param {THREE.Mesh} triangle - Triangle to divide
 * @param {THREE.Mesh[]} triangles - Array of all triangles
 * @returns {boolean} - True if division happened, false if triangle too small
 */
export function divideTriangle(scene, triangle, triangles) {
    const { MIN_SCALE, SPLIT_DISTANCE, SPLIT_VELOCITY } =
        CONFIG.TRIANGLES.DIVISION;

    // Check if triangle is too small to divide
    if (triangle.userData.scale <= MIN_SCALE) {
        return false;
    }

    // Calculate new scale (half of current)
    const newScale = triangle.userData.scale * 0.5;
    const newGeneration = triangle.userData.generation + 1;

    // Get triangle color
    const color = triangle.material.color.getHex();

    // Calculate split direction (perpendicular to velocity)
    const splitDirection = new THREE.Vector3()
        .crossVectors(triangle.userData.velocity, new THREE.Vector3(0, 1, 0))
        .normalize();

    // If cross product is zero (velocity is vertical), use a different perpendicular
    if (splitDirection.length() < 0.01) {
        splitDirection.set(1, 0, 0);
    }

    // Position for two new triangles (offset from original)
    const offset = splitDirection.multiplyScalar(SPLIT_DISTANCE * newScale);
    const pos1 = triangle.position.clone().add(offset);
    const pos2 = triangle.position.clone().sub(offset);

    // Velocity for new triangles (add split velocity)
    const splitVel = splitDirection.multiplyScalar(SPLIT_VELOCITY);
    const vel1 = triangle.userData.velocity.clone().add(splitVel);
    const vel2 = triangle.userData.velocity.clone().sub(splitVel);

    // Create two new triangles
    const newTriangle1 = createTriangle(
        scene,
        pos1,
        color,
        newScale,
        vel1,
        newGeneration
    );
    const newTriangle2 = createTriangle(
        scene,
        pos2,
        color,
        newScale,
        vel2,
        newGeneration
    );

    // Add to triangles array
    triangles.push(newTriangle1, newTriangle2);

    // Remove original triangle
    const index = triangles.indexOf(triangle);
    if (index > -1) {
        triangles.splice(index, 1);
    }
    scene.remove(triangle);
    triangle.geometry.dispose();
    triangle.material.dispose();

    return true;
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
