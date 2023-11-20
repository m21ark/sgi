import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyPolygon } from "./MyPolygon.js";
import { MyTriangle } from "./MyTriangle.js";

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

    this.useTextures = true;
    this.useBumpMaps = true;
    this.shadowBias = 0;

    this.reader = new MyFileReader(app, this, this.onSceneLoaded);

    this.sceneDir = "scenes/demo/";
    this.reader.open(this.sceneDir + "myScene.xml");

    /*     this.sceneDir = "scenes/imported/museum/";
    this.reader.open(this.sceneDir + "museum.xml"); */
  }

  init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }
  }

  onSceneLoaded(data) {
    this.onAfterSceneLoadedAndBeforeRender(data);
  }

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
  }

  update() { }
  /**
   * Loads a mipmap texture and creates a mipmap for the specified level.
   * 
   * @param {THREE.Texture} parentTexture - The parent texture to set the mipmap image.
   * @param {number} level - The level of the mipmap.
   * @param {string} path - The path to the texture image.
   */
  loadMipmap(parentTexture, level, path) {
    // load texture. On loaded call the function to create the mipmap for the specified level
    new THREE.TextureLoader().load(
      path,
      function (
        mipmapTexture // onLoad callback
      ) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.scale(1, 1);

        // const fontSize = 48
        const img = mipmapTexture.image;
        canvas.width = img.width;
        canvas.height = img.height;

        // first draw the image
        ctx.drawImage(img, 0, 0);

        // set the mipmap image in the parent texture in the appropriate level
        parentTexture.mipmaps[level] = canvas;
      },
      undefined, // onProgress callback currently not supported
      function (err) {
        console.error(
          "Unable to load the image " +
          path +
          " as mipmap level " +
          level +
          ".",
          err
        );
      }
    );
  }

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

      if (texture.mipmap0 != null) {
        textureObj.generateMipmaps = false;

        this.loadMipmap(textureObj, 0, this.sceneDir + texture.mipmap0);
        if (texture.mipmap1)
          this.loadMipmap(textureObj, 1, this.sceneDir + texture.mipmap1);
        if (texture.mipmap2)
          this.loadMipmap(textureObj, 2, this.sceneDir + texture.mipmap2);
        if (texture.mipmap3)
          this.loadMipmap(textureObj, 3, this.sceneDir + texture.mipmap3);
        if (texture.mipmap4)
          this.loadMipmap(textureObj, 4, this.sceneDir + texture.mipmap4);
        if (texture.mipmap5)
          this.loadMipmap(textureObj, 5, this.sceneDir + texture.mipmap5);
        if (texture.mipmap6)
          this.loadMipmap(textureObj, 6, this.sceneDir + texture.mipmap6);
        if (texture.mipmap7)
          this.loadMipmap(textureObj, 7, this.sceneDir + texture.mipmap7);

        textureObj.needsUpdate = true;
      }

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
    const clonedTexture = textureObj.clone();
    const texture = this.textureNode.get(textureObj);

    this.textureNode.set(clonedTexture, texture);

    if (texture.mipmap0 != null) {
      clonedTexture.generateMipmaps = false;

      this.loadMipmap(clonedTexture, 0, this.sceneDir + texture.mipmap0);
      if (texture.mipmap1)
        this.loadMipmap(clonedTexture, 1, this.sceneDir + texture.mipmap1);
      if (texture.mipmap2)
        this.loadMipmap(clonedTexture, 2, this.sceneDir + texture.mipmap2);
      if (texture.mipmap3)
        this.loadMipmap(clonedTexture, 3, this.sceneDir + texture.mipmap3);
      if (texture.mipmap4)
        this.loadMipmap(clonedTexture, 4, this.sceneDir + texture.mipmap4);
      if (texture.mipmap5)
        this.loadMipmap(clonedTexture, 5, this.sceneDir + texture.mipmap5);
      if (texture.mipmap6)
        this.loadMipmap(clonedTexture, 6, this.sceneDir + texture.mipmap6);
      if (texture.mipmap7)
        this.loadMipmap(clonedTexture, 7, this.sceneDir + texture.mipmap7);

      clonedTexture.needsUpdate = true;
    }

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
    cam.lookAt(new THREE.Vector3(...camera.target));
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
    cam.lookAt(new THREE.Vector3(...camera.target));
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
    }

    materialObj.map.needsUpdate = true;

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
          geometry = new THREE.PlaneGeometry(
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
          break;
        case "box":
          geometry = new THREE.BoxGeometry(
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
          geometry = new MyTriangle(
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
          break;
        case "model3d":
          console.log("Model 3D not supported yet");
          break;
        case "sphere":
          geometry = new THREE.SphereGeometry(
            rep.radius,
            rep.slices,
            rep.stacks,
            rep.phistart,
            rep.philength,
            rep.thetastart,
            rep.thetalength
          );
          break;
        case "skybox":
          return this.createSkybox(rep);
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
              this.controlPoints.push(controlPointMesh);
              father.add(controlPointMesh);
            }
          }

          break;
        case "polygon":
          if (material != null) {
            material.vertexColors = true;
            material.needsUpdate = true;
          }

          geometry = MyPolygon.createBufferGeometry(
            rep.radius,
            rep.stacks,
            rep.slices,
            rep.color_c,
            rep.color_p
          );

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

    // TODO: Textures are not in the correct order
    let skyboxMaterials = [
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.left),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.right),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.up),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.down),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.front),
        emissive: emissive,
        side: THREE.BackSide,
      }),
      new THREE.MeshPhongMaterial({
        map: loader.load(this.sceneDir + rep.back),
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
   * Creates and sets up a point light in the scene.
   * 
   * @param {Object} obj - The configuration object for the point light.
   * @returns {Array} An array containing the point light and its helper.
   */
  setPointLight(obj) {
    // creation
    let pointLight = new THREE.PointLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      obj.decay
    );

    if (!obj.enabled) pointLight.intensity = 0;

    // position
    pointLight.position.set(...obj.position);

    //shadows
    pointLight.castShadow = obj.castshadow;
    pointLight.shadow.mapSize.width = obj.shadowmapsize;
    pointLight.shadow.mapSize.height = obj.shadowmapsize;
    pointLight.shadow.camera.far = obj.shadowfar;

    pointLight.shadow.bias = this.shadowBias;

    this.lights[obj.id] = pointLight;

    // create helper
    let pointLightHelper = new THREE.PointLightHelper(pointLight);
    this.lights[obj.id + "_helper"] = pointLightHelper;

    return [pointLight, pointLightHelper];
  }

  /**
   * Sets up a directional light based on the provided object.
   * 
   * @param {Object} obj - The object containing the properties for the directional light.
   * @returns {Array} An array containing the directional light and its helper.
   */
  setDirectionalLight(obj) {
    // creation
    let directionalLight = new THREE.DirectionalLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity
    );

    if (!obj.enabled) directionalLight.intensity = 0;

    // position and target
    directionalLight.position.set(...obj.position);
    directionalLight.target.position.set(...[0, 0, 0]);
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

    directionalLight.shadow.bias = this.shadowBias;

    this.lights[obj.id] = directionalLight;

    // create helper
    let directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight
    );
    this.lights[obj.id + "_helper"] = directionalLightHelper;

    return [directionalLight, directionalLightHelper];
  }

  /**
   * Sets up a spotlight with the provided parameters.
   * 
   * @param {Object} obj - The object containing spotlight properties.
   * @returns {Array} An array containing the spotlight and its helper.
   */
  setSpotlight(obj) {
    // creation
    let spotLight = new THREE.SpotLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      this.toRadians(obj.angle),
      obj.penumbra,
      obj.decay
    );

    if (!obj.enabled) spotLight.intensity = 0;

    // position and target
    spotLight.position.set(...obj.position);
    spotLight.target.position.set(...obj.target);

    //shadows
    spotLight.castShadow = obj.castshadow;
    spotLight.shadow.mapSize.width = obj.shadowmapsize;
    spotLight.shadow.mapSize.height = obj.shadowmapsize;
    spotLight.shadow.camera.far = obj.shadowfar;

    spotLight.shadow.bias = this.shadowBias;

    this.lights[obj.id] = spotLight;

    // create helper
    let spotLightHelper = new THREE.SpotLightHelper(spotLight);
    this.lights[obj.id + "_helper"] = spotLightHelper;

    return [spotLight, spotLightHelper];
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
      parentNode.add(primitiveMesh);
      return;
    } else if (
      ["spotlight", "pointlight", "directionallight"].includes(node.type)
    ) {
      let light = null;
      let helper = null;
      switch (node.type) {
        case "spotlight":
          [light, helper] = this.setSpotlight(node);
          break;
        case "pointlight":
          [light, helper] = this.setPointLight(node);
          break;
        case "directionallight":
          [light, helper] = this.setDirectionalLight(node);
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

  // =======================================

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

  // pontos auxiliares nurbs
}

export { MyContents };
