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
export interface Contract {
  description: string
  durationSec: number
  exactFit?: boolean
  id: string
  maxGenerals: number
  midEvents?: GameEvent[]
  name: string
  requiredStats: Partial<GeneralStats>
  reward: number
  risk: number
}

export interface EventChoice {
  description: string
  label: string
  loyaltyChange?: number
  medalsCost?: number
  medalsReward?: number
  tushonkaCost?: number
  tushonkaReward?: number
}

export interface GameEvent {
  choices: EventChoice[]
  description: string
  duration: number
  id: string
  title: string
  type: 'escape' | 'inspection' | 'promotion' | 'scandal' | 'testimony'
}

export interface GameResources {
  medals: number
  tushonka: number
}

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
  feedGeneral: (id: string) => boolean
  generalsOrder: string[]
  lastSaveTimestamp: number

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

export interface General {
  cost: number
  description: string
  id: string
  incomePerSec: number
  name: string
  rank: Rank
  rarity: Rarity
  stats: GeneralStats
}

export interface GeneralStats {
  loyalty: number
  speed: number
  stealth: number
  theft: number
}

export interface OwnedGeneral {
  generalId: string
  isActive: boolean
  isOwned: boolean
  level: number
  loyalty: number
  rankIndex: number
  stress: number
}

export type Rank = 'general' | 'leytenant' | 'marshal' | 'polkovnik' | 'praporshik'

export type Rarity = 'common' | 'epic' | 'legendary' | 'rare'

export interface ToastMessage {
  contractId: string
  event: GameEvent
  id: string
}

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

export const RANK_MULTIPLIERS = [1, 1.5, 2.5, 4, 7]
export const MAX_LOYALTY = 100
export const MAX_STRESS = 100
export const STRESS_PER_SEC = 0.15
export const STRESS_DECAY_PER_SEC = 0.08
export const TICK_INTERVAL_MS = 1000
export const DAY_LENGTH_SEC = 90

export interface DayReport {
  contractsCompleted: number
  contractsFailed: number
  dayNumber: number
  eventsHandled: number
  tushonkaEarned: number
}
