import { Theme } from "./utils/theme"
import Painter from "./app/painter/maze"
import Circle from "./app/circle"
import { loadAttributes } from "./loader"
import { LEVEL1 } from "./levels/level"
import MoveLogic, { Direction, PivotHandler } from "./logic/move"

import "./index.css"
import Input from "./utils/input"
import { getById } from "./utils/dom"
import { TgdLoadImage } from "./utils/load"
import Sprites from "./app/painter/sprites/sprites"
import Hunt from "./logic/hunt/hunt"
import { onKey } from "./utils/events"

/**
 * These Magic Numbers have been set manually by eye control.
 */
let ZOOM = 0.579
let A = 0.236
let B = A * ZOOM

async function start() {
    const atlas = await TgdLoadImage.loadInCanvas("./atlas.png")
    if (!atlas) throw Error('Unable to load image "./atlas.png"!')

    if (Math.random() < 0.5) Theme.setDark()
    else Theme.setLight()
    const canvas = getById("canvas") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2")
    if (!gl) throw Error("Unable to get WebGL2 context!")

    const hunt = new Hunt(LEVEL1)
    const movePacMan = new MoveLogic(LEVEL1, 3, 2)
    const pivotHandler = (col: number, row: number) => {
        return hunt.getDirection(col, row, movePacMan.x, movePacMan.y)
    }
    const moveMonsters: MoveLogic[] = [
        makeMonsterLogic(LEVEL1.cols - 1, 0, pivotHandler, 1),
        makeMonsterLogic(0, LEVEL1.rows - 1, pivotHandler, 1.25),
        makeMonsterLogic(LEVEL1.cols - 1, LEVEL1.rows - 1, pivotHandler, 2),
    ]
    const painterSprites = new Sprites(gl, atlas, movePacMan, moveMonsters)
    const dataMaze = await loadAttributes("level1")
    const painterMaze = new Painter(gl, dataMaze)
    painterMaze.alpha = 0.5
    painterMaze.size = 0.05
    painterMaze.zoom = 5
    let previousTime = 0

    onKey(" ", () => Theme.toggle())
    window.addEventListener("keydown", (evt: KeyboardEvent) => {
        const { key } = evt
        if ("0+-*/".includes(key)) evt.preventDefault()

        if (key === "0") {
            if (movePacMan.x === 0) {
                movePacMan.x = 16
                movePacMan.y = 16
            } else {
                movePacMan.x = 0
                movePacMan.y = 0
            }
            movePacMan.setDirection(Direction.Stop)
        }
        if (key === "+") ZOOM += 1e-3
        if (key === "-") ZOOM -= 1e-3
        if (key === "*") A += 1e-3
        if (key === "/") A -= 1e-3

        B = A * ZOOM
        console.log("🚀 [index] ZOOM, A = ", ZOOM, A) // @FIXME: Remove this line written on 2023-08-16 at 15:35
    })

    new Input({
        onLeft() {
            movePacMan.setDirection(Direction.Left)
        },
        onRight() {
            movePacMan.setDirection(Direction.Right)
        },
        onDown() {
            movePacMan.setDirection(Direction.Down)
        },
        onUp() {
            movePacMan.setDirection(Direction.Up)
        },
    })
    const paint = (time: number) => {
        gl.clearColor(Theme.backR, Theme.backG, Theme.backB, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const red = Theme.frontR
        const green = Theme.frontG
        const blue = Theme.frontB
        painterMaze.red = red
        painterMaze.green = green
        painterMaze.blue = blue
        // painterPacMan.red = red
        // painterPacMan.green = green
        // painterPacMan.blue = blue
        painterMaze.paint(time)
        painterSprites.paint(time)
        // Logic
        if (previousTime > 0) {
            const delay = Math.min(500, time - previousTime)
            movePacMan.update(delay)
            for (const moveMonster of moveMonsters) {
                moveMonster.update(delay)
            }
            const x = movePacMan.x
            const y = movePacMan.y
            painterMaze.x = A * x - A * y
            painterMaze.y = -B * x - B * y
        }
        previousTime = time
        window.requestAnimationFrame(paint)
    }

    const startButton = getById("start-button")
    startButton.addEventListener("click", () => {
        document.body.classList.add("play")
        const music = getById("music") as HTMLAudioElement
        music.volume = 0.5
        const gameScreen = getById("game-screen") as HTMLDivElement
        const go = () => {
            music.play()
            music.playbackRate = 0.8
            window.requestAnimationFrame(paint)
        }
        gameScreen.requestFullscreen().then(go).catch(go)
    })
    const splash = getById("splash-screen")
    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

function makeMonsterLogic(
    x: number,
    y: number,
    pivotHandler: PivotHandler,
    speed: number
): MoveLogic {
    const move = new MoveLogic(LEVEL1, x, y, pivotHandler)
    move.speed = speed * 1e-3
    return move
}

start()
