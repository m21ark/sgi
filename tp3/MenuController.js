import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyPicker } from "./MyPicker.js";

class MenuController {
  constructor(app) {
    app.picker = new MyPicker(app);
    this.app = app;
    this.currentMenu = null;

    this.loadMenuMain();
    this.loadMenuPause();
    this.loadMenuEnd();
    this.loadMenuCarSelect();
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
      case "carSelect":
        this.currentMenu = this.carSelectingMenu;
        break;
      case "game":
        this.currentMenu = null;
        this.app.setActiveCamera("FirstPerson");
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
      console.log("Clicked Play");
    });
    this.mainMenu.addButton("Settings", () => {
      console.log("Clicked Settings");
    });

    // add menu to scene
    this.app.scene.add(this.mainMenu.getMenu());
  }

  loadMenuPause() {
    this.pauseMenu = new MyMenu(this.app, "Pause Menu", -200);
    this.pauseMenu.addButton("Resume", () => {
      console.log("Clicked Resume");
      this.app.MyHUD.setStatus("PLAY");
    });
    this.pauseMenu.addButton("Exit", () => {
      console.log("Clicked Exit");
      this.app.MyHUD.setStatus("EXIT");
    });

    // add menu to scene
    this.app.scene.add(this.pauseMenu.getMenu());
  }

  loadMenuEnd() {
    this.endMenu = new MyMenu(this.app, "End Menu", -300);
    this.endMenu.addButton("Restart", () => {
      console.log("Clicked Restart");
    });
    this.endMenu.addButton("Exit", () => {
      console.log("Clicked Exit");
    });

    // add menu to scene
    this.app.scene.add(this.endMenu.getMenu());
  }

  loadMenuCarSelect() {
    this.carSelectingMenu = new MyMenu(this.app, "Car Select", -400);
    this.carSelectingMenu.addButton("Car 1", () => {
      console.log("Clicked Car 1");
    });
    this.carSelectingMenu.addButton("Car 2", () => {
      console.log("Clicked Car 2");
    });

    // add menu to scene
    this.app.scene.add(this.carSelectingMenu.getMenu());
  }
}

export { MenuController };
