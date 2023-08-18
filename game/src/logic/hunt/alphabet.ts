const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function fromAlpha(alpha: string): number {
    return ALPHABET.indexOf(alpha)
}

export function toAlpha(...values: number[]): string {
    return values.map(value => ALPHABET.charAt(value)).join("")
}
