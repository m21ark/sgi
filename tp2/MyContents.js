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

  output(obj, indent = 0) {
    console.log(
      "" +
        new Array(indent * 4).join(" ") +
        " - " +
        obj.type +
        " " +
        (obj.id !== undefined ? "'" + obj.id + "'" : "")
    );
  }

  onAfterSceneLoadedAndBeforeRender(data) {
    /*   Object.keys(obj).forEach((key) => {
        console.log(key, obj[key]);
      }) */

    this.setOptions(data.options);
    this.setFog(data.fog);
    this.setTextures(data.textures);
    this.setMaterials(data.materials);
    this.setCameras(data.cameras);

    return;

    console.log("nodes:");
    for (var key in data.nodes) {
      let node = data.nodes[key];
      this.output(node, 1);
      for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        if (child.type === "primitive") {
          console.log(
            "" +
              new Array(2 * 4).join(" ") +
              " - " +
              child.type +
              " with " +
              child.representations.length +
              " " +
              child.subtype +
              " representation(s)"
          );
          if (child.subtype === "nurbs") {
            console.log(
              "" +
                new Array(3 * 4).join(" ") +
                " - " +
                child.representations[0].controlpoints.length +
                " control points"
            );
          }
        } else {
          this.output(child, 2);
        }
      }
    }
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

  endFunc() {
    // console.log(this.textures);
    // console.log(this.materials);
    console.log(this.cameras);
    // console.log(this.lights);
  }
}

export { MyContents };
