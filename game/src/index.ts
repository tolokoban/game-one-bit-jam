import Painter from "./app/painter"
import Circle from "./app/circle"
import { loadAttributes } from "./loader"
import { LEVEL1 } from "./levels/level"
import MoveLogic, { Direction } from "./logic/move"

import "./index.css"
import Input from "./input"

let ZOOM = 0.589
let A = 0.236
let B = A * ZOOM

async function start() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
    if (!canvas) throw Error("No canvas with id #canvas!")

    const gl = canvas.getContext("webgl2")
    if (!gl) throw Error("Unable to get WebGL2 context!")

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
    const painterCircle = new Circle(gl, 0.8, 0.7, 0.5, 0.16)
    let previousTime = 0
    const logic = new MoveLogic(LEVEL1, 0, 0)

    window.addEventListener("keydown", (evt: KeyboardEvent) => {
        const { key } = evt
        evt.preventDefault()

        if (key === "0") {
            if (logic.x === 0) {
                logic.x = 16
                logic.y = 15
            } else {
                logic.x = 0
                logic.y = 0
            }
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
            logic.setDirection(Direction.Left)
        },
        onRight() {
            logic.setDirection(Direction.Right)
        },
        onDown() {
            logic.setDirection(Direction.Down)
        },
        onUp() {
            logic.setDirection(Direction.Up)
        },
    })
    const paint = (time: number) => {
        gl.clearColor(0.8, 0.7, 0.5, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        painterMaze.paint(time)
        painterCircle.paint(time)
        // for (let row = -2; row < 3; row += 2) {
        //     for (let col = -5; col < 6; col += 1) {
        //         painterPacMan.x = A * col - A * row
        //         painterPacMan.y = B * col + B * row
        //     }
        // }
        painterPacMan.paint(time)
        // Logic
        if (previousTime > 0) {
            const delay = Math.min(500, time - previousTime)
            logic.update(delay)
            const x = logic.x
            const y = logic.y
            painterMaze.x = A * x - A * y
            painterMaze.y = -B * x - B * y
        }
        previousTime = time
        window.requestAnimationFrame(paint)
    }
    window.requestAnimationFrame(paint)

    const splash = document.getElementById("splash-screen")
    if (!splash) throw Error("Unable to find element #splash-screen!")

    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
}

start()
