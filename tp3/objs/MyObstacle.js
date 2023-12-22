/* - obstaculos:
    - limitar vel a 70% durante X segundos
    - adiconar X segundos ao tempo atual
    - trocar esquerda e direita do ASWD */

export class MyObstacle {
  constructor(
    timeEffect = 2,
    timeBoost = 0,
    velMultiplyer = 1,
    switchedControls = false
  ) {
    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // Configurations
    this.timeEffect = timeEffect;
    this.timeBoost = timeBoost; // should be positive
    this.velMultiplyer = velMultiplyer; // should be < 1
    this.switchedControls = switchedControls;
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
    configs.set("switchedControls", this.switchedControls);
    return configs;
  }

  effectPlayer(player) {
    // TODO: time boost should be applied to the player and then the effect on the podium

    player.incObstaclesCount();

    if (this.switchedControls) {
      player.rotationSpeedInc = -0.02;

      setTimeout(() => {
        player.rotationSpeedInc = 0.02;
      }, this.timeEffect * 1000);
      return;
    }

    if (!this.timeBoost) {
      player.velMultiplyer = 0.7;

      setTimeout(() => {
        player.velMultiplyer = 1;
      }, this.timeEffect * 1000);
    }
  }
}
