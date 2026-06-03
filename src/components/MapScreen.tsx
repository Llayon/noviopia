import { useState, useMemo } from 'react'
import LaosMapView, { MapClickInfo } from '../game/pixi/LaosMapView'
import { useGameStore } from '../store/gameStore'
import HUD from './HUD'
import { getDistrict } from '../data/laosMap'
import contracts from '../data/contracts'
import { getGeneral } from '../data/generals'

export default function MapScreen({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [selectedGenerals, setSelectedGenerals] = useState<Set<string>>(new Set())

  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeContracts = useGameStore((s) => s.contracts)
  const startContract = useGameStore((s) => s.startContract)

  const ownedList = useMemo(
    () => Object.values(ownedGenerals).filter((o) => o.isOwned),
    [ownedGenerals],
  )

  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )

  const handleDistrictClick = (info: MapClickInfo) => {
    setSelectedDistrict(info.district.id)
  }

  const toggleGeneral = (gid: string) => {
    setSelectedGenerals((prev) => {
      const next = new Set(prev)
      if (next.has(gid)) next.delete(gid)
      else next.add(gid)
      return next
    })
  }

  const handleStartContract = () => {
    if (!selectedContract || selectedGenerals.size === 0) return
    startContract(selectedContract, [...selectedGenerals])
    setShowContractModal(false)
    setSelectedContract(null)
    setSelectedGenerals(new Set())
    setSelectedDistrict(null)
  }

  const completedContracts = activeContracts.filter((c) => c.completed)

  return (
    <div className="page map-screen">
      <HUD />

      <div className="map-container">
        <LaosMapView onDistrictClick={handleDistrictClick} />
      </div>

      <div className="nav-buttons">
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('collection')}
        >
          Коллекция
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => onNavigate('contracts')}
        >
          Контракты
        </button>
        <button
          className="btn btn-feed"
          onClick={() => onNavigate('main')}
        >
          Склад
        </button>
      </div>

      {/* District info popup */}
      {selectedDistrict && !showContractModal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDistrict(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <DistrictInfo
              districtId={selectedDistrict}
              onClose={() => setSelectedDistrict(null)}
              onStartContract={() => setShowContractModal(true)}
            />
          </div>
        </div>
      )}

      {/* Start contract modal */}
      {showContractModal && selectedDistrict && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowContractModal(false)
            setSelectedContract(null)
            setSelectedGenerals(new Set())
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Начать контракт</h3>
            <p className="modal-desc">
              Выберите контракт и назначьте генералов
            </p>

            <div className="contract-select-list">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className={`contract-option ${selectedContract === c.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedContract(c.id)
                    setSelectedGenerals(new Set())
                  }}
                >
                  <div className="contract-option-name">{c.name}</div>
                  <div className="contract-option-meta">
                    +{c.reward} 🥫 · {c.durationSec}с · риск {Math.round(c.risk * 100)}%
                  </div>
                </div>
              ))}
            </div>

            {selectedContract && (
              <>
                <div className="modal-divider" />
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
                          key={o.generalId}
                          className={`general-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleGeneral(o.generalId)}
                        >
                          <span>{g.name}</span>
                          <span className="general-option-stress" style={{ color: o.stress > 50 ? '#e53935' : o.stress > 25 ? '#fb8c00' : '#4caf50' }}>
                            {Math.round(o.stress)}%
                          </span>
                        </div>
                      )
                    })}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-back"
                onClick={() => {
                  setShowContractModal(false)
                  setSelectedContract(null)
                  setSelectedGenerals(new Set())
                }}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                disabled={!selectedContract || selectedGenerals.size === 0}
                onClick={handleStartContract}
              >
                Начать ({selectedGenerals.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed contracts notification */}
      {completedContracts.length > 0 && (
        <div className="completed-bar">
          <span>📋 {completedContracts.length} контракта завершено</span>
          <button
            className="btn btn-small"
            onClick={() => onNavigate('contracts')}
          >
            Забрать
          </button>
        </div>
      )}
    </div>
  )
}

function DistrictInfo({
  districtId,
  onClose,
  onStartContract,
}: {
  districtId: string
  onClose: () => void
  onStartContract: () => void
}) {
  const district = getDistrict(districtId)
  if (!district) return null

  return (
    <>
      <h3>{district.name}</h3>
      <p className="modal-desc">{district.description}</p>
      <div className="district-stats">
        <div className="stat-line">
          <span>Столица округа:</span>
          <span>{district.capital}</span>
        </div>
        <div className="stat-line">
          <span>Доступно контрактов:</span>
          <span>{contracts.length}</span>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-back" onClick={onClose}>
          Закрыть
        </button>
        <button className="btn btn-primary" onClick={onStartContract}>
          Контракты
        </button>
      </div>
    </>
  )
}
