// Win/lose condition check. TITP-inspired: reach target тушёнка within day limit.

import type { GameGoal, GameStatus } from '../types/game'

export interface GoalResult {
  status: Exclude<GameStatus, 'playing'>
}

/**
 * Check if the current state has met the win condition (tushonka >= target)
 * or the lose condition (dayCounter > dayLimit).
 *
 * Win is checked first — even on the last allowed day, hitting the target
 * is a victory. The lose check is strict greater-than, so dayLimit is the
 * last day you can play.
 */
export function checkWinLose(
  tushonka: number,
  dayCounter: number,
  goal: GameGoal,
): GoalResult | null {
  if (tushonka >= goal.target) {
    return { status: 'won' }
  }
  if (dayCounter > goal.dayLimit) {
    return { status: 'lost' }
  }
  return null
}
