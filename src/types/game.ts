// Game types — hand-written runtime types only.
// Domain types (Contract, General, GameEvent, EventChoice, GeneralStats) are
// defined in `./data/derived.ts` (next to data files) and re-exported here for
// backward compatibility with existing imports.

import type { Contract, EventChoice, GameEvent, General, GeneralStats } from '../data/derived'

export type { Contract, EventChoice, GameEvent, General, GeneralStats }

// ─── Enums (source of truth for rarity / rank values) ───

export interface ActiveContract {
  completed: boolean
  contractId: string
  endTime: number
  generalIds: string[]
  id: string
  midEventTriggered: boolean
  startTime: number
  success: boolean
}

export interface DayReport {
  contractsCompleted: number
  contractsFailed: number
  dayNumber: number
  eventsHandled: number
  generalsDied: string[]
  salariesPaid: number
  tushonkaEarned: number
}

// ─── Win/Lose (TITP-inspired 90-day goal) ───

export interface GameGoal {
  dayLimit: number
  target: number
}

export interface GameResources {
  medals: number
  tushonka: number
}

// ─── Runtime State (Zustand, not derived from data) ───

export interface GameState {
  activeEvent: GameEvent | null
  buyGeneral: (id: string) => boolean
  claimContract: (activeId: string) => void
  contracts: ActiveContract[]
  dailyReport: DayReport | null
  dayContractsCompleted: number
  dayContractsFailed: number
  dayCounter: number
  dayStartTushonka: number

  dayTimer: number
  dismissReport: () => void
  dismissToast: (toastId: string) => void
  dispatchToLiveEvent: (eventId: string, generalIds: string[]) => boolean
  feedGeneral: (id: string) => boolean
  gameStatus: GameStatus
  generalsOrder: string[]
  goal: GameGoal
  kgbAttention: number
  lastSaveTimestamp: number
  liveEvents: LiveEvent[]
  pressAttention: number

  openToastAsEvent: (toastId: string) => void
  ownedGenerals: Record<string, OwnedGeneral>
  reset: () => void
  resolveEvent: (choiceIndex: number) => void
  resources: GameResources
  setActiveGeneral: (id: string) => void
  startContract: (contractId: string, generalIds: string[]) => boolean
  tick: (deltaSeconds: number) => void
  toasts: ToastMessage[]
  totalPlayTime: number
  triggerEvent: (customEvent?: GameEvent) => void

  unlockedGenerals: string[]
  upgradeGeneral: (id: string) => boolean
}

export type GameStatus = 'lost' | 'playing' | 'won'

export interface LiveEvent {
  description: string
  districtId: string
  id: string
  maxGenerals: number
  penalty: number
  position: [number, number]
  remainingSec: number
  reward: number
  severity: LiveEventSeverity
  title: string
}

export type LiveEventSeverity = 'critical' | 'high' | 'low' | 'medium'

export interface OwnedGeneral {
  generalId: string
  isActive: boolean
  isOwned: boolean
  level: number
  loyalty: number
  rankIndex: number
  stress: number
  stressOverloadSec: number
}

export type Rank = 'general' | 'leytenant' | 'marshal' | 'polkovnik' | 'praporshik'

export type Rarity = 'common' | 'epic' | 'legendary' | 'rare'

export interface ToastMessage {
  contractId: string
  event: GameEvent
  id: string
}

// ─── Display Constants (hand-maintained) ───

export const RANK_NAMES: Record<Rank, string> = {
  general: 'Генерал-майор',
  leytenant: 'Лейтенант',
  marshal: 'Маршал',
  polkovnik: 'Полковник',
  praporshik: 'Прапорщик',
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#b0bec5',
  epic: '#ab47bc',
  legendary: '#ffa726',
  rare: '#42a5f5',
}

// ─── Game Balance Constants ───

export const RANK_MULTIPLIERS = [1, 1.5, 2.5, 4, 7]
export const MAX_LOYALTY = 100
export const MAX_STRESS = 100
export const STRESS_PER_SEC = 0.15
export const STRESS_DECAY_PER_SEC = 0.08
export const TICK_INTERVAL_MS = 1000
export const DAY_LENGTH_SEC = 90

// ─── Goal / Win-Lose (TITP-inspired: reach X тушёнки in N days) ───

export const GOAL_TARGET_TUSHONKA = 1000
export const GOAL_DAY_LIMIT = 30

// ─── Salary (each owned general eats тушёнка per second) ───

export const SALARY_PER_RARITY: Record<Rarity, number> = {
  common: 0.3,
  epic: 1.2,
  legendary: 2.0,
  rare: 0.6,
}

// ─── Stress death (max stress sustained for N seconds = death) ───

export const STRESS_DEATH_THRESHOLD_SEC = 30
export const LOYALTY_DECAY_PER_SEC = 0.1
export const LOYALTY_DECAY_PENALTY_PER_SEC = 0.5
