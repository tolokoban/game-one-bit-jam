import Game from "./app/game"
import { createParticlesData } from "./app/prepare"
import "./index.css"

const RESOLUTION = 1024

async function start() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
    if (!canvas) throw Error("No canvas with id #canvas!")

    const data = await createParticlesData(
        "mesh/scene.glb",
        RESOLUTION,
        RESOLUTION
    )
    console.log("🚀 [index] data = ", data) // @FIXME: Remove this line written on 2023-08-15 at 14:27
    const game = new Game(canvas, data)
    game.start()

    const splash = document.getElementById("splash-screen")
    if (!splash) throw Error("Unable to find element #splash-screen!")

    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

start()
