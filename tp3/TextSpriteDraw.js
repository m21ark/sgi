import * as THREE from "three";

export class TextSpriteDraw {
  constructor() {
    this.texture = new THREE.TextureLoader().load("images/font2.png");
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    this.characterWidth = 60; // Assuming each character is 60x60 pixels
    this.characterHeight = 147; // Assuming each character is 60x60 pixels
    this.numRows = 6; // Number of rows in the sprite sheet
    this.numColumns = 16; // Number of columns in the sprite sheet
    this.characterMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ";
    // this.characterMap =
    //  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"; // Add more characters as needed
  }

  write(scene, x, y, text, fontSize = 50, color = 0xffffff) {
    text = text.toString();

    for (let i = 0; i < text.length; i++) {
      const charIndex = this.characterMap.indexOf(text[i]);
      if (charIndex !== -1) {
        const col = charIndex % this.numColumns;
        const row = Math.floor(charIndex / this.numColumns);

        const charGeometry = new THREE.PlaneGeometry(fontSize, fontSize);
        const charMesh = new THREE.Mesh(charGeometry, this.material);

        // Set UV coordinates to render the specific character from the sprite sheet
        const uvOffsetX = col / this.numColumns;
        const uvOffsetY = 1 - (row + 1) / this.numRows;
        const uvs = charGeometry.attributes.uv.array;
        for (let j = 0; j < uvs.length; j += 2) {
          uvs[j] = uvs[j] / this.numColumns + uvOffsetX;
          uvs[j + 1] = uvs[j + 1] / this.numRows + uvOffsetY;
        }

        charMesh.position.set(x + i * fontSize * 0.15, y, 0); // Adjust the multiplier as needed

        // Set scale to make the characters closer horizontally
        charMesh.scale.set(
          fontSize / this.characterHeight,
          fontSize / this.characterWidth,
          1
        );

        // Set color
        charMesh.material.color.setHex(color);

        scene.add(charMesh);
      }
    }
  }
}
