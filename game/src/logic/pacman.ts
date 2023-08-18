import Level from "@/levels/level"
import MoveLogic, { Direction } from "./move"
import Input from "@/utils/input"

export default class PacManMoveLogic extends MoveLogic {
    constructor(level: Level, x: number, y: number) {
        super(level, x, y)
        const logic = this
        new Input({
            onLeft() {
                logic.setDirection(Direction.Left)
            },
            onRight() {
                logic.setDirection(Direction.Right)
            },
            onDown() {
                logic.setDirection(Direction.Down)
            },
            onUp() {
                logic.setDirection(Direction.Up)
            },
        })
    }
}
