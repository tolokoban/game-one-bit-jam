export function createBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer()
    if (!buffer) throw Error("Unable to create a WebGL Buffer!")

    return buffer
}
