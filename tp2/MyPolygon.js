import * as THREE from "three";

export class MyPolygon {
    static createBufferGeometry(radius, stacks, slices, color_c, color_p) {

        const vertices = [];
        const colors = [];
        const centerColor = new THREE.Color(color_c);
        const peripheryColor = new THREE.Color(color_p);

        for (let i = 0; i <= slices; i++) {

            for (let j = 0; j <= stacks; j++) {
                const v = j / stacks;
                const theta = (i / slices) * Math.PI * 2;
                const x = (radius * v) * Math.cos(theta);
                const y = (radius * v) * Math.sin(theta);
                vertices.push(x, y, 0);
                const color = new THREE.Color().lerpColors(centerColor, peripheryColor, v);
                colors.push(color.r, color.g, color.b);
            }

        }
        console.log(colors);

        //    for (let i = 0; i <= stacks; i++) {
        //        const v = i / stacks;
        //        const color = new THREE.Color().lerpColors(centerColor, peripheryColor, v);
        //        for (let j = 0; j <= slices; j++) {
        //            const k = i * (slices + 1) + j;
        //            const x = vertices[j * 3];
        //            const y = vertices[j * 3 + 1];
        //            const z = v * radius;
        //            colors.push(color.r, color.g, color.b);
        //            vertices.push(x, y, z);
        //        }
        //    }


        const indices = [];
        for (let i = 0; i <= stacks; i++) {
            for (let j = 0; j <= slices; j++) {
                const k = i * (slices + 1) + j;
                indices.push(k, k + slices + 1, k + 1);
                indices.push(k + 1, k + slices + 1, k + slices + 2);
            }
        }


        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);

        return geometry;
    }
}
/*

   // Calculate the vertices of the circle in the XY plane
       const vertices = [];
       for (let i = 0; i <= slices; i++) {
           const theta = (i / slices) * Math.PI * 2;
           const x = radius * Math.cos(theta);
           const y = radius * Math.sin(theta);
           vertices.push(x, y, 0);
       }

       // Create an array to hold the vertices of the polygon
       const colors = [];
       const centerColor = new THREE.Color(color_c);
       const peripheryColor = new THREE.Color(color_p);
       for (let i = 0; i <= stacks; i++) {
           const v = i / stacks;
           const color = new THREE.Color().lerpColors(centerColor, peripheryColor, v);
           for (let j = 0; j <= slices; j++) {
               const k = i * (slices + 1) + j;
               const x = vertices[j * 3];
               const y = vertices[j * 3 + 1];
               const z = v * radius;
               colors.push(color.r, color.g, color.b);
               vertices.push(x, y, z);
           }
       }

       // Create an array to hold the indices of the vertices that form each triangle
       const indices = [];
       for (let i = 0; i < stacks; i++) {
           for (let j = 0; j < slices; j++) {
               const k = i * (slices + 1) + j;
               indices.push(k, k + slices + 1, k + 1);
               indices.push(k + 1, k + slices + 1, k + slices + 2);
           }
       }

       // Create a buffer geometry using the vertices and indices arrays
       const geometry = new THREE.BufferGeometry();
       geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
       geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
       geometry.setIndex(indices);

 
 */