import * as THREE from "three";

export class MyAudioController {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.sounds = new Map();
  }

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

  playSound(name) {
    const sound = this.sounds.get(name);
    sound.play();
  }

  pauseSound(name) {
    const sound = this.sounds.get(name);
    sound.pause();
  }

  stopSound(name) {
    const sound = this.sounds.get(name);
    sound.stop();
  }

  resetSound(name) {
    const sound = this.sounds.get(name);
    sound.offset = 0;
  }
}
