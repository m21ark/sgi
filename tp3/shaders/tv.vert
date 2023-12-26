#include <packing>

uniform sampler2D renderBuffer;
varying vec2 vUv;
uniform float cameraNear;
uniform float cameraFar;

float readDepth(sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture2D(depthSampler, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

void main() {
    vUv = uv;
    float depth = readDepth(renderBuffer, vUv);
    vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Get the normal vector
    vec3 normal = normalize(mat3(normalMatrix) * normal);

    // Conditionally add or subtract based on depth value in the direction of the normal
    newPosition.xyz -= normal * depth * 3.0;
    
    // Set the transformed position
    gl_Position = projectionMatrix * newPosition;
}
