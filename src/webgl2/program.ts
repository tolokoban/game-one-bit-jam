export function createProgram(
    gl: WebGL2RenderingContext,
    code: {
        vert: string
        frag: string
    }
): WebGLProgram {
    const prg = gl.createProgram()
    if (!prg) throw Error(`Unable to create a WebGL Program!`)
    const vertShader = createShader(gl, "vertex", code.vert)
    gl.attachShader(prg, vertShader)
    const fragShader = createShader(gl, "fragment", code.frag)
    gl.attachShader(prg, fragShader)
    gl.linkProgram(prg)
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        console.log("Vertex Shader:")
        console.log(`%c${code.vert}`, "font-family:monospace;font-size:80%")
        console.log("Fragment Shader:")
        console.log(`%c${code.frag}`, "font-family:monospace;font-size:80%")
        var info = gl.getProgramInfoLog(prg)
        console.warn(info)
        throw new Error("Could NOT link WebGL2 program!\n" + info)
    }
    return prg
}

function createShader(
    gl: WebGL2RenderingContext,
    type: "vertex" | "fragment",
    code: string
): WebGLShader {
    const shader = gl.createShader(
        type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    )
    if (!shader) throw Error("Unable to create a Vertex Shader handle!")

    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    return shader
}
