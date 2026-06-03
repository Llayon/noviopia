import { useGameStore } from '../store/gameStore'

export default function DailyReport() {
  const report = useGameStore((s) => s.dailyReport)
  const dismissReport = useGameStore((s) => s.dismissReport)

  if (!report) return null

  const netIncome = report.tushonkaEarned
  const netColor = netIncome >= 0 ? '#4caf50' : '#e53935'
  const netSign = netIncome >= 0 ? '+' : ''

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
            <span className="report-stat-label">Тушонка добыто</span>
            <span className="report-stat-value" style={{ color: netColor }}>
              {netSign}{netIncome.toFixed(1)} 🥫
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
        </div>

        <div className="report-divider" />

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
