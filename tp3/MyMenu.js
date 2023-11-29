import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyPicker } from "./MyPicker.js";

export class MyMenu {
  constructor(app, title, x = -100) {
    this.title = title;
    this.buttons = [];
    this.textWriter = new TextSpriteDraw();

    this.x = x;

    // height recommended to be lower <= 50 (because of frustrum size)
    this.width = 70;
    this.height = 50;

    this.btnCount = 0;

    this.app = app;

    this.picker = new MyPicker(this);
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

    // create a menuBackground geometry for the menu
    let geometry = new THREE.PlaneGeometry(this.width, this.height);

    // create a material
    let material = new THREE.MeshBasicMaterial({
      color: 0xaabbcc,
    });

    // create a mesh
    let menuBackground = new THREE.Mesh(geometry, material);

    menuBackground.translateZ(-0.1);

    let fsize = 18;
    let midWidth = this.textWriter.getWidth(this.title, fsize);

    this.textWriter.write(
      menuBackground,
      -midWidth / 20, // Centered in width todo: isto ta mal
      this.height / 2 - 5, // Adjust the vertical position as needed
      0,
      this.title, // Use the title property
      fsize,
      "0xFF0000"
    );

    /*      menuBackground = this.picker.setObjLayers(
      menuBackground,
      "main_menu_background"
    );  */

    // add the mesh to the group
    group.add(menuBackground);
    group.add(this.getButtonOnMenu());

    group.translateX(this.x);
    group.rotateY(Math.PI);

    return group;
  }

  getButtonOnMenu() {
    let group = new THREE.Group();

    const buttonWidth = 0.3 * this.width;
    const verticalSpacing = 0.1 * this.height;
    const btnHeight = 0.1 * this.height;

    let offsetY = this.height / 2 - verticalSpacing - 0.25 * this.height;

    this.buttons.forEach((button) => {
      let geometry = new THREE.PlaneGeometry(buttonWidth, btnHeight);
      let material = new THREE.MeshBasicMaterial({
        color: 0xffbbcc,
      });

      let buttonMesh = new THREE.Mesh(geometry, material);

      buttonMesh.position.set(0, offsetY, -0.1);

      this.textWriter.write(
        group,
        -3,
        offsetY,
        0.2,
        button.text,
        18,
        "0x0000FF"
      );

      buttonMesh = this.picker.setObjLayers(
        buttonMesh,
        "main_menu_btn_" + button.cnt
      );

      group.add(buttonMesh);

      offsetY -= verticalSpacing + btnHeight;
    });

    return group;
  }

  setCamera(app) {
    let cam = app.cameras["MenuCamera"];

    // Set camera position to center of the menu
    cam.position.set(this.x, this.height / 2 - this.height / 2, -1);

    // Set camera's look-at target to the center of the menu
    cam.lookAt(new THREE.Vector3(this.x, this.height / 2 - this.height / 2, 0));

    app.cameras["MenuCamera"] = cam;
    app.setActiveCamera("MenuCamera");
  }

  handleButtonClick(buttonIndex) {
    const button = this.buttons.find((btn) => btn.cnt === buttonIndex);
    if (button && button.onClick) {
      button.onClick();
    }
  }
}
