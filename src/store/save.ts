import { GameState } from '../types/game'
import { SaveDataSchema } from './schema'

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
      dayCounter: state.dayCounter,
      dayTimer: state.dayTimer,
      dayStartTushonka: state.dayStartTushonka,
      dayContractsCompleted: state.dayContractsCompleted,
      dayContractsFailed: state.dayContractsFailed,
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
    const parsed = JSON.parse(raw)
    const result = SaveDataSchema.safeParse(parsed, undefined)
    if (!result.success) {
      console.warn('Save data validation failed, clearing:', result.error.issues)
      clearSave()
      return null
    }
    return result.data as Partial<GameState>
  } catch {
    return null
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
