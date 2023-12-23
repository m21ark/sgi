import * as THREE from "three";

export class MyFirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document.body;
    this.moveSpeed = 0.1;
    this.lookSpeed = 0.005;
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.add(this.pitchObject);
    this.pitchObject.add(this.camera);
    this.pitchObject.rotation.x = 0;
    this.yawObject.rotation.y = 0;
    this.target = new THREE.Vector3();
  }

  update() {
    const direction = new THREE.Vector3(0, 1, 0);
    const rotation = new THREE.Euler(0, 0, 0, "YXZ");
    rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
    direction.applyEuler(rotation);
    this.target.copy(this.yawObject.position).add(direction);
    this.camera.lookAt(this.target);
  }
}
