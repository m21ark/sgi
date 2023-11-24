class MyHUD {
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.id = "hud";
    this.domElement.style.position = "absolute";
    this.domElement.style.top = "60px";
    this.domElement.style.left = "5px";
    this.domElement.style.color = "black";
    this.domElement.style.fontFamily = "Arial, Helvetica, sans-serif";
    this.domElement.style.fontSize = "16px";

    // Create elements for speed and time
    this.speedElement = document.createElement("div");
    this.timeElement = document.createElement("div");
    this.cordsElement = document.createElement("div");
    this.positionElement = document.createElement("div");
    this.lapsElement = document.createElement("div");
    this.powerupTimeElement = document.createElement("div");
    this.statusElement = document.createElement("div");

    // Set initial values
    this.speedElement.innerHTML = "Speed: 0.00 m/s";
    this.positionElement.innerHTML = "Position: 0/0";
    this.lapsElement.innerHTML = "Laps: 0/0";
    this.timeElement.innerHTML = "Time: 0.00 s";
    this.cordsElement.innerHTML = "X: 0.00 Y: 0.00 Z: 0.00";
    this.powerupTimeElement.innerHTML = "Powerup Time: 0.00 s";
    this.statusElement.innerHTML = "PAUSED";

    // Append speed and time elements to the HUD
    this.domElement.appendChild(this.speedElement);
    this.domElement.appendChild(this.positionElement);
    this.domElement.appendChild(this.lapsElement);
    this.domElement.appendChild(this.timeElement);
    this.domElement.appendChild(this.cordsElement);
    this.domElement.appendChild(this.powerupTimeElement);
    this.domElement.appendChild(this.statusElement);
  }

  getDom() {
    return this.domElement;
  }

  setSpeed(speed) {
    this.speedElement.innerHTML = `Speed: ${speed.toFixed(2)} m/s`;
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
