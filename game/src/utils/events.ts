export function onKey(key: string, action: () => void) {
    window.addEventListener("keypress", (evt: KeyboardEvent) => {
        if (evt.key === key) {
            evt.preventDefault()
            action()
        }
    })
}
