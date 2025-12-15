// Central configuration for all game constants
export const CONFIG = {
    // Scene boundaries
    BOUNDS: 15,

    // Camera settings
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        POSITION: { x: 25, y: 0, z: 0 },
    },

    // Orbit controls
    CONTROLS: {
        DAMPING_FACTOR: 0.05,
        MIN_DISTANCE: 4,
        MAX_DISTANCE: 40,
        ENABLE_PAN: false,
    },

    // Renderer settings
    RENDERER: {
        CLEAR_COLOR: 0x2c1238,
        CLEAR_ALPHA: 1,
    },

    // Post-processing
    POST_PROCESSING: {
        BLOOM: {
            STRENGTH: 1.5,
            RADIUS: 0.4,
            THRESHOLD: 0.85,
        },
        BLUR: {
            HORIZONTAL: 0.003,
            VERTICAL: 0.003,
        },
    },

    // Lighting
    LIGHTING: {
        AMBIENT: {
            COLOR: 0xffffff,
            INTENSITY: 0.3,
        },
        WARM_LIGHT_1: {
            COLOR: 0xffa07a,
            INTENSITY: 1.0,
            DISTANCE: 50,
            POSITION: { x: 15, y: 5, z: 10 },
        },
        WARM_LIGHT_2: {
            COLOR: 0xffd700,
            INTENSITY: 1.0,
            DISTANCE: 50,
            POSITION: { x: -15, y: 5, z: -10 },
        },
    },

    // Color palette (shared by fireflies and triangles)
    COLORS: {
        PALETTE: [
            0x8a2be2, // Blue Violet
            0xff69b4, // Hot Pink
            0xff0000, // Red
            0xffff00, // Yellow
            0xffa500, // Orange
            0x00dd20, // Green
            0x0000ff, // Blue
            0xf5f5f5, // White Smoke
        ],
        LIGHTNING: 0x87cefa,
        FLASH: 0xffffff,
    },

    // Fireflies
    FIREFLIES: {
        COUNT: 120,
        SIZE: 0.15,
        SEGMENTS: 16,
        VELOCITY_RANGE: 0.1,
        PULSE_MIN: 0.01,
        PULSE_RANGE: 0.05,
        EMISSIVE_INTENSITY: 0.5,
        EMISSIVE_MAX: 1.0,
        EMISSIVE_MIN: 0.3,
        MATERIAL: {
            METALNESS: 0.1,
            ROUGHNESS: 0.3,
            OPACITY: 0.8,
            TRANSMISSION: 0.7,
            CLEARCOAT: 0.8,
            CLEARCOAT_ROUGHNESS: 0.1,
        },
    },

    // Triangles
    TRIANGLES: {
        COUNT: 20,
        EXTRUDE_DEPTH: 0.5,
        BEVEL_THICKNESS: 0.2,
        BEVEL_SIZE: 0.2,
        BEVEL_SEGMENTS: 10,
        VELOCITY_RANGE: 0.1,
        ROTATION_SPEED_MIN: 0.01,
        ROTATION_SPEED_RANGE: 0.05,
        PUSH_FORCE: 0.05,
        FLASH_DURATION: 100, // milliseconds
        CLICK_SCALE_FACTOR: 1.1,
        CLICK_SCALE_DURATION: 120, // milliseconds
        MATERIAL: {
            METALNESS: 0.1,
            ROUGHNESS: 0.3,
            TRANSMISSION: 0.6,
            OPACITY: 0.9,
            THICKNESS: 1.5,
            CLEARCOAT: 0.8,
            CLEARCOAT_ROUGHNESS: 0.1,
        },
        // Division settings
        DIVISION: {
            ENABLED: true,
            MIN_SCALE: 0.125, // Минимальный размер (1/8 от оригинала)
            SPLIT_DISTANCE: 1.5, // Расстояние разлёта при делении
            SPLIT_VELOCITY: 0.15, // Скорость разлёта
            SCALE_ANIMATION_DURATION: 200, // Длительность анимации деления (ms)
        },
    },

    // Lightning
    LIGHTNING: {
        SPAWN_CHANCE: 0.93, // Higher = rarer (Math.random() > this)
        SEGMENTS: 5,
        MAX_LENGTH: 5.5,
        LINE_WIDTH: 0.05,
        FLASH_DURATION: 100, // milliseconds
        FLASH_INTENSITY: 1.5,
        FLASH_DISTANCE: 20,
    },

    // Big Bang explosion effect
    EXPLOSION: {
        DURATION: 3, // seconds
        INITIAL_SCALE: 0.1,
    },

    // Score text
    SCORE_TEXT: {
        SIZE: 0.5,
        HEIGHT: 0.05,
        COLOR: 0xffffff,
        POSITION: { x: -10, y: 10, z: 0 },
        FONT_URL:
            "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    },

    // UI
    UI: {
        INSTRUCTIONS_FLASH_DURATION: 400, // milliseconds
    },

    // Particle system
    PARTICLES: {
        COUNT_PER_CLICK: 20, // Number of particles per click
        SIZE: 0.1,
        INITIAL_SPEED: 0.3,
        GRAVITY: -0.01,
        LIFETIME: 1000, // milliseconds
        FADE_START: 0.5, // Start fading at 50% of lifetime
        SPREAD_ANGLE: Math.PI * 2, // Full sphere
        // Trail settings
        TRAIL: {
            ENABLED: true,
            LENGTH: 10, // Number of trail points
            POINT_SIZE: 3.0, // Size of trail points
            FADE_SPEED: 0.95, // Trail fade multiplier per frame
        },
    },
};
