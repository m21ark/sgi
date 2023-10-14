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
    const cameraFolder = this.datgui.addFolder("Camera");
    cameraFolder
      .add(this.app, "activeCameraName", [
        "Perspective",
        "FirstPerson",
        "OrthoBack",
        "OrthoFront",
      ])
      .name("active camera");

    // ========================================================================

    const lightsFolder = this.datgui.addFolder("Lights");

    lightsFolder
      .add(this.contents, "showQuadLight", true)
      .name("Quad Lights")
      .onChange(() => {
        this.contents.update_quad_lights();
      });
    lightsFolder
      .add(this.contents, "showOutsideLight", true)
      .name("Outside Light")
      .onChange(() => {
        this.contents.update_outside_light();
      });
    lightsFolder
      .add(this.contents, "showSpotLight", true)
      .name("Spotlight")
      .onChange(() => {
        this.contents.update_spotlight();
      });
    lightsFolder
      .add(this.contents, "castShadow", true)
      .name("Cast Shadow")
      .onChange(() => {
        this.contents.update_shadows();
      });

    // ========================================================================

    const othersFolder = this.datgui.addFolder("Others");

    othersFolder
      .add(this.contents, "showFireShader", true)
      .name("Show Fire Shader")
      .onChange(() => {
        this.contents.update_fire_shader();
      });
  }
}

export { MyGuiInterface };
