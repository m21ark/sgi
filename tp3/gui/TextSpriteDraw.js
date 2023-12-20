import * as THREE from "three";

export class TextSpriteDraw {
  constructor() {
    this.texture = new THREE.TextureLoader().load("assets/font2.png");
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    this.numRows = 6;
    this.numColumns = 16;
    this.characterWidth = 384 / this.numColumns;
    this.characterHeight = 144 / this.numRows;
    this.characterMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz[\\]^_`ABCDEFGHIJKLMNOPQRSTUVWXYZ{|}~";
  }

  static makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface")
      ? parameters["fontface"]
      : "Courier New";
    var fontsize = parameters.hasOwnProperty("fontsize")
      ? parameters["fontsize"]
      : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness")
      ? parameters["borderThickness"]
      : 4;
    var borderColor = parameters.hasOwnProperty("borderColor")
      ? parameters["borderColor"]
      : { r: 0, g: 0, b: 0, a: 1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor")
      ? parameters["backgroundColor"]
      : { r: 0, g: 0, b: 255, a: 1.0 };
    var textColor = parameters.hasOwnProperty("textColor")
      ? parameters["textColor"]
      : { r: 0, g: 0, b: 0, a: 1.0 };

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    context.fillStyle =
      "rgba(" +
      backgroundColor.r +
      "," +
      backgroundColor.g +
      "," +
      backgroundColor.b +
      "," +
      backgroundColor.a +
      ")";
    context.strokeStyle =
      "rgba(" +
      borderColor.r +
      "," +
      borderColor.g +
      "," +
      borderColor.b +
      "," +
      borderColor.a +
      ")";
    context.fillStyle =
      "rgba(" +
      textColor.r +
      ", " +
      textColor.g +
      ", " +
      textColor.b +
      ", 1.0)";
    context.fillText(message, borderThickness, fontsize + borderThickness);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
  }

  getWidth(text, fontSize = 12) {
    return text.length * this.characterWidth * (fontSize / 10) * 0.03;
  }

  getHeight(fontSize = 12) {
    return this.characterHeight * (fontSize / 10);
  }

  write(scene, x, y, z, text, fontSize = 12, color = 0xffffff) {
    let horizontalSpacing = 0.03;

    text = text.toString();

    let group = new THREE.Group();
    group.textContent = text;

    fontSize = fontSize / 10;

    for (let i = 0; i < text.length; i++) {
      let character = text[i];

      // Check if the character exists in the characterMap.
      let index = this.characterMap.indexOf(character);

      if (index === -1) {
        console.error("Character not found in characterMap: " + character);
        continue;
      }

      let sprite = new THREE.Sprite(this.material.clone()); // Clone the material

      // Set the texture coordinates of the sprite.
      let column = index % this.numColumns;
      let row = Math.floor(index / this.numColumns);

      let left = column / this.numColumns - (this.characterWidth / 4096) * 0.3;
      let top =
        1 - (row + 1) / this.numRows + (this.characterWidth / 4096) * 0.15;

      sprite.material.map = this.material.map.clone(); // Clone the texture map
      sprite.material.map.repeat.set(1 / this.numColumns, 1 / this.numRows);
      sprite.material.map.offset.set(left, top);

      sprite.position.set(
        x + i * this.characterWidth * fontSize * horizontalSpacing,
        y,
        z
      );
      sprite.scale.set(fontSize, fontSize, 1);

      sprite.material.color.setHex(color);
      group.add(sprite);
    }

    scene.add(group);
  }
}
