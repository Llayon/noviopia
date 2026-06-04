import { describe, expect, it } from 'vitest'

import type { ActiveContract, GameGoal, OwnedGeneral } from '../../types/game'

import contracts from '../../data/contracts'
import allGenerals from '../../data/generals'
import { calcIncome, calcSalaryPerSec, calcSuccessChance } from '../../game/economy'
import { checkWinLose } from '../../game/goal'
import { applyGeneralTick } from '../../game/progression'
import { MAX_LOYALTY, MAX_STRESS, RANK_MULTIPLIERS } from '../../types/game'

function makeOwned(overrides: { generalId: string } & Partial<OwnedGeneral>): OwnedGeneral {
  return {
    isActive: false,
    isOwned: true,
    level: 1,
    loyalty: MAX_LOYALTY,
    rankIndex: 0,
    stress: 0,
    stressOverloadSec: 0,
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
    const activeContracts: ActiveContract[] = [
      {
        completed: false, contractId: 'contract_1', endTime: 99999,
        generalIds: ['prokladov'], id: 'ac_test', midEventTriggered: false, startTime: 0, success: false,
      },
    ]
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const expected = g.incomePerSec * 1 * 1 * 1 * 0.25
    expect(calcIncome(gens, activeContracts)).toBeCloseTo(expected, 5)
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
    const activeContracts: ActiveContract[] = [
      {
        completed: true, contractId: 'contract_1', endTime: 0,
        generalIds: ['prokladov'], id: 'ac_test', midEventTriggered: true, startTime: 0, success: true,
      },
    ]
    const g = allGenerals.find((g) => g.id === 'prokladov')
    if (!g) throw new Error('prokladov not found')
    const expected = g.incomePerSec * 1 * 1 * 1 * 1
    expect(calcIncome(gens, activeContracts)).toBeCloseTo(expected, 5)
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

describe('calcSalaryPerSec', () => {
  it('returns 0 with no owned generals', () => {
    expect(calcSalaryPerSec({})).toBe(0)
  })

  it('does not charge salary for unowned generals', () => {
    const gens = {
      prokladov: { ...makeOwned({ generalId: 'prokladov' }), isOwned: false },
    }
    expect(calcSalaryPerSec(gens)).toBe(0)
  })

  it('charges common rarity at base rate × rank multiplier', () => {
    const gens = { prokladov: makeOwned({ generalId: 'prokladov', rankIndex: 0 }) }
    expect(calcSalaryPerSec(gens)).toBeCloseTo(0.3 * 1, 5)
  })

  it('applies rank multiplier to salary', () => {
    const gens = { prokladov: makeOwned({ generalId: 'prokladov', rankIndex: 2 }) }
    expect(calcSalaryPerSec(gens)).toBeCloseTo(0.3 * RANK_MULTIPLIERS[2], 5)
  })

  it('sums salaries for multiple owned generals', () => {
    const gens = {
      prokladov: makeOwned({ generalId: 'prokladov', rankIndex: 0 }),
      schetchikov: makeOwned({ generalId: 'schetchikov', rankIndex: 0 }),
    }
    expect(calcSalaryPerSec(gens)).toBeCloseTo(0.6, 5)
  })
})

describe('calcSuccessChance', () => {
  it('returns 0 for empty general list', () => {
    expect(calcSuccessChance([], 'contract_1', {})).toBe(0)
  })

  it('returns 0 for unknown contract', () => {
    expect(calcSuccessChance(['prokladov'], 'no_such_contract', {})).toBe(0)
  })

  it('returns at most 0.95 even for overpowered team', () => {
    const c = contracts[0]
    if (!c) throw new Error('no contracts')
    const gens: Record<string, OwnedGeneral> = {}
    allGenerals.forEach((g) => {
      gens[g.id] = makeOwned({ generalId: g.id, level: 10, rankIndex: 4 })
    })
    const chance = calcSuccessChance(allGenerals.map((g) => g.id), c.id, gens)
    expect(chance).toBeLessThanOrEqual(0.95)
    expect(chance).toBeGreaterThan(0)
  })
})

describe('applyGeneralTick', () => {
  it('reduces stress when idle', () => {
    const result = applyGeneralTick(makeOwned({ generalId: 'prokladov', stress: 50 }), false, true, 1)
    expect(result.next.stress).toBeLessThan(50)
    expect(result.died).toBe(false)
  })

  it('increases stress when busy', () => {
    const result = applyGeneralTick(makeOwned({ generalId: 'prokladov', stress: 30 }), true, true, 1)
    expect(result.next.stress).toBeGreaterThan(30)
  })

  it('clamps stress at MAX_STRESS', () => {
    const result = applyGeneralTick(makeOwned({ generalId: 'prokladov', stress: 99 }), true, true, 10)
    expect(result.next.stress).toBeLessThanOrEqual(MAX_STRESS)
  })

  it('accumulates stressOverloadSec while at max stress', () => {
    const result = applyGeneralTick(makeOwned({ generalId: 'prokladov', stress: MAX_STRESS, stressOverloadSec: 0 }), true, true, 5)
    expect(result.next.stressOverloadSec).toBe(5)
    expect(result.died).toBe(false)
  })

  it('resets stressOverloadSec when stress drops below max', () => {
    const result = applyGeneralTick(makeOwned({ generalId: 'prokladov', stress: 50, stressOverloadSec: 10 }), false, true, 5)
    expect(result.next.stressOverloadSec).toBe(0)
  })

  it('triggers death when stressOverloadSec reaches threshold', () => {
    const result = applyGeneralTick(
      makeOwned({ generalId: 'prokladov', stress: MAX_STRESS, stressOverloadSec: 25 }),
      true,
      true,
      10,
    )
    expect(result.died).toBe(true)
  })

  it('loyalty decays faster when cannot pay salary', () => {
    const canPay = applyGeneralTick(makeOwned({ generalId: 'prokladov' }), false, true, 10).next.loyalty
    const cantPay = applyGeneralTick(makeOwned({ generalId: 'prokladov' }), false, false, 10).next.loyalty
    expect(cantPay).toBeLessThan(canPay)
  })
})

describe('checkWinLose', () => {
  const goal: GameGoal = { dayLimit: 30, target: 1000 }

  it('returns null when tushonka below target and day within limit', () => {
    expect(checkWinLose(500, 10, goal)).toBeNull()
  })

  it('returns "won" when tushonka reaches target', () => {
    expect(checkWinLose(1000, 5, goal)).toEqual({ status: 'won' })
  })

  it('returns "won" when tushonka exceeds target', () => {
    expect(checkWinLose(1500, 5, goal)).toEqual({ status: 'won' })
  })

  it('returns "lost" when dayCounter exceeds dayLimit', () => {
    expect(checkWinLose(500, 31, goal)).toEqual({ status: 'lost' })
  })

  it('does not return "lost" on the last allowed day', () => {
    expect(checkWinLose(500, 30, goal)).toBeNull()
  })

  it('win takes priority over day limit on the boundary', () => {
    expect(checkWinLose(1000, 31, goal)).toEqual({ status: 'won' })
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
