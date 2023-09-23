import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { Cake } from "./objects/cake.js";
import { Table } from "./objects/table.js";
import { Chair } from "./objects/chair.js";

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
    color: "#cc9900",
    specular: "#ccbb00",
    emissive: "#000000",
    shininess: 30,
  });

  tableWoodMaterial = new THREE.MeshPhongMaterial({
    color: "#8B4513",
    specular: "#8B4513",
    emissive: "#000000",
    shininess: 30,
  });

  silverMaterial = new THREE.MeshPhongMaterial({
    color: "#c0c0c0",
    specular: "#ffffff",
    emissive: "#000000",
    shininess: 30,
  });

  chocolateMaterial = new THREE.MeshPhongMaterial({
    color: "#5C4033",
    specular: "#222222",
    emissive: "#000000",
    shininess: 30,
    side: THREE.DoubleSide, // Render both sides of the faces
  });



  carpetMaterial = new THREE.MeshPhongMaterial({
    color: "#aa00ff",
    specular: "#cc00ff",
    emissive: "#000000",
    shininess: 30,
  });

  tvMaterial = new THREE.MeshPhongMaterial({
    color: "#222222",
    specular: "#353535",
    emissive: "#000000",
    shininess: 30,
  });

  // ============== Objects ====================

  table = new Table(6, 0.2, 10, this.tableWoodMaterial, 2.0);
  floor = new THREE.BoxGeometry(15, 0.1, 15);
  wall = new THREE.BoxGeometry(15, 5, 0.1);
  dish = new THREE.CylinderGeometry(1.3, 1, 0.25, 32);
  chairs = [new Chair(2.5, 0.2, 2.5, this.tableWoodMaterial, [2.5, 2.8, 1]),
            new Chair(2.5, 0.2, 2.5, this.tableWoodMaterial, [-2.5, 2.8, -1]),
            new Chair(2.5, 0.2, 2.5, this.tableWoodMaterial, [2.5, -2.8, 1]),
            new Chair(2.5, 0.2, 2.5, this.tableWoodMaterial, [-2.5, -2.8, -1]),
  ]

  carpet = new THREE.PlaneGeometry(12, 8, 32);

  cake = new Cake(4, 3.2, 16, 2, false,
    Math.PI * 0.25,
    Math.PI * 1.54, this.chocolateMaterial);


  tv = new THREE.PlaneGeometry(8, 3.5, 32);

  // ============== Meshes ====================

  floorMesh = new THREE.Mesh(this.floor, this.floorMaterial);

  // walls
  wallMesh1 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh2 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh3 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh4 = new THREE.Mesh(this.wall, this.wallMaterial);

  // dish with cake
  dishMesh = new THREE.Mesh(this.dish, this.silverMaterial);



  // carpet
  carpetMesh = new THREE.Mesh(this.carpet, this.carpetMaterial);

  // tv
  tvMesh = new THREE.Mesh(this.tv, this.tvMaterial);

  init() {
    this.axis = new MyAxis(this);
    // this.app.scene.add(this.axis);

    // ============== Positions ====================

    this.floorMesh.position.y = -0.05;

    this.wallMesh1.position.y = 2.5;
    this.wallMesh1.position.z = 7.5;

    this.wallMesh2.position.y = 2.5;
    this.wallMesh2.position.z = -7.5;

    this.wallMesh3.position.y = 2.5;
    this.wallMesh3.position.x = -7.5;
    this.wallMesh3.rotation.y = Math.PI / 2;

    this.wallMesh4.position.y = 2.5;
    this.wallMesh4.position.x = 7.5;
    this.wallMesh4.rotation.y = Math.PI / 2;

    this.dishMesh.position.y = 2.2;
    this.dishMesh.position.x = 0;

    this.cake.position.y = 2.6;
    this.cake.position.x = 0;
    this.cake.scale.set(0.2, 0.3, 0.2);


    this.carpetMesh.position.y = 0.02;
    this.carpetMesh.rotation.x = -Math.PI / 2;

    this.tvMesh.position.y = 2.6;
    this.tvMesh.position.z = -7.44;

    // ============== Display ====================

    this.app.scene.add(this.table);
    this.app.scene.add(this.floorMesh);
    this.app.scene.add(this.wallMesh1);
    this.app.scene.add(this.wallMesh2);
    this.app.scene.add(this.wallMesh3);
    // this.app.scene.add(this.wallMesh4); // desligar para ver a mesa


    for (let chair in this.chairs) {
      this.app.scene.add(this.chairs[chair]);
    }

    this.app.scene.add(this.dishMesh);
    this.app.scene.add(this.cake);

    this.app.scene.add(this.carpetMesh);
    this.app.scene.add(this.tvMesh);

    // ================== Lights ====================

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 250, 0);
    pointLight.position.set(0, 10, 0);
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
