import * as THREE from "three";
import { NURBSSurface } from "three/addons/curves/NURBSSurface.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

/**
 * Represents a NURBS (Non-Uniform Rational B-Spline) builder.
 * @extends THREE.Object3D
 */
export class MyNurbsBuilder extends THREE.Object3D {
  /**
   * Builds a parametric geometry using control points, degrees, and samples.
   * @param {Array<Array<Array<number>>>} controlPoints - The control points of the NURBS surface.
   * @param {number} degree1 - The degree of the NURBS surface in the first direction.
   * @param {number} degree2 - The degree of the NURBS surface in the second direction.
   * @param {number} samples1 - The number of samples in the first direction.
   * @param {number} samples2 - The number of samples in the second direction.
   * @returns {THREE.ParametricGeometry} The generated parametric geometry.
   */
  build(controlPoints, degree1, degree2, samples1, samples2) {
    const knots1 = [];
    const knots2 = [];

    // build knots1
    for (let i = 0; i <= degree1; i++) knots1.push(0);
    for (let i = 0; i <= degree1; i++) knots1.push(1);

    // build knots2
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

    // build surface
    const nurbsSurface = new NURBSSurface(
      degree1,
      degree2,
      knots1,
      knots2,
      stackedPoints
    );

    // build geometry from surface
    const geometry = new ParametricGeometry(
      getSurfacePoint,
      samples1,
      samples2
    );

    return geometry;

    /**
     * Calculates the surface point at the given u and v parameters.
     * @param {number} u - The u parameter.
     * @param {number} v - The v parameter.
     * @param {Vector3} target - The target vector to store the result.
     * @returns {Vector3} The surface point.
     */
    function getSurfacePoint(u, v, target) {
      return nurbsSurface.getPoint(u, v, target);
    }
  }
}
