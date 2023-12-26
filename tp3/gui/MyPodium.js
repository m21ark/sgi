import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyCar } from "../objs/MyCar.js";
import { MyFireworks } from "../objs/MyFirework.js";

/**
 * Represents the MyPodium class that extends MyMenu.
 * It provides functionality for displaying the podium and end of game menu.
 */
export class MyPodium extends MyMenu {
  /**
   * Creates an instance of MyPodium.
   * @param {App} app - The application object.
   */
  constructor(app) {
    super(app, "Podium", -1000, "center", 0.2);
    this.fireworks = new MyFireworks(this.app);
  }

  /**
   * Updates the fireworks.
   */
  updateFireworks() {
    this.fireworks.update();
  }

  /**
   * Loads the end of game menu.
   * @returns {Array} - An array containing the end of game menu and its corresponding scene object.
   */
  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End of Game", this.x, "center", 0.2);
    this.endMenu.addText("You won!");
    this.endMenu.addText("Your final time was 3:43s");
    this.endMenu.addText(`Rival time was 3:56s`);
    this.endMenu.addText(`Difficulty: easy`);
    this.endMenu.addText(`Press space to go back to menu`);

    // add menu to scene with name so we can update it later
    this.menu = this.endMenu.getMenu();
    this.menu.position.set(this.x, 12.5, 0);
    this.menu.name = "endMenu";

    this.addPlane();

    return [this.endMenu, this.menu];
  }

  /**
   * Adds a plane to the menu.
   */
  addPlane() {
    let plane = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 50),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("assets/menu.jpg"),
      })
    );

    plane.position.set(0, -25, 24);
    plane.rotateX(-Math.PI / 2);
    this.menu.add(plane);
  }

  /**
   * Sets the AI car and player car on the podium.
   */
  setCars() {
    // set ai car on the left side and player car on the right side

    // use blocks as placeholders
    let aiCar =
      MyCar.availableCars.children[
        this.app.contents.menuController.rivalCarIndex
      ].clone();
    aiCar.scale.set(6, 6, 6);
    aiCar.position.set(-15, -20, 25);
    this.menu.add(aiCar);

    // player car
    let playerCar =
      MyCar.availableCars.children[
        this.app.contents.menuController.carIndex
      ].clone();
    playerCar.scale.set(6, 6, 6);
    playerCar.position.set(15, -20, 25);
    this.menu.add(playerCar);
  }

  /**
   * Sets the fireworks position based on whether the player won or lost.
   * @param {boolean} won - Indicates whether the player won the game.
   */
  setFireworks(won) {
    // fireworks
    const offset = won ? -1 : 1;
    const pos = {
      x: -1000 + 15 * offset,
      y: 2,
      z: -25,
    };
    this.fireworks.setPos(pos);
  }

  /**
   * Sets the podium camera.
   */
  setPodiumCamera() {
    const camera = new THREE.PerspectiveCamera(70, 0.2, 0.1, 200);
    camera.position.set(this.x, 20, -75);
    camera.lookAt(new THREE.Vector3(this.x, -5, 0));

    this.app.cameras["EndCamera"] = camera;
    this.app.setActiveCamera("EndCamera");

    // resize window because camera was added after init
    this.app.onResize();

    window.addEventListener("keydown", (e) => {
      if (this.app.activeCameraName !== "EndCamera") return;
      if (e.key === " ") {
        this.app.setActiveCamera("MenuCamera");
        this.app.contents.gameHasEnded = false;
        this.app.contents.menuController.gotoMenu("main");
        window.removeEventListener("keydown", this);

        // remove fireworks
        this.fireworks.reset();
      }
    });
  }

  /**
   * Updates the end of game menu with the latest information.
   * @param {boolean} won - Indicates whether the player won the game.
   * @param {number} time - The player's final time.
   * @param {number} timeRival - The rival's final time.
   * @param {number} difficulty - The difficulty level.
   * @returns {Array} - An array containing the updated end of game menu and its corresponding scene object.
   */
  updateEndMenu(won, time, timeRival, difficulty) {
    this.setFireworks(won);

    // remove old menu
    let oldMenu = this.app.scene.getObjectByName("endMenu");
    this.app.scene.remove(oldMenu);

    const name = this.app.contents.menuController.getPlayerName();

    // map difficulty to string
    if (difficulty === 1) difficulty = "easy";
    else if (difficulty === 2) difficulty = "medium";
    else difficulty = "hard";

    this.endMenu.updateText(won ? "You won!" : "You lost!", 0);
    this.endMenu.updateText(`${name}'s final time was ${time}s`, 1);
    this.endMenu.updateText(`Rival time was ${timeRival}s`, 2);
    this.endMenu.updateText(`Difficulty: ${difficulty}`, 3);
    this.menu = this.endMenu.getMenu();
    this.menu.position.set(this.x, 12.5, 0);
    this.menu.name = "endMenu";
    this.addPlane();
    this.setCars();

    return [this.endMenu, this.menu];
  }
}
