import { createProgram, getUniformLocation } from "@/webgl2"
import VERT from "./painter.vert"
import FRAG from "./painter.frag"

export default class Game {
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly uniTime: WebGLUniformLocation
    private readonly uniSize: WebGLUniformLocation
    private readonly uniAlpha: WebGLUniformLocation
    private readonly uniColor: WebGLUniformLocation
    private readonly uniMatrix: WebGLUniformLocation
    private readonly count: number
    private lastWidth = 0
    private lastHeight = 0
    // prettier-ignore
    private readonly matrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])

    public x = 0
    public y = 0
    public alpha = 0.5
    public zoom = 5
    public size = 0.05
    public red = 0 // 1
    public green = 0 // 0.8
    public blue = 0

    constructor(
        private readonly gl: WebGL2RenderingContext,
        data: Float32Array
    ) {
        this.prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniTime = getUniformLocation(gl, this.prg, "uniTime")
        this.uniSize = getUniformLocation(gl, this.prg, "uniSize")
        this.uniAlpha = getUniformLocation(gl, this.prg, "uniAlpha")
        this.uniColor = getUniformLocation(gl, this.prg, "uniColor")
        this.uniMatrix = getUniformLocation(gl, this.prg, "uniMatrix")
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
        console.log("Particles count:", this.count)
    }

    readonly paint = (time: number) => {
        const {
            gl,
            prg,
            vao,
            count,
            uniTime,
            uniSize,
            uniAlpha,
            uniColor,
            uniMatrix,
            red,
            green,
            blue,
            alpha,
            size,
        } = this
        this.checkSize()
        this.updateMatrix()
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.FUNC_ADD)
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE
        )
        gl.useProgram(prg)
        gl.uniform1f(uniTime, (time + TIME0) * 0.2)
        gl.uniform1f(uniSize, size)
        gl.uniform1f(uniAlpha, alpha)
        gl.uniform3f(uniColor, red, green, blue)
        gl.uniformMatrix4fv(uniMatrix, true, this.matrix)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.POINTS, 0, count)
    }

    private checkSize() {
        const { gl, lastWidth, lastHeight } = this
        const canvas = gl.canvas as HTMLCanvasElement
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

    private updateMatrix() {
        const { matrix, x, y, zoom, lastWidth: W, lastHeight: H } = this
        const scaleX = W > H ? (zoom * H) / W : zoom
        const scaleY = H > W ? (zoom * W) / H : zoom
        matrix[SX] = scaleX
        matrix[SY] = scaleY
        matrix[X] = -x * scaleX
        matrix[Y] = -y * scaleY
    }
}

const TIME0 = 1e6
const SX = 0
const SY = 5
const SZ = 10
const X = 3
const Y = 7
const Z = 11
