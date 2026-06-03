import { getGeneral } from '../data/generals'
import { useGameStore } from '../store/gameStore'
import {
  MAX_LOYALTY,
  MAX_STRESS,
  RANK_MULTIPLIERS,
  RANK_NAMES,
  RARITY_COLORS,
} from '../types/game'

export default function GeneralDetail({
  generalId,
  onNavigate,
}: {
  generalId: null | string
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
          <button className="btn btn-back" onClick={() => { onNavigate('main'); }}>
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!general || !owned || !owned.isOwned) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-back" onClick={() => { onNavigate('main'); }}>
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
        <button className="btn btn-back" onClick={() => { onNavigate('main'); }}>
          ← На склад
        </button>
        <h2 style={{ color: RARITY_COLORS[general.rarity] }}>
          {general.name}
        </h2>
      </div>

      <div className="detail-card">
        <div className="detail-description">{general.description}</div>

        <div className="stats-grid">
          <StatBar color="#e53935" label="Воровство" max={15} value={general.stats.theft} />
          <StatBar color="#1e88e5" label="Скорость" max={15} value={general.stats.speed} />
          <StatBar color="#43a047" label="Маскировка" max={15} value={general.stats.stealth} />
          <StatBar color="#fb8c00" label="Лояльность" max={MAX_LOYALTY} value={Math.floor(owned.loyalty)} />
          <StatBar color="#e53935" label="Стресс" max={MAX_STRESS} value={Math.floor(owned.stress)} />
        </div>

        <div className="detail-info">
          <div className="info-row">
            <span>Ранг:</span>
            <span style={{ color: RARITY_COLORS[general.rarity] }}>
              {RANK_NAMES[general.rank]} → {owned.rankIndex > 0 ? `${RANK_MULTIPLIERS[owned.rankIndex]}x` : '1x'}
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
            disabled={!canFeed}
            onClick={() => feedGeneral(effectiveId)}
          >
            Кормить тушенкой (-{feedCost} 🥫)
          </button>
          <button
            className={`btn btn-upgrade ${!canUpgrade ? 'btn-disabled' : ''}`}
            disabled={!canUpgrade}
            onClick={() => upgradeGeneral(effectiveId)}
          >
            Повысить ранг (-{upgradeCost} 🥫)
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBar({
  color,
  label,
  max,
  value,
}: {
  color: string
  label: string
  max: number
  value: number
}) {
  const pct = (value / max) * 100
  return (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ background: color, width: `${pct}%` }}
        />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
