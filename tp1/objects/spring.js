import * as THREE from "three";

/**
 * A class representing a spring object in 3D space.
 * @extends THREE.Object3D
 */
export class Spring extends THREE.Object3D {
  constructor() {
    super();

    /**
     * The number of coils in the spring.
     * @type {number}
     */
    const numCoils = 5;

    /**
     * The radius of the spring.
     * @type {number}
     */
    const radius = 0.1;

    /**
     * The distance between each coil.
     * @type {number}
     */
    const pitch = 0.1;

    /**
     * The total number of points for the spring.
     * @type {number}
     */
    const totalPoints = 360 * numCoils;

    /**
     * An array of points that define the shape of the spring.
     * @type {THREE.Vector3[]}
     */
    let points = [];

    for (let i = 0; i <= totalPoints; i++) {
      const theta = (i / totalPoints) * numCoils * 2 * Math.PI;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      const z = (i / totalPoints) * numCoils * pitch;
      points.push(new THREE.Vector3(x, y, z));
    }

    /**
     * A curve that defines the shape of the spring.
     * @type {THREE.CatmullRomCurve3}
     */
    let curve = new THREE.CatmullRomCurve3(points);

    /**
     * The geometry of the spring. It gives shape to the line
     * @type {THREE.TubeGeometry}
     */
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      totalPoints,
      0.008,
      8,
      false
    );

    /**
     * The material of the spring.
     * @type {THREE.MeshPhongMaterial}
     */
    this.tubeMaterial = new THREE.MeshPhongMaterial({ color: 0xfcfcfc, emissive: 0x444444 });

    /**
     * The mesh of the spring.
     * @type {THREE.Mesh}
     */
    this.tubeMesh = new THREE.Mesh(tubeGeometry, this.tubeMaterial);

    this.tubeMesh.castShadow = true;
    this.tubeMesh.receiveShadow = true;

    this.add(this.tubeMesh);
  }
}
