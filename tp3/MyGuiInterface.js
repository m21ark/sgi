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
    const cameras = this.datgui.addFolder("Cameras");
    cameras.open();

    const cameraNames = [...this.contents.camerasNames];

    this.cameraSelector = cameras.add(
      this.app,
      "activeCameraName",
      cameraNames
    );
    this.cameraSelector.onChange((value) => {
      this.contents.setActiveCamera(value);
    });

    // ===================================================================

    const lightsFolder = this.datgui.addFolder("Lights");
    lightsFolder.open();

    lightsFolder
      .add(this.contents, "lightsOn", true)
      .name("lightsOn")
      .onChange(() => {
        this.contents.toggleLights();
      });

    lightsFolder
      .add(this.contents, "showHelpers", true)
      .name("showHelpers")
      .onChange(() => {
        this.contents.toggleLightHelpers();
      });

    // ===================================================================

    const materialsFolder = this.datgui.addFolder("Materials");
    materialsFolder.open();

    materialsFolder
      .add(this.contents, "useTextures", true)
      .name("useTextures")
      .onChange(() => {
        this.contents.toggleTextures();
      });

    materialsFolder
      .add(this.contents, "useBumpMaps", true)
      .name("useBumpMaps")
      .onChange(() => {
        this.contents.toggleBumpMaps();
      });

    // ===================================================================

    // add a control to enable the control points contents from showing
    const controlPointsFolder = this.datgui.addFolder("Control Points");
    controlPointsFolder.open();
    controlPointsFolder
      .add(this.contents, "showControlPoints", false)
      .name("showControlPoints")
      .onChange(() => {
        this.contents.toggleControlPoints();
      });

    // ===================================================================

    const shadowsFolder = this.datgui.addFolder("Shadows");
    shadowsFolder.close();
    const lightsIDs = Object.keys(this.contents.lights);

    shadowsFolder
      .add(this.contents, "shadowBias", -0.1, 0.1, 0.001)
      .name("shadowBias")
      .onChange(() => {
        this.contents.modifyShadowBias();
      });

    for (let lightID of lightsIDs) {
      if (lightID.includes("_helper")) continue;

      shadowsFolder
        .add(this.contents.lights[lightID], "castShadow", true)
        .name(lightID)
        .onChange(() => {
          this.contents.toggleLightShadow(lightID);
        });
    }

    // ===================================================================

    const wireframeFolder = this.datgui.addFolder("Wireframes");
    wireframeFolder.close();
    const materialIds = Object.keys(this.contents.materials);

    for (let materialId of materialIds) {
      wireframeFolder
        .add(this.contents.materials[materialId], "wireframe", true)
        .name(materialId)
        .onChange(() => {
          this.contents.toggleWireframeMode(materialId);
        });
    }
  }
}

export { MyGuiInterface };
