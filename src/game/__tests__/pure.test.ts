import { describe, expect, it } from 'vitest'

import type { ActiveContract, OwnedGeneral } from '../../types/game'

import contracts from '../../data/contracts'
import allGenerals from '../../data/generals'
import { MAX_LOYALTY, MAX_STRESS, RANK_MULTIPLIERS } from '../../types/game'

function calcIncome(
  ownedGenerals: Record<string, OwnedGeneral>,
  activeContracts: ActiveContract[],
): number {
  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )
  let total = 0
  for (const entry of Object.values(ownedGenerals)) {
    if (!entry.isOwned) continue
    const g = allGenerals.find((g) => g.id === entry.generalId)
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

function makeOwned(overrides: { generalId: string } & Partial<OwnedGeneral>): OwnedGeneral {
  return {
    isActive: false,
    isOwned: true,
    level: 1,
    loyalty: MAX_LOYALTY,
    rankIndex: 0,
    stress: 0,
    ...overrides,
  }
}

describe('calcIncome', () => {
  it('returns 0 with no owned generals', () => {
    expect(calcIncome({}, [])).toBe(0)
  })

  it('returns 0 for unowned generals', () => {
    const gens = {
      prokladov: { ...makeOwned({ generalId: 'prokladov' }), isOwned: false },
    }
    expect(calcIncome(gens, [])).toBe(0)
  })

  it('calculates income for a single idle general', () => {
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const gens = { prokladov: makeOwned({ generalId: 'prokladov' }) }
    const expected = g.incomePerSec * 1 * 1 * 1 * 1
    expect(calcIncome(gens, [])).toBeCloseTo(expected, 5)
  })

  it('applies rank multiplier', () => {
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const gens = { prokladov: makeOwned({ generalId: 'prokladov', rankIndex: 1 }) }
    const expected = g.incomePerSec * RANK_MULTIPLIERS[1] * 1 * 1 * 1
    expect(calcIncome(gens, [])).toBeCloseTo(expected, 5)
  })

  it('applies loyalty reduction', () => {
    const gens = { prokladov: makeOwned({ generalId: 'prokladov', loyalty: 50 }) }
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const expected = g.incomePerSec * 1 * (50 / MAX_LOYALTY) * 1 * 1
    expect(calcIncome(gens, [])).toBeCloseTo(expected, 5)
  })

  it('reduces income to 25% while on contract', () => {
    const gens = { prokladov: makeOwned({ generalId: 'prokladov' }) }
    const contracts: ActiveContract[] = [
      {
        completed: false, contractId: 'contract_1', endTime: 99999,
        generalIds: ['prokladov'], id: 'ac_test', midEventTriggered: false, startTime: 0, success: false,
      },
    ]
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const expected = g.incomePerSec * 1 * 1 * 1 * 0.25
    expect(calcIncome(gens, contracts)).toBeCloseTo(expected, 5)
  })

  it('applies stress penalty at 50 stress (25% reduction)', () => {
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const gens = { prokladov: makeOwned({ generalId: 'prokladov', stress: 50 }) }
    const expected = g.incomePerSec * 1 * 1 * 1 * (1 - (50 / MAX_STRESS) * 0.5)
    expect(calcIncome(gens, [])).toBeCloseTo(expected, 5)
  })

  it('does not count completed contracts as busy', () => {
    const gens = { prokladov: makeOwned({ generalId: 'prokladov' }) }
    const contracts: ActiveContract[] = [
      {
        completed: true, contractId: 'contract_1', endTime: 0,
        generalIds: ['prokladov'], id: 'ac_test', midEventTriggered: true, startTime: 0, success: true,
      },
    ]
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const expected = g.incomePerSec * 1 * 1 * 1 * 1
    expect(calcIncome(gens, contracts)).toBeCloseTo(expected, 5)
  })

  it('returns deterministic results (no Math.random dependency)', () => {
    const gens = {
      prokladov: makeOwned({ generalId: 'prokladov' }),
      test_gen: makeOwned({ generalId: 'test_gen_1' }),
    }
    const r1 = calcIncome(gens, [])
    const r2 = calcIncome(gens, [])
    expect(r1).toBe(r2)
  })
})

describe('contract data integrity', () => {
  it('every contract has unique id', () => {
    const ids = contracts.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every contract has maxGenerals between 1 and 6', () => {
    for (const c of contracts) {
      expect(c.maxGenerals).toBeGreaterThanOrEqual(1)
      expect(c.maxGenerals).toBeLessThanOrEqual(6)
    }
  })

  it('every midEvent has valid choices', () => {
    for (const c of contracts) {
      for (const ev of c.midEvents ?? []) {
        expect(ev.choices.length).toBeGreaterThan(0)
        for (const ch of ev.choices) {
          expect(typeof ch.label).toBe('string')
          expect(ch.label.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
