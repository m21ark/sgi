import * as THREE from "three";

class MyBillboard extends THREE.Object3D {
  constructor(texturePathList) {
    super();
    const randomIndex = Math.floor(Math.random() * texturePathList.length);
    const selectedTexturePath = texturePathList[randomIndex];

    const loader = new THREE.TextureLoader();
    const texture = loader.load(selectedTexturePath);

    // Create a billboard mesh (for example, a simple plane)
    const billboardGeometry = new THREE.PlaneGeometry(4, 7);
    const billboardMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const billboardMesh = new THREE.Mesh(billboardGeometry, billboardMaterial);
    billboardMesh.lookAt(new THREE.Vector3(0, 0, 1));
    this.billboardMesh = billboardMesh;
    this.add(billboardMesh);
  }

  rotate(camera) {
    // this.billboardMesh.lookAt(camera.position);
  }
}

MyBillboard.prototype.isGroup = true;

export { MyBillboard };
