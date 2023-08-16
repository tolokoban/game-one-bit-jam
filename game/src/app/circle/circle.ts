import { createProgram, getUniformLocation } from "@/webgl2"
import VERT from "./circle.vert"
import FRAG from "./circle.frag"
import Projection from "../projection"

export default class Game {
    private readonly projection: Projection
    private readonly prg: WebGLProgram
    private readonly uniPos: WebGLUniformLocation
    private readonly uniSize: WebGLUniformLocation
    private readonly uniColor: WebGLUniformLocation
    private lastWidth = 0
    private lastHeight = 0

    public x = 0
    public y = 0

    constructor(
        private readonly gl: WebGL2RenderingContext,
        public red: number,
        public green: number,
        public blue: number,
        public size: number
    ) {
        this.projection = new Projection(gl)
        this.prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniPos = getUniformLocation(gl, this.prg, "uniPos")
        this.uniSize = getUniformLocation(gl, this.prg, "uniSize")
        this.uniColor = getUniformLocation(gl, this.prg, "uniColor")
    }

    readonly paint = (time: number) => {
        this.red = 0
        this.green = 1
        this.blue = 0

        const {
            gl,
            x,
            y,
            prg,
            uniPos,
            uniSize,
            uniColor,
            red,
            green,
            blue,
            size,
        } = this
        this.projection.update()
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.FUNC_ADD)
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE
        )
        gl.useProgram(prg)
        gl.uniform2f(
            uniPos,
            x * this.projection.scaleX,
            y * this.projection.scaleY
        )
        gl.uniform1f(uniSize, size * Math.min(this.lastWidth, this.lastHeight))
        gl.uniform3f(uniColor, red, green, blue)
        gl.drawArrays(gl.POINTS, 0, 1)
    }
}

const TIME0 = 1e6
const SX = 0
const SY = 5
const SZ = 10
const X = 3
const Y = 7
const Z = 11
