import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { NURBSSurface } from "three/addons/curves/NURBSSurface.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
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
    this.setCameras(data.cameras, data.activeCameraId);
    // Start the traversal from the root node
    this.traverseFromRoot(data);

    // TO-DO: TRAVEL THE GRAPH AND SET THE OBJECTS STARTING AT data.rootId
    // and visiting data.nodes that contain .children
    /*  for (let key in data.nodes) {
      let node = data.nodes[key];
      for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        if (child.type === "primitive") this.setPrimitve(child);
      }
    } */

    // display objects (TO DO: to change later for groups)
    for (let key in this.objs) this.app.scene.add(this.objs[key]);
  }

  update() { }

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
        flatShading: material.shading.toLowerCase() === "flat", // ver melhor isto
        map:
          material.textureref != null
            ? this.textures[material.textureref]
            : null,
        // falta texlength_s, texlength_t
      });

      this.materials[material.id] = materialObj;
    }
  }

  setCameras(cameras, activeCameraId) {
    for (let key in cameras) {
      let camera = cameras[key];

      if (camera.type == "orthogonal") {
        this.newOrthogonalCamera(camera);
      } else if (camera.type == "perspective") {
        this.newPerspectiveCamera(camera);
      } else {
        console.log("ERROR: camera type not supported");
      }

      this.app.scene.add(this.cameras[camera.id]);
    }
    this.app.activeCamera = this.cameras[activeCameraId];
    this.app.controls.object = this.cameras[activeCameraId];
    //this.app.controls = new OrbitControls(
    //  this.app.activeCamera,
    //  this.app.renderer.domElement
    //);
    //this.app.controls.enableZoom = true;
    //this.app.controls.update();
    //this.app.activeCameraName = activeCameraId;
    //this.app.controls == null ; ... fazer estes 2 n funciona por alguma razão ... o updateCameraIfRequired meio que faz o mesmo
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

  setPrimitive(obj, material, texture) {
    if (!obj.loaded) return; // to do: how to deal with unloaded objects?

    let geometry = null;
    let rep = obj.representations[0]; // TO DO: multiple representations

    if (obj.loaded)
      switch (obj.subtype) {
        case "rectangle":
          geometry = new THREE.PlaneGeometry(
            Math.abs(rep.xy1[0] - rep.xy2[0]),
            Math.abs(rep.xy1[1] - rep.xy2[1]) // TO-DO waht is parts_x and parts_y?
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
        case "nurbs":
          let degree_u = obj.representations[0].degree_u;
          let degree_v = obj.representations[0].degree_v;
          let parts_u = obj.representations[0].parts_u;
          let parts_v = obj.representations[0].parts_v;


          let controlpoints = obj.representations[0].controlpoints;
          let controlpoints_cleaned = [];


          for (let u = 0; u <= degree_u; u++) {
            let u_l = []
            for (let v = 0; v <= degree_v; v++) {

              u_l.push([controlpoints[u * (degree_v + 1) + v].xx,
              controlpoints[u * (degree_v + 1) + v].yy,
              controlpoints[u * (degree_v + 1) + v].zz, 1])
            }
            controlpoints_cleaned.push(u_l);
          }


          let builder = new MyNurbsBuilder();

          geometry = builder.build(controlpoints_cleaned, degree_u, degree_v, parts_u, parts_v, material);


          break;
        case "controlpoint":
          // TO-DO impelment
          /*
            {name: "xx", type: "float"},
            {name: "yy", type: "float"},
            {name: "zz", type: "float"},
          */
          break;

        case "spotlight":
          // TO-DO impelment
          break;

        case "pointlight":
          // TO-DO impelment
          break;

        case "directionallight":
          // TO-DO impelment
          break;
        default:
          console.log("ERROR: primitive type not supported");
      }

    if (geometry === null) return;
    if (texture != null && material != null) material.map = texture;

    let defaultMaterial = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
      wireframe: true,
    });

    let mesh = new THREE.Mesh(
      geometry,
      /* material ? material : */ defaultMaterial
    );
    this.objs.push(mesh);
  }

  // ===================================== END LOADERS =====================================

  // Define a method to traverse and inherit values
  traverseAndInheritValues(node, parentMaterial, parentTexture) {
    // Inherit values from the parent
    if (node.materialIds != null)
      if (node.materialIds.length > 0)
        for (let i = 0; i < node.materialIds.length; i++) {
          let material = this.materials[node.materialIds[i]];
          if (material) parentMaterial = material;
        }

    if (node.type === "primitive")
      this.setPrimitive(node, parentMaterial, parentTexture);

    // Traverse the children recursively
    if (node.children && node.children.length > 0)
      for (let i = 0; i < node.children.length; i++)
        this.traverseAndInheritValues(
          node.children[i],
          parentMaterial,
          parentTexture
        );
  }

  // Method to start traversal from the root node
  traverseFromRoot(data) {
    const rootNode = data.nodes[data.rootId];
    this.traverseAndInheritValues(rootNode, null, null);
  }

  endFunc() {
    //  console.log(this.textures);
    // console.log(this.materials);
    // console.log(this.cameras);
    // console.log(this.objs);
  }
}

export { MyContents };
