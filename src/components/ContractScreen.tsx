import { useState, useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import contracts, { getContract } from '../data/contracts'
import { getGeneral } from '../data/generals'
import { RARITY_COLORS, RANK_NAMES } from '../types/game'

export default function ContractScreen({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeContracts = useGameStore((s) => s.contracts)
  const startContract = useGameStore((s) => s.startContract)
  const claimContract = useGameStore((s) => s.claimContract)

  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [selectedGeneral, setSelectedGeneral] = useState<string | null>(null)
  const [showAssign, setShowAssign] = useState(false)

  const ownedList = useMemo(
    () => Object.values(ownedGenerals).filter((o) => o.isOwned),
    [ownedGenerals],
  )

  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).map((c) => c.generalId),
  )

  const handleStart = () => {
    if (!selectedContract || !selectedGeneral) return
    startContract(selectedContract, selectedGeneral)
    setShowAssign(false)
    setSelectedGeneral(null)
  }

  const completedContracts = activeContracts.filter((c) => c.completed)

  return (
    <div className="page contract-page">
      <div className="page-header">
        <button className="btn btn-back" onClick={() => onNavigate('main')}>
          ← На склад
        </button>
        <h2>Госконтракты</h2>
      </div>

      {/* Active contracts */}
      {activeContracts.filter((c) => !c.completed).length > 0 && (
        <div className="contract-section">
          <h3 className="section-title">В процессе</h3>
          {activeContracts
            .filter((c) => !c.completed)
            .map((ac) => {
              const c = getContract(ac.contractId)
              const g = getGeneral(ac.generalId)
              const elapsed = Date.now() - ac.startTime
              const total = (ac.endTime - ac.startTime) || 1
              const pct = Math.min(100, Math.round((elapsed / total) * 100))

              return (
                <div key={ac.id} className="contract-card active">
                  <div className="contract-name">{c?.name ?? '???'}</div>
                  <div className="contract-general">
                    Исполняет: {g?.name ?? '???'}
                  </div>
                  <div className="contract-progress-bar">
                    <div
                      className="contract-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="contract-progress-text">{pct}%</div>
                </div>
              )
            })}
        </div>
      )}

      {/* Completed contracts */}
      {completedContracts.length > 0 && (
        <div className="contract-section">
          <h3 className="section-title">Завершено</h3>
          {completedContracts.map((ac) => {
            const c = getContract(ac.contractId)
            const g = getGeneral(ac.generalId)
            return (
              <div
                key={ac.id}
                className={`contract-card completed ${ac.success ? 'success' : 'fail'}`}
                onClick={() => claimContract(ac.id)}
              >
                <div className="contract-name">{c?.name ?? '???'}</div>
                <div className="contract-general">
                  {g?.name ?? '???'} — {ac.success ? '✅ Успех' : '❌ Провал'}
                </div>
                {ac.success && (
                  <div className="contract-reward">+{c?.reward ?? 0} 🥫</div>
                )}
                {!ac.success && (
                  <div className="contract-hint">Нажмите, чтобы разобраться</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Contract list */}
      <div className="contract-section">
        <h3 className="section-title">Доступные контракты</h3>
        {contracts.map((c) => {
          const isInProgress = activeContracts.some(
            (ac) => ac.contractId === c.id && !ac.completed,
          )

          return (
            <div
              key={c.id}
              className={`contract-card available ${isInProgress ? 'disabled' : ''}`}
              onClick={() => {
                if (!isInProgress) {
                  setSelectedContract(c.id)
                  setShowAssign(true)
                }
              }}
            >
              <div className="contract-name">{c.name}</div>
              <div className="contract-desc">{c.description}</div>
              <div className="contract-meta">
                <span>⏱ {c.durationSec}с</span>
                <span>💰 +{c.reward} 🥫</span>
                <span>⚠️ {Math.round(c.risk * 100)}% риск</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Assign modal */}
      {showAssign && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Назначить на контракт</h3>
            <p className="modal-desc">
              {getContract(selectedContract)?.name}
            </p>
            <div className="general-list">
              {ownedList
                .filter((o) => !busyGenerals.has(o.generalId))
                .map((o) => {
                  const g = getGeneral(o.generalId)
                  if (!g) return null
                  return (
                    <div
                      key={o.generalId}
                      className={`general-option ${selectedGeneral === o.generalId ? 'selected' : ''}`}
                      onClick={() => setSelectedGeneral(o.generalId)}
                    >
                      <span style={{ color: RARITY_COLORS[g.rarity] }}>
                        {g.name}
                      </span>
                      <span className="general-option-rank">
                        {RANK_NAMES[g.rank]}
                      </span>
                    </div>
                  )
                })}
            </div>
            {ownedList.filter((o) => !busyGenerals.has(o.generalId)).length ===
              0 && (
              <p className="empty-state">Все генералы заняты</p>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAssign(false)}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                disabled={!selectedGeneral}
                onClick={handleStart}
              >
                Назначить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
