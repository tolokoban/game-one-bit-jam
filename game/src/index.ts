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
    const progress = getElement("#progress")
    showPage("hall-of-fame")
    displayScores()
    progress.textContent = "Loading sprites...  (1/2)"
    const atlas = await TgdLoadImage.loadInCanvas("./atlas.png")
    if (!atlas) throw Error('Unable to load image "./atlas.png"!')

    const canvas = getElement("#canvas") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2", {
        alpha: false,
        premultipliedAlpha: false,
    })
    if (!gl) throw Error("Unable to get WebGL2 context!")

    progress.textContent = "Loading particles...  (2/2)"
    const dataMaze = await loadAttributes("level1")
    registerServiceWorker()
    const game = new Game(gl, atlas, dataMaze)

    onKey(" ", () => {
        Theme.toggle()
    })

    onClick("#start-button", () => {
        game.start()
        showPage("game-screen")
    })
    onClick("#game-over", () => showPage("hall-of-fame"))
    const splash = getElement("#splash-screen")
    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(registration => {
                console.log("SW registered: ", registration)
            })
            .catch(registrationError => {
                console.log("SW registration failed: ", registrationError)
            })
    }
}

start()
