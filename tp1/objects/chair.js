import * as THREE from "three";
import { Table } from "./table.js";

export class Chair extends THREE.Object3D {

    constructor(width, height, depth, material, XZOffset) {

        super()

        this.chair = new Table(width, height, depth, material, 1.0);


        console.log(XZOffset);

        this.chair.translateX(XZOffset[0]);
        this.chair.translateZ(XZOffset[1]);

        this.add(this.chair);
    }

}