import * as THREE from 'three';

export class Spring extends THREE.Object3D {

    constructor() {
        super();

        const numCoils = 5; // Number of coils in the spring
        const radius = 0.1; // Radius of the spring
        const pitch = 0.1; // Distance between each coil
        const totalPoints = 360 * numCoils; // Total points for the spring

        let points = [];

        for (let i = 0; i <= totalPoints; i++) {
            const theta = (i / totalPoints) * numCoils * 2 * Math.PI;
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            const z = (i / totalPoints) * numCoils * pitch;
            points.push(new THREE.Vector3(x, y, z));
        }

        let curve = new THREE.CatmullRomCurve3(points);

        const tubeGeometry = new THREE.TubeGeometry(curve, totalPoints, 0.008, 8, false);
        this.tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xfcfcfc });

        this.tubeMesh = new THREE.Mesh(tubeGeometry, this.tubeMaterial);

        this.add(this.tubeMesh);
    }

}

