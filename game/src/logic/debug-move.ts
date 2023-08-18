import Level from "@/levels/level"

export default class DebugMove {
    private lastCol = -1
    private lastRow = -1

    constructor(private readonly level: Level) {}

    update(x: number, y: number) {
        const col = Math.floor(0.5 + x)
        const row = Math.floor(0.5 + y)
        if (col === this.lastCol && row === this.lastRow) return

        this.lastCol = col
        this.lastRow = row
        this.level.debug(col, row)
    }
}
