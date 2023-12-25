import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyContents } from "./MyContents.js";
import Stats from "three/addons/libs/stats.module.js";
import { MyHUD, MyDebugHUD } from "./gui/MyHUD.js";
import { MyAudioController } from "./audio/MyAudioController.js";

class MyApp {
  /**
   * the constructor
   */
  constructor() {
    this.scene = null;
    this.stats = null;
    this.MyHUD = null;
    this.MyDebugHUD = null;

    // camera related attributes
    this.activeCamera = null;
    this.activeCameraName = null;
    this.lastCameraName = null;
    this.cameras = [];
    this.frustumSize = 52;

    // other attribute
    this.renderer = null;
    this.controls = null;
    this.gui = null;
    this.axis = null;
    this.contents = null;
  }

  /**
   * initializes the application
   */
  init() {
    // Create an empty scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc0c0c0);

    this.stats = new Stats();
    this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.MyHUD = new MyHUD();
    document.body.appendChild(this.MyHUD.getDom());
    this.MyDebugHUD = new MyDebugHUD();
    document.body.appendChild(this.MyDebugHUD.getDom());

    this.initCameras();
    this.setActiveCamera("Perspective");
    this.initAudio(); // requires FirstPerson Camera

    // Create a renderer with Antialiasing
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor("#000000");
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Configure renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Append Renderer to DOM
    document.getElementById("canvas").appendChild(this.renderer.domElement);

    // manage window resizes
    window.addEventListener("resize", this.onResize.bind(this), false);
  }

  /**
   * initializes all the cameras
   */
  initCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    const perspective = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    perspective.position.set(18, 6, 0);
    this.cameras["Perspective"] = perspective;

    const person1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    person1.position.set(18, 8, 0);
    person1.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["FirstPerson"] = person1;

    this.cameras["Debug"] = this.cameras["FirstPerson"].clone();

    // defines the frustum size for the orthographic cameras
    const frust = this.frustumSize / 2;
    const left = -frust * aspect;
    const right = frust * aspect;
    const top = frust;
    const bottom = -frust;
    const near = -frust;
    const far = frust;

    // create a front view orthographic camera
    const orthoRight = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    orthoRight.zoom = 1;
    orthoRight.up = new THREE.Vector3(0, 1, 0);
    orthoRight.position.set(0, 0, -frust / 2);
    orthoRight.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["MenuCamera"] = orthoRight;

    // create a garage camera PerspectiveCamera view without controls
    const garage = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    garage.position.set(130, 6, 120);
    garage.lookAt(new THREE.Vector3(120, 6, 120));
    this.cameras["Garage"] = garage;

    const frust2 = 220;
    const leftTop = -frust2 * aspect;
    const rightTop = frust2 * aspect;
    const topTop = frust2;
    const bottomTop = -frust2;
    const nearTop = -frust2;
    const farTop = frust2;

    // add othographic camera on top of scene
    const orthoTop = new THREE.OrthographicCamera(
      leftTop,
      rightTop,
      topTop,
      bottomTop,
      nearTop,
      farTop
    );
    orthoTop.zoom = 1;
    orthoTop.up = new THREE.Vector3(0, 0, -1);
    orthoTop.position.set(125, frust2 / 2, 125);
    orthoTop.lookAt(new THREE.Vector3(125, 0, 125));
    this.cameras["TopCamera"] = orthoTop;
  }

  /**
   * sets the active camera by name
   * @param {String} cameraName
   */
  setActiveCamera(cameraName) {
    this.activeCameraName = cameraName;
    this.activeCamera = this.cameras[this.activeCameraName];
  }

  /**
   * updates the active camera if required
   * this function is called in the render loop
   * when the active camera name changes
   * it updates the active camera and the controls
   */
  updateCameraIfRequired() {
    // camera changed?
    if (this.lastCameraName !== this.activeCameraName) {
      this.lastCameraName = this.activeCameraName;
      this.activeCamera = this.cameras[this.activeCameraName];

      // call on resize to update the camera aspect ratio
      // among other things
      this.onResize();

      if (
        this.activeCameraName === "FirstPerson" ||
        this.activeCameraName === "Debug" ||
        this.activeCameraName === "MenuCamera" ||
        this.activeCameraName === "Garage" ||
        this.activeCameraName === "EndCamera" ||
        this.activeCameraName === "TopCamera"
      ) {
        // skip controls for these cameras
        return;
      } else {
        this.controls = new OrbitControls(
          this.activeCamera,
          this.renderer.domElement
        );
      }

      this.controls.enableZoom = true;
      this.controls.update();
    }
  }

  /**
   * the window resize handler
   */
  onResize() {
    if (this.activeCamera !== undefined && this.activeCamera !== null) {
      this.activeCamera.aspect = window.innerWidth / window.innerHeight;
      this.activeCamera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  /**
   *
   * @param {MyContents} contents the contents object
   */
  setContents(contents) {
    this.contents = contents;
  }

  /**
   * @param {MyGuiInterface} contents the gui interface object
   */
  setGui(gui) {
    this.gui = gui;
  }

  setHUD(hud) {
    this.MyHUD = hud;
  }

  /**
   * the main render function. Called in a requestAnimationFrame loop
   */
  render() {
    this.stats.begin();
    this.updateCameraIfRequired();

    // update the animation if contents were provided
    if (this.activeCamera !== undefined && this.activeCamera !== null) {
      this.contents.update();
    }

    // required if controls.enableDamping or controls.autoRotate are set to true
    if (this.controls) this.controls.update();

    // render the scene
    this.renderer.render(this.scene, this.activeCamera);

    // subsequent async calls to the render loop
    requestAnimationFrame(this.render.bind(this));

    this.lastCameraName = this.activeCameraName;

    this.stats.end();
  }

  initAudio() {
    this.audio = new MyAudioController(this.cameras["FirstPerson"]);
    this.audio.addSound("countdown");
    this.audio.addSound("go");
    this.audio.addSound("garage");
    this.audio.addSound("won");
    this.audio.addSound("lost");
    this.audio.addSound("menuHover");
    this.audio.addSound("menuSelect");
    this.audio.addSound("obstacle");
    this.audio.addSound("powerup");
    this.audio.addSound("engine", false, 0.25);

    this.audio.addSound("yoshi", false, 0.7);
    this.audio.addSound("mario");
    this.audio.addSound("peach");

    this.audio.addSound("firework", false, 1);
    this.audio.addSound("bgMusic", true, 0.15);
    // this.audio.addSound("menuMusic", true, 0.8);
  }
}

export { MyApp };
