import * as THREE from "three";
import type { FireflyMesh, TriangleMesh } from "../../types";
import { animateFireflies } from "../fireflies";
import { animateTriangles, handleTriangleFlashes } from "../triangles";
import { animateLightning } from "../lightning";

/**
 * AnimationSystem - Manages all game object animations
 * Handles fireflies, triangles, lightning, and their effects
 */
export class AnimationSystem {
    private fireflies: FireflyMesh[];
    private triangles: TriangleMesh[];
    private lightningGroup: THREE.Group;
    private scene: THREE.Scene;

    constructor(
        fireflies: FireflyMesh[],
        triangles: TriangleMesh[],
        lightningGroup: THREE.Group,
        scene: THREE.Scene
    ) {
        this.fireflies = fireflies;
        this.triangles = triangles;
        this.lightningGroup = lightningGroup;
        this.scene = scene;
    }

    /**
     * Update all animations
     */
    update(): void {
        animateFireflies(this.fireflies);
        animateTriangles(this.triangles);
        handleTriangleFlashes(this.triangles);
        animateLightning(this.lightningGroup, this.scene);
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
        // Animation system doesn't need cleanup
    }
}
