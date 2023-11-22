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

// create the GUI interface object
let gui = new MyGuiInterface(app);

// initializes the GUI interface
gui.setContents(contents);
app.setGui(gui);
gui.init();

// renders the application
app.render();
