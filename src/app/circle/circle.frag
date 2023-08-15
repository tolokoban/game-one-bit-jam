#version 300 es

precision mediump float ;

in vec3 varColor;
out vec4 FragColor;

void main() {
    vec2 v = (2.0 * gl_PointCoord - vec2(1));
    float r = length(v);
    float alpha = 1.0 - smoothstep(0.9, 1.0, r);
    FragColor = vec4(varColor, alpha);
}

