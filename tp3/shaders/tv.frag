#include <packing>

uniform sampler2D renderTexture;
uniform sampler2D renderBuffer;
varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(renderTexture, vUv);
    gl_FragColor = textureColor;
}
