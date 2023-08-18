import { getElement } from "./dom"

const DEFAULT: Array<[name: string, score: string]> = [
    ["FABIEN", "10000"],
    ["SAMANT", "4000"],
    ["MARY", "2000"],
    ["JOHN", "1000"],
    ["ALFRED", "400"],
    ["HENRY", "200"],
    ["MONKEY", "100"],
    ["FLOWER", "50"],
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
    const items = [...loadScores(), ["> (You)", `${points}`]]
        .sort(sortItems)
        .slice(0, DEFAULT.length)
    window.localStorage.setItem(
        "highscores",
        items.map(([a, b]) => `${a}=${b}`).join(",")
    )
    displayScores()
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
    return parseInt(scoreB, 10) - parseInt(scoreA, 10)
}
