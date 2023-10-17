import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.axis = null;

    this.reader = new MyFileReader(app, this, this.onSceneLoaded);
    this.reader.open("scenes/demo/demo.xml");

    // Variables to store the contents of the scene
    this.materials = [];
    this.lights = [];
    this.textures = [];
    this.cameras = [];
    this.objs = [];
  }

  /**
   * initializes the contents
   */
  init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }
  }

  /**
   * Called when the scene xml file load is complete
   * @param {MySceneData} data the entire scene data object
   */
  onSceneLoaded(data) {
    console.info(
      "scene data loaded " +
        data +
        ". visit MySceneData javascript class to check contents for each data item."
    );
    this.onAfterSceneLoadedAndBeforeRender(data);

    this.endFunc();
  }

  onAfterSceneLoadedAndBeforeRender(data) {
    /*   Object.keys(obj).forEach((key) => {
        console.log(key, obj[key]);
      }) */

    console.log(data);

    this.setOptions(data.options);
    this.setFog(data.fog);
    this.setTextures(data.textures);
    this.setMaterials(data.materials);
    this.setCameras(data.cameras);

    // TO-DO: TRAVEL THE GRAPH AND SET THE OBJECTS STARTING AT data.rootId
    // and visiting data.nodes that contain .children
    for (let key in data.nodes) {
      let node = data.nodes[key];
      for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        if (child.type === "primitive") this.setPrimitve(child);
      }
    }

    // display objects (TO DO: to change later for groups)
    for (let key in this.objs) this.app.scene.add(this.objs[key]);
  }

  update() {}

  // ===================================== LOADERS =====================================

  setTextures(textures) {
    // ['id', 'filepath', 'type', 'custom']

    let textureLoader = new THREE.TextureLoader();

    for (let key in textures) {
      let texture = textures[key];

      // load texture
      let textureObj = textureLoader.load("scenes/demo/" + texture.filepath);
      this.textures[texture.id] = textureObj;
    }
  }

  setMaterials(materials) {
    for (let key in materials) {
      let material = materials[key];

      let color = material.color;
      let emissive = material.emissive;
      let specular = material.specular;

      let materialObj = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color.r, color.g, color.b),
        emissive: new THREE.Color(emissive.r, emissive.g, emissive.b),
        specular: new THREE.Color(specular.r, specular.g, specular.b),
        wireframe: material.wireframe,
        shininess: material.shininess,
        side: material.twosided ? THREE.DoubleSide : THREE.FrontSide,
        flatShading: material.shading.toLowerCase() === "flat",
        map: this.textures[material.textureref],
        // falta texlength_s, texlength_t
      });

      this.materials[material.id] = materialObj;
    }
  }

  setCameras(cameras) {
    // TO DO: SET ACTIVE CAM TO: data.activeCameraId

    for (let key in cameras) {
      let camera = cameras[key];

      if (camera.type == "orthogonal") {
        this.newOrthogonalCamera(camera);
      } else if (camera.type == "perspective") {
        this.newPerspectiveCamera(camera);
      } else {
        console.log("ERROR: camera type not supported");
      }
    }
  }

  newOrthogonalCamera(camera) {
    const cam = new THREE.OrthographicCamera(
      camera.left,
      camera.right,
      camera.top,
      camera.bottom,
      camera.near,
      camera.far
    );
    cam.up = new THREE.Vector3(0, 1, 0);
    cam.position.set(...camera.location);
    cam.lookAt(new THREE.Vector3(...camera.target));
    this.cameras[camera.id] = cam;
  }

  newPerspectiveCamera(camera) {
    const aspect = window.innerWidth / window.innerHeight;
    const cam = new THREE.PerspectiveCamera(
      camera.angle,
      aspect,
      camera.near,
      camera.far
    );
    cam.position.set(...camera.location);
    cam.lookAt(new THREE.Vector3(...camera.target));
    this.cameras[camera.id] = cam;
  }

  setOptions(options) {
    this.app.scene.background = new THREE.Color(
      options.background.r,
      options.background.g,
      options.background.b
    );

    this.app.scene.add(
      new THREE.AmbientLight(
        options.ambient.r,
        options.ambient.g,
        options.ambient.b
      )
    );
  }

  setFog(fog) {
    this.app.scene.fog = new THREE.Fog(
      new THREE.Color(fog.color.r, fog.color.g, fog.color.b),
      fog.near,
      fog.far
    );
  }

  setPrimitve(obj) {
    if (obj.subtype === "nurbs") return; // TO DO
    if (!obj.loaded) return; // to do: how to deal with unloaded objects?

    let geometry = null;
    let rep = obj.representations[0]; // TO DO: multiple representations

    if (obj.loaded)
      switch (obj.subtype) {
        case "rectangle":
          geometry = new THREE.PlaneGeometry(
            Math.abs(rep.xy1[0] - rep.xy2[0]),
            Math.abs(rep.xy1[1] - rep.xy2[1])
          );
          break;
        case "box":
          geometry = new THREE.BoxGeometry(
            Math.abs(rep.xyz1[0] - rep.xyz2[0]),
            Math.abs(rep.xyz1[1] - rep.xyz2[1]),
            Math.abs(rep.xyz1[2] - rep.xyz2[2])
          );
          break;
        case "cylinder":
          geometry = new THREE.CylinderGeometry(
            obj.top,
            obj.base,
            obj.height,
            obj.slices,
            obj.stacks,
            obj.capsclose,
            obj.thetastart,
            obj.tethalenght
          );

          break;
        case "triangle":
          geometry = new THREE.Geometry();
          geometry.vertices.push(
            new THREE.Vector3(obj.xyz1[0], obj.xyz1[1], obj.xyz1[2])
          );
          geometry.vertices.push(
            new THREE.Vector3(obj.xyz2[0], obj.xyz2[1], obj.xyz2[2])
          );
          geometry.vertices.push(
            new THREE.Vector3(obj.xyz3[0], obj.xyz3[1], obj.xyz3[2])
          );
          geometry.faces.push(new THREE.Face3(0, 1, 2));
          geometry.computeFaceNormals();
          break;
        case "sphere":
          geometry = new THREE.SphereGeometry(
            obj.radius,
            obj.slices,
            obj.stacks,
            obj.phistart,
            obj.philength,
            obj.thetastart,
            obj.thetalength
          );
          break;
        default:
          console.log("ERROR: primitive type not supported");
      }

    if (geometry === null) return;

    let mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        wireframe: true,
      })
    );

    this.objs.push(mesh);
  }

  endFunc() {
    //  console.log(this.textures);
    // console.log(this.materials);
    // console.log(this.cameras);
    // console.log(this.objs);
  }
}

export { MyContents };
