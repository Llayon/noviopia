import { useEffect, useRef } from 'react'
import { Application, Container } from 'pixi.js'
import { useGameStore } from '../../store/gameStore'
import { getGeneral } from '../../data/generals'
import { drawGeneralPortrait } from './GeneralPortrait'

export default function PixiCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const portraitContainerRef = useRef<Container | null>(null)

  const ownedGenerals = useGameStore((s) => s.ownedGenerals)
  const activeGeneralId = Object.entries(ownedGenerals).find(
    ([, v]) => v.isOwned && v.isActive,
  )?.[0]

  useEffect(() => {
    if (!containerRef.current) return

    const app = new Application()
    appRef.current = app

    const initApp = async () => {
      await app.init({
        width: 256,
        height: 256,
        backgroundAlpha: 0,
        antialias: false,
      })

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas)
      }

      const mainContainer = new Container()
      mainContainer.x = 16
      mainContainer.y = 16
      app.stage.addChild(mainContainer)
      portraitContainerRef.current = mainContainer
    }

    initApp()

    return () => {
      app.destroy(true)
      appRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!portraitContainerRef.current || !activeGeneralId) return
    const general = getGeneral(activeGeneralId)
    if (!general) return
    drawGeneralPortrait(portraitContainerRef.current, general)
  }, [activeGeneralId])

  return (
    <div
      ref={containerRef}
      style={{
        width: 256,
        height: 256,
        imageRendering: 'pixelated',
        margin: '0 auto',
      }}
    />
  )
}
