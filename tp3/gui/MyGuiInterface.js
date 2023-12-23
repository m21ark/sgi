import { GUI } from "three/addons/libs/lil-gui.module.min.js";

/**
 * Represents a GUI interface for controlling the application.
 * @class
 */
class MyGuiInterface {
  constructor(app) {
    this.app = app;
    this.datgui = new GUI();
    this.contents = null;
  }

  /**
   * Sets the contents of the GUI interface.
   * @param {any} contents - The contents to be set.
   */
  setContents(contents) {
    this.contents = contents;
  }

  /**
   * Initializes the GUI interface.
   */
  init() {
    const cameraFolder = this.datgui.addFolder("Camera");
    cameraFolder
      .add(this.app, "activeCameraName", [
        "Perspective",
        "MenuCamera",
        "FirstPerson",
        "Debug",
      ])
      .name("active camera");

    // ===================================================================

    const utisFolder = this.datgui.addFolder("Utils");
    utisFolder.open();

    utisFolder.add(this.contents, "moveCar", false).name("moveCar");

    utisFolder
      .add(this.contents, "showAIKeyPoints", false)
      .name("showAIKeyPoints")
      .onChange(() => {
        this.contents.toogleShowAIKeyPoints();
      });

    utisFolder
      .add(this.contents, "showControlPoints", false)
      .name("showControlPoints")
      .onChange(() => {
        this.contents.toogleShowControlPoints();
      });

    utisFolder.add(this.contents, "toggleCountDown").name("toggleCountDown");

    utisFolder.add(this.contents, "triggerPodium").name("triggerPodium");
  }
}

export { MyGuiInterface };
