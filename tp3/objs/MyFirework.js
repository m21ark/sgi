import * as THREE from "three";

export class MyFireworks {
  constructor(app, pos) {
    this.app = app;
    this.fireworks = [];
    this.pos = pos;
  }

  setPos(pos) {
    this.pos = pos;
  }

  reset() {
    this.fireworks = [];

    // remove all scene children with name "firework"
    this.app.scene.children.forEach((child) => {
      if (child.name === "firework") {
        console.log("removing");
        this.app.scene.remove(child);
      } else console.log("skipping: ", child.name);
    });
  }

  update(prob = 0.2) {
    if (Math.random() < prob)
      this.fireworks.push(new MyFirework(this.app, this.pos));
    for (let i = 0; i < this.fireworks.length; i++) {
      if (this.fireworks[i].done) this.fireworks.splice(i, 1);
      else this.fireworks[i].update();
    }
  }
}

class MyFirework {
  constructor(app, pos) {
    this.app = app;
    this.scene = app.scene;
    this.pos = pos;

    this.done = false;
    this.dest = [];

    this.vertices = null;
    this.colors = null;
    this.geometry = null;
    this.points = null;
    this.explosionPoints = null;

    this.material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      opacity: 1,
      vertexColors: true,
      transparent: true,
      depthTest: false,
    });

    this.height = 8;
    this.speed = 50;

    this.launch();
  }

  getRandomVibrantColor() {
    // Generate a random HSL color with high saturation and brightness
    const h = Math.random(); // Hue
    const s = 1; // Saturation
    const l = 0.5; // Brightness

    // Convert HSL to RGB
    const rgbColor = new THREE.Color().setHSL(h, s, l);

    return [rgbColor.r, rgbColor.g, rgbColor.b];
  }

  /**
   * compute particle launch
   */

  launch() {
    let colors = this.getRandomVibrantColor();

    let x = THREE.MathUtils.randFloat(-5, 5) + this.pos.x;
    let y =
      THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1) +
      this.pos.y;
    let z = THREE.MathUtils.randFloat(-5, 5) + this.pos.z;
    this.dest.push(x, y, z);
    let vertices = [this.pos.x, this.pos.y, this.pos.z];

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = "firework";
    this.app.scene.add(this.points);
  }

  explode(origin, n, rangeBegin, rangeEnd) {
    const explosionGeometry = new THREE.BufferGeometry();
    const explosionVertices = [];
    const explosionColors = [];
    const explosionVelocities = []; // Store velocities for exploded particles

    // Get the position of the original particle
    const originX = origin[0];
    const originY = origin[1];
    const originZ = origin[2];

    for (let i = 0; i < n; i++) {
      // Generate a random direction for each exploded particle
      const direction = new THREE.Vector3(
        THREE.MathUtils.randFloat(-1, 1),
        THREE.MathUtils.randFloat(-1, 1),
        THREE.MathUtils.randFloat(-1, 1)
      ).normalize();

      // Store the velocity direction for each exploded particle
      explosionVelocities.push(direction);

      // Scale the direction vector to be within the specified range
      direction.multiplyScalar(THREE.MathUtils.randFloat(rangeBegin, rangeEnd));

      // Calculate the position of the exploded particle relative to the origin
      const x = originX;
      const y = originY;
      const z = originZ;

      explosionVertices.push(x, y, z);
      explosionColors.push(...this.getRandomVibrantColor());
    }

    explosionGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(explosionVertices), 3)
    );
    explosionGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(explosionColors), 3)
    );

    const explosionPoints = new THREE.Points(explosionGeometry, this.material);
    explosionPoints.name = "firework";
    this.app.scene.add(explosionPoints);

    // Dispose of the geometry and material separately
    explosionPoints.geometry.dispose();
    explosionPoints.material.dispose();

    // remove the original particle that originated the explosion
    this.app.scene.remove(this.points);

    // Update the count in the main geometry
    let verticesAttribute = this.geometry.getAttribute("position");
    verticesAttribute.count += n; // Increment the count by the number of new particles
    this.explosionVelocities = explosionVelocities; // Store the velocities for later use
    this.explosionVertices = explosionVertices; // Store the vertices for later use
    this.explosionPoints = explosionPoints; // Store the points for later use
  }

  /**
   * cleanup
   */
  reset() {
    this.app.scene.remove(this.points);
    console.log("removing exploded points");
    this.dest = [];
    this.vertices = null;
    this.colors = null;
    this.geometry = null;
    this.points = null;
  }

  /**
   * update firework
   * @returns
   */
  update() {
    // do only if objects exist
    if (this.points && this.geometry) {
      let verticesAttribute = this.geometry.getAttribute("position");
      let vertices = verticesAttribute.array;
      let count = verticesAttribute.count;

      // lerp particle positions
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] += (this.dest[i] - vertices[i]) / this.speed;
        vertices[i + 1] += (this.dest[i + 1] - vertices[i + 1]) / this.speed;
        vertices[i + 2] += (this.dest[i + 2] - vertices[i + 2]) / this.speed;
      }
      verticesAttribute.needsUpdate = true;

      // only one particle?
      if (count === 1) {
        // is YY coordinate higher close to destination YY?
        if (Math.ceil(vertices[1]) > this.dest[1] * 0.95) {
          // add n particles departing from the location at (vertices[0], vertices[1], vertices[2])
          this.explode(vertices, 80, this.height * 0.05, this.height * 0.8);
          // reset the main particle to the destination
          vertices[0] = this.dest[0];
          vertices[1] = this.dest[1];
          vertices[2] = this.dest[2];
          verticesAttribute.needsUpdate = true;

          return;
        }
      }

      // are there a lot of particles (aka already exploded)?
      if (count > 1) {
        let verts = this.explosionVertices;

        // Update the positions of exploded particles based on their velocities
        for (let i = 1; i < count; i++) {
          const index = i - 1; // Adjust the index to match explosionVelocities array
          verts[i * 3] += this.explosionVelocities[index].x / this.speed / 2;
          verts[i * 3 + 1] +=
            this.explosionVelocities[index].y / this.speed / 2;
          verts[i * 3 + 2] +=
            this.explosionVelocities[index].z / this.speed / 2;
        }

        // Create a new Float32Array with the updated positions
        const updatedPositions = new Float32Array(verts);

        // Set the updated positions as the attribute for the explosion geometry
        this.explosionPoints.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(updatedPositions, 3)
        );

        // Fade out exploded particles
        this.material.opacity -= 0.01;
        this.material.needsUpdate = true;
      }

      // remove, reset, and stop animating
      if (this.material.opacity <= 0) {
        this.reset();
        this.done = true;
        return;
      }
    }
  }
}
