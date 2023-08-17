export function getById(elementId: string): HTMLElement {
    const elem = document.getElementById(elementId)
    if (!elem) throw Error(`No element found with id "${elementId}"!`)

    return elem
}
