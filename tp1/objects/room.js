import * as THREE from "three";

/**
 * A class representing a room in a 3D scene.
 * @extends THREE.Object3D
 */
export class Room extends THREE.Object3D {
  /**
   * Creates a new Room object.
   * @param {THREE.Material} floorMaterial - The material to use for the floor.
   * @param {THREE.Material} wallMaterial - The material to use for the walls.
   * @param {THREE.Material} ceilMaterial - The material to use for the ceiling.
   */
  constructor(floorMaterial, wallMaterial, ceilMaterial) {
    super();

    const textureLoader = new THREE.TextureLoader();
    const carpetTexture = textureLoader.load("textures/carpet.jpg");
    const floorNormalTexture = textureLoader.load("textures/floorN.jpg");
    floorMaterial.normalMap = floorNormalTexture;

    // ==================== Materials ====================

    const videoElement = document.getElementById("tv-video");

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    /**
     * The material to use for the TV.
     * @type {THREE.MeshPhongMaterial}
     */
    const tvMaterial = new THREE.MeshPhongMaterial({
      color: "#222222",
      specular: "#353535",
      emissive: "#000000",
      shininess: 30,
    });

    /**
     * The material to use for the TV screen.
     * @type {THREE.MeshPhongMaterial}
     */
    const screenMat = new THREE.MeshPhongMaterial({
      color: "#dddddd",
      specular: "#353535",
      emissive: "#000000",
      shininess: 30,
      map: videoTexture,
    });

    /**
     * The material to use for the carpet.
     * @type {THREE.MeshPhongMaterial}
     */
    const carpetMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0.9, 0.85, 0.75),
      specular: new THREE.Color(0.0, 0.0, 0.0),
      emissive: new THREE.Color(0, 0, 0),
      shininess: 0,
      map: carpetTexture,
    });

    // ==================== Normals ====================

    // ==================== TV ====================

    const tv = new THREE.BoxGeometry(10, 4, 0.1);

    const screen = new THREE.PlaneGeometry(9.5, 3.7);

    const tvMesh = new THREE.Mesh(tv, tvMaterial);
    const screenMesh = new THREE.Mesh(screen, screenMat);

    // ==================== Carpet ====================

    const carpet = new THREE.PlaneGeometry(12, 18, 32);
    const carpetMesh = new THREE.Mesh(carpet, carpetMaterial);

    carpetMesh.receiveShadow = true;

    // ==================== Geometries ====================

    const floor = new THREE.BoxGeometry(25, 0.1, 25);
    const wall = new THREE.BoxGeometry(25, 9, 0.1);

    // ==================== Meshes ====================

    /**
     * The mesh for the floor.
     * @type {THREE.Mesh}
     */
    this.floorMesh = new THREE.Mesh(floor, floorMaterial);

    /**
     * The mesh for the ceiling.
     * @type {THREE.Mesh}
     */
    this.ceilMesh = new THREE.Mesh(floor, ceilMaterial);

    this.ceilMesh.receiveShadow = true;
    this.ceilMesh.castShadow = true;

    /**
     * The mesh for the first wall.
     * @type {THREE.Mesh}
     */
    this.wallMesh1 = new THREE.Mesh(wall, wallMaterial);

    /**
     * The mesh for the second wall.
     * @type {THREE.Mesh}
     */
    this.wallMesh2 = new THREE.Mesh(wall, wallMaterial);

    /**
     * The mesh for the third wall.
     * @type {THREE.Mesh}
     */
    this.wallMesh3 = new THREE.Mesh(wall, wallMaterial);

    /**
     * The mesh for the fourth wall.
     * @type {THREE.Mesh}
     */
    this.wallMesh4 = new THREE.Mesh(wall, wallMaterial);

    // enable cast and receive shaddow for wall meshes
    this.wallMesh1.castShadow = true;
    this.wallMesh1.receiveShadow = true;
    this.wallMesh2.castShadow = true;
    this.wallMesh2.receiveShadow = true;
    this.wallMesh3.castShadow = true;
    this.wallMesh3.receiveShadow = true;
    this.wallMesh4.castShadow = true;
    this.wallMesh4.receiveShadow = true;

    // ==================== Positions ====================

    this.floorMesh.position.y = -0.05;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.castShadow = true;
    this.ceilMesh.position.y = 9.05;

    this.wallMesh1.position.y = 4.5;
    this.wallMesh1.position.z = 12.5;

    this.wallMesh2.position.y = 4.5;
    this.wallMesh2.position.z = -12.5;

    this.wallMesh3.position.y = 4.5;
    this.wallMesh3.position.x = -12.5;
    this.wallMesh3.rotation.y = Math.PI / 2;

    this.wallMesh4.position.y = 4.5;
    this.wallMesh4.position.x = 12.5;
    this.wallMesh4.rotation.y = Math.PI / 2;

    tvMesh.position.z = 0.1;
    tvMesh.position.y = 0.6;

    screenMesh.position.z = 0.153;
    screenMesh.position.y = 0.6;

    carpetMesh.position.y = 0.02;
    carpetMesh.rotation.x = -Math.PI / 2;

    // ==================== Display ====================

    this.add(this.floorMesh);
    this.add(this.ceilMesh);

    this.add(this.wallMesh1);
    this.add(this.wallMesh2);
    //this.add(this.wallMesh3);
    //this.add(this.wallMesh4);

    this.wallMesh2.add(tvMesh);
    this.wallMesh2.add(screenMesh);
    this.add(carpetMesh);
  }

  /**
   * Returns the mesh for the first wall.
   * @returns {THREE.Mesh} The mesh for the first wall.
   */
  getWallMesh1() {
    return this.wallMesh1;
  }

  /**
   * Returns the mesh for the ceiling.
   * @returns {THREE.Mesh} The mesh for the ceiling.
   */
  getCeilMesh() {
    return this.ceilMesh;
  }

  /**
   * Returns the mesh for the third wall.
   * @returns {THREE.Mesh} The mesh for the third wall.
   */
  getWallMesh3() {
    return this.wallMesh3;
  }
}
