import { useEffect, useRef } from 'react'
import {
  Application,
  Graphics,
  Container,
  Text,
} from 'pixi.js'
import { districts, District } from '../../data/laosMap'

const MAP_W = 360
const MAP_H = 480
const PAD = 20

export interface MapClickInfo {
  district: District
}

export default function LaosMapView({
  onDistrictClick,
}: {
  onDistrictClick: (info: MapClickInfo) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const app = new Application()
    appRef.current = app

    const initApp = async () => {
      await app.init({
        width: MAP_W,
        height: MAP_H,
        background: 0x0a1a0a,
        antialias: false,
        resolution: 1,
      })

      if (!containerRef.current) return
      containerRef.current.appendChild(app.canvas)

      const scaleX = MAP_W - PAD * 2
      const scaleY = MAP_H - PAD * 2

      // BG grid
      const bg = new Graphics()
      bg.rect(0, 0, MAP_W, MAP_H)
      bg.fill(0x0d1f0d)
      app.stage.addChild(bg)

      const grid = new Graphics()
      for (let x = 0; x < MAP_W; x += 20) {
        grid.moveTo(x, 0); grid.lineTo(x, MAP_H)
      }
      for (let y = 0; y < MAP_H; y += 20) {
        grid.moveTo(0, y); grid.lineTo(MAP_W, y)
      }
      grid.stroke({ color: 0x1a3a1a, width: 0.5 })
      app.stage.addChild(grid)

      // Draw districts
      for (const district of districts) {
        const container = new Container()
        container.eventMode = 'static'
        container.cursor = 'pointer'

        const g = new Graphics()
        const pts = district.polygon.map(([x, y]) => ({
          x: x * scaleX + PAD,
          y: y * scaleY + PAD,
        }))

        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.fill({ color: district.color, alpha: 0.45 })
        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.stroke({ color: 0xffffff, alpha: 0.3, width: 1 })
        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.stroke({ color: district.color, width: 3 })

        container.addChild(g)

        const lbl = new Text({
          text: district.name,
          style: { fontFamily: '"Press Start 2P",monospace', fontSize: 8, fill: 0xffffff },
        })
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
        lbl.x = cx - lbl.width / 2
        lbl.y = cy - lbl.height / 2
        container.addChild(lbl)

        const capX = district.capitalPos[0] * scaleX + PAD
        const capY = district.capitalPos[1] * scaleY + PAD
        const dot = new Graphics()
        dot.circle(capX, capY, 3)
        dot.fill(0xffd700)
        container.addChild(dot)

        container.on('pointerdown', () => onDistrictClick({ district }))
        container.on('pointerover', () => { container.alpha = 0.85 })
        container.on('pointerout', () => { container.alpha = 1 })

        app.stage.addChild(container)
      }
    }

    initApp()
    return () => { app.destroy(true, { children: true }); appRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: MAP_W,
        height: MAP_H,
        margin: '0 auto',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    />
  )
}
