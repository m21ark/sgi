import * as THREE from "three";

export class FirstPersonCamera {
  constructor(app) {
    this.app = app;
    this.keyboard = {};
    this.player = null;

    this.addListeners();
  }

  getPlayer() {
    return this.player;
  }

  defineSelfObj(obj = null) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    this.player = new THREE.Mesh(geo, mat);
    if (obj) this.player = obj;
    this.player.position.set(200, 0.5, 10);
    this.player.rotation.x = 0.0;
    this.app.scene.add(this.player);
  }

  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key.toLowerCase()] = false;
    });
  }

  update() {
    const playerSpeed = 0.5;
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

    if (this.keyboard["arrowleft"]) this.player.rotation.y += rotationSpeed;
    if (this.keyboard["arrowright"]) this.player.rotation.y -= rotationSpeed;

    this.updatePlayerCamera();
  }

  /**
   * Updates the camera position to be relative to the player's position and rotation (first person view)
   */
  updatePlayerCamera() {
    const playerPosition = this.player.position.clone();
    const cameraPosition = this.app.activeCamera.position;

    // Calculate a position relative to the player's rotation
    const relativeCameraOffset = new THREE.Vector3(0, 2, -4); // Adjust the offset as needed
    const cameraOffset = relativeCameraOffset.applyQuaternion(
      this.player.quaternion
    );

    // Set the camera's position to be relative to the player's position
    cameraPosition.copy(playerPosition).add(cameraOffset);

    // Make the camera look at the player's position
    this.app.activeCamera.lookAt(playerPosition);
  }
}
