import * as THREE from "three";
import { ObjectBuilder } from "../builders/ObjectBuilder.js";
import { MyBillboard } from "../objs/MyBillboard.js";
import { CatmullTrack } from "./CatmullTrack.js";
import { Garage } from "../objs/Garage.js";
import { MyCar } from "../objs/MyCar.js";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class SceneParser {
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

    this.objBuilder = new ObjectBuilder();

    // Meshes for powerups and obstacles Items
    this.powerupItem = new THREE.Group();
    this.obstacleItem = new THREE.Group();

    this.trees = [];
  }

  async readJSON(filePath) {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
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
      Garage.objectModel
    );
    Garage.objectModel.scale.set(0.05, 0.05, 0.05);

    let newGroup = new THREE.Group();
    newGroup.add(Garage.objectModel);
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

    // ================ GRASS =================
    // create a big square around the track
    const square = new THREE.PlaneGeometry(260, 260);
    const squareMesh = new THREE.Mesh(square, this.grassMat);
    squareMesh.rotateX(-Math.PI / 2);

    squareMesh.position.set(130, 0, 130);
    group.add(squareMesh);

    // ================ OBSTACLES =================

    json.obstacles.forEach((obstacle) => {
      const obstacleMesh = this.createObstacle(obstacle.x, obstacle.z);
      let hitBB = new THREE.Box3().setFromObject(obstacleMesh);
      hitBB.position = obstacleMesh.position;
      this.hitabbleObjs.push(hitBB);
      group.add(obstacleMesh);
    });

    // ================ POWERUPS =================

    json.powerups.forEach((powerup) => {
      const powerupMesh = this.createPowerup(powerup.x, powerup.z);
      let hitBB = new THREE.Box3().setFromObject(powerupMesh);
      hitBB.position = powerupMesh.position;
      this.hitabbleObjs.push(hitBB);
      group.add(powerupMesh);
    });

    // ================ TREES =================

    json.trees.forEach((tree) => {
      const treeMesh = this.createTree(tree.x, tree.z);
      this.trees.push(treeMesh);
      group.add(treeMesh);
    });

    return group;
  }

  getHitabbleObjs() {
    return this.hitabbleObjs;
  }

  getTrees() {
    return this.trees;
  }

  createTree(x, y) {
    let tree = new MyBillboard("assets/trees/", 7);
    tree.position.set(x, 6.8, y);
    return tree;
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    // const texture = new THREE.TextureLoader().load("./assets/Road-texture.jpg");
    // texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({
      // map: texture,
      side: THREE.DoubleSide,
      color: 0x1b1b19,
      // emissive: 0xdddddd,
      // wireframe:  true
    });

    // this.material.map.repeat.set(3, 3);
    // this.material.map.wrapS = THREE.RepeatWrapping;
    // this.material.map.wrapT = THREE.RepeatWrapping;

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

    this.TRACK_SIZE = 7;
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
    item.scale.set(0.025, 0.025, 0.025);
    return item;
  }

  createObstacle(x, y) {
    const item = this.obstacleItem.clone();
    item.position.set(x, 1.4, y);
    item.scale.set(0.2, 0.2, 0.2);
    return item;
  }
}
