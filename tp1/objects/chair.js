import * as THREE from "three";
import { Table } from "./table.js";



export class Chair extends THREE.Object3D {

    constructor(width, height, depth, material, XZOffset) {

        super()

        this.chair = new Table(width, height, depth, material, 1.0);

        this.chairSupport = new THREE.BoxGeometry(0.2, width, depth - 0.4);

        this.chairSupportMesh = new THREE.Mesh(this.chairSupport, material);

        
        this.chair.translateX(XZOffset[0]);
        this.chair.translateZ(XZOffset[1]);
        

        this.chairSupportMesh.translateX(XZOffset[0] + (width * XZOffset[2]) / 2);
        this.chairSupportMesh.translateZ(XZOffset[1]);
        this.chairSupportMesh.translateY(1.7);

        this.add(this.chairSupportMesh);
        this.add(this.chair);
    }

}