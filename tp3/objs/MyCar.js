import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class MyCar extends THREE.Object3D {
  constructor(maxVel = 0.6, velInc = 0.01, carUsed = 0) {
    super();
    // VELOCITY
    this.maxVel = maxVel;
    this.velInc = velInc * 0.4;

    this.currVel = 0;
    this.velMultiplyer = 1;

    this.rotationSpeedInc = 0.02;
    this.rotationSpeed = 0;

    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // POWER UP
    this.powerUpEffect = false;
    this.collisionEffect = 3;

    // COUNTERS
    this.powerupCount = 0;
    this.obstaclesCount = 0;

    this.add(MyCar.availableCars.children[carUsed].clone());

    this.carBB = new THREE.Box3().setFromObject(this); // bounding box
  }

  getPowerUpsCount() {
    return this.powerupCount;
  }

  getObstaclesCount() {
    return this.obstaclesCount;
  }

  incRotation() {
    if (this.currVel == 0) return;
    this.rotationSpeed += this.rotationSpeedInc;
    this.rotatePlayer();
  }

  decRotation() {
    if (this.currVel == 0) return;
    this.rotationSpeed -= this.rotationSpeedInc;
    this.rotatePlayer();
  }
  normalizeRadian(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  rotatePlayer() {
    this.rotation.y = this.rotationSpeed;
    /*     this.children[0].children[0].rotation.y = 0.08;
    this.children[0].children[1].rotation.y = 0.03;
    this.children[0].children[2].rotation.y = 0.05; */
  }

  incPowerupCount() {
    this.powerupCount += 1;
  }

  incObstaclesCount() {
    this.obstaclesCount += 1;
  }

  hasPowerUpEffect() {
    return this.powerUpEffect;
  }

  getPos() {
    return [this.x, this.y, this.z];
  }

  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  speedUp() {
    this.currVel += this.velInc;
    if (this.currVel > this.getMaxVel()) this.currVel = this.getMaxVel();
  }

  speedDown() {
    this.currVel -= this.velInc;
    if (this.currVel < -this.getMaxVel()) this.currVel = -this.getMaxVel();
  }

  friction() {
    const frictionCoefficient = 0.03;
    const frictionForce = -frictionCoefficient * this.currVel;
    this.currVel += frictionForce;
    if (Math.abs(this.currVel) < this.velInc) this.currVel = 0;
  }

  getMaxVel() {
    return this.maxVel * this.velMultiplyer;
  }

  getSpeed() {
    return this.currVel;
  }

  getSpeedInfo() {
    return [this.currVel, this.velMultiplyer];
  }

  collideCar() {
    this.velMultiplyer = 0.7;

    setTimeout(() => {
      this.velMultiplyer = 1;
    }, this.collisionEffect * 1000);
  }
}

MyCar.availableCars = new THREE.Group();
