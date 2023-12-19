import * as THREE from "three";

export class Television {
  constructor(scene, camera, render) {
    this.scene = scene;
    this.camera = camera;
    this.width = 30;
    this.height = 20;

    this.render = render;

    this.camera.position.z = 5;

    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    // Create a plane geometry to represent the television screen
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
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
        renderTexture: { value: this.renderTarget.texture },
      },
      transparent: true,
      side: THREE.DoubleSide, // Set material to double-sided
    });

    this.group = new THREE.Group();

    this.screen1 = new THREE.Mesh(geometry, this.material);
    this.screen1.position.x = 0;
    this.screen1.position.y = 0;
    this.screen1.position.z = 0;
    this.group.add(this.screen1);

    this.screen2 = new THREE.Mesh(geometry, this.material);
    this.screen1.position.x = 0;
    this.screen1.position.y = 0;
    this.screen1.position.z = this.width;
    this.group.add(this.screen2);

    this.screen3 = new THREE.Mesh(geometry, this.material);
    this.screen3.position.x = -this.width / 2;
    this.screen3.position.y = 0;
    this.screen3.position.z = this.width / 2;
    this.screen3.rotation.y = Math.PI / 2;
    this.group.add(this.screen3);

    this.screen4 = new THREE.Mesh(geometry, this.material);
    this.screen4.position.x = this.width / 2;
    this.screen4.position.y = 0;
    this.screen4.position.z = this.width / 2;
    this.screen4.rotation.y = Math.PI / 2;
    this.group.add(this.screen4);

    // post
    this.post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 30, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.post.position.x = 0;
    this.post.position.y = -16;
    this.post.position.z = 15;

    let geo = new THREE.BoxGeometry(30, 0.5, 30);
    // square
    this.square = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.square.position.x = 0;
    this.square.position.y = -this.height / 2 - 0.25;
    this.square.position.z = 15;

    this.square2 = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.square2.position.x = 0;
    this.square2.position.y = this.height / 2 + 0.25;
    this.square2.position.z = 15;

    this.group.add(this.square2);
    this.group.add(this.square);
    this.group.add(this.post);

    this.group.position.x = 120;
    this.group.position.y = 30;
    this.group.position.z = 130;

    this.scene.add(this.group);
  }

  updateRenderTarget(cam) {
    this.camera = cam;
    this.render.setRenderTarget(this.renderTarget);
    this.render.render(this.scene, this.camera, this.renderTarget);
    this.render.setRenderTarget(null);
    this.material.needsUpdate = true;
  }
}
