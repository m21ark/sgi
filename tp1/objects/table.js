import * as THREE from "three";

export class Table extends THREE.Object3D {
  constructor(width, height, depth, material, posToGround) {
    super();

    this.table = new THREE.BoxGeometry(width, height, depth);

    this.table.translate(0, posToGround, 0);

    this.table_leg = new THREE.CylinderGeometry(0.12, 0.12, posToGround);

    const tableMesh = new THREE.Mesh(this.table, material);

    let x = width - 0.4;
    let y = depth - 0.4;

    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.5, 0.5, 0.5), // Set the metal color (gray)
      roughness: 0.2, // Adjust the roughness to control the surface appearance
      metalness: 1.0, // Maximize the metalness for a raw metal look
      map: material.map
    });

    // table legs
    this.table_leg.translate(x / 2, posToGround / 2, -y / 2);

    const table_legMesh1 = new THREE.Mesh(this.table_leg, legMaterial);
    const table_legMesh2 = new THREE.Mesh(this.table_leg, legMaterial);
    const table_legMesh3 = new THREE.Mesh(this.table_leg, legMaterial);
    const table_legMesh4 = new THREE.Mesh(this.table_leg, legMaterial);

    table_legMesh2.translateX(-x);
    table_legMesh3.translateZ(y);
    table_legMesh4.translateX(-x);
    table_legMesh4.translateZ(y);

    this.add(tableMesh);
    this.add(table_legMesh1);
    this.add(table_legMesh2);
    this.add(table_legMesh3);
    this.add(table_legMesh4);
  }
}
