import { Theme } from "@/utils/theme"
import {
    Elem,
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
import MoveLogic, { Direction } from "@/logic/move"
import { onKey } from "@/utils/events"

export default class Sprites {
    private readonly projection: Projection
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly buffer: WebGLBuffer
    private readonly uniSize: WebGLUniformLocation
    private readonly uniColor0: WebGLUniformLocation
    private readonly uniColor1: WebGLUniformLocation
    private readonly uniMatrix: WebGLUniformLocation
    private readonly uniAtlas: WebGLUniformLocation
    private readonly verticesCount: number
    private readonly attribsInst: TgdAttributes<{
        attCenter: number
        attAtlas: number
    }>
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
    public size = 0.2
    public red0 = 0
    public green0 = 0
    public blue0 = 0
    public red1 = 1
    public green1 = 1
    public blue1 = 1

    constructor(
        private readonly gl: WebGL2RenderingContext,
        atlas: HTMLCanvasElement,
        private readonly movePacMan: MoveLogic,
        private readonly moveMonsters: MoveLogic[],
        private readonly moveDiamond: MoveLogic
    ) {
        this.verticesCount = 2 + moveMonsters.length
        this.projection = new Projection(gl)
        createTexture(gl, atlas)
        const prg = createProgram(gl, { vert: VERT, frag: FRAG })
        this.uniSize = getUniformLocation(gl, prg, "uniSize")
        this.uniAtlas = getUniformLocation(gl, prg, "uniAtlas")
        this.uniColor0 = getUniformLocation(gl, prg, "uniColor0")
        this.uniColor1 = getUniformLocation(gl, prg, "uniColor1")
        this.uniMatrix = getUniformLocation(gl, prg, "uniMatrix")
        const bufferVert = createBuffer(gl)
        const attribsVert = new TgdAttributes({
            attCorner: 2,
            attUV: 2,
        })
        const BASE = -0.5
        attribsVert.set(
            "attCorner",
            new Float32Array([-1, BASE, +1, BASE, -1, BASE + 2, +1, BASE + 2])
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
        const zeros = new Array(2 * this.verticesCount).fill(0)
        attribsInst.set("attCenter", new Float32Array(zeros))
        attribsInst.set("attAtlas", new Float32Array(zeros))
        attribsInst.update(gl, bufferInst, this.verticesCount, true)
        const vao = createVertexArray(gl)
        gl.bindVertexArray(vao)
        attribsVert.define(gl, prg, bufferVert)
        attribsInst.define(gl, prg, bufferInst)
        gl.bindVertexArray(null)
        this.gl = gl
        this.prg = prg
        this.vao = vao
        this.buffer = bufferInst
        this.attribsInst = attribsInst
        onKey("Enter", () => {
            attribsInst.debug()
            console.log("🚀 [sprites] this = ", this) // @FIXME: Remove this line written on 2023-08-18 at 19:30
        })
    }

    readonly paint = (time: number) => {
        const {
            gl,
            prg,
            vao,
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
        this.updateColors()
        this.updatePositions()
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.useProgram(prg)
        gl.uniform1f(uniSize, size)
        gl.uniform3f(uniColor0, red0, green0, blue0)
        gl.uniform3f(uniColor1, red1, green1, blue1)
        gl.uniformMatrix4fv(uniMatrix, true, this.matrix)
        gl.uniform1i(uniAtlas, 0)
        gl.bindVertexArray(vao)
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.verticesCount)
    }

    private updateColors() {
        this.red0 = Theme.backR
        this.green0 = Theme.backG
        this.blue0 = Theme.backB
        this.red1 = Theme.frontR
        this.green1 = Theme.frontG
        this.blue1 = Theme.frontB
    }

    private updatePositions() {
        const { attribsInst, movePacMan, moveMonsters, moveDiamond } = this
        const centerX = movePacMan.x
        const centerY = movePacMan.y
        const pacmanDir = movePacMan.getDirection()
        if (pacmanDir !== Direction.Stop) {
            attribsInst.poke("attAtlas", 0, 0, dir2U(pacmanDir))
        }
        let index = 1
        for (const monster of moveMonsters) {
            attribsInst.poke("attCenter", index, Elem.X, monster.x - centerX)
            attribsInst.poke("attCenter", index, Elem.Y, monster.y - centerY)
            const monsterDir = monster.getDirection()
            if (monsterDir !== Direction.Stop) {
                attribsInst.poke("attAtlas", index, 0, dir2U(monsterDir))
            }
            attribsInst.poke("attAtlas", index, 1, 0.3333333333333333333)
            index++
        }
        attribsInst.poke("attCenter", index, Elem.X, moveDiamond.x - centerX)
        attribsInst.poke("attCenter", index, Elem.Y, moveDiamond.y - centerY)
        attribsInst.poke("attAtlas", index, Elem.X, 0)
        attribsInst.poke("attAtlas", index, Elem.Y, 0.6666666666)
        attribsInst.update(this.gl, this.buffer, this.verticesCount, true)
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

function dir2U(dir: Direction): number {
    switch (dir) {
        case Direction.Right:
            return 0
        case Direction.Up:
            return 0.25
        case Direction.Left:
            return 0.5
        case Direction.Down:
            return 0.75
    }
    return 0
}
