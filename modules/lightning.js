import * as THREE from 'three';

// Function to create a lightning strike
export function createLightning(lightningGroup) {
    const lightningMaterial = new THREE.LineBasicMaterial({
        color: 0x87cefa,
        linewidth: 0.05
    });

    const points = [];
    const startX = (Math.random() - 0.5) * 30;
    const startY = (Math.random() - 0.5) * 30;
    const startZ = (Math.random() - 0.5) * 30;

    const segments = 5;
    const maxLength = 5;

    // Generate points for a curved lightning bolt
    for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const x = startX + Math.sin(t * Math.PI) * (Math.random() - 0.5) * 2;
        const y = startY + t * maxLength - maxLength / 2;
        const z = startZ + Math.cos(t * Math.PI) * (Math.random() - 0.5) * 2;
        points.push(new THREE.Vector3(x, y, z));
    }

    const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lightning = new THREE.Line(lightningGeometry, lightningMaterial);
    lightningGroup.add(lightning);

    // Set lightning duration and removal
    setTimeout(() => {
        lightningGroup.remove(lightning);
    }, 100);
}

// Function to animate lightning strikes randomly
export function animateLightning(lightningGroup, scene) {
    if (Math.random() > 0.93) {
        createLightning(lightningGroup);

        // Optional: Add light flash effect
        const flashLight = new THREE.PointLight(0x87cefa, 1.5, 20);
        const positionX = (Math.random() - 0.5) * 30;
        const positionY = (Math.random() - 0.5) * 30;
        const positionZ = (Math.random() - 0.5) * 30;
        flashLight.position.set(positionX, positionY, positionZ);
        scene.add(flashLight);

        // Flash duration control
        setTimeout(() => {
            flashLight.intensity = 0;
            scene.remove(flashLight);
        }, 100);
    }
}
