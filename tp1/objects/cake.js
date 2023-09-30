import * as THREE from "three";

export class Cake extends THREE.Object3D {
  candleMaterial = new THREE.MeshPhongMaterial({
    color: "#ffff00",
    specular: "#ffff00",
    emissive: "#000000",
    shininess: 30,
  });

  fireMaterial = new THREE.MeshPhongMaterial({
    color: "#ff5000",
    specular: "#ffA000",
    emissive: "#ff0000",
    shininess: 30,
  });

  plateMaterial = new THREE.MeshPhongMaterial({
    color: "#c0c0c0",
    specular: "#ffffff",
    emissive: "#000000",
    shininess: 30,
  });

  cakeMaterial = new THREE.MeshPhongMaterial({
    color: "#5C4033",
    specular: "#222222",
    emissive: "#000000",
    shininess: 30,
    map: new THREE.TextureLoader().load("textures/cake.jpg"),
    side: THREE.DoubleSide, // Render both sides of the faces
  });

  constructor(
    radius,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    startAngle,
    endAngle
  ) {
    super();

    // Create the original cake geometry
    this.cakeGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      startAngle,
      endAngle
    );

    const positions = this.cakeGeometry.attributes.position.array;

    const points = [];
    for (let i = 0; i < positions.length; i += 3) {
      points.push(
        new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      );
    }

    this.candle = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);

    this.candle.scale(1.0, 1.5, 1.0);
    this.candle.translate(0, height / 2.0 + 0.4, -0.2);

    this.fire = new THREE.ConeGeometry(0.1, 0.3, 32);

    this.fire.scale(2.3, 1.5, 2.3);
    this.fire.translate(0, height / 2.0 + 1.0, -0.2);

    const oneSide = new THREE.BoxGeometry(radius, height, 0.05);

    const otherSide = new THREE.BoxGeometry(radius, height, 0.05);

    // place oneSide on the endangle of the cake
    // oneSide.rotateY(endAngle);
    oneSide.translate(radius / 2, 0, 0);
    oneSide.rotateY(-startAngle);

    otherSide.translate(radius / 2, 0, 0);
    otherSide.rotateY(-(startAngle - endAngle));

    // Create a mesh using the resulting geometry and the specified material
    this.cakeMesh = new THREE.Mesh(this.cakeGeometry, this.cakeMaterial);
    this.oneSideMesh = new THREE.Mesh(oneSide, this.cakeMaterial);
    this.otherSideMesh = new THREE.Mesh(otherSide, this.cakeMaterial);

    this.candleMesh = new THREE.Mesh(this.candle, this.candleMaterial);
    this.fireMesh = new THREE.Mesh(this.fire, this.fireMaterial);

    // CANDLE LIGHT
    const candleLight = new THREE.PointLight(0xffa500, 5, 1); // Color, Intensity, Distance
    this.candleMesh.add(candleLight);

    // Dish
    const dish = new THREE.CylinderGeometry(1.3, 1, 0.25, 32);
    const dishMesh = new THREE.Mesh(dish, this.plateMaterial);

    dishMesh.scale.set(4, 2, 4);
    dishMesh.translateY(-0.6);

    this.cakeMesh.translateY(1);

    this.cakeMesh.add(dishMesh);
    this.cakeMesh.add(this.oneSideMesh);
    this.cakeMesh.add(this.otherSideMesh);
    this.cakeMesh.add(this.candleMesh);
    this.cakeMesh.add(this.fireMesh);
    this.add(this.cakeMesh);
  }
}
