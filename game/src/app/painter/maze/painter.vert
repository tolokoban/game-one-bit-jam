#version 300 es

precision mediump float ;

uniform float uniTime;
uniform float uniSize;
uniform float uniAlpha;
uniform float uniDensity;
uniform vec3 uniColor;
uniform mat4 uniMatrix;
layout (location=0) in vec4 attParticle;
out vec4 varColor;

void main() {
    float t = fract(uniTime * attParticle.w);
    float life = 1.0 - t;
    float alpha = attParticle.z * life;
    varColor = vec4(uniColor, alpha * uniAlpha);
    float b = 1.0 / 4.0;
    float a = -5.0 * b;
    float windFactor = a * t * t + b * t;
    vec2 wind = vec2(0.0, -uniSize) * windFactor;
    gl_Position = uniMatrix * vec4(attParticle.xy + wind, 1.0, 1.0);
    gl_PointSize = 1.0 + life * 3.14 * uniDensity;
}