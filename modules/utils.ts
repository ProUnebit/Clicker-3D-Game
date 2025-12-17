import * as THREE from "three";
import { CONFIG } from "../config";
import type { FireflyMesh, TriangleMesh } from "../types";

/**
 * Bounce object off scene boundaries
 * @param object - Firefly or Triangle mesh with velocity in userData
 * @param bounds - Boundary limit (default from CONFIG)
 */
export function bounceOffBounds(
    object: FireflyMesh | TriangleMesh,
    bounds: number = CONFIG.BOUNDS
): void {
    const axes: Array<"x" | "y" | "z"> = ["x", "y", "z"];

    axes.forEach((axis) => {
        if (object.position[axis] > bounds || object.position[axis] < -bounds) {
            object.userData.velocity[axis] = -object.userData.velocity[axis];
        }
    });
}

/**
 * Get random color from palette
 * @returns Hex color from CONFIG.COLORS.PALETTE
 */
export function getRandomColor(): number {
    const { PALETTE } = CONFIG.COLORS;
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

/**
 * Generate random position within bounds
 * @param range - Position range (default: 20)
 * @returns Random Vector3 position
 */
export function getRandomPosition(range: number = 20): THREE.Vector3 {
    return new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
    );
}

/**
 * Generate random velocity vector
 * @param range - Velocity magnitude range
 * @returns Random Vector3 velocity
 */
export function getRandomVelocity(range: number): THREE.Vector3 {
    return new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
    );
}

/**
 * Check if enough time has elapsed since start
 * @param startTime - Start timestamp (from performance.now())
 * @param duration - Duration in milliseconds
 * @returns True if duration has passed
 */
export function hasElapsed(startTime: number, duration: number): boolean {
    return performance.now() - startTime >= duration;
}
