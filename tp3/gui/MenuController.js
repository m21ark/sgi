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

    // store menus options
    this.difficulty = null;
    this.map = 0;
    this.availableMaps = 3;

    // load menus
    this.loadMenuMain();
    this.loadMenuPause();
    this.loadMenuEnd();
    this.loadMenuMapSelect();
    this.loadMenuDificultySelect();
    this.loadDropObstaclesMenu();
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
        this.app.contents.unpauseGame();
        break;
      case "carSelect":
        this.garageLoad();
        return;
      default:
        this.currentMenu = null;
        console.log(
          "Camera '" +
            menu +
            "' option not found. Using default perspective camera"
        );
        this.app.setActiveCamera("Perspective");
    }

    if (this.currentMenu) {
      this.app.MyHUD.setVisible(false);
      this.currentMenu.setCamera(this.app);
    } else {
      // Player is in game
      // TODO: SET everything to start moving
      this.app.MyHUD.setVisible(true);
    }
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
      this.gotoMenu("game");
    });
    this.pauseMenu.addButton("Exit", () => {
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
      "left",
      0.8
    );

    this.MapSelectingMenu.addButton("Select", async () => {
      await this.app.contents.loadTrack(this.map + 1); // TODO: this doesnt work if there is a map already loaded
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton("Next", () => {
      this.map = (this.map + 1) % this.availableMaps;
      this.displayMap(group);
    });
    this.MapSelectingMenu.addButton("Go back", async () => {
      this.gotoMenu("main");
    });

    let group = this.MapSelectingMenu.getMenu();

    this.displayMap(group);

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

    this.endMenu.updateText(won ? "You won!" : "You lost!", 0);
    this.endMenu.updateText(`Your final time was ${time}s`, 1);
    let s = `Hit ${powerCnt} powerups and ${obstacleCnt} obstacles`;
    this.endMenu.updateText(s, 2);

    // add new menu to scene
    this.app.scene.add(this.endMenu.getMenu());
  }

  selectCar(car) {
    Garage.closeGarage();

    let carIndex = MyCar.availableCars.children.findIndex(
      (c) => c.name === car.name
    );

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
        Garage.openGarage();
      }
    }, 100);
    // temporary solution
    const garage = new THREE.PerspectiveCamera(75, 0.2, 0.1, 1000);
    garage.position.set(160, 6, 120);
    garage.lookAt(new THREE.Vector3(120, 6, 120));
    this.app.cameras["Garage"] = garage;
  }

  // read map on tracks folder and display it in the screen ... only using x and y coordinates and using catmull to print it
  async displayMap(group) {
    if (this.currentMAP) group.remove(this.currentMAP);

    let map = await this.readTrackJson(this.map + 1);
    let points = [];
    let curve = new THREE.CatmullRomCurve3();

    for (let i = 0; i < map.track.length; i++)
      points.push(new THREE.Vector3(map.track[i].x, map.track[i].z, -0.1));

    curve.points = points;
    let tubeGeometry = new THREE.TubeGeometry(curve, 50, 1.5, 8, false);
    let tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.scale.set(0.1, 0.1, 0.1);
    tubeMesh.position.set(4, -12, 0);
    this.currentMAP = tubeMesh;
    group.add(tubeMesh);
  }

  async readTrackJson(trackNumber) {
    const response = await fetch(`tracks/track_${trackNumber}.json`);
    const trackData = await response.json();
    return trackData;
  }
}
