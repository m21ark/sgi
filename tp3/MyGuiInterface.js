import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

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
      .add(this.app, "activeCameraName", ["Perspective", "FirstPerson"])
      .name("active camera");

    const moveCarFolder = this.datgui.addFolder("Movement");
    moveCarFolder.open();

    moveCarFolder
      .add(this.contents, "moveCar", false)
      .name("moveCar")
      .onChange(() => {
        this.contents.toggleMoveCar();
      });

    moveCarFolder
      .add(this.contents, "showAIKeyPoints", false)
      .name("showAIKeyPoints")
      .onChange(() => {
        this.contents.toogleShowAIKeyPoints();
      });
  }
}

export { MyGuiInterface };
