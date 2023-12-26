import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class MyOutdoor extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;
    this.textWriter = new TextSpriteDraw();
    this.init();
    this.update(0, 0);
  }

  init() {
    this.group = new THREE.Group();
    const loader = new THREE.TextureLoader();

    // Create a plane
    const planeGeometry = new THREE.PlaneGeometry(24, 15);
    const planeMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      map: loader.load("assets/outdoor.jpg"),
      specular: 0xffffff,
      shininess: 100,
      color: 0xdddddd,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = 10;

    // Create the two feet poles
    const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 25, 32);
    const poleMaterial = new THREE.MeshPhongMaterial({
      map: loader.load("scene/textures/metal.jpg"),
      specular: 0xffffff,
      shininess: 100,
      color: 0x777777,
    });
    const pole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole1.position.x = -12;
    pole1.position.y = 5;
    const pole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole2.position.x = 12;
    pole2.position.y = 5;

    this.textWriter.write(
      plane,
      -9,
      6,
      0.5,
      "Welcome to Las Vegas",
      14,
      0x000000
    );

    // Create the text in the plane (initially empty)
    this.textGroup = new THREE.Group();

    this.group.add(plane);
    this.group.add(pole1);
    this.group.add(pole2);
    this.group.add(this.textGroup);

    this.add(this.group);
  }

  update(time, laps) {
    // write new text using the existing TextSpriteDraw instance
    const txtG = new THREE.Group();
    this.textWriter.write(txtG, -7, 12, 0.5, `Time: ${time}s`, 20, 0x000000);
    this.textWriter.write(txtG, -7, 8, 0.5, `Laps: ${laps}/3`, 20, 0x000000);

    // remove the old text and add the new one
    this.group.remove(this.textGroup);
    this.textGroup = txtG;
    this.group.add(this.textGroup);
  }
}
