import { useState, useEffect, lazy, Suspense } from 'react'
import MainScreen from './components/MainScreen'
import Collection from './components/Collection'
import GeneralDetail from './components/GeneralDetail'
import EventPopup from './components/EventPopup'
import ContractScreen from './components/ContractScreen'
import { startGameLoop, stopGameLoop } from './game/GameLoop'
import { useGameStore } from './store/gameStore'

const MapScreen = lazy(() => import('./components/MapScreen'))

type Page = 'main' | 'map' | 'collection' | 'detail' | 'contracts'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
        close: () => void
        initDataUnsafe?: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
      }
    }
  }
}

export default function App() {
  const [page, setPage] = useState<string>('map')
  const [selectedGeneral, setSelectedGeneral] = useState<string | null>(null)
  const activeEvent = useGameStore((s) => s.activeEvent)

  useEffect(() => {
    startGameLoop()
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
    return () => stopGameLoop()
  }, [])

  const handleSelectGeneral = (id: string) => {
    setSelectedGeneral(id)
    setPage('detail')
  }

  return (
    <div className="app">
      {page === 'map' && (
        <Suspense
          fallback={
            <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <div className="loader" />
              <p style={{ marginTop: 16, fontSize: 8 }}>Загрузка карты...</p>
            </div>
          }
        >
          <MapScreen onNavigate={setPage} />
        </Suspense>
      )}
      {page === 'main' && <MainScreen onNavigate={setPage} />}
      {page === 'collection' && (
        <Collection onNavigate={setPage} onSelectGeneral={handleSelectGeneral} />
      )}
      {page === 'detail' && (
        <GeneralDetail generalId={selectedGeneral} onNavigate={setPage} />
      )}
      {page === 'contracts' && <ContractScreen onNavigate={setPage} />}
      {activeEvent && <EventPopup />}
    </div>
  )
}
