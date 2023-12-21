import * as THREE from "three";

export class CatmullTrack {
  constructor(catmullCurve, width = 1, height = 1, depth = 1, segments = 50) {
    this.catmullCurve = catmullCurve;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.segments = segments;

    this.points = this.generatePoints();
    this.geometry = this.createGeometry();
  }

  generatePoints() {
    const points = [];
    const totalPoints = this.segments * this.catmullCurve.arcLengthDivisions;

    for (let i = 0; i < totalPoints; i++) {
      const t = i / totalPoints;
      const point = this.catmullCurve.getPoint(t);
      points.push(point);
    }

    return points;
  }

  createGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const uv = [];
    const colors = [];
    const indices = [];

    const color = new THREE.Color();

    this.width = 7;
    this.height = 0.01;
    this.depth = 7;

    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const halfDepth = this.depth / 2;
    let verticesArray;

    let lastV = 0;
    let add = true;
    let repeatInc = 1 / 10;

    for (let i = 0; i < this.points.length - 1; i++) {

      const point = this.points[i];

      const nextPoint = this.points[i + 1];

      const tangent = nextPoint.clone().sub(point).normalize();
      const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
      const binormal = tangent.clone().cross(normal).normalize();


      verticesArray = [
        point.x - normal.x * halfWidth - binormal.x * halfDepth,
        point.y + halfHeight,
        point.z - normal.z * halfWidth - binormal.z * halfDepth,

        point.x + normal.x * halfWidth + binormal.x * halfDepth,
        point.y + halfHeight,
        point.z + normal.z * halfWidth + binormal.z * halfDepth,


      ];



      const indicesArray = [
        0, 1, 2,
        1, 3, 2,
      ].map(indicesArray => indicesArray + i * 2);

      if (i == this.points.length - 2) {
        // change numbers bigger than 3 to 0...3
        indicesArray.forEach((element, index) => {
          if (element - i * 2 > 1) {
            indicesArray[index] = element - i * 2 - 2;
          }
        });
      }



      indices.push(...indicesArray);

      vertices.push(...verticesArray);

      // Generate UV coordinates based on the current point


      if (add)
        lastV += repeatInc;
      else
        lastV -= repeatInc;

      if (lastV == 1) 
        add = false;
      else if (lastV == 0)
        add = true;

      const uvArray = [
        0.0, lastV,
        1.0, lastV,
      ];

      uv.push(...uvArray);


      for (let i = 0; i < 2; i++) colors.push(0.8, 0.8, 0.8);
    }

    const verticesFloat32Array = new Float32Array(vertices);
    const uvFloat32Array = new Float32Array(uv);
    const colorsFloat32Array = new Float32Array(colors);
    const indicesUint16Array = new Uint16Array(indices);

    const positionAttribute = new THREE.BufferAttribute(
      verticesFloat32Array,
      3
    );
    const uvAttribute = new THREE.BufferAttribute(uvFloat32Array, 2);
    const colorAttribute = new THREE.BufferAttribute(colorsFloat32Array, 3);
    const indexAttribute = new THREE.BufferAttribute(indicesUint16Array, 1);

      
    console.log(uvAttribute)
    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("uv", uvAttribute);
    geometry.setAttribute("color", colorAttribute);
    geometry.setIndex(indexAttribute);

    return geometry;
  }
}
