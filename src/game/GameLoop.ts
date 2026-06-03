import { useGameStore } from '../store/gameStore'
import { TICK_INTERVAL_MS } from '../types/game'

let intervalId: ReturnType<typeof setInterval> | null = null
let eventIntervalId: ReturnType<typeof setInterval> | null = null

export function startGameLoop(): void {
  if (intervalId) return

  intervalId = setInterval(() => {
    const state = useGameStore.getState()
    state.tick(TICK_INTERVAL_MS / 1000)
  }, TICK_INTERVAL_MS)

  eventIntervalId = setInterval(() => {
    const state = useGameStore.getState()
    if (Math.random() < 0.3) {
      state.triggerEvent()
    }
  }, 15000)
}

export function stopGameLoop(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (eventIntervalId) {
    clearInterval(eventIntervalId)
    eventIntervalId = null
  }
}

export function isGameLoopRunning(): boolean {
  return intervalId !== null
}
