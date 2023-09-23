import * as THREE from "three";

export class Cake extends THREE.Object3D {
    constructor(radius, height, radialSegments, heightSegments, openEnded, startAngle, endAngle, material) {
        super();

        // Create the original cake geometry
        this.cakeGeometry = new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            radialSegments,
            heightSegments,
            openEnded,
            startAngle,
            endAngle
        );

        const positions = this.cakeGeometry.attributes.position.array;

        const points = [];
        for (let i = 0; i < positions.length; i += 3) {
            points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
        }

        const oneSide = new THREE.BoxGeometry(radius,height, 0.05)

        const otherSide = new THREE.BoxGeometry(radius,height, 0.05)

        // place oneSide on the endangle of the cake
        // oneSide.rotateY(endAngle);
        oneSide.translate(radius / 2, 0, 0);
        oneSide.rotateY(-(startAngle));

        otherSide.translate(radius / 2, 0, 0);
        otherSide.rotateY(-(startAngle - endAngle));

        // Create a mesh using the resulting geometry and the specified material
        this.cakeMesh = new THREE.Mesh(this.cakeGeometry, material);
        this.oneSideMesh = new THREE.Mesh(oneSide, material);
        this.otherSideMesh = new THREE.Mesh(otherSide, material);
        
        // Add the cake mesh to the Object3D
        this.add(this.cakeMesh);
        this.add(this.oneSideMesh);
        this.add(this.otherSideMesh);
    }
}

