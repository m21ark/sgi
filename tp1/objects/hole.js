import * as THREE from "three";

/**
 * Hole class - creates a parametrizable wall with a hole in the middle
 * @param {number} frameDepth - depth of the frame
 * @param {number} frameHeight - height of the frame
 * @param {number} frameLength - length of the frame
 * @param {number} Xthickness - thickness of the X frame
 * @param {number} Ythickness - thickness of the Y frame
 * @param {THREE.Material} boxMaterial - material of the frame
 */
export class Hole extends THREE.Object3D {
  constructor(
    frameDepth = 1,
    frameHeight = 2,
    frameLength = 6,
    Xthickness = 0.2,
    Ythickness = 0.3,
    boxMaterial = new THREE.MeshPhongMaterial({
      color: "#F2F2F2",
      specular: "#ffffff",
      emissive: "#000000",
      shininess: 30,
    })
  ) {
    super();

    // create the 4 boxes that compose the frame
    var box1 = new THREE.Mesh(
      new THREE.BoxGeometry(frameLength, Ythickness, frameDepth),
      boxMaterial
    );
    box1.castShadow = true;
    box1.receiveShadow = true;
    var box2 = new THREE.Mesh(
      new THREE.BoxGeometry(frameLength, Ythickness, frameDepth),
      boxMaterial
    );
    box2.castShadow = true;
    box2.receiveShadow = true;
    var box3 = new THREE.Mesh(
      new THREE.BoxGeometry(Xthickness, frameHeight + Ythickness, frameDepth),
      boxMaterial
    );
    box3.castShadow = true;
    box3.receiveShadow = true;
    var box4 = new THREE.Mesh(
      new THREE.BoxGeometry(Xthickness, frameHeight + Ythickness, frameDepth),
      boxMaterial
    );
    box4.castShadow = true;
    box4.receiveShadow = true;

    box1.position.set(0, 0, 0);
    box2.position.set(0, frameHeight, 0);
    box3.position.set(-(frameLength / 2) + Xthickness / 2, frameHeight / 2, 0);
    box4.position.set(frameLength / 2 - Xthickness / 2, frameHeight / 2, 0);

    const group = new THREE.Group();

    group.add(box1);
    group.add(box2);
    group.add(box3);
    group.add(box4);
    group.rotation.y = Math.PI / 2;

    this.add(group);
  }
}
