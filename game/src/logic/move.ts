import { DirectionalLight } from "three"
import Level from "../levels/level"
import DebugMove from "./debug-move"

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
    private readonly debugger: DebugMove

    public x = 0
    public y = 0
    public speed = 1e-3

    constructor(private readonly level: Level, x: number, y: number) {
        this.debugger = new DebugMove(level)
        this.x = x
        this.y = y
        this.currentDir = Direction.Stop
        this.nextDir = Direction.Stop
    }

    setDirection(nextDirection: Direction) {
        this.nextDir = nextDirection
        if (
            this.currentDir === Direction.Stop &&
            nextDirection !== Direction.Stop
        ) {
            console.log("Start moving?", this.x, this.y)
            if (this.canWalkOn(this.x, this.y, nextDirection)) {
                this.currentDir = this.nextDir
            }
        }
    }

    /**
     * @param delay Number of msec from previous call.
     */
    update(delay: number) {
        const { x, y, speed, currentDir, nextDir } = this
        this.debugger.update(x, y)
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
            console.log("Pivot:", pivotX, pivotY)
            if (nextDir !== currentDir) {
                // We just passed the center of a cell.
                // We try to change direction if no wall interfers.
                const targetCol = pivotX + DIRECTIONS_X[nextDir]
                const targetRow = pivotY + DIRECTIONS_Y[nextDir]
                console.log("Trying to go there:", targetCol, targetRow)
                if (this.canWalkOn(targetCol, targetRow)) {
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
            if (!this.canWalkOn(nextCol, nextRow)) {
                this.currentDir = Direction.Stop
                this.x = pivotX
                this.y = pivotY
                console.log("Hit a wall!", pivotX, pivotY)
            }
        }
        // Keep moving.
        this.x = nextX
        this.y = nextY
    }

    canWalkOn(x: number, y: number, direction: Direction = Direction.Stop) {
        const dx = DIRECTIONS_X[direction]
        const dy = DIRECTIONS_Y[direction]
        return this.level.isRoad(x + dx, y + dy)
    }
}
