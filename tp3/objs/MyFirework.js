import * as THREE from "three";

export class MyFireworks {
  constructor(app, pos) {
    this.app = app;
    this.fireworks = [];
    this.pos = pos;
  }

  reset() {
    this.fireworks = [];
    // remove all scene children with name "firework"
    this.app.scene.children.forEach((child) => {
      if (child.name === "firework" || child.name === "fireworkFragment")
        this.app.scene.remove(child);
    });
  }

  update(prob = 0.3) {
    if (Math.random() < prob)
      this.fireworks.push(new MyFirework(this.app, this.pos));
    for (let i = 0; i < this.fireworks.length; i++) {
      if (this.fireworks[i].done) this.fireworks.splice(i, 1);
      else this.fireworks[i].update();
    }
  }
}

// ================================================================================

class MyFirework {
  constructor(app, startPos, isFragment = false) {
    this.app = app;

    // Object
    this.point = null;
    this.fragments = [];

    // Physics
    this.gravity = 9.8;
    this.initPos = [startPos.x, startPos.y, startPos.z];
    this.position = [startPos.x, startPos.y, startPos.z];
    this.initVel = [0, 0, 0];
    this.velocity = [0, 0, 0];
    this.accel = [0, -this.gravity, 0];

    // Material
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      opacity: 1,
      vertexColors: true,
      transparent: true,
      depthTest: false,
    });

    // Utils
    this.done = false;
    this.launchSpeed = 4.5;
    this.explosionHeight = null;
    this.hasExploded = isFragment;
    this.isFragment = isFragment;
    this.clock = new THREE.Clock();

    // Launch
    if (!this.isFragment) this.launch();
    else this.radiate();
  }

  getHeighestPoint(vel) {
    // v^2 = v0^2 + 2*a*d
    // d = (v^2 - v0^2)/(2*a)
    const d = (vel * vel) / (2 * this.gravity);
    return d;
  }

  updatePhysics(time) {
    // x = x0 + v0*t + 0.5*a*t^2
    // v = v0 + a*t

    const aux = time * time * 0.5;

    const x = this.initPos[0] + this.initVel[0] * time + this.accel[0] * aux;
    const y = this.initPos[1] + this.initVel[1] * time + this.accel[1] * aux;
    const z = this.initPos[2] + this.initVel[2] * time + this.accel[2] * aux;

    const vx = this.initVel[0] + this.accel[0] * time;
    const vy = this.initVel[1] + this.accel[1] * time;
    const vz = this.initVel[2] + this.accel[2] * time;

    this.position = [x, y, z];
    this.velocity = [vx, vy, vz];
  }

  geomSetAttribute(geom, attr, value) {
    geom.setAttribute(attr, new THREE.Float32BufferAttribute(value, 3));
  }

  geomGetAttribute(geom, attr) {
    return geom.getAttribute(attr).array;
  }

  createGeometry() {
    const vertices = [...this.position];
    const color = this.getRandomVibrantColor();
    const geometry = new THREE.BufferGeometry();
    this.geomSetAttribute(geometry, "position", vertices);
    this.geomSetAttribute(geometry, "color", color);
    return geometry;
  }

  launch() {
    // Calculate initial velocity for launch
    this.initVel = [
      THREE.MathUtils.randFloat(-this.launchSpeed, this.launchSpeed),
      THREE.MathUtils.randFloat(3 * this.launchSpeed, 4 * this.launchSpeed),
      THREE.MathUtils.randFloat(-this.launchSpeed, this.launchSpeed),
    ];

    this.explosionHeight = this.getHeighestPoint(this.initVel[1]);

    // Create geometry
    const geometry = this.createGeometry();
    this.point = new THREE.Points(geometry, this.material);
    this.point.name = "firework";
    this.app.scene.add(this.point);
  }

  explode(originPos, fragN = 40) {
    this.hasExploded = true;
    this.app.scene.remove(this.point);

    this.app.audio.playSound("firework");

    // Create fragments
    for (let i = 0; i < fragN; i++) {
      const pos = { x: originPos[0], y: originPos[1], z: originPos[2] };
      this.fragments.push(new MyFirework(this.app, pos, true));
    }
  }

  radiate() {
    // Calculate initial velocity for launch
    this.initVel = [
      THREE.MathUtils.randFloat(-this.launchSpeed, this.launchSpeed),
      THREE.MathUtils.randFloat(-this.launchSpeed, this.launchSpeed),
      THREE.MathUtils.randFloat(-this.launchSpeed, this.launchSpeed),
    ];

    // Create geometry
    const geometry = this.createGeometry();
    this.point = new THREE.Points(geometry, this.material);
    this.point.name = "fireworkFragment";
    this.app.scene.add(this.point);
  }

  reset() {
    this.done = false;
    this.hasExploded = false;
    this.clock = new THREE.Clock();
    this.position = [...this.initPos];
    this.velocity = [...this.initVel];
    this.accel = [0, -this.gravity, 0];
    this.material.opacity = 1;
    this.material.needsUpdate = true;
  }

  fireworkUpdate() {
    if (!this.hasExploded) {
      const time = this.clock.getElapsedTime();
      this.updatePhysics(time);

      // update point position
      const vertices = [...this.position];
      this.geomSetAttribute(this.point.geometry, "position", vertices);

      if (this.position[1] >= this.explosionHeight) this.explode(this.position);
    } else {
      this.fragments.forEach((frag) => {
        frag.update();
      });

      // firework is done if all fragments are done
      if (this.fragments.every((frag) => frag.done)) this.done = true;
    }
  }

  fragmentUpdate() {
    // update physics
    const time = this.clock.getElapsedTime();
    this.updatePhysics(time);

    // update point position
    const vertices = [...this.position];
    this.geomSetAttribute(this.point.geometry, "position", vertices);

    // Fade out exploded particles
    this.material.opacity -= 0.025;
    this.material.needsUpdate = true;

    // Remove exploded particles
    if (this.material.opacity <= 0 || this.position[1] <= 0) {
      this.app.scene.remove(this.point);
      this.done = true;
    }
  }

  update() {
    if (this.isFragment) this.fragmentUpdate();
    else this.fireworkUpdate();
  }

  getRandomVibrantColor() {
    const h = Math.random();
    const s = 1;
    const l = 0.5;
    const rgbColor = new THREE.Color().setHSL(h, s, l);
    return [rgbColor.r, rgbColor.g, rgbColor.b];
  }
}
