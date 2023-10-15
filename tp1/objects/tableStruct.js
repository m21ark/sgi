import * as THREE from "three";

/**
 * A class representing a table structure: the table top and the table legs.
 * @extends THREE.Object3D
 */
export class TableStruct extends THREE.Object3D {
  /**
   * Creates a table structure.
   * @param {number} width - The width of the table.
   * @param {number} height - The height of the table.
   * @param {number} depth - The depth of the table.
   * @param {THREE.Material} material - The material of the table.
   * @param {number} posToGround - The position of the table to the ground.
   */
  constructor(width, height, depth, material, posToGround) {
    super();

    /**
     * The geometry of the table structure.
     * @type {THREE.BoxGeometry}
     */
    this.TableStruct = new THREE.BoxGeometry(width, height, depth);

    this.TableStruct.translate(0, posToGround, 0);

    /**
     * The geometry of the table legs.
     * @type {THREE.CylinderGeometry}
     */
    this.TableStruct_leg = new THREE.CylinderGeometry(0.12, 0.12, posToGround);

    const TableStructMesh = new THREE.Mesh(this.TableStruct, material);
    TableStructMesh.castShadow = true;
    TableStructMesh.receiveShadow = true;

    let x = width - 0.4;
    let y = depth - 0.4;

    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.5, 0.5, 0.5),
      roughness: 0.2,
      metalness: 1.0,
      map: material.map,
    });

    // TableStruct legs
    this.TableStruct_leg.translate(x / 2, posToGround / 2, -y / 2);

    const TableStruct_legMesh1 = new THREE.Mesh(
      this.TableStruct_leg,
      legMaterial
    );
    const TableStruct_legMesh2 = new THREE.Mesh(
      this.TableStruct_leg,
      legMaterial
    );
    const TableStruct_legMesh3 = new THREE.Mesh(
      this.TableStruct_leg,
      legMaterial
    );
    const TableStruct_legMesh4 = new THREE.Mesh(
      this.TableStruct_leg,
      legMaterial
    );

    TableStruct_legMesh1.castShadow = true;
    TableStruct_legMesh1.receiveShadow = true;
    TableStruct_legMesh2.castShadow = true;
    TableStruct_legMesh2.receiveShadow = true;
    TableStruct_legMesh3.castShadow = true;
    TableStruct_legMesh3.receiveShadow = true;
    TableStruct_legMesh4.castShadow = true;
    TableStruct_legMesh4.receiveShadow = true;

    TableStruct_legMesh2.translateX(-x);
    TableStruct_legMesh3.translateZ(y);
    TableStruct_legMesh4.translateX(-x);
    TableStruct_legMesh4.translateZ(y);

    this.add(TableStructMesh);
    this.add(TableStruct_legMesh1);
    this.add(TableStruct_legMesh2);
    this.add(TableStruct_legMesh3);
    this.add(TableStruct_legMesh4);
  }
}
