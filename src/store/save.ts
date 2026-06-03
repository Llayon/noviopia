import { GameState } from '../types/game'

const SAVE_KEY = 'noviopia-save'

export function saveGame(state: GameState): void {
  try {
    const data = JSON.stringify({
      resources: state.resources,
      ownedGenerals: state.ownedGenerals,
      unlockedGenerals: state.unlockedGenerals,
      lastSaveTimestamp: Date.now(),
      totalPlayTime: state.totalPlayTime,
      generalsOrder: state.generalsOrder,
    })
    localStorage.setItem(SAVE_KEY, data)
  } catch {
    console.warn('Failed to save game')
  }
}

export function loadSave(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<GameState>
  } catch {
    return null
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
