import { useMemo, useRef, useState } from 'react'

import type { LiveEvent } from '../types/game'

import contracts from '../data/contracts'
import { getGeneral } from '../data/derived'
import { getDistrict } from '../data/laosMap'
import LaosMapView, { MapClickInfo } from '../game/pixi/LaosMapView'
import { useGameStore } from '../store/gameStore'
import HUD from './HUD'

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'КРИТИЧЕСКИЙ',
  high: 'ВЫСОКИЙ',
  low: 'НИЗКИЙ',
  medium: 'СРЕДНИЙ',
}

export default function MapScreen({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<null | string>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<null | string>(null)
  const [selectedGenerals, setSelectedGenerals] = useState<Set<string>>(new Set())
  const [selectedLiveEvent, setSelectedLiveEvent] = useState<LiveEvent | null>(null)
  const [liveDispatchGens, setLiveDispatchGens] = useState<Set<string>>(new Set())
  const [liveResult, setLiveResult] = useState<null | string>(null)
  const resultTimer = useRef<null | ReturnType<typeof setTimeout>>(null)

  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeContracts = useGameStore((s) => s.contracts)
  const startContract = useGameStore((s) => s.startContract)
  const liveEvents = useGameStore((s) => s.liveEvents)
  const dispatchToLiveEvent = useGameStore((s) => s.dispatchToLiveEvent)

  const ownedList = useMemo(
    () => Object.values(ownedGenerals).filter((o) => o.isOwned),
    [ownedGenerals],
  )

  const busyGenerals = new Set(
    activeContracts.filter((c) => !c.completed).flatMap((c) => c.generalIds),
  )

  const handleDistrictClick = (info: MapClickInfo) => {
    setSelectedDistrict(info.district.id)
    setSelectedLiveEvent(null)
  }

  const handleLiveEventClick = (ev: LiveEvent) => {
    setSelectedLiveEvent(ev)
    setLiveDispatchGens(new Set())
    setLiveResult(null)
    setSelectedDistrict(null)
  }

  const handleLiveDispatch = () => {
    if (!selectedLiveEvent || liveDispatchGens.size === 0) return
    const success = dispatchToLiveEvent(selectedLiveEvent.id, [...liveDispatchGens])
    setLiveResult(success ? '✅ Успех! Получена награда.' : '❌ Провал...')
    setLiveDispatchGens(new Set())
    if (resultTimer.current) clearTimeout(resultTimer.current)
    resultTimer.current = setTimeout(() => {
      setLiveResult(null)
      setSelectedLiveEvent(null)
    }, 2000)
  }

  const toggleLiveGen = (gid: string) => {
    setLiveDispatchGens((prev) => {
      const next = new Set(prev)
      if (next.has(gid)) next.delete(gid)
      else if (selectedLiveEvent && next.size < selectedLiveEvent.maxGenerals) next.add(gid)
      return next
    })
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
        <LaosMapView
          liveEvents={liveEvents}
          onDistrictClick={handleDistrictClick}
          onLiveEventClick={handleLiveEventClick}
        />
      </div>

      <div className="nav-buttons">
        <button
          className="btn btn-primary"
          onClick={() => { onNavigate('collection'); }}
        >
          Коллекция
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { onNavigate('contracts'); }}
        >
          Контракты
        </button>
        <button
          className="btn btn-feed"
          onClick={() => { onNavigate('main'); }}
        >
          Склад
        </button>
      </div>

      {liveResult && (
        <div className="toast-bar">
          <span>{liveResult}</span>
        </div>
      )}

      {selectedLiveEvent && !liveResult && (
        <div className="modal-overlay" onClick={() => { setSelectedLiveEvent(null); }}>
          <div className="modal" onClick={(e) => { e.stopPropagation(); }}>
            <h3>{selectedLiveEvent.title}</h3>
            <p className="modal-desc">{selectedLiveEvent.description}</p>
            <div className="district-stats">
              <div className="stat-line">
                <span>Уровень угрозы:</span>
                <span style={{ color: `#${selectedLiveEvent.severity === 'critical' ? 'd32f2f' : selectedLiveEvent.severity === 'high' ? 'f44336' : selectedLiveEvent.severity === 'medium' ? 'ff9800' : '4caf50'}` }}>
                  {SEVERITY_LABELS[selectedLiveEvent.severity]}
                </span>
              </div>
              <div className="stat-line">
                <span>Награда:</span>
                <span>+{selectedLiveEvent.reward} 🥫</span>
              </div>
              {selectedLiveEvent.penalty > 0 && (
                <div className="stat-line">
                  <span>Штраф за игнор:</span>
                  <span>-{selectedLiveEvent.penalty} 🥫</span>
                </div>
              )}
              <div className="stat-line">
                <span>Осталось:</span>
                <span>{Math.ceil(selectedLiveEvent.remainingSec)}с</span>
              </div>
              <div className="stat-line">
                <span>Макс генералов:</span>
                <span>{selectedLiveEvent.maxGenerals}</span>
              </div>
            </div>

            <div className="modal-divider" />
            <p className="modal-desc">
              Выберите генералов для отправки ({liveDispatchGens.size}/{selectedLiveEvent.maxGenerals}):
            </p>
            <div className="general-list">
              {ownedList
                .filter((o) => !busyGenerals.has(o.generalId))
                .map((o) => {
                  const g = getGeneral(o.generalId)
                  if (!g) return null
                  const isSelected = liveDispatchGens.has(o.generalId)
                  const canSelect = !isSelected && liveDispatchGens.size < selectedLiveEvent.maxGenerals
                  return (
                    <div
                      className={`general-option ${isSelected ? 'selected' : ''} ${!canSelect && !isSelected ? 'disabled' : ''}`}
                      key={o.generalId}
                      onClick={() => { toggleLiveGen(o.generalId); }}
                    >
                      <span>{g.name}</span>
                      <span className="general-option-stress" style={{ color: o.stress > 50 ? '#e53935' : o.stress > 25 ? '#fb8c00' : '#4caf50' }}>
                        {Math.round(o.stress)}%
                      </span>
                    </div>
                  )
                })}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-back"
                onClick={() => { setSelectedLiveEvent(null); }}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                disabled={liveDispatchGens.size === 0}
                onClick={handleLiveDispatch}
              >
                Отправить ({liveDispatchGens.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDistrict && !showContractModal && (
        <div
          className="modal-overlay"
          onClick={() => { setSelectedDistrict(null); }}
        >
          <div className="modal" onClick={(e) => { e.stopPropagation(); }}>
            <DistrictInfo
              districtId={selectedDistrict}
              onClose={() => { setSelectedDistrict(null); }}
              onStartContract={() => { setShowContractModal(true); }}
            />
          </div>
        </div>
      )}

      {showContractModal && selectedDistrict && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowContractModal(false)
            setSelectedContract(null)
            setSelectedGenerals(new Set())
          }}
        >
          <div className="modal" onClick={(e) => { e.stopPropagation(); }}>
            <h3>Начать контракт</h3>
            <p className="modal-desc">
              Выберите контракт и назначьте генералов
            </p>

            <div className="contract-select-list">
              {contracts.map((c) => (
                <div
                  className={`contract-option ${selectedContract === c.id ? 'selected' : ''}`}
                  key={c.id}
                  onClick={() => {
                    setSelectedContract(c.id)
                    setSelectedGenerals(new Set())
                  }}
                >
                  <div className="contract-option-name">
                    {c.name}
                    {c.exactFit && <span className="exact-badge">🔴 макс {c.maxGenerals}</span>}
                  </div>
                  <div className="contract-option-meta">
                    +{c.reward} 🥫 · {c.durationSec}с · 👤 {c.maxGenerals}
                    {c.exactFit ? ' (строго)' : ''}
                  </div>
                </div>
              ))}
            </div>

            {selectedContract && (() => {
              const selC = contracts.find(c => c.id === selectedContract)
              const maxGens = selC?.maxGenerals ?? 1
              const isExact = selC?.exactFit ?? false
              const slotStatus = isExact
                ? `Требуется ровно ${maxGens} генерал${maxGens > 1 ? 'а' : ''} 🔴`
                : `Можно назначить до ${maxGens} генерал${maxGens > 1 ? 'ов' : 'а'}`
              return (
              <>
                <div className="modal-divider" />
                <p className="modal-desc">
                  {slotStatus}. Выбрано: {selectedGenerals.size}. Нажмите для назначения:
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
                          <span>{g.name}</span>
                          <span className="general-option-stress" style={{ color: o.stress > 50 ? '#e53935' : o.stress > 25 ? '#fb8c00' : '#4caf50' }}>
                            {Math.round(o.stress)}%
                          </span>
                        </div>
                      )
                    })}
                </div>
              </>
            )})()}

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
                disabled={(() => {
                  if (!selectedContract) return true
                  const selC = contracts.find(c => c.id === selectedContract)
                  if (!selC) return true
                  if (selC.exactFit) return selectedGenerals.size !== selC.maxGenerals
                  return selectedGenerals.size === 0 || selectedGenerals.size > selC.maxGenerals
                })()}
                onClick={handleStartContract}
              >
                Начать ({selectedGenerals.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {completedContracts.length > 0 && (
        <div className="completed-bar">
          <span>📋 {completedContracts.length} контракта завершено</span>
          <button
            className="btn btn-small"
            onClick={() => { onNavigate('contracts'); }}
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
