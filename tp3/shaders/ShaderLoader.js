/**
 * A utility class for loading shaders.
 */
export class ShaderLoader {
  /**
   * Retrieves the vertex and fragment shaders from the specified path.
   * @param {string} path - The path to the shaders (without file extensions).
   * @returns {Array} - An array containing the vertex shader and fragment shader.
   */
  static get(path) {
    this.readShader(path + ".vert", (vertexShader) => {
      this.vertexShader = vertexShader;
      this.readShader(path + ".frag", (fragmentShader) => {
        this.fragmentShader = fragmentShader;
      });
    });
    return [this.vertexShader, this.fragmentShader];
  }

  /**
   * Reads a shader file from the specified path and invokes the callback function with the shader code.
   * @param {string} path - The path to the shader file.
   * @param {function} callback - The callback function to be invoked with the shader code.
   */
  static readShader(path, callback) {
    const request = new XMLHttpRequest();
    request.open("GET", path, false);
    request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200)
        callback(request.responseText);
    };
    request.send();
  }
}
