import { Theme } from "./utils/theme"
import Painter from "./app/painter/maze"
import Circle from "./app/circle"
import { loadAttributes } from "./loader"
import { LEVEL1 } from "./levels/level"
import MoveLogic, { Direction } from "./logic/move"

import "./index.css"
import Input from "./utils/input"
import { getById } from "./utils/dom"
import { TgdLoadImage } from "./utils/load"
import Sprites from "./app/painter/sprites/sprites"

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

    const movePacMan = new MoveLogic(LEVEL1, 0, 0)
    const moveMonsters: MoveLogic[] = []
    const painterSprites = new Sprites(gl, atlas, movePacMan, moveMonsters)
    const dataMaze = await loadAttributes("level1")
    const painterMaze = new Painter(gl, dataMaze)
    painterMaze.alpha = 0.2
    painterMaze.size = 0.05
    painterMaze.zoom = 5
    const dataPacMan = await loadAttributes("pacman")
    const painterPacMan = new Painter(gl, dataPacMan)
    painterPacMan.alpha = 0.8
    painterPacMan.size = 1
    painterPacMan.zoom = 0.2
    let previousTime = 0

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
        if (key === " ") Theme.toggle()

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
        painterPacMan.red = red
        painterPacMan.green = green
        painterPacMan.blue = blue
        painterMaze.paint(time)
        painterSprites.paint(time)
        // painterPacMan.paint(time)
        // Logic
        if (previousTime > 0) {
            const delay = Math.min(500, time - previousTime)
            movePacMan.update(delay)
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

start()