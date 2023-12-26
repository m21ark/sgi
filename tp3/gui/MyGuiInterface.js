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

    utisFolder
      .add(this.contents, "showCheckPoints", false)
      .name("showCheckPoints")
      .onChange(() => {
        this.contents.toogleCheckpointVisibility();
      });

    utisFolder
      .add(this.contents, "showHitboxes", false)
      .name("showHitboxes")
      .onChange(() => {
        this.contents.toogleSHowHitboxes();
      });

    utisFolder.add(this.contents, "triggerCountDown").name("triggerCountDown");
    utisFolder.add(this.contents, "triggerPodium").name("triggerPodium");

    // ==================================================================

    const debugCameraFolder = utisFolder.addFolder("Debug Camera");
    const debugTarget = this.contents.debugCam.player.position;
    debugCameraFolder.add(debugTarget, "x", -2000, 400);
    debugCameraFolder.add(debugTarget, "y", -400, 400);
    debugCameraFolder.add(debugTarget, "z", -400, 400);
  }
}

export { MyGuiInterface };
