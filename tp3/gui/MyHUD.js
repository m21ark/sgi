import * as THREE from "three";

export class MyHUD {
  constructor() {
    // Create a clock to measure time
    this.clock = new THREE.Clock();
    this.isGamePaused = true;
    this.pauseStartTime = 0;

    // Create main HUD element
    this.domElement = document.createElement("div");
    this.domElement.id = "MyHud";

    // Create sub elements
    this.statusElement = document.createElement("div");
    this.lapsElement = document.createElement("div");
    this.timeElement = document.createElement("div");
    this.powerupTimeElement = document.createElement("div");
    this.speedBarElement = document.createElement("div");

    // Set initial values
    this.timeElement.innerHTML = "Time: 0.00 s";
    this.powerupTimeElement.innerHTML = "Powerup Time: 0.00 s";
    this.statusElement.innerHTML = "N/A";

    // Set initial values with bold style
    this.lapsElement.innerHTML = "<span>Laps: 0/0</span>";
    this.lapsElement.style.fontWeight = "bold";

    // Additional styles for the speed bar
    this.speedBarElement.id = "speedBar_speed";
    this.speedBarElement.style.width = "100px";
    this.speedBarElement.style.height = "100px";
    this.speedBarElement.style.borderRadius = "50%";
    this.speedBarElement.style.border = "5px solid #ccc";
    this.speedBarElement.style.position = "relative";
    this.speedBarElement.style.margin = "auto";
    this.speedBarElement.style.marginTop = "10px";
    this.speedBarElement.style.marginBottom = "10px";

    // Append elements to the HUD in the desired order
    this.domElement.appendChild(this.lapsElement);
    this.domElement.appendChild(this.timeElement);
    this.domElement.appendChild(this.powerupTimeElement);
    this.domElement.appendChild(this.speedBarElement);
    this.domElement.appendChild(this.statusElement);

    // Additional styling for the statusContainer
    this.statusElement.style.position = "absolute";
    this.statusElement.style.top = "8";
    this.statusElement.style.right = "8";
  }

  getDom() {
    return this.domElement;
  }

  setSpeed(speed, max_speed = 200) {
    if (speed < 0) speed = 0;
    if (speed > max_speed) speed = max_speed;

    // Update the speed bar with a circular crown gradient
    const normalizedSpeed = Math.min(speed / max_speed, 1);
    const rotationDegrees = normalizedSpeed * 360;

    const gradient = `conic-gradient(from 0deg, #00ff00 0%, #ff0000 ${rotationDegrees}deg, #ccc ${rotationDegrees}deg, #ccc 360deg)`;

    this.speedBarElement.style.background = gradient;

    // Display the speed number in the middle of the circle
    this.speedBarElement.innerHTML = speed.toFixed(2);
    this.speedBarElement.style.display = "flex";
    this.speedBarElement.style.alignItems = "center";
    this.speedBarElement.style.justifyContent = "center";
    this.speedBarElement.style.fontSize = "20px";
    this.speedBarElement.style.fontWeight = "bold";
    this.speedBarElement.style.color = "#000"; // Adjust the color of the speed number
  }

  getTime() {
    return parseFloat(this.timeElement.innerHTML.split(" ")[1]);
  }

  tickTime() {
    if (this.isGamePaused) return;
    const elapsedTime = this.clock.getElapsedTime();
    let time = Math.round(elapsedTime * 10) / 10;
    this.timeElement.innerHTML = `Time: ${time} s`;
  }

  setLaps(laps, total) {
    this.lapsElement.children[0].innerHTML = `Laps: ${laps}/${total}`;
  }

  setPowerupTime(time) {
    if (time > 0)
      this.powerupTimeElement.innerHTML = `Powerup Time: ${time.toFixed(2)} s`;
    else this.powerupTimeElement.innerHTML = "";
  }

  _setStatus(status) {
    // Create the play and pause icons
    const playIcon = document.createElement("i");
    playIcon.className = "fa fa-play";
    playIcon.style.marginRight = "5px";

    const pauseIcon = document.createElement("i");
    pauseIcon.className = "fa fa-pause";
    pauseIcon.style.marginRight = "5px";

    // Clear existing content
    this.statusElement.innerHTML = "";

    // Create a container for the icon and text
    const statusContainer = document.createElement("div");
    statusContainer.style.display = "flex";
    statusContainer.style.alignItems = "center";

    // Better UI if swapped
    const icon = status === "PLAY" ? pauseIcon : playIcon;

    // Create the text element
    const span = document.createElement("span");

    // Append the icon and text to the container
    span.appendChild(icon);

    statusContainer.appendChild(span);

    // Append the container to the status element
    this.statusElement.appendChild(statusContainer);
  }

  setPauseStatus(status) {
    if (status) this.pauseGame();
    else this.unpauseGame();
  }

  pauseGame() {
    this._setStatus("PAUSE");
    if (!this.isGamePaused) {
      this.pauseStartTime = Date.now();
      this.isGamePaused = true;
    }
  }

  unpauseGame() {
    this._setStatus("PLAY");
    if (this.isGamePaused) {
      const pauseDuration =
        this.pauseStartTime == 0
          ? 0
          : (Date.now() - this.pauseStartTime) / 1000;
      this.clock.elapsedTime -= pauseDuration;
      this.isGamePaused = false;
      this.pauseStartTime = 0;
    }
  }

  isPaused() {
    return this.isGamePaused;
  }

  setVisible(visible) {
    this.domElement.style.display = visible ? "block" : "none";
  }
}

export class MyDebugHUD {
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.id = "debugHUD";
  }

  getDom() {
    return this.domElement;
  }

  setVisible(visible) {
    this.domElement.style.display = visible ? "block" : "none";
  }

  setCords(x, y, z) {
    this.domElement.innerHTML = `X: ${x.toFixed(2)} Y: ${y.toFixed(
      2
    )} Z: ${z.toFixed(2)}`;
  }
}
