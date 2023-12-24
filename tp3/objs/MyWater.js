// WaterClass.js
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { MyIrregularPlane, PerlinNoise } from "./MyIrregularPlane.js";

export class MyWater extends THREE.Object3D {
  constructor(width = 10, height = 10, makeLake = false) {
    super();
    this.width = width;
    this.height = height;

    if (makeLake) this.lakeGeom = this.generateLakeGeom();
    else this.lakeGeom = new THREE.PlaneGeometry(width, height);

    this.water = new Water(this.lakeGeom, {
      waterNormals: new THREE.TextureLoader().load(
        "assets/waternormals.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      waterColor: 0x0052ac,
      distortionScale: 0,
    });

    const fragmentShader = `
    uniform sampler2D mirrorSampler;
    uniform float alpha;
    uniform float time;
    uniform float size;
    uniform float distortionScale;
    uniform sampler2D normalSampler;
    uniform vec3 sunColor;
    uniform vec3 sunDirection;
    uniform vec3 eye;
    uniform vec3 waterColor;

    varying vec4 mirrorCoord;
    varying vec4 worldPosition;

    vec4 getNoise( vec2 uv ) {
     vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
     vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
     vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
     vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
     vec4 noise = texture2D( normalSampler, uv0 ) +
      texture2D( normalSampler, uv1 ) +
      texture2D( normalSampler, uv2 ) +
      texture2D( normalSampler, uv3 );
     return noise * 0.5 - 1.0;
    }

    void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
     vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
     float direction = max( 0.0, dot( eyeDirection, reflection ) );
     specularColor += pow( direction, shiny ) * sunColor * spec;
     diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
    }

    #include <common>
    #include <packing>
    #include <bsdfs>
    #include <fog_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>

    void main() {

     #include <logdepthbuf_fragment>
     vec4 noise = getNoise( worldPosition.xz * size );
     vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

     vec3 diffuseLight = vec3(0.0);
     vec3 specularLight = vec3(0.0);

     vec3 worldToEye = eye-worldPosition.xyz;
     vec3 eyeDirection = normalize( worldToEye );
     sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

     float distance = length(worldToEye);

     vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
     vec3 reflectionSample = vec3(1.0);

     float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
     float rf0 = 0.3;
     float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
     vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
     vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
     vec3 outgoingLight = albedo;
     vec3 aux = outgoingLight * vec3( 0.6, 0.6, 1 );

     gl_FragColor = vec4( aux, alpha );

     #include <tonemapping_fragment>
     #include <colorspace_fragment>
     #include <fog_fragment> 
    }
`;

    // Override the fragment shader of the water material to remove water reflection that is resource intensive
    this.water.material.fragmentShader = fragmentShader;
    this.water.material.needsUpdate = true;

    if (makeLake) {
      this.water.rotation.x = -Math.PI / 2;
      this.water.scale.set(20, 35, 10); // only for the hardcoded lake
    }

    this.add(this.water);
  }

  update() {
    const time = performance.now() * 0.0001;
    this.water.material.uniforms["time"].value = time;
  }

  generateLakeGeom() {
    const lakeVertices = [
      new THREE.Vector3(2.45, 0.78, 0),
      new THREE.Vector3(3.06, 0.84, 0),
      new THREE.Vector3(3.61, 0.87, 0),
      new THREE.Vector3(4.37, 1.1, 0),
      new THREE.Vector3(4.7, 1.4, 0),
      new THREE.Vector3(4.9, 1.76, 0),
      new THREE.Vector3(4.96, 2.35, 0),
      new THREE.Vector3(5.0, 2.67, 0),
      new THREE.Vector3(5.0, 3.16, 0),
      new THREE.Vector3(4.82, 3.64, 0),
      new THREE.Vector3(4.6, 3.9, 0),
      new THREE.Vector3(4.12, 4.1, 0),
      new THREE.Vector3(3.7, 4.04, 0),
      new THREE.Vector3(3.23, 3.9, 0),
      new THREE.Vector3(3.1, 3.57, 0),
      new THREE.Vector3(2.84, 3.11, 0),
      new THREE.Vector3(2.34, 2.84, 0),
      new THREE.Vector3(1.7, 2.75, 0),
      new THREE.Vector3(1.48, 2.16, 0),
      new THREE.Vector3(1.54, 1.65, 0),
      new THREE.Vector3(1.6, 1.13, 0),
      new THREE.Vector3(2.07, 0.95, 0),
    ];

    // use catmull and give those points

    const curve = new THREE.CatmullRomCurve3(lakeVertices);
    const points = curve.getPoints(100);

    /*
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const radius = 50 + 20 * perlin.noise2D(Math.cos(angle), Math.sin(angle));
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      lakeVertices.push(new THREE.Vector3(x, 0, y));
    }

    // This generates a random lake like shape but it's not very pretty
    */

    const lake = new MyIrregularPlane(points);
    return lake.getGeometry();
  }
}
