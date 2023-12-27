import * as THREE from "three";
import { MyTriangle } from "./MyTriangle.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
import { MyPolygon } from "./MyPolygon.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { MyReader } from "../utils/MyReader.js";
import { ShaderLoader } from "../shaders/ShaderLoader.js";

/**
 * Class that defines how objects should be created
 * @class
 */
export class ObjectBuilder {
  constructor() { }

  static ShaderMaterials = [];

  /**
   * Create a rectangle geometry.
   * @param {Object} rep - The representation object.
   * @returns {THREE.PlaneGeometry} The created rectangle geometry.
   */
  createRectangle(rep, z = 0) {
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
      z
    );

    return geometry;
  }

  /**
   * Creates a tile geometry with the given coordinates and texture.
   * @param {Array<number>} xy1 - The first coordinate of the tile.
   * @param {Array<number>} xy2 - The second coordinate of the tile.
   * @param {number} z - The z-coordinate of the tile.
   * @returns {THREE.PlaneGeometry} The created tile geometry.
   */
  createTileGeometry(xy1, xy2, z = 0) {
    return this.createRectangle(
      { xy1: xy1, xy2: xy2, parts_x: 1, parts_y: 1 },
      z
    );
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

  /**
   * Create a 3D model geometry.
   * @param {Object} rep - The representation object.
   * @returns {THREE.BufferGeometry} The created 3D model geometry.
   */
  async create3dModel(rep, dir = "", group) {
    //check if last 3 dir chars are glb, gltf or obj

    const supportedFormats = ["glb", "gltf", "obj", "dae"];
    const fileExtension = rep.filepath.slice(-3);
    if (!supportedFormats.includes(fileExtension))
      throw new Error(
        "Invalid file format: '" + fileExtension + "'" + " on " + rep.filepath
      );

    if (fileExtension === "obj") {
      const loader = new OBJLoader();
      const mtlLoader = new MTLLoader();

      return new Promise((resolve, reject) => {
        mtlLoader.load(
          dir + rep.filepath.replace(/\.obj$/, ".mtl"),
          (materials) => {
            materials.preload();
            loader.setMaterials(materials);
            loader.load(
              dir + rep.filepath,
              (obj) => {
                const model = obj;

                if (rep.filepath.includes("block")) {
                  // VAI DAR PROBLEMA
                  for (let i = 0; i < model.children.length; i++) {
                    let child = model.children[i];
                    let oldMat = child.material.map;

                    let mat =
                      i == 0 ? MyReader.BlockShaders : MyReader.BlockShaders2;

                    mat.uniforms.map.value = oldMat;
                    child.material = mat;
                  }
                }
                if (rep.filepath.includes("box")) {
                  for (let child of model.children) {
                    let oldMat = child.material.map;
                    let mat = MyReader.BoxesShaders;

                    mat.uniforms.map.value = oldMat;
                    child.material = mat;
                  }
                }
                group.add(model);

                resolve(model);
              },
              undefined,
              (error) => {
                reject(error);
              }
            );
          }
        );
      });
    } else if (fileExtension == "glb" || fileExtension == "gltf") {
      const loader = new GLTFLoader();

      return new Promise((resolve, reject) => {
        loader.load(
          dir + rep.filepath,
          (gltf) => {
            const model = gltf.scene.children[0];
            group.add(model); // Add the model to the group
            resolve(model.geometry);
          },
          undefined,
          (error) => {
            reject(error);
          }
        );
      });
    } else if (fileExtension == "dae") {
      const loader = new ColladaLoader();

      return new Promise((resolve, reject) => {
        loader.load(
          dir + rep.filepath,
          (collada) => {
            const model = collada.scene.children[0];
            group.add(model); // Add the model to the group
            // create a shader texture that rotates the texture of the tires
            let frontObject = model.children.filter(child => child.name.includes("front"))[0];
            let backObject = model.children.filter(child => child.name.includes("back"))[0];
            let arra = [frontObject, backObject];

            let oldMat = arra[0].material;
            let velocity = 0.1; // Define the velocity of rotation

            const [vert, frag] = ShaderLoader.get("shaders/wheel");
            let tire_shader = new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 2 },
                map: { value: oldMat.map },
                velocity: { value: velocity },
              },
              vertexShader: vert,
              fragmentShader: frag,
              transparent: true,
            });
            ObjectBuilder.ShaderMaterials.push(tire_shader);

            for (let i = 0; i < 2; i++) {

              arra[i].material = tire_shader;
            }

            resolve(model.geometry);
          },
          undefined,
          (error) => {
            reject(error);
          }
        );
      });
    }
  }
}
