import * as THREE from "three";


export class Garage {

    static openGarage() {
        // search for the object named "door" in the objectModel
        const door = Garage.objectModel.getObjectByName("Door");


        // open the door using animation rotation
        const angle = Math.PI / 2; // example angle value
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
            ".quaternion",
            [0, 10],
            [0, 0, 0, 0, quaternion.x, quaternion.y, quaternion.z, quaternion.w] // pass the quaternion values as keyframes
        );
        const keyFrameClip = new THREE.AnimationClip("Door", 10, [keyFrameAnim]);
        Garage.mixer = new THREE.AnimationMixer(door);
        
        
        const action = Garage.mixer.clipAction(keyFrameClip);
        // Add an event listener for the end of the animation
        Garage.mixer.addEventListener('loop', (e) => {

            Garage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
            door.rotateZ(angle);
            //Garage.closeGarage(door);
        });

        action.play();
    }

    static closeGarage(door) {

        // close the door using animation rotation
        const angle = Math.PI / 2; // example angle value
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
            ".quaternion",
            [0, 10],
            [ quaternion.x, quaternion.y, quaternion.z, quaternion.w, 0,0,0,0] // pass the quaternion values as keyframes
        );
        const keyFrameClip = new THREE.AnimationClip("Door", 10, [keyFrameAnim]);
        Garage.mixer = new THREE.AnimationMixer(door);
        const action = Garage.mixer.clipAction(keyFrameClip);
        // Add an event listener for the end of the animation
        Garage.mixer.addEventListener('loop', (e) => {

            Garage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
            door.rotateZ(-angle);
        });

        action.play();
    }


    static update() {
        if (this.mixer !== undefined && Garage.clock != undefined) {
            const delta = Garage.clock.getDelta();
            Garage.mixer.update(delta);
        }
    }

}

Garage.clock = new THREE.Clock();
Garage.objectModel = new THREE.Group();
