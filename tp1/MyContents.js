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

    // ============== Objects ====================

    const room = new Room(floorMaterial, wallMaterial);
    const table = new Table(woodMaterial, chairMaterial);
    const cake = new Cake(4, 1, 20, 1.5, false, Math.PI * 0.25, Math.PI * 1.54);

    const portrait1 = new Portrait(3, 3, "textures/portrait1.jpg");
    const portrait2 = new Portrait(3, 3, "textures/portrait2.jpg");

    // ============== Meshes ====================

    // ...

    // ============== Positions ====================

    // Cake
    cake.position.y = 3;
    cake.scale.set(0.2, 0.3, 0.2);

    // Portraits
    portrait1.position.set(-3, 0, -0.1);
    portrait2.position.set(3, 0, -0.1);

    // ============== Display ====================

    this.app.scene.add(room);
    this.app.scene.add(table);
    table.add(cake);

    // Add Portraits
    room.getWallMesh1().add(portrait1);
    room.getWallMesh1().add(portrait2);

    // ============== Lights ====================

    this.addLights();
  }

  addLights() {
    const pointLight = new THREE.PointLight(0xffffff, 350, 0);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
    const ambientLight = new THREE.AmbientLight(0x555555);

    pointLight.position.set(0, 7.5, 0);

    this.app.scene.add(pointLight);
    this.app.scene.add(pointLightHelper);
    this.app.scene.add(ambientLight);
  }
}
