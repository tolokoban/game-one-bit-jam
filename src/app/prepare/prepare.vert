varying vec3 varColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 n = mat3(modelViewMatrix) * normal;
    float lightMain = smoothstep(0.25, 1.0, max(0.0, dot(n, normalize(vec3(1, 0.3, 0)))));
    float lightBack = smoothstep(0.5, 1.0, max(0.0, dot(n, normalize(vec3(-1, 0, 0)))));
    float lightRim = smoothstep(0.5, 1.0, max(0.0, dot(n, normalize(vec3(0, -1, 0)))));
    varColor = vec3(pow(lightMain, 1.0) + 0.5 * lightBack + 0.5 * lightRim);
    // varColor.g = 0.0;
    varColor.b = gl_Position.z / gl_Position.w;
}