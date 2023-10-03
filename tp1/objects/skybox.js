import * as THREE from "three";

export class SkyBox extends THREE.Object3D {
  constructor(size) {
    super();

    // convert original.png -crop 4x3@ output_%d.png

    const texturePath = "./textures/sky_box/sky_box_";
    const textureLoader = new THREE.TextureLoader();

    let textures = [];
    for (let i = 1; i < 7; i++) {
      textures.push(textureLoader.load(texturePath + i + ".png"));
    }

    const materialArray = [];
    for (let i = 0; i < 6; i++) {
      materialArray.push(
        new THREE.MeshBasicMaterial({ map: textures[i], side: THREE.BackSide })
      );
    }

    const skybox = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      materialArray
    );

    // ========================================================================

    this.add(skybox);
  }
}
