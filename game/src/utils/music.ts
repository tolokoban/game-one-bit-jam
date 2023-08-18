import { clamp } from "./clamp"
import { getElement } from "./dom"

const music = getElement("#music") as HTMLAudioElement

export function musicStart() {
    music.volume = 0.4
    music.playbackRate = 0.8
    music.play()
}

export function musicStop() {
    music.volume = 0.4
    music.playbackRate = 0.8
    music.pause()
}

export function musicRate(rate: number) {
    music.playbackRate = clamp(rate, 0.8, 1.2)
}

export function musicVolume(volume: number) {
    music.volume = clamp(volume, 0.2, 0.8)
}
