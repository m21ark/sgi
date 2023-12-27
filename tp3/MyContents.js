import * as THREE from "three";
import { MyFileReader } from "./parser/MyFileReader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyAICar } from "./objs/MyAICar.js";
import { MyReader } from "./utils/MyReader.js";
import { MenuController } from "./gui/MenuController.js";
import { MyCar } from "./objs/MyCar.js";
import { MyTV } from "./objs/MyTV.js";
import { XMLLoader } from "./utils/XMLLoader.js";
import { MyGarage } from "./objs/MyGarage.js";
import { FirstPersonCamera } from "./utils/FirstPersonCamera.js";
import { MySmoke } from "./objs/MySmoke.js";
import { MyOutdoor } from "./objs/MyOutdoor.js";

/**
 * Represents the contents of the application.
 * @class
 */
export class MyContents {
  /**
   * Represents a constructor for the MyContents class.
   * @param {App} app - The application object.
   */
  constructor(app) {
    this.app = app;
    this.cameras = [];
    this.lights = [];

    this.lake = null;
    this.showControlPoints = false;
    this.showCheckPoints = false;
    this.showTv = false;
    this.controlPoints = [];
    this.moveCar = false;
    this.showHitboxes = false;
    this.showAIKeyPoints = false;
    this.hasGameStarted = false;
    this.numLaps = 3;

    // DEBUG FLIGHT CAMERA
    this.debugCam = new FirstPersonCamera(this.app);
    this.debugCam.defineSelfObj(null, [180, 10, 20]);

    // Car smoke particles
    this.smokes = new MySmoke(this.app);

    // XML LOADER
    this.reader = new MyFileReader(app, this, this.loadXMLScene);
    this.sceneDir = "scene/";
    this.reader.open(this.sceneDir + "myScene.xml");
  }

