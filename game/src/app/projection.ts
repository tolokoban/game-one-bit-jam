export default class Projection {
    private lastWidth = 0
    private lastHeight = 0
    private _scaleX = 1
    private _scaleY = 1

    constructor(private readonly gl: WebGL2RenderingContext) {}

    get scaleX() {
        return this._scaleX
    }
    get scaleY() {
        return this._scaleY
    }
    get width() {
        return this.lastWidth
    }
    get height() {
        return this.lastHeight
    }

    update() {
        const { gl, lastWidth, lastHeight } = this
        const canvas = gl.canvas as HTMLCanvasElement
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (width === lastWidth && height === lastHeight) return false

        this.lastWidth = width
        this.lastHeight = height
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        this._scaleX = width > height ? height / width : 1
        this._scaleY = height > width ? width / height : 1
        return true
    }
}
