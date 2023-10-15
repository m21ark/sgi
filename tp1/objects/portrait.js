import * as THREE from "three";

export class Portrait extends THREE.Object3D {
  constructor(portraitWidth, portraitHeight, photoDir) {
    super();

    let portraitMaterial;
    let portraitGeometry = new THREE.PlaneGeometry(
      portraitWidth - 0.3,
      portraitHeight - 0.3
    );

    if (photoDir !== "carocha") {
      const textureLoader = new THREE.TextureLoader();
      const portraitTexture = textureLoader.load(photoDir);

      portraitMaterial = new THREE.MeshPhongMaterial({
        map: portraitTexture,
        color: 0xffffff, // Set the base color (white in this example)
        specular: 0x111111, // Set a moderate specular highlight color
        shininess: 30, // Adjust as needed
      });
    } else {
      portraitMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff, // Set the base color (white in this example)
        specular: 0x111111, // Set a moderate specular highlight color
        shininess: 30, // Adjust as needed
      });
      let points = [
        new THREE.Vector3(0.0, 0, 0.0),
        new THREE.Vector3(0.0, 0.6 * (2 / 3), 0.0),
        new THREE.Vector3(0.6, 0.6 * (2 / 3), 0.0),
        new THREE.Vector3(0.6, 0.0, 0.0),
      ];

      let points2 = [
        new THREE.Vector3(0.0, 0, 0.0),
        new THREE.Vector3(0.0, 0.4 * (2 / 3), 0.0),
        new THREE.Vector3(0.4 * (2 / 3), 0.4, 0.0),
        new THREE.Vector3(0.4, 0.4, 0.0),
      ];

      let curve = new THREE.CubicBezierCurve3(
        points[0],
        points[1],
        points[2],
        points[3]
      );
      let samp = curve.getPoints(32);
      this.curveGeometry = new THREE.BufferGeometry().setFromPoints(samp);
      this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

      this.wheel1 = new THREE.Line(this.curveGeometry, this.lineMaterial);
      this.wheel1.position.set(0.4, 0, -0.04);

      this.wheel2 = new THREE.Line(this.curveGeometry, this.lineMaterial);
      this.wheel2.position.set(-0.6, 0, -0.04);

      this.add(this.wheel1);
      this.add(this.wheel2);

      let curve2 = new THREE.CubicBezierCurve3(
        points2[0],
        points2[1],
        points2[2],
        points2[3]
      );
      let samp2 = curve2.getPoints(32);
      this.curveGeometry2 = new THREE.BufferGeometry().setFromPoints(samp2);
      this.lineMaterial2 = new THREE.LineBasicMaterial({ color: 0x000000 });

      this.wheel3 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
      this.wheel3.position.set(-0.6, 0, -0.04);

      this.wheel4 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
      this.wheel4.position.set(-0.2, 0.4, -0.04);

      this.wheel5 = new THREE.Line(this.curveGeometry2, this.lineMaterial2);
      this.wheel5.position.set(0.2, 0.8, -0.04);

      this.wheel5.scale.set(2, 2, 1);
      this.wheel5.rotateZ(-Math.PI / 2);

      this.add(this.wheel3);
      this.add(this.wheel4);
      this.add(this.wheel5);
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
    //portraitMesh.add(glassMesh);
    this.add(portraitMesh);
  }
}
