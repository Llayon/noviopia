import { lazy, Suspense } from 'react'

import { getGeneral } from '../data/derived'
import { useGameStore } from '../store/gameStore'
import { RANK_NAMES, RARITY_COLORS } from '../types/game'
import HUD from './HUD'

const PixiCanvas = lazy(() => import('../game/pixi/PixiCanvas'))

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
              <Suspense fallback={<PortraitLoader />}>
                <PixiCanvas />
              </Suspense>
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
        <button className="btn btn-primary" onClick={() => { onNavigate('map'); }}>
          Карта
        </button>
        <button className="btn btn-secondary" onClick={() => { onNavigate('collection'); }}>
          Коллекция
        </button>
        {activeGeneral && (
          <button className="btn btn-secondary" onClick={() => { onNavigate('detail'); }}>
            Генерал
          </button>
        )}
        <button className="btn btn-contract" onClick={() => { onNavigate('contracts'); }}>
          Контракты
        </button>
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const cost = 10 + (owned?.level ?? 1) * 5
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const canFeed = resources.tushonka >= cost && (owned?.loyalty ?? 0) < 100

  return (
    <button
      className={`btn btn-feed ${!canFeed ? 'btn-disabled' : ''}`}
      disabled={!canFeed}
      onClick={() => feed(generalId)}
    >
      Кормить тушенкой (-{cost})
    </button>
  )
}

function PortraitLoader() {
  return (
    <div className="portrait-placeholder">
      <div className="pulse-box" style={{ height: 256, width: 256 }} />
    </div>
  )
}
