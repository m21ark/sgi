import * as THREE from "three";

/**
 *  Flower class
 */
export class Flower extends THREE.Object3D {
  /**
   * Draws a bezier oval quarter
   * @param {number} centerX - center of the oval in x
   * @param {number} centerY - center of the oval in y
   * @param {number} sizeX - size of the oval in x
   * @param {number} sizeY - size of the oval in y
   * @param {THREE.Shape} centerShape - shape to draw
   */
  drawBezierOvalQuarter(centerX, centerY, sizeX, sizeY, centerShape) {
    console.log(centerShape);
    centerShape.moveTo(centerX - sizeX, centerY - 0);
    centerShape.bezierCurveTo(
      centerX - sizeX,
      centerY - (2 / 3) * sizeY,
      centerX - (2 / 3) * sizeX,
      centerY - sizeY,
      centerX - 0,
      centerY - sizeY
    );
  }

  /**
   * Draws a bezier oval
   * @param {number} centerX - center of the oval in x
   * @param {number} centerY - center of the oval in y
   * @param {number} sizeX - size of the oval in x
   * @param {number} sizeY - size of the oval in y
   * @param {THREE.Shape} centerShape - shape to draw
   */
  drawBezierOval(centerX, centerY, sizeX, sizeY, centerShape) {
    this.drawBezierOvalQuarter(centerX, centerY, -sizeX, sizeY, centerShape);
    this.drawBezierOvalQuarter(centerX, centerY, sizeX, sizeY, centerShape);
    this.drawBezierOvalQuarter(centerX, centerY, sizeX, -sizeY, centerShape);
    this.drawBezierOvalQuarter(centerX, centerY, -sizeX, -sizeY, centerShape);
  }

  /**
   * Draws a bezier circle
   * @param {number} centerX - center of the circle in x
   * @param {number} centerY - center of the circle in y
   * @param {number} size - size of the circle
   * @param {THREE.Shape} centerShape - shape to draw
   */
  drawBezierCircle(centerX, centerY, size, centerShape) {
    this.drawBezierOval(centerX, centerY, size, size, centerShape);
  }

  constructor() {
    super();

    // create the points for the bezier cubic curve
    let points = [
      new THREE.Vector3(-0.1, 0.9, 0.0),
      new THREE.Vector3(0.0, 3 * (2 / 3), 0.0),
      new THREE.Vector3(3, 3 * (2 / 3), 0.0),
      new THREE.Vector3(3, 2, 0.0),
    ];

    // create the center of the flower
    var centerShape = new THREE.Shape();
    centerShape.absarc(0, 0, 0.4, 0, Math.PI * 2, false);

    // extrude the center
    let centerExtrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: false,
    };

    let centerGeometry = new THREE.ExtrudeGeometry(
      centerShape,
      centerExtrudeSettings
    );
    let centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x201c20,
      side: THREE.DoubleSide,
    });
    let centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);

    // add the center mesh to the scene
    this.add(centerMesh);

    // stalkFlower
    var stalkFlowerShape = new THREE.Shape();
    stalkFlowerShape.moveTo(0, 0);
    stalkFlowerShape.bezierCurveTo(0.2, 0, 0.2, 0.4, 0, 0.2);
    stalkFlowerShape.bezierCurveTo(-0.2, 0.4, -0.2, 0, 0, 0);

    let stalkFlowerGeo = new THREE.ExtrudeGeometry(
      stalkFlowerShape,
      centerExtrudeSettings
    );
    stalkFlowerGeo.rotateZ(Math.PI / 2);

    let leaveMat = new THREE.MeshPhongMaterial({
      color: 0x22cc22,
      side: THREE.DoubleSide,
    });
    let stalkFlowerMesh = new THREE.Mesh(stalkFlowerGeo, leaveMat);
    stalkFlowerMesh.position.set(2, 0.9, -0.04);
    stalkFlowerMesh.scale.set(1.5, 2, 1);

    this.add(stalkFlowerMesh);

    // create a stalk using bezier cubic curves

    let curve = new THREE.CubicBezierCurve3(
      points[0],
      points[1],
      points[2],
      points[3]
    );
    let samp = curve.getPoints(32);
    this.curveGeometry = new THREE.BufferGeometry().setFromPoints(samp);
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    this.stalk = new THREE.Line(this.curveGeometry, this.lineMaterial);
    this.stalk.position.set(0, -1.0, -0.04);

    this.add(this.stalk);

    // create the petal shape
    var petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.5, 0.5, 0, 1);
    petalShape.quadraticCurveTo(-0.5, 0.5, 0, 0);

    var petalExtrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: false,
    };

    var petalGeometry = new THREE.ExtrudeGeometry(
      petalShape,
      petalExtrudeSettings
    );
    var petalMaterial = new THREE.MeshPhongMaterial({ color: 0xb37512 });

    // create the petals
    var numPetals = 8;
    var angleStep = (Math.PI * 2) / numPetals;
    for (var i = 0; i < numPetals; i++) {
      var angle = i * angleStep;
      var petalMesh = new THREE.Mesh(petalGeometry, petalMaterial);
      petalMesh.position.set(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0);
      petalMesh.rotation.z = angle;
      this.add(petalMesh);
    }

    this.scale.set(0.4, 0.4, 0.4);
    this.rotateZ(-Math.PI / 2);
  }
}
