import { animateFireflies } from "../fireflies.js";
import { animateTriangles, handleTriangleFlashes } from "../triangles.js";
import { animateLightning } from "../lightning.js";

/**
 * AnimationSystem - Manages all game object animations
 */
export class AnimationSystem {
    constructor(fireflies, triangles, lightningGroup, scene) {
        this.fireflies = fireflies;
        this.triangles = triangles;
        this.lightningGroup = lightningGroup;
        this.scene = scene;
    }

    /**
     * Update all animations
     */
    update() {
        animateFireflies(this.fireflies);
        animateTriangles(this.triangles);
        handleTriangleFlashes(this.triangles);
        animateLightning(this.lightningGroup, this.scene);
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
        // Animation system doesn't need cleanup
    }
}
