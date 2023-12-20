/* - obstaculos:
    - limitar vel a 70% durante X segundos
    - adiconar X segundos ao tempo atual
    - trocar esquerda e direita do ASWD */

export class MyObstacle {
  constructor(
    timeEffect = 5,
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
}
