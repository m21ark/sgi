import * as THREE from "three";

export class Room extends THREE.Object3D {
  constructor(floorMaterial, wallMaterial) {
    super();

    const textureLoader = new THREE.TextureLoader();
    const carpetTexture = textureLoader.load("textures/carpet.jpg");

    // ==================== Materials ====================

    const tvMaterial = new THREE.MeshPhongMaterial({
      color: "#222222",
      specular: "#353535",
      emissive: "#000000",
      shininess: 30,
    });

    const carpetMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0.9, 0.85, 0.75),
      specular: new THREE.Color(0.0, 0.0, 0.0),
      emissive: new THREE.Color(0, 0, 0),
      shininess: 0,
      map: carpetTexture,
    });

    // ==================== TV ====================

    const tv = new THREE.BoxGeometry(10, 4, 0.1);
    const tvMesh = new THREE.Mesh(tv, tvMaterial);

    // ==================== Carpet ====================

    const carpet = new THREE.PlaneGeometry(12, 18, 32);
    const carpetMesh = new THREE.Mesh(carpet, carpetMaterial);

    // ==================== Geometries ====================

    const floor = new THREE.BoxGeometry(25, 0.1, 25);
    const wall = new THREE.BoxGeometry(25, 9, 0.1);

    // ==================== Meshes ====================

    const floorMesh = new THREE.Mesh(floor, floorMaterial);

    this.wallMesh1 = new THREE.Mesh(wall, wallMaterial);
    this.wallMesh2 = new THREE.Mesh(wall, wallMaterial);
    this.wallMesh3 = new THREE.Mesh(wall, wallMaterial);
    this.wallMesh4 = new THREE.Mesh(wall, wallMaterial);

    // ==================== Positions ====================

    floorMesh.position.y = -0.05;

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

    tvMesh.position.z = 0.1;
    tvMesh.position.y = 0.6;

    carpetMesh.position.y = 0.02;
    carpetMesh.rotation.x = -Math.PI / 2;

    // ==================== Display ====================

    this.add(floorMesh);

    this.add(this.wallMesh1);
    this.add(this.wallMesh2);
    this.add(this.wallMesh3);
    this.add(this.wallMesh4);

    this.wallMesh2.add(tvMesh);
    this.add(carpetMesh);
  }

  getWallMesh1() {
    return this.wallMesh1;
  }
}
