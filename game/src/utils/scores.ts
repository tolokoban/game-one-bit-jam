import { getElement } from "./dom"

const DEFAULT: Array<[name: string, score: string]> = [
    ["FABIEN", "12800"],
    ["SAMANT", "6400"],
    ["MARY", "3200"],
    ["JOHN", "1600"],
    ["ALFRED", "800"],
    ["HENRY", "400"],
    ["MONKEY", "200"],
    ["FLOWER", "100"],
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

export function saveScore(points: number) {
    const items = [...loadScores(), ["(You)", `${points}`]]
        .sort(sortItems)
        .slice(0, DEFAULT.length)
    window.localStorage.setItem(
        "highscores",
        items.map(([a, b]) => `${a}=${b}`).join(",")
    )
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
