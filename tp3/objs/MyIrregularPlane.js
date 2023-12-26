import * as THREE from "three";

/**
 * Represents an irregular plane in 3D space.
 * @extends THREE.Object3D
 */
export class MyIrregularPlane extends THREE.Object3D {
  /**
   * Creates a new instance of MyIrregularPlane.
   * @param {THREE.Vector3[]} vertices - The vertices of the plane.
   * @param {THREE.Material} [material=null] - The material to be applied to the plane.
   */
  constructor(vertices, material = null) {
    super();

    // Convert vertices to BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(vertices);

    // Create faces
    const numVertices = vertices.length;
    const indices = [];
    for (let i = 0; i < numVertices - 2; i++) {
      indices.push(0, i + 1, i + 2);
    }

    geometry.setIndex(indices);

    // Create a material
    let defaultMat = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    // Create a mesh using the geometry and material
    this.mesh = new THREE.Mesh(geometry, material ? material : defaultMat);

    // Add the mesh to the object's internal structure
    this.add(this.mesh);
  }

  /**
   * Get the geometry of the irregular plane.
   * @returns {THREE.BufferGeometry} The geometry of the plane.
   */
  getGeometry() {
    return this.mesh.geometry;
  }
}

/**
 * Class representing Perlin Noise.
 */
export class PerlinNoise {
  /**
   * Create a PerlinNoise object.
   */
  constructor() {
    this.p = [...Array(512)].map(() => Math.floor(Math.random() * 512));
  }

  /**
   * Performs fade operation on a given value.
   * @param {number} t - The value to fade.
   * @returns {number} The faded value.
   */
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Performs linear interpolation between two values.
   * @param {number} t - The interpolation factor.
   * @param {number} a - The start value.
   * @param {number} b - The end value.
   * @returns {number} The interpolated value.
   */
  lerp(t, a, b) {
    return a + t * (b - a);
  }

  /**
   * Calculates the gradient value based on a hash and a given value.
   * @param {number} hash - The hash value.
   * @param {number} x - The input value.
   * @returns {number} The gradient value.
   */
  grad(hash, x) {
    const h = hash & 15;
    const grad = 1 + (h & 7); // Gradient value 1-8
    return (h & 8 ? -grad : grad) * x; // Randomly invert half of them
  }

  /**
   * Generates Perlin noise for a given value.
   * @param {number} x - The input value.
   * @returns {number} The Perlin noise value.
   */
  noise(x) {
    const X = Math.floor(x) & 255;
    x -= Math.floor(x);
    const u = this.fade(x);
    return (
      this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1)) * 2
    );
  }

  /**
   * Generates Perlin noise for a given 2D coordinate.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The Perlin noise value.
   */
  noise2D(x, y) {
    return (this.noise(x) + this.noise(y)) / 2;
  }
}
