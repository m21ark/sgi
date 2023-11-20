import * as THREE from "three";

/**
 * Represents a polygon with a buffer geometry.
 */
export class MyPolygon {
  /**
   * Creates a buffer geometry for the polygon.
   * @param {number} radius - The radius of the polygon.
   * @param {number} stacks - The number of stacks in the polygon.
   * @param {number} slices - The number of slices in the polygon.
   * @param {string} color_c - The center color of the polygon.
   * @param {string} color_p - The periphery color of the polygon.
   * @returns {THREE.BufferGeometry} The buffer geometry of the polygon.
   */
  static createBufferGeometry(radius, stacks, slices, color_c, color_p) {
    const vertices = [];
    const colors = [];
    const centerColor = new THREE.Color(color_c);
    const peripheryColor = new THREE.Color(color_p);

    // create vertices and color
    for (let j = 0; j <= stacks; j++) {
      for (let i = 0; i <= slices; i++) {
        const v = j / stacks;
        const theta = (i / slices) * Math.PI * 2;
        const x = radius * v * Math.cos(theta);
        const y = radius * v * Math.sin(theta);
        vertices.push(x, y, 0);
        const color = new THREE.Color().lerpColors(
          centerColor,
          peripheryColor,
          v
        );
        colors.push(color.r, color.g, color.b);
      }
    }

    // create indices
    const indices = [];
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const k = i * (slices + 1) + j;
        indices.push(k, k + slices + 1, k + 1);
        indices.push(k + 1, k + slices + 1, k + slices + 2);
      }
    }

    // create uvs
    const uvs = [];
    for (let j = 0; j <= stacks; j++) {
      for (let i = 0; i <= slices; i++) {
        const u = i / slices;
        const v = j / stacks;
        uvs.push(u, v);
      }
    }

    // create geometry and set attributes
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
  }
}
