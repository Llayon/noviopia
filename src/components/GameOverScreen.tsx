import { useGameStore } from '../store/gameStore'

export default function GameOverScreen() {
  const status = useGameStore((s) => s.gameStatus)
  const resources = useGameStore((s) => s.resources)
  const goal = useGameStore((s) => s.goal)
  const dayCounter = useGameStore((s) => s.dayCounter)
  const reset = useGameStore((s) => s.reset)

  if (status === 'playing') return null

  const isWin = status === 'won'
  const title = isWin ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'
  const icon = isWin ? '🏆' : '💀'
  const subtitle = isWin
    ? `Цель достигнута на день ${dayCounter}!`
    : `Дни вышли. Собрано ${Math.floor(resources.tushonka)} из ${goal.target} тушёнки.`
  const titleColor = isWin ? '#4caf50' : '#e53935'

  return (
    <div className="event-overlay">
      <div className="game-over">
        <div className="game-over-icon">{icon}</div>
        <h2 className="game-over-title" style={{ color: titleColor }}>{title}</h2>
        <p className="game-over-subtitle">{subtitle}</p>

        <div className="report-divider" />

        <div className="report-stats">
          <div className="report-stat">
            <span className="report-stat-label">Собрано тушёнки</span>
            <span className="report-stat-value">{Math.floor(resources.tushonka)} 🥫</span>
          </div>
          <div className="report-stat">
            <span className="report-stat-label">Цель</span>
            <span className="report-stat-value">{goal.target} 🥫</span>
          </div>
          <div className="report-stat">
            <span className="report-stat-label">Дней сыграно</span>
            <span className="report-stat-value">{dayCounter}</span>
          </div>
        </div>

        <div className="report-divider" />

        <button className="btn btn-primary" onClick={reset}>
          Начать заново
        </button>
      </div>
    </div>
  )
}
