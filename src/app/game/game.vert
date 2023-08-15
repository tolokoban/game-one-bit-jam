#version 300 es

precision mediump float ;

uniform float uniTime;
layout (location=0) in vec4 attParticle;
out vec4 varColor;

const float SIZE = 0.51;

void main() {
    float t = fract(uniTime * attParticle.w);
    float life = 1.0 - t;
    float alpha = attParticle.z * life;
    varColor = vec4(vec3(1.0), alpha);
    float b = 1.0 / 4.0;
    float a = -5.0 * b;
    float windFactor = a * t * t + b * t;
    vec2 wind = vec2(-SIZE, 0.0) * windFactor;
    gl_Position = vec4(attParticle.xy + wind, 0.5, 1.0);
    gl_PointSize = 1.0 + life * 2.0;
}