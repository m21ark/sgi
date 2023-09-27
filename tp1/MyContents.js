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

  // ============== Objects ====================

  table = new Table(6, 0.2, 10, this.woodMaterial, 2.0);
  floor = new THREE.BoxGeometry(15, 0.1, 15);
  wall = new THREE.BoxGeometry(15, 5, 0.1);
  dish = new THREE.CylinderGeometry(1.3, 1, 0.25, 32);
  chairs = [
    new Chair(2.5, 0.2, 2.5, this.woodMaterial, [2.5, 2.8, 1]),
    new Chair(2.5, 0.2, 2.5, this.woodMaterial, [-2.5, 2.8, -1]),
    new Chair(2.5, 0.2, 2.5, this.woodMaterial, [2.5, -2.8, 1]),
    new Chair(2.5, 0.2, 2.5, this.woodMaterial, [-2.5, -2.8, -1]),
  ];

  carpet = new THREE.PlaneGeometry(12, 8, 32);

  cake = new Cake(
    4,
    1.5,
    16,
    2,
    false,
    Math.PI * 0.25,
    Math.PI * 1.54,
    this.chocolateMaterial
  );

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

    // portraits
    const portraitWidth = 3; // Adjust the width of the portrait
    const portraitHeight = 3; // Adjust the height of the portrait

    const portraitGeometry1 = new THREE.PlaneGeometry(
      portraitWidth,
      portraitHeight
    );
    const portraitGeometry2 = new THREE.PlaneGeometry(
      portraitWidth,
      portraitHeight
    );

    const textureLoader = new THREE.TextureLoader();

    // Load and create textures
    const portraitTexture1 = textureLoader.load("textures/portrait.jpg");
    const portraitTexture2 = portraitTexture1.clone();

    // Create materials for the portraits
    const portraitMaterial1 = new THREE.MeshBasicMaterial({
      map: portraitTexture1,
    });

    const portraitMaterial2 = new THREE.MeshBasicMaterial({
      map: portraitTexture2,
    });

    const portraitMesh1 = new THREE.Mesh(portraitGeometry1, portraitMaterial1);
    const portraitMesh2 = new THREE.Mesh(portraitGeometry2, portraitMaterial2);

    portraitMesh1.position.set(0, 0, -0.1); // Adjust the position as needed
    portraitMesh2.position.set(0, 0, 0.05); // Adjust the position as needed

    portraitMesh1.rotation.y = Math.PI;

    this.wallMesh1.add(portraitMesh1);
    //this.wallMesh1.add(portraitMesh2);

    // ============== PICTURE FRAME =================
    const frameWidth = portraitWidth + 0.1; // Adjust the frame width
    const frameHeight = portraitHeight + 0.1; // Adjust the frame height
    const frameDepth = 0.05; // Adjust the frame depth

    const frameGeometry = new THREE.BoxGeometry(
      frameWidth,
      frameHeight,
      frameDepth
    );

    const frameMaterial = new THREE.MeshPhongMaterial({
      color: "#c0c0c0", // Metal-like color
      specular: "#ffffff",
      emissive: "#000000",
      shininess: 30,
    });

    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

    frameMesh.position.set(0, 0, -0.05); // Adjust the position as needed
    portraitMesh1.add(frameMesh); // Add the frame as a child of the portrait

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
