import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LightBuilder } from "./builders/LightBuilder.js";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";
import { MipMapLoader } from "./builders/MipMapLoader.js";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyAICar } from "./MyAICar.js";
import { GridParser } from "./SceneParser.js";

/**
 * MyContents.js
 *
 * This module is responsible for managing the contents of the 3D scene.
 * It provides methods for loading textures, setting materials, creating a skybox, etc.
 */
class MyContents {
  /**
   * Represents a constructor for the MyContents class.
   * @constructor
   * @param {App} app - The application object.
   */
  constructor(app) {
    this.app = app;
    this.axis = null;

    this.lightBuilder = new LightBuilder(app, this);
    this.objectBuilder = new ObjectBuilder();

    // Variables to store the contents of the scene
    this.materials = [];
    this.lights = [];
    this.textures = [];
    this.textureNode = new Map();
    this.cameras = [];
    this.camerasNames = [];

    // GUI variables
    this.useLightHelpers = false;
    this.lightsOn = true;
    this.showHelpers = false;
    this.showControlPoints = false;
    this.controlPoints = [];
    this.moveCar = false;
    this.showAIKeyPoints = false;

    this.useTextures = true;
    this.useBumpMaps = true;
    this.shadowBias = 0;

    this.reader = new MyFileReader(app, this, this.onSceneLoaded);

    this.sceneDir = "scene/";
    this.reader.open(this.sceneDir + "myScene.xml");

    /*     this.sceneDir = "scenes/imported/museum/";
    this.reader.open(this.sceneDir + "museum.xml"); */
  }

