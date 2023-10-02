import * as THREE from "three";

export class WallWindow extends THREE.Object3D {
  constructor() {
    super();

    // Create the window pane
    this.windowPane = new THREE.PlaneGeometry(8, 6);
    const windowPaneMesh = new THREE.Mesh(
      this.windowPane,
      new THREE.MeshPhongMaterial({
        color: "#03ecfc",
        specular: "#777777",
        emissive: "#000000",
        shininess: 300,
        map: new THREE.TextureLoader().load("textures/swiss-mountains.jpg"),
      })
    );

    const windowStructMaterial = new THREE.MeshPhongMaterial({
      color: "#ffffff",
      specular: "#ffffff",
      emissive: "#000000",
      shininess: 30,
    })
  

    // Create the structure of the window
    const windowStructure = new THREE.BoxGeometry(8, 0.5, 0.25);
    const windowStructureH = new THREE.BoxGeometry(0.5, 6, 0.25);
    

    // Create four blocks for the window structure
    const windowStructureMesh1 = new THREE.Mesh(
      windowStructure,
      windowStructMaterial
    );

    const windowStructureMesh2 = new THREE.Mesh(
      windowStructure,
      windowStructMaterial
    );

    const windowStructureMesh3 = new THREE.Mesh(
      windowStructureH,
      windowStructMaterial
    );

    const windowStructureMesh4 = new THREE.Mesh(
      windowStructureH,
      windowStructMaterial
    );

    // Position and add the window structure meshes
    windowStructureMesh1.translateY(3);

    windowStructureMesh2.translateY(-3);

    windowStructureMesh3.translateX(3.75);

    windowStructureMesh4.translateX(-3.75);

    // Add the window pane and structure meshes to the object
    this.add(windowStructureMesh1);
    this.add(windowStructureMesh2);
    this.add(windowStructureMesh3);
    this.add(windowStructureMesh4);
    this.add(windowPaneMesh);
  }
}
