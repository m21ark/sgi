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

    // shadow biass slinder
    lightsFolder
      .add(this.contents, "shadowBias", -0.1, 0.1, 0.001)
      .name("shadowBias")
      .onChange(() => {
        this.contents.modifyShadowBias();
      });

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
