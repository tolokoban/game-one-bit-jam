import { loadAttributes } from "./loader"
import { getElement } from "./utils/dom"
import { onClick, onKey } from "./utils/events"
import { TgdLoadImage } from "./utils/load"
import { Theme } from "./utils/theme"

import "./index.css"
import Game from "./app/game"
import { displayScores } from "./utils/scores"
import { showPage } from "./utils/page"

async function start() {
    showPage("hall-of-fame")
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

    onClick("#start-button", () => {
        const music = getElement("#music") as HTMLAudioElement
        music.volume = 0.5
        music.play()
        music.playbackRate = 0.8
        game.start()
        showPage("game-screen")
    })
    onClick("#game-over", () => showPage("hall-of-fame"))
    const splash = getElement("#splash-screen")
    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

start()
