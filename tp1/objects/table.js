import * as THREE from "three";
import { TableStruct } from "./tableStruct.js";
import { Chair } from "./chair.js";

/**
 * Represents a table object in a 3D scene.
 * @extends THREE.Object3D
 */
export class Table extends THREE.Object3D {
  /**
   * Creates a new Table object.
   * @param {THREE.Material} tableMaterial - The material to use for the table.
   * @param {THREE.Material} chairMaterial - The material to use for the chairs.
   */
  constructor(tableMaterial, chairMaterial) {
    super();
    this.tableMaterial = tableMaterial;
    this.chairMaterial = chairMaterial;

    // Load normal textures for the materials
    const chairNormalTexture = new THREE.TextureLoader().load(
      "textures/chairN.jpg"
    );
    this.chairMaterial.normalMap = chairNormalTexture;
    const tableNormalTexture = new THREE.TextureLoader().load(
      "textures/woodN.jpg"
    );
    this.tableMaterial.normalMap = tableNormalTexture;

    // Create the table structure and chairs
    this.tableStruct = new TableStruct(6, 0.2, 10, this.tableMaterial, 2.0);
    this.chairs = [
      new Chair(2.6, 0.2, 2.5, this.chairMaterial, [2.5, 2.8, 1]),
      new Chair(2.6, 0.2, 2.5, this.chairMaterial, [-2.5, 2.8, -1]),
      new Chair(2.6, 0.2, 2.5, this.chairMaterial, [2.5, -2.8, 1]),
      new Chair(2.6, 0.2, 2.5, this.chairMaterial, [-2.5, -2.8, -1]),
    ];

    // Set the scale of the table structure and add the chairs to it
    this.tableStruct.scale.set(1, 1.4, 1);
    this.tableStruct.add(this.chairs[0]);
    this.tableStruct.add(this.chairs[1]);
    this.tableStruct.add(this.chairs[2]);
    this.tableStruct.add(this.chairs[3]);

    // Add the table structure to the table object
    this.add(this.tableStruct);
  }
}
