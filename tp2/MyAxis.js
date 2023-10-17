import * as THREE from "three";
import { MyApp } from "./MyApp.js";

/**
 * This class contains a 3D axis representation
 */
class MyAxis extends THREE.Object3D {
  /**
   *
   * @param {MyApp} app the application object
   * @param {number} size the size of each axis
   * @param {number} baseRadius the base radius of each axis
   * @param {number} xxColor the hexadecimal representation of the xx axis color
   * @param {number} yyColor the hexadecimal representation of the xx axis color
   * @param {number} zzColor the hexadecimal representation of the zz axis color
   */
  constructor(app, size, baseRadius, xxColor, yyColor, zzColor) {
    super();
    this.app = app;
    this.type = "Group";
    this.size = size || 2;
    this.baseRadius = baseRadius || 0.05;
    this.xxColor = xxColor || 0xff0000;
    this.yyColor = yyColor || 0x00ff00;
    this.zzColor = zzColor || 0x0000ff;

    // an axis helper
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.setColors(
      new THREE.Color(this.xxColor),
      new THREE.Color(this.yyColor),
      new THREE.Color(this.zzColor)
    );
    this.add(axesHelper);
  }
}

MyAxis.prototype.isGroup = true;

export { MyAxis };
