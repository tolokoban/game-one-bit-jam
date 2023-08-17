import { getById } from "./dom"

const DIRECTIONS: Array<"left" | "right" | "up" | "down"> = [
    "left",
    "right",
    "up",
    "down",
]

export default class Input {
    private readonly controls: HTMLElement

    constructor(
        private readonly events: {
            onLeft: () => void
            onRight: () => void
            onUp: () => void
            onDown: () => void
        }
    ) {
        window.addEventListener("keydown", this.handlKeyDown)
        this.controls = getById("controls")
        for (const dir of DIRECTIONS) {
            const arrow = this.controls.querySelector(`.${dir}`)
            if (!arrow)
                throw Error(
                    `Unable to find an SVG child with className "${dir}"!`
                )

            attachHandler(arrow as SVGAElement, () => this.fire(dir))
        }
    }

    private readonly handlKeyDown = (evt: KeyboardEvent) => {
        const { key } = evt
        switch (key) {
            case "ArrowRight":
                this.fire("right")
                break
            case "ArrowLeft":
                this.fire("left")
                break
            case "ArrowUp":
                this.fire("up")
                break
            case "ArrowDown":
                this.fire("down")
                break
            default:
                console.log("🚀 [input] key = ", key) // @FIXME: Remove this line written on 2023-08-16 at 13:11
        }
    }

    private readonly fire = (dir: "left" | "right" | "up" | "down") => {
        this.events[`on${capitalize(dir)}` as keyof typeof this.events]()
        this.controls.classList.remove("left", "right", "up", "down")
        this.controls.classList.add(dir.toLowerCase())
    }
}

function attachHandler(elem: SVGElement, handler: () => void) {
    elem.addEventListener("pointerdown", handler)
    elem.addEventListener("pointermove", handler)
}

function capitalize(word: string) {
    return `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`
}
