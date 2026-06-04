import type { OwnedGeneral } from '../types/game'

import allGenerals from '../data/generals'
import { MAX_LOYALTY } from '../types/game'

export function getInitialGenerals(): Record<string, OwnedGeneral> {
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
  ;['prokladov', 'schetchikov', 'dachnik'].forEach((id, i) => {
    result[id] = { ...result[id], isActive: i === 0, isOwned: true }
  })
  return result
}
