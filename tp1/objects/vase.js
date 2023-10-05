import * as THREE from "three";
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

export class Vase extends THREE.Object3D {

        constructor() {
            super();

            this.createJar();
        }

        build(controlPoints, degree1, degree2, samples1, samples2, material) {

            const knots1 = []
            const knots2 = []

            for (var i = 0; i <= degree1; i++) {
                knots1.push(0)
            }

            for (var i = 0; i <= degree1; i++) {
                knots1.push(1)
            }

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

            const mesh = new THREE.Mesh(geometry, material);

            return mesh;

            function getSurfacePoint(u, v, target) {

                return nurbsSurface.getPoint(u, v, target);

            }

        }

        createJar() {
            let controlPoints =  [
                [
                    [-0.3, 0, 0.3, 1], [-0.3, 0.3, 0.3, 0.7], [0.3, 0.3, 0.3, 0.7], [0.3, 0, 0.3, 1]
                ],
                [
                    [-0.3, -0.3, 0.15, 1], [-0.3, 0.3, 0.3, 0.7], [0.3, 0.3, 0.3, 0.7], [0.3, -0.3, 0.15, 1]
                ],
                [
                    [-0.3, -0.3, 0, 1], [-0.3, 0.3, 0.45, 0.7], [0.3, 0.3, 0.45, 0.7], [0.3, -0.3, 0, 1]
                ],
                [
                    [-0.3, -0.3, -0.15, 1], [-0.3, 0.3, -0.3, 0.7], [0.3, 0.3, -0.3, 0.7], [0.3, -0.3, -0.15, 1]
                ],
                [
                    [-0.3, 0, -0.3, 1], [-0.3, 0.3, -0.3, 0.7], [0.3, 0.3, -0.3, 0.7], [0.3, 0, -0.3, 1]
                ],
                [
                    [-0.3, -0.3, -0.3, 1], [-0.3, 0.3, -0.3, 0.7], [0.3, 0.3, -0.3, 0.7], [0.3, -0.3, -0.3, 1]
                ],
                [
                    [-0.3, -0.3, 0.3, 1], [-0.3, 0.3, 0.3, 0.7], [0.3, 0.3, 0.3, 0.7], [0.3, -0.3, 0.3, 1]
                ],
                [
                    [-0.3, -0.3, 2, 1], [-0.3, 0.3, 2, 0.7], [0.3, 0.3, 2, 0.7], [0.3, -0.3, 2, 1]
                ],
            ];

            let material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: new THREE.TextureLoader().load('textures/wood.jpg') });

            let degree1 = 7;
            let degree2 = 3;
            let samples1 = 30;
            let samples2 = 30;

            let mesh = this.build(controlPoints, degree1, degree2, samples1, samples2, material);

            let mesh2 = mesh.clone();
            mesh.rotateX(Math.PI/2);
        
            this.add(mesh);
            
            mesh2.scale.set(1,-1,1);
            mesh2.translateZ(-0.5);

            // put the mesh up ... rotating
            mesh2.rotateX(Math.PI/2);
            
            this.add(mesh2);
        }

}

