import * as THREE from "three";
import { TableStruct } from "./tableStruct.js";

/**
 * Chair class
 * @param {number} width // chair width
 * @param {number} height // chair height
 * @param {number} depth // chair depth
 * @param {THREE.Material} material // chair material
 * @param {number[]} XZOffset // chair offset in the XZ plane
 * @param {number} XZOffset[0] - X offset
 * @param {number} XZOffset[1] - Z offset
 * @param {number} XZOffset[2] - X offset for the chair support
 */
export class Chair extends THREE.Object3D {
  constructor(width, height, depth, material, XZOffset) {
    super();

    // chair seat
    this.chair = new TableStruct(width, height, depth, material, 1.0);

    // chair back support
    this.chairSupport = new THREE.BoxGeometry(0.2, width - 0.3, depth);

    this.chairSupportMesh = new THREE.Mesh(this.chairSupport, material);
    this.chairSupportMesh.castShadow = true;
    this.chairSupportMesh.receiveShadow = true;

    // chair position
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
