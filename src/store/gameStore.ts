import { create } from 'zustand'
import {
  GameState,
  OwnedGeneral,
  ActiveContract,
  RANK_MULTIPLIERS,
  MAX_LOYALTY,
  DAY_LENGTH_SEC,
  DayReport,
} from '../types/game'
import allGenerals, { getGeneral } from '../data/generals'
import { saveGame, loadSave, clearSave } from './save'
import { generateRandomEvent, contractFailEvent, getDayEvent } from '../game/events'
import contracts, { getContract } from '../data/contracts'

let contractIdCounter = 0

function getInitialGenerals(): Record<string, OwnedGeneral> {
  const result: Record<string, OwnedGeneral> = {}
  allGenerals.forEach((g) => {
    result[g.id] = {
      generalId: g.id,
      level: 1,
      rankIndex: 0,
      loyalty: MAX_LOYALTY,
      isOwned: false,
      isActive: false,
    }
  })
  result['prokladov'] = { ...result['prokladov'], isOwned: true, isActive: true }
  return result
}

function calcIncome(
  ownedGenerals: Record<string, OwnedGeneral>,
  activeContracts: ActiveContract[],
): number {
  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).map((c) => c.generalId),
  )

  let total = 0
  for (const entry of Object.values(ownedGenerals)) {
    if (!entry.isOwned) continue
    const g = getGeneral(entry.generalId)
    if (!g) continue
    const rankMult = RANK_MULTIPLIERS[entry.rankIndex] ?? 1
    const loyaltyMult = entry.loyalty / MAX_LOYALTY

    if (busyGenerals.has(entry.generalId)) {
      total += g.incomePerSec * rankMult * loyaltyMult * entry.level * 0.25
    } else {
      total += g.incomePerSec * rankMult * loyaltyMult * entry.level
    }
  }
  return total
}

function calcSuccessChance(generalId: string, contractId: string): number {
  const g = getGeneral(generalId)
  const c = getContract(contractId)
  if (!g || !c) return 0

  const stats: Record<string, number> = {
    theft: g.stats.theft,
    speed: g.stats.speed,
    stealth: g.stats.stealth,
    loyalty: g.stats.loyalty,
  }

  let score = 0
  let required = 0
  let count = 0

  for (const [stat, val] of Object.entries(c.requiredStats)) {
    required += val as number
    score += stats[stat] ?? 0
    count++
  }

  if (count === 0) return 0.9

  const ratio = count > 0 ? score / required : 1
  const costMult = 1 + (g.cost / 500) * 0.3
  return Math.min(0.95, ratio * costMult * 0.15)
}

