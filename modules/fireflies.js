import * as THREE from 'three';

export function initFireflies(scene) {
    const colors = [
        0x8a2be2, 0xff69b4, 0xff0000, 0xffff00,
        0xffa500, 0x00ff00, 0x0000ff, 0xf5f5f5
    ];

    const fireflies = [];
    for (let i = 0; i < 60; i++) { // Increased the number of fireflies to 60
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            metalness: 0.1,
            roughness: 0.3,
            opacity: 0.8,
            transparent: true,
            transmission: 0.7,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
        });

        const firefly = new THREE.Mesh(geometry, material);
        firefly.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        firefly.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1),
            pulse: Math.random() * 0.05 + 0.01,
            pulseDirection: 1
        };

        scene.add(firefly);
        fireflies.push(firefly);
    }

    return fireflies;
}

export function animateFireflies(fireflies) {
    fireflies.forEach((firefly) => {
        firefly.position.add(firefly.userData.velocity);
        firefly.material.emissiveIntensity += firefly.userData.pulse * firefly.userData.pulseDirection;

        // Bounce off screen boundaries
        const bounds = 15;
        if (firefly.position.x > bounds || firefly.position.x < -bounds) {
            firefly.userData.velocity.x = -firefly.userData.velocity.x;
        }
        if (firefly.position.y > bounds || firefly.position.y < -bounds) {
            firefly.userData.velocity.y = -firefly.userData.velocity.y;
        }
        if (firefly.position.z > bounds || firefly.position.z < -bounds) {
            firefly.userData.velocity.z = -firefly.userData.velocity.z;
        }

        if (firefly.material.emissiveIntensity >= 1 || firefly.material.emissiveIntensity <= 0.3) {
            firefly.userData.pulseDirection *= -1;
        }
    });
}
