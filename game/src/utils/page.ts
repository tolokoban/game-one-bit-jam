import { getElement } from "./dom"
import { musicStart, musicStop } from "./music"
import { Theme } from "./theme"

const PAGES = ["hall-of-fame", "game-over"].map(id => getElement(`#${id}`))

export function showPage(pageId: "hall-of-fame" | "game-over" | "game-screen") {
    for (const element of PAGES) {
        element.classList.remove("show")
    }
    if (pageId === "game-screen") {
        const game = getElement("#game-screen")
        Theme.setLight()
        game.requestFullscreen({ navigationUI: "hide" })
        musicStart()
        return
    } else {
        musicStop()
        if (document.fullscreenElement) {
            document.exitFullscreen()
        }
    }
    getElement(`#${pageId}`).classList.add("show")
}
