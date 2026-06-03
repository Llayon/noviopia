import { useState, useEffect } from 'react'
import MainScreen from './components/MainScreen'
import Collection from './components/Collection'
import GeneralDetail from './components/GeneralDetail'
import EventPopup from './components/EventPopup'
import ContractScreen from './components/ContractScreen'
import { startGameLoop, stopGameLoop } from './game/GameLoop'
import { useGameStore } from './store/gameStore'

type Page = 'main' | 'collection' | 'detail' | 'contracts'

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
  const [page, setPage] = useState<string>('main')
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
