type Color = [red: number, green: number, blue: number]

const COLOR_DARK: Color = [0, 0, 0]
const COLOR_LIGHT: Color = [0.8, 0.7, 0.5]

class ThemeClass {
    private back = COLOR_LIGHT
    private front = COLOR_DARK

    constructor() {
        this.update()
    }

    get backR() {
        return this.back[0]
    }
    get backG() {
        return this.back[1]
    }
    get backB() {
        return this.back[2]
    }

    get frontR() {
        return this.front[0]
    }
    get frontG() {
        return this.front[1]
    }
    get frontB() {
        return this.front[2]
    }

    toggle() {
        const tmp = this.back
        this.back = this.front
        this.front = tmp
        this.update()
    }

    setDark() {
        this.back = COLOR_DARK
        this.front = COLOR_LIGHT
        this.update()
    }

    setLight() {
        this.back = COLOR_LIGHT
        this.front = COLOR_DARK
        this.update()
    }

    getHexaColorFront(opacity = 1): string {
        return this.getHexaColor(this.front, opacity)
    }

    getHexaColorBack(opacity = 1): string {
        return this.getHexaColor(this.back, opacity)
    }

    private getHexaColor([R, G, B]: Color, opacity: number) {
        return `#${hex(R)}${hex(G)}${hex(B)}${hex(opacity)}`
    }

    private update() {
        document.body.style.setProperty(
            `--theme-color-front`,
            this.getHexaColorFront()
        )
        document.body.style.setProperty(
            `--theme-color-back`,
            this.getHexaColorBack()
        )
        for (let opacity = 10; opacity < 100; opacity += 10) {
            document.body.style.setProperty(
                `--theme-color-front-${opacity}`,
                this.getHexaColorFront(opacity * 0.01)
            )
            document.body.style.setProperty(
                `--theme-color-back-${opacity}`,
                this.getHexaColorBack(opacity * 0.01)
            )
        }
    }
}

/**
 * @param value Color value between 0 and 1
 * @returns The two-digit hexa value.
 */
function hex(value: number) {
    const text = Math.floor(255 * value).toString(16)
    return text.length > 1 ? text : `0${text}`
}

export const Theme = new ThemeClass()
