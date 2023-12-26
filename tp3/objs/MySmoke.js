import * as THREE from "three";

/**
 * Represents a smoke effect in a 3D scene.
 */
export class MySmoke {
  /**
   * Creates a new instance of MySmoke.
   * @param {App} app - The application object.
   * @param {THREE.Vector3} pos - The initial position of the smoke.
   */
  constructor(app, pos = new THREE.Vector3(0, 0, 0)) {
    this.app = app;
    this.smokes = [];
    this.pos = pos;
  }

  /**
   * Sets the position of the smoke.
   * @param {THREE.Vector3} pos - The new position of the smoke.
   */
  setPos(pos) {
    this.pos = pos;
  }

  /**
   * Resets the smoke effect by removing all smoke particles.
   */
  reset() {
    this.smokes.forEach((smoke) => {
      smoke.remove();
    });
    this.smokes = [];
  }

  /**
   * Updates the smoke effect by adding new smoke particles and updating existing ones.
   * @param {number} prob - The probability of adding a new smoke particle.
   */
  update(prob = 0.4) {
    if (this.pos === null) return;
    if (Math.random() < prob)
      this.smokes.push(new MySmokeParticle(this.app, this.pos));
    for (let i = 0; i < this.smokes.length; i++) {
      if (this.smokes[i].done) this.smokes.splice(i, 1);
      else this.smokes[i].update();
    }
  }
}

// ================================================================================

/**
 * Represents a smoke particle in a 3D scene.
 * @class
 */
class MySmokeParticle {
  /**
   * Creates a new instance of MySmokeParticle.
   * @constructor
   * @param {Object} app - The application object.
   * @param {Object} startPos - The initial position of the smoke particle.
   */
  constructor(app, startPos) {
    this.app = app;

    // Object
    this.point = null;

    // Physics
    this.gravity = 1.2;
    this.initPos = [startPos.x, startPos.y, startPos.z];
    this.position = [startPos.x, startPos.y, startPos.z];
    this.initVel = [
      THREE.MathUtils.randFloat(-0.3, 0.3),
      THREE.MathUtils.randFloat(0.5, 0.8),
      THREE.MathUtils.randFloat(-0.3, 0.3),
    ];
    this.accel = [0, this.gravity, 0];

    this.setMaterial();

    // Utils
    this.done = false;
    this.clock = new THREE.Clock();

    // Create geometry
    const geometry = this.createGeometry();
    this.point = new THREE.Points(geometry, this.material);
    this.point.name = "smokeParticle";
    this.app.scene.add(this.point);
  }

  /**
   * Sets the material of the smoke particle.
   */
  setMaterial() {
    // random grey color shade
    const shade = THREE.MathUtils.randFloat(0.2, 0.5);
    let color = [shade, shade, shade];

    // convert to hex
    color[0] = parseInt(color[0] * 255);
    color[1] = parseInt(color[1] * 255);
    color[2] = parseInt(color[2] * 255);
    color[0] = color[0] << 16;
    color[1] = color[1] << 8;
    color[2] = color[2];
    color = color[0] | color[1] | color[2];

    // Material
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      color: color,
      opacity: 0.8,
      vertexColors: true,
      transparent: true,
      depthTest: false,
    });

    this.material.size = 0.2;
  }

  /**
   * Removes the smoke particle from the scene.
   */
  remove() {
    // remove self
    this.app.scene.remove(this.point);
    this.done = true;
  }

  /**
   * Updates the physics of the smoke particle.
   * @param {number} time - The elapsed time.
   */
  updatePhysics(time) {
    // x = x0 + v0*t + 0.5*a*t^2
    // v = v0 + a*t
    const aux = time * time * 0.5;
    const x = this.initPos[0] + this.initVel[0] * time; // + this.accel[0] * aux;
    const y = this.initPos[1] + this.initVel[1] * time + this.accel[1] * aux;
    const z = this.initPos[2] + this.initVel[2] * time; //  + this.accel[2] * aux;
    this.position = [x, y, z];
  }

  /**
   * Sets the attribute of the geometry.
   * @param {Object} geom - The geometry object.
   * @param {string} attr - The attribute name.
   * @param {Array} value - The attribute value.
   */
  geomSetAttribute(geom, attr, value) {
    geom.setAttribute(attr, new THREE.Float32BufferAttribute(value, 3));
  }

  /**
   * Creates the geometry for the smoke particle.
   * @returns {Object} The created geometry.
   */
  createGeometry() {
    const vertices = [...this.position];
    const color = [1, 1, 1]; // White color for smoke
    const geometry = new THREE.BufferGeometry();
    this.geomSetAttribute(geometry, "position", vertices);
    this.geomSetAttribute(geometry, "color", color);
    return geometry;
  }

  /**
   * Updates the smoke particle.
   */
  update() {
    const time = this.clock.getElapsedTime();
    this.updatePhysics(time);

    // update point position
    const vertices = [...this.position];
    this.geomSetAttribute(this.point.geometry, "position", vertices);

    // Fade out smoke particles
    this.material.opacity -= 0.01;
    this.material.needsUpdate = true;

    // Remove faded particles
    if (this.material.opacity <= 0) {
      this.remove();
    }
  }
}
