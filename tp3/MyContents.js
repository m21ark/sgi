import * as THREE from "three";
import { MyFileReader } from "./parser/MyFileReader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyAICar } from "./objs/MyAICar.js";
import { SceneParser } from "./utils/SceneParser.js";
import { MenuController } from "./gui/MenuController.js";
import { MyCar } from "./objs/MyCar.js";
import { Television } from "./objs/Television.js";
import { XMLLoader } from "./utils/XMLLoader.js";
import { Garage } from "./objs/Garage.js";
import { FirstPersonCamera } from "./utils/FirstPersonCamera.js";
import { MyFireworks } from "./objs/MyFirework.js";

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
    this.cameras = [];
    this.lights = [];

    this.showControlPoints = false;
    this.controlPoints = [];
    this.moveCar = false;
    this.showAIKeyPoints = false;
    this.showFireworks = false;

    // XML LOADER
    this.reader = new MyFileReader(app, this, this.loadXMLScene);
    this.sceneDir = "scene/";
    this.reader.open(this.sceneDir + "myScene.xml");
  }

  /**
   * Initializes the component.
   * Creates and attaches the axis to the scene if it doesn't exist.
   */
  async init() {
    // ============== HUD =================

    // Temporary
    this.app.MyHUD.setStatus("PLAY");
    this.app.MyHUD.setLaps(2, 5);
    this.app.MyHUD.setPosition(1, 5);

    // ============== TV =================

    this.tv = new Television(
      this.app.scene,
      this.app.cameras["FirstPerson"],
      this.app.renderer
    );

    // ============== TRACK LOAD =================


    // ============== FIRST PERSON CAMS ====================

    this.debugCam = new FirstPersonCamera(this.app);
    this.debugCam.defineSelfObj();

    // =============== MENU CONTROLLER =====================

    this.menuController = new MenuController(this.app);
    this.menuController.gotoMenu("main");

    // Start the animation loop
    this.animate();
  }

  removePreviousInstances() {
    if (this.sceneGroup) this.app.scene.remove(this.sceneGroup);
    if (this.AICar) this.AICar.aiCar.parent.remove(this.AICar.aiCar);
    if (this.playerCam) this.playerCam.getPlayer().parent.remove(this.playerCam.getPlayer());
    if (this.endLine) this.app.scene.remove(this.endLine);
    if (this.fireworks) this.fireworks.reset();

    Garage.objectModel = new THREE.Group();
  }

  async loadTrack(mapNum) {
    // Remove previous instances from the scene
    this.removePreviousInstances();

    // Track set
    this.sceneParser = new SceneParser();
    this.sceneGroup = await this.sceneParser.buildGridGroup(mapNum);
    this.app.scene.add(this.sceneGroup);
    this.trees = this.sceneParser.getTrees();
    this.hitabbleObjs = this.sceneParser.getHitabbleObjs();

    // Player car set
    this.playerCam = new FirstPersonCamera(this.app);
    this.playerCam.defineSelfObj(new MyCar());

    // AI car set
    this.AICar = new MyAICar(this.sceneParser.getKeyPath());
    this.AICar.addAICar(this.app.scene);

    // End flag set
    this.placeFlag(this.sceneParser.getKeyPath()[0]);

    // Firework set
    this.fireworks = new MyFireworks(
      this.app,
      this.sceneParser.getKeyPath()[0]
    );
  }

  placeFlag(pos) {
    this.endFlagMat = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/finishFlag.jpg"),
      side: THREE.DoubleSide,
      color: 0xffffff,
    });

    let endLine = new THREE.Group();

    // Poles
    let poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 15, 10, 10);
    let poleMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    let pole1 = new THREE.Mesh(poleGeo, poleMat);
    let pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(0, -3, 0);
    pole2.position.set(10, -3, 0);

    // Flag
    let flagGeo = new THREE.PlaneGeometry(10, 5);
    let flag = new THREE.Mesh(flagGeo, this.endFlagMat);
    flag.position.set(5, 5, 0);

    endLine.add(pole1);
    endLine.add(pole2);
    endLine.add(flag);

    endLine.rotation.y = Math.PI / 2;
    endLine.position.set(pos.x, 11, pos.z + 5);
    endLine.name = "endLine";

    this.app.scene.add(endLine);
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
    
    for (var i = 0; i < this.sceneParser.trackPoints.length; i++) {
      let curvePoint = this.sceneParser.trackPoints[i];
      let objectPoint = carBB.position; // Use the center of the bounding box instead of the bounding box itself
      
      // Calculate the distance between the two points
      var distance = curvePoint.distanceTo(objectPoint);
      if (distance < this.sceneParser.TRACK_SIZE) {
        return false;
      }
    }
    return true; // collision with grass
  }

  update() {
    if (this.AICar != undefined) this.AICar.update();

    Garage.update();

    // TODO: this gives a ton of warnings
    this.tv.updateRenderTarget(this.app.activeCamera);

    if (
      this.playerCam != undefined &&
      this.playerCam.getPlayer() != null &&
      this.playerCam.getPlayer().carBB != null &&
      this.hitabbleObjs != null
      ) {
      let player = this.playerCam.getPlayer();
      player.carBB.position = player.position.clone();
      player.carBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0]))
        .applyMatrix4(player.matrixWorld);

      this.checkCollision(player.carBB, this.hitabbleObjs);
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

  mapDificultyToSpeed(difficulty) {
    console.log("mapDificultyToSpeed", difficulty);
    switch (difficulty) {
      case 1:
        return 0.9;
      case 2:
        return 0.60;
      case 3:
        return 0.55;
      default:
        return 1;
    }
  }

  animate() {
    // =============== HUD =====================

    if (this.playerCam) {
      this.app.MyHUD.setCords(...this.playerCam.getPlayer().position);
      this.app.MyHUD.tickTime();
      this.app.MyHUD.setSpeed(this.playerCam.getPlayer().position.x * 10);
    }

    // =============== AI CAR =====================

    if (this.AICar != undefined && this.moveCar) {
      this.moveCar = false;
      this.AICar.moveAICar(this.mapDificultyToSpeed(this.menuController.getDifficulty()));
    }

    // =============== CAMERAS UPDATE =====================

    if (this.app.activeCameraName === "FirstPerson") this.playerCam.update();
    if (this.app.activeCameraName === "Debug") this.debugCam.update();

    // =============== TREE BILLBOARD UPDATE =====================

    if (this.trees)
      this.trees.forEach((tree) => {
        tree.update(this.app.activeCamera.position);
      });

    // =============== FIREWORKS =====================

    if (this.showFireworks) this.fireworks.update();

    // console.log(this.app.scene.children);

    requestAnimationFrame(() => {
      this.animate();
    });
  }

  // =============== GUI TOGGLES =====================

  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }

  toggleFireWorks() {
    // inversion of boolean happens on GUI Interface
    if (!this.showFireworks) this.fireworks.reset();
  }
}
