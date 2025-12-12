import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { CONFIG } from "./config.js";

/**
 * Score manager class
 * Handles 3D score text and HTML overlay
 */
export class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.textMesh = null;
        this.font = null;
        this.scoreValueEl = document.getElementById("score-value");

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
            this.createText();
            this.updateOverlay();
        });
    }

    /**
     * Increment score by 1
     */
    increment() {
        this.score++;
        this.updateText();
        this.updateOverlay();
    }

    /**
     * Get current score
     * @returns {number}
     */
    getScore() {
        return this.score;
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
        this.createText();
    }

    /**
     * Update HTML overlay
     */
    updateOverlay() {
        if (this.scoreValueEl) {
            this.scoreValueEl.textContent = this.score;
        }
    }
}
