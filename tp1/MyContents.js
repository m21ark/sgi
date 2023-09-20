import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  constructor(app) {
    this.app = app;
    this.axis = null;

    // box related attributes
    this.boxMesh = null;
    this.boxMeshSize = 1.0;
    this.boxEnabled = true;
    this.lastBoxEnabled = null;
    this.boxDisplacement = new THREE.Vector3(0, 2, 0);
  }

  // ============== Materials ====================

  floorMaterial = new THREE.MeshPhongMaterial({
    color: "#00ffff",
    specular: "#777777",
    emissive: "#000000",
    shininess: 30,
  });

  wallMaterial = new THREE.MeshPhongMaterial({
    color: "#ff0000",
    specular: "#ff0000",
    emissive: "#000000",
    shininess: 30,
  });

  tableWoodMaterial = new THREE.MeshPhongMaterial({
    color: "#8B4513",
    specular: "#8B4513",
    emissive: "#000000",
    shininess: 30,
  });

  // ============== Objects ====================

  table = new THREE.BoxGeometry(5.8, 0.2, 10);
  floor = new THREE.BoxGeometry(15, 0.1, 15);
  wall = new THREE.BoxGeometry(15, 5, 0.1);

  // ============== Meshes ====================

  tableMesh = new THREE.Mesh(this.table, this.tableWoodMaterial);
  floorMesh = new THREE.Mesh(this.floor, this.floorMaterial);
  wallMesh = new THREE.Mesh(this.wall, this.wallMaterial);

  init() {
    this.axis = new MyAxis(this);
    this.app.scene.add(this.axis);

    // ============== Positions ====================

    this.tableMesh.position.y = 1.5;
    this.floorMesh.position.y = -0.05;
    this.wallMesh.position.y = 2.5;
    this.wallMesh.position.z = -7.5;

    // ============== Display ====================

    this.app.scene.add(this.tableMesh);
    this.app.scene.add(this.floorMesh);
    this.app.scene.add(this.wallMesh);

    // ================== Lights ====================

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 500, 0);
    pointLight.position.set(0, 20, 0);
    this.app.scene.add(pointLight);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);
  }

  update() {
    // ...
  }
}

export { MyContents };
