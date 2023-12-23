import * as THREE from "three";
import { ObjectBuilder } from "../builders/ObjectBuilder.js";
import { MyBillboard } from "../objs/MyBillboard.js";
import { CatmullTrack } from "./CatmullTrack.js";
import { MyGarage } from "../objs/MyGarage.js";
import { MyCar } from "../objs/MyCar.js";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";
import { MyObstacle } from "../objs/MyObstacle.js";
import { MyPowerUp } from "../objs/MyPowerUp.js";
import { MyWater } from "../objs/MyWater.js";

export class SceneParser {
  static ObjectType = {
    OBSTACLE: "obstacle",
    POWERUP: "powerup",
  };

  constructor() {
    this.hitabbleObjs = [];

    const loader = new THREE.TextureLoader();
    this.grassTex = loader.load("scene/textures/grass.png");
    this.grassTex.wrapS = THREE.RepeatWrapping;
    this.grassTex.wrapT = THREE.RepeatWrapping;
    this.grassTex.repeat.set(20, 20);

    this.grassMat = new THREE.MeshPhongMaterial({
      map: this.grassTex,
      side: THREE.DoubleSide,
      color: 0x009900,
    });

    this.mountainMat = new THREE.MeshBasicMaterial({
      color: 0x442211, // Adjust color as needed
      map: new THREE.TextureLoader().load("assets/mountain.jpg"),
    });

    this.snowMat = new THREE.MeshBasicMaterial({
      color: 0xddddee, // Adjust color as needed
    });

    this.objBuilder = new ObjectBuilder();

    // Meshes for powerups and obstacles Items
    this.powerupItem = new THREE.Group();
    this.obstacleItem = new THREE.Group();

    this.trees = [];
    this.lake = null;
  }

  async readJSON(filePath) {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
  }

  getControlPoints() {
    return this.controPointGroup;
  }

