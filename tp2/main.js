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


let gui = new MyGuiInterface(app);
gui.setContents(contents);
app.setGui(gui);
gui.init();


// const numU = 4; // Increase the number of divisions for a smoother surface
// const numV = 4;

// // Generate the XML content
// let xmlContent = '<control_points>\n';

// // Function to check if a point satisfies the implicit formula
// function satisfiesFormula(x, y, z) {
//     const leftSide = Math.pow(x**2 + (9 * y**2) / 4 + z**2 - 1, 3);
//     const rightSide = (x**2) * (z**3 - (9 * y**2 * z**3) / 80);

//     return Math.abs(leftSide - rightSide) < 0.001; // Adjust the threshold as needed
// }

// // Generate the control points
// for (let u = 0; u <= 2 * Math.PI; u += 2 * Math.PI / numU) {
//     for (let v = 0; v <= Math.PI / 2; v += Math.PI / (2 * numV)) {
//         const x = Math.cos(u) * Math.sin(v);
//         const y = Math.sin(u) * Math.sin(v);
//         const z = Math.cos(v);

//         //if (satisfiesFormula(x, y, z)) {
//             xmlContent += `  <controlpoint xx="${x}" yy="${y}" zz="${z}" />\n`;
//         //}
//     }
// }


// eclipsoid
// xmlContent += '</control_points>';

// // Print the XML content
// console.log(xmlContent);
// const numU = 20; // Increase the number of divisions for a smoother surface
// const numV = 10;
// const a = 2; // Radius along the x-axis
// const b = 7; // Radius along the y-axis
// const c = 6; // Radius along the z-axis

// // Generate the XML content
// let xmlContent = '';

// // Generate the control points for an ellipsoid
// for (let u = 0; u <= Math.PI; u += Math.PI / numU) {
//     for (let v = 0; v <= 2 * Math.PI; v += 2 * Math.PI / numV) {
//         const x = a * Math.sin(u) * Math.cos(v);
//         const y = b * Math.sin(u) * Math.sin(v);
//         const z = c * Math.cos(u);

//         xmlContent += `  <controlpoint xx="${x}" yy="${y}" zz="${z}" />\n`;
//     }
// }

// xmlContent += '';

// // Print the XML content
// console.log(xmlContent);


// main animation loop - calls every 50-60 ms.
app.render();

