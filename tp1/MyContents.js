import * as THREE from "three";
import { Cake } from "./objects/cake.js";
import { Table } from "./objects/table.js";
import { Portrait } from "./objects/portrait.js";
import { Room } from "./objects/room.js";
import { SkyBox } from "./objects/skybox.js";
import { Hole } from "./objects/hole.js";
import { Spring } from "./objects/spring.js";
import { Jornal } from "./objects/jornal.js";
import { Vase } from "./objects/vase.js";
import { Flower } from "./objects/flower.js";
export class MyContents {
  constructor(app) {
    this.app = app;
  }

  update() {}

  init() {
    // ============== Textures ====================

    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load("textures/wood.jpg");
    const floorTexture = textureLoader.load("textures/floor.jpg");
    const chairTexture = textureLoader.load("textures/chair.jpg");
    const ceilTexture = textureLoader.load("textures/floor.jpg");

    // ============== Materials ====================

    const wallMaterial = new THREE.MeshPhongMaterial({
      color: "#B4A89C",
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
    const portrait3 = new Portrait(3, 3, "carocha");

    this.skybox = new SkyBox(75);
    this.hole = new Hole(0.2, 7.3, 25, 7, 1.8, wallMaterial);

    this.spring = new Spring();
    this.jornal = new Jornal();
    this.vase = new Vase();
    this.flower = new Flower();

    this.windowPane = new Hole(0.5, 5.5, 11, 0.4, 0.4);

    this.glassMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 5.5),
      new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        specular: 0xffaaaa,
        shininess: 250,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      })
    );

    this.glassMesh.rotation.y = Math.PI / 2;
    this.glassMesh.position.set(0.15, 2.8, 0);
    this.windowPane.add(this.glassMesh);

    // ============== Positions ====================

    // Jornal
    this.jornal.position.set(2.3, 3.05, 0.2);

    // Flower
    this.flower.position.set(6.7, 3, -11);

    // Vase
    this.vase.position.set(7, 0.05, -11);

    // Cake
    this.cake.position.y = 2.9;
    this.cake.scale.set(0.2, 0.3, 0.2);

    // Portraits
    portrait1.position.set(-3, 0, -0.1);
    portrait2.position.set(3, 0, -0.1);
    portrait3.position.set(9, 0, -0.1);

    // Window
    this.windowPane.position.set(0.1, 1, 0);

    // Hole
    this.hole.position.set(-12.5, 0.8, 0);


    // Spring
    this.spring.scale.set(2, 2, 2);
    this.spring.position.set(2, 3.15, 2);

    // ============== Display ====================

    //this.app.scene.add(this.room);
    //this.app.scene.add(table);
    table.add(this.cake);

    // Add Portraits
    this.room.getWallMesh1().add(portrait1);
    this.room.getWallMesh1().add(portrait2);
    this.room.getWallMesh1().add(portrait3);

    this.hole.add(this.windowPane);

    this.app.scene.add(this.skybox);
    this.app.scene.add(this.hole);
    table.add(this.spring);
    table.add(this.jornal);
    this.room.add(this.vase);
    this.room.add(this.flower);

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
    spotLight.position.set(-0.5, 9, 0);
    spotLight.target = this.cake;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 4096;
    spotLight.shadow.mapSize.height = 4096;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 100;
    spotLight.angle = Math.PI / 12;
    spotLight.penumbra = 0.25;
    spotLight.intensity = 650;
    spotLight.distance = 7;

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    this.app.scene.add(spotLightHelper);
    this.app.scene.add(spotLight);
  }

  addLights() {
    const xLight = 5;
    const yLight = -4.5;
    const zLight = 5;
  
    for (let i = 0; i < 4; i++) {
      const pointLight = new THREE.PointLight(0xffffff, 50, 0);
      const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);

      const x = (i % 2 === 0 ? 1 : -1) * xLight;
      const z = (i < 2 ? 1 : -1) * zLight;
      pointLight.position.set(x, yLight, z);

      this.room.getCeilMesh().add(pointLight);
      this.room.add(pointLightHelper);
    }
    

    // add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(-30, 10, -25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.top = 100; 
    this.app.scene.add(directionalLight);

    const directionalLightHelper = new THREE.DirectionalLightHelper(
       directionalLight,
       0.5
    );

    this.app.scene.add(directionalLightHelper);
    const ambientLight = new THREE.AmbientLight(0x565656);
    this.app.scene.add(ambientLight);
  }

  // ============== Player Stuff ====================

  keyboard = {};
  player = null;

  addPlayer() {
    const playerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // Customize size as needed
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0x5fff70,
      opacity: 0,
      transparent: true,
    }); // Customize color as needed
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);

    this.player.position.set(0, 5, 0);
    this.app.scene.add(this.player);
  }

  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key.toLowerCase()] = false;
    });
  }

  animate() {
    const playerSpeed = 0.25;
    const rotationSpeed = 0.05;

    const playerDirection = new THREE.Vector3(0, 0, -1); // Initial forward direction

    // Rotate the player's direction based on their current rotation
    playerDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.player.rotation.y
    );

    // Calculate the movement vector based on the player's direction
    const moveVector = new THREE.Vector3();
    if (this.keyboard["w"]) moveVector.sub(playerDirection);
    if (this.keyboard["s"]) moveVector.add(playerDirection);
    if (this.keyboard["a"]) {
      const leftDirection = new THREE.Vector3(1, 0, 0);
      leftDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.player.rotation.y
      );
      moveVector.add(leftDirection);
    }
    if (this.keyboard["d"]) {
      const rightDirection = new THREE.Vector3(-1, 0, 0);
      rightDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.player.rotation.y
      );
      moveVector.add(rightDirection);
    }
    if (this.keyboard[" "]) moveVector.add(new THREE.Vector3(0, 1, 0));
    if (this.keyboard["shift"]) moveVector.sub(new THREE.Vector3(0, 1, 0));

    // Normalize the move vector and apply playerSpeed
    moveVector.normalize().multiplyScalar(playerSpeed);

    // Update player position
    this.player.position.add(moveVector);

    // Vertical rotation
    if (this.keyboard["arrowleft"]) {
      this.player.rotation.x = 0;
      this.player.rotation.y += rotationSpeed;
    }
    if (this.keyboard["arrowright"]) {
      this.player.rotation.x = 0;
      this.player.rotation.y -= rotationSpeed;
    }
    if (this.keyboard["arrowup"]) {
      const maxPitch = Math.PI / 2 - 0.5;
      const minPitch = -Math.PI / 2 - 0.5;

      this.player.rotation.x = Math.max(
        minPitch,
        Math.min(maxPitch, this.player.rotation.x + rotationSpeed)
      );
    }
    if (this.keyboard["arrowdown"]) {
      const maxPitch = Math.PI / 2 - 0.5;
      const minPitch = -Math.PI / 2 - 0.5;

      this.player.rotation.x = Math.max(
        minPitch,
        Math.min(maxPitch, this.player.rotation.x - rotationSpeed)
      );
    }

    if (this.keyboard["r"]) {
      // reset rotation
      this.player.rotation.x = 0;
      this.player.rotation.y = 0;
      this.player.rotation.z = 0;
      this.keyboard["r"] = false;
    }

    if (this.app.activeCameraName === "FirstPerson") this.updatePlayerCamera();

    requestAnimationFrame(() => {
      this.animate();
    });
  }

  updatePlayerCamera() {
    const playerPosition = this.player.position.clone();
    const cameraPosition = this.app.activeCamera.position;

    // Calculate a position relative to the player's rotation
    const relativeCameraOffset = new THREE.Vector3(0, 1, -4); // Adjust the offset as needed
    const cameraOffset = relativeCameraOffset.applyQuaternion(
      this.player.quaternion
    );

    // Set the camera's position to be relative to the player's position
    cameraPosition.copy(playerPosition).add(cameraOffset);

    // Make the camera look at the player's position
    this.app.activeCamera.lookAt(playerPosition);
  }
}
