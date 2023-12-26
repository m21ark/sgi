/**
 * Represents an obstacle in the game.
 */
export class MyObstacle {
  /**
   * Creates a new instance of MyObstacle.
   * @param {number} timeEffect - The duration of the obstacle's effect in seconds.
   * @param {number} timeBoost - The duration of the speed boost in seconds.
   * @param {number} velMultiplyer - The velocity multiplier applied to the player.
   * @param {boolean} switchedControls - Indicates if the player's controls are switched.
   */
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

    this.lastCollisionTime = 0;
  }

  /**
   * Sets the bounding box of the obstacle.
   * @param {Object} bbox - The bounding box object.
   */
  setBBox(bbox) {
    this.bbox = bbox;
  }

  /**
   * Gets the position of the obstacle.
   * @returns {number[]} The position as an array [x, y, z].
   */
  getPos() {
    return [this.x, this.y, this.z];
  }

  /**
   * Sets the position of the obstacle.
   * @param {number} x - The x-coordinate of the position.
   * @param {number} y - The y-coordinate of the position.
   * @param {number} z - The z-coordinate of the position.
   */
  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Gets the configuration parameters of the obstacle.
   * @returns {Map<string, any>} A map containing the configuration parameters.
   */
  getParams() {
    let configs = new Map();
    configs.set("timeEffect", this.timeEffect);
    configs.set("timeBoost", this.timeBoost);
    configs.set("velMultiplyer", this.velMultiplyer);
    configs.set("switchedControls", this.switchedControls);
    return configs;
  }

  /**
   * Checks if the obstacle had a new collision within the cooldown period.
   * @returns {boolean} True if a new collision occurred, false otherwise.
   */
  hadNewCollision() {
    const currTime = Date.now();
    // cooldown of 2 seconds
    if (currTime - this.lastCollisionTime > 2000) {
      this.lastCollisionTime = currTime;
      return true;
    }
    return false;
  }

  /**
   * Applies the obstacle's effect to the player.
   * @param {Object} player - The player object.
   */
  effectPlayer(player) {
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
