import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";

export class MyPicker {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.near = 1;
    this.raycaster.far = 1000;

    this.pointer = new THREE.Vector2();
    this.intersectedObj = null;
    this.pickingHoverColor = "0xFFFFFF";
    this.pickingClickColor = "0xFFFF00";

    this.menu = null;
    this.app = null;

    this.availableLayers = ["none", 1, 2, 3, 4, 5, 6, 7, 8];
    this.selectedLayer = this.availableLayers[1];

    this.notPickableObjIds = [];

    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    document.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointerup", this.restoreTargetColor.bind(this));

    this.updateSelectedLayer();
  }

  setActiveMenu(menu) {
    this.menu = menu;
    this.app = menu.app;
  }

  clearMenu() {
    this.menu = null;
    this.app = null;
  }

  setActiveLayer(layer) {
    if (!this.availableLayers.includes(layer))
      throw new Error("Layer not available");
    this.selectedLayer = layer;
  }

  addToIgnoreList(obj) {
    obj.name = "ignore_" + this.notPickableObjIds.length;
    this.notPickableObjIds.push(obj.name);
    return obj;
  }

  setObjLayers(obj, name, layer = 1) {
    if (!this.availableLayers.includes(layer))
      throw new Error("Layer not available");
    obj.name = name;
    obj.layers.enable(this.availableLayers[layer]);
    return obj;
  }

  changeTargetColor(obj, color) {
    if (this.lastPickedObj && this.lastPickedObj.material !== undefined)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = obj;
    this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
    this.lastPickedObj.material.color.setHex(color);
  }

  restoreTargetColor() {
    if (this.lastPickedObj)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = null;
  }

  changeSpriteColor(obj, color) {
    if (this.lastPickedObj && this.lastPickedObj.material !== undefined)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = obj;
    this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
    this.lastPickedObj.material.color.setHex(color);
  }

  setCarSpriteColor(obj, color, parent) {

    //remove obj from parent and add a new object
    parent.remove(obj);

    obj = TextSpriteDraw.makeTextSprite(parent.name,
      {
        fontsize: 20, textColor: color,
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        borderThickness: 6
      });
    obj.position.set(4, 0, 0);

    this.lastPickedCar = obj;
    parent.add(obj);
  }

  resetLastCarSpriteColor() {
    if (this.lastPickedCar) {
      let parent = this.lastPickedCar.parent;
      parent.remove(this.lastPickedCar);
      this.lastPickedCar = null;
      let obj = TextSpriteDraw.makeTextSprite(parent.name,
        {
          fontsize: 20, textColor: { r: 255, g: 255, b: 255, a: 1.0 },
          borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
          borderThickness: 6
        });
      obj.position.set(4, 0, 0);

      parent.add(obj);
    }
  }

  pickingHelper(intersects, colorChange) {
    if (intersects.length > 0) {
      let obj = intersects[0].object;

      if (this.selectedLayer == 0) {
        // check the first object that has type Sprite
        let i = 0;
        while (intersects[i] !== undefined
          && intersects[i].object.type !== "Sprite") {
          i++;
        }
        if (i > intersects.length - 1 || intersects[i] === undefined) return;
        obj = intersects[i].object;
        let parent = obj.parent;

        this.resetLastCarSpriteColor();
        this.setCarSpriteColor(obj, { r: 255, g: 20, b: 20, a: 1.0 }, parent);

        return;
      }

      if (this.notPickableObjIds.includes(obj.name)) {
        this.restoreTargetColor();
        console.log("Object is marked as not to be picked !");
      } else this.changeTargetColor(obj, colorChange);
    } else {
      this.resetLastCarSpriteColor();
      this.restoreTargetColor();
    };
  }

  updateSelectedLayer() {
    this.raycaster.layers.enableAll();
    if (this.selectedLayer !== "none") {
      let selectedIndex = this.availableLayers[this.selectedLayer];
      this.raycaster.layers.set(selectedIndex);
    }
  }

  setSelectedLayer(layer) {
    this.selectedLayer = layer;
    this.updateSelectedLayer();
  }

  onPointerMove(event) {
    if (!this.menu) return;
    if (this.app.activeCameraName !== "MenuCamera"
      && this.app.activeCameraName !== "Garage") return;

    let cam = this.app.activeCameraName;

    if (this.app.activeCameraName === "Garage") {
      this.setSelectedLayer(0);
    }
    else {
      this.setSelectedLayer(1);
    }

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras[cam]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    // 4. picking helper (change color of first intersected object)
    this.pickingHelper(intersects, this.pickingHoverColor);
  }

  onPointerDown(event) {
    if (!this.menu) return;
    if (this.app.activeCameraName !== "MenuCamera"
      && this.app.activeCameraName !== "Garage") return;

    if (this.app.activeCameraName === "Garage") {
      this.setSelectedLayer(0);
    }
    else {
      this.setSelectedLayer(1);
    }

    let cam = this.app.activeCameraName;

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras[cam]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    // 4. picking helper (change color of first intersected object)
    this.pickingHelper(intersects, this.pickingClickColor);

    // indicate the object name that is being picked
    console.log(intersects);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      console.log("Selected object: " + obj.name);
      const buttonIndex = parseInt(obj.name.split("_").pop(), 10);
      this.menu.handleButtonClick(buttonIndex);
    }
  }
}
