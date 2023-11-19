import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

class MyGuiInterface {
  constructor(app) {
    this.app = app;
    this.datgui = new GUI();
    this.contents = null;
  }

  setContents(contents) {
    this.contents = contents;
  }

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

    const lightsFolder = this.datgui.addFolder("Lights");
    lightsFolder.open();

    lightsFolder
      .add(this.contents, "lightsOn", true)
      .name("lightsOn")
      .onChange(() => {
        this.contents.toggleLights();
      });

    lightsFolder
      .add(this.contents, "useShadows", true)
      .name("useShadows")
      .onChange(() => {
        this.contents.toggleShadows();
      });

    lightsFolder
      .add(this.contents, "showHelpers", true)
      .name("showHelpers")
      .onChange(() => {
        this.contents.toggleLightHelpers();
      });
  }
}

export { MyGuiInterface };
