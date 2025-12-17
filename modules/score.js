import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { CONFIG } from "./config.js";
import { MiniTriangleRenderer } from "./MiniTriangleRenderer.js";

/**
 * Score manager class
 * Handles 3D score text and HTML overlay
 */
export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.colorScores = {}; // { 0xff0000: 5, 0x00ff00: 3, ... }
        this.miniRenderers = {}; // { 0xff0000: MiniTriangleRenderer, ... }
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
    loadFont() {
        const fontLoader = new FontLoader();
        fontLoader.load(CONFIG.SCORE_TEXT.FONT_URL, (loadedFont) => {
            this.font = loadedFont;
            this.updateOverlay();
            this.updateColorScoresDisplay();
        });
    }

    /**
     * Increment score by 1
     * @param {number} color - Hex color of clicked triangle
     */
    increment(color = null) {
        this.score++;

        // Increment color-specific score
        if (color !== null) {
            if (this.colorScores[color] === undefined) {
                this.colorScores[color] = 0;
            }
            this.colorScores[color]++;
            this.updateColorScoresDisplay(color);
        }

        this.updateText();
        this.updateOverlay();
    }
    /**
     * Update color scores display in UI
     * @param {number} flashColor - Color to flash (optional)
     */
    updateColorScoresDisplay(flashColor = null) {
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
            value.textContent = count;

            item.appendChild(canvas);
            item.appendChild(value);
            this.colorScoresEl.appendChild(item);

            if (flashColor !== null && colorInt === flashColor) {
                item.classList.add("flash");
                setTimeout(() => item.classList.remove("flash"), 200);
            }
        });
    }

    /**
     * Get current score
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * Get score for specific color
     * @param {number} color - Hex color
     * @returns {number}
     */
    getColorScore(color) {
        return this.colorScores[color] || 0;
    }

    /**
     * Create 3D score text
     */
    createText() {
        if (!this.font) return;

        const { SIZE, HEIGHT, COLOR, POSITION } = CONFIG.SCORE_TEXT;

        const geometry = new TextGeometry(`SCORE: ${this.score}`, {
            font: this.font,
            size: SIZE,
            height: HEIGHT,
        });

        const material = new THREE.MeshBasicMaterial({ color: COLOR });
        this.textMesh = new THREE.Mesh(geometry, material);
        this.textMesh.position.set(POSITION.x, POSITION.y, POSITION.z);

        this.scene.add(this.textMesh);
    }

    /**
     * Update 3D text
     */
    updateText() {
        if (this.textMesh) {
            this.scene.remove(this.textMesh);
        }
        // this.createText();
    }

    /**
     * Update HTML overlay (total score)
     */
    updateOverlay() {
        if (this.scoreValueEl) {
            this.scoreValueEl.textContent = this.score;
        }
    }

    /**
     * Reset all scores
     */
    reset() {
        this.score = 0;
        Object.keys(this.colorScores).forEach((color) => {
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
