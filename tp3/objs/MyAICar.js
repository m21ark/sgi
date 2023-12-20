import { MyCar } from "./MyCar.js";
import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";
import { Garage } from "./Garage.js";

export class MyAICar {
  constructor(keyPoints = [[0, 0, 0]]) {
    this.aiCar = undefined;

    // Key points for the AI to follow
    this.keyPoints = keyPoints;
    this.keyPoints.push(this.keyPoints[0]);
    this.currentKeyPointIndex = 0;

    this.clock = new THREE.Clock();
  }

  locateFlagStart() {
    return this.keyPoints[this.currentKeyPointIndex];
  }

  getAIcar() {
    return this.aiCar;
  }

  setAIcar(car) {
    this.aiCar = car;
  }

  addAICar(scene) {
    this.aiCar = new THREE.Group();
    this.aiCar.add(MyCar.availableCars.children[0].clone());
    var spritey = TextSpriteDraw.makeTextSprite(" AI Car ", {
      fontsize: 20,
      textColor: { r: 255, g: 255, b: 255, a: 1.0 },
    });
    spritey.position.set(-2, 0.5, -1);

    this.aiCar.add(spritey);
    let position = [...this.locateFlagStart()];
    this.aiCar.position.set(position[0], position[1], position[2]);
    this.aiCar.rotation.y = -Math.PI / 2;
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

  getAICarKeyPointsGroup() {
    return this.KeyPointsgroup;
  }

  getAICarKeyPoints() {
    return this.keyPoints;
  }

  update() {
    const delta = this.clock.getDelta();
    if (this.mixer !== undefined) this.mixer.update(delta);

    if (this.mixer2 !== undefined) this.mixer2.update(delta);
  }

  tyreAnimation(laps, speed) {
    const tyres = this.aiCar.children[0].children[2]; // Assuming the tires are at index 2, adjust if needed

    let flat_keypoints = [];
    for (let i = 0; i < laps; i++) {
      this.keyPoints.forEach((keyPoint) => {
        flat_keypoints.push(...keyPoint);
      });
    }

    const indices = this.keyPoints.map((_, i) => {
      return i * speed;
    });

    let steeringKeyframes = [];
    for (let i = 0; i < laps; i++) {
      this.keyPoints.forEach((keyPoint, index) => {
        let nextKeyPoint = this.keyPoints[index + 1];

        if (nextKeyPoint === undefined) nextKeyPoint = this.keyPoints[0];

        const direction = new THREE.Vector3(...nextKeyPoint)
          .sub(new THREE.Vector3(...keyPoint))
          .normalize();

        const steeringAngle = Math.atan2(direction.x, direction.z) * 0.1;
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
    action.play();
  }

  moveAICar(speed = 0.6, laps = 2) {
    if (this.currentKeyPointIndex === this.keyPoints.length) return;

    if (this.aiCar !== undefined)
      if (this.aiCar.position !== undefined) {
        Garage.openGarage();

        // using keyframes ... use the path points to make a animation for the car ... you should make a rotation of the car, that rotates the car based on the angle of the last position and the angle of the next position

        let flat_keypoints = [];
        for (let i = 0; i < laps; i++) {
          this.keyPoints.forEach((keyPoint) => {
            flat_keypoints.push(...keyPoint);
          });
        }

        const indices = this.keyPoints.map((_, i) => {
          return i * speed;
        });

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

        this.tyreAnimation(laps, speed);
      }
  }
}
