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
    // TODO: time boost should be applied to the player and then the effect on the podium
    player.velMultiplyer = 2;

    player.incPowerupCount();

    setTimeout(() => {
      player.velMultiplyer = 1;
    }, this.timeEffect * 1000);
  }
}
