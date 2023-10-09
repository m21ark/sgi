import * as THREE from "three";
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

export class Vase extends THREE.Object3D {

    constructor() {
        super();

        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector2(-2, 0),          // Starting point
            new THREE.Vector2(-1, 0),          // Starting point
            new THREE.Vector2(0, 0),          // Starting point
            new THREE.Vector2(1, 0),          // Control point 1
            new THREE.Vector2(2, 0.5),          // Control point 2
            new THREE.Vector2(2, 1),          // Control point 3
            new THREE.Vector2(1.9, 1.75),         // Control point 4
            new THREE.Vector2(1.5, 2),         // Control point 5
            new THREE.Vector2(1, 2.3),         // Control point 6
            new THREE.Vector2(0.6, 2.6),         // Control point 7
            new THREE.Vector2(0.55, 3),        // Control point 8
            new THREE.Vector2(0.55, 3.5),        // Control point 9
            new THREE.Vector2(1.1, 3.5),        // Control point 10
            new THREE.Vector2(1, 3.2),         // Control point 11

        ]);

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Create the final object to add to the scene
        const curveObject = new THREE.Line(geometry, material2);
        //this.add(curveObject);

        const segments = 64; // Increase for smoother curve

        const latheGeometry = new THREE.LatheGeometry(points, segments, 0, Math.PI * 2);

        const material = new THREE.MeshPhongMaterial({
            color: "#ffaaaa",
            specular: "#222222",
            emissive: "#111111",
            shininess: 15, side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('textures/Vase-Texture.png')
        }); // Brown color

        latheGeometry.scale(0.6, 0.6, 0.6);
        const jarMesh = new THREE.Mesh(latheGeometry, material);
        

        this.add(jarMesh);


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
