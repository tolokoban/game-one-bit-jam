import { loadAttributes } from "./loader"
import { getElement } from "./utils/dom"
import { onKey } from "./utils/events"
import { TgdLoadImage } from "./utils/load"
import { Theme } from "./utils/theme"

import "./index.css"
import Game from "./app/game"
import { displayScores } from "./utils/scores"

/**
 * These Magic Numbers have been set manually by eye control.
 */
let ZOOM = 0.579
let PROJ_A = 0.236
let PROJ_B = PROJ_A * ZOOM

async function start() {
    displayScores()
    const atlas = await TgdLoadImage.loadInCanvas("./atlas.png")
    if (!atlas) throw Error('Unable to load image "./atlas.png"!')

    const canvas = getElement("#canvas") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2")
    if (!gl) throw Error("Unable to get WebGL2 context!")

    const dataMaze = await loadAttributes("level1")
    const game = new Game(gl, atlas, dataMaze)

    onKey(" ", () => {
        Theme.toggle()
    })

    const startButton = getElement("#start-button")
    startButton.addEventListener("click", () => {
        document.body.classList.add("play")
        const music = getElement("#music") as HTMLAudioElement
        music.volume = 0.5
        const gameScreen = getElement("#game-screen") as HTMLDivElement
        const go = () => {
            music.play()
            music.playbackRate = 0.8
            // window.requestAnimationFrame(paint)
            game.start()
        }
        gameScreen.requestFullscreen().then(go).catch(go)
    })
    const splash = getElement("#splash-screen")
    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

start()
