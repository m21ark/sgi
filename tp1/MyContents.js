import * as THREE from "three";
import { Cake } from "./objects/cake.js";
import { Table } from "./objects/table.js";
import { Portrait } from "./objects/portrait.js";
import { Room } from "./objects/room.js";
export class MyContents {
  constructor(app) {
    this.app = app;
  }

  update() {
    // ...
  }

  init() {
    // ============== Textures ====================

    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load("textures/wood.jpg");
    const floorTexture = textureLoader.load("textures/floor.jpg");
    const chairTexture = textureLoader.load("textures/chair.jpg");
    const ceilTexture = textureLoader.load("textures/floor.jpg");
    const wallTexture = textureLoader.load("textures/wall.jpg");

    wallTexture.normalMap = textureLoader.load("textures/wallN.jpg");

    // ============== Materials ====================

    const wallMaterial = new THREE.MeshPhongMaterial({
      color: "#B4A89C",
      map: wallTexture,
    });

    const floorMaterial = new THREE.MeshPhongMaterial({
      color: "#ffcc99",
      specular: "#777777",
      emissive: "#000000",
      shininess: 30,
      map: floorTexture,
    });

    const woodMaterial = new THREE.MeshPhongMaterial({
      color: "#9B6533", // 8B4513
      specular: "#222222",
      emissive: "#000000",
      shininess: 15,
      map: woodTexture,
    });

    const chairMaterial = new THREE.MeshPhongMaterial({
      color: "#aa3333",
      specular: "#222222",
      emissive: "#000000",
      shininess: 15,
      map: chairTexture,
    });

    const ceilMaterial = new THREE.MeshPhongMaterial({
      color: "#8f7256",
      shininess: 30,
      map: ceilTexture,
    });

    // ============== Objects ====================

    this.room = new Room(floorMaterial, wallMaterial, ceilMaterial);
    const table = new Table(woodMaterial, chairMaterial);
    this.cake = new Cake(4, 1, 20, 1.5, false, Math.PI * 0.25, Math.PI * 1.54);

    const portrait1 = new Portrait(3, 3, "textures/portrait1.jpg");
    const portrait2 = new Portrait(3, 3, "textures/portrait2.jpg");

    this.windowPane = new THREE.PlaneGeometry(8, 6);

    // ============== Meshes ====================

    const windowPane = new THREE.Mesh(
      this.windowPane,
      new THREE.MeshPhongMaterial({
        color: "#03ecfc",
        specular: "#ffffff",
        emissive: "#000000",
        shininess: 30,
      })
    );

    // ============== Positions ====================

    // Cake
    this.cake.position.y = 2.9;
    this.cake.scale.set(0.2, 0.3, 0.2);

    // Portraits
    portrait1.position.set(-3, 0, -0.1);
    portrait2.position.set(3, 0, -0.1);

    // Window
    windowPane.position.set(0, 0, 0.08);

    // ============== Display ====================

    this.app.scene.add(this.room);
    this.app.scene.add(table);
    table.add(this.cake);

    // Add Portraits
    this.room.getWallMesh1().add(portrait1);
    this.room.getWallMesh1().add(portrait2);

    this.room.getWallMesh3().add(windowPane);

    // ============== Lights ====================

    this.addLights();
    this.addCakeSpotlight();

    // ============== Player ====================

    this.addPlayer();
    this.addListeners();
    this.animate();
  }

  addCakeSpotlight() {
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 9, 0);
    spotLight.target = this.cake;

    spotLight.angle = Math.PI / 12;
    spotLight.penumbra = 0.25;
    spotLight.intensity = 650;
    spotLight.distance = 7;

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    //this.app.scene.add(spotLightHelper);
    this.app.scene.add(spotLight);
  }

  addLights() {
    const xLight = 5;
    const yLight = -4.5;
    const zLight = 5;

    for (let i = 0; i < 4; i++) {
      const pointLight = new THREE.PointLight(0xffffff, 75, 0);
      const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);

      const x = (i % 2 === 0 ? 1 : -1) * xLight;
      const z = (i < 2 ? 1 : -1) * zLight;
      pointLight.position.set(x, yLight, z);

      this.room.getCeilMesh().add(pointLight);
      //this.room.add(pointLightHelper);
    }

    const ambientLight = new THREE.AmbientLight(0x565656);
    this.app.scene.add(ambientLight);
  }

  // ============== Player Stuff ====================

  keyboard = {};
  player = null;

  addPlayer() {
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1); // Customize size as needed
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x5fff70 }); // Customize color as needed
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);

    this.player.position.set(0, 1, 0);
    this.app.scene.add(this.player);
  }

  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key] = false;
    });
  }

  animate() {
    const playerSpeed = 0.1;

    if (this.keyboard["w"]) this.player.translateZ(-playerSpeed);
    if (this.keyboard["s"]) this.player.translateZ(playerSpeed);
    if (this.keyboard["a"]) this.player.translateX(-playerSpeed);
    if (this.keyboard["d"]) this.player.translateX(playerSpeed);

    this.updatePlayerCamera();

    requestAnimationFrame(() => {
      this.animate();
    });
  }

  updatePlayerCamera() {
    this.app.cameras["Perspective"].position.copy(this.player.position);
  }
}
