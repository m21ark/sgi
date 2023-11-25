import { MyCar } from "./MyCar.js";
import * as THREE from "three";

export class MyAICar {
  constructor(keyPoints = [[0, 0, 0]]) {
    this.aiCar = undefined;

    // Key points for the AI to follow
    this.keyPoints = keyPoints;
    this.currentKeyPointIndex = 0;
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

  addAICar(secne) {
    // create box to be car
    const geometry = new THREE.BoxGeometry(1, 3, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      specular: 0x111111,
      shininess: 30,
    });
    this.aiCar = new THREE.Mesh(geometry, material);
    this.aiCar.position.set(...this.locateFlagStart());
    this.aiCar.rotation.set(0, 0, 0);
    secne.add(this.aiCar);

    // add a small translucid blue spehere to each key point
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
    });
    this.keyPoints.forEach((keyPoint) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...keyPoint);
      secne.add(sphere);
    });
    
  }

  moveAICar(speed=0.2) {
    if (this.currentKeyPointIndex === this.keyPoints.length) return;

    if (this.aiCar !== undefined)
      if (this.aiCar.position !== undefined) {
        const targetPoint = new THREE.Vector3(
          ...this.keyPoints[this.currentKeyPointIndex]
        );
        const distance = this.aiCar.position.distanceTo(targetPoint);

        // Adjust this threshold as needed to determine when the car reaches a point
        const threshold = 0.1;

        if (distance > threshold) {
          // Move towards the target point
          const direction = targetPoint
            .clone()
            .sub(this.aiCar.position)
            .normalize();
          this.aiCar.position.add(direction.multiplyScalar(speed));
        } else {
          // Move to the next point in the list
          this.currentKeyPointIndex =
            (this.currentKeyPointIndex + 1) % (this.keyPoints.length + 1);
        }
      }
  }
}
