import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyPicker } from "./MyPicker.js";
import { MyGarage } from "../objs/MyGarage.js";
import { MyCar } from "../objs/MyCar.js";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyPodium } from "./MyPodium.js";

export class MenuController {
  constructor(app) {
    app.picker = new MyPicker(app);
    this.app = app;
    this.currentMenu = null;

    // store menus options
    this.difficulty = null;
    this.map = 0;
    this.availableMaps = 3;
    this.playerName = "Player";

    // load menus
    this.loadMenuMain();
    this.loadMenuPause();
    this.loadMenuEnd();
    this.loadMenuMapSelect();
    this.loadMenuDificultySelect();
    this.loadDropObstaclesMenu();
    this.loadNameMenu();
    this.loadRulesMenu();
  }

  getDifficulty() {
    return this.difficulty;
  }

  getMap() {
    return this.map;
  }

  getPlayerName() {
    return this.playerName;
  }

  gotoMenu(menu) {
    switch (menu) {
      case "main":
        this.currentMenu = this.mainMenu;
        break;
      case "pause":
        this.currentMenu = this.pauseMenu;
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
      case "name":
        this.currentMenu = this.nameMenu;
        break;
      case "rules":
        this.currentMenu = this.rulesMenu;
        break;
      case "game":
        this.currentMenu = null;
        this.app.setActiveCamera("FirstPerson");
        if (this.app.contents.hasGameStarted) this.app.contents.unpauseGame();
        else this.app.contents.startCountdown();
        break;
      case "carSelect":
        this.garageLoad();
        return;
      case "end":
        this.app.MyHUD.setVisible(false);
        this.podium.setPodiumCamera();
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
      this.app.MyHUD.setVisible(true);
    }
  }

  loadMenuPause() {
    this.pauseMenu = new MyMenu(this.app, "Pause Menu", -200);
    this.pauseMenu.addButton("Resume", () => {
      this.gotoMenu("game");
    });
    this.pauseMenu.addButton("Exit", () => {
      this.app.contents.resetGame();
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.pauseMenu.getMenu());
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
      this.app.contents.loadTrack(this.map + 1); // TODO: flag isnt removed on new load
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton("Next", () => {
      this.map = (this.map + 1) % this.availableMaps;
      this.displayMap(group);
    });
    this.MapSelectingMenu.addButton("Go back", async () => {
      this.gotoMenu("name");
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

  loadMenuMain() {
    this.mainMenu = new MyMenu(this.app, "Kart Mania", -700, "center", 0.8);
    this.mainMenu.addButton("Play", () => {
      this.gotoMenu("name");
    });
    this.mainMenu.addButton("Instructions", () => {
      this.gotoMenu("rules");
    });
    this.mainMenu.addButton("Exit", () => {
      window.history.go(-1);
    });

    let group = this.mainMenu.getMenu();

    const writer = new TextSpriteDraw();
    writer.write(group, -33, -17, 0.2, "FEUP | MEIC - 2023 ", 16, "0xffffff");
    writer.write(
      group,
      -33,
      -20,
      0.2,
      "Marco Rocha (up202004891)",
      16,
      "0xffffff"
    );
    writer.write(
      group,
      -33,
      -23,
      0.2,
      "Ricardo Matos (up202007962)",
      16,
      "0xffffff"
    );

    // add menu to scene
    this.app.scene.add(group);
  }

  loadNameMenu() {
    this.nameMenu = new MyMenu(this.app, "Enter your name", -800);

    this.nameMenu.addText(this.playerName);

    this.nameMenu.addButton("Confirm", () => {
      this.gotoMenu("mapSelect");
    });

    this.nameMenu.addButton("Change", () => {
      while (true) {
        let name = prompt("Enter your name", this.playerName).trim();
        if (name) {
          let oldMenu = this.app.scene.getObjectByName("nameMenu");
          this.app.scene.remove(oldMenu);
          this.nameMenu.updateText(name, 0);
          this.app.scene.add(this.nameMenu.getMenu());
          this.playerName = name;
          break;
        } else alert("Please enter a valid name");
      }
    });

    this.nameMenu.addButton("Go back", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    const group = this.nameMenu.getMenu();
    group.name = "nameMenu";
    this.app.scene.add(group);
  }

  loadRulesMenu() {
    this.rulesMenu = new MyMenu(this.app, "Instructions", -300, "center", 0.5);
    this.rulesMenu.addText("Use WASD to move and ESC to pause");
    this.rulesMenu.addText("The first to complete all laps wins");
    this.rulesMenu.addText("Avoid obstacles and collect powerups");
    this.rulesMenu.addButton("Go back", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.rulesMenu.getMenu());
  }

  loadMenuEnd() {
    this.podium = new MyPodium(this.app);
    let menu = null;
    [this.endMenu, menu] = this.podium.loadMenuEnd();
    this.app.scene.add(menu);
  }

  // ========================================================

  updateEndMenu(won, time, timeRival, powerCnt, obstacleCnt, difficulty) {
    let menu = null;
    [this.endMenu, menu] = this.podium.updateEndMenu(
      won,
      time,
      timeRival,
      powerCnt,
      obstacleCnt,
      difficulty
    );

    this.app.scene.add(menu);
  }

  selectCar(car) {
    this.app.audio.playSound("garage");
    MyGarage.closeGarage();

    let carIndex = MyCar.availableCars.children.findIndex(
      (c) => c.name === car.name
    );

    let position = this.app.contents.sceneParser.getKeyPath()[0];
    let nextPosition = this.app.contents.sceneParser.getKeyPath()[1];

    this.app.contents.playerCam.defineSelfObj(new MyCar(0.5, 0.01, carIndex), [
      position.x + 3,
      0.1,
      position.z - 3,
    ]);

    // Calculate rotation to align the car to the next point
    let direction = new THREE.Vector3().subVectors(nextPosition, position);
    this.app.contents.playerCam.player.rotationSpeed = Math.atan2(
      direction.x,
      direction.z
    );
    this.app.contents.playerCam.player.rotation.y = Math.atan2(
      direction.x,
      direction.z
    );

    MyGarage.mixer.addEventListener("loop", (e) => {
      this.gotoMenu("game");
    });
  }

  garageLoad() {
    this.app.MyHUD.setVisible(false);
    this.app.setActiveCamera("Garage");
    this.app.cameras["Garage"].position.set(130, 6, 120);
    const checkGarageLoaded = setInterval(() => {
      if (MyGarage.objectModel.children.length > 0) {
        clearInterval(checkGarageLoaded);
        this.app.audio.playSound("garage");
        MyGarage.openGarage();
      }
    }, 100);
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