  /**
   * Initializes the application.
   * @returns {Promise<void>}
   */
  async init() {
    this.app.MyHUD.setPauseStatus(true);
    this.app.MyHUD.setLaps(1, this.numLaps);
    this.menuController = new MenuController(this.app);
    this.menuController.gotoMenu("main");

    // add an ESC listener to go to pause menu
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.pauseGame();
    });

    // ============== TV =================

    this.tv = new MyTV(
      this.app.scene,
      this.app.cameras["FirstPerson"],
      this.app.renderer
    );

    // ============== OUTDOOR =================

    this.outdoor = new MyOutdoor(this.app);
    this.outdoor.position.set(5, 3, 25);
    this.outdoor.rotateY(Math.PI / 2);
    this.outdoor.scale.set(0.5, 0.5, 0.5);
    this.app.scene.add(this.outdoor);

    this.animate();
  }

  /**
   * Pauses the game if the player is in game and not already paused.
   */
  pauseGame() {
    // Only pause if the player is in game and not already paused
    if (this.app.activeCameraName !== "FirstPerson") return;
    if (this.app.MyHUD.isPaused()) return;

    this.app.audio.pauseSound("bgMusic");
    this.app.MyHUD.setPauseStatus(true);
    this.AICar.stopAnimation();
    this.menuController.gotoMenu("pause");
  }

  /**
   * Resumes the game if it is paused.
   */
  unpauseGame() {
    if (this.app.activeCameraName !== "FirstPerson") return;
    if (!this.app.MyHUD.isPaused()) return;

    this.app.audio.playSound("bgMusic");
    this.app.MyHUD.setPauseStatus(false);
    this.AICar.resumeAnimation();
  }

  /**
   * Removes previous instances from the scene.
   */
  removePreviousInstances() {
    if (this.sceneGroup) this.app.scene.remove(this.sceneGroup);
    if (this.AICar && this.AICar.aiCar)
      this.AICar.aiCar.parent.remove(this.AICar.aiCar);
    if (this.playerCam)
      this.playerCam.getPlayer().parent.remove(this.playerCam.getPlayer());
    if (this.endLine) this.app.scene.remove(this.endLine);
    MyGarage.objectModel = new THREE.Group();
  }

  /**
   * Resets the game by setting the 'hasGameStarted' and 'gameHasEnded' properties to false.
   */
  resetGame() {
    this.hasGameStarted = false;
    this.gameHasEnded = false;
  }

  /**
   * Loads a track based on the given map number.
   * Removes previous instances from the scene and sets up the track, obstacles, lake, AI car, and player car.
   * @param {number} mapNum - The map number to load.
   * @returns {Promise<void>} - A promise that resolves once the track is loaded.
   */
  async loadTrack(mapNum) {
    // Remove previous instances from the scene
    this.removePreviousInstances();

    this.toAddObstacles = [];

    // Track set
    this.myReader = new MyReader();
    this.sceneGroup = await this.myReader.buildGridGroup(mapNum);
    this.app.scene.add(this.sceneGroup);
    this.trees = this.myReader.getTrees();
    this.hitabbleObjs = this.myReader.getHitabbleObjs();

    // Lake set
    this.lake = this.myReader.getLake();

    // AI car set
    this.AICar = new MyAICar(this.myReader.getKeyPath());

    const startPoint = this.myReader.getKeyPath()[0];

    this.lap = 1;

    // Player car set
    this.playerCam = new FirstPersonCamera(this.app);
    this.playerCam.defineSelfObj(new MyCar(), [
      startPoint.x,
      startPoint.y,
      startPoint.z,
    ]);
  }

  /**
   * Loads an XML scene.
   * @param {string} data - The XML data representing the scene.
   */
  loadXMLScene(data) {
    this.XMLLoader = new XMLLoader(this);
    this.app = this.XMLLoader.loadXMLScene(data);
  }

  /**
   * Looks for collisions between the player's car and the hitabble objects.
   */
  lookForCollisions() {
    if (
      this.playerCam &&
      this.playerCam.getPlayer() &&
      this.playerCam.getPlayer().carBB &&
      this.hitabbleObjs
    ) {
      let player = this.playerCam.getPlayer();
      player.carBB.position = player.position.clone();
      player.carBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0]))
        .applyMatrix4(player.matrixWorld);
      if (this.AICar.aiBB == undefined) return;
      this.AICar.aiBB
        .copy(new THREE.Box3().setFromObject(MyCar.availableCars.children[0]))
        .applyMatrix4(this.AICar.aiCar.matrixWorld);
      this.checkCollision(player.carBB, this.hitabbleObjs);
    }
  }

  /**
   * Checks for collision between the car and other objects.
   * @param {Object3D} carBB - The bounding box of the car.
   * @param {Array<Object3D>} hitabbleObjs - An array of hitabble objects.
   * @returns {boolean} - True if there is a collision, false otherwise.
   */
  checkCollision(carBB, hitabbleObjs) {
    // check collision with checkpoints
    if (this.myReader.checkpoints != undefined) {
      if (carBB.intersectsBox(this.myReader.checkpoints[0].bbox)) {
        if (this.myReader.checkpoints[0].name == "sector1") {
          this.lap++;
          if (this.lap <= this.numLaps) {
            this.app.MyHUD.setLaps(this.lap, this.numLaps);
            this.app.audio.playSound("go");
          } else this.podium(true);
        }
        // swap checkpoints 0 and 1
        let temp = this.myReader.checkpoints[0];
        this.myReader.checkpoints[0] = this.myReader.checkpoints[1];
        this.myReader.checkpoints[1] = temp;
      }
    }

    for (const hitabble of hitabbleObjs) {
      if (carBB.intersectsBox(hitabble.bbox)) {
        // if the player has already collided with this object in the last 2 seconds, ignore it
        if (!hitabble.hadNewCollision()) continue;
        if (
          this.playerCam.getPlayer().invulnerable &&
          hitabble.type != "powerup"
        )
          continue;

        // give the player the effect of the hitabble object
        hitabble.effectPlayer(this.playerCam.getPlayer());

        // Play sounds
        if (this.hasGameStarted) {
          if (hitabble.type == "powerup") {
            this.app.contents.myReader.addNextObstacleToGroup();
            if (hitabble.invulnerable)
              this.gameImpact("Invulnerable!", hitabble.timeEffect);
            else this.gameImpact("Speed Boost!", hitabble.timeEffect);

            this.app.audio.playSound("powerup");
          } else {
            if (hitabble.switchedControls)
              this.gameImpact("Switched!", hitabble.timeEffect);
            else this.gameImpact("Obstacle!", hitabble.timeEffect);
            this.app.audio.playSound("obstacle");
          }
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

    if (this.myReader.trackPoints == undefined) return false;
    for (var i = 0; i < this.myReader.trackPoints.length; i++) {
      let curvePoint = this.myReader.trackPoints[i];
      let objectPoint = carBB.position; // Use the center of the bounding box instead of the bounding box itself

      // Calculate the distance between the two points
      var distance = curvePoint.distanceTo(objectPoint);
      if (distance < (this.myReader.TRACK_SIZE + 3) / 2) {
        return false;
      }
    }

    // collision with grass
    if (!this.playerCam.getPlayer().invulnerable) {
      this.playerCam.getPlayer().frictionGrass();
      return true;
    }
    return false;
  }

  /**
   * Checks if the AI car has lost the race based on its final time compared to the current time on the HUD.
   * If the AI car has lost, it triggers the podium function with a false parameter.
   */
  checkIfLost() {
    if (this.AICar.getFinalTime() < this.app.MyHUD.getTime())
      this.podium(false);
  }

  /**
   * Handles the podium logic after the game ends.
   * @param {boolean} won - Indicates whether the player won the game or not.
   */
  podium(won) {
    this.endGame(won);

    // Stop the game
    this.hasGameStarted = false;
    this.gameHasEnded = true;
    this.app.audio.pauseSound("bgMusic");
    this.app.audio.playSound(won ? "won" : "lost");
    this.app.MyHUD.setPauseStatus(true);
    this.AICar.stopAnimation();
    this.playerCam.getPlayer().currVel = 0.1;

    const myTime = this.app.MyHUD.getTime();
    const aiTime = this.AICar.getFinalTime();
    const difficulty = this.menuController.getDifficulty();
    this.menuController.updateEndMenu(won, myTime, aiTime, difficulty);

    this.app.MyHUD.resetTime();
    this.app.MyHUD.resetSpeed();
    this.app.MyHUD.setLaps(1, this.numLaps);

    // wait 3s before showing the end menu
    setTimeout(() => {
      this.menuController.gotoMenu("end");
    }, 3000);
  }

  /**
   * Sets the active camera for the application.
   *
   * @param {string} cameraId - The ID of the camera to set as active.
   */
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

  /**
   * Maps the difficulty level to a corresponding speed value.
   * @param {number} difficulty - The difficulty level.
   * @returns {number} The speed value mapped to the given difficulty level.
   */
  mapDificultyToSpeed(difficulty) {
    switch (difficulty) {
      case 1:
        return 0.52;
      case 2:
        return 0.5;
      case 3:
        return 0.48;
      default:
        return 1;
    }
  }

  /**
   * Ends the game and displays a message indicating whether the player won or lost.
   * @param {boolean} won - Indicates whether the player won the game.
   * @returns {Promise<void>} - A promise that resolves after a delay of 3 seconds.
   */
  async endGame(won) {
    const endSMS = document.createElement("div");
    endSMS.id = "CountDown";
    endSMS.innerText = won ? "You won!" : "You lost!";
    endSMS.style.fontSize = "80px";
    document.body.appendChild(endSMS);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    document.body.removeChild(endSMS);
  }

  /**
   * Displays a game impact message on the screen for a specified duration.
   * @param {string} message - The message to be displayed.
   * @param {number} [duration=3] - The duration in seconds for which the message should be displayed.
   * @returns {void}
   */
  async gameImpact(message, duration = 3) {
    const impactElement = document.createElement("div");
    impactElement.id = "powerContainer";
    impactElement.innerText = message;
    document.body.appendChild(impactElement);
    new Promise((resolve) => setTimeout(resolve, 3000));

    const impactInterval = setInterval(() => {
      duration -= 0.2;
      if (duration > 0) impactElement.innerText = duration.toFixed(1);
      else if (duration <= 0) {
        clearInterval(impactInterval);
        document.body.removeChild(impactElement);
      }
    }, 200);
  }

  /**
   * Starts the countdown for the game.
   * @returns {Promise<void>} A promise that resolves when the countdown is finished.
   */
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

  /**
   * Starts the game.
   */
  startGame() {
    this.gameHasEnded = false;
    this.hasGameStarted = true;
    this.app.MyHUD.setVisible(true);
    this.app.MyHUD.setPauseStatus(false);
    this.moveCar = true;
    this.app.audio.playSound("bgMusic");
  }

  // =============== UPDATES =====================

  /**
   * Updates the game state.
   */
  update() {
    // UPDATE CAMERAS
    if (this.app.activeCameraName === "FirstPerson") this.playerCam.update();
    if (this.app.activeCameraName === "Debug") {
      this.debugCam.update();
      this.app.MyDebugHUD.setVisible(true);
      this.app.MyDebugHUD.setCords(...this.debugCam.player.position);
    } else this.app.MyDebugHUD.setVisible(false);

    // UPDATE FIREWORKS
    if (this.app.activeCameraName === "EndCamera")
      this.menuController.podium.updateFireworks();

    if (this.gameHasEnded) return;

    // SMOKE UPDATE
    if (this.playerCam)
      if (this.playerCam.getPlayer().currVel < 0.2) this.smokes.update();

    // UPDATE AI CAR
    if (this.AICar) {
      this.AICar.update();
      this.checkIfLost();
    }

    // UPDATE OUTDOOR
    if (this.hasGameStarted)
      this.outdoor.update(this.app.MyHUD.getTime(), this.lap);

    // UPDATE SHADERS FOR POWERUPS AND OBSTACLES PULSATION
    if (this.myReader != undefined) {
      MyReader.BoxesShaders.uniforms.time.value += 0.05;
      MyReader.BlockShaders.uniforms.time.value += 0.05;
      MyReader.BlockShaders2.uniforms.time.value += 0.05;
    }

    if (this.showTv) this.tv.updateRenderTarget();

    // UPDATE GARAGE ANIMATION
    MyGarage.update();

    // UPDATE COLLISIONS
    this.lookForCollisions();
  }

  /**
   * Animates the game by updating various objects if the game is not paused.
   */
  animate() {
    // if the game has started and is not paused update the following objects
    if (!this.app.MyHUD.isPaused()) {
      // HUD UPDATE
      if (this.playerCam) {
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
          this.mapDificultyToSpeed(this.menuController.getDifficulty()),
          this.numLaps
        );
      }

      // WATER UPDATE
      if (this.lake) this.lake.update();

      // TREE UPDATE
      if (this.trees)
        this.trees.forEach((tree) => {
          tree.update(this.app.activeCamera.position);
        });
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  // =============== GUI TOGGLES =====================

  /**
   * Toggles the visibility of AI keypoints.
   */
  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }

  /**
   * Toggles the visibility of control points.
   */
  toogleShowControlPoints() {
    let controlPoints = this.myReader.getControlPoints().children;

    // display or hide keypoints
    controlPoints.forEach((point) => {
      point.visible = this.showControlPoints;
    });
  }

  /**
   * Triggers the countdown by calling the startCountdown method.
   */
  triggerCountDown() {
    this.startCountdown();
  }

  /**
   * Triggers the podium.
   */
  triggerPodium() {
    this.podium(true);
  }

  /**
   * Toggles the visibility of checkpoints.
   */
  toogleCheckpointVisibility() {
    if (this.myReader.checkpoints != undefined) {
      this.myReader.checkpoints.forEach((checkpoint) => {
        checkpoint.material.visible = this.showCheckPoints;
      });
    }
  }

  /**
   * Toggles the visibility of the TV group.
   */
  toogleShowTV() {
    this.tv.group.visible = this.showTv;
  }

  /**
   * Toggles the visibility of hitboxes for obstacles, powerups, AI car, and player car.
   */
  toogleSHowHitboxes() {
    // Hitboxes for obstacles and powerups
    this.hitabbleObjs.forEach((obj) => {
      if (this.showHitboxes) {
        obj.bboxMesh = new THREE.Box3Helper(obj.bbox, 0x00ff00);
        this.app.scene.add(obj.bboxMesh);
      } else this.app.scene.remove(obj.bboxMesh);
    });

    // Hitbox for  AI car and player
    if (this.showHitboxes) {
      this.AICar.aiBBMesh = new THREE.Box3Helper(this.AICar.aiBB, 0x00ff00);
      this.app.scene.add(this.AICar.aiBBMesh);
      this.playerCam.getPlayer().carBBMesh = new THREE.Box3Helper(
        this.playerCam.getPlayer().carBB,
        0x00ff00
      );
      this.app.scene.add(this.playerCam.getPlayer().carBBMesh);
    } else {
      this.app.scene.remove(this.AICar.aiBBMesh);
      this.app.scene.remove(this.playerCam.getPlayer().carBBMesh);
    }
  }
}
