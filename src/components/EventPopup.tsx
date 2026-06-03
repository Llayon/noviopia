import { useGameStore } from '../store/gameStore'

export default function EventPopup() {
  const activeEvent = useGameStore((s) => s.activeEvent)
  const resolveEvent = useGameStore((s) => s.resolveEvent)

  if (!activeEvent) return null

  return (
    <div className="event-overlay">
      <div className="event-popup">
        <div className="event-icon">
          {activeEvent.type === 'inspection' && '🔍'}
          {activeEvent.type === 'escape' && '✈️'}
          {activeEvent.type === 'testimony' && '⚖️'}
          {activeEvent.type === 'promotion' && '⭐'}
          {activeEvent.type === 'scandal' && '📰'}
        </div>
        <h3 className="event-title">{activeEvent.title}</h3>
        <p className="event-description">{activeEvent.description}</p>

        <div className="event-choices">
          {activeEvent.choices.map((choice, idx) => (
            <button
              key={idx}
              className="btn btn-choice"
              onClick={() => resolveEvent(idx)}
            >
              <span className="choice-label">{choice.label}</span>
              <span className="choice-desc">{choice.description}</span>
              {choice.tushonkaCost && (
                <span className="choice-cost cost-tushonka">-{choice.tushonkaCost} 🥫</span>
              )}
              {choice.medalsCost && (
                <span className="choice-cost cost-medal">-{choice.medalsCost} 🏅</span>
              )}
              {choice.tushonkaReward && (
                <span className="choice-reward">+{choice.tushonkaReward} 🥫</span>
              )}
              {choice.medalsReward && (
                <span className="choice-reward">+{choice.medalsReward} 🏅</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
