import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyMenu } from "./MyMenu.js";

export class MyPodium {
  constructor(app) {
    this.app = app;
    this.oldCamera = null;
    this.camera = this.setCamera();
  }

  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End of Game", -1000, "center", 0.2);
    this.endMenu.addText("You won!");
    this.endMenu.addText("Your final time was 3:43s");
    this.endMenu.addText(`Rival time was 3:56s`);
    this.endMenu.addText("Hit 2 powerups and 2 obstacules");
    this.endMenu.addText(`Difficulty: easy`);

    this.endMenu.addButton("Go home", () => {
      this.gotoMenu("main");
    });

    // add menu to scene with name so we can update it later
    let m = this.endMenu.getMenu();
    m.name = "endMenu";
    return [this.endMenu, m];
  }

  setCamera() {
    const camera = new THREE.PerspectiveCamera(-1000, 0.2, 0.1, 200);
    camera.position.set(-1000, 20, -10);
    camera.lookAt(new THREE.Vector3(-1000, 0, 0));
    return camera;
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
