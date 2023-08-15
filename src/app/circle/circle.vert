#version 300 es

precision mediump float ;

uniform float uniSize;
uniform vec3 uniColor;
out vec3 varColor;

void main() {
    varColor = uniColor;
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = uniSize;
}