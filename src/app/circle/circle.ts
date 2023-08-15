import { createProgram, getUniformLocation } from "@/webgl2"
import VERT from "./circle.vert"
import FRAG from "./circle.frag"

export default class Game {
    private readonly prg: WebGLProgram
    private readonly uniSize: WebGLUniformLocation
    private readonly uniColor: WebGLUniformLocation
    private lastWidth = 0
    private lastHeight = 0

    constructor(
        private readonly gl: WebGL2RenderingContext,
        public red: number,
        public green: number,
        public blue: number,
        public size: number
    ) {
        this.prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniSize = getUniformLocation(gl, this.prg, "uniSize")
        this.uniColor = getUniformLocation(gl, this.prg, "uniColor")
    }

    readonly paint = (time: number) => {
        const { gl, prg, uniSize, uniColor, red, green, blue, size } = this
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
        gl.uniform1f(uniSize, size * Math.min(this.lastWidth, this.lastHeight))
        gl.uniform3f(uniColor, red, green, blue)
        gl.drawArrays(gl.POINTS, 0, 1)
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
}

const TIME0 = 1e6
const SX = 0
const SY = 5
const SZ = 10
const X = 3
const Y = 7
const Z = 11
