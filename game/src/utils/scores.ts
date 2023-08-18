import { getElement } from "./dom"

const DEFAULT: Array<[name: string, score: string]> = [
    ["FABIEN", "128000"],
    ["SAMANT", "64000"],
    ["MARY", "32000"],
    ["JOHN", "16000"],
    ["ALFRED", "8000"],
    ["HENRY", "4000"],
    ["MONKEY", "2000"],
    ["FLOWER", "1000"],
]

export function displayScores() {
    const items = loadScores()
    const container = getElement("#scores")
    container.innerHTML = ""
    for (const [name, score] of items) {
        const nameElem = document.createElement("b")
        nameElem.textContent = name
        const scoreElem = document.createElement("div")
        scoreElem.textContent = score
        container.appendChild(nameElem)
        container.appendChild(scoreElem)
    }
}

function loadScores() {
    const code = window.localStorage.getItem("highscores") ?? ""
    const items = code
        .split(",")
        .map(line => line.split("="))
        .filter(item => Array.isArray(item) && item.length === 2)
        .sort(sortItems)
    if (items.length < DEFAULT.length) return DEFAULT

    return items
}

function sortItems(
    [_nameA, scoreA]: string[],
    [_nameB, scoreB]: string[]
): number {
    return parseInt(scoreA, 10) - parseInt(scoreB, 10)
}
