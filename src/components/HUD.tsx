import { useGameStore } from '../store/gameStore'
import { getGeneral } from '../data/generals'
import { RANK_MULTIPLIERS, MAX_LOYALTY } from '../types/game'

export default function HUD() {
  const resources = useGameStore((s) => s.resources)
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const ownedCount = Object.values(ownedGenerals).filter((o) => o.isOwned).length
  const totalCount = Object.keys(ownedGenerals).length

  const income = Object.entries(ownedGenerals).reduce((acc, [id, owned]) => {
    if (!owned.isOwned) return acc
    const g = getGeneral(id)
    if (!g) return acc
    const rankMult = RANK_MULTIPLIERS[owned.rankIndex] ?? 1
    const loyaltyMult = owned.loyalty / MAX_LOYALTY
    return acc + g.incomePerSec * rankMult * loyaltyMult * owned.level
  }, 0)

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-icon">🥫</span>
        <span className="hud-value">{Math.floor(resources.tushonka)}</span>
      </div>
      <div className="hud-item">
        <span className="hud-icon">🏅</span>
        <span className="hud-value">{resources.medals}</span>
      </div>
      <div className="hud-item hud-income">
        <span>+{income.toFixed(1)}/с</span>
      </div>
      <div className="hud-item">
        <span className="hud-collection">
          {ownedCount}/{totalCount}
        </span>
      </div>
    </div>
  )
}
