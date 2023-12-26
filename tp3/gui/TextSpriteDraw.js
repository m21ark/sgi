import * as THREE from "three";

/**
 * Represents a TextSpriteDraw class that provides methods for creating and rendering text sprites in a Three.js scene.
 */
export class TextSpriteDraw {
  /**
   * Constructs a new instance of the TextSpriteDraw class.
   */
  constructor() {
    // Initialize texture and material properties
    this.texture = new THREE.TextureLoader().load("assets/font.png");
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });

    // Define character dimensions and character map
    this.numRows = 6;
    this.numColumns = 16;
    this.characterWidth = 384 / this.numColumns;
    this.characterHeight = 144 / this.numRows;
    this.characterMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz[\\]^_`ABCDEFGHIJKLMNOPQRSTUVWXYZ{|}~";
  }

  /**
   * Creates a text sprite with the specified message and parameters.
   * @param {string} message - The text message to be displayed.
   * @param {object} parameters - The optional parameters for customizing the text sprite.
   * @returns {THREE.Sprite} The created text sprite.
   */
  static makeTextSprite(message, parameters) {
    // Set default parameter values if not provided
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

    // Create a canvas and get the 2D context
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    // Set the font and measure the text width
    context.font = "Bold " + fontsize + "px " + fontface;
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // Set the canvas properties
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

    // Draw the text on the canvas
    context.fillText(message, borderThickness, fontsize + borderThickness);

    // Create a texture from the canvas
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Create a sprite material with the texture
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });

    // Create a sprite with the sprite material
    var sprite = new THREE.Sprite(spriteMaterial);

    // Set the scale of the sprite
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);

    return sprite;
  }

  /**
   * Gets the width of the specified text at the given font size.
   * @param {string} text - The text to measure the width of.
   * @param {number} fontSize - The font size in pixels.
   * @returns {number} The width of the text.
   */
  getWidth(text, fontSize = 12) {
    return text.length * this.characterWidth * (fontSize / 10) * 0.03;
  }

  /**
   * Gets the height of the text at the given font size.
   * @param {number} fontSize - The font size in pixels.
   * @returns {number} The height of the text.
   */
  getHeight(fontSize = 12) {
    return this.characterHeight * (fontSize / 10);
  }

  /**
   * Writes the specified text at the given position in the scene.
   * @param {THREE.Scene} scene - The Three.js scene to add the text to.
   * @param {number} x - The x-coordinate of the text position.
   * @param {number} y - The y-coordinate of the text position.
   * @param {number} z - The z-coordinate of the text position.
   * @param {string} text - The text to be written.
   * @param {number} fontSize - The font size in pixels.
   * @param {number} color - The color of the text in hexadecimal format.
   */
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
