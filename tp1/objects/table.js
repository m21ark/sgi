import * as THREE from "three";
import { TableStruct } from "./tableStruct.js";
import { Chair } from "./chair.js";

export class Table extends THREE.Object3D {
  constructor(tableMaterial, chairMaterial) {
    super();
    this.tableMaterial = tableMaterial;
    this.chairMaterial = chairMaterial;

    const chairNormalTexture = new THREE.TextureLoader().load("textures/chairN.jpg");
    this.chairMaterial.normalMap = chairNormalTexture;
    const tableNormalTexture = new THREE.TextureLoader().load("textures/woodN.jpg");
    this.tableMaterial.normalMap = tableNormalTexture;


    this.tableStruct = new TableStruct(6, 0.2, 10, this.tableMaterial, 2.0);

    this.chairs = [
      new Chair(2.5, 0.2, 2.5, this.chairMaterial, [2.5, 2.8, 1]),
      new Chair(2.5, 0.2, 2.5, this.chairMaterial, [-2.5, 2.8, -1]),
      new Chair(2.5, 0.2, 2.5, this.chairMaterial, [2.5, -2.8, 1]),
      new Chair(2.5, 0.2, 2.5, this.chairMaterial, [-2.5, -2.8, -1]),
    ];

    this.tableStruct.scale.set(1, 1.4, 1);

    this.tableStruct.add(this.chairs[0]);
    this.tableStruct.add(this.chairs[1]);
    this.tableStruct.add(this.chairs[2]);
    this.tableStruct.add(this.chairs[3]);
    this.add(this.tableStruct);
  }
}
