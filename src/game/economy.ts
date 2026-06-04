// Pure economy functions: income, salary, net, success chance.
// Extracted from gameStore so the store stays under the 500-line limit
// and these are independently testable.

import type { ActiveContract, OwnedGeneral } from '../types/game'

import { getContract, getGeneral } from '../data/derived'
import {
  MAX_LOYALTY,
  MAX_STRESS,
  RANK_MULTIPLIERS,
  SALARY_PER_RARITY,
} from '../types/game'

export function calcIncome(
  ownedGenerals: Record<string, OwnedGeneral>,
  activeContracts: ActiveContract[],
): number {
  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )

  let total = 0
  for (const entry of Object.values(ownedGenerals)) {
    if (!entry.isOwned) continue
    const g = getGeneral(entry.generalId)
    if (!g) continue
    const rankMult = RANK_MULTIPLIERS[entry.rankIndex] ?? 1
    const loyaltyMult = entry.loyalty / MAX_LOYALTY
    const stressPenalty = 1 - (entry.stress / MAX_STRESS) * 0.5

    if (busyGenerals.has(entry.generalId)) {
      total += g.incomePerSec * rankMult * loyaltyMult * entry.level * 0.25 * stressPenalty
    } else {
      total += g.incomePerSec * rankMult * loyaltyMult * entry.level * stressPenalty
    }
  }
  return total
}

export function calcSalaryPerSec(ownedGenerals: Record<string, OwnedGeneral>): number {
  let total = 0
  for (const entry of Object.values(ownedGenerals)) {
    if (!entry.isOwned) continue
    const g = getGeneral(entry.generalId)
    if (!g) continue
    const rankMult = RANK_MULTIPLIERS[entry.rankIndex] ?? 1
    total += SALARY_PER_RARITY[g.rarity] * rankMult
  }
  return total
}

export function calcSuccessChance(
  generalIds: string[],
  contractId: string,
  ownedGenerals: Record<string, OwnedGeneral>,
): number {
  const c = getContract(contractId)
  if (!c || generalIds.length === 0) return 0

  const required = Object.values(c.requiredStats).reduce((sum, v) => sum + (v), 0)
  if (required === 0) return 0.9

  let totalScore = 0
  generalIds.forEach((gid, i) => {
    const g = getGeneral(gid)
    const owned = ownedGenerals[gid]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!g || !owned) return

    const statSum = g.stats.theft + g.stats.speed + g.stats.stealth + g.stats.loyalty
    const stressPenalty = 1 - (owned.stress / MAX_STRESS) * 0.3
    const diminishing = 1 / Math.pow(1.5, i)

    totalScore += statSum * stressPenalty * diminishing
  })

  const ratio = totalScore / required
  return Math.min(0.95, ratio * 0.15)
}
