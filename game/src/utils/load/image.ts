export class TgdLoadImage {
    /**
     * Try to load an image and return `null` in case of failure.
     * @param url URL of the image to load.
     */
    static async load(url: string): Promise<HTMLImageElement | null> {
        return new Promise(resolve => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = url
        })
    }

    static async loadInCanvas(url: string): Promise<HTMLCanvasElement | null> {
        const img = await TgdLoadImage.load(url)
        if (!img) return null

        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) throw Error("Unable to get a 2D context!")

        ctx.drawImage(img, 0, 0)
        return canvas
    }
}
