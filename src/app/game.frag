#include <common>

uniform float uniTime;
uniform sampler2D tDiffuse;
varying vec2 varUV;

void main() {
    float seed = floor(uniTime);
    vec4 color = texture2D(tDiffuse, varUV);
    float lum = pow(luminance(color.rgb) * 2.0, 2.0);
    float shift = rand(fract(uniTime) * varUV) - .5;
    lum += lum > 0.1 ? shift * lum * 0.25 : 0.0;
    gl_FragColor = vec4(vec3(lum), 1.0);
}

