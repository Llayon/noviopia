import { getGeneral } from '../data/derived'
import { useGameStore } from '../store/gameStore'

export default function GeneralPanel() {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeContracts = useGameStore((s) => s.contracts)

  const owned = Object.values(ownedGenerals).filter((o) => o.isOwned)
  const busyIds = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )

  return (
    <div className="general-panel">
      {owned.map((o) => {
        const g = getGeneral(o.generalId)
        if (!g) return null
        const isBusy = busyIds.has(o.generalId)
        return (
          <div
            className={`general-chip ${o.isActive ? 'active' : ''} ${isBusy ? 'busy' : ''}`}
            key={o.generalId}
          >
            <span className="chip-name">{g.name}</span>
            <div className="chip-stress-bar">
              <div
                className="chip-stress-fill"
                style={{
                  background: o.stress > 50 ? '#e53935' : o.stress > 25 ? '#fb8c00' : '#4caf50',
                  width: `${Math.min(100, o.stress)}%`,
                }}
              />
            </div>
            <span className="chip-status">
              {isBusy ? '📋' : o.isActive ? '⭐' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
