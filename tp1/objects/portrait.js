import * as THREE from "three";
import { Beetle } from "./beetle.js";

/**
 * A class representing a portrait object in a 3D scene.
 * @extends THREE.Object3D
 */
export class Portrait extends THREE.Object3D {
  /**
   * Creates a new Portrait object.
   * @param {number} portraitWidth - The width of the portrait.
   * @param {number} portraitHeight - The height of the portrait.
   * @param {string} photoDir - The directory of the photo to be used as the portrait texture.
   */
  constructor(portraitWidth, portraitHeight, photoDir) {
    super();

    let portraitMaterial;
    let portraitGeometry = new THREE.PlaneGeometry(
      portraitWidth - 0.3,
      portraitHeight - 0.3
    );

    // if the picture is not the beetle, load the texture and create the material
    if (photoDir !== "carocha") {
      const textureLoader = new THREE.TextureLoader();
      const portraitTexture = textureLoader.load(photoDir);

      portraitMaterial = new THREE.MeshPhongMaterial({
        map: portraitTexture,
        color: 0xffffff, // Set the base color (white in this example)
        specular: 0x111111, // Set a moderate specular highlight color
        shininess: 30, // Adjust as needed
      });
    } else { // else load the beetle
      portraitMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff, // Set the base color (white in this example)
        specular: 0x111111, // Set a moderate specular highlight color
        shininess: 30, // Adjust as needed
      });
      const beetle = new Beetle(portraitMaterial);
      this.add(beetle);
    }

    const portraitMesh = new THREE.Mesh(portraitGeometry, portraitMaterial);

    const frameWidth = portraitWidth + 0.1;
    const frameHeight = portraitHeight + 0.1;
    const frameDepth = 0.05;

    const whiteFrameGeometry = new THREE.BoxGeometry(
      frameWidth,
      frameHeight,
      frameDepth
    );

    const blackFrameGeometry = new THREE.BoxGeometry(
      frameWidth + 0.2,
      frameHeight + 0.2,
      frameDepth
    );

    const whiteMaterial = new THREE.MeshPhongMaterial({
      color: "#c0c0c0",
    });

    const blackMaterial = new THREE.MeshPhongMaterial({
      color: "#000000",
    });

    const whiteFrameMesh = new THREE.Mesh(whiteFrameGeometry, whiteMaterial);
    const blackFrameMesh = new THREE.Mesh(blackFrameGeometry, blackMaterial);

    whiteFrameMesh.receiveShadow = true;
    blackFrameMesh.receiveShadow = true;

    // Adjust the position
    portraitMesh.rotation.y = Math.PI;
    portraitMesh.castShadow = true;
    portraitMesh.receiveShadow = true;

    whiteFrameMesh.position.set(0, 0, -0.03);
    blackFrameMesh.position.set(0, 0, -0.05);

    // Glass Cover
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      specular: 0xffaaaa,
      shininess: 350,
      transparent: true,
      opacity: 0.3,
    });

    const glassGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.01);

    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    glassMesh.position.set(0, 0, 0.005);

    portraitMesh.position.set(0, 0.6, -0.03);
    portraitMesh.scale.set(1, 1.4, 1);

    // Add to the scene
    portraitMesh.add(whiteFrameMesh);
    portraitMesh.add(blackFrameMesh);
    //portraitMesh.add(glassMesh); .... Note, the glass is not added to the scene, feel free to try it
    this.add(portraitMesh);
  }
}
