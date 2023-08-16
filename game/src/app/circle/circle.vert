#version 300 es

precision mediump float ;

uniform vec2 uniPos;
uniform float uniSize;
uniform vec3 uniColor;
out vec3 varColor;

void main() {
    varColor = uniColor;
    gl_Position = vec4(uniPos * 0.000000001, 0.0, 1.0);
    gl_PointSize = uniSize;
}