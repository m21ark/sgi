import * as THREE from "three";
import { LightBuilder } from "./builders/LightBuilder.js";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";
import { MipMapLoader } from "./builders/MipMapLoader.js";
import { MyCar } from "./MyCar.js";

export class XMLLoader {
  constructor(contents) {
    this.app = contents.app;
    this.lightBuilder = new LightBuilder(this.app, contents);
    this.objectBuilder = new ObjectBuilder();
    this.materials = [];
    this.textures = [];
    this.textureNode = new Map();
    this.cameras = [];
    this.useLightHelpers = false;
    this.sceneDir = "scene/";
  }

  loadXMLScene(data) {
    this.setOptions(data.options);
    this.setFog(data.fog);
    this.setTextures(data.textures);
    this.setMaterials(data.materials);
    this.setCameras(data.cameras, data.activeCameraId);
    this.setSkybox(data.skyboxes);
    this.transverseFromRoot(data);
    return this.app;
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
          if (!rep.filepath.includes("kart"))
            this.objectBuilder.create3dModel(rep, this.sceneDir, obj.group);
          else {
            this.objectBuilder.create3dModel(
              rep,
              this.sceneDir,
              MyCar.availableCars
            );
          }

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
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.back),
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.left),
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.front),
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(this.sceneDir + rep.right),
        side: THREE.BackSide,
      }),
    ];

    const mesh = new THREE.Mesh(skyboxGeometry, skyboxMaterials);

    mesh.position.set(rep.center[0], rep.center[1], rep.center[2]);

    return mesh;
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
      if (light) parentNode.add(light);
      // if (this.useLightHelpers) parentNode.add(helper);
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

  transverseFromRoot(data) {
    const rootNode = data.nodes[data.rootId];
    this.rootScene = new THREE.Group();
    this.rootScene.name = "rootScene";
    this.transverseAndInheritValues(rootNode, this.rootScene);
    this.app.scene.add(this.rootScene);
  }

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

  setSkybox(skybox) {
    let skyboxInfo = skybox.default;
    this.skyboxV2 = this.createSkybox(skyboxInfo);
    this.app.scene.add(this.skyboxV2);
  }

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
    cam.target = new THREE.Vector3(...camera.target);
    cam.position.set(...camera.location);
    this.cameras[camera.id] = cam;
  }
}
