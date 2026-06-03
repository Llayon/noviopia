import { useGameStore } from '../store/gameStore'
import PixiCanvas from '../game/pixi/PixiCanvas'
import HUD from './HUD'
import { getGeneral } from '../data/generals'
import { RANK_NAMES, RARITY_COLORS } from '../types/game'

export default function MainScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeEntry = Object.entries(ownedGenerals).find(
    ([, v]) => v.isOwned && v.isActive,
  )
  const activeGeneral = activeEntry ? getGeneral(activeEntry[0]) : null
  const activeOwned = activeEntry ? activeEntry[1] : null

  return (
    <div className="page main-screen">
      <HUD />
      <div className="warehouse-bg">
        <div className="portrait-area">
          {activeGeneral && activeOwned ? (
            <>
              <PixiCanvas />
              <div className="general-name">
                {activeGeneral.name}
              </div>
              <div
                className="general-rank"
                style={{ color: RARITY_COLORS[activeGeneral.rarity] }}
              >
                {RANK_NAMES[activeGeneral.rank]}
              </div>
              <div className="loyalty-bar-container">
                <div className="loyalty-label">Лояльность:</div>
                <div className="loyalty-bar">
                  <div
                    className="loyalty-fill"
                    style={{ width: `${activeOwned.loyalty}%` }}
                  />
                </div>
                <div className="loyalty-text">{Math.floor(activeOwned.loyalty)}%</div>
              </div>
            </>
          ) : (
            <div className="no-general">
              <div className="shelf-icon">🥫</div>
              <p>Нет активного генерала</p>
              <p className="hint">Купите первого в коллекции!</p>
            </div>
          )}
        </div>
      </div>
      <div className="nav-buttons">
        <button className="btn btn-primary" onClick={() => onNavigate('collection')}>
          Коллекция
        </button>
        {activeGeneral && (
          <button className="btn btn-secondary" onClick={() => onNavigate('detail')}>
            Генерал
          </button>
        )}
        {activeGeneral && activeOwned && (
          <FeedButton generalId={activeGeneral.id} />
        )}
      </div>
    </div>
  )
}

function FeedButton({ generalId }: { generalId: string }) {
  const feed = useGameStore((s) => s.feedGeneral)
  const owned = useGameStore((s) => s.ownedGenerals[generalId])
  const resources = useGameStore((s) => s.resources)
  const cost = 10 + (owned?.level ?? 1) * 5
  const canFeed = resources.tushonka >= cost && (owned?.loyalty ?? 0) < 100

  return (
    <button
      className={`btn btn-feed ${!canFeed ? 'btn-disabled' : ''}`}
      onClick={() => feed(generalId)}
      disabled={!canFeed}
    >
      Кормить тушенкой (-{cost})
    </button>
  )
}
