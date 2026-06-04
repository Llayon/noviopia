import { create } from 'zustand'

import { getContract, getGeneral } from '../data/derived'
import allGenerals from '../data/generals'
import { calcIncome, calcSalaryPerSec, calcSuccessChance } from '../game/economy'
import { contractFailEvent, getDayEvent } from '../game/events'
import { checkWinLose } from '../game/goal'
import { applyGeneralTick } from '../game/progression'
import {
  ActiveContract,
  DAY_LENGTH_SEC,
  DayReport,
  GameEvent,
  GameState,
  GameStatus,
  GOAL_DAY_LIMIT,
  GOAL_TARGET_TUSHONKA,
  MAX_LOYALTY,
  MAX_STRESS,
  OwnedGeneral,
  RANK_MULTIPLIERS,
  STRESS_DECAY_PER_SEC,
  STRESS_PER_SEC,
} from '../types/game'
import { clearSave, loadSave, saveGame } from './save'

let contractIdCounter = 0

function getInitialGenerals(): Record<string, OwnedGeneral> {
  const result: Record<string, OwnedGeneral> = {}
  allGenerals.forEach((g) => {
    result[g.id] = {
      generalId: g.id,
      isActive: false,
      isOwned: false,
      level: 1,
      loyalty: MAX_LOYALTY,
      rankIndex: 0,
      stress: 0,
      stressOverloadSec: 0,
    }
  })
  result['prokladov'] = { ...result['prokladov'], isActive: true, isOwned: true }
  return result
}

