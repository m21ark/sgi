export class MyCar {
  constructor(maxVel = 5, velInc = 0.1) {
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
    if (this.hasPowerUpEffect) return;
    this.powerup = powerup;
    let conf = powerup.getParams();

    this.powerUpTimeOut = conf.get("timeEffect");
    this.timeBoost -= Math.abs(conf.get("timeBoost"));
    this.velMultiplyer =
      conf.get("velMultiplyer") > 1 ? conf.get("velMultiplyer") : 1;
    this.invulnerable = conf.get("invulnerable");
  }

  hitObstacle(obstacle) {
    if (this.hasObstacleEffect) return;
    this.obstacle = obstacle;
    let conf = powerup.getParams();

    this.obstacleTimeOut = conf.get("timeEffect");
    this.timeBoost += Math.abs(conf.get("timeBoost"));
    this.velMultiplyer =
      conf.get("velMultiplyer") < 1 ? conf.get("velMultiplyer") : 1;
    this.switchedControls = conf.get("changeControls");
  }
}

// ============== TYPES ==============
/*

let p1 = MyPowerUp(timeEffect=1, timeBoost = -5)
let p2 = MyPowerUp(velMultiplyer = 2)
let p3 = MyPowerUp(invulnerable=true)

let o1 = MyObstacle(timeEffect=1, timeBoost = 5)
let o2 = MyObstacle(velMultiplyer = 0.7)
let o3 = MyObstacle(switchedControls=true)

*/
