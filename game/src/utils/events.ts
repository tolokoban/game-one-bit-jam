import { getElement } from "./dom"

export function onKey(key: string, action: () => void) {
    window.addEventListener("keypress", (evt: KeyboardEvent) => {
        if (evt.key === key) {
            console.log("KeyPress:", evt.key)
            evt.preventDefault()
            action()
        }
    })
}

export function onClick(selector: string, action: () => void) {
    getElement(selector).addEventListener("click", action)
}
