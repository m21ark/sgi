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

    // ============== TRACK LOAD ====================

    this.sceneParser = new SceneParser();
    this.sceneGroup = await this.sceneParser.buildGridGroup(1);
    this.app.scene.add(this.sceneGroup);
    this.trees = this.sceneParser.getTrees();
    this.hitabbleObjs = this.sceneParser.getHitabbleObjs();

    // ============== FIRST PERSON CAMS ====================

    this.playerCam = new FirstPersonCamera(this.app);
    this.playerCam.defineSelfObj(new MyCar());

    this.debugCam = new FirstPersonCamera(this.app);
    this.debugCam.defineSelfObj();

    // =============== AI CAR =====================

    this.AICar = new MyAICar(this.sceneParser.getKeyPath());
    this.AICar.addAICar(this.app.scene);

    // =============== MENU CONTROLLER =====================

    this.menuController = new MenuController(this.app);
    this.menuController.gotoMenu("end");

    // Start the animation loop
    this.animate();
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

    Garage.update();

    // TODO: this gives a ton of warnings
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

  animate() {
    // =============== HUD =====================

    this.app.MyHUD.setCords(...this.playerCam.getPlayer().position);
    this.app.MyHUD.tickTime();
    this.app.MyHUD.setSpeed(this.playerCam.getPlayer().position.x * 10);

    // =============== AI CAR =====================

    if (this.AICar != undefined && this.moveCar) {
      this.moveCar = false;
      this.AICar.moveAICar();
    }

    // =============== CAMERAS UPDATE =====================

    if (this.app.activeCameraName === "FirstPerson") this.playerCam.update();
    if (this.app.activeCameraName === "Debug") this.debugCam.update();

    // =============== TREE BILLBOARD UPDATE =====================

    if (this.trees)
      this.trees.forEach((tree) => {
        tree.update(this.app.activeCamera.position);
      });

    requestAnimationFrame(() => {
      this.animate();
    });
  }

  // =============== GUI TOGGLES =====================

  toggleMoveCar() {
    console.log("toggleMoveCar");
    this.moveCar = !this.moveCar;
  }

  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }
}
