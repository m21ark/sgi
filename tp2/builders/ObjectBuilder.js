import * as THREE from "three";
import { MyTriangle } from "./MyTriangle.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
import { MyPolygon } from "./MyPolygon.js";

// defines how objects should be created
export class ObjectBuilder {
    constructor() {
    }

    /**
     * Create a rectangle geometry.
     * @param {Object} rep - The representation object.
     * @returns {THREE.PlaneGeometry} The created rectangle geometry.
     */
    createRectangle(rep) {
        let geometry = new THREE.PlaneGeometry(
            Math.abs(rep.xy1[0] - rep.xy2[0]),
            Math.abs(rep.xy1[1] - rep.xy2[1]),
            rep.parts_x,
            rep.parts_y
        );

        // ofsset the plane so that it is centered on the origin
        geometry.translate(
            (rep.xy1[0] + rep.xy2[0]) / 2,
            (rep.xy1[1] + rep.xy2[1]) / 2,
            0
        );

        return geometry;
    }

    /**
     * Create a box geometry.
     * @param {Object} rep - The representation object.
     * @returns {THREE.BoxGeometry} The created box geometry.
     */
    createBox(rep) {
        let geometry = new THREE.BoxGeometry(
            Math.abs(rep.xyz1[0] - rep.xyz2[0]),
            Math.abs(rep.xyz1[1] - rep.xyz2[1]),
            Math.abs(rep.xyz1[2] - rep.xyz2[2]),
            rep.parts_x,
            rep.parts_y,
            rep.parts_z
        );

        // ofsset the box so that it is centered on the origin
        geometry.translate(
            (rep.xyz1[0] + rep.xyz2[0]) / 2,
            (rep.xyz1[1] + rep.xyz2[1]) / 2,
            (rep.xyz1[2] + rep.xyz2[2]) / 2
        );

        return geometry;
    }

    /**
     * Create a cylinder geometry.
     * @param {Object} rep - The representation object.
     * @returns {THREE.CylinderGeometry} The created cylinder geometry.
     */
    createCylinder(rep) {
        let geometry = new THREE.CylinderGeometry(
            rep.top,
            rep.base,
            rep.height,
            rep.slices,
            rep.stacks,
            rep.capsclose,
            rep.thetastart,
            rep.tethalenght
        );

        return geometry;
    }

     /**
     * Create a triangle geometry.
     * @param {Object} rep - The representation object.
     * @returns {MyTriangle} The created triangle geometry.
     */
    createTriangle(rep) {
        let geometry = new MyTriangle(
            rep.xyz1[0],
            rep.xyz1[1],
            rep.xyz1[2],
            rep.xyz2[0],
            rep.xyz2[1],
            rep.xyz2[2],
            rep.xyz3[0],
            rep.xyz3[1],
            rep.xyz3[2]
        );

        return geometry;
    }

    /**
     * Create a sphere geometry.
     * @param {Object} rep - The representation object.
     * @returns {THREE.SphereGeometry} The created sphere geometry.
     */
    createSphere(rep) {
        let geometry = new THREE.SphereGeometry(
            rep.radius,
            rep.slices,
            rep.stacks,
            rep.phistart,
            rep.philength,
            rep.thetastart,
            rep.thetalength
        );

        return geometry;
    }

    /**
     * Create a NURBS geometry.
     * @param {Object} rep - The representation object.
     * @param {Object} contents - The contents object.
     * @param {Object} father - The father object.
     * @returns {THREE.Geometry} The created NURBS geometry.
     */
    createNurbs(rep, contents, father) {
        let degree_u = rep.degree_u;
        let degree_v = rep.degree_v;
        let parts_u = rep.parts_u;
        let parts_v = rep.parts_v;

        let controlpoints = rep.controlpoints;
        let controlpoints_cleaned = [];

        for (let u = 0; u <= degree_u; u++) {
            let u_l = [];
            for (let v = 0; v <= degree_v; v++) {
                u_l.push([
                    controlpoints[u * (degree_v + 1) + v].xx,
                    controlpoints[u * (degree_v + 1) + v].yy,
                    controlpoints[u * (degree_v + 1) + v].zz,
                    1,
                ]);
            }
            controlpoints_cleaned.push(u_l);
        }

        let builder = new MyNurbsBuilder();

        let geometry = builder.build(
            controlpoints_cleaned,
            degree_u,
            degree_v,
            parts_u,
            parts_v
        );

        // Create a mesh for each control point and add them to the scene
        for (let u = 0; u <= degree_u; u++) {
            for (let v = 0; v <= degree_v; v++) {
                let hue = (u / degree_u) * 100; // Calculate hue value based on u coordinate
                let color = new THREE.Color(`hsl(${hue}, 100%, 50%)`); // Create color using HSL model

                let controlPointGeometry = new THREE.SphereGeometry(0.2);
                let controlPointMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                });
                let controlPointMesh = new THREE.Mesh(
                    controlPointGeometry,
                    controlPointMaterial
                );
                controlPointMesh.position.set(
                    controlpoints[u * (degree_v + 1) + v].xx,
                    controlpoints[u * (degree_v + 1) + v].yy,
                    controlpoints[u * (degree_v + 1) + v].zz
                );
                controlPointMesh.visible = false;
                contents.controlPoints.push(controlPointMesh);
                father.add(controlPointMesh);
            }
        }
        return geometry;
    }

    /**
     * Create a polygon geometry.
     * @param {Object} rep - The representation object.
     * @returns {THREE.BufferGeometry} The created polygon geometry.
     */
    createPolygon(rep) {
        let geometry = MyPolygon.createBufferGeometry(
            rep.radius,
            rep.stacks,
            rep.slices,
            rep.color_c,
            rep.color_p
        );

        return geometry;
    }
}