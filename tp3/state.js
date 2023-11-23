class CarGameStateMachine {
  constructor() {
    this.states = [
      "start_menu",
      "select_car_menu",
      "select_pc_menu",
      "obstacles_menu",
      "play",
      "pause_menu",
      "end_menu",
    ];
    this.currentState = "start_menu";
  }

  // Method to transition to a new state
  transition(newState) {
    if (this.states.includes(newState)) {
      const oldState = this.currentState;
      this.currentState = newState;
      console.log(`Transitioned from state ${oldState} to state ${newState}`);
      this[`onEnter_${newState}`]();
      this.handleGameEvent();
    } else console.error(`Invalid state: ${newState}`);
  }

  // Example method to handle events or actions based on the current state
  handleGameEvent() {
    console.log(`Handling events in current state ${this.currentState}`);
    switch (this.currentState) {
      case "start_menu":
        // Handle events ...
        break;
      case "select_car_menu":
        // Handle events ...
        break;
      case "select_pc_menu":
        // Handle events ...
        break;
      case "obstacles_menu":
        // Handle events ...
        break;
      case "play":
        // Handle events ...
        break;
      case "pause_menu":
        // Handle events ...
        break;
      case "end_menu":
        // Handle events ...
        break;
      default:
        console.error(`Unknown current state: ${this.currentState}`);
    }
  }

  // ===================== STATE METHODS =====================

  onEnter_start_menu() {
    // ...
  }

  onEnter_select_car_menu() {
    // ...
  }

  onEnter_select_pc_menu() {
    // ...
  }

  onEnter_obstacles_menu() {
    // ...
  }

  onEnter_play() {
    // ...
  }

  onEnter_pause_menu() {
    // ...
  }

  onEnter_end_menu() {
    // ...
  }
}

/* // Example usage:
const gameStateMachine = new CarGameStateMachine();
gameStateMachine.transition("select_car_menu");
gameStateMachine.transition("play");
gameStateMachine.transition("pause_menu");
 */