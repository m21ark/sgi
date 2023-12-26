import * as THREE from "three";

/**
 * Represents a controller for managing audio in a 3D scene.
 */
export class MyAudioController {
  /**
   * Creates a new instance of MyAudioController.
   * @param {THREE.Camera} camera - The camera object to attach the audio listener to.
   */
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.sounds = new Map();
  }

  /**
   * Adds a sound to the controller.
   * @param {string} name - The name of the sound.
   * @param {boolean} [loop=false] - Whether the sound should loop.
   * @param {number} [volume=0.5] - The volume of the sound (0.0 to 1.0).
   */
  addSound(name, loop = false, volume = 0.5) {
    const sound = new THREE.Audio(this.listener);
    const path = "audio/" + name + ".mp3";
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(path, function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(loop);
      sound.setVolume(volume);
    });
    this.sounds.set(name, sound);
  }

  /**
   * Plays a sound.
   * @param {string} name - The name of the sound to play.
   */
  playSound(name) {
    const sound = this.sounds.get(name);
    sound.play();
  }

  /**
   * Pauses a sound.
   * @param {string} name - The name of the sound to pause.
   */
  pauseSound(name) {
    const sound = this.sounds.get(name);
    sound.pause();
  }

  /**
   * Stops a sound.
   * @param {string} name - The name of the sound to stop.
   */
  stopSound(name) {
    const sound = this.sounds.get(name);
    sound.stop();
  }

  /**
   * Resets the offset of a sound to the beginning.
   * @param {string} name - The name of the sound to reset.
   */
  resetSound(name) {
    const sound = this.sounds.get(name);
    sound.offset = 0;
  }
}
