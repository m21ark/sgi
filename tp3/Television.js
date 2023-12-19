import * as THREE from "three";

export class Television {
    constructor(scene, camera, render) {
        this.scene = scene;
        this.camera = camera;

        this.render = render;

        this.camera.position.z = 5;

        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        // Create a plane geometry to represent the television screen
        const geometry = new THREE.PlaneGeometry(20, 20);
        // Create a shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
            fragmentShader: `
                    uniform sampler2D renderTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = texture2D(renderTexture, vUv);
                    }
                `,
            uniforms: {
                renderTexture: { value: this.renderTarget.texture }
            },
            transparent: true,
            side: THREE.DoubleSide // Set material to double-sided
        });

        this.screen = new THREE.Mesh(geometry, this.material);
        this.screen.position.z = 10;
        this.screen.position.x = 20;
        this.screen.position.y = 10;
        this.scene.add(this.screen);
    }

    updateRenderTarget(cam) {
        this.camera = cam;
        this.render.setRenderTarget(this.renderTarget);
        this.render.render(this.scene, this.camera, this.renderTarget);
        this.render.setRenderTarget(null);
        this.material.needsUpdate = true;
    }

}
