import * as THREE from "three";

/**
 * A class representing a skybox object in a Three.js scene.
 * @extends THREE.Object3D
 */
export class SkyBox extends THREE.Object3D {
  /**
   * Creates a new SkyBox object.
   * @param {number} size - The size of the skybox.
   */
  constructor(size) {
    super();

    // convert original.png -crop 4x3@ output_%d.png

    const texturePath = "./textures/sky_box/sky_box_";
    const textureLoader = new THREE.TextureLoader();

    // add all textures to the texture array
    let textures = [];
    for (let i = 1; i < 7; i++) {
      textures.push(textureLoader.load(texturePath + i + ".png"));
    }

    // create the material array
    const materialArray = [];
    for (let i = 0; i < 6; i++) {
      materialArray.push(
        new THREE.MeshBasicMaterial({ map: textures[i], side: THREE.BackSide })
      );
    }

    // create the skybox
    const skybox = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      materialArray
    );

    // ========================================================================

    this.add(skybox);
  }
}
