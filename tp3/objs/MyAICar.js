import { MyCar } from "./MyCar.js";
import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

/**
 * Represents an AI-controlled car.
 */
export class MyAICar {
  /**
   * Represents an AI Car.
   * @constructor
   * @param {Array<Array<number>>} keyPoints - The key points for the AI to follow.
   */
  constructor(keyPoints = [[0, 0, 0]]) {
    this.aiCar = undefined;

    // Key points for the AI to follow
    this.keyPoints = keyPoints;
    this.currentKeyPointIndex = 0;

    this.clock = new THREE.Clock();
  }

  /**
   * Gets the final time of the AI car.
   * @returns {number} The rounded final time.
   */
  getFinalTime() {
    return Math.round(this.finalTime);
  }

  /**
   * Locates the start position of the flag.
   * @returns {number[]} The start position of the flag as an array [x, y, z].
   */
  locateFlagStart() {
    let pos = this.keyPoints[this.currentKeyPointIndex];
    return [pos.x, 0.1, pos.z];
  }

  /**
   * Retrieves the AI car.
   * @returns {Object} The AI car object.
   */
  getAIcar() {
    return this.aiCar;
  }

  /**
   * Sets the AI car for this instance.
   * @param {Car} car - The AI car to set.
   */
  setAIcar(car) {
    this.aiCar = car;
  }

  /**
   * Resumes the animation of the AI car.
   */
  resumeAnimation() {
    if (this.mixer) {
      this.mixer.timeScale = 1;
      this.mixer2.timeScale = 1;
    }
  }

  /**
   * Stops the animation of the AI car.
   */
  stopAnimation() {
    if (this.mixer) {
      this.mixer.timeScale = 0;
      this.mixer2.timeScale = 0;
    }
  }

