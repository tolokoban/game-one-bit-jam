import {
    WebGLRenderer as ThreeWebGLRenderer,
    OrthographicCamera as ThreeOrthographicCamera,
    Scene as ThreeScene,
    Mesh as ThreeMesh,
    Vector3 as ThreeVector3,
    ShaderMaterial as ThreeShaderMaterial,
} from "three"

import Vert from "./prepare.vert"
import Frag from "./prepare.frag"
import { loadGLB } from "@/loader/glb"

export async function createParticlesData(
    url: string,
    width: number,
    height: number
): Promise<Float32Array> {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("webgl2")
    if (!context) throw Error("Unable to get WebGL2 context!")

    const renderer = new ThreeWebGLRenderer({ canvas, context })
    const d = 2.5
    const camera = new ThreeOrthographicCamera(-d, +d, +d, -d)
    camera.position.set(100, 100, 100)
    camera.lookAt(new ThreeVector3(0, 0, 0))
    const scene = new ThreeScene()
    const material = makeMaterial()
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
                x * scaleX - 1,
                1 - y * scaleY,
                (1.0 * r) / 255, // Light
                1 / (500 + Math.random() * 1500)
            )
        }
    }
    return new Float32Array(particles)
}

function makeMaterial() {
    return new ThreeShaderMaterial({
        vertexShader: Vert,
        fragmentShader: Frag,
    })
}
