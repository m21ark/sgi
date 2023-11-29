import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyContents } from "./MyContents.js";
import { MyGuiInterface } from "./MyGuiInterface.js";
import Stats from "three/addons/libs/stats.module.js";
import { MyHUD } from "./MyHUD.js";
import { MyFirstPersonControls } from "./MyFirstPersonControls.js";

class MyApp {
  /**
   * the constructor
   */
  constructor() {
    this.scene = null;
    this.stats = null;
    this.MyHUD = null;

    // camera related attributes
    this.activeCamera = null;
    this.activeCameraName = null;
    this.lastCameraName = null;
    this.cameras = [];
    this.frustumSize = 20;

    // other attributes
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

    this.initCameras();
    this.setActiveCamera("Perspective");

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

    // defines the frustum size for the orthographic cameras
    const left = (-this.frustumSize / 2) * aspect;
    const right = (this.frustumSize / 2) * aspect;
    const top = this.frustumSize / 2;
    const bottom = -this.frustumSize / 2;
    const near = -this.frustumSize / 2;
    const far = this.frustumSize;

    // create a left view orthographic camera
    const orthoBack = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    orthoBack.up = new THREE.Vector3(0, 1, 0);
    orthoBack.position.set(-this.frustumSize / 4, 0, 0);
    orthoBack.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["OrthoBack"] = orthoBack;

    // create a right view orthographic camera
    const orthoFront = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    orthoFront.up = new THREE.Vector3(0, 1, 0);
    orthoFront.position.set(this.frustumSize / 4, 0, 0);
    orthoFront.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["OrthoFront"] = orthoFront;

    // create a back view orthographic camera
    const orthoLeft = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    orthoLeft.up = new THREE.Vector3(0, 1, 0);
    orthoLeft.position.set(0, 0, this.frustumSize / 4);
    orthoLeft.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["OrthoLeft"] = orthoLeft;

    // create a front view orthographic camera
    const orthoRight = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    orthoRight.up = new THREE.Vector3(0, 1, 0);
    orthoRight.position.set(0, 0, -this.frustumSize / 4);
    orthoRight.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameras["OrthoRight"] = orthoRight;
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
      document.getElementById("camera").innerHTML = this.activeCameraName;

      // call on resize to update the camera aspect ratio
      // among other things
      this.onResize();

      // are the controls yet?

      if (this.activeCameraName === "FirstPerson") {
        this.controls = new MyFirstPersonControls(
          this.activeCamera,
          this.renderer.domElement
        );
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
    this.controls.update();

    // render the scene
    this.renderer.render(this.scene, this.activeCamera);

    // subsequent async calls to the render loop
    requestAnimationFrame(this.render.bind(this));

    this.lastCameraName = this.activeCameraName;

    this.stats.end();
  }
}

export { MyApp };
