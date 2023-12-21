// WaterClass.js
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";

export class MyWater extends THREE.Object3D {
  constructor(width = 10, height = 10) {
    super();
    this.width = width;
    this.height = height;

    const waterGeometry = new THREE.PlaneGeometry(this.width, this.height);

    this.water = new Water(waterGeometry, {
      waterNormals: new THREE.TextureLoader().load(
        "assets/waternormals.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      waterColor: 0x0052ac,
      distortionScale: 1,
    });

    this.water.rotation.x = -Math.PI / 2;
    this.add(this.water);
  }

  update() {
    const time = performance.now() * 0.0001;
    this.water.material.uniforms["time"].value = time;
  }
}
