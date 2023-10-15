import * as THREE from "three";


/**
 * A class representing a Beetle object in a 3D scene.
 * @extends THREE.Object3D
 */
/**
 * A class representing a beetle object in a 3D scene.
 * @extends THREE.Object3D
 */
export class Beetle extends THREE.Object3D {
    /**
     * Creates a new instance of Beetle.
     * @param {THREE.Material} portraitMaterial - The material to be used for the beetle's portrait.
     */
    constructor(portraitMaterial) {
        super();

        // Define the points for the beetle's body and wheels
        let points = [
            new THREE.Vector3(0.0, 0, 0.0),
            new THREE.Vector3(0.0, 0.6 * (2 / 3), 0.0),
            new THREE.Vector3(0.6, 0.6 * (2 / 3), 0.0),
            new THREE.Vector3(0.6, 0.0, 0.0),
        ];

        let points2 = [
            new THREE.Vector3(0.0, 0, 0.0),
            new THREE.Vector3(0.0, 0.4 * (2 / 3), 0.0),
            new THREE.Vector3(0.4 * (2 / 3), 0.4, 0.0),
            new THREE.Vector3(0.4, 0.4, 0.0),
        ];

        // Create the curve for the beetle's wheels
        let curve = new THREE.CubicBezierCurve3(
            points[0],
            points[1],
            points[2],
            points[3]
        );
        let samp = curve.getPoints(32);
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(samp);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Create the beetle's down wheels
        this.wheel1 = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.wheel1.position.set(0.4, 0, -0.04);

        this.wheel2 = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.wheel2.position.set(-0.6, 0, -0.04);

        this.add(this.wheel1);
        this.add(this.wheel2);

        // Create the curve for the beetle's other body parts
        let curve2 = new THREE.CubicBezierCurve3(
            points2[0],
            points2[1],
            points2[2],
            points2[3]
        );
        let samp2 = curve2.getPoints(32);
        this.curveGeometry2 = new THREE.BufferGeometry().setFromPoints(samp2);
        this.lineMaterial2 = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Create the beetle's other body parts
        this.wheel3 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
        this.wheel3.position.set(-0.6, 0, -0.04);

        this.wheel4 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
        this.wheel4.position.set(-0.2, 0.4, -0.04);

        this.wheel5 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
        this.wheel5.position.set(0.2, 0.8, -0.04);

        this.wheel5.scale.set(2, 2, 1);
        this.wheel5.rotateZ(-Math.PI / 2);

        this.add(this.wheel3);
        this.add(this.wheel4);
        this.add(this.wheel5);
    }
}
