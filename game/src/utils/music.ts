import { clamp } from "./clamp"
import { getElement } from "./dom"

const music = getElement("#music") as HTMLAudioElement

export function musicStart() {
    music.volume = 0.5
    music.play()
    music.playbackRate = 0.8
}

export function musicStop() {
    music.pause()
}

export function musicRate(rate: number) {
    music.playbackRate = clamp(rate, 0.8, 1.2)
}
