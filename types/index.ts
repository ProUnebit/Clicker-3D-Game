import * as THREE from "three";

// ===========================
// Game State Types
// ===========================

export type GameState = "menu" | "playing" | "paused";

// ===========================
// UserData Interfaces
// ===========================

export interface FireflyUserData {
    velocity: THREE.Vector3;
    pulse: number;
    pulseDirection: number;
}

export interface TriangleUserData {
    velocity: THREE.Vector3;
    rotationSpeed: number;
    isFlashing: boolean;
    flashStartTime: number;
    originalEmissive: THREE.Color | null;
    scale: number;
    generation: number;
}

export interface ParticleUserData {
    velocity: THREE.Vector3;
    createdAt: number;
    initialOpacity: number;
}

export interface LightningBoltUserData {
    createdAt: number;
    isMainBolt: boolean;
    coreMaterial?: THREE.LineBasicMaterial;
    glow1Material?: THREE.LineBasicMaterial;
    glow2Material?: THREE.LineBasicMaterial;
    maxOpacity?: {
        core: number;
        glow1: number;
        glow2: number;
    };
}

export interface FlashLightUserData {
    createdAt: number;
    initialIntensity: number;
}

// ===========================
// Typed Three.js Objects
// ===========================

export type FireflyMesh = THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshPhysicalMaterial
> & {
    userData: FireflyUserData;
};

export type TriangleMesh = THREE.Mesh<
    THREE.ExtrudeGeometry,
    THREE.MeshPhysicalMaterial
> & {
    userData: TriangleUserData;
};

export type ParticleMesh = THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshBasicMaterial
> & {
    userData: ParticleUserData;
};

export type LightningBolt = THREE.Group & {
    userData: LightningBoltUserData;
};

export type FlashLight = THREE.PointLight & {
    userData: FlashLightUserData;
};

// ===========================
// Config Types
// ===========================

export interface CameraConfig {
    FOV: number;
    NEAR: number;
    FAR: number;
    POSITION: { x: number; y: number; z: number };
}

export interface ControlsConfig {
    DAMPING_FACTOR: number;
    MIN_DISTANCE: number;
    MAX_DISTANCE: number;
    ENABLE_PAN: boolean;
}

export interface RendererConfig {
    CLEAR_COLOR: number;
    CLEAR_ALPHA: number;
}

export interface BloomConfig {
    STRENGTH: number;
    RADIUS: number;
    THRESHOLD: number;
}

export interface BlurConfig {
    HORIZONTAL: number;
    VERTICAL: number;
}

export interface PostProcessingConfig {
    BLOOM: BloomConfig;
    BLUR: BlurConfig;
}

export interface LightConfig {
    COLOR: number;
    INTENSITY: number;
}

export interface PointLightConfig extends LightConfig {
    DISTANCE: number;
    POSITION: { x: number; y: number; z: number };
}

export interface LightingConfig {
    AMBIENT: LightConfig;
    WARM_LIGHT_1: PointLightConfig;
    WARM_LIGHT_2: PointLightConfig;
}

export interface ColorsConfig {
    PALETTE: number[];
    LIGHTNING: number;
    FLASH: number;
}

export interface MaterialConfig {
    METALNESS: number;
    ROUGHNESS: number;
    OPACITY: number;
    TRANSMISSION: number;
    CLEARCOAT: number;
    CLEARCOAT_ROUGHNESS: number;
}

export interface FirefliesConfig {
    COUNT: number;
    SIZE: number;
    SEGMENTS: number;
    VELOCITY_RANGE: number;
    PULSE_MIN: number;
    PULSE_RANGE: number;
    EMISSIVE_INTENSITY: number;
    EMISSIVE_MAX: number;
    EMISSIVE_MIN: number;
    MATERIAL: MaterialConfig;
}

export interface DivisionConfig {
    ENABLED: boolean;
    MIN_SCALE: number;
    SPLIT_DISTANCE: number;
    SPLIT_VELOCITY: number;
    SCALE_ANIMATION_DURATION: number;
}

export interface TrianglesMaterialConfig extends MaterialConfig {
    THICKNESS: number;
}

export interface TrianglesConfig {
    COUNT: number;
    EXTRUDE_DEPTH: number;
    BEVEL_THICKNESS: number;
    BEVEL_SIZE: number;
    BEVEL_SEGMENTS: number;
    VELOCITY_RANGE: number;
    ROTATION_SPEED_MIN: number;
    ROTATION_SPEED_RANGE: number;
    PUSH_FORCE: number;
    FLASH_DURATION: number;
    CLICK_SCALE_FACTOR: number;
    CLICK_SCALE_DURATION: number;
    MATERIAL: TrianglesMaterialConfig;
    DIVISION: DivisionConfig;
}

export interface LightningConfig {
    SPAWN_CHANCE: number;
    SEGMENTS: number;
    MAX_LENGTH: number;
    LINE_WIDTH: number;
    FLASH_DURATION: number;
    FLASH_INTENSITY: number;
    FLASH_DISTANCE: number;
}

export interface ExplosionConfig {
    DURATION: number;
    INITIAL_SCALE: number;
}

export interface ScoreTextConfig {
    SIZE: number;
    HEIGHT: number;
    COLOR: number;
    POSITION: { x: number; y: number; z: number };
    FONT_URL: string;
}

export interface UIConfig {
    INSTRUCTIONS_FLASH_DURATION: number;
}

export interface TrailConfig {
    ENABLED: boolean;
    LENGTH: number;
    POINT_SIZE: number;
    FADE_SPEED: number;
}

export interface ParticlesConfig {
    COUNT_PER_CLICK: number;
    SIZE: number;
    INITIAL_SPEED: number;
    GRAVITY: number;
    LIFETIME: number;
    FADE_START: number;
    SPREAD_ANGLE: number;
    TRAIL: TrailConfig;
}

export interface GameConfig {
    BOUNDS: number;
    CAMERA: CameraConfig;
    CONTROLS: ControlsConfig;
    RENDERER: RendererConfig;
    POST_PROCESSING: PostProcessingConfig;
    LIGHTING: LightingConfig;
    COLORS: ColorsConfig;
    FIREFLIES: FirefliesConfig;
    TRIANGLES: TrianglesConfig;
    LIGHTNING: LightningConfig;
    EXPLOSION: ExplosionConfig;
    SCORE_TEXT: ScoreTextConfig;
    UI: UIConfig;
    PARTICLES: ParticlesConfig;
}

// ===========================
// Score Manager Types
// ===========================

export interface ColorScores {
    [color: number]: number;
}

// Forward declaration for MiniTriangleRenderer
export interface IMiniTriangleRenderer {
    getCanvas(): HTMLCanvasElement;
    dispose(): void;
}

export interface MiniRenderers {
    [color: number]: IMiniTriangleRenderer;
}

// ===========================
// System Constructor Types
// ===========================

// Forward declarations - will be fully typed when we implement these classes
export interface IScoreManager {
    increment(color: number): void;
}

export interface IParticleSystem {
    createExplosion(position: THREE.Vector3, color: number): void;
}

export interface IRenderSystem {
    handleResize(): void;
}

export interface InputSystemConfig {
    triangles: TriangleMesh[];
    scoreManager: IScoreManager;
    particleSystem: IParticleSystem;
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderSystem: IRenderSystem;
}
