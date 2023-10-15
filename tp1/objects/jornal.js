import * as THREE from "three";
import { NURBSSurface } from "three/addons/curves/NURBSSurface.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

/**
 * Jornal class
 */
export class Jornal extends THREE.Object3D {
  constructor() {
    super();

    // ==================== MATERIALS ====================

    this.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load("textures/jornal_tex.jpeg"),
    });

    // Parametrization letiables
    const numPages = 8;
    const spacing = 0.015; // Adjust the spacing between pages as needed
    const centerX = ((numPages - 1) * spacing) / 2; // Calculate the center of the pages

    // Create the control points for each page
    for (let i = 0; i < numPages; i++) {
      let controlPoints = [
        // U = 0
        [
          [0, 0, 0.9, 1],
          [1, 0, 0.9, 1],
          [1, 0.2, 0.9, 1],
          [0, 0.04, 0.9, 1],
        ],
        [
          [0, 0, 0, 1],
          [1, 0, 0, 1],
          [1, 0.2, 0, 1],
          [0, 0.04, 0, 1],
        ],
        // U = 1
      ];

      // Adjust the X values of control points to bring pages closer to the center
      for (let j = 0; j < controlPoints.length; j++) {
        controlPoints[j][0][3] -= i * spacing;
        controlPoints[j][0][2] -= i * spacing;
        controlPoints[j][1][3] -= i * spacing;
        controlPoints[j][1][2] -= i * spacing;
      }

      // Create the NURBS surface for each page
      const surfaceData = this.build(
        controlPoints,
        1,
        3,
        this.samplesU,
        this.samplesV,
        this.material
      );
      const mesh = new THREE.Mesh(surfaceData, this.material);

      // Adjust scale and position of the pages (in order to stack them)
      mesh.scale.set(-1, -1, -1);
      mesh.position.set(-i * spacing, 0, 0);

      this.add(mesh);
    }
  }

  build(controlPoints, degree1, degree2, samples1, samples2, material) {
    const knots1 = [];
    const knots2 = [];

    // build knots1 = [ 0, 0, 0, 1, 1, 1 ];

    for (let i = 0; i <= degree1; i++) knots1.push(0);

    for (let i = 0; i <= degree1; i++) knots1.push(1);

    // build knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];

    for (let i = 0; i <= degree2; i++) knots2.push(0);

    for (let i = 0; i <= degree2; i++) knots2.push(1);

    let stackedPoints = [];

    for (let i = 0; i < controlPoints.length; i++) {
      let row = controlPoints[i];

      let newRow = [];

      for (let j = 0; j < row.length; j++) {
        let item = row[j];

        newRow.push(
          new THREE.Vector4(
            item[0],

            item[1],
            item[2],
            item[3]
          )
        );
      }

      stackedPoints[i] = newRow;
    }

    const nurbsSurface = new NURBSSurface(
      degree1,
      degree2,

      knots1,
      knots2,
      stackedPoints
    );

    const geometry = new ParametricGeometry(
      getSurfacePoint,

      samples1,
      samples2
    );

    return geometry;

    // Calculate the surface point
    function getSurfacePoint(u, v, target) {
      return nurbsSurface.getPoint(u, v, target);
    }
  }
}
