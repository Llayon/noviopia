// Per-tick general progression: stress, loyalty, stress-death check.
// Extracted from gameStore for testability and to keep the store under
// the 500-line limit.

import type { OwnedGeneral } from '../types/game'

import {
  LOYALTY_DECAY_PENALTY_PER_SEC,
  LOYALTY_DECAY_PER_SEC,
  MAX_STRESS,
  STRESS_DEATH_THRESHOLD_SEC,
  STRESS_DECAY_PER_SEC,
  STRESS_PER_SEC,
} from '../types/game'

export interface ProgressionResult {
  died: boolean
  next: OwnedGeneral
}

/**
 * Apply one tick of stress + loyalty progression to a general.
 * - stress grows when busy, decays when idle
 * - loyalty decays every tick; decays faster when salary is unpaid
 * - stressOverloadSec accumulates while stress >= MAX_STRESS; reaching
 *   STRESS_DEATH_THRESHOLD_SEC triggers death
 */
export function applyGeneralTick(
  owned: OwnedGeneral,
  isBusy: boolean,
  canPaySalary: boolean,
  deltaSec: number,
): ProgressionResult {
  const stressDelta = isBusy ? STRESS_PER_SEC : -STRESS_DECAY_PER_SEC
  const newStress = clamp(owned.stress + stressDelta * deltaSec, 0, MAX_STRESS)
  const atMaxStress = newStress >= MAX_STRESS
  const newOverload = atMaxStress
    ? owned.stressOverloadSec + deltaSec
    : 0

  const loyaltyDelta = canPaySalary
    ? LOYALTY_DECAY_PER_SEC
    : LOYALTY_DECAY_PENALTY_PER_SEC
  const newLoyalty = clamp(owned.loyalty - loyaltyDelta * deltaSec, 0, 100)

  const died = newOverload >= STRESS_DEATH_THRESHOLD_SEC

  return {
    died,
    next: {
      ...owned,
      loyalty: round2(newLoyalty),
      stress: round2(newStress),
      stressOverloadSec: died ? 0 : round2(newOverload),
    },
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
