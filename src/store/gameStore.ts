import { create } from 'zustand'
import {
  GameState,
  OwnedGeneral,
  RANK_MULTIPLIERS,
  MAX_LOYALTY,
} from '../types/game'
import allGenerals, { getGeneral } from '../data/generals'
import { saveGame, loadSave, clearSave } from './save'
import { generateRandomEvent } from '../game/events'

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
  return result
}

function calcIncome(
  ownedGenerals: Record<string, OwnedGeneral>,
): number {
  let total = 0
  for (const entry of Object.values(ownedGenerals)) {
    if (!entry.isOwned) continue
    const g = getGeneral(entry.generalId)
    if (!g) continue
    const rankMult = RANK_MULTIPLIERS[entry.rankIndex] ?? 1
    const loyaltyMult = entry.loyalty / MAX_LOYALTY
    total += g.incomePerSec * rankMult * loyaltyMult * entry.level
  }
  return total
}

export const useGameStore = create<GameState>()((set, get) => {
  const saved = loadSave()

  const baseGenerals = getInitialGenerals()
  baseGenerals['prokladov'] = {
    ...baseGenerals['prokladov'],
    isOwned: true,
    isActive: true,
  }
  const baseUnlocked: string[] = ['prokladov']
  const baseResources = { tushonka: 30, medals: 0 }
  const baseOrder = allGenerals.map((g) => g.id)

  let initialOwned = saved?.ownedGenerals ?? baseGenerals
  let initialUnlocked = saved?.unlockedGenerals ?? baseUnlocked
  let initialResources = saved?.resources ?? baseResources
  const initialTimestamp = saved?.lastSaveTimestamp ?? Date.now()
  const initialPlayTime = saved?.totalPlayTime ?? 0
  let initialOrder = saved?.generalsOrder ?? baseOrder

  // Migration: if no generals owned, give starter general
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
      const income = calcIncome(state.ownedGenerals)

      const newGenerals = { ...state.ownedGenerals }
      for (const [id, owned] of Object.entries(state.ownedGenerals)) {
        if (owned.isOwned) {
          newGenerals[id] = {
            ...owned,
            loyalty: Math.max(0, Math.round((owned.loyalty - 0.1 * deltaSeconds) * 100) / 100),
          }
        }
      }

      set({
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka + income * deltaSeconds) * 100) / 100,
        },
        ownedGenerals: newGenerals,
        totalPlayTime: state.totalPlayTime + deltaSeconds,
      })

      saveGame(get())
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

    triggerEvent: () => {
      const state = get()
      if (state.activeEvent) return

      const event = generateRandomEvent()
      if (event) {
        set({ activeEvent: event })
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
      })
    },
  }
})
