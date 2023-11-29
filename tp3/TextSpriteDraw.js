import * as THREE from "three";

export class TextSpriteDraw {
  constructor() {
    this.texture = new THREE.TextureLoader().load("assets/font3.png");
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: false,
    });
    this.numRows = 10;
    this.numColumns = 10;
    this.characterWidth = 4096 / this.numColumns;
    this.characterHeight = 4096 / this.numRows;
    this.characterMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"; // Add more characters as needed
  }

  getWidth(text, fontSize = 12) {
    return text.length * this.characterWidth * fontSize * 0.0025;
  }

  getHeight(fontSize = 12) {
    return this.characterHeight * fontSize * 0.0025;
  }

  write(scene, x, y, z, text, fontSize = 12, color = 0xffffff) {
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
        x + i * this.characterWidth * fontSize * 0.0025,
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
