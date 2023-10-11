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
        "OrthoFront"
      ])
      .name("active camera");
    /* 
    boxFolder
      .add(this.contents, "boxMeshSize", 0, 10)
      .name("size")
      .onChange(() => {
        this.contents.rebuildBox();
      });
    boxFolder.add(this.contents, "boxEnabled", true).name("enabled");
    boxFolder.add(this.contents.boxDisplacement, "x", -5, 5);
    boxFolder.add(this.contents.boxDisplacement, "y", -5, 5);
    boxFolder.add(this.contents.boxDisplacement, "z", -5, 5);
    boxFolder.open();

    const data = {
      "diffuse color": this.contents.diffusePlaneColor,
      "specular color": this.contents.specularPlaneColor,
    };

    const planeFolder = this.datgui.addFolder("Plane");
    planeFolder.addColor(data, "diffuse color").onChange((value) => {
      this.contents.updateDiffusePlaneColor(value);
    });
    planeFolder.addColor(data, "specular color").onChange((value) => {
      this.contents.updateSpecularPlaneColor(value);
    });

    planeFolder
      .add(this.contents, "planeShininess", 0, 1000)
      .name("shininess")
      .onChange((value) => {
        this.contents.updatePlaneShininess(value);
      });

    planeFolder.open();

    const cameraFolder = this.datgui.addFolder("Camera");
    cameraFolder
      .add(this.app, "activeCameraName", [
        "Perspective",
        "First Person",
        "Left",
        "Top",
        "Right",
        "Back",
        "Front",
      ])
      .name("active camera");

    cameraFolder
      .add(this.app.activeCamera.position, "x", 0, 10)
      .name("x coord");
    cameraFolder.open(); */
  }
}

export { MyGuiInterface };
