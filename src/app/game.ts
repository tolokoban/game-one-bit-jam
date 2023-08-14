import {
    WebGLRenderer as ThreeWebGLRenderer,
    OrthographicCamera as ThreeOrthographicCamera,
    Scene as ThreeScene,
    AmbientLight as ThreeAmbientLight,
    DirectionalLight as ThreeDirectionalLight,
    Mesh as ThreeMesh,
    BoxGeometry as ThreeBoxGeometry,
    MeshStandardMaterial as ThreeMeshStandardMaterial,
    MeshPhongMaterial as ThreeMeshPhongMaterial,
    Vector3 as ThreeVector3,
    LinearFilter as ThreeLinearFilter,
    IUniform as ThreeIUniform,
} from "three"
import { RoundedBoxGeometry as ThreeRoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry"
import { EffectComposer as ThreeEffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass as ThreeRenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { ShaderPass as ThreeShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"

import VERT from "./game.vert"
import FRAG from "./game.frag"

interface PassUniforms {
    uniTime: ThreeIUniform<number>
}

export default class Game {
    private readonly canvas: HTMLCanvasElement
    private readonly renderer: ThreeWebGLRenderer
    private readonly camera: ThreeOrthographicCamera
    private readonly scene = new ThreeScene()
    private readonly composer: ThreeEffectComposer
    private readonly uniforms: PassUniforms
    private readonly shaderPass: ThreeShaderPass

    private lastWidth = 0
    private lastHeight = 0

    constructor() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement
        if (!canvas) throw Error('Missing canvas with id "canvas"!')

        this.canvas = canvas
        const context = canvas.getContext("webgl2")
        if (!context) throw Error("Unable to get WebGL2 context!")
        const renderer = new ThreeWebGLRenderer({ canvas, context })
        this.renderer = renderer
        const camera = new ThreeOrthographicCamera()
        camera.position.set(100, 100, 100)
        camera.lookAt(new ThreeVector3(0, 0, 0))
        this.camera = camera
        this.composer = new ThreeEffectComposer(renderer)
        this.composer.addPass(new ThreeRenderPass(this.scene, camera))
        this.shaderPass = new ThreeShaderPass({
            uniforms: {
                uniTime: { value: 1.0 },
                tDiffuse: null,
            },
            vertexShader: VERT,
            fragmentShader: FRAG,
        })
        this.uniforms = this.shaderPass.material
            .uniforms as unknown as PassUniforms
        this.composer.addPass(this.shaderPass)
    }

    async load(): Promise<void> {
        const { scene } = this
        scene.clear()
        const light = new ThreeDirectionalLight(0xffffff, 1)
        light.position.set(1, 1, 1)
        light.lookAt(new ThreeVector3(0, 0, 0))
        const light2 = new ThreeDirectionalLight(0xffffff, 1)
        light2.position.set(0, 1, 0)
        light2.lookAt(new ThreeVector3(0, 0, 0))
        const box = makeBox()
        scene.add(light, light2, box)
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 5; row++) {
                scene.add(makeBox(col, 0, row))
            }
        }
        window.requestAnimationFrame(this.paint)
    }

    private readonly paint = (time: number) => {
        window.requestAnimationFrame(this.paint)

        this.checkSize()
        const { composer, uniforms } = this
        uniforms.uniTime.value = time
        composer.render()
    }

    private checkSize() {
        const { canvas, lastWidth, lastHeight } = this
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (width === lastWidth && height === lastHeight) return

        const { renderer, camera } = this
        this.lastWidth = width
        this.lastHeight = height
        canvas.width = width
        canvas.height = height
        renderer.setSize(width, height, false)
        const ratio = width / height
        const size = 5
        camera.left = -size * ratio
        camera.right = +size * ratio
        camera.top = +size
        camera.bottom = -size
        camera.near = 1
        camera.far = 1000
        camera.updateProjectionMatrix()
    }
}

function makeBox(x = 0, y = 0, z = 0) {
    const geometry = new ThreeRoundedBoxGeometry(1, 1, 1, 8, 0.2)
    const material = new ThreeMeshPhongMaterial({
        color: 0xdddddd,
        specular: 1000,
    })
    const mesh = new ThreeMesh(geometry, material)
    mesh.position.set(x, y, z)
    return mesh
}
