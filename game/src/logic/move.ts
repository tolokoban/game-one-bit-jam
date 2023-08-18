import { DirectionalLight } from "three"
import Level from "../levels/level"
import DebugMove from "./debug-move"

type Vector2 = [x: number, y: number]

export enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    Stop = 4,
    Continue,
}

export type PivotHandler = (x: number, y: number) => Direction

const DIRECTIONS_X = [0, 0, -1, 1, 0]
const DIRECTIONS_Y = [-1, 1, 0, 0, 0]

export default class MoveLogic {
    private currentDir: Direction
    private nextDir: Direction
    private readonly debugger: DebugMove

    public x = 0
    public y = 0
    public speed = 3e-3

    constructor(
        private readonly level: Level,
        x: number,
        y: number,
        private readonly pivotHandler?: PivotHandler
    ) {
        this.debugger = new DebugMove(level)
        this.x = x
        this.y = y
        this.currentDir = Direction.Stop
        this.nextDir = Direction.Stop
        if (pivotHandler) {
            this.setDirection(pivotHandler(x, y))
        }
    }

    setDirection(nextDirection: Direction) {
        this.nextDir = nextDirection
        if (
            this.currentDir === Direction.Stop &&
            nextDirection !== Direction.Stop
        ) {
            if (this.canWalkOn(this.x, this.y, nextDirection)) {
                this.currentDir = this.nextDir
            }
            return
        }
        if (areOppositeDirections(this.currentDir, nextDirection)) {
            // We don't need to wait for a pivot to turn 180°.
            this.currentDir = nextDirection
            return
        }
    }

    getDirection(): Direction {
        return this.currentDir
    }

    /**
     * @param delay Number of msec from previous call.
     */
    update(delay: number) {
        this.privateUpdate(delay, this.pivotHandler)
    }

    private privateUpdate(delay: number, pivotHandler?: PivotHandler) {
        const { x, y, speed, currentDir, nextDir } = this
        // this.debugger.update(x, y)
        const [pivotX, pivotY] = getCellCenter(x, y)
        const nextX = x + DIRECTIONS_X[currentDir] * speed * delay
        const nextY = y + DIRECTIONS_Y[currentDir] * speed * delay
        if (areInOrder([x, y], [pivotX, pivotY], [nextX, nextY])) {
            if (pivotHandler) {
                // Anytime we get to the center of a cell,
                // we can decide to change direction according
                // to an external function: pivotHandler.
                const newDirection = pivotHandler(pivotX, pivotY)
                if (newDirection !== Direction.Continue) {
                    this.setDirection(newDirection)
                    this.privateUpdate(delay)
                    return
                }
            }
            if (nextDir !== currentDir) {
                // We just passed the center of a cell.
                // We try to change direction if no wall interfers.
                if (this.canWalkOn(pivotX, pivotY, nextDir)) {
                    this.currentDir = nextDir
                    const len = Math.max(
                        Math.abs(nextX - pivotX),
                        Math.abs(nextY - pivotY)
                    )
                    this.x = pivotX + len * DIRECTIONS_X[nextDir]
                    this.y = pivotY + len * DIRECTIONS_Y[nextDir]
                    return
                }
            }
            // Check if there is a road ahead.
            if (!this.canWalkOn(pivotX, pivotY, currentDir)) {
                this.currentDir = Direction.Stop
                this.x = pivotX
                this.y = pivotY
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

/**
 * Return the center of the cell in which (x,y) is.
 */
function getCellCenter(x: number, y: number): [x: number, y: number] {
    return [Math.round(x), Math.round(y)]
}

/**
 * Return `true` if M is between A and B.
 */
function areInOrder([xA, yA]: Vector2, [xM, yM]: Vector2, [xB, yB]: Vector2) {
    return xA === xB ? (yA - yM) * (yB - yM) < 0 : (xA - xM) * (xB - xM) < 0
}

function areOppositeDirections(dir1: Direction, dir2: Direction): boolean {
    return (
        (dir1 === Direction.Down && dir2 === Direction.Up) ||
        (dir1 === Direction.Left && dir2 === Direction.Right) ||
        (dir1 === Direction.Right && dir2 === Direction.Left) ||
        (dir1 === Direction.Up && dir2 === Direction.Down)
    )
}
