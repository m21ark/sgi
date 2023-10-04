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
        let samp = curve.getPoints(totalPoints);

        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(samp);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xfcfcfc, linewidth: 10, linecap: 'round', });

        this.basicL = new THREE.Line(this.curveGeometry, this.lineMaterial);

        this.add(this.basicL);
    }

}


/*
class Spring extends THREE.Object3D {


    constructor(app) {

        super()
        this.app = app

        let controlPoints = [];
        let surfaceData;
        let mesh;
        let orderU = 8
        let orderV = 5


        // Define the radius of the tube
        const radius = 0.3;

        // Define the height of the tube
        const height = 5.0;

        // Define the number of control points around the tube's circumference
        const numPointsAroundCircumference = 8;

        for (let i = 0; i <= numPointsAroundCircumference; i++) {
            const theta = (i / numPointsAroundCircumference) * Math.PI * 2;
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta) ;
            controlPoints.push([]);
           
            for (let j = 0; j <= height; j++) {
                const z = ((j / height) * height);
                controlPoints[i].push([x, y, z, 1]);
            }
        }

        console.log(controlPoints)

        surfaceData = this.build(controlPoints,

            orderU, orderV, this.samplesU,

            this.samplesV, this.material)

        mesh = new THREE.Mesh(surfaceData, this.material);
        mesh.rotation.x = 0
        mesh.rotation.y = 0
        mesh.rotation.z = 0

        mesh.scale.set(1, 1, 1)
        mesh.position.set(0, 0, 0)

        this.add(mesh)
    }

    build(controlPoints, degree1, degree2, samples1, samples2, material) {

        const knots1 = []
        const knots2 = []

        // build knots1 = [ 0, 0, 0, 1, 1, 1 ];

        for (var i = 0; i <= degree1; i++) {
            knots1.push(0)
        }

        for (var i = 0; i <= degree1; i++) {
            knots1.push(1)
        }

        // build knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];

        for (var i = 0; i <= degree2; i++) {

            knots2.push(0)

        }

        for (var i = 0; i <= degree2; i++) {

            knots2.push(1)

        }

        let stackedPoints = []

        for (var i = 0; i < controlPoints.length; i++) {

            let row = controlPoints[i]

            let newRow = []

            for (var j = 0; j < row.length; j++) {

                let item = row[j]

                newRow.push(new THREE.Vector4(item[0],

                    item[1], item[2], item[3]));

            }

            stackedPoints[i] = newRow;

        }

        const nurbsSurface = new NURBSSurface(degree1, degree2,

            knots1, knots2, stackedPoints);

        const geometry = new ParametricGeometry(getSurfacePoint,

            samples1, samples2);

        return geometry;



        function getSurfacePoint(u, v, target) {

            return nurbsSurface.getPoint(u, v, target);

        }

    }

}
export { Spring };
*/