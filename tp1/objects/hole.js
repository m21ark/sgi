import * as THREE from "three";

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

    var box1 = new THREE.Mesh(
      new THREE.BoxGeometry(frameLength, Ythickness, frameDepth),
      boxMaterial
    );
    var box2 = new THREE.Mesh(
      new THREE.BoxGeometry(frameLength, Ythickness, frameDepth),
      boxMaterial
    );
    var box3 = new THREE.Mesh(
      new THREE.BoxGeometry(Xthickness, frameHeight + Ythickness, frameDepth),
      boxMaterial
    );
    var box4 = new THREE.Mesh(
      new THREE.BoxGeometry(Xthickness, frameHeight + Ythickness, frameDepth),
      boxMaterial
    );

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
