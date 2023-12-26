// WaterClass.js
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { MyIrregularPlane } from "./MyIrregularPlane.js";

/**
 * Represents a water object in a 3D scene.
 * @extends THREE.Object3D
 */
export class MyWater extends THREE.Object3D {
  /**
   * Creates a new instance of MyWater.
   * @constructor
   * @param {number} [width=10] - The width of the water.
   * @param {number} [height=10] - The height of the water.
   * @param {boolean} [makeLake=false] - Whether to create a lake or a regular water plane.
   */
  constructor(width = 10, height = 10, makeLake = false) {
    super();
    this.width = width;
    this.height = height;

    if (makeLake) this.lakeGeom = this.generateLakeGeom();
    else this.lakeGeom = new THREE.PlaneGeometry(width, height);

    this.water = new Water(this.lakeGeom, {
      waterNormals: new THREE.TextureLoader().load(
        "assets/waternormals.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      waterColor: 0x0052ac,
      distortionScale: 0,
    });

    this.water.material.needsUpdate = true;

    if (makeLake) {
      this.water.rotation.x = -Math.PI / 2;
      this.water.scale.set(20, 35, 10); // only for the hardcoded lake
    }

    this.add(this.water);
  }

  /**
   * Updates the water material uniforms.
   */
  update() {
    const time = performance.now() * 0.0001;
    this.water.material.uniforms["time"].value = time;
  }

  /**
   * Generates a lake geometry.
   * @returns {THREE.Geometry} The generated lake geometry.
   */
  generateLakeGeom() {
    const lakeVertices = [
      new THREE.Vector3(2.45, 0.78, 0),
      new THREE.Vector3(3.06, 0.84, 0),
      new THREE.Vector3(3.61, 0.87, 0),
      new THREE.Vector3(4.37, 1.1, 0),
      new THREE.Vector3(4.7, 1.4, 0),
      new THREE.Vector3(4.9, 1.76, 0),
      new THREE.Vector3(4.96, 2.35, 0),
      new THREE.Vector3(5.0, 2.67, 0),
      new THREE.Vector3(5.0, 3.16, 0),
      new THREE.Vector3(4.82, 3.64, 0),
      new THREE.Vector3(4.6, 3.9, 0),
      new THREE.Vector3(4.12, 4.1, 0),
      new THREE.Vector3(3.7, 4.04, 0),
      new THREE.Vector3(3.23, 3.9, 0),
      new THREE.Vector3(3.1, 3.57, 0),
      new THREE.Vector3(2.84, 3.11, 0),
      new THREE.Vector3(2.34, 2.84, 0),
      new THREE.Vector3(1.7, 2.75, 0),
      new THREE.Vector3(1.48, 2.16, 0),
      new THREE.Vector3(1.54, 1.65, 0),
      new THREE.Vector3(1.6, 1.13, 0),
      new THREE.Vector3(2.07, 0.95, 0),
    ];

    // use catmull and give those points

    const curve = new THREE.CatmullRomCurve3(lakeVertices);
    const points = curve.getPoints(100);

    /*
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const radius = 50 + 20 * perlin.noise2D(Math.cos(angle), Math.sin(angle));
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      lakeVertices.push(new THREE.Vector3(x, 0, y));
    }

    // This generates a random lake like shape but it's not very pretty
    */

    const lake = new MyIrregularPlane(points);
    return lake.getGeometry();
  }
}
