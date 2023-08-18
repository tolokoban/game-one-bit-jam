import Level from "@/levels/level"
import MoveLogic, { PivotHandler } from "./move"
import Hunt from "./hunt/hunt"
import { onKey } from "@/utils/events"

interface PositionProvider {
    x: number
    y: number
}

export default class MonsterMoveLogic extends MoveLogic {
    private static pivotHandler: PivotHandler | undefined = undefined

    constructor(
        level: Level,
        x: number,
        y: number,
        target: PositionProvider,
        speed: number
    ) {
        super(level, x, y, MonsterMoveLogic.getPivotHandler(level, target))
        this.speed = speed * 1e-3
    }

    update(delay: number): void {
        super.update(delay)
    }

    /**
     * The pivotHandler is a singleton!
     */
    private static getPivotHandler(level: Level, target: PositionProvider) {
        if (!MonsterMoveLogic.pivotHandler) {
            MonsterMoveLogic.pivotHandler = makePivotHandler(level, target)
        }
        return MonsterMoveLogic.pivotHandler
    }
}

function makePivotHandler(
    level: Level,
    target: PositionProvider
): PivotHandler {
    const hunt = new Hunt(level)
    return (col: number, row: number) =>
        hunt.getDirection(col, row, target.x, target.y)
}
