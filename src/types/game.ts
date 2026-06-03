export type Rank = 'praporshik' | 'leytenant' | 'polkovnik' | 'general' | 'marshal'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface GeneralStats {
  theft: number
  speed: number
  stealth: number
  loyalty: number
}

export interface General {
  id: string
  name: string
  rank: Rank
  rarity: Rarity
  description: string
  stats: GeneralStats
  incomePerSec: number
  cost: number
}

export interface OwnedGeneral {
  generalId: string
  level: number
  rankIndex: number
  loyalty: number
  isOwned: boolean
  isActive: boolean
}

export interface GameResources {
  tushonka: number
  medals: number
}

export interface Contract {
  id: string
  name: string
  description: string
  durationSec: number
  reward: number
  risk: number
  requiredStats: Partial<GeneralStats>
}

export interface ActiveContract {
  id: string
  contractId: string
  generalId: string
  startTime: number
  endTime: number
  completed: boolean
  success: boolean
}

export interface GameEvent {
  id: string
  title: string
  description: string
  type: 'inspection' | 'escape' | 'testimony' | 'promotion' | 'scandal'
  choices: EventChoice[]
  duration: number
}

export interface EventChoice {
  label: string
  description: string
  tushonkaCost?: number
  medalsCost?: number
  tushonkaReward?: number
  medalsReward?: number
  loyaltyChange?: number
}

export interface GameState {
  resources: GameResources
  ownedGenerals: Record<string, OwnedGeneral>
  unlockedGenerals: string[]
  activeEvent: GameEvent | null
  lastSaveTimestamp: number
  totalPlayTime: number
  generalsOrder: string[]
  contracts: ActiveContract[]

  dayCounter: number
  dayTimer: number
  dailyReport: DayReport | null
  dayStartTushonka: number
  dayContractsCompleted: number
  dayContractsFailed: number

  buyGeneral: (id: string) => boolean
  feedGeneral: (id: string) => boolean
  upgradeGeneral: (id: string) => boolean
  setActiveGeneral: (id: string) => void
  tick: (deltaSeconds: number) => void
  resolveEvent: (choiceIndex: number) => void
  triggerEvent: (customEvent?: GameEvent) => void
  reset: () => void
  dismissReport: () => void

  startContract: (contractId: string, generalId: string) => boolean
  claimContract: (activeId: string) => void
}

export const RANK_NAMES: Record<Rank, string> = {
  praporshik: 'Прапорщик',
  leytenant: 'Лейтенант',
  polkovnik: 'Полковник',
  general: 'Генерал-майор',
  marshal: 'Маршал',
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#b0bec5',
  rare: '#42a5f5',
  epic: '#ab47bc',
  legendary: '#ffa726',
}

export const RANK_MULTIPLIERS = [1, 1.5, 2.5, 4, 7]
export const MAX_LOYALTY = 100
export const TICK_INTERVAL_MS = 1000
export const DAY_LENGTH_SEC = 90

export interface DayReport {
  tushonkaEarned: number
  contractsCompleted: number
  contractsFailed: number
  eventsHandled: number
  dayNumber: number
}
