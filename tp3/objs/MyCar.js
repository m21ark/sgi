import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class MyCar extends THREE.Object3D {
  constructor(maxVel = 0.6, velInc = 0.01, carUsed = 0) {
    super();
    // VELOCITY
    this.maxVel = maxVel;
    this.velInc = velInc * 0.6;

    this.currVel = 0;
    this.velMultiplyer = 1;

    this.rotationSpeedInc = 0.02;
    this.rotationSpeed = 0;
    this.maxRotation = (6 * Math.PI) / 16;

    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // TIME
    this.timeBoost = 0;

    // POWER UP
    this.powerUpTimeOut = -1;
    this.powerup = null;
    this.invulnerable = false;

    // OBSTACLE
    this.obstacleTimeOut = -1;
    this.obstacle = null;
    this.switchedControls = false;

    this.add(MyCar.availableCars.children[carUsed].clone());

    this.carBB = new THREE.Box3().setFromObject(this); // bounding box

    let spritey = TextSpriteDraw.makeTextSprite(" YOU ", {
      fontsize: 20,
      textColor: { r: 255, g: 255, b: 255, a: 1.0 },
    });
    spritey.position.set(-2, 0.5, -1);

    this.add(spritey);
  }

  incRotation() {
    this.rotationSpeed += this.rotationSpeedInc;
    // if (this.rotationSpeed > this.maxRotation) this.rotationSpeed = this.maxRotation;
    this.rotatePlayer();
  }

  decRotation() {
    this.rotationSpeed -= this.rotationSpeedInc;
    // if (this.rotationSpeed < -this.maxRotation) this.rotationSpeed = -this.maxRotation;
    this.rotatePlayer();
  }
  normalizeRadian(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  rotatePlayer() {
    this.rotation.y = this.rotationSpeed;

    if (this.rotationSpeed > 0) {
      this.children[0].children[0].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.08;
      this.children[0].children[1].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.03;
      this.children[0].children[2].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.05;
    } else if (this.rotationSpeed < 0) {
      this.children[0].children[0].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.08;
      this.children[0].children[1].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.03;
      this.children[0].children[2].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.05;
    }
  }

  hasPowerUpEffect() {
    return this.powerUpTimeOut > 0;
  }

  hasObstacleEffect() {
    return this.obstacleTimeOut > 0;
  }

  getTimeBoost() {
    return this.timeBoost;
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
    if (this.currVel > this.maxVel) this.currVel = this.maxVel;
  }

  speedDown() {
    this.currVel -= this.velInc;

    if (this.currVel < -this.maxVel) this.currVel = -this.maxVel;
  }

  friction() {
    const frictionCoefficient = 0.03;
    const frictionForce = -frictionCoefficient * this.currVel;
    this.currVel += frictionForce;
    if (Math.abs(this.currVel) < this.velInc) this.currVel = 0;
  }


  getSpeed() {
    return this.currVel * this.velMultiplyer;
  }

  getSpeedInfo() {
    return [this.currVel, this.velMultiplyer];
  }

  getState() {
    return [
      this.getSpeed(),
      this.timeBoost,
      this.powerUpTimeOut,
      this.obstacleTimeOut,
    ];
  }

  removePowerUpEffect() {
    this.powerup = null;
    this.invulnerable = false;
    this.velMultiplyer = 1;
    if (this.currVel > this.maxVel) this.currVel = this.maxVel;
  }

  removeObstacleEffect() {
    this.obstacle = null;
    this.switchedControls = false;
  }

  tickTime() {
    if (this.powerUpTimeOut >= 0) this.powerUpTimeOut--;
    if (this.obstacleTimeOut >= 0) this.obstacleTimeOut--;

    if (this.powerUpTimeOut == -1 && this.powerup != null)
      removePowerUpEffect();
    if (this.obstacleTimeOut == -1 && this.obstacle != null)
      removeObstacleEffect();
  }

  hitPowerUp(powerup) {
    if (this.hasPowerUpEffect()) return;
    this.powerup = powerup;
    let conf = powerup.getParams();

    this.powerUpTimeOut = conf.get("timeEffect");
    this.timeBoost -= Math.abs(conf.get("timeBoost"));
    this.velMultiplyer =
      conf.get("velMultiplyer") > 1 ? conf.get("velMultiplyer") : 1;
    this.invulnerable = conf.get("invulnerable");
  }

  hitObstacle(obstacle) {
    if (this.hasObstacleEffect()) return;
    this.obstacle = obstacle;
    let conf = powerup.getParams();

    this.obstacleTimeOut = conf.get("timeEffect");
    this.timeBoost += Math.abs(conf.get("timeBoost"));
    this.velMultiplyer =
      conf.get("velMultiplyer") < 1 ? conf.get("velMultiplyer") : 1;
    this.switchedControls = conf.get("changeControls");
  }
}

MyCar.availableCars = new THREE.Group();
