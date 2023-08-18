import { getElement } from "./dom"

const PAGES = ["hall-of-fame", "game-over"].map(id => getElement(`#${id}`))

export function showPage(pageId: "hall-of-fame" | "game-over" | "game-screen") {
    for (const element of PAGES) {
        element.classList.remove("show")
    }
    if (pageId === "game-screen") {
        const game = getElement("#game-screen")
        game.requestFullscreen({ navigationUI: "hide" })
        return
    } else {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        }
    }
    getElement(`#${pageId}`).classList.add("show")
}
