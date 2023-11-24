class MyHUD {
  constructor() {
    // Create main HUD element
    this.domElement = document.createElement("div");
    this.domElement.id = "MyHud";

    // Create sub elements
    this.speedElement = document.createElement("div");
    this.timeElement = document.createElement("div");
    this.cordsElement = document.createElement("div");
    this.positionElement = document.createElement("div");
    this.lapsElement = document.createElement("div");
    this.powerupTimeElement = document.createElement("div");
    this.statusElement = document.createElement("div");
    this.speedBarElement = document.createElement("div"); // New speed bar element

    // Set initial values
    this.speedElement.innerHTML = "Speed: 0.00 m/s";
    this.positionElement.innerHTML = "Position: 0/0";
    this.lapsElement.innerHTML = "Laps: 0/0";
    this.timeElement.innerHTML = "Time: 0.00 s";
    this.cordsElement.innerHTML = "X: 0.00 Y: 0.00 Z: 0.00";
    this.powerupTimeElement.innerHTML = "Powerup Time: 0.00 s";
    this.statusElement.innerHTML = "PAUSED";

    // Append elements to the HUD
    this.domElement.appendChild(this.speedElement);
    this.domElement.appendChild(this.positionElement);
    this.domElement.appendChild(this.lapsElement);
    this.domElement.appendChild(this.timeElement);
    this.domElement.appendChild(this.cordsElement);
    this.domElement.appendChild(this.powerupTimeElement);
    this.domElement.appendChild(this.statusElement);
    this.domElement.appendChild(this.speedBarElement); // Append the speed bar

    // Additional styles for the speed bar
    this.speedBarElement.style.width = "100px";
    this.speedBarElement.style.height = "100px";
    this.speedBarElement.style.borderRadius = "50%";
    this.speedBarElement.style.border = "5px solid #ccc"; // Change the color of the border
    this.speedBarElement.style.position = "relative";
  }

  getDom() {
    return this.domElement;
  }

  setSpeed(speed, max_speed = 200) {
    // Update the speed text
    this.speedElement.innerHTML = "Speed: " + speed.toFixed(2) + " m/s";

    // Update the speed bar
    const normalizedSpeed = Math.min(speed / max_speed, 1);
    const rotationDegrees = normalizedSpeed * 360;
    this.speedBarElement.style.background = `conic-gradient(from 0deg, #00ff00 0%, #ff0000 ${rotationDegrees}deg, #ccc ${rotationDegrees}deg, #ccc 360deg)`;
  }

  setTime(time) {
    this.timeElement.innerHTML = `Time: ${time.toFixed(2)} s`;
  }

  tickTime() {
    let time = parseFloat(this.timeElement.innerHTML.split(" ")[1]) + 0.01;
    time = Math.round(time * 100) / 100;
    this.timeElement.innerHTML = `Time: ${time} s`;
    // TODO: time is currently not being counted correctly
  }

  setCords(x, y, z) {
    this.cordsElement.innerHTML = `X: ${x.toFixed(2)} Y: ${y.toFixed(
      2
    )} Z: ${z.toFixed(2)}`;
  }

  setPosition(pos, total) {
    this.positionElement.innerHTML = `Position: ${pos}/${total}`;
  }

  setLaps(laps, total) {
    this.lapsElement.innerHTML = `Laps: ${laps}/${total}`;
  }

  setPowerupTime(time) {
    if (time > 0)
      this.powerupTimeElement.innerHTML = `Powerup Time: ${time.toFixed(2)} s`;
    else this.powerupTimeElement.innerHTML = "";
  }

  setStatus(status) {
    this.statusElement.innerHTML = status;
  }
}

export { MyHUD };
