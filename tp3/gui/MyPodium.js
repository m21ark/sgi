import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyCar } from "../objs/MyCar.js";
import { MyFireworks } from "../objs/MyFirework.js";

export class MyPodium extends MyMenu {
  constructor(app) {
    super(app, "Podium", -1000, "center", 0.2);
    this.fireworks = new MyFireworks(this.app);
    this.setFireworks(false);
  }

  updateFireworks() {
    this.fireworks.update();
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
    this.menu = this.endMenu.getMenu();
    this.menu.position.set(this.x, 12.5, 0);
    this.menu.name = "endMenu";

    // add a plane to the menu
    let plane = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 50),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/menu.jpg"),
      })
    );

    plane.position.set(0, -25, 24);
    plane.rotateX(-Math.PI / 2);
    this.menu.add(plane);

    return [this.endMenu, this.menu];
  }

  clearPodium() {
    console.log("clearing podium");
  }

  setCars() {
    // set ai car on the left side and player car on the right side

    // ai car
    /*  let aiCar = this.app.contents.aiCar.getAIcar();
    aiCar.position.set(-10, 0, 0);
    aiCar.rotateY(Math.PI / 2);
    this.app.scene.add(aiCar); */

    // use blocks as placehodlers
    let geometry = new THREE.BoxGeometry(5, 5, 5);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    let aiCar = new THREE.Mesh(geometry, material);
    aiCar.position.set(-15, -20, 25);
    // aiCar.rotateY(Math.PI / 2);
    this.menu.add(aiCar);

    // player car
    let playerCar = new THREE.Mesh(geometry, material);
    playerCar.position.set(15, -20, 25);
    // playerCar.rotateY(Math.PI / 2);
    this.menu.add(playerCar);
  }

  setFireworks(won) {
    // fireworks
    const offset = won ? 1 : -1;
    const pos = {
      x: -1000 + 15 * offset,
      y: 2,
      z: -25,
    };
    this.fireworks.setPos(pos);

    // add a sphere helper in pos
    let geometry = new THREE.SphereGeometry(0.8, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);
    this.app.scene.add(sphere);

    console.log("setting fireworks");
  }

  setPodiumCamera() {
    const camera = new THREE.PerspectiveCamera(this.x, 0.2, 0.1, 200);
    camera.position.set(this.x, 20, -75);
    camera.lookAt(new THREE.Vector3(this.x, -10, 0));

    this.app.cameras["EndCamera"] = camera;
    this.app.setActiveCamera("EndCamera");

    this.setCars();

    // add temporary listener to spacebar to go back to menu
    window.addEventListener("keydown", (e) => {
      if (this.app.activeCameraName !== "EndCamera") return;
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
