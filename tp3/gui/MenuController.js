import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyPicker } from "./MyPicker.js";
import { Garage } from "../objs/Garage.js";
import { MyCar } from "../objs/MyCar.js";

export class MenuController {
  constructor(app) {
    app.picker = new MyPicker(app);
    this.app = app;
    this.currentMenu = null;

    // load menus
    this.loadMenuMain();
    this.loadMenuPause();
    this.loadMenuEnd();
    this.loadMenuMapSelect();
    this.loadMenuDificultySelect();
    this.loadDropObstaclesMenu();

    // store menus options
    this.difficulty = null;
    this.map = 0;
    this.availableMaps = 3;
  }

  getDifficulty() {
    return this.difficulty;
  }

  getMap() {
    return this.map;
  }

  gotoMenu(menu) {
    switch (menu) {
      case "main":
        this.currentMenu = this.mainMenu;
        break;
      case "pause":
        this.currentMenu = this.pauseMenu;
        break;
      case "end":
        this.currentMenu = this.endMenu;
        break;
      case "mapSelect":
        this.currentMenu = this.MapSelectingMenu;
        break;
      case "dificultySelect":
        this.currentMenu = this.dificultySelectingMenu;
        break;
      case "dropObstacles":
        this.currentMenu = this.dropObstaclesMenu;
        break;
      case "game":
        this.currentMenu = null;
        this.app.setActiveCamera("FirstPerson");
        break;
      case "carSelect":
        this.garageLoad();
        return;
      default:
        this.currentMenu = null;
        console.log(
          "Camera option not found. Using default perspective camera"
        );
        this.app.setActiveCamera("Perspective");
    }

    if (this.currentMenu) {
      this.app.MyHUD.setVisible(false);
      this.currentMenu.setCamera(this.app);
    } else this.app.MyHUD.setVisible(true);
  }

  loadMenuMain() {
    this.mainMenu = new MyMenu(this.app, "Main Menu", -100, "center", 1.2);
    this.mainMenu.addButton("Play", () => {
      this.gotoMenu("mapSelect");
    });
    this.mainMenu.addButton("Exit", () => {
      window.history.go(-1);
    });

    // add menu to scene
    this.app.scene.add(this.mainMenu.getMenu());
  }

  // TODO: see how to make this work with a listener and pause the game
  loadMenuPause() {
    this.pauseMenu = new MyMenu(this.app, "Pause Menu", -200);
    this.pauseMenu.addButton("Resume", () => {
      console.log("Clicked Resume");
      // this.gotoMenu("game"); // see later how to make this work
    });
    this.pauseMenu.addButton("Exit", () => {
      console.log("Clicked Exit");
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.pauseMenu.getMenu());
  }

  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End of Game", -300);
    this.endMenu.addText("You won!");
    this.endMenu.addText("Your final time was 3:43s");
    this.endMenu.addText("Hit 2 powerups and 2 obstacules");

    this.endMenu.addButton("Go home", () => {
      this.gotoMenu("main");
    });

    // add menu to scene with name so we can update it later
    let m = this.endMenu.getMenu();
    m.name = "endMenu";
    this.app.scene.add(m);
  }

  loadMenuMapSelect() {
    this.MapSelectingMenu = new MyMenu(
      this.app,
      "Select Map",
      -400,
      "center",
      0.8,
    );
    this.MapSelectingMenu.addButton("<", () => {
      this.map = (this.map + 1) % this.availableMaps;
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton(">", () => {
      this.map = (this.map - 1) % this.availableMaps;
      this.gotoMenu("dificultySelect");
    });

    let group = this.MapSelectingMenu.getMenu();

    let btn1 = group.children[1].children[1];
    let btn2 = group.children[1].children[3];
    let sprite = group.children[1].children[0];
    let sprite2 = group.children[1].children[2];

    sprite.position.set(-16, -24.5, 0);
    sprite2.position.set(16, -15.5, 0);

    btn1.position.set(-16, -16, 0);
    btn2.position.set(16, -16, 0);

    // add menu to scene
    this.app.scene.add(group);
  }

  loadMenuDificultySelect() {
    this.dificultySelectingMenu = new MyMenu(
      this.app,
      "Select Dificulty",
      -500
    );
    this.dificultySelectingMenu.addButton(
      "Easy",
      () => {
        this.difficulty = 1;
        this.gotoMenu("dropObstacles");
      },
      0x00cc00
    );
    this.dificultySelectingMenu.addButton(
      "Medium",
      () => {
        this.difficulty = 2;
        this.gotoMenu("dropObstacles");
      },
      0xcccc00
    );
    this.dificultySelectingMenu.addButton(
      "Hard",
      () => {
        this.difficulty = 3;
        this.gotoMenu("dropObstacles");
      },
      0xff9900
    );

    this.dificultySelectingMenu.addButton("Go back", () => {
      this.gotoMenu("mapSelect");
    });

    // add menu to scene
    this.app.scene.add(this.dificultySelectingMenu.getMenu());
  }

  loadDropObstaclesMenu() {
    this.dropObstaclesMenu = new MyMenu(this.app, "Drop Obstacles: TODO", -600);
    this.dropObstaclesMenu.addButton("Open Garage", () => {
      this.gotoMenu("carSelect");
    });
    this.dropObstaclesMenu.addButton("Go back", () => {
      this.gotoMenu("dificultySelect");
    });

    // add menu to scene
    this.app.scene.add(this.dropObstaclesMenu.getMenu());
  }

  // ========================================================

  updateEndMenu(won, time, powerCnt, obstacleCnt) {
    // remove old menu
    let oldMenu = this.app.scene.getObjectByName("endMenu");
    this.app.scene.remove(oldMenu);

    console.log(this.app.scene.children);

    this.endMenu.updateText(won ? "You won!" : "You lost!", 0);
    this.endMenu.updateText(`Your final time was ${time}s`, 1);
    let s = `Hit ${powerCnt} powerups and ${obstacleCnt} obstacles`;
    this.endMenu.updateText(s, 2);

    // add new menu to scene
    this.app.scene.add(this.endMenu.getMenu());
  }

  selectCar(car) {
    Garage.closeGarage();

    let carIndex = MyCar.availableCars.children.findIndex(c => c.name === car.name);

    this.app.contents.playerCam.defineSelfObj(new MyCar(5, 0.1, carIndex));

    Garage.mixer.addEventListener("loop", (e) => {
      this.gotoMenu("game");
    });
  }

  garageLoad() {
    this.app.MyHUD.setVisible(false);
    this.app.setActiveCamera("Garage");
    this.app.cameras["Garage"].position.set(130, 6, 120);
    const checkGarageLoaded = setInterval(() => {
      if (Garage.objectModel.children.length > 0) {
        clearInterval(checkGarageLoaded);
        console.log(Garage.objectModel.children);
        Garage.openGarage();
      }
    }, 100);
    // temporary solution
    const garage = new THREE.PerspectiveCamera(75, 0.2, 0.1, 1000);
    garage.position.set(160, 6, 120);
    garage.lookAt(new THREE.Vector3(120, 6, 120));
    this.app.cameras["Garage"] = garage;

    console.log(this.app.cameras["Garage"].position);

    console.log(
      "Garage loaded with difficulty: " +
        this.difficulty +
        " and map: " +
        this.map
    );
  }
}
