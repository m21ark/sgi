import * as THREE from "three";
import { TableStruct } from "./tableStruct.js";

export class Chair extends THREE.Object3D {
  constructor(width, height, depth, material, XZOffset) {
    super();

    this.chair = new TableStruct(width, height, depth, material, 1.0);

    this.chairSupport = new THREE.BoxGeometry(0.2, width - 0.3, depth);

    this.chairSupportMesh = new THREE.Mesh(this.chairSupport, material);

    this.chair.translateX(XZOffset[0]);
    this.chair.translateZ(XZOffset[1]);
    this.chair.scale.set(1, 1.15, 1);

    const offset = XZOffset[0] > 0 ? 0.1 : -0.1;

    this.chairSupportMesh.translateX(
      offset + XZOffset[0] + (width * XZOffset[2]) / 2
    );
    this.chairSupportMesh.translateZ(XZOffset[1]);
    this.chairSupportMesh.translateY(2.185);

    this.add(this.chairSupportMesh);
    this.add(this.chair);
  }
}
