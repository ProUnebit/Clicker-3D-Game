import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { CONFIG } from "../config";
import type { ColorScores, MiniRenderers, IScoreManager } from "../types";
import { MiniTriangleRenderer } from "./MiniTriangleRenderer";

/**
 * Score manager class
 * Handles scoring system with per-color tracking and 3D mini-triangles in UI
 */
export class ScoreManager implements IScoreManager {
    private scene: THREE.Scene;
    private score: number;
    private colorScores: ColorScores;
    private miniRenderers: MiniRenderers;
    private textMesh: THREE.Mesh<TextGeometry, THREE.MeshBasicMaterial> | null;
    private font: Font | null;
    private scoreValueEl: HTMLElement | null;
    private colorScoresEl: HTMLElement | null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.score = 0;
        this.colorScores = {};
        this.miniRenderers = {};
        this.textMesh = null;
        this.font = null;
        this.scoreValueEl = document.getElementById("score-value");
        this.colorScoresEl = document.getElementById("color-scores");

        // Initialize color scores from palette
        CONFIG.COLORS.PALETTE.forEach((color) => {
            this.colorScores[color] = 0;
        });

        // Load font
        this.loadFont();
    }

    /**
     * Load font for 3D text
     */
    private loadFont(): void {
        const fontLoader = new FontLoader();
        fontLoader.load(CONFIG.SCORE_TEXT.FONT_URL, (loadedFont) => {
            this.font = loadedFont;
            this.updateOverlay();
            this.updateColorScoresDisplay();
        });
    }

    /**
     * Increment score by 1
     * @param color - Hex color of clicked triangle
     */
    increment(color: number): void {
        this.score++;

        // Increment color-specific score
        if (this.colorScores[color] === undefined) {
            this.colorScores[color] = 0;
        }
        this.colorScores[color]++;
        this.updateColorScoresDisplay(color);

        this.updateText();
        this.updateOverlay();
    }

    /**
     * Update color scores display in UI
     * @param flashColor - Color to flash (optional)
     */
    private updateColorScoresDisplay(flashColor?: number): void {
        if (!this.colorScoresEl) return;

        // Clear existing
        this.colorScoresEl.innerHTML = "";

        // Sort colors by score (descending)
        const sortedColors = Object.entries(this.colorScores)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, count]) => count > 0);

        if (sortedColors.length === 0) {
            this.colorScoresEl.style.display = "none";
            return;
        }

        this.colorScoresEl.style.display = "flex";

        sortedColors.forEach(([colorHex, count]) => {
            const item = document.createElement("div");
            item.className = "color-score-item";

            // Create or reuse mini triangle renderer
            const colorInt = parseInt(colorHex);
            if (!this.miniRenderers[colorInt]) {
                this.miniRenderers[colorInt] = new MiniTriangleRenderer(
                    colorInt,
                    40
                );
                console.log("✅ Created 3D triangle for color:", colorInt);
            }

            // Get canvas from renderer
            const canvas = this.miniRenderers[colorInt].getCanvas();
            canvas.className = "color-indicator-3d";

            // Score value
            const value = document.createElement("span");
            value.className = "color-score-value";
            value.textContent = count.toString();

            item.appendChild(canvas);
            item.appendChild(value);
            this.colorScoresEl?.appendChild(item);

            if (flashColor !== undefined && colorInt === flashColor) {
                item.classList.add("flash");
                setTimeout(() => item.classList.remove("flash"), 200);
            }
        });
    }

    /**
     * Get current score
     * @returns Total score
     */
    getScore(): number {
        return this.score;
    }

    /**
     * Get score for specific color
     * @param color - Hex color
     * @returns Score for that color
     */
    getColorScore(color: number): number {
        return this.colorScores[color] || 0;
    }

    /**
     * Create 3D score text (currently unused but kept for future)
     */
    private createText(): void {
        if (!this.font) return;

        const { SIZE, HEIGHT, COLOR, POSITION } = CONFIG.SCORE_TEXT;

        const geometry = new TextGeometry(`SCORE: ${this.score}`, {
            font: this.font,
            size: SIZE,
            depth: HEIGHT,
        });

        const material = new THREE.MeshBasicMaterial({ color: COLOR });
        this.textMesh = new THREE.Mesh(geometry, material);
        this.textMesh.position.set(POSITION.x, POSITION.y, POSITION.z);

        this.scene.add(this.textMesh);
    }

    /**
     * Update 3D text (currently unused)
     */
    private updateText(): void {
        if (this.textMesh) {
            this.scene.remove(this.textMesh);
        }
        // this.createText();
    }

    /**
     * Update HTML overlay (total score)
     */
    private updateOverlay(): void {
        if (this.scoreValueEl) {
            this.scoreValueEl.textContent = this.score.toString();
        }
    }

    /**
     * Reset all scores
     */
    reset(): void {
        this.score = 0;
        Object.keys(this.colorScores).forEach((colorKey) => {
            const color = parseInt(colorKey);
            this.colorScores[color] = 0;
        });

        // Dispose mini renderers
        Object.values(this.miniRenderers).forEach((renderer) => {
            renderer.dispose();
        });
        this.miniRenderers = {};

        this.updateOverlay();
        this.updateColorScoresDisplay();
    }
}
