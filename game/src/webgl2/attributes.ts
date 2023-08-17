export interface TgdTypeAttribute {
    type: "float"
    dimension: number
}

export type TgdTypeAttributesDefinitions = {
    [key: string]: Partial<TgdTypeAttribute> | number
}

interface AttributeInternalRepresentation {
    dimension: number
    divisor: number
    bytesPerElement: number
    getter(view: DataView, byteOffset: number): number
    setter(view: DataView, byteOffset: number, value: number): void
}

interface AttributesInternalRepresentations {
    [attribName: string]: AttributeInternalRepresentation
}

export class TgdAttributes<T extends TgdTypeAttributesDefinitions> {
    public readonly stride: number
    private buffer: ArrayBuffer | undefined = undefined
    private readonly data: { [key: string]: ArrayBufferLike } = {}
    private readonly definitions: AttributesInternalRepresentations

    constructor(def: T, public readonly divisor = 0) {
        let stride = 0
        const data: { [key: string]: ArrayBuffer } = {}
        const definitions: AttributesInternalRepresentations = {}
        for (const key of Object.keys(def)) {
            data[key] = new ArrayBuffer(0)
            const dataDef = makeAttributeInternalRepresentation(
                def[key],
                divisor
            )
            definitions[key] = dataDef
            stride += dataDef.bytesPerElement * dataDef.dimension
        }
        this.data = data
        this.definitions = definitions
        this.stride = stride
    }

    /**
     * @return List of the names of the attributes.
     */
    getNames(): (keyof T)[] {
        return Object.keys(this.definitions)
    }

    getDefinitions(): TgdTypeAttributesDefinitions {
        return structuredClone(this.definitions) as TgdTypeAttributesDefinitions
    }

    getAttribDef(
        attribName: keyof T
    ): AttributeInternalRepresentation | undefined {
        const def = this.definitions[attribName as string]
        return def
            ? (structuredClone(def) as AttributeInternalRepresentation)
            : undefined
    }

    getGlslType(attribName: keyof T) {
        const name = attribName as string
        const def = this.definitions[name]
        if (!def) return `/* "${name}" not found! */`

        switch (def.dimension) {
            case 1:
                return "float"
            case 2:
                return "vec2"
            case 3:
                return "vec3"
            case 4:
                return "vec4"
            default:
                return `/* Don't know how to deal with dimension ${def.dimension}! */`
        }
    }

    get(verticesCount: number): ArrayBuffer {
        const byteLength = this.stride * verticesCount
        if (!this.buffer || this.buffer.byteLength < byteLength) {
            this.checkIfWeHaveEnoughData(verticesCount)
            this.buffer = new ArrayBuffer(byteLength)
            const viewDestination = new DataView(this.buffer)
            let offsetDestination = 0
            const { data, definitions } = this
            for (let vertex = 0; vertex < verticesCount; vertex++) {
                for (const key of Object.keys(definitions)) {
                    const def = definitions[key]
                    const buff: ArrayBufferLike = data[key]
                    const viewSource = new DataView(buff)
                    let offsetSource =
                        def.bytesPerElement * def.dimension * vertex
                    for (let dim = 0; dim < def.dimension; dim++) {
                        def.setter(
                            viewDestination,
                            offsetDestination,
                            def.getter(viewSource, offsetSource)
                        )
                        offsetSource += def.bytesPerElement
                        offsetDestination += def.bytesPerElement
                    }
                }
            }
        }
        return this.buffer
    }

    update(
        gl: WebGL2RenderingContext,
        buffer: WebGLBuffer,
        verticesCount: number,
        dynamic: boolean
    ) {
        const data = this.get(verticesCount)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            data,
            dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        )
        return data
    }

    define(gl: WebGL2RenderingContext, prg: WebGLProgram, buff?: WebGLBuffer) {
        if (buff) gl.bindBuffer(gl.ARRAY_BUFFER, buff)
        let offsetDestination = 0
        const { definitions } = this
        for (const name of Object.keys(definitions)) {
            const def = definitions[name]
            const att = gl.getAttribLocation(prg, name)
            if (att < 0) {
                throw Error(makeNotFoundAttributeError(name, gl, prg))
            }
            gl.enableVertexAttribArray(att)
            gl.vertexAttribPointer(
                att,
                def.dimension,
                gl.FLOAT,
                false,
                this.stride,
                offsetDestination
            )
            gl.vertexAttribDivisor(att, def.divisor)
            const bytes = def.dimension * def.bytesPerElement
            offsetDestination += bytes
        }
    }

    set(attribName: keyof T, value: ArrayBuffer) {
        if (isObject(value) && value.buffer instanceof ArrayBuffer) {
            value = value.buffer
        }
        this.data[attribName as string] = value
        this.buffer = undefined
    }

    private checkIfWeHaveEnoughData(verticesCount: number) {
        const { data, definitions } = this
        for (const key of Object.keys(definitions)) {
            const buff = data[key]
            if (!buff) {
                throw Error(
                    `No data has been set for attribute "${key}"!\nPlease use something like this:\n    data.set("${key}", new Float32Array([4, 3]))`
                )
            }
            const def = definitions[key]
            const byteLength =
                def.bytesPerElement * def.dimension * verticesCount
            if (buff.byteLength < byteLength) {
                throw Error(
                    `Attribute "${key}" has only ${buff.byteLength} bytes, but we need at least ${byteLength}!`
                )
            }
        }
    }
}

function makeAttributeInternalRepresentation(
    attribute: Partial<TgdTypeAttribute> | number,
    divisor: number
): AttributeInternalRepresentation {
    const dataDef: TgdTypeAttribute =
        typeof attribute === "number"
            ? {
                  dimension: attribute,
                  type: "float",
              }
            : {
                  type: "float",
                  dimension: 1,
                  ...attribute,
              }

    switch (dataDef.type) {
        case "float":
            return makeDataDefinitionFloat(dataDef, divisor)
        default:
            throw Error(
                `Unable to create a Data for an attribute of type "${dataDef.type}"!`
            )
    }
}

function makeDataDefinitionFloat(
    dataDef: TgdTypeAttribute,
    divisor: number
): AttributeInternalRepresentation {
    const bytesPerElement = Float32Array.BYTES_PER_ELEMENT
    return {
        dimension: dataDef.dimension,
        divisor,
        bytesPerElement,
        getter(view: DataView, byteOffset: number) {
            return view.getFloat32(byteOffset)
        },
        setter(view: DataView, byteOffset: number, value: number) {
            view.setFloat32(byteOffset, value)
        },
    }
}

function isObject(data: unknown): data is Record<string, unknown> {
    if (!data) return false
    return typeof data === "object"
}

function makeNotFoundAttributeError(
    name: string,
    gl: WebGL2RenderingContext,
    prg: WebGLProgram
): string {
    return `Unable to find atribute "${name}"!`
}
