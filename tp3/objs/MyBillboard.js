import * as THREE from "three";

export class MyBillboard extends THREE.Object3D {
  constructor(texturePathList, count) {
    super();
    const randomIndex = Math.floor(Math.random() * count) + 1;
    const selectedTexturePath = texturePathList + "tree" + randomIndex + ".png";

    const loader = new THREE.TextureLoader();
    const texture = loader.load(selectedTexturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Create a billboard mesh (for example, a simple plane)
    const billboardGeometry = new THREE.PlaneGeometry(10, 14);
    const billboardMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const billboardMesh = new THREE.Mesh(billboardGeometry, billboardMaterial);
    billboardMesh.lookAt(new THREE.Vector3(0, 0, 1));
    this.billboardMesh = billboardMesh;
    this.add(billboardMesh);
  }

  update(camPos) {
    let pos = camPos.clone();
    pos.y = 0;
    this.billboardMesh.lookAt(pos);
  }
}
