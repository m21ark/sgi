import * as THREE from "three";
import { Cake } from "./objects/cake.js";
import { Table } from "./objects/table.js";
import { Portrait } from "./objects/portrait.js";

class MyContents {
  constructor(app) {
    this.app = app;

    // box related attributes
    this.boxMesh = null;
    this.boxMeshSize = 1.0;
    this.boxEnabled = true;
    this.lastBoxEnabled = null;
    this.boxDisplacement = new THREE.Vector3(0, 2, 0);
  }

  // ============== Materials ====================

  floorMaterial = new THREE.MeshPhongMaterial({
    color: "#ffcc99",
    specular: "#777777",
    emissive: "#000000",
    shininess: 30,
    map: new THREE.TextureLoader().load("textures/floor.jpg"),
  });

  woodTexture = new THREE.TextureLoader().load("textures/wood.jpg");

  wallMaterial = new THREE.MeshPhongMaterial({
    color: "#B4A89C",
  });

  woodMaterial = new THREE.MeshPhongMaterial({
    color: "#9B6533", // 8B4513
    specular: "#222222",
    emissive: "#000000",
    shininess: 15,
    map: this.woodTexture,
  });

  carpetMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0.9, 0.85, 0.75), // Beige color (adjust RGB values)
    specular: new THREE.Color(0.0, 0.0, 0.0), // Match the color for a subtle specular highlight
    emissive: new THREE.Color(0, 0, 0), // No emissive color
    shininess: 0, // Adjust shininess as needed
    map: new THREE.TextureLoader().load("textures/carpet.jpg"), // Load your carpet texture
  });

  tvMaterial = new THREE.MeshPhongMaterial({
    color: "#222222",
    specular: "#353535",
    emissive: "#000000",
    shininess: 30,
  });

  chairMaterial = new THREE.MeshPhongMaterial({
    color: "#aa3333",
    specular: "#222222",
    emissive: "#000000",
    shininess: 15,
    map: new THREE.TextureLoader().load("textures/chair.jpg"),
  });

  cakeMaterial = new THREE.MeshPhongMaterial({
    color: "#5C4033",
    specular: "#222222",
    emissive: "#000000",
    shininess: 30,
    map: new THREE.TextureLoader().load("textures/cake.jpg"),
    side: THREE.DoubleSide, // Render both sides of the faces
  });

  // ============== Objects ====================

  floor = new THREE.BoxGeometry(25, 0.1, 25);
  wall = new THREE.BoxGeometry(25, 7, 0.1);

  carpet = new THREE.PlaneGeometry(12, 18, 32);

  cake = new Cake(
    4,
    1,
    20,
    1.5,
    false,
    Math.PI * 0.25,
    Math.PI * 1.54,
    this.cakeMaterial
  );

  tv = new THREE.BoxGeometry(10, 3.4, 0.1);

  // ============== Meshes ====================

  floorMesh = new THREE.Mesh(this.floor, this.floorMaterial);

  // walls
  wallMesh1 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh2 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh3 = new THREE.Mesh(this.wall, this.wallMaterial);
  wallMesh4 = new THREE.Mesh(this.wall, this.wallMaterial);

  // table
  table = new Table(this.woodMaterial, this.chairMaterial);

  // carpet
  carpetMesh = new THREE.Mesh(this.carpet, this.carpetMaterial);

  // tv
  tvMesh = new THREE.Mesh(this.tv, this.tvMaterial);

  init() {
    // ============== Positions ====================

    this.floorMesh.position.y = -0.05;

    this.wallMesh1.position.y = 3.5;
    this.wallMesh1.position.z = 12.5;

    this.wallMesh2.position.y = 3.5;
    this.wallMesh2.position.z = -12.5;

    this.wallMesh3.position.y = 3.5;
    this.wallMesh3.position.x = -12.5;
    this.wallMesh3.rotation.y = Math.PI / 2;

    this.wallMesh4.position.y = 3.5;
    this.wallMesh4.position.x = 12.5;
    this.wallMesh4.rotation.y = Math.PI / 2;

    this.carpetMesh.position.y = 0.02;
    this.carpetMesh.rotation.x = -Math.PI / 2;

    // ============== Display ====================

    this.app.scene.add(this.floorMesh);
    this.app.scene.add(this.wallMesh1);
    this.app.scene.add(this.wallMesh2);
    this.app.scene.add(this.wallMesh3);
    this.app.scene.add(this.wallMesh4);

    this.app.scene.add(this.carpetMesh);

    this.tvMesh.position.z = 0.1;
    this.wallMesh2.add(this.tvMesh);

    this.app.scene.add(this.table);

    this.cake.position.y = 3;
    this.cake.scale.set(0.2, 0.3, 0.2);
    this.table.add(this.cake);

    // ============== Portraits ====================

    const portrait1 = new Portrait(3, 3, "textures/portrait1.jpg");
    portrait1.position.set(-2.5, 0, -0.1);
    this.wallMesh1.add(portrait1);

    const portrait2 = new Portrait(3, 3, "textures/portrait2.jpg");
    portrait2.position.set(2.5, 0, -0.1);
    this.wallMesh1.add(portrait2);

    // ================== Lights ====================

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 250, 0);
    pointLight.position.set(0, 6, 0);
    this.app.scene.add(pointLight);

    // light under table
    const pointLight2 = new THREE.PointLight(0xffffff, 50, 0);
    pointLight2.position.set(0, 0.6, 0);
    this.app.scene.add(pointLight2);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);

    this.app.scene.scale.set(1, 1.5, 1);
  }

  update() {
    // ...
  }
}

export { MyContents };
