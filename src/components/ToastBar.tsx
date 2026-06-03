import { useGameStore } from '../store/gameStore'

export default function ToastBar() {
  const toasts = useGameStore((s) => s.toasts)
  const dismissToast = useGameStore((s) => s.dismissToast)
  const openToastAsEvent = useGameStore((s) => s.openToastAsEvent)

  if (toasts.length === 0) return null

  return (
    <div className="toast-bar">
      {toasts.map((t) => (
        <div className="toast-item" key={t.id}>
          <div className="toast-content">
            <span className="toast-title">{t.event.title}</span>
            <span className="toast-desc">{t.event.description}</span>
          </div>
          <div className="toast-actions">
            <button className="btn btn-small" onClick={() => { openToastAsEvent(t.id); }}>
              Разобраться
            </button>
            <button className="btn btn-small btn-back" onClick={() => { dismissToast(t.id); }}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
