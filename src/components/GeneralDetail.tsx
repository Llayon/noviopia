import { useGameStore } from '../store/gameStore'
import { getGeneral } from '../data/generals'
import {
  RANK_NAMES,
  RARITY_COLORS,
  RANK_MULTIPLIERS,
  MAX_LOYALTY,
  MAX_STRESS,
} from '../types/game'

export default function GeneralDetail({
  generalId,
  onNavigate,
}: {
  generalId: string | null
  onNavigate: (page: string) => void
}) {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const resources = useGameStore((s) => s.resources)
  const feedGeneral = useGameStore((s) => s.feedGeneral)
  const upgradeGeneral = useGameStore((s) => s.upgradeGeneral)

  const effectiveId =
    generalId ??
    Object.entries(ownedGenerals).find(([, v]) => v.isOwned && v.isActive)?.[0]

  if (!effectiveId) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-back" onClick={() => onNavigate('main')}>
            ← На склад
          </button>
          <h2>Генерал</h2>
        </div>
        <div className="empty-state">Нет генералов</div>
      </div>
    )
  }

  const general = getGeneral(effectiveId)
  const owned = ownedGenerals[effectiveId]
  if (!general || !owned || !owned.isOwned) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-back" onClick={() => onNavigate('main')}>
            ← На склад
          </button>
          <h2>Генерал</h2>
        </div>
        <div className="empty-state">Генерал не найден</div>
      </div>
    )
  }

  const feedCost = 10 + owned.level * 5
  const upgradeCost = general.cost * (owned.rankIndex + 1) * 3
  const canFeed = resources.tushonka >= feedCost && owned.loyalty < MAX_LOYALTY
  const canUpgrade = resources.tushonka >= upgradeCost && owned.rankIndex < RANK_MULTIPLIERS.length - 1
  const incomeNow = general.incomePerSec * (RANK_MULTIPLIERS[owned.rankIndex] ?? 1) * (owned.loyalty / MAX_LOYALTY) * owned.level
  const incomeNext = owned.rankIndex < RANK_MULTIPLIERS.length - 1
    ? general.incomePerSec * (RANK_MULTIPLIERS[owned.rankIndex + 1] ?? 1) * (owned.loyalty / MAX_LOYALTY) * owned.level
    : incomeNow

  return (
    <div className="page detail-page">
      <div className="page-header">
        <button className="btn btn-back" onClick={() => onNavigate('main')}>
          ← На склад
        </button>
        <h2 style={{ color: RARITY_COLORS[general.rarity] }}>
          {general.name}
        </h2>
      </div>

      <div className="detail-card">
        <div className="detail-description">{general.description}</div>

        <div className="stats-grid">
          <StatBar label="Воровство" value={general.stats.theft} max={15} color="#e53935" />
          <StatBar label="Скорость" value={general.stats.speed} max={15} color="#1e88e5" />
          <StatBar label="Маскировка" value={general.stats.stealth} max={15} color="#43a047" />
          <StatBar label="Лояльность" value={Math.floor(owned.loyalty)} max={MAX_LOYALTY} color="#fb8c00" />
          <StatBar label="Стресс" value={Math.floor(owned.stress)} max={MAX_STRESS} color="#e53935" />
        </div>

        <div className="detail-info">
          <div className="info-row">
            <span>Ранг:</span>
            <span style={{ color: RARITY_COLORS[general.rarity] }}>
              {RANK_NAMES[general.rank]} → {owned.rankIndex > 0 ? RANK_MULTIPLIERS[owned.rankIndex] + 'x' : '1x'}
            </span>
          </div>
          <div className="info-row">
            <span>Уровень:</span>
            <span>{owned.level}</span>
          </div>
          <div className="info-row">
            <span>Доход:</span>
            <span>{incomeNow.toFixed(1)} 🥫/с</span>
          </div>
          {canUpgrade && (
            <div className="info-row">
              <span>След. ранг:</span>
              <span>{incomeNext.toFixed(1)} 🥫/с</span>
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button
            className={`btn btn-feed ${!canFeed ? 'btn-disabled' : ''}`}
            onClick={() => feedGeneral(effectiveId)}
            disabled={!canFeed}
          >
            Кормить тушенкой (-{feedCost} 🥫)
          </button>
          <button
            className={`btn btn-upgrade ${!canUpgrade ? 'btn-disabled' : ''}`}
            onClick={() => upgradeGeneral(effectiveId)}
            disabled={!canUpgrade}
          >
            Повысить ранг (-{upgradeCost} 🥫)
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = (value / max) * 100
  return (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
