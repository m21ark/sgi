import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
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
    this.transverseFromRoot(data);
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
        flatShading: material.shading.toLowerCase() === "flat", // ver melhor isto
        map:
          material.textureref != null
            ? this.textures[material.textureref]
            : null,
        // falta texlength_s, texlength_t
      });

      this.materials[key] = materialObj;
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
        new THREE.Color(options.ambient.r, options.ambient.g, options.ambient.b)
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

  setPrimitive(obj, material, texture, father) {
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

          // ofsset the plane so that it is centered on the origin
          geometry.translate(
            (rep.xy1[0] + rep.xy2[0]) / 2,
            (rep.xy1[1] + rep.xy2[1]) / 2,
            0
          );
          break;
        case "box":
          geometry = new THREE.BoxGeometry(
            Math.abs(rep.xyz1[0] - rep.xyz2[0]),
            Math.abs(rep.xyz1[1] - rep.xyz2[1]),
            Math.abs(rep.xyz1[2] - rep.xyz2[2])
          );

          // ofsset the box so that it is centered on the origin
          geometry.translate(
            (rep.xyz1[0] + rep.xyz2[0]) / 2,
            (rep.xyz1[1] + rep.xyz2[1]) / 2,
            (rep.xyz1[2] + rep.xyz2[2]) / 2
          );
          break;
        case "cylinder":
          geometry = new THREE.CylinderGeometry(
            rep.top,
            rep.base,
            rep.height,
            rep.slices,
            rep.stacks,
            rep.capsclose,
            rep.thetastart,
            rep.tethalenght
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

          geometry = builder.build(
            controlpoints_cleaned,
            degree_u,
            degree_v,
            parts_u,
            parts_v
          );

          break;

        case "spotlight":
          this.setSpotlight(obj);
          break;
        case "pointlight":
          this.setPointLight(obj);
          break;
        case "directionallight":
          this.setDirectionalLight(obj);
          break;
        default:
          console.log("ERROR: primitive type not supported");
      }

    if (geometry === null) return;
    if (texture != null && material != null) material.map = texture;

    let defaultMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    let mesh = new THREE.Mesh(geometry, material ?? defaultMaterial);

    return mesh;
  }

  setDirectionalLight(obj) {
    // creation
    let directionalLight = new THREE.DirectionalLight(
      THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity
    );

    if (!obj.enabled) directionalLight.intensity = 0;

    // position and target
    directionalLight.position.set(...obj.position);
    // directionalLight.target.position.set(...obj.target);
    // VER COMO FAZER TARGET? TALVEZ SEJA O PAI

    //shadows
    directionalLight.castShadow = obj.castshadow;
    directionalLight.shadow.mapSize.width = obj.shadowmapsize;
    directionalLight.shadow.mapSize.height = obj.shadowmapsize;
    directionalLight.shadow.camera.far = obj.shadowfar;

    directionalLight.shadow.camera.left = obj.shadowleft;
    directionalLight.shadow.camera.right = obj.shadowright;
    directionalLight.shadow.camera.top = obj.shadowtop;
    directionalLight.shadow.camera.bottom = obj.shadowbottom;

    this.lights[obj.id] = directionalLight;
  }

  toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  toRadians_3dVector(Vector3) {
    return new THREE.Vector3(
      this.toRadians(Vector3[0]),
      this.toRadians(Vector3[1]),
      this.toRadians(Vector3[2])
    );
  }

  sum_position(vec1, vec2) {
    return new THREE.Vector3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
  }

  setMatrixTransform(obj) {
    if (obj.group == null || obj.transformations == null) {
      return;
    }

    // Initialize arrays for translation, rotation, and scale matrices
    const translationMatrices = [];
    const rotationMatrices = [];
    const scaleMatrices = [];

    for (let i = 0; i < obj.transformations.length; i++) {
      let transf = obj.transformations[i];

      switch (transf.type) {
        case "T":
          const translation = new THREE.Vector3(...transf.translate);
          const translationMatrix = new THREE.Matrix4().makeTranslation(
            translation.x,
            translation.y,
            translation.z
          );
          translationMatrices.push(translationMatrix);
          break;
        case "R":
          const rotation = new THREE.Euler().setFromVector3(
            new THREE.Vector3(...this.toRadians_3dVector(transf.rotation))
          );
          const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
            rotation
          );
          rotationMatrices.push(rotationMatrix);
          break;
        case "S":
          const scale = new THREE.Vector3(...transf.scale);
          const scaleMatrix = new THREE.Matrix4().makeScale(
            scale.x,
            scale.y,
            scale.z
          );
          scaleMatrices.push(scaleMatrix);
          break;
        default:
          console.log("ERROR: Transformation type not supported");
      }
    }

    // Combine the accumulated transformation matrices for each type
    const transformationMatrix = new THREE.Matrix4();

    translationMatrices.forEach((translationMatrix) => {
      transformationMatrix.multiply(translationMatrix);
    });

    rotationMatrices.forEach((rotationMatrix) => {
      transformationMatrix.multiply(rotationMatrix);
    });

    scaleMatrices.forEach((scaleMatrix) => {
      transformationMatrix.multiply(scaleMatrix);
    });

    // Apply the accumulated transformation to each child object in the group
    obj.group.applyMatrix4(transformationMatrix);
  }

  setPointLight(obj) {
    // creation
    let pointLight = new THREE.PointLight(
      THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      obj.decay
    );

    if (!obj.enabled) pointLight.intensity = 0;

    // position
    pointLight.position.set(...obj.location);

    //shadows
    pointLight.castShadow = obj.castshadow;
    pointLight.shadow.mapSize.width = obj.shadowmapsize;
    pointLight.shadow.mapSize.height = obj.shadowmapsize;
    pointLight.shadow.camera.far = obj.shadowfar;

    this.lights[obj.id] = pointLight;
  }

  setSpotlight(obj) {
    // creation
    let spotLight = new THREE.SpotLight(
      THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      obj.angle,
      obj.penumbra,
      obj.decay
    );

    if (!obj.enabled) spotLight.intensity = 0;

    // position and target
    spotLight.position.set(...obj.location);
    spotLight.target.position.set(...obj.target);

    //shadows
    spotLight.castShadow = obj.castshadow;
    spotLight.shadow.mapSize.width = obj.shadowmapsize;
    spotLight.shadow.mapSize.height = obj.shadowmapsize;
    spotLight.shadow.camera.far = obj.shadowfar;

    this.lights[obj.id] = spotLight;
  }

  // ===================================== END LOADERS =====================================

  transverseAndInheritValues(node, parentNode, parentMaterial, parentTexture) {
    // recursive function to transverse the scene graph and create the objects
    // a node is checked if it is a leaf node, aka if it has a primitive
    // if it is a leaf node, a primitive is created and added to the scene
    // if it is not a leaf node, the function is called again for each child node
    // while going down, the transformations are applied to the object
    // while going up, the material and texture are inherited from the parent node if they are not defined in the current node

    let this_material = parentMaterial;

    // Inherit values from the parent
    if (Array.isArray(node.materialIds) && node.materialIds.length)
      this_material = this.materials[node.materialIds];

    // set transformations
    this.setMatrixTransform(node);

    // check if leaf node and create primitive if it is, breaking the recursion
    if (node.type === "primitive") {
      let primitiveMesh = this.setPrimitive(
        node,
        this_material,
        parentTexture,
        parentNode
      );
      parentNode.add(primitiveMesh);
      return;
    }

    // go down the tree if node has children
    if (node.children == null) return;

    node.children.forEach((child) => {
      // create and set group
      let group = new THREE.Group();
      parentNode.add(group);
      child.group = group;

      // recursive call
      this.transverseAndInheritValues(
        child,
        group,
        this_material,
        parentTexture
      );
    });
  }

  // Method to start traversal from the root node
  transverseFromRoot(data) {
    const rootNode = data.nodes[data.rootId];
    this.rootScene = new THREE.Group();
    this.transverseAndInheritValues(rootNode, this.rootScene);
    this.app.scene.add(this.rootScene);
  }

  endFunc() {
    //  console.log(this.textures);
    // console.log(this.materials);
    // console.log(this.cameras);
    // console.log(this.objs);
    console.log(this.app.scene);
  }
}

export { MyContents };
