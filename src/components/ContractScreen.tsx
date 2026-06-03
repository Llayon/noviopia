import { useMemo, useState } from 'react'

import contracts from '../data/contracts'
import { getContract, getGeneral } from '../data/derived'
import { useGameStore } from '../store/gameStore'
import { type General, RANK_NAMES, RARITY_COLORS } from '../types/game'

export default function ContractScreen({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeContracts = useGameStore((s) => s.contracts)
  const startContract = useGameStore((s) => s.startContract)
  const claimContract = useGameStore((s) => s.claimContract)

  const [selectedContract, setSelectedContract] = useState<null | string>(null)
  const [selectedGenerals, setSelectedGenerals] = useState<Set<string>>(new Set())
  const [showAssign, setShowAssign] = useState(false)

  const ownedList = useMemo(
    () => Object.values(ownedGenerals).filter((o) => o.isOwned),
    [ownedGenerals],
  )

  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )

  const toggleGeneral = (gid: string) => {
    setSelectedGenerals((prev) => {
      const next = new Set(prev)
      if (next.has(gid)) next.delete(gid)
      else next.add(gid)
      return next
    })
  }

  const handleStart = () => {
    if (!selectedContract || selectedGenerals.size === 0) return
    startContract(selectedContract, [...selectedGenerals])
    setShowAssign(false)
    setSelectedGenerals(new Set())
  }

  const completedContracts = activeContracts.filter((c) => c.completed)
  const activeList = activeContracts.filter((c) => !c.completed)

  return (
    <div className="page contract-page">
      <div className="page-header">
        <button className="btn btn-back" onClick={() => { onNavigate('main'); }}>
          ← На склад
        </button>
        <h2>Госконтракты</h2>
      </div>

      {/* Active contracts */}
      {activeList.length > 0 && (
        <div className="contract-section">
          <h3 className="section-title">В процессе</h3>
          {activeList.map((ac) => {
            const c = getContract(ac.contractId)
            const gens = ac.generalIds.map((gid) => getGeneral(gid)).filter((g): g is General => g != null)
            const elapsed = Date.now() - ac.startTime
            const total = (ac.endTime - ac.startTime) || 1
            const pct = Math.min(100, Math.round((elapsed / total) * 100))

            return (
              <div className="contract-card active" key={ac.id}>
                <div className="contract-name">{c?.name ?? '???'}</div>
                <div className="contract-general">
                  Исполняют: {gens.map((g) => g.name).join(', ')}
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
            const gens = ac.generalIds.map((gid) => getGeneral(gid)).filter((g): g is General => g != null)
            return (
              <div
                className={`contract-card completed ${ac.success ? 'success' : 'fail'}`}
                key={ac.id}
                onClick={() => { claimContract(ac.id); }}
              >
                <div className="contract-name">{c?.name ?? '???'}</div>
                <div className="contract-general">
                  {gens.map((g) => g.name).join(', ')} — {ac.success ? '✅ Успех' : '❌ Провал'}
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
              className={`contract-card available ${isInProgress ? 'disabled' : ''}`}
              key={c.id}
              onClick={() => {
                if (!isInProgress) {
                  setSelectedContract(c.id)
                  setSelectedGenerals(new Set())
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
        <div className="modal-overlay" onClick={() => { setShowAssign(false); }}>
          <div className="modal" onClick={(e) => { e.stopPropagation(); }}>
            <h3>Назначить на контракт</h3>
            <p className="modal-desc">
              {(() => {
                const c = getContract(selectedContract)
                if (!c) return ''
                const slotLabel = c.exactFit
                  ? `Требуется ровно ${c.maxGenerals} генерал${c.maxGenerals > 1 ? 'а' : ''} 🔴`
                  : `Можно назначить до ${c.maxGenerals} генерал${c.maxGenerals > 1 ? 'ов' : 'а'}`
                return `${c.name} — ${slotLabel}`
              })()}
            </p>
            <p className="modal-desc">
              Выбрано: {selectedGenerals.size}. Нажмите на генералов для назначения:
            </p>
            <div className="general-list">
              {ownedList
                .filter((o) => !busyGenerals.has(o.generalId))
                .map((o) => {
                  const g = getGeneral(o.generalId)
                  if (!g) return null
                  const isSelected = selectedGenerals.has(o.generalId)
                  return (
                    <div
                      className={`general-option ${isSelected ? 'selected' : ''}`}
                      key={o.generalId}
                      onClick={() => { toggleGeneral(o.generalId); }}
                    >
                      <span style={{ color: RARITY_COLORS[g.rarity] }}>
                        {g.name}
                      </span>
                      <span className="general-option-rank">
                        {RANK_NAMES[g.rank]} | Стресс {Math.round(o.stress)}%
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
                onClick={() => { setShowAssign(false); }}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                disabled={(() => {
                  const c = getContract(selectedContract)
                  if (!c) return true
                  if (c.exactFit) return selectedGenerals.size !== c.maxGenerals
                  return selectedGenerals.size === 0 || selectedGenerals.size > c.maxGenerals
                })()}
                onClick={handleStart}
              >
                Назначить ({selectedGenerals.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
