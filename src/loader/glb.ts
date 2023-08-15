import { Mesh as ThreeMesh, BufferGeometry as ThreeBufferGeometry } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"

export async function loadGLB(
    path: string,
    computeNormals = false
): Promise<ThreeMesh[]> {
    const draco = new DRACOLoader()
    draco.setDecoderPath("./draco/")
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)
    const obj = await loader.loadAsync(path)
    const meshes: ThreeMesh[] = []
    obj.scene.traverseVisible(obj => {
        if (obj instanceof ThreeMesh) {
            if (obj.isMesh) {
                const geometry = obj.geometry as ThreeBufferGeometry
                if (computeNormals) geometry.computeVertexNormals()
                meshes.push(obj as ThreeMesh)
            }
        }
    })
    return meshes
}
