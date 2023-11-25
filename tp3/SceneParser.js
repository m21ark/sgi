import * as THREE from "three";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";

export class GridParser {
  constructor() {
    // Textures
    const loader = new THREE.TextureLoader();
    this.greenTileTex = loader.load("scene/textures/grass.png");
    this.greyTileTex = loader.load("scene/textures/asphalt.jpg");
    this.endFlagTex = loader.load("scene/textures/finishFlag.jpg");
    this.metalTex = loader.load("scene/textures/metal.jpg");

    // Materials
    this.greenTileMat = new THREE.MeshPhongMaterial({
      map: this.greenTileTex,
      side: THREE.DoubleSide,
      color: 0x009900,
    });
    this.greyTileMat = new THREE.MeshPhongMaterial({
      map: this.greyTileTex,
      side: THREE.DoubleSide,
      color: 0xa0a0a0,
    });
    this.endFlagMat = new THREE.MeshPhongMaterial({
      map: this.endFlagTex,
      side: THREE.DoubleSide,
      color: 0xffffff,
    });
    this.metalMat = new THREE.MeshPhongMaterial({
      map: this.metalTex,
      side: THREE.DoubleSide,
      color: 0x060606,
      shininess: 100,
      specular: 0xaaaaaa,
    });

    this.objBuilder = new ObjectBuilder();

    // Meshes for powerups and obstacles Items
    this.powerupItem = new THREE.Group();
    this.obstacleItem = new THREE.Group();
  }

  async buildGridGroup(track_number) {
    const csvPath = "tracks/track_" + track_number + ".csv";
    const csv = await this.readCSV(csvPath);
    const rows = csv.trim().split("\n");

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

    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i].split(",");

      for (let j = 0; j < columns.length; j++) {
        const value = parseInt(columns[j]);

        const xy1 = [5 * i, 5 * j];
        const xy2 = [5 * (i + 1), 5 * (j + 1)];

        let obj = null;
        let extraObj = null;
        let geo = this.objBuilder.createTileGeometry(xy1, xy2);

        switch (value) {
          case 0:
            obj = new THREE.Mesh(geo, this.greenTileMat);
            break;
          case 1:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            break;
          case 2:
            obj = new THREE.Mesh(geo, this.endFlagMat);
            break;
          case 3:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            extraObj = this.createPowerup(xy1, xy2);
            break;
          case 4:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            extraObj = this.createObstacle(xy1, xy2);
            break;
          default:
            console.error("Invalid value in CSV");
            break;
        }

        group.add(obj);
        if (extraObj) group.add(extraObj);
      }
    }

    group.rotateX(Math.PI / 2);

    return group;
  }

  createPowerup(xy1, xy2) {
    const item = this.powerupItem.clone();
    const x = (xy1[0] + xy2[0]) / 2;
    const y = (xy1[1] + xy2[1]) / 2;
    item.position.set(x, y, -0.15);
    item.scale.set(0.025, 0.025, 0.025);
    return item;
  }

  createObstacle(xy1, xy2) {
    const item = this.obstacleItem.clone();
    const x = (xy1[0] + xy2[0]) / 2;
    const y = (xy1[1] + xy2[1]) / 2;
    item.position.set(x, y, -1.4);
    item.rotateX(-Math.PI / 2);
    item.scale.set(0.2, 0.2, 0.2);
    return item;
  }

  async readCSV(csvPath) {
    try {
      const parsedData = await this.fetchCSV(csvPath);
      return parsedData;
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error
    }
  }

  async fetchCSV(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load CSV file");
      }

      const csvData = await response.text();
      return csvData;
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error
    }
  }
}
