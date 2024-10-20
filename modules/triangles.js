import * as THREE from 'three';

export function initTriangles(scene) {
    const colors = [
        0x8a2be2, 0xff69b4, 0xff0000, 0xffff00,
        0xffa500, 0x00dd20, 0x0000ff, 0xf5f5f5
    ];

    const triangles = [];
    for (let i = 0; i < 20; i++) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 1);
        shape.lineTo(-1, -1);
        shape.lineTo(1, -1);
        shape.lineTo(0, 1);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.5,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.2,
            bevelSegments: 10
        });

        const color = colors[Math.floor(Math.random() * colors.length)];
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.3,
            transmission: 0.6,
            opacity: 0.9,
            transparent: true,
            thickness: 1.5,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
        });

        const triangle = new THREE.Mesh(geometry, material);
        triangle.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );

        triangle.userData = {
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1),
            rotationSpeed: Math.random() * 0.05 + 0.01
        };

        scene.add(triangle);
        triangles.push(triangle);
    }

    return triangles;
}

export function animateTriangles(triangles) {
    triangles.forEach((triangle) => {
        triangle.rotation.x += triangle.userData.rotationSpeed;
        triangle.rotation.y += triangle.userData.rotationSpeed;
        triangle.position.add(triangle.userData.velocity);

        // Bounce off screen boundaries
        const bounds = 15;
        if (triangle.position.x > bounds || triangle.position.x < -bounds) {
            triangle.userData.velocity.x = -triangle.userData.velocity.x;
        }
        if (triangle.position.y > bounds || triangle.position.y < -bounds) {
            triangle.userData.velocity.y = -triangle.userData.velocity.y;
        }
        if (triangle.position.z > bounds || triangle.position.z < -bounds) {
            triangle.userData.velocity.z = -triangle.userData.velocity.z;
        }
    });
}

export function handleTriangleCollisions(triangles) {
    for (let i = 0; i < triangles.length; i++) {
        for (let j = i + 1; j < triangles.length; j++) {
            const triA = triangles[i];
            const triB = triangles[j];
            const distance = triA.position.distanceTo(triB.position);

            if (distance < (triA.scale.x + triB.scale.x)) {
                const collisionNormal = new THREE.Vector3().subVectors(triA.position, triB.position).normalize();
                triA.userData.velocity.add(collisionNormal.multiplyScalar(0.01));
                triB.userData.velocity.sub(collisionNormal.multiplyScalar(0.01));
            }
        }
    }
}
