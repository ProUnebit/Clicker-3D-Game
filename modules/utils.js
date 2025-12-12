import * as THREE from "three";
import { CONFIG } from "./config.js";

/**
 * Bounce object off scene boundaries
 * @param {THREE.Mesh} object - Object to bounce
 * @param {number} bounds - Boundary limit
 */
export function bounceOffBounds(object, bounds = CONFIG.BOUNDS) {
    const axes = ["x", "y", "z"];

    axes.forEach((axis) => {
        if (object.position[axis] > bounds || object.position[axis] < -bounds) {
            object.userData.velocity[axis] = -object.userData.velocity[axis];
        }
    });
}

/**
 * Get random color from palette
 * @returns {number} Hex color
 */
export function getRandomColor() {
    const { PALETTE } = CONFIG.COLORS;
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

/**
 * Generate random position within bounds
 * @param {number} range - Position range (default: 20)
 * @returns {THREE.Vector3}
 */
export function getRandomPosition(range = 20) {
    return new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
    );
}

/**
 * Generate random velocity
 * @param {number} range - Velocity range
 * @returns {THREE.Vector3}
 */
export function getRandomVelocity(range) {
    return new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
    );
}

/**
 * Check if enough time has elapsed
 * @param {number} startTime - Start timestamp
 * @param {number} duration - Duration in milliseconds
 * @returns {boolean}
 */
export function hasElapsed(startTime, duration) {
    return performance.now() - startTime >= duration;
}
