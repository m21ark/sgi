import * as THREE from "three";

/**
 * Represents a tree object in a 3D scene.
 * @class
 * @extends THREE.Object3D
 */
export class MyTree extends THREE.Object3D {
  /**
   * Creates a new instance of MyTree.
   * @constructor
   * @param {string} texturePathList - The path to the directory containing the tree textures.
   * @param {number} count - The number of available tree textures.
   */
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

  /**
   * Updates the tree's orientation to face the camera.
   * @param {THREE.Vector3} camPos - The position of the camera.
   */
  update(camPos) {
    // only rotate on y axis towards camera
    const target = new THREE.Vector3(camPos.x, this.position.y, camPos.z);
    this.lookAt(target);
  }
}
