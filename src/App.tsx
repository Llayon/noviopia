import { lazy, Suspense, useEffect, useState } from 'react'

import Collection from './components/Collection'
import ContractScreen from './components/ContractScreen'
import DailyReport from './components/DailyReport'
import EventPopup from './components/EventPopup'
import GeneralDetail from './components/GeneralDetail'
import MainScreen from './components/MainScreen'
import ToastBar from './components/ToastBar'
import { startGameLoop, stopGameLoop } from './game/GameLoop'
import { useGameStore } from './store/gameStore'

const MapScreen = lazy(() => import('./components/MapScreen'))

type Page = 'collection' | 'contracts' | 'detail' | 'main' | 'map'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        close: () => void
        expand: () => void
        initDataUnsafe?: {
          user?: {
            first_name: string
            id: number
            last_name?: string
            username?: string
          }
        }
        ready: () => void
      }
    }
  }
}

export default function App() {
  const [page, setPage] = useState<Page>('map')
  const [selectedGeneral, setSelectedGeneral] = useState<null | string>(null)
  const activeEvent = useGameStore((s) => s.activeEvent)

  useEffect(() => {
    startGameLoop()
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
    return () => { stopGameLoop(); }
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
              <p style={{ fontSize: 8, marginTop: 16 }}>Загрузка карты...</p>
            </div>
          }
        >
          <MapScreen onNavigate={(p) => { setPage(p as Page); }} />
        </Suspense>
      )}
      {page === 'main' && <MainScreen onNavigate={(p) => { setPage(p as Page); }} />}
      {page === 'collection' && (
        <Collection onNavigate={(p) => { setPage(p as Page); }} onSelectGeneral={handleSelectGeneral} />
      )}
      {page === 'detail' && (
        <GeneralDetail generalId={selectedGeneral} onNavigate={(p) => { setPage(p as Page); }} />
      )}
      {page === 'contracts' && <ContractScreen onNavigate={(p) => { setPage(p as Page); }} />}
      <DailyReport />
      <ToastBar />
      {activeEvent && <EventPopup />}
    </div>
  )
}
