/**
 * Represents a power-up in the game.
 */
export class MyPowerUp {
  /**
   * Creates a new instance of MyPowerUp.
   * @param {number} timeEffect - The duration of the power-up effect in seconds.
   * @param {number} timeBoost - The time boost value (should be negative).
   * @param {number} velMultiplyer - The velocity multiplier value (should be greater than 1).
   * @param {boolean} invulnerable - Indicates if the power-up makes the player invulnerable.
   */
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

  /**
   * Checks if the power-up had a new collision.
   * @returns {boolean} - True if the power-up had a new collision, false otherwise.
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
   * Sets the bounding box of the power-up.
   * @param {Object} bbox - The bounding box object.
   */
  setBBox(bbox) {
    this.bbox = bbox;
  }

  /**
   * Gets the position of the power-up.
   * @returns {number[]} - An array containing the x, y, and z coordinates of the power-up.
   */
  getPos() {
    return [this.x, this.y, this.z];
  }

  /**
   * Sets the position of the power-up.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate.
   */
  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Gets the parameters of the power-up.
   * @returns {Map<string, any>} - A map containing the power-up parameters.
   */
  getParams() {
    let configs = new Map();
    configs.set("timeEffect", this.timeEffect);
    configs.set("timeBoost", this.timeBoost);
    configs.set("velMultiplyer", this.velMultiplyer);
    configs.set("invulnerable", this.invulnerable);
    return configs;
  }

  /**
   * Applies the power-up effect to the player.
   * @param {Object} player - The player object.
   */
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
