import { Application, Container, Graphics, Texture, TilingSprite } from 'pixi.js'
import { useEffect, useRef } from 'react'

import { getGeneral } from '../../data/generals'
import { useGameStore } from '../../store/gameStore'
import { RARITY_COLORS } from '../../types/game'
import { createPortrait } from './GeneralPortrait'

const SIZE = 256

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
        antialias: false,
        backgroundAlpha: 0,
        height: SIZE,
        resolution: 1,
        width: SIZE,
      })

      if (!containerRef.current) return
      containerRef.current.appendChild(app.canvas)

      const bg = new TilingSprite({
        height: SIZE,
        texture: Texture.WHITE,
        width: SIZE,
      })
      bg.tint = 0x0f3460

      const stars = new TilingSprite({
        height: SIZE,
        texture: Texture.WHITE,
        width: SIZE,
      })
      stars.alpha = 0.12

      app.stage.addChild(bg)
      app.stage.addChild(stars)

      const portraitHolder = new Container({
        x: SIZE / 2,
        y: SIZE / 2,
      })
      app.stage.addChild(portraitHolder)
      portraitContainerRef.current = portraitHolder

      app.ticker.add(() => {
        bg.tilePosition.x -= 0.1
        bg.tilePosition.y -= 0.05
        stars.tilePosition.x += 0.25
        stars.tilePosition.y += 0.12
      })
    }

    void initApp()

    return () => {
      app.destroy(true, { children: true, texture: true })
      appRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!portraitContainerRef.current) return
    const holder = portraitContainerRef.current
    holder.removeChildren()

    if (!activeGeneralId) return
    const general = getGeneral(activeGeneralId)
    if (!general) return

    const portrait = createPortrait(general)
    portrait.pivot.set(128, 128)
    holder.addChild(portrait)

    const glow = new Graphics()
    glow.rect(-6, -6, SIZE + 12, SIZE + 12)
    glow.fill({
      alpha: 0.06,
      color: parseInt(RARITY_COLORS[general.rarity].replace('#', ''), 16),
    })
    holder.addChildAt(glow, 0)
  }, [activeGeneralId])

  return (
    <div
      ref={containerRef}
      style={{
        height: SIZE,
        imageRendering: 'pixelated',
        margin: '0 auto',
        width: SIZE,
      }}
    />
  )
}
