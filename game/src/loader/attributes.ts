export async function loadAttributes(name: string): Promise<Float32Array> {
    const resp = await fetch(`./mesh/${name}.att`)
    const buffer = await resp.arrayBuffer()
    return new Float32Array(buffer)
}
