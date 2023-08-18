#version 300 es

precision mediump float ;

uniform vec3 uniColor0;
uniform vec3 uniColor1;
uniform sampler2D uniAtlas;

in vec2 varUV;

out vec4 FragColor;

void main() {
    vec4 texel = texture(uniAtlas, varUV);
    if (texel.a < 1.0 / 255.0) discard;

    FragColor = vec4(
        mix(uniColor1, uniColor0, texel.g),
        texel.a
    );
}

