import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class MyMenu {
  constructor(title, x = 0) {
    this.title = title;
    this.buttons = [];
    this.textWriter = new TextSpriteDraw();

    this.x = x;
    this.y = 0;
    this.z = -1;

    // recommended to be lower <= 50 (because of frustrum size)
    this.width = 50;
    this.height = 50;

    this.btnCount = 0;
  }

  addButton(text, onClick) {
    this.buttons.push({ btnCount, text, onClick });
    btnCount++;
  }

  setTitle(title) {
    this.title = title;
  }

  getMenu() {
    let group = new THREE.Group();

    this.setButtonsOnMenu();

    // create a menuBackground geometry for the menu
    let geometry = new THREE.PlaneGeometry(this.width, this.height);

    // create a material
    let material = new THREE.MeshBasicMaterial({
      color: 0xaabbcc,
    });

    // create a mesh
    let menuBackground = new THREE.Mesh(geometry, material);

    this.textWriter.write(
      menuBackground,
      0,
      0,
      0.1,
      "Main Menu",
      12,
      "0xFF0000"
    );

    // add the mesh to the group
    group.add(menuBackground);

    // apply translation with this.x, this.y and this.z
    group.translateX(this.x);
    group.translateY(this.y);
    group.translateZ(this.z);

    group.rotateY(Math.PI);

    return group;
  }

  setButtonsOnMenu() {
    // Display buttons
    this.buttons.forEach((button) => {
      /* 
      // Add click event listener
      buttonMesh.userData.onClick = button.onClick;
      buttonMesh.on("click", () => {
        if (buttonMesh.userData.onClick) {
          buttonMesh.userData.onClick();
        }
      });

      group.add(buttonMesh); */
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
