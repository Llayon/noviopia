import { getGeneral } from '../data/derived'
import { useGameStore } from '../store/gameStore'
import { RANK_NAMES, RARITY_COLORS } from '../types/game'

export default function Collection({
  onNavigate,
  onSelectGeneral,
}: {
  onNavigate: (page: string) => void
  onSelectGeneral: (id: string) => void
}) {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const buyGeneral = useGameStore((s) => s.buyGeneral)
  const resources = useGameStore((s) => s.resources)
  const generalsOrder = useGameStore((s) => s.generalsOrder)

  const rarityOrder: Record<string, number> = {
    common: 0,
    epic: 2,
    legendary: 3,
    rare: 1,
  }

  const sorted = [...generalsOrder].sort((a, b) => {
    const ga = getGeneral(a)
    const gb = getGeneral(b)
    if (!ga || !gb) return 0
    const ra = rarityOrder[ga.rarity] ?? 0
    const rb = rarityOrder[gb.rarity] ?? 0
    if (ra !== rb) return ra - rb
    return ga.cost - gb.cost
  })

  return (
    <div className="page collection-page">
      <div className="page-header">
        <button className="btn btn-back" onClick={() => { onNavigate('main'); }}>
          ← На склад
        </button>
        <h2>Коллекция генералов</h2>
      </div>

      <div className="collection-grid">
        {sorted.map((id) => {
          const general = getGeneral(id)
          const owned = ownedGenerals[id]
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!general || !owned) {
            return null
          }

          const isOwned = owned.isOwned
          const canBuy = resources.tushonka >= general.cost && !isOwned

          return (
            <div
              className={`collection-card ${isOwned ? 'owned' : 'locked'}`}
              key={id}
              onClick={() => {
                if (isOwned) {
                  useGameStore.getState().setActiveGeneral(id)
                  onSelectGeneral(id)
                }
              }}
            >
              <div className="card-rarity-bar" style={{ background: RARITY_COLORS[general.rarity] }} />
              <div className="card-icon">
                {isOwned ? '🎖️' : '❓'}
              </div>
              <div className="card-name">
                {isOwned ? general.name : '???'}
              </div>
              <div className="card-rank" style={{ color: RARITY_COLORS[general.rarity] }}>
                {isOwned ? RANK_NAMES[general.rank] : '???'}
              </div>
              {!isOwned && (
                <button
                  className={`btn btn-buy ${canBuy ? '' : 'btn-disabled'}`}
                  disabled={!canBuy}
                  onClick={(e) => {
                    e.stopPropagation()
                    buyGeneral(id)
                  }}
                >
                  {general.cost} 🥫
                </button>
              )}
              {isOwned && (
                <div className="card-level">Lv.{owned.level}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
