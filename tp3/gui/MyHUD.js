import * as THREE from "three";

/**
 * Represents a HUD (Heads-Up Display) for a game.
 * @class
 */
export class MyHUD {
  /**
   * Creates an instance of MyHUD.
   */
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
    this.separatorElement = document.createElement("div");
    this.speedBarElement = document.createElement("div");

    // Set initial values
    this.timeElement.innerHTML = "Time: 0.00 s";
    this.separatorElement.innerHTML = "______________";
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
    this.domElement.appendChild(this.separatorElement);
    this.domElement.appendChild(this.speedBarElement);
    this.domElement.appendChild(this.statusElement);

    // Additional styling for the statusContainer
    this.statusElement.style.position = "absolute";
    this.statusElement.style.top = "8";
    this.statusElement.style.right = "8";
  }

  /**
   * Gets the DOM element of the HUD.
   * @returns {HTMLDivElement} The DOM element of the HUD.
   */
  getDom() {
    return this.domElement;
  }

  /**
   * Sets the speed of the game.
   * @param {number} speed - The speed value.
   * @param {number} [max_speed=200] - The maximum speed value.
   */
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

  /**
   * Resets the time to zero.
   */
  resetTime() {
    this.clock = new THREE.Clock();
    this.timeElement.innerHTML = "Time: 0.00 s";
  }

  /**
   * Gets the current time.
   * @returns {number} The current time in seconds.
   */
  getTime() {
    return parseFloat(this.timeElement.innerHTML.split(" ")[1]);
  }

  /**
   * Updates the time element to reflect the elapsed time.
   */
  tickTime() {
    if (this.isGamePaused) return;
    const elapsedTime = this.clock.getElapsedTime();
    let time = Math.round(elapsedTime * 10) / 10;
    this.timeElement.innerHTML = `Time: ${time} s`;
  }

  /**
   * Sets the number of laps completed.
   * @param {number} laps - The number of laps completed.
   * @param {number} total - The total number of laps.
   */
  setLaps(laps, total) {
    this.lapsElement.children[0].innerHTML = `Laps: ${laps}/${total}`;
  }

  /**
   * Sets the status of the game.
   * @param {string} status - The status of the game. Possible values are "PLAY" or "PAUSE".
   * @private
   */
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

  /**
   * Sets the pause status of the game.
   * @param {boolean} status - The pause status. True if the game is paused, false otherwise.
   */
  setPauseStatus(status) {
    if (status) this.pauseGame();
    else this.unpauseGame();
  }

  /**
   * Pauses the game.
   */
  pauseGame() {
    this._setStatus("PAUSE");
    if (!this.isGamePaused) {
      this.pauseStartTime = Date.now();
      this.isGamePaused = true;
    }
  }

  /**
   * Unpauses the game.
   */
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

  /**
   * Checks if the game is paused.
   * @returns {boolean} True if the game is paused, false otherwise.
   */
  isPaused() {
    return this.isGamePaused;
  }

  /**
   * Sets the visibility of the HUD.
   * @param {boolean} visible - True to make the HUD visible, false to hide it.
   */
  setVisible(visible) {
    this.domElement.style.display = visible ? "block" : "none";
  }
}

/**
 * Represents a debug HUD for displaying coordinates.
 * @class
 */
export class MyDebugHUD {
  /**
   * Creates a new instance of MyDebugHUD.
   */
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.id = "debugHUD";
  }

  /**
   * Gets the DOM element of the debug HUD.
   * @returns {HTMLElement} The DOM element.
   */
  getDom() {
    return this.domElement;
  }

  /**
   * Sets the visibility of the debug HUD.
   * @param {boolean} visible - Whether the debug HUD should be visible or not.
   */
  setVisible(visible) {
    this.domElement.style.display = visible ? "block" : "none";
  }

  /**
   * Sets the coordinates to be displayed in the debug HUD.
   * @param {number} x - The X coordinate.
   * @param {number} y - The Y coordinate.
   * @param {number} z - The Z coordinate.
   */
  setCords(x, y, z) {
    this.domElement.innerHTML = `X: ${x.toFixed(2)} Y: ${y.toFixed(
      2
    )} Z: ${z.toFixed(2)}`;
  }
}
