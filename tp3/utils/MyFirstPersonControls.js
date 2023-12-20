import * as THREE from "three";

export class MyFirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document.body;

    this.enabled = true;
    this.moveSpeed = 0.1;
    this.lookSpeed = 0.005;

    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();

    this.yawObject.add(this.pitchObject);
    this.pitchObject.add(this.camera);

    this.pitchObject.rotation.x = 0;
    this.yawObject.rotation.y = 0;

    this.target = new THREE.Vector3();

    this.domElement.addEventListener(
      "keydown",
      this.onKeyDown.bind(this),
      false
    );
    this.domElement.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  isMouseDown = false;

  onMouseMove(event) {
    if (!this.isMouseDown) return;
    if (!this.enabled) return;

    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;

    this.yawObject.rotation.y -= movementX * this.lookSpeed;
    this.pitchObject.rotation.x -= movementY * this.lookSpeed;

    this.pitchObject.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.pitchObject.rotation.x)
    );
  }

  onMouseDown(event) {
    this.isMouseDown = true;
  }

  onMouseUp(event) {
    this.isMouseDown = false;
  }

  onContextMenu(event) {
    event.preventDefault();
  }

  onKeyDown(event) {
    // Handle key press for movement if needed
  }

  onKeyUp(event) {
    // Handle key release if needed
  }

  update() {
    if (!this.enabled) return;

    const direction = new THREE.Vector3(0, 1, 0);
    const rotation = new THREE.Euler(0, 0, 0, "YXZ");

    rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);

    direction.applyEuler(rotation);
    this.target.copy(this.yawObject.position).add(direction);

    this.camera.lookAt(this.target);
  }
}
