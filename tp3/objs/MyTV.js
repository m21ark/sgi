import * as THREE from "three";
import { ShaderLoader } from "../shaders/ShaderLoader.js";

/**
 * Represents a TV object in a 3D scene.
 * @class
 */
export class MyTV {
  /**
   * Creates a new instance of MyTV.
   * @constructor
   * @param {THREE.Scene} scene - The scene to which the TV object belongs.
   * @param {THREE.Camera} camera - The camera used to render the scene.
   * @param {THREE.WebGLRenderer} render - The renderer used to render the scene.
   */
  constructor(scene, camera, render) {
    this.scene = scene;
    this.camera = camera;
    this.width = 30;
    this.height = 20;

    this.render = render;
    this.lastUpdate = Date.now();

    this.camera.position.z = 5;
    this.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        depthBuffer: true,
        depthTexture: this.depthTexture,
      }
    );
    this.renderTarget.depthTexture.format = THREE.DepthFormat;
    this.renderTarget.depthTexture.type = THREE.UnsignedShortType;

    // Create a shader material
    const [vert, frag] = ShaderLoader.get("shaders/tv");

    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        renderTexture: { value: this.renderTarget.texture },
        renderBuffer: { value: this.renderTarget.depthTexture },
        cameraNear: { value: this.camera.near },
        cameraFar: { value: this.camera.far },
      },
      transparent: true,
      side: THREE.DoubleSide, // Set material to double-sided
    });

    this.setGeom();
  }

  /**
   * Sets the geometry of the TV object.
   */
  setGeom() {
    // Create a plane geometry to represent the television screen
    const geometry = new THREE.PlaneGeometry(
      this.width - 8,
      this.height - 2.5,
      300,
      300
    );

    this.group = new THREE.Group();

    let tvMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
      map: new THREE.TextureLoader().load("scene/textures/metal.jpg"),
    });

    this.screen = new THREE.Mesh(geometry, this.material);
    this.screen.position.x = 0;
    this.screen.position.y = 0;
    this.screen.position.z = 12;
    this.screen.rotation.y = Math.PI;
    this.group.add(this.screen);

    // post
    this.post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 30, 32),
      tvMaterial
    );
    this.post.position.x = 0;
    this.post.position.y = -16;
    this.post.position.z = 15;

    let cube = new THREE.BoxGeometry(26, 20, 2);
    let material = tvMaterial;
    this.cube = new THREE.Mesh(cube, material);
    this.cube.position.z = 15;

    // side cubes for the screen
    let sideCube = new THREE.BoxGeometry(2, 20, 2);
    let sideCube1 = new THREE.Mesh(sideCube, material);
    let sideCube2 = new THREE.Mesh(sideCube, material);
    sideCube1.position.x = 12;
    sideCube1.position.z = 13;
    sideCube2.position.x = -12;
    sideCube2.position.z = 13;

    // top and bottom cubes for the screen
    let topCube = new THREE.BoxGeometry(26, 2, 2);
    let topCube1 = new THREE.Mesh(topCube, material);
    let topCube2 = new THREE.Mesh(topCube, material);
    topCube1.position.y = 10;
    topCube1.position.z = 13;
    topCube2.position.y = -10;
    topCube2.position.z = 13;

    this.group.add(sideCube1);
    this.group.add(sideCube2);
    this.group.add(topCube1);
    this.group.add(topCube2);

    this.group.add(this.post);
    this.group.add(this.cube);

    this.group.position.x = 120;
    this.group.position.y = 30;
    this.group.position.z = 130;

    this.group.visible = false;

    this.scene.add(this.group);
  }

  /**
   * Updates the television screen at a fixed rate.
   */
  updateRenderTarget() {
    if (this.lastUpdate + 500 > Date.now()) return;

    this.lastUpdate = Date.now();

    this.render.setRenderTarget(this.renderTarget);
    this.render.render(this.scene, this.camera);

    this.material.uniforms.renderTexture.value = this.renderTarget.texture;
    this.material.uniforms.renderBuffer.value = this.renderTarget.depthTexture;
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;

    this.render.setRenderTarget(null);
    this.material.needsUpdate = true;
  }
}
