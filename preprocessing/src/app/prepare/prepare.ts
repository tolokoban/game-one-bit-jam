import {
    WebGLRenderer as ThreeWebGLRenderer,
    OrthographicCamera as ThreeOrthographicCamera,
    Scene as ThreeScene,
    Vector3 as ThreeVector3,
    ShaderMaterial as ThreeShaderMaterial,
} from "three"

import Vert from "./prepare.vert"
import Frag from "./prepare.frag"
import { loadGLB } from "@/loader/glb"

export interface ParticlesOptions {
    meshName: string
    resolution: number
    distance: number
}

export async function createParticlesData({
    meshName,
    resolution,
    distance,
}: ParticlesOptions): Promise<{
    data: Float32Array
    url: string
}> {
    const canvas = document.createElement("canvas")
    canvas.width = resolution
    canvas.height = resolution
    const context = canvas.getContext("webgl2")
    if (!context) throw Error("Unable to get WebGL2 context!")

    const renderer = new ThreeWebGLRenderer({ canvas, context })
    const camera = new ThreeOrthographicCamera(
        -distance,
        +distance,
        +distance,
        -distance
    )
    camera.position.set(distance * 3, distance * 3, -distance * 3)
    camera.lookAt(new ThreeVector3(0, 0, 0))
    const scene = new ThreeScene()
    const material = makeMaterial()
    const url = `./mesh/${meshName}.glb`
    for (const mesh of await loadGLB(url)) {
        mesh.material = material
        scene.add(mesh)
    }
    renderer.render(scene, camera)
    const canvas2 = document.createElement("canvas")
    canvas2.width = canvas.width
    canvas2.height = canvas.height
    const ctx = canvas2.getContext("2d")
    if (!ctx) throw Error("Unable to get 2D context!")

    ctx.drawImage(canvas, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let ptr = 0
    const particles: number[] = []
    const scaleX = 2 / imageData.width
    const scaleY = 2 / imageData.height
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const r = imageData.data[ptr]
            ptr += 4
            if (r < 1) continue

            particles.push(
                x * scaleX - 1 + Math.random() * scaleX,
                1 - y * scaleY + Math.random() * scaleY,
                (1.0 * r) / 255, // Light
                1 / (500 + Math.random() * 1500)
            )
        }
    }
    return {
        data: shuffle(new Float32Array(particles)),
        url: canvas2.toDataURL(),
    }
}

function shuffle(data: Float32Array): Float32Array {
    for (let k = 0; k < data.length; k += 4) {
        const i = ((Math.random() * data.length) >> 2) << 2
        for (let e = 0; e < 4; e++) {
            const tmp = data[i + e]
            data[i + e] = data[k + e]
            data[k + e] = tmp
        }
    }
    return data
}

function makeMaterial() {
    return new ThreeShaderMaterial({
        vertexShader: Vert,
        fragmentShader: Frag,
    })
}
