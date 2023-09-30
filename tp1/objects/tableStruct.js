import * as THREE from "three";

export class TableStruct extends THREE.Object3D {
  constructor(width, height, depth, material, posToGround) {
    super();

    this.TableStruct = new THREE.BoxGeometry(width, height, depth);

    this.TableStruct.translate(0, posToGround, 0);

    this.TableStruct_leg = new THREE.CylinderGeometry(0.12, 0.12, posToGround);

    const TableStructMesh = new THREE.Mesh(this.TableStruct, material);

    let x = width - 0.4;
    let y = depth - 0.4;

    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.5, 0.5, 0.5), // Set the metal color (gray)
      roughness: 0.2, // Adjust the roughness to control the surface appearance
      metalness: 1.0, // Maximize the metalness for a raw metal look
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
