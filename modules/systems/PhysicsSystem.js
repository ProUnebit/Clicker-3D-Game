import { handleTriangleCollisions } from "../triangles.js";

/**
 * PhysicsSystem - Manages physics and collisions
 */
export class PhysicsSystem {
    constructor(triangles) {
        this.triangles = triangles;
    }

    /**
     * Update physics (collisions)
     */
    update() {
        handleTriangleCollisions(this.triangles);
    }

    /**
     * Update triangles reference (for when triangles array changes)
     */
    setTriangles(triangles) {
        this.triangles = triangles;
    }

    /**
     * Cleanup
     */
    dispose() {
        // Physics system doesn't need cleanup
    }
}