  /**
   * Initializes the component.
   * Creates and attaches the axis to the scene if it doesn't exist.
   */
  async init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }

    // TEMPORARIAMENTE AQUI
    this.app.MyHUD.setStatus("PLAY");
    this.app.MyHUD.setLaps(2, 5);
    this.app.MyHUD.setPosition(1, 5);

    // ============== GRID TRACK ====================

    this.gridParser = new GridParser();
    this.gridGroup = await this.gridParser.buildGridGroup(2);
    console.log(this.gridGroup);
    this.app.scene.add(this.gridGroup);

    // ============== Player ====================

    this.addPlayer();
    this.addListeners();
    this.animate();

    // =============== AI CAR =====================

    this.AICar = new MyAICar(this.getTrackPoints());
    this.AICar.addAICar(this.app.scene);
  }

  getTrackPoints() {
    // Temporary placement until track parser with key points is implemented
    return [
      [220, 2, 20],
      [235, 2, 20],
      [240, 2, 100],
      [210, 2, 115],
      [185, 2, 115],
      [170, 2, 125],
      [170, 2, 155],
      [180, 2, 160],
      [180, 2, 190],
      [145, 2, 220],
      [80, 2, 220],
      [50, 2, 210],
      [40, 2, 200],
      [40, 2, 185],
      [70, 2, 155],
      [70, 2, 130],
      [40, 2, 120],
      [40, 2, 75],
      [60, 2, 20],
      [90, 2, 20],
      [115, 2, 45],
      [145, 2, 40],
      [170, 2, 20],
      [220, 2, 20],
    ];
  }

  /**
   * Callback function called when the scene is loaded.
   * @param {any} data - The data passed to the callback function.
   */
  onSceneLoaded(data) {
    this.onAfterSceneLoadedAndBeforeRender(data);
  }

  /**
   * Executes after the scene is loaded and before rendering.
   * @param {object} data - The data object containing various options, fog, textures, materials, cameras, and skyboxes.
   */
  onAfterSceneLoadedAndBeforeRender(data) {
    /*   Object.keys(obj).forEach((key) => {
        console.log(key, obj[key]);
      }) */

    this.setOptions(data.options);
    this.setFog(data.fog);
    this.setTextures(data.textures);
    this.setMaterials(data.materials);
    this.setCameras(data.cameras, data.activeCameraId);
    this.setSkybox(data.skyboxes);

    // Start the traversal from the root node
    this.transverseFromRoot(data);

    const textDraw = new TextSpriteDraw();
    textDraw.write(this.app.scene, 0, 5, 2, "Tenho fome", 12, "0xFF0000");
  }

  /**
   * Updates the content.
   */
  update() {}

  // ===================================== LOADERS =====================================

  /**
   * Sets the textures for the scene.
   *
   * @param {Object} textures - The textures nodes to be converted to textures.
   */
  setTextures(textures) {
    let textureLoader = new THREE.TextureLoader();

    for (let key in textures) {
      let texture = textures[key];
      let textureObj = textureLoader.load(this.sceneDir + texture.filepath);

      if (texture.isVideo) {
        const video = document.createElement("video");
        video.src = this.sceneDir + texture.filepath;
        video.loop = true;
        video.muted = true;
        video.autoplay = true;

        textureObj = new THREE.VideoTexture(video);

        textureObj.format = THREE.RGBAFormat;

        this.textures[key] = textureObj;
      } else {
        switch (texture.magFilter) {
          case "NearestFilter":
            textureObj.magFilter = THREE.NearestFilter;
            break;
          case "LinearFilter":
            textureObj.magFilter = THREE.LinearFilter;
            break;
          default:
            textureObj.magFilter = THREE.LinearFilter;
        }

        switch (texture.minFilter) {
          case "NearestFilter":
            textureObj.minFilter = THREE.NearestFilter;
            break;
          case "LinearFilter":
            textureObj.minFilter = THREE.LinearFilter;
            break;
          case "LinearMipMapLinearFilter":
            textureObj.minFilter = THREE.LinearMipMapLinearFilter;
            break;
          case "LinearMipMapNearestFilter":
            textureObj.minFilter = THREE.LinearMipMapNearestFilter;
            break;
          case "NearestMipMapLinearFilter":
            textureObj.minFilter = THREE.NearestMipMapLinearFilter;
            break;
          case "NearestMipMapNearestFilter":
            textureObj.minFilter = THREE.NearestMipMapNearestFilter;
            break;
          default:
            textureObj.minFilter = THREE.LinearMipMapLinearFilter;
        }
      }

      textureObj = MipMapLoader.createMipMap(
        textureObj,
        this.sceneDir,
        texture
      );

      this.textures[key] = textureObj;
      this.textureNode.set(textureObj, texture);
    }
  }

  /**
   * Clones a texture node.
   *
   * @param {Texture} textureObj - The texture object to clone.
   * @returns {Texture} The cloned texture.
   */
  cloneTextureNode(textureObj) {
    if (textureObj == null) return null;

    // this is not a deepcopy ... it allows to efficiently share the same texture between different objects
    // while still ensuring that length_s and length_t are correctly set ... as those are not passed by ref
    let clonedTexture = textureObj.clone();
    const texture = this.textureNode.get(textureObj);

    this.textureNode.set(clonedTexture, texture);

    clonedTexture = MipMapLoader.createMipMap(
      clonedTexture,
      this.sceneDir,
      texture
    );

    return clonedTexture;
  }

  /**
   *
   * Sets the skybox for the scene.
   *
   * @param {Object} skybox - The skybox data from the parser node.
   */
  setSkybox(skybox) {
    let skyboxInfo = skybox.default;
    this.skyboxV2 = this.createSkybox(skyboxInfo);
    this.app.scene.add(this.skyboxV2);
  }

  /**
   * Sets the materials for the 3D objects based on the provided materials data.
   *
   * @param {Object} materials - The materials data.
   */
  setMaterials(materials) {
    for (let key in materials) {
      let material = materials[key];

      let color = material.color;
      let emissive = material.emissive;
      let specular = material.specular;
      let materialObj;

      if (material.shading === "none") {
        materialObj = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color.r, color.g, color.b),
          map: this.cloneTextureNode(this.textures[material.textureref]),
          specularMap: this.textures[material.specularref] ?? null,
          wireframe: material.wireframe,
          side: material.twosided ? THREE.DoubleSide : THREE.FrontSide,
        });
      } else {
        materialObj = new THREE.MeshPhongMaterial({
          color: new THREE.Color(color.r, color.g, color.b),
          emissive: new THREE.Color(emissive.r, emissive.g, emissive.b),
          specular: new THREE.Color(specular.r, specular.g, specular.b),
          wireframe: material.wireframe,
          shininess: material.shininess,
          side: material.twosided ? THREE.DoubleSide : THREE.FrontSide,
          flatShading: material.shading.toLowerCase() === "flat",
          map: this.cloneTextureNode(this.textures[material.textureref]),
          specularMap: this.textures[material.specularref] ?? null,
          bumpMap: this.textures[material.bumpref] ?? null,
          bumpScale: material.bumpscale,
        });
      }

      if (materialObj.map != null) {
        materialObj.map.repeat.set(material.texlength_s, material.texlength_t);
      }

      this.materials[key] = materialObj;
    }
  }

  /**
   * Sets the cameras in the scene and activates the specified camera.
   * @param {Object} cameras - An object containing the cameras nodes to be added to the scene.
   * @param {string} activeCameraId - The ID of the camera to be set as the active camera.
   */
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
      this.camerasNames.push(camera.id);
    }
    this.app.activeCamera = this.cameras[activeCameraId];
  }

  /**
   * Creates a new orthogonal camera and adds it to the cameras collection.
   * @param {Object} camera - The camera node containing the camera properties.
   */
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
    cam.target = new THREE.Vector3(...camera.target);
    cam.position.set(...camera.location);
    this.cameras[camera.id] = cam;
  }

  /**
   * Creates a new perspective camera and adds it to the cameras array.
   * @param {Object} camera - The camera node containing the camera properties.
   */
  newPerspectiveCamera(camera) {
    const aspect = window.innerWidth / window.innerHeight;
    const cam = new THREE.PerspectiveCamera(
      camera.angle,
      aspect,
      camera.near,
      camera.far
    );
    cam.position.set(...camera.location);
    cam.target = new THREE.Vector3(...camera.target);

    this.cameras[camera.id] = cam;
  }

  /**
   * Sets the options for the scene.
   * @param {Object} options - The options for the scene.
   */
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

  /**
   * Sets the fog for the scene.
   * @param {Object} fog - The fog node.
   */
  setFog(fog) {
    this.app.scene.fog = new THREE.Fog(
      new THREE.Color(fog.color.r, fog.color.g, fog.color.b),
      fog.near,
      fog.far
    );
  }

  /**
   * Creates a duplicate material with modified dimensions for the objects texlenght_s and texlenght_t.
   * @param {THREE.Material} material - The original material to be duplicated.
   * @param {number} width - The new width of the object.
   * @param {number} height - The new height of the object.
   * @returns {THREE.Material} - The duplicated material with modified dimensions for repeat.
   */
  duplicateMaterial(material, width, height) {
    if (material == undefined || material == null)
      material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });

    let materialObj = material.clone();

    if (materialObj.map != null) {
      materialObj.map = this.cloneTextureNode(material.map);

      let lenS = material.map.repeat.x,
        lenT = material.map.repeat.y;

      materialObj.map.repeat.set(width / lenS, height / lenT);

      if (materialObj.bumpMap != null) {
        materialObj.bumpMap.repeat.set(width / lenS, height / lenT);

        materialObj.bumpMap.wrapS = THREE.RepeatWrapping;
        materialObj.bumpMap.wrapT = THREE.RepeatWrapping;
      }

      materialObj.map.wrapS = THREE.RepeatWrapping;
      materialObj.map.wrapT = THREE.RepeatWrapping;

      materialObj.map.needsUpdate = true;
    }

    this.materials.push(materialObj);

    return materialObj;
  }

  /**
   * Creates a THREE.Mesh object based on the given parameters.
   *
   * @param {Object} obj - The object containing the representation and subtype information.
   * @param {THREE.Material} material - The material to be applied to the mesh.
   * @param {THREE.Texture} texture - The texture to be applied to the material.
   * @param {THREE.Object3D} father - The parent object to which the mesh will be added.
   * @returns {THREE.Mesh} The created mesh object.
   */
  setPrimitive(obj, material, texture, father) {
    if (!obj.loaded) return; // to do: how to deal with unloaded objects?

    let geometry = null;
    let rep = obj.representations[0]; // TO DO: multiple representations

    if (obj.loaded)
      switch (obj.subtype) {
        case "rectangle":
          geometry = this.objectBuilder.createRectangle(rep);
          break;
        case "box":
          geometry = this.objectBuilder.createBox(rep);
          break;
        case "cylinder":
          geometry = this.objectBuilder.createCylinder(rep);
          break;
        case "triangle":
          geometry = this.objectBuilder.createTriangle(rep);
          break;
        case "model3d":
          this.objectBuilder.create3dModel(rep, this.sceneDir, obj.group);
          break;
        case "sphere":
          geometry = this.objectBuilder.createSphere(rep);
          break;
        case "skybox":
          return this.createSkybox(rep);
        case "nurbs":
          geometry = this.objectBuilder.createNurbs(rep, this, father);

          break;
        case "polygon":
          if (material != null) {
            material.vertexColors = true;
            material.needsUpdate = true;
          }

          geometry = this.objectBuilder.createPolygon(rep);
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

    defaultMaterial.vertexColors = true;

    let mesh;
    if (obj.subtype != "rectangle") {
      mesh = new THREE.Mesh(geometry, material ?? defaultMaterial);
    } else {
      mesh = new THREE.Mesh(
        geometry,
        this.duplicateMaterial(
          material,
          Math.abs(rep.xy1[0] - rep.xy2[0]),
          Math.abs(rep.xy1[1] - rep.xy2[1])
        ) ?? defaultMaterial
      );
    }

    // make sure the object casts and receives shadows
    if (father.castShadow) mesh.castShadow = true;
    if (father.receiveShadow) mesh.receiveShadow = true;

    return mesh;
  }

  /**
   * Creates a skybox mesh based on the provided representation object.
   * @param {Object} rep - The representation object containing the skybox properties.
   * @returns {THREE.Mesh} The created skybox mesh.
   */
  createSkybox(rep) {
    let skyboxGeometry = new THREE.BoxGeometry(
      rep.size[0],
      rep.size[1],
      rep.size[2]
    );

    const loader = new THREE.TextureLoader();
    let emissive = new THREE.Color(rep.emissive);

    // setting up the materials for the skybox (one for each side)
    let skyboxMaterials = [
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.up),
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.down),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.back),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.left),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.front),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.right),
        emissive: emissive,
        side: THREE.BackSide,
      }),
    ];

    const mesh = new THREE.Mesh(skyboxGeometry, skyboxMaterials);

    mesh.position.set(rep.center[0], rep.center[1], rep.center[2]);

    return mesh;
  }

  /**
   * Converts an angle from degrees to radians.
   * @param {number} angle - The angle in degrees.
   * @returns {number} The angle in radians.
   */
  toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  /**
   * Converts a 3D vector from degrees to radians.
   * @param {number[]} Vector3 - The 3D vector to be converted.
   * @returns {THREE.Vector3} - The converted 3D vector in radians.
   */
  toRadians_3dVector(Vector3) {
    return new THREE.Vector3(
      this.toRadians(Vector3[0]),
      this.toRadians(Vector3[1]),
      this.toRadians(Vector3[2])
    );
  }

  /**
   * Sums two vectors and returns a new vector.
   * @param {THREE.Vector3} vec1 - The first vector.
   * @param {THREE.Vector3} vec2 - The second vector.
   * @returns {THREE.Vector3} The sum of the two vectors.
   */
  sum_position(vec1, vec2) {
    return new THREE.Vector3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
  }

  /**
   * Applies a matrix transformation to the given object's group.
   * The transformation is defined by the object's transformations array.
   * Each transformation can be a translation, rotation, or scale.
   * The accumulated transformation is applied to each child object in the group.
   *
   * @param {Object} obj - The object containing the group and transformations.
   */
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

  /**
   * Loads a Level of Detail (LOD) node into the scene.
   *
   * @param {THREE.Object3D} node - The LOD node to be loaded.
   * @param {THREE.Object3D} parentNode - The parent node to which the LOD node will be added.
   * @param {THREE.Material} parentMaterial - The material to be inherited by the LOD node's children.
   * @param {THREE.Texture} parentTexture - The texture to be inherited by the LOD node's children.
   * @returns {void}
   */
  loadLod(node, parentNode, parentMaterial, parentTexture) {
    let lod = new THREE.LOD();
    parentNode.add(lod);

    this.setMatrixTransform(node);

    lod.castShadow = true; // parser does not support shadows for lod
    lod.receiveShadow = true;
    parentNode.castShadow = true;
    parentNode.receiveShadow = true;

    node.children.forEach((child) => {
      let group = new THREE.Group();

      child.node.group = group;

      if (child.castshadows || node.castShadows || parentNode.castShadow) {
        parentNode.castShadow = true;
        child.castShadows = true;
        group.castShadow = true;
      }
      if (
        child.receiveshadows ||
        node.receiveShadows ||
        parentNode.receiveShadow
      ) {
        parentNode.receiveShadow = true;
        child.receiveShadows = true;
        group.receiveShadow = true;
      }

      this.transverseAndInheritValues(
        child.node,
        group,
        parentMaterial,
        parentTexture
      );

      lod.addLevel(group, child.mindist);
    });
    return;
  }

  // ===================================== END LOADERS =====================================

  /**
   * Traverses the node hierarchy, inheriting values from the parent node and performing necessary transformations.
   * If a node is a leaf node, it creates a primitive and adds it to the parent node.
   * If a node is a light node, it creates the corresponding light object and adds it to the parent node.
   * If a node has children, it creates a group and recursively calls itself for each child node.
   *
   * @param {Object} node - The current node being processed.
   * @param {Object} parentNode - The parent node of the current node.
   * @param {Object} parentMaterial - The material inherited from the parent node.
   * @param {Object} parentTexture - The texture inherited from the parent node.
   * @returns {void}
   */
  transverseAndInheritValues(node, parentNode, parentMaterial, parentTexture) {
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
      if (primitiveMesh != null) parentNode.add(primitiveMesh);
      return;
    } else if (
      ["spotlight", "pointlight", "directionallight"].includes(node.type)
    ) {
      let light = null;
      let helper = null;
      switch (node.type) {
        case "spotlight":
          [light, helper] = this.lightBuilder.setSpotlight(node);
          break;
        case "pointlight":
          [light, helper] = this.lightBuilder.setPointLight(node);
          break;
        case "directionallight":
          [light, helper] = this.lightBuilder.setDirectionalLight(node);
          break;
        default:
          console.log("ERROR: light type not supported");
      }

      parentNode.add(light);
      if (this.useLightHelpers) parentNode.add(helper);
      return;
    }
    // go down the tree if node has children
    if (node.children == null) return;

    node.children.forEach((child) => {
      if (child.type === "lod") {
        this.loadLod(child, parentNode, this_material, parentTexture);
      } else {
        // create and set group

        let group = new THREE.Group();

        if (child.castshadows || node.castShadows || parentNode.castShadow) {
          parentNode.castShadow = true;
          child.castShadows = true;
          group.castShadow = true;
        }
        if (
          child.receiveshadows ||
          node.receiveShadows ||
          parentNode.receiveShadow
        ) {
          parentNode.receiveShadow = true;
          child.receiveShadows = true;
          group.receiveShadow = true;
        }

        parentNode.add(group);
        child.group = group;
        // recursive call
        this.transverseAndInheritValues(
          child,
          group,
          this_material,
          parentTexture
        );
      }
    });
  }

  // Method to start traversal from the root node
  /**
   * Transverses the data from the root node and adds the scene to the app.
   *
   * @param {object} data - The data object containing the nodes and rootId.
   */
  transverseFromRoot(data) {
    const rootNode = data.nodes[data.rootId];
    this.rootScene = new THREE.Group();
    this.rootScene.name = "rootScene";
    this.transverseAndInheritValues(rootNode, this.rootScene);
    this.app.scene.add(this.rootScene);
  }

  // ============================= GUI =============================

  /**
   * Toggles the lights on or off.
   */
  toggleLights() {
    for (let key in this.lights) {
      let light = this.lights[key];
      if (this.lightsOn) light.intensity = 200;
      else light.intensity = 0;
    }
  }

  /**
   * Toggles the visibility of light helpers in the scene.
   */
  toggleLightHelpers() {
    for (let key in this.lights) {
      if (this.showHelpers) this.app.scene.add(this.lights[key + "_helper"]);
      else this.app.scene.remove(this.lights[key + "_helper"]);
    }
  }

  /**
   * Toggles the usage of bump maps for all materials.
   */
  toggleBumpMaps() {
    for (let key in this.materials) {
      let material = this.materials[key];
      material.bumpMap = this.useBumpMaps
        ? this.textures[material.bumpref] ?? null
        : null;

      material.needsUpdate = true;
    }
  }

  /**
   * Toggles the visibility of control points.
   */
  toggleControlPoints() {
    for (let key in this.controlPoints) {
      let controlPoint = this.controlPoints[key];
      controlPoint.visible = this.showControlPoints;
    }
  }

  /**
   * Toggles the textures for all materials.
   */
  toggleTextures() {
    for (let key in this.materials) {
      let material = this.materials[key];
      material.map = this.useTextures
        ? this.textures[material.textureref] ?? null
        : null;

      material.needsUpdate = true;
    }
  }

  /**
   * Modifies the shadow bias for all lights in the scene.
   */
  modifyShadowBias() {
    for (let key in this.lights) {
      let light = this.lights[key];
      light.shadow.bias = this.shadowBias;
    }
  }

  /**
   * Sets the active camera for the application.
   *
   * @param {string} cameraId - The ID of the camera to set as active.
   */
  setActiveCamera(cameraId) {
    this.app.activeCamera = this.cameras[cameraId];
    this.app.controls.object = this.cameras[cameraId];
    this.app.controls = new OrbitControls(
      this.app.activeCamera,
      this.app.renderer.domElement
    );
    this.app.controls.target = this.app.activeCamera.target;
    this.app.controls.enableZoom = true;
    this.app.controls.update();
    this.app.activeCameraName = cameraId;
  }

  // ============== First Person View ====================

  keyboard = {};
  player = null;

  /*
   * Adds a player to the scene that can move around
   */
  addPlayer() {
    const playerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    }); // Customize color as needed
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.set(200, 8, 0);

    this.app.scene.add(this.player);
  }

  /*
   * Adds listeners to the scene that allow the player to move around
   */
  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key.toLowerCase()] = false;
    });
  }

  /*
   * Animates the player
   */
  animate() {
    this.app.MyHUD.setCords(...this.player.position);
    this.app.MyHUD.tickTime();
    this.app.MyHUD.setSpeed(this.player.position.x * 10);
    const playerSpeed = 0.25;
    const rotationSpeed = 0.05;

    const playerDirection = new THREE.Vector3(0, 0, -1); // Initial forward direction

    // Rotate the player's direction based on their current rotation
    playerDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.player.rotation.y
    );

    // Calculate the movement vector based on the player's direction
    const moveVector = new THREE.Vector3();
    if (this.keyboard["w"]) moveVector.sub(playerDirection);
    if (this.keyboard["s"]) moveVector.add(playerDirection);
    if (this.keyboard["a"]) {
      const leftDirection = new THREE.Vector3(1, 0, 0);
      leftDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.player.rotation.y
      );
      moveVector.add(leftDirection);
    }
    if (this.keyboard["d"]) {
      const rightDirection = new THREE.Vector3(-1, 0, 0);
      rightDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.player.rotation.y
      );
      moveVector.add(rightDirection);
    }

    // MOVE UP AND DOWN
    if (this.keyboard[" "]) moveVector.add(new THREE.Vector3(0, 1, 0));
    if (this.keyboard["shift"]) moveVector.sub(new THREE.Vector3(0, 1, 0));

    // Normalize the move vector and apply playerSpeed
    moveVector.normalize().multiplyScalar(playerSpeed);

    // Update player position
    this.player.position.add(moveVector);

    // Vertical rotation
    if (this.keyboard["arrowleft"]) {
      this.player.rotation.x = 0;
      this.player.rotation.y += rotationSpeed;
    }
    if (this.keyboard["arrowright"]) {
      this.player.rotation.x = 0;
      this.player.rotation.y -= rotationSpeed;
    }

    if (this.keyboard["r"]) {
      // reset rotation
      this.player.rotation.x = 0;
      this.player.rotation.y = 0;
      this.player.rotation.z = 0;
      this.keyboard["r"] = false;
    }

    // Update the camera position if the player is in first person view
    if (this.app.activeCameraName === "FirstPerson") this.updatePlayerCamera();

    // =============== AI CAR =====================

    if (this.AICar != undefined && this.moveCar) this.AICar.moveAICar();

    requestAnimationFrame(() => {
      this.animate();
    });
  }

  toogleMoveCar() {
    this.moveCar = !this.moveCar;
  }

  /**
   * Updates the camera position to be relative to the player's position and rotation (first person view)
   */
  updatePlayerCamera() {
    const playerPosition = this.player.position.clone();
    const cameraPosition = this.app.activeCamera.position;

    // Calculate a position relative to the player's rotation
    const relativeCameraOffset = new THREE.Vector3(0, 1, -4); // Adjust the offset as needed
    const cameraOffset = relativeCameraOffset.applyQuaternion(
      this.player.quaternion
    );

    // Set the camera's position to be relative to the player's position
    cameraPosition.copy(playerPosition).add(cameraOffset);

    // Make the camera look at the player's position
    this.app.activeCamera.lookAt(playerPosition);
  }

  toogleShowAIKeyPoints() {
    let keypoints = this.AICar.getAICarKeyPointsGroup().children;

    // display or hide keypoints
    keypoints.forEach((keypoint) => {
      keypoint.visible = this.showAIKeyPoints;
    });
  }
}

export { MyContents };
