export function getUniformLocation(
    gl: WebGL2RenderingContext,
    prg: WebGLProgram,
    name: string
): WebGLUniformLocation {
    const location = gl.getUniformLocation(prg, name)
    if (!location) throw Error(`Unable to find uniform "${name}"!`)

    return location
}
