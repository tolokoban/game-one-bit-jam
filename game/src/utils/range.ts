export function range(size: number): number[] {
    const arr: number[] = new Array(size)
    for (let i = 0; i < size; i++) {
        arr[i] = i
    }
    return arr
}
