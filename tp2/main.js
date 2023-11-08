import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";
import { MyGuiInterface } from "./MyGuiInterface.js";

// create the application object
let app = new MyApp();
// initializes the application
app.init();

// create the contents object
let contents = new MyContents(app);
// initializes the contents
contents.init();
// hooks the contents object in the application object
app.setContents(contents);

console.log(contents);
let gui = new MyGuiInterface(app);
gui.setContents(contents);
app.setGui(gui);
gui.init();

// main animation loop - calls every 50-60 ms.
app.render();

