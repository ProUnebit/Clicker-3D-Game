import Stats from "three/examples/jsm/libs/stats.module.js";

/**
 * Performance monitor wrapper
 * Optional profiling tool for debugging performance issues
 * Enable/disable via CONFIG.DEBUG.PERFORMANCE_MONITOR
 */
export class PerformanceMonitor {
    private stats: Stats | null = null;
    private enabled: boolean = false;
    private customMetrics: Map<string, number> = new Map();

    constructor(enabled: boolean = false) {
        this.enabled = enabled;

        if (this.enabled) {
            this.initialize();
        }
    }

    /**
     * Initialize Stats.js
     */
    private initialize(): void {
        try {
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);

            // Style the stats panel
            this.stats.dom.style.position = "fixed";
            this.stats.dom.style.top = "70px";
            this.stats.dom.style.left = "20px";
            this.stats.dom.style.zIndex = "9999";
            this.stats.dom.style.fontSize = "14px";

            console.log("📊 Performance Monitor: Enabled");
        } catch (error) {
            console.warn("⚠️ Performance Monitor: Failed to initialize", error);
            this.enabled = false;
        }
    }

    /**
     * Begin frame profiling
     * Call at start of animation loop
     */
    begin(): void {
        if (this.enabled && this.stats) {
            this.stats.begin();
        }
    }

    /**
     * End frame profiling
     * Call at end of animation loop
     */
    end(): void {
        if (this.enabled && this.stats) {
            this.stats.end();
        }
    }

    /**
     * Set custom metric (e.g., particle count, draw calls)
     * @param label - Metric name
     * @param value - Metric value
     */
    setMetric(label: string, value: number | string): void {
        if (this.enabled) {
            this.customMetrics.set(label, value as any);
        }
    }

    /**
     * Get custom metrics
     */
    getMetrics(): Map<string, number | string> {
        return this.customMetrics;
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.customMetrics.clear();
    }

    /**
     * Dispose and cleanup
     */
    dispose(): void {
        if (this.stats && this.stats.dom.parentElement) {
            this.stats.dom.parentElement.removeChild(this.stats.dom);
        }
        this.stats = null;
        this.customMetrics.clear();
        console.log("📊 Performance Monitor: Disposed");
    }

    /**
     * Check if enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Toggle monitoring
     */
    toggle(): void {
        this.enabled = !this.enabled;

        if (this.enabled) {
            if (!this.stats) {
                this.initialize();
            }
        } else {
            if (this.stats && this.stats.dom.parentElement) {
                this.stats.dom.parentElement.removeChild(this.stats.dom);
            }
        }

        console.log(
            `📊 Performance Monitor: ${this.enabled ? "Enabled" : "Disabled"}`
        );
    }
}
