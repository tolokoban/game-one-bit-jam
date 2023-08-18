import { Theme } from "./utils/theme"
import Painter from "./app/painter/maze"
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
import MonsterMoveLogic from "./logic/monster"
import PacManMoveLogic from "./logic/pacman"

/**
 * These Magic Numbers have been set manually by eye control.
 */
let ZOOM = 0.579
let PROJ_A = 0.236
let PROJ_B = PROJ_A * ZOOM

async function start() {
    const atlas = await TgdLoadImage.loadInCanvas("./atlas.png")
    if (!atlas) throw Error('Unable to load image "./atlas.png"!')

    if (Math.random() < 0.5) Theme.setDark()
    else Theme.setLight()
    const canvas = getById("canvas") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2")
    if (!gl) throw Error("Unable to get WebGL2 context!")

    const movePacMan = new PacManMoveLogic(LEVEL1, 3, 2)
    // const hunt = new Hunt(LEVEL1)
    // const pivotHandler = (col: number, row: number) => {
    //     return hunt.getDirection(col, row, movePacMan.x, movePacMan.y)
    // }
    const moveMonsters: MoveLogic[] = [
        new MonsterMoveLogic(LEVEL1, 0, 0, movePacMan, 0.5),
        // new MonsterMoveLogic(LEVEL1, LEVEL1.cols - 1, 0, movePacMan, 1),
        // new MonsterMoveLogic(LEVEL1, 0, LEVEL1.rows - 1, movePacMan, 1.25),
        // new MonsterMoveLogic(
        //     LEVEL1,
        //     LEVEL1.cols - 1,
        //     LEVEL1.rows - 1,
        //     movePacMan,
        //     2
        // ),
    ]
    const painterSprites = new Sprites(gl, atlas, movePacMan, moveMonsters)
    const dataMaze = await loadAttributes("level1")
    const painterMaze = new Painter(gl, dataMaze)
    painterMaze.alpha = 0.95
    painterMaze.size = 0.05
    painterMaze.zoom = 5
    let previousTime = 0

    onKey(" ", () => {
        console.log(moveMonsters)
        Theme.toggle()
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
            painterMaze.x = PROJ_A * x - PROJ_A * y
            painterMaze.y = -PROJ_B * x - PROJ_B * y
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
