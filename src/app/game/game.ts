import { createProgram } from "@/webgl2"
import VERT from "./game.vert"
import FRAG from "./game.frag"

export default class Game {
    private readonly gl: WebGL2RenderingContext
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly uniTime: WebGLUniformLocation
    private readonly count: number
    private lastWidth = 0
    private lastHeight = 0

    constructor(
        private readonly canvas: HTMLCanvasElement,
        data: Float32Array
    ) {
        const gl = canvas.getContext("webgl2")
        if (!gl) throw Error("Unable to get WebGL2 context!")

        this.prg = createProgram(gl, { vert: VERT, frag: FRAG })
        const uniTime = gl.getUniformLocation(this.prg, "uniTime")
        if (!uniTime) throw Error("Unable to find uniform uniTime!")

        this.uniTime = uniTime
        const buffer = gl.createBuffer()
        if (!buffer) throw Error("Unable to create Buffer!")

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        const vao = gl.createVertexArray()
        if (!vao) throw Error("Unable to create VAO!")

        gl.bindVertexArray(vao)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(
            0,
            4,
            gl.FLOAT,
            false,
            4 * Float32Array.BYTES_PER_ELEMENT,
            0
        )
        gl.bindVertexArray(null)
        this.gl = gl
        this.vao = vao
        this.count = data.length >> 2
    }

    start() {
        window.requestAnimationFrame(this.paint)
    }

    private readonly paint = (time: number) => {
        const { gl, prg, vao, count, uniTime } = this
        this.checkSize()
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.FUNC_ADD)
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE
        )
        gl.useProgram(prg)
        gl.uniform1f(uniTime, time * 0.1)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.POINTS, 0, count)
        window.requestAnimationFrame(this.paint)
    }

    private checkSize() {
        const { gl, canvas, lastWidth, lastHeight } = this
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (width !== lastWidth || height !== lastHeight) {
            this.lastWidth = width
            this.lastHeight = height
            canvas.width = width
            canvas.height = height
            gl.viewport(0, 0, width, height)
        }
    }
}
