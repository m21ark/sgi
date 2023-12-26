/* - powerups:
    - turbo de 200% vel durante X segundos (deve indicar na HUD o tempo e vel extra)
    - Redução de X segundos no tempo total de corrida
    - Invulnerabilidade durante X segundos a colisoes ou ao slowdown da relva
 */

export class MyPowerUp {
  constructor(
    timeEffect = 2,
    timeBoost = 0,
    velMultiplyer = 1,
    invulnerable = false
  ) {
    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // Configurations
    this.timeEffect = timeEffect;
    this.timeBoost = timeBoost; // should be negative
    this.velMultiplyer = velMultiplyer; // should be > 1
    this.invulnerable = invulnerable;

    this.lastCollisionTime = 0;
  }

  hadNewCollision() {
    const currTime = Date.now();
    // cooldown of 2 seconds
    if (currTime - this.lastCollisionTime > 2000) {
      this.lastCollisionTime = currTime;
      return true;
    }
    return false;
  }

  setBBox(bbox) {
    this.bbox = bbox;
  }

  getPos() {
    return [this.x, this.y, this.z];
  }

  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getParams() {
    let configs = new Map();
    configs.set("timeEffect", this.timeEffect);
    configs.set("timeBoost", this.timeBoost);
    configs.set("velMultiplyer", this.velMultiplyer);
    configs.set("invulnerable", this.invulnerable);
    return configs;
  }

  effectPlayer(player) {
    this.invulnerable = Math.random() < 0.3;

    if (this.invulnerable) {
      
      player.invulnerable = true;

      setTimeout(() => {
        player.invulnerable = false;
      }, this.timeEffect * 1000);


      return;
    }

    player.velMultiplyer = 2;

    setTimeout(() => {
      player.velMultiplyer = 1;
    }, this.timeEffect * 1000);
  }
  
}
