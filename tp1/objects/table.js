import * as THREE from "three";

export class Table extends THREE.Object3D {

    constructor(width, height, depth, material) {

        super()

        this.table = new THREE.BoxGeometry(width, height, depth);


        this.table.translate(0, 2, 0);

        this.table_leg = new THREE.CylinderGeometry(0.12, 0.12, 2);
  
        
        const tableMesh = new THREE.Mesh(this.table, material);

        // table legs
        this.table_leg.translate(2.8, 1.0, -4.8);
        const table_legMesh1 = new THREE.Mesh(this.table_leg, material);
        const table_legMesh2 = new THREE.Mesh(this.table_leg, material);
        const table_legMesh3 = new THREE.Mesh(this.table_leg, material);
        const table_legMesh4 = new THREE.Mesh(this.table_leg, material);

        table_legMesh2.translateX(-5.6);
        table_legMesh3.translateZ(9.6);
        table_legMesh4.translateX(-5.6);
        table_legMesh4.translateZ(9.6);

        
        this.add(tableMesh);
        this.add(table_legMesh1);
        this.add(table_legMesh2);
        this.add(table_legMesh3);
        this.add(table_legMesh4);

    }


}
