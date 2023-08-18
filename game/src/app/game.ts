import { TgdAttributes } from "./../webgl2/attributes"
import { LEVEL1 } from "@/levels/level"
import MonsterMoveLogic, { PositionProvider } from "@/logic/monster"
import PacManMoveLogic from "@/logic/pacman"
import { Theme } from "@/utils/theme"
import PainterMaze from "./painter/maze"
import Sprites from "./painter/sprites"
import { Direction } from "@/logic/move"
import Input from "@/utils/input"
import { showPage } from "@/utils/page"
import DiamondMoveLogic from "@/logic/diamond"
import { getElement } from "@/utils/dom"
import { saveScore } from "@/utils/scores"

const POINTS = getElement("#points")
const SOUND = getElement("#sound") as HTMLAudioElement

export default class Game {
    private readonly level = LEVEL1
    private logics: {
        pacman: PacManMoveLogic
        monsters: MonsterMoveLogic[]
        sprites: Sprites
        diamond: DiamondMoveLogic
        maze: PainterMaze
    }
    private playing = false
    private lastTime = -1
    private _points = 0
    private lastDiamondTime = 0

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

    get points() {
        return this._points
    }
    set points(value: number) {
        this._points = value
        POINTS.textContent = `${value} points`
    }

    start() {
        if (this.playing) return

        this.points = 0
        this.logics = this.reset()
        this.playing = true
        this.lastTime = -1
        window.requestAnimationFrame(this.paint)
    }

    stop() {
        this.playing = false
    }

    private readonly paint = (time: number) => {
        const delay = this.computeDelay(time)
        if (delay > 0) {
            const { sprites, pacman, monsters, diamond } = this.logics
            this.clearBackground()
            this.paintMaze(time)
            sprites.paint(time)
            // Logic
            this.updateMaze()
            pacman.update(delay)
            for (const monster of monsters) {
                monster.update(delay)
                if (collide(pacman, monster)) {
                    this.stop()
                    showPage("game-over")
                    saveScore(this.points)
                    SOUND.play()
                }
            }
            if (collide(pacman, diamond)) {
                diamond.toggle()
                Theme.toggle()
                const length = time - this.lastDiamondTime
                this.lastDiamondTime = time
                const win = Math.ceil(1e6 / length)
                console.log("🚀 [game] win = ", win) // @FIXME: Remove this line written on 2023-08-18 at 18:56
                this.points += win
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
        const monsters: MonsterMoveLogic[] = [
            new MonsterMoveLogic(this.level, 0, 0, pacman, 0.5),
            new MonsterMoveLogic(this.level, 0, this.level.rows - 1, pacman, 1),
            new MonsterMoveLogic(this.level, this.level.cols - 1, 0, pacman, 2),
        ]
        const maze = new PainterMaze(this.gl, this.particles)
        const diamond = new DiamondMoveLogic(
            this.level,
            this.level.cols - 1,
            this.level.rows - 1
        )
        const sprites = new Sprites(
            this.gl,
            this.atlas,
            pacman,
            monsters,
            diamond
        )
        return {
            pacman,
            monsters,
            sprites,
            maze,
            diamond,
        }
    }
}

function collide(
    { x: x1, y: y1 }: PositionProvider,
    { x: x2, y: y2 }: PositionProvider
): boolean {
    const dist = Math.abs(x1 - x2) + Math.abs(y1 - y2)
    return dist < 0.5
}

/**
 * These Magic Numbers have been set manually by eye control.
 */
const ZOOM = 0.579
const PROJ_A = 0.236
const PROJ_B = PROJ_A * ZOOM
