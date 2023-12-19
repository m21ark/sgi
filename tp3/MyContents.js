import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LightBuilder } from "./builders/LightBuilder.js";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";
import { MipMapLoader } from "./builders/MipMapLoader.js";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyAICar } from "./MyAICar.js";
import { GridParser } from "./SceneParser.js";
import { MenuController } from "./MenuController.js";
import { MyCar } from "./MyCar.js";
import { Television } from "./Television.js";
import { XMLLoader } from "./XMLLoader.js";

/**
 * MyContents.js
 *
 * This module is responsible for managing the contents of the 3D scene.
 * It provides methods for loading textures, setting materials, creating a skybox, etc.
 */
export class MyContents {
  /**
   * Represents a constructor for the MyContents class.
   * @constructor
   * @param {App} app - The application object.
   */
  constructor(app) {
    this.app = app;

    this.lightBuilder = new LightBuilder(app, this);
    this.objectBuilder = new ObjectBuilder();

    // Variables to store the contents of the scene
    this.materials = [];
    this.lights = [];
    this.textures = [];
    this.textureNode = new Map();
    this.cameras = [];
    this.camerasNames = [];

    // GUI variables
    this.lightsOn = true;
    this.showHelpers = false;
    this.showControlPoints = false;
    this.controlPoints = [];
    this.moveCar = false;
    this.showAIKeyPoints = false;

    this.reader = new MyFileReader(app, this, this.loadXMLScene);
    this.sceneDir = "scene/";
    this.reader.open(this.sceneDir + "myScene.xml");

    this.menuController = new MenuController(app);
    // this.menuController.gotoMenu("main");
  }

  /**
   * Initializes the component.
   * Creates and attaches the axis to the scene if it doesn't exist.
   */
  async init() {
    // TEMPORARIAMENTE AQUI
    this.app.MyHUD.setStatus("PLAY");
    this.app.MyHUD.setLaps(2, 5);
    this.app.MyHUD.setPosition(1, 5);

    // ============== TV =================

    this.tv = new Television(
      this.app.scene,
      this.app.activeCamera,
      this.app.renderer
    );

    // ============== GRID TRACK ====================

    this.gridParser = new GridParser();
    this.gridGroup = await this.gridParser.buildGridGroup(1);
    this.app.scene.add(this.gridGroup);
    this.trees = this.gridParser.getTrees();
    this.hitabbleObjs = this.gridParser.getHitabbleObjs();

    // ============== Player ====================

    this.addPlayer();
    this.addListeners();
    this.animate();

    // =============== AI CAR =====================

    this.AICar = new MyAICar(this.gridParser.getKeyPath());
    this.AICar.addAICar(this.app.scene);
  }

  loadXMLScene(data) {
    this.XMLLoader = new XMLLoader(this);
    this.app = this.XMLLoader.loadXMLScene(data);
  }

  checkCollision(carBB, hitabbleObjs) {
    for (const hitabble of hitabbleObjs) {
      if (carBB.intersectsBox(hitabble)) {
        console.log("COLLISION");
        return true;
      }
    }
  }

  update() {
    if (this.AICar != undefined) this.AICar.update();

    // this gives a ton of warnings
    this.tv.updateRenderTarget(this.app.activeCamera);

    if (
      this.player != null &&
      this.player.carBB != null &&
      this.hitabbleObjs != null
    ) {
      this.player.carBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0]))
        .applyMatrix4(this.player.matrixWorld);

      this.checkCollision(this.player.carBB, this.hitabbleObjs);
    }
  }

  toggleLights() {
    for (let key in this.lights) {
      let light = this.lights[key];
      if (this.lightsOn) light.intensity = 200;
      else light.intensity = 0;
    }
  }

  toggleLightHelpers() {
    for (let key in this.lights) {
      if (this.showHelpers) this.app.scene.add(this.lights[key + "_helper"]);
      else this.app.scene.remove(this.lights[key + "_helper"]);
    }
  }

  toggleControlPoints() {
    for (let key in this.controlPoints) {
      let controlPoint = this.controlPoints[key];
      controlPoint.visible = this.showControlPoints;
    }
  }

  setActiveCamera(cameraId) {
    this.app.activeCamera = this.cameras[cameraId];
    this.app.controls.object = this.cameras[cameraId];
    this.app.controls = new OrbitControls(
      this.app.activeCamera,
      this.app.renderer.domElement
    );
    this.app.controls.target = this.app.activeCamera.target;
    this.app.controls.enableZoom = true;
    this.app.controls.update();
    this.app.activeCameraName = cameraId;
  }

  // ============== First Person View ====================

  keyboard = {};
  player = null;

  /*
   * Adds a player to the scene that can move around
   */
  addPlayer() {
    const playerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    }); // Customize color as needed
    // this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player = new MyCar();
    // this.player.position.set(-100, 40, -120);
    this.player.position.set(200, 0.5, 10);
    this.player.rotation.x = 0.0;
    this.app.scene.add(this.player);
  }

  /*
   * Adds listeners to the scene that allow the player to move around
   */
  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key.toLowerCase()] = false;
    });
  }

  /*
   * Animates the player
   */
  animate() {
    this.app.MyHUD.setCords(...this.player.position);
    this.app.MyHUD.tickTime();
    this.app.MyHUD.setSpeed(this.player.position.x * 10);
    const playerSpeed = 0.5;
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

    // MOVE UP AND DOWN
    if (this.keyboard[" "]) moveVector.add(new THREE.Vector3(0, 1, 0));
    if (this.keyboard["shift"]) moveVector.sub(new THREE.Vector3(0, 1, 0));

    // Normalize the move vector and apply playerSpeed
    moveVector.normalize().multiplyScalar(playerSpeed);

    // Update player position
    this.player.position.add(moveVector);

    // Vertical rotation
    if (this.keyboard["arrowleft"]) {
      this.player.rotation.y += rotationSpeed;
    }
    if (this.keyboard["arrowright"]) {
      this.player.rotation.y -= rotationSpeed;
    }

    if (this.keyboard["r"]) {
      // reset rotation
      this.player.rotation.y = 0;
      this.player.rotation.z = 0;
      this.keyboard["r"] = false;
    }

    // Update the camera position if the player is in first person view
    if (this.app.activeCameraName === "FirstPerson") this.updatePlayerCamera();

    // =============== AI CAR =====================

    if (this.AICar != undefined && this.moveCar) {
      this.moveCar = false;
      this.AICar.moveAICar();
    }

    requestAnimationFrame(() => {
      this.animate();
    });

    // =============== TREE BILLBOARD UPDATE =====================

    if (this.trees)
      this.trees.forEach((tree) => {
        tree.update(this.app.activeCamera.position);
      });
  }

  toggleMoveCar() {
    console.log("toggleMoveCar");
    this.moveCar = !this.moveCar;
  }

  /**
   * Updates the camera position to be relative to the player's position and rotation (first person view)
   */
  updatePlayerCamera() {
    const playerPosition = this.player.position.clone();
    const cameraPosition = this.app.activeCamera.position;

    // Calculate a position relative to the player's rotation
    const relativeCameraOffset = new THREE.Vector3(0, 2, -4); // Adjust the offset as needed
    const cameraOffset = relativeCameraOffset.applyQuaternion(
      this.player.quaternion
    );

    // Set the camera's position to be relative to the player's position
    cameraPosition.copy(playerPosition).add(cameraOffset);

    // Make the camera look at the player's position
    this.app.activeCamera.lookAt(playerPosition);
  }

  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }
}
