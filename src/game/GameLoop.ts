import { useGameStore } from '../store/gameStore'
import { TICK_INTERVAL_MS } from '../types/game'

let intervalId: null | ReturnType<typeof setInterval> = null

export function isGameLoopRunning(): boolean {
  return intervalId !== null
}

export function startGameLoop(): void {
  if (intervalId) return

  intervalId = setInterval(() => {
    const state = useGameStore.getState()
    if (state.dailyReport) return
    state.tick(TICK_INTERVAL_MS / 1000)
  }, TICK_INTERVAL_MS)
}

export function stopGameLoop(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
