import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyPicker } from "./MyPicker.js";
import { Garage } from "./Garage.js";

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
    this.map = null;
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
    this.mainMenu = new MyMenu(this.app, "Main Menu", -100);
    this.mainMenu.addButton("Play", () => {
      this.gotoMenu("mapSelect");
    });
    this.mainMenu.addButton("Exit", () => {
      window.history.go(-1);
    });

    // add menu to scene
    this.app.scene.add(this.mainMenu.getMenu());
  }

  loadMenuPause() {
    this.pauseMenu = new MyMenu(this.app, "Pause Menu", -200);
    this.pauseMenu.addButton("Resume", () => {
      console.log("Clicked Resume");
    });
    this.pauseMenu.addButton("Exit", () => {
      console.log("Clicked Exit");
    });

    // add menu to scene
    this.app.scene.add(this.pauseMenu.getMenu());
  }

  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End Menu", -300);
    this.endMenu.addButton("Go home", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.endMenu.getMenu());
  }

  loadMenuMapSelect() {
    this.MapSelectingMenu = new MyMenu(this.app, "Select Map", -500);
    this.MapSelectingMenu.addButton("Map 1", () => {
      this.map = 1;
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton("Map 2", () => {
      this.map = 2;
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton("Map 3", () => {
      this.map = 3;
      this.gotoMenu("dificultySelect");
    });

    this.MapSelectingMenu.addButton("Go back", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.MapSelectingMenu.getMenu());
  }

  loadMenuDificultySelect() {
    this.dificultySelectingMenu = new MyMenu(
      this.app,
      "Select Dificulty",
      -600
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
    this.dropObstaclesMenu = new MyMenu(this.app, "Drop Obstacles: TODO", -700);
    this.dropObstaclesMenu.addButton("Open Garage", () => {
      this.gotoMenu("carSelect");
    });
    this.dropObstaclesMenu.addButton("Go back", () => {
      this.gotoMenu("dificultySelect");
    });

    // add menu to scene
    this.app.scene.add(this.dropObstaclesMenu.getMenu());
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
