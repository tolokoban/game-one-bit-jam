export function getElement(selector: string): HTMLElement {
    const elem = document.body.querySelector(selector)
    if (!elem) throw Error(`No element found with selector "${selector}"!`)

    return elem as HTMLElement
}
