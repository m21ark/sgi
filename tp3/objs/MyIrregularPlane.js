import * as THREE from "three";

export class MyIrregularPlane extends THREE.Object3D {
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

  getGeometry() {
    return this.mesh.geometry;
  }
}

export class PerlinNoise {
  constructor() {
    this.p = [...Array(512)].map(() => Math.floor(Math.random() * 512));
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x) {
    const h = hash & 15;
    const grad = 1 + (h & 7); // Gradient value 1-8
    return (h & 8 ? -grad : grad) * x; // Randomly invert half of them
  }

  noise(x) {
    const X = Math.floor(x) & 255;
    x -= Math.floor(x);
    const u = this.fade(x);
    return (
      this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1)) * 2
    );
  }

  noise2D(x, y) {
    return (this.noise(x) + this.noise(y)) / 2;
  }
}
