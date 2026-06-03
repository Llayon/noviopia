import { getGeneral } from '../data/generals'
import { useGameStore } from '../store/gameStore'
import { MAX_LOYALTY, RANK_MULTIPLIERS } from '../types/game'

export default function HUD() {
  const resources = useGameStore((s) => s.resources)
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const contracts = useGameStore((s) => s.contracts)
  const dayCounter = useGameStore((s) => s.dayCounter)
  const ownedCount = Object.values(ownedGenerals).filter((o) => o.isOwned).length
  const totalCount = Object.keys(ownedGenerals).length

  const income = Object.entries(ownedGenerals).reduce((acc, [id, owned]) => {
    if (!owned.isOwned) return acc
    const g = getGeneral(id)
    if (!g) return acc
    const rankMult = RANK_MULTIPLIERS[owned.rankIndex] ?? 1
    const loyaltyMult = owned.loyalty / MAX_LOYALTY

    const isBusy = contracts.some((c) => !c.completed && c.generalIds.includes(id))
    const mult = isBusy ? 0.25 : 1

    return acc + g.incomePerSec * rankMult * loyaltyMult * owned.level * mult
  }, 0)

  const activeCount = contracts.filter((c) => !c.completed).length

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
      <div className="hud-item hud-day">
        <span className="hud-day-label">День</span>
        <span className="hud-day-value">{dayCounter}</span>
      </div>
      <div className="hud-item hud-income">
        <span>+{income.toFixed(1)}/с</span>
      </div>
      <div className="hud-item">
        <span className="hud-collection">
          {ownedCount}/{totalCount}
        </span>
      </div>
      {activeCount > 0 && (
        <div className="hud-item">
          <span className="hud-contracts">📋{activeCount}</span>
        </div>
      )}
    </div>
  )
}
