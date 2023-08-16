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
    }

    private readonly handlKeyDown = (evt: KeyboardEvent) => {
        const { key } = evt
        switch (key) {
            case "ArrowRight":
                this.events.onRight()
                break
            case "ArrowLeft":
                this.events.onLeft()
                break
            case "ArrowUp":
                this.events.onUp()
                break
            case "ArrowDown":
                this.events.onDown()
                break
            default:
                console.log("🚀 [input] key = ", key) // @FIXME: Remove this line written on 2023-08-16 at 13:11
        }
    }
}
