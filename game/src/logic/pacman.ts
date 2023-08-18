import Level from "@/levels/level"
import MoveLogic, { Direction } from "./move"
import { clamp } from "@/utils/clamp"
import { musicRate, musicVolume } from "@/utils/music"

export default class PacManMoveLogic extends MoveLogic {
    constructor(level: Level, x: number, y: number) {
        super(level, x, y)
    }

    update(delay: number): void {
        super.update(delay)
        let speed = this.speed
        if (this.getDirection() === Direction.Stop) {
            // Decrease speed.
            speed -= delay * 4e-6
        } else {
            // Increase speed.
            speed += delay * 1e-6
        }
        const MIN = 2e-3
        const MAX = 7e-3
        this.speed = clamp(speed, MIN, MAX)
        const factor = (speed - MIN) / (MAX - MIN)
        musicRate(0.7 + factor * 0.5)
        musicVolume(0.4 + factor * 0.2)
    }
}
