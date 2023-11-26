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
    this.sideSquareTex = loader.load("scene/textures/sideSquare.jpg");

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

    this.sideSquareMat = new THREE.MeshPhongMaterial({
      map: this.sideSquareTex,
      side: THREE.DoubleSide,
      color: 0xffffff,
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
          case 5:
            obj = new THREE.Mesh(geo, this.sideSquareMat);
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

    //  ===================================================================

    const grid = rows.map((line) => line.split(",").map(Number));
    // FIND grid start coord
    let startCoord = null;

    for (let i = 0; i < grid.length; i++) {
      const line = grid[i];
      for (let j = 0; j < line.length; j++) {
        const value = line[j];
        if (value === 2) {
          startCoord = { x: i, y: j };
          break;
        }
      }
      if (startCoord) break;
    }

    console.log(startCoord);

    this.keyPath = this.bfs(grid, startCoord);

    return group;
  }

  getKeyPath(simplify = true) {
    let path = [];
    this.keyPath.forEach((coord) => {
      path.push([coord.y * 5, 2, coord.x * 5]);
    });

    if (simplify) {
      // if 2 adjacent points only differ in one axis
      // remove the second one (excluding the first and last points)
      for (let i = 1; i < path.length - 1; i++) {
        const p1 = path[i - 1];
        const p2 = path[i];
        const p3 = path[i + 1];

        if (
          (p1[0] === p2[0] && p2[0] === p3[0]) ||
          (p1[2] === p2[2] && p2[2] === p3[2])
        ) {
          path.splice(i, 1);
          i--;
        }
      }
    }

    path.push(path[0]);
    return path;
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

  bfs(grid, startCoord) {
    startCoord = { x: startCoord.y, y: startCoord.x };
    let queue = [{ coord: startCoord, path: [] }];
    const visited = new Set();

    let finishFound = false;
    let isFirst = true;

    while (queue.length > 0) {
      const { coord, path } = queue.shift();
      const { x, y } = coord;

      if (visited.has(`${x},${y}`)) continue;

      visited.add(`${x},${y}`);

      let tileType = grid[y][x];

      if (tileType === 2) {
        if (finishFound) return path;
        else finishFound = true;
      } else if (tileType == 5) continue;

      const neighbors = this.getNeighbors(grid, coord);
      for (const neighbor of neighbors) {
        if (isFirst) {
          neighbors.forEach((n) => {
            n.type = grid[n.y][n.x];
          });

          /*       console.log(neighbors); */
        }
        queue.push({ coord: neighbor, path: [...path, neighbor] });
      }

      if (isFirst) {
        // add to visited all tiles of type 2

        const finishTiles = neighbors.filter((n) => n.type === 2);
        finishTiles.forEach((n) => {
          visited.add(`${n.x},${n.y}`);
        });

        /*        console.log("queue after removing finish");
        console.log(queue);
 */
        isFirst = false;
      }
    }

    return null; // No path found
  }

  getNeighbors(grid, { x, y }) {
    const neighbors = [];

    // Define possible moves (up, down, left, right)
    const moves = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 }, // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }, // Right
    ];

    for (const move of moves) {
      const newX = x + move.dx;
      const newY = y + move.dy;

      /*       console.log(newX, newY, grid[newY][newX]); */

      if (
        newX >= 0 &&
        newX < grid[0].length &&
        newY >= 0 &&
        newY < grid.length &&
        grid[newY][newX] !== 0 // Check if it's not a wall
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
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
