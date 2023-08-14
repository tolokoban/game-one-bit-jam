#include <common>

uniform float uniTime;
uniform float uniX;
uniform float uniY;
uniform sampler2D tDiffuse;
varying vec2 varUV;

void main() {
    float seed = floor(uniTime);
    float shift = rand(fract(uniTime) * varUV);
    vec4 color = texture2D(tDiffuse, varUV);

    float neighboors = (
        texture2D(tDiffuse, varUV + vec2(uniX * shift, 0.0)).r +
        texture2D(tDiffuse, varUV + vec2(-uniX * shift, 0.0)).r +
        texture2D(tDiffuse, varUV + vec2(0.0, uniY * shift)).r +
        texture2D(tDiffuse, varUV + vec2(0.0, -uniY * shift)).r
    ) * 0.25;
    float lum = neighboors > color.r ? 0.95 : 1.05;
    gl_FragColor = vec4(vec3(color.r * lum), 1.0);
}

