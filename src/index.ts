import Painter from "./app/painter"
import Circle from "./app/circle"
import { createParticlesData } from "./app/prepare"
import "./index.css"

async function start() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
    if (!canvas) throw Error("No canvas with id #canvas!")

    const gl = canvas.getContext("webgl2")
    if (!gl) throw Error("Unable to get WebGL2 context!")

    const res = (screen.availWidth + screen.availHeight) * 1
    const dataMaze = await createParticlesData("./mesh/level1.glb", res, res, {
        distance: 15,
        x: 8,
        y: 9,
    })
    const painterMaze = new Painter(gl, dataMaze)
    painterMaze.alpha = 0.2
    painterMaze.size = 0.05
    painterMaze.zoom = 5
    const dataPacMan = await createParticlesData(
        "./mesh/pacman.glb",
        res * 0.04,
        res * 0.04,
        {
            distance: 1.5,
        }
    )
    const painterPacMan = new Painter(gl, dataPacMan)
    painterPacMan.alpha = 0.8
    painterPacMan.size = 1
    painterPacMan.zoom = 0.2
    const painterCircle = new Circle(gl, 0.8, 0.7, 0.5, 0.16)
    const paint = (time: number) => {
        gl.clearColor(0.8, 0.7, 0.5, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        painterMaze.paint(time)
        painterCircle.paint(time)
        painterPacMan.paint(time)
        window.requestAnimationFrame(paint)
    }
    window.requestAnimationFrame(paint)

    const splash = document.getElementById("splash-screen")
    if (!splash) throw Error("Unable to find element #splash-screen!")

    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

start()