export const useGameStore = create<GameState>()((set, get) => {
  const saved = loadSave()

  const baseGenerals = getInitialGenerals()
  const baseUnlocked: string[] = ['prokladov']
  const baseResources = { medals: 0, tushonka: 30 }
  const baseOrder = allGenerals.map((g) => g.id)
  const baseGoal = { dayLimit: GOAL_DAY_LIMIT, target: GOAL_TARGET_TUSHONKA }

  let initialOwned = saved?.ownedGenerals ?? baseGenerals
  let initialUnlocked = saved?.unlockedGenerals ?? baseUnlocked
  let initialResources = saved?.resources ?? baseResources
  const initialTimestamp = saved?.lastSaveTimestamp ?? Date.now()
  const initialPlayTime = saved?.totalPlayTime ?? 0
  let initialOrder = saved?.generalsOrder ?? baseOrder
  const initialContracts = saved?.contracts ?? ([] as ActiveContract[])
  const initialGoal = saved?.goal ?? baseGoal
  const initialGameStatus: GameStatus = saved?.gameStatus ?? 'playing'

  const hasAnyOwned = Object.values(initialOwned).some((o) => o.isOwned)
  if (saved && !hasAnyOwned) {
    initialOwned = baseGenerals
    initialUnlocked = baseUnlocked
    initialResources = baseResources
    initialOrder = baseOrder
  }

  const ownedWithDefaults: Record<string, OwnedGeneral> = {}
  for (const [id, o] of Object.entries(initialOwned)) {
    ownedWithDefaults[id] = { ...o, stressOverloadSec: o.stressOverloadSec ?? 0 }
  }

  return {
    activeEvent: null,
    buyGeneral: (id: string) => {
      const state = get()
      const general = getGeneral(id)
      if (!general) return false
      if (state.resources.tushonka < general.cost) return false
      const owned = state.ownedGenerals[id]
      if (!owned || owned.isOwned) return false // eslint-disable-line @typescript-eslint/no-unnecessary-condition

      const newGenerals = { ...state.ownedGenerals }
      const hasAny = Object.values(state.ownedGenerals).some((o) => o.isOwned)
      newGenerals[id] = {
        ...owned,
        isActive: !hasAny,
        isOwned: true,
      }

      set({
        ownedGenerals: newGenerals,
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - general.cost) * 100) / 100,
        },
        unlockedGenerals: [...state.unlockedGenerals, id],
      })
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
        const newGenerals = { ...state.ownedGenerals }
        ac.generalIds.forEach((gid) => {
          if (newGenerals[gid]) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
            newGenerals[gid] = {
              ...newGenerals[gid],
              loyalty: Math.min(MAX_LOYALTY, newGenerals[gid].loyalty + 5),
            }
          }
        })
        set({
          contracts: newContracts,
          ownedGenerals: newGenerals,
          resources: {
            ...state.resources,
            tushonka: Math.round((state.resources.tushonka + c.reward) * 100) / 100,
          },
        })
      } else {
        const firstGeneral = getGeneral(ac.generalIds[0])
        const failEvent = contractFailEvent(c, firstGeneral)
        set({
          activeEvent: failEvent,
          contracts: newContracts,
        })
      }
    },
    contracts: initialContracts,
    dailyReport: null,
    dayContractsCompleted: saved?.dayContractsCompleted ?? 0,
    dayContractsFailed: saved?.dayContractsFailed ?? 0,
    dayCounter: saved?.dayCounter ?? 1,
    dayStartTushonka: saved?.dayStartTushonka ?? initialResources.tushonka,

    dayTimer: saved?.dayTimer ?? 0,
    dismissReport: () => {
      set({ dailyReport: null })
    },
    dismissToast: (toastId: string) => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) }))
    },
    feedGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return false // eslint-disable-line @typescript-eslint/no-unnecessary-condition

      const feedCost = 10 + owned.level * 5
      if (state.resources.tushonka < feedCost) return false

      const newGenerals = { ...state.ownedGenerals }
      const newLoyalty = Math.min(MAX_LOYALTY, owned.loyalty + Math.floor(20 + owned.level * 0.5))
      newGenerals[id] = { ...owned, loyalty: newLoyalty }

      set({
        ownedGenerals: newGenerals,
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - feedCost) * 100) / 100,
        },
      })
      return true
    },
    gameStatus: initialGameStatus,
    generalsOrder: initialOrder,
    goal: initialGoal,
    lastSaveTimestamp: initialTimestamp,

    openToastAsEvent: (toastId: string) => {
      const state = get()
      const toast = state.toasts.find((t) => t.id === toastId)
      if (!toast) return
      set({
        activeEvent: toast.event,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      })
    },

    ownedGenerals: ownedWithDefaults,

    reset: () => {
      clearSave()
      const resetGenerals = getInitialGenerals()
      resetGenerals['prokladov'] = {
        ...resetGenerals['prokladov'],
        isActive: true,
        isOwned: true,
        stress: 0,
      }
      set({
        activeEvent: null,
        contracts: [],
        dailyReport: null,
        dayContractsCompleted: 0,
        dayContractsFailed: 0,
        dayCounter: 1,
        dayStartTushonka: 30,
        dayTimer: 0,
        gameStatus: 'playing',
        generalsOrder: allGenerals.map((g) => g.id),
        goal: { dayLimit: GOAL_DAY_LIMIT, target: GOAL_TARGET_TUSHONKA },
        lastSaveTimestamp: Date.now(),
        ownedGenerals: resetGenerals,
        resources: { medals: 0, tushonka: 30 },
        toasts: [],
        totalPlayTime: 0,
        unlockedGenerals: ['prokladov'],
      })
    },

    resolveEvent: (choiceIndex: number) => {
      const state = get()
      const event = state.activeEvent
      if (!event) return

      const choice = event.choices[choiceIndex]
      if (!choice) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
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
          set({ activeEvent: null, ownedGenerals: newGenerals, resources: newResources })
          return
        }
      }

      set({ activeEvent: null, resources: newResources })
    },

    resources: initialResources,

    setActiveGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return // eslint-disable-line @typescript-eslint/no-unnecessary-condition

      const newGenerals: Record<string, OwnedGeneral> = {}
      for (const [key, val] of Object.entries(state.ownedGenerals)) {
        newGenerals[key] = { ...val, isActive: false }
      }
      newGenerals[id] = { ...newGenerals[id], isActive: true }
      set({ ownedGenerals: newGenerals })
    },

    startContract: (contractId: string, generalIds: string[]) => {
      const state = get()
      if (generalIds.length === 0) return false
      if (state.gameStatus !== 'playing') return false

      const c = getContract(contractId)
      if (!c) return false

      if (generalIds.length > c.maxGenerals) return false
      if (c.exactFit && generalIds.length !== c.maxGenerals) return false

      const busyGenerals = new Set(
        state.contracts.filter((ac) => !ac.completed).flatMap((ac) => ac.generalIds),
      )

      const allAvailable = generalIds.every(
        (gid) => state.ownedGenerals[gid]?.isOwned && !busyGenerals.has(gid), // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      )
      if (!allAvailable) return false

      contractIdCounter++
      const now = Date.now()

      const newContract: ActiveContract = {
        completed: false,
        contractId,
        endTime: now + c.durationSec * 1000,
        generalIds,
        id: `ac_${contractIdCounter}`,
        midEventTriggered: false,
        startTime: now,
        success: false,
      }

      set({ contracts: [...state.contracts, newContract] })
      return true
    },

    tick: (deltaSeconds: number) => {
      const state = get()
      if (state.gameStatus !== 'playing') return

      const busyGenerals = new Set(
        state.contracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
      )

      const salary = calcSalaryPerSec(state.ownedGenerals)
      const canPaySalary = state.resources.tushonka > 0

      const newGenerals: Record<string, OwnedGeneral> = { ...state.ownedGenerals }
      const diedNames: string[] = []
      for (const [id, owned] of Object.entries(state.ownedGenerals)) {
        if (!owned.isOwned) continue
        const result = applyGeneralTick(owned, busyGenerals.has(id), canPaySalary, deltaSeconds)
        if (result.died) {
          const g = getGeneral(id)
          if (g) diedNames.push(g.name)
          newGenerals[id] = { ...result.next, isActive: false, isOwned: false }
        } else {
          newGenerals[id] = result.next
        }
      }

      const hasActive = Object.values(newGenerals).some((o) => o.isOwned && o.isActive)
      if (!hasActive) {
        for (const [id, o] of Object.entries(newGenerals)) {
          if (o.isOwned) {
            newGenerals[id] = { ...o, isActive: true }
            break
          }
        }
      }

      const income = calcIncome(newGenerals, state.contracts)
      const netDelta = (income - salary) * deltaSeconds

      const now = Date.now()

      const newContracts = state.contracts.map((ac) => {
        if (!ac.completed && now >= ac.endTime) {
          const success = Math.random() < calcSuccessChance(ac.generalIds, ac.contractId, newGenerals)
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
        const tushonkaEndOfDay = Math.max(0, state.resources.tushonka + netDelta)
        const salariesPaid = Math.round(salary * deltaSeconds * 100) / 100
        dailyReport = {
          contractsCompleted: dayContractsCompleted,
          contractsFailed: dayContractsFailed,
          dayNumber: state.dayCounter,
          eventsHandled: 0,
          generalsDied: diedNames,
          salariesPaid,
          tushonkaEarned: Math.round((tushonkaEndOfDay - state.dayStartTushonka) * 100) / 100,
        }
        dayContractsCompleted = 0
        dayContractsFailed = 0
        dayStartTushonka = tushonkaEndOfDay
      }

      const nowMs = Date.now()
      const newToasts = [...state.toasts]
      const contractsWithMid = newContracts.map((ac) => {
        if (ac.completed || ac.midEventTriggered) return ac
        const c = getContract(ac.contractId)
        if (!c?.midEvents?.length) return ac
        const elapsed = nowMs - ac.startTime
        const total = ac.endTime - ac.startTime
        const progress = total > 0 ? elapsed / total : 0
        if (progress >= 0.3 && progress <= 0.7) {
          newToasts.push({
            contractId: ac.contractId,
            event: c.midEvents[0],
            id: `toast_${ac.id}`,
          })
          return { ...ac, midEventTriggered: true }
        }
        return ac
      })

      const newTushonka = Math.max(0, state.resources.tushonka + netDelta)
      const goalResult = checkWinLose(newTushonka, dayCounter, state.goal)
      const newGameStatus: GameStatus = goalResult?.status ?? 'playing'

      set({
        contracts: contractsWithMid,
        dailyReport,
        dayContractsCompleted,
        dayContractsFailed,
        dayCounter,
        dayStartTushonka,
        dayTimer,
        gameStatus: newGameStatus,
        ownedGenerals: newGenerals,
        resources: {
          ...state.resources,
          tushonka: Math.round(newTushonka * 100) / 100,
        },
        toasts: newToasts,
        totalPlayTime: state.totalPlayTime + deltaSeconds,
      })

      saveGame(get())

      if (dailyReport && newGameStatus === 'playing') {
        const dayEvent = getDayEvent(dayCounter)
        if (dayEvent) {
          get().triggerEvent(dayEvent)
        }
      }
    },

    toasts: [],

    totalPlayTime: initialPlayTime,

    triggerEvent: (customEvent?: GameEvent) => {
      const state = get()
      if (state.activeEvent) return
      if (state.gameStatus !== 'playing') return
      if (!customEvent) return
      set({ activeEvent: customEvent })
    },

    unlockedGenerals: initialUnlocked,

    upgradeGeneral: (id: string) => {
      const state = get()
      const owned = state.ownedGenerals[id]
      if (!owned || !owned.isOwned) return false // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      if (owned.rankIndex >= RANK_MULTIPLIERS.length - 1) return false

      const g = getGeneral(id)
      if (!g) return false
      const cost = g.cost * (owned.rankIndex + 1) * 3
      if (state.resources.tushonka < cost) return false

      const newGenerals = { ...state.ownedGenerals }
      newGenerals[id] = { ...owned, rankIndex: owned.rankIndex + 1 }

      set({
        ownedGenerals: newGenerals,
        resources: {
          ...state.resources,
          tushonka: Math.round((state.resources.tushonka - cost) * 100) / 100,
        },
      })
      return true
    },
  }
})

export { MAX_STRESS, STRESS_DECAY_PER_SEC, STRESS_PER_SEC }
