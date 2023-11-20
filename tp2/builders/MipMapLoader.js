/**
 * @file MipMapLoader.js
 * @description This file contains the implementation of the MipMapLoader class, which is responsible for loading mipmap textures and creating mipmaps for specified levels.
 * @requires THREE
 */

import * as THREE from "three";

/**
 * @class MipMapLoader
 * @classdesc The MipMapLoader class is responsible for loading mipmap textures and creating mipmaps for specified levels.
 */
export class MipMapLoader {
  constructor() {}

  /**
   * Loads a mipmap texture and creates a mipmap for the specified level.
   *
   * @param {THREE.Texture} parentTexture - The parent texture to set the mipmap image.
   * @param {number} level - The level of the mipmap.
   * @param {string} path - The path to the texture image.
   */
  static loadMipmap(parentTexture, level, path) {
    // load texture. On loaded call the function to create the mipmap for the specified level
    new THREE.TextureLoader().load(
      path,
      function (
        mipmapTexture // onLoad callback
      ) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.scale(1, 1);

        const img = mipmapTexture.image;
        canvas.width = img.width;
        canvas.height = img.height;

        // first draw the image
        ctx.drawImage(img, 0, 0);

        // set the mipmap image in the parent texture in the appropriate level
        parentTexture.mipmaps[level] = canvas;
      },
      undefined, // onProgress callback currently not supported
      function (err) {
        console.error(
          "Unable to load the image " +
            path +
            " as mipmap level " +
            level +
            ".",
          err
        );
      }
    );
  }

  /**
   * Creates a MipMap for the given texture object.
   *
   * @param {Object} textureObj - The texture object to create the MipMap for.
   * @param {string} sceneDir - The directory of the scene.
   * @param {Object} texture - The texture object containing the MipMap information.
   * @returns {Object} - The updated texture object with the MipMap.
   */
  static createMipMap(textureObj, sceneDir, texture) {
    if (texture.mipmap0 != null) {
      textureObj.generateMipmaps = false;

      MipMapLoader.loadMipmap(textureObj, 0, sceneDir + texture.mipmap0);
      if (texture.mipmap1)
        MipMapLoader.loadMipmap(textureObj, 1, sceneDir + texture.mipmap1);
      if (texture.mipmap2)
        MipMapLoader.loadMipmap(textureObj, 2, sceneDir + texture.mipmap2);
      if (texture.mipmap3)
        MipMapLoader.loadMipmap(textureObj, 3, sceneDir + texture.mipmap3);
      if (texture.mipmap4)
        MipMapLoader.loadMipmap(textureObj, 4, sceneDir + texture.mipmap4);
      if (texture.mipmap5)
        MipMapLoader.loadMipmap(textureObj, 5, sceneDir + texture.mipmap5);
      if (texture.mipmap6)
        MipMapLoader.loadMipmap(textureObj, 6, sceneDir + texture.mipmap6);
      if (texture.mipmap7)
        MipMapLoader.loadMipmap(textureObj, 7, sceneDir + texture.mipmap7);

      textureObj.needsUpdate = true;
    }

    return textureObj;
  }
}
