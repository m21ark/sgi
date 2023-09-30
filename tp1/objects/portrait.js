import * as THREE from "three";

export class Portrait extends THREE.Object3D {
  constructor(portraitWidth, portraitHeight, photoDir) {
    super();

    const textureLoader = new THREE.TextureLoader();
    const portraitTexture = textureLoader.load(photoDir);

    const portraitGeometry = new THREE.PlaneGeometry(
      portraitWidth - 0.3,
      portraitHeight - 0.3
    );

    const portraitMaterial = new THREE.MeshPhongMaterial({
      map: portraitTexture,
      color: 0xffffff, // Set the base color (white in this example)
      specular: 0x111111, // Set a moderate specular highlight color
      shininess: 30, // Adjust as needed
    });

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

    // Adjust the position
    portraitMesh.rotation.y = Math.PI;

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
    glassMesh.position.set(0, 0, 0.005);

    portraitMesh.position.set(0, 0.6, -0.03);
    portraitMesh.scale.set(1, 1.4, 1);

    // Add to the scene
    portraitMesh.add(whiteFrameMesh);
    portraitMesh.add(blackFrameMesh);
    //portraitMesh.add(glassMesh);
    this.add(portraitMesh);
  }
}
