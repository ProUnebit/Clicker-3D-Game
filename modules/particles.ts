import * as THREE from "three";
import { CONFIG } from "../config";
import type { ParticleMesh } from "../types";

/**
 * Particle system manager
 * Handles creation and animation of particle explosions
 */
export class ParticleSystem {
    private scene: THREE.Scene;
    private particles: ParticleMesh[];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.particles = [];
    }

    /**
     * Create particle explosion at position
     * @param position - Origin position
     * @param color - Particle color (hex)
     */
    createExplosion(position: THREE.Vector3, color: number): void {
        const { COUNT_PER_CLICK, SIZE, INITIAL_SPEED, SPREAD_ANGLE } =
            CONFIG.PARTICLES;

        for (let i = 0; i < COUNT_PER_CLICK; i++) {
            // Random direction in sphere
            const theta = Math.random() * SPREAD_ANGLE;
            const phi = Math.acos(2 * Math.random() - 1);

            const direction = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            ).normalize();

            // Create particle geometry
            const geometry = new THREE.SphereGeometry(SIZE, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1.0,
            });

            const particle = new THREE.Mesh(geometry, material) as ParticleMesh;
            particle.position.copy(position);

            // Store particle metadata
            particle.userData = {
                velocity: direction.multiplyScalar(INITIAL_SPEED),
                createdAt: performance.now(),
                initialOpacity: 1.0,
            };

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    /**
     * Update all particles (call in animation loop)
     */
    update(): void {
        const { GRAVITY, LIFETIME, FADE_START } = CONFIG.PARTICLES;
        const now = performance.now();
        const particlesToRemove: number[] = [];

        this.particles.forEach((particle, index) => {
            const age = now - particle.userData.createdAt;

            // Remove expired particles
            if (age >= LIFETIME) {
                particlesToRemove.push(index);
                return;
            }

            // Update position
            particle.position.add(particle.userData.velocity);

            // Apply gravity
            particle.userData.velocity.y += GRAVITY;

            // Fade out
            const fadeProgress = age / LIFETIME;
            if (fadeProgress >= FADE_START) {
                const fadeAmount =
                    (fadeProgress - FADE_START) / (1 - FADE_START);
                particle.material.opacity =
                    particle.userData.initialOpacity * (1 - fadeAmount);
            }

            // Slight scale down over time
            const scale = 1 - fadeProgress * 0.5;
            particle.scale.set(scale, scale, scale);
        });

        // Remove expired particles (backwards to avoid index issues)
        for (let i = particlesToRemove.length - 1; i >= 0; i--) {
            const index = particlesToRemove[i];
            const particle = this.particles[index];

            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();

            this.particles.splice(index, 1);
        }
    }

    /**
     * Get current particle count (for debugging)
     * @returns Number of active particles
     */
    getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * Clear all particles
     */
    clear(): void {
        this.particles.forEach((particle) => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.particles = [];
    }
}
