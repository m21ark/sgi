import * as THREE from "three";
import { MyFileReader } from "./parser/MyFileReader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyAICar } from "./objs/MyAICar.js";
import { SceneParser } from "./utils/SceneParser.js";
import { MenuController } from "./gui/MenuController.js";
import { MyCar } from "./objs/MyCar.js";
import { Television } from "./objs/Television.js";
import { XMLLoader } from "./utils/XMLLoader.js";
import { MyGarage } from "./objs/MyGarage.js";
import { FirstPersonCamera } from "./utils/FirstPersonCamera.js";

export class MyContents {
  constructor(app) {
    this.app = app;
    this.cameras = [];
    this.lights = [];

    this.lake = null;
    this.showControlPoints = false;
    this.controlPoints = [];
    this.moveCar = false;
    this.showAIKeyPoints = false;
    this.hasGameStarted = false;

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

    this.numLaps = 1;
    this.app.MyHUD.setPauseStatus(true);
    this.app.MyHUD.setLaps(1, this.numLaps);
    this.app.MyHUD.setPosition(1, 2);

    // ============== TV =================

    /*  this.tv = new Television(
      this.app.scene,
      this.app.cameras["FirstPerson"],
      this.app.renderer
    ); */

    // ============== FIRST PERSON CAMS ====================

    this.debugCam = new FirstPersonCamera(this.app);
    this.debugCam.defineSelfObj(null, [200, 5, 20]);

    // =============== MENU CONTROLLER =====================

    this.menuController = new MenuController(this.app);
    this.menuController.gotoMenu("main");

    // add an ESC listener to go to pause menu
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.pauseGame();
    });

    // TODO: TEMPORARY FOR MARCO TESTING
    // this.loadTrack(1);

    // Start the animation loop
    this.animate();
  }

  pauseGame() {
    // Only pause if the player is in game and not already paused
    if (this.app.activeCameraName !== "FirstPerson") return;
    if (this.app.MyHUD.isPaused()) return;

    this.app.audio.pauseSound("bgMusic");
    this.app.MyHUD.setPauseStatus(true);
    this.AICar.stopAnimation();
    this.menuController.gotoMenu("pause");
  }

  unpauseGame() {
    if (this.app.activeCameraName !== "FirstPerson") return;
    if (!this.app.MyHUD.isPaused()) return;

    this.app.audio.playSound("bgMusic");
    this.app.MyHUD.setPauseStatus(false);
    this.AICar.resumeAnimation();
  }

  removePreviousInstances() {
    if (this.sceneGroup) this.app.scene.remove(this.sceneGroup);
    if (this.AICar) this.AICar.aiCar.parent.remove(this.AICar.aiCar);
    if (this.playerCam)
      this.playerCam.getPlayer().parent.remove(this.playerCam.getPlayer());
    if (this.endLine) this.app.scene.remove(this.endLine);
    MyGarage.objectModel = new THREE.Group();
  }

  resetGame() {
    this.hasGameStarted = false;
    this.gameHasEnded = false;
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

    // Lake set
    this.lake = this.sceneParser.getLake();

    // AI car set
    this.AICar = new MyAICar(this.sceneParser.getKeyPath());
    this.AICar.addAICar(this.app.scene);

    const startPoint = this.sceneParser.getKeyPath()[0];

    this.lap = 1;

    // Player car set
    this.playerCam = new FirstPersonCamera(this.app);
    this.playerCam.defineSelfObj(new MyCar(), [
      startPoint.x,
      startPoint.y,
      startPoint.z,
    ]);
  }

  loadXMLScene(data) {
    this.XMLLoader = new XMLLoader(this);
    this.app = this.XMLLoader.loadXMLScene(data);
  }

  checkCollision(carBB, hitabbleObjs) {
    // check collision with checkpoints
    if (this.sceneParser.checkpoints != undefined) {
      if (carBB.intersectsBox(this.sceneParser.checkpoints[0].bbox)) {
        if (this.sceneParser.checkpoints[0].name == "sector1") {
          this.lap++;
          if (this.lap <= this.numLaps) {
            this.app.MyHUD.setLaps(this.lap, this.numLaps);
            this.app.audio.playSound("go");
          } else this.podium(true);
        }
        // swap checkpoints 0 and 1
        let temp = this.sceneParser.checkpoints[0];
        this.sceneParser.checkpoints[0] = this.sceneParser.checkpoints[1];
        this.sceneParser.checkpoints[1] = temp;
      }
    }

    for (const hitabble of hitabbleObjs) {
      if (carBB.intersectsBox(hitabble.bbox)) {
        hitabble.effectPlayer(this.playerCam.getPlayer());
        if (hitabble.type == "powerup") {
          if (this.hasGameStarted) this.app.audio.playSound("powerup");
        } else {
          if (this.hasGameStarted) this.app.audio.playSound("obstacle");
        }
        return true;
      }
    }

    // Check collision with ai car
    if (carBB.intersectsBox(this.AICar.aiBB)) {
      if (this.hasGameStarted) this.app.audio.playSound("obstacle");
      this.playerCam.getPlayer().collideCar();
      return true;
    }

    if (this.sceneParser.trackPoints == undefined) return false;
    for (var i = 0; i < this.sceneParser.trackPoints.length; i++) {
      let curvePoint = this.sceneParser.trackPoints[i];
      let objectPoint = carBB.position; // Use the center of the bounding box instead of the bounding box itself

      // Calculate the distance between the two points
      var distance = curvePoint.distanceTo(objectPoint);
      if (distance < (this.sceneParser.TRACK_SIZE + 3) / 2) {
        return false;
      }
    }
    this.playerCam.getPlayer().friction();
    return true; // collision with grass
  }

  checkIfLost() {
    if (this.AICar.getFinalTime() < this.app.MyHUD.getTime())
      this.podium(false);
  }

  podium(won) {
    this.endGame(won);

    // Stop the game
    this.hasGameStarted = false;
    this.gameHasEnded = true;
    this.app.audio.pauseSound("bgMusic");
    this.app.audio.playSound(won ? "won" : "lost");
    this.app.MyHUD.setPauseStatus(true);
    this.AICar.stopAnimation();

    const myTime = this.app.MyHUD.getTime();
    const aiTime = this.AICar.getFinalTime();
    const powerCnt = this.playerCam.getPlayer().getPowerUpsCount();
    const obstacleCnt = this.playerCam.getPlayer().getObstaclesCount();
    const difficulty = this.menuController.getDifficulty();
    this.menuController.updateEndMenu(
      won,
      myTime,
      aiTime,
      powerCnt,
      obstacleCnt,
      difficulty
    );

    // wait 3s before showing the end menu
    setTimeout(() => {
      this.menuController.gotoMenu("end");
    }, 3000);
  }

  update() {
    // UPDATE CAMERAS
    if (this.app.activeCameraName === "FirstPerson") this.playerCam.update();
    if (this.app.activeCameraName === "Debug") this.debugCam.update();
    if (this.app.activeCameraName === "EndCamera")
      this.menuController.podium.updateFireworks();

    if (this.gameHasEnded) return;

    if (this.AICar) {
      this.AICar.update();
      this.checkIfLost();
    }

    // TODO: this gives a ton of warnings
    // this.tv.updateRenderTarget(this.app.activeCamera);

    if (this.sceneParser != undefined) {
      SceneParser.BoxesShaders.uniforms.time.value += 0.05;
      SceneParser.BlockShaders.uniforms.time.value += 0.05;
      SceneParser.BlockShader2.uniforms.time.value += 0.05;
    }

    MyGarage.update();

    if (
      this.playerCam != undefined &&
      this.playerCam.getPlayer() != null &&
      this.playerCam.getPlayer().carBB != null &&
      this.hitabbleObjs != null
    ) {
      let player = this.playerCam.getPlayer();
      player.carBB.position = player.position.clone();
      player.carBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0])) // TODO: NOT 0 now
        .applyMatrix4(player.matrixWorld);
      this.AICar.aiBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0]))
        .applyMatrix4(this.AICar.aiCar.matrixWorld);
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
    switch (difficulty) {
      case 1:
        return 0.55;
      case 2:
        return 0.48;
      case 3:
        return 0.46;
      default:
        return 1;
    }
  }

  async endGame(won) {
    const endSMS = document.createElement("div");
    endSMS.id = "CountDown";
    endSMS.innerText = won ? "You won!" : "You lost!";
    endSMS.style.fontSize = "80px";
    document.body.appendChild(endSMS);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    document.body.removeChild(endSMS);
  }

  async startCountdown() {
    this.app.MyHUD.setVisible(false);
    let duration = 6;
    const countdownElement = document.createElement("div");
    countdownElement.id = "CountDown";
    countdownElement.innerText = "Prepare!";
    document.body.appendChild(countdownElement);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const countdownInterval = setInterval(() => {
      duration--;
      if (duration > 0) countdownElement.innerText = duration;
      else {
        clearInterval(countdownInterval);
        this.app.audio.playSound("go");
        countdownElement.innerText = "GO!";
        countdownElement.style.fontSize = "180px";
        setTimeout(() => {
          this.startGame();
          document.body.removeChild(countdownElement);
        }, 1000);
      }
      if (duration == 5) this.app.audio.playSound("countdown");
    }, 1000);
  }

  startGame() {
    this.gameHasEnded = false;
    this.hasGameStarted = true;
    this.app.MyHUD.setVisible(true);
    this.app.MyHUD.setPauseStatus(false);
    this.moveCar = true;
    this.app.audio.playSound("bgMusic");
  }

  animate() {
    // if the game has started and is not paused update the following objects
    if (!this.app.MyHUD.isPaused()) {
      // HUD UPDATE
      if (this.playerCam) {
        this.app.MyHUD.setCords(...this.playerCam.getPlayer().position);
        const player = this.playerCam.getPlayer();
        const maxVel = player.getMaxVel();

        const speed = player.getSpeed();
        const translatedSpeed = (speed / maxVel) * (200 * player.velMultiplyer);

        this.app.MyHUD.setSpeed(
          Math.abs(translatedSpeed),
          200 * player.velMultiplyer
        );
        this.app.MyHUD.tickTime();
      }

      // AI CAR UPDATE
      if (this.AICar != undefined && this.moveCar) {
        this.moveCar = false;
        this.AICar.moveAICar(
          this.mapDificultyToSpeed(this.menuController.getDifficulty())
        );
      }

      // WATER UPDATE
      // if (this.lake) this.lake.update(); // TODO: temporary disabled

      // TREE UPDATE
      if (this.trees)
        this.trees.forEach((tree) => {
          tree.update(this.app.activeCamera.position);
        });
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  // =============== GUI TOGGLES =====================

  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }

  toogleShowControlPoints() {
    let controlPoints = this.sceneParser.getControlPoints().children;

    // display or hide keypoints
    controlPoints.forEach((point) => {
      point.visible = this.showControlPoints;
    });
  }

  toggleCountDown() {
    this.startCountdown();
  }
}
