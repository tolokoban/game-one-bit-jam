import saveAs from "save-as-file"
import { ParticlesOptions, createParticlesData } from "./app/prepare"
import "./index.css"

const OPTIONS: Array<ParticlesOptions> = [
    {
        meshName: "level1",
        resolution: 1,
        distance: 15,
    },
    {
        meshName: "pacman",
        resolution: 0.1,
        distance: 2,
    },
]

async function start() {
    const splash = get("splash-screen")
    splash.classList.add("vanish")
    window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
    const res = (screen.availWidth + screen.availHeight) * 1
    const grid = get("grid")
    for (const options of OPTIONS) {
        const container = document.createElement("div")
        container.textContent = `Loading ${options.meshName}...`
        grid.appendChild(container)
        const { data, url } = await createParticlesData({
            ...options,
            resolution: options.resolution * res,
        })
        console.log("🚀 [index] data = ", data) // @FIXME: Remove this line written on 2023-08-16 at 09:53
        const img = new Image()
        img.width = 640
        img.height = 640
        img.src = url
        img.onclick = () => {
            const content = new Blob([data])
            saveAs(content, `${options.meshName}.att`)
        }
        img.title = `Number of particles: ${data.length >> 2}`
        container.replaceWith(img)
    }
}

function get(id: string): HTMLElement {
    const elem = document.getElementById(id)
    if (!elem) throw Error(`No element with id "${id}"!`)

    return elem
}

start()
