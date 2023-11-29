import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class MyMenu {
  constructor(title, x = 0, y = 10, z = -1) {
    this.title = title;
    this.buttons = [];
    this.textWriter = new TextSpriteDraw();

    this.x = x;
    this.y = y;
    this.z = z;

    this.width = 50;
    this.height = 50;

    this.btnCount = 0;
  }

  addButton(text, onClick) {
    this.buttons.push({ btnCount, text, onClick });
    btnCount++;
  }

  setTitle(title) {
    this.title = title;
  }

  getMenu() {
    let group = new THREE.Group();

    this.setButtonsOnMenu();

    // create a menuBackground geometry for the menu
    let geometry = new THREE.PlaneGeometry(this.width, this.height);

    // create a material
    let material = new THREE.MeshBasicMaterial({
      color: 0xaabbcc,
    });

    // create a mesh
    let menuBackground = new THREE.Mesh(geometry, material);

    this.textWriter.write(
      menuBackground,
      0,
      0,
      0.1,
      "Main Menu",
      12,
      "0xFF0000"
    );

    // add the mesh to the group
    group.add(menuBackground);

    // apply translation with this.x, this.y and this.z
    group.translateX(this.x);
    group.translateY(this.y);
    group.translateZ(this.z);

    group.rotateY(Math.PI);

    return group;
  }

  setButtonsOnMenu() {
    // Display buttons
    this.buttons.forEach((button) => {
      /* 
      // Add click event listener
      buttonMesh.userData.onClick = button.onClick;
      buttonMesh.on("click", () => {
        if (buttonMesh.userData.onClick) {
          buttonMesh.userData.onClick();
        }
      });

      group.add(buttonMesh); */
    });
  }

  getCamera(renderer) {
    // Create an orthographic camera
    const camera = new THREE.OrthographicCamera(
      -renderer.domElement.clientWidth / 2,
      renderer.domElement.clientWidth / 2,
      renderer.domElement.clientHeight / 2,
      -renderer.domElement.clientHeight / 2,
      0.1,
      1000
    );

    // Set the camera position to be centered on the plane
    camera.position.set(this.x, this.y, this.z + 10);

    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false; // Enable rotation

    // Set controls to focus on the menu
    controls.target.set(this.x, this.y, this.z);

    // Set controls to be centered on the menu
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.enableZoom = false; // Disable zooming for orthographic camera

    // Update controls in animation loop
    function animate() {
      controls.update();
      requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();

    return { camera, controls };
  }
}
