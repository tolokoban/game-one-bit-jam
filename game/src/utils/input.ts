import { Direction } from "@/logic/move"
import { getElement } from "./dom"

const DIRECTIONS: Array<"left" | "right" | "up" | "down"> = [
    "left",
    "right",
    "up",
    "down",
]

const ARROWS = {
    left: getElement("#controls-h .left"),
    right: getElement("#controls-h .right"),
    up: getElement("#controls-v .up"),
    down: getElement("#controls-v .down"),
}

export default class Input {
    constructor(
        private readonly events: {
            onLeft: () => void
            onRight: () => void
            onUp: () => void
            onDown: () => void
        }
    ) {
        window.addEventListener("keydown", this.handlKeyDown)
        attachHandler("down", () => this.fire("down"))
        attachHandler("up", () => this.fire("up"))
        attachHandler("left", () => this.fire("left"))
        attachHandler("right", () => this.fire("right"))
    }

    private readonly handlKeyDown = (evt: KeyboardEvent) => {
        const { key } = evt
        switch (key) {
            case "ArrowRight":
            case "3":
                this.fire("right")
                break
            case "ArrowLeft":
            case "7":
                this.fire("left")
                break
            case "ArrowUp":
            case "9":
                this.fire("up")
                break
            case "ArrowDown":
            case "1":
                this.fire("down")
                break
            default:
                console.log("🚀 [input] key = ", key) // @FIXME: Remove this line written on 2023-08-16 at 13:11
        }
    }

    private readonly fire = (dir: "left" | "right" | "up" | "down") => {
        this.events[`on${capitalize(dir)}` as keyof typeof this.events]()
        ARROWS.down.classList.remove("selected")
        ARROWS.left.classList.remove("selected")
        ARROWS.right.classList.remove("selected")
        ARROWS.up.classList.remove("selected")
        ARROWS[dir].classList.add("selected")
    }
}

function attachHandler(id: keyof typeof ARROWS, handler: () => void) {
    const elem = ARROWS[id]
    elem.addEventListener("pointerdown", handler)
    elem.addEventListener("pointermove", handler)
}

function capitalize(word: string) {
    return `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`
}
