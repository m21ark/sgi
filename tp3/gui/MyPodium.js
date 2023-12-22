import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyMenu } from "./MyMenu.js";

export class MyPodium extends MyMenu {
  constructor(app) {
    super(app, "Podium", -1000, "center", 0.2);
    this.oldCamera = null;
  }

  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End of Game", this.x, "center", 0.2);
    this.endMenu.addText("You won!");
    this.endMenu.addText("Your final time was 3:43s");
    this.endMenu.addText(`Rival time was 3:56s`);
    this.endMenu.addText("Hit 2 powerups and 2 obstacules");
    this.endMenu.addText(`Difficulty: easy`);
    this.endMenu.addText(`Press space to go back to menu`);

    // add menu to scene with name so we can update it later
    let m = this.endMenu.getMenu();
    m.name = "endMenu";

    // add a plane to the menu
    let plane = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 50),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/menu.jpg"),
      })
    );

    plane.position.set(0, -25, 24);
    plane.rotateX(-Math.PI / 2);
    m.add(plane);

    return [this.endMenu, m];
  }

  clearPodium() {
    console.log("clearing podium");
  }

  setCars() {
    console.log(this.app.scene);
  }

  setPodiumCamera() {
    const camera = new THREE.PerspectiveCamera(this.x, 0.2, 0.1, 200);
    camera.position.set(this.x, 10, -75);
    camera.lookAt(new THREE.Vector3(this.x, -20, 0));

    this.app.cameras["EndCamera"] = camera;
    this.app.setActiveCamera("EndCamera");

    // add temporary listener to spacebar to go back to menu
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.app.setActiveCamera("MenuCamera");
        this.app.contents.menuController.gotoMenu("main");
        this.clearPodium();
        window.removeEventListener("keydown", this);
      }
    });
  }

  updateEndMenu(won, time, timeRival, powerCnt, obstacleCnt, difficulty) {
    // remove old menu
    let oldMenu = this.app.scene.getObjectByName("endMenu");
    this.app.scene.remove(oldMenu);

    this.endMenu.updateText(won ? "You won!" : "You lost!", 0);
    this.endMenu.updateText(`Your final time was ${time}s`, 1);
    this.endMenu.updateText(`Rival time was ${timeRival}s`, 2);
    let s = `Hit ${powerCnt} powerups and ${obstacleCnt} obstacles`;
    this.endMenu.updateText(s, 3);
    this.endMenu.updateText(`Difficulty: ${difficulty}`, 4);

    // add new menu to scene
    this.app.scene.add(this.endMenu.getMenu());
  }
}
