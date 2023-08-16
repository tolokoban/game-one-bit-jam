import { LEVEL1, logLevel } from "../levels/level"

export enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    Stop = 4,
}

const DIRECTIONS_X = [0, 0, -1, 1, 0]
const DIRECTIONS_Y = [-1, 1, 0, 0, 0]

export default class MoveLogic {
    private currentDir: Direction
    private nextDir: Direction
    private readonly levelCols: number
    private readonly levelRows: number

    public x = 0
    public y = 0
    public speed = 1e-3

    constructor(private readonly level: number[][], x: number, y: number) {
        this.x = x
        this.y = y
        this.levelCols = level[0].length
        this.levelRows = level.length
        this.currentDir = Direction.Stop
        this.nextDir = Direction.Stop
    }

    setDirection(nextDirection: Direction) {
        this.nextDir = nextDirection
        if (this.currentDir === Direction.Stop) {
            this.currentDir = this.nextDir
            console.log(this.nextDir.toString())
        }
    }

    /**
     * @param delay Number of msec from previous call.
     */
    update(delay: number) {
        const { x, y, speed, currentDir, nextDir } = this
        const nextX = x + DIRECTIONS_X[currentDir] * speed * delay
        const nextY = y + DIRECTIONS_Y[currentDir] * speed * delay
        const pivotX = Math.floor(0.5 + (x + nextX) / 2)
        const pivotY = Math.floor(0.5 + (y + nextY) / 2)
        const x1 = x - pivotX
        const y1 = y - pivotY
        const x2 = nextX - pivotX
        const y2 = nextY - pivotY
        const proj = x1 * x2 + y1 * y2
        if (proj < 0) {
            if (nextDir !== currentDir) {
                // We just passed the center of a cell.
                // We try to change direction if no wall interfers.
                const targetCol = pivotX + DIRECTIONS_X[nextDir]
                const targetRow = pivotY + DIRECTIONS_Y[nextDir]
                console.log("Trying to go there:", targetCol, targetRow)
                if (this.isRoad(targetCol, targetRow)) {
                    this.currentDir = nextDir
                    const len = Math.max(Math.abs(x2), Math.abs(y2))
                    this.x = pivotX + len * DIRECTIONS_X[nextDir]
                    this.y = pivotY + len * DIRECTIONS_Y[nextDir]
                    return
                }
            }
            // Check if there is a road ahead.
            const nextCol = pivotX + DIRECTIONS_X[currentDir]
            const nextRow = pivotY + DIRECTIONS_Y[currentDir]
            if (!this.isRoad(nextCol, nextRow)) {
                this.currentDir = Direction.Stop
                this.x = pivotX
                this.y = pivotY
                console.log("Hit a wall!", pivotX, pivotY)
                logLevel(LEVEL1, pivotX, pivotY)
            }
        }
        // Keep moving.
        this.x = nextX
        this.y = nextY
    }

    isRoad(x: number, y: number) {
        const col = Math.floor(x)
        if (col < 0 || col >= this.levelCols) return false

        const row = Math.floor(y)
        if (row < 0 || row >= this.levelRows) return false

        const cell = this.level[row][col]
        return cell === 1
    }
}
