import * as THREE from "three";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";
import { MyBillboard } from "./MyBillboard.js";
import { CatmullTrack } from "./tracks/CatmullTrack.js";

export class GridParser {
  constructor() {

    this.hitabbleObjs = [];
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
    const squareMesh = new THREE.Mesh(square, this.greenTileMat);
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

    let tree = new MyBillboard([
      "assets/tree1.png",
      "assets/tree2.png",
      "assets/tree3.png",
    ]);

    tree.position.set(x, 3.5, y);

    return tree;
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    const texture = new THREE.TextureLoader().load("./assets/Road-texture.jpg");
    texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({
      map: texture,

      color: 0xffffff,

    });
   
    /*     this.material.map.repeat.set(3, 3);
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping; */

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.3,
      wireframe: true,
      transparent: true,
    });

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  makeCatmullCurve(group, points) {
    const curve = new THREE.CatmullRomCurve3(points);

    this.pathPoints = curve.getPoints(100);

    const catmullTrack = new CatmullTrack(curve, 7, 0.1, 7, 8);
    
    this.createCurveMaterialsTextures();

    this.material.vertexColors = true;
    this.material.needsUpdate = true;

    const mesh = new THREE.Mesh(catmullTrack.geometry, this.material);


    mesh.scale.set(1, 1, 1);
    group.add(mesh);
  }

  

  getKeyPath() {
    let path = [...this.pathPoints] ;
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
