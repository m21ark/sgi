import * as THREE from "three";

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
    if (this.lastPickedObj)
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

  pickingHelper(intersects, colorChange) {
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (this.notPickableObjIds.includes(obj.name)) {
        this.restoreTargetColor();
        console.log("Object is marked as not to be picked !");
      } else this.changeTargetColor(obj, colorChange);
    } else this.restoreTargetColor();
  }

  updateSelectedLayer() {
    this.raycaster.layers.enableAll();
    if (this.selectedLayer !== "none") {
      let selectedIndex = this.availableLayers[this.selectedLayer];
      this.raycaster.layers.set(selectedIndex);
    }
  }

  onPointerMove(event) {
    if (!this.menu) return;
    if (this.app.activeCameraName !== "MenuCamera") return;

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras["MenuCamera"]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    // 4. picking helper (change color of first intersected object)
    this.pickingHelper(intersects, this.pickingHoverColor);
  }

  onPointerDown(event) {
    if (!this.menu) return;
    if (this.app.activeCameraName !== "MenuCamera") return;

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras["MenuCamera"]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    // 4. picking helper (change color of first intersected object)
    this.pickingHelper(intersects, this.pickingClickColor);

    // indicate the object name that is being picked
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const buttonIndex = parseInt(obj.name.split("_").pop(), 10);
      this.menu.handleButtonClick(buttonIndex);
    }
  }
}
