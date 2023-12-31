import Level from "@/levels/level"
import MoveLogic, { PivotHandler } from "./move"
import Hunt from "./hunt/hunt"
import { onKey } from "@/utils/events"

export interface PositionProvider {
    x: number
    y: number
}

export default class MonsterMoveLogic extends MoveLogic {
    constructor(
        level: Level,
        x: number,
        y: number,
        target: PositionProvider,
        speed: number
    ) {
        super(level, x, y, makePivotHandler(level, target))
        this.speed = speed * 1e-3
    }

    update(delay: number): void {
        super.update(delay)
    }
}

function makePivotHandler(
    level: Level,
    target: PositionProvider
): PivotHandler {
    const hunt = new Hunt(level)
    return (col: number, row: number) => {
        const dir = hunt.getDirection(col, row, target.x, target.y)
        return dir
    }
}
