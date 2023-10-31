import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {
  /**
   *
   * @param {MyApp} app The application object
   */
  constructor(app) {
    this.app = app;
    this.datgui = new GUI();
    this.contents = null;
  }

  /**
   * Set the contents object
   * @param {MyContents} contents the contents objects
   */
  setContents(contents) {
    this.contents = contents;
  }

  /**
   * Initialize the gui interface
   */
  init() {
    // create gui of the cameras
    const cameras = this.datgui.addFolder("Cameras");
    cameras.open();

    // drop down of the cameras to be selected from cameras array
    const cameraNames = [];

    this.app.cameras.forEach(camera => {
      cameraNames.push(camera.id);
    });

    // push to the camera names the keys od the camera names
    this.cameraSelector = cameras.add(
      this.app,
      "activeCameraName",
      cameraNames
    );
    this.cameraSelector.onChange((value) => {
      this.contents.setActiveCamera(value);
    });
  }
}

export { MyGuiInterface };
