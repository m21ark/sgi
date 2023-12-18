import { MyCar } from "./MyCar.js";
import * as THREE from "three";

export class MyAICar {
  constructor(keyPoints = [[0, 0, 0]]) {
    this.aiCar = undefined;

    // Key points for the AI to follow
    this.keyPoints = keyPoints;
    this.currentKeyPointIndex = 0;

    this.clock = new THREE.Clock()

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


    this.aiCar = MyCar.availableCars.children[0].clone();
    let position = [... this.locateFlagStart()];
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
    const delta = this.clock.getDelta()
    if (this.mixer !== undefined)
      this.mixer.update(delta);
  }

  moveAICar(speed = 0.35, laps = 2) {
    if (this.currentKeyPointIndex === this.keyPoints.length) return;
    
    if (this.aiCar !== undefined)
    
    if (this.aiCar.position !== undefined) {

        // using keyframes ... use the path points to make a animation for the car ... you should make a rotation of the car, that rotates the car based on the angle of the last position and the angle of the next position

        let flat_keypoints = [];
        for (let i = 0; i < laps; i++)
          this.keyPoints.forEach((keyPoint) => {
            flat_keypoints.push(...keyPoint);
          });


        const indeces = this.keyPoints.map((_, i) => i * speed);
        
        for (let i = 0; i < laps; i++)
          for (let j = 0; j < this.indeces; j++)
            indeces.push(indeces[j]);


        const positionKF = new THREE.VectorKeyframeTrack('.position', indeces,
          flat_keypoints,
          THREE.InterpolateSmooth
        )

        const rotationKF = new THREE.VectorKeyframeTrack('.rotation', indeces,
          [... this.keyPoints].map((keyPoint, i) => {
            const nextKeyPoint = this.keyPoints[i + 1];
            if (nextKeyPoint === undefined) return keyPoint;
            const direction = new THREE.Vector3(...nextKeyPoint).sub(new THREE.Vector3(...keyPoint)).normalize();
            const angle = Math.atan2(direction.x, direction.z);
            return [0, angle, 0];
          }),
          THREE.InterpolateSmooth
        )

        const clip = new THREE.AnimationClip('positionAnimation', 100, [positionKF]);

        this.mixer = new THREE.AnimationMixer(this.aiCar);

        const action = this.mixer.clipAction(clip);

        action.play();
      }
  }
}
