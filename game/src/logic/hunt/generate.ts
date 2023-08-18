import Level from "@/levels/level"
import { toAlpha } from "./alphabet"
import { Direction } from "../move"

export function generate(level: Level): string {
    const list: string[] = []
    let time = Date.now()
    let count = 0
    const cells = getAllCells(level)
    console.log("🚀 [hunt] cells = ", cells) // @FIXME: Remove this line written on 2023-08-18 at 11:49
    for (const [fromX, fromY] of cells) {
        for (const [toX, toY] of cells) {
            if (fromX === toX && fromY === toY) continue

            const dir = findBestDirection(level, fromX, fromY, toX, toY)
            list.push(`${toAlpha(fromX, fromY, toX, toY)}${dir}`)
            count++
        }
    }
    const result = list.join("")
    console.log("🚀 [hunt] count = ", count) // @FIXME: Remove this line written on 2023-08-18 at 11:48
    console.log(Date.now() - time, "msec.")
    console.log("🚀 [hunt] result = ", result) // @FIXME: Remove this line written on 2023-08-18 at 12:00
    return result
}

interface Cell {
    col: number
    row: number
    initialDirection: Direction
    distance: number
    length: number
}

type Neighbour = [col: number, row: number, dir: number]

function findBestDirection(
    level: Level,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
): Direction {
    const visitedCells = new Map<string, number>()
    visitedCells.set(toAlpha(fromX, fromY), 0)
    type NewType = Cell

    const fringe: NewType[] = findNeighbours(level, fromX, fromY).map(
        ([col, row, dir]) => ({
            col,
            row,
            initialDirection: dir,
            distance: manhattan(col, row, toX, toY),
            length: 1,
        })
    )
    while (fringe.length > 0) {
        const cell: Cell = popNearestCell(fringe)
        if (cell.distance === 0) {
            return cell.initialDirection
        }

        const key = toAlpha(cell.col, cell.row)
        const bestLengthSoFar = visitedCells.get(key) ?? 1e9
        if (cell.length < bestLengthSoFar) {
            visitedCells.set(key, cell.length)
        } else {
            // We have already passed here with a shorter path.
            continue
        }
        const neighbours = findNeighbours(level, cell.col, cell.row)
        for (const [col, row] of neighbours) {
            fringe.push({
                col,
                row,
                distance: manhattan(col, row, toX, toY),
                initialDirection: cell.initialDirection,
                length: cell.length + 1,
            })
        }
    }
    return Direction.Stop
}

function findNeighbours(level: Level, col: number, row: number): Neighbour[] {
    const neighbours: Neighbour[] = []
    for (const dir of [
        Direction.Down,
        Direction.Left,
        Direction.Right,
        Direction.Up,
    ]) {
        const vx = DIR_X[dir]
        const vy = DIR_Y[dir]
        const x = col + vx
        const y = row + vy
        if (level.isRoad(x, y)) {
            neighbours.push([x, y, dir])
        }
    }
    return neighbours
}

function manhattan(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function getAllCells(level: Level) {
    const cells: Array<[col: number, row: number]> = []
    for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
            if (level.isRoad(col, row)) cells.push([col, row])
        }
    }
    return cells
}

const DIR_X = [0, 0, 0, 0]
const DIR_Y = [0, 0, 0, 0]
DIR_X[Direction.Right] = 1
DIR_X[Direction.Left] = -1
DIR_Y[Direction.Down] = 1
DIR_Y[Direction.Up] = -1

function popNearestCell(cells: Cell[]): Cell {
    let bestDistance = 1e9
    let bestIndex = 0
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        if (cell.distance < bestDistance) {
            bestIndex = i
            bestDistance = cell.distance
        }
    }
    const [bestCell] = cells.splice(bestIndex, 1)
    return bestCell
}
