import * as THREE from "three";

export class MyGarage {
  static openGarage() {
    // search for the object named "door" in the objectModel
    const door = MyGarage.objectModel.getObjectByName("Door");

    // open the door using animation rotation
    const angle = Math.PI / 2; // example angle value
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 5],
      [0, 0, 0, 0, quaternion.x, quaternion.y, quaternion.z, quaternion.w] // pass the quaternion values as keyframes
    );
    const keyFrameClip = new THREE.AnimationClip("Door", 5, [keyFrameAnim]);
    MyGarage.mixer = new THREE.AnimationMixer(door);

    const action = MyGarage.mixer.clipAction(keyFrameClip);
    // Add an event listener for the end of the animation
    MyGarage.mixer.addEventListener("loop", (e) => {
      MyGarage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
      door.rotateZ(angle);
    });

    action.play();
  }

  static closeGarage() {
    const door = MyGarage.objectModel.getObjectByName("Door");

    // close the door using animation rotation
    const angle = Math.PI / 2; // example angle value
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 5],
      [quaternion.x, quaternion.y, quaternion.z, quaternion.w, 0, 0, 0, 0] // pass the quaternion values as keyframes
    );
    const keyFrameClip = new THREE.AnimationClip("Door", 5, [keyFrameAnim]);
    MyGarage.mixer = new THREE.AnimationMixer(door);
    const action = MyGarage.mixer.clipAction(keyFrameClip);
    // Add an event listener for the end of the animation
    MyGarage.mixer.addEventListener("loop", (e) => {
      MyGarage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
      door.rotateZ(-angle);
    });

    action.play();
  }

  static update() {
    if (this.mixer !== undefined && MyGarage.clock != undefined) {
      const delta = MyGarage.clock.getDelta();
      MyGarage.mixer.update(delta);
    }
  }
}

MyGarage.clock = new THREE.Clock();
MyGarage.objectModel = new THREE.Group();
