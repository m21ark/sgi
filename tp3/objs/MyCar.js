import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

/**
 * Represents a car object in a 3D scene.
 * @class
 * @extends THREE.Object3D
 */
export class MyCar extends THREE.Object3D {
  /**
   * Creates a new instance of MyCar.
   * @constructor
   * @param {number} [maxVel=0.6] - The maximum velocity of the car.
   * @param {number} [velInc=0.01] - The velocity increment of the car.
   * @param {number} [carUsed=0] - The index of the car model to be used.
   */
  constructor(maxVel = 0.6, velInc = 0.01, carUsed = 0) {
    super();
    // VELOCITY
    this.maxVel = maxVel;
    this.velInc = velInc * 0.4;

    this.currVel = 0;
    this.velMultiplyer = 1;

    this.rotationSpeedInc = 0.02;
    this.rotationSpeed = 0;
    this.invulnerable = false;

    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // POWER UP
    this.powerUpEffect = false;
    this.collisionEffect = 3;

    this.add(MyCar.availableCars.children[carUsed].clone());

    this.carBB = new THREE.Box3().setFromObject(this); // bounding box
  }

  /**
   * Checks if the car is at maximum velocity.
   * @returns {boolean} - True if the car is at maximum velocity, false otherwise.
   */
  isAtMaxVel() {
    return this.currVel == this.getMaxVel();
  }

  /**
   * Rotates the front wheels of the car.
   * @param {number} angle - The angle to rotate the front wheels, in radians.
   */
  rotateFrontWheels(angle) {
    const maxRotation = (40 * Math.PI) / 180; // Convert 5 degrees to radians

    let frontWheel = this.children[0].children.filter((child) =>
      child.name.includes("front")
    )[0];

    frontWheel.rotation.y = Math.max(
      -maxRotation,
      Math.min(maxRotation, angle * 5)
    );
  }

  /**
   * Increases the rotation speed of the car.
   */
  incRotation() {
    if (this.currVel == 0) return;
    this.rotationSpeed += this.rotationSpeedInc;
    this.rotatePlayer();
  }

  /**
   * Decreases the rotation speed of the car.
   */
  decRotation() {
    if (this.currVel == 0) return;
    this.rotationSpeed -= this.rotationSpeedInc;
    this.rotatePlayer();
  }

  /**
   * Normalizes an angle to be within the range of 0 to 2π.
   * @param {number} angle - The angle to normalize, in radians.
   * @returns {number} - The normalized angle.
   */
  normalizeRadian(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  /**
   * Rotates the player based on the rotation speed.
   */
  rotatePlayer() {
    this.rotation.y = this.rotationSpeed;
  }

  /**
   * Checks if the car has a power-up effect.
   * @returns {boolean} - True if the car has a power-up effect, false otherwise.
   */
  hasPowerUpEffect() {
    return this.powerUpEffect;
  }

  /**
   * Gets the position of the car.
   * @returns {number[]} - An array containing the x, y, and z coordinates of the car.
   */
  getPos() {
    return [this.x, this.y, this.z];
  }

  /**
   * Sets the position of the car.
   * @param {number} x - The x coordinate of the car.
   * @param {number} y - The y coordinate of the car.
   * @param {number} z - The z coordinate of the car.
   */
  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Increases the speed of the car.
   */
  speedUp() {
    this.currVel += this.velInc;
    if (this.currVel > this.getMaxVel()) this.currVel = this.getMaxVel();
  }

  /**
   * Decreases the speed of the car.
   */
  speedDown() {
    this.currVel -= this.velInc;
    if (this.currVel < -this.getMaxVel()) this.currVel = -this.getMaxVel();
  }

  /**
   * Applies friction to the car.
   * @param {number} [frictionCoefficient=0.035] - The coefficient of friction to apply.
   */
  friction(frictionCoefficient = 0.035) {
    const frictionForce = -frictionCoefficient * this.currVel;
    this.currVel += frictionForce;
    if (Math.abs(this.currVel) < this.velInc) this.currVel = 0;
  }

  /**
   * Applies friction to the car when driving on grass.
   */
  frictionGrass() {
    if (this.currVel < 0.2) return;
    this.friction(0.08);
  }

  /**
   * Gets the maximum velocity of the car.
   * @returns {number} - The maximum velocity of the car.
   */
  getMaxVel() {
    return this.maxVel * this.velMultiplyer;
  }

  /**
   * Gets the current speed of the car.
   * @returns {number} - The current speed of the car.
   */
  getSpeed() {
    return this.currVel;
  }

  /**
   * Gets information about the current speed of the car.
   * @returns {number[]} - An array containing the current speed and velocity multiplier of the car.
   */
  getSpeedInfo() {
    return [this.currVel, this.velMultiplyer];
  }

  /**
   * Applies a collision effect to the car.
   */
  collideCar() {
    this.velMultiplyer = 0.6;

    setTimeout(() => {
      this.velMultiplyer = 1;
    }, this.collisionEffect * 1000);
  }
}

MyCar.availableCars = new THREE.Group();