/*
 let controlPoints = [];
        let surfaceData;
        let mesh;
        let orderU = 8;
        let orderV = 2; // Increased orderV for more surface flexibility
    
        // Define the radius of the jar's body
        const bodyRadius = 0.3;
    
        // Define the radius of the jar's neck
        const neckRadius = 0.15;
    
        // Define the height of the jar
        const height = 2.0;
    
        // Define the number of control points around the jar's circumference
        const numPointsAroundCircumference = 8;
    
        for (let i = 0; i <= numPointsAroundCircumference; i++) {
            const theta = (i / numPointsAroundCircumference) * Math.PI * 2;
            const x = bodyRadius * Math.cos(theta);
            const y = bodyRadius * Math.sin(theta);
            controlPoints.push([]);
    
            for (let j = 0; j <= height; j++) {
                const z = (j / height) * height;
                const r = bodyRadius + (neckRadius - bodyRadius) * (1 - z / height); // Adjust radius to create a jar shape
                controlPoints[i].push([x * r, y * r, z, 1]);
            }
        }
    
        console.log(controlPoints);
    
        surfaceData = this.build(
            controlPoints,
            orderU,
            orderV,
            this.samplesU,
            this.samplesV,
            this.material
        );
    
        mesh = new THREE.Mesh(surfaceData, this.material);
        mesh.rotation.x = -Math.PI / 2; // Rotate the jar to make it stand upright
        mesh.rotation.y = 0;
        mesh.rotation.z = 0;
    
        mesh.scale.set(1, -1, 1);
        mesh.position.set(0, 0, 0);
    
        this.add(mesh);
*/
/*

     this.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

        // let controlPoints = [
        //     // U = 0
        //     [
        //         [0, 0, 0, 1],
        //         [5, 0, 0, 1],
        //         [5.5, 4.5, 0, 1],
        //         [3, 6, 0, 1],
        //         [4, 9, 0, 1],
        //         [5, 8, 0, 1]
        //     ],
        //     [
        //         [0, 0,      -5, 1],
        //         [2.5, 0,    -5, 1],
        //         [2.25, 4.5, -5, 1],
        //         [1.5, 6,    -5, 1],
        //         [2, 9,      -5, 1],
        //         [2.5, 8,    -5, 1]
        //     ],
        //     [
        //         [0, 0, 0, 1],
        //         [-5, 0, 0, 1],
        //         [-5.5, 4.5, 0, 1],
        //         [-3, 6, 0, 1],
        //         [-4, 9, 0, 1],
        //         [-5, 8, 0, 1]
        //     ],
        //     [
        //         [0, 0,      5, 1],
        //         [2.5, 0,    5, 1],
        //         [2.25, 4.5, 5, 1],
        //         [1.5, 6,    5, 1],
        //         [2, 9,      5, 1],
        //         [2.5, 8,    5, 1]
        //     ],
        //     [
        //         [0, 0, 0, 1],
        //         [5, 0, 0, 1],
        //         [5.5, 4.5, 0, 1],
        //         [3, 6, 0, 1],
        //         [4, 9, 0, 1],
        //         [5, 8, 0, 1]
        //     ],
        // ];


        // const controlPoints = [
        //     [
        //         [-1, 1, 0, 1],
        //         [-1, 0, 0, 1],
        //         [-1, -1, 0, 1],
        //         [0, -1, 0, 1],
        //         [1, -1, 0, 1],
        //         [1, 0, 0, 1],
        //         [1, 1, 0, 1]
        //     ],
        //     [
        //         [-1, 1, 3, 1],
        //         [-1, 0, 3, 1],
        //         [-1, -1, 3, 1],
        //         [0, -1, 3, 1],
        //         [1, -1, 3, 1],
        //         [1, 0, 3, 1],
        //         [1, 1, 3, 1],
        //     ],
        // ];

        const controlPoints = [
            [
                [ 0, 0, 1, 1 ],
                [ 0.5, 0, 1, 1],
                [ 1, 0, 1, 1 ],
                [ 1, 0.5, 1, 1],

                [ 1, 1, 1, 1 ],
                [ 0.5, 1, 1, 1 ],

                [ 0, 1, 1, 1 ],
                [0,0.5,1,1],
                [ 0.5, 0, 1, 1 ],
            ],
            [
                [ 0, 0,     0, 1 ],
                [ 0.5, 0,   0, 1],
                [ 1, 0,     0, 1 ],
                [ 1, 0.5,   0, 1],
                [ 1, 1,     0, 1 ],
                [ 0.5, 1,   0, 1 ],
                [ 0, 1,     0, 1 ],
                [ 0, 0.5,   0, 1],
                [ 0.5  , 0, 0, 1 ],
            ],
           
        ]

        // const controlPoints = [
        // [
        //    [0,0,0,1],
        //    [1,1,0,1],
        //    [1,2,0,1],
        //    [0.3,3,0,1],
        //    [0.2,4,0,1],
        //    [0.4,4.3,0,1]
        // ],
        // [
        //     [0   ,0 ,0,  1],
        //     [1   ,0 ,1,  1],
        //     [1   ,0 ,2,  1],
        //     [0.3 ,0 ,3,  1],
        //     [0.2 ,0 ,4,  1],
        //     [0.4 ,0 ,4,  1]
        // ],
        // [
        //     [0,0,0,1],
        //     [-1,1,0,1],
        //     [-1,2,0,1],
        //     [-0.3,3,0,1],
        //     [-0.2,4,0,1],
        //     [-0.4,4.3,0,1]
        // ],

        // ];


        // Create the NURBS surface for each page
        const surfaceData = this.build(controlPoints, 1, 8, this.samplesU, this.samplesV, this.material);
        const mesh = new THREE.Mesh(surfaceData, this.material);

        //mesh.scale.set(0.3, 0.3, 0.3);

        this.add(mesh);
*/
