import {
    TgdAttributes,
    createBuffer,
    createProgram,
    createVertexArray,
    getUniformLocation,
} from "@/webgl2"
import VERT from "./sprites.vert"
import FRAG from "./sprites.frag"
import Projection from "../../projection"
import { createTexture } from "@/webgl2/texture"

export default class Sprites {
    private readonly projection: Projection
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly uniSize: WebGLUniformLocation
    private readonly uniColor0: WebGLUniformLocation
    private readonly uniColor1: WebGLUniformLocation
    private readonly uniMatrix: WebGLUniformLocation
    private readonly uniAtlas: WebGLUniformLocation
    private readonly attribsInst: TgdAttributes<{
        attCenter: number
        attAtlas: number
    }>
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
    public zoom = 1
    public size = 0.1
    public red0 = 0
    public green0 = 0
    public blue0 = 0
    public red1 = 1
    public green1 = 1
    public blue1 = 1

    constructor(
        private readonly gl: WebGL2RenderingContext,
        atlas: HTMLCanvasElement
    ) {
        this.projection = new Projection(gl)
        createTexture(gl, atlas)
        const prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniSize = getUniformLocation(gl, prg, "uniSize")
        this.uniAtlas = getUniformLocation(gl, prg, "uniAtlas")
        this.uniColor0 = getUniformLocation(gl, prg, "uniColor0")
        this.uniColor1 = getUniformLocation(gl, prg, "uniColor0")
        this.uniMatrix = getUniformLocation(gl, prg, "uniMatrix")
        const bufferVert = createBuffer(gl)
        const attribsVert = new TgdAttributes({
            attCorner: 2,
            attUV: 2,
        })
        attribsVert.set(
            "attCorner",
            new Float32Array([-1, -1, +1, -1, -1, +1, +1, +1])
        )
        attribsVert.set("attUV", new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]))
        attribsVert.update(gl, bufferVert, 4, false)
        const bufferInst = createBuffer(gl)
        const attribsInst = new TgdAttributes(
            {
                attCenter: 2,
                attAtlas: 2,
            },
            1
        )
        attribsInst.set(
            "attCenter",
            new Float32Array([0, 0, 3, 0, 6, 0, 0, 2, 3, 2, 0, 4])
        )
        attribsInst.set(
            "attAtlas",
            new Float32Array(
                [0, 0, 0, 1, 1, 1, 2, 1, 3, 1, 0, 2].map(value =>
                    (value & 1) === 0 ? value * 0.25 : value * 0.5
                )
            )
        )
        attribsInst.update(gl, bufferInst, 6, true)
        const vao = createVertexArray(gl)
        gl.bindVertexArray(vao)
        attribsVert.define(gl, prg, bufferVert)
        attribsInst.define(gl, prg, bufferInst)
        gl.bindVertexArray(null)
        this.gl = gl
        this.prg = prg
        this.vao = vao
        this.attribsInst = attribsInst
        this.count = 6
    }

    readonly paint = (time: number) => {
        const {
            gl,
            prg,
            vao,
            count,
            uniAtlas,
            uniSize,
            uniColor0,
            uniColor1,
            uniMatrix,
            red0,
            green0,
            blue0,
            red1,
            green1,
            blue1,
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
        gl.uniform1f(uniSize, size)
        gl.uniform3f(uniColor0, red0, green0, blue0)
        gl.uniform3f(uniColor1, red1, green1, blue1)
        gl.uniformMatrix4fv(uniMatrix, true, this.matrix)
        gl.uniform1i(uniAtlas, 0)
        gl.bindVertexArray(vao)
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count)
    }

    private checkSize(): boolean {
        const { projection } = this
        if (!projection.update()) return false

        this.updateMatrix()
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

const SX = 0
const SY = 5
const SZ = 10
const X = 3
const Y = 7
const Z = 11
