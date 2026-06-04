import { useGameStore } from '../store/gameStore'

export default function DailyReport() {
  const report = useGameStore((s) => s.dailyReport)
  const goal = useGameStore((s) => s.goal)
  const resources = useGameStore((s) => s.resources)
  const dismissReport = useGameStore((s) => s.dismissReport)

  if (!report) return null

  const netIncome = report.tushonkaEarned
  const netColor = netIncome >= 0 ? '#4caf50' : '#e53935'
  const netSign = netIncome >= 0 ? '+' : ''
  const salaryColor = '#ff9800'
  const goalPct = Math.min(100, (resources.tushonka / goal.target) * 100)

  return (
    <div className="event-overlay">
      <div className="daily-report">
        <div className="report-header">
          <div className="report-icon">📋</div>
          <div className="report-title">Ежедневный отчёт</div>
          <div className="report-day">День {report.dayNumber}</div>
        </div>

        <div className="report-divider" />

        <div className="report-stats">
          <div className="report-stat">
            <span className="report-stat-label">Тушонка (нетто)</span>
            <span className="report-stat-value" style={{ color: netColor }}>
              {netSign}{netIncome.toFixed(1)} 🥫
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat-label">Зарплата генералам</span>
            <span className="report-stat-value" style={{ color: salaryColor }}>
              -{report.salariesPaid.toFixed(1)} 🥫
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat-label">Контрактов выполнено</span>
            <span className="report-stat-value" style={{ color: '#4caf50' }}>
              +{report.contractsCompleted}
            </span>
          </div>
          <div className="report-stat">
            <span className="report-stat-label">Контрактов провалено</span>
            <span className="report-stat-value" style={{ color: '#e53935' }}>
              -{report.contractsFailed}
            </span>
          </div>
          {report.generalsDied.length > 0 && (
            <div className="report-stat">
              <span className="report-stat-label">Погибли от стресса</span>
              <span className="report-stat-value" style={{ color: '#e53935' }}>
                {report.generalsDied.join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="report-divider" />

        <div className="report-stat">
          <span className="report-stat-label">Прогресс цели</span>
          <div className="hud-goal-bar" style={{ marginTop: 4, width: '100%' }}>
            <div className="hud-goal-fill" style={{ width: `${goalPct}%` }} />
          </div>
          <span className="report-stat-value" style={{ fontSize: 12, marginTop: 4 }}>
            {Math.floor(resources.tushonka)} / {goal.target} 🥫
          </span>
        </div>

        <div className="report-tip">
          Завтра будет новый день, генерал.{"\n"}Лаос рассчитывает на вас.
        </div>

        <button className="btn btn-primary report-continue" onClick={dismissReport}>
          Продолжить
        </button>
      </div>
    </div>
  )
}
