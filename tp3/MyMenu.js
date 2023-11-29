import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class MyMenu {
  constructor(title, x = -100) {
    this.title = title;
    this.buttons = [];
    this.textWriter = new TextSpriteDraw();

    this.x = x;

    // height recommended to be lower <= 50 (because of frustrum size)
    this.width = 70;
    this.height = 50;

    this.btnCount = 0;
  }

  addButton(text, onClick) {
    const cnt = this.btnCount;
    this.buttons.push({ cnt, text, onClick });
    this.btnCount++;
  }

  setTitle(title) {
    this.title = title;
  }

  getMenu() {
    let group = new THREE.Group();

    this.setButtonsOnMenu(group);

    // create a menuBackground geometry for the menu
    let geometry = new THREE.PlaneGeometry(this.width, this.height);

    // create a material
    let material = new THREE.MeshBasicMaterial({
      color: 0xaabbcc,
    });

    // create a mesh
    let menuBackground = new THREE.Mesh(geometry, material);

    let fsize = 18;
    let midWidth = this.textWriter.getWidth(this.title, fsize);

    this.textWriter.write(
      menuBackground,
      -midWidth / 20, // Centered in width todo: isto ta mal
      this.height / 2 - 5, // Adjust the vertical position as needed
      0.1,
      this.title, // Use the title property
      fsize,
      "0xFF0000"
    );

    // add the mesh to the group
    group.add(menuBackground);
    this.setButtonsOnMenu(group);

    group.translateX(this.x);
    group.rotateY(Math.PI);

    return group;
  }

  setButtonsOnMenu(group) {
    const buttonWidth = 0.3 * this.width;
    const verticalSpacing = 0.1 * this.height;
    const btnHeight = 0.1 * this.height;

    let offsetY = this.height / 2 - verticalSpacing - 0.25 * this.height;

    this.buttons.forEach((button) => {
      let buttonGeometry = new THREE.PlaneGeometry(buttonWidth, btnHeight);
      let buttonMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      });

      let buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

      buttonMesh.position.set(0, offsetY, 0.1);
      buttonMesh.scale.set(1, 1, 1);

      this.textWriter.write(
        group,
        -3,
        offsetY,
        0.2,
        button.text,
        18,
        "0x0000FF"
      );

      group.add(buttonMesh);

      offsetY -= verticalSpacing + btnHeight;
    });
  }

  setCamera(app) {
    let cam = app.cameras["MenuCamera"];

    // Set camera position to center of the menu
    cam.position.set(this.x, this.height / 2 - this.height / 2, -1);

    // Set camera's look-at target to the center of the menu
    cam.lookAt(new THREE.Vector3(this.x, this.height / 2 - this.height / 2, 0));

    console.log(cam.position);

    app.cameras["MenuCamera"] = cam;
    app.setActiveCamera("MenuCamera");
  }
}
