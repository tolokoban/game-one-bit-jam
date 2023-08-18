import Level from "@/levels/level"
import MoveLogic, { Direction } from "./move"
import Input from "@/utils/input"

export default class PacManMoveLogic extends MoveLogic {
    constructor(level: Level, x: number, y: number) {
        super(level, x, y)
    }
}
