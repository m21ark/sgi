import * as THREE from "three";
import { ObjectBuilder } from "../builders/ObjectBuilder.js";

/**
 * Represents a first-person camera.
 * @class
 */
export class FirstPersonCamera {
  /**
   * Creates an instance of FirstPersonCamera.
   * @param {object} app - The application object.
   */
  constructor(app) {
    this.app = app;
    this.keyboard = {};
    this.player = null;
    this.addListeners();
  }

  /**
   * Get the player object.
   * @returns {object} - The player object.
   */
  getPlayer() {
    return this.player;
  }

  /**
   * Defines the player object.
   * @param {object} [obj=null] - The player object.
   * @param {number[]} pos - The position of the player object.
   */
  defineSelfObj(obj = null, pos) {
    // If no object is passed, create a default one
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    if (this.player) this.app.scene.remove(this.player);
    this.player = new THREE.Mesh(geo, mat);
    if (obj) this.player = obj;
    this.player.position.set(...pos);
    this.app.scene.add(this.player);
  }

  /**
   * Add event listeners for keyboard events.
   */
  addListeners() {
    window.addEventListener("keydown", (event) => {
      this.keyboard[event.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (event) => {
      this.keyboard[event.key.toLowerCase()] = false;
    });
  }

  /**
   * Normalize an angle in radians.
   * @param {number} angle - The angle in radians.
   * @returns {number} - The normalized angle in radians.
   */
  normalizeRadian(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  /**
   * Update the camera for flight mode.
   */
  flightUpdate() {
    const flightSpeed = 0.5;
    const rotationSpeed = 0.05;
    const flightDirection = new THREE.Vector3(0, 0, -1);

    // Rotate the target's direction based on their current rotation
    flightDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.player.rotation.y
    );

    // Calculate the movement vector based on the target's direction
    const moveVector = new THREE.Vector3();
    if (this.keyboard["w"]) moveVector.sub(flightDirection);
    if (this.keyboard["s"]) moveVector.add(flightDirection);
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

    // Normalize the move vector and apply flightSpeed
    moveVector.normalize().multiplyScalar(flightSpeed);

    // Update player position
    this.player.position.add(moveVector);

    if (this.keyboard["arrowleft"]) this.player.rotation.y += rotationSpeed;
    if (this.keyboard["arrowright"]) this.player.rotation.y -= rotationSpeed;

    this.updateCamera();
  }

  /**
   * Update the camera.
   */
  update() {
    if (this.app.activeCameraName === "Debug")
      this.flightUpdate(); // Debug flight camera
    else this.carUpdate(); // Car camera
  }

  /**
   * Update the camera for car mode.
   */
  carUpdate() {
    const playerDirection = new THREE.Vector3(0, 0, -1); // Initial forward direction

    // make car wheels rotate
    ObjectBuilder.ShaderMaterials.forEach((shader) => {
      shader.uniforms.time.value += 0.03;
      shader.uniforms.velocity.value = this.player.getSpeed();
    });

    // Calculate the movement vector based on the player's direction
    const moveVector = new THREE.Vector3();
    const allowedToMove = this.app.contents.hasGameStarted;

    const angleBefore = this.player.rotation.y

    if (allowedToMove) {
      if (!this.keyboard["w"] && !this.keyboard["s"]) this.player.friction();
      if (this.keyboard["w"]) {
        this.player.speedUp();
        // The sound is not very good
        // if (!this.player.isAtMaxVel()) this.app.audio.playSound("engine");
      }
      if (this.keyboard["s"]) this.player.speedDown();
      if (this.keyboard["a"]) this.player.incRotation();
      if (this.keyboard["d"]) this.player.decRotation();
    }

    // Rotate the player's direction based on their current rotation
    playerDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.player.rotation.y
    );
    
    this.player.rotateFrontWheels(this.player.rotation.y - angleBefore);

  
    // Apply movement to the player position
    moveVector.sub(playerDirection);
    moveVector.normalize().multiplyScalar(this.player.getSpeed());
    this.player.position.add(moveVector);

    this.updateFOV(this.player, this.app.activeCamera, 0.05);
    this.updateCamera();

    // update smoke particles
    if (this.player.currVel < 0.2) {
      let x = this.player.position.x;
      let y = this.player.position.y;
      let z = this.player.position.z;

      // Get the direction vector of the car
      const carDirection = new THREE.Vector3(0, 0, -1);
      carDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), y);

      // Adjust the position based on the car's direction
      const offset = new THREE.Vector3(0, 0, y > Math.PI ? -0.2 : 0.2);
      offset.applyQuaternion(this.player.quaternion);

      let pos = new THREE.Vector3(x + offset.x, 0.05, z + offset.z);
      this.app.contents.smokes.setPos(pos);
    } else this.app.contents.smokes.reset();
  }

  /**
   * Update the field of view (FOV) of the camera.
   * @param {object} player - The player object.
   * @param {object} camera - The camera object.
   * @param {number} lerpFactor - The lerp factor for interpolation.
   */
  updateFOV(player, camera, lerpFactor) {
    const lerp = (start, end, alpha) => {
      return (1 - alpha) * start + alpha * end;
    };
    const targetFOV = 75 + Math.abs(player.getSpeed()) * 30;
    camera.fov = lerp(camera.fov, targetFOV, lerpFactor);
    camera.updateProjectionMatrix();
  }

  /**
   * Update the camera position and rotation.
   */
  updateCamera() {
    const playerPosition = this.player.position.clone();
    const cameraPosition = this.app.activeCamera.position;
    const offset = new THREE.Vector3(0, 2, -4);
    const rotationMatrix = new THREE.Matrix4().makeRotationY(
      this.player.rotation.y
    );
    const relativeCameraOffset = offset.applyMatrix4(rotationMatrix);
    cameraPosition.copy(playerPosition).add(relativeCameraOffset);
    this.app.activeCamera.lookAt(playerPosition);
  }
}
