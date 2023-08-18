import Level from "@/levels/level"
import MoveLogic, { Direction } from "./move"
import Input from "@/utils/input"

export default class DiamondMoveLogic extends MoveLogic {
    constructor(level: Level, x: number, y: number) {
        super(level, x, y)
    }

    toggle() {
        if (this.x === 0) {
            this.x = this.level.cols - 1
            this.y = this.level.rows - 1
        } else {
            this.x = 0
            this.y = 0
        }
    }
}
