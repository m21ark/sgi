import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";

export class MyMenu {
  constructor(
    app,
    title,
    x = -100,
    btnPos = "center",
    btnSpacing = 0.8,
    bgImage = null
  ) {
    this.title = title;
    this.buttons = [];
    this.textWriter = new TextSpriteDraw();

    this.x = x;
    this.btnPos = btnPos;
    this.btnSpacing = btnSpacing;
    this.bgImage = bgImage;

    // height recommended to be lower <= 50 (because of frustrum size)
    this.width = 70;
    this.height = 50;

    this.btnCount = 0;
    this.picker = app.picker;
    this.app = app;
  }

  addButton(text, onClick, bgcolor = null, useBg = true, txtColor = null) {
    const cnt = this.btnCount;
    this.buttons.push({
      cnt,
      text,
      onClick,
      color: bgcolor,
      useBg: useBg,
      txtColor: txtColor,
    });
    this.btnCount++;
  }

  updateText(text, buttonIndex) {
    const button = this.buttons.find((btn) => btn.cnt === buttonIndex);
    if (button) button.text = text;
  }

  addText(text, color = "0xffffff") {
    this.addButton(text, () => { }, null, false, color);
  }

  setTitle(title) {
    this.title = title;
  }

  getMenu() {
    let group = new THREE.Group();

    // create a menuBackground geometry for the menu
    let geometry = new THREE.PlaneGeometry(this.width, this.height);

    // create a material
    let backgroundMat = new THREE.MeshBasicMaterial({
      color: 0xBBBBBB,
      map: new THREE.TextureLoader().load(
        this.bgImage ? this.bgImage : "assets/menu.jpg"
      ),
    });

    // create a mesh
    let menuBackground = new THREE.Mesh(geometry, backgroundMat);

    menuBackground.translateZ(-0.1);

    let fsize = 40;
    let midWidth = this.textWriter.getWidth(this.title, fsize);

    this.textWriter.write(
      menuBackground,
      -midWidth / 2 + 2, // Centered in width
      this.height / 2 - 5, // Adjust the vertical position as needed
      0,
      this.title, // Use the title property
      fsize,
      "0xFFFFFF"
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

    const buttonWidth = 0.35 * this.width;
    const verticalSpacing = (this.btnSpacing / 10) * this.height;
    const btnHeight = 0.1 * this.height;

    let offsetY = this.height / 2 - verticalSpacing - 0.25 * this.height;

    this.buttons.forEach((button) => {
      let geometry = new THREE.PlaneGeometry(buttonWidth, btnHeight);
      let material = new THREE.MeshBasicMaterial({
        color: button.color ? button.color : 0xaaaaaa,
        map: new THREE.TextureLoader().load("assets/button.jpg"),
      });

      let buttonMesh = new THREE.Mesh(
        geometry,
        button.useBg
          ? material
          : new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
          })
      );
      let fsize = 24;
      let midWidth = this.textWriter.getWidth(button.text, fsize);

      if (this.btnPos === "center") {
        buttonMesh.position.set(0, offsetY, -0.1);
        this.textWriter.write(
          group,
          -midWidth / 2 + 2,
          offsetY,
          0.2,
          button.text,
          fsize,
          button.txtColor ? button.txtColor : "0x222222"
        );
      } else if (this.btnPos === "left") {
        buttonMesh.position.set(
          -this.width / 2 + 5 + buttonWidth / 2 + 2,
          offsetY,
          -0.1
        );
        this.textWriter.write(
          group,
          -midWidth / 2 - 2 - buttonWidth / 2,
          offsetY,
          0.2,
          button.text,
          fsize,
          "0x222222"
        );
      }

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

    this.picker.setActiveMenu(this);
  }

  handleObstacleAdd(pos, name) {
    // Che if pos is clone to any of the trackPoints
    const trackPoints = this.app.contents.sceneParser.trackPoints;
    pos.y = 0.1;
    for (let i = 0; i < trackPoints.length; i++) {
      if (trackPoints[i].distanceTo(pos) < (this.app.contents.sceneParser.TRACK_SIZE + 3) / 2) {
        if (this.app.contents.sceneParser.addObstacle(pos, name)) {
          this.app.contents.menuController.gotoMenu("carSelect");
        }
        return;
      }
    }
  }

  handleButtonClick(buttonIndex) {
    const button = this.buttons.find((btn) => btn.cnt === buttonIndex);
    if (button && button.onClick) {
      button.onClick();
    }
  }
}