  async buildGridGroup(track_number) {
    const csvPath = "tracks/track_" + track_number + ".json";
    const json = await this.readJSON(csvPath);

    const group = new THREE.Group();

    // define the meshes for powerups and obstacles
    this.powerupMesh = await this.objBuilder.create3dModel(
      {
        filepath: "objs/block/BlockQuestion.obj",
      },
      "scene/",
      this.powerupItem
    );
    this.obstacleMesh = await this.objBuilder.create3dModel(
      {
        filepath: "objs/box/ItmPowderBox.obj",
      },
      "scene/",
      this.obstacleItem
    );

    this.garage = await this.objBuilder.create3dModel(
      {
        filepath: "objs/garage/smallgarage.obj",
      },
      "scene/",
      MyGarage.objectModel
    );
    MyGarage.objectModel.scale.set(0.05, 0.05, 0.05);

    let newGroup = new THREE.Group();
    newGroup.add(MyGarage.objectModel);
    newGroup.position.set(120, 0.1, 120);
    const availableCars = MyCar.availableCars.clone();
    const carCount = availableCars.children.length;
    const spaceBetweenCars = 30 / (carCount + 1);

    for (let i = 0; i < carCount; i++) {
      let clone = availableCars.children[i].clone();
      clone.position.set(0, 0, spaceBetweenCars * i - 5.0);
      clone.rotateY(Math.PI / 2);
      clone.scale.set(4, 4, 4);

      var spritey = TextSpriteDraw.makeTextSprite(clone.name, {
        fontsize: 20,
        textColor: { r: 255, g: 255, b: 255, a: 1.0 },
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        borderThickness: 6,
      });
      spritey.position.set(4, 0, 0);

      clone.add(spritey);
      newGroup.add(clone);
    }

    group.add(newGroup);

    // ================ CURVE =================
    // catmull curve from the json
    const points = [];
    json.track.forEach((point) => {
      points.push(new THREE.Vector3(point.x, 0, point.z));
    });

    this.makeCatmullCurve(group, points);

    this.controlPoints = points;

    // add a small translucid blue spehere to each control point
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.5,
    });

    this.controPointGroup = new THREE.Group();
    this.controPointGroup.name = "Track_ControlPoints";

    points.forEach((controlPoint) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...controlPoint);
      sphere.position.y += 0.5;
      sphere.visible = false;
      this.controPointGroup.add(sphere);
    });

    group.add(this.controPointGroup);

    // ================ GRASS =================

    // Create the plain of grass
    const squareGeometry = new THREE.PlaneGeometry(400, 400);
    const squareMesh = new THREE.Mesh(squareGeometry, this.grassMat);
    squareMesh.rotateX(-Math.PI / 2);
    squareMesh.position.set(130, 0, 130);
    group.add(squareMesh);

    // ================ MOUNTAINS =================

    this.addMountains(group);

    // ================ LAKE =================

    json.lake.forEach((lake) => {
      this.addLake(group, lake.x, lake.z, lake.rotate);
    });

    // ================ OBSTACLES =================

    json.obstacles.forEach((obstacle) => {
      const obstacleMesh = this.createObstacle(obstacle.x, obstacle.z);
      let hitBB = new THREE.Box3().setFromObject(obstacleMesh);
      hitBB.position = obstacleMesh.position;
      // create the obstacle object
      let obstacleObj = new MyObstacle();
      obstacleObj.type = SceneParser.ObjectType.OBSTACLE;
      obstacleObj.setBBox(hitBB);
      this.hitabbleObjs.push(obstacleObj);

      group.add(obstacleMesh);
    });

    // ================ POWERUPS =================

    json.powerups.forEach((powerup) => {
      const powerupMesh = this.createPowerup(powerup.x, powerup.z);
      let hitBB = new THREE.Box3().setFromObject(powerupMesh);
      hitBB.position = powerupMesh.position;
      let powerupObj = new MyPowerUp();
      powerupObj.setBBox(hitBB);
      powerupObj.type = SceneParser.ObjectType.POWERUP;

      this.hitabbleObjs.push(powerupObj);
      group.add(powerupMesh);
    });

    // ================ TREES =================

    json.trees.forEach((tree) => {
      const treeMesh = this.createTree(tree.x, tree.z);
      this.trees.push(treeMesh);
      group.add(treeMesh);
    });

    this.addTreesCircle(group);

    // ================ FLAG =================

    this.addFlag(group, json.flagRotate ? json.flagRotate : false);

    // ================ CHECKPOINT =================
    // Create a box geometry
    let boxGeometry = new THREE.BoxGeometry(25, 1, 25); // Adjust the size as needed

    // Create a box material
    let boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Adjust the color as needed

    // Create the first box and add it to the group
    let box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    let pos = this.getKeyPath()[0];
    box1.position.copy(new THREE.Vector3(pos.x, 0, pos.z)); // Position the box at the start of the path
    box1.visible = false; 
    box1.name = "sector1";
    group.add(box1);

    // Create the second box and add it to the group
    let box2 = new THREE.Mesh(boxGeometry, boxMaterial);
    let middleIndex = Math.floor(this.getKeyPath().length / 2);
    pos = this.getKeyPath()[middleIndex]
    box2.position.copy(new THREE.Vector3(pos.x, 0, pos.z)); // Position the box in the middle of the path
    box2.visible = false; 
    box2.name = "sector2";

    group.add(box2);

    // Create a bounding box for box1
    let box1BB = new THREE.Box3().setFromObject(box1);
    box1.bbox = box1BB;

    // Create a bounding box for box2
    let box2BB = new THREE.Box3().setFromObject(box2);
    box2.bbox = box2BB;


    this.checkpoints = [box2, box1];

    return group;
  }

  addFlag(group, rotate) {
    const pos = this.getKeyPath()[0];

    this.endFlagMat = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/finishFlag.jpg"),
      side: THREE.DoubleSide,
      color: 0xffffff,
    });

    let endLine = new THREE.Group();

    // Poles
    let poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 15, 5, 5);
    let poleMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    let pole1 = new THREE.Mesh(poleGeo, poleMat);
    let pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(0, -1, 0);
    pole2.position.set(10, -1, 0);

    // Flag
    let flagGeo = new THREE.PlaneGeometry(10, 5);
    let flag = new THREE.Mesh(flagGeo, this.endFlagMat);
    flag.position.set(5, 5, 0);

    endLine.add(pole1);
    endLine.add(pole2);
    endLine.add(flag);

    endLine.rotation.y = Math.PI / 2;

    if (rotate) {
      endLine.rotation.y = Math.PI;
      endLine.position.set(pos.x + 5, 6, pos.z);
    } else endLine.position.set(pos.x, 6, pos.z + 5);
    endLine.name = "endLine";

    group.add(endLine);
  }

  getHitabbleObjs() {
    return this.hitabbleObjs;
  }

  getTrees() {
    return this.trees;
  }

  getLake() {
    return this.lake;
  }

  createTree(x, y) {
    let tree = new MyBillboard("assets/trees/", 7);
    tree.position.set(x, 6.8, y);
    return tree;
  }

  createMountainMesh(x, y, z) {
    const minHeight = 25;
    const maxHeight = 50;

    const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    // Calculate heights for the three parts
    const grassHeight = randomHeight / 3;
    const mountainHeight = randomHeight / 3;
    const snowHeight = randomHeight / 3;

    const startRadius = randomHeight * 0.3;
    const radiusLimit1 = startRadius * 0.7;
    const radiusLimit2 = radiusLimit1 * 0.6;
    const topRadius = Math.random() * (2 - 1) + 1;

    // Create three parts of the mountain
    const grassGeometry = new THREE.CylinderGeometry(
      radiusLimit1,
      startRadius,
      grassHeight,
      10,
      1
    );
    const mountainGeometry = new THREE.CylinderGeometry(
      radiusLimit2,
      radiusLimit1,
      mountainHeight,
      10,
      1
    );
    const snowGeometry = new THREE.CylinderGeometry(
      topRadius,
      radiusLimit2,
      snowHeight,
      10,
      1
    );

    // Create meshes for each part
    const grassMesh = new THREE.Mesh(grassGeometry, this.grassMat);
    const mountainMesh = new THREE.Mesh(mountainGeometry, this.mountainMat);
    const snowMesh = new THREE.Mesh(snowGeometry, this.snowMat);

    // Set positions for each part
    grassMesh.position.set(x, y, z);
    mountainMesh.position.set(x, y + grassHeight, z);
    snowMesh.position.set(x, y + grassHeight + mountainHeight, z);

    // Create a group to hold all parts
    const mountainGroup = new THREE.Group();
    mountainGroup.add(grassMesh);
    mountainGroup.add(mountainMesh);
    mountainGroup.add(snowMesh);
    mountainGroup.position.y -= randomHeight * 0.2;

    // randomize 5 places in x and z
    const randomX = Math.random() * 10 - 5;
    const randomZ = Math.random() * 10 - 5;
    mountainGroup.position.x += randomX;
    mountainGroup.position.z += randomZ;

    return mountainGroup;
  }

  addTreesCircle(group) {
    const numCones = 70;
    const radius = 170;
    const forest = new THREE.Group();
    for (let i = 0; i < numCones; i++) {
      const angle = (i / numCones) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      const randomX = Math.random() * 10 - 5;
      const randomZ = Math.random() * 10 - 5;
      let tree = this.createTree(x + randomX, z + randomZ);

      forest.add(tree);
      this.trees.push(tree);
    }
    forest.position.set(125, 0, 125);
    group.add(forest);
  }

  addMountains(group) {
    const mountains = new THREE.Group();
    const numCones = 120;
    const radius = 200;

    for (let i = 0; i < numCones; i++) {
      const angle = (i / numCones) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      let mountain = this.createMountainMesh(x, 10, z);
      mountains.add(mountain);
    }

    mountains.position.set(125, 0, 125);
    group.add(mountains);
  }

  addLake(group, x, z, rotate) {
    const lake = new MyWater(10, 10, true);
    lake.position.set(x, 0.05, z);
    if (rotate) lake.rotateY(Math.PI / 2);
    group.name = "lake";
    this.lake = lake;
    group.add(lake);
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    const texture = new THREE.TextureLoader().load("./assets/menu.jpg");
    // texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      // color: 0x1b1b19,
      // emissive: 0xdddddd,
      // wireframe:  true
    });

    // this.material.map.repeat.set(3, 3);
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping;

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.3,
      wireframe: true,
      transparent: true,
    });

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  makeCatmullCurve(group, points) {
    // points.push(points[0]);
    const curve = new THREE.CatmullRomCurve3(points);

    this.pathPoints = curve.getPoints(100);
    this.trackPoints = curve.getPoints(150);

    this.TRACK_SIZE = 11;
    const catmullTrack = new CatmullTrack(
      curve,
      this.TRACK_SIZE,
      0.1,
      this.TRACK_SIZE,
      16
    );

    this.createCurveMaterialsTextures();

    this.material.vertexColors = true;
    this.material.needsUpdate = true;

    const mesh = new THREE.Mesh(catmullTrack.geometry, this.material);

    mesh.scale.set(1, 1, 1);
    group.add(mesh);
  }

  getKeyPath() {
    let path = [...this.pathPoints];
    for (let i = 0; i < path.length; i++) {
      path[i].y += 0.47;
    }
    return this.pathPoints;
  }

  createPowerup(x, y) {
    const item = this.powerupItem.clone();
    item.position.set(x, 0.15, y);
    item.rotateX(Math.PI / 2);
    item.scale.set(0.015, 0.015, 0.015);
    return item;
  }

  createObstacle(x, y) {
    const item = this.obstacleItem.clone();
    item.position.set(x, 0.8, y);
    item.scale.set(0.10, 0.10, 0.10);
    return item;
  }
}
