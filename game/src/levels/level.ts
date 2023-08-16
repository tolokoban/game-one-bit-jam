export default class Level {
    public readonly cols
    public readonly rows

    constructor(private readonly data: number[][]) {
        const [firstRow] = data
        if (!firstRow) throw Error("Invalid level data!")

        this.rows = data.length
        this.cols = firstRow.length
    }

    log(x = -1, y = -1) {
        const { data } = this
        let color = "#0f0"
        const text = `%cCol: ${x}, Row: ${y}\n${data
            .map((items, row) =>
                items
                    .map((value, col) => {
                        if (col === Math.floor(x) && row === Math.floor(y)) {
                            if (value === 1) color = "#0f0"
                            else color = "#f00"
                            return "%c▉%c"
                        }
                        return value === 1 ? "▉" : " "
                    })
                    .join("")
            )
            .join("\n")}`
        console.log(
            text,
            "font-family:monospace;background:#000,color:#ddd",
            `color:${color}`,
            "color:#ddd"
        )
    }

    isRoad(x: number, y: number): boolean {
        const { cols, rows, data } = this
        const col = Math.floor(0.5 + x)
        const row = Math.floor(0.5 + y)
        if (col < 0 || col >= cols || row < 0 || row >= rows) return false

        const value = data[row][col]
        return value === 1
    }
}

// prettier-ignore
export const LEVEL1 = new Level([
    [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1],
    [1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
    [0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1],
    [0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0],
    [0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0],
    [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1],
    [1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1],
    [1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
    [0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0],
    [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
])
