varying vec3 varColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 n = mat3(modelViewMatrix) * normal;
    float lightMain = smoothstep(
        0.75, 
        1.0, 
        max(
            0.0, 
            dot(n, normalize(vec3(-1, 0, 1)))
        )
    );
    float lightSide = smoothstep(
        0.9, 
        1.0, 
        max(
            0.0, 
            dot(n, normalize(vec3(1, -1, 1)))
        )
    );
    float lightRim = smoothstep(0.4, 0.5, 1.0 - abs(n.z));
    varColor = vec3(lightRim * 1.0 + lightMain * 0.5 + lightSide * 0.0);
}