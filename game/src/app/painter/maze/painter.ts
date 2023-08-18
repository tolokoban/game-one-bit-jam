import { createProgram, getUniformLocation } from "@/webgl2"
import VERT from "./painter.vert"
import FRAG from "./painter.frag"
import Projection from "../../projection"

const DENSITY = 0.5
export default class Game {
    private readonly projection: Projection
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly uniTime: WebGLUniformLocation
    private readonly uniSize: WebGLUniformLocation
    private readonly uniAlpha: WebGLUniformLocation
    private readonly uniDensity: WebGLUniformLocation
    private readonly uniColor: WebGLUniformLocation
    private readonly uniMatrix: WebGLUniformLocation
    private lastWidth = 0
    private lastHeight = 0
    private count = 0
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
    public zoom = 1
    public size = 0.05
    public red = 0 // 1
    public green = 0 // 0.8
    public blue = 0
    public density = 1

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly data: Float32Array
    ) {
        this.projection = new Projection(gl)
        this.prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniTime = getUniformLocation(gl, this.prg, "uniTime")
        this.uniSize = getUniformLocation(gl, this.prg, "uniSize")
        this.uniAlpha = getUniformLocation(gl, this.prg, "uniAlpha")
        this.uniDensity = getUniformLocation(gl, this.prg, "uniDensity")
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
        this.count = Math.floor((data.length >> 2) * DENSITY)
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
            uniDensity,
            uniColor,
            uniMatrix,
            density,
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
        gl.uniform1f(uniDensity, density)
        gl.uniform3f(uniColor, red, green, blue)
        gl.uniformMatrix4fv(uniMatrix, true, this.matrix)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.POINTS, 0, count)
    }

    private checkSize(): boolean {
        const { projection } = this
        if (!projection.update()) return false

        this.updateMatrix()
        const referenceSurface = 1080 // 3686400
        const surface = Math.min(projection.width, projection.height)
        const density = Math.min(1, surface / referenceSurface)
        this.count = Math.floor(
            (this.data.length >> 2) * Math.min(1, density) * DENSITY
        )
        console.log("Particles count:", this.count)
        return true
    }

    private updateMatrix() {
        const { matrix, x, y, zoom, projection } = this
        const W = projection.width
        const H = projection.height
        const scaleX = W > H ? H / W : 1
        const scaleY = H > W ? W / H : 1
        matrix[SX] = scaleX * zoom
        matrix[SY] = scaleY * zoom
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
