varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;
uniform float time;

void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 newPosition = position;
    newPosition *= 1.0 + 0.1 * sin(time);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}