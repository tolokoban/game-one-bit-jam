export function onKey(key: string, action: () => void) {
    window.addEventListener("keypress", (evt: KeyboardEvent) => {
        if (evt.key === key) {
            console.log("KeyPress:", evt.key)
            evt.preventDefault()
            action()
        }
    })
}
