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

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];

            // Create parallelepiped vertices based on the point
            const halfWidth = this.width / 2;
            const halfHeight = this.height / 2;
            const halfDepth = this.depth / 2;

            const verticesArray = [
                point.x - halfWidth, point.y - halfHeight, point.z - halfDepth,
                point.x + halfWidth, point.y - halfHeight, point.z - halfDepth,
                point.x + halfWidth, point.y + halfHeight, point.z - halfDepth,
                point.x - halfWidth, point.y + halfHeight, point.z - halfDepth,
                point.x - halfWidth, point.y - halfHeight, point.z + halfDepth,
                point.x + halfWidth, point.y - halfHeight, point.z + halfDepth,
                point.x + halfWidth, point.y + halfHeight, point.z + halfDepth,
                point.x - halfWidth, point.y + halfHeight, point.z + halfDepth,
            ];

            const startIndex = i * 8;

            // Define indices for the parallelepiped
            const indicesArray = [
                0, 1, 2, 2, 3, 0,
                4, 5, 6, 6, 7, 4,
                0, 4, 7, 7, 3, 0,
                1, 5, 6, 6, 2, 1,
                0, 1, 5, 5, 4, 0,
                2, 3, 7, 7, 6, 2
            ].map(index => index + startIndex);

            indices.push(...indicesArray);

            vertices.push(...verticesArray);

            // Generate UV coordinates based on the current point
            const u = i / (this.points.length - 1);
            const v = 0.5;

            const uvArray = [
                u, v,
                u + 1 / (this.segments - 1), v,
                u + 1 / (this.segments - 1), v + 1,
                u, v + 1,
            ];

            uv.push(...uvArray);

            // Set color for each vertex
            color.setHSL(u, 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        }

        const verticesFloat32Array = new Float32Array(vertices);
        const uvFloat32Array = new Float32Array(uv);
        const colorsFloat32Array = new Float32Array(colors);
        const indicesUint16Array = new Uint16Array(indices);

        const positionAttribute = new THREE.BufferAttribute(verticesFloat32Array, 3);
        const uvAttribute = new THREE.BufferAttribute(uvFloat32Array, 2);
        const colorAttribute = new THREE.BufferAttribute(colorsFloat32Array, 3);
        const indexAttribute = new THREE.BufferAttribute(indicesUint16Array, 1);

        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('color', colorAttribute);
        geometry.setIndex(indexAttribute);

        return geometry;
    }
}