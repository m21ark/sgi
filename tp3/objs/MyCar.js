import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class MyCar extends THREE.Object3D {
  constructor(maxVel = 5, velInc = 0.1, carUsed = 0) {
    super()
    // VELOCITY
    this.maxVel = maxVel;
    this.velInc = velInc;

    this.currVel = 0;
    this.velMultiplyer = 1;

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
    
    var spritey = TextSpriteDraw.makeTextSprite(" YOU ",
      { fontsize: 20, textColor: { r: 255, g: 255, b: 255, a: 1.0 } });
    spritey.position.set(-2, 0.5, -1);

    this.add(spritey);
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
    this.currVel += velInc;
  }

  speedDown() {
    this.currVel -= velInc;
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

