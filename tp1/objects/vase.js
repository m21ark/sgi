import * as THREE from "three";
import { NURBSSurface } from "three/addons/curves/NURBSSurface.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

export class Vase extends THREE.Object3D {
  constructor() {
    super();

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector2(-2, 0), // Starting point
      new THREE.Vector2(-1, 0), // Starting point
      new THREE.Vector2(0, 0), // Starting point
      new THREE.Vector2(1, 0), // Control point 1
      new THREE.Vector2(2, 0.5), // Control point 2
      new THREE.Vector2(2, 1), // Control point 3
      new THREE.Vector2(1.9, 1.75), // Control point 4
      new THREE.Vector2(1.5, 2), // Control point 5
      new THREE.Vector2(1, 2.3), // Control point 6
      new THREE.Vector2(0.6, 2.6), // Control point 7
      new THREE.Vector2(0.55, 3), // Control point 8
      new THREE.Vector2(0.55, 3.5), // Control point 9
      new THREE.Vector2(1.1, 3.5), // Control point 10
      new THREE.Vector2(1, 3.2), // Control point 11
    ]);

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the final object to add to the scene
    const curveObject = new THREE.Line(geometry, material2);
    //this.add(curveObject);

    const segments = 64; // Increase for smoother curve

    const latheGeometry = new THREE.LatheGeometry(
      points,
      segments,
      0,
      Math.PI * 2
    );

    const material = new THREE.MeshPhongMaterial({
      color: "#ffaaaa",
      specular: "#222222",
      emissive: "#111111",
      shininess: 15,
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("textures/Vase-Texture.png"),
    });

    latheGeometry.scale(0.6, 0.6, 0.6);
    const jarMesh = new THREE.Mesh(latheGeometry, material);

    jarMesh.castShadow = true;
    jarMesh.receiveShadow = true;

    // add land to the vase
    const landShape = new THREE.Shape();
    landShape.absarc(0, 0, 0.21, 0, Math.PI * 2, false);

    const landExtrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: false,
    };

    const landGeometry = new THREE.ExtrudeGeometry(
      landShape,
      landExtrudeSettings
    );
    landGeometry.rotateX(Math.PI / 2);

    const landMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("textures/earth.jpg"),
    });
    landMaterial.map.wrapS = THREE.RepeatWrapping;
    landMaterial.map.wrapT = THREE.RepeatWrapping;
    landMaterial.map.repeat.set(1, 1);

    const landMesh = new THREE.Mesh(landGeometry, landMaterial);

    landMesh.position.set(0, 1.8, 0);
    landMesh.scale.set(1.5, 1.5, 1.5);
    this.add(landMesh);

    this.add(jarMesh);
  }
}