  /**
   * Adds an AI car to the scene.
   *
   * @param {THREE.Scene} scene - The scene to add the AI car to.
   * @param {number} [rivalCarIndex=0] - The index of the rival car to use.
   */
  addAICar(scene, rivalCarIndex = 0) {
    this.aiCar = new THREE.Group();
    this.carIndex = rivalCarIndex;

    let car = MyCar.availableCars.children[rivalCarIndex].clone();

    // rotate the car in respect to the next key point
    let nextKeyPoint = this.keyPoints[this.currentKeyPointIndex + 1];
    if (nextKeyPoint === undefined) nextKeyPoint = this.keyPoints[1];

    const direction = new THREE.Vector3(...nextKeyPoint)
      .sub(new THREE.Vector3(...this.keyPoints[this.currentKeyPointIndex]))
      .normalize();
    const angle = Math.atan2(direction.x, direction.z);

    this.aiCar.rotation.y = angle;

    this.aiBB = new THREE.Box3().setFromObject(car);
    this.aiCar.add(car);
    var spritey = TextSpriteDraw.makeTextSprite("Rival", {
      fontsize: 16,
      textColor: { r: 255, g: 255, b: 255, a: 1.0 },
    });
    spritey.position.set(-3, 0.5, -1);

    this.aiCar.add(spritey);
    let position = [...this.locateFlagStart()];
    this.aiCar.position.set(position[0], position[1], position[2]);
    scene.add(this.aiCar);

    // add a small translucid blue spehere to each key point
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5,
    });

    this.KeyPointsgroup = new THREE.Group();
    this.KeyPointsgroup.name = "AI_KeyPoints";

    this.keyPoints.forEach((keyPoint) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...keyPoint);
      sphere.visible = false;
      this.KeyPointsgroup.add(sphere);
    });

    scene.add(this.KeyPointsgroup);
  }

  /**
   * Retrieves the key points group of the AI car.
   * @returns {Array} The key points group of the AI car.
   */
  getAICarKeyPointsGroup() {
    return this.KeyPointsgroup;
  }

  /**
   * Retrieves the key points of the AI car.
   * @returns {Array} The key points of the AI car.
   */
  getAICarKeyPoints() {
    return this.keyPoints;
  }

  /**
   * Updates the state of the AI car.
   */
  update() {
    const delta = this.clock.getDelta();
    if (this.mixer !== undefined) this.mixer.update(delta);
    if (this.mixer2 !== undefined) this.mixer2.update(delta);
  }

  /**
   * Performs a tyre animation based on the number of laps and speed.
   * @param {number} laps - The number of laps to perform the animation.
   * @param {number} speed - The speed of the animation.
   */
  tyreAnimation(laps, speed) {
    // const tyres = this.aiCar.children[0].children[2];
    const tyres = this.aiCar.children[0].children.filter((child) =>
      child.name.includes("front")
    )[0];

    let flat_keypoints = [];
    for (let i = 0; i < laps; i++) {
      this.keyPoints.forEach((keyPoint) => {
        flat_keypoints.push(...keyPoint);
      });
    }

    let acumDis = 0;
    const indices = [];

    for (let i = 0; i < laps; i++) {
      this.keyPoints.forEach((_, j) => {
        let distanceSum = 0;
        const numPoints = 1;

        for (let k = 1; k <= numPoints; k++) {
          const nextIndex = (j + k) % this.keyPoints.length;
          const distance = Math.sqrt(
            Math.pow(this.keyPoints[nextIndex].x - this.keyPoints[j].x, 2) +
              Math.pow(this.keyPoints[nextIndex].y - this.keyPoints[j].y, 2) +
              Math.pow(this.keyPoints[nextIndex].z - this.keyPoints[j].z, 2)
          );
          distanceSum += distance;
        }

        const averageDistance = distanceSum / numPoints;

        const decayFactor = 0.04; // Adjust the decay factor as needed
        let adjustedSpeed =
          (speed - 0.3) * Math.exp(decayFactor * averageDistance);
        adjustedSpeed = Math.min(2, adjustedSpeed);
        let adjustedDistance = acumDis + adjustedSpeed;

        indices.push(acumDis);
        acumDis = adjustedDistance;
      });
    }

    let steeringKeyframes = [];
    for (let i = 0; i < laps; i++) {
      this.keyPoints.forEach((keyPoint, index) => {
        let nextKeyPoint = this.keyPoints[index + 1];

        if (nextKeyPoint === undefined) nextKeyPoint = this.keyPoints[0];

        const direction = new THREE.Vector3(...nextKeyPoint)
          .sub(new THREE.Vector3(...keyPoint))
          .normalize();

        const steeringAngle = Math.atan2(direction.x, direction.z) * 0.08;
        const steeringQuaternion = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          steeringAngle
        );
        steeringKeyframes.push(
          steeringQuaternion.x,
          steeringQuaternion.y,
          steeringQuaternion.z,
          steeringQuaternion.w
        );
      });
    }

    const steeringKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      indices,
      steeringKeyframes
    );

    const rotationClip = new THREE.AnimationClip("tyreAnim", 100, [steeringKF]);
    this.mixer2 = new THREE.AnimationMixer(tyres);
    const action = this.mixer2.clipAction(rotationClip);
    this.mixer2.addEventListener("loop", (event) => {
      this.mixer2.stopAllAction(); // Stop the animation mixer to prevent further updates
    });
    action.play();
  }

  /**
   * Moves the AI car along a predefined path using keyframes.
   * The car rotates based on the angle between the current position and the next position.
   * @param {number} [speed=0.6] - The speed of the car.
   * @param {number} [laps=2] - The number of laps the car should complete.
   */
  moveAICar(speed = 0.6, laps = 2) {
    if (this.currentKeyPointIndex === this.keyPoints.length) return;

    if (this.aiCar !== undefined)
      if (this.aiCar.position !== undefined) {
        let flat_keypoints = [];
        for (let i = 0; i < laps; i++) {
          this.keyPoints.forEach((keyPoint) => {
            flat_keypoints.push(keyPoint.x, 0.1, keyPoint.z);
          });
        }
        let acumDis = 0;

        const indices = [];

        for (let i = 0; i < laps; i++) {
          this.keyPoints.forEach((_, j) => {
            let distanceSum = 0;
            const numPoints = 1;

            for (let k = 1; k <= numPoints; k++) {
              const nextIndex = (j + k) % this.keyPoints.length;
              const distance = Math.sqrt(
                Math.pow(this.keyPoints[nextIndex].x - this.keyPoints[j].x, 2) +
                  Math.pow(
                    this.keyPoints[nextIndex].y - this.keyPoints[j].y,
                    2
                  ) +
                  Math.pow(this.keyPoints[nextIndex].z - this.keyPoints[j].z, 2)
              );
              distanceSum += distance;
            }

            const averageDistance = distanceSum / numPoints;

            const decayFactor = 0.04; // Adjust the decay factor as needed
            let adjustedSpeed =
              (speed - 0.3) * Math.exp(decayFactor * averageDistance);
            adjustedSpeed = Math.min(2, adjustedSpeed);
            let adjustedDistance = acumDis + adjustedSpeed;

            indices.push(acumDis);
            acumDis = adjustedDistance;
          });
        }

        this.finalTime = indices[indices.length - 1];

        let rotationKeyframes = [];
        for (let i = 0; i < laps; i++) {
          this.keyPoints.forEach((keyPoint, index) => {
            let nextKeyPoint = this.keyPoints[index + 1];
            if (nextKeyPoint === undefined) nextKeyPoint = this.keyPoints[1];

            const direction = new THREE.Vector3(...nextKeyPoint)
              .sub(new THREE.Vector3(...keyPoint))
              .normalize();
            const angle = Math.atan2(direction.x, direction.z);
            const quaternion = new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(0, 1, 0),
              angle
            );
            rotationKeyframes.push(
              quaternion.x,
              quaternion.y,
              quaternion.z,
              quaternion.w
            );
          });
        }

        const rotationKF = new THREE.QuaternionKeyframeTrack(
          ".quaternion",
          indices,
          rotationKeyframes
        );

        const positionKF = new THREE.VectorKeyframeTrack(
          ".position",
          indices,
          flat_keypoints,
          THREE.InterpolateSmooth
        );

        const clip = new THREE.AnimationClip("positionAnimation", 100, [
          positionKF,
        ]);

        const rotationClip = new THREE.AnimationClip("rotationAnimation", 100, [
          rotationKF,
        ]);

        this.mixer = new THREE.AnimationMixer(this.aiCar);

        const action = this.mixer.clipAction(clip);
        action.play();

        const rotationAction = this.mixer.clipAction(rotationClip);
        rotationAction.play();

        // Add event listener to loop on the mixer
        this.mixer.addEventListener("loop", (event) => {
          this.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
        });

        this.tyreAnimation(laps, speed);
      }
  }
}
