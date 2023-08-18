import { LEVEL1 } from "@/levels/level"
import MonsterMoveLogic from "@/logic/monster"
import PacManMoveLogic from "@/logic/pacman"
import { Theme } from "@/utils/theme"
import PainterMaze from "./painter/maze"
import Sprites from "./painter/sprites"
import { Direction } from "@/logic/move"
import Input from "@/utils/input"

export default class Game {
    private readonly level = LEVEL1
    private logics: {
        pacman: PacManMoveLogic
        monsters: MonsterMoveLogic[]
        sprites: Sprites
        maze: PainterMaze
    }
    private playing = false
    private lastTime = -1

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly atlas: HTMLCanvasElement,
        private readonly particles: Float32Array
    ) {
        this.logics = this.reset()
        const game = this
        new Input({
            onLeft() {
                game.logics.pacman.setDirection(Direction.Left)
            },
            onRight() {
                game.logics.pacman.setDirection(Direction.Right)
            },
            onDown() {
                game.logics.pacman.setDirection(Direction.Down)
            },
            onUp() {
                game.logics.pacman.setDirection(Direction.Up)
            },
        })
    }

    start() {
        if (this.playing) return

        this.logics = this.reset()
        this.playing = true
        this.lastTime = -1
        window.requestAnimationFrame(this.paint)
    }

    private readonly paint = (time: number) => {
        const delay = this.computeDelay(time)
        if (delay > 0) {
            const { sprites, pacman, monsters } = this.logics
            this.clearBackground()
            this.paintMaze(time)
            sprites.paint(time)
            // Logic
            this.updateMaze()
            pacman.update(delay)
            for (const monster of monsters) {
                monster.update(delay)
            }
        }
        if (this.playing) window.requestAnimationFrame(this.paint)
    }

    private updateMaze() {
        const { logics } = this
        const { maze, pacman } = logics
        const { x, y } = pacman
        maze.x = PROJ_A * x - PROJ_A * y
        maze.y = -PROJ_B * x - PROJ_B * y
    }

    private paintMaze(time: number) {
        const { logics } = this
        const { maze } = logics
        maze.red = Theme.frontR
        maze.green = Theme.frontG
        maze.blue = Theme.frontB
        maze.paint(time)
    }

    private clearBackground() {
        const { gl } = this
        gl.clearColor(Theme.backR, Theme.backG, Theme.backB, 1)
        gl.clearDepth(1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.disable(gl.DEPTH_TEST)
    }

    private computeDelay(time: number) {
        const { lastTime } = this
        if (lastTime < 0) {
            this.lastTime = time
            return 0
        }

        const delay = Math.min(250, time - lastTime)
        this.lastTime = time
        return delay
    }

    private reset() {
        const pacman = new PacManMoveLogic(this.level, 3, 2)
        const monsters = [new MonsterMoveLogic(this.level, 0, 0, pacman, 0.5)]
        const sprites = new Sprites(this.gl, this.atlas, pacman, monsters)
        const maze = new PainterMaze(this.gl, this.particles)
        return {
            pacman,
            monsters,
            sprites,
            maze,
        }
    }
}

/**
 * These Magic Numbers have been set manually by eye control.
 */
const ZOOM = 0.579
const PROJ_A = 0.236
const PROJ_B = PROJ_A * ZOOM
