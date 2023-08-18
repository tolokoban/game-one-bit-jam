#version 300 es

precision mediump float ;

uniform float uniSize;
uniform mat4 uniMatrix;

// Vertex
in vec2 attCorner;
in vec2 attUV;
// Instance
in vec2 attCenter;
in vec2 attAtlas;

out vec2 varUV;

const float ZOOM = 0.579;
const float A = 0.236;
const float B = A * ZOOM;
const mat2 ISO = mat2(
    A, -B,
    -A, -B
);

void main() {
    varUV = attUV * vec2(0.25, 1.0/3.0) + attAtlas;
    vec2 xy = attCorner * uniSize + ISO * attCenter;
    float z = 0.5 - max(attCenter.x, attCenter.y) / 64.0;
    gl_Position = uniMatrix * vec4(xy, z, 1.0);
}