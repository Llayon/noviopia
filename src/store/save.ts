import { GameState } from '../types/game'
import { SaveDataSchema } from './schema'

const SAVE_KEY = 'noviopia-save'

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

export function loadSave(): null | Partial<GameState> {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    const result = SaveDataSchema.safeParse(parsed)
    if (!result.success) {
      console.warn('Save data validation failed, clearing:', result.error.issues)
      clearSave()
      return null
    }
    return result.data
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  try {
    const data = JSON.stringify({
      dayContractsCompleted: state.dayContractsCompleted,
      dayContractsFailed: state.dayContractsFailed,
      dayCounter: state.dayCounter,
      dayStartTushonka: state.dayStartTushonka,
      dayTimer: state.dayTimer,
      gameStatus: state.gameStatus,
      generalsOrder: state.generalsOrder,
      goal: state.goal,
      kgbAttention: state.kgbAttention,
      lastSaveTimestamp: Date.now(),
      ownedGenerals: state.ownedGenerals,
      pressAttention: state.pressAttention,
      resources: state.resources,
      totalPlayTime: state.totalPlayTime,
      unlockedGenerals: state.unlockedGenerals,
    })
    localStorage.setItem(SAVE_KEY, data)
  } catch {
    console.warn('Failed to save game')
  }
}
