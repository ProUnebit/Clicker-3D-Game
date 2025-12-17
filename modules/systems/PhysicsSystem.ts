import type { TriangleMesh } from "../../types";
import { handleTriangleCollisions } from "../triangles";

/**
 * PhysicsSystem - Manages physics and collisions
 * Handles collision detection and response between triangles
 */
export class PhysicsSystem {
    private triangles: TriangleMesh[];

    constructor(triangles: TriangleMesh[]) {
        this.triangles = triangles;
    }

    /**
     * Update physics (collision detection)
     */
    update(): void {
        handleTriangleCollisions(this.triangles);
    }

    /**
     * Update triangles reference (for when triangles array changes due to division)
     * @param triangles - New triangles array
     */
    setTriangles(triangles: TriangleMesh[]): void {
        this.triangles = triangles;
    }

    /**
     * Cleanup (no resources to clean up)
     */
    dispose(): void {
        // Physics system doesn't need cleanup
    }
}
