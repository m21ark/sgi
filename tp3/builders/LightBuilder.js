import * as THREE from "three";

/**
 * Class for building lights.
 * @class
 */
export class LightBuilder {
  /**
   * Creates a new instance of LightBuilder.
   * @param {App} app - The application object.
   * @param {Array} contents - The contents array.
   */
  constructor(app, contents) {
    this.app = app;
    this.contents = contents;
  }

  /**
   * Creates and sets up a point light in the scene.
   *
   * @param {Object} obj - The configuration object for the point light.
   * @returns {Array} An array containing the point light and its helper.
   */
  setPointLight(obj) {
    // creation
    let pointLight = new THREE.PointLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      obj.decay
    );

    if (!obj.enabled) pointLight.intensity = 0;

    // position
    pointLight.position.set(...obj.position);

    //shadows
    pointLight.castShadow = obj.castshadow;
    pointLight.shadow.mapSize.width = obj.shadowmapsize;
    pointLight.shadow.mapSize.height = obj.shadowmapsize;
    pointLight.shadow.camera.far = obj.shadowfar;

    pointLight.shadow.bias = this.contents.shadowBias;

    this.contents.lights[obj.id] = pointLight;

    // create helper
    let pointLightHelper = new THREE.PointLightHelper(pointLight);
    this.contents.lights[obj.id + "_helper"] = pointLightHelper;

    return [pointLight, pointLightHelper];
  }

  /**
   * Sets up a directional light based on the provided object.
   *
   * @param {Object} obj - The object containing the properties for the directional light.
   * @returns {Array} An array containing the directional light and its helper.
   */
  setDirectionalLight(obj) {
    // creation
    let directionalLight = new THREE.DirectionalLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity
    );

    if (!obj.enabled) directionalLight.intensity = 0;

    // position and target
    directionalLight.position.set(...obj.position);
    directionalLight.target.position.set(...[0, 0, 0]);
    // no target defined

    //shadows
    directionalLight.castShadow = obj.castshadow;
    directionalLight.shadow.mapSize.width = obj.shadowmapsize;
    directionalLight.shadow.mapSize.height = obj.shadowmapsize;
    directionalLight.shadow.camera.far = obj.shadowfar;

    directionalLight.shadow.camera.left = obj.shadowleft;
    directionalLight.shadow.camera.right = obj.shadowright;
    directionalLight.shadow.camera.top = obj.shadowtop;
    directionalLight.shadow.camera.bottom = obj.shadowbottom;

    directionalLight.shadow.bias = this.contents.shadowBias;

    this.contents.lights[obj.id] = directionalLight;

    // create helper
    let directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight
    );
    this.contents.lights[obj.id + "_helper"] = directionalLightHelper;

    return [directionalLight, directionalLightHelper];
  }

  /**
   * Converts an angle from degrees to radians.
   * @param {number} angle - The angle in degrees.
   * @returns {number} The angle in radians.
   */
  toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  /**
   * Sets up a spotlight with the provided parameters.
   *
   * @param {Object} obj - The object containing spotlight properties.
   * @returns {Array} An array containing the spotlight and its helper.
   */
  setSpotlight(obj) {
    // creation
    let spotLight = new THREE.SpotLight(
      new THREE.Color(obj.color.r, obj.color.g, obj.color.b),
      obj.intensity,
      obj.distance,
      this.toRadians(obj.angle),
      obj.penumbra,
      obj.decay
    );

    if (!obj.enabled) spotLight.intensity = 0;

    // position and target
    spotLight.position.set(...obj.position);
    spotLight.target.position.set(...obj.target);

    //shadows
    spotLight.castShadow = obj.castshadow;
    spotLight.shadow.mapSize.width = obj.shadowmapsize;
    spotLight.shadow.mapSize.height = obj.shadowmapsize;
    spotLight.shadow.camera.far = obj.shadowfar;

    spotLight.shadow.bias = this.contents.shadowBias;

    this.contents.lights[obj.id] = spotLight;

    // create helper
    let spotLightHelper = new THREE.SpotLightHelper(spotLight);
    this.contents.lights[obj.id + "_helper"] = spotLightHelper;

    return [spotLight, spotLightHelper];
  }
}
