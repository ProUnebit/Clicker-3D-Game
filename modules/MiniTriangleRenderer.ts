import * as THREE from "three";
import { CONFIG } from "../config";

/**
 * MiniTriangleRenderer - Renders small 3D triangles for color indicators
 * Creates a separate mini Three.js scene for UI display
 */
export class MiniTriangleRenderer {
    private color: number;
    private size: number;
    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private triangle: THREE.Mesh<
        THREE.ExtrudeGeometry,
        THREE.MeshPhysicalMaterial
    > | null;
    private animationId: number | null;

    constructor(color: number, size: number = 32) {
        this.color = color;
        this.size = size;
        this.canvas = document.createElement("canvas");
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
        });
        this.triangle = null;
        this.animationId = null;

        this.initialize();
    }

    /**
     * Initialize mini scene
     */
    private initialize(): void {
        // Configure canvas
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.width = `${this.size}px`;
        this.canvas.style.height = `${this.size}px`;
        this.canvas.style.display = "block";

        // Configure camera
        this.camera.position.set(0, 0, 3);

        // Configure renderer
        this.renderer.setSize(this.size, this.size);
        this.renderer.setClearColor(0x000000, 0); // Transparent background

        // Create triangle
        this.createTriangle();

        // Add lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Start animation
        this.animate();
    }

    /**
     * Create triangle mesh (same as game triangles)
     */
    private createTriangle(): void {
        const {
            EXTRUDE_DEPTH,
            BEVEL_THICKNESS,
            BEVEL_SIZE,
            BEVEL_SEGMENTS,
            MATERIAL,
        } = CONFIG.TRIANGLES;

        // Same shape as game triangles
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

        // Same material as game triangles
        const material = new THREE.MeshPhysicalMaterial({
            color: this.color,
            metalness: MATERIAL.METALNESS,
            roughness: MATERIAL.ROUGHNESS,
            transmission: MATERIAL.TRANSMISSION,
            opacity: MATERIAL.OPACITY,
            transparent: true,
            thickness: MATERIAL.THICKNESS,
            clearcoat: MATERIAL.CLEARCOAT,
            clearcoatRoughness: MATERIAL.CLEARCOAT_ROUGHNESS,
        });

        this.triangle = new THREE.Mesh(geometry, material);
        this.triangle.scale.set(0.5, 0.5, 0.5); // Smaller scale for icon
        this.scene.add(this.triangle);
    }

    /**
     * Animation loop
     */
    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);

        // Slow rotation
        if (this.triangle) {
            this.triangle.rotation.y += 0.02; // Slow rotation around Y axis
        }

        this.renderer.render(this.scene, this.camera);
    };

    /**
     * Get canvas element for insertion into DOM
     * @returns Canvas element
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.triangle) {
            this.triangle.geometry.dispose();
            this.triangle.material.dispose();
        }

        this.renderer.dispose();

        if (this.canvas.parentNode) {
            this.canvas.remove();
        }
    }
}
