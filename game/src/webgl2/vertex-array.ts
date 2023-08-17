export function createVertexArray(
    gl: WebGL2RenderingContext
): WebGLVertexArrayObject {
    const vao = gl.createVertexArray()
    if (!vao) throw Error("Unable to create WebGL Vertex Array!")

    return vao
}
