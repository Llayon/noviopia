import { getGeneral } from '../data/derived'
import { useGameStore } from '../store/gameStore'
import { MAX_LOYALTY, RANK_MULTIPLIERS } from '../types/game'

export default function HUD() {
  const resources = useGameStore((s) => s.resources)
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const contracts = useGameStore((s) => s.contracts)
  const dayCounter = useGameStore((s) => s.dayCounter)
  const goal = useGameStore((s) => s.goal)
  const kgbAttention = useGameStore((s) => s.kgbAttention)
  const pressAttention = useGameStore((s) => s.pressAttention)
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

  const salary = Object.entries(ownedGenerals).reduce((acc, [id, owned]) => {
    if (!owned.isOwned) return acc
    const g = getGeneral(id)
    if (!g) return acc
    const rankMult = RANK_MULTIPLIERS[owned.rankIndex] ?? 1
    return acc + ({ common: 0.3, epic: 1.2, legendary: 2.0, rare: 0.6 }[g.rarity] ?? 0) * rankMult
  }, 0)

  const net = income - salary
  const netSign = net >= 0 ? '+' : ''
  const netColor = net >= 0 ? '#aed581' : '#ef9a9a'
  const activeCount = contracts.filter((c) => !c.completed).length
  const goalPct = Math.min(100, (resources.tushonka / goal.target) * 100)
  const daysLeft = Math.max(0, goal.dayLimit - dayCounter + 1)

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
        <span className="hud-day-sep">/</span>
        <span className="hud-day-limit">{goal.dayLimit}</span>
      </div>
      <div className="hud-item hud-goal">
        <span className="hud-goal-label">Цель</span>
        <div className="hud-goal-bar">
          <div className="hud-goal-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <span className="hud-goal-text">
          {Math.floor(resources.tushonka)}/{goal.target} ({daysLeft}д)
        </span>
      </div>
      <div className="hud-item hud-income">
        <span style={{ color: netColor }}>{netSign}{net.toFixed(1)}/с</span>
      </div>
      <div className="hud-item hud-attention">
        <span className="hud-attention-icon" style={{ color: kgbAttention > 50 ? '#ef9a9a' : '#90caf9' }}>КГБ</span>
        <div className="hud-attention-bar"><div className="hud-attention-fill" style={{ background: kgbAttention > 50 ? '#ef9a9a' : '#90caf9', width: `${kgbAttention}%` }} /></div>
      </div>
      <div className="hud-item hud-attention">
        <span className="hud-attention-icon" style={{ color: pressAttention > 50 ? '#ef9a9a' : '#fff59d' }}>PR</span>
        <div className="hud-attention-bar"><div className="hud-attention-fill" style={{ background: pressAttention > 50 ? '#ef9a9a' : '#fff59d', width: `${pressAttention}%` }} /></div>
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
