import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFirework } from "./MyFirework.js";
/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.axis = null;
    this.fireworks = [];
  }

  /**
   * initializes the contents
   */
  init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 500, 0);
    pointLight.position.set(0, 20, 0);
    pointLight.castShadow = true;
    pointLight.receiveShadow = true;

    this.app.scene.add(pointLight);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);

    // Create a Plane Mesh with basic material
    let plane = new THREE.PlaneGeometry(10, 10);
    this.planeMesh = new THREE.Mesh(
      plane,
      new THREE.MeshPhongMaterial({
        color: "#00ffff",
        specular: "#777777",
        emissive: "#000000",
        shininess: 30,
      })
    );
    this.planeMesh.rotation.x = -Math.PI / 2;
    this.planeMesh.position.y = -0;
    this.app.scene.add(this.planeMesh);

    this.app.activeCamera.position.set(5, 17, 17);
    this.app.activeCamera.lookAt(this.app.scene.position);
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   *
   */
  update() {
    // add new fireworks every 80% of the calls
    if (Math.random() < 0.2) {
      this.fireworks.push(new MyFirework(this.app, this));
    }

    // for each fireworks
    for (let i = 0; i < this.fireworks.length; i++) {
      // is firework finished?
      if (this.fireworks[i].done) {
        // remove firework
        this.fireworks.splice(i, 1);

        continue;
      }
      // otherwise upsdate  firework
      this.fireworks[i].update();
    }
  }
}

export { MyContents };