export const useGameStore = create<GameState>()((set, get) => {
  const saved = loadSave()

  const baseGenerals = getInitialGenerals()
  const baseUnlocked: string[] = ['prokladov']
  const baseResources = { tushonka: 30, medals: 0 }
  const baseOrder = allGenerals.map((g) => g.id)

  let initialOwned = saved?.ownedGenerals ?? baseGenerals
  let initialUnlocked = saved?.unlockedGenerals ?? baseUnlocked
  let initialResources = saved?.resources ?? baseResources
  const initialTimestamp = saved?.lastSaveTimestamp ?? Date.now()
  const initialPlayTime = saved?.totalPlayTime ?? 0
  let initialOrder = saved?.generalsOrder ?? baseOrder
  const initialContracts = saved?.contracts ?? ([] as ActiveContract[])

  const hasAnyOwned = Object.values(initialOwned).some((o) => o.isOwned)
  if (saved && !hasAnyOwned) {
    initialOwned = baseGenerals
    initialUnlocked = baseUnlocked
    initialResources = baseResources
    initialOrder = baseOrder
  }

  return {
    resources: initialResources,
    ownedGenerals: initialOwned,
    unlockedGenerals: initialUnlocked,
    activeEvent: null,
    lastSaveTimestamp: initialTimestamp,
    totalPlayTime: initialPlayTime,
    generalsOrder: initialOrder,
    contracts: initialContracts,

    dayCounter: saved?.dayCounter ?? 1,
    dayTimer: saved?.dayTimer ?? 0,
    dayStartTushonka: saved?.dayStartTushonka ?? initialResources.tushonka,
    dayContractsCompleted: saved?.dayContractsCompleted ?? 0,
    dayContractsFailed: saved?.dayContractsFailed ?? 0,
    dailyReport: null,

    dismissReport: () => {
      set({ dailyReport: null })
    },

    buyGeneral: (id: string) => {
      const state = get()
      const general = getGeneral(id)
      if (!general) return false
      if (state.resources.tushonka < general.cost) return false
      const owned = state.ownedGenerals[id]
      if (!owned || owned.isOwned) return false

      const newGenerals = { ...state.ownedGenerals }
      const hasAny = Object.values(state.ownedGenerals).some((o) => o.isOwned)
      newGenerals[id] = {
        ...owned,
        isOwned: true,
        isActive: !hasAny,
      }

      set({
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - general.cost) * 100) / 100,
        },
        ownedGenerals: newGenerals,
        unlockedGenerals: [...state.unlockedGenerals, id],
      })
      return true
    },

    feedGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return false

      const feedCost = 10 + owned.level * 5
      if (state.resources.tushonka < feedCost) return false

      const newGenerals = { ...state.ownedGenerals }
      const newLoyalty = Math.min(MAX_LOYALTY, owned.loyalty + Math.floor(20 + owned.level * 0.5))
      newGenerals[id] = { ...owned, loyalty: newLoyalty }

      set({
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - feedCost) * 100) / 100,
        },
        ownedGenerals: newGenerals,
      })
      return true
    },

    upgradeGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return false
      if (owned.rankIndex >= RANK_MULTIPLIERS.length - 1) return false

      const g = getGeneral(id)
      if (!g) return false
      const cost = g.cost * (owned.rankIndex + 1) * 3
      if (state.resources.tushonka < cost) return false

      const newGenerals = { ...state.ownedGenerals }
      newGenerals[id] = { ...owned, rankIndex: owned.rankIndex + 1 }

      set({
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - cost) * 100) / 100,
        },
        ownedGenerals: newGenerals,
      })
      return true
    },

    setActiveGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return

      const newGenerals: Record<string, OwnedGeneral> = {}
      for (const [key, val] of Object.entries(state.ownedGenerals)) {
        newGenerals[key] = { ...val, isActive: false }
      }
      newGenerals[id] = { ...newGenerals[id], isActive: true }
      set({ ownedGenerals: newGenerals })
    },

    tick: (deltaSeconds: number) => {
      const state = get()
      const income = calcIncome(state.ownedGenerals, state.contracts)

      const newGenerals = { ...state.ownedGenerals }
      for (const [id, owned] of Object.entries(state.ownedGenerals)) {
        if (owned.isOwned) {
          newGenerals[id] = {
            ...owned,
            loyalty: Math.max(0, Math.round((owned.loyalty - 0.1 * deltaSeconds) * 100) / 100),
          }
        }
      }

      const now = Date.now()

      const newContracts = state.contracts.map((ac) => {
        if (!ac.completed && now >= ac.endTime) {
          const success = Math.random() < calcSuccessChance(ac.generalId, ac.contractId)
          return { ...ac, completed: true, success }
        }
        return ac
      })

      const newlyCompleted = newContracts.filter(
        (ac, i) => ac.completed && !state.contracts[i].completed,
      )
      const newSuccesses = newlyCompleted.filter((ac) => ac.success).length
      const newFailures = newlyCompleted.filter((ac) => !ac.success).length

      const newDayTimer = state.dayTimer + deltaSeconds
      let dayTimer = newDayTimer
      let dayCounter = state.dayCounter
      let dayContractsCompleted = state.dayContractsCompleted + newSuccesses
      let dayContractsFailed = state.dayContractsFailed + newFailures
      let dailyReport: DayReport | null = null
      let dayStartTushonka = state.dayStartTushonka

      if (newDayTimer >= DAY_LENGTH_SEC) {
        dayCounter = state.dayCounter + 1
        dayTimer = 0
        dailyReport = {
          tushonkaEarned: Math.round((state.resources.tushonka - state.dayStartTushonka) * 100) / 100,
          contractsCompleted: dayContractsCompleted,
          contractsFailed: dayContractsFailed,
          eventsHandled: 0,
          dayNumber: state.dayCounter,
        }
        dayContractsCompleted = 0
        dayContractsFailed = 0
        dayStartTushonka = state.resources.tushonka + income * deltaSeconds
      }

      set({
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka + income * deltaSeconds) * 100) / 100,
        },
        ownedGenerals: newGenerals,
        totalPlayTime: state.totalPlayTime + deltaSeconds,
        contracts: newContracts,
        dayCounter,
        dayTimer,
        dailyReport,
        dayContractsCompleted,
        dayContractsFailed,
        dayStartTushonka,
      })

      saveGame(get())

      if (dailyReport) {
        const dayEvent = getDayEvent(dayCounter)
        if (dayEvent) {
          get().triggerEvent(dayEvent)
        }
      }
    },

    resolveEvent: (choiceIndex: number) => {
      const state = get()
      const event = state.activeEvent
      if (!event) return

      const choice = event.choices[choiceIndex]
      if (!choice) {
        set({ activeEvent: null })
        return
      }

      const newResources = { ...state.resources }

      if (choice.tushonkaCost) newResources.tushonka -= choice.tushonkaCost
      if (choice.medalsCost) newResources.medals -= choice.medalsCost
      if (choice.tushonkaReward) newResources.tushonka += choice.tushonkaReward
      if (choice.medalsReward) newResources.medals += choice.medalsReward
      if (newResources.tushonka < 0) newResources.tushonka = 0
      if (newResources.medals < 0) newResources.medals = 0

      if (choice.loyaltyChange) {
        const activeEntry = Object.entries(state.ownedGenerals).find(([, v]) => v.isOwned && v.isActive)
        if (activeEntry) {
          const [id, o] = activeEntry
          const newGenerals = { ...state.ownedGenerals }
          newGenerals[id] = {
            ...o,
            loyalty: Math.min(MAX_LOYALTY, Math.max(0, o.loyalty + choice.loyaltyChange)),
          }
          set({ resources: newResources, ownedGenerals: newGenerals, activeEvent: null })
          return
        }
      }

      set({ resources: newResources, activeEvent: null })
    },

    triggerEvent: (customEvent?) => {
      const state = get()
      if (state.activeEvent) return

      const event = customEvent ?? generateRandomEvent()
      if (event) {
        set({ activeEvent: event })
      }
    },

    startContract: (contractId: string, generalId: string) => {
      const state = get()
      const owned = state.ownedGenerals[generalId]
      if (!owned || !owned.isOwned) return false

      const c = getContract(contractId)
      if (!c) return false

      const alreadyOnContract = state.contracts.some(
        (ac) => ac.generalId === generalId && !ac.completed,
      )
      if (alreadyOnContract) return false

      contractIdCounter++
      const now = Date.now()

      const newContract: ActiveContract = {
        id: `ac_${contractIdCounter}`,
        contractId,
        generalId,
        startTime: now,
        endTime: now + c.durationSec * 1000,
        completed: false,
        success: false,
      }

      set({ contracts: [...state.contracts, newContract] })
      return true
    },

    claimContract: (activeId: string) => {
      const state = get()
      const idx = state.contracts.findIndex((ac) => ac.id === activeId)
      if (idx === -1) return

      const ac = state.contracts[idx]
      if (!ac.completed) return

      const c = getContract(ac.contractId)
      if (!c) return

      const newContracts = [...state.contracts]
      newContracts.splice(idx, 1)

      if (ac.success) {
        set({
          resources: {
            ...state.resources,
            tushonka: Math.round((state.resources.tushonka + c.reward) * 100) / 100,
          },
          contracts: newContracts,
        })
      } else {
        const failEvent = contractFailEvent(c, getGeneral(ac.generalId))
        set({
          contracts: newContracts,
          activeEvent: failEvent,
        })
      }
    },

    reset: () => {
      clearSave()
      const resetGenerals = getInitialGenerals()
      resetGenerals['prokladov'] = {
        ...resetGenerals['prokladov'],
        isOwned: true,
        isActive: true,
      }
      set({
        resources: { tushonka: 30, medals: 0 },
        ownedGenerals: resetGenerals,
        unlockedGenerals: ['prokladov'],
        activeEvent: null,
        lastSaveTimestamp: Date.now(),
        totalPlayTime: 0,
        generalsOrder: allGenerals.map((g) => g.id),
        contracts: [],
        dayCounter: 1,
        dayTimer: 0,
        dayStartTushonka: 30,
        dayContractsCompleted: 0,
        dayContractsFailed: 0,
        dailyReport: null,
      })
    },
  }
})
